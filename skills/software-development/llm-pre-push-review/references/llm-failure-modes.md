# LLM Failure-Mode Catalog — shared reference

The systematic blind spots of LLM-generated code, with the research behind each.
Both `llm-pre-push-review` (generic diff checklist) and `super-review-typescript`
(TS-specific deep review) are organized around these modes. Detection patterns
per mode: `review-patterns.md`.

## The six failure modes

1. **Hallucinated execution traces** — models confidently "run" buggy code in their head and validate it. The Mental-Reality Gap (SolidCoder, arXiv:2604.19825). *Counter: execution grounding — test or call every new function.*
2. **Format-Reliability Gap** — models know a vulnerability class yet still generate it (arXiv:2604.16697). *Counter: security-surface pass on every diff.*
3. **Overcorrection** — models "fix" working code, flagging correct implementations as broken (arXiv:2603.00539). *Counter: diff vs requirement, no scope creep.*
4. **Silent vulnerabilities** — functionally correct code that static analyzers miss (arXiv:2604.17014). *Counter: happy-path tests are not security tests.*
5. **Ungrounded review comments** — review feedback not tied to the actual diff (HalluJudge, arXiv:2601.19072). *Counter: every comment cites a file:line and verified evidence.*
6. **Context bias** — vulnerability detection distorted by surrounding "looks right" code (arXiv:2603.18740). *Counter: adversarial pass — ask how the code could be abused.*

Additional research: LLM code smells in 60.5% of systems (arXiv:2512.18020); spec-grounded review improves reliability (SGCR, arXiv:2512.17540); code-health metrics predict which model tier a diff needs (Triage, arXiv:2604.07494).

## Anti-patterns that look correct

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
| Hardcoded wait/sleep for async | Timing-dependent, flaky, slow. | Use proper async primitives (polling, events, etc.). |
