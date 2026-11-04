// Generates, from the episode timelines (src/tl/ep*.js) and the page index (tools/pages.json):
//   docs/transcript.md          timestamped narration of every episode (讲解稿)
//   docs/subtitles/ep<N>.srt    subtitles per episode
//   docs/page-checklist.md/.csv 96-page checklist: page → knowledge point → episode / section / time range
// Fails if any PDF page is not mapped to a section.
import fs from 'fs';
import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pages = JSON.parse(fs.readFileSync(path.join(root, 'tools/pages.json'), 'utf8'));
const EPN = ['概述与七种寻址方式', '数据传送指令', '逻辑运算指令', '算术运算指令与 PSW', '控制转移指令', '汇编语言、伪指令与复习'];
const FILE = ['ep1-指令系统概述与寻址方式.mp4', 'ep2-数据传送指令.mp4', 'ep3-逻辑运算指令.mp4', 'ep4-算术运算指令与PSW.mp4', 'ep5-控制转移指令.mp4', 'ep6-汇编语言伪指令与复习.mp4'];
// page-level review notes (details in docs/accuracy-notes.md, numbered there)
const NOTES = {
  13: '⚠ 笔误「原操作数」→源操作数（注 1）', 15: '图片表格，已逐格重建', 19: '＋B 的寻址说明（注 2）', 23: '＋MOVC 也可访问片内 ROM（注 3）',
  26: '⚠ E0H 应写 0E0H；＋补充机器码（注 4）', 29: '＋补充各区地址（注 5）', 33: '⚠ “SP 指在栈底”与示意图矛盾（注 6）', 34: '＋XCHD 源只能 @Ri（注 7）',
  37: '＋平方表补全 09H~51H（注 8）', 41: '✓ 逐行核对正确', 47: '✓ 逐位核对正确', 50: '⚠ 三个结果须分别由 F6H 算起（注 9）', 51: '演示用 x 表示未知位（注 10）',
  61: '图形重绘', 63: '✓ 标志逐项核对正确', 64: '＋P 位随 A 变化（注 11）；演示数据', 67: '✓', 68: '✓',
  76: '＋ACALL 同页规则；演示数据（注 12）', 80: '＋标号含“-”（注 13）', 82: '⚠ R0、C 未给出（注 14）', 83: '演示数据', 85: '⚠ 附录不在 PDF 中；＋12MHz 换算（注 15）',
  86: '⚠ 笔误「顺序问下执行」（注 16）', 87: '演示数据', 88: '演示数据 (20H)=0B5H（注 17）', 91: '⚠ 标号 FIRST/FITST/FIRST1 不一致（注 18）', 92: '⚠ 笔误「开使」（注 19）',
  93: '⚠ LJMP MAA 后 PC 应为 0030H（注 20）', 94: '⚠ “=”代替 EQU 未能核实（注 21）', 95: '⚠ DL 未在常见汇编器中找到（注 22）', 9: '演示数据（注 23）', 45: '演示数据（注 23）'
};
const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const srtT = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const plain = s => s.replace(/\{[a-z]\|([^}]*)\}/g, '$1').replace(/[_^]\{([^}]*)\}/g, '$1');

const eps = [];
for (let n = 1; n <= 6; n++) {
  const f = path.join(root, `src/tl/ep${n}.js`);
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  eps.push(JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1)));
}
fs.mkdirSync(path.join(root, 'docs/subtitles'), { recursive: true });
let total = 0, nLines = 0;
let md = '# 第 3 章 单片机指令系统 · 讲解稿\n\n';
md += '> 由 `node tools/gen-docs.mjs` 根据各集时间轴自动生成，时间戳与视频完全一致；每节标题后注明对应的课件页码。\n\n';
for (const tl of eps) { total += tl.duration; nLines += tl.lines.length; }
md += `全 ${eps.length} 集，总时长 ${mmss(total)}，共 ${nLines} 句。\n\n## 目录\n\n`;
for (const tl of eps) md += `- 第 ${tl.ep} 集 ${EPN[tl.ep - 1]}（${mmss(tl.duration)}）\n`;
for (const tl of eps) {
  fs.writeFileSync(path.join(root, `docs/subtitles/ep${tl.ep}.srt`), tl.lines.map((l, i) => `${i + 1}\n${srtT(l.t0)} --> ${srtT(l.t1)}\n${plain(l.t)}\n`).join('\n'));
  md += `\n---\n\n# 第 ${tl.ep} 集 · ${EPN[tl.ep - 1]}\n\n视频：\`exports/${FILE[tl.ep - 1]}\`，时长 ${mmss(tl.duration)}\n`;
  for (const s of tl.scenes) {
    md += `\n## [${mmss(s.t0)}–${mmss(s.t1)}] ${s.sec}（课件 P${s.pages.join('、P')}）\n\n`;
    md += tl.lines.filter(l => l.scene === s.id).map(l => `- \`${mmss(l.t0)}\` ${plain(l.t)}`).join('\n') + '\n';
  }
}
fs.writeFileSync(path.join(root, 'docs/transcript.md'), md);

// page checklist
const map = {};
for (const tl of eps) for (const s of tl.scenes) for (const p of s.pages) (map[p] = map[p] || []).push({ ep: tl.ep, sec: s.sec, t0: s.t0, t1: s.t1 });
const missing = pages.filter(p => !map[p.p]).map(p => p.p);
let ck = '# 课件 96 页核对表（PDF 页码 → 知识点 → 视频章节 → 时间段）\n\n';
ck += '> 由 `node tools/gen-docs.mjs` 自动生成。时间段为该页内容在对应视频中所在章节的起止时间（mm:ss）。\n';
ck += '> 备注中的“注 n”见 `docs/accuracy-notes.md`。⚠ = 课件存疑 / 笔误；＋ = 视频中的补充说明；演示数据 = 课件未给数据、视频中明确标注的演示值；✓ = 已逐项核对。\n\n';
ck += `覆盖情况：${pages.length - missing.length} / ${pages.length} 页${missing.length ? `，**未覆盖：${missing.join('、')}**` : '，全部覆盖'}。\n\n`;
ck += '| 页 | 内容（知识点） | 类型 | 视频 | 章节 | 时间段 | 备注 |\n|---|---|---|---|---|---|---|\n';
let csv = '页码,内容,类型,集,视频文件,章节,开始,结束,备注\n';
for (const p of pages) {
  const ms = map[p.p] || [];
  const ep = ms.map(m => `第${m.ep}集`).join('<br>');
  const sec = ms.map(m => m.sec).join('<br>');
  const tm = ms.map(m => `${mmss(m.t0)}–${mmss(m.t1)}`).join('<br>');
  ck += `| ${p.p} | ${p.topic} | ${p.type} | ${ep || '—'} | ${sec || '**未覆盖**'} | ${tm} | ${NOTES[p.p] || ''} |\n`;
  for (const m of ms.length ? ms : [{}]) csv += [p.p, p.topic, p.type, m.ep ?? '', m.ep ? FILE[m.ep - 1] : '', m.sec ?? '', m.t0 != null ? mmss(m.t0) : '', m.t1 != null ? mmss(m.t1) : '', NOTES[p.p] || '']
    .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n';
}
fs.writeFileSync(path.join(root, 'docs/page-checklist.md'), ck);
fs.writeFileSync(path.join(root, 'docs/page-checklist.csv'), '﻿' + csv);
console.log(`episodes ${eps.length}, total ${mmss(total)}, lines ${nLines}, pages mapped ${pages.length - missing.length}/${pages.length}`);
if (missing.length && eps.length === 6) { console.error('UNMAPPED PAGES:', missing.join(',')); process.exit(1); }
