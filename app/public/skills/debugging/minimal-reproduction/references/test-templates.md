# Reproduction Test Templates by Framework

## Jest (React / React Native / Expo)

```typescript
import { describe, it, expect } from "@jest/globals";

describe("Bug: [description]", () => {
  it("demonstrates [exact behavior]", async () => {
    // ARRANGE
    const input = minimalInput;

    // ACT
    const result = await functionUnderTest(input);

    // ASSERT - what SHOULD happen (not what currently happens)
    expect(result).toBe(expectedValue);
  });
});
```

## Convex (Server Functions)

```typescript
// convex/__tests__/minimalReproduction.test.ts
import { test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { api } from "../_generated/api";

const t = convexTest(schema);

test("demonstrates [exact behavior]", async () => {
  // ARRANGE
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", { name: "Test", email: "test@test.com" });
  });

  // ACT
  const result = await t.run(async (ctx) => {
    return await ctx.db.query("messages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  });

  // ASSERT
  expect(result).not.toBeNull();
});
```

## Playwright (E2E)

```typescript
import { test, expect } from "@playwright/test";

test("demonstrates [exact behavior]", async ({ page }) => {
  // ARRANGE - navigate to minimal page state
  await page.goto("/minimal-test-route");

  // ACT - the smallest action that triggers the bug
  await page.getByTestId("submit-button").click();

  // ASSERT - what should happen
  await expect(page.getByTestId("success-message")).toBeVisible();
});
```

## What Makes a Reproduction Test MINIMAL

| Characteristic | Minimal | Not Minimal |
|---------------|---------|-------------|
| Setup lines | 1-5 | 10+ |
| Mocks | 0-1 | 3+ |
| Assertions | 1 | Multiple |
| Test runtime | < 1 second | > 5 seconds |
| Dependencies on other features | None | Multiple |

If your minimal reproduction test needs more than 5 lines of setup, you haven't found the minimal trigger yet. Go back to Step 2.