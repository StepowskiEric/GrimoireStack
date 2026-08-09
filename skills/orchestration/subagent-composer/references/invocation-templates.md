# Sub-Agent Invocation Templates

## Minimal Template

For simple, low-risk, well-understood tasks (~100 words).

```python
subagent({
    agent: "<agent-name>",
    skill: ["tdd", "subagent-laws"],
    context: "fork",
    task: f"""## Goal
<one sentence>

## Skills Loaded
- tdd — write tests first
- subagent-laws — scope discipline

## Your Task
1. <step 1>
2. <step 2>
3. <step 3>

## Success Criteria
- [ ] <criterion 1>
- [ ] <criterion 2>

## Output Format
<one line describing what to produce>

## Stop Rules
Stop after success criteria met. No extra work.""",
    outputMode: "inline"
})
```

## Standard Template

For typical code work (~300-500 words).

```python
subagent({
    agent: "<agent-name>",
    skill: ["tdd", "subagent-laws", "<task-skill-1>", "<task-skill-2>"],
    context: "fork",   # use "fresh" for independent reasoning
    reads: ["<path-to-relevant-file>"],
    task: f"""## Goal
<one sentence>

## Skills Loaded
- tdd — write tests first, then implement
- <task-skill-1> — why it's relevant
- <task-skill-2> — why it's relevant

## Persona
<who the sub-agent should be>

## Why This Matters
<stakes and consequences>

## Context You Need
<files, data, constraints, patterns>

## Your Task
<step-by-step instructions>

## Success Criteria
<measurable checks>

## Rules to Follow
<non-negotiable constraints>

## Boundaries
<explicit exclusions — what NOT to do>

## Output Format
<what to produce>

## Stop Rules
<when to stop>"""
})
```

## Full Template (Comprehensive)

For complex, high-risk, or unfamiliar tasks (~500-1000 words + `reads`).

```python
subagent({
    agent: "<agent-name>",
    skill: ["tdd", "subagent-laws", "<task-skill-1>", "<task-skill-2>", "<task-skill-3>"],
    context: "fork",
    reads: ["<large-file-1>", "<large-file-2>"],
    task: f"""## Goal
<one sentence>

## Skills Loaded
- tdd — write tests first, then implement
- subagent-laws — scope discipline, pre-existing issues guard
- <task-skill-1> — why it's relevant
- <task-skill-2> — why it's relevant
- <task-skill-3> — why it's relevant

## Persona
<who the sub-agent should be>

## Why This Matters
<stakes and consequences — what would break if this fails>

## Context You Need
<files, data, constraints, patterns, what's already been tried>

## Your Task
<step-by-step instructions>

## Success Criteria
<measurable, testable checks — checklist format preferred>

## Rules to Follow
<non-negotiable constraints>

## Boundaries
<explicit exclusions — what NOT to do>
<Pre-existing issues: note any problems outside scope and stop — do not fix>

## Output Format
<exact shape and file names>

## Stop Rules
<when to stop iterating>
<blocker escalation: use intercom if a decision not covered in the brief arises>"""
})
```

## Parallel Template

Each agent in a parallel group gets its own self-contained brief.

```python
subagent({
    parallel: [
        {
            agent: "worker",
            reads: ["<shared-contract-file>"],
            task: f"""## Goal
<agent-A-specific goal>

## Skills Loaded
- tdd — tests first
- subagent-laws — scope discipline

## Persona
<agent-A-specific persona>

## Contract (shared with other agents)
{shared_contract_definition}

## Your Task
<agent-A-specific instructions>

## Boundaries
<what agent A should NOT do>

## Success Criteria
<agent-A-specific checks>

## Output
Write results to workspace/_artifacts/agent-a/

Stop after success criteria are met. Do not touch agent B's files.""",
            output: "agent-a/results.md",
            outputMode: "file-only"
        },
        {
            agent: "worker",
            reads: ["<shared-contract-file>"],
            task: f"""## Goal
<agent-B-specific goal>

## Skills Loaded
- tdd — tests first
- subagent-laws — scope discipline

## Persona
<agent-B-specific persona>

## Contract (shared with other agents)
{shared_contract_definition}

## Your Task
<agent-B-specific instructions>

## Boundaries
<what agent B should NOT do>

## Success Criteria
<agent-B-specific checks>

## Output
Write results to workspace/_artifacts/agent-b/

Stop after success criteria are met. Do not touch agent A's files.""",
            output: "agent-b/results.md",
            outputMode: "file-only"
        }
    ],
    concurrency: 2,
    context: "fork"
})
```

## Template Variables

When using chain mode (`chain: [...]`), the following template variables are available:

| Variable | Description | Available in |
|----------|-------------|--------------|
| `{task}` | The original user request / top-level task | All chain steps |
| `{previous}` | The text response from the previous chain step | Steps 2+ |
| `{chain_dir}` | A shared temp directory for chain artifacts | All chain steps |

```python
subagent({
    chain: [
        { agent: "worker", task: "## Your Task\nResearch approaches for {task} and write to {chain_dir}/research.md" },
        { agent: "worker", task: "## Context\nResearch from previous step is at {chain_dir}/research.md\n\n## Your Task\nImplement the recommended approach from {previous}" }
    ]
})
```
