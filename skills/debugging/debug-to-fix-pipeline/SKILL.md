---
name: debug-to-fix-pipeline
description: "6-phase pipeline that increases evidence quality each phase while cutting token waste: context → hypothesis → instrument → capture → purify → patch → verify."
triggers:
  - bug-not-obvious-from-error
  - multi-file-runtime-bug
  - silent-logic-error
  - first-patch-attempt-failed
  - hard-bug
  - stuck-on-debugging
disable-model-invocation: true
---

# Debug-to-Fix Pipeline

**Evidence first, patch last — never touch code until the bug has a context.** A sequential protocol that fuses abductive hypothesis testing, runtime state capture, failure-signal purification, and iterated patch repair. When debugging stalls, symptoms mislead, or the first patch failed, run the phases in order: each one raises evidence quality while cutting token waste.

## When to Use
- Bug where the fix is not immediately obvious from the error message
- Multi-file bugs requiring runtime state inspection; silent logic errors static analysis missed
- First patch attempt failed or only partially fixed the issue
- "Hard bug" — stuck, simpler debugging skills already failed

## The Move

### 0. Pre-flight — mandatory
Answer all five before touching code and record as Bug Context: **Symptom** (what exactly is broken), **Reproduction** (how to trigger it), **Blast radius** (what is NOT broken — narrows the search space), **History** (what changed recently), **Triage** (what was already tried). Then build a fast, deterministic, agent-runnable pass/fail loop — a failing test at the seam, or a curl script, CLI harness, headless browser, or replay trace. Raise the reproduction rate until the loop produces the exact symptom the user described, and freeze it in writing: exact error, frequency, first observed, affected scope. **The bug is 90% fixed once the loop is fast and deterministic.**

### 1. Hypothesize
Collect observations: primary symptom, secondary symptoms, negative symptoms (what does NOT happen), context. Generate at least 3 competing hypotheses — never stop at the first plausible cause. For each, list what it explains and what it does NOT explain; score coverage, specificity, simplicity, consistency. Select the best (least unexplained, highest coherence); if none scores above 0.6, gather targeted evidence first. Show the ranked list before testing. Decompose the winner into atomic falsifiable claims — one subject, one predicate, an observable prediction, precise identifiers — labeled CERTAIN / LIKELY / UNCERTAIN / SPECULATIVE. Backward-verify the leader: assume it is WRONG, list 2–4 alternatives, rule each out with evidence or record it as unresolved. For the focused hypothesis playbook with structural code location and the synthesize template, see `specter`.

### 2. Instrument
Ask what variables or expressions would prove or disprove the hypothesis. Inject 3–5 strategic points max (entry args, return values, loop variables, branch paths, attributes before/after mutation), prefixed `DEBUG:` for easy grep-and-remove. Print before the suspected failure point — if the print does not run, the code path was different. Print full objects, not single attributes; truncate collections over 100 items to first/last 5. One breakpoint beats ten logs when a debugger exists. For performance bugs: establish a baseline measurement first, then bisect. When a value is wrong at the crash site but was correct upstream and the bug crosses a module or service boundary, trace the dataflow with `debug-issue` instead of generic instrumentation.

### 3. Capture
Run the test with instrumentation, filter output to `DEBUG:` lines, and compare captured state against hypothesis predictions. Evidence confirms → proceed. Contradicts → return to Phase 1 with updated symptoms. Never hide a contradiction.

### 4. Purify
Re-run without instrumentation. Extract the failure signature: assertion message, exception type, expected/got diffs. Keep user-code stack frames only — discard `site-packages`, `node_modules`, framework internals. Keep variable-diff lines and the last 3 lines of stderr; discard setup/teardown logs and coverage reports. Feed 5–10 clean lines — not 50+ raw — to the diagnosis.

### 5. Patch
Generate a candidate patch, apply it, run the failing test. On failure, capture the new failure state and pick a variant category before regenerating: **same root cause, different location** (the edit is in the wrong place), **same location, different approach** (guard clause → assertion, upstream normalization, different default), or **null-check / default / data-flow refactor** (signals the root-cause model is wrong). Iterate within budget: simple 2, medium 3–4, complex 5. If iteration N produces the same diff as N−1, STOP — return to Phase 1 with updated evidence. Patching test expectations to match wrong behavior is a red flag: the bug is in the code, not the test.

### 6. Verify & prevent recurrence
Remove all `DEBUG:` instrumentation. Run the full suite, not just the failing test. Confirm the diff is minimal and addresses root cause, not symptom. Faithfulness check: "If I fix X, is the symptom impossible under the same conditions?" Yes → root cause. No → contributing factor — keep digging. Then: original repro no longer reproduces, regression test passes, throwaway prototypes deleted, the correct hypothesis stated in the commit message, and a preventive measure tied to the root-cause category: **code defect** → regression test; **missing process** → checklist, lint rule, or CI gate; **knowledge gap** → documentation; **infrastructure limit** → capacity alert or auto-scaling. For non-code causes and incident postmortems (deployments, environment, process gaps), run 5-Whys and an Ishikawa diagram directly.

## Reference
For the hardest cases — intermittent failures, environment-specific crashes, Heisenbugs, or any bug where a wrong fix costs more than thorough investigation — load [`references/conquest-mode.md`](references/conquest-mode.md): pre-flight inquisition, per-hypothesis grilling, adversarial backward verification, step gates, fix pre-mortem, and the evidence ledger.

## Rules
- **Do** answer the pre-flight before touching code — guessing with partial context wastes cycles.
- **Do** write the regression test before the fix when a correct seam exists.
- **Do** stop on duplicate patches and on symptom-patching (guard clauses, retries, null checks without understanding why the bad input arrived).
- **Do** declare done only when root cause and mechanism are stated and prevention is in place.
