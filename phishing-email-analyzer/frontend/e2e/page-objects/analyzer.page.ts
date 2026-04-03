import { expect, type Locator, type Page, type Route } from '@playwright/test';
import { setEmailText } from '../helpers/analyzer-form.helper';

type ThemeMode = 'light' | 'dark';

export class AnalyzerPage {
  constructor(private readonly page: Page) {}

  private get senderInput(): Locator {
    return this.page.locator('[data-testid="sender-input"]');
  }

  private get titleInput(): Locator {
    return this.page.locator('[data-testid="title-input"]');
  }

  private get analyzeButton(): Locator {
    return this.page.locator('[data-testid="analyze-button"]');
  }

  private get analyzeButtonByRole(): Locator {
    return this.page.getByRole('button', { name: /Analyze/i });
  }

  private get clearButtonByRole(): Locator {
    return this.page.getByRole('button', { name: /Clear/i });
  }

  private get emailInput(): Locator {
    return this.page.locator('[data-testid="email-input"]');
  }

  private get modelSelect(): Locator {
    return this.page.getByRole('combobox', { name: /GPT-4.1/i });
  }

  private get resultsCard(): Locator {
    return this.page.locator('[data-testid="results-card"]');
  }

  private get resultsWrapper(): Locator {
    return this.page.locator('.results-wrapper');
  }

  private get analysisResultHeading(): Locator {
    return this.page.getByText('Analysis Result');
  }

  private resultRowValue(rowLabel: RegExp): Locator {
    return this.page.locator('.result-row').filter({ hasText: rowLabel }).locator('strong');
  }

  private get homeHeading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: /Phishing Email/i });
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

  async gotoHome() {
    await this.page.goto('/');
  }

  async expectAnalyzeVisible() {
    await expect(this.analyzeButtonByRole).toBeVisible();
  }

  async fillForm(sender: string, title: string, emailText: string) {
    await this.senderInput.fill(sender);
    await this.titleInput.fill(title);
    await setEmailText(this.page, emailText);
  }

  async fillEmailOnly(emailText: string) {
    await setEmailText(this.page, emailText);
  }

  async clickAnalyze() {
    await this.analyzeButtonByRole.click();
  }

  async clickClear() {
    await this.clearButtonByRole.click();
  }

  async expectAnalyzeEnabled() {
    await expect(this.analyzeButtonByRole).toBeEnabled();
  }

  async expectAnalyzeDisabled() {
    await expect(this.analyzeButton).toBeDisabled();
  }

  async expectClearEnabled() {
    await expect(this.clearButtonByRole).toBeEnabled();
  }

  async expectClearDisabled() {
    await expect(this.clearButtonByRole).toBeDisabled();
  }

  async expectSenderValue(value: string) {
    await expect(this.senderInput).toHaveValue(value);
  }

  async expectEmailValue(value: string) {
    await expect(this.emailInput).toHaveValue(value);
  }

  async expectAllFormControlsDisabled() {
    await expect(this.modelSelect).toBeDisabled();
    await expect(this.senderInput).toBeDisabled();
    await expect(this.titleInput).toBeDisabled();
    await expect(this.emailInput).toBeDisabled();
    await expect(this.analyzeButton).toBeDisabled();
    await expect(this.clearButtonByRole).toBeDisabled();
  }

  async expectResultsVisible() {
    await expect(this.resultsCard).toBeVisible();
  }

  async expectResultsHidden() {
    await expect(this.resultsWrapper).toHaveCount(0);
  }

  async expectAnalysisResultVisible() {
    await expect(this.analysisResultHeading).toBeVisible();
  }

  async expectResultRowValue(rowLabel: RegExp, expectedValue: string) {
    await expect(this.resultRowValue(rowLabel)).toHaveText(expectedValue);
  }

  async expectTextVisible(text: string) {
    await expect(this.page.getByText(text, { exact: true })).toBeVisible();
  }

  async expectHomeHeadingVisible() {
    await expect(this.homeHeading).toBeVisible();
  }

  async expectBackendErrorVisible(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  get resultDynamicRowsMask(): Locator[] {
    return [
      this.page.locator('.result-row').filter({ hasText: /Timestamp/ }),
      this.page.locator('.result-row').filter({ hasText: /Response Time/ }),
    ];
  }

  async stubAnalyzeRequest(handler: (route: Route) => Promise<void>) {
    await this.page.route('http://localhost:8000/analyze', handler);
  }
}
