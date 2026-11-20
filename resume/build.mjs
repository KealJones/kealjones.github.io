// Builds ../resume.pdf (served at kealjones.com/resume.pdf) from resume.html.
//
//   cd resume && npm install && npm run build
//   (on a machine without Playwright's Chromium yet, run `npx playwright install chromium` once first)
//
// Edit resume.html, rebuild, and commit both resume.html and ../resume.pdf.
// The fonts come from npm and the mark from ../logo.svg; both are copied in at
// build time and git-ignored.
import { chromium } from 'playwright';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fonts = {
  'yt.woff2': '@fontsource/yellowtail/files/yellowtail-latin-400-normal.woff2',
  'ys.woff2': '@fontsource/young-serif/files/young-serif-latin-400-normal.woff2',
  'ft.woff2': '@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2',
  'fti.woff2': '@fontsource-variable/figtree/files/figtree-latin-wght-italic.woff2',
};
for (const [out, src] of Object.entries(fonts)) copyFileSync(join(here, 'node_modules', src), join(here, out));

// The site logo with its <style> block removed, so it renders in plain black.
const logo = readFileSync(join(here, '..', 'logo.svg'), 'utf8');
writeFileSync(join(here, 'mark.svg'), logo.replace(/<style>[\s\S]*?<\/style>/, ''));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + join(here, 'resume.html'));
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: join(here, '..', 'resume.pdf'), format: 'Letter', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('wrote resume.pdf');
