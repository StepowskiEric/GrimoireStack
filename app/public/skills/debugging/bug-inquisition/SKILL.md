---
name: bug-inquisition
description: "Deep root-cause debugging with mandatory context-gathering. Fuses root-cause analysis, specter, diagnose, debug-to-fix-pipeline, occam-root-cause, and reasoning-integrity-chain into one sequential protocol."
triggers:
  - "hard bug"
  - "stuck on debugging"
  - "can't figure out this error"
  - "stuck on bug"
  - "bug inquisition"
  - Simpler debugging skills have already failed
---

# Bug Inquisition

For the hardest bugs — where the fix isn't obvious, where symptoms mislead, where patches mask instead of cure. Fuses root-cause analysis, specter (abductive hypothesis generation), diagnose (feedback-loop construction), debug-to-fix-pipeline (instrumentation + patch iteration), occam-root-cause (simplicity selection), and reasoning-integrity-chain (faithfulness + claim verification + backward scrutiny) into one sequential protocol.

**Guarantee:** The AI will not touch code until it has full context of the bug. No guessing.

---

## Pre-Flight Questionnaire (MANDATORY)

Before any debugging, ask ALL five questions. Record answers as the bug's context. **Do not proceed until all are answered.**

1. **Symptom** — What exactly is broken? (error message, wrong output, crash, performance regression, silent misbehavior)
2. **Reproduction** — How do you trigger it? (specific steps, inputs, conditions, environment)
3. **Blast radius** — What's *not* broken? (narrows search space; what works fine that should be related?)
4. **History** — What changed recently? (code commits, config changes, data migrations, dependency updates, environment changes)
5. **Triage** — What have you already tried? (prevents re-doing failed approaches; captures what was ruled out)

Record as:
```markdown
## Bug Context
- Symptom: ...
- Reproduction: ...
- Blast radius: ...
- History: ...
- Triage: ...
```

---

## Phase 1 — Reproduce & Freeze

Build a feedback loop. Spend disproportionate effort here. The bug is 90% fixed once you have a fast, deterministic, agent-runnable pass/fail signal.

- Prefer a failing test at the seam that reaches the bug.
- If no test exists: curl script, CLI harness, headless browser, replay trace, or throwaway harness.
- For non-deterministic bugs: raise reproduction rate until debuggable (loop 100×, add stress, narrow timing).
- **Do not proceed to Phase 2 until the loop produces the exact symptom the user described.**

Freeze the symptom:
```markdown
## Frozen Symptom
- Exact error/wrong output: ...
- Frequency: ...
- First observed: ...
- Affected scope: ...
```

---

## Phase 2 — Abductive Hypotheses with Claim Decomposition

Generate **3–5 ranked hypotheses** before testing any. Single-hypothesis generation anchors on the first plausible idea.

For each hypothesis, decompose into **atomic falsifiable claims**:
- One subject, one predicate per claim
- Each claim must predict something observable
- Use precise identifiers (file names, line numbers, function names)

Assign confidence labels:
- **CERTAIN** — directly observed
- **LIKELY** — strong indirect evidence
- **UNCERTAIN** — weak or incomplete evidence
- **SPECULATIVE** — untested hypothesis

Show the ranked list to the user before testing.

**Exit condition:** Best hypothesis selected with rationale. If no hypothesis scores above 0.6, gather more evidence.

---

## Phase 3 — Simplicity Selection + Backward Verification

When multiple hypotheses survive, apply **Occam's Razor**:

- List each surviving candidate with its full causal chain.
- Count causal steps and independent new entities.
- Rank: shortest causal chain → longest.
- Prefer a single verified cause over a multi-factor explanation unless evidence requires it.

Then **backward verify** the leader:
- Assume the conclusion is WRONG. What else could explain the evidence?
- List 2–4 alternative explanations.
- For each: can you find evidence that rules it out?
- If you cannot rule out an alternative, record it as unresolved.
- **Score ≥ 0.9**: proceed. **Score 0.7–0.9**: proceed with caveat. **Score < 0.7**: gather more evidence or abstain.

---

## Phase 4 — Instrument & Probe

Each probe must map to a specific prediction from Phase 2. **Change one variable at a time.**

- **Debugger / REPL** if available — one breakpoint beats ten logs.
- **Targeted logs** at 3–5 strategic points max. Tag with unique prefix `[DEBUG-XXXX]` for easy cleanup.
- Print full objects, not single attributes — the missing/wrong key is often the bug.
- Log at 3-5 strategic points, not everything.
- **Step verification gate:** Before proceeding to the next hypothesis or to Phase 5, verify that the current instrumentation evidence supports the claims. If evidence contradicts the hypothesis, return to Phase 2. If evidence confirms, proceed.
- **For performance regressions:** establish baseline measurement first, then bisect. Measure first, fix second.

---

## Phase 5 — Fix + Regression Test

**Write the regression test before the fix** — but only if there is a correct seam for it. A correct seam is one where the test exercises the real bug pattern as it occurs at the call site.

1. Turn the minimized repro into a failing test at that seam.
2. Watch it fail.
3. Apply the fix.
4. Watch it pass.
5. Re-run the Phase 1 feedback loop against the original scenario.

**Faithfulness check:** Before declaring done, verify the fix necessarily addresses the root cause. Ask: "If I fix X, will the symptom be impossible under the same conditions?"
- **Yes** → X is root cause (or one of them).
- **No** → X is a contributing factor; keep digging.

If the patch fails, iterate up to 3-4 times. If iteration produces the same diff twice, STOP — you're stuck.

---

## Phase 6 — Prevent Recurrence

Before declaring done:
- [ ] Original repro no longer reproduces (re-run Phase 1 loop)
- [ ] Regression test passes (or absence of correct seam is documented)
- [ ] All `[DEBUG-...]` instrumentation removed
- [ ] Throwaway prototypes deleted
- [ ] The correct hypothesis is stated in the commit message
- [ ] Preventive measure added tied to root cause category:
  - **Code defect** → regression test
  - **Missing process** → checklist, lint rule, or CI gate
  - **Knowledge gap** → documentation update
  - **Infrastructure limit** → capacity alert or auto-scaling

---

## Failure Modes

| Failure Mode | Why It Fails |
|---|---|
| Patch the symptom | Guard clauses, retries, null checks without understanding why the bad input arrived |
| First-branch lock-in | "I know what caused it" → ignoring disconfirming evidence |
| Log everything | Noise buries the signal |
| Fix the test instead of code | Tests are symptoms; code under test is the cause |
| Skip the questionnaire | Guessing with partial context wastes cycles |
| Skip backward verification | Forward reasoning hides assumptions |
| Abort on first failed patch | Iteration is expected; stop only on duplicate patches |
| Declare fixed on passing test alone | Must state root cause, mechanism, and why fix addresses it |
