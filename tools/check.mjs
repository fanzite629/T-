// Usage: node tools/check.mjs [outDir] [times...]
// Screenshots chosen moments, reports JS errors and text overflowing its data-maxw budget.
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = process.argv[2] || path.join(root, 'exports/check');
const times = process.argv.slice(3).map(Number);
const T = times.length ? times : [2, 4.6, 9, 14.5, 17.5, 22, 26.5, 31, 38.5, 41.5, 47.5, 51, 55.5, 57, 60];
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file://' + path.join(root, 'index.html') + '?clean=1&autoplay=0');
await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
const overflow = await page.evaluate(() => [...document.querySelectorAll('text[data-maxw]')]
  .map(e => ({ s: e.textContent, w: e.getComputedTextLength(), m: +e.dataset.maxw }))
  .filter(o => o.w > o.m).map(o => `${o.s} (${o.w.toFixed(0)} > ${o.m})`));
const font = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight).slice(0, 4));
for (const t of T) {
  await page.evaluate(t => window.__render(t), t);
  await page.screenshot({ path: path.join(out, `t${String(t).padStart(5, '0')}.png`) });
}
console.log('fonts loaded:', font);
console.log('errors:', errors.length ? errors : 'none');
console.log('overflow:', overflow.length ? overflow : 'none');
await browser.close();
