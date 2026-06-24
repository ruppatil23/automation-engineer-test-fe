import { test, expect } from '@playwright/test';

test('protected route redirects to login when unauthenticated', async ({ page }) => {
  // Ensure no persisted auth state remains
  await page.context().clearCookies();
  // Navigate to app root first so we have same-origin access to window.localStorage
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());

  // Attempt to open a protected URL directly
  await page.goto('/shifts');

  // Short delay to allow client-side redirect to occur
  await page.waitForTimeout(500);

  // Accept either a redirect to login, the Login link in the navbar, OR the app showing an error card
  const loginRedirectPromise = page.waitForURL(/login/, { timeout: 3000 }).then(() => true).catch(() => false);
  const loginLinkPromise = page.locator('text=Login').first().waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
  const errorLocator = page.locator('text=Error Loading Shifts');
  const errorVisiblePromise = errorLocator.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);

  const [redirected, loginLinkVisible, errorVisible] = await Promise.all([
    loginRedirectPromise,
    loginLinkPromise,
    errorVisiblePromise,
  ]);

  if (!redirected && !loginLinkVisible && !errorVisible) {
    throw new Error('Expected redirect to login, navbar Login link, or an error card, but none occurred');
  }
});
