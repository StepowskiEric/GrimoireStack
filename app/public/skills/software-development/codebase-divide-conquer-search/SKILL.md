---
name: codebase-divide-conquer-search
description: Hierarchical multi-agent search protocol for large codebases. Compresses codebase via summarization, partitions into candidate zones via semantic similarity, spawns parallel sub-agents for deep investigation, and synthesizes ranked results with confidence scores.
...



---

# Skill: Codebase Divide-and-Conquer Search

## ⚠️ Two Usage Modes

This skill works in **two modes**. Pick the one that fits your setup.

### Mode A: With Python Script (Recommended for large codebases)

A companion script generates hierarchical summaries and ranks candidates by semantic similarity. This gives you the ~80% codebase compression and automated candidate shortlisting proven in the research.

**Quick Setup:**
```bash
# 1. Install the skill (gets the .md file)
npx jerry-skills install --agent copilot --skill codebase-divide-conquer-search

# 2. Copy the script (manual step — npx install does not copy scripts)
mkdir -p ~/.copilot/skills/scripts
cp scripts/codebase_summarize.py ~/.copilot/skills/scripts/

# 3. Install Python dependencies
pip install tree-sitter tree-sitter-python tree-sitter-javascript tree-sitter-typescrip sentence-transformers
```

### Mode B: Pure Agent Protocol (No scripts)

Use this mode when you cannot run local Python or the codebase is small enough that the agent's built-in tools (search_files, code-review-graph MCP, delegate_task) are sufficient. The protocol below works identically — you manually perform the Comprehend and Divide phases using agent tools instead of the script.

___


## Purpose

Find code in a codebase too large to fit in context — a bug to fix, a feature to modify, related code, or where an API is consumed.

This protocol implements the convergent algorithm found across five recent research papers on LLM-based bug localization and multi-agent code search:

| Paper | arXiv | Core Technique | Key Result |
|-------|-------|---------------|------------|
| Meta-RAG on Large Codebases | 2508.02611 | Multi-agent + hierarchical code summarization + RAG | 84.67% file-level localization; 79.8% codebase compression |
| GenLoc (Explorative IRBL) | 2508.00253 | ReAct iterative exploration over semantic retrieval shortlist | 44-63% Accuracy@1; outperforms all baselines on SWE-bench |
| AgentGroupChat-V2 | 2506.15451 | Divide-and-conquer task forest with parallel agent groups | 91.5% GSM8K; 64.6% improvement scaling 2→5 agents |
| RepoAudit | 2501.18160 | Demand-driven path-sensitive analysis (Initiator→Explorer→Validator) | 78.43% precision, $2.54/project, 0.44hr/project |
| Code-Craft (HCGS) | 2504.08975 | Hierarchical graph-based code summarization for retrieval | +82% Pass@1 on complex codebases vs flat embeddings |

All five papers agree on the same 4-phase structure. This skill operationalizes it for agent execution.

___


## When to Use

- The codebase is too large to fit in the LLM context window (>50K tokens of relevant code)
- `grep` or simple semantic search returns too many candidates
- You need to find code by behavior, not by name (vocabulary mismatch)
- The search target could be in any of several modules or layers
- You have a bug report, feature request, or architectural question with no obvious starting file

**Do not use when:**
- You already know the exact file and function name
- The codebase is small (<20 files) and easily searchable
- You are doing a simple text replacement across known files

___


## The Convergent Algorithm

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. COMPREHEND  │────▶│  2. DIVIDE      │────▶│  3. CONQUER     │────▶│  4. SYNTHESIZE  │
│                 │     │                 │     │                 │     │                 │
│ Build hierarchy │     │ Semantic rank   │     │ Sub-agent deep  │     │ Merge, resolve, │
│ of summaries    │     │ into candidate  │     │ dives per zone  │     │ rank by conf    │
│ (80% compress)  │     │ zones (~50 max) │     │ (tool calls)    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   File/Class/Func          Top-K zones            Evidence + locs
   summary tree             per sub-agent          per candidate
```

Why this works:
- **Meta-RAG** proved summaries beat raw code retrieval (84.67% vs 33.67% for BM25)
- **GenLoc** proved iterative exploration with tool calls beats static candidate sets
- **AgentGroupChat-V2** proved divide-and-conquer parallelization scales sub-linearly
- **RepoAudit** proved demand-driven traversal avoids path explosion
- **Code-Craft** proved hierarchical graph summarization enables multi-resolution zoom

___


## Phase 0: Setup / Comprehend

**Goal:** Build a hierarchical summary tree of the codebase.

### Mode A (with script)

```bash
python scripts/codebase_summarize.py /path/to/repo \
  --output summaries.json \
  --include "*.py,*.ts,*.js" \
  --exclude "node_modules,dist,build,__pycache__"
```

The script outputs a JSON tree:
```json
{
  "files": [
    {
      "path": "src/auth/session.ts",
      "summary": "Manages user sessions via JWT tokens...",
      "classes": [
        {
          "name": "SessionManager",
          "summary": "Core session lifecycle: create, validate, destroy",
          "methods": [
            {"name": "validate", "signature": "validate(token: string): Session", "summary": "Verifies JWT signature and expiry"}
          ]
        }
      ],
      "functions": [
        {"name": "middleware", "signature": "middleware(req, res, next)", "summary": "Express middleware that attaches session to request"}
      ]
    }
  ]
}
```

### Mode B (without script)

Use agent tools to build the summary tree manually:

1. Run `search_files` to list all source files (e.g., `*.ts`, `*.py`)
2. For each major directory/module, read 1-2 representative files
3. Summarize each file in a scratchpad:
   ```
   File: src/auth/session.ts
   - Exports: SessionManager class, middleware function
   - Responsibilities: JWT validation, session lifecycle
   - Dependencies: jsonwebtoken, ./db
   ```
4. Stop when you have a file-level summary for every major module. Target: <100 words per file.

**Research constraint:** Meta-RAG achieves 79.8% compression by summarizing at file/class/function granularity. Do not skip the function level for files >200 lines.

___


## Phase 1: Query Embedding & Divide

**Goal:** Use semantic similarity to partition the codebase into candidate zones.

### Mode A (with script)

```bash
python scripts/codebase_summarize.py /path/to/repo \
  --query "Where is session validation logic that checks JWT expiry?" \
  --output rankings.json \
  --top-k 5
```

The script:
1. Embeds your query using `all-MiniLM-L6-v2` (local, no API key)
2. Embeds every file/class/function summary
3. Ranks by cosine similarity
4. Partitions top-K into non-overlapping zones (1 zone per sub-agent)

Output:
```json
{
  "zones": [
    {
      "zone_id": 1,
      "files": ["src/auth/session.ts", "src/auth/middleware.ts"],
      "rationale": "SessionManager.validate and middleware both handle JWT expiry",
      "confidence": 0.94
    }
  ]
}
```

### Mode B (without script)

1. Write the search query as a natural language sentence (not keywords)
2. Use `search_files` with regex heuristics to build a coarse candidate list (~50 files)
3. Read the top 10 most promising files briefly (first 30 lines + exports)
4. Assign files to zones manually:
   - Zone 1: files clearly related to the query
   - Zone 2: files that call into Zone 1
   - Zone 3: files that configure or initialize the relevant subsystem
   - Discard files with no plausible connection

**Research constraints:**
- Max candidate pool: ~50 files (GenLoc sweet spot)
- Max zones (sub-agents): 3-5 (AgentGroupChat-V2: diminishing returns after 5)
- Context budget per zone: ~13K-50K tokens (Meta-RAG sweet spot)

___


## Phase 2: Conquer (Parallel Sub-Agent Deep Dives)

**Goal:** Spawn one sub-agent per zone to investigate deeply and return evidence.

Use `delegate_task` to spawn parallel sub-agents. Each sub-agent receives:

```
Zone: {{zone_id}}
Files in zone: {{file_list}}
Query: {{original_query}}

Your mandate:
1. Read every file in this zone.
2. Search for code relevant to the query using search_files, read_file, and query_graph.
3. For each candidate location, extract:
   - File path
   - Line number range
   - A 1-sentence explanation of why it matches
   - Confidence (0.0-1.0)
4. If you need to explore outside the zone (callers, callees), do so but stay within 10 tool calls total.
5. Return ONLY a JSON array of findings. No prose.

Return format:
[
  {"file": "...", "lines": "45-67", "why": "...", "confidence": 0.92}
]
```

**Research constraints:**
- Iteration limit: 10 tool calls per sub-agent (GenLoc)
- Always include file paths + line numbers in evidence
- Sub-agents should use ReAct-style interleaving: reason → act (search/read) → observe → repeat

___


## Phase 3: Synthesize

**Goal:** Merge sub-agent reports, resolve contradictions, rank by confidence.

### Merge Rules

1. **Deduplicate:** Same file + overlapping line ranges = same finding. Keep the higher confidence.
2. **Cross-validate:** If two zones point to the same location independently, boost confidence (+0.1, cap at 1.0).
3. **Resolve contradictions:** If Zone A says "the bug is in X" and Zone B says "X is irrelevant", read X directly and adjudicate.
4. **Rank by evidence strength:**
   - Direct implementation match > caller of match > configuration of match
   - Line-specific evidence > file-level guess

### Output Format

```yaml
codebase_search_results:
  query: "Where is session validation logic that checks JWT expiry?"
  findings:
    - file: "src/auth/session.ts"
      lines: "45-67"
      function: "SessionManager.validate"
      confidence: 0.94
      evidence: "Reads token, calls jwt.verify, checks expiry field"
      supporting_zones: [1, 3]

    - file: "src/auth/middleware.ts"
      lines: "12-28"
      function: "middleware"
      confidence: 0.88
      evidence: "Calls SessionManager.validate on every request"
      supporting_zones: [1]

  false_positives_filtered:
    - file: "src/auth/types.ts"
      reason: "Only defines Session interface, no validation logic"
```

___


## Phase 4: Deepen (Optional)

**Goal:** If top result is uncertain, re-run Phases 1-3 at finer granularity.

Trigger when:
- Top confidence < 0.75
- Multiple findings have nearly equal confidence (within 0.1 of each other)
- The query is about a specific function/line and you only have file-level results

Action:
1. Take the most promising zone (usually 1-2 files)
2. Re-summarize at function-level or block-level
3. Re-run Divide + Conquer on just that zone
4. Return refined results

This implements the **GenLoc ReAct iterative deepening** and **Meta-RAG hierarchical drill-down**.

___


## State Machine

### State 0 — Comprehend
**Goal:** Build hierarchical summary tree.
**Action:** Run script or manually summarize files.
**Exit condition:** Summary tree exists covering all major modules.

### State 1 — Divide
**Goal:** Rank and partition into zones.
**Action:** Embed query, score summaries, allocate to sub-agents.
**Exit condition:** 3-5 non-overlapping zones identified, each fitting context budget.

### State 2 — Conquer
**Goal:** Parallel deep investigation.
**Action:** Spawn sub-agents per zone with scoped mandates.
**Exit condition:** All sub-agents returned findings JSON.

### State 3 — Synthesize
**Goal:** Merge, validate, rank.
**Action:** Deduplicate, cross-validate, resolve contradictions, output ranked list.
**Exit condition:** Final ranked findings with confidence scores.

### State 4 — Deepen (Conditional)
**Goal:** Refine if uncertain.
**Entry condition:** Top confidence < 0.75 or near-ties exist.
**Action:** Re-run States 1-3 on most promising zone at finer granularity.
**Exit condition:** Confidence >= 0.75 or max 2 deepening iterations reached.

___


## Tool Gating

### Comprehend phase
Allowed:
- Script execution (Mode A)
- search_files, read_file (Mode B)
- Diagnostic artifact writing

Disallowed:
- Code edits
- test execution that mutates state

### Divide phase
Allowed:
- Embedding / similarity scoring
- search_files, query_graph
- Zone assignment

### Conquer phase
Allowed:
- delegate_task (sub-agents)
- read_file, search_files, query_graph (inside sub-agents)

### Synthesize phase
Allowed:
- read_file (for adjudication)
- File edits only if the original task included fixing

___


## Circuit Breakers

Stop and reassess if:
- Summary generation fails for >30% of files (codebase may be too exotic)
- All zones return empty findings (query may be malformed or target may not exist)
- Sub-agents keep exploring outside their zones (zone boundaries were wrong)
- After 2 deepening iterations, confidence is still < 0.75 (escalate to human)

___


## Integration with Other Skills

| Skill | How to combine |
|-------|---------------|
| `keyword-agnostic-logic-locator` | Use in Phase 1 for structural queries when semantic similarity is ambiguous |
| `explore-codebase` | Use in Phase 0 to bootstrap the summary tree via code-review-graph MCP |
| `how-to-solve-it-state-machine` | Apply before this skill to frame the search query precisely |
| `tree-of-thoughts` | Use for branching hypotheses about where the target lives in Phase 1 |
| `debug-subagent` | Use as the Phase 2 conquer agent template when the query is bug-specific |

___


## Example: Bug Localization Walkthrough

**Query:** "Bug: users are logged out after 5 minutes instead of 30 minutes. Find where session TTL is set."

### Step 0 — Comprehend
Run script or manually identify files touching "session", "ttl", "expiry", "jwt".

### Step 1 — Divide
Zones assigned:
- Zone 1: `src/auth/session.ts`, `src/auth/config.ts`
- Zone 2: `src/api/middleware.ts`, `src/api/routes.ts`
- Zone 3: `src/db/models/session.ts`, `src/cache/redis.ts`

### Step 2 — Conquer
Sub-agent for Zone 1 returns:
```json
[
  {"file": "src/auth/config.ts", "lines": "8", "why": "SESSION_TTL = 300000 (5 min in ms)", "confidence": 0.98}
]
```

Sub-agent for Zone 2 returns:
```json
[
  {"file": "src/api/middleware.ts", "lines": "34", "why": "Passes req.session.ttl but does not set it", "confidence": 0.45}
]
```

Sub-agent for Zone 3 returns: `[]`

### Step 3 — Synthesize
Top finding: `src/auth/config.ts:8` with confidence 0.98. Single source, no contradiction. No deepen needed.

___


## Anti-Patterns

**Don't:**
- Skip the Comprehend phase and dump raw code into sub-agents (you lose the 80% compression benefit)
- Spawn >5 sub-agents (diminishing returns, coordination overhead)
- Let sub-agents edit code during search (read-only until Synthesize completes)
- Trust file-level similarity alone without line-level evidence
- Ignore contradictions between zones

**Do:**
- Keep summaries under 100 words per file
- Give sub-agents explicit tool-call budgets
- Include line numbers in all evidence
- Cross-validate findings across zones
- Deepen when confidence is borderline

___


## Script Reference

`scripts/codebase_summarize.py`

**Dependencies:**
```bash
pip install tree-sitter tree-sitter-python tree-sitter-javascript tree-sitter-typescript sentence-transformers
```

**Usage — Generate summaries only:**
```bash
python codebase_summarize.py /path/to/repo --output summaries.json
```

**Usage — Query and rank:**
```bash
python codebase_summarize.py /path/to/repo \
  --query "Where is authentication middleware?" \
  --output rankings.json \
  --top-k 5
```

**Options:**
- `--include`: Glob patterns for source files (default: `*.py,*.ts,*.js,*.tsx,*.jsx`)
- `--exclude`: Patterns to skip (default: `node_modules,dist,build,__pycache__,.git`)
- `--model`: Sentence-transformers model (default: `all-MiniLM-L6-v2`)
- `--chunk-size`: Max tokens per summary chunk (default: 256)

See script header for full usage.
