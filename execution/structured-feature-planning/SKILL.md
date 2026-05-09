---
source: "jerry-skills"
name: structured-feature-planning
category: execution
description: >
  Structured exploration + planning workflow for implementing new features — read files,
  search for patterns, self-review twice, then execute. Designed for correctness-critical
  features where quality matters more than speed. The governing rule: never hallucinate
  when confused.
...



---

# Structured Feature Planning

A real engineer doesn't guess when they're unsure. Neither does this skill.

**Governing rule:** If you are confused, uncertain, or don't know something — STOP. Search for it. Get more context. Ask. Do NOT fabricate an answer. A partially-complete plan is infinitely better than a wrong plan built on guessed assumptions.

___


## When to Use

Use this skill when:
- Starting a new feature of any complexity
- The request is ambiguous or could be interpreted multiple ways
- The feature touches existing architecture you haven't read yet
- You feel yourself "just starting to code" without a clear plan

Do NOT use when:
- Trivial one-liner change
- You already have an approved spec and just need to execute
- The task is purely exploratory with no implementation delivery

___


## Core Workflow

```
┌─────────────────────────────────────────┐
│  PHASE 1: Explore                       │
│  Read relevant files. Emit structured    │
│  findings. Note locations, key functions, │
│  and what each file does relevant to     │
│  this feature.                          │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  PHASE 2: Search                        │
│  3-5 targeted searches for specific      │
│  implementation patterns. PURPOSE first,  │
│  then query. No wandering.              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  PHASE 3: Stuck Detection               │
│  If uncertain about ANYTHING:            │
│  → search to resolve it                 │
│  → OR emit NEEDS_CLARIFICATION block    │
│  → NEVER fabricate, guess, or assume    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  PHASE 4: Plan                          │
│  Write the plan as structured JSONL.    │
│  Each step: action, files, confidence,  │
│  assumptions. Explicit out-of-scope.      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  PHASE 5: Self-Review Pass 1           │
│  Diff plan against original request.     │
│  Did scope creep? Did something shift?   │
│  Correct if needed.                     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  PHASE 6: Self-Review Pass 2           │
│  Pre-mortem: if this plan ships and     │
│  fails, why? Map each failure mode to   │
│  a gap in the plan. Fix gaps or flag.   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  PHASE 7: Summary + Execute             │
│  Plain-English summary + top risks.      │
│  Start working with plan in hand.       │
│  Plan is reference, not prison — update │
│  if you discover new information.        │
└─────────────────────────────────────────┘
```

___


## Phase 1: Explore

Read files relevant to the feature. For each file, emit a structured finding.

**Output format (JSONL):**
```jsonl
{"phase": "file_read", "path": "...", "relevant_to": "...", "key_findings": ["function X at line Y does Z", "schema field W is type T"], "gaps_or_questions": ["..."]}
```

**What to note per file:**
- What in this file is relevant to the feature
- Key functions, classes, schemas with line numbers
- Any patterns you can import (e.g., "this file uses the IF type::is_string() pattern for option<T> fields")
- Specific gaps or questions this file raised

**Rule:** If the file references something you haven't read and don't understand — read that file too before continuing. Do not skip context.

___


## Phase 2: Search

3-5 targeted searches maximum. Each search MUST have a PURPOSE line before the query.

**Search format:**
```jsonl
{"phase": "search", "purpose": "Why am I searching this? What do I hope to find?", "query": "...", "findings": "...", "useful": true|false}
```

**What to search for:**
- Implementation patterns for specific ambiguous parts (e.g., "how do memory systems implement importance-weighted decay")
- Academic or well-documented approaches to the specific problem
- How similar systems solve the same problem
- Specific technical questions that arose during file reading

**What NOT to search for:**
- Open-ended "are there any issues with X"
- Generic best practices that don't apply specifically
- Things you could answer by reading the code more carefully

**Rule:** If 3-5 searches don't resolve your uncertainty, emit a NEEDS_CLARIFICATION block and stop searching. Do not spiral.

___


## Phase 3: Stuck Detection

After search, check: am I still uncertain about anything?

**If YES and search could resolve it:**
- Run the search
- Document the finding
- Move on

**If YES but search cannot resolve it (requires human knowledge, business decision, architecture choice you can't make):**
```jsonl
{"phase": "needs_clarification", "issue": "...", "why_search_cannot_resolve": "...", "options_if_knowledgeable": ["option A", "option B"], "recommendation": "..."}
```
Then STOP PHASE 3 and do not proceed to Phase 4 until resolved.

**If NO:** Proceed to Phase 4.

**The cardinal rule:** Do NOT put a fake answer in the plan. Do NOT assume the implementation detail you don't understand. Do NOT proceed past confusion. An incomplete plan with a honest question is always better than a confident plan built on a guessed answer.

___


## Phase 4: Write the Plan

Write the full plan as JSONL. Each step is one atomic action.

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

**Confidence levels:**
- HIGH: I understand this fully, have read the relevant code, know the pattern
- MEDIUM: I understand the general approach but have assumptions that need verification
- LOW: I have a working theory but haven't verified it against the codebase

**For MEDIUM/LOW steps:** The assumptions field must be explicit. If an assumption turns out wrong during execution, return to this plan and update it.

___


## Phase 5: Self-Review Pass 1

Compare the plan against the original user request.

```jsonl
{"phase": "review_pass1", "diff_vs_request": "unchanged|clarified|expanded|reduced", "explanation": "...", "changes_made": ["..."]}
```

**Check:**
- Did the plan stay within the original request scope?
- Did any step expand scope beyond what was asked?
- Did any step reduce scope without justification?
- Did any ambiguity from the request get resolved in the plan correctly?

**If scope changed without user approval:** Either correct the plan back to the original scope, or emit a scope_change block and note it for the user.

___


## Phase 6: Self-Review Pass 2 (Pre-Mortem)

For each plan step, ask: "if this ships and causes a problem, what went wrong?"

```jsonl
{"phase": "review_pass2", "failure_modes": [{"step_n": 1, "failure_mode": "...", "gap_in_plan": "..."}]}
```

**For each identified gap:**
- If fixable now: update the plan step
- If not fixable: flag as KNOWN_GAP in the plan

**If a failure mode is severe and the plan has no mitigation:** Stop. Do not proceed. Revert to Phase 3 (stuck detection) and emit a critical NEEDS_CLARIFICATION block.

___


## Phase 7: Summary + Execute

```jsonl
{"phase": "summary", "plain_english": "One paragraph: what this plan does and why", "top_risks": ["risk 1", "risk 2"], "confidence": "HIGH|MEDIUM|LOW", "uncertain_steps": [1, 3], "steps_total": N}
```

After emitting summary: begin execution. Use the plan as a reference. If you discover new information during execution that changes any step: update the plan and note what changed and why.

___


## The Confusion Rule (Governing)

**When ANY of these occur, STOP immediately:**

1. You don't understand how a specific function works
2. You're about to assume what a piece of code does without reading it
3. You feel yourself about to write "I believe X happens here" without verification
4. Two files give contradictory information about the same thing
5. You can't explain why a plan step will work

**The correct response to confusion:**
1. Read more files
2. Search for the specific unknown
3. If neither resolves it: emit NEEDS_CLARIFICATION and stop the planning workflow
4. Never: fabricate an answer, assume the guess is correct, or continue as if you're not confused

**Quality over speed is the explicit value here.** A plan that takes an extra 20 minutes to get right is worth more than a fast plan built on 3 guessed assumptions.

___


## Output File

All JSONL goes to `feature_plan.jsonl` in the working directory. The file is the artifact. The summary (Phase 7) is the human-readable output.

**Script companion:** `scripts/structured_planner.py` — enforces phase ordering, validates JSONL output, manages resume from last incomplete phase.

___


## Example Full Run (condensed)

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
