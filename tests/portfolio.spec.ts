import { test, expect, Page } from '@playwright/test';

const H1 = 'Every release tells a story. I make sure it ends in a pass, not a post-mortem.';
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const SELF_HOST = '127.0.0.1:4173';

async function scrollToBottom(page: Page) {
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
  );
}

async function scrollSectionToTop(page: Page, id: string) {
  await page.evaluate((sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) throw new Error(`missing #${sectionId}`);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  }, id);
}

async function centerElement(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) throw new Error(`missing ${sel}`);
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + el.offsetHeight / 2,
      behavior: 'instant',
    });
  }, selector);
}

test.describe('run state', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('AC-1: a fresh load starts a 0/7 run', async ({ page }) => {
    await expect(page.locator('#runCount')).toHaveText('RUN 0/7');
    const progress = page.locator('#progress');
    await expect(progress).toHaveAttribute('role', 'progressbar');
    await expect(progress).toHaveAttribute('aria-valuemin', '0');
    await expect(progress).toHaveAttribute('aria-valuemax', '7');
    await expect(progress).toHaveAttribute('aria-valuenow', '0');
    await expect(page.locator('#specStatus')).toHaveText('RUNNING');
    await expect(page.locator('#specList .spec-item')).toHaveCount(7);
    await expect(page.locator('#specList .spec-item.pending')).toHaveCount(7);
    await expect(page.locator('#specList .spec-item.passed')).toHaveCount(0);
    await expect(page.locator('#passCard')).not.toHaveClass(/visible/);
    await expect(page.locator('#passCard .stamp')).not.toBeVisible();
  });

  test('AC-2: sections are in order and there is a single h1', async ({ page }) => {
    const sections = await page.evaluate(() =>
      [...document.querySelectorAll('main section')].map((s) => s.id)
    );
    expect(sections).toEqual(['top', 'story', 'method', 'evidence', 'showcase', 'next', 'signoff']);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('AC-3: scrolling to the bottom passes all seven tests', async ({ page }) => {
    await scrollToBottom(page);
    await expect(page.locator('#specList .spec-item.passed')).toHaveCount(7);
    await expect(page.locator('#specList .spec-item.pending')).toHaveCount(0);
    await expect(page.locator('#runCount')).toHaveText('7 / 7 PASSED');
    await expect(page.locator('#progress')).toHaveAttribute('aria-valuenow', '7');
    await expect(page.locator('#specStatus')).toContainText('ALL PASSING');
  });

  test('AC-4: chapter 01 passes exactly its own test and nothing else', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const chapterHeight = await page
      .locator('[data-chapter="0"]')
      .evaluate((el) => el.getBoundingClientRect().height);
    await page.setViewportSize({ width: 1280, height: Math.ceil(chapterHeight * 1.05) });
    await page.evaluate(() => {
      const chapter = document.querySelector('[data-chapter="0"]') as HTMLElement;
      window.scrollTo({
        top: chapter.getBoundingClientRect().top + window.scrollY - 8,
        behavior: 'instant',
      });
    });

    await expect(page.locator('#specList .spec-item.passed')).toHaveCount(1);
    await expect(page.locator('#specList [data-test="1"]')).toHaveClass(/passed/);
    await expect(page.locator('#progress')).toHaveAttribute('aria-valuenow', '1');
    await expect(page.locator('#runCount')).toHaveText('1 / 7 PASSED');
  });

  test('AC-5: a passed test never goes back to pending', async ({ page }) => {
    await scrollToBottom(page);
    await expect(page.locator('#specList .spec-item.passed')).toHaveCount(7);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(250);
    await expect(page.locator('#specList .spec-item.passed')).toHaveCount(7);
    await expect(page.locator('#runCount')).toHaveText('7 / 7 PASSED');
    await expect(page.locator('#specStatus')).toContainText('ALL PASSING');
  });

  test('AC-7: the PASS card only shows up when the sign-off enters the viewport', async ({ page }) => {
    const card = page.locator('#passCard');
    await expect(card).not.toHaveClass(/visible/);
    await scrollSectionToTop(page, 'signoff');
    await expect(card).toHaveClass(/visible/);
    await expect(page.locator('#passCard .stamp')).toBeVisible();
  });

  test('AC-8: the spine fills along the story and chapters reveal themselves', async ({ page }) => {
    await centerElement(page, '[data-chapter="0"]');
    await expect(page.locator('[data-chapter="0"]')).toHaveClass(/in/);
    const early = await page.locator('#spineProgress').evaluate((el) => el.getBoundingClientRect().height);

    await centerElement(page, '[data-chapter="4"]');
    await expect(page.locator('[data-chapter="4"]')).toHaveClass(/in/);
    const late = await page.locator('#spineProgress').evaluate((el) => el.getBoundingClientRect().height);

    expect(late, 'spine should be further along at chapter 05').toBeGreaterThan(early);
    await expect(page.locator('[data-chapter]')).toHaveCount(5);
    await expect(page.locator('[data-chapter].in')).toHaveCount(5);
    await expect(page.locator('[data-chapter="4"]')).toHaveClass(/chapter-dark/);
  });

  test('AC-9: the HUD anchor nav moves the page by mouse and by keyboard', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'the HUD nav is desktop-only');

    const video = page.locator('.hud-nav a[href="#showcase"]');
    await video.click();
    await expect(page).toHaveURL(/#showcase$/);

    const story = page.locator('.hud-nav a[href="#story"]');
    await story.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#story$/);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('AC-6: the run still completes without smooth scrolling', async ({ page }) => {
    await page.goto('/');
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior
    );
    expect(behavior).not.toBe('smooth');

    await scrollToBottom(page);
    await expect(page.locator('#specList .spec-item.passed')).toHaveCount(7);
    await expect(page.locator('#runCount')).toHaveText('7 / 7 PASSED');
    await expect(page.locator('#passCard')).toHaveClass(/visible/);
  });
});

test.describe('showcase', () => {
  test('AC-10: the player is typographic and loads no third party', async ({ page }) => {
    const hosts: string[] = [];
    page.on('request', (request) => {
      try {
        hosts.push(new URL(request.url()).host);
      } catch {
        /* data: and about: requests are irrelevant */
      }
    });
    await page.goto('/');

    const showcase = page.locator('#showcase');
    await expect(showcase).toBeVisible();
    await expect(showcase.getByRole('link', { name: 'Watch the Unflaky tool walkthrough on YouTube' })).toHaveAttribute(
      'href',
      'https://youtube.com/@unflaky'
    );
    await expect(page.locator('#showcase iframe')).toHaveCount(0);
    await expect(page.locator('#showcase img')).toHaveCount(0);
    expect(hosts.filter((host) => /youtube|ytimg|googlevideo/.test(host))).toEqual([]);
  });

  test('AC-11: an empty ID opens the channel in a new tab and keeps the facade', async ({ page, context }) => {
    await context.route('https://youtube.com/**', (route) => route.fulfill({ status: 200, body: 'ok' }));
    await page.goto('/');

    const facade = page.locator('#videoFacade');
    await expect(facade).toHaveAttribute('target', '_blank');
    await expect(facade).toHaveAttribute('rel', /noopener/);

    const [popup] = await Promise.all([page.waitForEvent('popup'), facade.click()]);
    await popup.waitForLoadState('domcontentloaded');
    expect(popup.url()).toContain('youtube.com/@unflaky');
    await expect(facade).toBeVisible();
  });

  test('AC-12: a configured ID replaces the facade with the privacy embed', async ({ page, context }) => {
    await context.route('https://www.youtube-nocookie.com/**', (route) =>
      route.fulfill({ status: 200, body: 'ok' })
    );
    await page.addInitScript(() => {
      (window as unknown as { UNFLAKY_VIDEO_ID: string }).UNFLAKY_VIDEO_ID = 'abc123';
    });
    await page.goto('/');

    await page.locator('#videoFacade').click();
    const frame = page.locator('#showcase iframe');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/abc123?autoplay=1'
    );
    await expect(page.locator('#videoFacade')).toHaveCount(0);
  });

  test('AC-13: below 920px the player stacks above the explanation', async ({ page }) => {
    await page.setViewportSize({ width: 760, height: 1000 });
    await page.goto('/');
    const player = await page.locator('.show-player').boundingBox();
    const copy = await page.locator('.show-copy').boundingBox();
    expect(player && copy).toBeTruthy();
    expect(player!.y).toBeLessThan(copy!.y);
  });
});

test.describe('content and corrections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('AC-14: the approved English copy is rendered verbatim', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText(H1);
    await expect(page.locator('.hero .lede')).toHaveText(
      "I'm Herbert Parasio, SQA Team Lead at BMM Testlabs in Dieppe, Canada. My team verifies casino and slot games against the math model and the rules of 10 jurisdictions, before Compliance decides whether they can go to market. This page is the run. Scroll, and each chapter passes."
    );
    await expect(page.locator('.hero .cue')).toHaveText('SCROLL TO RUN THE SUITE · 7 TESTS');
    await expect(page.locator('#story h2')).toHaveText(
      'Most testers learn to test. I learned everything around the test first.'
    );
    await expect(page.locator('[data-chapter="0"] h3')).toHaveText(
      'Before I tested software, I read numbers for a living.'
    );
    await expect(page.locator('[data-chapter="4"] h3')).toHaveText(
      'Now I lead the team that verifies what regulators will sign.'
    );
    await expect(page.locator('#method h2')).toHaveText(
      'A bug is a story with a missing chapter. My job is to find which one.'
    );
    await expect(page.locator('.callout p')).toContainText('Compliance certifies.');
    await expect(page.locator('#evidence h2')).toHaveText(
      "Don't take my word for it. Take the numbers."
    );
    await expect(page.locator('#showcase h2')).toHaveText(
      "Don't just read that I test. Watch the tool I built do it."
    );
    await expect(page.locator('#next h2')).toHaveText(
      "The run doesn't end at my desk. Next, I teach QAs to think, not just to click."
    );
    await expect(page.locator('#signoff h2')).toHaveText(
      "Run complete. Let's verify yours before your users do."
    );
  });

  test('AC-15: CTFL is certified and the forbidden words stay out', async ({ page }) => {
    const text = (await page.locator('body').innerText()).toLowerCase();
    expect(text).toContain('certified 2026');
    expect(text).not.toContain('scheduled');
    expect(text).not.toContain('studying');

    const callout = (await page.locator('.callout').innerText()).toLowerCase();
    expect(callout).toContain('compliance certifies');
    const outside = text.replace(callout, '');
    expect(outside).not.toMatch(/\bcertif(y|ies)\b/);
    expect(outside).not.toMatch(/\b(approve|reject)\b/);
  });

  test('AC-16: the evidence grid has exactly five metrics and three cards', async ({ page }) => {
    const metrics = page.locator('#evidence .metric');
    const cards = page.locator('#evidence .ev-card');
    await expect(metrics).toHaveCount(5);
    await expect(cards).toHaveCount(3);
    for (const group of [metrics, cards]) {
      const count = await group.count();
      for (let i = 0; i < count; i++) {
        expect((await group.nth(i).innerText()).trim().length).toBeGreaterThan(0);
      }
    }
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/\bFLUXO\b/);
    expect(text).not.toMatch(/\bLIVE\b/);
    expect(text).not.toContain('SUITE PASSING');
  });

  test('AC-17: the story shows 2014, 2017, 2022, 2024 and 2026', async ({ page }) => {
    const story = await page.locator('#story').innerText();
    for (const year of ['2014', '2017', '2022', '2024', '2026']) {
      expect(story).toContain(year);
    }
  });

  test('AC-18: the sign-off links point where their labels promise', async ({ page }) => {
    const links: Array<[string, string]> = [
      ['/IN/HERBERT-CUNHA', 'https://linkedin.com/in/herbert-cunha'],
      ['@HERBERTPH', 'https://github.com/Herbertph'],
      ['@UNFLAKY', 'https://youtube.com/@unflaky'],
      ['X @HERBERTBUILDS', 'https://x.com/herbertbuilds'],
    ];
    const signoff = page.locator('#signoff');
    for (const [label, href] of links) {
      const link = signoff.getByRole('link', { name: label, exact: true });
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
    await expect(page.locator('a[href*="/in/herbertph"]')).toHaveCount(0);
  });

  test('AC-19: no external link opens without rel="noopener"', async ({ page }) => {
    const external = page.locator('a[target="_blank"]');
    const count = await external.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(external.nth(i)).toHaveAttribute('rel', /noopener/);
    }
  });

  test('AC-30: the page is typographic and only talks to its own origin and Google Fonts', async ({ page }) => {
    const hosts: string[] = [];
    page.on('request', (request) => {
      try {
        hosts.push(new URL(request.url()).host);
      } catch {
        /* ignore data: urls */
      }
    });
    await page.goto('/');
    await expect(page.locator('img')).toHaveCount(0);
    const unexpected = hosts.filter((host) => host !== SELF_HOST && !FONT_HOSTS.includes(host));
    expect(unexpected).toEqual([]);
  });

  test('AC-31: the resume is regenerated with the corrections', async ({ page, request }) => {
    const pdf = await request.get('/resume.pdf');
    expect(pdf.ok()).toBe(true);
    const body = await pdf.body();
    expect(body.subarray(0, 4).toString()).toBe('%PDF');

    await page.goto('/resume/resume.html');
    const text = (await page.locator('body').innerText()).toLowerCase();
    expect(text).toContain('sqa team lead');
    expect(text).toContain('11 testers');
    expect(text).toContain('95%');
    expect(text).toContain('98%');
    expect(text).toContain('ctfl');
    expect(text).toContain('certified 2026');
    expect(text).toContain('ctal');
    expect(text).toContain('2027');
    expect(text).toContain('linkedin.com/in/herbert-cunha');
    expect(text).not.toContain('scheduled');
    expect(text).not.toContain('studying');
  });

  test('AC-32: the custom domain and deploy path are untouched', async ({ request }) => {
    const cname = await request.get('/CNAME');
    expect(cname.ok()).toBe(true);
    expect((await cname.text()).trim()).toBe('herbertph.com');
  });
});

test.describe('i18n', () => {
  const languages = [
    { code: 'pt', button: 'PT', h1: /Toda release conta uma história/, title: /Líder de Equipe SQA/ },
    { code: 'es', button: 'ES', h1: /Cada release cuenta una historia/, title: /Líder de Equipo SQA/ },
    { code: 'fr', button: 'FR', h1: /Chaque release raconte une histoire/, title: /Chef d'équipe SQA/ },
  ];

  test('AC-20: English is the default and the title is the approved one', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Herbert Parasio · SQA Team Lead');
  });

  for (const lang of languages) {
    test(`AC-21/22: ${lang.code} translates on click and on first load`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: lang.button, exact: true }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', lang.code);
      await expect(page.locator('h1')).toHaveText(lang.h1);
      await expect(page).toHaveTitle(lang.title);
      await expect(page).toHaveURL(new RegExp(`lang=${lang.code}`));

      await page.goto(`/?lang=${lang.code}`);
      await expect(page.locator('html')).toHaveAttribute('lang', lang.code);
      await expect(page.locator('h1')).toHaveText(lang.h1);
      const description = await page.getAttribute('meta[name="description"]', 'content');
      expect(description && description.length).toBeGreaterThan(40);
      await expect(page.locator('[data-chapter="0"] h3')).not.toHaveText(
        'Before I tested software, I read numbers for a living.'
      );
    });
  }

  test('AC-21: switching back to EN removes the lang parameter', async ({ page }) => {
    await page.goto('/?lang=pt');
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).not.toHaveURL(/lang=/);
  });

  test('AC-23: an unknown language falls back to English', async ({ page }) => {
    await page.goto('/?lang=klingon');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveText(H1);
  });

  test('AC-24: no empty key and the protected terms stay untranslated', async ({ page }) => {
    for (const code of ['en', 'pt', 'es', 'fr']) {
      await page.goto(`/?lang=${code}`);
      const empty = await page.evaluate(() =>
        [...document.querySelectorAll('[data-i], [data-ihtml]')]
          .filter((el) => !el.textContent?.trim())
          .map((el) => (el as HTMLElement).dataset.i ?? (el as HTMLElement).dataset.ihtml)
      );
      expect(empty, `empty keys in ${code}`).toEqual([]);

      const text = await page.locator('body').innerText();
      for (const term of ['herbert.spec.ts', 'BMM Testlabs', 'NBCC', 'ISTQB CTFL', 'CTAL', 'Unflaky']) {
        expect(text, `${term} should stay untranslated in ${code}`).toContain(term);
      }
    }
  });

  test('AC-25: the CTFL/CTAL wording holds in every language', async ({ page }) => {
    for (const code of ['en', 'pt', 'es', 'fr']) {
      await page.goto(`/?lang=${code}`);
      const text = (await page.locator('body').innerText()).toLowerCase();
      expect(text, `forbidden wording in ${code}`).not.toMatch(
        /scheduled|studying|agendad|estudando|em estudo/
      );
      expect(text).toContain('2026');
      expect(text).toContain('2027');
    }
  });
});

test.describe('layout and theme', () => {
  test('AC-26: at 390px there is no horizontal scroll and the HUD fits', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(overflow, 'page should not scroll horizontally').toBe(false);

    const id = await page.locator('.hud-id').boundingBox();
    const count = await page.locator('#runCount').boundingBox();
    const langs = await page.locator('#langs').boundingBox();
    expect(id && count && langs).toBeTruthy();
    expect(langs!.x + langs!.width).toBeLessThanOrEqual(390);
    expect(count!.x).toBeGreaterThanOrEqual(id!.x + id!.width - 1);
    expect(langs!.x).toBeGreaterThanOrEqual(count!.x + count!.width - 1);

    const copy = await page.locator('.hero-copy').boundingBox();
    const panel = await page.locator('#spec').boundingBox();
    expect(panel!.y).toBeGreaterThan(copy!.y + 80);
  });

  test('AC-29: the HUD stays readable at a 200%-zoom equivalent width', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 800 });
    await page.goto('/');
    const count = await page.locator('#runCount').boundingBox();
    const langs = await page.locator('#langs').boundingBox();
    expect(count && langs).toBeTruthy();
    expect(langs!.x + langs!.width).toBeLessThanOrEqual(640);
    expect(langs!.x).toBeGreaterThanOrEqual(count!.x + count!.width - 1);
  });

  test('AC-28: keyboard focus is always visible', async ({ page }) => {
    await page.goto('/');
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return { tag: 'BODY', visible: true };
        const style = getComputedStyle(el);
        return {
          tag: el.tagName + (el.textContent ? `:${el.textContent.trim().slice(0, 18)}` : ''),
          visible: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0,
        };
      });
      expect(focused.visible, `focus indicator on ${focused.tag}`).toBe(true);
    }
  });
});

test.describe('light theme', () => {
  test.use({ colorScheme: 'light' });

  test('AC-27: light tokens resolve to the approved values', async ({ page }) => {
    await page.goto('/');
    const paper = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--paper').trim()
    );
    expect(paper.toUpperCase()).toBe('#F6F1E7');
  });
});

test.describe('dark theme', () => {
  test.use({ colorScheme: 'dark' });

  test('AC-27: dark tokens follow the OS', async ({ page }) => {
    await page.goto('/');
    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        paper: style.getPropertyValue('--paper').trim(),
        green: style.getPropertyValue('--green').trim(),
        panel: style.getPropertyValue('--panel').trim(),
        passBg: style.getPropertyValue('--pass-bg').trim(),
      };
    });
    expect(tokens.paper.toUpperCase()).toBe('#14110B');
    expect(tokens.green.toUpperCase()).toBe('#7FC493');
    expect(tokens.panel.toUpperCase()).toBe('#0D0B07');
    expect(tokens.passBg.toUpperCase()).toBe('#1E5C36');
  });
});
