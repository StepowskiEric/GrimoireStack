# Skill: Self-Consistency Check for AI Agents

## Purpose

Use this skill when the agent must verify that its reasoning about a problem is reliable — by generating multiple independent reasoning paths to the same conclusion and checking whether they converge.

This skill is based on the Self-Consistency paper (Wang et al., 2022, NeurIPS): when multiple independent chains of reasoning about the same problem reach the same conclusion, that conclusion is more reliable. When they diverge, the divergence reveals where the reasoning is uncertain or the problem is genuinely hard.

This is complementary to Bounded Self-Revision (which revises a single draft) and Tree of Thoughts (which explores different solution strategies).

Self-Consistency does not improve a draft.
It stress-tests whether the reasoning behind the draft is reliable.

Source: *Self-Consistency Improves Chain of Thought Reasoning in Language Models* (Wang et al., 2022).

---

## Core Rule

Do not trust a single reasoning chain for high-stakes conclusions.

Generate multiple independent reasoning paths.
If they converge: confidence is justified.
If they diverge: investigate why before committing.

---

## When to Use

Use this skill when:
- the answer to a question depends on a chain of reasoning that could go wrong at any step
- the agent has produced a confident-sounding conclusion but the topic is complex
- a decision is high-stakes and correctness matters more than speed
- the agent suspects it may be pattern-matching rather than reasoning
- a quantitative estimate, logical deduction, or multi-step analysis must be verified
- the first reasoning path was fast and fluent, which may indicate over-confidence

Do not use when:
- the task is creative and has no unique correct answer
- the answer is a simple fact that can be verified directly
- speed is the primary constraint and a single strong reasoning pass is sufficient

---

## How Self-Consistency Works

### Standard chain of thought (single path)
The agent reasons step by step from the problem to a conclusion.
Risk: an error at any step propagates forward and produces a confident-looking wrong answer.

### Self-consistency (multiple paths)
The agent generates multiple independent chains of reasoning from the same starting point — varying the approach, decomposition, or intermediate steps — and checks whether they reach the same conclusion.

Convergence signal: multiple paths agree → conclusion is likely correct or at least robust.
Divergence signal: paths disagree → the conclusion is uncertain and the divergence points reveal where the reasoning is fragile.

---

## The Core Steps

### Step 1: Generate independent reasoning paths
Generate two or more genuinely independent reasoning chains.

"Independent" means:
- different intermediate steps or decompositions
- different approaches to the same question
- different ordering of considerations
- not just the same path paraphrased

Minimum: two paths. For high-stakes questions: three.

### Step 2: Extract the conclusion from each path
What conclusion does each path reach?

### Step 3: Check for convergence
Do the conclusions agree?

**Full convergence**: all paths reach the same conclusion.
**Partial convergence**: most paths agree, but one diverges.
**Divergence**: paths reach meaningfully different conclusions.

### Step 4: Investigate divergence points
Where exactly do the paths diverge?
- Is it in the initial interpretation of the problem?
- Is it in a specific intermediate reasoning step?
- Is it in the weighting of competing considerations?

The divergence point is the most uncertain part of the reasoning.

### Step 5: Resolve or acknowledge uncertainty
For each divergence point:
- is the disagreement resolvable with evidence or further analysis?
- if yes, resolve it and verify the conclusion
- if no, the uncertainty must be acknowledged explicitly in the output

---

## Self-Consistency Template

```md
## Question / Problem
<what is being reasoned about>

## Path 1
Approach: <how this path decomposes or approaches the problem>
Reasoning:
  - Step 1: <reasoning>
  - Step 2: <reasoning>
  - Step 3: <reasoning>
Conclusion: <what path 1 concludes>

## Path 2
Approach: <different decomposition or approach>
Reasoning:
  - Step 1: <reasoning>
  - Step 2: <reasoning>
  - Step 3: <reasoning>
Conclusion: <what path 2 concludes>

## Path 3 (if warranted)
(repeat structure)

## Convergence Check
- Do the conclusions agree? <full / partial / divergent>
- If partial or divergent: where do the paths diverge?
  - Divergence point: <step or consideration where paths split>
  - Why they diverge: <different interpretation / different weighting / different assumption>

## Resolution
- Resolvable? <yes / no>
- If yes, how resolved: <evidence or analysis used>
- If no, acknowledged uncertainty: <what remains uncertain>

## Final Conclusion
<the conclusion supported by convergent reasoning, or the uncertainty that must be named>

## Confidence Assessment
<high — all paths converge / medium — paths partially converge / low — paths diverge significantly>
```

---

## Agent Rules

### Do
- generate paths that are genuinely independent (different approaches, not different phrasings)
- be honest when paths diverge and investigate the divergence point
- use the majority conclusion when one path diverges, while investigating why
- state the confidence level based on convergence, not based on fluency

### Do Not
- generate token alternative paths that are just paraphrases of the first
- ignore divergence and proceed as if the first path is correct
- treat convergence as absolute proof (correlated errors can produce false convergence)
- use this skill as a way to generate more text rather than as a genuine verification

---

## Recognizing False Convergence

Convergence is more reliable when the paths are truly independent.
Convergence is less reliable when:
- both paths make the same implicit assumption
- both paths are influenced by the same contextual framing
- both paths pattern-match to the same familiar pattern even though the situation is novel

If convergence is suspicious — if it feels too easy — ask: are these paths actually reasoning differently or just expressing the same assumption differently?

---

## Failure Modes This Skill Prevents

### 1) Single-path overconfidence
A fluent, step-by-step reasoning chain feels reliable because it is internally consistent, even when it is wrong.

### 2) Undetected reasoning errors
An error at step 3 of a 10-step reasoning chain propagates forward invisibly because the agent never examines alternative step 3 outcomes.

### 3) False certainty about ambiguous questions
Questions with genuinely uncertain answers produce divergent paths. Without self-consistency, that uncertainty is hidden behind a confident-sounding single conclusion.

### 4) Pattern-match masquerading as reasoning
The agent recognizes a familiar-looking problem and applies a familiar solution without actual reasoning. Self-consistency reveals this when alternative paths do not reproduce the same conclusion.

---

## Pairing Guide

- **Tree of Thoughts** — Tree of Thoughts generates and prunes multiple solution strategies; Self-Consistency verifies that the surviving strategy's reasoning is reliable
- **Bounded Self-Revision** — Self-Consistency reveals whether the reasoning is sound; Bounded Self-Revision improves the expression of that reasoning
- **Feynman Technique** — Feynman surfaces gaps in explanation; Self-Consistency surfaces divergence in reasoning paths
- **Bayesian Updating** — if paths diverge, use Bayesian Updating to track which path is best supported by evidence

---

## Definition of Done

Self-Consistency was applied correctly when:
- at least two genuinely independent reasoning paths were generated
- each path was developed to a conclusion
- convergence or divergence was assessed explicitly
- divergence points were investigated
- the final conclusion acknowledges the confidence level based on convergence
- the output is more reliable because it survived the multi-path test

---

## Final Instruction

One fluent chain of thought is not enough.

Generate multiple independent paths.
Check whether they agree.
If they disagree, find out why.
Only commit to a conclusion that survives the comparison.
