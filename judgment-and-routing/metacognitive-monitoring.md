# Skill: Metacognitive Monitoring — Know When You Don't Know

## Purpose

Force explicit calibration between confidence and accuracy. After every significant answer or decision, the agent must assess whether to **KEEP** or **WITHDRAW** its output, and **BET** or decline — creating a measurable "withdraw delta" between correct and incorrect items.

Based on the Nelson-Narens (1990) monitoring-control framework and Koriat-Goldsmith (1996) dual-probe methodology, adapted for LLM self-evaluation.

---

## When to Use

- Before committing to any high-stakes code change
- When the agent is uncertain but might be overconfident
- For selective prediction (knowing which outputs to trust)
- When building human-AI collaboration interfaces
- Any task where "knowing what you don't know" matters more than raw accuracy

---

## Core Concept

Most agents exhibit one of three metacognitive profiles:

| Profile | Pattern | Problem |
|---------|---------|---------|
| **Blanket Confidence** | Always sure, often wrong | Unreliable for critical decisions |
| **Blanket Withdrawal** | Always uncertain, never commits | Useless for autonomous action |
| **Selective Sensitivity** | Knows what it knows | **Target state** |

**The Withdraw Delta:**
```
withdraw_delta = withdrawal_rate_incorrect - withdrawal_rate_correct

High delta = good metacognition (withdraws when wrong, keeps when right)
Zero delta = no discrimination (random withdrawal)
Negative delta = inverted metacognition (confident when wrong)
```

---

## State Machine

### State 0: Generate Output

Produce the answer/code/decision as normal.

**Exit condition:** Output exists and is complete.

---

### State 1: Confidence Probe (KEEP or WITHDRAW?)

**Mandatory question:**
> "If you had to choose between keeping this answer or withdrawing it (and saying 'I don't know'), which would you choose?"

**Response format:**
```yaml
confidence_probe:
  decision: "KEEP" | "WITHDRAW"
  confidence_score: 0-100  # Numeric confidence
  
  # If KEEP:
  keep_rationale: "Why this answer is likely correct"
  
  # If WITHDRAW:
  withdraw_rationale: "What uncertainty makes this unreliable"
  alternative_action: "What to do instead (investigate, ask, defer)"
```

**Exit condition:** Explicit KEEP or WITHDRAW decision recorded.

---

### State 2: Betting Probe (BET or DECLINE?)

**Mandatory question:**
> "If this answer being correct was worth $100 and being wrong cost you $100, would you bet on it?"

**Response format:**
```yaml
betting_probe:
  decision: "BET" | "DECLINE"
  
  # If BET:
  bet_amount: "How much you'd stake (e.g., $20, $50, $100)"
  
  # If DECLINE:
  decline_rationale: "Specific risk that makes betting unwise"
  information_needed: "What would make you willing to bet"
```

**Exit condition:** Explicit BET or DECLINE decision recorded.

---

### State 3: Calibration Check

Compare confidence probe to betting probe:

```yaml
calibration_check:
  # Consistency check
  probes_aligned: true | false
  
  # If KEEP + BET: High confidence path
  # If KEEP + DECLINE: Confidence mismatch — investigate
  # If WITHDRAW + BET: Fatal mismatch — logic error
  # If WITHDRAW + DECLINE: Low confidence path
  
  calibration_assessment: |
    - "Well-calibrated" (high confidence → correct, low → incorrect)
    - "Overconfident" (high confidence → incorrect)
    - "Underconfident" (low confidence → correct)
    - "Random" (no correlation)
```

**Exit condition:** Calibration assessed, mismatches flagged.

---

### State 4: Resolution

Based on probe results:

```yaml
resolution:
  # If KEEP + BET and well-calibrated:
  action: "PROCEED"
  
  # If KEEP + DECLINE or WITHDRAW:
  action: "INVESTIGATE"
  investigation_plan:
    - "Specific gap to fill"
    - "Evidence to gather"
    - "Alternative to evaluate"
  
  # If fatal mismatch (WITHDRAW + BET):
  action: "HALT"
  halt_reason: "Logic error in self-assessment — restart reasoning"
```

---

## Example: Code Change Evaluation

```yaml
# State 0: Generate output
proposed_change:
  file: "/auth/middleware.ts"
  change: "Add JWT verification before route handler"
  diff: "..."

# State 1: Confidence probe
confidence_probe:
  decision: "KEEP"
  confidence_score: 85
  keep_rationale: |
    The middleware pattern is standard. JWT verification 
    happens before route handler in all documented examples.
    No async operations that could cause race conditions.

# State 2: Betting probe  
betting_probe:
  decision: "BET"
  bet_amount: "$75"
  
# State 3: Calibration check
calibration_check:
  probes_aligned: true
  calibration_assessment: "Well-calibrated for this pattern"

# State 4: Resolution
resolution:
  action: "PROCEED"
  final_confidence: 85
```

---

## Example: Uncertain Diagnosis

```yaml
# State 0: Generate output
proposed_diagnosis:
  problem: "Race condition in cache warming"
  evidence: "Intermittent 500s under load"

# State 1: Confidence probe
confidence_probe:
  decision: "WITHDRAW"
  confidence_score: 40
  withdraw_rationale: |
    While load-related, I haven't verified:
    1. Whether cache warming actually runs concurrently
    2. Connection pool metrics during failures
    3. Whether the issue persists without cache

# State 2: Betting probe
betting_probe:
  decision: "DECLINE"
  decline_rationale: |
    Betting $100 on "race condition" without seeing 
    concurrent execution evidence is gambling, not diagnosis.
  information_needed: |
    - Logs showing overlapping cache operations
    - Connection pool exhaustion metrics
    - Reproduction without cache layer

# State 3: Calibration check
calibration_check:
  probes_aligned: true
  calibration_assessment: "Appropriately uncertain"

# State 4: Resolution
resolution:
  action: "INVESTIGATE"
  investigation_plan:
    - "Check logs for concurrent cache operations"
    - "Monitor connection pool during next failure"
    - "Test with cache disabled to isolate"
```

---

## Tracking Metacognitive Performance

Over time, track your withdraw delta:

```yaml
metacognitive_log:
  total_evaluations: 50
  
  correct_kept: 35      # True positives
  correct_withdrawn: 3  # False negatives (underconfidence)
  incorrect_kept: 8     # False positives (overconfidence)  
  incorrect_withdrawn: 4 # True negatives
  
  # Calculate rates
  withdrawal_rate_correct: 3/38 = 7.9%
  withdrawal_rate_incorrect: 4/12 = 33.3%
  
  withdraw_delta: 33.3% - 7.9% = 25.4%
  
  # Assessment
  profile: "Selective sensitivity"  # Positive delta, moderate magnitude
  # vs "Blanket confidence" (low delta, high incorrect_kept)
  # vs "Blanket withdrawal" (high delta on both sides)
```

**Target:** Delta > 20% indicates selective sensitivity.
**Warning:** Delta < 5% indicates poor discrimination.
**Critical:** Negative delta indicates inverted metacognition (confident when wrong).

---

## Integration with Other Skills

- Use **before** `thought-retriever` to decide whether a thought is worth storing
- Use **with** `specter` to rank competing hypotheses
- Use **after** `rashomon-triad-hybrid` to assess which perspective won fairly

---

## Anti-Patterns

**Don't:**
- Always KEEP (blanket confidence)
- Always WITHDRAW (blanket withdrawal)
- Let confidence score drift from betting decision
- Ignore calibration mismatches

**Do:**
- Be specific about *why* you're uncertain
- Track patterns over time
- Adjust confidence based on feedback
- Honor WITHDRAW decisions even when inconvenient

---

## See Also

- Paper: "The Metacognitive Monitoring Battery" (arXiv:2604.15702)
- Nelson & Narens (1990) — monitoring-control framework
- Koriat & Goldsmith (1996) — dual-probe methodology
