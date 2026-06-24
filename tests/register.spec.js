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

    // Wait for the registration API response and the UI result (redirect or success message).
    // Wait for the outgoing request (more reliable) and then for its response.
    const registrationRequestPromise = page.waitForRequest(
      (req) => req.url().includes('/user/register'),
      { timeout: 15000 },
    );

    await register.register(data);

    // (kept) Wait for outgoing request and its response to confirm registration

    const registrationRequest = await registrationRequestPromise;
    const resp = await registrationRequest.response({ timeout: 15000 });
    if (!resp) {
      throw new Error('No response received for registration request');
    }
    if (resp.status() !== 200) {
      throw new Error(`Registration API responded with status ${resp.status()}`);
    }

    // Wait for either a redirect to login/dashboard/home or a visible success message.
    await Promise.race([
      page.waitForURL(/login|dashboard|\/$/, { timeout: 5000 }),
      register.success.waitFor({ state: 'visible', timeout: 5000 }),
    ]);
  });
});
