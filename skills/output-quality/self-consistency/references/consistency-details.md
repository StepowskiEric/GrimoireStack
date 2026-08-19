# Self-Consistency — Template, False Convergence & Pairings

## Template

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

## Recognizing false convergence

Convergence is more reliable when paths are truly independent. Less reliable when:
- both paths make the same implicit assumption
- both are influenced by the same contextual framing
- both pattern-match to the same familiar pattern in a novel situation

If convergence feels too easy, ask: are these paths reasoning differently, or expressing the same assumption differently?

## Failure modes this skill prevents

1. **Single-path overconfidence** — a fluent internally-consistent chain feels reliable even when wrong
2. **Undetected reasoning errors** — an error at step 3 of 10 propagates invisibly without an alternative step-3 examined
3. **False certainty on ambiguous questions** — divergent paths hide behind a confident single conclusion
4. **Pattern-match masquerading as reasoning** — a familiar-looking problem gets a familiar solution; alternative paths fail to reproduce it

## Pairing guide

- **Tree of Thoughts** — generates and prunes solution strategies; Self-Consistency verifies the survivor's reasoning
- **Bounded Self-Revision** — Self-Consistency reveals whether reasoning is sound; Bounded Self-Revision improves its expression
- **Feynman Technique** — Feynman surfaces gaps in explanation; Self-Consistency surfaces divergence in paths
- **Bayesian Updating** — divergent paths: track which is best supported by evidence

## Definition of done

Applied correctly when:
- at least two genuinely independent reasoning paths were generated
- each path was developed to a conclusion
- convergence or divergence was assessed explicitly
- divergence points were investigated
- the final conclusion acknowledges confidence based on convergence
- the output survived the multi-path test
