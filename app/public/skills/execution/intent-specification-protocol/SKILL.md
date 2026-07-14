---
name: intent-specification-protocol
description: "Crystallize vague coding requests into precise, testable specifications before writing any code. Prevents the Intent-Behavior Mirroring Effect."
triggers:
  - Starting a new feature, bug fix, or code change of any size
  - Request is ambiguous or could be interpreted multiple ways
  - Previous attempts produced over-engineered or off-target code
  - Change touches existing behavior that must be preserved
  - About to 'just start coding'
  - Task involves modifying code you didn't write
---

# Intent Specification Protocol

Crystallize vague coding requests into precise, testable specifications before writing any code. Prevents the Intent-Behavior Mirroring Effect — vague requirements produce invasive "berserker" modifications; precise specs produce "surgical" minimal corrections.

**Spec quality is the single biggest predictor of code generation quality** — not the model, not the prompting technique. The specification.

---

## State Machine

```
INIT → PARSE → CONSTRAIN → FORMALIZE → GATE
                                          │
                            ┌─────────────┴─────────────┐
                            ▼ (clear)                   ▼ (ambiguous)
                        EXECUTE → VERIFY → DONE      AMBIGUOUS
                                          │              │
                                          ▼ (fail)       ▼
                                       REPAIR ← CLARIFY ←┘
```

---

## States

### INIT — Decide whether to spec

| Output | |
|---|---|
| `ambiguity` | none / low / medium / high |
| `scope` | trivial / single_function / module / cross_cutting |
| `needs_spec` | true / false |
| `reason` | why spec is or isn't needed |

Exit: trivial+unambiguous → EXECUTE; else → PARSE.

### PARSE — Strip to core intent

Identify the *smallest change* that satisfies the request. Separate user **suggestions** (implementation hints) from **mandates** (hard requirements). List every plausible interpretation with likelihood.

| Output | |
|---|---|
| `core_intent` | one sentence describing the minimal desired change |
| `minimal_surface` | smallest set of files/functions that must change |
| `interpretations[]` | each interpretation with likelihood |

Always → CONSTRAIN.

### CONSTRAIN — Identify invariants

What *must not* change. The guardrail that prevents over-engineering.

| Output | |
|---|---|
| `invariants[]` | "X must continue to Y when Z" |
| `boundary` | files/surfaces this change touches and explicitly does not touch |
| `must_preserve[]` | tests, contracts, public API surface that stays fixed |
| `may_modify[]` | internals explicitly allowed to change |

Always → FORMALIZE.

### FORMALIZE — Write Given/When/Then scenarios

2–5 scenarios covering: happy path, edge cases likely to break, **at least one invariant check** (something that should NOT change). Each scenario must have specific inputs and concrete expected outputs.

| Output | |
|---|---|
| `scenarios[]` | name, given, when, then (specific expected result) |

Always → GATE.

### GATE — Check for ambiguity

Verify every scenario has concrete expected outputs. No "handle appropriately" or "should work." No scenario contradictions. No unresolved interpretations from PARSE. If any ambiguity remains → AMBIGUOUS; else → EXECUTE.

### AMBIGUOUS — Surface to user

Present 2–3 concrete interpretations with pros/cons/affected surfaces. Ask the user to choose or clarify. Never guess. → CLARIFY on response.

### CLARIFY — Re-formalize

Update core_intent and constraints. Return to FORMALIZE with new info.

### EXECUTE — Implement, bounded

Generate the *smallest* code change that satisfies all scenarios. **One scenario at a time**: implement, verify, next. Touch only files in the boundary list. No speculative additions. No error handling for scenarios not listed. → VERIFY.

### VERIFY — Run scenarios mechanically

For each scenario: set up Given preconditions, execute When, check Then matches expected output exactly. All pass → DONE. Any fail → REPAIR.

### REPAIR — Fix against the spec, not the request

Identify the failing scenario. Generate a targeted fix for that scenario *only*. Do not rewrite the implementation. Maximum 3 repair attempts per scenario; if exceeded, return to FORMALIZE with the failing scenario as new input. → VERIFY after each repair.

### DONE

| Output | |
|---|---|
| `scenarios_passed` | N/M |
| `files_modified[]` | list of files |
| `invariants_preserved` | true / false |
| `repair_attempts` | N |

---

## Failure Modes

- **Specifying too much** — more than 5 scenarios for one change. Decompose first.
- **Specifying too little** — one scenario is never enough. Minimum: happy path + one edge case + one invariant check.
- **Skipping CONSTRAIN** — the most commonly skipped state and the most valuable. Without invariants, over-engineering is undetectable.
- **Spec drift during REPAIR** — re-read the spec before each fix. If the spec is wrong, return to FORMALIZE.
- **Gate bypass** — convincing yourself the spec is clear when it isn't. If you can't write a concrete expected output, you're in AMBIGUOUS.
- **Feature creep in EXECUTE** — the spec is a contract. Adding "nice to have" features violates the contract.

---

## Pairing

- `step-level-verification-protocol` — use step verification during EXECUTE for complex implementations
- `checklist-manifesto` — use for high-stakes changes where missing an invariant has serious consequences
- `specter` — use when VERIFY fails and the cause isn't obvious
- `bounded-self-revision` — use during REPAIR for iterative improvement

---

## References

- `references/prompt-templates.md` — full prompt templates per state (PARSE, FORMALIZE, AMBIGUOUS, REPAIR) for direct copy-paste use.