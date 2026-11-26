# herbertph.com

Personal SQA portfolio. Single static page, no build step: the page runs as a test
run of seven tests that pass as you scroll.

## Local

    npm install
    npx playwright install chromium webkit
    npm run dev      # http://127.0.0.1:4173
    npm test         # Playwright suite (chromium + iPhone 13)

Tests always run against port 4173. The suite covers both projects, so a change is
only done when `npm test` is green.

## Resume

`resume.pdf` is generated from `resume/resume.html`:

    npm run resume

The source is plain HTML/CSS and is printed with Playwright (`page.pdf`). Commit both
the source and the regenerated PDF.

## Screenshots

    npm run screenshots

Writes desktop and mobile, light and dark captures to
`docs/screenshots/homepage-test-run/` (served on port 4174, separate from the tests).

## Pipeline

Every push to `main` runs the Playwright suite against an ephemeral local
server, and only deploys to GitHub Pages if the suite passes. Pull requests
run the suite without deploying.

## Setup once

1. Push this repo to GitHub.
2. Settings → Pages → Source: **GitHub Actions**.
3. Settings → Pages → Custom domain: `herbertph.com`.
4. At the domain registrar, point the apex `A` records to GitHub Pages
   (185.199.108–111.153) and `www` as a `CNAME` to `<user>.github.io`.
