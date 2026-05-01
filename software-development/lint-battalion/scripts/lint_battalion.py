#!/usr/bin/env python3
"""
lint_battalion.py — Batch planner for mass linter error remediation.

Companion script for the `lint-battalion` skill.
Reads linter JSON output, auto-categorizes errors, groups into subagent-sized
batches, and emits an execution plan (JSON + human-readable summary).

Supports: ESLint (--format json), Biome (biome check --json), Ruff (ruff check --output-format json)
"""

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

# ── Categorization heuristics ──────────────────────────────────────────────

MECHANICAL_RULES = frozenset({
    # ESLint
    "no-unused-vars", "no-unused-imports", "unused-imports/no-unused-imports",
    "@typescript-eslint/no-unused-vars", "@typescript-eslint/no-unused-imports",
    "no-use-before-define", "no-var", "prefer-const", "prefer-let",
    "quotes", "semi", "comma-dangle", "comma-spacing", "no-trailing-spaces",
    "indent", "max-len", "eol-last", "no-multiple-empty-lines",
    "object-curly-spacing", "array-bracket-spacing", "arrow-spacing",
    "keyword-spacing", "space-before-blocks", "space-infix-ops",
    "key-spacing", "block-spacing", "rest-spread-spacing",
    "no-extra-semi", "no-extra-parens", "no-extra-boolean-cast",
    "brace-style", "curly", "eqeqeq", "yoda", "no-undef",
    "no-implicit-globals", "no-global-assign", "no-redeclare",
    "no-duplicate-imports", "sort-imports", "import/order",
    "import/first", "import/newline-after-import", "import/no-duplicates",
    "@typescript-eslint/consistent-type-imports",
    "@typescript-eslint/no-duplicate-imports",
    "prefer-arrow-callback", "arrow-body-style", "prefer-template",
    "template-curly-spacing", "no-useless-concat", "no-useless-escape",
    "no-useless-return", "no-useless-rename", "object-shorthand",
    "prefer-destructuring", "prefer-rest-params", "prefer-spread",
    "prefer-object-spread", "prefer-numeric-literals",
    "dot-notation", "prefer-regex-literals", "no-throw-literal",
    "no-return-await", "require-await", "no-async-promise-executor",
    "no-promise-executor-return", "no-case-declarations",
    "no-empty", "no-empty-function", "no-empty-pattern",
    "no-unreachable", "no-unreachable-loop", "no-constant-condition",
    "no-debugger", "no-console", "no-alert",
    "no-shadow", "no-shadow-restricted-names",
    "no-inner-declarations", "no-loop-func",
    "no-new-wrappers", "no-new-object", "no-array-constructor",
    "no-extend-native", "no-implicit-coercion",
    "strict", "global-require", "handle-callback-err",
    "no-path-concat", "no-process-exit",
    # Biome equivalents (prefix stripped)
    "lint/suspicious/noConsoleLog", "lint/style/useTemplate",
    "lint/correctness/noUnusedVariables", "lint/correctness/noUnusedImports",
    # Ruff (prefix stripped)
    "F401", "F402", "F403", "F811", "F841",  # unused imports/vars
    "E101", "E111", "E114", "E115", "E117",  # indentation
    "E201", "E202", "E203", "E211", "E221", "E222", "E223", "E224",
    "E225", "E226", "E227", "E228", "E231", "E241", "E242", "E251",
    "E252", "E261", "E262", "E265", "E266", "E271", "E272", "E273",
    "E274", "E275", "E301", "E302", "E303", "E304", "E305", "E306",
    "W191", "W291", "W293", "W391",  # whitespace
    "I001", "I002",  # isort
    "UP",  # pyupgrade
    "C4",  # flake8-comprehensions
    "SIM",  # flake8-simplify
    "S",  # flake8-bandit
    "A",  # flake8-builtins
    "COM",  # flake8-commas
    "T20",  # flake8-print
    "TID",  # flake8-tidy-imports
    "ARG",  # flake8-unused-arguments
    "PTH",  # flake8-use-pathlib
    "ERA",  # eradicate
    "PD",  # pandas-vet
    "N",  # pep8-naming
    "D",  # pydocstyle
})

SEMANTIC_RULES = frozenset({
    # ESLint
    "@typescript-eslint/no-explicit-any",
    "@typescript-eslint/explicit-function-return-type",
    "@typescript-eslint/explicit-module-boundary-types",
    "@typescript-eslint/no-unsafe-assignment",
    "@typescript-eslint/no-unsafe-member-access",
    "@typescript-eslint/no-unsafe-call",
    "@typescript-eslint/no-unsafe-return",
    "@typescript-eslint/no-unsafe-argument",
    "@typescript-eslint/no-floating-promises",
    "@typescript-eslint/await-thenable",
    "@typescript-eslint/require-await",
    "@typescript-eslint/no-misused-promises",
    "@typescript-eslint/no-confusing-void-expression",
    "@typescript-eslint/restrict-template-expressions",
    "@typescript-eslint/restrict-plus-operands",
    "@typescript-eslint/no-base-to-string",
    "@typescript-eslint/non-nullable-type-assertion-style",
    "no-implied-eval", "no-eval", "no-new-func",
    "no-param-reassign", "no-mutating-props", "vue/no-mutating-props",
    "react-hooks/rules-of-hooks", "react-hooks/exhaustive-deps",
    "jsx-a11y/alt-text", "jsx-a11y/anchor-has-content",
    # Biome
    "lint/correctness/noUndeclaredVariables",
    "lint/suspicious/noExplicitAny",
    # Ruff
    "E999",  # syntax errors
    "F821", "F822", "F823",  # undefined names
})

ARCHITECTURAL_RULES = frozenset({
    # ESLint
    "import/no-cycle", "import/no-self-import",
    "no-restricted-imports", "no-restricted-modules",
    "class-methods-use-this", "no-class-assign",
    "max-lines", "max-lines-per-function", "max-params", "max-depth", "max-nested-callbacks",
    "complexity", "cyclomatic-complexity",
    "no-duplicate-class-members", "no-this-before-super",
    # Biome
    "lint/complexity/noExcessiveCognitiveComplexity",
    # Ruff
    "C901", "PLR", "PLW", "PLC", "PLE",
})

# Auto-fix rules: if these remain after `--fix`, something is wrong
AUTO_FIXABLE = frozenset({
    "no-unused-vars", "no-unused-imports", "unused-imports/no-unused-imports",
    "@typescript-eslint/no-unused-vars", "@typescript-eslint/no-unused-imports",
    "quotes", "semi", "comma-dangle", "indent", "max-len",
    "no-extra-semi", "no-extra-parens", "no-trailing-spaces",
    "object-curly-spacing", "array-bracket-spacing", "eol-last",
    "prefer-const", "no-var", "prefer-arrow-callback",
    "no-useless-escape", "no-useless-return", "no-useless-rename",
    "object-shorthand", "prefer-template", "dot-notation",
    "sort-imports", "import/order", "import/first",
    "F401", "F841", "I001", "COM812", "COM819",
})


# ── Input parsers ──────────────────────────────────────────────────────────

def parse_eslint_json(data: list[dict]) -> list[dict]:
    """Parse ESLint JSON format (array of file results)."""
    errors = []
    for file_result in data:
        file_path = file_result.get("filePath", "")
        for msg in file_result.get("messages", []):
            errors.append({
                "file": file_path,
                "line": msg.get("line", 0),
                "column": msg.get("column", 0),
                "rule": msg.get("ruleId", "unknown"),
                "message": msg.get("message", ""),
                "severity": msg.get("severity", 1),
                "fixable": msg.get("fix") is not None,
            })
    return errors


def parse_biome_json(data: dict) -> list[dict]:
    """Parse Biome JSON format."""
    errors = []
    for diag in data.get("diagnostics", []):
        loc = diag.get("location", {})
        path = loc.get("path", {}).get("file", "") if isinstance(loc.get("path"), dict) else ""
        span = loc.get("span", [0, 0])
        errors.append({
            "file": path,
            "line": span[0] if span else 0,
            "column": span[1] if len(span) > 1 else 0,
            "rule": diag.get("category", "unknown"),
            "message": diag.get("message", ""),
            "severity": 2 if diag.get("severity") == "error" else 1,
            "fixable": "suggestion" in str(diag.get("advices", {})),
        })
    return errors


def parse_ruff_json(data: list[dict]) -> list[dict]:
    """Parse Ruff JSON format."""
    errors = []
    for msg in data:
        errors.append({
            "file": msg.get("filename", ""),
            "line": msg.get("location", {}).get("row", 0),
            "column": msg.get("location", {}).get("column", 0),
            "rule": msg.get("code", "unknown"),
            "message": msg.get("message", ""),
            "severity": 2 if msg.get("fix") else 1,
            "fixable": msg.get("fix") is not None,
        })
    return errors


def detect_and_parse(raw: str) -> tuple[list[dict], str]:
    """Auto-detect format and parse."""
    data = json.loads(raw)
    # ESLint: array of files
    if isinstance(data, list) and data and "filePath" in data[0]:
        return parse_eslint_json(data), "eslint"
    # Ruff: array of messages
    if isinstance(data, list) and data and "code" in data[0]:
        return parse_ruff_json(data), "ruff"
    # Biome: object with diagnostics
    if isinstance(data, dict) and "diagnostics" in data:
        return parse_biome_json(data), "biome"
    raise ValueError("Could not detect linter format. Expected ESLint, Biome, or Ruff JSON output.")


# ── Categorization & grouping ─────────────────────────────────────────────

def categorize(rule: str) -> str:
    """Classify a lint rule into error category."""
    if rule in AUTO_FIXABLE:
        return "auto"
    if rule in MECHANICAL_RULES:
        return "mechanical"
    if rule in SEMANTIC_RULES:
        return "semantic"
    if rule in ARCHITECTURAL_RULES:
        return "architectural"
    # Fallback heuristics by rule name patterns
    low = rule.lower()
    if any(k in low for k in ("unused", "import", "quotes", "semi", "comma", "indent", "space", "trailing", "eol", "format", "sort", "order", "style")):
        return "mechanical"
    if any(k in low for k in ("any", "unsafe", "promise", "await", "return-type", "undefined", "eval")):
        return "semantic"
    if any(k in low for k in ("cycle", "complexity", "max-", "class-", "cognitive")):
        return "architectural"
    return "semantic"  # default to safest (requires specialist)


def group_by_rule_dir(errors: list[dict], repo_root: str = "") -> dict:
    """Group errors by (category, rule, relative_directory)."""
    groups = defaultdict(list)
    for err in errors:
        cat = categorize(err["rule"])
        file = err["file"]
        # Compute relative directory
        if repo_root:
            relp = os.path.relpath(file, repo_root)
        else:
            relp = file
        dir_part = os.path.dirname(relp) or "."
        key = (cat, err["rule"], dir_part)
        groups[key].append(err)
    return dict(groups)


# ── Batching ───────────────────────────────────────────────────────────────

def create_batches(errors: list[dict], max_errors: int = 20, max_files: int = 5) -> list[list[dict]]:
    """Split errors into batches respecting per-batch limits."""
    if not errors:
        return []

    # Sort by file for locality
    sorted_errors = sorted(errors, key=lambda e: (e["file"], e["line"]))
    batches = []
    current = []
    current_files = set()

    for err in sorted_errors:
        # Check limits
        would_exceed_errors = len(current) >= max_errors
        would_exceed_files = err["file"] not in current_files and len(current_files) >= max_files

        if would_exceed_errors or would_exceed_files:
            batches.append(current)
            current = []
            current_files = set()

        current.append(err)
        current_files.add(err["file"])

    if current:
        batches.append(current)

    return batches


def build_execution_plan(errors: list[dict], repo_root: str = "") -> dict:
    """Build the full execution plan with categories and batches."""
    groups = group_by_rule_dir(errors, repo_root)

    plan = {
        "summary": {
            "total_errors": len(errors),
            "by_category": defaultdict(int),
            "by_rule": defaultdict(int),
            "by_directory": defaultdict(int),
        },
        "categories": {},
    }

    # Summarize
    for err in errors:
        cat = categorize(err["rule"])
        plan["summary"]["by_category"][cat] += 1
        plan["summary"]["by_rule"][err["rule"]] += 1
        relp = os.path.relpath(err["file"], repo_root) if repo_root else err["file"]
        plan["summary"]["by_directory"][os.path.dirname(relp) or "."] += 1

    # Build batches per category
    for cat in ["auto", "mechanical", "semantic", "architectural"]:
        cat_errors = [e for e in errors if categorize(e["rule"]) == cat]
        if not cat_errors:
            continue

        cat_groups = defaultdict(list)
        for err in cat_errors:
            relp = os.path.relpath(err["file"], repo_root) if repo_root else err["file"]
            dir_part = os.path.dirname(relp) or "."
            key = (err["rule"], dir_part)
            cat_groups[key].append(err)

        batches = []
        batch_num = 0
        for (rule, dir_part), rule_errors in sorted(cat_groups.items(), key=lambda x: -len(x[1])):
            for batch in create_batches(rule_errors):
                batch_num += 1
                batches.append({
                    "batch_id": f"{cat[0].upper()}{batch_num}",
                    "rule": rule,
                    "directory": dir_part,
                    "error_count": len(batch),
                    "files": sorted({e["file"] for e in batch}),
                    "errors": batch,
                })

        plan["categories"][cat] = {
            "total": len(cat_errors),
            "batch_count": len(batches),
            "batches": batches,
            "recommended_max_parallel": {"auto": 0, "mechanical": 5, "semantic": 2, "architectural": 1}[cat],
        }

    # Convert defaultdicts to plain dicts for JSON serialization
    plan["summary"]["by_category"] = dict(plan["summary"]["by_category"])
    plan["summary"]["by_rule"] = dict(plan["summary"]["by_rule"])
    plan["summary"]["by_directory"] = dict(plan["summary"]["by_directory"])

    return plan


# ── Output formatting ──────────────────────────────────────────────────────

def print_markdown_summary(plan: dict, stream=sys.stdout) -> None:
    """Print a human-readable summary."""
    s = plan["summary"]
    stream.write("# Lint Battalion Execution Plan\n\n")
    stream.write(f"**Total errors:** {s['total_errors']}\n")
    stream.write(f"**Batches:** {sum(c['batch_count'] for c in plan['categories'].values())}\n\n")

    stream.write("## Summary by Category\n\n")
    for cat, count in sorted(s["by_category"].items(), key=lambda x: -x[1]):
        emoji = {"auto": "⚙️", "mechanical": "🔧", "semantic": "🧠", "architectural": "🏗️"}.get(cat, "❓")
        stream.write(f"- {emoji} **{cat}**: {count} errors\n")

    stream.write("\n## Top 10 Rules by Frequency\n\n")
    for rule, count in sorted(s["by_rule"].items(), key=lambda x: -x[1])[:10]:
        stream.write(f"- `{rule}`: {count}\n")

    stream.write("\n## Batches\n\n")
    for cat, info in plan["categories"].items():
        emoji = {"auto": "⚙️", "mechanical": "🔧", "semantic": "🧠", "architectural": "🏗️"}.get(cat, "❓")
        stream.write(f"### {emoji} {cat.upper()} ({info['total']} errors, {info['batch_count']} batches, max parallel: {info['recommended_max_parallel']})\n\n")
        for batch in info["batches"]:
            files_str = ", ".join(batch["files"])
            stream.write(f"- **{batch['batch_id']}** — `{batch['rule']}` in `{batch['directory']}` — {batch['error_count']} error(s) across {len(batch['files'])} file(s): {files_str}\n")
        stream.write("\n")

    stream.write("## Auto-fix Check\n\n")
    auto_count = s["by_category"].get("auto", 0)
    if auto_count > 0:
        stream.write(f"⚠️ {auto_count} error(s) are in `auto` category — run `--fix` again before spawning subagents.\n")
    else:
        stream.write("✅ No auto-fixable errors remain. Proceed to subagent battalions.\n")
    stream.write("\n")


def print_subagent_prompts(plan: dict, stream=sys.stdout) -> None:
    """Print ready-to-use subagent prompt snippets."""
    stream.write("# Subagent Prompts\n\n")
    for cat, info in plan["categories"].items():
        if cat in ("auto", "architectural"):
            continue
        for batch in info["batches"]:
            files_list = ", ".join(f"`{os.path.basename(f)}`" for f in batch["files"])
            stream.write(f"## Batch {batch['batch_id']}\n\n")
            stream.write(f"**Files:** {files_list}\n\n")
            stream.write("**Errors:**\n")
            for err in batch["errors"]:
                stream.write(f"- `{err['rule']}` @ `{os.path.basename(err['file'])}:{err['line']}:{err['column']}` — {err['message']}\n")
            stream.write("\n---\n\n")


# ── Main ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Batch planner for mass linter error remediation"
    )
    parser.add_argument("input", nargs="?", type=argparse.FileType("r"),
                        default=sys.stdin, help="Linter JSON output (default: stdin)")
    parser.add_argument("--repo-root", "-r", default="", help="Repository root for relative paths")
    parser.add_argument("--json", "-j", action="store_true", help="Output JSON plan only")
    parser.add_argument("--markdown", "-m", action="store_true", help="Output markdown summary")
    parser.add_argument("--prompts", "-p", action="store_true", help="Output subagent prompt snippets")
    parser.add_argument("--max-errors", type=int, default=20, help="Max errors per batch (default: 20)")
    parser.add_argument("--max-files", type=int, default=5, help="Max files per batch (default: 5)")
    parser.add_argument("--output", "-o", help="Write JSON output to file")
    args = parser.parse_args()

    raw = args.input.read()
    if not raw.strip():
        print("Error: no input data.", file=sys.stderr)
        sys.exit(1)

    try:
        errors, linter_name = detect_and_parse(raw)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Filter out generated files
    SKIP_PATTERNS = [
        r"[\\/]node_modules[\\/]",
        r"[\\/]\.next[\\/]",
        r"[\\/]dist[\\/]",
        r"[\\/]build[\\/]",
        r"[\\/]coverage[\\/]",
        r"[\\/]\.git[\\/]",
        r"\.d\.ts$",
        r"\.lock$",
        r"\.gen\.[tj]sx?$",
        r"generated[\\/]",
        r"\.min\.(js|css)$",
    ]
    skip_re = re.compile("|".join(SKIP_PATTERNS))
    errors = [e for e in errors if not skip_re.search(e["file"])]

    plan = build_execution_plan(errors, args.repo_root)
    plan["meta"] = {"linter": linter_name, "skipped_generated": len(errors) != len(json.loads(raw)), "params": {"max_errors": args.max_errors, "max_files": args.max_files}}

    # If no output format specified, print markdown summary + save JSON
    if not args.json and not args.markdown and not args.prompts:
        print_markdown_summary(plan)

    if args.markdown:
        print_markdown_summary(plan)

    if args.prompts:
        print_subagent_prompts(plan)

    if args.json or args.output:
        json_out = json.dumps(plan, indent=2)
        if args.output:
            Path(args.output).write_text(json_out)
            print(f"Wrote JSON plan to {args.output}")
        if args.json:
            print(json_out)


if __name__ == "__main__":
    main()
