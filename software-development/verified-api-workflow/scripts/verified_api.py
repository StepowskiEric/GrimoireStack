#!/usr/bin/env python3
"""verified-api-workflow companion script — combine api-surface-anchoring + hallucination-anchor-chain."""

import argparse
import ast
import json
import os
import re
import sys
from datetime import datetime, timezone


API_SURFACE_FILE = "api-surface.jsonl"
ANCHORS_FILE = "anchors.jsonl"


def _load_jsonl(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    items = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    items.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return items


def _save_jsonl(path: str, items: list[dict]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for item in items:
            f.write(json.dumps(item, sort_keys=True) + "\n")


def _next_anchor_id(anchors: list[dict]) -> str:
    max_n = 0
    for a in anchors:
        aid = a.get("id", "")
        if aid.startswith("a") and aid[1:].isdigit():
            max_n = max(max_n, int(aid[1:]))
    return f"a{max_n + 1}"


def cmd_init(args: argparse.Namespace) -> None:
    """Create both artifact files."""
    for path, name in [(API_SURFACE_FILE, "API surface"), (ANCHORS_FILE, "anchors")]:
        if os.path.exists(path):
            print(f"  ! {name} file already exists: {path}")
        else:
            _save_jsonl(path, [])
            print(f"  ✓ Created {name}: {path}")


def cmd_scan(args: argparse.Namespace) -> None:
    """Scan a Python file for external API calls, check if anchored."""
    target = args.file
    if not os.path.exists(target):
        print(f"  ! File not found: {target}")
        sys.exit(1)

    with open(target, encoding="utf-8") as f:
        content = f.read()

    # Simple: find function calls like module.func() or Class()
    calls = re.findall(r"([\w.]+)\s*\(", content)
    if not calls:
        print("  No API calls found.")
        return

    anchors = _load_jsonl(ANCHORS_FILE)
    anchored_calls = set()
    for a in anchors:
        claim = a.get("claim", "").lower()
        for call in calls:
            if call.lower() in claim or call.split(".")[-1].lower() in claim:
                anchored_calls.add(call)
                break

    unanchored = [c for c in set(calls) if c not in anchored_calls]

    print(f"  Scan Results ({len(set(calls))} unique calls)")
    print(f"  ────────────────────────────────")
    print(f"  Anchored:   {len(anchored_calls)}")
    print(f"  Unanchored: {len(unanchored)}")

    if unanchored:
        print(f"\n  Unanchored calls (need verification):")
        for c in sorted(unanchored)[:10]:
            print(f"    - {c}")
    else:
        print(f"\n  ✓ All API calls are anchored!")


def cmd_verify_all(args: argparse.Namespace) -> None:
    """Verify all imports in a project against current docs."""
    project_dir = args.dir or "."
    api_items = _load_jsonl(API_SURFACE_FILE)
    anchors = _load_jsonl(ANCHORS_FILE)

    # Find all Python files
    py_files = []
    for root, dirs, files in os.walk(project_dir):
        dirs[:] = [d for d in dirs if d not in ("__pycache__", ".git", "node_modules")]
        for f in files:
            if f.endswith(".py"):
                py_files.append(os.path.join(root, f))

    # Extract imports
    imports = set()
    for py_file in py_files:
        try:
            with open(py_file, encoding="utf-8") as f:
                tree = ast.parse(f.read())
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.add(alias.name.split(".")[0])
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.add(node.module.split(".")[0])
        except Exception:
            pass

    # Filter stdlib
    stdlib = set(sys.stdlib_module_names) if hasattr(sys, "stdlib_module_names") else set()
    external = sorted(imports - stdlib - {"__main__"})

    print(f"  Found {len(external)} external libraries: {', '.join(external[:10])}")

    # Create API surface entries + anchors for each
    new_items = 0
    new_anchors = 0

    for lib in external:
        # Check if already in api-surface
        exists = any(item.get("module") == lib for item in api_items)
        if not exists:
            api_items.append({
                "module": lib,
                "version": "",
                "signatures": [],
                "verified": False,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            new_items += 1

        # Check if anchored
        exists_a = any(lib.lower() in a.get("claim", "").lower() for a in anchors)
        if not exists_a:
            aid = _next_anchor_id(anchors)
            anchors.append({
                "id": aid,
                "claim": f"{lib} module is available",
                "source": f"https://pypi.org/project/{lib}/",
                "verified": False,
                "parent": None,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            new_anchors += 1

    _save_jsonl(API_SURFACE_FILE, api_items)
    _save_jsonl(ANCHORS_FILE, anchors)

    print(f"  ✓ Added {new_items} API surface entries")
    print(f"  ✓ Added {new_anchors} anchors")
    print(f"\n  Next: Run `python api_surface.py verify <module>` for each, then mark anchors verified.")


def cmd_audit(args: argparse.Namespace) -> None:
    """Audit consistency between api-surface.jsonl and anchors.jsonl."""
    api_items = _load_jsonl(API_SURFACE_FILE)
    anchors = _load_jsonl(ANCHORS_FILE)

    issues = {"unverified_api": [], "unanchored_modules": [], "broken_chains": []}

    # Check: verified API surfaces should have anchors
    for item in api_items:
        module = item.get("module", "")
        verified = item.get("verified", False)
        if verified:
            has_anchor = any(module.lower() in a.get("claim", "").lower() for a in anchors)
            if not has_anchor:
                issues["unanchored_modules"].append(module)

    # Check: verified anchors for APIs
    for a in anchors:
        if "verified" in a and not a.get("verified"):
            if any(a.get("claim", "").lower().startswith(m) for m in [item.get("module", "") for item in api_items]):
                issues["unverified_api"].append(a.get("id", "?"))

    print(f"  Audit Report")
    print(f"  ────────────────────────────────")
    print(f"  API surface entries: {len(api_items)}")
    print(f"  Anchors:             {len(anchors)}")
    print(f"  Unverified APIs:     {len(issues['unverified_api'])}")
    print(f"  Unanchored modules:  {len(issues['unanchored_modules'])}")

    if issues["unanchored_modules"]:
        print(f"\n  Modules verified but not anchored (run anchor_chain.py add):")
        for m in issues["unanchored_modules"][:5]:
            print(f"    - {m}")


def cmd_export(args: argparse.Namespace) -> None:
    """Export a citations report for the codebase."""
    api_items = _load_jsonl(API_SURFACE_FILE)
    anchors = _load_jsonl(ANCHORS_FILE)

    verified = [a for a in anchors if a.get("verified")]

    print(f"  Citations Report ({len(verified)} verified anchors)")
    print(f"  {'─' * 40}")
    for a in verified:
        print(f"  [{a['id']}] {a['claim'][:60]}...")
        if a.get("source"):
            print(f"       Source: {a['source']}")
    print(f"\n  Total API surface entries: {len(api_items)}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Verified API Workflow — combine api-surface + anchor-chain."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # init
    p_init = sub.add_parser("init", help="Create both artifact files")

    # scan
    p_scan = sub.add_parser("scan", help="Scan file for unanchored API calls")
    p_scan.add_argument("file", help="Python file to scan")

    # verify-all
    p_verify = sub.add_parser("verify-all", help="Verify all project imports")
    p_verify.add_argument("--dir", default=".", help="Project directory")

    # audit
    p_audit = sub.add_parser("audit", help="Check api-surface + anchors consistency")

    # export
    p_export = sub.add_parser("export", help="Export citations report")

    args = parser.parse_args()

    commands = {
        "init": cmd_init,
        "scan": cmd_scan,
        "verify-all": cmd_verify_all,
        "audit": cmd_audit,
        "export": cmd_export,
    }
    fn = commands.get(args.command)
    if fn:
        fn(args)


if __name__ == "__main__":
    main()
