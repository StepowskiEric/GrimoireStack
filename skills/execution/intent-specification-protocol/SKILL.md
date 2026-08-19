---
name: intent-specification-protocol
description: "Crystallize vague coding requests into precise, testable specifications before writing any code. Prevents the Intent-Behavior Mirroring Effect."
triggers:
  - ambiguous-request
  - over-engineering-risk
  - behavior-preservation
  - unfamiliar-code
---

# Intent Specification Protocol

**Spec quality is the single biggest predictor of code generation quality** — not the model, not the prompting technique. Vague requirements produce invasive changes; precise specs produce surgical corrections. Force the precision before any code is written.

## The Move

### 1. Parse — strip to core intent
Identify the *smallest change* that satisfies the request. Separate user suggestions (implementation hints) from mandates (hard requirements). Write one sentence: the minimal desired change. If multiple interpretations exist, list them all with rough likelihood.

### 2. Constrain — what must NOT change
The most commonly skipped step and the most valuable. Write:
- **Invariants** — "X must continue to Y when Z"
- **Boundary** — files this change touches, and files it explicitly does not
- **Preserve** — tests, contracts, public API that stay fixed
- **May modify** — internals explicitly allowed to change

Without invariants, over-engineering is undetectable.

### 3. Formalize — Given/When/Then scenarios
Write 2–5 scenarios with concrete inputs and expected outputs. Minimum coverage: happy path, one edge case likely to break, one invariant check. No "handle appropriately," no "should work" — every Then must be a concrete, checkable result.

### 4. Gate — check for ambiguity
If you cannot write a concrete expected output for every scenario, the spec is ambiguous. Present 2–3 interpretations to the user with pros/cons/affected surfaces and ask them to choose. Never guess.

### 5. Execute & Verify — smallest change, one scenario at a time
Generate the smallest code change that satisfies all scenarios. Touch only files in the boundary list. No speculative additions, no "while I'm here" features. Then verify each scenario mechanically: set up Given, execute When, check Then. All pass → done; any fail → repair against the spec, not against the request. Max 3 repair attempts per scenario; if exceeded, return to Formalize.

## Reference
- [`references/ambiguity-patterns.md`](references/ambiguity-patterns.md) — the ambiguity catalog: 6 pattern categories plus red-flag vocabulary, used during Parse and Gate.
- [`references/intent-specification-details.md`](references/intent-specification-details.md) — the six failure modes.

## Rules
- **Do** write invariants before code — the #1 anti-over-engineering lever.
- **Do** keep scenarios between 2 and 5; more means the change needs decomposing.
- **Do** re-read the spec before each fix; if the fix won't match the spec, the spec is wrong.
- **Do** gate every spec you cannot fully formalize — present the interpretations and let the user choose.
