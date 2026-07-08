---
name: bug-inquisition-conquest
description: "Ultra-heavy root-cause debugging with relentless ongoing interrogation. Fuses bug-inquisition pre-flight with continuous adversarial self-grilling, evidence-ledger tracking, pre-mortem on every fix, confidence-gated phase transitions, and final adversarial review. Use for the hardest bugs where surface debugging has failed, when the bug is intermittent or environment-specific, or when the cost of a wrong fix is high. Triggers: 'deep bug', 'intermittent bug', 'heisenbug', 'ghost bug', 'bug inquisition conquest', or when bug-inquisition has already failed."
---

# Bug Inquisition — Conquest Mode

## Purpose

The heaviest debugging protocol in the arsenal. For bugs where guessing is not an option: intermittent failures, environment-specific crashes, bugs that "fix themselves" when you add logging, or any bug where the cost of a wrong fix exceeds the cost of thorough investigation.

**Guarantee:** Every claim is backed by evidence, every hypothesis is adversarially tested, every fix is pre-mortemed before application, and the AI maintains a live evidence ledger throughout. No assumption passes unchallenged.

**Relationship to bug-inquisition:** Conquest mode runs the same 6-phase structure, but each phase contains ongoing interrogation loops. The AI does not just "run a phase" — it interrogates its own understanding at every step.

---

## Pre-Flight Inquisition (DEEP)

Before any debugging, the AI conducts a full interrogation of the bug report. Ask ALL questions below. Accept no surface answers. Drill into every branch until the answer is specific, concrete, and testable.

### 1. Symptom — Drill down

- What exactly is broken? (Not "it crashes" — what error message, what wrong output, what silent misbehavior?)
- When did you first notice it? Exact time, commit, deploy, or event?
- How often does it happen? (Always, sometimes, only under load, only for certain users?)
- What does the failure look like from the outside? (Error page? Wrong data? Missing feature? Performance drop?)
- Is there a stack trace, error log, or core dump? If yes, share it verbatim.
- **Negative symptom:** What does *not* happen that should? (Often more revealing than what does happen.)

### 2. Reproduction — Force specificity

- What are the exact steps to reproduce? Number them.
- What input, data, or state triggers it? (Be specific: "user ID 42" not "some users")
- What environment is required? (OS, browser, Node version, config, environment variables, feature flags)
- Can you reproduce it locally? If yes, show the commands. If no, why not?
- Is it deterministic or flaky? If flaky, what's the reproduction rate? (10%? 50%?)
- **Boundary test:** If you change [one specific variable], does it still happen? If you don't know, test it now.

### 3. Blast Radius — Map what's safe

- What's *not* broken? List related functionality that works correctly.
- What schools/modules/components are unaffected?
- Is the bug isolated to one code path, or does it corrupt state that other paths depend on?
- **Counterfactual:** If you swapped [related component A] for [related component B], would the bug move or disappear?

### 4. History — Trace the timeline

- What code changed in the last [N] commits? List files and commit messages.
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

Record as:
```markdown
## Bug Context — Conquest Mode
### Symptom
- Exact failure: ...
- First observed: ...
- Frequency: ...
- Stack trace: ...
- Negative symptom: ...

### Reproduction
- Steps: ...
- Trigger input/state: ...
- Environment: ...
- Reproducible locally: ...
- Flaky rate: ...
- Boundary test result: ...

### Blast Radius
- Unaffected: ...
- Isolated vs. corrupting: ...
- Counterfactual: ...

### History
- Recent changes: ...
- Last known good: ...
- Diff check result: ...

### Triage
- Attempted fixes: ...
- Ruled-out hypotheses: ...
- Evidence from failures: ...
```

---

## Phase 1 — Reproduce & Freeze (with Verification Gate)

Build a feedback loop. Same options as standard mode, but with stricter requirements:

- The loop must be **deterministic or high-rate** (>50% reproduction for flaky bugs).
- Capture the **exact failure signature** — error message, wrong output, performance number.
- Run it **3 times** to confirm reproducibility before proceeding.
- Record the **minimal input** that triggers the bug.

**Verification gate:** Before proceeding, the AI must state:
> "I can reproduce this bug on demand. Here is the command/input that triggers it, and here is the exact failure I observe."

If it cannot say this, it does not proceed. It builds a better loop.

```markdown
## Frozen Symptom
- Reproduces with: [command/input]
- Failure signature: [exact error/output]
- Reproduction rate: [N% or deterministic]
- Minimal reproducer: [smallest input that triggers it]
```

---

## Phase 2 — Abductive Hypotheses with INTERROGATION

Generate **5–7 hypotheses** (more than standard mode — conquest mode demands breadth before depth).

For each hypothesis, the AI runs an **internal grill** before presenting to the user:

### Hypothesis Interrogation (per hypothesis)

For each candidate hypothesis, ask:

1. **What would prove this hypothesis WRONG?** (Falsifiability check — if you can't answer this, the hypothesis is too vague.)
2. **What evidence already contradicts it?** (Be honest — look at the bug context, the blast radius, the history.)
3. **What does this hypothesis explain that others don't?** (If it explains nothing unique, it's not a real candidate.)
4. **What does this hypothesis FAIL to explain?** (List at least one gap.)
5. **How complex is the causal chain?** Count steps and independent entities.

**Reject** any hypothesis that:
- Cannot be falsified
- Is contradicted by confirmed evidence
- Has no unique explanatory power
- Requires accepting 3+ independent new entities without evidence

Present the surviving hypotheses to the user with their scores, gaps, and falsification criteria.

### Claim Decomposition

For the top 2–3 hypotheses, decompose into atomic falsifiable claims. Each claim gets a confidence label and a verification action.

**Exit condition:** Top hypothesis selected. If no hypothesis scores above 0.6 after interrogation, return to Phase 1 and gather more evidence.

---

## Phase 3 — Simplicity Selection + ADVERSARIAL Backward Verification

Same Occam's Razor ranking as standard mode. But then:

### Adversarial Backward Verification

Assume the #1 hypothesis is **completely wrong**. Now construct the strongest possible alternative explanation that fits ALL the evidence.

1. List 3–5 alternative explanations that are *inconsistent* with the #1 hypothesis but *consistent* with all observed evidence.
2. For each alternative, ask: "What specific evidence would rule this out?"
3. If you cannot find ruling evidence for an alternative, it remains a **live threat**.
4. Only proceed when either:
   - All alternatives are ruled out with specific evidence, OR
   - The #1 hypothesis has a falsifiable prediction that, if confirmed, eliminates all live alternatives.

**Confidence gate:** Score the #1 hypothesis 0–1:
- **≥ 0.9**: All alternatives ruled out, hypothesis makes unique predictions. Proceed.
- **0.7–0.9**: Some alternatives remain but hypothesis has strong unique predictions. Proceed with caveat — note live alternatives.
- **< 0.7**: Do NOT proceed. Return to Phase 2 or gather more evidence.

---

## Phase 4 — Instrument & Probe (with Step Verification)

Same instrumentation approach, but with **step verification gates** after each probe:

### Step Verification Gate

After each instrumentation run, before interpreting results:

1. **Faithfulness check:** Does the evidence *necessarily* support my hypothesis? Or does it merely correlate?
   - Flag: "A happened before B" reasoning
   - Flag: evidence that supports multiple hypotheses equally
   - Flag: gaps between what the evidence shows and what the hypothesis predicts

2. **Alternative scan:** "If I didn't already believe my hypothesis, how would I interpret this evidence?" Write the alternative interpretation.

3. **Claim verification:** For each atomic claim from Phase 2:
   - Does the new evidence confirm or contradict it?
   - If contradicted: return to Phase 2 immediately. Do not patch.
   - If confirmed: upgrade confidence label.

4. **Decision:** Proceed to next probe, confirm hypothesis and move to Phase 5, or backtrack to Phase 2.

**Maximum 5 instrumentation cycles** before mandatory reassessment. If you've instrumented 5 times and the hypothesis is still not confirmed, your model of the bug is wrong — return to Phase 2.

---

## Phase 5 — Fix + Regression Test (with Pre-Mortem)

Same fix approach, but with an **adversarial pre-mortem** before any code change:

### Pre-Mortem on the Fix

Before writing a single line of fix code, answer these questions:

1. "Assume this fix was applied and the bug came back. What went wrong?"
   - List 3–5 specific failure modes for the fix itself.
   - Examples: "The fix addresses symptom X but root cause Y persists under condition Z", "The fix introduces a new state machine transition that creates a different bug", "The fix only works for the reproducer but fails for edge case W."

2. "What assumptions does this fix rely on?"
   - List each assumption explicitly.
   - For each: "If this assumption is false, does the fix still work?"

3. "What's the simplest thing that could make this fix fail?"
   - Think about edge cases, boundary conditions, concurrent access, data variations.

4. "Am I fixing the root cause or a contributing factor?"
   - Apply the test: "If I fix only this, will the symptom be impossible under the same conditions?"
   - If NO → keep digging. Do not apply the fix.

Only after the pre-mortem is complete and the AI can state "I have considered how this fix could fail, and I believe it addresses the root cause" does it proceed to write the regression test and apply the fix.

### Fix Iteration with Evidence Tracking

- Write regression test → watch it fail → apply fix → watch it pass.
- If fix fails: return to Phase 4 instrumentation with updated evidence. Do not guess a different fix.
- If fix passes but pre-mortem predictions are violated: STOP. The bug is not fixed — you've masked it.
- Maximum 4 fix iterations. If exhausted, escalate with full evidence ledger.

---

## Phase 6 — Prevent Recurrence (with Adversarial Review)

Before declaring done, run the **final adversarial review**:

### Final Adversarial Review

1. **State the case FOR the fix** (what you believe is true).
2. **State the case AGAINST the fix** (what could still be wrong, what gaps remain, what alternatives you ruled out but couldn't fully disprove).
3. **Identify residual risks** — what edge cases, environments, or future changes could resurrect this bug?
4. **Verify the fix is minimal** — smallest diff that addresses the root cause, not the symptom.

Then complete the standard checklist:
- [ ] Original repro no longer reproduces
- [ ] Regression test passes
- [ ] All instrumentation removed
- [ ] Throwaway prototypes deleted
- [ ] Correct hypothesis stated in commit message
- [ ] Preventive measure added

---

## Evidence Ledger

Throughout all phases, maintain a running ledger of claims and their status:

```markdown
## Evidence Ledger

| # | Claim | Source | Confidence | Status | Notes |
|---|-------|--------|------------|--------|-------|
| 1 | [claim] | [observation/test/read] | CERTAIN/LIKELY/UNCERTAIN/SPECULATIVE | verified/contradicted/pending | ... |
| 2 | ... | ... | ... | ... | ... |
```

Rules:
- Every claim in the ledger must have a source (not "I think").
- Confidence must be updated after each instrumentation run.
- Contradicted claims are marked and their descendants are invalidated.
- The ledger is the AI's memory — refer to it before every phase transition.

---

## Confidence Protocol

At each phase transition, the AI must state its confidence and what would change it:

| Gate | Minimum confidence | What to do if below |
|---|---|---|
| After Phase 2 (hypotheses) | 0.6 | Gather more evidence, generate more hypotheses |
| After Phase 3 (verification) | 0.7 | Rule out more alternatives, or gather targeted evidence |
| After Phase 4 (instrumentation) | 0.85 | Hypothesis is falsified — return to Phase 2 |
| Before Phase 5 (fix) | 0.9 | Pre-mortem must address all remaining gaps |
| After Phase 5 (fix applied) | 0.95 | Regression test + pre-mortem validation |
| Final (Phase 6) | 0.9 | Adversarial review must find no live alternatives |

---

## Anti-Patterns (Conquest-Specific)

| Anti-Pattern | Why It Fails |
|---|---|
| Accepting surface answers in questionnaire | Partial context = guessing = wasted cycles |
| Generating < 5 hypotheses | First-branch lock-in is guaranteed with fewer |
| Skipping hypothesis interrogation | Plausible-but-wrong narratives survive unchallenged |
| Confirming evidence as disconfirming | "My hypothesis predicts X, and I observed X" — but 3 other hypotheses also predict X |
| Skipping pre-mortem | Fixes that look correct often mask the bug instead of curing it |
| Proceeding below confidence threshold | Low confidence = high probability of wrong fix |
| Fixing without falsifying alternatives | You haven't proven your hypothesis, you've just confirmed one prediction |
| Declaring done without adversarial review | The case against the fix is usually more informative than the case for it |

---

## Trigger

Use when user says: "deep bug", "intermittent bug", "heisenbug", "ghost bug", "bug inquisition conquest", or when `bug-inquisition` (standard mode) has already failed to resolve the issue.
