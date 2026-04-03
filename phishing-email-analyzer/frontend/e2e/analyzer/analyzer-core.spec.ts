import { test } from '@playwright/test';
import { AnalyzerPage } from '../page-objects/analyzer.page';

test.describe('Analyzer core flow e2e', () => {
  test('clear button resets form fields', async ({ page }) => {
    const analyzerPage = new AnalyzerPage(page);
    await analyzerPage.gotoHome();
    await analyzerPage.fillForm(
      'sender@example.com',
      'Suspicious subject',
      'Suspicious email body for testing clear action.'
    );

    await analyzerPage.clickClear();

    await analyzerPage.expectSenderValue('');
    await analyzerPage.expectEmailValue('');
    await analyzerPage.expectAnalyzeDisabled();
  });

  test('analyzes email and renders result', async ({ page }) => {
    const analyzerPage = new AnalyzerPage(page);

    await analyzerPage.stubAnalyzeRequest(async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          model: 'gpt-4.1',
          sender: 'attacker@example.com',
          prediction: 'phishing',
          reason: 'Contains urgent credential reset request',
          timestamp: '2026-03-04T10:00:00Z',
          response_time_ms: 321,
        }),
      });
    });

    await analyzerPage.gotoHome();
    await analyzerPage.fillForm(
      'attacker@example.com',
      'Urgent security alert',
      'Urgent: click this link now and re-enter your company password.'
    );

    await analyzerPage.clickAnalyze();

    await analyzerPage.expectAnalysisResultVisible();
    await analyzerPage.expectResultRowValue(/^Model/, 'gpt-4.1');
    await analyzerPage.expectResultRowValue(/^Sender/, 'attacker@example.com');
    await analyzerPage.expectTextVisible('PHISHING');
    await analyzerPage.expectBackendErrorVisible('Contains urgent credential reset request');
  });

  test('shows backend error message when analyze fails', async ({ page }) => {
    const analyzerPage = new AnalyzerPage(page);

    await analyzerPage.stubAnalyzeRequest(async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Backend unavailable for test' }),
      });
    });

    await analyzerPage.gotoHome();
    await analyzerPage.fillEmailOnly('Test email body');
    await analyzerPage.clickAnalyze();

    await analyzerPage.expectBackendErrorVisible('Backend unavailable for test');
    await analyzerPage.expectResultsHidden();
  });
});
