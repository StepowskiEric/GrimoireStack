---
name: intent-specification-protocol
description: Crystallize vague coding requests into precise, testable specifications before writing any code. Prevents the Intent-Behavior Mirroring Effect where vague requirements produce invasive, over-engineered output. Based on Project Prometheus (arXiv:2604.17464), AdaCoder (arXiv:2504.04220), and iterative self-repair research (arXiv:2604.10508).
category: execution
tags: [specification, intent, requirements, code-generation, state-machine, BDD, contracts]
author: Research synthesis
date: 2026-04-22
version: 1.0.0
...



---

# Intent Specification Protocol

## When to Use

Use this skill when:
- Starting a new feature, bug fix, or code change of any size
- The request is ambiguous or could be interpreted multiple ways
- Previous attempts produced over-engineered or off-target code
- The change touches existing behavior that must be preserved
- You catch yourself about to "just start coding"
- The task involves modifying code you didn't write

Do NOT use when:
- The request is a trivial one-liner with no ambiguity
- You've already specified this exact change before and it's well understood
- The task is exploratory (prototyping, brainstorming) and precision would slow you down

## Why This Matters

**The Intent-Behavior Mirroring Effect** (Project Prometheus, 2026):

> The structural invasiveness of an agent's generated code is a direct mirror of the structural scope of its input requirement.

- Vague, broad requirements → "Berserker-style" invasive modifications — the agent rewrites too much, breaks too many things, and produces code that passes tests but violates intent
- Precise, atomic specifications → "Surgical-style" minimal corrections — the agent changes only what's needed and nothing more

This is the single biggest predictor of code generation quality. Not the model. Not the prompting technique. The specification.

**What the research shows:**
- Project Prometheus: 93.97% success with specs vs 76.5% without — a 17.5pp gap from specification alone
- Self-repair research: Assertion errors (wrong intent) self-repair at only ~45% — you can't fix what you misunderstood
- AdaCoder: Adaptive planning triggered only on failure is 16x faster than always-planning approaches

## State Machine Protocol

```
┌─────────────┐
│    INIT     │  Receive request, decide if spec is needed
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    PARSE    │  Extract core intent from the request
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  CONSTRAIN  │  Identify what must NOT change (invariants)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ FORMALIZE   │  Write Given/When/Then scenarios for done-ness
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│    GATE     │────▶│  AMBIGUOUS  │
└──────┬──────┘     └──────┬──────┘
       │                   │ (ask user)
       │ (clear)           │
       │                   ▼
       │            ┌─────────────┐
       │            │   CLARIFY   │
       │            └──────┬──────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       │            │  FORMALIZE  │ (re-formalize with new info)
       │            └──────┬──────┘
       │                   │
       ▼                   │
┌─────────────┐            │
│   EXECUTE   │◀───────────┘
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   VERIFY    │────▶│   REPAIR    │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │ (pass)            │ (against spec, not request)
       │                   │
       ▼                   └─────────┐
┌─────────────┐                     │
│    DONE     │◀────────────────────┘
└─────────────┘
```

## States

### INIT
**Purpose:** Decide whether this task needs specification or can proceed directly.

**Entry Actions:**
- Read the user's request
- Assess ambiguity level: Is there more than one reasonable interpretation?
- Assess scope: Does the change touch existing behavior?
- If the request is trivial and unambiguous → skip to EXECUTE directly
- If the request has ANY ambiguity or touches existing code → proceed to PARSE

**Exit Conditions:**
- Unambiguous trivial task → EXECUTE (skip spec)
- Everything else → PARSE

**Output Format:**
```yaml
init:
  request_summary: "One sentence: what they asked for"
  ambiguity: "none|low|medium|high"
  scope: "trivial|single_function|module|cross_cutting"
  needs_spec: true|false
  reason: "Why spec is/isn't needed"
```

___


### PARSE
**Purpose:** Extract the core intent — the smallest change that satisfies the request.

**Entry Actions:**
- Strip the request to its essential intent
- Identify: What is the NEW behavior being requested?
- Identify: What is the MINIMAL surface area of change?
- Separate intent from implementation hints (the user may suggest HOW, but focus on WHAT)

**Prompt Template:**
```
Given this request: "{{request}}"

1. What is the core intent? (one sentence)
2. What is the smallest change that satisfies this intent?
3. What implementation details did the user suggest vs mandate?
4. Are there multiple valid interpretations? If so, list them.
```

**Exit Conditions:** Always → CONSTRAIN

**Output Format:**
```yaml
parse:
  core_intent: "One sentence describing the minimal desired change"
  minimal_surface: "The smallest set of files/functions that must change"
  user_suggestions: ["List of implementation hints from user"]
  user_mandates: ["List of hard requirements from user"]
  interpretations:
    - description: "Interpretation A"
      likelihood: "high|medium|low"
    - description: "Interpretation B"
      likelihood: "high|medium|low"
```

___


### CONSTRAIN
**Purpose:** Identify invariants — what must NOT change. This is the guardrail that prevents over-engineering.

**Entry Actions:**
- List all existing behavior that must be preserved
- Identify implicit contracts (other callers, API consumers, database state)
- Find the boundary: where does this change stop?
- Check for non-obvious dependencies (tests, configs, imports, types)

**Prompt Template:**
```
The change is: {{core_intent}}
Affecting: {{minimal_surface}}

What must NOT change:
1. Existing callers of modified functions — what do they expect?
2. Existing tests — what behavior do they verify?
3. Data/state contracts — what shapes must be preserved?
4. Public API surface — what signatures are locked?
5. Performance characteristics — any latency/throughput constraints?

For each invariant, state it as a negative constraint:
"X must continue to Y when Z"
```

**Exit Conditions:** Always → FORMALIZE

**Output Format:**
```yaml
constraints:
  invariants:
    - "Function X must continue to return Y when given Z"
    - "API endpoint /foo must accept the same request shape"
  boundary: "This change touches files A, B. It does NOT touch C, D."
  dependencies:
    must_preserve: ["Existing test behavior in test_foo.py"]
    may_modify: ["Internal implementation of bar()"]
```

___


### FORMALIZE
**Purpose:** Write executable scenarios that define "done." Not full BDD — just enough to be unambiguous.

**Entry Actions:**
- Write 2-5 Given/When/Then scenarios covering:
  1. The happy path (primary intent)
  2. Edge cases that are likely to break
  3. At least one scenario that should NOT be affected (invariant check)
- Each scenario must be specific enough to verify mechanically
- Include expected outputs, not just behaviors

**Prompt Template:**
```
Intent: {{core_intent}}
Constraints: {{invariants}}

Write Given/When/Then scenarios:

Scenario 1: [Happy path - primary intent]
  Given [specific preconditions]
  When [specific action]
  Then [specific expected result]

Scenario 2: [Edge case]
  Given [edge case preconditions]
  When [edge case action]
  Then [edge case expected result]

Scenario 3: [Invariant check - something that should NOT change]
  Given [existing behavior context]
  When [action that would trigger the old behavior]
  Then [old behavior still works exactly as before]
```

**Exit Conditions:** Always → GATE

**Output Format:**
```yaml
scenarios:
  - name: "Happy path"
    given: "User is authenticated, database has X records"
    when: "User requests Y with parameter Z"
    then: "Response contains W, database now has X+1 records"
  - name: "Edge case: empty input"
    given: "No records exist"
    when: "User requests Y"
    then: "Returns empty list, status 200, no error"
  - name: "Invariant: existing callers unaffected"
    given: "Old client calls original endpoint"
    when: "Request with old format"
    then: "Response identical to pre-change behavior"
```

___


### GATE
**Purpose:** Check for ambiguity. If the spec has gaps, ask before coding.

**Entry Actions:**
- Review scenarios for completeness
- Check: Does every scenario have concrete expected outputs?
- Check: Are there "TODO" or "figure out later" gaps?
- Check: Do any scenarios contradict each other?
- Check: Is there an interpretation from PARSE that isn't covered?

**Exit Conditions:**
- All scenarios concrete and consistent → EXECUTE
- Any ambiguity found → AMBIGUOUS

**Gate Checklist:**
```
[ ] Every scenario has specific inputs AND expected outputs
[ ] No scenario says "handle appropriately" or "should work"
[ ] Edge cases cover at least: empty input, max input, error case
[ ] At least one scenario verifies unchanged behavior
[ ] No unresolved interpretations from PARSE
[ ] The minimal surface area is still minimal (no scope creep)
```

___


### AMBIGUOUS
**Purpose:** Surface the specific ambiguity to the user with options.

**Entry Actions:**
- Identify exactly what is unclear
- Present 2-3 concrete interpretations with tradeoffs
- Ask the user to choose or clarify
- Do NOT proceed with a guess

**Prompt Template:**
```
I need clarification before coding:

Ambiguity: {{what is unclear}}

Option A: {{interpretation 1}}
  - Pro: {{advantage}}
  - Con: {{disadvantage}}
  - Changes: {{what this affects}}

Option B: {{interpretation 2}}
  - Pro: {{advantage}}
  - Con: {{disadvantage}}
  - Changes: {{what this affects}}

Which interpretation matches your intent? Or describe what you actually want.
```

**Exit Conditions:** User response received → CLARIFY

___


### CLARIFY
**Purpose:** Integrate user's clarification into the spec and re-formalize.

**Entry Actions:**
- Update core intent with clarification
- Update constraints if new information affects invariants
- Return to FORMALIZE to update scenarios

**Exit Conditions:** Always → FORMALIZE

___


### EXECUTE
**Purpose:** Generate code constrained by the spec. Minimal change that satisfies all scenarios.

**Entry Actions:**
- Read the finalized scenarios and constraints
- Generate the SMALLEST code change that passes all scenarios
- Do NOT add features not covered by scenarios
- Do NOT refactor adjacent code not touched by the change
- Do NOT add error handling for scenarios not listed

**Execution Rules:**
1. **One scenario at a time.** Implement the first, verify, then the next.
2. **Touch only the minimal surface.** If you're editing a file not in the boundary list, stop.
3. **No speculative additions.** If it's not in a scenario, it doesn't exist.
4. **Preserve all invariants.** If a change breaks an invariant scenario, revert and try differently.

**Exit Conditions:** Code generated → VERIFY

___


### VERIFY
**Purpose:** Run each scenario against the generated code.

**Entry Actions:**
- For each scenario: Given → set up preconditions, When → execute action, Then → check result
- If all scenarios pass → DONE
- If any scenario fails → REPAIR (against the spec, NOT the original vague request)

**Verification Checklist:**
```
For each scenario:
  [ ] Given preconditions can be set up
  [ ] When action executes without error
  [ ] Then result matches expected output exactly
  [ ] No side effects beyond what's specified
```

**Exit Conditions:**
- All scenarios pass → DONE
- Any scenario fails → REPAIR

___


### REPAIR
**Purpose:** Fix the code to satisfy the failing scenario. Key: repair against the spec, not the original request.

**Entry Actions:**
- Identify WHICH scenario failed and HOW
- Re-read the scenario's Given/When/Then
- Generate a targeted fix for that specific scenario only
- Do NOT rewrite the whole implementation
- Maximum 3 repair attempts per scenario (after 3, re-examine the spec)

**Prompt Template:**
```
Scenario that failed: {{scenario_name}}
  Given: {{given}}
  When: {{when}}
  Expected: {{then}}
  Actual: {{what happened instead}}

Current code: {{relevant code section}}

Fix ONLY what's needed to make this scenario pass.
Do NOT change anything that isn't directly causing the failure.
Do NOT add error handling, logging, or "improvements" not in the spec.
```

**Exit Conditions:**
- Fix applied → VERIFY (re-run all scenarios)
- 3 attempts exceeded → re-enter FORMALIZE with the failing scenario as new input

___


### DONE
**Purpose:** The spec is satisfied. Report what was done.

**Output:**
```yaml
result:
  intent: "{{original core intent}}"
  scenarios_passed: N/M
  files_modified: ["list of files"]
  invariants_preserved: true|false
  repair_attempts: N
```

## Pitfalls

1. **Specifying too much:** The goal is 2-5 scenarios, not a full test suite. If you're writing more than 5 scenarios for a single change, the change is too big — decompose it first.

2. **Specifying too little:** One scenario is never enough. At minimum: happy path + one edge case + one invariant check.

3. **Skipping CONSTRAIN:** This is the most commonly skipped state and the most valuable. Without invariants, you can't detect over-engineering.

4. **Spec drift during REPAIR:** When repairing, always re-read the spec. Don't "fix" something by changing what the spec says the code should do. If the spec is wrong, go back to FORMALIZE.

5. **Gate bypass:** Don't convince yourself the spec is clear when it isn't. If you can't write a concrete expected output for a scenario, you're in AMBIGUOUS.

6. **Feature creep in EXECUTE:** The spec is a contract. Adding "nice to have" features during execution violates the contract and creates blast radius.

## Integration

Combine with:
- `step-level-verification-protocol`: Use step verification during EXECUTE for complex implementations
- `thoroughness-check-etto`: Use as preflight before INIT to assess whether the task warrants this protocol
- `bounded-self-revision`: Use during REPAIR for iterative improvement of failing code
- `abductive-first-debugging`: Use when VERIFY fails and the cause isn't obvious
- `checklist-manifesto`: Use for high-stakes changes where missing an invariant has serious consequences

## Research Basis

- **Project Prometheus** (arXiv:2604.17464): Intent-Behavior Mirroring Effect, BDD specifications for code repair, 93.97% success rate with specs vs 76.5% without
- **"How Many Tries Does It Take?"** (arXiv:2604.10508): Iterative self-repair effectiveness, assertion errors (wrong intent) self-repair at only ~45%, diminishing returns after 2 rounds
- **AdaCoder** (arXiv:2504.04220): Adaptive planning triggered only on failure, error-feedback-driven planning, +54.58% Pass@1 with minimal token overhead
