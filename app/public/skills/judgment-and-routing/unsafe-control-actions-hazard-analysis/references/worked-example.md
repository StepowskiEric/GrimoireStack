# Worked Example: An Agent Wiping Production State

A coding agent is asked to "clean up old feature flags." The control action is `delete_flag(name)`. Walked through the Six-Question Analysis.

---

## 1. Losses (ranked)

1. **Customer-visible feature outage** — a deleted flag is still being read by production code.
2. **Data loss** — a flag is misidentified as "old" but is referenced in stored state (saved configurations, audit logs).
3. **Irreversible change** — hard delete with no soft-delete trail.

---

## 2. Hazards (states, not causes)

- The agent's notion of "old" diverges from reality (registry staleness).
- The agent treats its own read of the flag registry as authoritative even though the registry lags production.
- Multiple dependent services are still on the old flag path.

---

## 3. Control Action

`delete_flag(name)` issued against the production flag service.

---

## 4. UCAs

| UCA | Risk | Acceptability |
|---|---|---|
| **Not given when needed** | A flag is actually dead code; the agent refuses because it cannot prove safety. Loss: technical debt remains. | Acceptable. |
| **Given when not needed** | The agent deletes a flag that is still in use. Loss: outage. | **Severe.** |
| **Wrong time** | The agent deletes the flag before dependent services are confirmed to be off the old path. Loss: cascading outage. | **Severe.** |
| **Wrong duration** | Not applicable for a single delete, but the *batch* of deletes is a duration hazard — agent keeps going after a single failure. | Medium. |

---

## 5. Safety Constraints

- No deletion of any flag that received traffic in the last 30 days.
- Deletions are reversible for 7 days (soft delete, then hard delete).
- Maximum 50 deletions per session — abort and report above that.

---

## 6. Safeguards (tied to specific UCAs)

| Safeguard | UCA addressed | Mechanism |
|---|---|---|
| Re-check flag usage *immediately before* each delete | H6 (stale state) | Freshness check between read and act |
| Per-flag human approval for any flag that appeared in production logs in the last 30 days | H4 (mode confusion) | Human gate enforced on the action side |
| Soft delete only; hard delete requires a separate action | All "given when not needed" | Reversibility window |
| Hard cap of 50 deletes per session; abort and report after that | H2 (runaway loop) | Iteration ceiling |
| Log every read the agent relied on, so a human can audit the decision | H8 (information disclosure) | Audit trail |
| Dry-run preview before any batch deletion | H7 (side-effect amplification) | Fan-out estimate |

---

## Why This Example Matters

The original plan ("just delete the unused flags") looked correct. The UCA was not in the action itself but in the *interaction* between read, decide, and act. This is the canonical shape of LLM-agent incidents:

- **Knight Capital 2012** — a "cleanup" deployment reactivated retired code paths; read of the old config looked correct; the *interaction* with the live order router was the UCA.
- **GitLab 2017** — a database cleanup script with the wrong replication target; the "delete" action was correct, the "where" was the UCA.
- **Cloudflare 2017** — a routine config push triggered a router rule that had been dormant; the UCA was in the *combination* of push + dormant rule.

In all three, the Six-Question Analysis would have surfaced the UCA before the action was taken.
