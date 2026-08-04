# herbertph.com

Personal QA portfolio. Single static page, no build step.

## Local

    npm install
    npm run dev      # http://127.0.0.1:4173
    npm test         # Playwright suite

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
