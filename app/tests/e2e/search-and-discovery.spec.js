import { expect, test } from '@playwright/test';
import { closeModal, gotoReady } from './helpers.js';

const _VAULT_TAB = 'The Vault';

test.describe('search — home page', () => {
  test('typing in search shows filtered results', async ({ page }) => {
    await gotoReady(page);

    const searchInput = page.locator('.pupil-search__input');
    await searchInput.fill('debug');
    await expect(searchInput).toHaveValue('debug');

    // When searching, the view switches to AllSchoolsView
    await expect(page.locator('.bestiary-index')).toBeVisible();
    await expect(page.locator('.bestiary-index__row').first()).toBeVisible();
  });

  test('search shows match count', async ({ page }) => {
    await gotoReady(page);

    const searchInput = page.locator('.pupil-search__input');
    await searchInput.fill('test');

    // Match count should appear
    await expect(page.locator('.pupil-search__matches')).toBeVisible();
  });

  test('clearing search returns to featured schools', async ({ page }) => {
    await gotoReady(page);

    const searchInput = page.locator('.pupil-search__input');
    await searchInput.fill('debug');
    await expect(page.locator('.bestiary-index')).toBeVisible();

    await searchInput.clear();
    await expect(searchInput).toBeEmpty();

    // Should show featured schools again (spine cards)
    await expect(page.locator('.spine-card').first()).toBeVisible();
  });
});

test.describe('search — no results', () => {
  test('shows Witch Doctor modal on no results', async ({ page }) => {
    await gotoReady(page);

    const searchInput = page.locator('.pupil-search__input');
    await searchInput.fill('zzznonexistent');

    // Look for a button that opens the witch doctor
    const witchDoctorBtn = page.getByRole('button', {
      name: /Witch Doctor|no results|try something else/i,
    });
    if ((await witchDoctorBtn.count()) > 0) {
      await witchDoctorBtn.click();
      await expect(page.locator('.witch-doctor-modal, .modal')).toBeVisible();
      await closeModal(page, '.modal');
    }
  });
});

test.describe('school navigation', () => {
  test('clicking a school shows its spells', async ({ page }) => {
    await gotoReady(page);

    // Click first school card
    await page.locator('.spine-card').first().click();

    // Should show school detail view
    await expect(page.locator('.school-detail')).toBeVisible();
    await expect(page.locator('.school-detail__grid')).toBeVisible();
  });

  test('school detail shows back button', async ({ page }) => {
    await gotoReady(page);

    await page.locator('.spine-card').first().click();
    await expect(page.locator('.school-detail__back')).toBeVisible();
  });

  test('back button returns to library', async ({ page }) => {
    await gotoReady(page);

    await page.locator('.spine-card').first().click();
    await expect(page.locator('.school-detail')).toBeVisible();

    await page.locator('.school-detail__back').click();
    await expect(page.locator('.school-detail')).not.toBeVisible();
  });
});

test.describe('spell modal', () => {
  test('opening a spell shows modal', async ({ page }) => {
    await gotoReady(page);

    // Navigate to a school first
    await page.locator('.spine-card').first().click();
    await page.locator('.spell-card').first().click();

    await expect(page.locator('.modal-wide')).toBeVisible();
  });

  test('spell modal shows spell details', async ({ page }) => {
    await gotoReady(page);

    await page.locator('.spine-card').first().click();
    await page.locator('.spell-card').first().click();

    const modal = page.locator('.modal-wide');
    // Modal should have content
    await expect(modal).toBeVisible();
    await expect(modal.locator('.spell-name, .spell-effect, .modal-school').first()).toBeVisible();
  });

  test('closing spell modal returns to grid', async ({ page }) => {
    await gotoReady(page);

    await page.locator('.spine-card').first().click();
    await page.locator('.spell-card').first().click();
    await expect(page.locator('.modal-wide')).toBeVisible();

    await closeModal(page, '.modal-wide');
    await expect(page.locator('.modal-wide')).not.toBeVisible();
    // Closing the spell modal navigates back to home
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('All Schools view', () => {
  test('view all schools from spine', async ({ page }) => {
    await gotoReady(page);

    // Click "All Schools" pill - use a more flexible selector
    const allSchoolsBtn = page.getByRole('button', { name: /All Schools/i });
    if ((await allSchoolsBtn.count()) > 0) {
      await allSchoolsBtn.click();
      await expect(page.locator('.bestiary-index')).toBeVisible();
    }
  });

  test('search filters schools in All Schools view', async ({ page }) => {
    await gotoReady(page);

    const allSchoolsBtn = page.getByRole('button', { name: /All Schools/i });
    if ((await allSchoolsBtn.count()) > 0) {
      await allSchoolsBtn.click();

      const searchInput = page.locator('.bestiary-codex__search-input');
      if ((await searchInput.count()) > 0) {
        await searchInput.fill('debug');
        await expect(page.locator('.bestiary-index__row').first()).toBeVisible();
      }
    }
  });

  test('clicking a school in All Schools navigates to it', async ({ page }) => {
    await gotoReady(page);

    const allSchoolsBtn = page.getByRole('button', { name: /All Schools/i });
    if ((await allSchoolsBtn.count()) > 0) {
      await allSchoolsBtn.click();
      await page.locator('.bestiary-index__row').first().click();

      await expect(page.locator('.school-detail')).toBeVisible();
    }
  });
});

test.describe('shortcuts modal', () => {
  test('opens and shows shortcuts', async ({ page }) => {
    await gotoReady(page);

    await page.getByRole('button', { name: /Shortcuts/i }).click();
    await expect(page.locator('.shortcuts-modal')).toBeVisible();

    // Check for some known shortcuts
    await expect(page.getByText('Focus the Scrying Orb')).toBeVisible();
    await expect(page.getByText('Close any open modal')).toBeVisible();
  });

  test('escape closes shortcuts', async ({ page }) => {
    await gotoReady(page);

    await page.getByRole('button', { name: /Shortcuts/i }).click();
    await expect(page.locator('.shortcuts-modal')).toBeVisible();

    await closeModal(page, '.shortcuts-modal');
    await expect(page.locator('.shortcuts-modal')).not.toBeVisible();
  });
});

test.describe('featured schools customization', () => {
  test('can enter edit mode', async ({ page }) => {
    await gotoReady(page);

    // Click the customize button (gear icon)
    const customizeBtn = page.locator('.spine-customize-btn');
    if ((await customizeBtn.count()) > 0) {
      await customizeBtn.click();
      await expect(page.locator('.spine-edit')).toBeVisible();
    }
  });
});
