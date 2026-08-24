---
source: "GrimoireStack"
name: time-traveling-debugger
category: debugging
description: "When a bug occurs, record a deterministic execution trace forward, then replay it in reverse from the crash point to find the exact line where state first diverged."
triggers:
  - runtime-error-no-obvious-cause
  - wrong-value-mystery
  - heisenbug
  - reproducible-crash
version: 1.0.0
priority: high
tags: [debugging, time-travel, reverse-execution, trace, state-divergence]
disable-model-invocation: true
---

# Time-Traveling Debugger

**Most bugs are introduced at the divergence, not the crash.** A variable gets a wrong value, propagates through several functions, and only surfaces as an error far downstream. Traditional debugging follows the trail forward from guess to crash; this skill goes backward — record a deterministic trace forward, then replay it in reverse from the crash point to find the exact line where state first diverged. The **Past Self** (forward, looking for anomalies) and **Future Self** (backward from the crash) meet at the divergence: that line is the root cause.

## When to Use
- Runtime error/crash whose message doesn't suggest the root cause
- Value clearly wrong (None instead of a dict) but unknown where it got set
- Heisenbug — the bug "fixes itself" when you add print statements (tracing is non-invasive)
- Reproducible crash with manageable trace length (<10K lines executed)

## The Move

### 1. Reproduce and capture
Run the buggy script under the trace script to capture a forward execution trace:

```bash
python scripts/time_travel.py trace buggy_script.py --args "test_input" --output trace.jsonl
```

Done when a trace file exists and the crash site (line, error type, message) is known from captured stderr.

### 2. Spawn Past Self and Future Self
- **Past Self** inspects the trace forward for anomalies: `python scripts/time_travel.py inspect trace.jsonl --anomalies` — variables that changed to unexpected types (`user_id` went `int` → `None`)
- **Future Self** starts at the crash line and walks backward: `python scripts/time_travel.py rewind trace.jsonl --crash-line 42 --expected "user should not be None" --output divergence.json`

### 3. They meet at divergence
Read the output: **crash_site** (where the error surfaced), **divergence_point** (where state first went wrong — e.g., `line 18: user = fetch_user(id)` returned None), **chain** (the propagation path), and **suspected_cause**. Done when a specific variable at a specific line is identified as first taking an unexpected value.

### 4. Fix and verify
Write the fix from the divergence analysis, then re-trace: `trace` + `inspect --anomalies`. Done when the re-trace shows no anomalies — the divergence no longer occurs.

## Reference
For the trace.jsonl format, full CLI reference, MCP server setup and tool schemas, and failure modes, see [`references/time-travel-details.md`](references/time-travel-details.md).

## Rules
- **Do** trace before hypothesizing — the trace is the ground truth of what executed.
- **Do** read the divergence point, not just the crash site — the crash is where it surfaced, not where it started.
- **Do** cap traces (`--max-steps`, `--max-locals-size`) — bloat defeats the method.
- **Do** re-trace after the fix — "looks fixed" is not verified.
- **Do** run multiple traces when the bug involves network, randomness, or threading — one path is one sample.
