# Skill: Cross-Domain Analogy Generator

## Purpose

Break fixation and generate novel solutions by forcing analogies from unrelated domains. Map problem structures to foreign fields (biology, music, traffic engineering, etc.) and transfer insights.

Based on "Serendipity by Design: Evaluating the Impact of Cross-domain Mappings on Human and LLM Creativity" (arXiv:2603.19087).

---

## When to Use

- When stuck on a problem (repeated failed attempts)
- When local optima seem like global optima
- For creative problem-solving where standard approaches fail
- When you need "fresh eyes" on a familiar problem
- Before giving up on a hard problem

**Don't use when:**
- Standard solution is known and appropriate
- Time is critical (this is exploratory, not efficient)
- Problem is purely technical with established best practice

---

## Core Concept

**The Analogy Pipeline:**

```
Problem Structure → Abstract Pattern → Foreign Domain → Analogous Pattern → Map Back → Novel Solution
```

**Why It Works:**
- Local fixation: You know the domain too well, see only familiar solutions
- Cross-domain breaks fixation by importing foreign frameworks
- Structural mapping (not surface similarity) reveals deep patterns

**Example Domains to Map:**
- Biology (evolution, ecosystems, cellular mechanisms)
- Music (harmony, rhythm, improvisation)
- Traffic/Logistics (flow, congestion, routing)
- Cooking (recipes, timing, flavor pairing)
- Sports (team dynamics, strategy, training)
- Architecture (structure, load-bearing, aesthetics)
- Nature (ant colonies, flocking, water flow)

---

## Framework (Not Protocol)

This is a **conceptual lens** applied when stuck.

### Step 1: Recognize Stuckness

Signs you need analogy mode:
- Multiple failed attempts
- Repeating same failed approach
- "I've tried everything"
- Low confidence despite effort
- Problem seems "impossible"

```yaml
stuckness_assessment:
  attempts_made: 3
  confidence_trend: declining  # increasing | stable | declining
  pattern_repetition: high    # none | some | high
  emotional_state: frustrated  # engaged | neutral | frustrated
  
  trigger_analogy_mode: true
```

---

### Step 2: Extract Problem Structure

Abstract the problem to its structural elements.

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

---

### Step 3: Generate Cross-Domain Analogies

Map to 3+ foreign domains.

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
  
  domain_2:
    name: "Music - Jazz Improvisation"
    analogy: |
      Jazz soloists share limited "solo space":
      - Trading fours: structured handoff
      - Comping: background support without dominating
      - Cues: non-verbal communication for transitions
      - Collective improvisation: simultaneous but coherent
      
    structural_mapping:
      "API capacity" → "Solo space / attention"
      "Clients" → "Musicians"
      "Fair distribution" → "Trading solos"
      "Graceful degradation" → "Comping instead of soloing"
      
    insight: |
      Implement "trading" pattern - clients get time slices
      instead of request-based limits. Smooth handoffs via
      signaling (cues).
  
  domain_3:
    name: "Traffic - Ramp Metering"
    analogy: |
      Highway on-ramps meter entry during congestion:
      - Dynamic rate based on downstream conditions
      - Feedback loop: measure → adjust → measure
      - Alternative routes suggested when delayed
      - Priority vehicles (emergency) bypass metering
      
    structural_mapping:
      "API capacity" → "Highway throughput"
      "Clients" → "Vehicles entering"
      "Rate limiting" → "Ramp metering"
      "Graceful degradation" → "Dynamic adjustment + alternatives"
      
    insight: |
      Implement adaptive rate limiting based on backend health.
      Provide alternative endpoints (routes) when primary
      congested. Priority lanes for critical clients.
```

---

### Step 4: Synthesize Novel Solution

Combine insights from analogies.

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
  
  why_novel: |
    Standard rate limiting is static and binary (allowed/denied).
    This approach is dynamic, prioritized, and communicative -
    inspired by biological and traffic systems that handle
    scarcity gracefully.
```

---

### Step 5: Evaluate and Implement

Assess if analogy-generated solution is viable.

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

---

## Domain Prompts

When stuck, ask:

**Biology:**
- How does nature solve this?
- What would evolution do?
- How do cells/organisms handle this constraint?

**Music:**
- How would a composer structure this?
- What would improvisation suggest?
- How do musicians coordinate?

**Traffic/Logistics:**
- How do highways handle congestion?
- What would a supply chain do?
- How do airports manage flow?

**Cooking:**
- How would a chef balance flavors?
- What does timing teach us?
- How do ingredients interact?

**Sports:**
- How would a coach train for this?
- What strategy would win?
- How do teams coordinate?

**Architecture:**
- How would an architect structure this?
- What supports the load?
- How is space organized?

---

## Example: Database Connection Pool Exhaustion

**Standard approach:** "Increase pool size" (works until next limit)

**Analogy mode:**

**Biology:** "How do cells handle resource scarcity?"
→ Prioritization, signaling, hibernation

**Music:** "How do jazz bands handle solo space?"
→ Trading, comping, cues

**Traffic:** "How do on-ramps handle congestion?"
→ Metering, dynamic adjustment, alternatives

**Synthesized solution:**
- Priority connections (critical vs batch)
- Backpressure (signal clients to slow down)
- Adaptive pool sizing (based on load)
- Queue with timeout (graceful degradation)

**Result:** System gracefully degrades instead of failing.

---

## Anti-Patterns

**Don't:**
- Force analogies when standard solution works
- Get lost in analogy (surface similarities)
- Ignore implementation constraints
- Use same domains repeatedly (defeats the purpose)

**Do:**
- Map structures, not surfaces
- Combine insights from multiple domains
- Validate feasibility before committing
- Document the analogy (helps others understand)

---

## Integration

- Use **when** `metacognitive-monitoring` shows declining confidence
- Use **before** `specter` to generate novel hypotheses
- Use **with** `cognitive-friction-governor` — analogies have friction cost

---

## See Also

- Paper: "Serendipity by Design: Evaluating the Impact of Cross-domain Mappings on Human and LLM Creativity" (arXiv:2603.19087)
- `how-to-solve-it-analogy` — for structured analogy
- `first-principles` — for deconstruction before analogy
