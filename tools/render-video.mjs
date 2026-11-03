// Frame-exact MP4 export: drives window.__render(t) and pipes JPEG frames into ffmpeg.
// Usage: node tools/render-video.mjs [out.mp4] [fps] [--nocap]
import { createRequire } from 'module';
import { spawn } from 'child_process';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const out = path.resolve(args[0] || path.join(root, 'exports/potentiometry-60s.mp4'));
const fps = Number(args[1] || 30);
const cap = process.argv.includes('--nocap') ? '&cap=0' : '';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('file://' + path.join(root, 'index.html') + '?clean=1&autoplay=0' + cap);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const N = Math.round(60 * fps);
for (let f = 0; f <= N; f++) {
  await page.evaluate(t => window.__render(t), f / fps);
  const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 300 === 0) console.log(`frame ${f}/${N}`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close();
console.log('wrote', out);
