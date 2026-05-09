---
name: weak-link-detection-multi-agent
description: Identify and isolate the weakest reasoning chain in multi-agent outputs before aggregation. Prevents error amplification when one agent fails. Based on weak-link optimization research (arXiv:2604.15972).
category: orchestration
tags: [multi-agent, weak-link, error-detection, aggregation, quality-control]
author: Research synthesis
date: 2026-04-20
version: 1.0.0
...



---

# Weak-Link Detection for Multi-Agent Systems

## When to Use

Use this skill when:
- Aggregating outputs from multiple agents
- One agent's error could pollute the collective result
- Need to ensure multi-agent collaboration is robust
- Previous multi-agent runs produced inconsistent results
- Quality of individual agent outputs varies significantly

## The Problem

In multi-agent systems, **error amplification** occurs when:
- One agent produces incorrect output
- Other agents build on that incorrect output
- Final aggregated result is worse than any individual agent

The "weak link" is the agent whose output, if wrong, most damages the final result.

## State Machine Protocol

```
┌─────────────┐
│    INIT     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   COLLECT   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ASSESS    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   SCORE     │────▶│   IDENTIFY  │
└─────────────┘     └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │   WEAK      │           │   STRONG    │
       │   FOUND     │           │   ENOUGH    │
       └──────┬──────┘           └──────┬──────┘
              │                         │
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │   ISOLATE   │           │   AGGREGATE │
       └──────┬──────┘           └──────┬──────┘
              │                           │
              │                 ┌─────────┴─────────┐
              │                 │                   │
              │                 ▼                   ▼
              │          ┌─────────────┐     ┌─────────────┐
              │          │   REPAIR    │     │   EXCLUDE   │
              │          └──────┬──────┘     └──────┬──────┘
              │                 │                   │
              │                 └─────────┬─────────┘
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   FINAL     │
                     │   OUTPUT    │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │    DONE     │
                     └─────────────┘
```

## States

### INIT
**Purpose:** Setup weak-link detection

**Entry Actions:**
- Identify participating agents
- Define aggregation strategy (consensus, voting, weighted, etc.)
- Set weak-link threshold (when to trigger isolation)
- Define repair vs exclude criteria

**Exit Conditions:** Always → COLLECT

**Output Format:**
```yaml
multi_agent_config:
  agents: [agent_1, agent_2, ...]
  aggregation_strategy: "consensus|voting|weighted"
  weak_link_threshold: 0.5
  repair_attempts: 2
  exclusion_allowed: true
```

___


### COLLECT
**Purpose:** Gather outputs from all agents

**Entry Actions:**
- Request output from each agent
- Preserve raw outputs without modification
- Note any agent-specific metadata (confidence, reasoning, etc.)

**Exit Conditions:** All outputs collected → ASSESS

___


### ASSESS
**Purpose:** Evaluate each agent output individually

**Entry Actions:**
For each agent output, assess:
- Internal consistency (does it contradict itself?)
- Confidence score (if provided)
- Evidence quality (sources cited, reasoning depth)
- Domain appropriateness (is this agent's expertise relevant?)

**Prompt Template (per agent):**
```
Assess Agent {{N}} output:

Output: {{agent_output}}

Evaluation:
- Internal consistency: [PASS/FAIL/PARTIAL]
- Evidence quality: [HIGH/MEDIUM/LOW]
- Reasoning clarity: [CLEAR/UNCLEAR/ABSENT]
- Confidence indicators: [list any]
- Potential issues: [list concerns]

Preliminary quality score: [0-1]
```

**Exit Conditions:** All assessed → SCORE

___


### SCORE
**Purpose:** Calculate weakness score for each agent

**Entry Actions:**
Calculate weakness based on:
- Low individual quality score
- High deviation from consensus (if applicable)
- Missing critical components
- Logical flaws

**Weakness Score Formula:**
```
weakness = (1 - quality) * 0.4 +
           deviation_from_consensus * 0.3 +
           critical_gaps * 0.2 +
           logical_flaws * 0.1
```

Higher = weaker link

**Exit Conditions:** All scored → IDENTIFY

___


### IDENTIFY
**Purpose:** Find the weakest link(s)

**Entry Actions:**
- Rank agents by weakness score
- Identify if any exceed weak_link_threshold
- Determine if aggregation is safe or needs intervention

**Decision Rules:**
- If max(weakness) < 0.3 → STRONG ENOUGH (aggregate all)
- If 0.3 ≤ max(weakness) < 0.7 → WEAK FOUND (isolate and repair)
- If max(weakness) ≥ 0.7 → WEAK FOUND (isolate and consider exclude)

**Exit Conditions:**
- Decision = STRONG → AGGREGATE
- Decision = WEAK → ISOLATE

___


### ISOLATE
**Purpose:** Quarantine weak agent output

**Entry Actions:**
- Identify which agent(s) are weak links
- Separate their output from strong outputs
- Analyze why they're weak

**Prompt Template:**
```
WEAK LINK ANALYSIS

Weak agent(s): {{agent_ids}}
Weakness scores: {{scores}}

Analysis:
What makes this output weak?
- [Specific issue 1]
- [Specific issue 2]

Impact on aggregation:
If included, this would [describe harm]

Repairable? YES / NO
- If YES: What's needed to fix it?
- If NO: Why must it be excluded?
```

**Exit Conditions:**
- Repairable = YES → REPAIR
- Repairable = NO → EXCLUDE

___


### REPAIR
**Purpose:** Attempt to fix weak agent output

**Entry Actions:**
- Send feedback to weak agent
- Request revised output with specific corrections
- Limit repair attempts (config.repair_attempts)

**Prompt Template:**
```
REPAIR REQUEST

Agent: {{weak_agent}}
Original output: {{original_output}}

Issues to address:
1. {{issue_1}}
2. {{issue_2}}

Please provide revised output addressing these issues.

Attempt {{N}} of {{max_attempts}}
```

**Exit Conditions:**
- Repair successful → Return to ASSESS
- Repair failed → EXCLUDE
- Max attempts reached → EXCLUDE

___


### EXCLUDE
**Purpose:** Remove weak agent from aggregation

**Entry Actions:**
- Document why agent was excluded
- Adjust aggregation to use remaining agents
- Check if minimum agent count remains (if required)

**Exit Conditions:**
- Minimum agents remain → AGGREGATE
- Too few agents → Escalate to human

___


### AGGREGATE
**Purpose:** Combine strong agent outputs

**Entry Actions:**
Apply aggregation strategy:

**Consensus:** Find common elements across all outputs
**Voting:** Take majority/plurality position on each decision
**Weighted:** Weight by agent quality scores
**Best-of:** Select single highest-quality output

**Prompt Template:**
```
AGGREGATION

Participating agents: {{agent_list}}
Aggregation strategy: {{strategy}}

Process:
{% if strategy == "consensus" %}
- Find elements present in all/most outputs
- Note areas of disagreement
- Resolve conflicts using evidence quality
{% elif strategy == "voting" %}
- For each decision point, count agent positions
- Select majority position
- Note dissenting views
{% elif strategy == "weighted" %}
- Weight each agent by quality score
- Combine weighted contributions
{% endif %}

Aggregated result:
[Final combined output]

Confidence: [based on agreement level]
Dissent areas: [if any]
```

**Exit Conditions:** Always → FINAL OUTPUT

___


### FINAL OUTPUT
**Purpose:** Present aggregated result

**Entry Actions:**
- Format final output
- Include weak-link handling summary
- Note any excluded agents and why

**Output Format:**
```markdown
## Aggregated Result

[Final output]

## Process Summary
- Total agents: {{N}}
- Weak links identified: {{count}}
- Agents excluded: {{list}}
- Agents repaired: {{list}}
- Final aggregation: {{strategy}}

## Confidence Assessment
- Agreement level: {{percentage}}
- Quality of contributing agents: {{assessment}}
- Overall confidence: {{score}}

## Dissent Notes
[If any agents disagreed significantly, note their positions]
```

**Exit Conditions:** Always → DONE

___


### DONE
**Purpose:** Return final result

**Entry Actions:**
- Return aggregated output
- Include process transparency

## Example Usage

```markdown
Task: Analyze code for security issues

[INIT] 3 security agents with consensus aggregation

[COLLECT] Gather outputs from:
- Agent A: Static analysis expert
- Agent B: Dynamic testing expert
- Agent C: Manual review expert

[ASSESS]
Agent A:
- Found 5 issues
- Clear evidence for each
- Quality: HIGH (0.9)

Agent B:
- Found 2 runtime vulnerabilities
- One finding lacks evidence
- Quality: MEDIUM (0.6)

Agent C:
- Found 1 logic flaw
- Well-reasoned
- Quality: HIGH (0.85)

[SCORE] Weakness scores:
- Agent A: 0.1 (strong)
- Agent B: 0.4 (concerning - missing evidence)
- Agent C: 0.15 (strong)

[IDENTIFY] Agent B is weak link (score 0.4 > threshold 0.3)

[ISOLATE] Agent B's finding #2 lacks evidence

[REPAIR] Request Agent B provide evidence for finding #2

[ASSESS] Revised Agent B output:
- Now provides evidence
- Quality improved to 0.8

[SCORE] New weakness: 0.2 (acceptable)

[AGGREGATE] All 3 agents now strong enough
- Combine findings: 5 + 2 + 1 = 8 unique issues
- Consensus on severity ratings
- Final report generated

[FINAL OUTPUT] Security analysis with 8 confirmed issues
```

## Pitfalls

1. **Over-exclusion:** Don't exclude agents too aggressively — diversity matters
2. **Repair loops:** Limit repair attempts to prevent infinite loops
3. **Consensus bias:** Don't force consensus when legitimate disagreement exists
4. **Quality overconfidence:** Self-assigned confidence scores can be inflated
5. **Ignoring context:** Sometimes the "weak" agent is actually correct and others are wrong

## Integration

Combine with:
- `agentic-design-patterns-orchestrator`: For multi-agent workflow management
- `self-consistency`: Cross-check agent outputs for consistency
- `separation-of-concerns`: Assign different aspects to different agents

## Research Basis

- Weak-Link Optimization for Multi-Agent Reasoning (arXiv:2604.15972)
- Error propagation in collaborative AI systems
