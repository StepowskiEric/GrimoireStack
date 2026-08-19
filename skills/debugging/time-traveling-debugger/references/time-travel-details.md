# Time-Traveling Debugger — Format, CLI & Failure Modes

## trace.jsonl format

Each line is one traced step:

```jsonl
{"step": 1, "file": "buggy_script.py", "line": 1, "function": "<module>", "locals": {"__name__": "__main__"}, "event": "call"}
{"step": 2, "file": "buggy_script.py", "line": 5, "function": "process_data", "locals": {"data": {"id": 1, "name": "test"}, "threshold": 0.5}, "event": "call"}
{"step": 3, "file": "buggy_script.py", "line": 8, "function": "process_data", "locals": {"data": {"id": 1, "name": "test"}, "threshold": 0.5, "result": null}, "event": "line"}
{"step": 4, "file": "buggy_script.py", "line": 42, "function": "<module>", "locals": {"user": null}, "event": "exception"}
```

The `event` field is one of: `call`, `line`, `return`, `exception`.

## CLI reference

```bash
# Record a forward trace
python time_travel.py trace myscript.py --args "arg1 arg2" --output trace.jsonl

# Replay backward from the crash to find state divergence
python time_travel.py rewind trace.jsonl --crash-line 42 \
  --expected "user.id should be int, got NoneType" --output divergence.json

# Trace and rewind in one command
python time_travel.py diagnose myscript.py \
  --args "arg1 arg2" --expected "result should not be None"

# Show trace summary / anomalies
python time_travel.py inspect trace.jsonl [--anomalies]

# Compare two traces (passing vs failing run)
python time_travel.py diff passing.jsonl failing.jsonl
```

Options: `--max-steps 10000` caps trace size; `--max-locals-size 1024` truncates large values.

## MCP server

`scripts/time_travel_server.py` provides `trace_and_compare` as a tool (stdio JSON-RPC). Configure in Hermes `config.yaml`:

```yaml
mcp_servers:
  time-travel:
    command: python3
    args: ["/path/to/time_travel_server.py"]
```

### trace_and_compare

```json
{
  "file": "/path/to/script.py",
  "args": "test_input_1",
  "expected": "result should be a dict with key 'status'",
  "max_steps": 5000
}
```

Output:

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

Also `trace_only` (record without analysis) and `rewind_only` (analyze an existing trace).

## Important properties

- **Trace is a snapshot, not a video** — variable values are captured at each line boundary; intra-expression mutations are captured at line-tracing granularity.
- **Side effects are real** — `sys.settrace` can change timing but not semantics; the trace is faithful to what actually executed.
- **Non-determinism** — network, randomness, threading: one trace captures one path; run multiple.

## Failure modes

- **Tracing overhead** — `sys.settrace` slows execution ~10-100x; fine for sub-second scripts, unacceptable for long-running processes
- **Large local state** — DataFrames and huge lists bloat the trace; use `--max-locals-size`
- **Recursion** — deep recursion generates long traces; set `--max-steps`
- **C extensions** — only Python-level calls are traced; C function calls are invisible
- **Generators** — generator frames differ from regular frames; yields capture as `line` events
- **Threading** — only the main thread is traced by default; multi-threaded debugging needs `settrace` per thread

## Research basis

- Reverse-execution debugging (UndoDB, rr, GDB reverse-step): deterministic recording + replay shifts debugging from guess-and-check to walking backward
- Delta debugging (Zeller, 1999): the minimal difference between passing and failing execution is the root cause — applied to trace data here
- `sys.settrace` (Python stdlib): per-line call tracing, zero-dependency and deterministic

## See also

- `simulate-instrumentation` — auto-inserts print/logging (lighter for known-code bugs)
- `log-trace-correlation` — maps error logs and stack traces to source (runtime log-based)
- `iterative-patch-repair` — patch → test → refine (complementary after divergence is found)
- `specter` — competing hypotheses with structural code location before tracing (narrow where to trace)
