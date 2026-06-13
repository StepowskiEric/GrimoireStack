#!/usr/bin/env python3
"""cognitive-bias-auditor companion script — detect biases in agent decisions (arXiv:2410.02820)."""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone


BIAS_AUDIT_FILE = "bias_audit.jsonl"

# The 9 biases from the paper
BIASES = {
    "anchoring": {
        "keywords": ["first", "initial", "originally", "started with", "began with"],
        "phrases": ["because it was my first", "since I already chose", "sticking with initial"],
        "description": "Over-reliance on first piece of information",
    },
    "confirmation_bias": {
        "keywords": ["confirms", "supports", "matches", "aligns with"],
        "phrases": ["as expected", "just as I thought", "proves my point"],
        "description": "Seeking info that confirms existing beliefs",
    },
    "sunk_cost": {
        "keywords": ["already", "invested", "spent", "time", "effort", "work I put"],
        "phrases": ["don't want to waste", "after all this work", "too much invested"],
        "description": "Continuing due to prior investment",
    },
    "loss_aversion": {
        "keywords": ["lose", "loss", "avoid", "prevent", "risk", "danger"],
        "phrases": ["can't afford to lose", "avoid losing", "prevent failure"],
        "description": "Preferring to avoid losses over acquiring gains",
    },
    "framing": {
        "keywords": ["rather", "instead", "alternative", "option", "presented as"],
        "phrases": ["when you put it that way", "framed as", "depends how you ask"],
        "description": "Decisions change based on how info is presented",
    },
    "conjunction_fallacy": {
        "keywords": ["and also", "both", "specifically", "particular case"],
        "phrases": ["more likely than the general", "specific scenario"],
        "description": "Assuming specific conditions more probable than general",
    },
    "overconfidence": {
        "keywords": ["certain", "definitely", "obviously", "clearly", "always", "never"],
        "phrases": ["I'm sure", "100%", "without a doubt", "guaranteed"],
        "description": "Overestimating accuracy of beliefs",
    },
    "availability": {
        "keywords": ["recent", "remember", "recall", "last time", "previous"],
        "phrases": ["I just saw", "recently experienced", "easy to think of"],
        "description": "Judging probability by how easily examples come to mind",
    },
    "representativeness": {
        "keywords": ["similar", "like", "typical", "pattern", "matches pattern"],
        "phrases": ["looks like", "similar to", "typical case of"],
        "description": "Judging probability by similarity to stereotype",
    },
}


def _load_audit(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    entries = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return entries


def _save_audit(path: str, entries: list[dict]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for entry in entries:
            f.write(json.dumps(entry, sort_keys=True) + "\n")


def detect_biases(decision: str, context: str = "", bias_filter: str = "all") -> dict:
    """Detect biases in a decision string."""
    text = (decision + " " + context).lower()
    detected = {}

    for bias_name, bias_info in BIASES.items():
        if bias_filter != "all" and bias_name != bias_filter:
            continue

        score = 0
        matches = []

        # Check keywords
        for kw in bias_info["keywords"]:
            if kw in text:
                score += 1
                matches.append(kw)

        # Check phrases
        for phrase in bias_info["phrases"]:
            if phrase in text:
                score += 2
                matches.append(phrase)

        if score > 0:
            detected[bias_name] = {
                "score": score,
                "matches": matches,
                "description": bias_info["description"],
            }

    return detected


def calculate_severity(detected: dict) -> str:
    """Calculate severity based on number and score of biases."""
    if not detected:
        return "none"

    total_score = sum(b["score"] for b in detected.values())
    num_biases = len(detected)

    if total_score >= 5 or num_biases >= 3:
        return "high"
    elif total_score >= 3 or num_biases >= 2:
        return "medium"
    else:
        return "low"


def cmd_check(args: argparse.Namespace) -> None:
    """Audit a single decision."""
    decision = args.decision
    context = args.context or ""
    bias_filter = args.bias or "all"
    output = args.output or BIAS_AUDIT_FILE

    detected = detect_biases(decision, context, bias_filter)
    severity = calculate_severity(detected)

    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "decision": decision[:200],
        "context": context[:200] if context else "",
        "biases_detected": list(detected.keys()),
        "bias_details": detected,
        "severity": severity,
    }

    # Save to audit file
    entries = _load_audit(output)
    entries.append(entry)
    _save_audit(output, entries)

    # Print results
    print(f"\n  Cognitive Bias Audit Results")
    print(f"  {'─' * 40}")
    if detected:
        print(f"  ⚠ Biases detected: {len(detected)} (severity: {severity})")
        for bias_name, info in detected.items():
            print(f"    • {bias_name}: score={info['score']}")
            print(f"      Matches: {', '.join(info['matches'][:3])}")
            print(f"      Description: {info['description']}")
    else:
        print(f"  ✓ No biases detected (severity: {severity})")

    # Suggestions
    if detected:
        print(f"\n  Suggestions:")
        if "anchoring" in detected:
            print(f"    • Re-evaluate all options without seeing first choice")
        if "confirmation_bias" in detected:
            print(f"    • Actively seek contradictory evidence")
        if "sunk_cost" in detected:
            print(f"    • Ask: 'Would I start this if I hadn't invested time?'")
        if "loss_aversion" in detected:
            print(f"    • Reframe as 'gain from switching' not 'loss from staying'")

    print(f"\n  Saved to: {output}")


def cmd_batch(args: argparse.Namespace) -> None:
    """Audit multiple decisions from a file."""
    input_file = args.file
    bias_filter = args.bias or "all"
    output = args.output or BIAS_AUDIT_FILE

    if not os.path.exists(input_file):
        print(f"  ! File not found: {input_file}")
        sys.exit(1)

    # Load decisions (expect JSONL or one per line)
    decisions = []
    with open(input_file, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                decisions.append(obj.get("decision", ""))
            except json.JSONDecodeError:
                decisions.append(line)

    print(f"  Processing {len(decisions)} decisions...")

    all_entries = _load_audit(output)
    for i, decision in enumerate(decisions):
        detected = detect_biases(decision, bias_filter=bias_filter)
        severity = calculate_severity(detected)

        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "decision": decision[:200],
            "biases_detected": list(detected.keys()),
            "severity": severity,
        }
        all_entries.append(entry)

        if detected:
            print(f"  [{i+1}] Biases: {', '.join(detected.keys())} ({severity})")
        else:
            print(f"  [{i+1}] No biases detected")

    _save_audit(output, all_entries)
    print(f"\n  Saved {len(decisions)} audit entries to: {output}")


def cmd_report(args: argparse.Namespace) -> None:
    """Generate bias frequency report."""
    input_file = args.input or BIAS_AUDIT_FILE

    if not os.path.exists(input_file):
        print(f"  ! No audit file found: {input_file}")
        sys.exit(1)

    entries = _load_audit(input_file)

    if not entries:
        print(f"  No audit entries found.")
        return

    # Count biases
    bias_counts = {}
    severity_counts = {"high": 0, "medium": 0, "low": 0, "none": 0}

    for entry in entries:
        severity = entry.get("severity", "none")
        severity_counts[severity] += 1
        for bias in entry.get("biases_detected", []):
            bias_counts[bias] = bias_counts.get(bias, 0) + 1

    # Print report
    print(f"\n  Cognitive Bias Audit Report")
    print(f"  {'─' * 40}")
    print(f"  Total decisions audited: {len(entries)}")
    print(f"\n  Severity Distribution:")
    for sev, count in severity_counts.items():
        if count > 0:
            print(f"    {sev}: {count}")

    if bias_counts:
        print(f"\n  Bias Frequency:")
        for bias, count in sorted(bias_counts.items(), key=lambda x: -x[1]):
            print(f"    {bias}: {count}")

    # Output to file if requested
    if args.output_file:
        with open(args.output_file, "w", encoding="utf-8") as f:
            f.write(f"# Cognitive Bias Audit Report\n\n")
            f.write(f"Total decisions audited: {len(entries)}\n\n")
            f.write(f"## Severity Distribution\n\n")
            for sev, count in severity_counts.items():
                if count > 0:
                    f.write(f"- {sev}: {count}\n")
            f.write(f"\n## Bias Frequency\n\n")
            for bias, count in sorted(bias_counts.items(), key=lambda x: -x[1]):
                f.write(f"- {bias}: {count}\n")
        print(f"\n  Report saved to: {args.output_file}")


def cmd_persona(args: argparse.Namespace) -> None:
    """Apply Econographics persona (2,121 behavioral indicators)."""
    persona_file = args.persona_file

    if persona_file and not os.path.exists(persona_file):
        print(f"  ! Persona file not found: {persona_file}")
        sys.exit(1)

    # Simplified persona simulation (full Econographics has 2,121 indicators)
    personas = {
        "rational": {"overconfidence": 0.1, "loss_aversion": 0.2, "anchoring": 0.1},
        "loss_averse": {"overconfidence": 0.3, "loss_aversion": 0.9, "anchoring": 0.4},
        "overconfident": {"overconfidence": 0.9, "loss_aversion": 0.3, "anchoring": 0.5},
    }

    selected = args.type or "rational"
    if selected not in personas:
        print(f"  ! Unknown persona: {selected}")
        print(f"  Available: {', '.join(personas.keys())}")
        sys.exit(1)

    print(f"\n  Applying '{selected}' persona (Econographics-based)")
    print(f"  {'─' * 40}")
    for bias, weight in personas[selected].items():
        print(f"    {bias}: {weight:.1f} (higher = more susceptible)")

    print(f"\n  Paper finding: Gemma 2 showed strengths on sunk cost fallacy")
    print(f"  Paper finding: GPT-4o showed highest availability heuristic bias")
    print(f"  Paper finding: Llama 3.1 most susceptible to conjunction fallacy")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Cognitive Bias Auditor — detect biases in agent decisions (arXiv:2410.02820)."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # check
    p_check = sub.add_parser("check", help="Audit a single decision")
    p_check.add_argument("decision", help="The decision text to audit")
    p_check.add_argument("--context", default="", help="Additional context")
    p_check.add_argument("--bias", default="all", help="Specific bias to check (or 'all')")
    p_check.add_argument("--output", default=BIAS_AUDIT_FILE)

    # batch
    p_batch = sub.add_parser("batch", help="Audit multiple decisions from file")
    p_batch.add_argument("file", help="JSONL file with decisions")
    p_batch.add_argument("--bias", default="all")
    p_batch.add_argument("--output", default=BIAS_AUDIT_FILE)

    # report
    p_report = sub.add_parser("report", help="Generate bias frequency report")
    p_report.add_argument("--input", default=BIAS_AUDIT_FILE)
    p_report.add_argument("--output-file", default="", help="Write report to file")

    # persona
    p_persona = sub.add_parser("persona", help="Apply Econographics persona")
    p_persona.add_argument("--type", default="rational", help="Persona type (rational, loss_averse, overconfident)")
    p_persona.add_argument("--persona-file", default="", help="Custom persona file (Econographics format)")

    args = parser.parse_args()

    commands = {
        "check": cmd_check,
        "batch": cmd_batch,
        "report": cmd_report,
        "persona": cmd_persona,
    }
    fn = commands.get(args.command)
    if fn:
        fn(args)


if __name__ == "__main__":
    main()
