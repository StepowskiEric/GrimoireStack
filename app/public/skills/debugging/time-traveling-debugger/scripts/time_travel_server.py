#!/usr/bin/env python3
"""MCP server for Time-Traveling Debugger — trace_and_compare tool over stdio JSON-RPC."""

import json
import os
import subprocess
import sys
import tempfile
import textwrap


MCP_RESPONSE = "Content-Type: application/json"


def log(msg: str) -> None:
    """Write to stderr so we don't pollute the JSON-RPC stdout stream."""
    print(msg, file=sys.stderr)


def send_response(req_id, result=None, error=None):
    """Send a JSON-RPC response."""
    resp = {"jsonrpc": "2.0", "id": req_id}
    if error:
        resp["error"] = {"code": error[0], "message": error[1]}
        if len(error) > 2:
            resp["error"]["data"] = error[2]
    else:
        resp["result"] = result
    sys.stdout.write(json.dumps(resp) + "\n")
    sys.stdout.flush()


def send_event(method, params):
    """Send a JSON-RPC notification."""
    event = {"jsonrpc": "2.0", "method": method, "params": params}
    sys.stdout.write(json.dumps(event) + "\n")
    sys.stdout.flush()


def handle_trace_and_compare(params, req_id):
    """Record a forward trace and immediately analyze divergence."""
    file_path = params.get("file", "")
    args_str = params.get("args", "")
    expected = params.get("expected", "")
    max_steps = params.get("max_steps", 5000)
    max_locals_size = params.get("max_locals_size", 1024)

    if not file_path or not os.path.exists(file_path):
        send_response(req_id, error=(-32000, f"File not found: {file_path}"))
        return

    log(f"trace_and_compare: {file_path} (expected: {expected})")

    # Build tracer code
    tracer_code = textwrap.dedent(f"""\
        import sys
        import json

        _trace_events = []
        _trace_step_count = 0
        _trace_stop_flag = False
        _trace_max_steps = {max_steps}
        _trace_max_locals_size = {max_locals_size}

        def _trace(frame, event, arg):
            global _trace_step_count, _trace_stop_flag
            if _trace_stop_flag:
                return None
            _trace_step_count += 1
            if _trace_step_count > _trace_max_steps:
                _trace_stop_flag = True
                return None
            locals_snapshot = {{}}
            for k, v in frame.f_locals.items():
                try:
                    val_str = repr(v)
                    if len(val_str) > _trace_max_locals_size:
                        val_str = val_str[:_trace_max_locals_size] + "..."
                    locals_snapshot[k] = val_str
                except Exception:
                    locals_snapshot[k] = "<unrepresentable>"
            entry = {{
                "step": _trace_step_count,
                "line": frame.f_lineno,
                "function": frame.f_code.co_name,
                "locals": locals_snapshot,
                "event": event,
            }}
            if event == "exception" and arg is not None:
                try:
                    exc_type, exc_value, _ = arg
                    entry["exception"] = f"{{exc_type.__name__}}: {{exc_value}}"
                except Exception:
                    entry["exception"] = str(arg)
            _trace_events.append(entry)
            return _trace

        sys.settrace(_trace)

        import runpy
        try:
            runpy.run_path({json.dumps(os.path.abspath(file_path))}, run_name="__main__")
        except SystemExit:
            pass
        except BaseException:
            import traceback
            traceback.print_exc()

        # Output trace as JSONL prefixed with TRACE:
        for entry in _trace_events:
            print("TRACE:" + json.dumps(entry, separators=(",", ":")))
    """)

    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as f:
        f.write(tracer_code)
        tracer_path = f.name

    try:
        cmd = [sys.executable, tracer_path] + (args_str.split() if args_str else [])
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        # Parse trace
        trace_lines = []
        stderr_lines = []
        for line in result.stdout.splitlines():
            if line.startswith("TRACE:"):
                trace_lines.append(line[6:])
            else:
                stderr_lines.append(line)
        if result.stderr:
            stderr_lines.extend(result.stderr.splitlines())

        # Find crash and divergence
        entries = [json.loads(l) for l in trace_lines]

        # Find exception
        crash_entry = None
        crash_idx = -1
        for i, entry in enumerate(entries):
            if entry.get("event") == "exception":
                crash_entry = entry
                crash_idx = i
                break

        if crash_entry is None and entries:
            # Use last entry for crash site
            crash_entry = entries[-1]
            crash_idx = len(entries) - 1

        # Walk backward for divergence
        anomaly = None
        if crash_entry and crash_idx > 0:
            for i in range(crash_idx - 1, max(0, crash_idx - 200), -1):
                entry = entries[i]
                locs = entry.get("locals", {})
                for var, val in locs.items():
                    if val == "None" and i > 0:
                        prev = entries[i - 1].get("locals", {}).get(var, "")
                        if prev and prev != "None":
                            anomaly = {
                                "step": entry["step"],
                                "line": entry["line"],
                                "function": entry.get("function", "?"),
                                "variable": var,
                                "previous_value": prev,
                                "new_value": val,
                            }
                            break
                if anomaly:
                    break

        result_data = {
            "status": "divergence_found" if anomaly else "no_divergence_found",
            "total_steps": len(entries),
            "crash_site": {
                "line": crash_entry["line"] if crash_entry else None,
                "function": crash_entry.get("function", "?") if crash_entry else "?",
                "error": crash_entry.get("exception", "unknown") if crash_entry else "none",
            } if crash_entry else None,
            "divergence_point": {
                "step": anomaly["step"],
                "line": anomaly["line"],
                "function": anomaly["function"],
                "variable": anomaly["variable"],
            } if anomaly else None,
            "suspected_cause": (
                f"Variable '{anomaly['variable']}' changed from "
                f"{anomaly['previous_value']} to None at line {anomaly['line']}"
            ) if anomaly else "No state divergence detected",
            "script_output": "\n".join(stderr_lines[-20:]),
        }

        send_response(req_id, result=result_data)

    except subprocess.TimeoutExpired:
        send_response(req_id, error=(-32001, "Trace timed out"))
    except Exception as e:
        send_response(req_id, error=(-32002, str(e)))
    finally:
        os.unlink(tracer_path)


def handle_trace_only(params, req_id):
    """Record a forward trace and return raw trace data."""
    params["max_steps"] = params.get("max_steps", 5000)
    # Reuse trace_and_compare logic but bypass analysis
    file_path = params.get("file", "")
    if not file_path or not os.path.exists(file_path):
        send_response(req_id, error=(-32000, f"File not found: {file_path}"))
        return

    handle_trace_and_compare(params, req_id)


def handle_rewind_only(params, req_id):
    """Analyze an existing trace file."""
    trace_path = params.get("trace", "trace.jsonl")
    crash_line = params.get("crash_line", 0)
    expected = params.get("expected", "")

    if not os.path.exists(trace_path):
        send_response(req_id, error=(-32000, f"Trace file not found: {trace_path}"))
        return

    entries = []
    with open(trace_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                entries.append(json.loads(line))

    if not entries:
        send_response(req_id, error=(-32000, "Empty trace file"))
        return

    # Find crash
    crash_entry = None
    crash_idx = -1
    for i, entry in enumerate(entries):
        if entry.get("event") == "exception":
            crash_entry = entry
            crash_idx = i
            break

    if crash_entry is None and crash_line > 0:
        for i, entry in enumerate(entries):
            if entry.get("line") == crash_line:
                crash_entry = entry
                crash_idx = i
                break

    if crash_entry is None and entries:
        crash_entry = entries[-1]
        crash_idx = len(entries) - 1

    # Backward scan
    anomaly = None
    if crash_entry and crash_idx > 0:
        for i in range(crash_idx - 1, max(0, crash_idx - 200), -1):
            entry = entries[i]
            locs = entry.get("locals", {})
            for var, val in locs.items():
                if val == "None" and i > 0:
                    prev = entries[i - 1].get("locals", {}).get(var, "")
                    if prev and prev != "None":
                        anomaly = {
                            "step": entry["step"],
                            "line": entry["line"],
                            "function": entry.get("function", "?"),
                            "variable": var,
                        }
                        break
            if anomaly:
                break

    send_response(req_id, result={
        "status": "divergence_found" if anomaly else "no_divergence",
        "trace_steps": len(entries),
        "crash": {
            "step": crash_entry["step"] if crash_entry else None,
            "line": crash_entry["line"] if crash_entry else None,
            "error": crash_entry.get("exception", "?") if crash_entry else "?",
        },
        "divergence": anomaly,
    })


def main():
    log("Time-Travel MCP Server starting (stdio)...")

    # Send server info
    send_event("initialized", {"server": "time-travel-debugger", "version": "1.0.0"})

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue

        method = msg.get("method", "")
        params = msg.get("params", {})
        req_id = msg.get("id")

        if method == "initialize":
            send_response(req_id, result={
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {
                        "trace_and_compare": {
                            "description": "Trace a Python script and analyze backward from crash",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "file": {"type": "string", "description": "Path to Python script"},
                                    "args": {"type": "string", "description": "Space-separated arguments"},
                                    "expected": {"type": "string", "description": "Description of expected behavior"},
                                    "max_steps": {"type": "integer", "description": "Max trace steps"},
                                },
                                "required": ["file"],
                            },
                        },
                        "trace_only": {
                            "description": "Record a forward trace without analysis",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "file": {"type": "string"},
                                    "args": {"type": "string"},
                                    "max_steps": {"type": "integer"},
                                },
                                "required": ["file"],
                            },
                        },
                        "rewind_only": {
                            "description": "Analyze an existing trace file",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "trace": {"type": "string", "description": "Path to trace.jsonl"},
                                    "crash_line": {"type": "integer"},
                                    "expected": {"type": "string"},
                                },
                                "required": ["trace"],
                            },
                        },
                    },
                },
            })
        elif method == "tools/list":
            send_response(req_id, result={
                "tools": [
                    {
                        "name": "trace_and_compare",
                        "description": "Trace a Python script forward and analyze backward from crash",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "file": {"type": "string", "description": "Path to Python script"},
                                "args": {"type": "string", "description": "Space-separated arguments"},
                                "expected": {"type": "string", "description": "Description of expected behavior"},
                                "max_steps": {"type": "integer", "description": "Max trace steps", "default": 5000},
                            },
                            "required": ["file"],
                        },
                    },
                    {
                        "name": "trace_only",
                        "description": "Record a forward execution trace",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "file": {"type": "string"},
                                "args": {"type": "string"},
                                "max_steps": {"type": "integer", "default": 5000},
                            },
                            "required": ["file"],
                        },
                    },
                    {
                        "name": "rewind_only",
                        "description": "Analyze existing trace from crash point",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "trace": {"type": "string"},
                                "crash_line": {"type": "integer"},
                                "expected": {"type": "string"},
                            },
                            "required": ["trace"],
                        },
                    },
                ],
            })
        elif method == "tools/call":
            tool_name = params.get("name", "")
            tool_args = params.get("arguments", {})

            if tool_name == "trace_and_compare":
                handle_trace_and_compare(tool_args, req_id)
            elif tool_name == "trace_only":
                handle_trace_only(tool_args, req_id)
            elif tool_name == "rewind_only":
                handle_rewind_only(tool_args, req_id)
            else:
                send_response(req_id, error=(-32601, f"Unknown tool: {tool_name}"))
        elif method == "notifications/initialized":
            pass  # no response needed
        else:
            send_response(req_id, error=(-32601, f"Method not found: {method}"))


if __name__ == "__main__":
    main()
