export class DashboardPage {
  constructor(page) {
    this.page = page;
    // Primary selector for an element that indicates the dashboard is visible.
    // The app shows "Your Shifts" as the main heading on the home/dashboard page.
    this.header = page.locator('text=Your Shifts').first();
    this.userMenu = page.locator('text=Logout').first();
  }

  async goto() {
    await this.page.goto('/');
  }
}
