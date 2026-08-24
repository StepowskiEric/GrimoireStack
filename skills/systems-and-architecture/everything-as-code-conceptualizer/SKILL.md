---
name: everything-as-code-conceptualizer
description: "Codify messy human problems as pseudocode to reveal hidden assumptions, missing decisions, and edge cases."
triggers:
  - messy-problem-analysis
  - hidden-assumptions
  - requirements-clarification
  - pre-spec-codification
disable-model-invocation: true
---

# Everything-as-Code Conceptualizer

**If you can't write it as code, you don't fully understand it.** View any system, process, or problem through a code lens: codifying forces precision, and the act of writing pseudocode reveals hidden structure, assumptions, and edge cases that natural language obscures. A conceptual lens, not a rigid protocol — apply it flexibly.

## When to Use
- Messy human/process problems that resist structured analysis
- "If only we had clear specs" situations
- Before writing real code for ambiguous requirements

Skip it: problems already well-specified, you're ready to write actual code, or human/emotional factors dominate (use a different skill).

## The Move

### 1. Identify the system
Name what you are trying to understand: a team process, a user workflow, a deployment pipeline, a decision-making process? State it as one sentence.

### 2. Codify the structure
Write pseudocode representing the system — functions, state, and the main loop. Keep it pseudocode; this reveals structure, it does not implement. If you cannot write it, you have found the first gap.

### 3. Identify the bugs
Read the pseudocode for what is missing or undefined, not what works:
- **Missing error handling** — paths with no defined outcome
- **Undefined behavior** — "what happens if X?" with no answer
- **Infinite loops** — processes that repeat without termination
- **Implicit state** — decisions no one owns

Mark each with a `// BUG:` comment naming the gap.

### 4. Refactor
Fix the bugs as pseudocode: add the timeout, the escalation, the receipt, the defined branch. Each fix must be a real mechanism, not a comment.

### 5. Extract insights
Write down what codification revealed: implicit assumptions now explicit, edge cases surfaced, missing decisions highlighted, refactoring opportunities clear. These insights are the deliverable — the pseudocode was the tool.

## Reference
For the codification patterns (state machines, function contracts, data flow, decision trees), worked examples, and integration notes, see [`references/everything-as-code-details.md`](references/everything-as-code-details.md).

## Rules
- **Do** write pseudocode, not executable code — syntax details are noise.
- **Do** hunt for what's missing or undefined; that is where the insight lives.
- **Do** name every bug with a `// BUG:` comment and a mechanism to fix it.
- **Do** keep the human layer in view — codify the process, not the people.
