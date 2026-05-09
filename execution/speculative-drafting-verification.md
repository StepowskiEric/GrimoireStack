---
name: speculative-drafting-verification
description: Generate multiple candidate solution branches in parallel, verify each against constraints, and select the best. Prevents local minima traps in complex problem solving. Based on verification-aware speculative decoding research (arXiv:2604.15244).
category: execution
tags: [speculative, parallel-exploration, verification, candidate-generation, optimization]
author: Research synthesis
date: 2026-04-20
version: 1.0.0
...



---

# Speculative Drafting with Verification

## When to Use

Use this skill when:
- Problem has multiple plausible solution paths
- Risk of getting stuck in local optima
- Need to explore alternatives before committing
- Verification is cheaper than regeneration
- Previous attempts converged on suboptimal solutions

## The Concept

Like speculative decoding in LLMs, this protocol:
1. **Drafts** multiple candidate solution branches in parallel
2. **Verifies** each branch against constraints/objectives
3. **Selects** the best verified candidate
4. **Commits** only after verification succeeds

This prevents premature convergence on the first viable solution.

## State Machine Protocol

```
┌─────────────┐
│    INIT     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   BRANCH    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   DRAFT_N   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   VERIFY    │
│   PARALLEL  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    SCORE    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   SELECT    │────▶│   REFINE    │
└──────┬──────┘     └──────┬──────┘
       │                    │
       │         ┌─────────┴─────────┐
       │         │                   │
       │         ▼                   ▼
       │  ┌─────────────┐     ┌─────────────┐
       │  │   ACCEPT    │     │   REJECT    │
       │  └──────┬──────┘     └──────┬──────┘
       │         │                   │
       │         │    ┌───────────────┘
       │         │    │
       └─────────┼────┼────────┐
                 │    │        │
                 ▼    ▼        ▼
          ┌─────────────┐
          │   COMMIT    │
          └──────┬──────┘
                 │
                 ▼
          ┌─────────────┐
          │    DONE     │
          └─────────────┘
```

## States

### INIT
**Purpose:** Setup speculative drafting parameters

**Entry Actions:**
- Define branching factor N (default: 3)
- Define verification criteria
- Set selection strategy (highest score, diversity-weighted, etc.)
- Initialize candidate pool

**Exit Conditions:** Always → BRANCH

**Output Format:**
```yaml
speculative_config:
  branch_count: 3
  verification_criteria:
    - constraint_satisfaction
    - efficiency
    - robustness
  selection_strategy: "highest_score"
  min_acceptable_score: 0.7
```

___


### BRANCH
**Purpose:** Identify distinct solution approaches

**Entry Actions:**
- Analyze problem for multiple solution paths
- Identify key decision points
- List qualitatively different approaches

**Prompt Template:**
```
Problem: {{problem_description}}

Identify {{N}} distinct approaches to solve this problem.

Each approach should be qualitatively different (not just variations).

Approach 1: [High-level strategy]
Approach 2: [Different strategy]
Approach 3: [Another different strategy]

For each, note:
- Key insight or principle
- Potential advantages
- Potential risks
```

**Exit Conditions:** Always → DRAFT_N

___


### DRAFT_N
**Purpose:** Generate N candidate solutions in parallel

**Entry Actions:**
For each branch identified, draft a complete solution:

**Prompt Template (per branch):**
```
Draft solution using approach {{N}}:

Approach: {{approach_description}}

Generate a complete solution draft following this approach.
Do not worry about perfection — we'll verify and refine later.

Solution draft:
```

**Exit Conditions:** All N drafts complete → VERIFY_PARALLEL

___


### VERIFY_PARALLEL
**Purpose:** Verify all candidates simultaneously

**Entry Actions:**
For each candidate, apply verification:

**Prompt Template (per candidate):**
```
Verify candidate solution {{N}}:

Solution: {{candidate_solution}}

Check against criteria:
{% for criterion in verification_criteria %}
- {{criterion}}: PASS / FAIL / PARTIAL
  - Evidence: {{why}}
{% endfor %}

Overall verdict: ACCEPTABLE / UNACCEPTABLE
Issues found: [list]
```

**Exit Conditions:** All candidates verified → SCORE

___


### SCORE
**Purpose:** Score each verified candidate

**Entry Actions:**
Calculate scores based on:
- Constraint satisfaction (0-1)
- Efficiency (0-1)
- Robustness (0-1)
- Simplicity bonus (0-0.2)

**Scoring Formula:**
```
score = (constraint_sat * 0.4) + 
        (efficiency * 0.3) + 
        (robustness * 0.2) + 
        (simplicity * 0.1)
```

**Prompt Template:**
```
Score each verified candidate:

Candidate 1:
- Constraints: {{score}}
- Efficiency: {{score}}
- Robustness: {{score}}
- Simplicity: {{score}}
- TOTAL: {{weighted_sum}}

[Repeat for each candidate]

Ranking:
1. Candidate {{X}}: {{score}}
2. Candidate {{Y}}: {{score}}
3. Candidate {{Z}}: {{score}}
```

**Exit Conditions:** All scored → SELECT

___


### SELECT
**Purpose:** Choose best candidate or decide to refine

**Entry Actions:**
- Compare top candidates
- Check if top score ≥ min_acceptable_score
- Decide: accept, refine, or backtrack

**Decision Rules:**
- If top_score ≥ 0.8 → ACCEPT
- If 0.7 ≤ top_score < 0.8 → REFINE (selected candidate)
- If top_score < 0.7 → REJECT (restart with new branches)

**Exit Conditions:**
- Decision = ACCEPT → COMMIT
- Decision = REFINE → REFINE
- Decision = REJECT → BRANCH (with new approaches)

___


### REFINE
**Purpose:** Improve selected candidate

**Entry Actions:**
- Take highest-scoring candidate
- Identify specific weaknesses
- Apply targeted improvements

**Prompt Template:**
```
Refine selected candidate:

Current solution: {{selected_candidate}}
Issues to address: {{issues_list}}

Improvements to make:
1. [Specific fix for issue 1]
2. [Specific fix for issue 2]

Refined solution:
[Improved version]

Re-verification:
- [Re-check criteria]
```

**Exit Conditions:** After refinement → COMMIT

___


### COMMIT
**Purpose:** Finalize selected solution

**Entry Actions:**
- Present final solution
- Include rationale (why this branch was selected)
- Note alternatives considered
- Document tradeoffs

**Output Format:**
```markdown
## Selected Solution

[Final solution]

## Selection Rationale
- Chosen from {{N}} candidates
- Scored {{X}} on {{criteria}}
- Key advantages: [list]
- Tradeoffs: [list]

## Alternatives Considered
- Candidate Y: [brief description, why rejected]
- Candidate Z: [brief description, why rejected]
```

**Exit Conditions:** Always → DONE

___


### DONE
**Purpose:** Return final solution

**Entry Actions:**
- Return committed solution
- Include speculative exploration summary

## Example Usage

```markdown
Problem: Design a caching strategy for an API

[INIT] Config: 3 branches, criteria: speed, memory, consistency

[BRANCH] Approaches:
1. In-memory LRU cache
2. Redis distributed cache
3. CDN edge caching

[DRAFT_N] Generate 3 solution drafts...

[VERIFY_PARALLEL]
Candidate 1 (LRU):
- Speed: PASS (fast)
- Memory: PARTIAL (bounded but local)
- Consistency: FAIL (stale data risk)

Candidate 2 (Redis):
- Speed: PASS (fast)
- Memory: PASS (distributed)
- Consistency: PASS (TTL + invalidation)

Candidate 3 (CDN):
- Speed: PASS (fastest)
- Memory: PASS (edge)
- Consistency: FAIL (eventual only)

[SCORE]
- Candidate 1: 0.6
- Candidate 2: 0.9 ← SELECT
- Candidate 3: 0.7

[SELECT] → ACCEPT (score ≥ 0.8)

[COMMIT] Redis solution with rationale
```

## Pitfalls

1. **Too many branches:** Keep N ≤ 5 to manage complexity
2. **Shallow verification:** Don't spend more time verifying than drafting
3. **Analysis paralysis:** Set time limit for exploration phase
4. **Confirmation bias:** Don't favor first candidate — score objectively
5. **Over-engineering:** If one candidate clearly wins, don't refine others

## Integration

Combine with:
- `tree-of-thoughts`: Use speculative drafting for each tree branch
- `step-level-verification-protocol`: Verify each candidate step-by-step
- `cognitive-friction-governor`: Budget exploration vs exploitation

## Research Basis

- From Tokens to Steps: Verification-Aware Speculative Decoding (arXiv:2604.15244)
- Parallel reasoning exploration in multi-agent systems
