# Feynman Technique — Template, Patterns & Variants

## Template

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

## Common gap patterns

### Circular definition
"Caching works by caching the results so you do not have to recompute them." The mechanism is missing: what is actually stored? How is validity maintained? When does the cache fail?

### Mechanism skip
"The load balancer distributes requests across instances to prevent overload." How does it decide which instance? What happens when one is unhealthy? What is the failure behavior?

### Jargon placeholder
"The CQRS pattern separates read and write concerns." What does "concerns" mean here? What changes in the system structure? What does it cost?

### Correct but shallow
"A distributed transaction ensures consistency across services." By what mechanism? What happens to each service if it fails partway? What is the latency impact?

## Verifying agent outputs

After generating a plan, recommendation, or explanation, apply the technique to your own output:
1. Read the output and identify every claim about mechanism
2. For each mechanism claim, attempt the simple explanation
3. Where the simple explanation fails, the claim is underspecified
4. Revise the output to explain the mechanism or acknowledge the limitation

## Compression-as-understanding (formal variant)

1. Write the simple explanation (Feynman pass)
2. Compress to ≤10 sentences or 200 words — strip implementation detail, keep essence
3. Test reconstruction: from the compressed form, answer "what would break this?" plus key mechanism questions
4. Score: reconstruction accuracy ≥80%? If not, re-explore and re-compress
5. Document gaps vs correctly captured elements

Use when stakes justify the extra rigor.

## Failure modes this skill prevents

1. **Fluent uncertainty** — authoritative-sounding text with no actual mechanism
2. **Jargon depth illusion** — domain vocabulary creating the appearance of expertise without grounding
3. **Confident incompleteness** — a partially correct output with gaps the agent does not know about
4. **Unacknowledged unknowns** — proceeding as if the full picture is understood when parts are unclear

## Pairing guide

- **Bounded Self-Revision** — close the gaps the technique identifies in the output
- **Tool-Interactive Critic** — verify factual correctness of claims the simple explanation exposed as uncertain
- **MECE / Pyramid Principle** — after the reasoning is sound, structure the output clearly
- **ETTO** — decide whether a full Feynman pass is warranted by the stakes

## Definition of done

Applied correctly when:
- the concept was explained in simple language without jargon substituting for mechanism
- gaps were identified explicitly, not glossed over
- gaps were closed with evidence or acknowledged as honest unknowns
- the final explanation is accurate and clear to a smart non-expert
- the agent's understanding is stronger because of what the gaps revealed
