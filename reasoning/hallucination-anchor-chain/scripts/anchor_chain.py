#!/usr/bin/env python3
"""hallucination-anchor-chain companion script — manage verified claim anchors."""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone


ANCHORS_FILE = "anchors.jsonl"


def _load_anchors(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    anchors = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    anchors.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return anchors


def _save_anchors(path: str, anchors: list[dict]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for a in anchors:
            f.write(json.dumps(a, sort_keys=True) + "\n")


def _next_id(anchors: list[dict]) -> str:
    max_n = 0
    for a in anchors:
        aid = a.get("id", "")
        if aid.startswith("a") and aid[1:].isdigit():
            max_n = max(max_n, int(aid[1:]))
    return f"a{max_n + 1}"


def cmd_init(args: argparse.Namespace) -> None:
    path = args.output or ANCHORS_FILE
    if os.path.exists(path):
        print(f"  ! {path} already exists. Use 'add' to add anchors.")
        sys.exit(1)
    _save_anchors(path, [])
    print(f"  ✓ Created empty anchor store: {path}")


def cmd_add(args: argparse.Namespace) -> None:
    path = args.output or ANCHORS_FILE
    anchors = _load_anchors(path)
    if not anchors and not os.path.exists(path):
        _save_anchors(path, [])

    anchors = _load_anchors(path)
    new_id = _next_id(anchors)

    anchor = {
        "id": new_id,
        "claim": args.claim,
        "source": args.source or "",
        "verified": False,
        "parent": args.parent or None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    anchors.append(anchor)
    _save_anchors(path, anchors)
    print(f"  ✓ Added anchor {new_id}: {args.claim[:60]}...")
    print(f"    Source: {args.source or '(none)'}")
    print(f"    Verified: False (run 'verify {new_id}' after checking source)")


def cmd_verify(args: argparse.Namespace) -> None:
    path = args.output or ANCHORS_FILE
    anchors = _load_anchors(path)
    found = False
    for a in anchors:
        if a.get("id") == args.anchor_id:
            a["verified"] = True
            a["timestamp"] = datetime.now(timezone.utc).isoformat()
            print(f"  ✓ Anchor {args.anchor_id} marked as VERIFIED")
            found = True
            break
    if not found:
        print(f"  ! Anchor not found: {args.anchor_id}")
        sys.exit(1)
    _save_anchors(path, anchors)


def cmd_check(args: argparse.Namespace) -> None:
    """Scan text for claims that lack anchor citations like [aN]."""
    text = args.text
    if not text and args.file:
        if not os.path.exists(args.file):
            print(f"  ! File not found: {args.file}")
            sys.exit(1)
        with open(args.file, encoding="utf-8") as f:
            text = f.read()

    # Find anchor citations [aN]
    cited = set(re.findall(r"\[a(\d+)\]", text))
    # Find sentences that look like claims (simple heuristic: declarative sentences)
    sentences = re.split(r"[.!?]\s+", text)
    suspect = []
    for sent in sentences:
        sent = sent.strip()
        if len(sent) < 20:
            continue
        if re.search(r"\b(is|are|has|have|supports|requires|returns|accepts|uses)\b", sent, re.I):
            if not re.search(r"\[a\d+\]", sent):
                suspect.append(sent[:80])

    if suspect:
        print(f"  Found {len(suspect)} potential unanchored claims:")
        for s in suspect[:10]:
            print(f"    - {s}...")
    else:
        print("  ✓ No obvious unanchored claims detected.")

    if cited:
        print(f"  Anchors cited: {', '.join(sorted(cited))}")


def cmd_audit(args: argparse.Namespace) -> None:
    path = args.output or ANCHORS_FILE
    anchors = _load_anchors(path)
    if not anchors:
        print("  Anchor store is empty.")
        return

    issues = {"broken_parent": [], "duplicates": [], "unverified": []}
    seen_claims = {}

    for a in anchors:
        aid = a.get("id", "?")
        parent = a.get("parent")
        claim = a.get("claim", "")

        # Check broken parent
        if parent:
            parent_exists = any(x.get("id") == parent for x in anchors)
            if not parent_exists:
                issues["broken_parent"].append((aid, parent))

        # Check duplicates
        if claim in seen_claims:
            issues["duplicates"].append((aid, seen_claims[claim]))
        else:
            seen_claims[claim] = aid

        # Unverified
        if not a.get("verified", False):
            issues["unverified"].append(aid)

    print(f"  Audit Report ({len(anchors)} anchors)")
    print(f"  ───────────────────────────────")
    print(f"  Unverified:     {len(issues['unverified'])}")
    if issues["unverified"]:
        for aid in issues["unverified"][:5]:
            print(f"    - {aid}")
    print(f"  Broken parents: {len(issues['broken_parent'])}")
    if issues["broken_parent"]:
        for aid, parent in issues["broken_parent"]:
            print(f"    - {aid} → nonexistent {parent}")
    print(f"  Duplicates:      {len(issues['duplicates'])}")
    if issues["duplicates"]:
        for aid, dup_of in issues["duplicates"][:5]:
            print(f"    - {aid} duplicates {dup_of}")


def cmd_export(args: argparse.Namespace) -> None:
    path = args.output or ANCHORS_FILE
    anchors = _load_anchors(path)
    if not anchors:
        print("  No anchors to export.")
        return

    verified = [a for a in anchors if a.get("verified")]
    print(f"  Citations ({len(verified)} verified anchors):")
    print()
    for a in verified:
        print(f"[{a['id']}] {a['claim']}")
        if a.get("source"):
            print(f"    Source: {a['source']}")
        print()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Hallucination Anchor Chain — manage verified claim anchors."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # init
    p_init = sub.add_parser("init", help="Create empty anchor store")
    p_init.add_argument("--output", default=ANCHORS_FILE, help="Output file")

    # add
    p_add = sub.add_parser("add", help="Add a new anchor")
    p_add.add_argument("claim", help="The factual claim")
    p_add.add_argument("source", nargs="?", default="", help="Source URL or path")
    p_add.add_argument("--parent", default="", help="Parent anchor ID")
    p_add.add_argument("--output", default=ANCHORS_FILE, help="Anchor file")

    # verify
    p_verify = sub.add_parser("verify", help="Mark anchor as verified")
    p_verify.add_argument("anchor_id", help="Anchor ID (e.g., a3)")
    p_verify.add_argument("--output", default=ANCHORS_FILE, help="Anchor file")

    # check
    p_check = sub.add_parser("check", help="Scan text for unanchored claims")
    p_check.add_argument("text", nargs="?", default="", help="Text to scan")
    p_check.add_argument("--file", default="", help="File to scan instead of text")

    # audit
    p_audit = sub.add_parser("audit", help="Find broken chains and duplicates")
    p_audit.add_argument("--output", default=ANCHORS_FILE, help="Anchor file")

    # export
    p_export = sub.add_parser("export", help="Export verified citations list")
    p_export.add_argument("--output", default=ANCHORS_FILE, help="Anchor file")

    args = parser.parse_args()

    commands = {
        "init": cmd_init,
        "add": cmd_add,
        "verify": cmd_verify,
        "check": cmd_check,
        "audit": cmd_audit,
        "export": cmd_export,
    }

    fn = commands.get(args.command)
    if fn:
        fn(args)


if __name__ == "__main__":
    main()
