#!/usr/bin/env python3
"""time-traveling-debugger companion script — deterministic trace + reverse replay."""

import argparse
import copy
import json
import os
import subprocess
import sys
import tempfile
import textwrap
import types
from datetime import datetime, timezone


TRACE_FILE = "trace.jsonl"


# ── tracing engine ───────────────────────────────────────────────────────
# We use a global list to collect trace events from sys.settrace
_trace_events: list[dict] = []
_trace_max_steps: int = 10000
_trace_max_locals_size: int = 1024
_trace_step_count: int = 0
_trace_stop_flag: bool = False


def _make_trace_function(script_path: str) -> types.FunctionType:
    """Create a trace function bound to the script being traced."""

    def _trace(frame: types.FrameType, event: str, arg: object) -> object:
        global _trace_step_count, _trace_stop_flag

        if _trace_stop_flag:
            return None

        _trace_step_count += 1
        if _trace_step_count > _trace_max_steps:
            _trace_stop_flag = True
            return None

        # Get local variables, truncating large values
        locals_snapshot = {}
        for k, v in frame.f_locals.items():
            try:
                val_str = repr(v)
                if len(val_str) > _trace_max_locals_size:
                    val_str = val_str[:_trace_max_locals_size] + "..."
                locals_snapshot[k] = val_str
            except Exception:
                locals_snapshot[k] = "<unrepresentable>"

        entry = {
            "step": _trace_step_count,
            "file": frame.f_code.co_filename,
            "line": frame.f_lineno,
            "function": frame.f_code.co_name,
            "locals": locals_snapshot,
            "event": event,
        }

        # For 'exception' events, capture the exception info
        if event == "exception" and arg is not None:
            try:
                exc_type, exc_value, _ = arg
                entry["exception"] = f"{exc_type.__name__}: {exc_value}"
            except Exception:
                entry["exception"] = str(arg)

        _trace_events.append(entry)
        return _trace

    return _trace


def cmd_trace(args: argparse.Namespace) -> None:
    """Record a forward execution trace using sys.settrace."""
    script = args.script
    script_args = args.args or ""
    output = args.output or TRACE_FILE
    max_steps = args.max_steps or 10000
    max_locals = args.max_locals_size or 1024

    if not os.path.exists(script):
        print(f"  ! Script not found: {script}", file=sys.stderr)
        sys.exit(1)

    global _trace_events, _trace_max_steps, _trace_max_locals_size, _trace_step_count, _trace_stop_flag
    _trace_events = []
    _trace_max_steps = max_steps
    _trace_max_locals_size = max_locals
    _trace_step_count = 0
    _trace_stop_flag = False

    # We use a wrapper approach: run the script in a subprocess with
    # a tracer module injected via PYTHONSTARTUP or by wrapping the script.

    # Build a tracer module that will be prepended to the script
    tracer_code = textwrap.dedent(f"""\
        import sys
        import json

        _trace_events = []
        _trace_step_count = 0
        _trace_stop_flag = False
        _trace_max_steps = {max_steps}
        _trace_max_locals_size = {max_locals}

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
                "file": frame.f_code.co_filename,
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

        # Now run the original script
        import runpy
        try:
            runpy.run_path({json.dumps(os.path.abspath(script))}, run_name="__main__")
        except SystemExit:
            pass
        except BaseException as e:
            import traceback
            traceback.print_exc()

        # Write trace to stdout as JSONL, prefixed with TRACE:
        for entry in _trace_events:
            print("TRACE:" + json.dumps(entry, sort_keys=True))
    """)

    print(f"  Tracing {script}" + (f" with args: {script_args}" if script_args else "") + " ...")

    # Write tracer to temp file
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".py", delete=False, encoding="utf-8"
    ) as f:
        f.write(tracer_code)
        tracer_path = f.name

    try:
        # Run tracer which imports and runs the original script
        cmd = [sys.executable, tracer_path] + (script_args.split() if script_args else [])
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=args.timeout or 30,
        )

        # Parse TRACE: lines from stdout
        trace_lines = []
        stderr_lines = []
        for line in result.stdout.splitlines():
            if line.startswith("TRACE:"):
                trace_lines.append(line[6:])  # strip TRACE: prefix
            else:
                stderr_lines.append(line)

        if result.stderr:
            for line in result.stderr.splitlines():
                stderr_lines.append(line)

        # Write trace to output file
        with open(output, "w", encoding="utf-8") as f:
            for line in trace_lines:
                f.write(line + "\n")

        step_count = len(trace_lines)
        print(f"  ✓ Trace recorded: {step_count} steps → {output}")

        if stderr_lines:
            print(f"\n  Script output (stderr/stdout non-trace):")
            for line in stderr_lines[-10:]:
                print(f"    {line}")

        # Check for exception events
        exception_steps = [json.loads(l) for l in trace_lines if json.loads(l).get("event") == "exception"]
        if exception_steps:
            last_exc = exception_steps[-1]
            print(f"\n  ⚠ Exception detected at step {last_exc['step']}, line {last_exc['line']}:")
            print(f"    {last_exc.get('exception', 'unknown')}")

    except subprocess.TimeoutExpired:
        print(f"  ! Trace timed out after {args.timeout or 30}s", file=sys.stderr)
        # Save partial trace
        if _trace_events:
            with open(output, "w", encoding="utf-8") as f:
                for entry in _trace_events:
                    f.write(json.dumps(entry, sort_keys=True) + "\n")
            print(f"  Partial trace ({len(_trace_events)} steps) saved to {output}")
        sys.exit(1)
    except Exception as e:
        print(f"  ! Trace failed: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        os.unlink(tracer_path)


# ── rewind engine ────────────────────────────────────────────────────────


def _load_trace(path: str) -> list[dict]:
    """Load trace from JSONL file."""
    if not os.path.exists(path):
        print(f"  ! Trace file not found: {path}", file=sys.stderr)
        sys.exit(1)
    entries = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                entries.append(json.loads(line))
    return entries


def cmd_rewind(args: argparse.Namespace) -> None:
    """Walk a trace backward from the crash line to find state divergence."""
    trace_path = args.trace or TRACE_FILE
    crash_line = args.crash_line
    expected = args.expected or ""

    entries = _load_trace(trace_path)

    if not entries:
        print("  ! Empty trace file", file=sys.stderr)
        sys.exit(1)

    print(f"  Rewinding trace ({len(entries)} steps) from line {crash_line} ...")
    print(f"  Expected: {expected}")

    # Find the crash event
    crash_entry = None
    crash_idx = -1

    # Look for exception events first
    for i, entry in enumerate(entries):
        if entry.get("event") == "exception" and entry.get("file", "").endswith(
            os.path.basename(args.script) if hasattr(args, "script") and args.script else ""
        ):
            crash_entry = entry
            crash_idx = i
            break

    # Fall back to line number match
    if crash_entry is None:
        for i, entry in enumerate(entries):
            if entry.get("line") == crash_line:
                crash_entry = entry
                crash_idx = i
                break

    if crash_entry is None:
        # Use last entry as crash site
        crash_entry = entries[-1]
        crash_idx = len(entries) - 1

    print(f"  Crash site: step {crash_entry['step']}, line {crash_entry['line']}, "
          f"function {crash_entry.get('function', '?')}")
    if crash_entry.get("exception"):
        print(f"  Error: {crash_entry['exception']}")

    # Walk backward looking for divergence
    # Divergence = state that contradicts "expected" or anomalous type changes
    anomaly_found = None

    # Scan for type/value anomalies
    for i in range(crash_idx - 1, max(0, crash_idx - 200), -1):
        entry = entries[i]
        locals_dict = entry.get("locals", {})

        # Check for None values replacing non-None values
        for var_name, val_str in locals_dict.items():
            if val_str == "None" and i > 0:
                prev_entry = entries[i - 1]
                prev_val = prev_entry.get("locals", {}).get(var_name, "")
                if prev_val and prev_val != "None":
                    anomaly_found = {
                        "step": entry["step"],
                        "line": entry["line"],
                        "function": entry.get("function", "?"),
                        "variable": var_name,
                        "previous_value": prev_val,
                        "new_value": val_str,
                        "cause": f"Variable '{var_name}' changed from {prev_val} to None at line {entry['line']}",
                    }
                    break

        if anomaly_found:
            break

    # If no None-anomaly, look for any type change
    if not anomaly_found:
        for i in range(crash_idx - 1, max(0, crash_idx - 200), -1):
            entry = entries[i]
            locals_dict = entry.get("locals", {})

            for var_name, val_str in locals_dict.items():
                if "'" in val_str or "[" in val_str or "{" in val_str:
                    # Has a type indicator — check previous step
                    if i > 0:
                        prev_val = entries[i - 1].get("locals", {}).get(var_name, "")
                        if prev_val and prev_val != val_str:
                            # Check if type changed (not just value)
                            if type(prev_val) != type(val_str):
                                anomaly_found = {
                                    "step": entry["step"],
                                    "line": entry["line"],
                                    "function": entry.get("function", "?"),
                                    "variable": var_name,
                                    "previous_value": prev_val,
                                    "new_value": val_str,
                                    "cause": f"Variable '{var_name}' changed type at line {entry['line']}",
                                }
                                break

            if anomaly_found:
                break

    # Build propagation chain
    chain = []
    if anomaly_found:
        # From divergence point to crash
        for i in range(anomaly_found["step"] - 1, crash_idx):
            e = entries[i]
            chain.append({
                "step": e["step"],
                "line": e["line"],
                "function": e.get("function", "?"),
                "event": e.get("event", "line"),
            })
            if len(chain) >= 20:
                chain.append({"step": "...", "line": "...", "function": "...", "event": "..."})
                break

    # Output
    output = args.output
    if output:
        result = {
            "trace_file": trace_path,
            "total_steps": len(entries),
            "crash_site": {
                "step": crash_entry["step"],
                "line": crash_entry["line"],
                "function": crash_entry.get("function", "?"),
                "error": crash_entry.get("exception", "unknown"),
                "locals": crash_entry.get("locals", {}),
            },
            "divergence_point": {
                "step": anomaly_found["step"] if anomaly_found else None,
                "line": anomaly_found["line"] if anomaly_found else None,
                "function": anomaly_found["function"] if anomaly_found else "?",
                "variable": anomaly_found["variable"] if anomaly_found else None,
            } if anomaly_found else None,
            "propagation_chain": chain if chain else [],
            "suspected_cause": anomaly_found["cause"] if anomaly_found else "No divergence detected",
        }
        with open(output, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
        print(f"\n  ✓ Analysis saved to {output}")
    else:
        result = {}

    # Print summary
    print("")
    print("  ── Analysis ──")
    if anomaly_found:
        print(f"  ⚠ Divergence found:")
        print(f"     At step {anomaly_found['step']}, line {anomaly_found['line']}")
        print(f"     Function: {anomaly_found['function']}")
        print(f"     Variable: {anomaly_found['variable']}")
        print(f"     Previous: {anomaly_found['previous_value']}")
        print(f"     New:      {anomaly_found['new_value']}")
        print(f"  Root cause: {anomaly_found['cause']}")
    else:
        print("  ✓ No state divergence detected in trace.")
        print("  The crash may be from a C extension, threading, or missing trace data.")

    print(f"\n  Propagation: {len(chain)} steps from divergence to crash")


# ── diagnose (trace + rewind) ────────────────────────────────────────────


def cmd_diagnose(args: argparse.Namespace) -> None:
    """Trace a script and immediately analyze divergence."""
    # Generate temp trace filename
    trace_file = f"trace_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jsonl"

    # Build mock args for cmd_trace
    trace_args = argparse.Namespace(
        script=args.script,
        args=args.args or "",
        output=trace_file,
        max_steps=args.max_steps or 10000,
        max_locals_size=args.max_locals_size or 1024,
        timeout=args.timeout or 30,
    )

    print("╔══════════════════════════════════════════╗")
    print("║  Phase 1: Forward Trace                 ║")
    print("╚══════════════════════════════════════════╝")
    cmd_trace(trace_args)

    print("")
    print("╔══════════════════════════════════════════╗")
    print("║  Phase 2: Reverse Rewind                ║")
    print("╚══════════════════════════════════════════╝")

    # Build args for cmd_rewind
    rewind_args = argparse.Namespace(
        trace=trace_file,
        crash_line=args.crash_line or 0,
        expected=args.expected or "",
        script=args.script,
        output=args.output or "divergence.json",
    )
    cmd_rewind(rewind_args)

    print("")
    print("  ✓ Complete. Trace: {}, Analysis: {}".format(
        trace_file, args.output or "divergence.json"
    ))


# ── inspect ──────────────────────────────────────────────────────────────


def cmd_inspect(args: argparse.Namespace) -> None:
    """Show trace summary and optionally scan for anomalies."""
    trace_path = args.trace or TRACE_FILE
    entries = _load_trace(trace_path)

    if not entries:
        print("  Empty trace file.")
        return

    print(f"  Trace Summary")
    print(f"  ─────────────")
    print(f"  Total steps: {len(entries)}")
    print(f"  Files: {len(set(e.get('file', '') for e in entries))}")
    print(f"  Functions: {len(set(e.get('function', '') for e in entries))}")

    # Count events
    events = {}
    for e in entries:
        ev = e.get("event", "line")
        events[ev] = events.get(ev, 0) + 1
    print(f"  Events: {events}")

    # First and last steps
    print(f"  First: step {entries[0]['step']}, line {entries[0]['line']}, "
          f"function {entries[0].get('function', '?')}")
    print(f"  Last:  step {entries[-1]['step']}, line {entries[-1]['line']}, "
          f"function {entries[-1].get('function', '?')}")

    if entries[-1].get("exception"):
        print(f"  Exception: {entries[-1]['exception']}")

    # Anomaly scan
    if args.anomalies:
        print("")
        print("  Anomaly Scan")
        print("  ─────────────")

        anomalies = []
        for i in range(1, len(entries)):
            entry = entries[i]
            prev = entries[i - 1]
            locals_now = entry.get("locals", {})
            locals_prev = prev.get("locals", {})

            for var_name, val_str in locals_now.items():
                if val_str == "None" and var_name in locals_prev:
                    prev_val = locals_prev[var_name]
                    if prev_val and prev_val != "None":
                        anomalies.append({
                            "step": entry["step"],
                            "line": entry["line"],
                            "var": var_name,
                            "before": prev_val,
                            "after": val_str,
                        })

        if anomalies:
            print(f"  Found {len(anomalies)} potential divergence(s):")
            for a in anomalies[:10]:
                print(f"    [{a['step']}] line {a['line']}: {a['var']} → None")
                print(f"           was: {a['before'][:80]}")
        else:
            print("  No clear None-anomalies detected.")


# ── diff ─────────────────────────────────────────────────────────────────


def cmd_diff(args: argparse.Namespace) -> None:
    """Compare two traces and find the first divergence."""
    passing = _load_trace(args.passing)
    failing = _load_trace(args.failing)

    print(f"  Comparing traces...")
    print(f"    Passing: {len(passing)} steps")
    print(f"    Failing: {len(failing)} steps")

    min_steps = min(len(passing), len(failing))
    for i in range(min_steps):
        p = passing[i]
        f = failing[i]

        # Check if same line / function
        if p.get("line") != f.get("line") or p.get("function") != f.get("function"):
            print(f"\n  ⚠ First divergence at step {i + 1}:")
            print(f"    Passing: line {p.get('line', '?')}, function {p.get('function', '?')}")
            print(f"    Failing: line {f.get('line', '?')}, function {f.get('function', '?')}")
            print(f"    Passing locals: {json.dumps(p.get('locals', {}), indent=6)[:200]}")
            print(f"    Failing locals: {json.dumps(f.get('locals', {}), indent=6)[:200]}")

            # Save to output
            if args.output:
                result = {
                    "divergence_step": i + 1,
                    "passing": p,
                    "failing": f,
                }
                with open(args.output, "w", encoding="utf-8") as of:
                    json.dump(result, of, indent=2)
                print(f"\n  ✓ Saved to {args.output}")
            return

    print("  ✓ Traces are identical up to step {min_steps}.")


# ── main ─────────────────────────────────────────────────────────────────


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Time-Traveling Debugger — deterministic trace + reverse replay."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # trace
    p_trace = sub.add_parser("trace", help="Record a forward execution trace")
    p_trace.add_argument("script", help="Python script to trace")
    p_trace.add_argument("--args", default="", help="Arguments for the script")
    p_trace.add_argument("--output", default=TRACE_FILE, help="Output trace file")
    p_trace.add_argument("--max-steps", type=int, default=10000, help="Max trace steps")
    p_trace.add_argument("--max-locals-size", type=int, default=1024, help="Max size per local repr")
    p_trace.add_argument("--timeout", type=int, default=30, help="Seconds before timeout")

    # rewind
    p_rewind = sub.add_parser("rewind", help="Analyze trace backward from crash")
    p_rewind.add_argument("--trace", default=TRACE_FILE, help="Trace file to analyze")
    p_rewind.add_argument("--crash-line", type=int, required=True, help="Line number where crash occurred")
    p_rewind.add_argument("--expected", default="", help="Description of expected behavior")
    p_rewind.add_argument("--output", default="", help="Output file for analysis (JSON)")
    p_rewind.add_argument("--script", default="", help="Script path (for filtering)")

    # diagnose
    p_diag = sub.add_parser("diagnose", help="Trace and rewind in one command")
    p_diag.add_argument("script", help="Python script to diagnose")
    p_diag.add_argument("--args", default="", help="Arguments for the script")
    p_diag.add_argument("--crash-line", type=int, default=0, help="Expected crash line")
    p_diag.add_argument("--expected", default="", help="Description of expected behavior")
    p_diag.add_argument("--output", default="", help="Output analysis file")
    p_diag.add_argument("--max-steps", type=int, default=10000, help="Max trace steps")
    p_diag.add_argument("--max-locals-size", type=int, default=1024, help="Max size per local repr")
    p_diag.add_argument("--timeout", type=int, default=30, help="Seconds before timeout")

    # inspect
    p_inspect = sub.add_parser("inspect", help="Show trace summary and anomalies")
    p_inspect.add_argument("trace", nargs="?", default=TRACE_FILE, help="Trace file to inspect")
    p_inspect.add_argument("--anomalies", action="store_true", help="Scan for value anomalies")

    # diff
    p_diff = sub.add_parser("diff", help="Compare two traces for first divergence")
    p_diff.add_argument("passing", help="Passing (good) trace file")
    p_diff.add_argument("failing", help="Failing (buggy) trace file")
    p_diff.add_argument("--output", default="", help="Output file for divergence (JSON)")

    args = parser.parse_args()

    commands = {
        "trace": cmd_trace,
        "rewind": cmd_rewind,
        "diagnose": cmd_diagnose,
        "inspect": cmd_inspect,
        "diff": cmd_diff,
    }

    fn = commands.get(args.command)
    if fn:
        fn(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
