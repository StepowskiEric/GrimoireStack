---
name: blueprint
description: Type the problem — codify messy situations into schema so contradictions, gaps, and silent assumptions become impossible to ignore. Use when vague problems keep being redefined or stakeholders talk past each other.
triggers:
  - Vague problem that keeps being redefined
  - Stakeholders use the same words but mean different things
  - Problem scope keeps expanding mid-discussion
  - Hidden disagreement masked by vague language
---

# Blueprint

Force the messy problem into types, operations, events, and constraints. What you can't represent in schema, you don't understand yet.

## When to Use

- Problem discussed in circles without resolution
- People keep talking past each other
- Scope of work keeps expanding or shifting
- Need to convert informal requirements into precise specifications
- Hidden disagreement masked by vague language

## When NOT to Use

- **Pure exploration with no commitment.** Blueprint locks structure; use it when you're ready to commit.
- **Already-typed domains.** If the schema exists, jump to gap analysis.

## Phase 1 — Transcribe

Force the messy problem into formal structure:

```
Types / Schema:
  Entity:        <nouns — user, order, payment, report>
  Relationship:  <1:1, 1:N, N:N>
  State:         <pending, active, completed, failed>
  Constraint:    <A must happen before B; X cannot happen with Y>

Operations:
  Create / Read / Update / Delete — what can be created, read, changed, removed

Events:
  Order:   <what happens and in what order>
  Triggers: <what triggers what>
  Failures: <what are the failure modes>
```

Rules:
- If you can't represent it as data or types, you don't understand it yet
- Contradictions in the spec are bugs — expose them, don't hide them
- Silent assumptions become explicit `[ASSUMPTION]` comments

**Done when** every noun is typed, every operation references a defined entity, and every constraint names the entities it binds.

## Phase 2 — Detect Gaps

After transcription, scan for:

```
Gaps:
- Entities defined but never used in operations
- Operations that reference undefined entities
- States that can't be reached from any operation
- Constraints that no operation enforces

Contradictions:
- Two constraints that can't both be true
- State transitions that imply contradictory knowledge
- Entities with conflicting definitions

Assumptions (call them out as `[ASSUMPTION]: <claim>`):
- What was assumed without stating
```

**Done when** every gap, contradiction, and assumption has an explicit entry — silence here is hiding work.

## Phase 3 — Resolve

For each gap / contradiction / assumption, pick exactly one:

```
1. Define:   make it explicit (add to the spec)
2. Question: flag as unknown — requires user input
3. Choose:   pick one (document why)
4. Defer:    acknowledge but delay (note the risk)
```

Output markers:
- `[RESOLVED] <what was changed>`
- `[QUESTION] <what requires clarification>`
- `[ASSUMED] <what was defaulted and why>`

**Done when** every Phase 2 entry has exactly one resolution type, and `Choose` and `Defer` resolutions document their reasoning.

## Phase 4 — Blueprint Document

```
# Blueprint: <Problem Name>

## Entities & Relationships
## Operations
## State Machine
## Constraints
## Assumptions (explicit)
## Open Questions
## Resolved
```

**Done when** every section is filled, `Open Questions` is empty (or every entry has a documented deferral), and `Assumptions` lists every assumption from Phase 2.

## Anti-Patterns

- **Scope creep:** problems get redefined mid-implementation
- **Silent misalignment:** everyone nods but means different things
- **Assumption amnesia:** forgetting what was assumed when implementing
- **Requirements rot:** problem definition changes without re-running Blueprint

## Integration

Use before `intent-specification-protocol` when the problem is too messy for intent spec. Use after `requirement-crystallization-protocol` to formalize crystallized requirements. Use with `jury` when gaps involve competing values needing structured decisions.
