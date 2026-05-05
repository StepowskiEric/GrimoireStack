---
source: "jerry-skills"
name: intent-specification-protocol
category: judgment-and-routing
description: Crystallize vague user requests into precise, testable intent specifications. Replace vague words (fast, good, optimized) with measurable criteria. Now includes MCP server + companion script.
---

# Intent Specification Protocol

## Objective

Transform vague, ambiguous user requests into **precise, testable intent specifications** before doing any work. This prevents scope creep, unmet expectations, and wasted effort.

## When to Use

- User gives a vague request ("build me a fast API", "make it better")
- Multiple interpretations are possible
- Success criteria are unclear
- You're about to start a multi-step task

## Core Concept

Vague words → **Measurable criteria**

| Vague Word | Measurable Replacement |
|---|---|
| "fast" | "responds in < 200ms p95" |
| "good" | "passes 10/10 test cases" |
| "optimized" | "CPU usage < 30% under load" |
| "scalable" | "handles 1000 concurrent requests" |

## Workflow (Strictly Follow)

### 1. Capture Original Request

Store the user's exact words. Don't rephrase yet.

### 2. Extract Components

Break the request into:
- **What** — action + target (build, fix, analyze + what object)
- **Constraints** — explicit limits (time, tools, budget)
- **Success criteria** — how to verify it's done
- **Edge cases** — what could go wrong

### 3. Replace Vague Words

Scan for: fast, good, nice, better, optimized, efficient, robust, scalable.

For each, ask: **"How would I measure this?"** Write the metric.

### 4. Generate Specification

Output a structured spec:

```
## Crystallized Intent Specification

**Original request:** "Build a fast API"

### What
Action: build
Target: API

### Constraints
- Within 2 hours
- Using FastAPI

### Success Criteria
- [ ] Responds in < 200ms p95
- [ ] Handles 100 req/s
- [ ] Test coverage > 80%

### Edge Cases to Handle
- Invalid input
- Database timeout
```

### 5. Confirm with User

Ask: "Is this what you meant?" Let them adjust before starting work.

## MCP Server

`scripts/intent_mcp_server.py` — run as MCP server for real-time intent crystallization:

- **Tool: `crystallize_intent`** — transform vague request into JSON intent
- **Tool: `generate_spec`** — convert intent JSON to human-readable spec
- **Tool: `check_vague_words`** — scan text for vague language

**Run it:** `python scripts/intent_mcp_server.py` (stdio JSON-RPC)

## Companion Script

`scripts/intent-specification-protocol.py` — pure stdlib Python:

- `crystallize <request>` — crystallize a vague request, save to `intent_spec.json`
- `spec` — generate human-readable spec from saved intent
- `check` — scan text/file for vague words
- `init` — create empty intent spec file

## Usage Example

```
User: "Build me a fast API that handles users"

Agent (using this skill):
1. Crystallize:
   Original: "Build me a fast API that handles users"
   Action: build
   Target: API
   Vague: "fast"

2. Replace vague:
   "fast" → "responds in < 200ms p95"

3. Generate spec:
   ## Crystallized Intent Specification
   ...
   ### Success Criteria
   - [ ] Responds in < 200ms p95
   - [ ] Handles 1000 concurrent users
   ...

4. Confirm: "Is this what you meant?"

User: "Yeah, but also add auth"

Agent: Updates spec, confirms again.
```

## Integration with Other Skills

- **plan-with-judge:** Feed the crystallized spec as `$TASK_DESCRIPTION` — the judge reviews against this precise spec
- **requirement-crystallization-protocol:** This skill is the first step; requirement-crystallization adds measurable requirements
- **api-surface-anchoring:** The spec lists APIs needed; verify them before coding

## Pitfalls

- **Over-crystallizing:** Don't ask "what does 'the' mean?" Keep it practical.
- **Ignoring user confirmation:** Always confirm the spec before starting work.
- **Vague criteria:** "Make it work" is not a success criterion. "Returns 200 on valid input" is.

## Rule of Thumb

If you can't measure it, you can't verify it. Crystallize first, build second.
