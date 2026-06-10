# Skill: Rashomon-Triad Hybrid — Multi-Perspective Structured Reasoning

## Purpose

Combine two powerful techniques for complex decision-making:
- **Rashomon Memory**: Maintain multiple conflicting interpretations of the same situation, each optimized for different goals
- **Triad Reasoning**: Separate hypothesis generation, verification, and pattern extraction into three specialized reasoning modes

This hybrid creates a structured debate system where parallel perspectives (security, performance, maintainability) each run their own abductive-deductive-inductive reasoning cycles, then argue their conclusions via structured argumentation.

**Best for:** High-stakes decisions with genuine trade-offs, architecture reviews, security audits, and any situation where "it depends" is the honest answer.

---

## When to Use

Use this skill when:
- Multiple stakeholders have genuinely conflicting goals (not just miscommunication)
- The decision has no single "correct" answer — only trade-offs
- You need to surface and document why alternatives were rejected
- You want to avoid premature consensus that hides real risks
- The problem requires both creative exploration AND rigorous verification

**Don't use when:**
- There's a single clear objective (use triad-reasoning alone)
- Speed matters more than thoroughness
- The decision is reversible and low-cost

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PARENT AGENT (Orchestrator)                      │
│         Observes, coordinates, surfaces conflicts                   │
│              Does NOT merge prematurely                               │
└─────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Perspective  │    │  Perspective  │    │  Perspective  │
│  A (Security) │    │  B (Perf)     │    │  C (Maintain) │
│               │    │               │    │               │
│ ┌───────────┐ │    │ ┌───────────┐ │    │ ┌───────────┐ │
│ │ Abductor  │ │    │ │ Abductor  │ │    │ │ Abductor  │ │
│ │ (Generate │ │    │ │ (Generate │ │    │ │ (Generate │ │
│ │  threats) │ │    │ │  bottlenecks│    │ │  complexity│ │
│ └─────┬─────┘ │    │ └─────┬─────┘ │    │ └─────┬─────┘ │
│       │       │    │       │       │    │       │       │
│ ┌─────▼─────┐ │    │ ┌─────▼─────┐ │    │ ┌─────▼─────┐ │
│ │ Deducer   │ │    │ │ Deducer   │ │    │ │ Deducer   │ │
│ │ (Verify   │ │    │ │ (Verify   │ │    │ │ (Verify   │ │
│ │  exploits)│ │    │ │  latency) │ │    │ │  testability│  │
│ └─────┬─────┘ │    │ └─────┬─────┘ │    │ └─────┬─────┘ │
│       │       │    │       │       │    │       │       │
│ ┌─────▼─────┐ │    │ ┌─────▼─────┐ │    │ ┌─────▼─────┐ │
│ │ Inductor  │ │    │ │ Inductor  │ │    │ │ Inductor  │ │
│ │ (Pattern  │ │    │ │ (Pattern  │ │    │ │ (Pattern  │ │
│ │  extract) │ │    │ │  extract) │ │    │ │  extract) │ │
│ └───────────┘ │    │ └───────────┘ │    │ └───────────┘ │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ARGUMENTATION ENGINE (Dung's Semantics)                │
│                                                                     │
│  Each perspective proposes conclusions and critiques others       │
│  Attack graph records: which won, which lost, and why             │
│                                                                     │
│  Example attacks:                                                   │
│  - "Your 'fast' solution opens SQL injection (security→performance)"│
│  - "Your 'secure' solution adds 500ms latency (performance→security)│
│  - "Both ignore testability (maintainability→both)"                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         OUTPUT MODES                                │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│   SELECTION     │   COMPOSITION   │      CONFLICT SURFACING         │
│  (pick winner)  │  (merge non-   │  (return attack graph as          │
│                 │   conflicting)  │   explanation)                  │
└─────────────────┴─────────────────┴─────────────────────────────────┘
```

---

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
    
  output_mode: "conflict_surfacing"  # selection|composition|conflict_surfacing
```

---

## State Machine

### State 0: Configuration

**Goal:** Define the situation and perspectives clearly

**Exit condition:**
- `rashomon_triad_config` document exists
- Each perspective has distinct goal and vocabulary
- Situation is described with enough context for reasoning

**Artifacts:**
```yaml
# config.yaml
situation: "<detailed description>"
perspectives: [...]
convergence: [...]
```

---

### State 1: Parallel Triad Reasoning

**Goal:** Each perspective runs independent abductive-deductive-inductive cycles

**Execution:**
```
Spawn N sub-agents in parallel (one per perspective)
Each runs triad-reasoning on the SAME situation
BUT with different goals, vocabularies, and priorities
```

**Per-Perspective Triad Cycle:**

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

**Exit condition:**
- All perspectives have completed triad cycles
- Each has generated conclusions with confidence scores
- Hypotheses are tagged with supporting evidence

---

### State 2: Argumentation

**Goal:** Perspectives critique each other's conclusions

**How it works:**
```
For each perspective:
  1. Propose final conclusion(s) with confidence
  2. Identify which other perspectives' conclusions it attacks
  3. Provide attack rationale using its own vocabulary

Attack types:
  - direct_attack: "Your solution fails my goal"
  - undercut: "Your evidence doesn't support your conclusion"
  - rebuttal: "My goal overrides yours in this context"
```

**Example Attack Graph:**
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

**Exit condition:**
- All perspectives have critiqued others
- Attack graph shows which conclusions survive
- Dung's semantics applied to determine winners

---

### State 3: Resolution (Output Mode)

**Goal:** Produce final output based on selected mode

#### Mode A: Selection (Default)
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

#### Mode B: Composition
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

#### Mode C: Conflict Surfacing (Recommended for high-stakes)
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

**Exit condition:**
- Output produced in selected mode
- Attack graph included for auditability
- Confidence scores preserved

---

## Integration with Thought-Retriever

Each perspective's reasoning can be stored as thoughts:

```yaml
# During triad cycles, store to Coppermind:
thought_store:
  perspective: "security"
  iteration: 2
  thought_type: "inference"
  content: "String interpolation in SQL is injection vulnerability"
  confidence: 0.95
  
# During argumentation, store attacks:
thought_store:
  perspective: "performance"
  target: "security"
  thought_type: "rebuttal"
  content: "Prepared statements eliminate injection risk without ORM overhead"
  confidence: 0.85
```

This enables future retrieval: "How did we resolve the security-performance trade-off in the auth module?"

---

## Confidence Scoring

**Perspective Confidence:**
```
confidence = (triad_convergence * evidence_strength * priority_weight)

Where:
- triad_convergence: 1.0 if abduction→deduction→induction converged, else 0.7
- evidence_strength: ratio of validated to total hypotheses
- priority_weight: perspective's configured priority (0.0-1.0)
```

**Attack Strength:**
```
attack_confidence = attacker_confidence * (1 - target_confidence) * evidence_quality

Strong attack: high confidence attacker vs low confidence target + good evidence
Weak attack: low confidence or poor evidence
```

---

## Anti-Patterns

**Don't:**
- Force consensus when genuine conflict exists (hides risk)
- Let high-priority perspectives always win (ignores evidence)
- Skip the argumentation phase (misses cross-perspective learning)
- Store only final conclusions (lose reasoning traceability)

**Do:**
- Surface conflicts explicitly in "conflict_surfacing" mode
- Include attack graph in all outputs (shows alternatives considered)
- Let perspectives change their conclusions based on attacks
- Store full reasoning traces via thought-retriever

---

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

---

## See Also

- Paper: "Rashomon Memory: Towards Argumentation-Driven Retrieval" (arXiv:2604.03588)
- Paper: "Structured Abductive-Deductive-Inductive Reasoning" (arXiv:2604.15727)
- `thought-retriever-coppermind` — for storing reasoning traces
- `pre-mortem` — for risk analysis before decisions
