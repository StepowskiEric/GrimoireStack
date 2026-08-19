# Conquest Mode — Reference

**Load this after `debug-to-fix-pipeline/SKILL.md`.** Each section below *extends* the corresponding phase in the base protocol. Conquest adds components; it does not substitute phases.

**Use conquest when:**
- Hard bug where surface debugging has failed
- Intermittent / environment-specific crash
- Heisenbug or ghost bug ("fixes itself" when you add logging)
- Cost of a wrong fix exceeds the cost of thorough investigation
- The base protocol has run but produced a low-confidence fix

**Relationship to base:** Run the base 6-phase protocol. Apply the extensions below at the matching phases. The Evidence Ledger and Confidence Protocol are overlays applied throughout.

---

## Pre-Flight Inquisition (DEEP) — extends base questionnaire

The base questionnaire asks 5 questions. Conquest drills into each branch until the answer is specific, concrete, and testable.

### 1. Symptom — Drill down

- What exactly is broken? (Not "it crashes" — what error message, what wrong output, what silent misbehavior?)
- When did you first notice it? Exact time, commit, deploy, or event?
- How often does it happen? (Always, sometimes, only under load, only for certain users?)
- What does the failure look like from the outside? (Error page? Wrong data? Missing feature? Performance drop?)
- Is there a stack trace, error log, or core dump? If yes, share it verbatim.
- **Negative symptom:** What does *not* happen that should? (Often more revealing than what does happen.)

### 2. Reproduction — Force specificity

- What are the exact steps to reproduce? Number them.
- What input, data, or state triggers it? (Specific: "user ID 42" not "some users")
- What environment is required? (OS, browser, runtime version, config, env vars, feature flags)
- Can you reproduce it locally? If yes, show the commands. If no, why not?
- Is it deterministic or flaky? If flaky, what's the reproduction rate? (10%? 50%?)
- **Boundary test:** If you change one specific variable, does it still happen?

### 3. Blast Radius — Map what's safe

- What's *not* broken? List related functionality that works correctly.
- What modules/components are unaffected?
- Is the bug isolated to one code path, or does it corrupt state that other paths depend on?
- **Counterfactual:** If you swapped related component A for B, would the bug move or disappear?

### 4. History — Trace the timeline

- What code changed in the last N commits? List files and commit messages.
- What config, env vars, or feature flags changed recently?
- Were there any deployments, dependency updates, or migrations in the timeline?
- What was the last known good state? (Commit hash, deploy timestamp)
- **Diff check:** If you revert the most recent change, does the bug persist?

### 5. Triage — Document the graveyard

- What have you already tried? List each attempt and its result.
- What hypotheses have you already formed and ruled out? Why were they ruled out?
- What debugging steps have you already taken? (Logs added, breakpoints set, tests written)
- What did you learn from each failed attempt? (Critical — failed attempts contain evidence.)
- **Sanity check:** Have you verified that your repro still reproduces after each failed attempt? (Sometimes "fixing" something accidentally masks the bug.)

Record as conquest-style context, full structure shown in the pre-flight section of the original conquest skill.

---

## Phase 1 — Reproduce & Freeze (with Verification Gate)

Same as base, with stricter requirements:

- The reproduction loop must be **deterministic or high-rate** (>50% reproduction for flaky bugs).
- Capture the exact failure signature — error message, wrong output, performance number.
- Run it **3 times** to confirm reproducibility before proceeding.
- Record the **minimal input** that triggers the bug.

**Verification gate:** Before proceeding, the agent must state:

> "I can reproduce this bug on demand. Here is the command/input that triggers it, and here is the exact failure I observe."

If it cannot state this, keep building a better loop until reproduction is reliable.

---

## Phase 2 — Hypotheses (Interrogation + Claim Decomposition)

Generate **5–7 hypotheses** (more than the base — conquest demands breadth before depth).

For each candidate hypothesis, run an **internal grill** before presenting to the user:

### Hypothesis Interrogation (per hypothesis)

For each candidate:

1. **What would prove this hypothesis WRONG?** (Falsifiability check — if you can't answer this, the hypothesis is too vague.)
2. **What evidence already contradicts it?** (Be honest — look at the bug context, blast radius, history.)
3. **What does this hypothesis explain that others don't?** (If it explains nothing unique, it's not a real candidate.)
4. **What does this hypothesis FAIL to explain?** (List at least one gap.)
5. **How complex is the causal chain?** Count steps and independent entities.

**Reject** any hypothesis that:
- Cannot be falsified
- Is contradicted by confirmed evidence
- Has no unique explanatory power
- Requires accepting 3+ independent new entities without evidence

Present the surviving hypotheses to the user with scores, gaps, and falsification criteria.

### Claim Decomposition

For the top 2–3 hypotheses, decompose into atomic falsifiable claims. Each claim gets a confidence label and a verification action.

**Exit condition:** Top hypothesis selected. If no hypothesis scores above 0.6 after interrogation, return to Phase 1 and gather more evidence.

---

## Phase 3 — Simplicity Selection + ADVERSARIAL Backward Verification

Apply Occam's Razor ranking as in the base. Then run an adversarial backward verification.

### Adversarial Backward Verification

Assume the #1 hypothesis is **completely wrong**. Construct the strongest possible alternative explanation that fits ALL the evidence.

1. List 3–5 alternative explanations that are *inconsistent* with the #1 hypothesis but *consistent with all observed evidence*.
2. For each alternative, ask: "What specific evidence would rule this out?"
3. If you cannot find ruling evidence for an alternative, it remains a **live threat**.
4. Only proceed when either:
   - All alternatives are ruled out with specific evidence, OR
   - The #1 hypothesis has a falsifiable prediction that, if confirmed, eliminates all live alternatives.

**Confidence gate:**
- **≥ 0.9** — All alternatives ruled out, hypothesis makes unique predictions. Proceed.
- **0.7–0.9** — Some alternatives remain but hypothesis has strong unique predictions. Proceed with caveat — note live alternatives.
- **< 0.7** — Return to Phase 2 or gather more evidence.

---

## Phase 4 — Instrument & Probe (with Step Verification)

Same instrumentation approach, but with **step verification gates** after each probe.

### Step Verification Gate

After each instrumentation run, before interpreting results:

1. **Faithfulness check:** Does the evidence *necessarily* support my hypothesis? Or does it merely correlate?
   - Flag: "A happened before B" reasoning
   - Flag: evidence that supports multiple hypotheses equally
   - Flag: gaps between what the evidence shows and what the hypothesis predicts

2. **Alternative scan:** "If I didn't already believe my hypothesis, how would I interpret this evidence?" Write the alternative interpretation.

3. **Claim verification:** For each atomic claim from Phase 2:
   - Does the new evidence confirm or contradict it?
   - If contradicted: return to Phase 2 immediately instead of patching
   - If confirmed: upgrade confidence label.

4. **Decision:** Proceed to next probe, confirm hypothesis and move to Phase 5, or backtrack to Phase 2.

**Maximum 5 instrumentation cycles** before mandatory reassessment. If you've instrumented 5 times and the hypothesis is still not confirmed, your model of the bug is wrong — return to Phase 2.

---

## Phase 5 — Fix + Regression Test (with Pre-Mortem)

Before writing any fix code, run a **pre-mortem on the fix**.

### Pre-Mortem on the Fix

1. "Assume this fix was applied and the bug came back. What went wrong?"
   - List 3–5 specific failure modes for the fix itself.
   - Examples: "The fix addresses symptom X but root cause Y persists under condition Z", "The fix introduces a new state machine transition that creates a different bug", "The fix only works for the reproducer but fails for edge case W."

2. "What assumptions does this fix rely on?"
   - List each assumption explicitly.
   - For each: "If this assumption is false, does the fix still work?"

3. "What's the simplest thing that could make this fix fail?"
   - Edge cases, boundary conditions, concurrent access, data variations.

4. "Am I fixing the root cause or a contributing factor?"
   - Apply the test: "If I fix only this, will the symptom be impossible under the same conditions?"
   - If NO → keep digging. Apply the fix only when the root cause is confirmed.

Only after the pre-mortem is complete and the agent can state *"I have considered how this fix could fail, and I believe it addresses the root cause"* does it proceed to write the regression test and apply the fix.

### Fix Iteration with Evidence Tracking

- Write regression test → watch it fail → apply fix → watch it pass.
- If fix fails: return to Phase 4 instrumentation with updated evidence rather than guessing a different fix.
- If fix passes but pre-mortem predictions are violated: **STOP**. The bug is not fixed — you've masked it.
- **Maximum 4 fix iterations.** If exhausted, escalate with full evidence ledger.

---

## Phase 6 — Prevent Recurrence (with Final Adversarial Review)

Run a final adversarial review before declaring done.

### Final Adversarial Review

1. **State the case FOR the fix** — what you believe is true.
2. **State the case AGAINST the fix** — what could still be wrong, what gaps remain, what alternatives you ruled out but couldn't fully disprove.
3. **Identify residual risks** — what edge cases, environments, or future changes could resurrect this bug?
4. **Verify the fix is minimal** — smallest diff that addresses the root cause, not the symptom.

Then complete the base protocol's prevention checklist.

---

## Evidence Ledger (Overlay)

Throughout all phases, maintain a running ledger of claims and their status. Append, do not rewrite — earlier entries are evidence of how the investigation evolved.

```markdown
## Evidence Ledger

| # | Claim | Source | Confidence | Status | Notes |
|---|-------|--------|------------|--------|-------|
| 1 | [claim] | [observation/test/read] | CERTAIN/LIKELY/UNCERTAIN/SPECULATIVE | verified/contradicted/pending | ... |
| 2 | ... | ... | ... | ... | ... |
```

Rules:
- Every claim must have a source (not "I think").
- Confidence must be updated after each instrumentation run.
- Contradicted claims are marked and their descendants invalidated.
- The ledger is the agent's memory — refer to it before every phase transition.

---

## Confidence Protocol (Overlay)

State confidence at every phase transition and what would change it:

| Gate | Minimum | What to do if below |
|---|---|---|
| After Phase 2 (hypotheses) | 0.6 | Gather more evidence, generate more hypotheses |
| After Phase 3 (verification) | 0.7 | Rule out more alternatives, or gather targeted evidence |
| After Phase 4 (instrumentation) | 0.85 | Hypothesis is falsified — return to Phase 2 |
| Before Phase 5 (fix) | 0.9 | Pre-mortem must address all remaining gaps |
| After Phase 5 (fix applied) | 0.95 | Regression test + pre-mortem validation |
| Final (Phase 6) | 0.9 | Adversarial review must find no live alternatives |

---

## Failure Modes

| What Goes Wrong | Why It Fails |
|---|---|
| Accepting surface answers in questionnaire | Partial context = guessing = wasted cycles |
| Generating < 5 hypotheses | First-branch lock-in is guaranteed with fewer |
| Skipping hypothesis interrogation | Plausible-but-wrong narratives survive unchallenged |
| Confirming evidence as disconfirming | "My hypothesis predicts X, I observed X" — but 3 others also predict X |
| Skipping pre-mortem | Fixes that look correct often mask the bug instead of curing it |
| Proceeding below confidence threshold | Low confidence = high probability of wrong fix |
| Fixing without falsifying alternatives | Not proven; only one prediction confirmed |
| Declaring done without adversarial review | Case-against is usually more informative than case-for |
| Not writing to the evidence ledger | Earlier reasoning is lost; the agent repeats mistakes |
