---
name: thoroughness-check-etto-state-machine
description: "Gate task execution by the Efficiency-Thoroughness Trade-Off: classify rigor 1-5, meet the evidence bar, act within the mode, validate to match."
triggers:
  - preflight-gate
  - rigor-classification
  - evidence-threshold
  - risk-escalation
disable-model-invocation: true
---

# Thoroughness Check (ETTO)

**Match rigor to the real stakes of the task.** ETTO (Efficiency–Thoroughness Trade-Off) is a preflight gate: classify the task on a 1–5 rigor scale before acting, then hold evidence, execution, and validation to that level. It prevents fast low-rigor responses on high-risk work — and over-analysis of trivial work.

## The Move

### 1. Intake — frame the task
Restate the task in one sentence. Trivial and reversible? ETTO may be lightweight. Non-trivial? ETTO is mandatory. Before any action, create `etto-preflight.md` (template in Reference).

### 2. Classify — pick the ETTO level
Rate the task 1–5 by cost of error, reversibility, blast radius, and uncertainty:
- **1 Speed** — brainstorming, rough drafts
- **2 Lean** — simple edits, low-risk changes
- **3 Balanced** — non-trivial implementation, debugging, review
- **4 Thorough** — migrations, auth, security, destructive operations
- **5 Maximum** — medical/legal/financial, irreversible actions

Name the evidence threshold, execution mode, and validation level for that rating in the preflight.

### 3. Evidence gate — meet the bar before acting
Gather only what the level demands: 1–2 light, 3 moderate (check assumptions, inspect key dependencies), 4 strong (verify load-bearing assumptions, blast radius, rollback), 5 very strong (conservative scope, explicit uncertainty, refusal or safe redirection where warranted). Never act below the declared bar; never hide missing evidence.

### 4. Execute — within the mode
- **Fast (1–2):** move quickly, low ceremony, brief uncertainty note.
- **Balanced (3):** verify important assumptions, avoid first-answer lock-in.
- **Thorough (4):** bounded reversible steps, containment over aggressive change.
- **Maximum (5):** narrow scope, explicit safety boundaries, refuse unsafe action.

### 5. Validate & close — match the declared bar
Validate to the declared level (1 light plausibility → 5 maximum validation or safe non-execution). Compare the result to the objective; state residual uncertainty honestly. Escalate when blast radius is unknown, facts stay highly uncertain, the evidence bar cannot be met, or the task moved up a class midstream.

## Reference
For the `etto-preflight.md` template, the per-level evidence/mode/validation matrix, tool gating, circuit breakers, and failure modes, see [`references/etto-details.md`](references/etto-details.md).

## Rules
- **Do** create `etto-preflight.md` before acting on any non-trivial task.
- **Do** raise the ETTO level when evidence or blast radius grows midstream.
- **Do** claim completion only when validation passed at the declared level.
- **Do** refuse or safely redirect when the task demands certainty you don't have.
