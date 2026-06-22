import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/register.page.js';

function uniqueEmail() {
  const stamp = Date.now();
  return `e2e_user_${stamp}@example.com`;
}

test.describe('Registration', () => {
  test('create new user and verify success', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();

    const data = {
      name: 'E2E User',
      email: uniqueEmail(),
      password: 'Password123!'
    };

    await register.register(data);

    // The app may redirect after success or show a success message.
    // We check for either a visible success message or a redirect to dashboard/login.
    await expect(page).toHaveURL(/login|dashboard|\/$/);
    if (await register.success.count()) {
      await expect(register.success).toBeVisible();
    }
  });
});
