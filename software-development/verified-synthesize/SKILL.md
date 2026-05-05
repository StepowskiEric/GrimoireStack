---
name: verified-synthesize
category: software-development
description: Generate provably correct code from natural language specs using Dafny formal verification. LLM produces code + Dafny preconditions/postconditions; the script verifies correctness automatically. Based on "From Natural Language to Verified Code" (arXiv:2604.22601).
version: 1.0
tags: [formal-verification, Dafny, code-synthesis, correctness, provable]
---

# Verified Code Synthesizer

Generate code that is **provably correct**, not just probably correct. Given a natural language spec, an LLM produces both implementation code and formal Dafny specifications (preconditions, postconditions, loop invariants). The companion script runs `dafny verify` and returns a machine-checkable proof result.

**Grounded in:** "From Natural Language to Verified Code" (arXiv:2604.22601) — shows off-the-shelf LLMs achieve 90% success rate on Dafny self-healing, and that formal logic pretraining matters more than model size.

## Why Dafny?

Dafny is a verification-friendly language that compiles to Python, C#, Go, Java, and JavaScript. It has:
- First-class specification syntax (requires/ensures)
- Automatic loop invariant inference for simple cases
- Machine-checkable proofs via Z3 SMT solver (bundled with Dafny)
- Readable error messages pointing to exact failing assertions

## When to Use

- **Critical bugs**: Security, memory safety, financial calculations
- **Pre-refactor**: Before changing a function, generate its Dafny spec to lock down behavior
- **Bug reports with no test**: Generate a Dafny specification from the bug description, verify the fix
- **API contracts**: Enforce pre/postconditions across module boundaries

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
python ~/Documents/Jerrys-agent-skills/software-development/verified-synthesize/scripts/dafny_verify.py \
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
python ~/Documents/Jerrys-agent-skills/software-development/verified-synthesize/scripts/dafny_verify.py \
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
4. Do NOT generate assume statements — only verifiable assertions
5. Keep specifications minimal and tractable for Z3

Output format:
=== DAFNY_SPEC ===
<dafny code>
=== PYTHON_CODE ===
<python equivalent>
```

## Integration with Scout

Use Scout-Lite to find the existing function signature before generating:

```python
# 1. Scout finds the existing function
results = search_files(pattern="def authenticate_user", target="files", path="src/")

# 2. Read the file to understand the context
content = read_file(results[0])

# 3. Generate Dafny spec from the existing code
result = subprocess.run([
    "python", "verified-synthesize/scripts/dafny_verify.py",
    "--spec", f"existing code: {content[:500]}",
    "--language", "python",
    "--verify-only"
], capture_output=True, text=True)
```

## Limitations

- **Dafny installation**: Required but nontrivial on some platforms. Not all Dafny features translate cleanly to all target languages.
- **Loop invariants**: LLM-generated loop invariants are often wrong. Expect iteration on this.
- **Complex data structures**: Dafny's support for Python's dynamic features (dict, set comprehensions) is limited.
- **Z3 timeouts**: Very complex specs can cause Z3 to time out. Keep specs minimal.

## Research Basis

- "From Natural Language to Verified Code: Toward AI Assisted Problem-to-Code Generation with Dafny-Based Formal Verification" — arXiv:2604.22601
- "A Benchmark for Vericoding: Formally Verified Program Synthesis" — OpenReview 2025
- Dafny Language Reference: https://dafny.org/
