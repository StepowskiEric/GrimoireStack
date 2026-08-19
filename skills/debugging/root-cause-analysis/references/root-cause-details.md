# Root Cause Analysis — 5 Whys, Ishikawa & Failure Modes

## 5 Whys rules

- Each answer must be a cause, not an excuse or restatement.
- If two branches diverge, both must be explored.
- Stop when the answer points to a missing process, incorrect assumption, or code defect that can be fixed.
- If you hit "human error" or "bad data," ask why the system allowed it.

### Good example

1. Why did the API return 500s? → Database connection pool exhausted.
2. Why was the pool exhausted? → Connections not released after exceptions.
3. Why weren't they released? → Missing `finally` block in `fetch_user()`.
4. Why was it missing? → No code review checklist for resource cleanup.

### Bad example

1. Why did the API return 500s? → Database was slow.
2. Why was the database slow? → Too much traffic.
3. Why was there too much traffic? → Marketing ran a campaign.

→ Dead end. The campaign is not fixable; the missing rate limiter is.

## Ishikawa categories (force one candidate in each before eliminating)

- **People** — knowledge gaps, handoff errors, missing runbooks
- **Process** — deployment gaps, missing reviews, absent monitoring
- **Technology** — code defects, dependency bugs, infrastructure limits
- **Data** — schema drift, corrupt inputs, migration errors
- **Environment** — load patterns, network partitions, clock skew

## Failure modes

| Failure Mode | Why It Fails |
|--------------|--------------|
| Add a try/catch and log | Hides the symptom; next failure is silent |
| Restart the service | Treats the symptom as transient; root cause persists |
| Blame the user / data | Not fixable; the system should handle valid edge cases |
| Fix the most recent change | Recent changes are often symptoms of deeper issues |
| Stop at "race condition" without analyzing the ordering | Race conditions have specific interleavings; generic "it's a race" is not actionable |
| Patch the failing test instead of the code | Tests are symptoms; the code under test is the cause |

## Related skills

- `specter` — generate competing hypotheses with structural code location and disconfirmation when causes are unclear
- `debug-to-fix-pipeline` — the code-debugging protocol; verification phases share the faithfulness test
- `log-trace-correlation` — map stack traces to source code
- `verify-before-integrate` — ensure fixes do not break existing behavior
- `thinking-in-systems` — understand feedback loops that cause recurring failures
