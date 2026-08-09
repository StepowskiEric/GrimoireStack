---
name: rashomon-triad-hybrid
description: "Parallel perspectives with conflicting goals run independent abductive-deductive-inductive cycles, then argue via attack graph."
triggers:
  - Stakeholders have genuinely conflicting goals (not just miscommunication)
  - No single correct answer — only trade-offs
  - Need to document why alternatives were rejected
  - Risk of premature consensus hiding real conflicts
---

# Rashomon-Triad Hybrid

Combine **Rashomon Memory** (parallel perspectives with conflicting goals) and **Triad Reasoning** (abduction → deduction → induction per perspective). The output is an **attack graph** that names which conclusions survive cross-perspective critique.

## When to Use

- Multiple stakeholders have genuinely conflicting goals
- The decision has no single "correct" answer — only trade-offs
- You need to surface and document why alternatives were rejected
- You want to avoid premature consensus that hides real risks
- The problem requires both creative exploration AND rigorous verification

## When NOT to Use

- **Single clear objective.** Use `triad-reasoning` alone (or simpler).
- **Speed matters more than thoroughness.** Argumentation costs rounds.
- **Reversible, low-cost decisions.** The output is overkill for "just ship and iterate."

## Mandatory Configuration

Before spawning perspectives, define:

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

**Done when** every perspective has a distinct goal and vocabulary, convergence parameters are explicit, and the output mode is named.

## State 1 — Parallel Triad Reasoning

Each perspective runs independent abductive-deductive-inductive cycles on the same situation, with different goals and priorities.

Per-perspective triad cycle:

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

**Exit condition:** all perspectives have completed triad cycles with confidence scores and evidence-tagged hypotheses.

## State 2 — Argumentation

Perspectives critique each other's conclusions:

```
For each perspective:
  1. Propose final conclusion(s) with confidence
  2. Identify which other perspectives' conclusions it attacks
  3. Provide attack rationale using its own vocabulary
```

Attack types:

- **direct_attack** — "Your solution fails my goal"
- **undercut** — "Your evidence doesn't support your conclusion"
- **rebuttal** — "My goal overrides yours in this context"

Example attack graph:

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

**Exit condition:** all perspectives have critiqued others, attack graph shows which conclusions survive, Dung's semantics applied to determine winners.

## State 3 — Resolution (Output Mode)

Pick one output mode based on decision urgency.

### Mode A — Selection (default)

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

### Mode B — Composition

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

### Mode C — Conflict Surfacing (recommended for high-stakes)

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

  attack_graph:
    - "security attacks performance: prepared statements still allow errors"
    - "performance attacks security: ORM adds 300% overhead unnecessarily"
    - "maintainability attacks both: inconsistency is the real problem"

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

**Done when** the chosen mode produces output, the attack graph is included for auditability, and confidence scores are preserved.

## Confidence Scoring

**Perspective confidence:**

```
confidence = (triad_convergence * evidence_strength * priority_weight)

Where:
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

## Anti-Patterns

- **Force consensus when genuine conflict exists** — hides risk
- **Let high-priority perspectives always win** — ignores evidence
- **Skip the argumentation phase** — misses cross-perspective learning
- **Store only final conclusions** — lose reasoning traceability

## Example: Complete Workflow

**Situation:** "Should we add caching to the user profile endpoint?"

**Perspectives:**
- Performance: "Reduce latency from 200ms to 20ms"
- Consistency: "Users must see their own updates immediately"
- Complexity: "Cache invalidation is hard to get right"

**Triad Cycles:**

```
Performance perspective:
  Abduce: Redis cache, in-memory cache, CDN cache
  Deduce: Redis gives 10x speedup, invalidation manageable
  Induce: "Caching is viable if TTL < 5 seconds"

Consistency perspective:
  Abduce: Stale cache = user confusion, write-through cache
  Deduce: Any TTL > 0 creates inconsistency window
  Induce: "Only acceptable if real-time updates not required"

Complexity perspective:
  Abduce: Cache warming, cache stampede, invalidation bugs
  Deduce: All add operational burden, some cause outages
  Induce: "Caching should be last resort after query optimization"
```

**Argumentation:**

```
Performance attacks Consistency:
  "5-second stale window is acceptable for profile data"

Consistency attacks Performance:
  "Users update profile expecting immediate reflection"

Complexity attacks Performance:
  "Query optimization (indexes) gives 5x speedup without cache complexity"

Performance undercut:
  "5x from indexes + 2x from cache = 10x total"
```

**Conflict Surfacing Output:**

```
Genuine trade-off detected:
- Performance wants caching for 10x speedup
- Consistency wants no caching for immediate updates
- Complexity wants neither — optimize queries instead

Recommendation:
Start with query optimization (satisfies Complexity, partially Performance).
Revisit caching only if 5x improvement insufficient AND consistency window acceptable.
```

### Lightweight Mode (Jury Pattern)

For faster multi-perspective analysis without full triad cycles, use the Jury pattern:
1. Assign 3-4 jurors each with a distinct perspective and explicit goal
2. Each round: juror makes a claim, another juror responds with counter/concession
3. Build a **conflict graph** — nodes are claims/positions, edges are disagreements
4. The graph reveals which disagreements are fundamental (different values) vs tactical (different facts)
5. Verdict: decision with confidence, resolved vs persistent edges, most-useful argument credited

This trades triad depth for speed. Use when urgency doesn't allow full Rashomon cycles but multi-perspective analysis is still needed.

---

## References

For deeper guidance on choosing and weighting perspectives (optimist vs pessimist vs pragmatist, weighting by task type):

- [`references/perspective-selection.md`](references/perspective-selection.md) — selection guide and weighting table
