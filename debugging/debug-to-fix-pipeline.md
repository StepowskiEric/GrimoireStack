# Skill: Debug-to-Fix Pipeline for AI Agents

## Purpose

A structured 6-phase debugging pipeline that fuses five research-backed skills into a single sequential workflow. Each phase increases evidence quality while reducing token waste.

Fuses Abductive-First Debugging (competing hypotheses), Debug Subagent (debug-before-edit gate), Simulate Instrumentation (runtime state capture), Purify Test Output (failure-relevant slicing), and Iterative Patch Repair (generate -> test -> refine loop).

## When to Use

- Bug where fix is not immediately obvious from error message
- Multi-file bugs requiring runtime state inspection
- Silent logic errors (no crash, just wrong output)
- Failures where static analysis hasn't revealed root cause
- First patch attempt failed or only partially fixed the issue

## When NOT to Use

- Trivial syntax errors or clear one-line fixes
- Token budget severely constrained (< 30 calls available)
- The code is compiled (C/C++) without debug build
- Test output is already minimal (< 20 lines, no framework noise)

---

## Phase 0: REPRODUCE (if no failing test)

If you don't have a failing test to start with, use `minimal-reproduction` to create one before entering the pipeline. Every subsequent phase assumes you have a test that demonstrates the bug.

- If a failing test already exists → skip to Phase 1
- If bug is visible at runtime but no test covers it → use `minimal-reproduction` Skill first
- If bug is environmental (build fails, command not found) → use `environment-recovery` Skill first

---

## Phase 1: HYPOTHESIZE

Generate competing hypotheses and select the best explanation via abductive reasoning.

1. Collect all observations: primary symptom, secondary symptoms, negative symptoms (what does NOT happen), and context (recent changes, environment, timing)
2. Generate at least 3 competing hypotheses — force creativity, don't stop at first plausible cause
3. For each hypothesis, list what it explains and what it does NOT explain
4. Score each hypothesis on explanatory coherence: coverage (% of symptoms explained), specificity, simplicity, consistency
5. Select the best hypothesis (Inference to Best Explanation) — the one with least unexplained observations and highest coherence score
6. If no hypothesis scores above 0.6, gather more evidence targeting the unexplained symptoms before proceeding

**Exit condition:** Best hypothesis selected with rationale. If confidence is low, gather targeted evidence before Phase 2.

---

## Phase 2: INSTRUMENT

Design and inject temporary print/logging statements to capture runtime state that proves or disproves the hypothesis.

1. Ask: "What variables or expressions would prove or disprove my current hypothesis?"
2. Identify instrumentation targets: function arguments at entry, return values at exit, loop variables mid-iteration, branch conditions (which path taken), object attributes before/after mutation
3. Inject temporary print/log statements at 3-5 strategic points (max) — use clear prefix `DEBUG:` or `// DEBUG:` for easy grep-and-remove
4. Print before the suspected failure point — if the print doesn't run, the code path was different
5. Print the full object, not just one attribute — the missing/wrong key is often the bug
6. Do NOT print large collections (> 100 items) — truncate to first/last 5

**Exit condition:** Instrumentation injected at strategic points targeting the hypothesis.

---

## Phase 3: CAPTURE

Run the test with instrumentation, capture runtime state, and collect raw output.

1. Run the failing test with instrumentation enabled, capturing stdout/stderr
2. Filter output to `DEBUG:` prefixed lines to extract runtime state
3. Compare captured runtime state against hypothesis predictions
4. Update hypothesis confidence: did the evidence confirm or contradict the best hypothesis?
5. If evidence contradicts, return to Phase 1 with updated symptoms and re-hypothesize
6. If evidence confirms, proceed to Phase 4

**Exit condition:** Runtime state captured and hypothesis confirmed or falsified. If falsified, loop back to Phase 1.

---

## Phase 4: PURIFY

Slice the failing test output to only failure-relevant lines before feeding to diagnosis.

1. Run the test again (without instrumentation) and capture raw output
2. Extract the failure signature: assertion message, exception type and message, variable diffs (`expected X, got Y`)
3. Keep user-code stack frames only — discard framework internals (`site-packages`, `node_modules`, `lib/python`)
4. Keep variable diff lines (`E   `, `==`, `!=`) and last 3 lines of stderr
5. Discard: test setup/teardown logs, coverage reports, passing test stdout, framework internal frames
6. Present purified output (typically 5-10 lines vs 50+ raw) to diagnosis step

**Exit condition:** Purified output captures the failure signal with 18-20% fewer tokens than raw output.

---

## Phase 5: PATCH

Generate a fix, run tests, and iterate using the inner refinement loop.

1. Generate a candidate patch based on the confirmed hypothesis and purified runtime state
2. Apply the patch to source code
3. Run the failing test — if PASS, proceed to Phase 6; if FAIL, continue to step 4
4. Capture the new failure state (return to Phase 3 briefly for updated runtime evidence)
5. Generate a refined patch or variant — try a different approach, different file, or different implementation
6. Repeat steps 2-5 up to iteration budget (simple: 2, medium: 3-4, complex: 5 max)
7. If iteration N produces the same diff as iteration N-1, STOP — agent is stuck in a loop
8. If the patch modifies test expectations, that's a red flag — the bug is in the code, not the test

**Exit condition:** Patch passes the failing test. If budget exhausted without pass, escalate or report partial findings.

---

## Phase 6: VERIFY

Confirm the fix is correct and doesn't introduce regressions.

1. Remove all `DEBUG:` instrumentation statements from the code
2. Run the full test suite (not just the failing test) to check for regressions
3. Verify the patch is minimal — smallest diff that fixes the bug
4. Review the patch against the original hypothesis — does it address root cause or just symptom?
5. If regressions found, return to Phase 5 with the regression test as new evidence
6. Record the final fix: what was changed, why it works, what the root cause was

**Exit condition:** All tests pass, no regressions, instrumentation removed, fix is minimal and addresses root cause.

---

## Anti-Patterns

- **Don't skip Phase 1** — jumping straight to patching wastes cycles on wrong hypotheses
- **Don't instrument every line** — 3-5 strategic points max, otherwise output becomes noise
- **Don't generate same patch twice** — if iteration N matches iteration N-1, stop and re-hypothesize
- **Don't fix tests instead of code** — patching test expectations to match wrong behavior is a red flag
- **Don't overfit to test suite** — a patch that makes tests pass but introduces regressions elsewhere is worse than no fix
- **Don't ignore negative symptoms** — what does NOT happen is as important as what does
- **Don't skip Phase 6** — a fix that breaks other tests isn't a fix
- **Don't spawn multiple debug subagents in parallel** — serial investigation is more token-efficient
- **Don't use abduction for clear error messages** — if the error points to a specific line, use deductive tracing instead

---

## Exit Criteria

The pipeline is complete when ALL of the following are true:

1. A root cause hypothesis was generated and confirmed with runtime evidence
2. A patch was generated that fixes the failing test
3. The full test suite passes with no regressions
4. All instrumentation has been removed from the code
5. The patch is minimal (smallest diff that addresses root cause)
6. The fix was verified against the original hypothesis (root cause addressed, not just symptom)
