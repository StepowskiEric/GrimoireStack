---
source: "jerry-skills"
name: api-surface-anchoring
category: software-development
description: Before writing code that calls any external library or API, verify its current API surface from authoritative docs. Prevents hallucinated signatures, wrong imports, and outdated parameters. Tracks verified surfaces in a durable artifact.
version: 1.0.0
priority: high
tags: [api, verification, hallucination-prevention, code-quality, documentation, sdk]
...



---

# API Surface Anchoring

## Overview

LLMs hallucinate API signatures they've never seen, or whose signatures changed post-cutoff. This is the #1 source of code that looks right but fails at runtime — wrong parameter names, missing imports, incompatible return types, removed methods.

**API Surface Anchoring** enforces a simple discipline: *before* writing any call to an external library or API, find and record its current authoritative signature. The companion script fetches signatures from PyPI docs, MDN, GitHub READMEs, or npm packages, and the skill ensures you never write an unverified API call.

Research basis: The pre-verification pattern mirrors **Chain-of-Verification** (Dhuliawala et al., 2023) — verify facts before building on them. Applied to API surfaces, this catches hallucinated signatures at the write site rather than at the runtime error.

## When to Use

- Using any external library, SDK, or API you are not 100% sure of
- Libraries released or updated after your LLM's training cutoff
- Niche or low-training-count libraries
- Internal/SDK packages whose API may differ from documentation
- Any code that imports from `pip install` packages, npm packages, or external REST/gRPC APIs

## When NOT to Use

- Standard library calls you use daily (Python `os.path`, `json.dumps`)
- Code you're writing against your own project's internal modules
- Trivial wrappers where the API surface is obvious from context
- Prototyping where correctness isn't critical

## Companion Script

This skill includes a companion Python script (`api_surface.py`) that automates verification lookups.

```bash
# Verify a function signature from PyPI docs or GitHub
python api_surface.py verify httpx 0.28 AsyncClient

# Verify an HTTP API endpoint
python api_surface.py verify-api "https://api.stripe.com/v1/charges" POST --headers "Authorization: Bearer sk_test_..."

# Show current session's verified surfaces
python api_surface.py status

# Check a file for unverified external calls
python api_surface.py check src/auth.py

# Fetch specific docs page
python api_surface.py fetch-docs https://docs.pydantic.dev/latest/api/base_model/
```

The script is pure Python stdlib — no `pip install` needed.

## Workflow

### Step 1: Identify External Calls

Before writing any code that calls an external library, REST endpoint, or SDK, identify every symbol you need:

- Module/package name and version (e.g., `httpx 0.28`)
- Function or class name (e.g., `AsyncClient`, `post`, `stream`)
- Required parameters and their types

Record these in `api-surface.jsonl`.

### Step 2: Find Authoritative Docs

Search for the *signature reference*, not tutorials or blog posts. The target is the exact parameter list, return type, and import path.

```bash
# Option A — use the companion script
python api_surface.py verify httpx AsyncClient

# Option B — web search for the reference doc
# Search: "httpx 0.28 AsyncClient signature site:pypi.org"
# Search: "httpx.AsyncClient reference"

# Option C — extract directly from the package
python -c "import httpx; help(httpx.AsyncClient)"
```

### Step 3: Anchor

Write the verified signature to `api-surface.jsonl` in the current directory:

```jsonl
{"symbol": "httpx.AsyncClient", "import": "from httpx import AsyncClient", "signature": "AsyncClient(*, auth=None, params=None, headers=None, cookies=None, verify=True, cert=None, http2=False, proxy=None, timeout=Timeout(timeout=5.0), follow_redirects=False)", "source": "https://www.python-httpx.org/api/#asyncclient", "version": "0.28.0", "verified_at": "2026-05-04T19:30:00Z", "yield": "high"}
```

### Step 4: Write Code Using Anchored Surfaces

Write code referencing only verified surfaces. If you need an unanchored symbol, repeat from Step 1.

```python
from httpx import AsyncClient  # verified

async with AsyncClient(timeout=30.0) as client:  # verified: timeout param exists
    response = await client.get("https://api.example.com")  # verified method
```

### Step 5: On Runtime Error

If you get an unexpected runtime error in external API code, **first** re-verify the API surface before debugging your logic. The error is often a signature mismatch, not a logic bug.

```bash
python api_surface.py verify httpx 0.28 --refresh
```

### Step 6: Session End Review

Review what was verified vs. what was used without verification:

```bash
python api_surface.py status --gap-analysis
```

## api-surface.jsonl Format

Each line is one verified API surface:

| Field | Type | Description |
|---|---|---|
| `symbol` | string | Fully qualified symbol name |
| `import` | string | Exact import statement |
| `signature` | string | Full signature including parameters |
| `source` | string | URL or command used to verify |
| `version` | string | Library version verified against |
| `verified_at` | string | ISO 8601 timestamp |
| `yield` | string | `"high"` (used in code) / `"medium"` (looked up but unused) / `"low"` (exploratory) |

## Important Rules

- **Verify before write** — Do not guess API signatures. If you haven't confirmed the exact parameter name, you don't know it.
- **Authoritative sources only** — PyPI docs, MDN, official GitHub repos, or language stdlib docs. Not blog posts, not Stack Overflow, not AI-generated summaries.
- **Stick to verified surfaces** — If you deviate from the anchored signature, verify the deviation separately.
- **Version matters** — Always note the library version. `httpx 0.27` and `0.28` have different timeout semantics.
- **No "I think"** — If you're unsure about a parameter, you haven't verified. Search.

## Pitfalls

- **Tutorials vs References**: Tutorials show patterns, not signatures. A tutorial might use `client.get(url)` without showing `verify=False` is a valid parameter. Always check the reference docs.
- **Version drift**: A verified surface from an older version may be wrong for the installed version. When running `pip install`, note the version.
- **Import path variations**: Some packages expose multiple import paths (e.g., `from httpx import Client` vs `import httpx`). Verify the import path separately from the usage.
- **REST API endpoints**: For external HTTP APIs, verify the endpoint path, method, headers, and response shape. The companion script's `verify-api` subcommand handles this via `curl` + doc extraction.
- **Cache staleness**: `api-surface.jsonl` accumulates across sessions. If you verify something in one session and use it in another, re-verify if the library version changed.

## Companion Script Details

### Installation

The script is included with the skill. When using `npx jerry-skills install --with-scripts`, it's copied alongside SKILL.md automatically:

```bash
npx jerry-skills install --agent hermes --skill api-surface-anchoring --with-scripts
```

For manual setup, copy `api_surface.py` alongside `SKILL.md` in the skill directory.

### Subcommands

- `verify <package> [symbol] [version]` — Fetch current signature from docs
- `verify-api <url> [method]` — Fetch and parse REST API endpoint docs
- `fetch-docs <url>` — Extract signature information from a docs page
- `status` — Show all verified surfaces for the current session
- `check <file>` — Scan a source file for unverified external calls (static analysis)
- `init` — Create an empty `api-surface.jsonl` in current directory

All subcommands support `--help` for detailed usage.

## Usage Example

```
User to agent: "Write a function that uploads files to S3 using boto3."

Agent (running this skill):
1. Identifies external calls needed: boto3.client("s3"), upload_file, put_object
2. Verifies each:
   python api_surface.py verify boto3 1.35 client
   → Confirms: boto3.client(service_name, region_name=None, ...)
   python api_surface.py verify boto3 1.35 upload_file
   → Confirms: upload_file(Filename, Bucket, Key, Callback=None, ...)
3. Anchors all three to api-surface.jsonl
4. Writes code referencing only verified parameters
5. On success: "3 surfaces verified, 0 guesses."
```

## See Also

- `assumption-grounding` — General verification-before-act discipline
- `verify-before-integrate` — Pre-commit verification for integrations
- `debug-subagent` — For debugging when verified code still fails
