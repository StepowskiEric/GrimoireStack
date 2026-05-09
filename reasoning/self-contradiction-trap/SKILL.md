---
source: "jerry-skills"
name: self-contradiction-trap
category: reasoning
description: Maintain a belief store of claims made during a session. Detect when new claims contradict existing ones, and force resolution before continuing. Prevents agents from contradicting themselves.
...



---

# Self-Contradiction Trap

## Objective

LLMs frequently contradict themselves over long sessions (e.g., "X is true" then later "X is false") without noticing. This skill maintains a `belief_store.jsonl` of all claims made, detects contradictions, and forces the agent to resolve them immediately.

## When to Use

- Long sessions (15+ turns) where consistency matters
- Multi-step reasoning tasks (math, logic, API design)
- Coppermind memory sessions (agent makes claims about memory state)
- Any task where internal consistency is more important than speed

## Core Concept

**Belief Store:** A JSONL file where each line is a claim with:
- `claim_id` — unique ID (b1, b2, ...)
- `claim` — the statement made
- `confidence` — "high" | "medium" | "low"
- `status` — "active" | "retracted" | "superseded"
- `contradicts` — list of claim_ids this contradicts
- `timestamp` — when added

**Contradiction Score:** Each claim gets a score that increases when contradicted. Score > 3 → trigger session reset or manual review.

## Workflow (Strictly Follow)

### 1. Initialize Belief Store

Create `belief_store.jsonl` in working directory. Empty to start.

### 2. Before Making Any Claim

Check: does this contradict anything in the belief store?

- **No** → add new claim with `status: active`
- **Yes, mild contradiction** (e.g., "timeout defaults to 5s" vs "timeout defaults to 10s") → 
  - Add new claim with `contradicts: [old_claim_id]`
  - Set old claim `status: superseded`
  - Increment contradiction score on both
- **Yes, direct contradiction** (e.g., "function returns None" vs "function never returns None") →
  - Halt output
  - Force resolution: agent must pick one, explain why, update both claims
  - Do NOT proceed until resolved

### 3. Track Contradiction Score

Each claim has a `contradiction_score` (starts at 0). When contradicted:
- Increment by 1 for mild contradictions
- Increment by 2 for direct contradictions

If any claim reaches score ≥ 3 → trigger `session_review`:
1. Print all high-score claims
2. Ask agent to audit the session
3. Optionally reset the belief store

### 4. Before Final Output

Run a consistency check:
- Scan output for claims that contradict the belief store
- If found, either resolve or mark output as "contains unresolved contradictions"

## Companion Script

`scripts/belief_store.py` — pure stdlib Python:

- `init` — create empty belief store
- `add <claim>` — register a new claim, auto-detect contradictions
- `check <text>` — scan text for contradictions against the store
- `resolve <claim_id> <keep|retract>` — resolve a contradiction
- `audit` — show contradiction scores, inconsistent claims
- `reset` — clear the store (triggered after severe contradiction)

## Usage Example

```
Turn 3: Agent says "httpx timeout defaults to 5 seconds"
  → belief_store: b1 added (active, score 0)

Turn 7: Agent says "httpx timeout defaults to None (no timeout)"
  → CONTRADICTION detected with b1
  → Halt. Agent must resolve:
    - Keep b1 (retract b2) → "b1 is correct, I misremembered"
    - Keep b2 (retract b1) → "b1 was wrong, defaults to None"
    - Both uncertain → mark both "low confidence", add b3 with research

Turn 7 (resolved): Agent retracts b1, keeps b2
  → b1.status = retracted, b2.status = active
  → contradiction_score on b1 = 1

Turn 12: Agent says "httpx has no default timeout" (same as b2, consistent)
  → No contradiction. b2 reinforced.
```

## Pitfalls

- **False positives:** Nuanced claims ("X is true in case A" vs "X is false in case B") are NOT contradictions. The script uses simple keyword overlap — you must manually review iffy cases.
- **Over-blocking:** Don't halt for every minor inconsistency. Use the contradiction score — only force resolution when score ≥ 2.
- **Belief store bloat:** Limit to last 100 claims. Old, inactive claims can be archived to `belief_archive.jsonl`.
- **Reset hammer:** Don't reset the session for every contradiction. Use reset only when `contradiction_score` on multiple claims ≥ 3.

## Integration with Other Skills

- Use with `hallucination-anchor-chain` — anchored claims go into the belief store
- Use with `reasoning-integrity-chain` — contradiction detection is step 1 of integrity
- Coppermind-specific: prevents memory claims from contradicting stored facts

## Rule of Thumb

If you contradict yourself, stop and fix it. Don't let inconsistencies compound.
