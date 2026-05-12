---
name: octopus
description: Distributed multi-agent coordination pattern inspired by octopus biology — contract-driven decomposition, parallel delegation, shared workspace, inter-arm coordination, autotomy/regeneration on failure.
---

# Skill: Octopus — Distributed Multi-Agent Orchestration

## Purpose

Act as a main agent that coordinates a set of sub-agents to complete complex, multi-step tasks. Model your behavior after an octopus: the central brain issues high-level goals and contracts, while each arm (sub-agent) operates with local intelligence, adapts in real time, shares a workspace, and reports back compressed summaries.

This skill is for **task decomposition, parallel delegation, robust error handling, and context preservation** across multiple parallel workstreams.

## Biological Inspiration

| Biological Concept | Engineering Analog |
|---|---|
| **Distributed Cognition**: Two-thirds of an octopus's neurons are in its arms; they sense, decide, and act locally without micromanagement. | Sub-agents get full context and autonomy within their contract bounds. The main agent does not relay every decision. |
| **Neural Ring**: Arms communicate directly with each other, bypassing the central brain for fast, local coordination. | Sub-agents read from the Shared Workspace to learn what other arms did, without pinging the main agent. |
| **Shared Environment**: Arms operate in the same physical space, feeling what other arms are doing. | A designated workspace directory or memory object that all sub-agents can read/write. |
| **Autotomy & Regeneration**: If an arm is lost, the octopus retracts, seals the wound, and regrows the arm later. | Retraction protocol: quarantine partial artifacts, halt downstream dependents, and report the gap for later repair. |

## When to Use

Use this skill when:

- The task has 3+ independently executable workstreams that share a common interface or schema.
- You can identify a **shared contract** (types, API spec, file schemas) that multiple workstreams must agree on before diverging.
- Parallel execution would save significant wall-clock time versus sequential processing.
- The work benefits from local decision-making — each subtask has room for judgment calls, fallback logic, or adaptive behavior.

**Do not use** when:

- The task is linear and sequential with no parallelism (use prompt chaining instead).
- Sub-agents would have no meaningful autonomy (single-shot task).
- The coordination overhead (contract definition, workspace setup) exceeds the parallel speedup.
- You are working on a small task that a single agent could do faster and more clearly.

## Step 1 — Contract-Driven Decomposition

Examine the user's request. Break it into atomic subtasks.

**Before delegating**, establish the **Interface Contract(s)** — shared schemas, types, API specs, or file paths that multiple subtasks will depend on. Subtasks **cannot** be launched in parallel until their shared contracts are defined.

Each subtask must define:

| Field | Description |
|---|---|
| **Inputs** | What data it needs (referencing the shared contract). |
| **Outputs** | What it produces (must conform to the shared contract). |
| **Workspace Footprint** | Which files/state it will read/write. |
| **Success Criteria** | How to verify the subtask completed correctly. |
| **Failure Criteria** | What counts as a failure (test fails, schema mismatch, timeout). |
| **Cleanup** | What to do on failure (quarantine, retry, or report). |

**Example**: For a React + API task:
1. Define `types/api.ts` as the shared contract first.
2. S2 (API client) and S3 (UI) can then run in parallel, both importing from the guaranteed shared contract.

**Dependency analysis**: Build a DAG of subtasks. Identify:
- **Independent** subtasks (no cross-dependencies) → parallel
- **Chain** subtasks (A feeds B) → sequential
- **Contract-anchored** subtasks (both import the same contract but don't depend on each other's outputs) → parallel after contract is defined

## Step 2 — Sub-Agent Role Definition & Workspace Setup

Define sub-agents and spin up a **Shared Workspace** (a designated directory or memory object). The workspace acts as the physical environment the arms share.

### Workspace structure

```
workspace/
  _contracts/         # Shared interface definitions (created by Step 1)
  _status/            # Arm status files (each arm writes its state here)
  _artifacts/         # Output artifacts from each arm
  _wip/               # Quarantine zone for failed/incomplete work
  README.md           # Workspace manifest — maps contracts to consumers
```

### Sub-agent definition template

```yaml
sub_agent:
  name: arm-<function>
  context: |
    Project structure + Shared Contract locations.
    You operate in <workspace_path>.
  tools:
    - terminal (within workspace)
    - read_file / write_file (within workspace)
    - delegate_task (for nested work, if permitted)
  local_autonomy:
    max_retries: 2
    default_fallback: "Write a TODO.md in workspace and report failure"
    self_terminate_after: 300_000  # 5 min wall clock
  compression_mandate: true  # See below
```

### Compression Mandate

Sub-agents **must not** return raw logs. They return a structured JSON report:

```json
{
  "status": "success" | "fail" | "partial",
  "artifacts": ["path/to/output1", "path/to/output2"],
  "summary": "<50 word summary of what was done>",
  "errors": ["brief error description"],
  "workspace_writes": ["path/to/file_written"]
}
```

This keeps the main agent's context uncluttered. The main agent reads the artifacts directly from the workspace if it needs detail.

## Step 3 — Bounded Parallel Delegation

### Rules

1. **Emit all independent subtasks simultaneously** using delegate_task (batch mode) or terminal (background).
2. Enforce a **Concurrency Budget**: maximum 5 active arms at once to prevent resource exhaustion. If more arms are needed, queue the excess and wait for a slot.
3. If subtask B depends on output of A, **wait for A to write its artifacts to the Shared Workspace** before launching B. Poll the workspace or check the status file.
4. Use `delegate_task` with `tasks` array for true parallel dispatch. Each task gets its own isolated context and terminal session.

### Execution flow

```
Phase 1: Contract definition (single agent)
    ↓
Phase 2: Parallel wave — all subtasks that only depend on the contract
    ├── arm-A (independent)
    ├── arm-B (independent)
    └── arm-C (independent)
    ↓
Phase 3: Sequential/Dependent chain
    └── arm-D (depends on arm-A's artifacts in workspace)
Phase 4: Parallel wave — subtasks depending on Phase 3
    ├── arm-E
    └── arm-F
```

### Concurrency budget enforcement

```python
MAX_ARMS = 5
active_arms = set()

def dispatch(subtask):
    while len(active_arms) >= MAX_ARMS:
        completed = poll_for_completion(active_arms)
        active_arms -= completed
    active_arms.add(subtask.id)
    emit_subtask(subtask)
```

## Step 4 — Local Adaptability (Inter-Arm Coordination)

Instruct sub-agents to handle minor issues without escalation:

### Environment Sensing

> "If you need to know how another sub-agent implemented a function, read the Shared Workspace rather than asking the Main Agent."

Sub-agents check `workspace/_artifacts/` and `workspace/_status/` for sibling outputs. They write status updates so siblings can discover their state.

### Auto-Healing

> "If a test fails, attempt one automatic fix. If still failing, write a TODO.md in the workspace and report failure."

Healing attempts are limited to one per failure type to prevent infinite loops.

### Collision Avoidance

> "If you try to write to a file and find it already modified by another arm, append your changes or create a new file rather than overwriting."

Use a naming convention:
- `module_A.ts` (owned by arm-A)
- `module_B.ts` (owned by arm-B)
- `shared_module.ts` (append pattern: arm-A writes first section, arm-B appends)

For shared files, prefer append or create-a-new-file over destructive write. If absolute coordination is needed, the arm writes a `.lock` file (cooperative, not enforced).

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

## Step 5 — Retraction & Aggregation

Collect compressed sub-agent reports from all arms.

### On success

Produce a final summary:

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

If a **critical sub-agent fails** (an arm whose output is required by downstream arms):

1. **Halt downstream dependents**: Instruct sub-agents waiting on the failed arm's output to stop or enter a fallback state.
2. **Quarantine partial artifacts**: Move incomplete files to `workspace/_wip/` so the workspace isn't left in a broken state.
3. **Wound sealing**: Ensure all status files reflect the failure. Write a `workspace/_status/_failure_report.md` summarizing:
   - Which arm failed
   - Which artifacts were quarantined
   - Which downstream arms were halted
   - Whether the task is salvageable or requires human intervention
4. **Regeneration note**: Record what would be needed to "regrow" this arm (which inputs, what contract, what tests) for a future retry.

### Conflict resolution

When two arms produce conflicting modifications to the same logical target:

- **Timestamp rule**: Latest write wins. Log the conflict in `workspace/_conflicts/`.
- **Partition rule**: If the conflict indicates a true design tension, isolate both variants into separate files/branches and flag for human review.
- **Merge rule**: If the outputs are semantically mergeable (e.g., two sets of routes in the same router), the main agent performs the merge after all arms report.

## Prompt Snippets

### Decomposing a task

```markdown
I need to decompose [task] into contract → parallel arms → sequential chains.
Step 1: What shared contracts exist or need to be defined?
Step 2: Which subtasks can run in parallel after contracts are set?
Step 3: Which subtasks depend on each other?
```

### Instructing a sub-agent (arm)

```markdown
You are arm-<name>, an autonomous sub-agent in the Octopus framework.

**Your contract:**
- Inputs: [what you receive]
- Outputs: [what you produce]
- Workspace: [workspace path]

**Autonomy rules:**
- Max retries: 2
- Auto-heal: If a test fails, attempt one automatic fix before reporting failure.
- Collision: If a file is already modified by another arm, append or create a new file.
- Communication: Read the workspace to see what other arms have done. Do not ask the main agent for status updates.

**When done, return only:**
{"status": "success|fail|partial", "artifacts": [...], "summary": "<50 words>", "errors": [...]}
```

### Retraction

```markdown
arm-<name> has failed. Running Retraction Protocol:

1. Halt: [list downstream arms] — stop or enter fallback.
2. Quarantine: Moving [artifacts] to workspace/_wip/.
3. Seal: Writing failure report.
4. Regeneration: To retry, [what inputs and contracts are needed].
```

## Edge Cases & Pitfalls

| Pitfall | Mitigation |
|---|---|
| Sub-agent returns success but artifacts are missing | Validate artifacts exist in workspace before declaring subtask done. Cross-check artifact list against file system. |
| Sub-agent consumes excessive resources | Enforce `self_terminate_after` timeout. Kill long-running processes and treat as failure. |
| Two arms write to the same file simultaneously | Use the collision-avoidance naming convention. Also, prefer write-once-per-arm patterns. |
| Shared contract changes mid-execution | Contracts are **immutable once set** in Step 1. If a change is unavoidable, the main agent must halt all arms, redefine the contract, and relaunch. |
| Sub-agent hallucinates outputs that don't match the contract | Validate outputs against the contract schema after each arm reports. Reject non-conforming artifacts. |
| Too many arms (concurrency overload) | Hard limit of 5. Queue remaining with status=waiting. |

## Verification

Before declaring the task complete:

1. Check that all expected artifacts exist in the workspace.
2. Validate each artifact against the shared contract.
3. Confirm no arm reported a failure that went unhandled.
4. Check `workspace/_wip/` for quarantined files.
5. Ensure the workspace README.md is updated to reflect final state.
6. Run any integration tests that span multiple arms' outputs.

## Definition of Done

The octopus pattern is correctly applied when:
- Shared contracts were defined before parallel execution.
- At least two arms ran in parallel (otherwise this was over-engineered: a chaining pattern would have sufficed).
- Each arm returned a compressed JSON report (<50 words).
- Failures triggered retraction (halt + quarantine + report), not silent propagation.
- The final summary shows what was completed, conflicted, and failed.
