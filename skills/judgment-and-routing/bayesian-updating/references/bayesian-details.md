# Bayesian Updating — Reference Details

## The mechanics

### Prior
Your confidence that hypothesis H is true before new evidence. Express as high / medium / low / very low.

### Likelihood
How much more likely is this evidence if H is true versus if H is false?

| Evidence type | Update |
|---|---|
| Strong positive — very likely if H true, unlikely otherwise | Large shift toward H |
| Weak positive — slightly more consistent with H | Small shift toward H |
| Neutral — equally likely under all hypotheses | No shift |
| Disconfirming — unlikely if H true | Shift away from H |

### Posterior
The updated probability after applying the likelihood. This becomes the new prior for the next piece of evidence.

## Failure modes

### Anchoring (under-updating)
Prior confidence is so strong that new disconfirming evidence barely moves it.
- **Signs:** you acknowledge evidence but qualify it into irrelevance; the same hypothesis leads no matter what arrives.
- **Fix:** for each disconfirming piece, ask "how likely was I to see this if my hypothesis were correct?" If the answer is "not very likely," the update must be meaningful.

### Whiplash (over-updating)
Each new piece of evidence causes a complete swing to a different hypothesis.
- **Signs:** belief changes sharply after each observation; the prior plays no role in the outcome.
- **Fix:** the prior exists because earlier evidence established it. Ask: "how much more consistent is this evidence with the new hypothesis than with my prior?"

## Debugging pattern

The most common use. Before running tests or inspecting logs:

```
H1: config error        (medium — last deploy changed config)
H2: dependency outage   (low — no alerts)
H3: memory leak         (medium — new code path, untested)
H4: cache inconsistency (low — cache wasn't touched)
```

As each result arrives, update:
- "Error only on requests using new code path" → favors H3, weakly against H1
- "Memory usage is flat" → strongly against H3, neutral on H1
- "Config diff shows unchanged" → against H1
- Update: H2 now leads unexpectedly. Check dependency health.

This prevents latching onto the first plausible explanation.

## Template

```md
## Hypotheses
| H | Confidence | Basis |
|---|-----------|-------|
| H1: | high/med/low | |
| H2: | high/med/low | |

## Evidence log
### E1: <what was observed>
- Predicted by: H1 (likely), H2 (unlikely), H3 (neutral)
- Favors: H1
- Updated state:
  | H | Posterior | Trend |
  |---|----------|-------|

## Leading hypothesis
<which and why>

## What would change my mind
- Toward H2:
- Away from H1:

## Residual uncertainty
<what remains unknown>
```
