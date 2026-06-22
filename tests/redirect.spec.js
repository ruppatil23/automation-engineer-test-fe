import { test, expect } from '@playwright/test';

test('protected route redirects to login when unauthenticated', async ({ page }) => {
  // Attempt to open a protected URL directly
  await page.goto('/shifts');

  // Expect redirect to login page
  await expect(page).toHaveURL(/login/);
  await expect(page.locator('text=Login').first()).toBeVisible();
});
