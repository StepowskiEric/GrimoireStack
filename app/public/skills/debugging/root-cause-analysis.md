# Skill: Root Cause Analysis for AI Agents

## Purpose

Use this skill when diagnosing failures, bugs, regressions, or anomalous behavior. Prevents the agent from patching symptoms, creating workaround hacks, or treating correlated effects as causes.

Root Cause Analysis (RCA) forces the agent to distinguish symptoms from causes, verify causal chains, and fix the underlying defect rather than its visible manifestation.

---

## When to Apply

- A bug returns after being "fixed"
- Multiple symptoms seem unrelated but might share a cause
- A fix in one area breaks something else
- The agent is tempted to add a guard clause, retry loop, or null check without understanding why the bad input arrived
- Log errors are cryptic or stack traces point to secondary failures
- A system degraded gradually and the trigger is unclear

---

## The Pattern

### Step 1: Freeze the Symptom

Before investigating, write down the exact observable failure. Do not speculate about causes yet.

```
Symptom: _________________________________
Frequency: _______________________________
First observed: __________________________
Affected scope: __________________________
```

Constraint: If you cannot reproduce or precisely describe the symptom, stop. You are not ready for RCA.

### Step 2: Gather Correlated Events

List everything that changed around the time the symptom appeared. Be exhaustive, not selective.

- Code changes (deployments, merges, config updates)
- Infrastructure changes (scaling events, dependency updates, certificate rotations)
- Data changes (schema migrations, bulk imports, feature flags)
- Environmental changes (traffic spikes, cron schedules, daylight saving time)

Anti-pattern: Cherry-picking the most recent change. The most recent change is often a symptom, not a cause.

### Step 3: 5 Whys (Minimum 3, Maximum 7)

For each candidate symptom, ask "Why?" recursively until you reach a fixable root cause.

Rules:
- Each answer must be a cause, not an excuse or restatement
- If two branches diverge, both must be explored
- Stop when the answer points to a missing process, incorrect assumption, or code defect that can be fixed
- If you hit "human error" or "bad data," ask why the system allowed it

Example (good):
1. Why did the API return 500s? → Database connection pool exhausted.
2. Why was the pool exhausted? → Connections not released after exceptions.
3. Why weren't they released? → Missing `finally` block in `fetch_user()`.
4. Why was it missing? → No code review checklist for resource cleanup.

Example (bad):
1. Why did the API return 500s? → Database was slow.
2. Why was the database slow? → Too much traffic.
3. Why was there too much traffic? → Marketing ran a campaign.
→ Dead end. The campaign is not fixable; the missing rate limiter is.

### Step 4: Ishikawa Diagram (Optional but Strong)

If the 5 Whys branches are complex, categorize potential causes:

- **People**: knowledge gaps, handoff errors, missing runbooks
- **Process**: deployment gaps, missing reviews, absent monitoring
- **Technology**: code defects, dependency bugs, infrastructure limits
- **Data**: schema drift, corrupt inputs, migration errors
- **Environment**: load patterns, network partitions, clock skew

Force at least one candidate in each category before eliminating any.

### Step 5: Distinguish Root Cause from Contributing Factors

A root cause, once fixed, prevents recurrence. Contributing factors make the failure worse but fixing them alone does not prevent it.

Test: If I fix X, will the symptom be impossible under the same conditions?
- Yes → X is a root cause (or one of them)
- No → X is a contributing factor; keep digging

### Step 6: Verify the Causal Chain

Before writing code, state the hypothesis and how to falsify it.

```
Hypothesis: _______________________________
Predicted outcome if true: _________________
Predicted outcome if false: ________________
Experiment to test: ________________________
```

If you cannot design an experiment, you do not have a hypothesis; you have a guess.

### Step 7: Fix the Root Cause, Not the Symptom

- Remove the defect, do not wrap it in error handling
- Add guards only if the root cause is external and unfixable (e.g., third-party API behavior)
- If the root cause is a missing process (e.g., no integration tests for retries), fix the process, not just the code

### Step 8: Prevent Recurrence

After the fix, add a specific preventive measure tied to the root cause category:

- **Code defect**: regression test that fails if the bug returns
- **Missing process**: checklist, lint rule, or CI gate
- **Knowledge gap**: documentation update or skill capture
- **Infrastructure limit**: capacity alert or auto-scaling policy

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|--------------|-------------|
| Add a try/catch and log | Hides the symptom; next failure is silent |
| Restart the service | Treats the symptom as transient; root cause persists |
| Blame the user / data | Not fixable; system should handle valid edge cases |
| Fix the most recent change | Recent changes are often symptoms of deeper issues |
| Stop at "race condition" without analyzing the ordering | Race conditions have specific interleavings; generic "it's a race" is not actionable |
| Patch the failing test instead of the code | Tests are symptoms; the code under test is the cause |

---

## Quick Reference

```
1. Symptom      → exact, reproducible description
2. Events       → all changes, not just recent ones
3. 5 Whys       → recursive causal chain
4. Ishikawa     → categorize branches
5. Root vs contrib → fix what prevents recurrence
6. Hypothesis   → falsifiable prediction
7. Fix          → remove defect, not mask symptom
8. Prevent      → test, process, or guard tied to root cause
```

---

## Related Skills

- `specter` — generate competing hypotheses with structural code location and disconfirmation when causes are unclear
- `log-trace-correlation` — map stack traces to source code
- `verify-before-integrate` — ensure fixes do not break existing behavior
- `thinking-in-systems` — understand feedback loops that cause recurring failures
