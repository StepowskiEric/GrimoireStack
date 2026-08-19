# Rashomon-Triad — Templates, Formulas & Walkthrough

## Configuration template

```yaml
rashomon_triad_config:
  situation: "Proposed API change: add direct SQL queries for performance"

  perspectives:
    - id: "security"
      name: "Security Auditor"
      goal: "Prevent injection attacks and data leaks"
      priority: 0.9
      vocabulary: ["injection", "sanitization", "parameterization", "exploit"]

    - id: "performance"
      name: "Performance Engineer"
      goal: "Minimize latency and resource usage"
      priority: 0.8
      vocabulary: ["latency", "throughput", "cache", "query-time", "index"]

    - id: "maintainability"
      name: "Code Quality Reviewer"
      goal: "Keep codebase understandable and testable"
      priority: 0.7
      vocabulary: ["complexity", "test-coverage", "abstraction", "coupling"]

  convergence:
    max_triad_iterations: 3          # Per perspective
    argumentation_rounds: 2          # Attack/critique cycles
    min_confidence_for_attack: 0.7   # Only confident claims attack others

  output_mode: "conflict_surfacing"  # selection | composition | conflict_surfacing
```

## Triad cycle template

```yaml
# Iteration 1: Abduction
abductor_output:
  hypotheses:
    - "Direct SQL without ORM enables query optimization (perf)"
    - "Raw SQL bypasses parameterization → injection risk (security)"
    - "Mixed SQL/ORM creates inconsistency → maintenance burden (maintain)"
  confidence: 0.8

# Iteration 2: Deduction
deducer_output:
  validations:
    - hypothesis: "Direct SQL without ORM"
      valid: true
      evidence: "Query time drops from 45ms to 12ms in benchmarks"
    - hypothesis: "Raw SQL bypasses parameterization"
      valid: true
      evidence: "Current implementation uses string interpolation"
      counter_measure: "Could use prepared statements"
    - hypothesis: "Mixed SQL/ORM creates inconsistency"
      valid: true
      evidence: "Two query patterns in same module"

# Iteration 3: Induction
inductor_output:
  pattern: "Performance gains from raw SQL are real but security trade-off is avoidable"
  boundaries: "Only safe if using prepared statements + input validation"
  confidence: 0.75
```

## Attack graph format

```yaml
attacks:
  - attacker: "security"
    target: "performance"
    target_conclusion: "Use raw SQL for 3x speedup"
    attack_type: "direct_attack"
    rationale: "Raw SQL with string interpolation enables SQL injection"
    confidence: 0.90

  - attacker: "performance"
    target: "security"
    target_conclusion: "Must use ORM parameterization"
    attack_type: "undercut"
    rationale: "Prepared statements provide same security without ORM overhead"
    confidence: 0.85

  - attacker: "maintainability"
    target: ["security", "performance"]
    target_conclusion: "Both ignore code consistency"
    attack_type: "rebuttal"
    rationale: "Whatever solution must maintain single query pattern across codebase"
    confidence: 0.80
```

## Resolution output formats

### Selection

```yaml
output:
  winning_perspective: "performance"
  winning_conclusion: "Use prepared statements with raw SQL"
  rationale: |
    Performance perspective's conclusion survives because:
    1. It addresses security's attack (prepared statements)
    2. It meets performance goal (3x speedup)
    3. It partially satisfies maintainability (consistent if applied module-wide)
  defeated_perspectives:
    - perspective: "security"
      reason: "ORM requirement defeated by prepared statement alternative"
  attack_graph: "<full attack graph structure>"
```

### Composition

```yaml
output:
  composed_solution: |
    Hybrid approach:
    1. Use prepared statements for security (from security perspective)
    2. Optimize query structure for performance (from performance perspective)
    3. Create abstraction layer for consistency (from maintainability perspective)
  non_conflicting_aspects:
    - "Prepared statements satisfy both security and performance"
    - "Query optimization doesn't affect API design"
  remaining_conflicts:
    - "Abstraction layer adds overhead vs raw performance"
      resolution: "Accept 5% overhead for maintainability gains"
```

### Conflict surfacing

```yaml
output:
  mode: "conflict_surfacing"
  message: |
    There is genuine disagreement between perspectives that cannot be
    resolved without human judgment. Here is the conflict:
  perspectives:
    security:
      position: "Never use raw SQL — ORM only"
      confidence: 0.85
    performance:
      position: "Raw SQL with prepared statements is acceptable"
      confidence: 0.90
    maintainability:
      position: "Whatever we choose must be consistent across codebase"
      confidence: 0.80
  recommendation: |
    The system cannot resolve this automatically. Decision required:
    - Option A: Accept security risk for performance (override security)
    - Option B: Accept performance cost for security (override performance)
    - Option C: Accept inconsistency during migration (override maintainability)
  decision_criteria: |
    Choose based on:
    - Current security posture (are we already at risk?)
    - Performance requirements (is 300% overhead actually problematic?)
    - Migration timeline (can we refactor incrementally?)
```

## Confidence formulas

**Perspective confidence:**

```
confidence = triad_convergence * evidence_strength * priority_weight

- triad_convergence: 1.0 if abduction→deduction→induction converged, else 0.7
- evidence_strength: ratio of validated to total hypotheses
- priority_weight: perspective's configured priority (0.0-1.0)
```

**Attack strength:**

```
attack_confidence = attacker_confidence * (1 - target_confidence) * evidence_quality

Strong attack: high confidence attacker vs low confidence target + good evidence
Weak attack: low confidence or poor evidence
```

## Full walkthrough

**Situation:** "Should we add caching to the user profile endpoint?"

Perspectives: Performance ("Reduce latency from 200ms to 20ms"), Consistency ("Users must see their own updates immediately"), Complexity ("Cache invalidation is hard to get right").

Triad cycles:
- Performance: abduce Redis / in-memory / CDN → deduce Redis gives 10x speedup, invalidation manageable → induce "Caching is viable if TTL < 5 seconds"
- Consistency: abduce stale-cache confusion, write-through → deduce any TTL > 0 creates inconsistency window → induce "Only acceptable if real-time updates not required"
- Complexity: abduce cache warming, stampede, invalidation bugs → deduce all add operational burden → induce "Caching should be last resort after query optimization"

Argumentation:
- Performance attacks Consistency: "5-second stale window is acceptable for profile data"
- Consistency attacks Performance: "Users update profile expecting immediate reflection"
- Complexity attacks Performance: "Query optimization (indexes) gives 5x speedup without cache complexity"
- Performance undercuts: "5x from indexes + 2x from cache = 10x total"

Conflict-surfacing output: start with query optimization (satisfies Complexity, partially Performance); revisit caching only if 5x is insufficient AND the consistency window is acceptable.
