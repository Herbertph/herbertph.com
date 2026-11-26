import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const H1 = 'Every release tells a story. I make sure it ends in a pass, not a post-mortem.';
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const SELF_HOST = '127.0.0.1:4173';

async function openHome(page: Page, path = '/') {
  await page.goto(path);
}

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

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

test.describe('run state and structure', () => {
  test('TC-1 (AC-1): a fresh load starts at RUN 0/7 with every item pending', async ({ page }) => {
    await openHome(page);
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

  test('TC-2 (AC-2): sections are in order and there is exactly one h1', async ({ page }) => {
    await openHome(page);
    const sections = await page.evaluate(() =>
      [...document.querySelectorAll('main section')].map((s) => s.id)
    );
    expect(sections).toEqual(['top', 'story', 'method', 'evidence', 'showcase', 'next', 'signoff']);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('TC-3 (AC-3): scrolling to the bottom passes all seven tests', async ({ page }) => {
    await openHome(page);
    await scrollToBottom(page);
    await expect(page.locator('#specList .spec-item.passed')).toHaveCount(7);
    await expect(page.locator('#specList .spec-item.pending')).toHaveCount(0);
    await expect(page.locator('#runCount')).toHaveText('7 / 7 PASSED');
    await expect(page.locator('#progress')).toHaveAttribute('aria-valuenow', '7');
    await expect(page.locator('#specStatus')).toContainText('ALL PASSING');
    await expect(page.locator('#passCard')).toHaveClass(/visible/);
  });

  test('TC-4 (AC-4): chapter 01 passes only item 1', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openHome(page);
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

  test('TC-5 (AC-5): a passed test never reverts', async ({ page }) => {
    await openHome(page);
    await scrollToBottom(page);
    await expect(page.locator('#specList .spec-item.passed')).toHaveCount(7);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(250);
    await expect(page.locator('#specList .spec-item.passed')).toHaveCount(7);
    await expect(page.locator('#runCount')).toHaveText('7 / 7 PASSED');
    await expect(page.locator('#specStatus')).toContainText('ALL PASSING');
  });

  test('TC-7 (AC-7): the PASS card appears only at the sign-off', async ({ page }) => {
    await openHome(page);
    const card = page.locator('#passCard');
    await expect(card).not.toHaveClass(/visible/);
    await expect(card.locator('.stamp')).not.toBeVisible();
    await scrollSectionToTop(page, 'signoff');
    await expect(card).toHaveClass(/visible/);
    await expect(card.locator('.stamp')).toBeVisible();
  });

  test('TC-8 (AC-8): the spine fills and chapters reveal themselves', async ({ page }) => {
    await openHome(page);
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

  test('TC-9 (AC-9): the HUD anchors work with mouse and keyboard', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'the HUD nav is hidden below 1000px');
    await openHome(page);
    const anchors: Array<[string, string]> = [
      ['Story', '#story'],
      ['Method', '#method'],
      ['Evidence', '#evidence'],
      ['Video', '#showcase'],
      ['Next', '#next'],
      ['Sign-off', '#signoff'],
    ];
    for (const [label, hash] of anchors) {
      await page.locator('.hud-nav').getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${hash}$`));
    }
    await page.locator('.hud-nav a[href="#showcase"]').focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#showcase$/);
    await page.locator('.hud-nav a[href="#signoff"]').focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#signoff$/);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('TC-6 (AC-6): reduced motion still completes the run', async ({ page }) => {
    await openHome(page);
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
  test('TC-10 (AC-10): the player is a typographic facade with no third-party load', async ({ page }) => {
    const hosts: string[] = [];
    page.on('request', (request) => {
      try {
        hosts.push(new URL(request.url()).host);
      } catch {
        /* data: and about: requests are irrelevant */
      }
    });
    await openHome(page);
    const showcase = page.locator('#showcase');
    await expect(showcase).toBeVisible();
    const facade = showcase.getByRole('link', { name: 'Watch the Unflaky tool walkthrough on YouTube' });
    await expect(facade).toHaveAttribute('href', 'https://www.youtube.com/watch?v=XVhTas9QSIo');
    await expect(page.locator('#showcase iframe')).toHaveCount(0);
    await expect(page.locator('#showcase img')).toHaveCount(0);
    expect(hosts.filter((host) => /youtube|ytimg|googlevideo/.test(host))).toEqual([]);
  });

  test('TC-11 (FR-6): an empty video ID falls back to a plain link to the video', async ({ page, context }) => {
    await context.route('https://www.youtube.com/**', (route) => route.fulfill({ status: 200, body: 'ok' }));
    await page.addInitScript(() => {
      (window as unknown as { UNFLAKY_VIDEO_ID: string }).UNFLAKY_VIDEO_ID = '';
    });
    await openHome(page);
    const facade = page.locator('#videoFacade');
    await expect(facade).toHaveAttribute('href', 'https://www.youtube.com/watch?v=XVhTas9QSIo');
    await expect(facade).toHaveAttribute('target', '_blank');
    await expect(facade).toHaveAttribute('rel', /noopener/);
    const [popup] = await Promise.all([page.waitForEvent('popup'), facade.click()]);
    await popup.waitForLoadState('domcontentloaded');
    expect(popup.url()).toContain('XVhTas9QSIo');
    await expect(facade).toBeVisible();
  });

  test('TC-12 (FR-2): clicking the facade replaces it with the privacy embed', async ({ page, context }) => {
    await context.route('https://www.youtube-nocookie.com/**', (route) =>
      route.fulfill({ status: 200, body: 'ok' })
    );
    await openHome(page);
    let popupOpened = false;
    page.on('popup', () => {
      popupOpened = true;
    });
    await page.locator('#videoFacade').click();
    const frame = page.locator('#showcase iframe');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/XVhTas9QSIo?autoplay=1'
    );
    await expect(frame).toHaveAttribute('title', 'Watch the Unflaky tool walkthrough on YouTube');
    await expect(frame).toHaveAttribute('allow', /autoplay/);
    await expect(frame).toHaveAttribute('allow', /encrypted-media/);
    await expect(frame).toHaveAttribute('allow', /picture-in-picture/);
    await expect(frame).toHaveAttribute('allow', /fullscreen/);
    await expect(frame).toHaveAttribute('allowfullscreen', '');
    await expect(page.locator('#videoFacade')).toHaveCount(0);
    expect(popupOpened, 'the embed must not open a new tab').toBe(false);
    await expect(frame).toBeFocused();
  });

  test('TC-13 (AC-13): the player stacks below 920px and stays side-by-side above it', async ({ page }) => {
    await page.setViewportSize({ width: 760, height: 1000 });
    await openHome(page);
    let player = await page.locator('.show-player').boundingBox();
    let copy = await page.locator('.show-copy').boundingBox();
    expect(player && copy).toBeTruthy();
    expect(player!.y).toBeLessThan(copy!.y);
    expect(Math.abs(player!.x - copy!.x)).toBeLessThan(1);

    await page.setViewportSize({ width: 920, height: 800 });
    await openHome(page);
    player = await page.locator('.show-player').boundingBox();
    copy = await page.locator('.show-copy').boundingBox();
    expect(player!.y).toBeLessThan(copy!.y);
    expect(Math.abs(player!.x - copy!.x)).toBeLessThan(1);

    await page.setViewportSize({ width: 921, height: 900 });
    await openHome(page);
    player = await page.locator('.show-player').boundingBox();
    copy = await page.locator('.show-copy').boundingBox();
    expect(player!.x + player!.width).toBeLessThanOrEqual(copy!.x + 1);
    await expect(page.locator('.show-player')).toHaveCSS('position', 'sticky');
  });

});

test.describe('showcase without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('TC-14 (AC-10): without JavaScript the facade is a plain link', async ({ page }) => {
    await openHome(page);
    const facade = page.locator('#videoFacade');
    await expect(facade).toBeVisible();
    await expect(facade).toHaveAttribute('href', 'https://www.youtube.com/watch?v=XVhTas9QSIo');
    await expect(facade).toHaveAttribute('target', '_blank');
    await expect(facade).toHaveAttribute('rel', /noopener/);
    await expect(facade).toHaveAttribute('aria-label', 'Watch the Unflaky tool walkthrough on YouTube');
  });
});

test.describe('content and corrections', () => {
  test('TC-15 (AC-14): the approved English copy is rendered verbatim', async ({ page }) => {
    await openHome(page);
    const expectText: Array<[string, string]> = [
      ['.hud-id', 'HERBERT PARASIO · SQA TEAM LEAD'],
      ['.hero .kicker', 'HERBERT PARASIO · SQA TEAM LEAD'],
      ['.hero .sub-label', 'herbert.spec.ts · TEST RUN IN PROGRESS'],
      ['h1', H1],
      [
        '.hero .lede',
        "I'm Herbert Parasio, SQA Team Lead at BMM Testlabs in Dieppe, Canada. My team verifies casino and slot games against the math model and the rules of 10 jurisdictions, before Compliance decides whether they can go to market. This page is the run. Scroll, and each chapter passes.",
      ],
      ['.hero .cue', 'SCROLL TO RUN THE SUITE · 7 TESTS'],
      ['.spec-head .file', 'herbert.spec.ts'],
      ['[data-i="specRun"]', 'TEST RUN'],
      ['[data-i="t1"]', 'Reads data before it judges · 2014 · Infoglobo / Grupo Globo'],
      ['[data-i="t2"]', 'Builds software before it tests it · 2017 · Full-stack developer'],
      ['[data-i="t3"]', 'Crosses an ocean and starts over · 2022 · NBCC Moncton, Canada'],
      ['[data-i="t4"]', 'Learns to break it properly · 2024 · BMM, intern to QA Engineer'],
      ['[data-i="t5"]', 'Verifies what regulators sign off on · 2026 · SQA Team Lead, 11 testers'],
      ['[data-i="t6"]', 'Certified, not just experienced · ISTQB CTFL, 2026'],
      ['[data-i="t7"]', 'Teaches the next QAs to think · Next chapter, Unflaky'],
      ['#specStatus', 'RUNNING'],
      ['[data-i="storyKicker"]', 'THE STORY · FIVE CHAPTERS, ONE THREAD'],
      ['[data-i="storyH2"]', 'Most testers learn to test. I learned everything around the test first.'],
      [
        '[data-i="storyBody"]',
        "Data taught me patterns. Code taught me where things hide. A new country taught me to start from zero. Put together, that is why I find the one bug that matters, not the thirty that don't.",
      ],
      ['[data-i="c1k"]', 'CHAPTER 01 · 2014 · THE PATTERN EYE'],
      ['[data-i="c1h"]', 'Before I tested software, I read numbers for a living.'],
      [
        '[data-i="c1b"]',
        'I started as a junior data analyst at Infoglobo, Grupo Globo, then moved to the Lojas Americanas group. Two years of dashboards and anomalies teaches you something no test course does: systems confess in their data first. The failure is usually visible in the numbers long before anyone files a bug.',
      ],
      ['[data-chapter="0"] .ch-line', 'SKILL ACQUIRED: Reading evidence before forming an opinion'],
      ['[data-i="c2k"]', 'CHAPTER 02 · 2017 · THE BUILDER YEARS'],
      ['[data-i="c2h"]', 'Then I spent four years on the other side of the bug report.'],
      [
        '[data-i="c2b"]',
        'As a full-stack developer at Brasil Center, I shipped Java, Spring Boot, React and Vue in production. I wrote the race conditions, the null pointers, the "works on my machine" deploys. So today, when I test, I\'m not guessing where software breaks. I\'ve lived there.',
      ],
      ['[data-chapter="1"] .ch-line', 'SKILL ACQUIRED: Knowing where developers hide the bodies'],
      ['[data-i="c3k"]', 'CHAPTER 03 · 2022 · THE RESTART'],
      ['[data-i="c3h"]', 'New country, new language at work, back to the classroom.'],
      [
        '[data-i="c3b"]',
        'I moved to Canada and studied IT Software Development at NBCC Moncton, graduating in 2024. Starting over in your thirties, in a second language, does one useful thing to a tester: it kills the fear of the unknown system. Every codebase is just another country. You learn its rules, then you test whether it follows them.',
      ],
      ['[data-chapter="2"] .ch-line', 'SKILL ACQUIRED: Walking into any system like I belong there'],
      ['[data-i="c4k"]', 'CHAPTER 04 · 2024 · BREAKING IT PROPERLY'],
      ['[data-i="c4h"]', 'An internship at BMM turned into the craft.'],
      [
        '[data-i="c4b"]',
        "I joined BMM Testlabs as an intern in April 2024 and was a QA Engineer by June. There I learned regulated testing: verify paytables, RTP and payouts against the math model, jurisdiction by jurisdiction. I automated with Playwright and Postman in CI and built an AI-assisted knowledge base to speed up root-cause analysis and catch duplicate defects before they wasted anyone's time.",
      ],
      ['[data-chapter="3"] .ch-line', 'RESULT: Promoted twice in two years'],
      ['[data-i="c5k"]', 'CHAPTER 05 · 2026 · THE VERIFICATION DESK'],
      ['[data-i="c5h"]', 'Now I lead the team that verifies what regulators will sign.'],
      [
        '[data-i="c5b"]',
        "Since May 2026 I lead 11 testers as SQA Team Lead. We verify around 15 casino games a month against the regulations of 10 jurisdictions, and when we find a problem, we send it back to the studio and work with them until it's right. That partnership loop, verify, report, re-verify, is the job. In 2026 I also passed the ISTQB CTFL, after two weeks of study. Next up: the CTAL Test Manager, coming soon.",
      ],
      ['[data-chapter="4"] .ch-line', 'LAST 6 MONTHS: 95% first-pass compliance · 98% on-time delivery'],
      ['[data-i="mKicker"]', 'HOW I WORK'],
      ['[data-i="mH2"]', 'A bug is a story with a missing chapter. My job is to find which one.'],
      ['[data-i="mLead"]', 'Four moves, in order, on every game and every system. The order matters more than the tools.'],
      ['[data-i="s1n"]', 'STEP 01'],
      ['[data-i="s1t"]', 'Read the rules first.'],
      ['[data-i="s1b"]', "The math model and the jurisdiction's regulation are the spec. If it isn't written there, it isn't a defect yet, it's a question."],
      ['[data-i="s2n"]', 'STEP 02'],
      ['[data-i="s2t"]', 'Follow the money.'],
      ['[data-i="s2b"]', 'Paytables, RTP, payouts. In regulated gaming, the defect that matters is the one that pays wrong. Test the happy path last.'],
      ['[data-i="s3n"]', 'STEP 03'],
      ['[data-i="s3t"]', 'Automate the repeatable.'],
      ['[data-i="s3b"]', 'Playwright and Postman suites in CI run the checks humans get bored with, so humans can spend their attention on judgement.'],
      ['[data-i="s4n"]', 'STEP 04'],
      ['[data-i="s4t"]', 'Report so it gets fixed.'],
      ['[data-i="s4b"]', 'Root cause, evidence, duplicate check against the knowledge base. A report a developer can act on in one read is a defect half-fixed.'],
      ['[data-i="calloutK"]', 'IMPORTANT DISTINCTION.'],
      [
        '[data-i="calloutB"]',
        "My team verifies. Compliance certifies. We don't approve or reject games for market, and we don't pretend to. We verify them against the rules and hand Compliance a result they can trust. Getting that boundary right is most of leadership in a regulated lab.",
      ],
      ['[data-i="evH2"]', "Don't take my word for it. Take the numbers."],
      ['[data-i="m1l"]', 'TESTERS LED AT BMM TESTLABS'],
      ['[data-i="m2l"]', 'JURISDICTIONS VERIFIED AGAINST'],
      ['[data-i="m3l"]', 'CASINO GAMES VERIFIED PER MONTH'],
      ['[data-i="m4l"]', 'FIRST-PASS COMPLIANCE, LAST 6 MONTHS'],
      ['[data-i="m5l"]', 'ON-TIME DELIVERY, LAST 6 MONTHS'],
      ['[data-i="ev1l"]', 'AUTOMATION'],
      ['[data-i="ev1h"]', 'Suites that run while I sleep.'],
      ['[data-i="ev1b"]', "Playwright and Postman checks wired into CI during my QA Engineer years, covering the repetitive verification so the team's eyes stay on edge cases and judgement calls."],
      ['[data-i="ev2l"]', 'KNOWLEDGE'],
      ['[data-i="ev2h"]', 'An AI-assisted defect memory.'],
      ['[data-i="ev2b"]', "A knowledge base that speeds up root-cause analysis and flags duplicate defects early, so studios don't get the same finding twice and testers don't re-investigate solved problems."],
      ['[data-i="ev3l"]', 'CERTIFICATION'],
      ['[data-i="ev3h"]', 'ISTQB CTFL, certified 2026.'],
      ['[data-i="ev3b"]', 'Passed after two weeks of study using a method I built for dry syllabi. CTAL Test Manager: coming soon, exam planned for 2027.'],
      ['[data-i="tbKicker"]', "TOOLBOX · WHAT'S ACTUALLY ON THE DESK"],
      ['[data-i="tb1"]', 'Playwright'],
      ['[data-i="tb2"]', 'Postman'],
      ['[data-i="tb3"]', 'Java'],
      ['[data-i="tb4"]', 'Spring Boot'],
      ['[data-i="tb5"]', 'React'],
      ['[data-i="tb6"]', 'Vue'],
      ['[data-i="tb7"]', 'CI Pipelines'],
      ['[data-i="tb8"]', 'Test Design (Copeland)'],
      ['[data-i="tb9"]', 'RTP / Paytable Verification'],
      ['[data-i="tb10"]', 'Root-Cause Analysis'],
      ['[data-i="tb11"]', 'AI-Assisted QA'],
      ['[data-i="tb12"]', 'Team Leadership'],
      ['[data-i="shKicker"]', 'FEATURED BUILD · WATCH THIS FIRST · ★ THE HIRE-ME PIECE'],
      ['[data-i="shH2"]', "Don't just read that I test. Watch the tool I built do it."],
      [
        '[data-i="shLead"]',
        "This is Unflaky, the QA tool I created. In the video I walk through what it does, how it thinks, and why I built it. If you watch one thing on this page, watch this. It's the clearest proof of how I work: I don't just find bugs, I build the system that finds them.",
      ],
      ['[data-i="facadeTop"]', 'unflaky · tool walkthrough'],
      ['[data-i="facadeBottom"]', '@UNFLAKY · YOUTUBE'],
      ['[data-i="playerCaption"]', 'unflaky · tool walkthrough · @UNFLAKY · YOUTUBE'],
      [
        '[data-i="playerDesc"]',
        'Unflaky in action: a QA team in a tool. See it read a product, create the tests, run them, and turn the result into a report a client can act on.',
      ],
      ['[data-i="agentsLabel"]', '6 AGENTS:'],
      ['[data-i="b1n"]', '01. PLANS'],
      ['[data-i="b1h"]', 'Reads the product first.'],
      ['[data-i="b1b"]', 'It analyses the repo and the product, then writes the test plan and test cases, using proven test-design techniques, not guesswork.'],
      ['[data-i="b2n"]', '02. CREATES & RUNS'],
      ['[data-i="b2h"]', 'Creates and runs the tests.'],
      ['[data-i="b2b"]', 'Functional, automation, API, regression and mobile/UI checks, the work of a full QA team, run by specialised agents.'],
      ['[data-i="b3n"]', '03. REPORTS'],
      ['[data-i="b3h"]', 'Delivers a report you can hire on.'],
      ['[data-i="b3b"]', 'The output is a clear, client-ready test report. It opens issues with evidence, and never quietly fixes code, testing stays honest and independent.'],
      [
        '[data-i="shQuote"]',
        '"This guy doesn\'t just test software. He had an idea for how testing should work, and he built it." That\'s the reaction this video is here to create, and it\'s why founders hire me to test SaaS, especially AI-built SaaS, before it breaks in production.',
      ],
      ['[data-i="shCta"]', 'Watch the video on YouTube (@unflaky)'],
      ['[data-i="nxKicker"]', 'THE NEXT CHAPTER · WRITING ITSELF NOW'],
      ['[data-i="nxH2"]', "The run doesn't end at my desk. Next, I teach QAs to think, not just to click."],
      [
        '[data-i="nxBody"]',
        "A junior once found 30 bugs in a day. I found 1, and mine was the only one that mattered. That gap isn't talent, it's thinking, and thinking can be taught. That's what I'm building next.",
      ],
      ['[data-i="x1w"]', '2027'],
      ['[data-i="x1h"]', 'Unflaky, Quality Lab.'],
      ['[data-i="x1b"]', 'A QA company focused on testing SaaS, especially AI-built SaaS, before it breaks in production.'],
      ['[data-i="x2w"]', 'WEEKLY'],
      ['[data-i="x2h"]', '@unflaky on YouTube.'],
      ['[data-i="x2b"]', 'QA in practice, leadership and automation, in Portuguese, for QAs who want to become senior, lead and freelance.'],
      ['[data-i="x3w"]', 'COMING SOON'],
      ['[data-i="x3h"]', 'CTAL Test Manager.'],
      ['[data-i="x3b"]', 'Incoming: the next certification after the CTFL, exam planned for 2027.'],
      ['[data-i="stamp"]', '✓ PASS'],
      ['[data-i="soH2"]', "Run complete. Let's verify yours before your users do."],
      [
        '[data-i="soBody"]',
        "If you're shipping software that has to be right, a game, a SaaS, an AI-built product one bad release away from losing its users, this is the conversation I have every day. Start it here.",
      ],
      ['[data-i="lkIn"]', '/IN/HERBERT-CUNHA'],
      ['[data-i="lkGh"]', '@HERBERTPH'],
      ['[data-i="lkYt"]', '@UNFLAKY'],
      ['[data-i="lkX"]', 'X @HERBERTBUILDS'],
      ['[data-i="foot"]', 'HERBERT PARASIO · SQA TEAM LEAD · DIEPPE, CANADA · EN PT ES FR · THE RUN ABOVE IS THE REAL TIMELINE, 2014–2026'],
    ];
    for (const [selector, expected] of expectText) {
      await expect(page.locator(selector), selector).toHaveText(expected);
    }
    await expect(page.locator('.agents')).toContainText(
      'QA MANAGER · FUNCTIONAL QA · AUTOMATION QA · API QA · REGRESSION QA · MOBILE / UI QA'
    );
    await expect(page.locator('#evidence .metric')).toHaveCount(5);
    await expect(page.locator('#evidence .ev-card')).toHaveCount(3);
  });

  test('TC-16 (AC-15): CTFL is certified and the forbidden wording stays out', async ({ page }) => {
    await openHome(page);
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

  test('TC-17 (AC-16): the evidence grid has five metrics and three cards', async ({ page }) => {
    await openHome(page);
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

  test('TC-18 (AC-17): the story shows 2014, 2017, 2022, 2024 and 2026', async ({ page }) => {
    await openHome(page);
    const story = await page.locator('#story').innerText();
    for (const year of ['2014', '2017', '2022', '2024', '2026']) {
      expect(story).toContain(year);
    }
  });

  test('TC-19 (AC-18): the sign-off links point where their labels promise', async ({ page }) => {
    await openHome(page);
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

  test('TC-20 (AC-19): every new-tab link keeps rel=noopener', async ({ page }) => {
    await openHome(page);
    const external = page.locator('a[target="_blank"]');
    const count = await external.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(external.nth(i)).toHaveAttribute('rel', /noopener/);
    }
  });

  test('TC-31 (AC-30): the page is typographic and only loads its origin and Google Fonts', async ({ page }) => {
    const hosts: string[] = [];
    page.on('request', (request) => {
      try {
        hosts.push(new URL(request.url()).host);
      } catch {
        /* ignore data: urls */
      }
    });
    await openHome(page);
    await expect(page.locator('img')).toHaveCount(0);
    const unexpected = hosts.filter((host) => host !== SELF_HOST && !FONT_HOSTS.includes(host));
    expect(unexpected).toEqual([]);
  });

  test('TC-32 (AC-31): the resume source and PDF carry the corrections', async ({ page, request }) => {
    const pdf = await request.get('/resume.pdf');
    expect(pdf.ok()).toBe(true);
    const body = await pdf.body();
    expect(body.subarray(0, 4).toString()).toBe('%PDF');
    expect(body.length).toBeGreaterThan(50_000);

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
    expect(text).not.toMatch(/\b(certify|certifies|approve|reject)\b/);
  });

  test('TC-33 (AC-32): CNAME and the deploy job are unchanged', async ({ request }) => {
    const cname = await request.get('/CNAME');
    expect(cname.ok()).toBe(true);
    expect((await cname.text()).trim()).toBe('herbertph.com');
    const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
    expect(workflow).toContain('branches: [main]');
    expect(workflow).toContain('needs: test');
    expect(workflow).toContain('path: .');
    expect(workflow).toContain("github.ref == 'refs/heads/main'");
  });
});

test.describe('i18n', () => {
  const languages = [
    { code: 'pt', button: 'PT', h1: /Toda release conta uma história/, title: /Líder de Equipe SQA/, certified: 'certificado em 2026' },
    { code: 'es', button: 'ES', h1: /Cada release cuenta una historia/, title: /Líder de Equipo SQA/, certified: 'certificado en 2026' },
    { code: 'fr', button: 'FR', h1: /Chaque release raconte une histoire/, title: /Chef d'équipe SQA/, certified: 'certifié en 2026' },
  ];

  test('TC-21 (AC-20): English is the default with the approved title', async ({ page }) => {
    await openHome(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Herbert Parasio · SQA Team Lead');
  });

  test('TC-22 (AC-21): switching language updates the page, html lang and URL', async ({ page }) => {
    await openHome(page);
    for (const lang of languages) {
      await page.getByRole('button', { name: lang.button, exact: true }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', lang.code);
      await expect(page.locator('h1')).toHaveText(lang.h1);
      await expect(page).toHaveTitle(lang.title);
      await expect(page).toHaveURL(new RegExp(`lang=${lang.code}`));
    }
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).not.toHaveURL(/lang=/);
  });

  test('TC-23 (AC-22): ?lang loads the page translated, including title and meta', async ({ page }) => {
    for (const lang of languages) {
      await page.goto(`/?lang=${lang.code}`);
      await expect(page.locator('html')).toHaveAttribute('lang', lang.code);
      await expect(page.locator('h1')).toHaveText(lang.h1);
      await expect(page).toHaveTitle(lang.title);
      const description = await page.getAttribute('meta[name="description"]', 'content');
      expect(description && description.length).toBeGreaterThan(40);
      const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
      const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');
      expect(ogTitle).toBe(await page.title());
      expect(ogDescription).toBe(description);
      await expect(page.locator('[data-i="x3b"]')).toContainText('2027');
    }
  });

  test('TC-24 (AC-23): an unknown language falls back to English', async ({ page }) => {
    await page.goto('/?lang=klingon');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveText(H1);
  });

  test('TC-25 (AC-24): every key renders and the protected terms stay untranslated', async ({ page }) => {
    for (const code of ['en', 'pt', 'es', 'fr']) {
      await page.goto(`/?lang=${code}`);
      const empty = await page.evaluate(() =>
        [...document.querySelectorAll('[data-i], [data-ihtml]')]
          .filter((el) => !el.textContent?.trim())
          .map((el) => (el as HTMLElement).dataset.i ?? (el as HTMLElement).dataset.ihtml)
      );
      expect(empty, `empty keys in ${code}`).toEqual([]);

      const text = await page.locator('body').innerText();
      for (const term of [
        'herbert.spec.ts',
        'BMM Testlabs',
        'NBCC',
        'ISTQB CTFL',
        'CTAL',
        'Unflaky',
        'QA MANAGER',
        'FUNCTIONAL QA',
        'AUTOMATION QA',
        'API QA',
        'REGRESSION QA',
        'MOBILE / UI QA',
      ]) {
        expect(text, `${term} should stay untranslated in ${code}`).toContain(term);
      }
      if (code !== 'en') {
        const h1 = await page.locator('h1').innerText();
        expect(h1, `h1 should be translated in ${code}`).not.toBe(H1);
        await expect(page.locator('[data-i="storyKicker"]')).not.toHaveText(
          'THE STORY · FIVE CHAPTERS, ONE THREAD'
        );
        await expect(page.locator('[data-i="mH2"]')).not.toHaveText(
          'A bug is a story with a missing chapter. My job is to find which one.'
        );
        await expect(page.locator('[data-i="soH2"]')).not.toHaveText(
          "Run complete. Let's verify yours before your users do."
        );
      }
    }
  });

  test('TC-26 (AC-25): the CTFL/CTAL wording holds in every language', async ({ page }) => {
    for (const code of ['en', 'pt', 'es', 'fr']) {
      await page.goto(`/?lang=${code}`);
      const text = (await page.locator('body').innerText()).toLowerCase();
      expect(text, `forbidden wording in ${code}`).not.toMatch(
        /scheduled|studying|agendado|estudando|em estudo/
      );
      const ctal = (await page.locator('[data-i="x3b"]').innerText()).toLowerCase();
      expect(ctal, `CTAL must not describe studying in ${code}`).not.toMatch(/study|studying|estud|étude/);
      expect(ctal).toContain('2027');
      expect(text).toContain('2026');
      expect(text).toContain('2027');
      if (code !== 'en') {
        expect(text, `certified phrase in ${code}`).toContain(
          languages.find((l) => l.code === code)!.certified
        );
      }
    }
  });
});

test.describe('layout, theme and accessibility', () => {
  test('TC-27 (AC-26): 390px has no horizontal scroll and the HUD fits', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page);
    expect(await horizontalOverflow(page)).toBe(false);

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

  test('TC-30 (AC-29): the HUD stays readable at a 200%-zoom width', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 800 });
    await openHome(page);
    const boxes = await page.evaluate(() => {
      const read = (sel: string) => {
        const el = document.querySelector(sel) as HTMLElement;
        const r = el.getBoundingClientRect();
        return {
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
          clippedX: el.scrollWidth > el.clientWidth + 1,
          clippedY: el.scrollHeight > el.clientHeight + 1,
        };
      };
      return { id: read('.hud-id'), count: read('#runCount'), langs: read('#langs') };
    });
    expect(boxes.id.left).toBeGreaterThanOrEqual(0);
    expect(boxes.langs.right).toBeLessThanOrEqual(640);
    expect(boxes.id.right).toBeLessThanOrEqual(boxes.count.left + 1);
    expect(boxes.count.right).toBeLessThanOrEqual(boxes.langs.left + 1);
    expect(boxes.id.clippedX || boxes.id.clippedY).toBe(false);
    expect(boxes.count.clippedX || boxes.count.clippedY).toBe(false);
    expect(boxes.langs.clippedX || boxes.langs.clippedY).toBe(false);
    expect(boxes.id.bottom).toBeLessThanOrEqual(boxes.langs.bottom + 1);
  });

  test('TC-36 (AC-26): 360px keeps the HUD and PASS card inside the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openHome(page);
    expect(await horizontalOverflow(page)).toBe(false);
    const boxes = await page.evaluate(() => {
      const read = (sel: string) => {
        const r = (document.querySelector(sel) as HTMLElement).getBoundingClientRect();
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width };
      };
      return { id: read('.hud-id'), count: read('#runCount'), langs: read('#langs') };
    });
    expect(boxes.id.right).toBeLessThanOrEqual(boxes.count.x + 1);
    expect(boxes.count.right).toBeLessThanOrEqual(boxes.langs.x + 1);
    expect(boxes.langs.right).toBeLessThanOrEqual(360);
    expect(boxes.id.y).toBeGreaterThanOrEqual(0);

    await scrollSectionToTop(page, 'signoff');
    await expect(page.locator('#passCard')).toHaveClass(/visible/);
    expect(await horizontalOverflow(page)).toBe(false);
    const card = await page.locator('#passCard').boundingBox();
    expect(card!.x + card!.width).toBeLessThanOrEqual(360);
    const links = page.locator('.pass-links a');
    await expect(links).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box!.x + box!.width, `link ${i} inside viewport`).toBeLessThanOrEqual(360);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      const overflow = await links.nth(i).evaluate((el) => el.scrollWidth > el.clientWidth + 1);
      expect(overflow, `link ${i} text overflow`).toBe(false);
    }
    const stamp = await page.locator('.stamp').boundingBox();
    expect(stamp!.x + stamp!.width).toBeLessThanOrEqual(360);
  });

  test('TC-37 (AC-26): 320px is the narrowest supported width without overflow', async ({ page }) => {
    for (const code of ['en', 'pt', 'es', 'fr']) {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(`/?lang=${code}`);
      expect(await horizontalOverflow(page), `horizontal scroll in ${code}`).toBe(false);
      const boxes = await page.evaluate(() => {
        const read = (sel: string) => {
          const r = (document.querySelector(sel) as HTMLElement).getBoundingClientRect();
          return { x: r.x, right: r.right, width: r.width };
        };
        return { id: read('.hud-id'), count: read('#runCount'), langs: read('#langs') };
      });
      expect(boxes.id.right, `id/count overlap in ${code}`).toBeLessThanOrEqual(boxes.count.x + 1);
      expect(boxes.count.right, `count/langs overlap in ${code}`).toBeLessThanOrEqual(boxes.langs.x + 1);
      expect(boxes.langs.right, `langs overflow in ${code}`).toBeLessThanOrEqual(321);
    }
  });

  test('TC-28 (AC-27): light tokens match the design system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await openHome(page);
    const tokens = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return Object.fromEntries(
        [
          '--paper',
          '--paper-2',
          '--ink',
          '--ink-soft',
          '--ink-faint',
          '--line',
          '--line-strong',
          '--green',
          '--green-bright',
          '--green-deep',
          '--brick',
          '--brick-soft',
          '--gold',
          '--card',
          '--panel',
          '--panel-ink',
          '--panel-faint',
          '--pass-bg',
          '--shadow',
          '--radius',
        ].map((key) => [key, s.getPropertyValue(key).trim()])
      );
    });
    expect(tokens).toMatchObject({
      '--paper': '#F6F1E7',
      '--paper-2': '#EFE7D8',
      '--ink': '#17130B',
      '--ink-soft': '#4A4234',
      '--ink-faint': '#7A6F5C',
      '--line': '#DCD0BA',
      '--line-strong': '#B9A888',
      '--green': '#1C4D2E',
      '--green-bright': '#2E7D46',
      '--green-deep': '#10281A',
      '--brick': '#BC4B1F',
      '--brick-soft': '#F3D9C8',
      '--gold': '#C79A3B',
      '--card': '#FFFDF7',
      '--panel': '#17130B',
      '--panel-ink': '#F2EBDA',
      '--panel-faint': '#A99F88',
      '--pass-bg': '#1C4D2E',
      '--shadow': '0 18px 40px rgba(23, 19, 11, .10)',
      '--radius': '14px',
    });
  });

  test('TC-28 (AC-27): dark tokens match the design system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await openHome(page);
    const tokens = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return Object.fromEntries(
        [
          '--paper',
          '--paper-2',
          '--ink',
          '--ink-soft',
          '--ink-faint',
          '--line',
          '--line-strong',
          '--green',
          '--green-bright',
          '--green-deep',
          '--brick',
          '--brick-soft',
          '--gold',
          '--card',
          '--panel',
          '--panel-ink',
          '--panel-faint',
          '--pass-bg',
          '--shadow',
        ].map((key) => [key, s.getPropertyValue(key).trim()])
      );
    });
    expect(tokens).toMatchObject({
      '--paper': '#14110B',
      '--paper-2': '#1B1710',
      '--ink': '#F0E9D8',
      '--ink-soft': '#C9BFA9',
      '--ink-faint': '#948A74',
      '--line': '#332C1E',
      '--line-strong': '#55492F',
      '--green': '#7FC493',
      '--green-bright': '#9AD6AC',
      '--green-deep': '#0C1F13',
      '--brick': '#E88A5F',
      '--brick-soft': '#3A2317',
      '--gold': '#D9B45F',
      '--card': '#1E1A12',
      '--panel': '#0D0B07',
      '--panel-ink': '#F2EBDA',
      '--panel-faint': '#8E8471',
      '--pass-bg': '#1E5C36',
      '--shadow': '0 18px 40px rgba(0, 0, 0, .45)',
    });
  });

  test('TC-29 (AC-28): keyboard focus is visible on HUD, CTA and facade', async ({ page }, testInfo) => {
    await openHome(page);

    if (testInfo.project.name === 'mobile') {
      // WebKit/Safari keeps links out of the default Tab order unless the OS enables
      // full keyboard access; form controls are tabbable. Cover the four HUD buttons
      // with Tab and the two links with programmatic focus (same focus-visible path).
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Tab');
        const button = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el) return null;
          const style = getComputedStyle(el);
          return {
            tag: el.tagName,
            outlineStyle: style.outlineStyle,
            outlineWidth: parseFloat(style.outlineWidth),
            focusVisible: el.matches(':focus-visible'),
          };
        });
        expect(button, 'Tab should reach the four language buttons').toBeTruthy();
        expect(button!.outlineStyle).not.toBe('none');
        expect(button!.outlineWidth).toBeGreaterThan(0);
        expect(button!.focusVisible).toBe(true);
      }
      for (const [selector, offset] of [
        ['#videoFacade', '-6px'],
        ['.cta', '3px'],
      ] as const) {
        await page.locator(selector).focus();
        const link = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el) return null;
          const style = getComputedStyle(el);
          return {
            outlineStyle: style.outlineStyle,
            outlineWidth: parseFloat(style.outlineWidth),
            outlineOffset: style.outlineOffset,
            focusVisible: el.matches(':focus-visible'),
          };
        });
        expect(link, `focus should reach ${selector}`).toBeTruthy();
        expect(link!.outlineStyle).not.toBe('none');
        expect(link!.outlineWidth).toBeGreaterThan(0);
        expect(link!.outlineOffset).toBe(offset);
        expect(link!.focusVisible).toBe(true);
      }
      return;
    }

    let facadeFocus: { outlineStyle: string; outlineWidth: number; outlineOffset: string } | null = null;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        return {
          tag: el.tagName,
          id: el.id,
          className: typeof el.className === 'string' ? el.className : '',
          outlineStyle: style.outlineStyle,
          outlineWidth: parseFloat(style.outlineWidth),
          outlineOffset: style.outlineOffset,
          focusVisible: el.matches(':focus-visible'),
        };
      });
      if (!focused) continue;
      expect(focused.outlineStyle, `outline style on ${focused.tag}#${focused.id}`).not.toBe('none');
      expect(focused.outlineWidth, `outline width on ${focused.tag}#${focused.id}`).toBeGreaterThan(0);
      expect(focused.focusVisible, `focus-visible on ${focused.tag}#${focused.id}`).toBe(true);
      if (focused.id === 'videoFacade') {
        facadeFocus = focused;
        break;
      }
    }
    expect(facadeFocus, 'Tab should reach the video facade').toBeTruthy();
    expect(facadeFocus!.outlineOffset).toBe('-6px');

    await page.keyboard.press('Tab');
    const ctaFocus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const style = getComputedStyle(el);
      return {
        className: typeof el.className === 'string' ? el.className : '',
        outlineStyle: style.outlineStyle,
        outlineWidth: parseFloat(style.outlineWidth),
        outlineOffset: style.outlineOffset,
      };
    });
    expect(ctaFocus, 'Tab should reach the CTA').toBeTruthy();
    expect(ctaFocus!.className).toContain('cta');
    expect(ctaFocus!.outlineStyle).not.toBe('none');
    expect(ctaFocus!.outlineWidth).toBeGreaterThan(0);
    expect(ctaFocus!.outlineOffset).toBe('3px');
  });

  test('TC-38 (AC-5/AC-21): rapid language changes preserve the run state', async ({ page }) => {
    await openHome(page);
    await scrollToBottom(page);
    await expect(page.locator('#specList .spec-item.passed')).toHaveCount(7);
    await page.evaluate(() => {
      for (const code of ['pt', 'es', 'fr', 'en']) {
        (document.querySelector(`#langs button[data-lang="${code}"]`) as HTMLElement).click();
      }
    });
    await expect(page.locator('#specList .spec-item.passed')).toHaveCount(7);
    await expect(page.locator('#specList .spec-item.pending')).toHaveCount(0);
    await expect(page.locator('#runCount')).toHaveText('7 / 7 PASSED');
    await expect(page.locator('#specStatus')).toContainText('ALL PASSING');
  });

  test('TC-39 (FR-2/FR-7): the keyboard activates the embed and focus moves to the frame', async ({ page, context }, testInfo) => {
    await context.route('https://www.youtube-nocookie.com/**', (route) =>
      route.fulfill({ status: 200, body: 'ok' })
    );
    await openHome(page);
    if (testInfo.project.name === 'mobile') {
      // WebKit/Safari keeps links out of the default Tab order unless the OS enables
      // full keyboard access; focus the link directly and activate it from the keyboard.
      await page.locator('#videoFacade').focus();
    } else {
      let reached = false;
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => ({
          id: (document.activeElement as HTMLElement | null)?.id ?? '',
        }));
        if (focused.id === 'videoFacade') {
          reached = true;
          break;
        }
      }
      expect(reached, 'Tab should reach the facade').toBe(true);
    }
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const style = getComputedStyle(el);
      return {
        id: el.id,
        outlineWidth: parseFloat(style.outlineWidth),
        focusVisible: el.matches(':focus-visible'),
      };
    });
    expect(focused?.id).toBe('videoFacade');
    expect(focused!.outlineWidth).toBeGreaterThan(0);
    expect(focused!.focusVisible).toBe(true);

    await page.keyboard.press('Enter');
    const frame = page.locator('#showcase iframe');
    await expect(frame).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/XVhTas9QSIo?autoplay=1'
    );
    await expect(page.locator('#videoFacade')).toHaveCount(0);
    await expect(frame).toBeFocused();
  });
});

test.describe('boundary and exploratory checks', () => {
  test('TC-34 (AC-1): a tall viewport must still open at RUN 0/7', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'explicit desktop viewports are used here');
    const sizes = [
      [2560, 1440],
      [1024, 1366],
      [3840, 2160],
    ];
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await openHome(page);
      await page.waitForTimeout(500);
      const state = await page.evaluate(() => ({
        count: document.getElementById('runCount')?.textContent ?? '',
        passed: [...document.querySelectorAll('#specList .spec-item.passed')].map(
          (el) => (el as HTMLElement).dataset.test
        ),
        scrollY: window.scrollY,
      }));
      expect
        .soft(state.scrollY, `${width}x${height} should be at the top`)
        .toBe(0);
      expect
        .soft(state.count, `${width}x${height} should open at RUN 0/7 (passed: ${state.passed.join(', ') || 'none'})`)
        .toBe('RUN 0/7');
    }
  });

  test('TC-35 (FR-15/FR-17): the player is 16:9 and sticky above 920px without covering the HUD', async ({ page, context }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'explicit viewports are used here');
    for (const [width, height] of [
      [921, 900],
      [1280, 900],
      [1280, 400],
    ]) {
      await page.setViewportSize({ width, height });
      await openHome(page);
      await expect(page.locator('.show-player')).toHaveCSS('position', 'sticky');
      await page.evaluate(() => {
        const el = document.getElementById('showcase') as HTMLElement;
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY + 650,
          behavior: 'instant',
        });
      });
      await page.waitForTimeout(100);
      const state = await page.evaluate(() => {
        const player = document.querySelector('.show-player')!.getBoundingClientRect();
        const copy = document.querySelector('.show-copy')!.getBoundingClientRect();
        const hud = document.querySelector('.hud')!.getBoundingClientRect();
        return {
          playerTop: player.top,
          playerBottom: player.bottom,
          playerRight: player.right,
          copyLeft: copy.left,
          hudBottom: hud.bottom,
        };
      });
      expect(state.playerTop, `${width}x${height} player must not cover the HUD`).toBeGreaterThanOrEqual(
        state.hudBottom - 1
      );
      expect(state.playerTop, `${width}x${height} player should stick at hud + 20`).toBeLessThanOrEqual(
        state.hudBottom + 21
      );
      expect(state.playerRight, `${width}x${height} columns must not overlap`).toBeLessThanOrEqual(
        state.copyLeft + 1
      );
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page);
    expect(await horizontalOverflow(page)).toBe(false);
    const facade = await page.locator('#videoFacade').boundingBox();
    expect(facade!.x + facade!.width).toBeLessThanOrEqual(390);

    await context.route('https://www.youtube-nocookie.com/**', (route) =>
      route.fulfill({ status: 200, body: 'ok' })
    );
    await page.addInitScript(() => {
      (window as unknown as { UNFLAKY_VIDEO_ID: string }).UNFLAKY_VIDEO_ID = 'abc123';
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page);
    await page.locator('#videoFacade').click();
    const embed = await page.locator('.video-embed').boundingBox();
    expect(embed).toBeTruthy();
    expect(Math.abs(embed!.width / embed!.height - 16 / 9)).toBeLessThan(0.02);
  });
});
