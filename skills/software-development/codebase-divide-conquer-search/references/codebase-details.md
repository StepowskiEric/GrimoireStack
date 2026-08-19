# Codebase Divide-and-Conquer — Script & Walkthrough

## Companion script

`scripts/codebase_summarize.py` — generates the hierarchical summary tree and ranks candidates by semantic similarity (local embeddings, no API key).

### Setup

```bash
# Install the skill
npx GrimoireStack install --agent copilot --skill codebase-divide-conquer-search

# Copy the script (npx install does not copy scripts)
mkdir -p ~/.copilot/skills/scripts
cp scripts/codebase_summarize.py ~/.copilot/skills/scripts/

# Python dependencies
pip install tree-sitter tree-sitter-python tree-sitter-javascript tree-sitter-typescript sentence-transformers
```

### Generate summaries only

```bash
python scripts/codebase_summarize.py /path/to/repo \
  --output summaries.json \
  --include "*.py,*.ts,*.js" \
  --exclude "node_modules,dist,build,__pycache__"
```

Output: JSON tree of files → classes → methods, each with a one-line summary.

### Query and rank

```bash
python scripts/codebase_summarize.py /path/to/repo \
  --query "Where is session validation logic that checks JWT expiry?" \
  --output rankings.json \
  --top-k 5
```

Output: ranked zones, each with files, rationale, and confidence.

### Options

- `--include`: glob patterns for source files (default `*.py,*.ts,*.js,*.tsx,*.jsx`)
- `--exclude`: patterns to skip (default `node_modules,dist,build,__pycache__,.git`)
- `--model`: sentence-transformers model (default `all-MiniLM-L6-v2`)
- `--chunk-size`: max tokens per summary chunk (default 256)

## Why the limits exist

- **~50 candidate files** — GenLoc's sweet spot for static candidate sets
- **3–5 zones** — AgentGroupChat-V2: parallel sub-agents scale sub-linearly; diminishing returns after 5
- **~13K–50K tokens per zone** — Meta-RAG's context sweet spot
- **10 tool calls per sub-agent** — GenLoc's iteration limit
- **Summaries beat raw code** — Meta-RAG: 84.67% vs 33.67% (BM25)

## Bug-localization walkthrough

**Query:** "Bug: users are logged out after 5 minutes instead of 30 minutes. Find where session TTL is set."

1. **Comprehend** — script or manual scan of files touching "session", "ttl", "expiry", "jwt".
2. **Divide** — zones:
   - Zone 1: `src/auth/session.ts`, `src/auth/config.ts`
   - Zone 2: `src/api/middleware.ts`, `src/api/routes.ts`
   - Zone 3: `src/db/models/session.ts`, `src/cache/redis.ts`
3. **Conquer** — Zone 1 returns `[{"file": "src/auth/config.ts", "lines": "8", "why": "SESSION_TTL = 300000 (5 min in ms)", "confidence": 0.98}]`; Zone 2 returns a low-confidence non-match; Zone 3 returns empty.
4. **Synthesize** — top finding `src/auth/config.ts:8`, single source, no contradiction, no deepen needed.

## Integration with other skills

| Skill | How to combine |
|-------|---------------|
| `keyword-agnostic-logic-locator` | Phase 1, for structural queries when semantic similarity is ambiguous |
| `explore-codebase` | Phase 0, to bootstrap the summary tree via code-review-graph MCP |
| `how-to-solve-it-state-machine` | Before this skill, to frame the search query precisely |
| `tree-of-thoughts` | Phase 1, for branching hypotheses about where the target lives |
| `debug-subagent` | Phase 2, as the conquer-agent template for bug-specific queries |
