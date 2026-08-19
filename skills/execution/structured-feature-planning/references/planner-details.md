# Structured Feature Planning — Schemas, Confusion Rule & Example

## Phase JSONL schemas

### Explore (file reads)

```jsonl
{"phase": "file_read", "path": "...", "relevant_to": "...", "key_findings": ["function X at line Y does Z", "schema field W is type T"], "gaps_or_questions": ["..."]}
```

### Search

```jsonl
{"phase": "search", "purpose": "Why am I searching this? What do I hope to find?", "query": "...", "findings": "...", "useful": true|false}
```

### Stuck detection

```jsonl
{"phase": "needs_clarification", "issue": "...", "why_search_cannot_resolve": "...", "options_if_knowledgeable": ["option A", "option B"], "recommendation": "..."}
```

### Plan

```jsonl
{"phase": "plan", "steps": [
  {
    "n": 1,
    "action": "Specific action description — what to do, not how to do it",
    "files_affected": ["path/a.ts", "path/b.ts"],
    "confidence": "HIGH|MEDIUM|LOW",
    "assumptions": ["..."],
    "verification": "How will I verify this step worked?"
  }
], "out_of_scope": ["explicitly what this plan does NOT cover"], "what_i_dont_know": ["specific things not resolved yet"], "risks": [{"risk": "...", "mitigation": "..."}]}
```

### Self-review pass 1

```jsonl
{"phase": "review_pass1", "diff_vs_request": "unchanged|clarified|expanded|reduced", "explanation": "...", "changes_made": ["..."]}
```

### Self-review pass 2

```jsonl
{"phase": "review_pass2", "failure_modes": [{"step_n": 1, "failure_mode": "...", "gap_in_plan": "..."}]}
```

### Summary

```jsonl
{"phase": "summary", "plain_english": "One paragraph: what this plan does and why", "top_risks": ["risk 1", "risk 2"], "confidence": "HIGH|MEDIUM|LOW", "uncertain_steps": [1, 3], "steps_total": N}
```

## The confusion rule (governing)

Stop immediately when ANY of these occur:
1. You don't understand how a specific function works
2. You're about to assume what code does without reading it
3. You feel yourself about to write "I believe X happens here" without verification
4. Two files give contradictory information about the same thing
5. You can't explain why a plan step will work

Correct response: read more files → search the specific unknown → if neither resolves it, emit NEEDS_CLARIFICATION and stop the planning workflow. Never fabricate, never assume the guess is correct, never continue as if not confused.

## Output contract

All JSONL goes to `feature_plan.jsonl` in the working directory — the artifact. The Phase-7 summary is the human-readable output. `scripts/structured_planner.py` enforces phase ordering, validates JSONL output, and resumes from the last incomplete phase.

## Condensed example run

```jsonl
{"phase": "file_read", "path": "daemon/src/memory/neuromodulatory-state.ts", "relevant_to": "decay signals", "key_findings": ["dopamine signal computed from task_done flag", "importance stored on metadata.importance field"], "gaps_or_questions": ["does importance decay or is it static?"]}
{"phase": "file_read", "path": "daemon/src/memory/procedural-pruning.ts", "relevant_to": "forgetting mechanism", "key_findings": ["ReMe pruning runs on retrieval_count >= 5 AND utility <= 0.5", "Does NOT use time-based decay"], "gaps_or_questions": []}
{"phase": "search", "purpose": "Find Ebbinghaus forgetting curve formula to implement importance-weighted decay", "query": "Ebbinghaus forgetting curve formula importance decay memory system implementation", "findings": "R(t) = e^(-t/S) where S varies by importance", "useful": true}
{"phase": "needs_clarification", "issue": "Should Ebbinghaus decay run on read (lazy) or on a background sweep (eager)?", "why_search_cannot_resolve": "Architectural decision specific to Coppermind's usage pattern", "options_if_knowledgeable": ["lazy: compute decay on retrieval", "eager: background worker sweeps and marks invalid"], "recommendation": "lazy (simpler, no extra infrastructure)"}
{"phase": "plan", "steps": [{"n": 1, "action": "Add importance_decay field to memories schema", "files_affected": ["daemon/src/store/schema-provision.ts"], "confidence": "HIGH", "assumptions": [], "verification": "Schema provisions without error"}, {"n": 2, "action": "Implement Ebbinghaus decay function: decay(t, importance) = e^(-t / (k * importance))", "files_affected": ["daemon/src/memory/decay.ts"], "confidence": "MEDIUM", "assumptions": ["k constant needs tuning — will start with k=1.0 and sweep"], "verification": "Property tests: decay(t1) < decay(t2) when t1 > t2"}, {"n": 3, "action": "Integrate decay into retrieval pipeline: filter memories where decay(t, importance) > threshold", "files_affected": ["daemon/src/retrieval/ranker.ts"], "confidence": "MEDIUM", "assumptions": ["threshold ~0.3 based on Ebbinghaus 20min retention data"], "verification": "Retrieval tests pass with decay-filtered results"}], "out_of_scope": ["multi-hop fact update/mutation", "importance-weighted decay beyond basic liveness"], "what_i_dont_know": ["optimal k constant", "retention threshold value"], "risks": [{"risk": "Decay threshold too aggressive — loses valid recent memories", "mitigation": "Start conservative (0.1), measure recall quality"}]}
{"phase": "review_pass1", "diff_vs_request": "unchanged", "explanation": "Plan stays within Phase 3 scope: Ebbinghaus decay + importance scoring. Multi-hop excluded per request.", "changes_made": []}
{"phase": "review_pass2", "failure_modes": [{"step_n": 2, "failure_mode": "Decay function has bugs — monotonicity not enforced", "gap_in_plan": "Need property-based tests for monotonicity"}, {"step_n": 3, "failure_mode": "Decay threshold too aggressive — memory loss", "gap_in_plan": "Add logging for memories filtered by decay; make threshold configurable"}]}
{"phase": "summary", "plain_english": "Implements Ebbinghaus forgetting curve with importance as the stability factor S. Decay runs lazily on retrieval. Three steps: schema, decay function, integration.", "top_risks": ["Threshold may be wrong initially", "k constant needs tuning"], "confidence": "MEDIUM", "uncertain_steps": [2, 3], "steps_total": 3}
```
