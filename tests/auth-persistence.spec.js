import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page.js';
import { DashboardPage } from './pages/dashboard.page.js';
import { registerFreshUser } from './test-user.utils.js';

test('auth persistence after page refresh', async ({ page }) => {
  const { email, password } = await registerFreshUser(page);

  const login = new LoginPage(page);
  await login.goto();
  await login.login(email, password);

  const dashboard = new DashboardPage(page);
  await expect(dashboard.header).toBeVisible();

  // Refresh and ensure still logged in
  await page.reload();
  await expect(dashboard.header).toBeVisible();
});
