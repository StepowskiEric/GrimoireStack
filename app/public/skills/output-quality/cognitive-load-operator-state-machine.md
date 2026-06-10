# Skill: Cognitive Load Operator — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must make information easier to understand, retain, and act on.

This skill operationalizes cognitive-load control for:
- explanations
- plans
- workflows
- prompts
- procedures
- documentation
- reports
- multi-step recommendations

The goal is not merely to be “clear.”  
The goal is to reduce the amount of working memory required to use the output correctly.

---

## Core Law

The agent must not emit a dense, tangled, high-branching output when a lower-load structure is possible.

This skill forces the agent to:
- inspect complexity before output
- identify overload sources
- choose a lower-load structure
- verify that the answer is easier to process

---

## Mandatory Diagnostic Artifact

Before producing the final output, the agent must create `cognitive-load-map.md`.

Required fields:

```md
# Cognitive Load Map

## Audience
<who must understand this>

## Goal
<what the output should let them do>

## Core Concepts
<list>

## Active Working-Memory Risks
- <too many concepts>
- <too many branches>
- <hidden dependencies>
- <unstable naming>
- <buried sequence>
- <implicit state>

## Output Shape Chosen
<overview/procedure/decision memo/state model/etc>

## Chunking Strategy
<how information will be grouped>

## State/Phase Model
<if applicable>

## Dependency Notes
<what depends on what>

## Simplification Moves
<what will be removed, renamed, chunked, sequenced, or restated>
```

---

## State Machine

## State 0 — Intake

Goal:
- identify the real communication job

Questions:
- Who must understand this?
- What must they be able to do after reading?
- Is this explanation, instruction, comparison, plan, or decision support?

Allowed actions:
- classify output type
- identify audience and goal

Disallowed actions:
- writing the final answer immediately
- assuming all audiences tolerate the same density

Exit condition:
- audience and output type identified

---

## State 1 — Complexity Scan

Goal:
- identify where working memory will be overloaded

Scan for:
- too many active concepts at once
- long conditional chains
- hidden state changes
- too much cross-referencing
- unstable vocabulary
- buried order of operations
- mixed abstraction levels
- long flat lists without grouping

Allowed actions:
- enumerate cognitive risks
- identify mental bottlenecks

Disallowed actions:
- “simplifying” by deleting essential structure
- confusing shortness with low load

Exit condition:
- overload risks documented in `cognitive-load-map.md`

---

## State 2 — Structure Selection

Goal:
- choose the lowest-load output shape

Possible shapes:
- overview + details
- stepwise procedure
- decision memo
- option comparison
- state machine
- hierarchy with grouped chunks
- question/answer format
- timeline or phase model

Rule:
The structure must reduce processing cost, not just look organized.

Allowed actions:
- pick structure
- define chunk boundaries
- define stable vocabulary
- define where state transitions will be made explicit

Disallowed actions:
- leaving the structure implicit
- mixing overview, caveats, exceptions, and execution steps into one blob

Exit condition:
- output shape and chunking strategy chosen

---

## State 3 — Explicit State and Dependency Mapping

Goal:
- externalize information that would otherwise live in the reader’s head

The agent should make explicit:
- state changes
- sequence
- prerequisites
- branching points
- dependencies between steps
- when caveats apply

If the reader would otherwise need to “simulate” the process mentally, make the mechanics explicit.

Allowed actions:
- introduce named stages or phases
- define preconditions
- define transitions
- restate critical constraints locally

Disallowed actions:
- forcing the reader to remember remote caveats
- leaving important branches buried

Exit condition:
- state/dependency model documented in the artifact

---

## State 4 — Output Assembly

Goal:
- generate the low-load output

Rules:
- stable terminology
- visible structure before detail
- chunk related items
- separate optional content from core content
- keep each chunk focused
- reduce branch nesting
- restate critical constraints where needed

Allowed actions:
- produce final answer
- compress redundancy
- preserve key structure

Disallowed actions:
- reverting to information dumping
- flattening all nuance into one paragraph
- renaming the same concept multiple times

Exit condition:
- draft exists in the chosen low-load structure

---

## State 5 — Load Audit

Goal:
- test whether the draft is actually easier to process

Self-check:
- How many concepts are active in each section?
- Does each section do one mental job?
- Are state transitions obvious?
- Would the audience need to remember too much from earlier sections?
- Are the most important actions/ideas visible early?
- Is the language stable?

If the answer still feels mentally expensive, revise before finalizing.

Allowed actions:
- regroup
- shorten locally
- restate dependencies
- cut non-essential side paths

Disallowed actions:
- assuming structure alone solved the problem
- keeping a dense answer because it is “complete”

Exit condition:
- the answer is materially easier to scan and use

---

## Tool Gating Guidance

This skill is mostly about output structure, but diagnostic tools may be used when needed to:
- inspect large material before summarizing
- identify repeated concepts or branches
- map dependencies before explaining them

The final output should only be produced after the load map is complete.

---

## Circuit Breakers

Stop and restructure if:
- the answer keeps growing in flat complexity
- one section contains too many branches
- the same concept has been renamed multiple times
- the user would have to remember several remote caveats to proceed
- the explanation requires too much simulation rather than recognition

---

## Failure Modes This Skill Prevents

- dense but “technically correct” outputs
- unstable vocabulary
- branch overload
- buried sequence
- hidden state
- explanation spaghetti

---

## Definition of Done

This skill is correctly applied when:
- `cognitive-load-map.md` exists
- the output shape is intentional
- working-memory risks were identified and reduced
- sequence, state, and dependencies are explicit where needed
- the final answer is cheaper to understand than the unstructured alternative

---

## Final Instruction

Do not merely inform.  
Make understanding cheap.
