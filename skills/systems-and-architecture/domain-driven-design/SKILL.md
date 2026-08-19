---
name: domain-driven-design
description: "Bounded contexts, ubiquitous language, aggregates, context maps, domain events, anti-corruption layers."
triggers:
  - business-domain-architecture
  - bounded-context-design
  - domain-seam-separation
---

# Domain-Driven Design for AI Agents

**The code should reflect the domain.** Software complexity is best managed by building an explicit model of the domain the software serves and organizing the system around **bounded contexts** that match how the domain actually works — not how the first engineer organized it. Boundaries should match reality, not historical accident; language should be consistent between business and code.

## When to Use
- Designing or reviewing architecture for a system that serves a business domain
- Deciding how to split services, modules, or teams
- Identifying where coupling is hurting velocity and why
- Evaluating microservices vs monolith vs modular monolith
- Reasoning about data ownership, API contracts, and team boundaries
- The codebase has grown until changing one thing breaks another domain unexpectedly

Skip it: no meaningful domain logic (pure infrastructure), isolated technical decisions, or too-early-stage context.

## The Move

### 1. Map the domain
Describe what business domain the system serves, in plain language. Name the natural boundaries: where does one sub-domain's model stop and another's begin? Are two teams using "Customer" to mean different things?

### 2. Identify the bounded contexts
An explicit boundary within which a specific domain model is valid — the boundary is where the model changes. Different contexts can use the same word to mean different things (Sales "Customer" vs Support "Customer"). Do not equate microservice with bounded context — they are different concepts; do not split services along technical layers.

### 3. Check ubiquitous language
Every domain concept should have one name, used consistently in conversation, docs, and code. Where is the same concept called different things in different places? A term used one way in the business and another in code is a translation cost — name the gap.

### 4. Assess aggregates and events
- **Aggregates** — clusters of entities/value objects treated as one unit for consistency, changed through the aggregate root. What invariant must be protected? Where do external objects reach inside an aggregate, violating the boundary?
- **Domain events** — significant occurrences named in past tense (OrderPlaced, PaymentProcessed). Where is an event being handled as a tightly-coupled call instead of an event? Only add event machinery where the event is genuinely meaningful to the business.

### 5. Plan the anti-corruption layers, then write the analysis
Find where a foreign model's vocabulary (legacy system, third-party API, unstable upstream) is bleeding into the domain — that's where an **anti-corruption layer** translates at the boundary to protect your model. Then fill the DDD analysis template (in Reference): domain summary, language gaps, bounded contexts, context map with relationships, aggregate assessment, events, ACL needs, recommendations grounded in domain structure.

## Reference
For the full concept catalog with per-concept questions, the integration-pattern selection guide, the analysis template, failure modes, and pairing guide, see [`references/ddd-details.md`](references/ddd-details.md).

## Rules
- **Do** identify bounded contexts before recommending service or module splits.
- **Do** check language consistency before recommending naming changes.
- **Do** use aggregate boundaries to locate consistency enforcement.
- **Do** recommend ACLs where a foreign model leaks into domain logic.
- **Do** keep events for genuinely meaningful business occurrences — machinery without meaning is ceremony.
