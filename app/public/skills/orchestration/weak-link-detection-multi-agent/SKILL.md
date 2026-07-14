---
name: weak-link-detection-multi-agent
description: "Identify and isolate the weakest reasoning chain in multi-agent outputs before aggregation."
triggers:
  - Aggregating outputs from multiple agents
  - One agent's error could pollute the collective result
  - Previous multi-agent runs produced inconsistent results
  - Quality of individual agent outputs varies significantly
---

# Weak-Link Detection for Multi-Agent Systems

One bad agent poisons the chain. Detect the weak link before aggregation amplifies the error; isolate, repair if possible, or exclude.

## When to Use

- Aggregating outputs from multiple agents
- One agent's error could pollute the collective result
- Need to ensure multi-agent collaboration is robust
- Previous multi-agent runs produced inconsistent results
- Quality of individual agent outputs varies significantly

## When NOT to Use

- **Single agent, single output.** No aggregation, no amplification risk.
- **Identical agents with deterministic prompts.** Variation is low; weak-link detection adds overhead without payoff.
- **Irreversible aggregation already done.** This skill runs BEFORE aggregation.

## State Machine

```
INIT → COLLECT → ASSESS → SCORE → IDENTIFY
                                          │
                       ┌──────────────────┴──────────────────┐
                       ▼                                     ▼
                  WEAK FOUND                            STRONG ENOUGH
                       │                                     │
                       ▼                                     ▼
                   ISOLATE                              AGGREGATE
                       │                                     │
              ┌────────┴────────┐                            │
              ▼                 ▼                            │
          REPAIR            EXCLUDE ─────────────────────────┤
              │                 │                            │
              └────────┬────────┘                            │
                       ▼                                     ▼
                  FINAL OUTPUT ────────────────────────→ DONE
```

## States

### INIT

**Purpose:** Setup weak-link detection

**Entry actions:**
- Identify participating agents
- Define aggregation strategy (consensus, voting, weighted)
- Set weak-link threshold (when to trigger isolation)
- Define repair vs exclude criteria

**Exit conditions:** Always → COLLECT

**Output format:**
```yaml
multi_agent_config:
  agents: [agent_1, agent_2, ...]
  aggregation_strategy: "consensus | voting | weighted"
  weak_link_threshold: 0.5
  repair_attempts: 2
  exclusion_allowed: true
```

---

### COLLECT

**Purpose:** Gather outputs from all agents

**Entry actions:**
- Request output from each agent
- Preserve raw outputs without modification
- Note any agent-specific metadata (confidence, reasoning)

**Exit conditions:** All outputs collected → ASSESS

---

### ASSESS

**Purpose:** Evaluate each agent output individually

**Entry actions** — for each agent output, assess:
- Internal consistency (does it contradict itself?)
- Confidence score (if provided)
- Evidence quality (sources cited, reasoning depth)
- Domain appropriateness (is this agent's expertise relevant?)

**Per-agent prompt template:**

```
Assess Agent {{N}} output:

Output: {{agent_output}}

Evaluation:
- Internal consistency: [PASS / FAIL / PARTIAL]
- Evidence quality: [HIGH / MEDIUM / LOW]
- Reasoning clarity: [CLEAR / UNCLEAR / ABSENT]
- Confidence indicators: [list any]
- Potential issues: [list concerns]

Preliminary quality score: [0-1]
```

**Exit conditions:** All assessed → SCORE

---

### SCORE

**Purpose:** Calculate weakness score for each agent

**Entry actions** — calculate weakness based on:
- Low individual quality score
- High deviation from consensus (if applicable)
- Missing critical components
- Logical flaws

**Weakness score formula:**

```
weakness = (1 - quality) * 0.4
        + deviation_from_consensus * 0.3
        + critical_gaps * 0.2
        + logical_flaws * 0.1
```

Higher = weaker link.

**Exit conditions:** All scored → IDENTIFY

---

### IDENTIFY

**Purpose:** Find the weakest link(s)

**Entry actions:**
- Rank agents by weakness score
- Identify if any exceed `weak_link_threshold`
- Determine if aggregation is safe or needs intervention

**Decision rules:**
- `max(weakness) < 0.3` → **STRONG ENOUGH** (aggregate all) → AGGREGATE
- `0.3 ≤ max(weakness) < 0.7` → **WEAK FOUND** (isolate and repair) → ISOLATE
- `max(weakness) ≥ 0.7` → **WEAK FOUND** (isolate, consider exclude) → ISOLATE

**Exit conditions:**
- Decision = STRONG → AGGREGATE
- Decision = WEAK → ISOLATE

---

### ISOLATE

**Purpose:** Quarantine weak agent output

**Entry actions:**
- Identify which agent(s) are weak links
- Separate their output from strong outputs
- Analyze why they're weak

**Prompt template:**

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

**Exit conditions:**
- Repairable = YES → REPAIR
- Repairable = NO → EXCLUDE

---

### REPAIR

**Purpose:** Attempt to fix weak agent output

**Entry actions:**
- Send feedback to weak agent
- Request revised output with specific corrections
- Limit repair attempts (`config.repair_attempts`)

**Prompt template:**

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

**Exit conditions:**
- Repair successful → return to ASSESS
- Repair failed → EXCLUDE
- Max attempts reached → EXCLUDE

---

### EXCLUDE

**Purpose:** Remove weak agent from aggregation

**Entry actions:**
- Document why agent was excluded
- Adjust aggregation to use remaining agents
- Check if minimum agent count remains (if required)

**Exit conditions:**
- Minimum agents remain → AGGREGATE
- Too few agents → Escalate to human

---

### AGGREGATE

**Purpose:** Combine strong agent outputs

**Entry actions** — apply aggregation strategy:

- **Consensus** — find common elements across all outputs
- **Voting** — take majority/plurality position on each decision
- **Weighted** — weight by agent quality scores
- **Best-of** — select single highest-quality output

**Prompt template:**

```
AGGREGATION

Participating agents: {{agent_list}}
Aggregation strategy: {{strategy}}

Process:
- For "consensus": find elements present in all/most outputs, note disagreement, resolve conflicts by evidence quality
- For "voting": for each decision point, count agent positions, select majority, note dissenting views
- For "weighted": weight each agent by quality score, combine weighted contributions

Aggregated result:
[Final combined output]

Confidence: [based on agreement level]
Dissent areas: [if any]
```

**Exit conditions:** Always → FINAL OUTPUT

---

### FINAL OUTPUT

**Purpose:** Present aggregated result

**Entry actions:**
- Format final output
- Include weak-link handling summary
- Note any excluded agents and why

**Output format:**

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

**Exit conditions:** Always → DONE

---

### DONE

**Purpose:** Return final result

**Entry actions:** return aggregated output with process transparency.

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
- Agent B: 0.4 (concerning — missing evidence)
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

- **Over-exclusion** — diversity matters; don't exclude too aggressively
- **Repair loops** — limit repair attempts to prevent infinite loops
- **Consensus bias** — don't force consensus when legitimate disagreement exists
- **Quality overconfidence** — self-assigned confidence scores can be inflated
- **Ignoring context** — sometimes the "weak" agent is actually correct and others are wrong

## Integration

Combine with:
- `agentic-design-patterns-orchestrator` — multi-agent workflow management
- `self-consistency` — cross-check agent outputs for consistency
- `separation-of-concerns` — assign different aspects to different agents

## References

For a catalog of failure signatures in multi-agent systems (cascading failures, silent drops, timeout chains, data corruption, priority inversion) and detection patterns:

- [`references/failure-signatures.md`](references/failure-signatures.md)

## Research Basis

- Weak-Link Optimization for Multi-Agent Reasoning (arXiv:2604.15972)
- Error propagation in collaborative AI systems
