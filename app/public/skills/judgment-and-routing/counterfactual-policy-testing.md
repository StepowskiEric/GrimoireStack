# Skill: Counterfactual Policy Testing

## Purpose

Validate decisions by testing them against explicit counterfactuals before committing. Generate null, opposite, and partial alternatives — simulate their outcomes — and only proceed if the proposed change beats all alternatives.

Based on counterfactual reasoning research (arXiv:2604.10511) — preventing "we did X, therefore X caused Y" fallacies by forcing comparison against explicit alternatives.

---

## When to Use

- Before any significant code change (architecture, refactoring, feature addition)
- When multiple solutions seem plausible
- When the default path is "just do it"
- High-stakes decisions where reversal is costly

**Don't use when:**
- Obvious bug fixes with clear correct answer
- Changes with zero risk (typos, comments)
- Time-critical emergencies (use different protocol)

---

## Core Concept

**The Counterfactual Test:**

| Counterfactual | Question | Purpose |
|----------------|----------|---------|
| **Null** | "What if we do nothing?" | Establish baseline, verify change is needed |
| **Opposite** | "What if we do the reverse?" | Test directional assumption |
| **Partial** | "What if we do 50%?" | Find inflection point, test proportionality |

**The Rule:** Only proceed if proposed change beats all three counterfactuals.

---

## State Machine

### State 0: Define Proposed Change

Clearly articulate what you're proposing.

```yaml
proposed_change:
  description: "Add Redis caching layer for API responses"
  scope: "All GET endpoints under /api/v1/"
  expected_benefit: "Reduce response time from 200ms to 20ms"
  expected_cost: "Infrastructure complexity, cache invalidation logic"
  irreversibility: "medium"  # low | medium | high
```

**Exit condition:** Change is specific enough to test alternatives.

---

### State 1: Generate Counterfactuals

Create three explicit alternatives.

```yaml
counterfactuals:
  null:
    description: "Keep current architecture - database queries only"
    implementation: "No changes to codebase"
    predicted_outcome:
      latency: "200ms (current)"
      complexity: "Low (current)"
      reliability: "High (current)"
    
  opposite:
    description: "Remove all existing caching, force direct DB access"
    implementation: "Strip out any memoization, ETags, etc."
    predicted_outcome:
      latency: "500ms (worse)"
      complexity: "Low (simpler)"
      reliability: "High (fewer moving parts)"
    
  partial:
    description: "Cache only the top 5 most-queried endpoints"
    implementation: "Selective caching with manual endpoint list"
    predicted_outcome:
      latency: "60ms for cached, 200ms for others"
      complexity: "Medium"
      reliability: "Medium"
```

**Exit condition:** Three distinct counterfactuals with predicted outcomes.

---

### State 2: Simulate Outcomes

For each counterfactual, simulate what would happen.

```yaml
outcome_simulation:
  null:
    short_term: "Continue with current performance complaints"
    medium_term: "Scaling limits hit at 10x traffic"
    long_term: "Forced to cache under pressure, likely poorly"
    
  opposite:
    short_term: "Performance degrades, user complaints"
    medium_term: "Forced to add caching anyway, but reactively"
    long_term: "Same as proposed, but with technical debt"
    
  partial:
    short_term: "80% of benefit with 40% of complexity"
    medium_term: "Maintenance burden of selective list"
    long_term: "Probably expand to full caching anyway"
    
  proposed:
    short_term: "Performance improves, complexity added"
    medium_term: "Team learns cache management"
    long_term: "Pattern established for other endpoints"
```

**Exit condition:** Each counterfactual has simulated timeline.

---

### State 3: Comparative Analysis

Score each option across dimensions.

```yaml
comparative_analysis:
  dimensions:
    - name: "Performance"
      weight: 0.3
    - name: "Complexity"
      weight: 0.3
    - name: "Reliability"
      weight: 0.2
    - name: "Time to implement"
      weight: 0.2
  
  scores:
    null:
      Performance: 3/10
      Complexity: 9/10
      Reliability: 9/10
      Time: 10/10
      weighted_total: 7.2
      
    opposite:
      Performance: 1/10
      Complexity: 10/10
      Reliability: 9/10
      Time: 10/10
      weighted_total: 6.4
      
    partial:
      Performance: 7/10
      Complexity: 6/10
      Reliability: 7/10
      Time: 7/10
      weighted_total: 6.7
      
    proposed:
      Performance: 9/10
      Complexity: 4/10
      Reliability: 7/10
      Time: 5/10
      weighted_total: 6.4
```

**Exit condition:** Quantified comparison across all options.

---

### State 4: Decision

Apply the counterfactual rule.

```yaml
decision:
  # Check: Does proposed beat all counterfactuals?
  null_beaten: true  # 6.4 > 7.2? No — PROBLEM
  opposite_beaten: true  # 6.4 > 6.4? Tie — PROBLEM
  partial_beaten: false  # 6.4 > 6.7? No — PROBLEM
  
  # If any counterfactual beats or ties proposed:
  action: "RECONSIDER"
  
  reconsideration_analysis: |
    The proposed full Redis caching does NOT clearly beat alternatives:
    - Null (do nothing) scores higher on complexity/reliability
    - Partial caching scores higher overall
    - Opposite (no caching) ties on total score
    
    Recommendation: Consider partial approach first, or find way
    to reduce complexity of full approach.
    
  alternative_to_consider: |
    Start with partial caching (top 5 endpoints), prove value,
    then expand. This beats null now, leaves path to full solution.
```

**Decision Rules:**
- **PROCEED:** Proposed beats ALL counterfactuals clearly (≥10% margin)
- **RECONSIDER:** Any counterfactual ties or beats proposed
- **ESCALATE:** Multiple counterfactuals beat proposed (fundamental rethink needed)

---

## Example: Complete Workflow

**Proposed:** "Rewrite authentication from sessions to JWT"

**Counterfactuals:**
```yaml
null:
  description: "Keep session-based auth"
  outcome: "Continue with current scaling limits"
  
opposite:
  description: "Remove all auth state, make everything stateless"
  outcome: "Breaks most features, unacceptable"
  
partial:
  description: "Hybrid: JWT for API, sessions for web"
  outcome: "Complexity of two systems, but incremental migration"
```

**Analysis:**
- Null: Viable — current system works, just doesn't scale
- Opposite: Not viable — breaks requirements
- Partial: Viable — more complex but lower risk

**Decision:** RECONSIDER — Null is viable, partial is lower risk. Need stronger justification for full JWT rewrite.

**Outcome:** Choose partial hybrid approach, migrate incrementally.

---

## Anti-Patterns

**Don't:**
- Stack the deck (make counterfactuals obviously bad)
- Skip the simulation step
- Ignore when a counterfactual beats your proposal
- Use this for trivial decisions (overhead not worth it)

**Do:**
- Be honest about counterfactual outcomes
- Consider partial solutions seriously
- Document when you proceed despite counterfactual challenge
- Use this as learning (track predictions vs actuals)

---

## Integration

- Use **after** `metacognitive-monitoring` to assess confidence in each counterfactual
- Use **before** `rashomon-triad-hybrid` when multiple genuine approaches exist
- Use **with** `compression-as-understanding` to ensure you understand alternatives

---

## See Also

- Paper: "Thinking Fast, Thinking Wrong: Intuitiveness Modulates LLM Counterfactual Reasoning" (arXiv:2604.10511)
- `pre-mortem` — for risk analysis
- `explore-vs-exploit` — for decision timing
