---
name: designing-data-intensive-applications-ai
description: "Reason about data systems: storage choices, replication, consistency, partitioning, queues, failure modes, and operational tradeoffs."
triggers:
  - data-system-reasoning
  - storage-selection
  - distributed-debugging
  - consistency-tradeoffs
---

# Designing Data-Intensive Applications for AI Agents

**Distributed data systems are tradeoff machines.** Do not ask only "can this work?" — ask what the tradeoffs are, what fails under load or partial outage, what consistency model is acceptable, what coordination costs, and how the system recovers. A design that works on the happy path but collapses under real distributed conditions is not good enough.

## When to Use
- Choosing between storage or messaging patterns
- Designing APIs backed by databases or event streams
- Planning schema or index changes
- Reasoning about replication, caches, queues, asynchronous workflows
- Diagnosing distributed-system bugs
- Evaluating data-correctness vs latency tradeoffs

## The Move

### 1. Frame the workload
Answer before proposing anything: What is the read/write pattern? What scale matters (data size, volume, fan-out, retention, concurrency)? What consistency is required? What latency matters? What failure modes must be tolerated? Is it transactional, analytical, event-driven, cache-heavy, or mixed? What operational burden is acceptable? What invariants must always hold?

### 2. Match the data model to the access pattern
Check key access patterns, range queries, aggregations, joins, fan-out reads, write amplification, and secondary-index needs. Choose storage by workload fit, not trend or familiarity.

### 3. Trace replication, consistency, and partitioning
- **Replication** — where truth is written, how replicas update, what lag exists, whether reads can be stale, what happens on failover, how conflicts resolve
- **Consistency** — which invariants need strong guarantees, where eventual consistency is acceptable, whether idempotency exists, how duplicates and concurrent writes resolve
- **Partitioning** — whether keys distribute evenly, whether one partition/tenant dominates, whether "obvious" partition keys create hotspots, whether rebalancing is painful

### 4. Check caches, queues, and derived state
For each cache or async workflow: what is the source of truth, how invalidation works, what stale state means, how retries behave, how duplicates are handled, whether queues can accumulate faster than they drain, how downstream consumers recover. Caches are not free speed — they are mystery acceleration until invalidation is defined.

### 5. Design for failure, then review
Every design must answer: what happens on partial network failure, a slow dependency, lagging consumers, storage saturation, event replay, and diverging schema versions? If the failure behavior cannot be explained, the design is incomplete. Then run the review checklist (in Reference) and record the verdict.

## Reference
For the six reasoning areas in detail, the data-architecture and change-impact templates, the review checklist, failure modes with counters, and prompt snippets, see [`references/ddia-details.md`](references/ddia-details.md).

## Rules
- **Do** name the invariants and consistency requirements explicitly before choosing a technology.
- **Do** design idempotent consumers with replay and duplicate semantics.
- **Do** keep the source of truth clear; caches and derived state are separate by definition.
- **Do** explain failure behavior for every design — partial outage included.
- **Do** prefer simpler failure semantics over brittle cleverness.
