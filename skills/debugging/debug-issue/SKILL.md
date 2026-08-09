---
name: debug-issue
description: "Force the reproduce → isolate → fix → verify cycle. Graph-powered code navigation traces issues through the system along dataflow edges. Use when the bug spans multiple modules or services, the crash site isn't the cause, or state diverges across an async boundary."
triggers:
  - Need to trace an issue through the system along dataflow edges
  - Bug spans multiple modules or services
  - Need to understand how data flows from entry point to failure point
  - Crash site is symptomatic, not causal — the real bug is upstream
  - State corruption happens across module boundaries (auth, caching, async)
---

# Debug Issue

Dataflow debugging for bugs that *aren't* local. When a value is wrong at point Z but was correct at point A, the bug lives somewhere on the path between — often not at the crash site. This skill traces data structurally along call graph and dataflow edges to find the divergence point.

## When to use vs simpler skills

- Use this when **static reading of the crash site doesn't explain the symptom**. The variable is wrong; you don't know *where it became wrong.*
- Don't use when the bug is local: `simulate-instrumentation` for single-module runtime evidence, `debug-issue` once you know the bug crosses a module/service boundary.
- Don't use when the cause is recent and you need *when*, not *where* — use `bisect-debugging` instead.

---

## Phase 1: Reproduce

Build a reliable reproduction at a **seam** — an interception point at a module boundary, external IO boundary, or clear state transition. The seam is your first foothold into the dataflow.

**Seam types:**
- **Module boundary:** a public function or class method that transforms inputs from one module's contract to another's.
- **External IO:** network call, file read, database query, message bus subscribe — any place data crosses a process or system boundary.
- **State transition:** a reducer, a state machine transition, a coordinator function that aggregates state across sources.
- **Type boundary:** a schema validator, an un/marshalling step, a parser. Bugs that are "type wrong at Z but type right at A" almost always live here.

**Done when:** the reproduction is deterministic *and* you can run it through at least one seam boundary. If you can't trace through a single seam in your repro, you don't have a dataflow bug — you have a local bug.

---

## Phase 2: Isolate via Dataflow

Trace the data structurally through the system. Goal: find the **divergence point** — the first hop where the data's actual value first deviates from its expected value.

### Step 2a: Map the call graph at the boundary

Identify every function the data passes through between the entry seam and the crash site. Use the structural lens:

- **Control flow:** what precedes the bug site? What functions call it?
- **Data flow:** what writes to the value last before each step? What reads from it?
- **Call graph:** trace imports / callees from the entry seam. Most languages have a tool for this — `madge`, `pydeps`, `tsc --trace`, the LSP.
- **State machine:** if there is one, what transitions apply between entry and crash?
- **Temporal:** what runs in the same event loop tick? Across async boundaries (await, then, callback), state changes invisibly to static reading.

**Done when:** the call chain entry → ... → crash is mapped, with each hop annotated by what transformation it performs on the data.

### Step 2b: Place structural data anchors

Pick 3-5 hop points along the chain for instrumentation. Each anchor should answer one specific question:

- *"What value arrives at hop X?"* — log the value at function entry.
- *"What value leaves hop X?"* — log the value at function exit / return.
- *"Was the conditional in hop X taken?"* — log branch decisions.
- *"Was mutation X applied at hop Y?"* — log before/after the mutation.

Anchor rules:

- Use unique prefixes so logs are easy to grep and remove (e.g., `DFLOW-1`, `DFLOW-2`).
- Print the *full object*, not one attribute — the missing or wrongly-typed key is often the bug.
- Don't print collections larger than 100 items — truncate or summarize.
- Anchor fewer hops with rich data, not many hops with sparse data. 3-5 max.

**Done when:** 3-5 strategic anchors placed, each answering one specific question about the data's transformation at that hop.

### Step 2c: Run, capture, locate the divergence

Run the reproduction with anchors enabled. Capture output filtered to your prefixes. Compare actual values against expected values at each hop.

Walk the chain backward from the crash:
- The hop *just before* the divergence: value matches expected.
- The hop *at* the divergence: value first diverges from expected.
- That hop is your root cause locus.

If multiple hops show divergence simultaneously, the bug is *upstream* of the earliest divergence point. Move your anchors further upstream.

**Done when:** one specific hop is identified as the divergence point. The bug is now local — you have one function, one transformation, one data state to fix.

### Special case: async and message-passing boundaries

Static analysis cannot see across `await`, callback scheduling, message bus publish/subscribe, or `setTimeout`. The same value observed before and after an async boundary, with no synchronous transformation in between, indicates either a state mutation elsewhere or a race.

**Tools for the boundary:**
- A `--inspect` flag plus Node/chrome debugger to pause across the boundary.
- Transaction IDs in logs to correlate async work.
- A counter-instrumented state object logged at every read and write.

If the divergence exists across an async boundary, the bug is *not* in the synchronous code path of the crash site. Look at:
- What scheduled this work — was it a retry, a debounced write, a stale closure?
- What else writes to this state in parallel — race condition candidates.
- What runs in a different process — services, cron, workers.

---

## Phase 3: Fix

Apply the minimal change that addresses the divergence at its locus — not at the symptom.

**Common dataflow fix locations:**
- The divergence hop itself (most common) — guard the transformation, validate inputs upstream.
- The seam that allowed bad data in — add validation at the boundary.
- A shared mutable state touched by multiple paths — synchronize or restructure.
- An async race — sequence the writes, or batch through a coordinator.

**Done when:** the fix is at the divergence hop (or at the seam that allowed the divergence), the change is minimal, and you can state the root cause in one sentence.

---

## Phase 4: Verify

Run the reproduction *with anchors still in place* — verify the divergence is gone at the *first* hop where it was previously observed, not just at the crash site. Then:

1. Run the reproduction test — must PASS.
2. Re-run the reproduction *and* the full test suite — no regressions.
3. Remove all `DFLOW-*` instrumentation (grep your prefix to confirm none remain).
4. State the root cause in the commit message: what was wrong, where, why your fix addresses it.

**Done when:** the reproduction no longer fires; the data flows correctly through every hop you anchored; no regressions; instrumentation removed.

---

## Failure Modes

- **Tracing without a hypothesis:** placing anchors all over the code, hoping to spot something. Place each anchor against a specific question about a specific hop. If you can't articulate the question for an anchor, it shouldn't be there.
- **Stopping at the crash site:** the crash site is rarely the root cause in dataflow issues. The value at the crash site is wrong because it became wrong upstream. If you find yourself patching the crash site to "fix" the symptom without understanding the upstream cause, you're masking.
- **Ignoring async boundaries:** dataflow across `await`, callbacks, message queues, and worker boundaries is invisible to static analysis. If your chain includes any of these and your static trace is clean, the bug is at the boundary.
- **Anchoring too many hops:** 3-5 strategic points. More than 5 anchors, output becomes noise and slow. If you can't narrow, return to Phase 2a and re-map the call chain — you've probably included modules that aren't actually on the data path.
- **Removing anchors before verifying the divergence is fixed:** verify the divergence at the hop where it was observed, not at the crash. The crash may stop happening for unrelated reasons (e.g., you accidentally fixed a different upstream state); confirming at the original hop keeps the fix honest.
