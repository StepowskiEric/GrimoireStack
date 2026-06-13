# Codebase Search Strategies — Divide and Conquer Patterns

Companion reference for `codebase-divide-conquer-search`. Practical patterns for searching large codebases when you don't know where the bug lives.

## Division Strategies by Codebase Type

### Monorepo / Multi-package
```bash
# Strategy: search by package first, then within
fd -t f package.json -x jq -r .name | head -20  # list packages
rg "buggyFunction" packages/*/src/                # narrow by package
```

### Single App with Feature Modules
```bash
# Strategy: search by feature directory
rg "featureName" app/ features/ lib/ --type ts
rg "buggyBehavior" app/ -l | sort | uniq -c | sort -rn  # files with most mentions
```

### Microservices
```bash
# Strategy: search by API boundary first
rg "endpoint.*buggy" services/*/routes/  # find the service
rg "buggyBehavior" services/specific-service/  # narrow within service
```

## Hierarchical Search Patterns

### Level 1: Index (What exists?)
```bash
# File inventory by type
fd -e ts -e tsx -e py -e go | wc -l          # how many source files?
fd -e test.ts -e spec.ts | wc -l              # how many test files?
rg "export.*function|export.*class" -l | wc -l # how many modules export?
```

### Level 2: Summarize (What does each module do?)
```bash
# One-line module summaries
for f in $(fd -e ts . src/); do echo "$f: $(head -3 $f | tr '\n' ' ')"; done

# Function signatures in a directory
rg "export (function|const|class)" src/ --no-filename -o | sort | uniq
```

### Level 3: Deep Dive (Full content of the 2-3 key files)
```bash
# Read the files most likely to contain the bug
# Use Level 1 and 2 results to narrow to 2-3 candidates
```

## Token-Budget-Aware Search

When context budget is limited:

| Budget | Strategy |
|--------|----------|
| > 50% | Read full files freely |
| 25-50% | Read signatures only, then 1-2 key files fully |
| 10-25% | grep for specific terms, read only matching sections |
| < 10% | Halt search. Summarize what you've found. Escalate. |

## Sub-Agent Deployment Pattern

For very large codebases (>100 files):

1. **Scout agent**: reads file names + first 3 lines of each file, builds a module map
2. **Deep dive agents** (2-3): each reads full content of files in their assigned sector
3. **Synthesis agent**: combines findings from deep agents

Each deep agent gets a sector (e.g., "all files in components/", "all files in services/") and reports findings independently.