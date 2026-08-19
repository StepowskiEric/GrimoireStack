# Cross-Domain Analogy — Templates, Prompts & Walkthrough

## Analogy pipeline

```
Problem Structure → Abstract Pattern → Foreign Domain → Analogous Pattern → Map Back → Novel Solution
```

## Structured templates

### Stuckness assessment

```yaml
stuckness_assessment:
  attempts_made: 3
  confidence_trend: declining  # increasing | stable | declining
  pattern_repetition: high    # none | some | high
  emotional_state: frustrated  # engaged | neutral | frustrated

  trigger_analogy_mode: true
```

### Problem structure

```yaml
problem_structure:
  original_problem: "API rate limiting that doesn't degrade gracefully"

  elements:
    - resource: "API capacity"
    - consumers: "Multiple clients with varying needs"
    - constraint: "Hard capacity limit"
    - failure_mode: "All clients suffer when limit hit"
    - goal: "Fair distribution under scarcity"

  relationships:
    - "Many consumers compete for limited resource"
    - "No prioritization mechanism"
    - "Binary outcome (success/fail)"
    - "No feedback to consumers"

  abstract_pattern: |
    Resource scarcity with multiple competing consumers,
    no prioritization, hard failure mode, need for
    graceful degradation.
```

### Cross-domain analogies

```yaml
cross_domain_analogies:
  domain_1:
    name: "Biology - Cellular Resource Allocation"
    analogy: |
      Cells have limited ATP. When scarce, they:
      - Prioritize essential functions (maintenance)
      - Deprioritize growth/reproduction
      - Communicate scarcity via signaling molecules
      - Enter hibernation mode if critical

    structural_mapping:
      "API capacity" → "ATP supply"
      "Clients" → "Cellular processes"
      "Hard limit" → "Metabolic constraint"
      "Graceful degradation" → "Prioritization + signaling"

    insight: |
      Implement priority classes + backpressure signaling.
      Critical clients get capacity; non-critical get
      "hibernation" responses (retry-after).
```

### Synthesized solution

```yaml
novel_solution:
  name: "Adaptive Priority Rate Limiting with Backpressure"

  components:
    - component: "Priority Classes"
      source: "Biology - essential vs growth functions"
      implementation: |
        Tag clients by priority (critical/standard/background).
        Critical always served; background deprioritized.

    - component: "Backpressure Signaling"
      source: "Biology - signaling molecules"
      implementation: |
        Return 429 with Retry-After headers.
        Clients adapt behavior (backoff).

    - component: "Time-Slice Allocation"
      source: "Music - trading fours"
      implementation: |
        Instead of per-request limits, allocate time windows.
        Smooths burst traffic.

    - component: "Adaptive Metering"
      source: "Traffic - ramp metering"
      implementation: |
        Adjust rate limits based on backend health metrics.
        Suggest alternative endpoints when congested.
```

### Evaluation

```yaml
evaluation:
  feasibility: "high"
  complexity_increase: "medium"
  expected_improvement: "significant"

  risks:
    - "Priority system adds complexity"
    - "Client adaptation required for backpressure"

  mitigation:
    - "Start with 2 priority levels (critical/standard)"
    - "Gradual rollout with fallback to simple limiting"

  decision: "IMPLEMENT"
  confidence: 0.8
```

## Domain prompts

- **Biology:** How does nature solve this? What would evolution do? How do cells/organisms handle this constraint?
- **Music:** How would a composer structure this? What would improvisation suggest? How do musicians coordinate?
- **Traffic/Logistics:** How do highways handle congestion? What would a supply chain do? How do airports manage flow?
- **Cooking:** How would a chef balance flavors? What does timing teach us? How do ingredients interact?
- **Sports:** How would a coach train for this? What strategy would win? How do teams coordinate?
- **Architecture:** How would an architect structure this? What supports the load? How is space organized?

## Worked example: database connection pool exhaustion

**Standard approach:** "Increase pool size" (works until next limit).

- **Biology:** "How do cells handle resource scarcity?" → prioritization, signaling, hibernation
- **Music:** "How do jazz bands handle solo space?" → trading, comping, cues
- **Traffic:** "How do on-ramps handle congestion?" → metering, dynamic adjustment, alternatives

**Synthesized solution:** priority connections (critical vs batch), backpressure (signal clients to slow down), adaptive pool sizing (based on load), queue with timeout (graceful degradation).

**Result:** the system degrades gracefully instead of failing.

## Integration

- Use **when** `metacognitive-monitoring` shows declining confidence
- Use **before** `specter` to generate novel hypotheses
- Use **with** `cognitive-friction-governor` — analogies have friction cost

## Source

Paper: "Serendipity by Design: Evaluating the Impact of Cross-domain Mappings on Human and LLM Creativity" (arXiv:2603.19087). See also `how-to-solve-it-analogy` for structured analogy, `first-principles` for deconstruction before analogy.
