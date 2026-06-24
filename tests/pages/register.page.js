export class RegisterPage {
  constructor(page) {
    this.page = page;
    // Use label-based and role locators which are more resilient to component wrappers
    this.name = page.getByLabel('Name');
    this.email = page.getByLabel('Email');
    this.password = page.getByLabel('Password').first();
    this.confirmPassword = page.getByLabel('Confirm Password').first();
    this.submit = page.getByRole('button', { name: /register/i }).first();
    this.success = page.locator('text=Registration successful');
  }

  async goto() {
    await this.page.goto('/register');
    await this.page.waitForSelector('text=Register for Shift Manager', { timeout: 5000 });
  }

  async register({ name, email, password }) {
    // Sanity checks and robust interactions to avoid flakiness in CI/headed runs
    const nameCount = await this.name.count();
    const emailCount = await this.email.count();
    const passwordCount = await this.password.count();
    const confirmCount = await this.confirmPassword.count();
    const submitCount = await this.submit.count();

    // Log counts so test output shows whether locators matched

    // Some component wrappers don't respond to .fill reliably; set value + dispatch input event.
    const setValue = async (locator, value) => {
      // Prefer Playwright's fill which works with inputs inside custom components
      try {
        await locator.fill(value);
        return;
      } catch (e) {
        // continue to fallback
      }

      const handle = await locator.elementHandle();
      if (handle) {
        // (no-op) proceed to set value on nested input if present

        // If the handle is not a native input, try to find a nested input/textarea and set its value
        const succeeded = await handle.evaluate((el, val) => {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
          }
          const nested = el.querySelector('input, textarea');
          if (nested) {
            nested.value = val;
            nested.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
          }
          return false;
        }, value);

        if (!succeeded) {
          // final fallback: try Playwright fill on a child input selector
          try {
            await locator.locator('input, textarea').fill(value);
          } catch (err) {
            // ignore
          }
        }
      } else {
        try {
          await locator.fill(value);
        } catch (err) {
          // ignore
        }
      }
    };

    if (nameCount) await setValue(this.name, name);
    if (emailCount) await setValue(this.email, email);
    if (passwordCount) await setValue(this.password, password);
    if (confirmCount) await setValue(this.confirmPassword, password);

    if (submitCount) {
      await this.submit.scrollIntoViewIfNeeded();
      // Keep robust click fallback logic without debug instrumentation
      // Some component libraries attach handlers differently; use a direct DOM click as a fallback.
      try {
        await this.submit.click({ force: true });
      } catch (e) {
        const handle = await this.submit.elementHandle();
        if (handle) {
          await handle.evaluate((el) => {
            el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
            el.click();
          });
        } else {
          throw e;
        }
      }
      // Extra fallbacks: click any visible text-based Register button and try pressing Enter
      try {
        const textRegister = this.page.locator('text=Register').first();
        if ((await textRegister.count()) > 0) {
          await textRegister.click({ force: true }).catch(() => {});
        }
      } catch (e) {
        // ignore
      }

      try {
        await this.confirmPassword.focus();
        await this.page.keyboard.press('Enter');
      } catch (e) {
        // ignore
      }
    } else {
      throw new Error('Submit button not found');
    }
  }
}
