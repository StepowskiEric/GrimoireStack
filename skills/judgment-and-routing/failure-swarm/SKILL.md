---
name: failure-swarm
description: Swarm 3-5 critic personas over a spec to surface failure modes pre-implementation. User-invoked; type `/failure-swarm`.
disable-model-invocation: true
---

# Failure Swarm

Multi-persona critic loop for specs and plans. Each persona generates failure hypotheses in round 1, sees others in round 2, cross-challenges in round 3 (opt-in). God-eye injection between rounds 2→3.

Pre-mortem is round 1 with one narrator. This is the multi-agent, stateful version.

---

## Sizing

Detect feature size from the user's framing, file list, and dependency footprint. When unclear, ask.

| Size | Personas | Rounds | Trigger words |
|---|---|---|---|
| **small** | 3 | 2 | single file, tweak, fix |
| **medium** | 4 | 2 + injection | feature, refactor, migration |
| **large** | 5 | 3 + 2 injections | system, cross-service, launch |

Persona slots fill top-down from the menu. User can swap any slot by name.

---

## Personas

Flat menu. Each is a one-line role the agent recruits from pretraining:

- **Skeptic** — questions every premise and assumption in the spec
- **Adversary** — attacks contracts, types, and trust boundaries
- **Edge-case Hunter** — weird inputs, sequences, concurrency, time, locales, partial state
- **Second-Order** — chains consequences across services, teams, and time
- **Historical Matcher** — "this shape resembles the bug we had in [precedent]"

For **medium**, drop Historical Matcher. For **small**, drop Historical Matcher and Second-Order.

---

## Protocol

### Step 1 — Size + personas
Detect size, pick persona set, set round cap. Persist the chosen personas.
**Done when:** persona list is non-empty; round cap ∈ {2, 3}.

### Step 2 — Round 1: independent hypotheses
Spawn each persona with the spec only (no peers' findings). Each returns:
- failure story (narrative, not category)
- category (from the flat list below)
- evidence pointer (file:line or section)
- severity self-rating (low / med / high)

**Done when:** every persona returns a story; no empty responses.

### Step 3 — Round 2: cross-pollination
Spawn each persona again with the spec + every round-1 finding. Each returns, per peer finding, one tag:
- `NEW:` — round 1 missed this (rare)
- `CHALLENGED:` — wrong or overstated, here's why
- `REFINED:` — correct, but mechanism or trigger is different

**Done when:** every persona tags at least one finding with NEW / CHALLENGED / REFINED.

### Step 4 — Diminishing-returns gate
If round 2 produced zero `NEW:` tags → red light, stop here. Else proceed to round 3 only if round cap is 3.
**Done when:** round-3 trigger boolean is set.

### Step 5 — God-eye injection (round-3 candidates only)
Ask the user once: *"Inject a what-if scenario for round 3? (e.g. 'Redis dies mid-write', 'LSP returns malformed JSON', 'user has 0GB free') yes / no / [different]."* If yes, hold the scenario as a forced constraint for every persona in round 3.
**Done when:** response logged or null.

### Step 6 — Round 3: cross-challenge (large only)
Each persona picks one round-2 finding they disagree with (lowest-confidence claim from a peer) and stress-tests it against the spec. Output per finding:
- `UPHELD:` — the peer was right
- `OVERTURNED:` — peer was wrong, here's why
- `AMPLIFIED:` — peer understated; here is the worse version

**Done when:** every persona returns one verdict on one peer claim.

### Step 7 — Ingest pre-mortem (if available)
If a pre-mortem of the same spec exists on disk, ingest its top-ranked failures as a 6th persona's findings. De-duplicate by mechanism, not wording. Cross-reference any disagreement with the swarm's findings.
**Done when:** ingestion outcome recorded (ingested / skipped / merged).

### Step 8 — Log contradictions
Find every disagreement (CHALLENGED without OVERTURNED, OVERTURNED without REFINED, etc.). Surface them above the register. The disagreement is the artifact — one of them is right and the spec is ambiguous.
**Done when:** contradictions section populated or explicitly marked empty.

### Step 9 — Synthesize the register
Output a ranked failure register. Each entry: persona attribution, category, scenario, evidence pointer, severity, likelihood, suggested guardrail or test. Above the register: **Disagreements**. Below: **Open Questions** (things the spec didn't say that the swarm needs answered).
**Done when:** register is emitted with all required fields per entry; Disagreements is populated or marked empty; Open Questions is populated or marked empty.

---

## Failure Categories

Flat list, peer-set: `execution`, `dependency`, `assumption`, `scope`, `coordination`, `timing`, `unknown-unknown`.

Use a category from the list. If nothing fits, write it free text and mark `NEW-CATEGORY` so the next iteration can promote it.

---

## Output Template

```md
## Failure Register — <spec name>

### Disagreements
- <persona A> says X; <persona B> says Y. Mechanism: <one line>. Suggest: <add to spec / leave / monitor>.

### Ranked Failures
| # | Persona | Category | Scenario | Evidence | Severity | Likelihood | Guardrail |
|---|---------|----------|----------|----------|----------|------------|-----------|

### Open Questions
- <things the spec didn't say that the swarm needs answered>

### Pre-mortem Cross-Reference (if applicable)
- <failures pre-mortem found that the swarm missed, or matched>
```

---

## Stop Conditions

- All rounds complete (default exit)
- Diminishing-returns red light in step 4
- User aborts mid-run
- User invokes another skill, taking precedence

---

## Pairings

- **pre-mortem** — complement, not replace. If pre-mortem ran first, ingest it as a 6th persona (step 7).
- **adversarial-review / advocatus-diaboli** — single-shot critics; failure-swarm is the multi-round, stateful version.
- **write-spec / design** — chain failure-swarm after spec lock to scrub the spec before implementation.
- **inversion-mental-model** — failure-swarm produces narrative; inversion produces abstract failure modes. Pair when both shapes of output matter.

---

## Failure Modes of the Swarm Itself

- **Premature convergence** — personas echo each other instead of diverging. Defence: instruct each persona explicitly to produce *novel* findings in round 2, not validate peers.
- **Persona bleed** — Adversary starts sounding like Skeptic. Defence: each persona spawns with a fresh role brief; do not merge roles.
- **Persona fatigue** — round 3 produces yes/yes output. Defence: cap at 3 rounds; red-light stop in step 4.
- **Spec ambiguity cascade** — swarm produces 10+ findings that all trace to one missing spec section. Right move: surface the section as an Open Question, do not enumerate every consequence.
