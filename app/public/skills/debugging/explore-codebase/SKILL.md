---
name: explore-codebase
description: "Structured exploration with progressive deepening: module structure → file roles → symbol resolution."
triggers:
  - Unfamiliar codebase and need to understand its structure
  - Need to find where a specific feature or behavior is implemented
  - Codebase is too large to fit in context
---

# Codebase Walk

Structured exploration with progressive deepening: module structure → file roles → symbol resolution. Token-efficient for unfamiliar codebases.

## Core Protocol

### Level 1: Module Structure

List the top-level directory structure. Identify the main entry point, configuration files, and module boundaries.

**Done when:** the directory tree is mapped and each top-level directory's purpose is understood.

### Level 2: File Roles

For the relevant module, read file names and brief contents to understand each file's role. Identify which files contain types, utilities, business logic, and UI components.

**Done when:** each file in the relevant module has a labeled role.

### Level 3: Symbol Resolution

For the specific function or component of interest, trace its imports, exports, and callers. Understand the data flow through the relevant symbols.

**Done when:** the call graph and data flow for the target symbol are mapped.

## Failure Modes

- **Over-exploration:** reading every file in a large codebase instead of narrowing to the relevant module
- **Under-exploration:** jumping to code changes without understanding module boundaries
- **Surface reading:** reading file names without understanding how they connect
