# Octopus Pattern: Limitations & Gotchas

## When This Pattern Fails

### 1. Sub-agent context isolation defeats shared workspace

`delegate_task` gives each sub-agent its own context. They **cannot** natively read each other's files unless the workspace is on a shared filesystem. On Hermes, sub-agents spawned via `delegate_task` run in isolated container environments — they share no filesystem.

**Workaround**: The main agent must relay workspace reads/writes. Instead of arms reading the workspace directly, the main agent polls artifacts and passes summaries. This sacrifices the "neural ring" property but preserves correctness.

**True parallel with shared fs**: Use `terminal(background=true)` + notify, or a single script that spawns child processes in the same filesystem.

### 2. Compression mandate vs. debugging

Sub-agents returning <50 word summaries is great for context budgets but terrible when something goes wrong and you need to understand why.

**Workaround**: If a sub-agent reports `"status": "fail"`, re-delegate with a debugging goal before running retraction. Ask for the raw logs. Don't try to infer root cause from 50 words.

### 3. Contract immutability is fragile

The rule "contracts are immutable once set" means the first pass at the contract must be right. If a contract flaw is discovered mid-execution, you either:
- (a) Halt everything, fix, relaunch — expensive.
- (b) Let arms diverge and reconcile later — risky.

**Recommendation**: Invest in contract review before launching any arms. Run a lightweight validation (typecheck the contract file) before proceeding to Step 3.

### 4. The 5-arm concurrency limit is arbitrary

The number depends on your environment's resources. If sub-agents are I/O-bound (network calls, API requests), you can raise it. If they're CPU-bound (compilation, bundling), lower it.

**Adjust per task**: State your concurrency budget explicitly in the workspace README.

### 5. Auto-healing can mask real bugs

"Attempt one automatic fix" is risky. A sub-agent that "fixes" a test failure by deleting the test or by changing the assertion to match the wrong output is making things worse.

**Mitigation**: Require sub-agents to report *what* they changed during auto-healing. The main agent reviews the diff before accepting the fix.

### 6. Append-only collision avoidance doesn't work for structured files

Appending to a TypeScript file or JSON config will produce invalid syntax. The "append or create new file" rule works for:
- Markdown documentation
- Log files
- CSV files
- Text-based configs with include mechanisms

It does **not** work for:
- TypeScript/JavaScript source files
- JSON/YAML configs
- Python modules
- SQL schemas

**For structured files**: Each arm owns its own file. No two arms write to the same source file. If they must, the main agent merges post-execution.

## Summary

| Gotcha | Severity | Mitigation |
|---|---|---|
| Sub-agents can't share filesystem | High | Use terminal(background) or relay via main agent |
| Compression hides failure detail | Medium | Re-delegate with debug goal on failure |
| Immutable contracts create rework cost | Medium | Validate contract before launching arms |
| Concurrency budget is environment-dependent | Low | Tune per task |
| Auto-healing can mask bugs | Medium | Require diff reporting |
| Append doesn't work for structured files | High | Own-file-per-arm + main-agent merge |
