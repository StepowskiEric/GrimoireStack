---
name: effective-web-search
description: "Web search discipline for technical research. Official-docs-first, version-aware, full GitHub issue follow-through."
triggers:
  - Need to look up an error, library behavior, framework quirk, or bug
  - Need official-docs-first, version-aware research
  - Need full GitHub issue follow-through
  - Risk of latching onto the first outdated result
disable-model-invocation: true
---

# Effective Web Search

A first search hit is not an answer. It is a *lead*. The agent's job is to follow the lead until the answer is grounded, version-correct, and still current.

This skill exists because the default failure mode is:

> Search for error message -> grab the first GitHub issue or Stack Overflow answer -> quote it as truth -> done.

That answer is almost always wrong in at least one of these ways: outdated, version-mismatched, closed-and-fixed, or superseded by a later issue. The protocol below prevents that.

## When to Use

- Investigating an error message, exception, or stack trace
- Looking up library / framework / API behavior
- Confirming or refuting a claim about how a tool works
- Researching a bug before proposing a fix
- Any "let me check the docs / GitHub / web" moment

## When NOT to Use

- Looking at code in the local repo (use `grep` / `read` instead)
- Recalling well-known, stable language stdlib behavior you have used many times
- Quick questions where "good enough" is explicitly requested by the user

## Core Rule

**Do not answer from a single source.** An answer is only as good as the *weakest* source it relies on. If any one source is wrong, the answer is wrong. Minimum two independent, version-appropriate sources must agree before you state something as fact.

## Protocol

### Step 1: Identify What You Actually Need

Before searching, write down the exact question:

- What library / framework / API? (and which version?)
- What behavior am I trying to confirm or refute?
- What is the *minimum* fact I need to act on?

If the user mentioned a version (e.g. "React 19", "Next 14", "Python 3.12"), you are bound to that version. If they did not, assume the latest stable unless told otherwise, and say so explicitly.

### Step 2: Official Docs First

Always start with the authoritative source:

| Domain | Authoritative source |
|---|---|
| JavaScript / TypeScript libs | Official site docs (e.g. `react.dev`, `nextjs.org/docs`, `vite.dev`) |
| Python | Library's official readthedocs / GitHub README / official site |
| npm package | The package's official docs site, not npmjs.com description |
| Rust crate | `docs.rs/<crate>` |
| Go module | `pkg.go.dev` |
| Java/JVM | Library's official site (Spring, Hibernate, etc.) |
| Apple platforms | `developer.apple.com/documentation` |
| Internal / niche | The library's own GitHub repo `README.md` + `/docs` |

Use the `WebSearch` and `FetchUrl` tools, not just the model's prior knowledge. Prior knowledge has a cutoff; docs do not.

If the official docs page does not exist or is incomplete, treat that as a signal, not a blocker. Continue to Step 3, but note the gap.

### Step 3: Match the Version

Library docs change. A `WebSearch` for "how to do X" will return hits from 2019 next to hits from last week. Disambiguate by version.

- Check the current installed version (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, etc.) before searching
- Search with the version qualifier: `"react 19 useEffect cleanup"` not just `"useEffect cleanup"`
- Prefer docs URLs that include the version in the path (e.g. `/docs/v3.4/...`) when the library supports it
- When in doubt, click through to the latest docs and look for a version selector

If you cannot pin a version, say so in your answer. Do not silently blend docs from two versions.

### Step 4: Treat GitHub Issues as Threads, Not Headlines

A GitHub issue is a *conversation*, not a fact. A lead from search results is the start of a thread you must read.

For every GitHub issue you land on, capture all of the following before quoting it:

1. **State** — open or closed? If closed, why? (`completed`, `not planned`, `duplicate`, `wontfix`)
2. **Last activity date** — silence for 2+ years on an open issue is a red flag; the fix may have happened elsewhere
3. **Linked PRs** — the actual fix is usually in a linked PR, not the issue body
4. **Linked closing issues / duplicates** — these often point to the real, newer thread
5. **Maintainer responses** — the green-lit comment from a maintainer beats ten user comments
6. **Version labels** — `affects: v2.x`, `fixed in: v3.1`, milestone tags
7. **Comments saying "fixed by #N"** — follow them. That `#N` is the truth.

Then, after reading the issue:

- Sort issues by **Newest** (not Best match or Most commented) and scan the top 5. Newer issues override older ones.
- Search the issue tracker directly: `repo:owner/name "error message"` on GitHub. This often surfaces the *closing* issue that the broad search missed.
- Check the `CHANGELOG.md` / releases page for the fix. If the issue is closed and the fix is shipped, the right answer is "this is fixed in vX.Y, upgrade."

### Step 5: Cross-Reference

You are not done after one source. Build a quick triangulation:

- Official docs say X
- GitHub issue #1234 (closed, fixed in v3.1) confirms X
- A second, independent source (e.g. release notes, a second library's docs, the spec) agrees

Two agreeing sources is the floor. Three is better. Sources that disagree mean you need to dig deeper, not pick a side.

Watch for these specific failure modes:

- **Outdated blog post** contradicting current docs. Docs win, but check the blog post's date.
- **AI-generated tutorials** that confidently state things the official docs do not say. They are wrong more often than they are right.
- **Stack Overflow answers** that were correct for v1 but the API changed. Always check the answer's date and the version it references.

### Step 6: State the Answer with Provenance

When you finally answer, the user should be able to verify your claim in under 30 seconds. Include:

- The version your answer applies to
- The source(s) you checked (URL, not just "the docs")
- For bug claims: the issue / PR / release where it was fixed
- If you are uncertain, say so — and say what would resolve the uncertainty

Template:

> Per `<source URL>`, the behavior in `<version>` is `<claim>`. This matches `<second source URL>`. If you're on an older version, see `<issue URL>` — fixed in `<release>`.

## Anti-Patterns

- **First-hit truth**: "I found a GitHub issue that says X" -> this is not an answer, it is a lead.
- **Version-less claims**: stating library behavior without naming the version it applies to. The user may be on a different version.
- **Trusting AI-generated blog posts**: they hallucinate confidently. Cross-reference with the actual docs.
- **Stopping at the first issue**: a closed 2019 issue is a dead end. The 2024 issue is the real one.
- **Skipping official docs**: blog posts and SO answers are derivatives. The primary source is the official docs and the source code.
- **Quoting docs that don't say what you claim**: a doc page that *mentions* a feature is not the same as one that *documents* it. Read the actual section.
- **Ignoring the CHANGELOG**: the fix is often in the changelog, not in any issue. Always skim it.
- **Stopping at "I remember"**: prior knowledge has a cutoff and is version-agnostic. Verify with a current source.

## Worked Example

User: "My Next.js app is throwing `Error: Cannot find module './chunks/...'` after upgrading to 14.2.5."

Bad response (do not do this):
> This is a known issue. See https://github.com/vercel/next.js/issues/12345 — the workaround is to delete `.next` and rebuild.

Why it's bad:
- Issue #12345 may be from 2022 and pre-14.x. The reporter may be on a different version.
- The "workaround" may have been the actual bug fix, not a workaround.
- Nothing in the answer pins a version or links a closing fix.

Good response (do this):
1. Pin version: user is on Next 14.2.5. Confirm via `package.json` if available.
2. Official docs: search `nextjs.org/docs` for the error string and 14.2.5 release notes.
3. GitHub: search `repo:vercel/next.js "Cannot find module './chunks"` with sort by **Newest**. Read the top 3 issues.
4. For each issue: state, last activity, linked PR, version labels.
5. Cross-reference: CHANGELOG.md for 14.2.x and 15.x to see if it's fixed.
6. Answer:
   > This was a known issue in 14.2.x and is fixed in 14.2.6 (per [release notes](url) and [PR #5678](url)). The fix: upgrade `next` to `^14.2.6` and clear `.next`. If you're already on 14.2.6+, the error is likely a stale build cache — delete `.next` and rebuild. Sources: [release notes](url), [closing issue](url), [docs](url).

## Quick Checklist Before You Answer

- [ ] I checked the official docs for the version in question.
- [ ] I read the full GitHub issue thread (state, last activity, linked PR, version labels), not just the title.
- [ ] I sorted GitHub issues by Newest and scanned more than one.
- [ ] I have at least two independent sources that agree.
- [ ] I named the version my answer applies to.
- [ ] I included source URLs the user can verify in under 30 seconds.
- [ ] I said what I am uncertain about, if anything.

## See Also

- `assumption-grounding` — Verify before acting, in general.
- `api-surface-anchoring` — Specifically for library API signatures.
- `hallucination-anchor-chain` — Anchor every factual claim to a verified source.
- `verify-before-integrate` — Pre-commit verification for integrations.
- `research` — Broader research workflow umbrella.
