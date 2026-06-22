export class RegisterPage {
  constructor(page) {
    this.page = page;
    this.name = page.locator('input[name="name"]');
    this.email = page.locator('input[name="email"]');
    this.password = page.locator('input[name="password"]');
    this.submit = page.locator('button[type="submit"]');
    this.success = page.locator('text=Registration successful');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register({ name, email, password }) {
    await this.name.fill(name);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
