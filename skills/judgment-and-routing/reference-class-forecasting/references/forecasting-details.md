# Reference Class Forecasting — Template, Data & Failure Modes

## Template

```md
## Task Being Estimated
<what is being estimated>

## Inside View Estimate
<what the plan analysis suggests>

## Reference Class
<what category of work this belongs to>

## Base Rate Evidence
- Typical outcome for this reference class:
  - <range>
- What percentage of similar tasks overran the initial estimate?
  - <percentage>
- What caused overruns in the reference class?
  - <cause>

## Base Rate Estimate (anchored)
<range anchored to reference class, not inside view>

## Inside-View Adjustments
- Factors that suggest this will be faster than typical:
  - <factor> — adjusts estimate down by <amount> — evidence: <evidence>
- Factors that suggest this will be slower than typical:
  - <factor> — adjusts estimate up by <amount> — evidence: <evidence>

## Final Estimate
- Range: <low> to <high>
- Confidence: <percentage>
- Key risk that could push to the high end:
  - <risk>
- Assumption that must hold for the low end to be achievable:
  - <assumption>
```

## Common reference-class data points (indicative — verify against your context)

| Task type | Typical inside-view | Typical actual outcome |
|-----------|--------------------|-----------------------|
| Schema migration | 1–2 days | 3–10 days |
| Service extraction | 1 week | 3–6 weeks |
| New auth integration | 3 days | 2–4 weeks |
| CI/CD pipeline rewrite | 1 week | 3–8 weeks |
| Dependency upgrade (major) | 1 day | 3–10 days |
| Performance optimization project | 2 weeks | 4–12 weeks |

## Failure modes this skill prevents

1. **Planning fallacy** — estimating from the inside view alone produces optimistic outliers
2. **Best-case anchoring** — the estimate is built from the best case, ignoring exceptions, dependencies, and validation overhead
3. **Point-estimate commitment** — a single number hides real uncertainty and creates false expectations
4. **Scope blindness** — inside-view estimates undercount surface area because they are built from what is already visible

## Pairing guide

- **Kahneman Fast/Slow** — slow mode for estimation; Reference Class Forecasting is the outside-view technique Kahneman recommends
- **Pre-Mortem** — after the reference-class estimate, identify what specific failure modes push toward the high end
- **Second-Order Thinking** — reveals the dependencies that make the high end realistic
- **ETTO** — decide how much rigor to invest in the estimation before committing

## Definition of done

Applied correctly when:
- a reference class was identified before inside-view reasoning began
- base-rate evidence was gathered and documented
- the estimate was anchored to the reference class, not the inside view
- inside-view adjustments were evidence-based, not optimism-based
- the final estimate was a range with explicit uncertainty
- the key risk driving the high end was named
