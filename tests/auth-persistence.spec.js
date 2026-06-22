import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page.js';
import { DashboardPage } from './pages/dashboard.page.js';

test('auth persistence after page refresh', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();

  const email = process.env.TEST_USER_EMAIL || 'test@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'Password123!';

  await login.login(email, password);

  const dashboard = new DashboardPage(page);
  await expect(dashboard.header).toBeVisible();

  // Refresh and ensure still logged in
  await page.reload();
  await expect(dashboard.header).toBeVisible();
});
