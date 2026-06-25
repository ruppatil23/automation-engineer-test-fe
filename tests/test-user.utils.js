import { expect } from '@playwright/test';
import { RegisterPage } from './pages/register.page.js';

export const defaultTestPassword = process.env.TEST_USER_PASSWORD || 'Password123!';
export const defaultTestName = 'E2E User';

export const uniqueTestEmail = () =>
  `e2e_user_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;

export async function registerFreshUser(page, options = {}) {
  const { name = defaultTestName, email = uniqueTestEmail(), password = defaultTestPassword } = options;

  const register = new RegisterPage(page);
  await register.goto();
  await register.register({ name, email, password });

  await expect(register.success).toBeVisible({ timeout: 10000 });
  await expect(page).toHaveURL(/login/, { timeout: 10000 });

  return { name, email, password };
}
