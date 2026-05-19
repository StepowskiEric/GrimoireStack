---
name: occam-minimal-repro
description: "Combo — When isolating a bug, systematically rank possible reproduction triggers by complexity and test the simplest trigger first. Only escalate to more complex triggers when simpler ones are falsified. Prevents wasted effort building elaborate reproduction setups when a one-liner would suffice."
---

# Skill: Occam's Razor + Minimal Reproduction

## Purpose

`minimal-reproduction` already has a "find the minimal trigger" step, but it does not explicitly rank multiple possible triggers by complexity or require falsification before escalating. An agent can still jump to a complex reproduction setup (full app, specific environment, multi-step flow) before checking whether a simpler trigger works.

This combo adds **explicit trigger ranking and falsification** to the minimal reproduction protocol:

1. Brainstorm all possible triggers for the bug
2. **Rank by complexity** (Occam's Razor) — simplest trigger first
3. Test the simplest trigger
4. **Only escalate** to a more complex trigger if the simpler one is falsified

---

## When to Use

Use this combo when:
- you are writing a minimal reproduction test for a bug
- there are several plausible ways to trigger the bug with different complexity levels
- you catch yourself setting up a complex test environment before trying a simple one

Do not use when:
- there is only one known trigger (no ranking needed)
- the simplest trigger has already been tested and failed to reproduce

---

## How It Works

```
Step 1: Brainstorm possible triggers
        → List every way you can imagine triggering the bug

Step 2: Rank by complexity (Occam's Razor)
        → Simplest trigger (fewest steps, least setup, least state) → most complex

Step 3: Test the simplest trigger
        → Write the minimal repro test for trigger #1
        → If it reproduces the bug → DONE. This is the minimal repro.
        → If it does NOT reproduce the bug → falsified. Move to #2.

Step 4: Repeat until bug is reproduced or triggers are exhausted
```

---

## Step-by-Step Protocol

### Step 1: Brainstorm Possible Triggers

Before writing any test, list every trigger you can imagine:

```md
## Possible Triggers
| # | Trigger | Complexity |
|---|---------|------------|
| 1 | Call function directly with valid input | Low — one line, no setup |
| 2 | Submit the form from the UI | Medium — requires component render |
| 3 | Login first, then navigate, then submit | Higher — multi-step, auth state |
| 4 | Run on physical device with slow network | High — specific environment |
```

Do not skip this step. If you jump to trigger #4 before testing #1, you may have wasted 30 minutes setting up a device lab when a one-liner would have reproduced the bug in 10 seconds.

---

### Step 2: Rank by Complexity

Use this ranking:

| Tier | Trigger Type | Example |
|------|-------------|---------|
| **0** | Direct function call | `fn(input)` in a test file |
| **1** | Unit call with mock setup | `fn(input)` with a mocked dependency |
| **2** | Component render + interaction | `<Component />` then `userEvent.press(button)` |
| **3** | Multi-step user flow | Login → navigate → interact → submit |
| **4** | Specific environment required | Physical device, slow network, specific OS version |

Sort all brainstormed triggers from Tier 0 → Tier 4. Tier 0 is always tried first.

---

### Step 3: Test from Simplest Upward

For each trigger in order, attempt to reproduce the bug:

```md
### Trigger 1 (Tier 0): Direct function call
Test: call `submitForm({ name: "test" })` directly
Result: BUG REPRODUCED — returns undefined instead of the submitted object
→ DONE. Minimal repro is a one-liner. No need to test triggers 2–4.
```

```md
### Trigger 1 (Tier 0): Direct function call
Test: call `fetchProfile(userId)` directly
Result: NO BUG — returns expected profile object
→ FALSIFIED. Trigger 1 does not reproduce the bug. Moving to Trigger 2.

### Trigger 2 (Tier 2): Component render
Test: render <ProfileScreen />, simulate tap on profile button
Result: BUG REPRODUCED — crash with null pointer
→ DONE. Minimal repro requires component render but not multi-step flow.
```

**Rule:** If Trigger N reproduces the bug, STOP. Triggers N+1 through the end are unnecessary. The minimal repro is at tier N.

---

### Step 4: Write the Reproduction Test at the Proven Tier

Write the test at the tier where the bug was reproduced — not at a higher tier.

```md
Wrong: Write the test at Trigger 4 (physical device) when Trigger 2 (component render) worked.
Right: Write the test at Trigger 2. Device testing can come later if needed for verification.
```

The reproduction test should be at the **simplest tier that reproduces the bug**, not the most thorough tier.

---

## Examples

### Example 1: Form submission bug

```
Brainstormed triggers:
1. [Tier 0] Call submitForm() directly with valid input
2. [Tier 2] Render form, fill fields, tap submit
3. [Tier 3] Login → navigate to form → fill → submit
4. [Tier 4] Physical device, slow 3G network

Step 3:
- Trigger 1: submitForm({ email: "a@b.com", password: "1234" }) → BUG. Returns "Network error" immediately.
- DONE at Tier 0. Minimal repro is 3 lines.
```

### Example 2: Rendering crash

```
Brainstormed triggers:
1. [Tier 0] Call UserProfile component render function directly
2. [Tier 2] Render <UserProfile> with props
3. [Tier 3] Navigate to profile screen from login flow
4. [Tier 4] iOS 16 only, dark mode, after app cold start

Step 3:
- Trigger 1: render() → crash only happens inside React reconciliation, not in pure function
- Trigger 2: render(<UserProfile user={user} />) → BUG. "Cannot read property 'name' of undefined"
- DONE at Tier 2. Minimal repro is a component render test.
```

---

## What This Combo Prevents

| Failure Mode | Minimal Reproduction alone | Occam-Minimal-Repro |
|---|---|---|
| Jumping to complex trigger before trying simple ones | Possible | Prevented — ranking is explicit |
| Writing the repro at the wrong tier | Possible | Rule: write at simplest tier that reproduces |
| Exhausting all triggers equally | Possible | Stop at first tier that reproduces |
| Environment-hunting before code-hunting | Possible | Tier 0–2 always probed before Tier 4 |
| Over-reproduction (test is more complex than needed) | Possible | Simplicity ranking caps the test tier |

---

## Pairing Guide

- **minimal-reproduction** — the base skill; this combo adds explicit trigger ranking and falsification before escalation
- **occam-abduction** — use occam-abduction to generate hypotheses about *what causes* the bug, then use this combo to generate the simplest trigger that *reproduces* it
- **specter** — specter generates structural hypotheses; this combo produces the test that lets specter's hypotheses be falsified
- **iterative-patch-repair** — hands off a failing test at the correct tier for patch-repair to iterate on

---

## Definition of Done

This combo was applied correctly when:
- All plausible triggers were brainstormed before any test was written
- Triggers were explicitly ranked by complexity tier
- Triggers were tested in ascending tier order
- Testing stopped at the first tier that reproduced the bug
- The reproduction test was written at that tier, not at a higher tier
- If simpler triggers were falsified, falsification was explicit (not just "it didn't work")

---

## Final Instruction

List every way to trigger the bug. Try them from simplest to most complex. The first one that reproduces it is your minimal repro — not the fanciest one.
