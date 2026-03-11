import { expect, test } from '@playwright/test';

test('homepage shows project title', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Collector.shop' })).toBeVisible();
});
