---
name: blueprint
description: Codify messy human problems to reveal hidden assumptions and structure. When you can state the problem in code, the contradictions and gaps become impossible to ignore.
triggers:
  - Vague problem that keeps being redefined
  - People use same words but mean different things
  - Messy situation with no clear structure
  - Multi-party decisions with silent disagreements
  - Problem scope keeps expanding
---

# Blueprint

**Biological analog:** Before you can build, you need a blueprint. Blueprint forces you to turn vague problems into concrete specifications — and in doing so, reveals what's missing, contradictory, or assumed.

## When to Use

- Problem discussed in circles without resolution
- People keep talking past each other
- Scope of work keeps expanding or shifting
- Need to convert informal requirements into precise specifications
- Hidden disagreement masked by vague language

## How It Works

### Phase 1 — Transcription

Take the messy problem and transcribe it into formal structure:

```
Types / Schema:
  - Entity: what are the nouns? (user, order, payment, report)
  - Relationships: how do entities relate? (1:1, 1:N, N:N)
  - State: what states can entities be in? (pending, active, completed, failed)
  - Constraints: what rules must always hold? (A must happen before B, X cannot happen with Y)

Operations:
  - Create: what can be created?
  - Read: what can be read?
  - Update: what can be changed?
  - Delete: what can be removed?

Events:
  - What happens and in what order?
  - What triggers what?
  - What are the failure modes?
```

Rules:
- If you can't represent it as data or types, you don't understand it yet
- Contradictions in the spec are bugs — expose them, don't hide them
- Silent assumptions become explicit [ASSUMPTION] comments

### Phase 2 — Gap Detection

After transcription, look for:

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

Assumptions:
- [ASSUMPTION]: users are authenticated (but how? by what?)
- [ASSUMPTION]: "active" means the same thing across all systems
- [ASSUMPTION]: operations are atomic (but are they?)
```

### Phase 3 — Resolution

For each gap/contradiction/assumption, resolve it:

```
Resolution options:
1. Define: Make it explicit (add to the spec)
2. Question: Flag it as unknown — requires user input
3. Choose: Pick one (document why)
4. Defer: Acknowledge but delay (with risk noted)

Output format:
- [RESOLVED] Entity X now has state Y
- [QUESTION] What does "active" mean? Requires clarification
- [ASSUMED] Operations are atomic unless explicitly stated otherwise
```

### Phase 4 — Blueprint Document

Produce the final artifact:

```
# Blueprint: [Problem Name]

## Entities & Relationships
[as typed/structured above]

## Operations
[as typed/structured above]

## State Machine
[entities + valid transitions]

## Constraints
[explicit rules]

## Assumptions (explicit)
[what was assumed and why]

## Open Questions
[what's still unknown]

## Resolved
[what was resolved by transcription]
```

## Anti-Patterns (what Blueprint prevents)

- **Scope creep:** problems get defined before work starts, not during
- **Silent misalignment:** everyone nods but means different things
- **Assumption amnesia:** forgetting what was assumed when implementing
- **Requirements rot:** problem definition changes mid-implementation

## Sub-Agent Contracts

### Transcriptionist
- **Inputs:** messy problem description (meeting notes, slack thread, vague request)
- **Outputs:** typed spec with entities, operations, constraints, gaps
- **Limits:** Must represent everything as types or schema; no prose descriptions of processes

### Gap Analyst
- **Inputs:** typed spec from Transcriptionist
- **Outputs:** gap list, contradiction list, assumption list
- **Limits:** Cannot resolve gaps — only identify them

### Resolver
- **Inputs:** gap/contradiction/assumption lists
- **Outputs:** resolved blueprint with explicit choices
- **Limits:** Must choose resolution type (define/question/choose/defer) for each item

## Integration

Use before `intent-specification-protocol` when the problem is too messy for intent spec. Use after `requirement-crystallization-protocol` to formalize crystallized requirements. Use with `jury` when gaps involve competing values needing structured decisions.

## Fallback Mode

If no sub-agents available: take the messy problem and write it as TypeScript interfaces or Python dataclasses. Every time you hit "I don't know what this is," that's a gap. Write it as a question. The act of typing forces precision.