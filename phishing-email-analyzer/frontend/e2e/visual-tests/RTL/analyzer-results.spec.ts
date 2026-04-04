import { expect, type Page, test } from '@playwright/test';
import { AnalyzerPage } from '../../page-objects/analyzer.page';

const STUB_BASE = {
  model: 'gpt-4.1',
  reason: 'Contains urgent credential reset request',
  timestamp: '2026-03-04T10:00:00Z',
  sender: 'atk@example.com',
  title: 'Verify account',
  response_time_ms: 321,
} as const;

const setRtlDirection = async (page: Page) => {
  await page.addInitScript(() => {
    document.documentElement.setAttribute('dir', 'rtl');
  });
};

const enforceRtlDirection = async (page: Page) => {
  await page.evaluate(() => {
    document.documentElement.setAttribute('dir', 'rtl');
  });
};

const enforceVisibleFormValues = async (page: Page, sender: string, title: string) => {
  await page.evaluate(
    ({ nextSender, nextTitle }) => {
      const senderInput = document.querySelector<HTMLInputElement>('[data-testid="sender-input"]');
      const titleInput = document.querySelector<HTMLInputElement>('[data-testid="title-input"]');

      if (senderInput) {
        senderInput.value = nextSender;
      }

      if (titleInput) {
        titleInput.value = nextTitle;
      }
    },
    { nextSender: sender, nextTitle: title }
  );
};

test.describe('Analyzer results RTL visual @visual', () => {
  test.beforeEach(async ({ page }) => {
    await setRtlDirection(page);
  });

  test('light phishing result', async ({ page }) => {
    const analyzerPage = new AnalyzerPage(page);
    await analyzerPage.setTheme('light');

    await analyzerPage.stubAnalyzeRequest(async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...STUB_BASE,
          prediction: 'phishing',
          reason: 'Contains urgent credential reset request with suspicious external link.',
        }),
      });
    });

    await analyzerPage.gotoHome();
    await enforceRtlDirection(page);
    await analyzerPage.fillForm(
      STUB_BASE.sender,
      STUB_BASE.title,
      'Urgent: click this link now and re-enter your company password.'
    );
    await analyzerPage.clickAnalyze();
    await analyzerPage.expectResultsVisible();
    await enforceVisibleFormValues(page, STUB_BASE.sender, STUB_BASE.title);

    await expect(page).toHaveScreenshot(['analyzer-results', 'light', 'result-phishing.png'], {
      fullPage: true,
      mask: analyzerPage.resultDynamicRowsMask,
    });
  });

  test('safe prediction result', async ({ page }) => {
    const analyzerPage = new AnalyzerPage(page);
    await analyzerPage.setTheme('light');

    await analyzerPage.stubAnalyzeRequest(async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...STUB_BASE,
          prediction: 'legit',
          reason: 'Email appears to be a standard business communication with no suspicious links.',
        }),
      });
    });

    await analyzerPage.gotoHome();
    await enforceRtlDirection(page);
    await analyzerPage.fillForm(
      STUB_BASE.sender,
      STUB_BASE.title,
      'Hello, please find attached the quarterly report. Best regards.'
    );
    await analyzerPage.clickAnalyze();
    await analyzerPage.expectResultsVisible();
    await enforceVisibleFormValues(page, STUB_BASE.sender, STUB_BASE.title);

    await expect(page).toHaveScreenshot(['analyzer-results', 'light', 'result-safe.png'], {
      fullPage: true,
      mask: analyzerPage.resultDynamicRowsMask,
    });
  });

  test('backend error state', async ({ page }) => {
    const analyzerPage = new AnalyzerPage(page);
    await analyzerPage.setTheme('light');

    await analyzerPage.stubAnalyzeRequest(async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' }),
      });
    });

    await analyzerPage.gotoHome();
    await enforceRtlDirection(page);
    await analyzerPage.fillEmailOnly('Test email body for error state.');
    await analyzerPage.clickAnalyze();
    await analyzerPage.expectBackendErrorVisible('Internal server error');

    await expect(page).toHaveScreenshot(['analyzer-results', 'light', 'result-error.png'], {
      fullPage: true,
    });
  });

  test('phishing prediction - dark theme', async ({ page }) => {
    const analyzerPage = new AnalyzerPage(page);
    await analyzerPage.setTheme('dark');

    await analyzerPage.stubAnalyzeRequest(async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...STUB_BASE,
          prediction: 'phishing',
          reason: 'Contains urgent credential reset request with suspicious external link.',
        }),
      });
    });

    await analyzerPage.gotoHome();
    await enforceRtlDirection(page);
    await analyzerPage.fillForm(
      STUB_BASE.sender,
      STUB_BASE.title,
      'Urgent: click this link now and re-enter your company password.'
    );
    await analyzerPage.clickAnalyze();
    await analyzerPage.expectResultsVisible();
    await enforceVisibleFormValues(page, STUB_BASE.sender, STUB_BASE.title);

    await expect(page).toHaveScreenshot(['analyzer-results', 'dark', 'result-phishing.png'], {
      fullPage: true,
      mask: analyzerPage.resultDynamicRowsMask,
    });
  });
});
