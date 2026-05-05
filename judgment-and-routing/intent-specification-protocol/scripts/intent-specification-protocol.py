#!/usr/bin/env python3
"""intent-specification-protocol companion script — crystallize vague requests into testable specs."""

import argparse
import json
import re
import sys
from datetime import datetime, timezone


INTENT_FILE = "intent_spec.json"


def _load_intent(path: str) -> dict:
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _save_intent(path: str, intent: dict) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(intent, f, indent=2, sort_keys=True)
        f.write("\n")


def crystallize(vague_request: str) -> dict:
    """Convert vague request into precise, testable intent specification."""
    intent = {
        "original": vague_request,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": None,
        "target": None,
        "constraints": [],
        "success_criteria": [],
        "edge_cases": [],
        "vague_words": [],
    }

    # 1. Extract action + target
    what_patterns = [
        (r"(build|create|make|implement|design|develop)\s+(.+?)(?:\s+that|\s+with|\s+for|\s*$)",
         lambda m: ("action", m.group(1).lower(), "target", m.group(2).strip())),
        (r"(fix|debug|repair)\s+(.+?)(?:\s+that|\s+in|\s*$)",
         lambda m: ("action", m.group(1).lower(), "target", m.group(2).strip())),
        (r"(analyze|review|audit|test)\s+(.+?)(?:\s+for|\s+to|\s*$)",
         lambda m: ("action", m.group(1).lower(), "target", m.group(2).strip())),
    ]
    for pattern, extractor in what_patterns:
        match = re.search(pattern, vague_request, re.I)
        if match:
            action_key, action_val, target_key, target_val = extractor(match)
            intent[action_key] = action_val
            intent[target_key] = target_val
            break

    # 2. Constraints
    constraint_patterns = [
        r"within\s+(\d+\s*(?:hours?|days?|weeks?))",
        r"using\s+(\w+)",
        r"without\s+(.+?)(?:\s+and|\s*$)",
        r"with\s+(?:no\s+)?(.+?)(?:\s+and|\s*$)",
    ]
    for pattern in constraint_patterns:
        matches = re.findall(pattern, vague_request, re.I)
        intent["constraints"].extend(matches)

    # 3. Success criteria (replace vague words with measurable ones)
    vague_words = ["fast", "good", "nice", "better", "optimized", "efficient", "robust", "scalable"]
    found_vague = [w for w in vague_words if w in vague_request.lower()]
    intent["vague_words"] = found_vague

    if found_vague:
        intent["success_criteria"].append(f"Define measurable metric for: {', '.join(found_vague)}")

    if "test" not in vague_request.lower():
        intent["success_criteria"].append("Add at least one test or verification step")
    if "document" not in vague_request.lower():
        intent["success_criteria"].append("Add documentation for key components")

    # 4. Edge cases
    if "user" in vague_request.lower():
        intent["edge_cases"].append("Invalid user input")
    if "api" in vague_request.lower() or "call" in vague_request.lower():
        intent["edge_cases"].append("API failure / timeout")
    if "file" in vague_request.lower() or "read" in vague_request.lower():
        intent["edge_cases"].append("File not found / permission denied")
    if "concurrent" in vague_request.lower() or "parallel" in vague_request.lower():
        intent["edge_cases"].append("Race conditions / deadlocks")

    return intent


def generate_spec(intent: dict) -> str:
    """Generate human-readable spec from crystallized intent."""
    lines = [
        "## Crystallized Intent Specification",
        "",
        f"**Original request:** {intent['original']}",
        "",
        "### What",
        f"Action: {intent.get('action', 'N/A')}",
        f"Target: {intent.get('target', 'N/A')}",
        "",
    ]

    if intent.get("constraints"):
        lines.append("### Constraints")
        for c in intent["constraints"]:
            lines.append(f"- {c}")
        lines.append("")

    lines.append("### Success Criteria")
    for c in intent.get("success_criteria", []):
        lines.append(f"- [ ] {c}")
    lines.append("")

    if intent.get("edge_cases"):
        lines.append("### Edge Cases to Handle")
        for e in intent["edge_cases"]:
            lines.append(f"- {e}")
        lines.append("")

    if intent.get("vague_words"):
        lines.append("### Vague Words Replaced")
        lines.append(f"Found: {', '.join(intent['vague_words'])}")
        lines.append("Define measurable replacements in Success Criteria above.")
        lines.append("")

    lines.append(f"_Crystallized at {intent['timestamp']}_")
    return "\n".join(lines)


def cmd_init(args: argparse.Namespace) -> None:
    path = args.output or INTENT_FILE
    if os.path.exists(path):
        print(f"  ! {path} already exists.")
        sys.exit(1)
    _save_intent(path, {})
    print(f"  ✓ Created empty intent spec: {path}")


def cmd_crystallize(args: argparse.Namespace) -> None:
    path = args.output or INTENT_FILE
    intent = crystallize(args.request)
    _save_intent(path, intent)

    print(f"  ✓ Crystallized intent saved to {path}")
    print(f"\n  Original: {args.request}")
    print(f"  Action:   {intent['action']}")
    print(f"  Target:   {intent['target']}")
    if intent["vague_words"]:
        print(f"  ⚠ Vague words: {', '.join(intent['vague_words'])}")


def cmd_spec(args: argparse.Namespace) -> None:
    path = args.output or INTENT_FILE
    intent = _load_intent(path)
    if not intent:
        print("  ! No intent spec found. Run 'crystallize' first.")
        sys.exit(1)

    spec = generate_spec(intent)
    if args.file:
        with open(args.file, "w", encoding="utf-8") as f:
            f.write(spec)
        print(f"  ✓ Specification written to {args.file}")
    else:
        print("\n" + spec + "\n")


def cmd_check(args: argparse.Namespace) -> None:
    """Scan text for vague words."""
    text = args.text
    if not text and args.file:
        if not os.path.exists(args.file):
            print(f"  ! File not found: {args.file}")
            sys.exit(1)
        with open(args.file, encoding="utf-8") as f:
            text = f.read()

    vague_words = ["fast", "good", "nice", "better", "optimized", "efficient", "robust", "scalable"]
    found = [w for w in vague_words if w in text.lower()]

    if found:
        print(f"  ⚠ Vague words found: {', '.join(found)}")
        print(f"  Suggestion: Replace with measurable criteria (e.g., 'responds in <200ms' instead of 'fast')")
    else:
        print("  ✓ No vague language detected.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Intent Specification Protocol — crystallize vague requests."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # init
    p_init = sub.add_parser("init", help="Create empty intent spec")
    p_init.add_argument("--output", default=INTENT_FILE)

    # crystallize
    p_cryst = sub.add_parser("crystallize", help="Crystallize a vague request")
    p_cryst.add_argument("request", help="The vague user request")
    p_cryst.add_argument("--output", default=INTENT_FILE)

    # spec
    p_spec = sub.add_parser("spec", help="Generate human-readable specification")
    p_spec.add_argument("--output", default=INTENT_FILE)
    p_spec.add_argument("--file", default="", help="Write spec to file instead of stdout")

    # check
    p_check = sub.add_parser("check", help="Scan text for vague words")
    p_check.add_argument("text", nargs="?", default="", help="Text to scan")
    p_check.add_argument("--file", default="", help="Scan file instead of text")

    args = parser.parse_args()

    commands = {
        "init": cmd_init,
        "crystallize": cmd_crystallize,
        "spec": cmd_spec,
        "check": cmd_check,
    }
    fn = commands.get(args.command)
    if fn:
        fn(args)


if __name__ == "__main__":
    main()
