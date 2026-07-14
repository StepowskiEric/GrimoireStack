---
name: recency-grounding
description: User-invoked pre-claim audit for one unfamiliar or post-cutoff library. Invoke with `/recency-grounding <library> [version]`.
disable-model-invocation: true
---

# Recency Grounding

Pre-reasoning audit for one library the agent has not seen, or whose version is past training cutoff. Produces a grounded stamp the downstream skills (`api-surface-anchoring`, `hallucination-anchor-chain`) can build on.

This is the upstream gate. It does not anchor per-claim — that is `hallucination-anchor-chain`. It does not verify per-call-site — that is `api-surface-anchoring`. It audits the library *as a whole* before any claim about it gets written.

---

## When to Invoke

- An `import` / `require` / `use` is for a library whose name isn't recognized
- A version pin is newer than the agent's training cutoff
- The library exists in training but the API has shifted across versions
- The user names a package they suspect the agent has wrong

Do NOT invoke for:
- Stdlib (`os.path`, `fs.readFile`)
- Internal modules in the same repo
- Libraries the agent already grounded this session

---

## Depth

| Depth | What it produces | When |
|---|---|---|
| **shallow** | identity + current version + 1-line description | "does this thing still exist, is it what I think" |
| **medium** (default) | shallow + conceptual API sketch + key gotchas | "I am about to use this in code work" |
| **deep** | medium + deprecation map + migration notes | "I am rewriting a chunk that depends on this" |

---

## Protocol

### Step 1 — Identify the target
Resolve to canonical identifiers:
- Package name (e.g. `httpx`, `next`, `react`)
- Package registry (npm, PyPI, crates.io, Maven Central, Go modules)
- Version requested (or "latest")
- Repo URL (when discoverable from registry)

**Done when:** all four set, none `unknown`.

### Step 2 — Confirm existence and version
Fetch the registry. Confirm the package exists under the requested name (not a typosquat, not a deprecated transfer). Confirm the requested version exists. Note the current latest.

If requested version does not exist → stop, report mismatch, ask the user. Do not silently fall back to latest.

**Done when:** library confirmed real; version confirmed real OR user notified.

### Step 3 — Fetch authoritative docs
Pull current reference material. Order of preference:
1. Official docs (vendor site)
2. README on the canonical repo
3. CHANGELOG / release notes for the requested version
4. Source code for the requested version (when API surface is small)

Skip blog posts, tutorials, AI summaries. Authoritative only.

**Done when:** at least two sources read; URLs logged.

### Step 4 — Sketch the conceptual API
Write a one-paragraph description plus a 5-10 bullet sketch of top-level structure (entry point, key classes/functions/modules). State what was found, what was skipped, and why. "Sketch" is deliberate — you are not auditing every method.

**Done when:** sketch is 1 paragraph + 5-10 bullets; sources cited inline; depth cap respected (deep can run longer, medium cannot).

### Step 5 — Note gotchas and deprecations
From the changelog and recent issues (last 6-12 months), extract:
- breaking changes since the version in training (if any)
- known deprecations
- commonly-misused patterns ("people always import X but Y is the canonical path now")

If nothing relevant in the window, say so explicitly. Do not invent gotchas.

**Done when:** list populated, or "no recent gotchas" noted with date window.

### Step 6 — Confidence assessment
Tag each finding with the same vocabulary `hallucination-anchor-chain` uses: `certain` / `likely` / `uncertain` / `speculative`. The stamp's overall confidence is the minimum across findings.

**Done when:** every claim in the stamp has a confidence label.

### Step 7 — Emit the stamp
Output the stamp using the template below. Save it alongside the code that uses the library (e.g. `recency-grounding-<library>-<version>.md` in the same folder) and show the receipt to the user.

**Done when:** stamp file written; receipt shown.

---

## Stamp Template

```md
---
library: <canonical name>
registry: <npm | pypi | crates.io | maven | go modules>
version_audited: <requested version>
version_current: <latest as of date>
audit_depth: <shallow | medium | deep>
audit_date: <YYYY-MM-DD>
overall_confidence: <minimum across findings>
---

# Recency Stamp — <library> <version>

## Identity
- Canonical name: <name>
- Registry URL: <url>
- Repo: <url>
- Version audited: <X.Y.Z>
- Version current: <X.Y.Z> (as of YYYY-MM-DD)
- Mismatch? <yes / no>

## Conceptual API
<one paragraph>

- `<symbol>` — <one-line role>
- `<symbol>` — <one-line role>
- ...

## Gotchas and Deprecations (<window>)
- <gotcha 1>
- <gotcha 2>
- none in window

## Sources
- <URL 1> — <what it confirmed>
- <URL 2> — <what it confirmed>

## Open Questions
- <anything the audit couldn't resolve>
```

---

## Stop Conditions

- Stamp emitted (default exit)
- Identity not confirmable → stop, ask user
- Requested version does not exist → stop, surface mismatch
- User aborts

---

## Pairings

- **api-surface-anchoring** — when code work begins, anchor each *call site* against the upstream stamp.
- **hallucination-anchor-chain** — when writing natural-language claims about the library, anchor them.
- **effective-web-search** — the audit's search discipline; this skill is the deliverable, effective-web-search is the method.
- **failure-swarm** — once the stamp is grounded, run failure-swarm on the spec; the stamp pre-empts the "I don't know what X is" failure mode.

---

## Failure Modes of the Skill Itself

- **Typosquat capture** — registry returns a similar-named package that isn't the one requested. Defence: in step 2, confirm canonical name and repo URL, not just package-name string match.
- **Stale CHANGELOG** — README describes v1, registry ships v2, CHANGELOG is forgotten. Defence: in step 3, also read the registry's "latest" field, not only the docs landing page.
- **Sketch inflation** — the API sketch grows past 10 bullets and re-implements the docs. Defence: enforce the 5-10 bullet cap at medium; switch to deep to expand.
- **Confidence bluffing** — tagging uncertain claims as `certain` because the source looked authoritative. Defence: confidence is per-claim, not per-source; a third-party blog source keeps the claim at `likely` even when the rest of the stamp is `certain`.
- **Never invoked** — code work proceeds on an unknown import without this skill. Defence: pair this skill with `api-surface-anchoring`; the call-site verification should list this skill's stamp as prerequisite for any post-cutoff library.
