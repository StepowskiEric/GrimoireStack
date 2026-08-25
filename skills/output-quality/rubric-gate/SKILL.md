---
name: rubric-gate
display-name: Rubric Gate
description: "Write a rubric of binary done-criteria before implementing, then gate on it: every criterion shows PASS with evidence before work ships."
triggers:
  - Task where 'done' is vague or contested
  - Output will face review or automated eval
  - Rework caused by unclear acceptance criteria
disable-model-invocation: true
---

# Rubric Gate

A **rubric** is the acceptance test written first: a list of **binary criteria**, each observable as pass or fail. Binary criteria beat scalar judgments ("rate the code 1–10") for reliability — a fresh reviewer can settle them without taste.

State criteria positively: each names what must be observably true. A criterion two agents can score differently fails the format.

## Steps

1. **Draft the rubric before implementing.** Write 5–12 criteria covering scope delivered, constraints honored, and evidence produced (tests, logs, citations). Give each criterion its check method: a command, a file inspection, or a named artifact. Done when every criterion carries one and you could hand the list to another agent unchanged.

2. **Implement against the list.** Keep the rubric visible during the work; treat any criterion that starts to slip as a live defect, not a note for later.

3. **Run the gate.** Verify each criterion in order and record one line per criterion: PASS or FAIL plus the evidence (command output, file line, artifact path). Done when every line shows PASS with evidence attached.

4. **Fix at the gate.** Each FAIL is an actionable defect: fix the work, re-run that criterion, record the new evidence. Done when a full pass over all criteria shows zero FAIL lines.

5. **Ship the rubric with the work.** Paste the final scored list into the PR description or hand-off note so the reviewer sees the same bar you gated on.

## Failure Modes

- Criteria written after the work: that is a review, not a gate; the bias flows backward from what was built.
- Scalar wording ("clean code", "good coverage") reopens judgment disputes; convert each into its checkable consequence.
- A rubric with no evidence column invites claimed-but-unverified passes; keep the evidence line mandatory.

See [rubric-example.md](references/rubric-example.md) for a worked gate with scored output.
