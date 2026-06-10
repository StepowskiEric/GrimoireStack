# Skill: Designing Data-Intensive Applications for AI Agents

## Purpose

Use this skill when the agent must reason about data systems, storage choices, distributed behavior, and tradeoffs in reliability, scalability, and maintainability.

This skill adapts DDIA-style engineering thinking into an AI operating model:
- understand tradeoffs, not slogans
- reason about consistency, replication, partitioning, and failure modes
- design data flow consciously
- choose storage and messaging patterns for the workload
- respect operational complexity

This skill is essential for backend architecture, event systems, queues, database changes, data pipelines, and distributed service design.

---

## When to Use

Use this skill when:
- choosing between storage or messaging patterns
- designing APIs backed by databases or event streams
- planning schema or index changes
- reasoning about replication, caches, queues, and asynchronous workflows
- deciding how services exchange data
- diagnosing distributed-system bugs
- evaluating data correctness vs latency tradeoffs

---

## Core Rule

Do not ask only “Can this work?”
Ask:
- What are the tradeoffs?
- What fails under load or partial outage?
- What consistency model is acceptable?
- What is the cost of coordination?
- How does this system recover?

A design that works in the happy path but collapses under real distributed conditions is not good enough.

---

## Primary Design Questions

Before proposing a data architecture, answer:

- What is the read/write pattern?
- What scale matters: data size, request volume, fan-out, retention, or concurrency?
- What consistency is required?
- What latency matters?
- What failure modes must be tolerated?
- Is the workload transactional, analytical, event-driven, cache-heavy, or mixed?
- What operational burden is acceptable?
- What invariants must always hold?

---

## Data System Reasoning Areas

### 1) Data model and query shape
The storage model must match the access pattern.

Check:
- key access patterns
- range queries
- aggregations
- joins
- fan-out reads
- write amplification
- secondary index needs

Do not choose storage by trend or familiarity alone.

---

## 2) Replication and read/write paths

Ask:
- where truth is written
- how replicas are updated
- what lag exists
- whether reads can be stale
- what happens during failover
- how conflicts are handled

The agent must explicitly reason about stale reads, lag, and failover behavior.

---

## 3) Consistency and coordination

Not every system needs strong coordination everywhere.
Not every system can survive without it.

Ask:
- which invariants require strong guarantees
- where eventual consistency is acceptable
- whether idempotency exists
- how duplicate events are handled
- how concurrent writes resolve
- whether users can tolerate stale views

---

## 4) Partitioning and hotspots

Check:
- whether keys distribute evenly
- whether one partition or tenant can dominate
- whether ordering requirements fight scaling
- whether “obvious” partition keys create hotspots
- whether rebalancing is painful

A scalable design on paper often fails because the key design is naive.

---

## 5) Caches, queues, and derived state

For each cache or async workflow:
- what is the source of truth
- how invalidation works
- what stale state means
- how retries behave
- how duplicates are handled
- whether queues can accumulate faster than they drain
- how downstream consumers recover

---

## 6) Failures and recovery

Every design should answer:
- what happens on partial network failure
- what happens when one dependency is slow
- what happens when consumers lag
- what happens when storage is saturated
- what happens when events replay
- what happens when schema versions diverge

If the agent cannot explain failure behavior, the design is incomplete.

---

## Good Engineering Moves Encouraged by This Skill

- choose data models based on access patterns
- make consistency requirements explicit
- design idempotent consumers
- use append-only/event streams when replay and audit matter
- keep source of truth clear
- use caches strategically, not as mystery acceleration
- prefer simpler failure semantics over brittle cleverness
- design migration plans for schema evolution
- surface operational tradeoffs honestly

---

## AI Failure Modes This Skill Prevents

### 1) Database by vibe
The agent picks a store because it is popular.

Counter:
Match technology to workload and invariants.

### 2) Event-driven handwaving
The agent recommends events/queues without handling ordering, duplicates, or failure recovery.

Counter:
Explicitly design consumer semantics and replay behavior.

### 3) Cache magical thinking
The agent treats cache as free speed.

Counter:
Define invalidation, staleness tolerance, and source of truth.

### 4) Consistency ambiguity
The agent says “eventual consistency” without specifying what can temporarily be wrong.

Counter:
Name the exact tolerated inconsistency and its user impact.

### 5) Partitioning naïveté
The agent proposes sharding without checking hotspot or rebalance behavior.

Counter:
Model key distribution and failure of skew assumptions.

---

## Best Uses for This Skill

- backend architecture review
- event-driven system design
- queue/worker architecture
- storage technology selection
- schema evolution planning
- debugging distributed data issues
- reliability analysis for data flows
- deciding between sync and async workflows

---

## Data Architecture Review Template

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

---

## Change Impact Template

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

---

## Review Checklist

- Does the chosen data model fit the access pattern?
- What consistency level is actually required?
- What becomes stale, duplicated, reordered, or delayed?
- Where are hotspots likely?
- What happens during partial failure?
- Is the operational burden justified?
- Are source of truth and derived state clearly separated?

---

## Definition of Done

A data-intensive design task is done when:
- the workload and invariants are explicit
- tradeoffs are clearly named
- consistency and failure behavior are described honestly
- source of truth and derived data are clear
- migration and recovery concerns are accounted for
- recommendations fit the real access patterns and constraints

---

## Prompt Snippets

### For backend design
“Evaluate this design as a data-intensive system. Match the storage and messaging choices to the access pattern, consistency requirements, and failure modes.”

### For event systems
“Do not handwave queues. Explain ordering, retries, duplicates, idempotency, backlog behavior, and replay semantics.”

### For schema changes
“Forecast read/write impact, migration needs, cache implications, and compatibility risk across distributed consumers.”

### For architecture review
“Assess reliability, scalability, and maintainability tradeoffs instead of recommending technology by trend.”

---

## Final Instruction

Distributed data systems are tradeoff machines.

Name the invariants, choose the tradeoffs consciously, and design for failure as seriously as for the happy path.
