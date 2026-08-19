---
name: context-budget-operator
description: "Track token budget, classify information needs, compress aggressively, and decide breadth-vs-depth based on remaining runway."
triggers:
  - large-codebase-session
  - long-session-budget
  - multi-file-parallel-read
  - cross-file-reasoning
---

# Context Budget Operator

**The context window is finite — and the failure is invisible until you contradict yourself.** In long sessions or large codebases, agents silently exceed the budget: earlier instructions drop out, reasoning fragments, coherence collapses. Treat token budget as a first-class resource: assess before every call, classify the information need, compress at the threshold, decide breadth vs depth on remaining runway, and log consumption to catch runaway growth.

## The Move

### 1. Assess — before every LLM call
Estimate where you stand: window limit, current usage, headroom, threshold. Approximate rates: English ~1.3 tokens/word, code ~0.5 tokens/word (symbols add up — under-estimation is the common failure), a line of code ~5–10 tokens, a reasoning paragraph ~50–100.

### 2. Classify — the lowest need level that answers the question
| Need | Cost |
|------|------|
| **Summary** — what does this file do? | 50–100 |
| **Signature** — what functions, what args? | 100–200 |
| **Section** — lines 50–100 only | 200–400 |
| **Full** — complete file | 500–3000 |
| **Multi-file** — cross-reference 3+ | 1500–8000 |

Default to the lowest level; escalate only when it proves insufficient. Reading full files "just in case" is the budget leak.

### 3. Compress — at the 50% threshold, before adding new content
Summarize older reasoning (keep conclusions, drop derivations), replace full reads with signature extracts, collapse multi-turn conversations into decision summaries, strip comments from quoted snippets, use ellipsis for boilerplate, offload to files/notes instead of inlining. Compress older reasoning first — never the user's instructions, task definition, or success criteria. Compression has overhead: apply it at the threshold, not from anxiety.

### 4. Decide — breadth vs depth on remaining budget R
- **R > 50%** → depth mode: full reads, deep exploration
- **R 25–50%** → balanced: summarize most files, read 1–2 key files fully
- **R < 25%** → breadth: signatures only, targeted searches — or pause and compress first
- **R < 10%** → halt: compress immediately or escalate to the user

When budget is constrained, state it explicitly: "budget constrained — choose the single most important check" (telling the agent it still has budget to explore is measurably effective).

### 5. Log — every operation that adds tokens
Track per-operation consumption and status color: **GREEN** (<50%, no action), **YELLOW** (50–75%, compress before next addition), **RED** (>75%, halt and compress), **BLACK** (>90%, stop, summarize and reset or escalate). State the budget status explicitly.

## Reference
For the companion script commands (`scripts/context_budget.py`: estimate, budget check, session tracking, compression suggestions), the compression techniques table, the worked example, and research basis, see [`references/budget-details.md`](references/budget-details.md).

## Rules
- **Do** estimate usage before every LLM call instead of guessing.
- **Do** default to summary/signature level — full reads are the exception, not the default.
- **Do** compress older reasoning first; the user's instructions are the last thing to touch.
- **Do** act on yellow/red status — logging without acting is neglect.
- **Do** offload to files and memory instead of inlining everything.
