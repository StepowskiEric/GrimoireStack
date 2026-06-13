#!/usr/bin/env python3
"""
context_budget.py — Companion script for the context-budget-operator skill.

Estimates token counts, suggests compression strategies, and tracks
session budget usage.  Uses simple heuristics (stdlib only) that
approximate modern subword tokenizers.

Usage:
    # Estimate tokens for files
    python context_budget.py --files src/main.py src/utils.py

    # Check if content fits budget
    python context_budget.py --file large_output.txt --budget 4000

    # Log an operation and check budget status
    python context_budget.py --log "read_file:main.py:1200" --budget 16000

    # Show session report
    python context_budget.py --report

    # Suggest compression for oversized content
    python context_budget.py --file huge_log.txt --suggest --budget 4000

    # Full assessment: estimate files + show budget status
    python context_budget.py --files src/*.py --budget 16000 --session-log
"""

import argparse
import glob
import json
import os
import sys
from pathlib import Path

# Simple heuristic: ~4 characters per token for mixed text/code.
# Modern BPE tokenizers (Claude, GPT-4, etc.) average 3.5-4.5 chars/token.
CHARS_PER_TOKEN = 4.0

# Where to persist session log
SESSION_LOG = Path("/tmp/context_budget_session.jsonl")


def estimate_tokens(text: str) -> int:
    """Estimate token count from text using char-based heuristic."""
    if not text:
        return 0
    # Mixed heuristic: chars/4 is decent for code and prose
    return max(1, int(len(text) / CHARS_PER_TOKEN))


def estimate_file_tokens(path: Path) -> int:
    """Estimate tokens for a file."""
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except (OSError, UnicodeDecodeError) as e:
        return 0
    return estimate_tokens(text)


def classify_need(token_count: int) -> str:
    """Classify information need based on token size."""
    if token_count < 100:
        return "summary"
    elif token_count < 300:
        return "signature"
    elif token_count < 800:
        return "section"
    elif token_count < 2000:
        return "full"
    else:
        return "multi-file / compress"


def budget_status(used: int, limit: int) -> tuple:
    """Return status label, color, and percentage."""
    pct = used / limit if limit else 0
    if pct < 0.5:
        return "GREEN", "\033[32m", pct
    elif pct < 0.75:
        return "YELLOW", "\033[33m", pct
    elif pct < 0.9:
        return "RED", "\033[31m", pct
    else:
        return "BLACK", "\033[30;1m", pct


def suggest_compression(token_count: int, budget: int) -> list:
    """Return list of compression suggestions when content exceeds budget."""
    suggestions = []
    if token_count > budget:
        over_by = token_count - budget
        suggestions.append(f"Content is {over_by} tokens over budget ({token_count} > {budget})")
    else:
        suggestions.append(f"Content fits: {token_count}/{budget} tokens ({budget - token_count} remaining)")

    if token_count > budget * 2:
        suggestions.append("  → STRONG: Read only function signatures + docstrings")
        suggestions.append("  → STRONG: Use grep/search to find relevant section")
        suggestions.append("  → STRONG: Offload full content to temp file, reference by name")
    elif token_count > budget:
        suggestions.append("  → Read specific line range only (e.g., lines 50-150)")
        suggestions.append("  → Extract definitions and constants, skip implementations")
        suggestions.append("  → Summarize in <100 words before including")
    elif token_count > budget * 0.75:
        suggestions.append("  → Warning: tight fit. Consider summary if adding more content.")

    return suggestions


def log_operation(entry: str, budget: int):
    """Append operation to session log."""
    import time
    # Parse "operation:detail:tokens" or "operation:tokens"
    parts = entry.split(":")
    tokens = 0
    try:
        tokens = int(parts[-1])
    except ValueError:
        pass

    record = {
        "timestamp": time.time(),
        "entry": entry,
        "tokens": tokens,
        "budget": budget,
    }
    with open(SESSION_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")


def read_session_log() -> list:
    """Read all session log entries."""
    if not SESSION_LOG.exists():
        return []
    entries = []
    with open(SESSION_LOG, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return entries


def print_report(entries: list):
    """Print session budget report."""
    if not entries:
        print("No session log entries found.")
        return

    total = sum(e["tokens"] for e in entries)
    budget = entries[-1].get("budget", 0) if entries else 0
    status, color, pct = budget_status(total, budget) if budget else ("UNKNOWN", "", 0)

    print("=== Context Budget Session Report ===\n")
    for e in entries:
        print(f"  {e['entry']} — {e['tokens']} tokens")
    print()
    if budget:
        print(f"Total used: {total} / {budget} tokens ({pct:.1%})")
        print(f"Status: {color}{status}\033[0m")
        if status == "YELLOW":
            print("  → Compress before next addition")
        elif status == "RED":
            print("  → Halt and compress existing context immediately")
        elif status == "BLACK":
            print("  → STOP. Summarize and reset, or escalate to user")
    else:
        print(f"Total used: {total} tokens (no budget limit set)")


def main():
    parser = argparse.ArgumentParser(description="Estimate and track context budget.")
    parser.add_argument("--files", "-f", nargs="+", help="Files to estimate")
    parser.add_argument("--file", help="Single file to estimate")
    parser.add_argument("--budget", "-b", type=int, default=0, help="Context budget limit")
    parser.add_argument("--log", "-l", help="Log an operation (format: 'desc:tokens')")
    parser.add_argument("--report", "-r", action="store_true", help="Show session report")
    parser.add_argument("--suggest", "-s", action="store_true", help="Suggest compression")
    parser.add_argument("--json", "-j", action="store_true", help="Emit JSON")
    parser.add_argument("--session-log", action="store_true", help="Write file estimates to session log")
    parser.add_argument("--clear-log", action="store_true", help="Clear session log")
    args = parser.parse_args()

    if args.clear_log:
        SESSION_LOG.unlink(missing_ok=True)
        print("Session log cleared.")
        return

    if args.report:
        entries = read_session_log()
        print_report(entries)
        return

    if args.log:
        log_operation(args.log, args.budget)
        if not args.json:
            print(f"Logged: {args.log}")
        return

    # Collect files to estimate
    files = []
    if args.files:
        for pattern in args.files:
            matched = glob.glob(pattern)
            if matched:
                files.extend(Path(p) for p in matched)
            else:
                files.append(Path(pattern))
    if args.file:
        files.append(Path(args.file))

    if not files:
        parser.print_help()
        sys.exit(1)

    results = []
    total_tokens = 0
    for f in files:
        if not f.exists():
            results.append({"file": str(f), "tokens": 0, "error": "not found"})
            continue
        tokens = estimate_file_tokens(f)
        total_tokens += tokens
        need = classify_need(tokens)
        results.append({"file": str(f), "tokens": tokens, "need": need, "size_bytes": f.stat().st_size})

    # Build output
    if args.json:
        out = {
            "files": results,
            "total_tokens": total_tokens,
        }
        if args.budget:
            status, _, pct = budget_status(total_tokens, args.budget)
            out["budget"] = args.budget
            out["used_percent"] = round(pct * 100, 1)
            out["status"] = status
            out["remaining"] = max(0, args.budget - total_tokens)
        print(json.dumps(out, indent=2))
    else:
        print("=== Token Estimates ===\n")
        for r in results:
            err = f" [{r['error']}]" if "error" in r else ""
            print(f"  {r['file']}: ~{r['tokens']} tokens ({r['need']}){err}")
        print(f"\nTotal: ~{total_tokens} tokens")

        if args.budget:
            status, color, pct = budget_status(total_tokens, args.budget)
            remaining = max(0, args.budget - total_tokens)
            print(f"Budget: {args.budget} tokens | Used: {pct:.1%} | Remaining: {remaining}")
            print(f"Status: {color}{status}\033[0m")
            if status == "YELLOW":
                print("  → Compress before adding to context")
            elif status == "RED":
                print("  → Halt and compress immediately")
            elif status == "BLACK":
                print("  → STOP. Content exceeds safe budget")

        if args.suggest and args.budget:
            print()
            for sug in suggest_compression(total_tokens, args.budget):
                print(sug)

    # Optionally log to session
    if args.session_log and args.budget:
        log_operation(f"batch_estimate:{'+'.join(str(f) for f in files)}:{total_tokens}", args.budget)


if __name__ == "__main__":
    main()
