# Counterfactual Policy Testing — Templates & Walkthrough

## State templates

### Proposed change

```yaml
proposed_change:
  description: "Add Redis caching layer for API responses"
  scope: "All GET endpoints under /api/v1/"
  expected_benefit: "Reduce response time from 200ms to 20ms"
  expected_cost: "Infrastructure complexity, cache invalidation logic"
  irreversibility: "medium"  # low | medium | high
```

### Counterfactuals

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

### Outcome simulation

```yaml
outcome_simulation:
  null:
    short_term: "Continue with current performance complaints"
    medium_term: "Scaling limits hit at 10x traffic"
    long_term: "Forced to cache under pressure, likely poorly"

  proposed:
    short_term: "Performance improves, complexity added"
    medium_term: "Team learns cache management"
    long_term: "Pattern established for other endpoints"
```

### Comparative analysis

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
    proposed:
      Performance: 9/10
      Complexity: 4/10
      Reliability: 7/10
      Time: 5/10
      weighted_total: 6.4
```

### Decision

```yaml
decision:
  null_beaten: false   # proposed must beat ALL
  opposite_beaten: true
  partial_beaten: false

  action: "RECONSIDER"   # PROCEED | RECONSIDER | ESCALATE

  reconsideration_analysis: |
    The proposed full caching does NOT clearly beat alternatives:
    - Null scores higher on complexity/reliability
    - Partial caching scores higher overall

  alternative_to_consider: |
    Start with partial caching (top 5 endpoints), prove value,
    then expand. This beats null now, leaves path to full solution.
```

## Worked example: sessions → JWT rewrite

**Proposed:** rewrite authentication from sessions to JWT.

- **Null:** keep session-based auth — works today, just doesn't scale
- **Opposite:** remove all auth state, make everything stateless — breaks most features, unacceptable
- **Partial:** hybrid — JWT for API, sessions for web — more complex but incremental migration

**Decision:** RECONSIDER — null is viable, partial is lower risk. Full JWT rewrite needs stronger justification.

**Outcome:** choose the partial hybrid, migrate incrementally.

## Failure modes

- **Stacking the deck** — making counterfactuals obviously bad; a strawman null proves nothing
- **Skipping the simulation** — scoring without projecting outcomes is theater
- **Ignoring a counterfactual win** — proceeding when a genuine alternative beats the proposal
- **Using it for trivia** — the overhead is not worth it for obvious decisions

## Integration

- Use **after** `metacognitive-monitoring` to assess confidence in each counterfactual
- Use **before** `rashomon-triad-hybrid` when multiple genuine approaches exist
- Use **with** `compression-as-understanding` to ensure you understand the alternatives

## Source

Paper: "Thinking Fast, Thinking Wrong: Intuitiveness Modulates LLM Counterfactual Reasoning" (arXiv:2604.10511). See also `pre-mortem` (risk analysis) and `explore-vs-exploit` (decision timing).
