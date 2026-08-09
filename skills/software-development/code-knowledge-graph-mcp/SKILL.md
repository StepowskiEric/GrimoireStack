---
name: code-knowledge-graph-mcp
description: "MCP server with structured symbol and call-graph queries. Navigate code by structure, not by string search."
triggers:
  - Need to navigate code by structure, not by string search
  - Need symbol and call-graph queries
  - Need to understand code relationships beyond what grep provides
---

# Code Knowledge Graph MCP

MCP server with structured symbol and call-graph queries. Navigate code by structure, not by string search.

## Core Protocol

### Phase 1: Index the Codebase

Run the MCP server to index the codebase, extracting symbols, call graphs, and type hierarchies.

**Done when:** the knowledge graph is built and ready for queries.

### Phase 2: Query by Structure

Use structured queries instead of string search:
- Find all callers of a function
- Trace data flow through a module
- Find implementations of an interface
- Discover circular dependencies

**Done when:** the structural query returns the relevant code locations.

### Phase 3: Validate Results

Read the actual source code at the returned locations to confirm the structural analysis is correct.

**Done when:** results are validated against source code.

## Failure Modes

- **Trusting the graph without reading source:** the graph may miss dynamic dispatch or conditional calls
- **Stale index:** the graph is only as current as the last index run
- **Over-reliance on structure:** some code relationships are semantic, not structural
