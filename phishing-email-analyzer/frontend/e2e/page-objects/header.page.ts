import { expect, type Locator, type Page } from '@playwright/test';

type ThemeMode = 'light' | 'dark';

export class HeaderPage {
  constructor(private readonly page: Page) {}

  private get languageToggle(): Locator {
    return this.page.locator('[data-testid="language-toggle"]');
  }

  private get themeToggle(): Locator {
    return this.page.locator('[data-testid="theme-toggle"]');
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

  async goto(path: string) {
    await this.page.goto(path);
  }

  async expectLanguageToggleText(text: string) {
    await expect(this.languageToggle).toHaveText(text);
  }

  async clickLanguageToggle() {
    await this.languageToggle.click();
  }

  async clickThemeToggle() {
    await expect(this.themeToggle).toBeVisible();
    await expect(this.themeToggle).toBeEnabled();
    await this.themeToggle.click();
    // Wait a brief moment for Angular change detection and DOM updates
    await this.page.waitForTimeout(100);
  }

  async getThemeState() {
    return this.page.evaluate(() => ({
      isDark: document.documentElement.classList.contains('app-dark'),
      stored: localStorage.getItem('app-theme-mode'),
    }));
  }
}
