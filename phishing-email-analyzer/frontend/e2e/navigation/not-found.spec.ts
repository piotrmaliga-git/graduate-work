import { expect, test } from '@playwright/test';
import { AnalyzerPage } from '../page-objects/analyzer.page';
import { NotFoundPage } from '../page-objects/not-found.page';

test.describe('Navigation e2e', () => {
  test('navigating to unknown route shows not found page and allows return home', async ({
    page,
  }) => {
    const notFoundPage = new NotFoundPage(page);
    const analyzerPage = new AnalyzerPage(page);
    await page.goto('/not-existing-route');

    await notFoundPage.expectLoaded();
    await notFoundPage.expectMessageVisible();

    await notFoundPage.clickGoHome();
    await expect(page).toHaveURL(/\/$/);
    await analyzerPage.expectHomeHeadingVisible();
  });
});
