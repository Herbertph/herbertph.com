// Captures the four review screenshots: desktop/mobile × light/dark.
// Usage: npm run screenshots
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = process.cwd();
const PORT = 4174; // never 4173 (test suite) or 4545 (Lamp)
const TYPES = { '.html': 'text/html; charset=utf-8', '.pdf': 'application/pdf', '.png': 'image/png' };

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = normalize(urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, ''));
  try {
    const body = await readFile(join(ROOT, rel));
    res.writeHead(200, { 'content-type': TYPES[extname(rel)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

const shots = [
  { name: 'desktop-light', viewport: { width: 1440, height: 1000 }, colorScheme: 'light' },
  { name: 'desktop-dark', viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' },
  { name: 'mobile-light', viewport: { width: 390, height: 844 }, colorScheme: 'light' },
  { name: 'mobile-dark', viewport: { width: 390, height: 844 }, colorScheme: 'dark' },
];

const browser = await chromium.launch();
try {
  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      colorScheme: shot.colorScheme,
      reducedMotion: 'reduce', // freeze reveals so the full page is readable in a still image
    });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `docs/screenshots/homepage-test-run/${shot.name}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log('screenshots written to docs/screenshots/homepage-test-run/');
