---
name: split-large-files
category: execution
description: "Split large files along change boundaries, not line counts. Investigate before extracting, require strong architectural signals, and reject splits that increase coupling."
version: 1.0
---

# Split Large Files — Boundary-Driven Extraction Protocol

## Purpose

Split large files when a coherent boundary exists with lower coupling after extraction. The goal is to minimize the number of files required to understand and modify one behavior, not to minimize lines per file.

This protocol adds:
- investigation before extraction
- strong vs. weak signal discrimination
- explicit "do not split" decision gate
- rejection criteria for premature abstraction
- recognition of naturally broad but cohesive modules

---

## When to Use

- A file exceeds approximately 500 lines and you suspect it mixes independently changeable responsibilities
- Different callers consume disjoint parts of the same module
- A section changes for different business reasons than the rest of the file
- Merge conflicts frequently cluster around one area of a file
- A section can be tested through a stable contract without unrelated setup

---

## Decision Model

### Strong Extraction Signals

Split when one or more are true **and** a coherent boundary exists:

- **Separate sections change for different business reasons.** The file contains responsibilities that evolve on independent cadences.
- **A section can be tested through a stable contract without unrelated setup.** Extracting it would simplify test setup and clarify the contract.
- **A dependency points in a different architectural direction.** Part of the file depends on infrastructure, another on domain logic, and they do not need to be coupled.
- **Different callers consume disjoint parts of the module.** No single caller uses everything in the file.
- **A concept has its own lifecycle, state, or invariants.** It manages its own data and transitions independently.
- **Extraction reduces dependency count or clarifies ownership.** The new module has fewer imports or a clearer reason to change.

### Supporting Signals (Investigate, Do Not Extract By Themselves)

These justify investigation but not extraction by themselves:

- More than approximately 500 lines
- Frequent merge conflicts
- Long test files
- Navigation friction (hard to scroll, multiple scans to find a definition)
- Many top-level declarations
- High churn
- Deep nesting

A supporting signal means **investigate**, not necessarily split. Proceed to the mapping phase only when at least one strong signal is also present.

---

## Protocol

### Phase 1 — Investigate

Before any extraction, answer:

1. What is the file's primary responsibility? Can you name it in one sentence?
2. Which declarations change together? Look at git history for co-change patterns.
3. Who are the callers? Do different callers use different parts?
4. What would the new names be? If the extracted module would have a generic name, that is a warning sign.
5. Would understanding one behavior require opening several extracted files? If yes, do not split.

Create a brief investigation record:

```
## Investigation: <filename>

Primary responsibility: <one sentence>

Co-change clusters:
- <cluster A>: <declarations that change together>
- <cluster B>: <declarations that change together>

Caller analysis:
- <caller 1> uses: <parts>
- <caller 2> uses: <parts>

Candidate boundary: <proposed split point>
Extraction name: <name>
Would this name be generic? <yes/no>
Would understanding one behavior require opening multiple files? <yes/no>
```

### Phase 2 — Decision Gate

After investigation, choose one:

1. **Keep intact** — The file is cohesive and has low coupling. No extraction recommended.
2. **Reorganize internally** — Improve ordering, grouping, and naming within the existing file. No new files.
3. **Extract one or more seams** — A coherent boundary exists. Proceed to Phase 3.
4. **Redesign boundary first** — Extraction would increase coupling. Fix the architecture before splitting.

### Phase 3 — Map Declarations to Responsibilities

Map each top-level declaration to its primary responsibility. Note shared dependencies.

Rules:
- Map each declaration to its primary responsibility. Shared declarations (types, constants, helpers used across groups) do not automatically require extraction.
- A group's responsibilities should change together. The question is not "how many responsibilities?" but "do they change for the same reasons?"
- Import clusters are evidence of possible responsibilities, not proof. Confirm the boundary by examining which declarations change together and which callers use them.

### Phase 4 — Extract

When extracting:

- **Preserve caller contracts when valuable.** Do not introduce an interface solely to enable extraction. Prefer a direct module boundary unless polymorphism or dependency inversion is already required.
- **Move shared declarations only when they represent an independently meaningful concept.** Otherwise keep them with the module that owns the invariant or lifecycle. Shared code does not automatically become a third file.
- **Each extracted unit can be tested without importing unrelated implementation concerns.** Test-file structure does not need to mirror source-file structure.

### Phase 5 — Verify

After extraction, verify:

- Did the number of files required to understand one behavior decrease or stay the same?
- Can a reader locate the relevant behavior quickly using names, structure, and editor navigation without traversing unrelated concepts?
- Did dependency count or coupling decrease?
- Do the new files change together? If they always change together, the split was premature.

---

## Naturally Broad Files (Do Not Split By Default)

Some files are naturally broad but cohesive. These should generally not be split:

- **State machines** — All transitions belong together even if the file is long.
- **Declarative schemas** — Schema definitions are cohesive by nature.
- **Registries** — Registry-style modules map names to implementations.
- **Reducers** — Reducers handle related state transitions.
- **Protocol definitions** — Message types and handlers form one contract.
- **Orchestration modules** — Coordinator files that delegate to extracted modules can remain moderately large.
- **Generated files** — Do not split generated code.

Evaluate cohesion and dependency direction before splitting these.

---

## Reject an Extraction When

Do not split when any of these are true:

- The new files would always change together.
- Understanding one behavior requires opening several extracted files.
- The extraction requires pass-through wrappers or re-exports.
- The extracted module depends heavily on the original file's internals.
- The new name is generic (e.g., `utils`, `helpers`, `shared`).
- The only benefit is reducing line count.
- The extraction introduces an interface with one implementation and no architectural need.

---

## Circuit Breakers

Stop immediately if:

- You find yourself inventing categories to justify a split.
- The extraction would create more files than the original had meaningful concepts.
- You are about to introduce an interface with one implementation solely to enable extraction.
- The extracted module's name feels forced or generic.

---

## Definition of Done

This skill is correctly applied when:

- Investigation was performed before extraction.
- At least one strong architectural signal justified the split.
- The decision gate was explicitly evaluated (keep, reorganize, extract, redesign).
- Shared declarations were not automatically extracted.
- No interface was introduced solely to enable extraction.
- The new module has a specific, meaningful name.
- Understanding one behavior does not require opening multiple files.
- Tests pass without restructuring to mirror file layout.
