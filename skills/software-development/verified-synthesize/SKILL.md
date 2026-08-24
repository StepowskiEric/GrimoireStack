---
name: verified-synthesize
description: Verify code correctness through formal Dafny specifications — given a natural language spec, produce provably correct code with pre/postconditions and loop invariants. Use for critical bugs in security, memory safety, or financial calculations; pre-refactor spec locking; or API contracts across module boundaries.
triggers:
  - Critical bugs: security, memory safety, financial calculations
  - Pre-refactor spec locking — capture behavior before changing a function
  - Bug reports with no test — verify the fix against a formal spec
  - API contracts — enforce pre/postconditions across module boundaries
disable-model-invocation: true
---

# Verified Code Synthesizer

Generate provably correct code. Given a natural language spec, produce implementation code and formal Dafny specifications (preconditions, postconditions, loop invariants). The companion script runs `dafny verify` and returns a machine-checkable proof result.

**Grounded in:** "From Natural Language to Verified Code" (arXiv:2604.22601) — shows off-the-shelf LLMs achieve 90% success rate on Dafny self-healing, and that formal logic pretraining matters more than model size.

## Why Dafny?

Dafny is a verification-friendly language that compiles to Python, C#, Go, Java, and JavaScript. It has:
- First-class specification syntax (requires/ensures)
- Automatic loop invariant inference for simple cases
- Machine-checkable proofs via Z3 SMT solver (bundled with Dafny)
- Readable error messages pointing to exact failing assertions

## Workflow

### Step 1: Write a Spec

Describe what the function should do in natural language:

```
Function: sum
Input: a sequence of integers
Output: sum of all elements
Requirement: the result is always >= 0 (since integers can be negative? no — just return the sum)
Edge cases: empty sequence returns 0
```

### Step 2: Generate + Verify

```bash
python ~/Documents/GrimoireStack/software-development/verified-synthesize/scripts/dafny_verify.py \
  --spec "function sum(a: seq<int>): int ensures sum(a) >= 0" \
  --language python \
  --output /tmp/verified_sum.py
```

### Step 3: Interpret Output

**Success:**
```json
{
  "status": "proved",
  "dafny_code": "function sum(a: seq<int>): int ensures sum(a) >= 0 { ... }",
  "python_code": "def sum(a): return sum(a)",
  "verification_log": "Dafny program verifier finished with 1 verified, 0 errors, 0 warnings",
  "proved_theorems": ["ensures sum(a) >= 0"]
}
```

**Failure:**
```json
{
  "status": "unproved",
  "dafny_code": "function sum(a: seq<int>): int ensures sum(a) >= 0 { ... }",
  "python_code": "def sum(a): return sum(a)",
  "verification_errors": [
    {
      "location": "sum, line 3",
      "claim": "ensures sum(a) >= 0",
      "counterexample": "a = [-1] → result = -1, violates ensures"
    }
  ],
  "dafny_suggestion": "Consider weakening the postcondition or adding a lemma for negative numbers"
}
```

### Step 4: Iterate

If unproved, feed the error back to the LLM with the counterexample. Ask it to strengthen the specification or add intermediate lemmas.

## MCP Tool Interface (via terminal)

```
verify_code(spec: str, language: "python" | "rust" | "go" | "csharp", code: str = None)
  → { status, verification_log, proved_theorems, verification_errors, python_code }
```

If `code` is provided, verifies existing code against the spec. If only `spec` is provided, generates code from scratch.

## Supported Target Languages

| Language | Backend | Notes |
|----------|---------|-------|
| Python | C translation | Most tested |
| Rust | via Verus | Requires Verus installed |
| C# | Transpile | Works well |
| Go | Transpile | Limited formal features |
| JavaScript | Transpile | No formal verification |

## Companion Script

**`scripts/dafny_verify.py`** — pure stdlib Python. Requires `dafny` CLI installed.

### Installation

```bash
# macOS
brew install dafny

# Linux (binary release)
wget https://github.com/dafny-lang/dafny/releases/download/v4.8.0/dafny-4.8.0-x86_64-linux.zip
unzip dafny-4.8.0-x86_64-linux.zip
export PATH=$PATH:$(pwd)/dafny

# Verify
dafny --version
```

### Quick Test

```bash
python ~/Documents/GrimoireStack/software-development/verified-synthesize/scripts/dafny_verify.py \
  --spec "function abs(x: int): int ensures abs(x) >= 0 && (x >= 0 ==> abs(x) == x)" \
  --language python \
  --verbose
```

Expected: `status: proved`

## LLM Prompt Template

When generating Dafny specs, use this system prompt fragment:

```
You are generating Dafny formal specifications paired with implementation code.

Rules:
1. Every function MUST have a `requires` (precondition) and/or `ensures` (postcondition)
2. Loop invariants are REQUIRED for any `while` loop
3. For sequences/arrays, specify behavior on empty input
4. Generate only verifiable assertions — no `assume` statements
5. Keep specifications minimal and tractable for Z3

Output format:
=== DAFNY_SPEC ===
<dafny code>
=== PYTHON_CODE ===
<python equivalent>
```


## Constraints

- **Dafny required**: Installation is required on each platform; not all Dafny features translate to every target language
- **Loop invariants need iteration**: LLM-generated loop invariants often need manual correction — plan for this
- **Dynamic features limited**: Dafny's support for Python dicts and set comprehensions is bounded — prefer simple data structures
- **Keep specs minimal**: Very complex specs can cause Z3 to time out — tractable specs verify faster

## References

- `references/dafny-patterns.md` — Reusable Dafny spec patterns for common verification tasks (basic math, sequences, sets, maps, loops, recursion, error handling).
- Research basis: see [RESEARCH.md](RESEARCH.md) for the papers informing this skill.
