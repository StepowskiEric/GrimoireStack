# MECE / Pyramid Principle — Template, Violations & Patterns

## Pyramid template

```md
## Governing Thought
<the single most important claim, recommendation, or insight — stated first>

## Supporting Arguments (Level 2)
These arguments are MECE: they do not overlap and together they fully support the governing thought.

### Argument 1: <distinct dimension or reason>
- Evidence: <specific supporting fact or data>
- Evidence: <specific supporting fact or data>

### Argument 2: <distinct dimension or reason>
- Evidence: <specific supporting fact or data>
- Evidence: <specific supporting fact or data>

### Argument 3: <distinct dimension or reason>
- Evidence: <specific supporting fact or data>
- Evidence: <specific supporting fact or data>

## MECE Check
- Do any arguments overlap? <yes — identify / no>
- Are there gaps in coverage? <yes — identify / no>

## Revised Structure (if needed)
<restructured version after MECE correction>
```

## MECE violations and fixes

### Overlap
"Performance" and "Latency" as separate arguments, though latency is a component of performance. Fix: merge latency into performance, or separate into truly distinct dimensions: "request latency," "throughput under load," "resource utilization."

### Gap
A distributed-system analysis discusses consistency and availability but omits partition tolerance — fundamental to the tradeoff. Fix: add the missing dimension, even if the answer is "this system does not have configurable partition tolerance."

### Redundant evidence
The same metric (p95 latency) appears under both "performance" and "user experience." Fix: assign to exactly one argument; if it legitimately belongs in both, the arguments are not distinct.

### Everything in one bucket
All concerns listed under "Technical Risk." Fix: decompose into implementation risk, dependency risk, operational risk, timeline risk — each MECE with the others.

## Governing-thought patterns

- **Recommendation:** "The team should adopt X because it addresses the three core constraints better than the alternatives."
- **Diagnosis:** "The root cause of the performance regression is Y, driven by three compounding factors."
- **Assessment:** "This plan is sound, with two specific risks that need mitigation before execution."
- **Decision:** "Option A is preferable to Option B given the constraints, with one key condition that must be true."

A governing thought is a claim, not a topic.

## Failure modes this skill prevents

1. **Bottom-up disclosure** — all evidence first, recommendation last; the reader holds uncertainty to the end
2. **Overlap pollution** — sections covering the same ground
3. **Coverage gaps** — missing dimensions that would change the conclusion
4. **Flat lists** — all considerations at one level, relationships invisible

## Pairing guide

- **Cognitive Load Operator** — MECE gives the structure; CL checks whether it is easy to process
- **Bounded Self-Revision** — use the MECE test as the revision criterion
- **Feynman Technique** — Feynman verifies the reasoning is sound; MECE structures it clearly
- **Six Thinking Hats** — after the analysis, MECE organizes the conclusions

## Definition of done

Applied correctly when:
- the governing thought is stated first and is a claim, not a topic
- Level 2 arguments are distinct and do not substantially overlap
- the argument set covers the full relevant space
- each piece of evidence belongs to exactly one argument
- the MECE test was applied and violations corrected
- the output is faster to read and more persuasive because of its structure
