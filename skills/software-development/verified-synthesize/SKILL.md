---
name: verified-synthesize
description: Verify code correctness through formal Dafny specifications — given a natural language spec, produce provably correct code with pre/postconditions and loop invariants. Use for critical bugs in security, memory safety, or financial calculations; pre-refactor spec locking; or API contracts across module boundaries.
triggers:
  - Critical bugs: security, memory safety, financial calculations
  - Small pure function where a wrong result is expensive
  - Pre-refactor spec locking — capture behavior before changing a function
  - Bug reports with no test — verify the fix against a formal spec
  - API contracts — enforce pre/postconditions across module boundaries
disable-model-invocation: true
---

# Verified Code Synthesizer

Generate provably correct code. **You write the Dafny specification; the companion script only verifies it** (`dafny verify` via Z3) and transpiles on success. The script's built-in natural-language-to-Dafny generator is a toy regex heuristic — never rely on it for real specs.

**Grounded in:** "From Natural Language to Verified Code" (arXiv:2604.22601) — off-the-shelf LLMs reach ~90% success on small Dafny self-healing tasks; formal-logic pretraining matters more than model size.

## Decision Gate

Use this skill iff all of these hold:

- The target is a **pure function**, roughly ≤50 lines, with no I/O, no concurrency, no network.
- Correctness matters more than speed (security, money, memory safety, irreversible actions).
- `dafny` ≥4.x is installed (see Step 0).

Skip iff: UI code, glue code, anything stateful or distributed, or the spec needs a quantifier you cannot state plainly. A wrong-size target burns the session on Z3 timeouts — shrink the scope first.

## Workflow

### Step 0: Preflight

```bash
dafny --version   # need 4.x (v3 syntax differs)
ls scripts/dafny_verify.py   # beside this skill file, not a home-dir path
```

Done when the version prints. If Dafny is missing, stop — do not write specs into the void. Install per the Companion Script section, then continue.

### Step 1: Write a True Spec

Describe the function in natural language. Every claim must be literally true, including edge cases:

```text
Function: abs
Input: one integer x
Output: the magnitude of x
Requirement: result >= 0 always; result == x when x >= 0; result == -x otherwise
```

Done when the spec names inputs, outputs, and empty/boundary behavior with no hedged asides. A false spec verifies nothing — the prover will refute it (see Step 4).

### Step 2: You Write the Dafny

Generate the Dafny yourself with these rules:

1. Every function carries `requires` and/or `ensures`.
2. Every `while` loop carries an `invariant` (Dafny does not infer these).
3. Sequences/arrays specify empty-input behavior.
4. Generate only verifiable assertions — no `assume` statements.
5. Keep specs minimal and tractable for Z3 (one `ensures` per behavior; no nested quantifiers unless needed).

Output format:

```text
=== DAFNY_SPEC ===
<dafny code>
=== TARGET_CODE ===
<transpiled equivalent, after Step 3>
```

Done when the Dafny states the Step 1 spec exactly — no stronger, no weaker.

### Step 3: Verify, Gate on the Exit Code

Pass **your** Dafny to the script — never the raw NL spec without `--verify-only`:

```bash
python scripts/dafny_verify.py --code "<your dafny>" --verify-only --language python
# or: --dafny path/to/spec.dfy   (verifies a file, skips generation entirely)
```

Gate on the exit code, not on vibes: `0` = proved, proceed; `1` = unproved or timed out, go to Step 4; `2` = environment/invocation error, fix the setup, not the spec.

Result JSON keys: `status` (`proved` | `unproved` | `timeout` | `error`), `verification_log`, `proved_theorems`, `verification_errors[]` (`location`, `message`), `warnings[]`, `exit_code`, `dafny_code`, plus `transpiled_code` when `--output` was given and proof succeeded. Transpilation runs only on proof.

Done when exit code is `0` and `proved_theorems` covers every Step 1 requirement.

### Step 4: Iterate — Fix the False Side (Max 3 Rounds)

Feed the error back with its counterexample and fix whichever side is false:

- Counterexample refutes an `ensures` → the **spec is false**: weaken or correct it (a sum over negatives is not `>= 0`).
- Prover cannot establish a true `ensures` → the **proof is weak**: strengthen invariants, add a lemma or an intermediate assertion.

After 3 rounds without proof: shrink the function, weaken the spec to what is needed, or escalate to the user. Do not strengthen a false spec — that loops forever.

Done when exit code `0`, or the round budget is spent and the outcome is reported honestly.

### Step 5: Save the Proof In-Repo

Write the `.dfy` file beside the code it proves (not `/tmp` — session trash evaporates) and commit it with the implementation. Use `--save-dafny path/to/spec.dfy` to persist it straight from the verify run. The spec is the regression proof; a future change that breaks it fails verification instead of failing silently.

Done when the `.dfy` and its transpiled output are committed next to the code under proof.

## Flags (`scripts/dafny_verify.py`, stdlib only)

| Flag | Purpose |
| --- | --- |
| `--code "<dafny>"` + `--verify-only` | Verify Dafny you wrote (the normal path) |
| `--dafny path/to/spec.dfy` | Verify a file, skip generation entirely |
| `--spec "<text>"` (no `--verify-only`) | Toy heuristic generation — not for real specs |
| `--language python\|go\|cs\|java\|js` | Transpile target on proof (default `python`) |
| `--output out.py` | Write transpiled code (only on proof) |
| `--save-dafny path/to/spec.dfy` | Persist the Dafny source for Step 5 (saved whenever verification runs; commit only proved specs) |
| `--timeout 60` | Verify budget in seconds; timeouts mean shrink the spec |
| `--verbose` | Print generated Dafny and raw verifier output to stderr |

## Targets

Verification is language-agnostic (Z3 proves the Dafny, not the target). Transpile backends: `python`, `go`, `cs`/`csharp`, `java`, `js`/`javascript`. There is no Rust/Verus path — Verus is a separate tool, not a Dafny backend.

## Companion Script

`scripts/dafny_verify.py` — pure stdlib Python. Requires the `dafny` CLI (v4.x) in `PATH`.

```bash
# macOS
brew install dafny

# Linux (binary release, pin v4.8.0)
wget https://github.com/dafny-lang/dafny/releases/download/v4.8.0/dafny-4.8.0-x86_64-linux.zip
unzip dafny-4.8.0-x86_64-linux.zip
export PATH=$PATH:$(pwd)/dafny

# Verify
dafny --version
```

## Constraints

- **Dafny ≥4.x required**: v3 and v4 syntax differs; the preflight pins this.
- **Invariants need iteration**: LLM-generated loop invariants are often wrong on the first pass — budget for Step 4.
- **Dynamic features bounded**: Dafny's support for Python dicts and set comprehensions is limited — prefer simple data structures.
- **Keep specs tractable**: complex specs time out Z3 instead of failing cleanly — shrink, don't retry blindly.

## References

- `references/dafny-patterns.md` — Reusable Dafny spec patterns for common verification tasks (basic math, sequences, sets, maps, loops, recursion, error handling).
- Research basis: see [the research notes](RESEARCH.md) for the papers informing this skill.
