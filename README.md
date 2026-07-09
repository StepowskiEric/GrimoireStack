# GrimoireStack

A catalog of agent skills for making AI systems more reliable, disciplined, and useful in real work.

## Quick Install

```bash
# Interactive picker — choose agent and skills
npx grimoirestack install

# Install all skills to a specific agent
npx grimoirestack install --agent copilot
npx grimoirestack install --agent codex
npx grimoirestack install --agent hermes --with-mcp # includes MCP servers
npx grimoirestack install --agent claude
npx grimoirestack install --agent antigravity

# List available skills without installing
npx grimoirestack list
```

See [docs/installation.md](docs/installation.md) for full details including all agents, custom destinations, and VS Code Copilot setup.

## Supported Agents

| Agent | Install location | Format |
|-------|-----------------|--------|
| **Factory Droid** | `~/.factory/skills/` | `name/SKILL.md` (flat), lowercase-hyphen directory name |
| **OpenAI Codex** | `~/.agents/skills/` | `topic/name/SKILL.md` with YAML frontmatter |
| **VS Code Copilot** | `~/.copilot/skills/` | `name/SKILL.md` (flat), name must be lowercase-hyphen matching directory |
| **Pi Agent** | `~/.pi/agent/skills/` | `name/SKILL.md` (flat), same as Copilot |
| **Hermes** | `~/.hermes/skills/` | `topic/name/SKILL.md` with YAML frontmatter |
| **Claude Code** | `~/.claude/skills/` | `topic/name/SKILL.md` with YAML frontmatter |
| **Antigravity** | `~/.antigravity/skills/` | `topic/name/SKILL.md` with YAML frontmatter |

## Factory Droid

Install skills to `~/.factory/skills/` using a flat directory structure matching the skill's `name` field (lowercase-hyphen). Each skill should be a directory containing a `SKILL.md` with YAML frontmatter. Factory Droid discovers skills automatically from this folder. Skills can be invoked directly with `/skill-name`, or the Droid can load them automatically when they match the current task. Use `disable-model-invocation: true` in frontmatter to restrict a skill to manual invocation only.

The installer automatically adapts the format for each agent:
- Copilot and Pi use a flat structure (no topic subdirectories) and slug-normalize the `name` field to match the directory
- All other agents use topic-based subdirectories preserving the original `name` field

## Companion Scripts & MCP Servers

This repository ships with two kinds of tooling alongside skills:

| Type | What | How to get it |
|------|------|---------------|
| **Companion Python scripts** | `*.py` files shipped with specific skills (e.g. `lint_battalion.py`, `git_surgery.py`). Each is pure stdlib — no `pip install`. | `npx grimoirestack install --with-scripts --with-mcp` |
| **MCP Servers** | Raw stdio MCP servers in `mcp-servers/` — zero external deps, JSON-RPC over stdio with `Content-Length` framing. | Copy `mcp-servers/` into your project; add to Hermes `config.yaml` |

### MCP Servers included

| Server | Tools | Best for |
|--------|-------|----------|
| `mcp-servers/code-graph/server.py` | `index_repo`, `find_symbol`, `search_semantic`, `get_call_graph`, `get_dead_code` | Structured code navigation, symbol search, call-graph analysis |
| `mcp-servers/dev-diagnostics/server.py` | `run_diagnostics`, `parse_output`, `get_summary`, `contamination_check` | Unified lint/test/typecheck output parsing across 6+ tools |

Hermes config example:
```yaml
mcp_servers:
  code-graph:
    command: python3
    args: ["/full/path/to/GrimoireStack/mcp-servers/code-graph/server.py"]
  dev-diagnostics:
    command: python3
    args: ["/full/path/to/GrimoireStack/mcp-servers/dev-diagnostics/server.py"]
```

## Documentation

| Document | What's in it |
|----------|-------------|
| [Find by Use Case](docs/find-by-use-case.md) | "I need a skill for..." — tables matching situations to the best skill |
| [Skill Catalog](docs/skill-catalog.md) | Detailed per-skill entries: what it is, when to use it, best for |
| [Recommended Combinations](docs/recommended-combinations.md) | Skill stacks for common scenarios (debugging, architecture, refactoring...) |
| [Quick Reference](docs/quick-reference.md) | Compact tables of all protocol and framework skills |
| [Benchmarks](docs/benchmarks.md) | A/B evaluation results — empirical proof which skills work |
| [Installation Guide](docs/installation.md) | Detailed install instructions for each agent |

## Two Kinds of Skills

This repository contains **two kinds of skills**:

1. **Operational protocols** — skills that act like procedures or control systems.
   These benefit from a state-machine structure because the value is in gating behavior, forcing evidence collection, and preventing premature action.

2. **Conceptual frameworks** — skills that act like lenses, heuristics, routing models, or architectural principles.
   These do **not** always need to be state machines. In many cases, forcing them into a rigid protocol makes them worse: more ceremonial, less adaptable, and less readable.

### When to use which

Use a **state-machine/protocol** when the agent should:
- follow a repeatable sequence
- respect tool-gating by phase
- create mandatory diagnostic artifacts
- stop when a condition is met
- avoid looping, over-searching, or reckless execution

Use a **framework** when the agent should:
- adopt a way of seeing a problem
- reason about tradeoffs
- borrow principles from a book or framework
- improve judgment rather than enforce a workflow
- adapt ideas fluidly to many contexts

The strongest setups use **both**: protocols for execution discipline, frameworks for better judgment.

## Skill Categories

| Category | What it covers |
|----------|---------------|
| 🔧 Execution | Problem-solving protocols (debugging, refactoring, improvement) |
| 🧭 Judgment & Routing | Decision-making frameworks (routing, triage, risk analysis) |
| 🎛️ Orchestration | Workflow control (multi-agent, coordination, memory) |
| ✨ Output Quality | Self-improvement (revision, verification, clarity) |
| 🏗️ Systems & Architecture | Design principles (data, teams, reliability) |
| 🛠️ Development | Skill building and development workflows |
| 🐛 Debugging | Root-cause analysis and log correlation |
| 🧠 Reasoning | Faithfulness verification, **anti-hallucination**, token-efficient reasoning, and reasoning quality |
| 🤖 MLOps | Local LLM tooling and model management |

## Philosophy

This repo should not force one format onto every idea.

The goal is not to make everything look uniform.
The goal is to make each skill **more executable and more useful**.

Some skills become dramatically better when turned into state machines.
Others become worse.

A good agent-skill repository should preserve both:

- **control** where behavior must be constrained
- **judgment** where thinking quality matters more than workflow ceremony

---

# The GrimoireStack App

A React + Vite single-page app that presents the skill catalog as a living eldritch grimoire. Browse schools, search the abyss, cast spells, and inscribe them into your agent's workshop.

```
app/
├── src/
│   ├── App.jsx               # Root: providers, state, modals, lazy splits
│   ├── App.css               # Theme tokens + every component style
│   ├── data/                 # schools, spell catalog, schema, sigils, graph
│   ├── hooks/                # Favorites, Recent, Marginalia, Signals, Cast
│   ├── components/           # See "Components" below
│   ├── i18n/                 # Grimoire ↔ Plain language toggle
│   ├── utils/                # Exporter, problem match, URL spell sync
│   ├── audio/                # Witch laugh, page creak, ambience
│   └── test/                 # Vitest unit + a11y + Playwright e2e
└── scripts/                  # prerender, sitemap, RSS build steps
```

## Design language

The interface is themed as a Cthulhu-mythos / Bloodborne-style grimoire. Design tokens in `App.css` `:root`:

| Token group | Purpose |
|-------------|---------|
| `--abyss`, `--abyss-deep`, `--void` | Background — pitch black with subtle violet wash |
| `--sickly`, `--sickly-bright`, `--sickly-dim` | Bioluminescent teal-green for eye glow and active states |
| `--bruised`, `--bruised-dim` | Cosmic purple for chrome highlights and active links |
| `--moonlight`, `--moonlight-dim`, `--moonlight-mute` | Tarnished parchment text colors |
| `--blood`, `--blood-dim` | Sparingly used for warnings and OOD results |
| `--gold`, `--gold-bright`, `--gold-glow` | Active focus rings and key highlights |
| `--leather`, `--leather-mid`, `--leather-edge` | Card surfaces |
| `--purple`, `--purple-dim`, `--purple-glow` | Decorative rune accents |

Typography: `Cinzel` / `Cinzel Decorative` (serif display) and `Cormorant Garamond` (body) loaded via Google Fonts in the prerendered HTML.


## Components (current)

| Component | Role |
|-----------|------|
| `GrimoireStackLayout` | Three-pane layout shell |
| `GrimoireEye` | The animated central eye with mouse-tracking pupil, search input, and featured school filaments |
| `SchoolCardGrid` | Featured schools with "Customize" picker; selection persisted to `localStorage['grimoire-featured-schools']` |
| `AllSchoolsView` | Searchable grid of every school |
| `SpellDetailView` | School-detail page; lists spells with favorite + marginalia per spell |
| `SpellCard` | Single spell card with favorite toggle |
| `FavoritesView` | The Vault — favorites, recently viewed, marginalia |
| `RecipeLabView` | The Rituals tab — pick 2 spells and open the compare modal |
| `BestiaryCodex` | The Bestiary — alphabetical compendium with deep filters and cosmic-horror visual treatment |
| `SettingsView` | Cast animation toggle, language switch, export, keyboard shortcut link, GitHub |
| `SpellModal` | Full spell view — Plain English ↔ Full Grimoire Entry toggle, marginalia, signals (up/down), share, multi-agent inscribe |
| `LidlessEyeCast` | Animated SVG cast that opens before the modal; per-school hand-drawn sigils (`schoolSigils.jsx`); 5 phases (wake, bleed, sigil, name, close) |
| `CompareSpellsModal` | Side-by-side spell comparison with picker |
| `ProblemIntakeModal` | Free-text problem → ranked spell suggestions |
| `WitchDoctorModal` | Guided category → situation → spell flow |
| `ShortcutsModal` | `?` keyboard cheatsheet |
| `ApprenticeWelcome` | 3-panel first-visit onboarding |
| `InstallPrompt` | PWA install prompt (dismissed via `localStorage['grimoire-install-dismissed']`) |
| `ErrorBoundary` | Top-level error boundary |
| `Embers` | Drifting bioluminescent particles (fixed background) |
| `Icon` | Hand-crafted SVG icon set (archive, vault, alembic, tools, sigil, search) |
| `LanguageToggle` | Grimoire ↔ Plain language switcher (mounted in the sidebar) |

## Data model

The contract is defined in `data/schema.js` (with `validateSpell`, `validateSchool`, `validateSchools`, `validateWizardData`).

**School** — `{ id, real, name, symbol, desc, spells[] }`

**Spell** — `{ name, skill, effect, status?, note?, combos?[] }`

**Sources of derived data:**
- `data/spellCatalog.js` — id-based spell lookup; used by compare, intake, witch doctor
- `data/spellMetadata.js` — alphabetical index, recently-updated feed (with explicit `lastUpdated` dates and curated `note` strings), per-spell "is explicit" flag
- `data/spellGraph.js` — nodes + edges (weighted by reciprocal combo mentions) for any future relationship graph
- `data/tiers.js` — `TIER_META` for arcane-tier badges
- `data/schoolSigils.jsx` — 15 hand-drawn SVG sigils, one per school
- `data/wizardData` (`schools.js` `WIZARD_DATA`) — 11 categories × 70 situations; used by `WitchDoctorModal` and `ProblemIntakeModal`
- `data/constants.js` — `REPO_URL`

## Hooks

| Hook | What it stores | Storage key |
|------|----------------|-------------|
| `useFavorites` | Per-spell favorite state | `grimoire-favorites` |
| `useRecentlyViewed` | MRU list of opened spells | `grimoire-recent` |
| `useMarginalia` | Per-spell scratchpad notes | `grimoire-marginalia` |
| `useSignals` | Local up/down votes + deterministic synthetic aggregate | `grimoire-signals`, `grimoire-signals-aggregate` |
| `useKeyboardShortcuts` | Global `?` / `/` / `j` / `k` / `f` / `Esc` handling | — |
| `useSpellInteraction` | Modal + casting + URL sync + not-found state | — |
| `useEldritchCast` | The five-phase cast animation timeline | — |
| `useLanguage` (`i18n/LanguageContext`) | Grimoire ↔ Plain language | `grimoire-lang` |
| `useSpellInteraction` also handles `?s=<skill>` and `/s/<skill>` deep links via `utils/urlSpellSync.js` |

All `useStorage` writes are wrapped in `try { ... } catch {}` so private-mode browsers degrade gracefully.

## URL routing

Per-spell deep links:

- `https://<host>/s/<skill>` — canonical
- `https://<host>/?s=<skill>` — legacy

Opening one of these URLs auto-opens the spell modal after a 300 ms delay (to let the eye render). Browser back/forward is hooked to the same state machine via `popstate`. Unknown skills trigger the not-found path in `useSpellInteraction`.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `?` | Open the cheatsheet modal |
| `/` | Focus the search input in the pupil |
| `j` / `↓` | Focus next visible spell card |
| `k` / `↑` | Focus previous visible spell card |
| `f` | Toggle favorite on the focused card |
| `Esc` | Close the topmost modal/overlay (welcome, shortcuts, witch doctor, compare, intake, spell modal) |

## Build pipeline

```bash
cd app
npm run dev           # vite dev server
npm run build         # vite build + prerender + sitemap + RSS
npm test              # vitest
npm run test:e2e      # playwright (requires dev server)
```

`npm run build` runs four steps in order:

1. `vite build` — bundle the SPA
2. `scripts/prerender.mjs` — pre-render all `schools` and per-spell `/s/<skill>` routes to static HTML for SEO and OG tags
3. `scripts/build-sitemap.mjs` — emit `sitemap.xml`
4. `scripts/build-rss.mjs` — emit the changelog RSS feed

Output: `app/dist/`. Deploy with `npx wrangler pages deploy dist --project-name grimoirestack`.

## Testing

- **Vitest unit tests** in `app/src/test/` — covers data, hooks, utils, components, a11y, search, exporter, problem matcher, spell graph, spell metadata, URL sync
- **Playwright e2e** at the repo root — covers navigation, search, favorites, marginalia, signals, keyboard shortcuts, PWA install prompt, axe a11y
- Run only unit: `cd app && npm test`
- Run only e2e: `cd app && npm run test:e2e:prod` (uses the built `dist/`)
- Run all: `cd app && npm test && npm run test:e2e:prod`

## Theming overrides

Add a CSS variable override in `App.css` `:root` or a `<style>` block. The app honors `prefers-reduced-motion` by collapsing the cast animation to a cross-fade (`lidless-cast--reduced`).

## Removing or reimplementing features

See [`FEATURES_ARCHIVE.md`](./FEATURES_ARCHIVE.md) for a catalog of features that existed in earlier designs and were deliberately removed during the eldritch refactor, with notes on how each could be reimplemented in the current theme.
