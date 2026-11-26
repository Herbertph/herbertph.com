# CLAUDE.md

Guidance for agents and contributors working in this repository (herbertph.com).

## What this is

Herbert Parasio's single-page portfolio: a static `index.html` written as a test run
of seven tests. No framework, no bundler, no build step. Playwright is the only
dependency, plus GitHub Pages for hosting.

## Stack

- HTML + CSS + vanilla JS, all inline in `index.html`.
- Google Fonts (Newsreader, Archivo, IBM Plex Mono) via a single `<link>`.
- Playwright (`@playwright/test`) for end-to-end tests: chromium + iPhone 13.
- `serve` (via `npx`) serves the repo root during tests.
- Deploy: `.github/workflows/deploy.yml` runs the suite, then publishes to GitHub Pages.

## Commands

    npm install          # install @playwright/test
    npx playwright install chromium webkit
    npm run dev          # http://127.0.0.1:4173
    npm test             # full suite (chromium + mobile)
    npx playwright test --project=chromium   # faster local loop
    npm run test:ui      # Playwright UI mode
    npm run report       # open the last HTML report
    npm run resume       # rebuild resume.pdf from resume/resume.html
    npm run screenshots  # refresh docs/screenshots/homepage-test-run/

Ports: tests always use **4173** (bound to `127.0.0.1`). Never use 4545 (the Lamp
process). The screenshot script uses 4174.

## Structure

    index.html                     the page: styles, markup, i18n dictionary, JS
    resume/resume.html             printable source of resume.pdf
    resume.pdf                     generated artifact (commit it)
    scripts/build-resume.mjs       Playwright print step for the resume
    scripts/screenshots.mjs        desktop/mobile × light/dark review shots
    tests/portfolio.spec.ts        acceptance suite (AC-1…AC-32 coverage)
    playwright.config.ts           webServer on 4173, chromium + mobile projects
    docs/specs/                    approved spec and PDF (read-only)
    docs/screenshots/              committed review screenshots
    CNAME                          custom domain — do not touch

## Conventions

- **Copy is verbatim.** The English copy in `docs/specs/homepage-test-run.source.pdf`
  is the source of truth. Never rewrite it; changes go back to Herbert.
- **i18n:** every visible string has `data-i` (or `data-ihtml`), with its own key in
  `en`, `pt`, `es`, `fr`. No empty key in any language. `?lang=` sets the language;
  unknown languages fall back to English; EN is the default and removes the param.
- **Words:** Herbert's team *verifies*; Compliance *certifies*. Never describe the
  team as certifying, approving or rejecting games. CTFL is certified in 2026; CTAL is
  only "coming soon"/"incoming" (exam planned 2027) — never "studying".
- **Design tokens:** use only the CSS variables in `:root` (light + dark from
  `prefers-color-scheme`). 100% typographic: no images, no icon fonts.
- **Dependencies:** do not add any. All behaviour is vanilla JS with
  IntersectionObserver / requestAnimationFrame.
- **Tests:** keep `npm test` green on both projects. Never edit QA's acceptance tests
  or the spec to make a test pass; fix the page.
- **Commits:** Conventional Commits, small and logical. Work on a feature branch;
  never push to `main`.
- Read-only: `docs/specs/`, `docs/test-cases/`, `docs/test-reports/`, `CNAME`, and the
  deploy job (beyond what new tests need).
