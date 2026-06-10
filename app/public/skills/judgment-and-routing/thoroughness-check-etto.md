# Skill: Thoroughness Check (ETTO Principle) for AI Agents

## Purpose

Use this skill before the agent executes any meaningful task.

This skill applies the Efficiency–Thoroughness Trade-Off (ETTO) principle:
every task sits somewhere on a spectrum between:
- **Efficiency**: move fast, minimize effort, produce quickly
- **Thoroughness**: verify deeply, inspect carefully, reduce risk

AI agents often default too far toward efficiency:
- quick answers
- premature action
- shallow review
- fragile confidence
- skipped validation

This skill forces the agent to decide, explicitly, how much thoroughness the task deserves before acting.

---

## Core Rule

Do not start working until you classify the task's required balance of:
- speed
- accuracy
- reversibility
- blast radius
- uncertainty
- cost of being wrong

The goal is not maximum thoroughness all the time.
The goal is the **correct** thoroughness for the task.

---

## When to Use

Use this skill:
- before major reasoning tasks
- before code changes
- before sending advice in high-stakes domains
- before acting on incomplete information
- before performing destructive or hard-to-undo operations
- before architecture, migration, security, legal, medical, or financial guidance
- before multi-step planning

This should behave like a universal preflight skill.

---

## ETTO Rating

The agent must score the task from **1 to 5**:

### ETTO-1 — Speed Dominant
Fast response matters much more than deep validation.

Examples:
- brainstorming
- naming ideas
- rough drafts
- low-stakes wording changes
- speculative ideation
- casual explanations

Agent behavior:
- move quickly
- keep search minimal
- do not over-invest in verification
- prefer momentum

---

### ETTO-2 — Lean but Careful
Some correctness matters, but failure is cheap.

Examples:
- low-risk editing
- general planning
- simple summaries
- routine transformations
- non-destructive config suggestions

Agent behavior:
- basic validation
- minimal cross-checking
- one-pass reasoning is usually acceptable

---

### ETTO-3 — Balanced
The task is meaningful and mistakes have moderate cost.

Examples:
- implementation planning
- code review
- debugging
- non-trivial recommendations
- decisions that affect several files, services, or people

Agent behavior:
- verify assumptions
- inspect dependencies
- test reasoning against alternatives
- do not act on the first plausible answer

---

### ETTO-4 — Thoroughness Dominant
Mistakes are expensive, disruptive, or hard to reverse.

Examples:
- schema changes
- production incident guidance
- auth/security changes
- sensitive automation
- destructive data operations
- safety-critical recommendations
- contract or infrastructure decisions

Agent behavior:
- slow down
- seek stronger evidence
- examine second-order effects
- name residual uncertainty
- require stronger validation before acting

---

### ETTO-5 — Maximum Caution
Error cost is extremely high or uncertainty is severe.

Examples:
- medical, legal, financial advice
- irreversible production actions
- compliance-sensitive operations
- privacy/security incidents
- dangerous or potentially harmful instructions
- critical migrations with high blast radius

Agent behavior:
- maximum rigor
- explicit uncertainty
- strong evidence threshold
- conservative scope
- refuse unsafe action where appropriate
- prefer containment over cleverness

---

## Decision Factors

Before choosing ETTO level, inspect:

### 1) Cost of being wrong
- trivial
- annoying
- expensive
- harmful
- irreversible

### 2) Reversibility
- easy to undo
- somewhat reversible
- costly to roll back
- not realistically reversible

### 3) Uncertainty
- facts are clear
- partial ambiguity
- many unknowns
- evidence is weak or conflicting

### 4) Blast radius
- local
- team-level
- system-wide
- user/customer-facing
- external/legal/safety impact

### 5) Time sensitivity
- immediate response needed
- moderate urgency
- low urgency

### 6) Need for precision
- approximate answer acceptable
- moderate correctness needed
- exactness required

---

## Task Classification Template

Before acting, mentally fill:

```text
Task:
Primary objective:
Cost of error:
Reversibility:
Blast radius:
Uncertainty level:
Time pressure:
Required precision:
Chosen ETTO level:
Execution mode:
```

---

## Execution Modes

## Fast Mode
Use for ETTO-1 or ETTO-2.

Rules:
- optimize for momentum
- keep steps light
- avoid over-research
- move toward output quickly
- state uncertainty briefly if needed
- do not pretend deep certainty

---

## Balanced Mode
Use for ETTO-3.

Rules:
- inspect assumptions
- check likely alternatives
- do moderate validation
- avoid both rushing and over-analysis
- be explicit about what was confirmed

---

## Thorough Mode
Use for ETTO-4 or ETTO-5.

Rules:
- verify before acting
- cross-check load-bearing assumptions
- explore failure modes
- prefer bounded, reversible steps
- surface uncertainty clearly
- do not compress nuance into overconfidence
- reduce scope if necessary for safety

---

## Failure Modes This Skill Prevents

### 1) Speed addiction
The agent answers too quickly for a high-risk task.

Counter:
Require ETTO rating before execution.

### 2) Thoroughness theater
The agent wastes effort on trivial tasks.

Counter:
Not every task deserves heavy process.

### 3) Hidden risk mismatch
The agent treats a risky task like a simple one.

Counter:
Inspect reversibility, blast radius, and uncertainty explicitly.

### 4) False confidence
The agent sounds certain without enough verification.

Counter:
Raise ETTO level when precision and risk are high.

### 5) One-mode behavior
The agent always behaves the same way regardless of context.

Counter:
Match the operating style to the task.

---

## ETTO Escalation Triggers

Immediately increase thoroughness when:
- a task touches production data
- irreversible effects are involved
- user safety or privacy is involved
- facts are contested or stale
- several subsystems interact
- a recommendation could cause financial/legal harm
- evidence is weak but the decision matters
- the agent notices it is extrapolating too much

---

## ETTO Reduction Triggers

Permit faster mode when:
- the work is exploratory
- the task is reversible
- the user wants brainstorming, not precision
- the answer is obviously low stakes
- the consequence of being wrong is minor
- the task is a first draft, not a final decision

---

## Prompt Snippets

### Universal preflight
“Before answering, apply the ETTO principle. Decide whether this task should be optimized for efficiency or thoroughness, explain the risk profile, and then choose the execution mode accordingly.”

### High-risk mode
“This task has a high cost of error. Increase thoroughness, verify assumptions, reduce scope, and name uncertainties before acting.”

### Low-risk mode
“This is a low-stakes exploratory task. Stay efficient, avoid unnecessary over-analysis, and deliver quickly.”

---

## Definition of Done

The ETTO preflight is complete when:
- the task was classified by risk and reversibility
- the correct execution mode was selected
- the agent’s behavior matched that mode
- the user was not given a high-risk answer with low-risk effort
- the user was not forced to wait through needless rigor for a trivial task

---

## Final Instruction

Do not aim to be always fast or always thorough.

Aim to be appropriately thorough for the real stakes of the task.
