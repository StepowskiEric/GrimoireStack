---
name: agentic-design-patterns-orchestrator
description: "Adopt pattern-based orchestration with planning, routing, reflection, and recovery."
triggers:
  - Treating a task as a single-shot reply would lose reliability
  - Need to choose the right pattern from prompt chaining, routing, planning, reflection, tool use
  - Task is non-trivial and needs orchestration
---

# Skill: Agentic Patterns Orchestrator for AI Agents

## Core Rule

Do not treat all tasks as one-shot prompt/response problems. Choose the right pattern from a small toolkit:
- prompt chaining
- routing
- planning
- reflection
- tool use
- memory management
- multi-agent collaboration
- exception handling and recovery
- human-in-the-loop
- guardrails

---

## When to Use

Use this skill when:
- tasks are multi-step
- one response is not enough
- tools are available
- the task spans planning, execution, and verification
- failure recovery matters
- the work can be decomposed cleanly
- context must be managed over time
- a human approval checkpoint is appropriate

Do not use full orchestration for trivial low-stakes tasks.

---

## Pattern Selection Guide

| Pattern | Use When | Key Principle |
|---------|----------|------|
| Prompt Chaining | Sequential transformation (gather → transform → evaluate → finalize) | Each step's output is the next step's input |
| Routing | Different task types need different handlers | Classify first, then dispatch |
| Planning | Complex task with dependent steps | Build a plan, keep it editable, update on new evidence |
| Reflection | First pass is likely imperfect | Check against criteria, not vague self-doubt |
| Tool Use | External information or state change needed | Every tool call has a purpose |
| Memory Management | Work spans sessions or recurring preferences | Distinguish stable facts from working state |
| Multi-Agent Collaboration | Decomposition creates real leverage | Never for vanity or simple tasks |
| Exception Handling | Failure is plausible | Detect clearly, retry only when rational |
| Human-in-the-Loop | High stakes or irreversible action | Ask where it adds value, not performatively |
| Guardrails | Boundary system around all patterns | Scope control, risk limits, escalation triggers |

---

## Standard Agentic Workflow

For non-trivial tasks:

### Stage 1: classify
- what kind of task is this?
- what patterns are needed?
- what is the risk level?

### Stage 2: plan
- define the objective
- identify the stages
- choose the stopping condition

### Stage 3: execute
- use tools, retrieval, or sub-agents deliberately
- keep the plan updated

### Stage 4: reflect
- compare output against criteria
- catch major errors
- avoid infinite self-correction

### Stage 5: finalize
- return the result
- name uncertainty or residual risk
- store stable memory only if appropriate

---

## Pattern Misuse to Avoid

| Anti-pattern | What it looks like | The fix |
|-------------|-------------------|---------|
| One-shot overuse | Every task is immediate answer generation | Use planning, routing, or reflection where the task requires them |
| Pattern overload | Every pattern used for every task | Use the smallest useful orchestration |
| Reflection loops | Endless self-critique | Set explicit evaluation criteria and stopping rules |
| Multi-agent vanity | Spawning specialists for work one agent could do | Use multi-agent only when decomposition clearly helps |
| Memory pollution | Storing too much low-value state | Preserve only durable, useful information |
| Tool theatrics | Calling tools to look sophisticated | Every tool call has a purpose |

---

## Pattern Selection Matrix

### Simple low-stakes task
- direct response
- maybe light routing

### Medium-complexity task
- planning
- tool use as needed
- light reflection

### High-stakes task
- ETTO check
- planning
- evidence gathering
- reflection against criteria
- guardrails
- human checkpoint if appropriate

### Large multi-domain task
- routing
- sub-agent decomposition
- memory/context management
- exception handling
- explicit stopping conditions

---



## Definition of Done

A task was handled agentically when:
- the correct patterns were selected
- the workflow matched the task’s complexity and risk
- the agent did not rely on a brittle one-shot answer where orchestration was needed
- failure handling and validation were appropriate
- the result was stronger because of structure, not because of extra ceremony

---

## Final Instruction

Use patterns as engineering tools, not decorations.

Choose the minimum orchestration that makes the agent meaningfully better.
