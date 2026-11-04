// Frame-exact MP4 export with narration.
// Usage: node tools/render-video.mjs <ep> [out.mp4] [fps] [workers] [--nocap]
import { createRequire } from 'module';
import { spawn, execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const ep = Number(args[0] || 1);
const out = path.resolve(args[1] || path.join(root, `exports/ep${ep}.mp4`));
const fps = Number(args[2] || 25), workers = Number(args[3] || 4);
const cap = process.argv.includes('--nocap') ? '&cap=0' : '';
const limit = process.argv.find(a => a.startsWith('--limit='));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mcsrender-'));
const tl = fs.readFileSync(path.join(root, `src/tl/ep${ep}.js`), 'utf8');
const duration = limit ? Number(limit.split('=')[1]) : JSON.parse(tl.slice(tl.indexOf('{'), tl.lastIndexOf('}') + 1)).duration;
const N = Math.ceil(duration * fps);
const browser = await chromium.launch();
const t0 = Date.now();
async function worker(w) {
  const a = Math.floor(N * w / workers), b = Math.floor(N * (w + 1) / workers);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(root, 'index.html') + `?ep=${ep}&clean=1&t=0` + cap);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  const seg = path.join(tmp, `seg${w}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-tune', 'animation', '-pix_fmt', 'yuv420p', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = a; f < b; f++) {
    await page.evaluate(t => window.__render(t), f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 90 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 1500 === 0) console.log(`ep${ep} worker ${w}: ${f - a}/${b - a}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await page.close();
  return seg;
}
const segs = await Promise.all([...Array(workers).keys()].map(worker));
await browser.close();
fs.writeFileSync(path.join(tmp, 'list.txt'), segs.map(s => `file '${s}'`).join('\n'));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'),
  '-i', path.join(root, `exports/ep${ep}-narration.wav`), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '96k',
  '-shortest', '-movflags', '+faststart', out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('wrote', out, `${N} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
