import { expect, test } from '@playwright/test';
import { AnalyzerPage } from '../page-objects/analyzer.page';

test.describe('Analyzer request behavior e2e', () => {
  test('sends expected analyze payload', async ({ page }) => {
    const analyzerPage = new AnalyzerPage(page);
    let receivedPayload: Record<string, unknown> | null = null;

    await analyzerPage.stubAnalyzeRequest(async (route) => {
      receivedPayload = route.request().postDataJSON() as Record<string, unknown>;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          model: 'gpt-4.1',
          sender: 'payload@example.com',
          title: 'Payload Test Subject',
          prediction: 'safe',
          reason: 'No phishing indicators',
          timestamp: '2026-03-04T10:00:00Z',
          response_time_ms: 210,
        }),
      });
    });

    await analyzerPage.gotoHome();
    await analyzerPage.fillForm(
      'payload@example.com',
      'Payload Test Subject',
      'This is a payload verification email body.'
    );
    await analyzerPage.clickAnalyze();
    await analyzerPage.expectAnalysisResultVisible();

    expect(receivedPayload).toEqual(
      expect.objectContaining({
        email_text: 'This is a payload verification email body.',
      })
    );
    expect(receivedPayload).toHaveProperty('sender');
    expect(receivedPayload).toHaveProperty('title');
    expect(receivedPayload).toHaveProperty('model_name');
  });

  test('disables form controls while analysis is in progress', async ({ page }) => {
    const analyzerPage = new AnalyzerPage(page);
    let releaseResponse!: () => void;
    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });

    await analyzerPage.stubAnalyzeRequest(async (route) => {
      await responseGate;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          model: 'gpt-4.1',
          sender: 'loading@example.com',
          title: 'Loading state subject',
          prediction: 'safe',
          reason: 'Looks legitimate',
          timestamp: '2026-03-04T10:00:00Z',
          response_time_ms: 400,
        }),
      });
    });

    await analyzerPage.gotoHome();
    await analyzerPage.fillForm(
      'loading@example.com',
      'Loading state subject',
      'Please verify loading state behavior while request is pending.'
    );
    await analyzerPage.clickAnalyze();
    await analyzerPage.expectAllFormControlsDisabled();

    releaseResponse();

    await analyzerPage.expectAnalysisResultVisible();
    await analyzerPage.expectAnalyzeEnabled();
    await analyzerPage.expectClearEnabled();
  });
});
