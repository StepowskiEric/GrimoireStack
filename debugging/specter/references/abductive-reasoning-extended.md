# Abductive Reasoning for Debugging — Extended Reference

This reference preserves the detailed state machine, coherence scoring rubric, and pitfalls from the abductive-first-debugging skill, now absorbed into specter.

## The 6-State Abductive Protocol (Detailed)

For cases where specter's 4-phase approach needs more rigor, this detailed 6-state protocol provides explicit state transitions and scoring.

### State 0: Symptom Collection

Gather all observations before hypothesizing.

```yaml
symptom_collection:
  primary_symptom: "The main failure (e.g., '500 errors under load')"
  
  secondary_symptoms:
    - "Intermittent, not consistent"
    - "Only happens with cache cold"
    - "Stops after restart"
    - "No errors in application logs"
    - "Database shows connection timeouts"
    
  negative_symptoms:  # Things that DON'T happen (equally important)
    - "Doesn't happen on single requests"
    - "Doesn't happen when cache is warm"
    - "No memory pressure observed"
    
  context:
    recent_changes: ["Deployed new auth middleware"]
    environment: "Production, 1000+ concurrent users"
    timing: "Started 2 days ago"
    server_logs:  # CHECK SERVER LOGS — client-side symptoms may have server-side root causes
      - "Did the gateway/server return 500s on auth endpoints?"
      - "Are there any 'binding unavailable' or 'connection refused' errors?"
```

**Critical pitfall — silent server-side failures in client-side auth flows:**
When debugging sign-in/auth flows, the browser may silently handle auth errors without showing visible errors on the page. A 500 from an auth endpoint commonly manifests as "button disabled, no redirect" rather than an error banner. **Always check the network tab or server logs for 500 responses on auth endpoints before forming hypotheses about client-side rendering issues.**

**Critical pitfall — `browser_console` eval vs actual page capabilities:**
The `browser_console` tool's evaluated JavaScript runs in a security context that may differ from the page's own JavaScript. If `localStorage.getItem()` or similar DOM APIs return "Access is denied" from the eval pane, **do not assume the page itself has the same restriction.** The page's own React/Vue code may read/write localStorage without issue while the eval context is blocked by sandbox policies.

### State 1: Hypothesis Generation

(See specter Phase 1 — same approach, plus force at least one wildcard hypothesis)

### State 2: Explanatory Coherence Evaluation

Score each hypothesis on how well it explains ALL symptoms:

```yaml
coherence_evaluation:
  scoring_criteria:
    coverage: "What % of symptoms are explained"
    specificity: "Are explanations precise or hand-wavy?"
    simplicity: "Does it require many assumptions?"
    consistency: "Do the pieces fit together logically?"
    
  evaluations:
    - hypothesis: "H1"
      coverage: 80%  # 4/5 symptoms
      unexplained:
        - "Restart fix (weak explanation: 'clears load')"
      coherence_score: 0.75
```

### State 3: Inference to Best Explanation (IBE)

Select the hypothesis with best explanatory coherence. If no hypothesis scores >0.6, gather more evidence targeting unexplained symptoms before proceeding.

### State 4: Differential Diagnosis

Design tests that discriminate between best hypothesis and alternatives:

```yaml
discriminatory_tests:
  - test: "Warm cache before load test"
    prediction_if_H1_correct: "No failures"
    prediction_if_H2_correct: "Still fails (pool leak)"
    prediction_if_H3_correct: "Still fails (query plan)"
```

### State 5: Execute and Update

Run discriminatory tests, update confidence. If test contradicts best hypothesis, re-evaluate all hypotheses.

## When NOT to Use Abductive Debugging

Empirically validated findings (from skill evaluations):

- **Deterministic code bugs with reproducible failing test** — abduction burns tool-call budget on hypothesis generation without fixing the bug. A FastAPI router bug trial consumed 20 tool calls and failed to produce a fix, while a baseline agent fixed it in 5 calls.
- **Tight tool-call budget (≤25 calls)** — the 6-state protocol requires ~10-15 calls before any code change.
- **Silent logic error in a single module** — abduction is designed for multi-system novel failures, not localized type mismatches or initialization order bugs.

For these cases, use `debug-subagent` (clear bugs) or `debug-to-fix-pipeline` (structured pipeline with abductive Phase 1 but more efficient overall).

## Reasoning Modes Quick Reference

| Mode | Question | When to Use |
|------|----------|-------------|
| **Deductive** | "Given cause X, what effects follow?" | Known cause, predict effects |
| **Inductive** | "Given many cases, what's the pattern?" | Historical data, predict future |
| **Abductive** | "Given symptom Y, what best explains it?" | Unknown cause, infer explanation |