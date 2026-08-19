# First Principles — Template, Assumptions & Pairings

## Analysis template

```md
## Problem Statement (Inherited)
<how the problem was originally stated>

## Actual Goal (Decomposed)
<what must actually be achieved, without method assumptions>

## What We Know (Verified)
- Facts:
  - <fact>
- Inferences:
  - <inference>

## Inherited Assumptions (to Question)
- <assumption> — status: hard constraint / soft constraint / unverified
- <assumption> — status: hard constraint / soft constraint / unverified

## Hard Constraints (Genuinely Non-Negotiable)
- <constraint with evidence of why it is truly fixed>

## Soft Constraints (Can Be Questioned)
- <constraint> — why it has been treated as fixed / whether it needs to be

## First-Principles Solution Sketch
<what emerges from the real constraints, not from convention>

## Comparison to Conventional Approach
- Where they differ:
  - <difference>
- Whether the difference matters:
  - <reasoning>

## Recommendation
<proceed with first-principles approach / validate conventional approach is already optimal / hybrid>
```

## Common inherited assumptions to question

### Software architecture
- "We need a separate service for this" — truly required?
- "We need a database for this" — is durable state actually required?
- "This must be real-time" — does the user require real-time, or just timely?

### Product design
- "Users want this feature" — do users need the outcome, or the feature itself?
- "We need an API for this" — is integration the actual requirement?

### Planning
- "This will take six weeks" — based on what actual constraints?
- "This requires three teams" — which dependency is truly necessary?

### Debugging
- "The problem is in component X" — is that where the symptom is, or where the cause is?
- "This is the correct behavior" — verified by whom, against what?

## Failure modes this skill prevents

1. **Framing inheritance** — accepting the problem as stated without questioning its assumptions
2. **Analogy reasoning in the wrong domain** — "we did it for system A so we do it for system B" without checking shared constraints
3. **Optimization inside a bad frame** — making the existing approach faster when the approach itself is the problem
4. **Assumed constraint acceptance** — treating soft, historical, or organizational constraints as physical laws

## Pairing guide

- **Inversion** — inversion reasons backward from failure; first principles reasons upward from axioms; use both to stress-test
- **How to Solve It** — first principles reveals the true problem; How to Solve It provides the solving protocol
- **ETTO** — first principles is slow-mode work; decide whether the depth is warranted before starting
- **Analogy variant** — first principles and analogy are the two poles of a routing decision: strip analogies to test whether the situation truly resembles the analog

## Definition of done

Applied correctly when:
- the inherited problem framing was questioned, not just inherited
- facts were separated from assumptions
- hard constraints were distinguished from soft ones
- the solution was built from verified foundations up
- the first-principles result was compared to the conventional approach
- the final recommendation is stronger because the framing was examined
