# Logic Locator — Structural Code Search Patterns

Companion reference for `keyword-agnostic-logic-locator`. Concrete search patterns organized by structural relationship type.

## Control Flow Patterns

### Find what precedes a bug site
```bash
# What function calls lead to this point?
rg "functionName|->.*functionName|\.functionName" --type ts

# What conditions gate execution of this code?
rg "if.*\{|switch.*\{|case.*:" --context 3 path/to/file.ts
```

### Find what runs before/after in event loop
```bash
# For React: what effects run before this component renders?
rg "useEffect|useLayoutEffect|useInsertionEffect" path/to/component.tsx

# For async: what promises are awaited before this point?
rg "await|\.then\(|\.catch\(" --context 2 path/to/file.ts

# For Node: what middleware runs before this handler?
rg "app\.(get|post|put|delete|use)\(" server.ts
```

## Data Flow Patterns

### Find the last write to a variable before crash
```bash
# Who sets this state? (React)
rg "set[A-Z].*StateName|StateName\.set|dispatch.*StateName" --type tsx

# Who mutates this object?
rg "\.propName\s*=|\.propName\s*:|propName:" --type ts

# Where does this variable come from?
rg "const.*variableName|let.*variableName|variableName\s*=" --type ts
```

### Find where data enters the system
```bash
# API endpoints that receive this data type
rg "router\.(get|post|put|delete).*entityName" --type ts

# Database queries that read this table
rg "query.*tableName|from.*tableName|db\..*tableName" --type ts

# Props passed to this component
rg "<ComponentName" --type tsx
```

## Call Graph Patterns

### Find what calls this function
```bash
# Direct callers
rg "functionName\(" --type ts

# Callers via alias or destructured import
rg "const.*functionName|{ functionName" --type ts

# Callers via object method
rg "\.functionName\(" --type ts
```

### Find who the callers call (2-hop)
```bash
# First: get callers of functionName
# Then: for each caller, find what THEY call
# This is 2-hop call graph traversal
```

## State Machine Patterns

### Find state transitions that could produce a symptom
```bash
# Zustand store transitions
rg "set\s*\(" store.ts  # all state mutations

# Machine states
rg "states:|on:|initial:" machine.ts

# React state transitions
rg "setState\(|dispatch\(" component.tsx
```

### Find impossible states
```bash
# What states are mutually exclusive?
rg "if.*state.*&&.*state" --type ts  # conditions that should never coexist
```

## Type-Based Patterns

### Find type narrowing that should happen but doesn't
```bash
# Type guards
rg "typeof|instanceof|in\s*[" --type ts

# Type assertions (potential bypass)
rg "as\s+[A-Z]" --type ts  # unsafe type assertions
```

## Common Anti-Patterns in Structural Search

| Anti-Pattern | The Fix |
|-------------|---------|
| Searching for `handleClick` when the event handler is `onPress` (React Native) | Search for the prop binding pattern, not the handler name |
| Searching for `fetch` when the API call is through a generated client | Find the generated client's method name instead |
| Searching for `useState` when state comes from a store | Search for the store's selector/dispatch pattern |
| Searching for the prop name when the data flows through context | Search for the Provider and its value shape |
| Searching for the error message when it's constructed dynamically | Search for the error code or the template string instead |