export class DashboardPage {
  constructor(page) {
    this.page = page;
    // Primary selector for an element that indicates the dashboard is visible.
    // Adjust if your app uses a different selector or text.
    this.header = page.locator('text=Dashboard').first();
    this.userMenu = page.locator('text=Logout').first();
  }

  async goto() {
    await this.page.goto('/');
  }
}
