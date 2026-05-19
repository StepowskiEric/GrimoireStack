---
name: Pre-Push LLM Code Review
description: Pre-push code review checklist and protocol for catching systematic LLM coding failures — overcorrection, hallucinated logic, silent vulnerabilities, missing edge cases, and context-ignorant reviews. Grounded in arXiv research on LLM code review failure modes.
...



---

## Pre-Push LLM Code Review

Systematic checklist for reviewing code before pushing. Catches failure modes specific to LLM-generated code.

Based on arXiv research: 2603.00539, 2604.16697, 2604.17014, 2604.19825, 2601.19072, 2603.18740, 2512.18020, 2511.07017.

### Why This Exists

LLMs have systematic blind spots that differ from human mistakes:
- They **hallucinate execution traces** and confidently validate buggy code (SolidCoder, 2604.19825)
- They **know** vulnerabilities exist but still generate them — the "Format-Reliability Gap" (2604.16697)
- They **overcorrect** correct code, flagging working implementations as broken (2603.00539)
- They produce **functionally correct but silently vulnerable** code that static analyzers miss (2604.17014)
- They generate **review comments ungrounded in actual changes** (HalluJudge, 2601.19072)
- They are **biased by surrounding context** — miss vulnerabilities when code "looks right" (2603.18740)

### Protocol

Run this as a **structured pass** over your diff before pushing. Each section is independent — complete all.

___


### PASS 1: Execution Grounding

**Goal:** Don't imagine — verify. The #1 LLM failure is hallucinating correct behavior.

- [ ] **Every new function/method has a test or is called by one.** No untested new logic.
- [ ] **Edge cases are tested, not assumed.** LLMs skip boundary conditions (empty input, null, zero, max, off-by-one). Check: does the code handle the *absence* of data?
- [ ] **Types match at boundaries.** LLMs frequently mismatch types at function boundaries (optional vs required, null vs undefined, number vs string). Trace data flow across module boundaries.
- [ ] **Async/await is correct.** Missing await, unhandled promise rejection, race condition in concurrent operations. These pass visual inspection but fail at runtime.
- [ ] **Error paths are tested.** LLMs generate happy paths reliably but skip error handling. Test the failure branch.

**Red flag:** If you're reading code and "it looks right" without running it — that's the Mental-Reality Gap. Execute it.

___


### PASS 2: Security Surface

**Goal:** Catch the "Format-Reliability Gap" — code that works but is silently vulnerable.

- [ ] **Input validation on all external-facing surfaces.** API endpoints, user inputs, file reads, environment variables. LLMs trust inputs they shouldn't.
- [ ] **No hardcoded secrets or keys.** Check for accidental commits of API keys, tokens, connection strings.
- [ ] **SQL/query injection vectors.** String interpolation in queries, unsanitized user input in commands.
- [ ] **Authentication/authorization checks.** Does every protected route/mutation verify identity? LLMs frequently add routes without auth guards.
- [ ] **Secrets in logs and error messages.** LLMs log full objects (including credentials) for "debugging." Strip PII before logging.
- [ ] **Dependency safety.** No new dependencies without checking: is it maintained? Does it pull in transitive junk?

**Red flag:** "Functionally correct but vulnerable" is the LLM default state (2604.17014). If you only tested the happy path, you haven't tested security.

___


### PASS 3: Contextual Correctness

**Goal:** Verify the change does what was actually requested — not what the LLM assumed.

- [ ] **Change matches the requirement/spec.** LLMs overcorrect — they "fix" things that aren't broken and add features nobody asked for. Compare diff against the original request.
- [ ] **No scope creep.** Every changed line traces to the stated requirement. If you can't draw a line from a changed line to the requirement, revert it.
- [ ] **No speculative code.** "This might be useful later" = dead code now. Remove it.
- [ ] **Existing behavior preserved.** Run the existing test suite. If anything breaks, the change is wrong regardless of how good the new code looks.
- [ ] **Import cleanup.** LLMs add imports they don't use and forget to add imports they need. Check both directions.

**Red flag:** If the diff is bigger than expected, the LLM probably went beyond scope. Shrink it.

___


### PASS 4: Structural Quality

**Goal:** LLMs generate structural anti-patterns that pass review but degrade over time.

- [ ] **No god functions.** If a function exceeds ~50 lines, it's doing too much. LLMs love giant functions that "handle everything."
- [ ] **No duplicated logic.** LLMs copy-paste similar patterns instead of extracting shared logic. Check for near-duplicate code blocks in the diff.
- [ ] **Naming matches intent.** LLMs generate generic names (data, result, item, info). If you can't tell what a variable holds from its name, rename it.
- [ ] **No premature abstractions.** Single-use helper functions, unnecessary wrapper classes, config objects with one key. YAGNI.
- [ ] **Comments explain why, not what.** LLMs comment obvious code and leave complex logic uncommented. Delete noise comments, add missing why-comments.
- [ ] **Error messages are actionable.** "Something went wrong" is useless. Errors should tell the developer/user what failed and how to fix it.

**Red flag:** "Clean" code that took 200 lines to do what should take 50 is a sign of LLM over-engineering.

___


### PASS 5: Integration Points

**Goal:** Code works in isolation but breaks when connected.

- [ ] **API contracts match.** If you changed a function signature, check every caller. LLMs update definitions but miss call sites.
- [ ] **Database schema migrations are safe.** No destructive column drops without a migration path. No assuming data exists that doesn't.
- [ ] **Environment variable changes documented.** New env vars need to be added to .env.example, deployment config, etc.
- [ ] **Backwards compatibility.** If this is an API change, do existing consumers still work? LLMs break contracts silently.
- [ ] **File moves/renames don't break imports.** If you moved a file, every import path everywhere needs updating.

**Red flag:** "It works on my machine" = untested integration. If you didn't verify the full flow, it's unverified.

___


### Quick Mode (for small changes)

For diffs under ~50 lines, use this abbreviated checklist:

1. Does the change match the requirement? (no scope creep)
2. Is there a test covering the new behavior?
3. Are types correct at boundaries?
4. Any security surface exposed?
5. Do existing tests still pass?

If any answer is unclear, escalate to full protocol.

___


### Anti-Patterns to Watch For

These are specific LLM-generated patterns that look correct but are wrong:

| Pattern | Why It's Wrong | What To Do |
|---------|----------------|------------|
| `try { ... } catch(e) { console.log(e) }` | Swallows errors silently. User sees nothing, debugging impossible. | Handle or re-throw. At minimum, log to monitoring. |
| `if (data) { use(data.field) }` | Truthy check doesn't validate shape. `data = { field: undefined }` passes. | Validate specific fields or use schema validation. |
| Giant try/catch wrapping entire functions | Masks which operation failed. Catches unrelated errors. | Narrow catch to specific operations. |
| `any` type assertions / `as unknown as T` | Defeats type system. Hides real bugs. | Fix the types properly. |
| Optional chaining chains (`a?.b?.c?.d`) | Hides null bugs instead of fixing them. Fails silently. | Validate early, fail explicitly. |
| `JSON.parse(JSON.stringify(obj))` for deep clone | Loses functions, dates, undefined, circular refs. | Use structured clone or explicit mapping. |
| Regex for HTML/parsing | Fragile, doesn't handle edge cases, security risk. | Use a proper parser. |
| Comments that restate code | `// increment counter` above `counter++` | Delete. Add comments only for non-obvious logic. |
| `useEffect` for derived state | Re-renders on every change, race conditions. | Use `useMemo` or compute inline. |
| Hardcoded wait/sleep for async | Timing-dependent, flaky, slow. | Use proper async primitives (polling, events, etc.) |

___


### Execution

Before pushing:

```bash
# 1. Run existing tests
npm test  # or equivalent

# 2. Run linter/type checker
npm run lint && npm run typecheck  # or equivalent

# 3. Check diff size — if >500 lines, consider splitting
git diff --stat main

# 4. Review the actual diff with the checklist above
git diff main

# 5. Verify no secrets in diff
git diff main | grep -iE '(api_key|secret|token|password|credential)' || echo "clean"
```

If any checklist item fails, fix before pushing. No exceptions.

___


### Research Sources

| Paper | Key Finding | arXiv ID |
|-------|-------------|----------|
| SolidCoder | Mental-Reality Gap — models hallucinate execution traces | 2604.19825 |
| Surgical Repair | Format-Reliability Gap — models know vulns but still generate them | 2604.16697 |
| False Security Confidence | Functionally correct code is silently vulnerable | 2604.17014 |
| LLM Code Reviewers Overcorrect | More detailed prompts = worse judgment | 2603.00539 |
| HalluJudge | Review comments ungrounded in actual code | 2601.19072 |
| Contextual Bias in Security Review | Vulnerability detection biased by surrounding code | 2603.18740 |
| LLM Code Smells | 60.5% of systems have LLM-specific anti-patterns | 2512.18020 |
| Code Review Benchmarks Survey | Missing semantic context = missing real issues | 2602.13377 |
| SGCR | Spec-grounded review improves reliability | 2512.17540 |
| RovoDev (Atlassian) | Enterprise code review at scale — context is everything | 2601.01129 |
| Triage | Code health metrics predict which model tier is needed | 2604.07494 |
