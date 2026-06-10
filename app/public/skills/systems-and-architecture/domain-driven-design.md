# Skill: Domain-Driven Design for AI Agents

## Purpose

Use this skill when the agent must reason about software architecture, system design, or code organization in terms of the business domain — not just technical structure.

This skill is based on Eric Evans' *Domain-Driven Design* (DDD).

The core insight: software complexity is best managed by building a model of the domain that the software serves, keeping that model explicit in the code, and organizing the system around bounded contexts that match how the domain actually works.

An agent reasoning about architecture without DDD concepts tends to produce:
- technically clean structures that do not match how the business thinks
- modules that mix multiple domains, creating coupling that is hard to change
- integration patterns that spread a single domain concept across many places without a clear owner

---

## Core Rule

The code should reflect the domain.
The structure should reveal the business intent.
The boundaries should match how the domain actually works, not how the first engineer organized it.

---

## When to Use

Use this skill when:
- designing or reviewing an architecture for a system that serves a business domain
- deciding how to split services, modules, or teams
- identifying where coupling is hurting velocity and why
- evaluating whether to use microservices vs. monolith vs. modular monolith
- reasoning about data ownership, API contracts, and team boundaries
- the codebase has grown to where changing one thing breaks another domain unexpectedly

Do not use when:
- the system has no meaningful domain logic (pure infrastructure, tooling, etc.)
- the problem is an isolated technical decision that does not affect domain modeling
- the context is too early-stage for bounded-context thinking to add value

---

## Key DDD Concepts for Agent Reasoning

### Ubiquitous Language
Every concept in the domain should have one name, used consistently in conversations, documentation, and code.
When the business uses a term one way and the code uses it another, there is a translation cost and a semantic gap.

Questions:
- Is this term used consistently in the codebase and in the domain?
- Where is the same concept called different things in different places?

### Bounded Context
A explicit boundary within which a specific domain model is valid.
Different bounded contexts can use the same word to mean different things (e.g., "Customer" in Sales vs. "Customer" in Support).
The boundary is where the model changes.

Questions:
- What are the natural boundaries in this domain?
- Where does one sub-domain's model stop and another's begin?
- Are two teams using "Customer" to mean different things?

### Context Map
A description of how different bounded contexts relate to each other.
Relationships include:
- **Shared Kernel**: two contexts share a small common model — any change requires coordination
- **Customer-Supplier**: upstream context supplies something downstream depends on; downstream can request changes from upstream
- **Conformist**: downstream conforms to upstream's model with no influence
- **Anti-Corruption Layer**: downstream translates upstream's model at the boundary to protect its own model
- **Open Host Service / Published Language**: upstream publishes a stable, well-documented protocol for all downstreams

Questions:
- What is the actual relationship between these two contexts?
- Is this a healthy upstream-downstream or an unhealthy implicit dependency?

### Entities and Value Objects
**Entity**: an object with a distinct identity that persists over time (e.g., an Order with an order ID)
**Value Object**: an object that is defined entirely by its attributes, has no identity, and is immutable (e.g., a Money amount, an Address)

Questions:
- Does this object need identity or is it fully defined by its value?
- Where are value objects being modeled as entities unnecessarily?

### Aggregates
A cluster of entities and value objects treated as a single unit for data consistency.
Changes to the aggregate are made through the Aggregate Root, which enforces invariants.
External objects reference the aggregate root by ID only — not internal entities directly.

Questions:
- What is the consistency boundary here?
- What invariant must be protected across these objects?
- Are we reaching inside aggregates from outside, violating the boundary?

### Domain Events
Significant occurrences in the domain that the business cares about.
Events are named in past tense and represent facts, not commands.
Examples: OrderPlaced, PaymentProcessed, CustomerDeactivated.

Questions:
- What are the meaningful things that happen in this domain?
- Where is a domain event being handled as a tightly-coupled call instead of an event?
- What downstream contexts should react to this event?

### Anti-Corruption Layer (ACL)
A translation boundary that protects your domain model from a foreign model (legacy system, third-party API, external upstream context).
Without an ACL, the foreign model's concepts leak into your domain and corrupt it.

Questions:
- Where is a foreign model's vocabulary appearing inside the domain model?
- What translation layer would prevent that leakage?

---

## DDD Analysis Template

```md
## System / Component Being Analyzed
<description>

## Domain Summary
<what business domain does this serve, in plain language>

## Ubiquitous Language Gaps
- Term used inconsistently:
  - <term> — used as X in the code, as Y in the business / documentation
- Translation cost observed:
  - <where business language and code language diverge>

## Bounded Contexts Identified
### Context 1: <name>
- Domain responsibility:
- Core model concepts:
- Boundary definition:

### Context 2: <name>
(repeat)

## Context Map
| Context A | Relationship | Context B | Notes |
|-----------|-------------|-----------|-------|

## Aggregate Assessment
- Well-designed aggregates:
  - <aggregate> — invariant it protects: <invariant>
- Boundary violations:
  - <where external objects reach inside an aggregate>

## Domain Events
- Events that should exist:
  - <event name> — meaning: <what it represents>
- Events missing or modeled as tight coupling:
  - <coupling pattern> — should be: <event>

## Anti-Corruption Layer Needs
- Foreign model bleeding into domain:
  - <where>
- Recommended ACL boundary:
  - <location and purpose>

## Recommendations
1. <bounded context change>
2. <aggregate boundary fix>
3. <domain event introduction>
4. <ACL addition>
```

---

## Integration Pattern Selection Guide

| Situation | Recommended Pattern |
|-----------|-------------------|
| Two contexts need to share a core concept | Shared Kernel (with explicit governance) |
| Your context depends on an external context you cannot change | Conformist or ACL |
| Your context needs services from another team | Customer-Supplier with explicit interface |
| Your context integrates with a third-party API | Anti-Corruption Layer |
| Multiple contexts should react to the same business event | Domain Events |
| Your context needs to protect itself from an unstable upstream | Anti-Corruption Layer |

---

## Agent Rules

### Do
- identify bounded contexts before recommending service or module splits
- check ubiquitous language consistency before recommending naming changes
- use aggregate boundaries to locate consistency enforcement
- recommend ACLs when a foreign model is leaking into domain logic

### Do Not
- split services along technical layers (separate service per DB table is not DDD)
- equate "microservice" with "bounded context" — they are different concepts
- violate aggregate boundaries by recommending cross-aggregate foreign key access
- add domain-event machinery before the event is genuinely meaningful to the business

---

## Failure Modes This Skill Prevents

### 1) Anemic domain models
Business logic dispersed into service layers, handlers, and utilities — leaving the domain model as a data container with no behavior.

### 2) Context coupling
Different sub-domains share a database or directly call each other's internal models, creating change coupling across team boundaries.

### 3) Language inconsistency
The same concept has three names across the codebase, creating constant translation overhead.

### 4) Missing ACL
Third-party or legacy concepts bleeding into the core domain model, making the domain dependent on an external system's representation.

---

## Pairing Guide

- **Team Topologies** — bounded contexts often correspond to stream-aligned team boundaries; use Team Topologies to map how teams should align to contexts
- **Designing Data-Intensive Applications** — DDD governs the domain model; DDIA governs the data storage and consistency choices within and between contexts
- **Thinking in Systems** — use Systems Thinking to identify feedback loops and delays between bounded contexts
- **Philosophy of Software Design** — DDD provides the domain-level module boundaries; Philosophy of Software Design guides the depth and abstraction quality within each module

---

## Definition of Done

DDD was applied correctly when:
- bounded contexts are identified with clear responsibilities and boundaries
- ubiquitous language gaps are named
- aggregate boundaries are identified with their invariants
- domain events are named for significant occurrences
- ACL needs are identified where foreign models are bleeding in
- the context map shows how contexts relate
- recommendations are grounded in domain structure, not technical preference

---

## Final Instruction

The software should reflect how the domain works.
Boundaries should match reality, not historical accident.
Language should be consistent between business and code.
Aggregates should own their invariants.
Events should flow where coupling would harm.
