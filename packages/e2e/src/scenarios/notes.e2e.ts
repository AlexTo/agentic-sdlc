import { expect, test } from '@playwright/test';
import { screenshot } from '../helpers/screenshots.js';

// A visitor writes a note and deletes it again. Titles are unique per run, as
// scenarios share one stack.

test('a visitor adds and deletes a note', async ({ page }) => {
  const title = `Shopping list ${Date.now()}`;

  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'My Notes' }),
  ).toBeVisible();

  await page.getByPlaceholder('Title').fill(title);
  await page.getByPlaceholder('Write something...').fill('Milk and eggs');
  await page.getByRole('button', { name: 'Add note' }).click();

  const note = page.getByText(title);
  await expect(note).toBeVisible();
  await screenshot(page, 'note added');

  await page
    .locator('[data-slot="card"]', { hasText: title })
    .getByRole('button', { name: 'Delete' })
    .click();
  await expect(note).toBeHidden();
});
