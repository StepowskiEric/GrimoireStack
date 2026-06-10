# Skill: Feynman Technique for AI Agents

## Purpose

Use this skill when the agent needs to verify that it genuinely understands something — not that it can recite it, but that it can explain it from the ground up in simple language.

The Feynman Technique is a test of understanding:
1. Explain the concept, system, or decision as if teaching someone with no background
2. Find the gaps where the explanation breaks down
3. Return to the source to close those gaps
4. Simplify until the explanation is clear, not clever

The gaps in the simple explanation reveal the gaps in understanding.
If you cannot explain it simply, you do not understand it well enough.

Source: Richard Feynman's teaching philosophy, documented in *Surely You're Joking, Mr. Feynman!* and his *Lectures on Physics* series.

---

## Core Rule

Understanding is not the ability to reproduce correct-sounding language.
Understanding is the ability to explain from the ground up, answer simple questions about it, and identify the edges where the explanation breaks.

If the agent's explanation requires jargon to avoid gaps, the gaps exist.

---

## When to Use

Use this skill when:
- generating an explanation, tutorial, or documentation and wanting to verify the reasoning is sound
- reviewing a plan, architecture, or design that was generated and checking whether the agent truly understands what it produced
- responding to a question about a complex technical or non-technical topic
- verifying that a proposed solution actually makes sense at the mechanism level
- identifying where a generated recommendation has uncertain or underspecified parts

Do not use when:
- the task requires producing a technical output (code, config) rather than an explanation
- the audience is already expert and simplified explanation would be condescending
- the concept is trivial and the simplification adds no value

---

## The Four-Step Process

### Step 1: Write the Simple Explanation
Explain the concept, system, or reasoning as if writing for someone with no background in the domain.

Rules:
- no jargon unless it is defined immediately after it is used
- no appeals to authority ("experts agree that…") without explaining the mechanism
- no circular definitions ("X is when you do X-like things")
- explain the mechanism, not just the outcome

### Step 2: Find the Gaps
Where does the explanation:
- become vague or hand-wavy?
- rely on terms that were not themselves explained?
- make a claim without explaining why it is true?
- skip over a mechanism ("and then it works") instead of explaining it?
- produce a correct-sounding phrase without actually conveying the process?

These gaps are the places where the agent's understanding is incomplete.

### Step 3: Close the Gaps
For each gap:
- go back to the source (documentation, code, reasoning, facts)
- find the actual explanation
- revise the simple explanation to fill the gap

If the gap cannot be closed because the information does not exist, state that explicitly rather than papering over it with confident-sounding language.

### Step 4: Simplify and Test
After the gaps are closed, simplify the explanation further.
Ask: can this be made shorter without losing accuracy?

A good simple explanation is:
- accurate without being incomplete
- specific without being jargon-dense
- clear to a smart non-expert reader
- honest about what is unknown

---

## Feynman Technique Template

```md
## Concept / Decision / Plan Being Explained
<what is being explained>

## Simple Explanation (First Pass)
<explain as if to a smart non-expert with no background>

## Gap Analysis
- Gap 1: <where the explanation became vague or hand-wavy>
  - Root cause: <what was not understood>
  - Resolution: <what was found to close the gap>
- Gap 2: <gap>
  - Root cause:
  - Resolution:

## Unresolved Gaps (Honest Unknowns)
- <what could not be explained because the information genuinely does not exist or is not known>

## Revised Simple Explanation (Post-Gap Closing)
<the cleaner, more accurate version after closing the gaps>

## Simplification Check
- Is there jargon that could be replaced with plain language? <yes/no>
- Is there a circular definition? <yes/no>
- Are there mechanism skips ("and then it works")? <yes/no>
- Final version:
  <one-paragraph plain-language summary of the core mechanism>
```

---

## Agent Rules

### Do
- explain the mechanism, not just the outcome
- find gaps by looking for vague language and unexamined jargon
- close gaps with evidence, not with more confident-sounding vagueness
- state unknowns explicitly rather than generating authoritative-sounding filler

### Do Not
- treat fluent-sounding language as evidence of understanding
- use jargon as a substitute for explanation
- skip over the mechanism ("and then it handles it correctly")
- generate a Feynman explanation without actually checking it for gaps

---

## Common Gap Patterns

### Circular definition
"Caching works by caching the results so you do not have to recompute them."
The mechanism is missing. What is actually stored? How is cache validity maintained? When does the cache fail?

### Mechanism skip
"The load balancer distributes requests across instances to prevent overload."
How does it decide which instance? What happens if an instance becomes unhealthy? What is the failure behavior?

### Jargon placeholder
"The CQRS pattern separates read and write concerns."
What does "concerns" mean here? What changes in the system structure? What problem does this solve and what does it cost?

### Correct but shallow
"A distributed transaction ensures consistency across services."
By what mechanism? What happens to each service if the transaction fails partway through? What is the latency impact?

---

## Using the Feynman Technique to Verify Agent Outputs

After generating a plan, recommendation, or explanation, apply the technique to your own output:

1. Read the output and identify every claim about mechanism
2. For each mechanism claim, attempt the simple explanation
3. Where the simple explanation fails, the claim is underspecified
4. Revise the output to either explain the mechanism or acknowledge the limitation

This prevents confident-sounding outputs that do not actually know what they are talking about.

---

## Failure Modes This Skill Prevents

### 1) Fluent uncertainty
Generating text that sounds authoritative but contains no actual explanation of mechanism.

### 2) Jargon depth illusion
Using domain vocabulary to create the appearance of expertise without grounding it in explanation.

### 3) Confident incompleteness
Producing a recommendation or explanation that is partially correct but has gaps the agent is not aware of.

### 4) Unacknowledged unknowns
Proceeding as if the agent understands the full picture when parts of it are genuinely unclear.

---

## Pairing Guide

- **Bounded Self-Revision** — after the Feynman technique identifies gaps, use Bounded Self-Revision to close them in the output
- **Tool-Interactive Critic** — use external tools to verify the factual correctness of claims that the simple explanation exposed as uncertain
- **MECE / Pyramid Principle** — after the Feynman technique ensures the reasoning is sound, use MECE to structure the output clearly
- **ETTO** — use to decide whether a full Feynman technique pass is warranted given the stakes

---

## Definition of Done

The Feynman Technique was applied correctly when:
- the concept was explained in simple language without jargon substituting for mechanism
- gaps were identified explicitly, not glossed over
- gaps were closed with evidence or acknowledged as honest unknowns
- the final explanation is accurate and clear to a smart non-expert
- the agent's understanding is stronger because of what the gaps revealed

---

## Final Instruction

If you cannot explain it simply, you do not understand it yet.

Find the gaps.
Close them.
If they cannot be closed, say so.
