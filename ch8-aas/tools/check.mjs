// Usage: node tools/check.mjs <outDir> [sceneId ...]
// Screenshots the end of every narration line (per scene contact sheets), reports JS errors and text overflow.
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.resolve(process.argv[2] || path.join(root, 'exports/check'));
const only = process.argv.slice(3);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('narration')) errors.push(m.text()); });
await page.goto('file://' + path.join(root, 'index.html') + '?clean=1&t=0');
await page.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
const overflow = await page.evaluate(() => [...document.querySelectorAll('text[data-maxw]')]
  .map(e => ({ s: e.textContent, w: e.getComputedTextLength(), m: +e.dataset.maxw }))
  .filter(o => o.w > o.m + 1).map(o => `${o.s} (${o.w.toFixed(0)} > ${o.m})`));
const TL = await page.evaluate(() => window.TL);
for (const sc of TL.scenes) {
  if (only.length && !only.includes(sc.id)) continue;
  const lines = TL.lines.filter(l => l.scene === sc.id);
  const files = [];
  for (const l of lines) {
    const t = l.t1 - 0.05;
    await page.evaluate(t => window.__render(t), t);
    const f = path.join(out, `${sc.id}-${String(l.i).padStart(2, '0')}.png`);
    await page.screenshot({ path: f, type: 'png' });
    files.push(f);
  }
  // contact sheet: 3 columns at 640x360
  const py = `
from PIL import Image, ImageDraw
import sys
fs = sys.argv[2:]; W, H = 640, 360; cols = 3; rows = (len(fs) + cols - 1) // cols
m = Image.new('RGB', (W * cols, (H + 24) * rows), '#000'); d = ImageDraw.Draw(m)
for i, f in enumerate(fs):
    x, y = (i % cols) * W, (i // cols) * (H + 24)
    m.paste(Image.open(f).resize((W, H)), (x, y + 24)); d.text((x + 6, y + 6), f.split('/')[-1], fill='#3DD5F3')
m.save(sys.argv[1])`;
  execFileSync('python3', ['-c', py, path.join(out, `sheet-${sc.id}.png`), ...files]);
}
console.log('errors:', errors.length ? errors : 'none');
console.log('overflow:', overflow.length ? overflow : 'none');
await browser.close();
