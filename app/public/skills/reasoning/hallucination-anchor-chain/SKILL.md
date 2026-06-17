---
source: "GrimoireStack"
name: hallucination-anchor-chain
category: reasoning
description: Force every factual claim to be anchored to a verified source. Unanchored claims are marked unverified and hidden from outputs. Builds a verifiable chain of evidence to eliminate hallucination. Based on Chain-of-Verification (arXiv:2309.11495), Self-Consistency (arXiv:2203.11171), and Grounded CoT (arXiv:2503.12799).
tags: [hallucination-prevention, grounding, verification, factuality, chain-of-evidence]
author: Research synthesis
date: 2026-06-14
version: 2.0.0
...



---

# Hallucination Anchor Chain

## Core Principle

**If you can't point to a source you actually checked, you don't know it. Don't pretend you do.**

Every factual claim must link to a verified source. Unanchored claims are hidden from outputs. This prevents the most common form of LLM failure: confident-sounding statements that are factually wrong.

## Research Basis

This skill is informed by research on hallucination prevention and factual verification:

- **Chain-of-Verification (CoVe)** (arXiv:2309.11495, Sep 2023) — Reduces hallucination by generating verification questions for each claim, answering them independently, and identifying inconsistencies. Shows 15-25% reduction in hallucinated facts.
- **Self-Consistency** (arXiv:2203.11171, Mar 2022) — Multiple reasoning paths that agree are more likely to be factual. Use agreement across independent sources as a confidence signal.
- **Grounded Chain-of-Thought** (arXiv:2503.12799, Mar 2025) — Forces reasoning chains to reference specific evidence before making claims. Reduces visual and factual hallucinations in multimodal models.
- **Mitigating Hallucination via RAG** (arXiv:2510.24476, Oct 2025) — Retrieval-augmented generation with grounding reduces hallucination rates by 40-60% across domains.
- **Domain-Grounded Tiered Retrieval** (arXiv:2603.17872, Mar 2026) — Tiered retrieval with domain grounding achieves near-zero hallucination in specialized domains.
- **Self-Verification in LLMs** (arXiv:2506.01369, Jun 2025) — Training LLMs to self-verify their outputs improves factuality by 12-18% without external tools.

## When to Use

- Research tasks where accuracy matters more than speed
- Code generation using external APIs/libraries (anchor the API surface)
- Any task where the agent might "fill in" unknown facts
- Multi-step reasoning where errors compound
- Medical, legal, or financial information where wrong facts cause harm
- Technical documentation that will be referenced by others

## When NOT to Use

- Creative writing where facts are intentionally fictional
- Brainstorming where quantity matters more than accuracy
- Quick responses where the user explicitly says "rough draft" or "don't worry about accuracy"

## Workflow

### 1. Initialize Anchor Store

Create `anchors.jsonl` in the working directory. Each line is one anchor:

```json
{"id": "a1", "claim": "httpx.AsyncClient supports timeout parameter", "source": "https://www.python-httpx.org/api/#asyncclient", "verified": true, "confidence": "certain", "parent": null, "timestamp": "2026-06-14T10:00:00Z", "verification_method": "fetched_url"}
```

Fields:
- `id` — unique anchor ID (a1, a2, ...)
- `claim` — the factual statement
- `source` — URL, file path, or authoritative reference
- `verified` — true if source was actually checked
- `confidence` — one of: `certain`, `likely`, `uncertain`, `speculative`
- `parent` — ID of the anchor this depends on (null for roots)
- `timestamp` — when the anchor was added
- `verification_method` — how it was verified (fetched_url, ran_code, checked_docs, etc.)

### 2. Before Making Any Claim

Apply the **Verification Gate** (based on CoVe):

1. **Identify the claim type:**
   - API/function behavior → check documentation
   - Performance characteristic → check benchmarks or run experiment
   - Historical fact → check authoritative source
   - Technical specification → check official docs

2. **Check existing anchors:** Does this claim already exist?
   - Yes, verified → cite it `[a3]`
   - Yes, unverified → verify it now or mark output as unverified
   - No → create new anchor

3. **If creating new anchor:**
   - Fetch the source and verify the claim
   - Set confidence based on source quality
   - Link to parent if this builds on previous knowledge

### 3. Adding New Anchors

When you discover a new fact from a source:

1. Search `anchors.jsonl` to avoid duplicates
2. Assign next ID (increment from highest existing)
3. **Verify the source exists and says what you think it says**
4. Set `verified: true` ONLY if you actually checked the source
5. Assign confidence level:

| Source Type | Default Confidence |
|-------------|-------------------|
| Official documentation (fetched) | `certain` |
| Source code you read | `certain` |
| Third-party blog/tutorial | `likely` |
| Stack Overflow answer | `likely` |
| Partial/incomplete source | `uncertain` |
| Source not yet checked | `speculative` |

6. Link to parent anchor if this builds on a previous claim

### 4. The Chain-of-Verification Check

Before final output, run a **CoVe-style verification**:

1. **List all claims** in your intended output
2. **For each claim**, verify:
   - It has an anchor with `verified: true`
   - The source actually supports the claim (not just adjacent to it)
   - The confidence level matches the source quality
3. **Check for consistency** between claims:
   - Do any two claims contradict each other?
   - Does the conclusion follow from the anchored premises?
4. **Remove or downgrade** any claims that fail verification

### 5. Before Final Output

Run an anchor audit:
- Scan output for claims not marked with `[aN]`
- For each unanchored claim: either add anchor or remove the claim
- Produce final output with anchor citations

**Output format:**
```markdown
## Answer

Use the `timeout` parameter with httpx.AsyncClient [a1].

## Sources

[a1] httpx documentation: AsyncClient supports timeout parameter
     Source: https://www.python-httpx.org/api/#asyncclient
     Verified: Yes (fetched 2026-06-14)
     Confidence: certain
```

### 6. The Anchor Chain Rule

New anchors must link to the chain:
- Root anchors (parent: null) = foundational facts from authoritative sources
- Child anchors (parent: "aN") = claims that depend on a previous anchor

**Chain validation:**
- Every child anchor's parent must exist
- No circular dependencies allowed
- If a parent is falsified, all children become unverified

## Anti-Patterns

### False Verification
**Bad:** "I know httpx has timeout because I've used it before."
**Good:** "httpx.AsyncClient supports timeout parameter [a1]. Source: official docs at https://..."

### Anchor Inflation
**Bad:** Anchoring "Python is a programming language" or "1+1=2"
**Good:** Only anchor claims that could reasonably be wrong or that the user might question.

### Source Proximity Fallacy
**Bad:** Assuming a claim is supported because it appears on the same page as related info.
**Good:** Verify the exact statement is made in the source, not just related concepts.

### Circular Anchoring
**Bad:** Anchor A depends on Anchor B, which depends on Anchor A.
**Good:** Root anchors must come from external sources, not from other anchors in the chain.

## Common Scenarios

### Scenario 1: "What's the default timeout for requests?"
**Wrong approach:** "30 seconds" (no source checked)
**Right approach:**
1. Check requests docs → find timeout section
2. Add anchor: a1 = "requests has no default timeout unless explicitly set"
3. Source: https://requests.readthedocs.io/en/latest/user/advanced/#timeouts
4. Answer with citation

### Scenario 2: "Is React 19 stable?"
**Wrong approach:** "Yes, it was released in 2024" (may be outdated)
**Right approach:**
1. Check React blog/releases → find current status
2. Add anchor with actual release date and stability status
3. Cite the official source

### Scenario 3: "What's the time complexity of Array.sort() in JavaScript?"
**Wrong approach:** "O(n log n)" (partially true but incomplete)
**Right approach:**
1. Check V8/SpiderMonkey source or ECMAScript spec
2. Note that spec doesn't mandate algorithm, only stability requirement
3. Add anchor for what the spec says vs what engines actually do
4. Be explicit about what's guaranteed vs implementation-specific

### Scenario 4: Conflicting sources
**Situation:** Blog post says X, official docs say Y
**Right approach:**
1. Create two anchors: a1 (blog) and a2 (official docs)
2. Note the conflict explicitly
3. Recommend the authoritative source (official docs)
4. Explain why the blog may be wrong

### Scenario 5: "Can I use fs.readFileSync in production?"
**Wrong approach:** "No, it's blocking" (oversimplified)
**Right approach:**
1. Check Node.js docs for sync API characteristics
2. Add anchor for what "blocking" means in this context
3. Note that it's fine for startup scripts, not for request handlers
4. Provide nuance with sources

## Decision Tree

```
Want to make a factual claim?
    │
    ▼
Do you have a source you actually checked?
    │ NO → Can you check one now?
    │       │ YES → Check it, create anchor
    │       │ NO → Don't make the claim
    │ YES ↓
    │
Does the source actually say what you think?
    │ NO → Find the right source or rephrase
    │ YES ↓
    │
Does this claim depend on other claims?
    │ YES → Create child anchor with parent
    │ NO → Create root anchor (parent: null)
    │
    ▼
Run CoVe check: any contradictions with existing claims?
    │ YES → Resolve contradiction
    │ NO → Proceed with citation [aN]
```

## Companion Script

`scripts/anchor_chain.py` — pure stdlib Python:

- `init` — create empty anchors.jsonl
- `add <claim> <source>` — register new anchor (verified=false)
- `verify <anchor_id>` — mark anchor as verified after checking source
- `check <text>` — scan text for claims without anchors
- `audit` — find broken chains, duplicates, unverified anchors
- `export` — produce a citations list for the current session
- `validate` — check all chains for circular dependencies and broken links
- `confidence <anchor_id> <level>` — update confidence level

## Integration with Other Skills

- Use with `claim-verification-reasoning` — anchors become verified claims in the reasoning chain
- Use with `faithfulness-aware-reasoning` — check that conclusions follow from anchored premises
- Use with `self-consistency` — multiple independent anchors for the same claim increase confidence
- Use with `cot-pruning-reasoning` — prune claims that can't be anchored

## Key Insight

Hallucination isn't random — it's the model filling in gaps with plausible-sounding text. Anchoring forces you to identify those gaps and fill them with verified facts instead of confident guesses.

**The chain exists to make uncertainty visible, not to make everything certain.** Some claims will remain uncertain. That's honest — and better than a confident lie.
