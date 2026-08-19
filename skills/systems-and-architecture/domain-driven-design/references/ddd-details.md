# DDD — Concepts, Pattern Guide & Template

## Key concepts for agent reasoning

### Ubiquitous language
Every concept in the domain has one name, used consistently in conversations, documentation, and code. When business uses a term one way and code another, there is a translation cost and a semantic gap. Ask: is this term used consistently? Where is the same concept called different things?

### Bounded context
An explicit boundary within which a specific domain model is valid. Different contexts can use the same word to mean different things. The boundary is where the model changes. Ask: what are the natural boundaries? Where does one sub-domain's model stop and another's begin?

### Context map
Describes how bounded contexts relate:
- **Shared Kernel** — two contexts share a small common model; any change requires coordination
- **Customer-Supplier** — upstream supplies something downstream depends on; downstream can request changes
- **Conformist** — downstream conforms to upstream's model with no influence
- **Anti-Corruption Layer** — downstream translates upstream's model at the boundary to protect its own
- **Open Host Service / Published Language** — upstream publishes a stable, well-documented protocol for all downstreams

### Entities and value objects
**Entity** — distinct identity persisting over time (an Order with an order ID). **Value Object** — defined entirely by attributes, immutable, no identity (Money, Address). Ask: does this need identity, or is it fully defined by value? Where are value objects modeled as entities unnecessarily?

### Aggregates
A cluster of entities/value objects treated as a single unit for consistency, changed through the Aggregate Root which enforces invariants. External objects reference the root by ID only. Ask: what is the consistency boundary? What invariant must be protected? Where do we reach inside from outside?

### Domain events
Significant occurrences the business cares about, named in past tense, representing facts not commands: OrderPlaced, PaymentProcessed, CustomerDeactivated. Ask: what meaningful things happen here? Where is an event handled as a tightly-coupled call? What downstream contexts should react?

### Anti-corruption layer (ACL)
A translation boundary protecting your domain model from a foreign model (legacy, third-party, external upstream). Without it, foreign concepts leak in and corrupt the domain. Ask: where is foreign vocabulary inside the domain model? What translation layer prevents the leakage?

## Integration pattern selection guide

| Situation | Recommended pattern |
|-----------|-------------------|
| Two contexts share a core concept | Shared Kernel (with explicit governance) |
| Your context depends on an external context you cannot change | Conformist or ACL |
| Your context needs services from another team | Customer-Supplier with explicit interface |
| Your context integrates with a third-party API | Anti-Corruption Layer |
| Multiple contexts react to the same business event | Domain Events |
| Your context must protect itself from an unstable upstream | Anti-Corruption Layer |

## DDD analysis template

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

## Failure modes this skill prevents

1. **Anemic domain models** — business logic dispersed into services/handlers, leaving the domain as a data container with no behavior
2. **Context coupling** — sub-domains share a database or call each other's internal models, creating change coupling across team boundaries
3. **Language inconsistency** — the same concept has three names, creating constant translation overhead
4. **Missing ACL** — third-party or legacy concepts bleeding into the core domain, making it depend on an external system's representation

## Pairing guide

- **Team Topologies** — bounded contexts often correspond to stream-aligned team boundaries; map teams to contexts
- **Designing Data-Intensive Applications** — DDD governs the domain model; DDIA governs storage and consistency within and between contexts
- **Thinking in Systems** — feedback loops and delays between bounded contexts
- **Philosophy of Software Design** — DDD gives domain-level module boundaries; PoSD guides depth and abstraction quality within modules

## Definition of done

Applied correctly when:
- bounded contexts are identified with clear responsibilities and boundaries
- ubiquitous language gaps are named
- aggregate boundaries are identified with their invariants
- domain events are named for significant occurrences
- ACL needs are identified where foreign models are bleeding in
- the context map shows how contexts relate
- recommendations are grounded in domain structure, not technical preference
