# Designing Data-Intensive Applications — Reference Details

## Primary design questions

Before proposing a data architecture, answer:
- What is the read/write pattern?
- What scale matters: data size, request volume, fan-out, retention, or concurrency?
- What consistency is required?
- What latency matters?
- What failure modes must be tolerated?
- Is the workload transactional, analytical, event-driven, cache-heavy, or mixed?
- What operational burden is acceptable?
- What invariants must always hold?

## Data architecture review template

```text
System goal:
Primary read/write patterns:
Critical invariants:
Latency targets:
Consistency requirements:
Failure tolerance:
Source of truth:
Replication / caching / queuing strategy:
Hotspot risks:
Operational risks:
Migration concerns:
```

## Change impact template

```text
Proposed change:
Affected data model:
Who writes:
Who reads:
Consistency impact:
Replication / cache impact:
Backfill or migration need:
Failure mode changes:
Rollback / compatibility plan:
```

## Review checklist

- Does the chosen data model fit the access pattern?
- What consistency level is actually required?
- What becomes stale, duplicated, reordered, or delayed?
- Where are hotspots likely?
- What happens during partial failure?
- Is the operational burden justified?
- Are source of truth and derived state clearly separated?

## Failure modes this skill prevents (with counters)

- **Database by vibe** — picking a store because it is popular. Counter: match technology to workload and invariants.
- **Event-driven handwaving** — recommending events/queues without ordering, duplicates, or failure recovery. Counter: explicitly design consumer semantics and replay behavior.
- **Cache magical thinking** — treating cache as free speed. Counter: define invalidation, staleness tolerance, and source of truth.
- **Consistency ambiguity** — saying "eventual consistency" without specifying what can temporarily be wrong. Counter: name the exact tolerated inconsistency and its user impact.
- **Partitioning naïveté** — proposing sharding without checking hotspot or rebalance behavior. Counter: model key distribution and the failure of skew assumptions.

## Good engineering moves encouraged

- Choose data models based on access patterns
- Make consistency requirements explicit
- Design idempotent consumers
- Use append-only/event streams when replay and audit matter
- Keep source of truth clear
- Use caches strategically, not as mystery acceleration
- Prefer simpler failure semantics over brittle cleverness
- Design migration plans for schema evolution
- Surface operational tradeoffs honestly

## Prompt snippets

- **Backend design:** "Evaluate this design as a data-intensive system. Match the storage and messaging choices to the access pattern, consistency requirements, and failure modes."
- **Event systems:** "Do not handwave queues. Explain ordering, retries, duplicates, idempotency, backlog behavior, and replay semantics."
- **Schema changes:** "Forecast read/write impact, migration needs, cache implications, and compatibility risk across distributed consumers."
- **Architecture review:** "Assess reliability, scalability, and maintainability tradeoffs instead of recommending technology by trend."

## Definition of done

A data-intensive design task is done when:
- the workload and invariants are explicit
- tradeoffs are clearly named
- consistency and failure behavior are described honestly
- source of truth and derived data are clear
- migration and recovery concerns are accounted for
- recommendations fit the real access patterns and constraints
