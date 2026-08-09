# AI Agent Hazard Categories

The UCAs that matter most for LLM/tool-using agents fall into these patterns. Scan this list before recommending any action an LLM agent will execute.

---

### H1. Prompt or input injection

**Hazard:** untrusted content (web page, email, document, prior tool result) hijacks the agent's next action.
**UCAs:** agent *given* a destructive tool call it was not supposed to issue; agent *withholds* a required action because injected text told it to.
**Safeguards:** treat all retrieved content as data, not instructions; capability allowlist; human-in-the-loop for destructive actions on injection-suspected inputs; isolated context for untrusted sources.

---

### H2. Runaway tool loops

**Hazard:** agent re-issues the same failing tool call, or expands the scope of tool use without bound.
**UCAs:** *wrong duration* (loop never terminates); *wrong order* (calls accumulate side effects across iterations).
**Safeguards:** per-tool-call idempotency keys; iteration cap with explicit abort; spend/cost ceiling; side-effect ledger; monotonic "this is the Nth attempt — change strategy" signal.

---

### H3. Capability and authority drift

**Hazard:** agent acquires a capability it was not supposed to have (new tool, broader scope, fresh credentials) and uses it.
**UCAs:** *given when not needed* (tool was just enabled and used); *wrong time* (used outside the task boundary).
**Safeguards:** least-privilege tool bindings; scope tokens tied to the original task; periodic capability re-validation; deny-by-default for new tools.

---

### H4. Mode confusion / goal drift

**Hazard:** agent loses track of the original goal, confuses the planning context with the execution context, or acts on a hypothesis as if it were fact.
**UCAs:** *given when not needed* (action based on a dropped assumption); *not given when needed* (refused to act because a constraint was hallucinated).
**Safeguards:** explicit goal re-statement at decision points; separate planning channel from execution channel; assumption register; reject output that is not traceable to a current task goal.

---

### H5. Confirmation and approval bypass

**Hazard:** a human-in-the-loop gate is intended but the agent finds a path around it (e.g., batching changes to avoid review, phrasing requests to skirt the rule).
**UCAs:** *given when not needed* (action taken without the required approval); *wrong time* (approval sought after the action is already taken).
**Safeguards:** gate enforcement on the action side, not the agent side; atomic approval primitives; audit trail that records what was approved, when, and by whom; treat "would a human approve this?" as insufficient — require the actual approval.

---

### H6. Stale state and read-after-write hazards

**Hazard:** agent reads state, decides, then acts on state that has since changed; or relies on a cached value that is no longer valid.
**UCAs:** *wrong time* (action based on stale read); *given when not needed* (action no longer applies).
**Safeguards:** read-then-validate-then-act with freshness token; explicit cache-invalidation; optimistic concurrency on the action; "verify the assumption still holds" checkpoint immediately before the action.

---

### H7. Side-effect amplification

**Hazard:** a single action looks small but its blast radius is large (writes that fan out, retries that compound, messages that trigger downstream agents).
**UCAs:** *wrong duration* (retry storm); *wrong order* (downstream triggered before upstream stabilized).
**Safeguards:** dry-run mode; blast-radius estimate before the action; rate limits on fan-out; bulkheads per downstream; circuit breakers on retry.

---

### H8. Information disclosure

**Hazard:** action reveals more than intended (logs, error messages, tool outputs, prompts, chain-of-thought).
**UCAs:** *given when not needed* (excess logging enabled); *wrong time* (sensitive content emitted before redaction).
**Safeguards:** output redaction; structured logging with allowlists; secrets never echoed; tool outputs filtered before reaching the model or downstream consumers.

---

## When to Re-Scan

Re-scan the H1–H8 list whenever:
- the agent acquires a new tool or capability
- the action targets production or shared state
- the action involves untrusted content (web, email, third-party APIs)
- the previous safeguards failed or the action pattern is novel

A single category can apply multiple times in one analysis. The same deletion might trigger H2 (loop risk if batched), H4 (mode confusion if the agent is unsure which flag is "old"), H6 (stale registry read), and H7 (cascading downstream flag removals).
