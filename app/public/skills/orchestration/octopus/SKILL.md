---
name: octopus
description: Coordinate parallel sub-agents with bounded concurrency — define shared contracts, delegate with auto-healing arms, retract on failure. Use when 3+ workstreams share a contract and parallel speedup beats coordination overhead.
triggers:
  - 3+ independent workstreams that share a contract
  - Substantial wall-clock savings from parallelism
  - Subtasks have room for local judgment
---

# Octopus

Orchestrate parallel sub-agents with bounded concurrency. A central brain issues contracts; sub-agents (arms) execute with local autonomy, share a workspace, and report compressed summaries. On critical failure, the orchestrator **retracts**: halts downstream dependents, quarantines partial artifacts, writes a failure report.

Use prompt chaining for linear/sequential tasks, single-agent execution when sub-agents have no meaningful autonomy, and a single agent for small tasks where coordination overhead exceeds parallel speedup.

## Step 1 — Contract-Driven Decomposition

Examine the request. Break it into atomic subtasks.

**Before** delegating, define the **Interface Contracts** — shared schemas, types, API specs, or file paths multiple subtasks will depend on. Subtasks **cannot** launch in parallel until their shared contracts are defined.

Each subtask defines:

| Field | Description |
|---|---|
| **Inputs** | What data it needs (referencing the shared contract) |
| **Outputs** | What it produces (must conform to the shared contract) |
| **Workspace Footprint** | Which files/state it reads and writes |
| **Success Criteria** | How to verify the subtask completed correctly |
| **Failure Criteria** | What counts as a failure (test fails, schema mismatch, timeout) |
| **Cleanup** | Quarantine, retry, or report on failure |

**Example**: For a React + API task:
1. Define `types/api.ts` as the shared contract first
2. S2 (API client) and S3 (UI) can then run in parallel, both importing from the guaranteed shared contract

**Dependency analysis** — build a DAG of subtasks:
- **Independent** → parallel
- **Chain** (A feeds B) → sequential
- **Contract-anchored** (both import same contract, no cross-output dependency) → parallel after contract

**Done when** every subtask has all six fields filled, and the DAG distinguishes independent vs chain vs contract-anchored.

## Step 2 — Sub-Agent Definition & Workspace Setup

Spin up a **Shared Workspace** (designated directory or memory object). Sub-agents operate in this shared environment.

```
workspace/
  _contracts/         # Shared interface definitions (created in Step 1)
  _status/            # Each arm writes its state here
  _artifacts/         # Output artifacts from each arm
  _wip/               # Quarantine zone for failed/incomplete work
  README.md           # Workspace manifest — contracts to consumers
```

### Sub-agent template

```yaml
sub_agent:
  name: arm-<function>
  context: |
    Project structure + Shared Contract locations.
    You operate in <workspace_path>.
  tools:
    - terminal (within workspace)
    - read_file / write_file (within workspace)
  local_autonomy:
    max_retries: 2
    default_fallback: "Write a TODO.md in workspace and report failure"
    self_terminate_after: 300_000  # 5 min wall clock
  compression_mandate: true  # See below
```

### Compression Mandate

Sub-agents return structured JSON, not raw logs:

```json
{
  "status": "success" | "fail" | "partial",
  "artifacts": ["path/to/output1"],
  "summary": "<50 word summary>",
  "errors": ["brief error description"],
  "workspace_writes": ["path/to/file_written"]
}
```

The main agent reads the artifacts directly from the workspace when it needs detail.

**Done when** workspace exists with the directory structure above, every sub-agent is registered with its template, and the compression mandate is documented in `workspace/README.md`.

## Step 3 — Bounded Parallel Delegation

### Rules

1. **Emit all independent subtasks simultaneously** via `delegate_task` (batch mode) or `terminal` (background).
2. **Concurrency budget**: max 5 active arms. If more are needed, queue and wait for a slot.
3. **If B depends on A**: wait for A to write artifacts to the Shared Workspace before launching B. Poll or check status file.
4. **Use `delegate_task` with `tasks` array** for true parallel dispatch — each task gets isolated context and terminal.

### Execution flow

```
Phase 1: Contract definition (single agent)
    ↓
Phase 2: Parallel wave — subtasks depending only on the contract
    ├── arm-A (independent)
    ├── arm-B (independent)
    └── arm-C (independent)
    ↓
Phase 3: Sequential / dependent chain
    └── arm-D (depends on arm-A's artifacts)
Phase 4: Parallel wave — subtasks depending on Phase 3
    ├── arm-E
    └── arm-F
```

**Done when** every wave has either completed (subtasks in `_status/*.json` show `done` or `failed`) or been explicitly queued for a later wave.

## Step 4 — Local Adaptability (Inter-Arm Coordination)

Instruct sub-agents to handle minor issues without escalation:

### Environment Sensing

> "If you need to know how another sub-agent implemented a function, read the Shared Workspace rather than asking the Main Agent."

Sub-agents check `workspace/_artifacts/` and `workspace/_status/` for sibling outputs.

### Auto-Healing (with diff reporting)

> "If a test fails, attempt one automatic fix and report *what* you changed. If still failing, write a TODO.md in the workspace and report failure."

Healing is limited to one per failure type. The diff-report requirement prevents auto-heal from masking real bugs.

### Collision Avoidance

> "If you try to write to a file and find it already modified, append your changes or create a new file rather than overwriting."

Use a naming convention: `module_A.ts` (owned by arm-A), `module_B.ts` (owned by arm-B). For shared files, prefer append or create-a-new-file over destructive write. Append doesn't work for structured files (TypeScript, JSON, SQL schemas) — each arm owns its own structured file.

### Status signaling

Each arm maintains `workspace/_status/{arm_name}.json`:

```json
{
  "status": "running" | "done" | "failed" | "blocked",
  "last_updated": "ISO8601",
  "blocked_by": ["arm-D"],
  "artifacts_produced": []
}
```

**Done when** every active arm's status file is current and reachable, and any cross-arm coordination needs have been resolved via workspace reads (no escalation to main agent).

## Step 5 — Retraction & Aggregation

Collect compressed sub-agent reports from all arms.

### On success

```
✅ Completed:
  - path/to/file1
  - path/to/file2

⚠️ Conflicts:
  - module.ts (latest timestamp wins — see workspace/_conflicts/)

❌ Failed:
  - arm-D: [summary] — artifacts moved to workspace/_wip/
```

### Retraction Protocol (on critical sub-agent failure)

A **critical** sub-agent is one whose output is required by downstream arms. When it fails:

1. **Halt downstream dependents** — instruct sub-agents waiting on the failed arm to stop or fall back
2. **Quarantine partial artifacts** — move incomplete files to `workspace/_wip/` so the workspace isn't left in a broken state
3. **Wound sealing** — update all status files to reflect the failure. Write `workspace/_status/_failure_report.md` with: which arm failed, which artifacts were quarantined, which downstream arms were halted, whether the task is salvageable
4. **Regeneration note** — record what would be needed to regrow this arm (inputs, contract, tests) for a future retry

### Conflict resolution

When two arms produce conflicting modifications to the same logical target:

- **Timestamp rule** — latest write wins; log in `workspace/_conflicts/`
- **Partition rule** — if the conflict is a true design tension, isolate both variants and flag for human review
- **Merge rule** — if outputs are semantically mergeable (e.g., two sets of routes), the main agent merges after all arms report

**Done when** the final summary shows what was completed, conflicted, and failed, with quarantined files in `_wip/` and any failure report in `_status/_failure_report.md`.

## Verification

Before declaring the task complete:

1. Every expected artifact exists in the workspace
2. Each artifact validates against the shared contract
3. No arm reported a failure that went unhandled
4. `workspace/_wip/` is empty (or its contents are documented)
5. `workspace/README.md` reflects final state
6. Integration tests spanning multiple arms' outputs pass

## Definition of Done

The octopus pattern is correctly applied when:
- Shared contracts were defined before parallel execution
- At least two arms ran in parallel (otherwise this was over-engineered)
- Each arm returned a compressed JSON report (<50 words)
- Failures triggered retraction (halt + quarantine + report), not silent propagation
- The final summary shows what was completed, conflicted, and failed

## References

For concrete worked examples and known limitations of this pattern:

- [`references/concrete-example.md`](references/concrete-example.md) — feature-flag dashboard end-to-end walkthrough
- [`references/limitations-gotchas.md`](references/limitations-gotchas.md) — context isolation traps, compression-vs-debug trade-off, contract immutability, append-doesn't-work-for-structured-files, auto-heal-masking-bugs
