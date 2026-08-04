import { test, expect } from '@playwright/test';

test.describe('content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('defaults to English', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/QA Engineer/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('regulators');
  });

  test('the test-run panel finishes and reports no failures', async ({ page }) => {
    const rows = page.locator('#rows .row');
    await expect(rows).toHaveCount(7);
    await expect(rows.last()).toHaveClass(/on/);
    await expect(page.locator('#summary')).toContainText('passed');
  });

  test('every section renders', async ({ page }) => {
    for (const id of ['practice', 'evidence', 'toolbox', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test('contact links are well formed', async ({ page }) => {
    const contact = page.locator('#contact');
    await expect(contact.getByRole('link', { name: /in\/herbertph/ })).toHaveAttribute(
      'href',
      /linkedin\.com/
    );
    await expect(contact.getByRole('link', { name: /@Herbertph/ })).toHaveAttribute(
      'href',
      /github\.com/
    );
  });

  test('no external link opens without rel="noopener"', async ({ page }) => {
    const external = page.locator('a[target="_blank"]');
    const count = await external.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(external.nth(i)).toHaveAttribute('rel', /noopener/);
    }
  });

  test('layout holds on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(overflow, 'page should not scroll horizontally').toBe(false);
  });
});

test.describe('languages', () => {
  const languages = [
    { code: 'pt', button: 'PT', h1: /regulador/i },
    { code: 'es', button: 'ES', h1: /regulador/i },
    { code: 'fr', button: 'FR', h1: /régulateur/i },
  ];

  for (const lang of languages) {
    test(`switching to ${lang.code} translates the page and the URL`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: lang.button, exact: true }).click();

      await expect(page.locator('html')).toHaveAttribute('lang', lang.code);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.h1);
      await expect(page).toHaveURL(new RegExp(`lang=${lang.code}`));
    });

    test(`?lang=${lang.code} loads translated on first paint`, async ({ page }) => {
      await page.goto(`/?lang=${lang.code}`);
      await expect(page.locator('html')).toHaveAttribute('lang', lang.code);
    });
  }

  test('an unknown language falls back to English', async ({ page }) => {
    await page.goto('/?lang=klingon');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('no string is left untranslated in any language', async ({ page }) => {
    for (const code of ['en', 'pt', 'es', 'fr']) {
      await page.goto(`/?lang=${code}`);
      const empty = await page.evaluate(() =>
        [...document.querySelectorAll('[data-i], [data-ihtml]')]
          .filter((el) => !el.textContent?.trim())
          .map((el) => (el as HTMLElement).dataset.i ?? (el as HTMLElement).dataset.ihtml)
      );
      expect(empty, `empty keys in ${code}`).toEqual([]);
    }
  });
});
