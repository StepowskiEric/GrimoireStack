---
source: "jerry-skills"
name: plan-with-judge
description: Create an implementation plan in JSONL format, then iteratively improve it using a stronger user-specified model as a judge until the plan is approved.
category: execution
priority: high
tags: [planning, quality-assurance, iterative-improvement, plan-review, jsonl]
version: 1.0
---

# Plan with Judge

Create a step-by-step JSONL implementation plan and iteratively refine it using a stronger model ("the judge") until approved.

## When to Use This Skill

- A task is complex enough that you need a structured plan before coding
- You want quality assurance from a stronger model before executing
- The plan needs to be reviewable and iteratively improved
- You're working on something with clear dependencies between steps

## Required Capabilities

- File read/write (to create and edit `plan.jsonl`)
- Ability to ask the user for input (judge model name, task description)
- Ability to call an external LLM (via API, CLI, or fallback)

## Workflow (Strictly Follow)

### Step 1: Understand the Task

Ask the user: *"What do you want to implement?"*
Store the answer as `$TASK_DESCRIPTION`.

### Step 2: Create Initial Plan (JSONL)

Write to `plan.jsonl` in the current working directory. Each line is one actionable step:

| Field        | Type         | Description                                    |
|-------------|-------------|------------------------------------------------|
| `id`         | integer      | Sequential, starting at 1                      |
| `description`| string      | Clear, testable step description               |
| `dependencies`| list[int]  | IDs of steps that must complete before this one |
| `status`     | string       | Always `"pending"` in the initial plan         |

Example:
```jsonl
{"id": 1, "description": "Set up project structure and install dependencies", "dependencies": [], "status": "pending"}
{"id": 2, "description": "Implement core utility functions", "dependencies": [1], "status": "pending"}
```

### Step 3: Ask for Judge Model

Ask the user: *"Which stronger model should act as the judge? (e.g., gpt-4.5, claude-3.7-sonnet, gemini-2.0-pro, deepseek-v3)"*
Store answer as `$JUDGE_MODEL`.

### Step 4: Judge Loop (max 5 iterations)

Repeat until APPROVED or max iterations reached:

#### 4.1 Read Current Plan

Read `plan.jsonl` from disk.

#### 4.2 Call the Judge Model

Use your agent's ability to call an external LLM. The prompt template:

```
You are a strict implementation judge. Review this JSONL plan for a software task.

TASK: {user's original task description}

PLAN:
{entire content of plan.jsonl}

Reply with EXACTLY ONE of:

APPROVED
- Use only if the plan is clear, correct, complete, feasible, and has no logical errors or missing steps.

CORRECTIONS:
- Then list specific, actionable changes. You may suggest adding, removing, reordering, splitting, or merging steps. Reference step IDs.
- Each correction must be precise and implementable by an editor.

Do not output anything else.
```

**Judge call methods (pick the best one for your environment):**

| Environment | How to call the judge |
|---|---|
| Hermes Agent | `delegate_task` with a prompt asking the subagent to call the model, or `execute_code` with `from hermes_tools import terminal` to run a CLI model call |
| Claude / GPT API | `curl -X POST https://api.openai.com/v1/chat/completions -H "Authorization: Bearer $KEY" -d '{...}'` |
| Local LLM (Ollama) | `ollama run $JUDGE_MODEL` or `curl http://localhost:11434/api/generate` |
| Generic CLI (`llm` tool) | `llm -m $JUDGE_MODEL -p "prompt"` |
| No API access | Ask user: *"Please paste the judge model's response:"* (fallback) |

#### 4.3 Parse the Response

- If response contains **APPROVED** (case-insensitive) → break loop, go to Step 5.
- If response contains **CORRECTIONS:** → extract corrections and apply them:
  - Use file editing tools (patch, write_file) to modify `plan.jsonl`
  - Respect dependencies: ensure no cycles
  - Re-number IDs if needed (make them sequential from 1)
  - Go back to 4.1

#### 4.4 Max Iterations

If 5 iterations reached without approval → inform the user:

> *"Judge did not approve after 5 attempts. Last corrections: {last judge response}"*

Ask if they want to manually approve or continue.

### Step 5: Final Output

Print a summary:

- *"Plan approved by {$JUDGE_MODEL} after {N} iterations."*
- Show the final plan in a readable table or list.
- *"You can now execute this plan step by step using plan.jsonl."*

## Important Rules

- **Never change the user's original goal** – the judge only improves feasibility and clarity.
- Each step must be **atomic** (can be implemented and tested independently).
- Dependencies must form a **directed acyclic graph** (no cycles).
- The judge is always considered **stronger** – do not ignore its corrections unless they contradict the original task.
- If the judge model call fails (API error, timeout), **retry once**, then ask user for manual override.

## Pitfalls

- **Cycle creation**: When adding or reordering dependencies, always validate there are no cycles. Use a simple topological sort check.
- **Too-broad steps**: If the judge doesn't split a step that should be split, do it yourself when creating the initial plan. Overly broad steps are the #1 reason judges reject plans.
- **Status field**: Remember to set every initial step's status to `"pending"`. When executing later, update to `"in_progress"` / `"completed"`.
- **JSONL strictness**: Each line must be valid JSON. No trailing commas. Use `write_file` to write the whole file at once rather than appending line by line.
- **Judge model unavailability**: If the judge model isn't installed or the API key is missing, fall back to asking the user to paste the judge's response manually.

## Usage Example

```
User: "Implement a JWT authentication system with refresh tokens in FastAPI"

Agent (running this skill):

1. Creates initial plan.jsonl (8 steps).
2. Asks: "Which stronger model should act as judge?"
3. User: "claude-3.7-sonnet"
4. Agent calls judge → judge says "CORRECTIONS: Merge step 3 and 4; add step for token blacklisting"
5. Agent edits plan → calls judge again → judge says "APPROVED"
6. Agent outputs final plan.
```
