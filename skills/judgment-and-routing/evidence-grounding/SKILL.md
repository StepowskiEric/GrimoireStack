---
name: evidence-grounding
display-name: Evidence Grounding
description: "Resolve every load-bearing observation against current evidence before acting: freshness checks on what you read, an early falsifying probe after the first edit, and receipts on every progress claim."
triggers:
  - Acting on something read earlier (file, log, test output, doc)
  - First edits in an unfamiliar or fast-changing codebase
  - Reporting task status or claiming work is verified
disable-model-invocation: true
---

# Evidence Grounding

Agents fail most often by trusting the environment wrongly: an old test result, a stale file read, a log line from a previous run becomes ground for action, and the false path stays hidden until recovery is expensive. Three habits close this gap.

A **load-bearing observation** is any file content, log line, test output, or document you are about to act on or report. A **probe** is the smallest command that can prove your current belief false right now. A **receipt** is pasted command output backing a claim.

## Steps

1. **Classify before acting.** When an observation is about to drive a decision or a report, mark it load-bearing. Everything else can stay cached. Done when the observation driving the next action is named.

2. **Check freshness and provenance.** For each load-bearing observation, answer: when did I read this, what produced it, and could it have changed since? Re-read the file, re-run the command, or check timestamps rather than reasoning from memory. Done when each load-bearing observation traces to a source fetched this episode.

3. **Run the early probe.** After the first exploration pass or first edit, execute the cheapest check that could falsify your working assumptions — typecheck, targeted test, lint, or a dry run. A failure caught here costs minutes; the same failure caught at the end costs the whole approach. Done when the probe ran this episode and its output entered context.

4. **Ship receipts.** Attach the actual output to every status claim: not "tests pass" but the test-run summary line. A claim without a receipt is unverified — state it as unverified or earn it with a probe. Done when no claim of completion, correctness, or verification stands without pasted evidence.

## Failure Modes

- Probes saved for the end become final-outcome evaluation; the false path was already chosen at step one.
- A receipt from last episode verifies nothing this episode; receipts carry timestamps the same as any other observation.
- Treating one observation as settled truth because it came from a tool; tools report stale state too.

Pair with [Rubric Gate](../../output-quality/rubric-gate/SKILL.md): probes keep beliefs honest during the work, the rubric gates the finished work.

See [worked-example.md](references/worked-example.md) for an episode where a stale test result nearly shipped a regression.
