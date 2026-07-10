---
name: split-large-files
description: Use when the agent encounters a file nearing or exceeding ~500 lines, when asked to refactor a large module or extract functions, when reviewing a PR with oversized files, or when about to add code to a file that is already large. Applies SOLID, DRY, KISS, and clean-code extraction. Pairs with separation-of-concerns, refactor-clean, domain-driven-design.
---

A file accumulates code until its original purpose blurs. The tool that restores it is the **seam** — a natural boundary in the code where one responsibility ends and another begins. Cutting along seams keeps extracted code coherent; cutting against them scatters logic and creates coupling that is harder to maintain than the original file.

**Bold terms** at first use are entry points into the protocol; the order they appear in is the order the protocol expects them.

## Pressure — when a file needs splitting

A file past ~500 lines has **pressure** — measurable signals that reading, changing, or testing it costs more than it should. Trust the signals, not the line count alone:

- **Changes cluster by theme** — recent commits touch only one group of functions, while the rest of the file sits untouched. The active group wants its own file.
- **The file answers "what does this module do?" with a list, not a sentence** — if you need a bullet list to describe it, the file has multiple responsibilities. Each bullet is a candidate file.
- **One test file per unit is impossible** — a single test file already paragraphs of describes() covering unrelated behaviour. The file is forcing coupled tests where decoupled ones belong.
- **Searching for definitions takes multiple scans** — you scroll up and down three times to find a function. The scroll distance is the friction of length.
- **Adding a feature means touching this file and 3-5 others in the same area** — the file is not an island; it is a hub. Hubs that distribute their surface area into neighbours prevent focused extraction. When you must change the same conceptual unit across 4+ files, the split was done wrong — the extracted files share a dependency or an implicit contract. The cure is to pull a **seam** from the hub, not spread pieces out.
- **merge conflicts are routine** — multiple developers touching the same file because different concerns share one home. Not just a file-length problem: it signals that different concerns are tangled in the same module.

One signal is enough to act. Two or more means the file is past due.

## Seams — where to split

A **seam** is the place you can extract code without changing what it does — SOLID's dependency on abstractions, DRY's need for a single home, KISS's appetite for simplicity, and clean-code's single responsibility, each as a seam-finding lens:

### Single Responsibility (the primary seam)
One file = one reason to change. Extract every group of functions that change for a different reason than the rest of the file.

**How to find it**: Read the file's imports and public surface. Every conceptually distinct import cluster is a responsibility. `grep` for the anchor functions that each cluster calls — they form a seam.

### Open-Closed and Dependency Inversion (the coupling seam)
If extracting a group forces import changes in callers, the group has no abstraction boundary. Introduce an interface or a parameter before extracting to keep callers stable.

**How to find it**: `rg "from '\.\."` (relative imports up the tree). Every import that reaches into a different domain is a candidate boundary. If extraction would break that import, you need an interface first.

### Interface Segregation (the fat-interface seam)
If an extracted class or module has methods that callers do not use, it is carrying responsibilities that belong elsewhere. Each unused group is a seam.

**How to find it**: `rg "class"` and check every public method. grep for callers. A method called by fewer than half the clients that import the file is a candidate.

### DRY (the duplication seam)
Identical or near-identical logic appearing 2+ times in the same file. Extract to a shared helper.

**How to find it**: `rg` for repeated blocks of 5+ lines. `diff` between the two occurrences. If the difference is only variable names, the logic is duplicated.

### KISS (the can-you-name-it seam)
If extracting a group of functions requires a name that is a compound sentence ("order-collector-formatting-and-validation"), the seam is wrong. A clean extraction has a name that is a noun or a verb phrase that fits on a business card.

**How to find it**: name the group. If the name reads like a `&&` chain, keep splitting.

## Splitting protocol

Extract one seam at a time, testing between each extraction. A file at 800 lines might yield 6 extractions; each is validated individually.

### Step 1: Map the file
Read the file from top to bottom. Annotate every function, type, and constant with its responsibility. Group responsibilities that change together.

**Completion criterion**: every top-level declaration mapped to exactly one group. No group holds more than 3 responsibilities.

### Step 2: Rank seams by isolation
Sort groups by how few dependencies they have on the rest of the file. Extract low-dependency groups first — they are low-risk "warm-up" extractions that prove the process.

**Completion criterion**: groups sorted, extraction order determined, easiest-first.

### Step 3: Extract one seam
For the selected group:
1. Create the new file in the closest directory that matches its responsibility.
2. Copy the code — do not modify behaviour.
3. Wire the imports: the new file needs everything it references; the old file keeps what the remaining code needs.
4. Verify: the project builds and tests pass.
5. Re-export through the original file's public surface if the original is a barrel or index module (preserve caller contracts).

**Completion criterion**: the original file's public API is unchanged. Tests pass. The new file builds in isolation.

### Step 4: Push shared dependencies down
After extraction, the original file may import from both itself and the new file. Move shared constants, types, or utilities to a third file if they belong to neither's responsibility. Do not leave shared cruft in either.

**Completion criterion**: every shared dependency lives in a file whose name describes it, not in "utils" or "helpers".

### Step 5: Close the loop
Compare the new file count against the **pressure** signals that triggered the split:
- Each group of functions now lives in its own test file.
- The original file can be described in one sentence.
- Scroll distance to find a definition under one screen.

**Completion criterion**: all original pressure signals are resolved. If any remain, a seam was missed — return to Step 1.

## Preservation rules

These are limits. Violating any one produces a worse outcome than living with the large file.

1. **Do not extract for extraction's sake.** Every new file must have a reason to change independently. If two groups always change together, keep them together.
2. **Do not change behaviour during extraction.** Extraction is pure rearrangement. Behaviour changes get a separate commit.
3. **Do not introduce abstractions that mirror the extracted code.** A base class or interface that exists only because you extracted code is a parasite abstraction. Introduce abstraction only when the second variant appears.
4. **Do not name files after the extraction pattern.** "ParserHelper", "UserServiceUtils", "PaymentManager" — these names tell a caller nothing. Name the file after the responsibility it holds.
5. **Do not create circular imports.** After extraction, run `tsx --check` or equivalent. If A imports B and B imports A, the seam was wrong — merge them back and find a different boundary.

## Failure modes

- **Scatter** — extracting pieces to many files without a coherent module boundary, so an engineer must open 8 files to understand one concept. The cure is to group by change-together, not by length. If files A and B always change in the same commit, merge them.
- **Leaky extraction** — the extracted file imports deeply into the original file's internals, creating a tighter coupling than the original single file had. The cure: introduce an interface boundary before extracting (see Open-Closed seam above).
- **Utility-dump** — the natural reaction to "this file is too big" is to dump shared code into a `utils.ts` or `helpers.ts` that becomes the next large file. The cure: every utility must belong to a concept. A file named `utils.ts` is a TODO list, not a design choice.
- **Premature extraction** — splitting a 200-line file because "it could grow." The cure: do not split until pressure signals appear. 300-400 lines in a single-concern file is fine.

## Pairing guide

- **Separation of Concerns** — use when the file's pressure signals indicate deeply tangled concerns. Run it first to map the concerns, then use this skill to find and cut seams.
- **Refactor-clean** — use after splitting to consolidate the module into coherent ownership. Removes sediment that extraction reveals.
- **Domain-Driven Design** — use when the file mixes multiple domain concepts. DDD identifies the bounded contexts; this skill extracts along those boundaries.
- **Legacy Rescue Protocol** — use when the file has no tests. Characterize the behaviour before extracting.
