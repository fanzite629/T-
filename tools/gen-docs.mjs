// Generates docs/voiceover.md and docs/voiceover.srt from src/data.js (single timing source).
import fs from 'fs';
import path from 'path';
import vm from 'vm';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'src/data.js'), 'utf8'), ctx);
const L = ctx.window.LESSON;
const ts = s => { const ms = Math.round(s * 1000); const p = (n, w = 2) => String(n).padStart(w, '0');
  return `00:00:${p(Math.floor(ms / 1000))},${p(ms % 1000, 3)}`; };
// spoken length: count CJK chars + latin tokens (≈1 syllable per letter group / digit group)
const spoken = s => (s.match(/[一-鿿]/g) || []).length + (s.match(/[A-Za-z]+|\d+/g) || []).length;
const srt = L.cues.map(([a, b, s], i) => `${i + 1}\n${ts(a)} --> ${ts(b)}\n${s}\n`).join('\n');
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/voiceover.srt'), srt);
let md = `# 60 秒中文配音稿（与动画逐句同步）\n\n> 本文件由 \`node tools/gen-docs.mjs\` 根据 \`src/data.js\` 自动生成；动画字幕与 \`voiceover.srt\` 使用同一份时间数据，改稿请改 \`src/data.js\` 后重新生成。\n\n`;
md += `建议语速：约 4–5 字/秒，语气平稳、清晰；每句在“开始”时刻起读，于“结束”前读完。\n\n`;
for (const seg of L.segments) {
  md += `## ${seg.label}（${seg.t0}–${seg.t1} 秒）\n\n| # | 开始 | 结束 | 台词 | 字数 | 语速（字/秒） |\n|---|---|---|---|---|---|\n`;
  L.cues.forEach(([a, b, s], i) => {
    if (a >= seg.t0 && a < seg.t1) md += `| ${i + 1} | ${a.toFixed(1)} | ${b.toFixed(1)} | ${s} | ${spoken(s)} | ${(spoken(s) / (b - a)).toFixed(1)} |\n`;
  });
  md += '\n';
}
const total = L.cues.reduce((n, c) => n + spoken(c[2]), 0);
md += `**合计**：${L.cues.length} 句，约 ${total} 个音节，平均 ${(total / 60).toFixed(1)} 字/秒（含停顿）。\n\n`;
md += `## 连读版（便于配音员通读）\n\n` + L.segments.map(seg => L.cues.filter(c => c[0] >= seg.t0 && c[0] < seg.t1).map(c => c[2]).join('')).join('\n\n') + '\n';
fs.writeFileSync(path.join(root, 'docs/voiceover.md'), md);
console.log(`cues=${L.cues.length} syllables=${total}; max rate=${Math.max(...L.cues.map(c => spoken(c[2]) / (c[1] - c[0]))).toFixed(2)}/s`);
