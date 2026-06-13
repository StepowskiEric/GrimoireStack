# Triad Reasoning Patterns — When to Use Which Perspective

Companion reference for `rashomon-triad-hybrid`. Decision framework for choosing and weighting the three perspectives.

## Perspective Selection Guide

### Optimist Perspective (What could go right?)
**Use when:**
- Exploratory phase — generating possibilities
- Solution design — finding creative approaches
- Morale boost — countering excessive pessimism after failures

**Typical arguments:**
- "This approach is simple and has worked before in similar systems"
- "The risk is bounded — worst case we revert"
- "We already have 80% of the infrastructure needed"

### Pessimist Perspective (What could go wrong?)
**Use when:**
- Risk assessment — finding failure modes
- Pre-deployment review — catching edge cases
- After an optimistic proposal that "looks too easy"

**Typical arguments:**
- "This dependency has known issues with X"
- "This approach doesn't handle the case where Y is null"
- "The time estimate assumes no blockers, which is unrealistic"

### Pragmatist Perspective (What actually matters?)
**Use when:**
- Decision phase — breaking optimist/pessimist deadlock
- Resource-constrained — need to pick the highest-ROI approach
- Trade-off analysis — quantifying risks vs. rewards

**Typical arguments:**
- "Both concerns are valid; here's the incremental path that addresses both"
- "The pessimist's scenario is possible but unlikely given our constraints"
- "The optimist's timeline is unrealistic; here's the adjusted estimate"

## Weighting by Task Type

| Task Type | Optimist | Pessimist | Pragmatist |
|-----------|----------|-----------|------------|
| Greenfield feature | 40% | 20% | 40% |
| Bug fix (known root cause) | 10% | 50% | 40% |
| Bug fix (unknown root cause) | 20% | 40% | 40% |
| Refactoring | 30% | 30% | 40% |
| Security review | 10% | 60% | 30% |
| Performance optimization | 20% | 40% | 40% |
| Migration | 30% | 40% | 30% |
| Demo / prototype | 60% | 10% | 30% |

## Conflict Resolution

When two perspectives fundamentally disagree:

1. **Both write their strongest argument** (1-3 sentences each)
2. **Pragmatist identifies the factual disagreement** — what would have to be true for both to be right?
3. **Design a test that resolves the factual disagreement**
4. **Run the test, update weights based on results**

If the test is too expensive to run, the pragmatist decides based on reversibility:
- Reversible choice → favor optimist
- Irreversible choice → favor pessimist