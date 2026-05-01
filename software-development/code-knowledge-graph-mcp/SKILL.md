---
name: code-knowledge-graph-mcp
category: software-development
description: MCP server providing semantic code search, symbol resolution, and call-graph queries over a codebase. Zero-external-deps Python stdio server.
version: 1.0.0
priority: high
tags: [mcp, code-search, knowledge-graph, symbols, call-graph, stdio]
---

## Overview

This skill registers the `code-knowledge-graph` MCP server with Hermes Agent, making structured code queries available as tools.

**What it replaces:**
- Manually running `grep` and parsing text output
- Calling `extract_code_facts.py` and `query_code_facts.py` by hand
- Guess-and-check search through large codebases

**What the MCP gives you:**
- `index_repo` — build a graph of all functions/classes in a repo
- `find_symbol` — resolve any name to its definition + callers + callees
- `search_semantic` — keyword search over all symbols (returns top 20)
- `get_call_graph` — transitive callers or callees up to N hops
- `get_dead_code` — find orphaned functions/classes

**How it works:**
Pure Python stdlib server implementing raw MCP JSON-RPC over stdio. No `pip install` needed — drop the script and configure it.

---

## Installation

**1. Configure in Hermes:**

```yaml
mcp_servers:
  codegraph:
    command: "python3"
    args: ["~/Documents/Jerrys-agent-skills/mcp-servers/code-graph/server.py"]
    timeout: 120
    connect_timeout: 30
```

**2. Restart Hermes Agent.**

Tools appear as:
- `mcp_codegraph_index_repo`
- `mcp_codegraph_find_symbol`
- `mcp_codegraph_search_semantic`
- `mcp_codegraph_get_call_graph`
- `mcp_codegraph_get_dead_code`

---

## Usage Workflow

### Phase 0: Index the repo (required first step)

Every session starts with `index_repo` on the target codebase.

```
Call mcp_codegraph_index_repo with:
  repo_path: "/absolute/path/to/project"
```

Returns counts of files/functions/classes indexed.

### Phase 1: Search or resolve a symbol

```
Call mcp_codegraph_search_semantic with:
  query: "session validation"
```

Returns top 20 matches with file, line, signature.

### Phase 2: Explore call graph

```
Call mcp_codegraph_get_call_graph with:
  symbol_id: "func_0042"
  direction: "callees"
  depth: 3
```

Returns nested levels of the call graph.

### Phase 3: Check for dead code

```
Call mcp_codegraph_get_dead_code
```

Returns functions/classes with no caller references.

---

## Limitations

- **No persistent storage.** The graph is rebuilt from scratch on every `index_repo` call.
- **Regex-based extraction.** Not as precise as tree-sitter (which can be swapped in later).
- **Go and Rust** support is basic (top-level functions only, no method receivers).
- **Call resolution** is incomplete — cross-file calls are not tracked unless both files were indexed.

---

## Related Skills

- `codebase-divide-conquer-search` — uses `extract_code_facts.py` / `query_code_facts.py` for offline batch queries.
- `explore-codebase` — high-level navigation strategy that pairs well with this MCP.
- `debug-subagent` — can use `find_symbol` to locate entry points for debugging.
