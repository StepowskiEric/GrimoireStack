#!/usr/bin/env python3
"""verified-api-workflow companion script — bookkeeping for proof bundles.

Search proves; this script tracks. It never fetches docs and never marks
anything proved on its own. Use your harness's web search + page fetch to
gather evidence, record it in anchors.jsonl, then run `audit` as the gate:
exit 0 means every version-pinned claim is proved, exit 1 means something
is unproved and blocks the code depending on it.

Proved bundle contract (see SKILL.md Step 3):
  {"id", "claim", "version", "source", "quote", "verified",
   "verified_at", "parent"}
  - source must be an http(s) URL to the fetched page (never a search URL)
  - quote must be a verbatim passage containing the exact version string
  - verified_at must be an ISO-8601 date
  - parent must reference an existing anchor id (or be null)
"""

import argparse
import ast
import json
import os
import re
import sys
from datetime import datetime, timezone

API_SURFACE_FILE = "api-surface.jsonl"
ANCHORS_FILE = "anchors.jsonl"
MIN_QUOTE_CHARS = 24


def _load_jsonl(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    items = []
    try:
        with open(path, encoding="utf-8") as f:
            lines = f.readlines()
    except OSError as exc:
        print(f"  ! Cannot read {path}: {exc}", file=sys.stderr)
        return []
    for line in lines:
        line = line.strip()
        if line:
            try:
                item = json.loads(line)
                if isinstance(item, dict):
                    items.append(item)
            except json.JSONDecodeError:
                pass
    return items


def _save_jsonl(path: str, items: list[dict]) -> None:
    try:
        with open(path, "w", encoding="utf-8") as f:
            for item in items:
                f.write(json.dumps(item, sort_keys=True) + "\n")
    except OSError as exc:
        print(f"  ! Cannot write {path}: {exc}", file=sys.stderr)
        sys.exit(1)


def _next_anchor_id(anchors: list[dict]) -> str:
    max_n = 0
    for a in anchors:
        aid = a.get("id", "")
        if isinstance(aid, str) and aid.startswith("a") and aid[1:].isdigit():
            try:
                max_n = max(max_n, int(aid[1:]))
            except ValueError as exc:
                print(
                    f"  ! Skipping malformed anchor id {aid!r}: {exc}", file=sys.stderr
                )
    return f"a{max_n + 1}"


def _is_iso_date(value: object) -> bool:
    if not isinstance(value, str) or not value:
        return False
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
        return True
    except ValueError:
        return False


def audit_anchor(anchor: dict, ids: set[str]) -> list[str]:
    """Return a list of failure reasons; empty means proved."""
    failures: list[str] = []
    aid = anchor.get("id", "?")

    if not anchor.get("claim"):
        failures.append(f"[{aid}] missing claim")
    version = anchor.get("version")
    if not version:
        failures.append(
            f"[{aid}] missing version — bundle is version-agnostic, not proof"
        )
    source = anchor.get("source", "")
    if not (isinstance(source, str) and re.match(r"https?://", source)):
        failures.append(f"[{aid}] source is not an http(s) URL to a fetched page")
    elif re.search(
        r"(google|bing|duckduckgo|search)\.[a-z.]+/(search|results)", source
    ):
        failures.append(
            f"[{aid}] source is a search URL — fetch the page, never cite the snippet"
        )
    quote = anchor.get("quote", "")
    if not quote:
        failures.append(f"[{aid}] missing quote — snippet-only or unfetched")
    else:
        if len(quote) < MIN_QUOTE_CHARS:
            failures.append(
                f"[{aid}] quote is {len(quote)} chars (< {MIN_QUOTE_CHARS}) — likely a snippet, fetch the passage"
            )
        if version and str(version).lower() not in quote.lower():
            failures.append(
                f"[{aid}] quote does not contain the exact version string '{version}'"
            )
    if anchor.get("verified") != True:  # noqa: E712 — strict True required by contract
        failures.append(f"[{aid}] verified is not true — claim is unproved")
    if not _is_iso_date(anchor.get("verified_at")):
        failures.append(f"[{aid}] verified_at is missing or not an ISO-8601 date")
    parent = anchor.get("parent")
    if parent is not None and parent not in ids:
        failures.append(f"[{aid}] dangling parent '{parent}' — no such anchor")
    return failures


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

    try:
        with open(target, encoding="utf-8") as f:
            content = f.read()
    except OSError as exc:
        print(f"  ! Cannot read {target}: {exc}")
        sys.exit(1)

    # Heuristic: function/method calls like module.func() or Class().
    # Catches keywords too — treat hits as candidates, not verdicts.
    calls = re.findall(r"([\w.]+)\s*\(", content)
    if not calls:
        print("  No API calls found.")
        return

    anchors = _load_jsonl(ANCHORS_FILE)
    anchored_calls = set()
    for a in anchors:
        claim = str(a.get("claim", "")).lower()
        for call in calls:
            if call.lower() in claim or call.split(".")[-1].lower() in claim:
                anchored_calls.add(call)
                break

    unanchored = [c for c in set(calls) if c not in anchored_calls]

    print(f"  Scan Results ({len(set(calls))} unique call-like tokens)")
    print("  ────────────────────────────────")
    print(f"  Anchored:   {len(anchored_calls)}")
    print(f"  Unanchored: {len(unanchored)}")

    if unanchored:
        print("\n  Unanchored calls (need proof bundles before use):")
        for c in sorted(unanchored)[:10]:
            print(f"    - {c}")
    else:
        print("\n  ✓ All API calls are anchored!")


def cmd_verify_all(args: argparse.Namespace) -> None:
    """Scaffold unproved entries for every external import in a project."""
    project_dir = args.dir or "."
    api_items = _load_jsonl(API_SURFACE_FILE)
    anchors = _load_jsonl(ANCHORS_FILE)

    py_files = []
    for root, dirs, files in os.walk(project_dir):
        dirs[:] = [d for d in dirs if d not in ("__pycache__", ".git", "node_modules")]
        for f in files:
            if f.endswith(".py"):
                py_files.append(os.path.join(root, f))

    imports: set[str] = set()
    for py_file in py_files:
        try:
            with open(py_file, encoding="utf-8") as f:
                tree = ast.parse(f.read())
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.add(alias.name.split(".")[0])
                elif isinstance(node, ast.ImportFrom) and node.module:
                    imports.add(node.module.split(".")[0])
        except Exception as exc:
            print(f"  ! Skipping unparseable file {py_file}: {exc}", file=sys.stderr)

    stdlib = (
        set(sys.stdlib_module_names) if hasattr(sys, "stdlib_module_names") else set()
    )
    external = sorted(imports - stdlib - {"__main__"})

    print(f"  Found {len(external)} external libraries: {', '.join(external[:10])}")

    new_items = 0
    new_anchors = 0

    for lib in external:
        exists = any(item.get("module") == lib for item in api_items)
        if not exists:
            api_items.append(
                {
                    "module": lib,
                    "version": "",
                    "signatures": [],
                    "verified": False,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            )
            new_items += 1

        exists_a = any(lib.lower() in str(a.get("claim", "")).lower() for a in anchors)
        if not exists_a:
            aid = _next_anchor_id(anchors)
            anchors.append(
                {
                    "id": aid,
                    "claim": f"{lib} module is available",
                    "version": "",
                    "source": f"https://pypi.org/project/{lib}/",
                    "quote": "",
                    "verified": False,
                    "verified_at": "",
                    "parent": None,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            )
            new_anchors += 1

    _save_jsonl(API_SURFACE_FILE, api_items)
    _save_jsonl(ANCHORS_FILE, anchors)

    print(f"  ✓ Added {new_items} API surface entries")
    print(
        f"  ✓ Added {new_anchors} scaffold anchors (UNPROVED — fill version/source/quote via web search, then audit)"
    )


def cmd_audit(args: argparse.Namespace) -> None:
    """Gate: every anchor must satisfy the proved-bundle contract."""
    anchors = _load_jsonl(ANCHORS_FILE)
    ids: set[str] = set()
    for a in anchors:
        aid = a.get("id")
        if isinstance(aid, str):
            ids.add(aid)

    if not anchors:
        print("  No anchors in anchors.jsonl — nothing proved.")
        sys.exit(1)

    all_failures: list[str] = []
    proved = 0
    for a in anchors:
        failures = audit_anchor(a, ids)
        if failures:
            all_failures.extend(failures)
        else:
            proved += 1

    print("  Audit Report")
    print("  ────────────────────────────────")
    print(f"  Anchors:  {len(anchors)}")
    print(f"  Proved:   {proved}")
    print(f"  Unproved: {len(anchors) - proved}")

    if all_failures:
        print("\n  Failures (blocking — resolve before shipping dependent code):")
        for f in all_failures[:20]:
            print(f"    - {f}")
        if len(all_failures) > 20:
            print(f"    ... and {len(all_failures) - 20} more")
        sys.exit(1)

    print(
        "\n  ✓ All anchors proved: version + fetched source + verbatim quote + date, parents resolve."
    )


def cmd_export(args: argparse.Namespace) -> None:
    """Export a citations report for the codebase."""
    anchors = _load_jsonl(ANCHORS_FILE)
    ids: set[str] = set()
    for a in anchors:
        aid = a.get("id")
        if isinstance(aid, str):
            ids.add(aid)

    proved = [a for a in anchors if not audit_anchor(a, ids)]

    print(f"  Citations Report ({len(proved)} proved of {len(anchors)} anchors)")
    print(f"  {'─' * 40}")
    for a in proved:
        print(f"  [{a['id']}] {str(a.get('claim', ''))[:60]}...")
        print(f"       Version: {a.get('version')} | Source: {a.get('source')}")
    if len(proved) != len(anchors):
        print(
            f"\n  ! {len(anchors) - len(proved)} unproved anchors omitted — run audit for details."
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Verified API Workflow bookkeeping — search proves, this script tracks and gates."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("init", help="Create both artifact files")

    p_scan = sub.add_parser("scan", help="Scan file for unanchored API calls")
    p_scan.add_argument("file", help="Python file to scan")

    p_verify = sub.add_parser(
        "verify-all", help="Scaffold unproved entries for project imports"
    )
    p_verify.add_argument("--dir", default=".", help="Project directory")

    sub.add_parser(
        "audit", help="Gate: check every anchor satisfies the proved-bundle contract"
    )

    sub.add_parser("export", help="Export citations report (proved anchors only)")

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
