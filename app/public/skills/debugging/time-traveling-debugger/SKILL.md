---
source: "jerry-skills"
name: time-traveling-debugger
category: debugging
description: When a bug occurs, record a deterministic execution trace forward, then replay it in reverse from the crash point to find the exact line where state first diverged. Spawns 'past self' and 'future self' that meet at the divergence.
version: 1.0.0
priority: high
tags: [debugging, time-travel, reverse-execution, trace, state-divergence, bytecode]
...



---

# ⚡ The Time-Traveling Debugger

## Overview

Most bugs are introduced not at the crash site, but **earlier** — a variable gets a wrong value, propagates through several functions, and only surfaces as an error far downstream. Traditional debugging follows the trail *forward* from guess to crash. This skill goes *backward*.

**Core idea:** When a bug occurs, the agent spawns two sub-agents:

- **Past Self** — runs the code forward *with full tracing* (`sys.settrace`) from the entry point, recording every line executed and the local variable state at each step.
- **Future Self** — starts at the crash/error site and walks the trace *backward*, looking for the last point where all state was consistent, or equivalently, the first point where state diverges from what's expected.

They **meet** at the line where state diverged — that's the root cause.

### Research Basis

- **Reverse-execution debugging** (e.g., UndoDB, rr, GDB reverse-step): deterministic recording + replay is a proven technique that shifts debugging from "guess and check" to "walk backward from the crash."
- **Delta debugging** (Zeller, 1999): The minimal difference between a passing and failing execution is the root cause. This skill applies that principle to *trace data* rather than program inputs.
- **`sys.settrace`** (Python stdlib): Per-line call tracing is zero-dependency and deterministic. Each call frame + line number + local state snapshot forms a complete execution trace.

## When to Use

- A runtime error or crash with a stack trace — and the error message doesn't immediately suggest the root cause
- A value that is clearly wrong (None instead of a dict, empty instead of populated) but you don't know where it got set
- A bug that "fixes itself" when you add print statements (Heisenbug) — the trace approach is non-invasive
- Reproducible crashes where the trace length is manageable (<10K lines executed)

## When NOT to Use

- Trivial bugs where the error message points directly to the problem
- Performance-critical tracing on loops exceeding 100K iterations (trace file blows up)
- Non-deterministic bugs (race conditions, network timing, random seeds) — traces capture one execution path, not all possibilities
- Production environments where `sys.settrace` is too slow (use structured logging instead)

## Companion Script

The companion Python script (`time_travel.py`) implements the full forward-trace + reverse-analysis pipeline.

```bash
# Record a forward trace of a Python script
python time_travel.py trace myscript.py --args "arg1 arg2" --output trace.jsonl

# Replay backward from the crash to find state divergence
python time_travel.py rewind trace.jsonl --crash-line 42 \
  --expected "user.id should be int, got NoneType" \
  --output divergence.json

# Trace and rewind in one command
python time_travel.py diagnose myscript.py \
  --args "arg1 arg2" --expected "result should not be None"

# Show trace summary
python time_travel.py inspect trace.jsonl

# Compare two traces (passing vs failing run)
python time_travel.py diff passing.jsonl failing.jsonl
```

Pure Python stdlib — no dependencies.

## MCP Server

An MCP server (`time_travel_server.py`) provides `trace_and_compare` as a tool for agent integration.

**Tool:** `trace_and_compare`
- **file** (string): Path to Python script
- **args** (string): Space-separated arguments for the script
- **expected** (string): Description of expected behavior at crash point
- **returns:** Divergence analysis with step, variable, before/after values, and suspected root cause

Configure in Hermes `config.yaml`:
```yaml
mcp_servers:
  time-travel:
    command: python3
    args: ["/path/to/time_travel_server.py"]
```

## Workflow

### Step 1: Reproduce and Capture

Run the buggy script with the trace script to capture a forward execution trace.

```bash
python time_travel.py trace buggy_script.py --args "test_input" --output trace.jsonl
```

The script:
1. Adds tracing via `sys.settrace` before execution
2. Runs the target script in a subprocess with tracing enabled
3. Records every line executed: file, line number, function name, local variable snapshot
4. Captures stderr for error messages
5. Saves the trace as JSONL

### Step 2: Spawn Past Self and Future Self

**Past Self** inspects the trace forward — looking for anomalies in variable values as they were set:

```bash
python time_travel.py inspect trace.jsonl --anomalies
```

This highlights variables that changed to unexpected types (e.g., `user_id` went from `int` → `None`).

**Future Self** starts at the crash line and walks backward:

```bash
python time_travel.py rewind trace.jsonl --crash-line 42 \
  --expected "user should not be None" --output divergence.json
```

### Step 3: They Meet at Divergence

The `rewind` command outputs:
- **crash_site**: The line where the error occurred (e.g., `line 42: user.name` → `AttributeError: 'NoneType'`)
- **divergence_point**: The line where state first went wrong (e.g., `line 18: user = fetch_user(id)` returned `None`)
- **chain**: The propagation path from divergence to crash
- **suspected_cause**: What went wrong and why

### Step 4: Fix and Verify

Read `divergence.json`, understand the root cause, write the fix, then re-run:

```bash
python time_travel.py trace buggy_script.py --args "test_input" --output verify_trace.jsonl
python time_travel.py inspect verify_trace.jsonl --anomalies
# Confirm no anomalies
```

## trace.jsonl Format

Each line is one traced step:

```jsonl
{"step": 1, "file": "buggy_script.py", "line": 1, "function": "<module>", "locals": {"__name__": "__main__"}, "event": "call"}
{"step": 2, "file": "buggy_script.py", "line": 5, "function": "process_data", "locals": {"data": {"id": 1, "name": "test"}, "threshold": 0.5}, "event": "call"}
{"step": 3, "file": "buggy_script.py", "line": 8, "function": "process_data", "locals": {"data": {"id": 1, "name": "test"}, "threshold": 0.5, "result": null}, "event": "line"}
{"step": 4, "file": "buggy_script.py", "line": 42, "function": "<module>", "locals": {"user": null}, "event": "exception"}
```

The `event` field is one of: `call`, `line`, `return`, `exception`.

## Important Rules

- **Trace is a snapshot, not a video** — variable values are captured at each line boundary. Intra-expression mutations (e.g., `x = a() + b()` where `a()` succeeds and `b()` fails) are captured at the granularity of Python's line tracing.
- **Side effects are real** — running code under `sys.settrace` can change timing but NOT semantics. The trace is faithful to what actually executed.
- **Large traces** — for long-running scripts, use `--max-steps 10000` to cap the trace size.
- **Non-determinism** — if the bug involves network, randomness, or threading, the trace captures one path. You may need multiple runs.

## Pitfalls

- **sys.settrace overhead**: Tracing slows execution ~10-100x. This is fine for scripts that run in <1s but unacceptable for long-running processes.
- **Large local state**: Functions with huge local variables (e.g., DataFrames, large lists) will bloat the trace file. Use `--max-locals-size 1024` to truncate large values.
- **Recursion**: Deep recursion generates long traces. Set `--max-steps` appropriately.
- **C extensions**: `sys.settrace` only traces Python-level calls. C extension function calls are invisible.
- **Generators**: Generator frames behave differently from regular frames. The trace captures `yield` events as `line` events at the yield point.
- **Threading**: Only the main thread is traced by default. Multi-threaded debugging needs `settrace` per thread.

## MCP Server Details

The MCP server provides tools over stdio JSON-RPC:

### `trace_and_compare`
Record a forward trace and immediately analyze divergence in one call.

**Input:**
```json
{
  "file": "/path/to/script.py",
  "args": "test_input_1",
  "expected": "result should be a dict with key 'status'",
  "max_steps": 5000
}
```

**Output:**
```json
{
  "status": "divergence_found",
  "crash_site": {"line": 42, "frame": "<module>", "error": "AttributeError: 'NoneType' object has no attribute 'name'"},
  "divergence_point": {"line": 18, "frame": "fetch_user", "variable": "user"},
  "propagation_chain": [
    {"step": 18, "variable": "user", "value": "None", "action": "set"},
    {"step": 25, "variable": "user.name", "action": "accessed", "result": "AttributeError"}
  ],
  "suspected_cause": "fetch_user() returned None because user_id was not found in database"
}
```

### `trace_only`
Record a forward trace without analysis — for manual inspection.

### `rewind_only`
Analyze an existing trace file from crash point backward.

## Companion Script Reference

### `trace`

```bash
python time_travel.py trace <script> [--args "args"] [--output trace.jsonl] [--max-steps 10000] [--max-locals-size 1024]
```

Records execution trace via `sys.settrace`.

### `rewind`

```bash
python time_travel.py rewind <trace.jsonl> --crash-line <N> --expected "<description>"
```

Walks trace backward from crash line, finds divergence point, outputs analysis.

### `diagnose`

```bash
python time_travel.py diagnose <script> [--args "args"] [--expected "description"]
```

Combines `trace` + `rewind` in one command.

### `inspect`

```bash
python time_travel.py inspect <trace.jsonl> [--anomalies]
```

Shows trace summary or anomaly scan.

### `diff`

```bash
python time_travel.py diff <passing.jsonl> <failing.jsonl>
```

Compares two traces to find the first step where they diverge.

## Usage Example

```
User: "This script crashes with 'NoneType has no attribute id' on line 42"

Agent (running this skill):
1. Reproduces the crash with tracing:
   python time_travel.py trace user_service.py --args "user_abc" --output trace.jsonl
2. Analyzes backward from crash:
   python time_travel.py rewind trace.jsonl --crash-line 42 --expected "user should be dict"
3. Divergence found at line 18:
   Variable 'user' set to None by fetch_user() when user_id not found
4. Fix: Add validation after fetch_user() call
5. Verifies: python time_travel.py trace user_service.py --args "user_abc" --output verify.jsonl
   → No anomalies
```

## See Also

- `simulate-instrumentation` — auto-inserts print/logging statements (lighter weight for known-code bugs)
- `log-trace-correlation` — maps error logs and stack traces to source (runtime log-based, not trace-based)
- `iterative-patch-repair` — loop of patch → test → refine (complementary after divergence is found)
- `specter` — generates competing hypotheses with structural code location before tracing (good for narrowing where to trace)
