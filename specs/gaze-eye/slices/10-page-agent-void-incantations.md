# Slice 10 — page-agent "void incantations" (FUTURE / PHASE 2 — OPTIONAL, no build)

> **Status: research spike only. NOT in the current Gaze build sequence.** Captured
> per the user's interest in Alibaba's
> [page-agent](https://github.com/alibaba/page-agent) (MIT, client-side GUI agent:
> reads live DOM as text, executes natural-language commands, bring-your-own-LLM).
> Developer guide reviewed: `docs/developer-guide.md`.

## The idea

Make the Great Eye a **resident otherworldly GUI agent**. Instead of (or beneath) the
ritual form, the user speaks/types "incantations" to the void; page-agent executes
them as **scoped DOM actions** on the grimoire (open the divination panel, filter a
school, begin the ritual). At peak gaze (slice 09) the eye "listens." This inverts
the friendly-SaaS-copilot framing into something uniquely Eldritch: *the void
operates your page.*

## Why it's distinctive

Most page-agent demos are boring SaaS copilots. GrimoireStack could be the first
**horror-themed GUI agent** — a positioning no one else occupies.

## Hard realities (why it is Phase 2, not now)

Grounded in the page-agent developer guide + README:

1. **LLM backend required for natural language.** page-agent needs a model
   (`LLM_API_KEY`, `LLM_BASE_URL`) or its eval-only demo API (not production). The
   front page currently has no such backend.
2. **Key must not ship to the client.** The dev guide warns the API key is
   **inlined in the client IIFE** if you bundle with it. Real incantations therefore
   need a **backend proxy** holding the key — a genuine architectural add for a
   static Cloudflare Pages app (today it has only KV/edge, no LLM proxy).
3. **Scripted path exists without an LLM.** `packages/page-controller` does DOM
   operations + visual feedback *independent of the LLM*. So a *scripted*,
   allowlisted "the void acts on the page" (e.g. at peak gaze the eye auto-opens the
   relevant skill) is possible with **no key and no cost** — but it is not
   natural-language. Two distinct sub-options:
   - (a) Scripted allowlisted actions via `page-controller` — safe, cheap, no LLM.
   - (b) Natural-language incantations via full `page-agent` — needs the proxy (1,2).
4. **Security surface.** An in-page natural-language DOM operator on a public site is
   a prompt-injection / XSS-adjacent risk. Requires CSP + a strict action allowlist
   (no arbitrary JS, no navigation outside the grimoire).
5. **No parallel agent.** GrimoireStack already has its own AI interview loop
   (ritual/consultation). page-agent must *become* the eye's intelligence or a scoped
   accessibility layer — never a second competing agent (simplicity-first + spec
   firewall).
6. **Scope.** This is a feature, not a visual tweak. It deserves its own spec when
   the user approves Phase 2 — not a bolted-on slice here.

## What to do if approved later

- Spin a separate `specs/void-incantations/` with its own slice ladder.
- Research spike first: `npm i page-agent` in a branch, mount `new PageAgent({...})`
  behind a dev flag, confirm the DOM-action allowlist model against the grimoire's
  real elements. Decide LLM sourcing (user-provided key via a backend proxy? a
  server route? Ollama-local for dev?).
- Decide scripted (`page-controller`, no LLM) vs natural-language (full `page-agent`
  + proxy) — likely start with (a) to de-risk, then (b).

## Verification (when built)

- Incantations execute only allowlisted DOM actions; injection attempts are denied
  and logged.
- `prefers-reduced-motion` / no-LLM fallback: eye still works as pure visual (slices
  01–09) with no agent.
- Accessibility win: voice/natural-language navigation of the grimoire.

## Human feedback that would change this slice

- User declines → delete this slice file; Gaze eye stays visual-only.
- User approves Phase 2 → promote to its own spec; keep slices 01–09 shippable
  first.
