---
name: occam-root-cause
description: "Combo — Root Cause Analysis traces causal chains backward from a symptom; Occam's Razor selects the simplest root cause from competing candidates. Prefers a single verified cause over a complex multi-factor explanation unless the evidence requires it."
---

# Skill: Occam's Razor + Root Cause Analysis

## Purpose

Root Cause Analysis (RCA) generates candidate root causes by tracing causal chains (5 Whys, Ishikawa diagram). When multiple causal chains reach different root causes, RCA alone has no principled way to choose between them — the agent can drift toward the most *comprehensive* explanation rather than the *simplest sufficient* one.

This combo makes Occam's Razor the **root cause selection criterion**:

> Among root causes that fit all the evidence, prefer the simplest causal chain.

A single verified root cause is better than a plausible multi-factor explanation. Multi-factor explanations must earn their complexity by demonstrating that no single cause suffices.

---

## When to Use

Use this combo when:
- RCA has produced multiple candidate root causes
- the 5 Whys branched into different causal chains
- the Ishikawa diagram has multiple plausible causes across different categories
- competing root causes differ substantially in complexity
- you are tempted to accept a "multiple contributing factors" explanation without testing whether a single root cause suffices

Do not use when:
- RCA has produced a single clear root cause with strong causal evidence
- the problem is genuinely multi-causal (multiple independent failures must coincide)
- you are still in the evidence-gathering phase of RCA

---

## How It Works

```
Phase 1: RCA — Trace Causal Chains
  → Run standard RCA (symptom → 5 Whys → Ishikawa → candidate root causes)

Phase 2: Candidate Root Cause Audit
  → List each candidate root cause with its causal chain
  → Check each against all confirmed evidence
  → Discard candidates contradicted by any evidence

Phase 3: Simplicity Ranking (Occam's Razor)
  → Count causal steps and independent assumptions per surviving candidate
  → Rank: shortest causal chain → longest

Phase 4: Verify the Simplest Candidate
  → Design a falsification experiment for the top candidate
  → If confirmed → root cause found
  → If falsified → promote next simplest, repeat
```

---

## Step-by-Step Protocol

### Phase 1: Run Standard RCA First

Complete RCA through at least Step 5 (candidate root causes). Do not skip to this combo before you have actual candidate root causes.

```md
## Symptom
API returns 500s intermittently under load

## 5 Whys (branches)
Branch A: 500 → DB pool exhausted → connections not released → missing finally block → no code review checklist for resource cleanup
  → Candidate RC-A: Missing finally block in fetch_user()

Branch B: 500 → DB pool exhausted → pool size too small for traffic → capacity planning missed deployment sizing
  → Candidate RC-B: Pool undersized for current traffic
```

### Phase 2: Candidate Root Cause Audit

List each candidate with its causal chain and check against all confirmed evidence.

```md
## Confirmed Evidence
- E1: Pool exhaustion logs show connections held for 30+ seconds after request completes
- E2: Pool size is 10; concurrent requests during spike were 50
- E3: Code review for fetch_user() was done 6 months ago, no checklist item for resource cleanup

## Candidate Evaluation
| Candidate | Causal Chain | Fits E1 | Fits E2 | Fits E3 | Status |
|-----------|-------------|---------|---------|---------|--------|
| RC-A | Missing finally block → connections leaked | ✓ | ✓ | ✓ | Survives |
| RC-B | Pool too small → legitimately exhausted | ✓ | ✓ | — | Survives (E3 not applicable) |
```

### Phase 3: Simplicity Ranking

Count the causal steps and independent new entities each candidate introduces:

| Candidate | Causal Steps | New Entities | Assumptions | Count |
|-----------|-------------|--------------|-------------|-------|
| RC-A | 4 steps (missing finally → leaked → exhausted → 500) | 1 (code defect) | 1 (no review caught it) | **1 primary cause** |
| RC-B | 3 steps (undersized → legitimately exhausted → 500) | 2 (sizing decision + traffic spike) | 2 (spike was unforeseeable, sizing was reasonable at time) | **2 primary causes** |

**Rule:** RC-A has one causal chain with one code defect. RC-B requires accepting that both the sizing was reasonable *and* the spike was unforeseeable *and* no alerting caught it. RC-A is simpler.

```md
## Ranked Candidates
1. RC-A — 1 primary cause (missing finally block) → LEADER
2. RC-B — 2 primary causes (undersizing + unforeseeable spike) → second
```

**Important:** RC-B is not *wrong* — it may also be true. But the question is: does fixing RC-A prevent recurrence? If yes, RC-A is the root cause. RC-B is a contributing factor.

### Phase 4: Verify the Simplest Candidate

Design a falsification experiment for the leader. A root cause hypothesis must have a falsifiable prediction.

```md
### Leader: RC-A (missing finally block in fetch_user)
- Falsifiable prediction: "If I add a finally block, connections will be released and pool exhaustion will stop under the same load"
- Experiment: Add finally block → run load test matching the spike conditions
- If confirmed → RC-A is root cause; fix it
- If falsified (exhaustion still occurs) → RC-A was a contributing factor; promote RC-B
```

---

## Simplicity Ranking for Root Causes

When ranking causal chains, count:

| Factor | Cost | Example |
|--------|------|---------|
| Single defect | Lowest | One missing finally block |
| Single process gap | Low | No review checklist item |
| Multiple independent defects | Medium | Two different code paths both leak connections |
| Multi-factor coincidence | High | Code defect AND capacity AND traffic spike AND monitoring gap |
| Novel entity | Very high | "A new bug was silently introduced in a library nobody changed" |

**The test:** If fixing Candidate A eliminates the symptom, you do not need Candidate B to be true for the explanation to be sufficient. Candidate A is the root cause. Candidate B is a contributing factor.

---

## Examples

### Example 1: Intermittent 500s

```
RCA candidates:
RC-A: Missing finally block in fetch_user() → leaked connections → pool exhausted → 500s
RC-B: DB pool sized for 10 connections → traffic spike to 50 → legitimate exhaustion → 500s
RC-C: Connection leak in middleware + pool undersized + monitoring gap → 500s

Evidence:
- E1: Connections held 30s after request completion → supports RC-A (leaked, not legitimately busy)
- E2: Pool is 10; peak was 50 → supports RC-B (legitimate capacity issue)
- E3: Adding a finally block eliminates the 500s under identical load → RC-A confirmed

Ranking:
1. RC-A — 1 cause, falsifiable, confirmed → ROOT CAUSE
2. RC-B — contributing factor (pool should be larger, but exhaustion was caused by leaks not load)
3. RC-C — over-complex; multiple causes not needed to explain the evidence

Result: Fix RC-A. RC-B is noted as a follow-up capacity improvement but not the root cause.
```

### Example 2: "Works on my machine"

```
RCA candidates:
RC-A: Local env has Node 20; CI has Node 18 → different behavior
RC-B: CI has TZ=UTC; local has TZ=local → time-dependent test fails
RC-C: CI runs tests in parallel; local runs serially → race condition

Evidence:
- E1: CI logs show Node 18.18.0 → RC-A not falsified
- E2: CI logs show TZ=UTC but test failure is not in time-dependent code → RC-B falsified
- E3: CI shows sequential test execution → RC-C falsified

Ranking:
1. RC-A — only surviving candidate → ROOT CAUSE (pending verification)
- Falsification: Pin CI to Node 20 → test passes → RC-A confirmed
```

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|---|---|
| Accepting "multiple contributing factors" as the root cause | Contributing factors are not root causes; a root cause, once fixed, prevents recurrence |
| Choosing the most comprehensive explanation | Comprehensive ≠ correct; the simplest sufficient cause wins |
| Skipping falsification because the leader "makes sense" | "Makes sense" is not evidence; falsify before fixing |
| Treating all surviving candidates as equally likely | Simplicity is the tiebreaker when evidence is equally consistent |
| Escalating to multi-factor because single-factor feels "too simple" | Simplicity is not a flaw; multi-factor requires evidence that single-factor cannot suffice |

---

## The "Is It Actually Multi-Causal?" Test

Before accepting a multi-factor root cause, run this test:

> "If I fix only Factor A, will the symptom recur under the same conditions?"

- **Yes** → Factor A alone is insufficient; the explanation may genuinely be multi-causal
- **No** → Factor A alone prevents recurrence → Factor A is the root cause; the others are contributing factors

Multi-causal explanations are rare. Default to single-cause. Escalate to multi-cause only when single-cause has been falsified.

---

## Pairing Guide

- **root-cause-analysis** — the base skill; this combo adds simplicity-ranked selection among competing root causes
- **occam-abduction** — use occam-abduction to generate candidate causes, then occam-root-cause to select and verify the simplest
- **specter** — specter generates hypotheses structurally; this combo picks the simplest verified root cause
- **pre-mortem** — run pre-mortem on the winning root cause before committing to the fix
- **occam-mcts** — use occam-mcts to explore fix branches; use this combo to determine which root cause the fix should address

---

## Definition of Done

This combo was applied correctly when:
- RCA was completed through candidate root cause identification
- All candidate root causes were listed with their full causal chains
- Each candidate was checked against all confirmed evidence before ranking
- Causal chains were ranked by simplicity (fewest steps, fewest independent new entities)
- The simplest surviving candidate was verified with a falsification experiment
- Multi-causal explanations were only accepted after single-cause was falsified
- The final root cause is the simplest sufficient explanation, not the most comprehensive

---

## Final Instruction

Trace the chain back. List every candidate cause. Pick the simplest one that fits. Verify it before you fix. Multi-causal explanations are expensive — make them prove they are necessary.
