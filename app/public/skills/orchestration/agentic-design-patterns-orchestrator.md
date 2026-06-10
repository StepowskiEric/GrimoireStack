# Skill: Agentic Patterns Orchestrator for AI Agents

## Purpose

Use this skill when the agent must operate as a real workflow rather than a single-shot responder.

This skill turns modern agentic design patterns into a practical operating model:
- plan
- route
- use tools deliberately
- reflect
- coordinate sub-agents when justified
- manage memory and context
- recover from failure
- keep humans in the loop when risk requires it

The purpose is not to make the agent “more complex.”
The purpose is to make it more:
- reliable
- maintainable
- explainable
- adaptable
- capable on multi-step tasks

---

## Core Rule

Do not treat all tasks as one-shot prompt/response problems.

Choose the right pattern for the task.

Patterns should be selected intentionally from a small toolkit:
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

## 1) Prompt Chaining
Use when the task has a natural sequence.

Example:
- gather inputs
- transform
- evaluate
- finalize

Good for:
- structured document generation
- analysis pipelines
- staged reasoning
- iterative refinement

---

## 2) Routing
Use when different task types need different handlers or specialists.

Good for:
- support triage
- tool selection
- choosing between styles of reasoning
- sending work to different sub-agents

---

## 3) Planning
Use when:
- the task is complex
- steps depend on one another
- the agent must avoid random action
- execution order matters

Rules:
- build a plan
- keep it editable
- update it when evidence changes

---

## 4) Reflection / Self-Correction
Use when:
- correctness matters
- the first pass is likely imperfect
- the task benefits from critique before final output

Rules:
- do not reflect endlessly
- reflect with purpose
- check against criteria, not vague self-doubt

---

## 5) Tool Use
Use when external information, execution, or state change is needed.

Rules:
- choose tools intentionally
- know why the tool is needed
- do not call tools performatively
- validate tool outputs when stakes are high

---

## 6) Memory Management
Use when work spans time, context, or recurring preferences.

Rules:
- preserve useful state
- avoid cluttering memory with junk
- distinguish stable facts from temporary working state
- retrieve before assuming

---

## 7) Multi-Agent Collaboration
Use only when decomposition creates real leverage.

Good for:
- parallel research
- specialist tasks
- large bounded subtasks
- explicit reviewer/executor splits

Avoid:
- multi-agent sprawl for simple tasks
- role duplication without benefit

---

## 8) Exception Handling and Recovery
Use when failure is plausible.

Rules:
- anticipate likely failure points
- define fallback behavior
- detect failure clearly
- retry only when retry is rational

---

## 9) Human-in-the-Loop
Use when:
- stakes are high
- judgment is sensitive
- policy/ethics/safety constraints matter
- action is irreversible
- user preference is essential

Rules:
- pause at the right point
- ask for approval only where it adds value
- avoid excessive human interruption

---

## 10) Guardrails
Use as the boundary system around the rest.

Guardrails include:
- scope control
- risk limits
- tool limits
- ETTO checks
- validation requirements
- escalation triggers
- refusal boundaries when needed

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

### 1) One-shot overuse
The agent treats every task as immediate answer generation.

Counter:
Use planning, routing, or reflection where the task actually requires them.

### 2) Pattern overload
The agent uses every pattern for every task.

Counter:
Use the smallest useful orchestration.

### 3) Reflection loops
The agent critiques itself forever.

Counter:
Set explicit evaluation criteria and stopping rules.

### 4) Multi-agent vanity
The agent spawns specialists for work one agent could do faster and more clearly.

Counter:
Use multi-agent only when decomposition clearly helps.

### 5) Memory pollution
The agent stores too much low-value state.

Counter:
Preserve only durable, useful information.

### 6) Tool theatrics
The agent calls tools to look sophisticated rather than because they improve outcomes.

Counter:
Every tool call should have a purpose.

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

## Prompt Snippets

### For general workflow
“Do not treat this as a one-shot prompt. Choose the appropriate agentic patterns, explain the workflow, then execute with planning, verification, and stopping rules.”

### For complex tasks
“Use planning, deliberate tool use, and reflection. Add multi-agent collaboration only if it clearly improves the result.”

### For reliability
“Build this as an agentic workflow with guardrails, exception handling, and human approval points where risk justifies them.”

### For orchestration design
“Select the minimum set of patterns needed to make the system robust, maintainable, and effective.”

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
