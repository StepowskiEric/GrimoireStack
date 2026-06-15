import { test, expect } from '@playwright/test';
import { gotoReady, closeModal } from './helpers.js';

test.describe('Problem Intake modal — dual-mode discovery', () => {
  test('opens intake modal from the orb consult link', async ({ page }) => {
    await gotoReady(page);

    // The "Consult the Witch Doctor / Skill Recommender" link opens the intake modal
    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() > 0) {
      await consultLink.click();
      await expect(page.locator('.intake-modal')).toBeVisible();
      await closeModal(page, '.intake-modal');
    }
  });

  test('shows category chips when modal opens', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    // Category chips should be present
    await expect(page.locator('.intake-chip')).toHaveCount(11); // 11 wizard categories
  });

  test('clicking a category chip auto-surfaces results', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    // Click the Bug / Failure chip
    await page.getByRole('button', { name: /Bug \/ Failure/i }).click();

    // Results should appear without typing
    await expect(page.locator('.intake-results')).toBeVisible();
    await expect(page.locator('.intake-results-title')).toContainText('suggested incantation');
  });

  test('chip is active after click and shows Clear filter', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    const bugChip = page.getByRole('button', { name: /Bug \/ Failure/i });
    await bugChip.click();

    // Chip should have active class
    await expect(bugChip).toHaveClass(/active/);

    // Clear filter button should appear
    await expect(page.getByRole('button', { name: /Clear filter/i })).toBeVisible();
  });

  test('clicking active chip deactivates it', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    const bugChip = page.getByRole('button', { name: /Bug \/ Failure/i });
    await bugChip.click();
    await expect(bugChip).toHaveClass(/active/);

    // Click again to deactivate
    await bugChip.click();
    await expect(bugChip).not.toHaveClass(/active/);
  });

  test('Clear filter resets the modal', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    const bugChip = page.getByRole('button', { name: /Bug \/ Failure/i });
    await bugChip.click();
    await expect(bugChip).toHaveClass(/active/);

    await page.getByRole('button', { name: /Clear filter/i }).click();
    await expect(bugChip).not.toHaveClass(/active/);
  });

  test('typing in textarea filters results when no chip is active', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    const textarea = page.locator('.intake-textarea');
    await textarea.fill('debug');

    // Results should appear after typing
    await expect(page.locator('.intake-results')).toBeVisible();
  });

  test('chip selection plus text merges into one ranked list', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    // Select a category
    await page.getByRole('button', { name: /Bug \/ Failure/i }).click();

    // Type something
    const textarea = page.locator('.intake-textarea');
    await textarea.fill('test');

    // Should show merged results with the category label
    await expect(page.locator('.intake-results')).toBeVisible();
    const resultButtons = page.locator('.intake-result');
    await expect(resultButtons.first()).toBeVisible();
  });

  test('submit button text changes with category', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    // Default submit text
    await expect(page.getByRole('button', { name: /Reveal Suggestions/i })).toBeVisible();

    // After chip selection
    await page.getByRole('button', { name: /Bug \/ Failure/i }).click();
    await expect(page.getByRole('button', { name: /Find Spell/i })).toBeVisible();
  });

  test('clicking a result opens the spell modal', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    // Select a category to get results
    await page.getByRole('button', { name: /Bug \/ Failure/i }).click();

    // Wait for results and click the first one
    await expect(page.locator('.intake-result').first()).toBeVisible();
    await page.locator('.intake-result').first().click();

    // Should open the spell detail modal (modal-wide)
    await expect(page.locator('.modal-wide')).toBeVisible();
    await closeModal(page, '.modal-wide');
  });

  test('Escape closes the intake modal', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    await closeModal(page, '.intake-modal');
    await expect(page.locator('.intake-modal')).not.toBeVisible();
  });

  test('example problems populate the textarea', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    // Click the first example
    const firstExample = page.locator('.intake-example').first();
    const exampleText = await firstExample.textContent();
    await firstExample.click();

    // Textarea should contain the example text
    const textarea = page.locator('.intake-textarea');
    await expect(textarea).toHaveValue(exampleText);
  });

  test('modal shows sample problems when empty (no chip, no text)', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    // Should show example problems section
    await expect(page.getByText('Or try a sample problem:')).toBeVisible();
    await expect(page.locator('.intake-example')).toHaveCount(8);
  });

  test('results disappear when chip is deselected and text cleared', async ({ page }) => {
    await gotoReady(page);

    const consultLink = page.getByRole('link', { name: /Consult the/i });
    if (await consultLink.count() === 0) return;

    await consultLink.click();
    await expect(page.locator('.intake-modal')).toBeVisible();

    // Select chip → results appear
    await page.getByRole('button', { name: /Bug \/ Failure/i }).click();
    await expect(page.locator('.intake-results')).toBeVisible();

    // Deselect chip → results disappear, examples return
    await page.getByRole('button', { name: /Bug \/ Failure/i }).click();
    await expect(page.locator('.intake-examples')).toBeVisible();
  });
});
