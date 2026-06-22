export class LoginPage {
  constructor(page) {
    this.page = page;
    this.email = page.locator('input[name="email"]');
    this.password = page.locator('input[name="password"]');
    this.submit = page.locator('button[type="submit"]');
    this.error = page.locator('text=Invalid credentials');
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
