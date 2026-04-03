import { expect, type Locator, type Page } from '@playwright/test';

type ThemeMode = 'light' | 'dark';

export class NotFoundPage {
  constructor(private readonly page: Page) {}

  private get heading404(): Locator {
    return this.page.getByRole('heading', { name: '404' });
  }

  private get message(): Locator {
    return this.page.getByText('Page not found');
  }

  private get goHomeLink(): Locator {
    return this.page.getByRole('link', { name: 'Go back to home' });
  }

  async setTheme(mode: ThemeMode) {
    await this.page.addInitScript((themeMode) => {
      if (themeMode === 'dark') {
        localStorage.setItem('app-theme-mode', 'dark');
        return;
      }

      localStorage.removeItem('app-theme-mode');
    }, mode);
  }

  async goto() {
    await this.page.goto('/non-existing-route');
  }

  async expectLoaded() {
    await expect(this.heading404).toBeVisible();
  }

  async expectMessageVisible() {
    await expect(this.message).toBeVisible();
  }

  async clickGoHome() {
    await this.goHomeLink.click();
  }
}
