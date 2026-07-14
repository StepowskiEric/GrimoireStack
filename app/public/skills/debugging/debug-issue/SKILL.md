---
name: debug-issue
description: "Force the reproduce → isolate → fix → verify cycle. Graph-powered code navigation traces issues through the system along dataflow edges."
triggers:
  - Need to trace an issue through the system along dataflow edges
  - Bug spans multiple modules or services
  - Need to understand how data flows from entry point to failure point
---

# Debug Issue

Force the reproduce → isolate → fix → verify cycle. Graph-powered code navigation traces issues through the system along dataflow edges.

## Core Protocol

### Phase 1: Reproduce

Create a reliable reproduction of the issue. Prefer a failing test at the seam that reaches the bug.

**Done when:** the bug is reproducible with a consistent trigger.

### Phase 2: Isolate via Dataflow

Trace the issue through the system along dataflow edges. Follow the path from symptom back to root cause by tracking how data moves through functions, modules, and services.

- Identify the entry point where data enters the system
- Trace each transformation step
- Find where the data first diverges from expected values

**Done when:** the specific dataflow edge where state diverges is identified.

### Phase 3: Fix

Apply the minimal change that addresses the root cause.

**Done when:** fix is applied and reproduction no longer triggers the issue.

### Phase 4: Verify

Run the reproduction test and full test suite to confirm no regressions.

**Done when:** all tests pass and the fix is confirmed.

## Failure Modes

- **Tracing without a hypothesis:** following dataflow without a theory about what to look for
- **Stopping at the crash site:** the crash site is rarely the root cause in dataflow issues
- **Ignoring async boundaries:** dataflow across async boundaries (promises, callbacks, message queues) is invisible to static analysis
