// Regenerates resume.pdf from resume/resume.html.
// Usage: npm run resume
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = new URL('..', import.meta.url);
const source = new URL('resume/resume.html', root);
const target = fileURLToPath(new URL('resume.pdf', root));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(fileURLToPath(source)).href, { waitUntil: 'load' });
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: target,
  format: 'Letter',
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
console.log(`resume.pdf written to ${target}`);
