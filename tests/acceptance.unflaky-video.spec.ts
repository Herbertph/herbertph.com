import { test, expect, Page, BrowserContext } from '@playwright/test';

const VIDEO_URL = 'https://www.youtube.com/watch?v=XVhTas9QSIo';
const EMBED_URL = 'https://www.youtube-nocookie.com/embed/XVhTas9QSIo?autoplay=1';
const TITLE = 'Watch the Unflaky tool walkthrough on YouTube';
const GOLD = 'rgb(199, 154, 59)';
const GREEN_DEEP = 'rgb(16, 40, 26)';

async function stubEmbed(context: BrowserContext) {
  await context.route('https://www.youtube-nocookie.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<html><body style="margin:0;background:#333">embed</body></html>',
    })
  );
}

async function openHome(page: Page) {
  await page.goto('/');
}

async function assertRatio(page: Page, selector: string, label: string) {
  const box = await page.locator(selector).boundingBox();
  expect(box, `${label} box`).toBeTruthy();
  expect(Math.abs(box!.width / box!.height - 16 / 9), `${label} should be 16:9`).toBeLessThan(0.02);
  return box!;
}

async function assertNoHorizontalScroll(page: Page, label: string) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(overflow, `no horizontal scroll ${label}`).toBe(false);
}

test.describe('showcase video', () => {
  test('TC-1 (AC-1): a fresh load has the typographic facade and loads no video third party', async ({ page }) => {
    const hosts: string[] = [];
    page.on('request', (request) => {
      try {
        hosts.push(new URL(request.url()).host);
      } catch {
        /* data: and about: requests are irrelevant */
      }
    });
    await openHome(page);
    const facade = page.locator('#videoFacade');
    await expect(facade).toBeVisible();
    await expect(facade).toHaveAttribute('aria-label', TITLE);
    await expect(facade).toHaveAttribute('href', VIDEO_URL);
    await expect(page.locator('#showcase iframe')).toHaveCount(0);
    await expect(page.locator('#showcase img')).toHaveCount(0);
    expect(hosts.filter((host) => /youtube|ytimg|googlevideo/.test(host))).toEqual([]);
  });

  test('TC-2 (AC-2): a mouse click embeds the video in place', async ({ page, context }) => {
    await stubEmbed(context);
    await openHome(page);
    let popupOpened = false;
    page.on('popup', () => {
      popupOpened = true;
    });
    await page.locator('#videoFacade').click();
    const frame = page.locator('#showcase iframe');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute('src', EMBED_URL);
    await expect(frame).toHaveAttribute('title', TITLE);
    await expect(frame).toHaveAttribute(
      'allow',
      'autoplay; encrypted-media; picture-in-picture; fullscreen'
    );
    await expect(frame).toHaveAttribute('allowfullscreen', '');
    await expect(page.locator('#videoFacade')).toHaveCount(0);
    await expect(frame).toBeFocused();
    await assertRatio(page, '.video-embed', 'embedded player');
    const background = await page
      .locator('.video-embed')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).toBe(GREEN_DEEP);
    await page.waitForTimeout(300);
    expect(popupOpened, 'the embed must not open a popup').toBe(false);
  });

  test('TC-3 (AC-3): Enter on the focused facade embeds the video', async ({ page, context }) => {
    await stubEmbed(context);
    await openHome(page);
    await page.locator('#videoFacade').focus();
    await expect(page.locator('#videoFacade')).toBeFocused();
    await page.keyboard.press('Enter');
    const frame = page.locator('#showcase iframe');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute('src', EMBED_URL);
    await expect(page.locator('#videoFacade')).toHaveCount(0);
    await expect(frame).toBeFocused();
  });

  test('TC-4 (FR-2): Space on the focused facade embeds the video', async ({ page, context }) => {
    await stubEmbed(context);
    await openHome(page);
    await page.locator('#videoFacade').focus();
    await page.keyboard.press('Space');
    const frame = page.locator('#showcase iframe');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute('src', EMBED_URL);
    await expect(page.locator('#videoFacade')).toHaveCount(0);
    await expect(frame).toBeFocused();
  });

  test('TC-5 (AC-4): the facade and the showcase CTA point to the specific video', async ({ page }) => {
    await openHome(page);
    for (const [selector, label] of [
      ['#videoFacade', 'facade'],
      ['#showcase .cta', 'showcase CTA'],
    ] as const) {
      const link = page.locator(selector);
      await expect(link, label).toHaveAttribute('href', VIDEO_URL);
      await expect(link, label).toHaveAttribute('target', '_blank');
      await expect(link, label).toHaveAttribute('rel', /noopener/);
      const href = await link.getAttribute('href');
      expect(href, `${label} must not point to the channel`).not.toContain('youtube.com/@unflaky');
    }
  });

  test('TC-6 (AC-5): the Sign-off YouTube link stays on the channel', async ({ page }) => {
    await openHome(page);
    const link = page.locator('#signoff').getByRole('link', { name: '@UNFLAKY', exact: true });
    await expect(link).toHaveAttribute('href', 'https://youtube.com/@unflaky');
  });

  test('TC-7 (AC-6): the facade and the embed are 16:9 at 360, 390, 560 and 1280px', async ({ page, context }) => {
    await stubEmbed(context);
    for (const width of [360, 390, 560, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await openHome(page);
      const facade = await assertRatio(page, '#videoFacade', `facade at ${width}px`);
      expect(facade.x + facade.width, `facade inside viewport at ${width}px`).toBeLessThanOrEqual(
        width + 1
      );
      await assertNoHorizontalScroll(page, `before click at ${width}px`);

      await page.locator('#videoFacade').click();
      const embed = await assertRatio(page, '.video-embed', `embed at ${width}px`);
      expect(embed.x + embed.width, `embed inside viewport at ${width}px`).toBeLessThanOrEqual(
        width + 1
      );
      await assertNoHorizontalScroll(page, `after click at ${width}px`);
    }
  });

  test('TC-9 (FR-6/AC-7): a forced empty ID keeps a plain link to the video', async ({ page, context }) => {
    await page.addInitScript(() => {
      (window as unknown as { UNFLAKY_VIDEO_ID: string }).UNFLAKY_VIDEO_ID = '';
    });
    await context.route('https://www.youtube.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: 'ok' })
    );
    await openHome(page);
    const facade = page.locator('#videoFacade');
    await expect(facade).toHaveAttribute('href', VIDEO_URL);
    await expect(facade).toHaveAttribute('target', '_blank');
    await expect(facade).toHaveAttribute('rel', /noopener/);
    await expect(page.locator('#showcase iframe')).toHaveCount(0);

    const [popup] = await Promise.all([page.waitForEvent('popup'), facade.click()]);
    await popup.waitForLoadState('domcontentloaded');
    expect(popup.url()).toContain('XVhTas9QSIo');
    await expect(facade).toBeVisible();
  });

  test('TC-10 (FR-7): the embed does not change the run state', async ({ page, context }) => {
    await stubEmbed(context);
    await page.setViewportSize({ width: 390, height: 900 });
    await openHome(page);
    await page.evaluate(() =>
      document.getElementById('showcase')?.scrollIntoView({ behavior: 'instant' })
    );
    await page.waitForTimeout(400);
    const readState = () =>
      page.evaluate(() => ({
        count: document.getElementById('runCount')?.textContent ?? '',
        status: document.getElementById('specStatus')?.textContent ?? '',
        aria: document.getElementById('progress')?.getAttribute('aria-valuenow') ?? '',
      }));
    const before = await readState();
    await page.locator('#videoFacade').click();
    const frame = page.locator('#showcase iframe');
    await expect(frame).toBeFocused();
    await page.waitForTimeout(300);
    const after = await readState();
    expect(after).toEqual(before);
  });

  test('TC-11 (handoff): the focused embed gets the gold frame by mouse and by Enter', async ({ page, context }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'WebKit does not expose iframe focus to :focus-within; the iframe focus itself is covered in TC-2/3/4 on both projects'
    );
    await stubEmbed(context);
    await page.setViewportSize({ width: 390, height: 900 });
    await openHome(page);

    const readFrame = () =>
      page.locator('.video-embed').evaluate((el) => {
        const after = getComputedStyle(el, '::after');
        return {
          opacity: after.opacity,
          borderColor: after.borderColor,
          borderWidth: after.borderWidth,
          background: getComputedStyle(el).backgroundColor,
        };
      });

    await page.locator('#videoFacade').click();
    const frame = page.locator('#showcase iframe');
    await expect(frame).toBeFocused();
    await page.waitForTimeout(300);
    const mouseFrame = await readFrame();
    expect(mouseFrame.opacity).toBe('1');
    expect(mouseFrame.borderColor).toBe(GOLD);
    expect(mouseFrame.borderWidth).toBe('2px');
    expect(mouseFrame.background).toBe(GREEN_DEEP);

    await page.locator('.show-copy .cta').focus();
    await page.waitForTimeout(300);
    const blurred = await readFrame();
    expect(blurred.opacity).toBe('0');

    await openHome(page);
    await page.locator('#videoFacade').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#showcase iframe')).toBeFocused();
    await page.waitForTimeout(300);
    const enterFrame = await readFrame();
    expect(enterFrame.opacity).toBe('1');
    expect(enterFrame.borderColor).toBe(GOLD);
  });

  test('TC-12 (handoff): the mobile review screenshots are current and 16:9', async ({ page, request }) => {
    for (const name of ['mobile-light', 'mobile-dark']) {
      const response = await request.get(`/docs/screenshots/homepage-test-run/${name}.png`);
      expect(response.ok(), `${name} exists`).toBe(true);
      expect(response.headers()['content-type']).toContain('image/png');
      const body = await response.body();
      expect(body.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      const width = body.readUInt32BE(16);
      const height = body.readUInt32BE(20);
      expect(width, `${name} width`).toBe(390);
      expect(height, `${name} height`).toBeGreaterThan(8000);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page);
    await assertRatio(page, '#videoFacade', '390px screenshot facade');
  });
});
