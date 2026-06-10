---
name: Requirement Crystallization Protocol
description: Fuse of Socratic Clarification + Intent Specification Protocol. Surfaces the critical assumption, then crystallizes vague requests into locked, testable specs before coding begins.
...



---

## Requirement Crystallization Protocol

A 3-phase pipeline that takes a vague request and produces a locked, testable specification before any code is written.

Fuses Socratic Clarification (surface assumptions, find the critical one, ask) with Intent Specification Protocol (capture intent, define states, crystallize into executable spec, validate, lock).

### Phase 1: SURFACE

Identify what's ambiguous before assuming you understand.

1. **Map assumptions** — list every assumption the request implicitly makes
   - What must be true for this request to make sense?
   - What does the requester assume about the current system?
   - What does the requester assume about the desired outcome?
2. **Find the critical assumption** — the one that, if wrong, invalidates the most work
3. **Ask one targeted question** — formulate the minimum question that resolves the critical assumption
4. **Gate** — do not proceed until the critical assumption is resolved

**Output:** A list of assumptions with the critical one resolved.

### Phase 2: CAPTURE

Convert the clarified request into a structured specification.

1. **Raw intent** — write the natural-language description of desired behavior in one paragraph
2. **Constraints** — enumerate hard constraints (performance, compatibility, security, data shape)
3. **Edge cases** — identify at least 3 boundary conditions (empty input, maximum load, concurrent access, partial failure)
4. **State machine** — enumerate states the system can be in, and transitions between them
   - What are the valid states?
   - What triggers each transition?
   - What is invariant across all states?

**Output:** Draft specification with states, transitions, constraints, and edge cases.

### Phase 3: LOCK

Validate and freeze the spec as the coding contract.

1. **Completeness check** — all states reachable from initial? All transitions have valid triggers?
2. **Consistency check** — no contradictory constraints? No unreachable states?
3. **Testability check** — can each requirement be verified with a concrete test case?
4. **Lock** — the spec is now the contract. Any code that doesn't satisfy it is wrong. Any change to it requires explicit revision.

**Output:** Locked executable specification.

### Specification Format

```yaml
intent: <one paragraph>
states:
  - name: <state>
    description: <what this state means>
    transitions:
      - trigger: <event>
        target: <next state>
constraints:
  - <hard constraint>
edge_cases:
  - <boundary condition>
tests:
  - <testable assertion>
```

### Anti-Patterns

- Skipping SURFACE and jumping to CAPTURE (most common failure — you build the wrong thing correctly)
- Treating the spec as static (it should evolve, but changes must be explicit)
- Over-specifying implementation details (spec says WHAT, not HOW)
- Under-specifying error states (what happens when things go wrong?)

### When to Use

- Before any non-trivial feature implementation
- When the request is ambiguous or could be interpreted multiple ways
- Before refactoring when the target behavior isn't clear
- As a pre-coding step in agent workflows
