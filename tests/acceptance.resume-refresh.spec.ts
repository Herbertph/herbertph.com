import { test, expect, Page } from '@playwright/test';

const ROLE = 'Senior QA Analyst | ISTQB CTFL Certified — Game QA, Test Automation & AI-Assisted Testing';
const CONTACT =
  'Moncton, New Brunswick, Canada | Open to relocation to British Columbia | (506) 897-4188 | herbert.parasio@gmail.com | herbertph.com | linkedin.com/in/herbert-cunha | github.com/Herbertph';
const SUMMARY =
  'I test games for a living and automate the parts that repeat. I lead a team of 11 testers at a global game certification lab, where we put around 15 casino titles a month through manual, exploratory and regression testing across desktop and mobile, and every bug report has to be clear enough for a client studio to reproduce without a call. I build automated checks in Playwright that run in CI on every build, and I build AI tooling for QA: a tool at work that surfaces past root causes and flags likely duplicate bug reports, and on my own time Unflaky, a working pipeline of AI QA agents that plans, writes and runs tests (including Playwright automation) and reports release readiness, so I care less about AI hype and more about which tools actually save testers time. Before QA I spent four years as a developer, and I script in C#, Python and JavaScript. ISTQB CTFL certified.';
const BMM_COMPANY =
  'BMM Testlabs — Global testing and certification lab for the gaming industry: 500+ employees across 13+ countries, testing casino games and gaming systems for studios worldwide.';
const BRASIL_COMPANY =
  'BPO and telecom services company, ~3,000 employees, supporting customer service and analytics for major Brazilian telecoms.';

const JOBS = [
  {
    title: 'SQA Team Lead',
    dates: '05/2026 — Present',
    org: 'BMM Testlabs — Dieppe, Canada',
    tags: 'Game testing · Build verification · Bug triage · Quality metrics · JIRA · Confluence · Playwright',
    bullets: 7,
    key: 'Held a 95% first-pass compliance rate and 98% on-time delivery',
  },
  {
    title: 'QA Engineer',
    dates: '06/2024 — 05/2026',
    org: 'BMM Testlabs — Moncton, Canada',
    tags: 'Playwright · JavaScript · TypeScript · Postman · GitHub Actions · Node.js · Docker · SQL · JIRA',
    bullets: 6,
    key: 'Tested casino and slot games through the full verification cycle',
  },
  {
    title: 'Quality Assurance Intern',
    dates: '04/2024 — 06/2024',
    org: 'BMM Testlabs — Moncton, Canada',
    tags: '',
    bullets: 1,
    key: 'Supported game testing and built foundations in test design',
  },
  {
    title: 'Full Stack Developer',
    dates: '08/2017 — 07/2021',
    org: 'Brasil Center Comunicações — Rio de Janeiro, Brazil',
    tags: 'Java · Spring Boot · React · Vue.js · MySQL · Docker · GitHub Actions · Git',
    bullets: 2,
    key: 'Designed, developed, tested and maintained 5+ internal web applications',
  },
  {
    title: 'Data Analyst',
    dates: '08/2016 — 08/2017',
    org: 'Seller Magazine (Lojas Americanas Group) — Rio de Janeiro, Brazil',
    tags: 'Python · PostgreSQL · SQL Server · Tableau',
    bullets: 1,
    key: 'Wrote Python and SQL analysis and Tableau dashboards',
  },
  {
    title: 'Jr. Data Analyst',
    dates: '08/2014 — 08/2016',
    org: 'Infoglobo (Grupo Globo) — Rio de Janeiro, Brazil',
    tags: 'Python · PL/SQL · VBA',
    bullets: 1,
    key: 'Automated reporting workflows in Python over datasets of 500K+ records',
  },
  {
    title: 'Unflaky Quality Lab — AI QA agent pipeline',
    dates: 'Working',
    org: 'unflakyqa.com',
    tags: 'Multi-agent LLM pipeline · Playwright · API testing · Cross-device UI testing · Release reporting',
    bullets: 3,
    key: 'Built a QA pipeline of six specialised AI agents',
  },
  {
    title: 'Lamp — AI agent team for software delivery',
    dates: 'Working',
    org: 'in daily use',
    tags: 'Claude Code · OpenCode · Multi-model agent orchestration · GitHub branches, PRs and issues',
    bullets: 1,
    key: 'Built the agent framework Unflaky runs on',
  },
];

async function openResume(page: Page) {
  await page.goto('/resume/resume.html');
}

async function bodyText(page: Page) {
  return page.locator('body').innerText();
}

test.describe('resume content', () => {
  test('TC-1 (AC-1): section order and key content match the spec', async ({ page }) => {
    await openResume(page);
    const order = await page.evaluate(() =>
      [...document.querySelectorAll('h2, .job-title')].map((el) => el.textContent?.trim() ?? '')
    );
    expect(order).toEqual([
      'Experience',
      'SQA Team Lead',
      'QA Engineer',
      'Quality Assurance Intern',
      'Full Stack Developer',
      'Data Analyst',
      'Jr. Data Analyst',
      'AI Tooling Projects',
      'Unflaky Quality Lab — AI QA agent pipeline',
      'Lamp — AI agent team for software delivery',
      'Skills',
      'Education & Certification',
    ]);

    await expect(page.locator('.role')).toHaveText(ROLE);
    await expect(page.locator('.summary')).toHaveText(SUMMARY);
    await expect(page.locator('.company')).toHaveCount(2);
    await expect(page.locator('.company').nth(0)).toHaveText(BMM_COMPANY);
    await expect(page.locator('.company').nth(1)).toHaveText(BRASIL_COMPANY);

    const contact = (await page.locator('.contact').innerText())
      .replace(/\r?\n/g, ' | ')
      .replace(/\s+/g, ' ')
      .trim();
    expect(contact).toBe(CONTACT);

    const jobs = page.locator('.job');
    await expect(jobs).toHaveCount(JOBS.length);
    for (let i = 0; i < JOBS.length; i++) {
      const job = jobs.nth(i);
      const expected = JOBS[i];
      await expect(job.locator('.job-title'), `job ${i} title`).toHaveText(expected.title);
      await expect(job.locator('.job-dates'), `job ${i} dates`).toHaveText(expected.dates);
      await expect(job.locator('.job-org'), `job ${i} org`).toHaveText(expected.org);
      if (expected.tags) {
        await expect(job.locator('.job-tags'), `job ${i} tags`).toHaveText(expected.tags);
      } else {
        await expect(job.locator('.job-tags'), `job ${i} should have no tag line`).toHaveCount(0);
      }
      await expect(job.locator('li'), `job ${i} bullet count`).toHaveCount(expected.bullets);
      await expect(job.locator('li').first(), `job ${i} key bullet`).toContainText(expected.key);
    }

    const skillLabels = await page.locator('.skills dt').allTextContents();
    expect(skillLabels).toEqual([
      'Game QA',
      'Automation & AI',
      'Scripting',
      'Tools',
      'Leadership',
      'Languages',
    ]);
    const skillValues = page.locator('.skills dd');
    await expect(skillValues.nth(0)).toContainText('Manual and exploratory game testing');
    await expect(skillValues.nth(0)).toContainText('Mobile testing on iOS and Android');
    await expect(skillValues.nth(1)).toContainText('Multi-agent LLM tooling (Claude Code, OpenCode)');
    await expect(skillValues.nth(2)).toContainText('C# · Python · JavaScript · TypeScript · SQL');
    await expect(skillValues.nth(3)).toContainText('JIRA · Confluence · Git · Docker · Agile / Scrum');
    await expect(skillValues.nth(4)).toContainText('Onboarding and mentoring testers (team of 11)');
    await expect(skillValues.nth(5)).toContainText('English (fluent) · Portuguese (native)');

    const education = page.locator('.edu-row');
    await expect(education).toHaveCount(4);
    await expect(education.nth(0).locator('.what')).toHaveText('ISTQB Certified Tester, Foundation Level (CTFL)');
    await expect(education.nth(0).locator('.where')).toHaveText('ISTQB · certified 2026');
    await expect(education.nth(1).locator('.what')).toHaveText(
      'ISTQB Certified Tester, Advanced Level Test Manager (CTAL-TM)'
    );
    await expect(education.nth(1).locator('.where')).toHaveText('coming soon, exam planned for 2027');
    await expect(education.nth(2).locator('.what')).toHaveText('Information Technology: Software Development');
    await expect(education.nth(2).locator('.where')).toHaveText('New Brunswick Community College, Moncton, NB');
    await expect(education.nth(2).locator('.when')).toHaveText('2022 — 2024');
    await expect(education.nth(3).locator('.what')).toHaveText('Management Process');
    await expect(education.nth(3).locator('.where')).toHaveText(
      'Universidade Salgado de Oliveira, Rio de Janeiro, Brazil'
    );
    await expect(education.nth(3).locator('.when')).toHaveText('2010 — 2012');
  });

  test('TC-2 (AC-2): the required facts are present', async ({ page }) => {
    await openResume(page);
    const text = await bodyText(page);
    for (const fact of [
      'Senior QA Analyst',
      'SQA Team Lead',
      '11 testers',
      '95% first-pass compliance',
      '98%',
      'certified 2026',
      'CTAL',
      '2027',
      'linkedin.com/in/herbert-cunha',
      'BMM Testlabs',
    ]) {
      expect(text, fact).toContain(fact);
    }
  });

  test('TC-3 (AC-3): legacy and forbidden wording is gone', async ({ page }) => {
    await openResume(page);
    const text = await bodyText(page);
    expect(text).not.toContain('approval rate');
    expect(text).not.toContain('full certification cycle');
    expect(text).not.toContain('BMM Test Labs');
    expect(text.toLowerCase()).not.toContain('scheduled');
    expect(text.toLowerCase()).not.toContain('studying');
    expect(text).not.toMatch(/\b(certify|certifies|approve|reject)\b/);
  });

  test('TC-4 (AC-4): certification lab appears only in the two allowed descriptions', async ({ page }) => {
    await openResume(page);
    const text = await bodyText(page);
    expect(text.match(/certification lab/gi) ?? []).toHaveLength(2);
    await expect(page.locator('.summary')).toContainText('global game certification lab');
    await expect(page.locator('.company').nth(0)).toContainText(
      'Global testing and certification lab for the gaming industry'
    );
  });

  test('TC-6 (AC-6): the links point to the approved destinations', async ({ page, request }) => {
    await openResume(page);
    const headerLinks = page.locator('.contact a');
    await expect(headerLinks).toHaveCount(4);
    const hrefs = await headerLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(hrefs).toEqual([
      'mailto:herbert.parasio@gmail.com',
      'https://herbertph.com',
      'https://linkedin.com/in/herbert-cunha',
      'https://github.com/Herbertph',
    ]);
    const projectLink = page.locator('.job-org a');
    await expect(projectLink).toHaveCount(1);
    await expect(projectLink).toHaveText('unflakyqa.com');
    await expect(projectLink).toHaveAttribute('href', 'https://unflakyqa.com');
    await expect(page.locator('a[href="https://github.com"]')).toHaveCount(0);

    const pdf = await request.get('/resume.pdf');
    const raw = (await pdf.body()).toString('latin1');
    for (const uri of [
      'mailto:herbert.parasio@gmail.com',
      'https://herbertph.com/',
      'https://linkedin.com/in/herbert-cunha',
      'https://github.com/Herbertph',
      'https://unflakyqa.com/',
    ]) {
      expect(raw, uri).toContain(uri);
    }
  });

  test('TC-9 (AC-9): the resume is still served at /resume.pdf', async ({ request }) => {
    const response = await request.get('/resume.pdf');
    expect(response.ok()).toBe(true);
    expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF');
  });

  test('TC-11 (AC-1/FR-3): the four approved edits are applied', async ({ page }) => {
    await openResume(page);
    const text = await bodyText(page);
    expect(text).toContain('95% first-pass compliance rate');
    expect(text).not.toContain('95% first-pass approval rate');
    expect(text).toContain('through the full verification cycle');
    expect(text).not.toContain('through the full certification cycle');
    expect(text).toContain('ISTQB Certified Tester, Advanced Level Test Manager (CTAL-TM)');
    expect(text).toContain('coming soon, exam planned for 2027');
    expect(text).toContain('BMM Testlabs');
    expect(text).not.toContain('BMM Test Labs');

    const ctal = page.locator('.edu-row').nth(1);
    await expect(ctal.locator('.what')).toHaveText(
      'ISTQB Certified Tester, Advanced Level Test Manager (CTAL-TM)'
    );
    await expect(ctal.locator('.where')).toHaveText('coming soon, exam planned for 2027');
  });
});

test.describe('PDF artifact', () => {
  test('TC-5 (AC-5): the PDF is a two-page Letter artifact', async ({ request }) => {
    const response = await request.get('/resume.pdf');
    expect(response.ok()).toBe(true);
    const body = await response.body();
    expect(body.length).toBeGreaterThan(90_000);
    expect(body.subarray(0, 4).toString()).toBe('%PDF');
    const raw = body.toString('latin1');
    expect(raw.match(/\/Type\s*\/Page[^s]/g) ?? []).toHaveLength(2);
    expect(raw).toMatch(/\/MediaBox\s*\[0 0 612 792\]/);
    expect(raw).toContain('/Creator');
  });
});

test.describe('print layout', () => {
  test('TC-7 (AC-7): the two pages fit without orphan headings or cut lines', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1400 });
    await openResume(page);
    const pages = page.locator('.page');
    await expect(pages).toHaveCount(2);
    const boxes = await pages.evaluateAll((els) =>
      els.map((el) => {
        const box = el.getBoundingClientRect();
        return { width: box.width, height: box.height };
      })
    );
    for (const box of boxes) {
      expect(Math.round(box.width), 'Letter width at 96dpi').toBe(816);
      expect(Math.round(box.height), 'Letter minimum height at 96dpi').toBe(1056);
    }

    const headings = page.locator('h2');
    await expect(headings).toHaveCount(4);
    const headingData = await headings.evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent?.trim() ?? '',
        nextText: (el.nextElementSibling as HTMLElement | null)?.innerText?.trim() ?? '',
      }))
    );
    for (const heading of headingData) {
      expect(heading.text.length, 'heading text').toBeGreaterThan(0);
      expect(heading.nextText.length, `content after ${heading.text}`).toBeGreaterThan(0);
    }

    const pageTitles = await pages.evaluateAll((els) =>
      els.map((el) => [...el.querySelectorAll('.job-title')].map((title) => title.textContent?.trim() ?? ''))
    );
    expect(pageTitles[0]).toEqual([
      'SQA Team Lead',
      'QA Engineer',
      'Quality Assurance Intern',
      'Full Stack Developer',
    ]);
    expect(pageTitles[1]).toEqual([
      'Data Analyst',
      'Jr. Data Analyst',
      'Unflaky Quality Lab — AI QA agent pipeline',
      'Lamp — AI agent team for software delivery',
    ]);

    const layout = await pages.evaluateAll((els) =>
      els.map((el) => {
        const footer = el.querySelector('.foot') as HTMLElement;
        const footerBox = footer.getBoundingClientRect();
        const contentBoxes = [
          ...el.querySelectorAll('.summary, .company, .job, .skills, .edu-row, h2'),
        ].map((content) => content.getBoundingClientRect().bottom);
        const pageBox = el.getBoundingClientRect();
        return {
          contentBottom: Math.max(...contentBoxes),
          footerTop: footerBox.top,
          footerBottom: footerBox.bottom,
          pageTop: pageBox.top,
          pageBottom: pageBox.bottom,
        };
      })
    );
    for (const item of layout) {
      expect(item.contentBottom, 'content must not overlap the footer').toBeLessThan(item.footerTop);
      expect(item.footerTop).toBeGreaterThanOrEqual(item.pageTop);
      expect(item.footerBottom).toBeLessThanOrEqual(item.pageBottom + 1);
    }
  });

  test('TC-10 (FR-4/handoff): the headline is larger and the contact wrap has no orphan pipe', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1400 });
    await openResume(page);
    const role = page.locator('.role');
    await expect(role).toHaveText(ROLE);
    const roleMetrics = await role.evaluate((el) => ({
      fontSize: parseFloat(getComputedStyle(el).fontSize),
      height: el.getBoundingClientRect().height,
    }));
    expect(roleMetrics.fontSize, '10.2pt headline').toBeGreaterThanOrEqual(13.6);
    expect(roleMetrics.height, 'headline should stay on one line').toBeLessThan(30);

    const contact = page.locator('.contact');
    const lines = (await contact.innerText())
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/herbertph\.com$/);
    expect(lines[1]).toMatch(/^linkedin\.com\/in\/herbert-cunha/);
    for (const line of lines) {
      expect(line.startsWith('|'), `orphan pipe at line start: ${line}`).toBe(false);
      expect(line.endsWith('|'), `orphan pipe at line end: ${line}`).toBe(false);
    }
    await expect(page.locator('.contact br')).toHaveCount(1);

    const pageBox = await page.locator('.page').first().boundingBox();
    const contactBox = await contact.boundingBox();
    expect(contactBox).toBeTruthy();
    expect(pageBox).toBeTruthy();
    const contentRight = pageBox!.x + pageBox!.width - 52; // .55in padding
    expect(contactBox!.x + contactBox!.width).toBeLessThanOrEqual(contentRight + 1);
  });

  test('TC-12 (AC-7): both pages carry the footer without clipping', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1400 });
    await openResume(page);
    const footers = page.locator('.foot');
    await expect(footers).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const text = await footers.nth(i).innerText();
      expect(text, `footer ${i + 1} name`).toMatch(/HERBERT PARASIO/i);
      expect(text, `footer ${i + 1} site`).toMatch(/HERBERTPH\.COM/i);
    }
    const positions = await footers.evaluateAll((els) =>
      els.map((el) => {
        const box = el.getBoundingClientRect();
        const pageBox = (el.closest('.page') as HTMLElement).getBoundingClientRect();
        return { top: box.top, bottom: box.bottom, pageTop: pageBox.top, pageBottom: pageBox.bottom };
      })
    );
    for (const position of positions) {
      expect(position.top).toBeGreaterThanOrEqual(position.pageTop);
      expect(position.bottom).toBeLessThanOrEqual(position.pageBottom + 1);
    }
  });
});
