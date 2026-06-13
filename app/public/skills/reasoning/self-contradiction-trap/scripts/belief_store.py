#!/usr/bin/env python3
"""self-contradiction-trap companion script — manage belief store and detect contradictions."""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone


BELIEF_FILE = "belief_store.jsonl"


def _load_beliefs(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    beliefs = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    beliefs.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return beliefs


def _save_beliefs(path: str, beliefs: list[dict]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for b in beliefs:
            f.write(json.dumps(b, sort_keys=True) + "\n")


def _next_id(beliefs: list[dict]) -> str:
    max_n = 0
    for b in beliefs:
        bid = b.get("claim_id", "")
        if bid.startswith("b") and bid[1:].isdigit():
            max_n = max(max_n, int(bid[1:]))
    return f"b{max_n + 1}"


def _detect_contradiction(new_claim: str, beliefs: list[dict]) -> list[dict]:
    """Simple keyword overlap contradiction detection. Returns list of contradicted claims."""
    new_lower = new_claim.lower()
    new_words = set(re.findall(r"\w+", new_lower))

    contradictions = []
    for b in beliefs:
        if b.get("status") != "active":
            continue
        old_claim = b.get("claim", "").lower()
        old_words = set(re.findall(r"\w+", old_claim))

        # Check for direct negation patterns
        negations = ["not ", "never ", "no ", "false", "none", "doesn't", "does not"]
        new_has_neg = any(neg in new_lower for neg in negations)
        old_has_neg = any(neg in old_claim for neg in negations)

        # Same subject, opposite polarity = contradiction
        overlap = new_words & old_words
        if len(overlap) >= 3:  # At least 3 shared words (subject match)
            if new_has_neg != old_has_neg:  # One has negation, other doesn't
                contradictions.append(b)

    return contradictions


def cmd_init(args: argparse.Namespace) -> None:
    path = args.output or BELIEF_FILE
    if os.path.exists(path):
        print(f"  ! {path} already exists.")
        sys.exit(1)
    _save_beliefs(path, [])
    print(f"  ✓ Created empty belief store: {path}")


def cmd_add(args: argparse.Namespace) -> None:
    path = args.output or BELIEF_FILE
    beliefs = _load_beliefs(path)

    # Check for contradictions
    contradictions = _detect_contradiction(args.claim, beliefs)

    new_id = _next_id(beliefs)
    belief = {
        "claim_id": new_id,
        "claim": args.claim,
        "confidence": args.confidence or "medium",
        "status": "active",
        "contradicts": [b["claim_id"] for b in contradictions],
        "contradiction_score": 0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    if contradictions:
        print(f"  ⚠ CONTRADICTION detected with {len(contradictions)} existing claim(s):")
        for b in contradictions:
            print(f"    - {b['claim_id']}: {b['claim'][:60]}...")
        # Update old beliefs
        for b in contradictions:
            b["status"] = "superseded"
            b["contradiction_score"] = b.get("contradiction_score", 0) + 1
        print(f"  Added {new_id} with contradicts: {belief['contradicts']}")
    else:
        print(f"  ✓ Added {new_id}: {args.claim[:60]}...")

    beliefs.append(belief)
    _save_beliefs(path, beliefs)


def cmd_check(args: argparse.Namespace) -> None:
    """Check text for contradictions against the belief store."""
    path = args.output or BELIEF_FILE
    beliefs = _load_beliefs(path)

    text = args.text
    if not text and args.file:
        if not os.path.exists(args.file):
            print(f"  ! File not found: {args.file}")
            sys.exit(1)
        with open(args.file, encoding="utf-8") as f:
            text = f.read()

    sentences = re.split(r"[.!?]\s+", text)
    issues = []

    for sent in sentences:
        sent = sent.strip()
        if len(sent) < 15:
            continue
        contradictions = _detect_contradiction(sent, beliefs)
        if contradictions:
            issues.append((sent, contradictions))

    if issues:
        print(f"  Found {len(issues)} potential contradictions:")
        for sent, contras in issues[:5]:
            print(f"    Claim: {sent[:60]}...")
            for c in contras:
                print(f"      Contradicts {c['claim_id']}: {c['claim'][:50]}...")
    else:
        print("  ✓ No contradictions detected in text.")


def cmd_resolve(args: argparse.Namespace) -> None:
    """Resolve a contradiction by keeping or retracting a claim."""
    path = args.output or BELIEF_FILE
    beliefs = _load_beliefs(path)

    found = None
    for b in beliefs:
        if b.get("claim_id") == args.claim_id:
            found = b
            break

    if not found:
        print(f"  ! Claim not found: {args.claim_id}")
        sys.exit(1)

    if args.action == "retract":
        found["status"] = "retracted"
        print(f"  ✓ {args.claim_id} retracted.")
    elif args.action == "keep":
        found["status"] = "active"
        print(f"  ✓ {args.claim_id} kept active.")

    _save_beliefs(path, beliefs)


def cmd_audit(args: argparse.Namespace) -> None:
    path = args.output or BELIEF_FILE
    beliefs = _load_beliefs(path)

    if not beliefs:
        print("  Belief store is empty.")
        return

    active = [b for b in beliefs if b.get("status") == "active"]
    high_score = [b for b in beliefs if b.get("contradiction_score", 0) >= 2]

    print(f"  Audit Report ({len(beliefs)} total claims)")
    print(f"  ────────────────────────────────")
    print(f"  Active:          {len(active)}")
    print(f"  Retracted:       {len([b for b in beliefs if b.get('status') == 'retracted'])}")
    print(f"  Superseded:      {len([b for b in beliefs if b.get('status') == 'superseded'])}")
    print(f"  High-score (≥2): {len(high_score)}")

    if high_score:
        print(f"\n  Claims needing review:")
        for b in high_score[:5]:
            print(f"    {b['claim_id']} (score={b['contradiction_score']}): {b['claim'][:50]}...")

    if len(high_score) >= 3:
        print(f"\n  ⚠ SESSION REVIEW recommended ({len(high_score)} high-score claims)")


def cmd_reset(args: argparse.Namespace) -> None:
    path = args.output or BELIEF_FILE
    if not os.path.exists(path):
        print("  Belief store doesn't exist.")
        return
    _save_beliefs(path, [])
    print("  ✓ Belief store reset (all claims cleared).")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Self-Contradiction Trap — manage belief store and detect contradictions."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # init
    p_init = sub.add_parser("init", help="Create empty belief store")
    p_init.add_argument("--output", default=BELIEF_FILE)

    # add
    p_add = sub.add_parser("add", help="Add a claim, detect contradictions")
    p_add.add_argument("claim", help="The claim being made")
    p_add.add_argument("--confidence", choices=["high", "medium", "low"], default="medium")
    p_add.add_argument("--output", default=BELIEF_FILE)

    # check
    p_check = sub.add_parser("check", help="Check text for contradictions")
    p_check.add_argument("text", nargs="?", default="", help="Text to check")
    p_check.add_argument("--file", default="", help="File to check instead of text")
    p_check.add_argument("--output", default=BELIEF_FILE)

    # resolve
    p_resolve = sub.add_parser("resolve", help="Resolve a contradiction")
    p_resolve.add_argument("claim_id", help="Claim ID (e.g., b3)")
    p_resolve.add_argument("action", choices=["keep", "retract"])
    p_resolve.add_argument("--output", default=BELIEF_FILE)

    # audit
    p_audit = sub.add_parser("audit", help="Show contradiction scores and inconsistencies")
    p_audit.add_argument("--output", default=BELIEF_FILE)

    # reset
    p_reset = sub.add_parser("reset", help="Clear the belief store")
    p_reset.add_argument("--output", default=BELIEF_FILE)

    args = parser.parse_args()
    commands = {
        "init": cmd_init,
        "add": cmd_add,
        "check": cmd_check,
        "resolve": cmd_resolve,
        "audit": cmd_audit,
        "reset": cmd_reset,
    }
    fn = commands.get(args.command)
    if fn:
        fn(args)


if __name__ == "__main__":
    main()
