# Metacognitive Monitoring — Examples & Tracking

## Worked example: code change evaluation

```yaml
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

## Worked example: uncertain diagnosis

```yaml
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

## Tracking metacognitive performance

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

  profile: "Selective sensitivity"  # Positive delta, moderate magnitude
```

- **Target:** delta > 20% = selective sensitivity
- **Warning:** delta < 5% = poor discrimination
- **Critical:** negative delta = inverted metacognition (confident when wrong)

## The three profiles

| Profile | Pattern | Problem |
|---------|---------|---------|
| **Blanket Confidence** | always sure, often wrong | unreliable for critical decisions |
| **Blanket Withdrawal** | always uncertain, never commits | useless for autonomous action |
| **Selective Sensitivity** | knows what it knows | target state |

## Integration

- Use **before** `thought-retriever` to decide whether a thought is worth storing
- Use **with** `specter` to rank competing hypotheses
- Use **after** `rashomon-triad-hybrid` to assess which perspective won fairly

## Sources

- "The Metacognitive Monitoring Battery" (arXiv:2604.15702)
- Nelson & Narens (1990) — monitoring-control framework
- Koriat & Goldsmith (1996) — dual-probe methodology
