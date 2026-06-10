# Skill: Pre-Mortem — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must formally validate a plan before execution by assuming failure has already occurred and working backward to identify what went wrong, rank the risks, and adjust the plan.

This is the protocol version of the Pre-Mortem framework.
It adds mandatory artifact creation, explicit state gating, and circuit breakers to prevent:
- surface-level risk listing without narrative specificity
- skipping from failure generation directly to execution without plan adjustment
- treating the pre-mortem as a formality rather than a genuine planning gate

Source: Gary Klein's research on naturalistic decision-making, *Sources of Power*.

---

## Core Law

The plan must survive the pre-mortem before it earns the right to be executed.

---

## Mandatory Diagnostic Artifact

Before proceeding to plan adjustment, create `pre-mortem-report.md`.

Required structure:

```md
# Pre-Mortem Report

## Plan Summary
<the plan being validated, stated clearly>

## Failure Assumption
"It is [future date]. The plan was executed. It failed — clearly and materially. This report explains why."

## Failure Stories
1. <specific narrative: what went wrong and how>
2. <specific narrative>
3. <specific narrative>
4. <specific narrative>
5. <specific narrative>
(minimum 5; add more if warranted)

## Ranked Failure Stories
| Story # | Description | Likelihood | Severity | Detectable Early? |
|---------|-------------|-----------|----------|------------------|

## Top Risk Profiles
### Risk 1: <name>
- Failure story: <which story>
- Root condition: <what must be true for this to occur>
- Early warning signal: <what would indicate this is starting>
- Prevention: <plan change that reduces likelihood>
- Contingency: <what to do if it begins anyway>

### Risk 2: <name>
(repeat structure)

## Plan Adjustments
- <change to the plan>
- <monitoring or detection added>
- <explicit accepted tradeoff>

## Residual Risks
| Risk | Why Accepted | Owner | Review Trigger |
|------|-------------|-------|---------------|

## Pre-Mortem Verdict
<proceed / adjust and proceed / do not proceed — and brief rationale>
```

---

## State Machine

## State 0 — Plan Intake

Goal:
- confirm the plan is specific enough to pre-mortem

Requirements:
- the plan must have a defined execution sequence, timeline, or commitment
- the plan must have identifiable dependencies and assumptions
- there must be a clear definition of what failure would mean

If the plan is too vague to pre-mortem:
- stop and require the plan to be specified before returning here

Disallowed:
- pre-morteming a vague intent rather than a real plan
- skipping this confirmation step because the plan "feels ready"

Exit condition:
- plan is specific and documented in `pre-mortem-report.md` Plan Summary section

---

## State 1 — Failure Assumption

Goal:
- formally assume failure and write the failure premise

The agent must state:
"It is [timeframe]. The plan was executed and it failed — clearly, materially, visibly. We are now looking back and explaining why."

This statement must appear in `pre-mortem-report.md`.

This is not optional.
The failure assumption is the cognitive frame that makes the pre-mortem work.
Hedging it ("what if it fails?") does not activate the same reasoning mode.

Exit condition:
- failure assumption is written explicitly and unhedged

---

## State 2 — Failure Story Generation

Goal:
- generate at least five specific narrative failure stories from the vantage point of retrospective failure

Rules:
- each story must be specific (not "scope creep" but "the data migration took three weeks instead of five days because the legacy schema had undocumented nullability constraints")
- generate before ranking — do not filter for plausibility during generation
- include stories across multiple failure categories:
  - execution failure
  - dependency failure
  - assumption failure
  - scope or complexity failure
  - human / coordination failure
  - timing failure
  - unknown unknowns / surprises

Minimum: five stories.
For high-stakes plans: eight to ten.

Disallowed:
- generic category labels without narrative specificity
- stopping at three stories because they feel sufficient
- filtering stories for plausibility before all are written

Exit condition:
- minimum five specific failure stories written in `pre-mortem-report.md`

---

## State 3 — Ranking

Goal:
- rank failure stories by likelihood, severity, and early detectability

Ranking criteria:
- **Likelihood**: given what is known about the context, how probable is this scenario?
- **Severity**: if it occurs, how bad is the outcome?
- **Detectable early**: can this failure be caught before it becomes catastrophic?

Rules:
- do not treat all risks equally
- high-likelihood + high-severity + low early detectability = highest priority
- a very severe but near-impossible risk outranks a mild but very probable one only if the severity is truly catastrophic

Exit condition:
- ranked table exists in `pre-mortem-report.md`
- top three to five risks are identified

---

## State 4 — Risk Profile Development

Goal:
- build actionable profiles for the top-ranked risks

Each risk profile must include:
- the root condition that enables the risk
- an early warning signal that would indicate it is beginning
- a prevention (plan change that reduces likelihood)
- a contingency (what to do if it begins anyway)

Rules:
- prevention must be a real plan change, not just awareness
- early warning signals must be specific enough to monitor
- contingencies must be pre-decided, not deferred

Disallowed:
- risk profiles that consist only of a description
- early warning signals that are not observable
- preventions that amount to "be careful"

Exit condition:
- top risks have full profiles in `pre-mortem-report.md`

---

## State 5 — Plan Adjustment

Goal:
- revise the plan based on what the pre-mortem revealed

Three categories of adjustment:
1. **Change the plan**: reduce the likelihood or severity of a top risk
2. **Add detection**: build monitoring or checkpoints that catch early warning signals
3. **Accept explicitly**: name which risks are accepted as tradeoffs and why

Rules:
- at least one top risk must produce a plan change or explicit monitoring addition
- accepted risks must be named and owned, not silently ignored
- residual risks after adjustment must be documented with review triggers

Exit condition:
- plan adjustments are documented
- residual risk table is complete

---

## State 6 — Verdict

Goal:
- issue the pre-mortem verdict and gate execution

**Proceed:**
- top risks have prevention or detection
- residual risks are accepted explicitly
- the plan is stronger because of the pre-mortem

**Adjust and proceed:**
- specific plan changes are required before execution begins
- list the required changes and who is responsible for them

**Do not proceed:**
- a top risk has no viable prevention or contingency
- a dependency is missing that cannot be compensated for
- the plan assumptions are so uncertain that the pre-mortem revealed the plan is not yet ready

Exit condition:
- verdict is documented in `pre-mortem-report.md`
- if proceed, plan adjustments are implemented or explicitly scheduled
- if do not proceed, the reason is clear and specific

---

## Tool Gating

### Generation phases (States 1–3)
Allowed:
- read, inspect context, review the plan
- artifact writing

Disallowed:
- any execution of the plan being pre-mortemd

### Plan Adjustment phase (State 5)
Allowed:
- revise planning documents, architecture documents, checklists
- add monitoring or alerting requirements

Disallowed:
- executing the revised plan until the verdict is issued

---

## Circuit Breakers

Stop and escalate if:
- fewer than five failure stories are generated and the plan is high-stakes
- all failure stories are generic categories without narrative specificity
- no top risk produced a plan change
- the failure assumption was hedged ("if it fails")
- the verdict is "proceed" but no top risk has prevention or detection

---

## Failure Modes This Skill Prevents

- surface-level risk lists that do not change the plan
- optimism bias in consensus-built plans
- assuming dependencies will hold without verifying them
- executing a plan without naming and accepting residual risks
- pre-mortem theater (going through the motions without genuine generation)

---

## Definition of Done

This skill is correctly applied when:
- `pre-mortem-report.md` exists
- the failure assumption was stated explicitly and unhedged
- at least five specific narrative failure stories were generated
- stories were ranked by likelihood and severity
- top risks have full profiles: root condition, warning signal, prevention, contingency
- plan adjustments were made or risks were explicitly accepted
- a clear verdict was issued

---

## Pairing Guide

- **Inversion State Machine** — use Inversion for abstract failure-mode analysis; use this for plan-specific narrative failure; they are complementary on high-stakes work
- **Checklist Manifesto** — after the pre-mortem, use the Checklist Manifesto to encode key risk checks into the execution procedure
- **Unsafe Control Actions** — use after pre-mortem to analyze timing- and sequencing-sensitive risks in detail
- **ETTO State Machine** — use ETTO to decide whether a full pre-mortem is warranted

---

## Final Instruction

The plan has already failed.
You are explaining why.

Generate the stories.
Rank them honestly.
Fix what can be fixed.
Name what cannot.
Then decide whether to proceed.
