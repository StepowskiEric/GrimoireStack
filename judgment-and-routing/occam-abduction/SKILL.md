---
name: occam-abduction
description: "Combo — Abductive reasoning generates competing hypotheses for an observed effect; Occam's Razor selects the winner by preferring the simplest explanation that fits all the evidence. Prefers parsimony over plausibility."
---

# Skill: Occam's Razor + Abductive Reasoning

## Purpose

Abduction ("inference to the best explanation") generates multiple competing hypotheses for an observed effect. But it has no built-in tiebreaker when several hypotheses are consistent with the evidence — the agent can drift toward the most *plausible-sounding* hypothesis rather than the *simplest sufficient* one.

This combo makes Occam's Razor the **selection criterion**:

> Among hypotheses that fit all the evidence, prefer the one with the fewest assumptions.

Simplicity is not a secondary filter. It is the primary discriminator. Plausibility without parsimony loses.

---

## When to Use

Use this combo when:
- there are multiple competing explanations for an observed effect (bug, symptom, behavior)
- the hypotheses differ in how many assumptions each requires
- the evidence does not cleanly distinguish between them
- you need a principled way to choose between explanations that all "seem right"

Do not use when:
- there is only one plausible hypothesis (no competition to adjudicate)
- the simplest hypothesis has already been explicitly falsified
- the problem is deductive (the answer follows from given premises) rather than abductive

---

## How It Works

```
Phase 1: Abduction — Generate Competing Hypotheses
  → Observe the effect
  → Generate 3–5 hypotheses that could explain it
  → Each hypothesis must have a falsifiable prediction

Phase 2: Evidence Audit — Check What Actually Fits
  → For each hypothesis, check whether ALL known evidence is consistent
  → Discard hypotheses contradicted by any confirmed evidence
  → Survivors: hypotheses that fit all known evidence

Phase 3: Simplicity Ranking (Occam's Razor)
  → Count assumptions per surviving hypothesis
  → Rank: fewest assumptions → most assumptions
  → The leader is the current best explanation

Phase 4: Falsify or Confirm
  → Design the cheapest probe that distinguishes the top 2
  → Run it
  → If simplest is confirmed → done
  → If simplest is falsified → promote next simplest, repeat
```

---

## Step-by-Step Protocol

### Phase 1: Abduction — Generate Competing Hypotheses

Generate 3–5 structured hypotheses for the observed effect. Each hypothesis must include a falsifiable prediction — a specific observation that would prove it wrong.

```md
## Observed Effect
<what actually happened — exact, not interpreted>

## Hypotheses

### H1: <label>
- Premise: If <this were true>, then <this effect> would occur
- Assumptions: [list each assumption this hypothesis requires]
- Falsifiable prediction: "If H1 is wrong, we would see <specific observation>"

### H2: <label>
...

### H3: <label>
...
```

Rule: Include at least one "obvious" hypothesis and at least one "weird" hypothesis. The obvious one is often wrong; the weird one sometimes isn't.

---

### Phase 2: Evidence Audit

For each hypothesis, check it against every confirmed piece of evidence. A hypothesis is eliminated if *any* confirmed evidence contradicts it.

```md
## Evidence
- E1: <confirmed observation>
- E2: <confirmed observation>
- E3: <confirmed observation>

## Hypothesis Evaluation
| Hypothesis | Fits E1 | Fits E2 | Fits E3 | Status |
|------------|---------|---------|---------|--------|
| H1         | ✓       | ✓       | ✗       | FALSIFIED |
| H2         | ✓       | ✓       | ✓       | Survives |
| H3         | ✓       | ✓       | ✓       | Survives |
```

After this step, only *surviving* hypotheses move to Phase 3. Eliminated hypotheses are dead — do not revisit them unless new evidence appears.

---

### Phase 3: Simplicity Ranking (Occam's Razor)

For each surviving hypothesis, count its **independent assumptions**. Rank fewest → most.

```md
## Assumption Counts
| Hypothesis | Assumptions | Count |
|------------|-------------|-------|
| H2         | [A] Cache was stale at time T | 1 |
| H3         | [A] Cache was stale at time T, [B] invalidation triggered by race, [C] DB write succeeded silently | 3 |

## Ranked Survivors
1. H2 — 1 assumption (simplest)
2. H3 — 3 assumptions
```

The hypothesis with the fewest independent assumptions is the **current leader**. It is the simplest explanation that fits all known evidence.

> Simplicity does not mean "obvious." It means "fewest new assumptions beyond what is already established."

---

### Phase 4: Falsify or Confirm

The leader is not automatically correct — it is the *default* until falsified. Design the cheapest probe that distinguishes the leader from the runner-up.

```md
### Probe Design
- Leader: H2 (1 assumption — stale cache)
- Runner-up: H3 (3 assumptions — stale + race + silent write)
- Distinguishing observation: "Was the cache entry written at the expected time?"
- Probe: Check cache write timestamp vs. invalidation event timestamp

### Result
- Cache write timestamp = 14:03:01, invalidation event = 14:03:02
- Cache was NOT stale — it was written 1 second before invalidation
- H2 FALSIFIED
- H3 now leader (only surviving hypothesis, not yet falsified)

### Next Step
Probe H3's race condition: check concurrent write ordering at time of invalidation
```

Continue until a hypothesis is confirmed or all are falsified (restart abduction with revised assumptions).

---

## Simplicity Scoring Guide

When counting assumptions, distinguish between:

| Assumption Type | Cost | Example |
|---|---|---|
| **Established fact** | Free | "The user is authenticated" — already confirmed |
| **Reasonable default** | Low | "The function was called with default args" — no evidence against it |
| **Unverified mechanism** | Medium | "A background job triggered the write" — not observed |
| **Compound mechanism** | High | "A race condition + silent failure + cache miss" — multiple unverified chains |
| **Novel entity** | Very high | "A new bug was introduced in a library nobody touched" — posits a new cause |

**Rule:** Every unverified mechanism or novel entity in a hypothesis is an assumption. Count them.

---

## Examples

### Example 1: Profile fetch returns 500

```
Effect: API returns 500 when fetching profile for user 42

Hypotheses:
H1: User record is corrupted in DB [1 assumption: corruption]
H2: Auth middleware rejects the token for this user [1 assumption: auth failure]
H3: Profile merge logic has a null dereference on this user's data [1 assumption: null field]
H4: Load balancer routes this user to a broken instance [2 assumptions: LB misconfiguration + this user affected]

Evidence:
- E1: Other users fetch profiles fine → falsifies H4 (not LB-wide)
- E2: Token is valid in the request log → falsifies H2
- E3: User record in DB looks normal → falsifies H1
- E4: Stack trace shows null dereference in profile merge → H3 fits all evidence

Ranking after evidence audit:
1. H3 — 1 assumption, fits all evidence → LEADER
H1, H2, H4 falsified.

Result: H3 confirmed. Profile merge has a null field for user 42.
```

### Example 2: "It works on my machine"

```
Effect: Tests pass locally but fail in CI

Hypotheses:
H1: CI environment has different dependencies [2 assumptions: version drift + affects tests]
H2: CI has a different timezone [1 assumption: TZ set differently]
H3: CI runs tests in parallel, creating a race condition [2 assumptions: parallel execution + race]

Evidence:
- E1: CI logs show "TZ=UTC" → H2 falsified (timezone confirmed different, but test failures are not time-related)
- E2: CI shows tests running sequentially → falsifies H3
- E3: `npm ls` in CI shows different minor version of a test utility → H1 fits

Ranking:
1. H1 — 1 remaining assumption (version drift fits all evidence) → LEADER

Result: H1 confirmed. CI dependency mismatch.
```

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|---|---|
| Accepting the most plausible-sounding hypothesis | Plausibility is not evidence; the simplest one that fits wins |
| Mixing assumptions into "the evidence" | Assumptions are what the hypothesis brings, not what is already known |
| Keeping falsified hypotheses alive "just in case" | Falsified hypotheses are dead until new evidence resurrects them |
| Escalating complexity because the simple explanation feels "too simple" | Simplicity is not a flaw; "it feels too simple" is not a falsification criterion |
| Skipping the assumption count | If you don't count assumptions, you can't rank by simplicity |
| Confirming the leader without probing | Confirmation without a probe is just preference dressed as reasoning |

---

## When to Stop Applying This Skill

Stop when:
- A surviving hypothesis is confirmed by a decisive probe
- All surviving hypotheses have been falsified (restart abduction with new assumptions)
- The surviving hypothesis is actionable and the simplest viable option

Do not apply this skill to force a conclusion when the evidence is genuinely ambiguous — it is fine to say "the evidence is insufficient to choose between H2 and H3."

---

## Pairing Guide

- **Specter** — Specter generates the hypotheses via abduction; occam-abduction selects the winner via simplicity ranking
- **Root Cause Analysis** — RCA verifies the causal chain of the winning hypothesis; occam-abduction picks which hypothesis RCA should run against
- **MCTS / occam-mcts** — Use occam-abduction to pick the initial hypothesis/branch, then occam-mcts to explore it systematically
- **Pre-Mortem** — Apply pre-mortem to the winning hypothesis before acting on it, especially if the winner has medium confidence

---

## Definition of Done

This combo was applied correctly when:
- 3+ competing hypotheses were generated with falsifiable predictions
- Evidence was audited against each hypothesis before any simplicity ranking
- Falsified hypotheses were explicitly discarded, not set aside
- Assumptions were counted and documented, not estimated
- The winning hypothesis was selected by fewest assumptions, not by narrative appeal
- The leader was confirmed or falsified with a targeted probe before acting on it
- If the simplest hypothesis was falsified, escalation was explicit and justified

---

## Final Instruction

Generate the hypotheses. Audit the evidence. Count the assumptions. The simplest explanation that fits all the evidence wins — until proven otherwise.
