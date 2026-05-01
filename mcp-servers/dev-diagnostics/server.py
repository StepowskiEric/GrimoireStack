#!/usr/bin/env python3
"""
MCP Developer Diagnostics Server

Aggregates lint, test, build, and type-check output across tools and returns structured JSON diagnostics.
No external deps — pure stdlib.

Supported scanners (auto-detected or explicitly invoked):
  eslint  — `eslint --format json` parser
  vitest  — `vitest run --reporter json` parser
  pytest  — `pytest --json-report` parser (falls back to terminal output)
  tsc     — `tsc --noEmit` output parser
  biome   — `biome check --json` parser
  ruff    — `ruff check --output-format json` parser

Tools:
  run_diagnostics  — run scanner(s) on a repo path and return structured issues
  parse_output     — parse already-captured JSON/text diagnostics from a file
  get_summary      — aggregate counts by severity + category
"""

import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional

# ────────────────────────────────────────────────────────────────────────────────
# MCP stdio transport (raw JSON-RPC)
# ────────────────────────────────────────────────────────────────────────────────

def _read_message() -> Optional[Dict[str, Any]]:
    headers = b""
    while True:
        chunk = sys.stdin.buffer.read(1)
        if not chunk:
            return None
        headers += chunk
        if headers.endswith(b"\r\n\r\n"):
            break
    length = 0
    for line in headers.decode("ascii", errors="ignore").splitlines():
        if line.lower().startswith("content-length:"):
            length = int(line.split(":", 1)[1].strip())
    if not length:
        return None
    body = sys.stdin.buffer.read(length)
    return json.loads(body.decode("utf-8"))


def _send_message(msg: Dict[str, Any]) -> None:
    body = json.dumps(msg, separators=(",", ":")).encode("utf-8")
    header = f"Content-Length: {len(body)}\r\n\r\n".encode("ascii")
    sys.stdout.buffer.write(header + body)
    sys.stdout.buffer.flush()


# ────────────────────────────────────────────────────────────────────────────────
# Parsers
# ────────────────────────────────────────────────────────────────────────────────

def parse_eslint_json(text: str) -> List[Dict[str, Any]]:
    issues = []
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return issues

    # ESLint format: array of {filePath, messages: [{ruleId, severity, message, line, column}]}
    if isinstance(data, list):
        for file_entry in data:
            fp = file_entry.get("filePath", "")
            for m in file_entry.get("messages", []):
                issues.append({
                    "tool": "eslint",
                    "file": fp,
                    "line": m.get("line", 0),
                    "column": m.get("column", 0),
                    "severity": _eslint_severity(m.get("severity", 1)),
                    "rule": m.get("ruleId", "unknown"),
                    "message": m.get("message", ""),
                    "category": _eslint_category(m.get("ruleId", "")),
                })
    elif isinstance(data, dict):
        # Biome / Ruff / single-file format
        for k, v in data.items():
            if isinstance(v, list):
                for m in v:
                    issues.append({
                        "tool": "eslint",
                        "file": k if k else m.get("path", ""),
                        "line": m.get("line", 0),
                        "column": m.get("column", 0),
                        "severity": _eslint_severity(m.get("severity", 1)),
                        "rule": m.get("ruleId", "unknown"),
                        "message": m.get("message", ""),
                        "category": _eslint_category(m.get("ruleId", "")),
                    })
            elif isinstance(v, dict):
                issues.append({
                    "tool": "eslint",
                    "file": v.get("path", ""),
                    "line": v.get("line", 0),
                    "column": v.get("column", 0),
                    "severity": _eslint_severity(v.get("severity", 1)),
                    "rule": v.get("ruleId", "unknown"),
                    "message": v.get("message", ""),
                    "category": _eslint_category(v.get("ruleId", "")),
                })
    return issues


def _eslint_severity(val: int) -> str:
    return {2: "error", 1: "warning", 0: "suggestion"}.get(val, "warning")


def _eslint_category(rule: str) -> str:
    if rule in ("no-unused-vars", "no-undef", "no-var", "prefer-const",
                "@typescript-eslint/no-unused-vars", "import/no-unresolved"):
        return "auto-fixable"
    if "type" in rule.lower() or "interface" in rule.lower():
        return "semantic"
    if "import" in rule.lower() or "unused" in rule.lower():
        return "auto-fixable"
    if "format" in rule.lower() or "prettier" in rule.lower() or "indent" in rule.lower() or "newline" in rule.lower():
        return "formatting"
    if "security" in rule.lower() or "vuln" in rule.lower():
        return "security"
    return "semantic"


def parse_ruff_json(text: str) -> List[Dict[str, Any]]:
    issues = []
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return issues
    # Ruff output: {"results": [{"filename", "message", "code", "location": {"row", "column"}}]}
    entries = data if isinstance(data, list) else data.get("results", [])
    for item in entries if isinstance(entries, list) else entries:
        loc = item.get("location", {})
        issues.append({
            "tool": "ruff",
            "file": item.get("filename", ""),
            "line": loc.get("row", 0),
            "column": loc.get("column", 0),
            "severity": "error" if item.get("code", "").startswith("E") else "warning",
            "rule": item.get("code", "unknown"),
            "message": item.get("message", ""),
            "category": _eslint_category(item.get("code", "").lower()),
        })
    return issues


def parse_biome_json(text: str) -> List[Dict[str, Any]]:
    issues = []
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return issues
    files = data if isinstance(data, list) else data.get("files", [])
    for entry in files:
        fp = entry.get("path", "")
        for d in entry.get("diagnostics", []):
            issues.append({
                "tool": "biome",
                "file": fp,
                "line": d.get("location", {}).get("span", [0, 0])[0],
                "column": 0,
                "severity": d.get("severity", "warning").lower(),
                "rule": d.get("rule", "unknown"),
                "message": d.get("description", ""),
                "category": "formatting" if d.get("category") == "format" else "semantic",
            })
    return issues


def parse_tsc_output(text: str) -> List[Dict[str, Any]]:
    issues = []
    # TS error format: filepath(line,col): error TS####: message
    pattern = re.compile(r"^(.*?)(\d+)\((\d+),(\d+)\):\s*(error|warning)\s+TS(\d+):\s*(.*?)$", re.MULTILINE)
    for m in pattern.finditer(text):
        issues.append({
            "tool": "tsc",
            "file": m.group(1).strip(),
            "line": int(m.group(2)),
            "column": int(m.group(3)),
            "severity": m.group(5),
            "rule": f"TS{m.group(6)}",
            "message": m.group(7).strip(),
            "category": "semantic",
        })
    return issues


def parse_pytest_json(text: str) -> List[Dict[str, Any]]:
    issues = []
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # Fallback: parse plain pytest output
        return _parse_pytest_plain(text)
    for test_id, result in data.get("tests", {}).items():
        if result.get("outcome") != "passed":
            issues.append({
                "tool": "pytest",
                "file": result.get("nodeid", ""),
                "line": 0,
                "column": 0,
                "severity": "error",
                "rule": "test-failure",
                "message": result.get("longrepr", result.get("outcome", "failed")),
                "category": "test-failure",
            })
    return issues


def _parse_pytest_plain(text: str) -> List[Dict[str, Any]]:
    issues = []
    # Match FAILED lines
    for line in text.splitlines():
        m = re.match(r"^(.*?FAILED|ERROR).*?:\s*(.*?)$", line)
        if m:
            issues.append({
                "tool": "pytest",
                "file": "",
                "line": 0, "column": 0,
                "severity": "error",
                "rule": "test-failure",
                "message": line.strip(),
                "category": "test-failure",
            })
    return issues


def parse_vitest_json(text: str) -> List[Dict[str, Any]]:
    issues = []
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return issues
    # Vitest json output structure varies by version
    if isinstance(data, list):
        for suite in data:
            for test in suite.get("tests", []):
                if test.get("status") != "passed":
                    issues.append({
                        "tool": "vitest",
                        "file": test.get("filepath", ""),
                        "line": test.get("line", 0),
                        "column": 0,
                        "severity": "error",
                        "rule": "test-failure",
                        "message": test.get("name", "") + ": " + str(test.get("error", "")),
                        "category": "test-failure",
                    })
    elif isinstance(data, dict):
        for file_path, results in data.get("testResults", {}).items():
            for r in results:
                status = r.get("status", "")
                if status != "passed":
                    issues.append({
                        "tool": "vitest",
                        "file": file_path,
                        "line": r.get("line", 0),
                        "column": 0,
                        "severity": "error",
                        "rule": "test-failure",
                        "message": r.get("title", "") + ": " + str(r.get("failureMessages", "")),
                        "category": "test-failure",
                    })
    return issues


# ────────────────────────────────────────────────────────────────────────────────
# Scanner dispatch
# ────────────────────────────────────────────────────────────────────────────────

def run_scanner(tool: str, repo_path: str, extra_args: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """Run a diagnostic tool and return parsed issues."""
    issues: List[Dict[str, Any]] = []

    if tool == "eslint":
        cmd = ["npx", "eslint", ".", "--format", "json"]
        if extra_args:
            cmd.extend(extra_args)
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=repo_path)
        if result.stdout:
            issues.extend(parse_eslint_json(result.stdout))

    elif tool == "biome":
        cmd = ["npx", "biome", "check", "--json"]
        if extra_args:
            cmd.extend(extra_args)
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=repo_path)
        if result.stdout:
            issues.extend(parse_biome_json(result.stdout))

    elif tool == "ruff":
        cmd = ["ruff", "check", ".", "--output-format", "json"]
        if extra_args:
            cmd.extend(extra_args)
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=repo_path)
        if result.stdout:
            issues.extend(parse_ruff_json(result.stdout))

    elif tool == "tsc":
        cmd = ["npx", "tsc", "--noEmit"]
        if extra_args:
            cmd.extend(extra_args)
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=repo_path)
        combined = result.stdout + "\n" + result.stderr
        if combined.strip():
            issues.extend(parse_tsc_output(combined))

    elif tool == "vitest":
        cmd = ["npx", "vitest", "run", "--reporter", "json"]
        if extra_args:
            cmd.extend(extra_args)
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=repo_path)
        if result.stdout:
            issues.extend(parse_vitest_json(result.stdout))

    elif tool == "pytest":
        cmd = ["python", "-m", "pytest", "-q", "--tb=short"]
        if extra_args:
            cmd.extend(extra_args)
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=repo_path)
        if result.stdout or result.stderr:
            # Prefer JSON report if available
            issues.extend(parse_pytest_json(result.stdout))
            if not issues:
                issues.extend(_parse_pytest_plain(result.stdout + "\n" + result.stderr))

    else:
        raise ValueError(f"Unknown scanner: {tool}. Supported: eslint, biome, ruff, tsc, vitest, pytest")

    return issues


def parse_file(path: str, tool_hint: Optional[str] = None) -> List[Dict[str, Any]]:
    text = Path(path).read_text(encoding="utf-8", errors="ignore")
    name = tool_hint or Path(path).name.lower()

    if "eslint" in name or name.endswith(".eslint.json"):
        return parse_eslint_json(text)
    if "ruff" in name:
        return parse_ruff_json(text)
    if "biome" in name:
        return parse_biome_json(text)
    if "tsc" in name or "typescript" in name:
        return parse_tsc_output(text)
    if "vitest" in name:
        return parse_vitest_json(text)
    if "pytest" in name:
        return parse_pytest_json(text)

    # Try each parser in order of aggressiveness
    return (
        parse_eslint_json(text) or
        parse_ruff_json(text) or
        parse_biome_json(text) or
        parse_tsc_output(text) or
        parse_vitest_json(text) or
        parse_pytest_json(text) or
        []
    )


def summarize(issues: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = len(issues)
    by_severity = defaultdict(int)
    by_category = defaultdict(int)
    by_tool = defaultdict(int)
    by_file = defaultdict(int)

    for issue in issues:
        by_severity[issue.get("severity", "warning")] += 1
        by_category[issue.get("category", "unknown")] += 1
        by_tool[issue.get("tool", "unknown")] += 1
        by_file[issue.get("file", "")] += 1

    most_affected = sorted(by_file.items(), key=lambda x: -x[1])[:10] if by_file else []

    return {
        "total": total,
        "by_severity": dict(by_severity),
        "by_category": dict(by_category),
        "by_tool": dict(by_tool),
        "files_affected": len(by_file),
        "most_affected_files": [{"file": f, "count": c} for f, c in most_affected],
    }


# ────────────────────────────────────────────────────────────────────────────────
# Tools schema
# ────────────────────────────────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "run_diagnostics",
        "description": "Run one or more diagnostic scanners (eslint, biome, ruff, tsc, vitest, pytest) on a repo and return structured issues.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "repo_path": {"type": "string", "description": "Absolute path to the repo root"},
                "scanners": {"type": "array", "items": {"type": "string", "enum": ["eslint", "biome", "ruff", "tsc", "vitest", "pytest"]}, "description": "List of scanners to run"},
                "extra_args": {"type": "array", "items": {"type": "string"}, "description": "Extra command-line args to pass to each scanner"},
            },
            "required": ["repo_path", "scanners"],
        },
    },
    {
        "name": "parse_output",
        "description": "Parse diagnostics already saved to a JSON/text file.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string", "description": "Absolute path to the diagnostics output file"},
                "tool_hint": {"type": "string", "description": "Hint about which tool produced this output (eslint/biome/ruff/tsc/vitest/pytest)"},
            },
            "required": ["file_path"],
        },
    },
    {
        "name": "get_summary",
        "description": "Aggregate a list of issues into counts by severity, category, tool, and file.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "issues": {"type": "array", "description": "Array of issue objects from run_diagnostics or parse_output"},
            },
            "required": ["issues"],
        },
    },
    {
        "name": "contamination_check",
        "description": "Compare two diagnostics runs (before / after fix) to ensure no new errors were introduced.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "before": {"type": "array", "description": "Issues array before fix"},
                "after": {"type": "array", "description": "Issues array after fix"},
            },
            "required": ["before", "after"],
        },
    },
]


# ────────────────────────────────────────────────────────────────────────────────
# Tool dispatch
# ────────────────────────────────────────────────────────────────────────────────

def call_tool(name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    if name == "run_diagnostics":
        all_issues: List[Dict[str, Any]] = []
        for scanner in args["scanners"]:
            issues = run_scanner(
                scanner,
                args["repo_path"],
                extra_args=args.get("extra_args"),
            )
            all_issues.extend(issues)
        summary = summarize(all_issues)
        return {"content": [{"type": "text", "text": json.dumps({"issues": all_issues, "summary": summary})}]}

    if name == "parse_output":
        issues = parse_file(args["file_path"], args.get("tool_hint"))
        summary = summarize(issues)
        return {"content": [{"type": "text", "text": json.dumps({"issues": issues, "summary": summary})}]}

    if name == "get_summary":
        summary = summarize(args["issues"])
        return {"content": [{"type": "text", "text": json.dumps(summary)}]}

    if name == "contamination_check":
        before = args["before"]
        after = args["after"]
        before_set = {(i.get("file",""), i.get("line",0), i.get("message","")) for i in before}
        after_set = {(i.get("file",""), i.get("line",0), i.get("message","")) for i in after}

        new_errors = [i for i in after if (i.get("file",""), i.get("line",0), i.get("message","")) not in before_set]
        fixed_errors = [i for i in before if (i.get("file",""), i.get("line",0), i.get("message","")) not in after_set]

        return {"content": [{"type": "text", "text": json.dumps({
            "new_errors_count": len(new_errors),
            "fixed_errors_count": len(fixed_errors),
            "new_errors": new_errors[:20],
            "fixed_errors": fixed_errors[:20],
            "clean": len(new_errors) == 0,
        })}]}

    raise ValueError(f"Unknown tool: {name}")


# ────────────────────────────────────────────────────────────────────────────────
# Server loop
# ────────────────────────────────────────────────────────────────────────────────

def run_server():
    while True:
        msg = _read_message()
        if msg is None:
            break
        method = msg.get("method")
        msg_id = msg.get("id")
        params = msg.get("params", {})

        if method == "initialize":
            _send_message({
                "jsonrpc": "2.0", "id": msg_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "serverInfo": {"name": "dev-diagnostics", "version": "1.0.0"},
                },
            })
        elif method == "notifications/initialized":
            pass
        elif method == "tools/list":
            _send_message({
                "jsonrpc": "2.0", "id": msg_id,
                "result": {"tools": TOOLS},
            })
        elif method == "tools/call":
            try:
                result = call_tool(params["name"], params.get("arguments", {}))
                _send_message({"jsonrpc": "2.0", "id": msg_id, "result": result})
            except Exception as e:
                _send_message({
                    "jsonrpc": "2.0", "id": msg_id,
                    "error": {"code": -32602, "message": str(e)},
                })
        elif method == "ping":
            _send_message({"jsonrpc": "2.0", "id": msg_id, "result": {}})


if __name__ == "__main__":
    run_server()
