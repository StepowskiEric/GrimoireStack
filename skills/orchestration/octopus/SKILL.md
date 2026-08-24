---
name: octopus
description: "Coordinate parallel sub-agents with bounded concurrency — define shared contracts, delegate with auto-healing arms, retract on failure."
triggers:
  - 3-plus-parallel-workstreams
  - shared-contract-parallelism
  - wall-clock-speedup
  - local-subtask-autonomy
disable-model-invocation: true
---

# Octopus

**Contracts first, then parallel arms.** A central brain issues interface contracts; sub-agents (arms) execute with local autonomy in a shared workspace and return compressed summaries. On critical failure, the orchestrator **retracts**: halt downstream dependents, quarantine partial artifacts, write a failure report. Use for 3+ workstreams sharing a contract where parallel speedup beats coordination overhead — not for sequential chains (prompt chaining), tasks without sub-agent autonomy, or small tasks where overhead exceeds the speedup.

## The Move

### 1. Contract-driven decomposition
Break the request into atomic subtasks, and **define the shared contracts first** — schemas, types, API specs, or file paths multiple subtasks depend on. Subtasks cannot launch in parallel until their contracts exist (e.g., define `types/api.ts` before the API client and UI arms both import it). Per subtask, define: inputs, outputs (conforming to the contract), workspace footprint, success criteria, failure criteria, cleanup. Build the DAG: independent → parallel; chain (A feeds B) → sequential; contract-anchored (both import the same contract, no cross-output) → parallel after contract.

### 2. Set up the shared workspace & arms
Create the workspace: `_contracts/` (shared interfaces), `_status/` (per-arm state), `_artifacts/` (outputs), `_wip/` (quarantine), `README.md` (manifest). Register each arm with: context (project structure + contract locations), tools scoped to the workspace, local autonomy limits (max retries, fallback, self-terminate time), and the **compression mandate** — arms return structured JSON (status, artifacts, <50-word summary, errors, workspace writes), never raw logs. The main agent reads artifacts from the workspace when it needs detail.

### 3. Bounded parallel delegation
Emit all independent subtasks simultaneously (batch `delegate_task` with a `tasks` array). Concurrency budget: max 5 active arms — queue beyond that. If B depends on A, wait for A's artifacts in the workspace before launching B. Run waves: contract (single agent) → parallel independent arms → sequential chains → next parallel wave.

### 4. Local adaptability
Instruct arms to handle minor issues without escalation: read sibling outputs from `_artifacts/` and `_status/` instead of asking the main agent; **auto-heal once per failure type** with a diff report of what changed (diff reporting prevents auto-heal from masking real bugs); avoid collisions — each arm owns its structured files, appends or creates new files for shared ones, never destructively overwrites. Every arm maintains `_status/{arm}.json` with status, timestamp, blocked-by, and artifacts.

### 5. Retract, aggregate & verify
Collect compressed reports. On critical failure (output required by downstream arms): **halt dependents, quarantine partial artifacts to `_wip/`, seal wounds** (update status files, write `_failure_report.md` naming the failed arm, quarantined artifacts, halted arms, salvageability), and note what a regeneration would need. Resolve conflicts: latest timestamp wins (logged), true design tensions isolated for human review, semantically mergeable outputs merged after all arms report. Verify before declaring done: every expected artifact exists and validates against the contract, no failure went unhandled, `_wip/` empty or documented, README reflects final state, integration tests across arms pass.

## Reference
For a concrete end-to-end walkthrough and the known limitations (context isolation traps, compression-vs-debug trade-off, contract immutability, append-doesn't-work-for-structured-files, auto-heal masking), see [`references/concrete-example.md`](references/concrete-example.md) and [`references/limitations-gotchas.md`](references/limitations-gotchas.md).

## Rules
- **Do** define shared contracts before any parallel launch — that is the ordering that makes parallelism safe.
- **Do** cap concurrency at 5 active arms; queue the rest.
- **Do** require compressed JSON reports — raw logs defeat the pattern.
- **Do** retract on critical failure: halt, quarantine, report — never let failure propagate silently.
- **Do** skip the pattern when fewer than two arms would run in parallel — otherwise it is over-engineering.
