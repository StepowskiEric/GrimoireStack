---
name: "subagent-composer"
description: "Use when delegating work to a sub-agent. Automatically loads the right skills into the sub-agent based on the task type — including TDD for code tasks, plus whatever else the task demands (debugging, security, API design, architecture, etc.)."
---

# Skill: Sub-Agent Composer — Skill-Composed Delegation

## Purpose

Use this skill when delegating work to a sub-agent. Instead of sending a raw task, compose a brief that loads the **TDD skill** plus other **task-relevant skills** into the sub-agent.

The rule: **every sub-agent gets the skills it needs — TDD for code tasks, plus whatever the task demands.**

This prevents the common failure mode where a sub-agent:
- Writes implementation without tests (then has no way to verify correctness)
- Lacks domain-specific reasoning skills (debugging, security, API design)
- Produces output that doesn't pass review because it missed an entire category of concerns

---

## Core Rule

**Match skills to the task. TDD is the default for any code-producing task.**

No sub-agent doing code work should be dispatched without the TDD skill. For non-code tasks (research, planning, analysis, decisions), load the skills that match the reasoning domain.

---

## How It Works

1. Identify the task type (code or non-code).
2. Consult the task-to-skill mapping below.
3. Compose the sub-agent invocation: `skill: ["tdd" (if code), ...otherSkills]`.
4. Include a brief note in the task explaining which skills are loaded and why.

---

## Task-to-Skill Mapping

| Task Type | Always | Also Include |
|-----------|--------|-------------|
| **Fix a bug** | `tdd` | `root-cause-analysis`, `diagnose`, `systematic-debugging` |
| **Implement a feature** (new code) | `tdd` | `api-design-backward-compatibility` (if API), `security-threat-modeling` (if auth/data/storage), `domain-driven-design` (if complex domain logic) |
| **Refactor code** | `tdd` | `refactoring-state-machine`, `working-effectively-with-legacy-code`, `philosophy-of-software-design` |
| **Design architecture** | `tdd` | `domain-driven-design`, `thinking-in-systems`, `designing-data-intensive-applications` |
| **Code review** | `tdd` | `code-review-excellence`, `super-review-typescript`, `security-threat-modeling`, `llm-pre-push-review` |
| **Performance optimization** | `tdd` | `the-goal-theory-of-constraints`, `python-performance-optimization` (if Python) |
| **Security audit / hardening** | `tdd` | `security-threat-modeling`, `vibe-coding-security-hardening`, `unsafe-control-actions-hazard-analysis` |
| **Write documentation** | — | `documentation-craft`, `feynman-technique`, `mece-pyramid-principle` |
| **Plan / estimate** | — | `pre-mortem`, `second-order-thinking`, `reference-class-forecasting`, `inversion-mental-model` |
| **Research / explore** | — | `research`, `verify-before-integrate`, `first-principles` |
| **Data modeling / schema** | `tdd` | `domain-driven-design`, `api-design-backward-compatibility`, `designing-data-intensive-applications` |
| **Decision / proposal** | — | `steelmanning`, `advocatus-diaboli`, `second-order-thinking`, `pre-mortem` |
| **Debug a test failure** | `tdd` | `purify-test-output`, `simulate-instrumentation`, `bisect-debugging` |

**When in doubt**: add one more skill than you think is needed. The cost of an extra loaded skill is negligible. The cost of a sub-agent missing a critical reasoning framework is a full rewrite cycle.

---

## Sub-Agent Invocation Template

```python
subagent({
    agent: "<agent-name>",
    skill: ["tdd", "<skill-2>", "<skill-3>"],
    context: "fork",  # prevents shared anchoring with your reasoning
    task: f"""Your task is: <task description>

You have been loaded with the following skills:
- tdd — write tests first, then implement
- <skill-2> — <why this is relevant>
- <skill-3> — <why this is relevant>

Follow the guidance in these skills. Start with tests."""
})
```

---

## Examples

### Fixing a Bug

```
Task: "The login endpoint returns 500 when the user's email contains a plus sign."

Skills loaded: tdd, root-cause-analysis, diagnose

Brief includes: "Write a failing test that reproduces the bug first (tdd).
Use root-cause-analysis to trace the actual cause, not the symptom.
Use diagnose for the structured reproduction → minimise → hypothesise loop."
```

### Implementing a Feature

```
Task: "Add a team invitation endpoint that accepts an email and team ID,
creates a pending membership, and sends a notification."

Skills loaded: tdd, api-design-backward-compatibility, security-threat-modeling

Brief includes: "Write tests for the happy path and edge cases first (tdd).
Use api-design-backward-compatibility for the endpoint contract design.
Use security-threat-modeling to verify authorization and input validation."
```

### Refactoring

```
Task: "Extract the payment processing logic from the order controller into
a dedicated PaymentService class."

Skills loaded: tdd, refactoring-state-machine, philosophy-of-software-design

Brief includes: "Write characterization tests first to capture current behavior (tdd).
Use refactoring-state-machine to follow the bounded transform pattern.
Use philosophy-of-software-design to ensure the new module is deep, not shallow."
```

---

## Agent Rules

### Do
- always include `tdd` for any code-producing task
- match skills to the task's primary risk areas
- tell the sub-agent *why* each skill was loaded ("use X for Y")
- use `context: "fork"` to keep the sub-agent's reasoning independent

### Do Not
- dispatch a sub-agent without considering what skills it needs
- load skills that are irrelevant to the task (wastes context and confuses)
- skip TDD because "this is just a small change" (small changes cause big bugs)
- assume a sub-agent will naturally use TDD without being told to

---

## Pairing Guide

- **TDD** — the core `tdd` skill is always loaded for code tasks; this skill layers other skills on top
- **Dispatching Parallel Agents** — use when the task can be split across multiple sub-agents, each with their own skill composition
- **Sub-Agent Driven Development** — for multi-step plans, compose each sub-agent's skills independently per step
- **Advocatus Diaboli** — use subagent-composer to load the Diaboli with adversarial system prompt and relevant reasoning skills

---

## Definition of Done

Sub-agent composer was applied correctly when:

- [ ] The task type was identified and the skill mapping was consulted
- [ ] `tdd` was included for any code-producing task
- [ ] Task-relevant additional skills were loaded (not just defaults — actually matched to the task)
- [ ] The sub-agent was told which skills were loaded and why
- [ ] For code tasks: the output is test-first and addresses the concerns each loaded skill covers
- [ ] For non-code tasks: the output reflects the reasoning frameworks loaded
