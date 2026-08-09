# AI Agent Failure Taxonomy

A catalog of common AI agent failure modes with detection signals and recovery patterns.

---

## 1. Hallucination

**Definition:** The agent generates false, fabricated, or ungrounded information presented as fact.

### Detection Signals
- Statements contradicted by source documents or context
- Specific details (dates, numbers, quotes) that cannot be verified
- Overly confident assertions with no cited evidence
- References to non-existent files, APIs, or tools
- Inconsistencies across multiple turns of the same conversation

### Recovery Patterns
- **Ground:** Force the agent to cite specific sources for claims
- **Verify:** Cross-check factual assertions against known data
- **Clarify:** Ask the agent to separate verified facts from inferences
- **Reset:** Discard hallucinated context and restart from last confirmed state

---

## 2. Repetition

**Definition:** The agent loops or cycles, repeating similar actions, questions, or outputs without making progress.

### Detection Signals
- Identical or near-identical responses appearing multiple times
- Circular reasoning that returns to earlier premises
- Re-asking questions already answered in the conversation
- Executing the same tool call with identical parameters repeatedly
- Failing to incorporate feedback from previous iterations

### Recovery Patterns
- **Interrupt:** Explicitly halt the loop and state the repetition
- **Reframe:** Restate the goal in different terms to break pattern
- **Progress check:** Demand a summary of what has changed vs. last iteration
- **Constraint:** Add explicit "do not repeat" guard to next prompt

---

## 3. Scope Drift

**Definition:** The agent gradually expands or shifts the task scope beyond original boundaries without explicit authorization.

### Detection Signals
- Introduction of new subtasks not in the original request
- Addressing edge cases not relevant to core objective
- Adding features, checks, or validations beyond stated requirements
- Lengthening the solution beyond what was asked
- Mixing related but distinct goals into one output

### Recovery Patterns
- **Re-anchor:** Restate the original scope explicitly
- **Bound:** Set hard constraints on what is in/out of scope
- **Split:** Divide work into discrete phases, finish one before starting next
- **Validate:** Confirm each deliverable against original requirements

---

## 4. Premature Conclusion

**Definition:** The agent finalizes an answer or plan before gathering sufficient information, leading to incorrect or incomplete results.

### Detection Signals
- Answer delivered in first response without exploration
- Key assumptions stated as facts without verification
- Skipping intermediate steps that would catch errors
- Declaring "done" before addressing obvious edge cases
- Failing to ask clarifying questions on ambiguous requirements

### Recovery Patterns
- **Expand:** Require exploration of alternatives before concluding
- **Question:** Force the agent to list assumptions and validate each
- **Iterate:** Make preliminary conclusion provisional pending review
- **Stake:** Ask "what would change your mind?" to expose gaps

---

## 5. Tool Misuse

**Definition:** The agent incorrectly uses available tools — wrong parameters, wrong tool choice, misinterpreting results, or ignoring tool constraints.

### Detection Signals
- Tool call errors or malformed parameters
- Choosing a tool that doesn't fit the stated subgoal
- Ignoring tool documentation or stated limitations
- Misreading tool output (e.g., treating errors as successes)
- Chaining tools in an invalid sequence

### Recovery Patterns
- **Review:** Show the agent the tool spec before next call
- **Validate:** Check tool output against expected format before proceeding
- **Simplify:** Use the most basic tool to establish a working baseline
- **Trace:** Walk through the tool chain step-by-step to find the break

---

## Usage Notes

This taxonomy should be used during:
- **Pre-execution review:** Anticipate which failure modes are most likely for a given task
- **Post-execution diagnosis:** Classify what went wrong when results are unsatisfactory
- **Guard design:** Map failure modes to prevention/detection/recovery controls

Each failure mode has a distinct signature — detecting one does not imply others are absent. Compound failures (e.g., hallucination feeding repetition) require layered recovery.
