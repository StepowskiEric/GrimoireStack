---
name: dev-diagnostics-mcp
category: software-development
description: MCP server aggregating lint, test, build, and type-check diagnostics across tools. Returns structured JSON issues with severity, category, and contamination checks.
version: 1.0.0
priority: high
tags: [mcp, diagnostics, lint, tests, tsc, eslint, vitest, pytest, ruff, biome]
...



---

## Overview

This skill registers the `dev-diagnostics` MCP server with Hermes Agent, turning a pile of unstructured linter/test output into clean JSON.

**What it replaces:**
- Pasting `eslint --format json` into the chat and asking the agent to parse it
- Reading `vitest run` failure logs manually
- Comparing two `tsc --noEmit` runs by eye
- Counting errors per file by hand

**What the MCP gives you:**
- `run_diagnostics` — run eslint/biome/ruff/tsc/vitest/pytest and get structured issues
- `parse_output` — parse a previously-captured diagnostics file (JSON or text)
- `get_summary` — aggregate issues by severity, category, tool, and file
- `contamination_check` — compare before/after fix to ensure no regressions

**Supported tools:**
| Tool | Auto-detected? | Output parsed |
|---|---|---|
| ESLint | Yes | `--format json` |
| Biome | Yes | `--json` |
| Ruff | Yes | `--output-format json` |
| tsc | Yes | `--noEmit` stdout |
| Vitest | Yes | `--reporter json` |
| pytest | Yes | `--json-report` or plain |

**How it works:**
Pure Python stdlib server implementing raw MCP JSON-RPC over stdio. No `pip install` needed.

___


## Installation

**1. Configure in Hermes:**

```yaml
mcp_servers:
  devdiag:
    command: "python3"
    args: ["~/Documents/Jerrys-agent-skills/mcp-servers/dev-diagnostics/server.py"]
    timeout: 180
    connect_timeout: 30
```

**2. Restart Hermes Agent.**

Tools appear as:
- `mcp_devdiag_run_diagnostics`
- `mcp_devdiag_parse_output`
- `mcp_devdiag_get_summary`
- `mcp_devdiag_contamination_check`

___


## Usage Workflow

### Phase 0: Run diagnostics on a repo

```
Call mcp_devdiag_run_diagnostics with:
  repo_path: "/absolute/path/to/project"
  scanners: ["eslint", "tsc", "vitest"]
```

Returns structured issues + summary counts.

### Phase 1: Categorize by severity and auto-fixability

```
Call mcp_devdiag_get_summary with:
  issues: <issues array from Phase 0>
```

Returns:
```json
{
  "total": 617,
  "by_severity": {"error": 12, "warning": 605},
  "by_category": {"auto-fixable": 498, "formatting": 89, "semantic": 30},
  "by_tool": {"eslint": 617},
  "files_affected": 42,
  "most_affected_files": [{"file": "src/utils.ts", "count": 134}]
}
```

### Phase 2: Fix + contamination check

After applying fixes, re-run diagnostics and compare:

```
Call mcp_devdiag_contamination_check with:
  before: <issues array from first run>
  after: <issues array from second run>
```

Returns:
```json
{
  "new_errors_count": 0,
  "fixed_errors_count": 498,
  "clean": true
}
```

___


## Pairing with Skills

- **`lint-battalion`** — use `run_diagnostics` as Phase 0 input (instead of manual lint-battalion.py invocation).
- **`test-driven-development`** — use `run_diagnostics` with `"scanners": ["vitest"]` for automated test feedback.
- **`pre-deployment-gate`** — run `eslint + tsc + vitest` via one tool call for the gate check.

___


## Limitations

- **Scanner must be installed locally.** If `eslint` or `vitest` isn't in the repo's `node_modules`, the tool will return no issues.
- **Does not execute fixes.** This is read-only diagnostics, not an auto-fixer.
- **Large projects** may hit the 120s default timeout. Increase `timeout` in config for monorepos.
- **pytest** plain output fallback uses simple regex and may miss some structured failure data.

___


## Related Skills

- `lint-battalion` — consumes diagnostic output and orchestrates mass remediation.
- `pre-deployment-gate` — uses pass/fail thresholds on diagnostics.
- `simulate-instrumentation` — can inject diagnostics collection into CI pipelines.
