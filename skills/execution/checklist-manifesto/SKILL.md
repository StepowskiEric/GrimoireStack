---
name: checklist-manifesto
description: "Build the smallest useful checklist for high-stakes procedures, gate execution on checklist completion, stop cleanly and escalate if it cannot be cleared."
triggers:
  - high-stakes-procedure
  - skip-ahead-error-history
  - irreversible-action
  - shared-system-impact
disable-model-invocation: true
---

# Checklist Manifesto

**Confidence is not a substitute for the checklist.** In complex high-stakes domains, failure rarely comes from lack of expertise — it comes from experts skipping steps they know but fail to execute under pressure, time constraints, or cognitive overload. The solution is not more expertise; it is a minimal, purpose-built checklist that enforces the steps that matter. Do not proceed because it feels ready — proceed because the checklist is cleared.

## When to Use
- High-stakes task with significant blast radius
- Known procedure with documented steps, where mistakes have occurred
- Time pressure or uncertainty
- External state changes, irreversible actions, or shared-system impact

Skip it: trivial well-understood steps, exploratory work with no defined procedure, or when the checklist would be more complex than the task.

## The Move

### 1. Classify — is a checklist warranted, and which type?
Select the type at invocation:
- **Read-do** — read each item, then do it; when steps must happen in order and each depends on the prior
- **Do-confirm** — do the work from memory, then confirm against the checklist; when experts know the steps but need a final gate before a critical point

### 2. Construct — the smallest useful checklist
Create `procedure-checklist.md` (template in Reference): task, checklist type, risk level, **pause points** (moments requiring human review), pre-procedure checks, procedure steps each with a confirm line ("what proves this is done"), post-procedure checks, **exception triggers** (conditions that halt and escalate), and rollback/recovery. Rules: include only items that have caused failures before; keep items brief, actionable, and binary; no padding with ceremony. **One screen max** — if it doesn't fit, split into sub-procedures.

### 3. Pre-confirm — clear the gate before execution
Walk every pre-procedure item explicitly — state it, then confirm it. If any item cannot be cleared: stop, document the blocker, do not proceed. Read-do reads aloud then does; do-confirm confirms what was already done.

### 4. Execute — step by step, confirmed with evidence
Execute each step in order, confirming each with evidence before the next. Do not skip steps because they seem obvious; do not batch-confirm multiple steps. Respect pause points — stop and wait for the required confirmation. On an exception trigger, halt immediately. When a step confirmation fails: stop, document, do not continue unless resolved or a recovery path exists — then execute rollback/recovery.

### 5. Confirm & close — post-procedure, then done or escalate
Clear post-procedure checks: system in expected state, data integrity, no side effects, downstream unaffected, monitoring active. **Done** when all three sections cleared with no exception triggers. **Escalate** when any item cannot be cleared with reasonable effort, a trigger fires and recovery fails, a pause point lacks required human confirmation, or the procedure itself is wrong for the situation.

## Reference
For the `procedure-checklist.md` template, tool gating, circuit breakers, failure modes, and pairing guide, see [`references/checklist-details.md`](references/checklist-details.md).

## Rules
- **Do** confirm every step with evidence — assumption is not confirmation.
- **Do** keep the checklist minimal — exhaustive lists get skimmed, not executed.
- **Do** honor pause points and exception triggers without negotiation.
- **Do** stop and document when a check fails; improvisation past a failed gate is the failure mode.
- **Do** rebuild the checklist when the task scope changes.
