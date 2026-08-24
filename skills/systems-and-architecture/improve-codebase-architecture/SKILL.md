---
name: improve-codebase-architecture
description: "Find deepening opportunities informed by the domain language in CONTEXT.md and decisions in docs/adr/."
triggers:
  - Need to improve existing codebase structure
  - Need to find architectural deepening opportunities
  - Domain language and ADR decisions inform the direction
disable-model-invocation: true
---

# Improve Codebase Architecture

Find deepening opportunities informed by the domain language in CONTEXT.md and decisions in docs/adr/.

## Core Protocol

### Phase 1: Read Domain Context

Read CONTEXT.md and docs/adr/ to understand the domain language, architectural decisions, and the direction the codebase should evolve.

**Done when:** the domain language and architectural direction are understood.

### Phase 2: Identify Deepening Opportunities

Look for places where the code doesn't match the domain language, where abstractions are shallow, or where the architecture has drifted from the ADR decisions.

**Done when:** specific deepening opportunities are identified.

### Phase 3: Propose Changes

For each opportunity, propose a specific change that deepens the architecture toward the domain model.

**Done when:** changes are proposed with clear rationale.

## Failure Modes

- **Refactoring without direction:** changing code without understanding the domain model
- **Ignoring ADRs:** making architectural changes that contradict documented decisions
- **Surface-level fixes:** renaming things without deepening the architecture
