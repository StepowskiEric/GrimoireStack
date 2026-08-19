# The Goal — Reference Details

## Where the constraint might hide

### Technical
- DB pool / lock / query plan
- Synchronous remote dependency
- CPU-bound transform
- Serialized worker
- Queue consumer
- Rate limit
- Slow test stage
- Artifact packaging
- Storage I/O
- Cache-miss storm

### Process
- Code review queue
- Deployment approval
- Flaky integration environment
- Release coordination
- Manual QA checkpoint
- Knowledge silo
- Single-person dependency

### Product / policy
- Over-broad validation
- Too much required synchronous work
- One-size-fits-all pipeline for all changes
- Unprioritized backlog flooding the system

## Failure modes (with counters)

- **Optimize everything** — 40 changes with no bottleneck analysis. Counter: one system, one current primary constraint.
- **Mistake high utilization for the bottleneck** — busy does not equal limiting. Counter: look for accumulation, starvation, end-to-end impact.
- **Flood the constraint faster** — parallelizing upstream worsens overload. Counter: subordinate non-constraints to protect the bottleneck.
- **Improve averages, ignore throughput** — averages hide where the system limit lives. Counter: inspect end-to-end flow, queues, wait time, saturation.
- **Polish yesterday's constraint** — the agent keeps optimizing what moved. Counter: reassess after each meaningful improvement.

## Constraint analysis template

```text
System goal:
Flow stages:
Observed throughput:
Observed latency:
Where work accumulates:
Where downstream stages starve:
Likely constraint:
Low-cost exploitation ideas:
Ways to subordinate non-constraints:
Capacity elevation options:
Success metric:
```

## Prompt snippets

- **Optimization:** "Do not optimize everything. Identify the current system constraint, explain the evidence, and focus recommendations on exploiting, subordinating to, and elevating that bottleneck."
- **CI/CD:** "Treat the pipeline as a flow system. Find the stage limiting end-to-end throughput and ignore changes that do not move that constraint."
- **Performance review:** "Find the one bottleneck that dominates the critical path. Distinguish it from busy but non-limiting components."
- **Incident load spikes:** "Identify what is saturated, where work accumulates, and which changes would reduce pressure on the true constraint first."

## Review questions

- What is the actual goal of this system?
- What one stage most limits reaching that goal?
- What evidence shows that this is the constraint?
- Which proposed optimizations do not touch it?
- How can we protect the constraint from waste?
- What happens after the constraint moves?

## Definition of done

A throughput or optimization task is done when:
- the primary constraint was identified with evidence
- proposed work focused primarily on that constraint
- waste at the constraint was reduced
- non-constraints were aligned to support it
- success was measured end-to-end
- the team knows what the next constraint is likely to be

## Definitions

- **Constraint** — the resource, policy, stage, dependency, or workflow step that most limits total throughput.
- **Exploit** — get maximum useful output from the current constraint without major redesign.
- **Subordinate** — align non-constraints to support the constraint rather than optimizing themselves independently.
- **Elevate** — increase the actual capacity or effectiveness of the constraint.
