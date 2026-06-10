# Skill: Tool-Interactive Critic

## Purpose

Use this skill after an initial draft, answer, plan, code change, or recommendation already exists.

This skill is based on the CRITIC pattern: do not trust the first output blindly.  
Instead:
1. generate the initial output
2. choose the right external verification tool(s)
3. use those tools to critique the output
4. revise the output using tool-grounded feedback
5. stop when the main risks are either resolved or explicitly declared

This is a **post-generation verification skill**.

It is especially useful when the agent’s main weakness is not generation, but **unverified confidence**.

---

## Best Use-Cases

Use this skill for:
- factual answers
- technical explanations
- code review with tests or search
- plans that depend on current facts
- operational recommendations
- tool-using agents
- outputs where external verification materially improves trust

Good fit:
- “This looks plausible, but verify it.”
- “Check this against tools before finalizing.”
- “Revise this only after external feedback.”

Bad fit:
- pure brainstorming
- highly subjective writing where external validation adds little
- trivial low-stakes tasks where the verification cost exceeds the benefit

---

## Core Behavior

The agent should behave like this:

### Step 1: Produce an Initial Output
Create the first answer, plan, code patch, recommendation, or explanation.

### Step 2: Identify What Needs Verification
Not every part of the output deserves the same scrutiny.

Possible targets:
- factual claims
- current data
- code correctness
- API behavior
- configuration assumptions
- safety assumptions
- dependency usage
- edge cases
- internal consistency

### Step 3: Choose the Right Tool(s)
Examples:
- web search for current facts
- documentation lookup for library/API behavior
- tests/lint/typecheck for code changes
- grep/search for codebase assumptions
- calculators for numeric reasoning
- schema inspection for data assumptions

The tool should match the failure mode.

### Step 4: Generate Critiques from Tool Feedback
Use the tool output to critique:
- what is correct
- what is weak
- what is contradicted
- what is still unverified
- what needs revision

### Step 5: Revise the Output
Revise only where the critique actually matters.
Do not rewrite everything just because a tool was used.

### Step 6: Stop
Stop when:
- the key claims are verified
- the major issues are corrected
- remaining uncertainty is clearly stated
- another pass would have low value

---

## Critique Template

```md
## Initial Output Type
<answer / plan / code / recommendation / summary>

## Verification Targets
- <target>

## Tools Chosen
- <tool>: <why>

## Tool Findings
- <finding>

## Critique
- Verified:
- Contradicted:
- Weak / uncertain:
- Needs revision:

## Revised Output Changes
- <change>

## Remaining Uncertainty
- <uncertainty>
```

---

## Agent Rules

### Do
- verify the high-risk or high-value parts first
- choose tools that directly test the likely failure mode
- let tool output shape the critique
- revise only where evidence supports revision
- keep unverified parts explicitly marked if needed

### Do Not
- use tools performatively
- verify everything equally
- revise without any real critique
- hide contradictions found by tools
- keep looping once the main risks are resolved

---

## When to Use It

Invoke this skill when:
- the output is plausible but not yet trustworthy
- the task depends on facts the model may be shaky on
- code or planning assumptions can be tested externally
- you want a verification layer between first draft and final answer
- a high-value answer deserves a “grounded second pass”

---

## Strong Invocation Examples

### Factual answer
“Use Tool-Interactive Critic. Draft the answer, verify the key claims with the right tools, critique the weak parts, then revise.”

### Code output
“Use Tool-Interactive Critic. After proposing the change, validate it with tests/search/static checks and revise only where the evidence says the draft is weak.”

### Plan
“Write the plan first, then use tools to challenge its assumptions before finalizing it.”

---

## Good Pairings

- **ETTO** -> decide how much verification is warranted
- **Agentic Patterns Orchestrator** -> insert this as a post-generation verification phase
- **How to Solve It** -> use after initial diagnosis or solution proposal
- **Unsafe Control Actions / Hazard Analysis** -> verify safeguards and assumptions for risky actions

---

## Failure Modes This Skill Prevents

- confident but unverified answers
- “looks right” code or plans with hidden factual flaws
- hallucinated current details
- revision without evidence
- polishing the wording while leaving the substance untested

---

## Quick Summary

Use this after the first draft when external tools can materially improve trust.

Draft first.  
Verify with the right tools.  
Critique from evidence.  
Revise only where needed.  
Stop when the major weaknesses are resolved.
