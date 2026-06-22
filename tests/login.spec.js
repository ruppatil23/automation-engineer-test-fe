import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page.js';
import { DashboardPage } from './pages/dashboard.page.js';

test.describe('Login Tests', () => {
  test('valid login shows dashboard', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    const email = process.env.TEST_USER_EMAIL || 'test@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'Password123!';

    await login.login(email, password);

    const dashboard = new DashboardPage(page);
    await expect(page).toHaveURL(/dashboard|\/$/);
    await expect(dashboard.header).toBeVisible();
  });

  test('invalid login shows error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('bad@example.com', 'wrongpassword');
    await expect(login.error).toBeVisible();
  });
});
