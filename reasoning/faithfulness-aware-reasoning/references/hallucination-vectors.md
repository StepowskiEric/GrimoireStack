# Faithfulness Reasoning Patterns — Common Hallucination Vectors and Guards

Companion reference for `faithfulness-aware-reasoning`. Concrete patterns for detecting and preventing hallucination in agent reasoning.

## Top Hallucination Vectors

### 1. API Confabulation
Agent describes an API method that doesn't exist.
```
GUARD: Before using any API method, verify it exists in the actual docs/source.
CHECK: rg "methodName" node_modules/library/ --type ts
```

### 2. Fabricated File Paths
Agent references files that don't exist.
```
GUARD: Before reading a file, check it exists.
CHECK: ls path/to/file.ts 2>/dev/null || echo "FILE NOT FOUND"
```

### 3. Phantom Configuration
Agent assumes config values that aren't set.
```
GUARD: Before relying on a config value, verify it's set.
CHECK: rg "CONFIG_KEY" .env* config/*.ts
```

### 4. Causal Leap
Agent infers causation from correlation in bug analysis.
```
GUARD: "X happened, then Y broke" ≠ "X caused Y to break".
CHECK: Can I reproduce Y without X? If yes, X didn't cause Y.
```

### 5. Scope Projection
Agent projects local knowledge onto unfamiliar code.
```
GUARD: "In most React apps..." ≠ "In this React app..."
CHECK: Verify the assumption in THIS codebase, not in general knowledge.
```

## Faithfulness Verification Tiers

| Tier | Cost | Method | When to Use |
|------|------|--------|-------------|
| Tier 0 | Free | Self-check: "Am I certain about this?" | Every factual claim |
| Tier 1 | Low | Pattern match: `rg "claim"` in codebase | API names, file paths |
| Tier 2 | Medium | Runtime: read file, run command | Behavior claims |
| Tier 3 | High | Test: write and run a test | Causal claims |

Default to Tier 0 for every claim. Escalate when the claim is load-bearing (if wrong, the whole approach fails).

## Confidence Labeling Protocol

Tag every factual claim with a confidence level:

```
[CERTAIN] I read this in the file. Confidence: 0.95+
[LIKELY] This is the standard pattern in this framework. Confidence: 0.7-0.94
[UNCERTAIN] I believe this is how it works but haven't verified. Confidence: 0.3-0.69
[GUESS] I'm extrapolating from similar systems. Confidence: 0.0-0.29
```

Any claim labeled [GUESS] must be verified before acting on it.