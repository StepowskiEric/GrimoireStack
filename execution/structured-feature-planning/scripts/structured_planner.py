#!/usr/bin/env python3
"""
structured_planner.py — enforces structured feature planning workflow

Usage:
    python structured_planner.py --mode explore          # phases 1-3
    python structured_planner.py --mode plan             # phases 4-6
    python structured_planner.py --mode execute          # phases 7 (emit summary, then start)
    python structured_planner.py --mode full             # all phases in sequence
    python structured_planner.py --mode resume           # resume from last incomplete phase
    python structured_planner.py --status               # show current state
    python structured_planner.py --reset                # clear state and restart

Input:
    --task "description of the feature to implement"

Output:
    feature_plan.jsonl — structured JSONL log of all phases

The script enforces:
- Phase ordering (can't skip ahead)
- Valid JSONL output
- Confusion/stuck detection (script halts if NEEDS_CLARIFICATION not resolved)
- No hallucination: if a phase has invalid/missing data, it demands completion
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

PLAN_FILE = Path("feature_plan.jsonl")

# Phase ordering
PHASES = [
    "file_read",
    "search",
    "needs_clarification",
    "plan",
    "review_pass1",
    "review_pass2",
    "summary",
]

PHASE_DESCRIPTIONS = {
    "file_read": "Phase 1: Explore — read relevant files, emit structured findings",
    "search": "Phase 2: Search — 3-5 targeted searches for implementation patterns",
    "needs_clarification": "Phase 3: Stuck Detection — resolve uncertainty or flag for user",
    "plan": "Phase 4: Write Plan — structured plan with confidence per step",
    "review_pass1": "Phase 5: Self-Review Pass 1 — diff against original request",
    "review_pass2": "Phase 6: Self-Review Pass 2 — pre-mortem failure modes",
    "summary": "Phase 7: Summary + Execute — plain-English summary, then start working",
}

# Which phases must complete before advancing
PHASE_ORDER = {
    "file_read": 1,
    "search": 2,
    "needs_clarification": 3,
    "plan": 4,
    "review_pass1": 5,
    "review_pass2": 6,
    "summary": 7,
}


def get_completed_phases() -> dict:
    """Return dict of phase -> last_entry for each completed phase."""
    completed = {}
    if not PLAN_FILE.exists():
        return completed
    with open(PLAN_FILE) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                phase = entry.get("phase")
                if phase:
                    completed[phase] = entry
            except json.JSONDecodeError:
                continue
    return completed


def get_current_phase() -> int:
    """Get the phase number that needs to be worked on next."""
    completed = get_completed_phases()
    if not completed:
        return 1
    # Find the highest completed phase
    max_phase_num = 0
    for phase in completed:
        if phase in PHASE_ORDER:
            max_phase_num = max(max_phase_num, PHASE_ORDER[phase])
    return max_phase_num + 1


def get_current_phase_name() -> str:
    """Get the name of the current phase."""
    n = get_current_phase()
    for phase, num in PHASE_ORDER.items():
        if num == n:
            return phase
    return "complete"


def check_clarification_resolved() -> tuple[bool, Optional[dict]]:
    """Check if there's an unresolved NEEDS_CLARIFICATION block."""
    completed = get_completed_phases()
    if "needs_clarification" in completed:
        entry = completed["needs_clarification"]
        # If it was emitted but no resolution field, it's unresolved
        if "resolution" not in entry:
            return False, entry
    return True, None


def require_phase(phase_name: str, completed_phases: dict) -> None:
    """Raise error if a required phase hasn't been completed."""
    if phase_name not in completed_phases:
        n = PHASE_ORDER[phase_name]
        raise ValueError(
            f"Phase {n} ({phase_name}) must be completed first. "
            f"Run with --mode resume and provide the required data."
        )


def validate_file_read_entry(entry: dict) -> list[str]:
    """Validate a file_read entry. Return list of errors."""
    errors = []
    required = ["path", "relevant_to", "key_findings"]
    for field in required:
        if field not in entry or not entry[field]:
            errors.append(f"file_read entry missing required field: {field}")
    if "key_findings" in entry and not isinstance(entry["key_findings"], list):
        errors.append("key_findings must be a list")
    return errors


def validate_search_entry(entry: dict) -> list[str]:
    """Validate a search entry. Return list of errors."""
    errors = []
    required = ["purpose", "query", "findings"]
    for field in required:
        if field not in entry or not entry[field]:
            errors.append(f"search entry missing required field: {field}")
    if "purpose" in entry and len(entry["purpose"]) < 10:
        errors.append("search purpose must be specific (at least 10 chars)")
    return errors


def validate_plan_entry(entry: dict) -> list[str]:
    """Validate the plan entry. Return list of errors."""
    errors = []
    if "steps" not in entry:
        errors.append("plan entry missing 'steps' field")
        return errors
    if not isinstance(entry["steps"], list):
        errors.append("steps must be a list")
        return errors
    for i, step in enumerate(entry["steps"]):
        step_errors = []
        if "action" not in step:
            step_errors.append("step missing 'action'")
        if "confidence" not in step:
            step_errors.append(f"step {i+1} missing 'confidence'")
        elif step["confidence"] not in ("HIGH", "MEDIUM", "LOW"):
            step_errors.append(f"step {i+1} confidence must be HIGH|MEDIUM|LOW")
        if step_errors:
            errors.extend(step_errors)
    return errors


def validate_review_pass1(entry: dict) -> list[str]:
    """Validate review_pass1. Return list of errors."""
    errors = []
    required = ["diff_vs_request"]
    for field in required:
        if field not in entry:
            errors.append(f"review_pass1 missing required field: {field}")
    if entry.get("diff_vs_request") not in ("unchanged", "clarified", "expanded", "reduced"):
        errors.append("diff_vs_request must be unchanged|clarified|expanded|reduced")
    return errors


def validate_review_pass2(entry: dict) -> list[str]:
    """Validate review_pass2. Return list of errors."""
    errors = []
    if "failure_modes" not in entry:
        errors.append("review_pass2 missing 'failure_modes' field")
    elif not isinstance(entry["failure_modes"], list):
        errors.append("failure_modes must be a list")
    return errors


def validate_summary(entry: dict) -> list[str]:
    """Validate summary entry. Return list of errors."""
    errors = []
    required = ["plain_english", "top_risks", "confidence", "steps_total"]
    for field in required:
        if field not in entry:
            errors.append(f"summary missing required field: {field}")
    if entry.get("confidence") not in ("HIGH", "MEDIUM", "LOW"):
        errors.append("summary confidence must be HIGH|MEDIUM|LOW")
    return errors


def append_entry(entry: dict, phase: str) -> None:
    """Append a validated entry to the plan file."""
    # Add timestamp
    entry["_timestamp"] = datetime.utcnow().isoformat() + "Z"

    # Phase-specific validation
    validators = {
        "file_read": validate_file_read_entry,
        "search": validate_search_entry,
        "plan": validate_plan_entry,
        "review_pass1": validate_review_pass1,
        "review_pass2": validate_review_pass2,
        "summary": validate_summary,
        "needs_clarification": lambda e: [],
    }

    if phase in validators:
        errors = validators[phase](entry)
        if errors:
            raise ValueError(f"Invalid entry for phase {phase}:\n" + "\n".join(f"  - {e}" for e in errors))

    with open(PLAN_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")


def handle_explore_mode(task: str) -> None:
    """Run phases 1-3: read files, search, stuck detection."""
    completed = get_completed_phases()
    current = get_current_phase_name()

    print(f"[structured_planner] Mode: explore")
    print(f"[structured_planner] Current phase: {current} (phase {get_current_phase()})")

    if get_current_phase() > 2:
        print("[structured_planner] Search phase already complete or beyond. Use --mode plan or --mode resume.")
        return

    # Check for unresolved clarification
    resolved, clarification = check_clarification_resolved()
    if not resolved:
        print(f"[structured_planner] UNRESOLVED: {clarification.get('issue', 'unknown')}")
        print("[structured_planner] Please resolve this before proceeding.")
        print("[structured_planner] To provide resolution, run:")
        print(f"[structured_planner]   python structured_planner.py --mode resume --clarification-resolution 'your resolution'")
        return

    print("[structured_planner] Ready for file_read and search entries.")
    print("[structured_planner] Add entries manually to feature_plan.jsonl")
    print("[structured_planner] Or pipe agent output: agent_output >> feature_plan.jsonl")


def handle_plan_mode() -> None:
    """Run phases 4-6: write plan, self-review twice."""
    completed = get_completed_phases()
    current = get_current_phase_name()

    print(f"[structured_planner] Mode: plan")
    print(f"[structured_planner] Current phase: {current} (phase {get_current_phase()})")

    if get_current_phase() < 4:
        n = get_current_phase()
        print(f"[structured_planner] Cannot proceed to plan phase. Phase {n} not yet complete.")
        print("[structured_planner] Run --mode explore first to complete phases 1-3.")
        return

    # Require file_read and search
    require_phase("file_read", completed)
    require_phase("search", completed)
    # needs_clarification may or may not exist

    # Check for unresolved clarification
    resolved, clarification = check_clarification_resolved()
    if not resolved:
        print(f"[structured_planner] UNRESOLVED: {clarification.get('issue', 'unknown')}")
        print("[structured_planner] Cannot write plan until clarification is resolved.")
        return

    if get_current_phase() == 4:
        print("[structured_planner] Ready for plan entry. Add to feature_plan.jsonl:")
        print('[structured_planner]   {"phase": "plan", "steps": [...], "out_of_scope": [], "what_i_dont_know": [], "risks": []}')
    elif get_current_phase() == 5:
        print("[structured_planner] Ready for review_pass1 entry:")
        print('[structured_planner]   {"phase": "review_pass1", "diff_vs_request": "...", "explanation": "...", "changes_made": []}')
    elif get_current_phase() == 6:
        print("[structured_planner] Ready for review_pass2 entry:")
        print('[structured_planner]   {"phase": "review_pass2", "failure_modes": [...]}')
    else:
        print("[structured_planner] All review phases complete. Use --mode execute to emit summary.")


def handle_execute_mode(task: str) -> None:
    """Run phase 7: emit summary and begin execution."""
    completed = get_completed_phases()
    current = get_current_phase_name()

    print(f"[structured_planner] Mode: execute")
    print(f"[structured_planner] Current phase: {current} (phase {get_current_phase()})")

    if get_current_phase() < 7:
        print(f"[structured_planner] Cannot execute. Phase {get_current_phase()} not complete.")
        print("[structured_planner] Complete phases in order: explore -> plan -> execute")
        return

    # Require all previous phases
    for phase in ["file_read", "search", "plan", "review_pass1", "review_pass2"]:
        require_phase(phase, completed)

    # Check for unresolved clarification
    resolved, clarification = check_clarification_resolved()
    if not resolved:
        print(f"[structured_planner] UNRESOLVED: {clarification.get('issue', 'unknown')}")
        print("[structured_planner] Cannot execute until clarification is resolved.")
        return

    print("[structured_planner] All phases complete. Ready to execute plan.")
    print("[structured_planner] Summary should be added as:")
    print('[structured_planner]   {"phase": "summary", "plain_english": "...", "top_risks": [...], "confidence": "HIGH|MEDIUM|LOW", "steps_total": N}')
    print()
    print("[structured_planner] === READY TO EXECUTE ===")
    print("[structured_planner] Plan is reference, not prison. Update feature_plan.jsonl if you discover new information.")


def handle_full_mode(task: str) -> None:
    """Run all phases in sequence. Use when task is clear and no exploration needed."""
    print(f"[structured_planner] Mode: full")
    if not task:
        print("[structured_planner] ERROR: --task required for full mode")
        sys.exit(1)
    print(f"[structured_planner] Task: {task}")
    print("[structured_planner] Full mode requires manual phase entry. Use explore + plan modes sequentially.")
    print("[structured_planner] See SKILL.md for the full workflow.")


def handle_status_mode() -> None:
    """Show current state of the plan."""
    completed = get_completed_phases()
    current_phase = get_current_phase()
    current_name = get_current_phase_name()

    print(f"[structured_planner] Status: feature_plan.jsonl")
    print(f"[structured_planner] Current phase: {current_name} (phase {current_phase})")

    if PLAN_FILE.exists():
        line_count = sum(1 for _ in open(PLAN_FILE) if _.strip())
        print(f"[structured_planner] Entries: {line_count}")

    print("\n[structured_planner] Phase completion:")
    for phase, desc in PHASE_DESCRIPTIONS.items():
        status = "✓" if phase in completed else "○"
        print(f"  {status} {desc}")

    resolved, clarification = check_clarification_resolved()
    if not resolved:
        print(f"\n[structured_planner] ⚠ UNRESOLVED: {clarification.get('issue', 'unknown')}")

    print(f"\n[structured_planner] Next action:")
    if current_phase <= 3:
        print(f"  python structured_planner.py --mode explore")
    elif current_phase <= 6:
        print(f"  python structured_planner.py --mode plan")
    else:
        print(f"  python structured_planner.py --mode execute")


def handle_reset_mode() -> None:
    """Reset the plan file."""
    if PLAN_FILE.exists():
        PLAN_FILE.unlink()
        print("[structured_planner] Reset: feature_plan.jsonl deleted")
    else:
        print("[structured_planner] No plan file to reset")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Structured Feature Planner — enforces phase-ordered planning workflow"
    )
    parser.add_argument("--mode", type=str, required=True,
                        choices=["explore", "plan", "execute", "full", "resume", "status", "reset"],
                        help="Workflow mode")
    parser.add_argument("--task", type=str, help="Feature description (required for full mode)")
    parser.add_argument("--clarification-resolution", type=str,
                        help="Resolution for the current NEEDS_CLARIFICATION block")
    parser.add_argument("--phase", type=str,
                        help="Phase to add entry for (use with resume)")
    parser.add_argument("--entry", type=str,
                        help="JSON string of the entry to add (use with resume)")
    args = parser.parse_args()

    # Handle --phase + --entry as alternative to separate subcommands
    if args.phase and args.entry:
        try:
            entry = json.loads(args.entry)
            entry["phase"] = args.phase
            append_entry(entry, args.phase)
            print(f"[structured_planner] Added {args.phase} entry to feature_plan.jsonl")
        except json.JSONDecodeError as e:
            print(f"[structured_planner] ERROR: Invalid JSON in --entry: {e}")
            sys.exit(1)
        except ValueError as e:
            print(f"[structured_planner] ERROR: {e}")
            sys.exit(1)
        return

    # Handle clarification resolution
    if args.clarification_resolution:
        completed = get_completed_phases()
        if "needs_clarification" not in completed:
            print("[structured_planner] No unresolved NEEDS_CLARIFICATION to resolve.")
            sys.exit(1)
        clarification = completed["needs_clarification"].copy()
        clarification["resolution"] = args.clarification_resolution
        # Rewrite the file with the updated entry
        lines = []
        with open(PLAN_FILE) as f:
            for line in f:
                entry = json.loads(line.strip())
                if entry.get("phase") == "needs_clarification":
                    lines.append(json.dumps(clarification) + "\n")
                else:
                    lines.append(line)
        with open(PLAN_FILE, "w") as f:
            f.writelines(lines)
        print(f"[structured_planner] Resolved clarification: {args.clarification_resolution}")
        print("[structured_planner] Now use --mode plan or --mode resume to continue.")
        return

    # Mode routing
    if args.mode == "explore":
        handle_explore_mode(args.task or "")
    elif args.mode == "plan":
        handle_plan_mode()
    elif args.mode == "execute":
        handle_execute_mode(args.task or "")
    elif args.mode == "full":
        handle_full_mode(args.task or "")
    elif args.mode == "status":
        handle_status_mode()
    elif args.mode == "resume":
        # Resume is interactive — show current state and what to do next
        handle_status_mode()
        print()
        print("[structured_planner] To add an entry, run:")
        print('[structured_planner]   python structured_planner.py --phase <phase> --entry \'{"..."}\'')
    elif args.mode == "reset":
        handle_reset_mode()


if __name__ == "__main__":
    main()
