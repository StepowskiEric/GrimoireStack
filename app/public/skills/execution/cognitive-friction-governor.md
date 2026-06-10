# Skill: Cognitive Friction Governor

## Purpose

Impose "friction" on deliberation — a cost system that forces bounded, purposeful thinking. Assign deliberation budgets to tasks; each reasoning step consumes friction; budget exhausted means decision time.

Based on "Cognitive Friction: A Decision-Theoretic Framework for Bounded Deliberation in Tool-Using Agents" (arXiv:2603.30031).

---

## When to Use

- When you tend to over-think trivial problems
- When you under-think complex problems
- For time-boxed decision making
- When analysis paralysis is a recurring issue
- Any task where deliberation depth should match stakes

**Don't use when:**
- Learning/exploration is the primary goal (not decision)
- The problem is genuinely open-ended research
- Time is truly unlimited (rare)

---

## Core Concept

**Friction = Cost of Thinking**

Every cognitive operation has a friction cost. You have a budget. When budget is exhausted, you must:
1. Decide with current information, OR
2. Explicitly request more budget (with justification)

**Friction Costs:**

| Operation | Friction Cost | Why |
|-----------|---------------|-----|
| Quick search | 1 | Low effort, high information |
| Read file | 2 | Understanding context |
| Run test | 3 | Validation |
| Spawn sub-agent | 5 | Parallel investigation |
| Deep analysis | 10 | Heavy reasoning |
| Edit file | 3 | Committing to change |
| Revert edit | 5 | Undoing work (penalty) |
| Request more budget | 15 | Breaking the constraint |

**Budget Allocation:**

| Task Type | Budget | Typical Operations |
|-----------|--------|-------------------|
| Trivial fix | 10 | Search + read + edit |
| Standard task | 30 | Multiple files, some analysis |
| Complex refactor | 60 | Deep investigation, tests |
| Architecture decision | 100 | Full exploration, alternatives |

---

## State Machine

### State 0: Budget Allocation

Assign friction budget based on task stakes.

```yaml
friction_budget:
  task: "Debug authentication failure"
  assessed_complexity: "medium"  # trivial | low | medium | high | critical
  
  budget_allocation:
    trivial: 10
    low: 20
    medium: 30
    high: 60
    critical: 100
  
  allocated_budget: 30
  rationale: |
    Auth failures can have multiple causes (network, config, code).
    Need to investigate logs, check recent changes, test hypothesis.
    Not trivial, but not architectural.
```

**Exit condition:** Budget allocated with justification.

---

### State 1: Execute with Friction Tracking

Perform operations, deduct friction.

```yaml
friction_log:
  remaining_budget: 30
  
  operations:
    - op: "Search for auth error patterns"
      cost: 1
      remaining: 29
      
    - op: "Read auth middleware file"
      cost: 2
      remaining: 27
      
    - op: "Check recent git history"
      cost: 1
      remaining: 26
      
    - op: "Read error logs"
      cost: 2
      remaining: 24
      
    - op: "Form hypothesis: config drift"
      cost: 0  # thinking is free (but slow)
      remaining: 24
      
    - op: "Check environment variables"
      cost: 1
      remaining: 23
      
    - op: "Deep analysis: compare dev/prod configs"
      cost: 10
      remaining: 13
      
    - op: "Spawn sub-agent to check DB connection"
      cost: 5
      remaining: 8
```

**Exit condition:** Budget exhausted OR task complete.

---

### State 2: Budget Exhaustion Decision

When budget runs low, explicit decision required.

```yaml
budget_exhaustion:
  remaining: 8
  
  options:
    - option: "DECIDE_NOW"
      description: "Work with current understanding"
      confidence: 0.75
      action: "Fix the config drift we identified"
      
    - option: "REQUEST_MORE_BUDGET"
      description: "Need deeper investigation"
      additional_budget_requested: 20
      justification: |
        Found potential config issue, but also seeing DB timeout errors.
        May be two separate issues or related. Need to investigate
        DB connection pool settings before confident in fix.
      
    - option: "ESCALATE"
      description: "Problem larger than assessed"
      new_assessment: "high"
      rationale: |
        Initial medium budget insufficient. Issue spans auth, DB, and
        potentially network layer. Needs architectural review.

  decision: "REQUEST_MORE_BUDGET"
  approved_additional_budget: 15  # partial approval
  new_total_budget: 23
```

**Exit condition:** Decision made, budget updated or task concluded.

---

### State 3: Completion

Task finished, review friction usage.

```yaml
completion:
  final_friction_log:
    starting_budget: 30
    additional_budget: 15
    total_budget: 45
    final_remaining: 3
    total_spent: 42
    
  friction_breakdown:
    search: 3
    read: 8
    test: 6
    analysis: 15
    sub-agent: 5
    edit: 5
    
  efficiency_assessment:
    budget_adequacy: "adequate"  # over | adequate | under
    key_insight: |
      Spent 15 friction on deep analysis that revealed root cause.
      Without friction system, might have kept searching (sunk cost).
      Budget forced decision at right time.
      
  calibration_feedback: |
    Task was actually medium-high complexity.
    Initial budget of 30 was tight; 40 would have been comfortable.
    Update complexity heuristics for auth+DB issues.
```

---

## Example: Over-Thinker Pattern

**Without friction:**
```
"I'll just check one more file..."
"Let me verify that assumption..."
"Actually, let me look at the tests..."
"Wait, what about edge cases..."
[3 hours later, still investigating trivial bug]
```

**With friction (budget: 10):**
```yaml
operation_1: "Search for error" → cost 1 → remaining 9
operation_2: "Read relevant file" → cost 2 → remaining 7
operation_3: "Check tests" → cost 3 → remaining 4
operation_4: "Form hypothesis" → cost 0 → remaining 4
operation_5: "Implement fix" → cost 3 → remaining 1

BUDGET EXHAUSTED
Decision: Deploy fix with 80% confidence
Time elapsed: 20 minutes
```

---

## Example: Under-Thinker Pattern

**Without friction:**
```
"Looks like a simple fix"
[Edit, deploy, production breaks]
"Oh, I didn't consider the side effects..."
```

**With friction (budget: 60 for complex refactor):**
```yaml
operations:
  - "Read affected files" → 2
  - "Read calling code" → 2
  - "Check test coverage" → 3
  - "Analyze dependencies" → 10
  - "Consider edge cases" → 10
  - "Spawn security review" → 5
  - "Form implementation plan" → 0
  - "Implement changes" → 3
  - "Run tests" → 3
  - "Verify in staging" → 5

Remaining: 17
Confidence: High
Side effects: Considered and mitigated
```

---

## Anti-Patterns

**Don't:**
- Cheat the system (mark expensive ops as cheap)
- Request more budget without strong justification
- Use high budgets for trivial tasks (inflation)
- Ignore the constraint when budget exhausted

**Do:**
- Be honest about operation costs
- Use budget exhaustion as a signal (not failure)
- Track calibration (were budgets right-sized?)
- Celebrate efficient decisions (low friction, good outcome)

---

## Integration

- Use **with** `metacognitive-monitoring` — friction exhaustion is a confidence signal
- Use **before** `counterfactual-policy-testing` — budget allocation determines depth of counterfactual analysis
- Use **after** `compression-as-understanding` — high friction cost for tasks you don't understand

---

## See Also

- Paper: "Cognitive Friction: A Decision-Theoretic Framework for Bounded Deliberation in Tool-Using Agents" (arXiv:2603.30031)
- `theory-of-constraints` — for system-level bottlenecks
- `explore-vs-exploit` — for resource allocation decisions
