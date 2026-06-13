#!/usr/bin/env python3
"""
verify_assumptions.py — Companion script for the assumption-grounding skill.

Reads assumptions from stdin or file, runs cheap verification checks,
and reports pass/fail.  Designed to be fast, deterministic, and
self-contained (stdlib only).

Usage:
    python verify_assumptions.py --file assumptions.txt
    python verify_assumptions.py <<EOF
    file_exists: src/utils.py
    function_exists: src/utils.py | calculate_tax
    package_installed: pytest
    grep_match: src/config.py | DATABASE_URL
    command_exists: git
    env_var: HOME
    EOF
"""

import argparse
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path


def check_file_exists(target: str) -> dict:
    p = Path(target)
    return {
        "type": "file_exists",
        "target": target,
        "result": "PASS" if p.exists() else "FAIL",
        "detail": f"{'Found' if p.exists() else 'Not found'}: {p.resolve() if p.exists() else target}",
    }


def check_function_exists(file_path: str, name: str) -> dict:
    p = Path(file_path)
    if not p.exists():
        return {"type": "function_exists", "target": f"{file_path} | {name}", "result": "FAIL", "detail": f"File not found: {file_path}"}
    text = p.read_text(encoding="utf-8", errors="ignore")
    # Match Python/Javascript/Typescript/Rust function definitions
    patterns = [
        rf'^\s*def\s+{re.escape(name)}\s*\(',         # Python
        rf'^\s*function\s+{re.escape(name)}\s*\(',    # JS function
        rf'^\s*(async\s+)?function\s+{re.escape(name)}\s*\(',  # JS async
        rf'^\s*(export\s+)?(async\s+)?function\s+{re.escape(name)}\s*\(',  # TS
        rf'^\s*(export\s+)?(async\s+)?const\s+{re.escape(name)}\s*=\s*\(',  # JS/TS const fn
        rf'^\s*fn\s+{re.escape(name)}\s*\(',          # Rust
        rf'^\s*(pub\s+)?fn\s+{re.escape(name)}\s*\(', # Rust pub
        rf'^\s*func\s+{re.escape(name)}\s*\(',        # Swift/Go
        rf'^\s*(private\s+|public\s+|internal\s+)?func\s+{re.escape(name)}\s*\(',  # Swift
    ]
    for i, line in enumerate(text.splitlines(), 1):
        for pat in patterns:
            if re.search(pat, line):
                return {"type": "function_exists", "target": f"{file_path} | {name}", "result": "PASS", "detail": f"Found at line {i}: {line.strip()[:80]}"}
    return {"type": "function_exists", "target": f"{file_path} | {name}", "result": "FAIL", "detail": f"Function/class '{name}' not found in {file_path}"}


def check_class_exists(file_path: str, name: str) -> dict:
    p = Path(file_path)
    if not p.exists():
        return {"type": "class_exists", "target": f"{file_path} | {name}", "result": "FAIL", "detail": f"File not found: {file_path}"}
    text = p.read_text(encoding="utf-8", errors="ignore")
    patterns = [
        rf'^\s*class\s+{re.escape(name)}\b',           # Python/JS/TS/Java
        rf'^\s*export\s+class\s+{re.escape(name)}\b',  # TS export
        rf'^\s*struct\s+{re.escape(name)}\b',          # Rust
        rf'^\s*enum\s+{re.escape(name)}\b',            # Rust/Python
        rf'^\s*interface\s+{re.escape(name)}\b',       # TS
        rf'^\s*type\s+{re.escape(name)}\b',            # TS
    ]
    for i, line in enumerate(text.splitlines(), 1):
        for pat in patterns:
            if re.search(pat, line):
                return {"type": "class_exists", "target": f"{file_path} | {name}", "result": "PASS", "detail": f"Found at line {i}: {line.strip()[:80]}"}
    return {"type": "class_exists", "target": f"{file_path} | {name}", "result": "FAIL", "detail": f"Class/type '{name}' not found in {file_path}"}


def check_grep_match(file_path: str, pattern: str) -> dict:
    p = Path(file_path)
    if not p.exists():
        return {"type": "grep_match", "target": f"{file_path} | {pattern}", "result": "FAIL", "detail": f"File not found: {file_path}"}
    text = p.read_text(encoding="utf-8", errors="ignore")
    for i, line in enumerate(text.splitlines(), 1):
        if pattern in line:
            return {"type": "grep_match", "target": f"{file_path} | {pattern}", "result": "PASS", "detail": f"Found at line {i}: {line.strip()[:80]}"}
    return {"type": "grep_match", "target": f"{file_path} | {pattern}", "result": "FAIL", "detail": f"Pattern '{pattern}' not found in {file_path}"}


def check_package_installed(package: str) -> dict:
    try:
        importlib.import_module(package)
        return {"type": "package_installed", "target": package, "result": "PASS", "detail": f"Python package '{package}' is importable"}
    except ImportError:
        pass
    # Also check npm / cargo / gem / etc via common binaries
    for mgr in ("pip", "npm", "cargo", "gem", "go"):
        if shutil.which(mgr):
            # Heuristic: npm list, pip show, cargo metadata
            if mgr == "pip":
                rc = subprocess.run([mgr, "show", package], capture_output=True, text=True).returncode
            elif mgr == "npm":
                rc = subprocess.run([mgr, "list", package], capture_output=True, text=True).returncode
            else:
                continue
            if rc == 0:
                return {"type": "package_installed", "target": package, "result": "PASS", "detail": f"Package '{package}' found via {mgr}"}
    return {"type": "package_installed", "target": package, "result": "FAIL", "detail": f"Package '{package}' not importable or found via package managers"}


def check_command_exists(cmd: str) -> dict:
    found = shutil.which(cmd)
    return {
        "type": "command_exists",
        "target": cmd,
        "result": "PASS" if found else "FAIL",
        "detail": f"{'Found' if found else 'Not found'}: {found or cmd}",
    }


def check_env_var(name: str) -> dict:
    val = os.environ.get(name)
    return {
        "type": "env_var",
        "target": name,
        "result": "PASS" if val is not None else "FAIL",
        "detail": f"{'Set' if val is not None else 'Not set'}: {val[:60] + '...' if val and len(val) > 60 else val}" if val else "Not set",
    }


def parse_and_check(line: str) -> dict:
    line = line.strip()
    if not line or line.startswith("#"):
        return None

    if ":" not in line:
        return {"type": "raw", "target": line, "result": "ERROR", "detail": "Invalid format. Expected 'type: target' or 'type: file | pattern'"}

    kind, rest = line.split(":", 1)
    kind = kind.strip().lower()
    rest = rest.strip()

    if kind == "file_exists":
        return check_file_exists(rest)
    elif kind == "function_exists":
        if "|" not in rest:
            return {"type": kind, "target": rest, "result": "ERROR", "detail": "Expected 'file_path | function_name'"}
        file_path, name = rest.split("|", 1)
        return check_function_exists(file_path.strip(), name.strip())
    elif kind == "class_exists":
        if "|" not in rest:
            return {"type": kind, "target": rest, "result": "ERROR", "detail": "Expected 'file_path | class_name'"}
        file_path, name = rest.split("|", 1)
        return check_class_exists(file_path.strip(), name.strip())
    elif kind == "grep_match":
        if "|" not in rest:
            return {"type": kind, "target": rest, "result": "ERROR", "detail": "Expected 'file_path | pattern'"}
        file_path, pattern = rest.split("|", 1)
        return check_grep_match(file_path.strip(), pattern.strip())
    elif kind == "package_installed":
        return check_package_installed(rest)
    elif kind == "command_exists":
        return check_command_exists(rest)
    elif kind == "env_var":
        return check_env_var(rest)
    else:
        return {"type": kind, "target": rest, "result": "ERROR", "detail": f"Unknown assumption type: {kind}"}


def main():
    parser = argparse.ArgumentParser(description="Verify assumptions cheaply.")
    parser.add_argument("--file", "-f", type=Path, help="Path to assumptions file")
    parser.add_argument("--json", "-j", action="store_true", help="Emit JSON output")
    parser.add_argument("--summary", "-s", action="store_true", help="Only emit summary counts")
    args = parser.parse_args()

    if args.file:
        lines = args.file.read_text(encoding="utf-8").splitlines()
    else:
        lines = sys.stdin.read().splitlines()

    results = []
    for line in lines:
        result = parse_and_check(line)
        if result:
            results.append(result)

    pass_count = sum(1 for r in results if r["result"] == "PASS")
    fail_count = sum(1 for r in results if r["result"] == "FAIL")
    error_count = sum(1 for r in results if r["result"] == "ERROR")

    if args.json:
        print(json.dumps({
            "summary": {"pass": pass_count, "fail": fail_count, "error": error_count, "total": len(results)},
            "results": results,
        }, indent=2))
        return

    if args.summary:
        print(f"PASS: {pass_count}  FAIL: {fail_count}  ERROR: {error_count}  TOTAL: {len(results)}")
        return

    for r in results:
        status_icon = "✓" if r["result"] == "PASS" else ("✗" if r["result"] == "FAIL" else "?")
        print(f"[{status_icon}] {r['type']}: {r['target']}")
        print(f"    Result: {r['result']} — {r['detail']}")
        print()

    print(f"--- Summary: {pass_count} pass, {fail_count} fail, {error_count} error ({len(results)} total) ---")
    if fail_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
