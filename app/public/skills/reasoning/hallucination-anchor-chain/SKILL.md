---
source: "jerry-skills"
name: hallucination-anchor-chain
category: reasoning
description: Force every factual claim to be anchored to a verified source. Unanchored claims are marked unverified and hidden from outputs. Builds a verifiable chain of evidence to eliminate hallucination.
...



---

# Hallucination Anchor Chain

## Objective

Eliminate hallucinated claims by requiring every factual statement to link to a verified source. Claims form a chain — each new claim must anchor to a previous anchor or add a new one from an authoritative source.

## When to Use

- Research tasks where accuracy matters more than speed
- Code generation using external APIs/libraries (anchor the API surface)
- Any task where the agent might "fill in" unknown facts
- Multi-step reasoning where errors compound

## Workflow (Strictly Follow)

### 1. Initialize Anchor Store

Create `anchors.jsonl` in the working directory. Each line is one anchor:

```json
{"id": "a1", "claim": "httpx.AsyncClient supports timeout parameter", "source": "https://www.python-httpx.org/api/#asyncclient", "verified": true, "parent": null, "timestamp": "2026-05-05T10:00:00Z"}
```

Fields:
- `id` — unique anchor ID (a1, a2, ...)
- `claim` — the factual statement
- `source` — URL, file path, or authoritative reference
- `verified` — true if source was actually checked
- `parent` — ID of the anchor this depends on (null for roots)
- `timestamp` — when the anchor was added

### 2. Before Making Any Claim

Check: does this claim have an anchor?

- **Yes, verified** → proceed, cite the anchor ID in output (e.g., `[a3]`)
- **Yes, unverified** → upgrade to verified by checking the source, or mark output as "unverified"
- **No** → pause. Either:
  - Add a new anchor (requires verifying the source), OR
  - Refuse to make the claim

### 3. Adding New Anchors

When you discover a new fact from a source:

1. Search `anchors.jsonl` to avoid duplicates
2. Assign next ID (increment from highest existing)
3. Set `verified: true` ONLY if you actually checked the source
4. Link to parent anchor if this builds on a previous claim

### 4. Before Final Output

Run an anchor audit:
- Scan output for claims not marked with `[aN]`
- For each unanchored claim: either add anchor or remove the claim
- Produce final output with anchor citations

### 5. The Anchor Chain Rule

New anchors must link to the chain:
- Root anchors (parent: null) = foundational facts from authoritative sources
- Child anchors (parent: "aN") = claims that depend on a previous anchor

Broken chains (an anchor with a non-existent parent) are invalid and must be fixed.

## Companion Script

`scripts/anchor_chain.py` — pure stdlib Python:

- `init` — create empty anchors.jsonl
- `add <claim> <source>` — register new anchor (verified=false)
- `verify <anchor_id>` — mark anchor as verified after checking source
- `check <text>` — scan text for claims without anchors
- `audit` — find broken chains, duplicates, unverified anchors
- `export` — produce a citations list for the current session

## Usage Example

```
User: "How do I set a timeout in httpx?"

Agent (using this skill):
1. Check anchors.jsonl for httpx timeout info → not found
2. Add anchor: a1 = "httpx.AsyncClient supports timeout parameter" from https://www.python-httpx.org/api/
3. Verify a1 by fetching the docs → verified=true
4. Answer: "Use the timeout parameter [a1]"

User: "What about timeouts in requests?"

Agent:
1. Check anchors → not found
2. Add anchor: a2 = "requests.get supports timeout parameter" from https://requests.readthedocs.io/ (parent: null, verified after fetch)
3. Answer: "Pass timeout=5 as a keyword arg [a2]"
```

## Pitfalls

- **Anchor inflation:** Don't anchor obvious truths ("Python is a programming language"). Only anchor claims that could be wrong.
- **False verification:** Marking `verified: true` without actually checking the source. The script's `verify` command should require a manual confirmation step.
- **Broken chains:** Forgetting to set `parent` correctly. An anchor about "httpx timeout defaults" should have parent a1 (the anchor about httpx timeout existing).
- **Over-citing:** Don't add `[a1]` to every sentence. Cite once per distinct claim.

## Integration with Other Skills

- Use with `api-surface-anchoring` — each API surface entry becomes an anchor
- Use with `research` skill — research findings become anchored claims
- Use before `tool-interactive-critic` — critic can verify anchors, not just style

## Rule of Thumb

If you can't point to a source you actually checked, you don't know it. Don't pretend you do.
