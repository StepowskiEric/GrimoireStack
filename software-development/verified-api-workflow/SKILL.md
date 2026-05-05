---
source: "jerry-skills"
name: verified-api-workflow
category: software-development
description: Hybrid of api-surface-anchoring + hallucination-anchor-chain. Every verified API surface entry becomes an anchor. Code using external APIs is fully traceable to docs you actually checked.
---

# Verified API Workflow

## Objective

Combine `api-surface-anchoring` and `hallucination-anchor-chain` into a single workflow where every external API call in your code is:
1. Verified against current docs (api-surface-anchoring)
2. Anchored as a claim with a source (hallucination-anchor-chain)

Result: **100% of external API calls are traceable to a doc you actually checked.**

## When to Use

- Writing code that calls external libraries/APIs
- Building against APIs that change frequently (FastAPI, httpx, newer frameworks)
- Any task where API hallucination would waste time debugging
- Code review — verify someone else's API usage

## Workflow (Strictly Follow)

### Phase 1: Surface Verification (api-surface-anchoring)

1. **Identify** all external imports/calls in your code
2. **Verify** each against current docs using `api_surface.py verify`
3. **Record** verified surfaces to `api-surface.jsonl`

### Phase 2: Anchor Creation (hallucination-anchor-chain)

4. **Convert** each verified surface entry to an anchor in `anchors.jsonl`:
   ```json
   {"id": "a1", "claim": "httpx.AsyncClient(timeout=5) is valid", "source": "https://www.python-httpx.org/api/", "verified": true, "parent": null}
   ```
5. **Link** related anchors (e.g., "httpx supports timeout" → parent of "httpx.AsyncClient(timeout=5)")

### Phase 3: Code Generation with Citations

6. **Write code** using ONLY verified anchors
7. **Cite anchors** in comments:
   ```python
   client = httpx.AsyncClient(timeout=5)  # [a1]
   ```
8. **Scan** for unanchored API calls before final output using `verified_api.py scan`

### Phase 4: Verification Loop

9. **Run** `verified_api.py audit` to check:
   - All API calls have anchors
   - All anchors are verified
   - No broken chains
10. **Fix** any gaps before delivering code

## Companion Script

`scripts/verified_api.py` — pure stdlib Python, combines both skills:

- `scan <file.py>` — find all external API calls, check if anchored
- `verify-all` — run api-surface-anchoring on all imports in a project
- `audit` — check api-surface.jsonl + anchors.jsonl consistency
- `export` — produce a citations report for the codebase
- `init` — create both api-surface.jsonl and anchors.jsonl

## Usage Example

```
User: "Build a FastAPI app with JWT auth"

Phase 1:
1. Identify: FastAPI, jwt, uvicorn
2. Verify surfaces:
   $ python api_surface.py verify fastapi --function FastAPI --version 0.115
   → api-surface.jsonl: FastAPI() signature verified
   $ python api_surface.py verify jwt --function encode --version 2.8
   → api-surface.jsonl: jwt.encode() signature verified

Phase 2:
3. Create anchors:
   $ python verified_api.py init
   $ python anchor_chain.py add "FastAPI() accepts app and middleware params" "https://fastapi.tiangolo.com/reference/fastapi/"
   → a1 created, verified=true

Phase 3:
4. Write code with citations:
   app = FastAPI(title="My App")  # [a1]
   token = jwt.encode(payload, secret)  # [a3]

Phase 4:
5. Audit:
   $ python verified_api.py audit
   ✓ All 8 API calls anchored and verified
```

## Integration with Other Skills

- **plan-with-judge:** The plan can specify "use verified-api-workflow" for any step involving external APIs
- **api-surface-anchoring:** This skill extends it with anchor tracking
- **hallucination-anchor-chain:** This skill auto-creates anchors from verified surfaces

## Pitfalls

- **Verification theater:** Marking `verified: true` without actually checking the docs. The script should require a manual confirmation step.
- **Over-anchoring:** Don't anchor "import os" or "print()". Only anchor calls that could be wrong.
- **Broken chains:** If you verify "jwt.encode" but not "jwt.decode", you have partial coverage. Audit catches this.

## Rule of Thumb

If you're calling an external API and can't point to a doc you checked, you're about to hallucinate. Stop and verify.
