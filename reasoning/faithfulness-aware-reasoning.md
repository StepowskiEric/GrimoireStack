---
name: faithfulness-aware-reasoning
description: Detect and prevent faithfulness hallucinations where reasoning sounds plausible but isn't logically entailed by premises. Based on arXiv:2602.05897 and 2604.03179.
category: reasoning
tags: [faithfulness, hallucination-detection, logical-entailment, verification, reasoning-quality]
author: Research synthesis
date: 2026-04-20
version: 1.0.0
...



---

# Faithfulness-Aware Reasoning

## When to Use

Use this skill when:
- Reasoning sounds plausible but you're unsure it's logically sound
- Previous outputs contained "confabulated" justifications
- The conclusion doesn't clearly follow from stated premises
- Working with complex conditional logic (if/then chains)
- Need to ensure reasoning is actually supported by evidence, not just consistent with it

## The Problem

**Faithfulness hallucinations** occur when:
- Step B "makes sense" after Step A, but isn't actually entailed by it
- Reasoning confuses correlation with causation
- Conclusions assume unstated premises
- Logic appears valid but rests on hidden assumptions

This is different from factual hallucinations (wrong facts) — the facts may be right, but the reasoning doesn't support the conclusion.

## State Machine Protocol

```
┌─────────────┐
│    INIT     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   EXTRACT   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   DRAFT     │────▶│   ENTAIL    │
└─────────────┘     └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │  ENTAILED   │           │ NOT ENTAILED│
       └──────┬──────┘           └──────┬──────┘
              │                         │
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │   COMMIT    │           │   REPAIR    │
       └──────┬──────┘           └──────┬──────┘
              │                           │
              │                 ┌─────────┴─────────┐
              │                 │                   │
              │                 ▼                   ▼
              │          ┌─────────────┐     ┌─────────────┐
              │          │   REVISE    │     │   FLAG      │
              │          └──────┬──────┘     └──────┬──────┘
              │                 │                   │
              │                 └─────────┬─────────┘
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   CHECK     │
                     │   DEPTH     │
                     └──────┬──────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
          ┌─────────────┐       ┌─────────────┐
          │  CONTINUE   │       │   FINAL     │
          └──────┬──────┘       └──────┬──────┘
                 │                     │
                 └─────────┬───────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    DONE     │
                    └─────────────┘
```

## States

### INIT
**Purpose:** Set up faithfulness tracking

**Entry Actions:**
- Identify the reasoning goal
- Define what "faithful" means for this task
- Set entailment threshold (default: strict)
- Initialize premise tracking

**Exit Conditions:** Always → EXTRACT

___


### EXTRACT
**Purpose:** Identify all premises explicitly available

**Entry Actions:**
List all sources of truth:
- Given facts in the problem statement
- Previously verified steps
- Established definitions
- Explicitly stated assumptions

**Prompt Template:**
```
Extract all premises available for reasoning:

Problem statement: {{problem}}
Verified so far: {{verified_steps}}

List every fact, definition, or premise you can use:
1. [Premise 1]
2. [Premise 2]
...

These are your ONLY sources of truth. Everything else must be derived from these.
```

**Exit Conditions:** Always → DRAFT

___


### DRAFT
**Purpose:** Generate reasoning step

**Entry Actions:**
- Draft next reasoning step
- Mark which premises it uses
- Note any implicit assumptions

**Prompt Template:**
```
Draft the next reasoning step using ONLY these premises:
{{premises}}

Step to draft: {{step_description}}

Draft:
[Your reasoning]

Premises used: [List which premises support this]
Implicit assumptions: [List any unstated assumptions made]
```

**Exit Conditions:** Always → ENTAIL

___


### ENTAIL
**Purpose:** Check if step is entailed by premises

**Entry Actions:**
Apply the entailment test:

**Prompt Template:**
```
ENTAILMENT CHECK

Premises:
{{premises}}

Proposed step:
{{drafted_step}}

Question: Does the proposed step NECESSARILY follow from the premises?

Check each premise used:
- Premise X → supports step? (yes/no/partial)
- Premise Y → supports step? (yes/no/partial)

Check for logical gaps:
- Are there missing intermediate steps? (yes/no)
- Are there unstated assumptions? (list them)
- Is this confusing correlation with causation? (yes/no)
- Is this generalizing beyond what premises allow? (yes/no)

Verdict:
□ ENTAILED - Necessarily follows from premises
□ NOT ENTAILED - Sounds reasonable but not logically required
□ CONTRADICTED - Actually contradicts premises

Confidence: [0-1]
```

**Exit Conditions:**
- Verdict = ENTAILED → COMMIT
- Verdict = NOT ENTAILED → REPAIR
- Verdict = CONTRADICTED → REPAIR (with flag)

___


### COMMIT
**Purpose:** Accept faithful reasoning

**Entry Actions:**
- Add step to verified chain
- Update available premises with new derived fact
- Log entailment confidence

**Exit Conditions:** Always → CHECK DEPTH

___


### REPAIR
**Purpose:** Fix unfaithful reasoning

**Entry Actions:**
Analyze why entailment failed:

**Prompt Template:**
```
REPAIR ANALYSIS

Failed step: {{drafted_step}}
Failure mode: {{entailment_failure}}

Options:
1. REVISE - Add missing premises or intermediate steps
2. FLAG - Mark as speculative/conjectural reasoning

If REVISE:
- What premise is missing?
- What intermediate step is needed?
- Can you derive the missing piece from available premises?

If FLAG:
- Why can't this be proven from premises?
- Should this be treated as assumption/hypothesis?

Decision: REVISE / FLAG
```

**Exit Conditions:**
- Decision = REVISE → REVISE state
- Decision = FLAG → FLAG state

___


### REVISE
**Purpose:** Rewrite step to be faithful

**Entry Actions:**
- Add missing premise/intermediate step
- Or derive missing piece if possible
- Re-draft with proper entailment

**Prompt Template:**
```
REVISED STEP

Original (unfaithful): {{original_step}}
Missing: {{what_was_missing}}

Revised approach:
1. First establish: [intermediate step with proper entailment]
2. Then conclude: [original claim now properly supported]

Revised step:
[Faithful reasoning with clear premise mapping]
```

**Exit Conditions:** Return to ENTAIL with revised step

___


### FLAG
**Purpose:** Mark speculative reasoning

**Entry Actions:**
- Clearly mark step as speculative
- Note what would be needed to make it faithful
- Continue with reduced confidence

**Prompt Template:**
```
SPECULATIVE STEP (flagged)

Step: {{step_description}}
Why unfaithful: {{reason}}

To make this faithful, we would need:
- [Missing premise 1]
- [Missing premise 2]

Proceeding with flag: ⚠️ SPECULATIVE
Confidence reduced to: 0.3
```

**Exit Conditions:** Always → CHECK DEPTH

___


### CHECK DEPTH
**Purpose:** Decide whether to continue or finalize

**Entry Actions:**
- Check if goal is reached
- Check if reasoning depth is sufficient
- Check if too many speculative steps (threshold: 2)

**Exit Conditions:**
- Goal reached → FINAL
- Too many speculative steps → FINAL (with warning)
- More reasoning needed → CONTINUE → DRAFT

___


### FINAL
**Purpose:** Assemble final reasoning

**Entry Actions:**
- Compile all verified steps
- List all flagged speculative steps
- Calculate overall confidence
- Note faithfulness score (% steps that were entailed)

**Output Format:**
```markdown
## Reasoning Chain

### Verified Steps (faithful)
1. [Step 1] ✓
2. [Step 2] ✓
...

### Speculative Steps (flagged)
- Step X: [description] ⚠️
  - Needed to assume: [what was missing]

### Faithfulness Score
- Verified steps: X
- Speculative steps: Y
- Faithfulness: X/(X+Y) = Z%

### Overall Confidence
[Calculated from individual step confidences]
```

**Exit Conditions:** Always → DONE

___


### DONE
**Purpose:** Return faithful reasoning

**Entry Actions:**
- Return final output
- Include faithfulness metadata

## Common Faithfulness Failures

| Pattern | Example | Fix |
|---------|---------|-----|
| Correlation → Causation | "A happened before B, so A caused B" | Add evidence of causal mechanism |
| Generalization | "This worked once, so it always works" | Add "in this specific case" qualifier |
| Hidden premise | "Therefore X" (skipping why) | Make premise explicit |
| Equivocation | Using same word with different meanings | Define terms precisely |
| False dichotomy | "Either A or B" (ignoring C, D...) | List all alternatives |
| Appeal to authority | "Expert says X, so X is true" | Verify expert's evidence |

## Example Usage

```markdown
Problem: Why did the project fail?

[EXTRACT] Premises:
- Deadline was moved up 2 weeks
- Team had 5 members
- 2 members left during project
- Final deliverable had 12 bugs
- Client rejected deliverable

[DRAFT] Step 1: The tight deadline caused the bugs.
[ENTAIL] Check: Does tight deadline → bugs necessarily follow?
- Deadline moved up ✓
- Bugs present ✓
- Causal link? Not entailed. Could be other causes.

[REPAIR] Decision: REVISE
[REVISE] Step 1: The reduced timeline (2 weeks less) combined with 
reduced team capacity (3 members instead of 5) likely contributed 
to quality issues.

[ENTAIL] Check: Does reduced capacity + reduced timeline → quality issues?
- Premise: 2 of 5 members left = 40% capacity reduction ✓
- Premise: Timeline compressed ✓
- Link: Industry data shows capacity reduction + time pressure → quality issues
- Verdict: ENTAILED (with external premise)

[COMMIT] ✓

[DRAFT] Step 2: The client rejected because of the bugs.
[ENTAIL] Check: Does bugs → rejection necessarily follow?
- Premise: 12 bugs found ✓
- Premise: Client rejected ✓
- Causal link? Not directly entailed. Could reject for other reasons.

[REPAIR] Decision: FLAG
[FLAG] ⚠️ SPECULATIVE: While likely, rejection could be due to 
other factors (requirements mismatch, budget issues, etc.)

... continues ...

[FINAL]
Faithfulness Score: 75% (3/4 steps entailed)
```

## Integration

Combine with:
- `step-level-verification-protocol`: Use faithfulness as verification criterion
- `self-consistency`: Cross-check entailment across multiple reasoning paths
- `bounded-self-revision`: Limit revision attempts on unfaithful steps

## Research Basis

- Stop Rewarding Hallucinated Steps (arXiv:2602.05897)
- Understanding the Role of Hallucination in RL Post-Training (arXiv:2604.03179)
- Faithfulness hallucinations in Chain-of-Thought reasoning
