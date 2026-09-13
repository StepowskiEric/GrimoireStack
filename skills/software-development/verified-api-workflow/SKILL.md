---
name: verified-api-workflow
description: "Prove every version-pinned API claim with web search before writing code on top of it."
triggers:
  - Writing code that calls external libraries/APIs
  - Claiming an app version supports a language feature (Unity 6.06 + C# records)
  - Building against APIs that change frequently (FastAPI, httpx, newer frameworks)
  - Code review — verify someone else's API usage
disable-model-invocation: true
---

# Verified API Workflow

Prove every version-pinned API claim with your harness's web search plus page fetch, then write code only on top of proved claims.

A claim is version-pinned when the answer changes with the version: "Unity 6.06 supports C# 9, so `record` types are unavailable" is version-pinned; "Python has `print()`" is not. Every version-pinned claim ends in one of two states: `proved` (evidence bundle below is complete) or `unproved` (blocked — no code is written on top of it).

## Workflow (Strictly Follow)

### Step 1: Extract version-pinned claims

List each claim plus the exact app/library version it depends on. Include negative claims ("X is unavailable in version Y").

Completion: every version-pinned claim the code depends on is listed with its exact version string. No claim proceeds on memory alone.

### Step 2: Search and fetch with your harness tools

Use your harness's web search and page-fetch capability to retrieve the current source for the targeted version. Search for the version string together with the feature (e.g. `"Unity 6.06" "C# language version"`). Fetch the page behind promising hits — a search snippet alone never counts as proof.

Prefer sources in this order: official versioned docs, then changelog or migration guide, then official forum or tracker, then third-party write-ups. When sources conflict, the claim is `unproved` until the official versioned doc resolves it.

Completion: every claim has a fetched page whose quoted passage contains the exact version string and the feature statement together.

### Step 3: Record the proof bundle

Append one line per claim to `anchors.jsonl`:

```json
{"id": "a1", "claim": "Unity 6.06 supports C# 9, so record types are unavailable", "version": "6.06", "source": "https://docs.unity3d.com/6000.6/Documentation/Manual/csharp-compiler.html", "quote": "Unity 6000.6 uses C# 9", "verified": true, "verified_at": "2026-09-12T00:00:00Z", "parent": null}
```

Link related anchors through `parent` (e.g. "Unity 6.06 uses C# 9" is the parent of "`record` is unavailable in Unity 6.06"). A bundle counts as `proved` only when `version`, `source`, `quote`, and `verified_at` are all present and the quote contains the version string.

Completion: every version-pinned claim has a complete bundle, and every `parent` id points at an existing anchor.

### Step 4: Write code only on proved claims

Write code referencing only `proved` anchors. Cite the anchor at the decision the claim supports:

```csharp
// [a1] Unity 6.06 = C# 9, so no record types — use a plain class.
public class PlayerState { public int Health; }
```

Completion: every version-dependent decision in the diff cites a `proved` anchor, and no code rests on an `unproved` claim.

### Step 5: Audit before delivering

Confirm: all version-pinned claims have bundles, all bundles are `proved`, all `parent` links resolve, and no quoted passage is a search snippet. Fix gaps before delivering — an `unproved` claim blocks the code that depends on it.

Completion: zero `unproved` claims underpinning shipped code, zero dangling parents, zero snippet-only quotes.

## Companion Script

`scripts/verified_api.py` is bookkeeping only — it never fetches docs and never proves anything. Search proves; the script tracks:

- `init` — create empty `api-surface.jsonl` and `anchors.jsonl`
- `scan <file.py>` — list calls lacking anchors (Python-only heuristic)
- `audit` — check bundles are complete and parents resolve
- `export` — produce a citations report from `anchors.jsonl`

## Usage Example

```text
User: "Does Unity 6.06 support C# records?"

Step 1: claim = "Unity 6.06 supports C# 9, so record types are unavailable", version = "6.06".
Step 2: web search `"Unity 6.06" "C# language version"`, fetch the versioned
  Unity docs page, confirm the passage names both the version and C# 9.
Step 3: append the proof bundle to anchors.jsonl with version, source URL,
  verbatim quote, and verified_at.
Step 4: write the fallback plain class and cite [a1] at the decision.
Step 5: audit — every version-dependent line traces to a proved bundle.
```

```text
User: "Build a FastAPI 0.115 app with JWT auth"

Step 1: claims = "FastAPI 0.115 exposes FastAPI(title=...)",
  "pyjwt 2.8 exposes jwt.encode(payload, key)", each with its exact version.
Step 2: search plus fetch the 0.115 reference and the 2.8 reference.
Step 3: record one bundle per claim with quote plus verified_at.
Step 4: code cites [a1], [a2]; unproved calls stay out of the diff.
```

## Integration with Other Skills

- **api-surface-anchoring:** signature-level companion — use it when the claim is about exact parameters rather than version availability.
- **verify-before-integrate:** concept-to-schema companion — use it when paper or tutorial terminology may not match the target system's fields.

## Pitfalls

- **Verification theater:** a bundle with `verified: true` but no fetched quote is theater. Treat snippet-only or quoteless bundles as `unproved`.
- **Over-anchoring:** anchor claims that could be wrong (version availability, signatures, endpoints). Standard-library calls you use daily ride without anchors.
- **Broken chains:** a child anchor whose `parent` id has no bundle is dangling. Resolve parents before shipping.

## Rule of Thumb

If you're calling an external API and can't point to a doc you checked, you're about to hallucinate. Stop and verify.
