# LLM Code Defect Detection Patterns

Catalog of common LLM-generated code defects with ripgrep detection patterns.

These patterns help systematically identify failure modes specific to LLM-generated code during pre-push review.

---

## 1. Hallucinated APIs

**Defect:** LLMs invent method names, function signatures, or library calls that don't exist in the referenced library or framework.

### Detection Patterns

```bash
# Suspicious method names that look like LLM inventions (e.g., "fetchData" on Date objects)
rg "\.(getAll|fetchAll|retrieveAll|toJSONString|toJSONObject)\(" --type js --type ts

# Calls to non-standard lifecycle methods
rg "componentDidMount$|componentWillMount$" --type js --type ts  # Old React, might be hallucinated in new code

# Suspicious HTTP method names not in fetch/axios
rg "\.(httpGet|httpPost|httpPut|httpDelete)\(" --type js --type ts

# Invented DOM methods
rg "\.(getElement|querySelectorAll|addEventListener)\s*\(" --type js --type ts

# Phony utility function calls (common LLM hallucinations)
rg "\b(getAllAsArray|convertToJSON|safeParseJSON|deepCloneObject|isNullOrEmpty)\b" --type js --type ts
```

### TypeScript/JavaScript Specific

```bash
# Calls to non-existent Promise methods
rg "Promise\.(allSettledSync|anySync|raceSync)" --type js --type ts

# Invented array methods
rg "\.(remove|erase|popFirst|pushLast)\(" --type js --type ts
```

### Python Specific

```bash
# Non-existent os module methods
rg "os\.(read_file|write_file|ensure_dir|path_exists)" --type py

# Invented pathlib methods
rg "Path\.(read_text_safe|write_text_atomic|is_file_or_dir)" --type py

# Hallucinated requests methods
rg "requests\.(get_json|post_json|request_with_retry)" --type py
```

---

## 2. Wrong Parameter Orders

**Defect:** LLMs swap, omit, or misorder function parameters, especially with similar types (string vs. number, callback vs. options).

### Detection Patterns

```bash
# Common swap: options before data
rg "\.(post|put|patch)\(.*,.*options.*\{.*data:" --type js --type ts

# Callback passed as argument instead of last parameter
rg "\.(then|catch|finally)\(.*function.*\)" --type js --type ts

# Array method callbacks with wrong signature
rg "\.(map|filter|reduce|forEach)\(.*\(.*,.*,.*\)" --type js --type ts  # Should be (value, index, array) or (acc, curr, index)
```

### React/JSX Specific

```bash
# onClick handler passed incorrectly
rg "onClick=\{.*\(.*,.*event\)" --type js --type ts

# useEffect with wrong dependency array position
rg "useEffect\(.*,.*\[.*\].*\)" --type js --type ts  # Should be useEffect(callback, deps)

# useState initial value as function without parentheses
rg "useState\(.*=>" --type js --type ts  # Should be useState(() => initialValue)
```

### Python Specific

```bash
# open() with wrong mode before filename
rg "open\(.*['\"]w\+?['\"].*,\s*['\"]r['\"]" --type py

# sorted() with wrong key position
rg "sorted\(.*key=.*,.*reverse=" --type py  # Should be sorted(iterable, key=..., reverse=...)

# dict.get with default before key
rg "\.get\(.*default=.*,\s*.*\)" --type py
```

---

## 3. Phantom Imports

**Defect:** LLMs import modules, classes, or functions that don't exist or aren't needed.

### Detection Patterns

```bash
# Import statements that might be unused or non-existent
rg "^\s*import\s+\{.*\}.*from\s+['\"][^'\"]+['\"]" --type js --type ts

# Import * from unknown modules
rg "import\s+\*\s+from\s+['\"][^'\"]+['\"]" --type js --type ts

# Default imports that might not have default export
rg "import\s+\w+\s+from\s+['\"][^'\"]+['\"]" --type js --type ts

# Named imports from packages that likely don't export them
rg "import\s+\{(useEffect|useState|useMemo|useCallback)\}\s+from\s+['\"]react['\"]" --type js --type ts  # Should be 'react'
```

### Python Specific

```bash
# Imports from wrong module path
rg "from\s+os\.path\s+import\s+(join|exists|isfile)" --type py  # Should be from os.path import join

# Importing non-existent submodules
rg "import\s+\w+\.(models|utils|helpers|services)" --type py

# Relative imports that may be incorrect
rg "from\s+\.{2,}" --type py
```

### TypeScript Specific

```bash
# Type-only imports used as values
rg "import\s+\{[^}]+\}\s+from\s+['\"](@/types|\.\./types|\./types)" --type ts

# Missing 'type' keyword on type-only imports (TS 5.0+)
rg "import\s+type\s+\{" --type ts  # Actually correct, but verify usage
```

---

## 4. Type Mismatches

**Defect:** LLMs assign wrong types, bypass type checking with `any`/`unknown` casts, or ignore type errors.

### Detection Patterns

```bash
# 'any' type assertions (bypasses type safety)
rg ":\s*any\b|as\s+any\b|as\s+unknown\s+as\s+\w+" --type js --type ts

# Non-null assertion operator abuse
rg "!\s*\.|\w+!\s*[\[\(]" --type ts

# Type comparisons that are always true/false
rg "typeof\s+\w+\s*===\s*['\"]undefined['\"]" --type js --type ts

# Implicit any in parameters (TS)
rg "\(.*\)\s*=>" --type ts  # Check for missing parameter types

# Number used where string expected (common with IDs)
rg "\.toString\(\)\s*\{" --type js --type ts  # Suspicious toString before object

# Boolean coercion where explicit check needed
rg "if\s*\(\s*\w+\s*\)" --type js --type ts  # Check for truthy/falsy confusion
```

### Python Specific

```bash
# Type hints that don't match usage
rg "def\s+\w+\([^)]*:\s*str[^)]*\)[^:]*:\s*int" --type py  # Returns int but param is str

# isinstance checks missing
rg "if\s+type\(.*\)\s*==" --type py  # Should use isinstance

# Mutable default arguments
rg "def\s+\w+\(.*=\s*\[\]\s*\)" --type py  # Mutable default
rg "def\s+\w+\(.*=\s*\{\}\s*\)" --type py
```

### Go Specific

```bash
# Unused imports (go vet would catch, but LLMs add them)
rg "import\s+\(" --type go

# Wrong error handling pattern
rg "if\s+err\s*!=\s*nil\s*\{.*\}" --type go  # Should check and return/handle
```

---

## 5. Incorrect Lifecycle Hooks

**Defect:** LLMs misuse framework lifecycle methods, causing memory leaks, race conditions, or missed updates.

### React Specific

```bash
# useEffect with missing dependencies
rg "useEffect\(.*\[\s*\]\s*\)" --type js --type ts  # Empty deps might be intentional, verify

# useEffect with async callback directly
rg "useEffect\(async\s*\(" --type js --type ts  # Should be useEffect(() => { async function... })

# Stale closure from missing dependencies
rg "useEffect\(.*\{[^}]*\w+[^}]*\}[^)]*\)" --type js --type ts  # Check for missing deps

# useState setter called directly in render
rg "set\w+\(.*\)\s*[^{]*$" --type js --type ts  # Should be in event handler/effect

# useEffect cleanup missing for subscriptions
rg "useEffect\(.*(addEventListener|subscribe|on)\(" --type js --type ts  # Should have cleanup
```

### Vue Specific

```bash
# watch with missing immediate flag when needed
rg "watch\(.*\{[^}]*deep:\s*true[^}]*\}" --type js --type ts  # Verify deep is needed

# computed with side effects
rg "computed\(.*\{[^}]*\w+\s*=" --type js --type ts  # Should only compute, not mutate

# mounted hook used for data fetching without async handling
rg "mounted\(\)\s*\{[^}]*\.then\(" --type js --type ts  # Should use async/await properly
```

### Angular Specific

```bash
# ngOnChanges used incorrectly
rg "ngOnChanges\(.*changes:\s*SimpleChanges" --type ts

# Subscription without unsubscribe
rg "\.subscribe\([^)]*\)\s*;" --type ts  # Should store subscription and unsubscribe
```

---

## 6. Missing Error Handling

**Defect:** LLMs reliably generate happy paths but omit error handling, leading to unhandled rejections, crashes, or silent failures.

### Detection Patterns

```bash
# Promise chains without catch
rg "\.then\([^)]*\)\s*(?!\.catch)" --type js --type ts

# async/await without try/catch
rg "async\s+\w+\([^)]*\)\s*\{[^}]*await\s+[^}]*\}" --type js --type ts  # Check for missing try/catch

# fetch without .catch or try/catch
rg "fetch\([^)]*\)\s*(?!\.then\.catch|\.then\(.*\.catch)" --type js --type ts

# JSON.parse without try/catch
rg "JSON\.parse\([^)]*\)(?!\s*\)\s*\{)" --type js --type ts  # Should be in try block

# Array access without bounds check
rg "\[\d+\]\s*\." --type js --type ts  # Direct index access might need guard
```

### Python Specific

```bash
# open() without try/except
rg "open\([^)]+\)(?!\s+in\s+with)" --type py

# requests without error handling
rg "requests\.(get|post|put|delete)\([^)]*\)(?!\s*\()" --type py

# dict access without .get() or try/except
rg "\w+\[['\"]\w+['\"]\]" --type py  # Might need KeyError handling

# int() conversion without try/except
rg "int\([^)]+\)" --type py
```

### Go Specific

```bash
# Error not checked after function call
rg "\w+\([^)]*\)(?!\s+if\s+err\s*!=)" --type go

# err ignored with blank identifier
rg "_\s*,\s*err\s*=" --type go  # Verify err is actually handled
```

### Rust Specific

```bash
# unwrap() used without is_some() check
rg "\.unwrap\(\)" --type rs

# expect() with generic message
rg "\.expect\(\s*['\"]\w+['\"]\s*\)" --type rs  # Should have descriptive message

# ? operator used in non-Result-returning function
rg "fn\s+\w+\([^)]*\)[^{]*\{[^}]*\?[^}]*\}" --type rs  # Check return type is Result
```

---

## 7. Silent Failure / Swallowed Errors

**Defect:** LLMs catch errors but do nothing or only log them, hiding failures from users and monitoring.

### Detection Patterns

```bash
# Empty catch blocks
rg "catch\(.*\)\s*\{\s*\}" --type js --type ts

# catch with console.log only
rg "catch\([^)]*\)\s*\{[^}]*console\.log\([^)]*\)\s*\}" --type js --type ts

# Swallowing errors with empty return
rg "catch\([^)]*\)\s*\{\s*return\s*\}" --type js --type ts

# except: pass
rg "except.*:\s*pass" --type py

# except that only prints
rg "except\s+\w+.*:\s*print\(" --type py
```

---

## 8. Async / Race Condition Patterns

**Defect:** LLMs struggle with concurrent operations, missing awaits, or race conditions in async code.

### Detection Patterns

```bash
# Unhandled promise rejection (no await, no catch)
rg "new\s+Promise\([^)]*\)(?!\s*\.then)" --type js --type ts

# Parallel promises without Promise.all
rg "(fetch|axios)\(" --type js --type ts | rg -A1 "^\s*\w+\s*=" | rg "^(fetch|axios)"  # Multiple fetches without Promise.all

# Race condition with stale state
rg "set\w+\(.*\w+\[" --type js --type ts  # State set based on previous state without functional update

# setTimeout/setInterval without cleanup
rg "setTimeout\(|setInterval\(" --type js --type ts | rg -v "clearTimeout\(|clearInterval\("

# async function called without await
rg "async\s+\w+\([^)]*\)\s*\{[^}]*\}" --type js --type ts  # Check call sites for missing await
```

---

## 9. Hardcoded Values / Secrets

**Defect:** LLMs include hardcoded API keys, credentials, URLs, or configuration that should be environment-specific.

### Detection Patterns

```bash
# API keys / tokens
rg -i "(api[_-]?key|secret|token|password|passwd|credential)\s*[:=]\s*['\"][^'\"]{8,}['\"]" --type js --type ts --type py

# AWS keys (specific pattern)
rg "(AKIA|ASIA)[A-Z0-9]{16}" --type js --type ts --type py

# Private keys
rg "-----BEGIN\s+(RSA|EC|DSA|OPENSSH)\s+PRIVATE\s+KEY-----" --type js --type ts --type py

# Hardcoded URLs that should be configurable
rg "https?://[a-zA-Z0-9-]+\.(herokuapp|netlify|vercel|railway)\.(com|app)" --type js --type ts --type py

# Database connection strings
rg "(mongodb|postgresql|mysql|redis)://[^\s]+" --type js --type ts --type py
```

---

## 10. Conditional Logic Errors

**Defect:** LLMs generate incorrect boolean logic, inverted conditions, or assignments instead of comparisons.

### Detection Patterns

```bash
# Assignment in conditional (common JS error)
rg "if\s*\([^=]*=[^=]*\)" --type js --type ts

# Inverted equality check
rg "if\s*\(.*!=\s*null.*===\s*null" --type js --type ts

# Always-true/false conditions
rg "if\s*\(true\)|if\s*\(false\)|if\s*\(1\)|if\s*\(0\)" --type js --type ts

# Missing negation
rg "if\s*\(!\!?\w+\)" --type js --type ts  # Double negation might be intentional, verify

# switch without default
rg "switch\s*\([^)]*\)\s*\{(?![\s\S]*default:)" --type js --type ts --type py
```

---

## Usage

Run these patterns against your diff before pushing:

```bash
# Run all patterns on changed files
rg --files-with-matches -e "pattern1" -e "pattern2" $(git diff --name-only HEAD)

# Run specific category
rg --files-with-matches -f patterns/phantom-imports.txt $(git diff --name-only HEAD)

# Generate report
rg -n --no-heading -e "pattern" $(git diff --name-only HEAD) > review-findings.txt
```

---

## References

These patterns are derived from common LLM failure modes documented in:

- **SolidCoder** (2604.19825): Mental-Reality Gap — hallucinated execution traces
- **Surgical Repair** (2604.16697): Format-Reliability Gap — known vulnerabilities still generated
- **False Security Confidence** (2604.17014): Functionally correct but vulnerable code
- **LLM Code Reviewers Overcorrect** (2603.00539): More detail = worse judgment
- **HalluJudge** (2601.19072): Review comments ungrounded in actual code
- **Contextual Bias** (2603.18740): Vulnerability detection biased by surrounding code
- **LLM Code Smells** (2512.18020): 60.5% of systems have LLM-specific anti-patterns

See main SKILL.md for full research context and review protocol.
