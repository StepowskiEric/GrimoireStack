#!/usr/bin/env python3
"""
purify_test_output.py — Companion script for the purify-test-output skill.

Reads raw test output (stdin or file), strips framework noise, preserves
user-code frames / assertion messages / variable diffs, and prints the
purified result.  Optionally reports token-reduction stats and emits JSON.

Usage:
    pytest test_foo.py -x --tb=long 2>&1 | python purify_test_output.py
    python purify_test_output.py --file /tmp/raw_output.txt --json
"""

import argparse
import json
import re
import sys
from pathlib import Path


def detect_framework(lines):
    """Guess test framework from output signatures."""
    header = "\n".join(lines[:30])
    if "jest" in header.lower() or "● " in header or "FAIL " in header:
        return "jest"
    if "vitest" in header.lower():
        return "vitest"
    if "mocha" in header.lower():
        return "mocha"
    if "pytest" in header.lower() or "=== " in header:
        return "pytest"
    if "unittest" in header.lower() or "Traceback (most recent call last)" in header:
        return "unittest"
    return "generic"


def is_framework_frame(line):
    """Return True if a line is a stack frame inside framework / stdlib internals."""
    # Python: site-packages, lib/python, stdlib
    if re.search(r'site-packages|lib/python\d|/usr/lib/python|/usr/local/lib/python', line):
        return True
    # Node: node_modules
    if 'node_modules' in line:
        return True
    # Pytest short-form: e.g., "../../.local/lib/python3.11/site-packages/..."
    if re.search(r'\.\.[/\\].*site-packages', line):
        return True
    return False


def is_user_frame(line):
    """Return True if line looks like a user-code stack frame."""
    # Python: File "...", line N, in function_name
    if re.search(r'File\s+"', line) and not is_framework_frame(line):
        return True
    # Pytest short-form without "File": lines starting with project paths
    if re.match(r'\s*\S+\.py:\d+:', line) and not is_framework_frame(line):
        return True
    # JS/TS: "at functionName (path:line:col)"
    if re.search(r'at\s+\S+\s*\([^)]+:\d+:\d+\)', line) and not is_framework_frame(line):
        return True
    # JS/TS anonymous: "at path:line:col"
    if re.search(r'at\s+[^()]+:\d+:\d+', line) and not is_framework_frame(line):
        return True
    return False


def is_assertion_or_diff(line):
    """Return True if line carries the failure signal (assertion, diff, exception)."""
    stripped = line.strip()
    # Python assertion / exception messages
    if stripped.startswith("AssertionError") or stripped.startswith("Exception"):
        return True
    if stripped.startswith("KeyError") or stripped.startswith("ValueError"):
        return True
    if stripped.startswith("TypeError") or stripped.startswith("IndexError"):
        return True
    if stripped.startswith("E   "):
        return True
    # pytest FAILED marker
    if re.search(r'::\S+\s+FAILED', line):
        return True
    # Jest / Vitest fail marker
    if stripped.startswith("FAIL ") or stripped.startswith("✕ ") or stripped.startswith("● "):
        return True
    # Diff lines (expected vs actual)
    if re.search(r'expected\s+.*\s+to\s+(equal|be|match|contain|have)', stripped, re.IGNORECASE):
        return True
    if "==" in line or "!=" in line or "Expected:" in line or "Received:" in line:
        return True
    return False


def is_noise(line, framework):
    """Return True for obvious noise lines."""
    stripped = line.strip()
    if not stripped:
        return False  # blank lines are handled separately
    # Session headers / separators
    if re.match(r'=+\s+test session starts\s+=+', stripped, re.IGNORECASE):
        return True
    if re.match(r'=+\s+\d+\s+(passed|failed|error).*=', stripped, re.IGNORECASE):
        return True
    if re.match(r'-+\s+Captured stdout call\s+-+', stripped):
        return True
    if re.match(r'-+\s+Captured stderr call\s+-+', stripped):
        return True
    # Coverage / summary noise
    if stripped.startswith("Coverage") or "coverage" in stripped.lower() and "%" in stripped:
        return True
    # Jest summary noise
    if re.match(r'Test Suites?:', stripped) or re.match(r'Tests?:', stripped):
        return True
    if stripped.startswith("Snapshots:") or stripped.startswith("Time:"):
        return True
    return False


def purify(raw_text):
    """Main purification pipeline."""
    lines = raw_text.splitlines()
    framework = detect_framework(lines)
    purified = []
    keep_next = False
    prev_blank = False

    for line in lines:
        stripped = line.strip()

        # Always drop pure noise
        if is_noise(line, framework):
            continue

        # Keep assertion / exception / diff lines
        if is_assertion_or_diff(line):
            purified.append(line)
            keep_next = True
            prev_blank = False
            continue

        # Keep user-code stack frames; drop framework frames
        if is_user_frame(line):
            purified.append(line)
            keep_next = True
            prev_blank = False
            continue
        if is_framework_frame(line):
            keep_next = False
            continue

        # If we just saw an assertion or user frame, keep contextual detail
        # (variable values, code snippets) until the next blank line or frame
        if keep_next and stripped:
            # Stop keeping if it looks like a new unrelated section
            if re.match(r'\s*={3,}', stripped) or re.match(r'\s*-{3,}', stripped):
                keep_next = False
                continue
            purified.append(line)
            prev_blank = False
            continue

        # Preserve single blank lines inside the purified block (spacing)
        if not stripped:
            if purified and not prev_blank:
                purified.append(line)
                prev_blank = True
            continue

        # Everything else is dropped
        prev_blank = False

    # Clean trailing blank lines
    while purified and not purified[-1].strip():
        purified.pop()

    return "\n".join(purified)


def main():
    parser = argparse.ArgumentParser(
        description="Purify noisy test output into failure-relevant signal."
    )
    parser.add_argument(
        "--file", "-f", type=Path, default=None,
        help="Path to raw test output file (default: read stdin)"
    )
    parser.add_argument(
        "--json", "-j", action="store_true",
        help="Emit JSON with purified text and reduction stats"
    )
    parser.add_argument(
        "--keep", "-k", action="store_true",
        help="Also write the raw input to /tmp/purify_raw_backup.txt"
    )
    args = parser.parse_args()

    if args.file:
        raw = args.file.read_text(encoding="utf-8")
    else:
        raw = sys.stdin.read()

    if args.keep:
        Path("/tmp/purify_raw_backup.txt").write_text(raw, encoding="utf-8")

    purified = purify(raw)

    original_tokens = len(raw.split())
    purified_tokens = len(purified.split())
    reduction = (
        round((original_tokens - purified_tokens) / original_tokens * 100, 1)
        if original_tokens else 0.0
    )

    if args.json:
        print(json.dumps({
            "framework": detect_framework(raw.splitlines()),
            "original_tokens": original_tokens,
            "purified_tokens": purified_tokens,
            "reduction_percent": reduction,
            "purified": purified,
        }, indent=2))
    else:
        if purified:
            print(purified)
        else:
            print("(purify_test_output: nothing kept — output may already be minimal)")

        sys.stderr.write(
            f"\n[purify_test_output] tokens: {original_tokens} → {purified_tokens} "
            f"({reduction}% reduction)\n"
        )


if __name__ == "__main__":
    main()
