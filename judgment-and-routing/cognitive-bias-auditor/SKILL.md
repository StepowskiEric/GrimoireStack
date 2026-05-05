---
source: "jerry-skills"
name: cognitive-bias-auditor
category: judgment-and-routing
description: >
  Detect and mitigate cognitive biases in agent decision-making. Based on arXiv:2410.02820
  which tested GPT-4o, Gemma 2, and Llama 3.1 on 9 established cognitive biases.
  Includes companion script for automated bias auditing.
---

# Cognitive Bias Auditor

## Objective

Detect cognitive biases in agent reasoning and decision-making. Based on experimental evaluation of 1,500 experiments across 9 biases (arXiv:2410.02820).

## When to Use

- Agent makes a major decision (task selection, architecture choice, tool use)
- Results seem inconsistent or irrational
- You suspect the agent is favoring sunk costs or anchored to first impressions
- Post-decision audit to improve future reasoning

## The 9 Biases (From the Paper)

| Bias | Description | Paper Finding |
|---|---|---|
| **Anchoring** | Over-reliance on first piece of information | All models showed susceptibility |
| **Confirmation Bias** | Seeking info that confirms existing beliefs | GPT-4o most affected |
| **Sunk Cost Fallacy** | Continuing due to prior investment | Gemma 2 showed strengths here |
| **Loss Aversion** | Preferring to avoid losses over acquiring gains | Variable across models |
| **Framing Effects** | Decisions change based on how info is presented | All models affected |
| **Conjunction Fallacy** | Assuming specific conditions more probable than general | Llama 3.1 most susceptible |
| **Overconfidence** | Overestimating accuracy of beliefs | Consistent across all models |
| **Availability Heuristic** | Judging probability by how easily examples come to mind | GPT-4o showed highest bias |
| **Representativeness** | Judging probability by similarity to stereotype | All models affected |

## Workflow

### 1. Trigger Audit

After a significant decision (tool selection, task priority, architecture choice), run:

```
Should I audit for cognitive biases?
- Was this decision based on first impression? (anchoring)
- Did I ignore contradictory evidence? (confirmation bias)
- Am I continuing because I already invested time? (sunk cost)
- Am I avoiding loss more than seeking gain? (loss aversion)
```

### 2. Run Companion Script

```bash
python scripts/cognitive_bias_auditor.py check \
  --decision "selected tool X because Y" \
  --context "was evaluating tools A, B, C" \
  --bias all
```

### 3. Review Output

Script outputs to `bias_audit.jsonl`:

```json
{
  "timestamp": "2026-05-05T01:30:00Z",
  "decision": "selected tool X because Y",
  "biases_detected": ["anchoring", "confirmation_bias"],
  "severity": "medium",
  "suggestion": "Consider re-evaluating tools B and C without X as anchor"
}
```

### 4. Mitigate

If bias detected:
- **Anchoring:** List all options without seeing first choice
- **Confirmation bias:** Actively seek contradictory evidence
- **Sunk cost:** Ask "Would I start this if I hadn't invested time?"
- **Loss aversion:** Frame as "gain from switching" not "loss from staying"

## Companion Script

`scripts/cognitive_bias_auditor.py` — pure stdlib Python:

| Command | Description |
|---|---|
| `check` | Audit a decision for biases |
| `batch` | Audit multiple decisions from file |
| `report` | Generate bias frequency report |
| `persona` | Apply Econographics persona (2,121 behavioral indicators) |

### Examples

```bash
# Check single decision
python scripts/cognitive_bias_auditor.py check \
  --decision "Keeping this architecture because I already built it" \
  --bias sunk_cost

# Batch audit from session log
python scripts/cognitive_bias_auditor.py batch \
  --file session_log.jsonl \
  --bias all

# Generate report
python scripts/cognitive_bias_auditor.py report \
  --input bias_audit.jsonl \
  --output bias_report.md
```

## Integration with Other Skills

- **cognitive-bias-checklist:** This skill is the automated version. Use the checklist for manual review, this script for automated auditing.
- **metacognitive-monitoring:** Use before decisions to calibrate confidence vs. accuracy.
- **pre-mortem:** Combine to ask "Will bias X cause this project to fail?"

## Paper Findings to Remember

1. **Gemma 2** performed best on sunk cost fallacy detection
2. **GPT-4o** showed highest availability heuristic bias
3. **Llama 3.1** most susceptible to conjunction fallacy
4. All models struggle with overconfidence — agents consistently overestimate their accuracy

## Pitfalls

- **Over-auditing:** Don't audit every trivial decision. Reserve for significant choices.
- **Ignoring results:** If the script flags a bias, take action. Don't dismiss it.
- **Persona mismatch:** The Econographics dataset (2,121 indicators) is powerful but ensure the persona matches your agent's role.

## Rule of Thumb

If a decision feels "obvious" or "clear," that's when you're most likely anchored. Audit it.
