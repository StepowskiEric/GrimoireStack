# Context Budget Operator — Script, Techniques & Research

## Companion script

```bash
# Estimate token cost of files
python scripts/context_budget.py --files src/main.py src/utils.py

# Check if content fits budget
python scripts/context_budget.py --file large_output.txt --budget 4000

# Track session usage
python scripts/context_budget.py --log "read_file:main.py:1200" --budget 16000
python scripts/context_budget.py --log "grep:utils:50" --budget 16000
python scripts/context_budget.py --report

# Suggest compression for oversized content
python scripts/context_budget.py --file huge_log.txt --suggest --budget 4000
```

The script is optional — the skill works with manual estimation.

## Compression techniques by content type

| Content | Technique |
|---------|-----------|
| Long reasoning chain | keep final conclusion + key decision points only |
| Full file content | extract signatures + relevant section only |
| Test output | purify to failure-relevant lines only |
| Error logs | keep first and last 5 lines + exception message |
| Multi-turn chat | summarize each turn to 1–2 sentences |
| Stack traces | keep user frames only |

## Worked example

**Scenario:** refactor a 2000-line monolith across 15 files.

Without budget management: read monolith (+3000), read 5 dependencies (+4000), overflow at turn 8, agent forgets constraints, contradicts itself at turn 12.

With budget management:
```
[Turn 1] ASSESS: 0/16000. GREEN.
[Turn 2] CLASSIFY: signatures of 15 files, not full contents.
[Turn 3] Read 15 files at signature level → +800
[Turn 4] Identify 3 key files for full read.
[Turn 5] Read 3 files fully → +1500
[Turn 6] ASSESS: 2800/16000. GREEN. Proceed.
[Turn 8] ASSESS: 8200/16000. YELLOW. Compress old reasoning.
[Turn 9] Summarize turns 1-6 into 200 tokens. Net save: 600.
[Turn 12] Refactor complete. Peak usage: 9400. No overflow.
```

## Research basis

- **ContextBudget** (arXiv:2604.01664) — budget-aware context compression for long-horizon agents, framed as sequential decision-making
- **BATS** (Liu et al., 2025) — budget-aware tool-use scaling; simply informing agents of remaining budget pushes the cost-performance Pareto frontier
- **Externalization in LLM Agents** (arXiv:2604.08224) — at saturation, reliability depends on relocating cognitive burden to external memory, tool registries, protocol definitions

## Failure modes

- **Optimistic estimation** — underestimating code token density; symbols and indentation add up
- **Compression resistance** — refusing to summarize your own reasoning because "it's all important"
- **Threshold panic** — compressing at 30% from anxiety; compression has overhead
- **Instruction dropout** — compressing the user's original constraints; never drop the task definition or success criteria
- **Log neglect** — tracking budget but not acting on yellow/red status
