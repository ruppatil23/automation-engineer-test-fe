export class LoginPage {
  constructor(page) {
    this.page = page;
    this.email = page.locator('input[name="email"]');
    this.password = page.locator('input[name="password"]');
    this.submit = page.locator('button[type="submit"]');
    // Match common error messages shown in the login UI (fallbacks for different server messages)
    this.error = page.locator('text=/User does not exist|Invalid|All fields are required|invalid/i');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
