---
source: "jerry-skills"
name: trajectory-guard
description: Runtime meta-monitoring protocol that detects agent failure spirals — repetitive loops, specification drift, and stuck trajectories — and forcibly redirects strategy. Based on Wink (2602.17037) misbehavior taxonomy and PALADIN (2509.25238) recovery patterns.
category: execution
priority: high
tags: [meta-monitoring, failure-recovery, trajectory, agent-safety, self-correction]
version: 1.0
...



---

# Trajectory Guard — Detect and Recover from Failure Spirals

## Overview

Agents fail in predictable loops. They try approach A, it fails, they try A with a minor tweak, it fails again, and they repeat 5+ times without fundamentally changing strategy. Or they drift from the original task specification, adding features that weren't requested. Or they get stuck calling the same tool with the same failing arguments.

**Trajectory Guard** is a runtime meta-monitoring protocol that watches the agent's own execution arc — not individual steps — and detects when the trajectory has gone unproductive. It then forces a strategy change rather than allowing another retry of the same approach.

Research basis:
- **Wink** (Nanda et al., 2026, arXiv:2602.17037): 30% of production agent trajectories contain misbehaviors. Three categories: Specification Drift, Reasoning Problems, Tool Call Failures. Asynchronous intervention resolved 90% of single-intervention cases.
- **PALADIN** (Vuddanti et al., 2025, arXiv:2509.25238): Failure-case retrieval + recovery actions improved recovery rate from 23.75% to 89.86% over vanilla agents.
- **PARC** (2025, arXiv:2512.03549): Self-assessment from independent context detects stuck states in long-horizon tasks.

## When to use

- Any task expected to take more than 5 tool calls
- Tasks involving debugging, migration, or multi-file changes (high failure-spiral risk)
- When the agent notices it has attempted the same approach more than twice
- When the agent catches itself re-reading a file it already read
- When a test fails after a "fix" attempt

## When NOT to use

- Trivial single-step tasks (overhead exceeds benefit)
- Tasks where the approach is clearly working and making forward progress
- When token budget is critically low (the meta-monitoring itself costs tokens)

___


## The Three Failure Modes

Based on the Wink misbehavior taxonomy:

### 1. Repetition Loop
The agent retries the same action (or near-identical variants) without changing strategy.
**Signals:** Same tool called 3+ times with similar arguments, same error message repeating, same file being read again.

### 2. Specification Drift
The agent has diverged from what was actually requested — adding features, over-engineering, or solving a different problem than the one asked.
**Signals:** The agent is editing files not mentioned in the original request, adding abstractions or features beyond the ask, or the current task description no longer matches the user's actual words.

### 3. Approach Stagnation
The agent is making forward progress on the wrong thing, or has stalled on a sub-problem that isn't the core task.
**Signals:** More than 3 steps spent on a tangential issue, the agent is "cleaning up" or "improving" code instead of solving the stated problem, or the agent has started investigating a different bug than the one reported.

___


## Protocol

### Phase 1: Checkpoint — every 5 tool calls

After every 5th tool call (or at natural breakpoints), perform a **trajectory checkpoint**:

1. **Progress check:** What has changed since the last checkpoint? List concrete deltas (files changed, tests passing, errors resolved).
2. **Alignment check:** Does the current activity still match the user's original request? Quote the user's exact words and compare.
3. **Loop check:** Am I repeating an action I already tried? Scan the last 5 tool calls for repeated patterns.

### Phase 2: Detection — classify the failure

If any checkpoint reveals a problem, classify it:

| Signal | Classification |
|--------|---------------|
| Same tool+args 3+ times | Repetition Loop |
| Editing files not in original scope | Specification Drift |
| More than 3 steps on tangential issue | Approach Stagnation |
| Error message unchanged after 2 fix attempts | Repetition Loop |
| Added features/config not requested | Specification Drift |
| No concrete delta since last checkpoint | Approach Stagnation |

### Phase 3: Intervention — force strategy change

**The critical rule: do NOT retry the same approach.** Interventions must change strategy, not intensity.

**For Repetition Loop:**
1. STOP retrying the current approach
2. Identify what evidence you have that it *should* work (if none, the approach is wrong)
3. Switch to a fundamentally different method:
   - If editing code: try a test-first approach instead of edit-first
   - If searching: change search terms or search a different scope
   - If running commands: read the error output more carefully, check environment state
4. If 2 strategy changes have also failed: **escalate to user** with a clear summary of what was tried and what failed

**For Specification Drift:**
1. STOP current work immediately
2. Re-read the user's original request verbatim
3. List what was actually asked vs. what you're currently doing
4. Discard all work not directly traceable to the request
5. Resume from the last point that was aligned with the request

**For Approach Stagnation:**
1. Identify the core task (not the sub-problem you're stuck on)
2. Determine if the sub-problem is actually blocking, or if there's a way to bypass it
3. If blocking: try a completely different approach to the sub-problem
4. If not blocking: skip it, complete the core task, note the remaining issue

### Phase 4: Hard Stop — circuit breaker

If after 2 interventions the trajectory is still unproductive:

1. **Stop all work.** Do not make another tool call.
2. **Summarize** for the user:
   - What was attempted (list each distinct approach)
   - What the current state is (files changed, tests status)
   - What's blocking progress (the specific obstacle)
   - What you'd try next with more context (1-2 sentences)
3. **Ask the user** for guidance before continuing

___


## Integration with Other Skills

Trajectory Guard pairs well with:
- **context-budget-operator** — use budget awareness to decide if a trajectory checkpoint is affordable
- **assumption-grounding** — before strategy-changing interventions, verify assumptions first
- **explore-vs-exploit** — the "exploit" signal from explore-vs-exploit can trigger a trajectory checkpoint
- **debug-subagent** — for Repetition Loops during debugging, hand off to the debug subagent instead of retrying

## Anti-Patterns to Avoid

- **Don't checkpoint after every tool call** — it's expensive and breaks flow. Every 5 calls is the right cadence.
- **Don't count the checkpoint itself as progress** — meta-monitoring is overhead, not forward movement.
- **Don't use this to justify giving up early** — "approach stagnation" is not "this is taking longer than expected." It's "I'm not making measurable progress."
- **Don't skip the hard stop** — the circuit breaker exists because agents in failure spirals will convince themselves the next attempt will work. It won't.

## Concrete Examples

### Example 1: Repetition Loop
```
Tool call 1: edit file.py line 42 → test fails
Tool call 2: edit file.py line 42 (slightly different) → test fails
Tool call 3: edit file.py line 42 (another variant) → test fails
→ CHECKPOINT: Same tool, same target, same error. REPETITION LOOP.
→ INTERVENTION: Read the test output. Read the actual function signature. Check if the
  test is testing what I think it's testing. Try test-first approach.
```

### Example 2: Specification Drift
```
User asks: "Fix the login timeout bug"
Agent: fixes the timeout → adds retry logic → adds exponential backoff config → starts
  adding logging middleware → starts refactoring the auth module
→ CHECKPOINT: User asked to fix a timeout. I'm refactoring auth. SPECIFICATION DRIFT.
→ INTERVENTION: Revert to the timeout fix. Verify it works. Ship it. Stop.
```

### Example 3: Approach Stagnation
```
Agent: trying to fix a type error → finds the type is wrong because of a dependency →
  starts investigating the dependency → starts reading dependency source → starts
  checking dependency version compatibility
→ CHECKPOINT: Original task was a type error in MY code. I'm now reading dependency
  source. APPROACH STAGNATION.
→ INTERVENTION: Cast the type, add a type assertion, or use `as unknown as Target`.
  Fix MY code, don't fix the dependency.
```

## Research References

- Nanda et al. "Wink: Recovering from Misbehaviors in Coding Agents" (arXiv:2602.17037, 2026) — misbehavior taxonomy, 90% resolution on single-intervention cases across 10,000+ trajectories
- Vuddanti et al. "PALADIN: Self-Correcting Language Model Agents to Cure Tool-Failure Cases" (arXiv:2509.25238, 2025) — failure-case retrieval, 89.86% recovery rate vs 23.75% baseline
- "PARC: An Autonomous Self-Reflective Coding Agent for Robust Execution of Long-Horizon Tasks" (arXiv:2512.03549, 2025) — independent-context self-assessment for stuck detection
