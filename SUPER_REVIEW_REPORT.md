# Super Review TypeScript — Report
## GrimoireStack (`app/`)

## Super-Review Summary
- **Review surface:** `/Users/mini/Documents/GrimoireStack/app/src`, `/Users/mini/Documents/GrimoireStack/app/scripts`
- **Extensions included:** `.js`, `.jsx`
- **Extensions excluded:** `.ts`, `.tsx` (none present in review surface)
- **Excluded dirs:** `node_modules/`, `dist/`, `build/`
- **Total files scanned:** 30 source files + 2 verification scripts
- **Errors:** 0
- **Warnings:** 2
- **Info:** 6

---

## Top 3 Critical Findings

1. **WARNING:** Regex-based HTML sanitization may miss edge-case XSS vectors in `app/src/components/SpellModal.jsx:621`. The app renders fetched markdown through a custom regex sanitizer before `dangerouslySetInnerHTML`. While it strips `<script>`, `<iframe>`, event handlers, `javascript:`, and `data:` URLs, regex sanitizers are inherently brittle. Consider adding DOMPurify or equivalent for defense-in-depth.
   - **Fix:** Replace `sanitizeHtml()` with DOMPurify.sanitize() or a maintained HTML sanitization library.

2. **INFO:** Direct `btn.innerHTML` mutations in `app/src/components/SpellModal.jsx:636-697` bypass React's virtual DOM. The share/inscribe buttons mutate `innerHTML` to show copy feedback states. This works but creates a pattern where React state and DOM can drift if the component re-renders during the timeout window.
   - **Fix:** Consider using React state (`copyStatus`) instead of direct DOM mutation for button text/class changes.

3. **INFO:** No TypeScript configuration or `.ts`/`.tsx` files found in the app. The review surface is entirely JavaScript/JSX. This means type-safety violations and hallucination detection via type definitions are not applicable to this codebase as-is.
   - **Fix:** None required for current codebase. If TypeScript is added later, re-run this review with `.ts`/`.tsx` files included.

---

## Detailed Findings by Category

### Security (0 errors, 1 warning)

| Severity | File:Line | Finding | Evidence |
|----------|-----------|---------|----------|
| **WARNING** | `src/components/SpellModal.jsx:621` | `dangerouslySetInnerHTML` used with regex-based sanitization | Code path: `fetchSkillMd()` → `simpleMarkdownToHtml()` → `sanitizeHtml()` → `<div dangerouslySetInnerHTML={{ __html: mdContent }} />`. The sanitizer strips scripts, iframes, event handlers, `javascript:`, and `data:` URLs via regex. Verified by reading `src/components/SpellModal.jsx:569-614`. |
| **INFO** | `src/components/SpellModal.jsx:642-656, 688-697` | Direct `btn.innerHTML` mutations on share/inscribe buttons | Verified by reading `src/components/SpellModal.jsx:636-697`. Content is controlled literal strings (`'Link Copied!'`, `'Copy failed'`, `'Incantation Inscribed'`). No user input flows into these strings. |
| **INFO** | `src/hooks/useFavorites.js`, `src/hooks/useMarginalia.js`, `src/App.jsx` | Extensive `localStorage` usage for client-side state | Verified by reading files. Data stored: favorites list, marginalia notes, language preference, cast/audio toggles, featured schools. No secrets or credentials. |
| **INFO** | `scripts/diagnose-*.mjs`, `scripts/walk.mjs`, `scripts/probe-cast-bones.mjs` | `spawn('npm', ['run', 'dev'], { cwd: process.cwd() })` | Verified by reading script files. These are dev tooling scripts, not user-facing app code. `process.cwd()` resolves to the script's working directory; `npm run dev` is not a sensitive command. |

### Hallucinations (0 findings)

| Finding | Evidence |
|---------|----------|
| No non-existent imports detected | All imports verified against `app/package.json` dependencies and `app/src` file structure. |
| No invented methods detected | No method calls on built-in types that don't exist in standard JS/React APIs. |
| No type contradictions | No TypeScript type system present; all code is JS/JSX with no type annotations to contradict. |

### Logic Bugs (0 errors, 0 warnings, 1 info)

| Severity | File:Line | Finding | Evidence |
|----------|-----------|---------|----------|
| **INFO** | `src/components/SpellModal.jsx:685-697` | `restore()` callback uses `btn.dataset.originalHtml` which is set in the same click handler. If React re-renders the button between mutation and timeout, the DOM node reference may be stale. | Verified by reading the inscribe button handler. The `restore` function closes over `btn` from the event handler scope. If the button unmounts/remounts, the timeout operates on a detached node. |

### Type Safety (0 findings)

| Finding | Evidence |
|---------|----------|
| No TypeScript files present | `Glob` search for `**/*.ts` and `**/*.tsx` returned no results in `app/src`. |
| No `any` usage | `Grep` for `\bany\b` in JS/JSX files returned no matches in review surface. |
| No type assertions | `Grep` for `as ` type assertions returned no matches in JS/JSX files. |

### Architecture / Concurrency (0 errors, 0 warnings, 4 info)

| Severity | File:Line | Finding | Evidence |
|----------|-----------|---------|----------|
| **INFO** | `src/components/SpellModal.jsx:50-300` | Hand-rolled markdown-to-HTML converter (~250 lines) | `simpleMarkdownToHtml()`, `parseTables()`, `wrapLists()`, `escapeHtml()`, `sanitizeHtml()`. This is intentional for the themed app but increases maintenance surface. |
| **INFO** | `src/hooks/useFavorites.js`, `src/hooks/useMarginalia.js` | Hand-rolled localStorage persistence hooks | Appropriate for this app's scope (no backend). Each hook has its own `load()`/`save()` pattern. |
| **INFO** | `src/hooks/useEldritchCast.js` | Direct `requestAnimationFrame` management with refs | The hook manages its own rAF loop and cleanup. Pattern is sound; the ref-based imperative timeline avoids stale closures. |
| **INFO** | `scripts/verify-jsx-imports.mjs`, `scripts/verify-deploy-assets.mjs` | Custom verification scripts instead of standard tooling | These scripts enforce project-specific invariants (JSX import whitelist, build asset references). They work but add maintenance overhead. |

---

## Suggested Remediation Order

1. **WARNING:** Address the regex-based sanitization in `SpellModal.jsx`. Add DOMPurify or equivalent to harden the `dangerouslySetInnerHTML` path.
2. **INFO:** Replace direct `btn.innerHTML` mutations with React state for copy feedback. This prevents potential DOM/state drift if the component re-renders during timeout callbacks.
3. **INFO:** No action required. All other findings are accepted trade-offs for this frontend-only, client-side app.

---

## Residual Risk

- **Accepted:** Regex-based HTML sanitization. The app only renders markdown from its own skill files, not arbitrary user-generated content. Risk is low but non-zero.
- **Accepted:** Direct DOM manipulation via `innerHTML` on controlled button elements. Content is never derived from user input.
- **Accepted:** No TypeScript. The codebase is intentionally JS/JSX. Type-safety findings are not applicable.

---

## Review Metadata

- **Tooling run:**
  - `npm run lint` — 0 errors, 0 warnings
  - `npm test` — 424 tests passed
  - `npm run build` — clean build
- **Manual inspection:** 30 source files + 2 scripts
- **Research basis:** arXiv:2308.11445, 2401.17438, 2404.11055, 2402.10123, 2601.19106
