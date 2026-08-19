---
name: faithfulness-aware-reasoning
description: "Detect and prevent faithfulness hallucinations where claims aren't logically entailed by the premises."
triggers:
  - faithfulness-check
  - logical-entailment
  - reasoning-validation
  - confabulation-detection
---

# Faithfulness-Aware Reasoning

**Part of the `reasoning-integrity-chain` — Phase 1 (entailment).**

**Faithfulness hallucinations** occur when reasoning sounds plausible but isn't logically entailed by the premises. The facts may be right, but the logic doesn't support the conclusion. This skill enforces a strict **Extract → Draft → Entail → Repair** loop to catch these gaps.

## The Move

### 1. Extract
List every premise available: facts from the problem, verified steps, and definitions. These are your **only** sources of truth.

### 2. Draft
Generate the next reasoning step. Mark which premises it uses and any implicit assumptions.

### 3. Entail
Apply the **Entailment Test**: Does the step **necessarily** follow from the premises?
- **ENTAILED**: Logically required. (→ Commit)
- **NOT ENTAILED**: Sounds reasonable but not proven. (→ Repair)
- **CONTRADICTED**: Violates a premise. (→ Repair)

### 4. Repair
If not entailed:
- **REVISE**: Add missing premises or intermediate steps.
- **FLAG**: Mark as speculative and reduce confidence.

## Reference
For detailed state-machine templates, common failure patterns, and full examples, see [`references/faithfulness-details.md`](references/faithfulness-details.md).

## Rules
- **Do** separate generation from judgment (Draft then Entail).
- **Do** flag steps that rely on "common sense" instead of stated premises.
- **Do not** commit a step if the entailment confidence is low.
- **Do not** confuse correlation with causation.
