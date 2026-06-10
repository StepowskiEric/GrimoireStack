# Skill: The Goal for AI Engineering Agents

## Purpose

Use this skill when the agent must improve throughput, delivery, or system performance by finding the real bottleneck instead of optimizing everything.

This skill adapts the Theory of Constraints into an engineering operating model:
- every system has a limiting constraint
- local optimization outside the constraint often does little
- the job is to identify, exploit, and elevate the constraint
- once a constraint moves, repeat the process

This skill is ideal for performance work, CI/CD pain, incident recovery, deployment pipelines, queue systems, overloaded services, and developer workflow bottlenecks.

---

## When to Use

Use this skill when:
- performance is poor but the causes are diffuse
- people propose many micro-optimizations
- throughput is capped by one hidden stage
- build or test times are painful
- the release process is slow
- a service is saturated while others are underused
- work piles up in one stage of a pipeline
- teams are trying to optimize everything at once

---

## Core Law

The system only moves as fast as its current constraint.

If the agent improves parts that are not the constraint, total improvement may be tiny or zero.

Therefore:
1. identify the constraint
2. exploit it
3. subordinate everything else
4. elevate it
5. if the constraint moves, repeat

---

## Definitions

### Constraint
The resource, policy, stage, dependency, or workflow step that most limits total throughput.

### Exploit the constraint
Get the maximum useful output from the current constraint without major redesign.

### Subordinate everything else
Align non-constraints to support the constraint rather than optimizing themselves independently.

### Elevate the constraint
Increase the actual capacity or effectiveness of the constraint.

---

## Constraint-Finding Workflow

## Step 1: Model the flow

Identify the end-to-end pipeline:
- request path
- job path
- build path
- release path
- developer workflow path
- data ingestion path

Map:
- stages
- queues
- handoffs
- resource usage
- wait times
- failure/retry points

---

## Step 2: Find accumulation and starvation

Signals of a real constraint:
- backlog builds before it
- downstream stages go idle waiting for it
- utilization near saturation
- latency spikes around it
- throughput plateaus even when other stages have headroom

Examples:
- test suite serialization in CI
- one hot DB query on a saturated index
- a single queue consumer group
- human review step blocking release
- one expensive aggregation that dominates response time
- one API dependency with narrow rate limits

---

## Step 3: Ignore non-constraints

This is the discipline most agents lack.

Do not spend effort on:
- local speedups with no effect on end-to-end throughput
- nice-to-have micro-optimizations
- stylistic cleanup disguised as performance work
- parallel work that floods the bottleneck faster

If the constraint is the DB, improving controller execution by 15% may be irrelevant.

---

## Step 4: Exploit the constraint

Low-cost improvements first:
- remove wasted work at the bottleneck
- improve batching at the bottleneck
- reduce duplicate requests reaching it
- reorder work to keep it busy on highest-value tasks
- fix noisy retries that consume constrained capacity
- reduce context switching or serial waits
- precompute or cache only if it directly relieves the constraint

Ask:
- Is this resource spending time on low-value work?
- Can it stay busy doing only necessary work?
- Is it blocked by avoidable setup or bad scheduling?

---

## Step 5: Subordinate the rest

Other parts of the system should stop behaving as if they are the main character.

Examples:
- cap upstream concurrency so the bottleneck does not thrash
- slow producers when consumers are saturated
- shape work to match constraint capacity
- prioritize valuable work instead of feeding the bottleneck garbage
- align batch sizes, schedules, or retry policies to protect the constraint

Rule:
Do not optimize non-constraints in ways that make the constraint’s life worse.

---

## Step 6: Elevate the constraint

Only after exploit/subordinate steps:
- add capacity
- redesign the algorithm
- shard the bottleneck
- denormalize or precompute strategically
- split pipelines
- add hardware
- parallelize the constrained stage
- automate the constrained human step
- redesign ownership if organizational friction is the real bottleneck

---

## Step 7: Re-run the analysis

Once the constraint moves:
- a new one appears
- old assumptions may be wrong
- previous bottleneck fixes may no longer matter

Improvement is iterative, not final.

---

## Where the Constraint Might Hide

### Technical
- DB pool / lock / query plan
- synchronous remote dependency
- CPU-bound transform
- serialized worker
- queue consumer
- rate limit
- slow test stage
- artifact packaging
- storage I/O
- cache-miss storm

### Process
- code review queue
- deployment approval
- flaky integration environment
- release coordination
- manual QA checkpoint
- knowledge silo
- single person dependency

### Product / policy
- over-broad validation
- too much required synchronous work
- one-size-fits-all pipeline for all changes
- unprioritized backlog flooding the system

---

## Anti-Patterns

### 1) Optimize everything
The agent suggests 40 changes with no bottleneck analysis.

Counter:
One system, one current primary constraint.

### 2) Mistake high utilization everywhere for the bottleneck
Busy does not equal limiting.

Counter:
Look for accumulation, starvation, and end-to-end impact.

### 3) Flood the constraint faster
The agent parallelizes upstream work and worsens overload.

Counter:
Subordinate non-constraints to protect the bottleneck.

### 4) Improve averages, ignore throughput
Averages can hide where the real system limit lives.

Counter:
Inspect end-to-end flow, queues, wait time, and saturation.

### 5) Solve the old bottleneck forever
The agent keeps polishing yesterday’s constraint.

Counter:
Reassess after each meaningful improvement.

---

## Best Uses for This Skill

- performance tuning
- CI/CD optimization
- deployment speed improvement
- queue and worker systems
- batch pipeline optimization
- large test suite acceleration
- incident triage for overload
- developer workflow improvement
- platform engineering prioritization

---

## Constraint Analysis Template

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

---

## Review Questions

- What is the actual goal of this system?
- What one stage most limits reaching that goal?
- What evidence shows that this is the constraint?
- Which proposed optimizations do not touch it?
- How can we protect the constraint from waste?
- What happens after the constraint moves?

---

## Definition of Done

A throughput or optimization task is done when:
- the primary constraint was identified with evidence
- proposed work focused primarily on that constraint
- waste at the constraint was reduced
- non-constraints were aligned to support it
- success was measured end-to-end
- the team knows what the next constraint is likely to be

---

## Prompt Snippets

### For optimization
“Do not optimize everything. Identify the current system constraint, explain the evidence, and focus recommendations on exploiting, subordinating to, and elevating that bottleneck.”

### For CI/CD
“Treat the pipeline as a flow system. Find the stage limiting end-to-end throughput and ignore changes that do not move that constraint.”

### For performance review
“Find the one bottleneck that dominates the critical path. Distinguish it from busy but non-limiting components.”

### For incident load spikes
“Identify what is saturated, where work accumulates, and which changes would reduce pressure on the true constraint first.”

---

## Final Instruction

A system with one real bottleneck does not improve because everything got slightly better.

Find the Herbie. Protect it. Improve it. Then repeat.
