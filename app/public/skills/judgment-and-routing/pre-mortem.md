# Skill: Pre-Mortem for AI Agents

## Purpose

Use this skill when the agent must surface the real risks in a plan before committing to it.

A pre-mortem works by assuming the plan has already failed — catastrophically, visibly — and then reasoning backward to explain why.

This is distinct from Inversion, which asks "how could this fail?" abstractly.
A pre-mortem uses a specific, vivid narrative: *it is six months from now, the plan was executed, and it failed. What happened?*

The narrative framing activates a different kind of reasoning.
People generate better and more specific failure hypotheses when they assume failure has already occurred rather than when they are asked to imagine it might.

Source: Gary Klein's research on naturalistic decision-making, *Sources of Power*. Widely applied in project planning, medicine, and product development.

---

## Core Rule

Assume the failure has already happened.
You are not predicting whether it will fail.
You are explaining why it did.

This shifts the cognitive mode from protective optimism ("it probably won't fail") to forensic realism ("it failed — what went wrong?").

---

## When to Use

Use this skill when:
- finalizing a plan before execution begins
- reviewing a strategy, architecture, or design that has significant consequences
- evaluating a rollout, migration, or launch
- making a high-stakes commitment with limited ability to reverse
- the plan has strong support and consensus (high risk of optimism blindness)
- complementing an Inversion analysis with a more vivid failure scenario

Do not use this skill for:
- trivial, easily reversible decisions
- exploratory work without a defined plan
- situations where no plan exists yet (use Inversion or First Principles instead)

---

## Standard Pre-Mortem Workflow

## Step 1: State the Plan
Write down the plan as it currently exists.
Be specific: what is being done, when, by whom, in what sequence, with what dependencies.

## Step 2: Invoke the Failure Assumption
State explicitly:
"It is [a future date]. The plan was executed. It failed — clearly, obviously, materially.
We are now looking back and explaining what happened."

Do not hedge this. The plan failed. That is the premise.

## Step 3: Generate Failure Stories
From the failure-assumed vantage point, generate plausible stories for what went wrong.

Useful categories:
- **Execution failures** — the plan was wrong about what was needed
- **Dependency failures** — something external that was assumed did not happen
- **Assumption failures** — a belief that was central to the plan turned out to be false
- **Scope failures** — the problem turned out to be larger, different, or more complex than expected
- **Human / coordination failures** — the people needed to execute the plan were unavailable, misaligned, or overloaded
- **Timing failures** — the plan took longer than expected and the context changed before it was complete
- **Unknown unknowns** — something happened that was not on anyone's radar

Generate at least five failure stories before stopping.
Do not filter for plausibility at this stage — capture first, rank later.

## Step 4: Rank the Failure Stories
After generating, rank by:
- likelihood given what is known about the context
- severity of outcome if it occurred
- whether the failure is detectable before it becomes catastrophic

## Step 5: Convert to Guardrails
For the top-ranked failure stories:
- what would prevent this failure?
- what signal would warn that this failure is beginning?
- what would you do differently in the plan to reduce this risk?

## Step 6: Adjust the Plan
Revise the plan based on what the pre-mortem revealed.
Some risks become pre-execution changes.
Some risks become monitoring requirements.
Some risks become explicit accepted tradeoffs.

---

## Pre-Mortem Template

```md
## The Plan
<describe the plan clearly>

## Failure Assumption
"It is [future date]. The plan was executed and it failed. We are now explaining why."

## Failure Stories
1. <what went wrong — be specific and narrative>
2. <what went wrong>
3. <what went wrong>
4. <what went wrong>
5. <what went wrong>

## Ranked Failure Stories
| Story | Likelihood | Severity | Detectable Before Catastrophe? |
|-------|-----------|----------|-------------------------------|

## Top Risks
- <risk>: <prevention> / <detection signal>

## Plan Adjustments
- <what changes in the plan>
- <what monitoring is added>
- <what risks are explicitly accepted>

## Residual Risk
<what risks remain after adjustments, and why they are accepted>
```

---

## Agent Rules

### Do
- assume failure fully and narratively — do not hedge
- generate specific failure stories, not abstract categories
- include at least five failure stories before ranking
- revise the plan based on the most serious risks revealed

### Do Not
- confuse the pre-mortem with pessimism — the goal is plan improvement, not discouragement
- generate only obvious surface risks
- skip the narrative step and jump straight to abstract risk listing
- treat all failure stories as equally important before ranking

---

## How Pre-Mortem Differs from Inversion

| | Inversion | Pre-Mortem |
|---|---|---|
| **Framing** | "How could this fail?" | "It already failed — why?" |
| **Cognitive mode** | abstract risk analysis | retrospective narrative |
| **Output** | failure modes → guardrails | failure stories → plan adjustments |
| **Best for** | strategy and design review | plan validation before commitment |
| **Source** | Charlie Munger, mental models | Gary Klein, naturalistic decision-making |

Use both when a decision is high-stakes.

---

## Failure Modes This Skill Prevents

### 1) Optimism blindness in consensus
When a team agrees a plan is good, the pre-mortem breaks the psychological safety of the consensus and forces failure hypotheses out.

### 2) Surface-level risk analysis
Generic risks like "scope creep" or "unexpected delays" are too vague to act on. Narrative failure stories produce specific, actionable risks.

### 3) Dependency overconfidence
Plans routinely fail because external dependencies were assumed rather than verified. Failure stories surface the specific dependencies that are most at risk.

### 4) Planning inside the happy path
Most plans are designed as if the happy path is the normal path. Pre-mortem forces engagement with the other paths.

---

## Pairing Guide

- **Inversion** — use Inversion for abstract failure-mode enumeration; use Pre-Mortem for vivid narrative failure scenarios; they are complementary
- **Second-Order Thinking** — second-order analysis reveals downstream effects; pre-mortem reveals narrative failure causes; use together for high-stakes plans
- **ETTO** — use to decide whether a full pre-mortem is warranted before this plan
- **Unsafe Control Actions** — use after the pre-mortem identifies timing- or sequence-sensitive failure modes
- **Inversion State Machine** — the state machine version of inversion adds formal guardrail mapping; use it after pre-mortem if the stakes require full documentation

---

## Definition of Done

A pre-mortem was applied correctly when:
- the failure assumption was stated explicitly, not hedged
- at least five specific failure stories were generated
- stories were ranked by likelihood and severity
- the top risks were converted to plan changes or monitoring requirements
- the plan was revised or residual risks were explicitly accepted

---

## Final Instruction

The plan has already failed.
You are looking back.
What happened?

Be specific.
Be honest.
Then fix the plan.
