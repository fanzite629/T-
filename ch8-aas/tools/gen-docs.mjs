// Generates docs/transcript.md (timestamped narration by chapter) and docs/subtitles.srt from src/timeline.js.
import fs from 'fs';
import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = fs.readFileSync(path.join(root, 'src/timeline.js'), 'utf8');
const TL = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const plain = s => s.replace(/\^\{([^}]*)\}/g, (m, x) => x === '*' ? '*' : '^' + x).replace(/_\{([^}]*)\}/g, '$1');
const srtT = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/subtitles.srt'), TL.lines.map((l, i) => `${i + 1}\n${srtT(l.t0)} --> ${srtT(l.t1)}\n${plain(l.t)}\n`).join('\n'));
let md = `# ${TL.title} · 讲解视频文字稿\n\n> 由 \`node tools/gen-docs.mjs\` 根据 \`src/timeline.js\` 自动生成，时间与视频完全一致。全片 ${mmss(TL.duration)}，共 ${TL.lines.length} 句。可直接作为复习笔记使用。\n\n## 目录\n\n`;
md += TL.scenes.map(s => `- [${mmss(s.t0)}] ${s.sec}`).join('\n') + '\n';
for (const s of TL.scenes) {
  md += `\n## ${s.sec}（${mmss(s.t0)}–${mmss(s.t1)}）\n\n`;
  md += TL.lines.filter(l => l.scene === s.id).map(l => `- \`${mmss(l.t0)}\` ${plain(l.t)}`).join('\n') + '\n';
}
fs.writeFileSync(path.join(root, 'docs/transcript.md'), md);
console.log('lines', TL.lines.length, 'duration', mmss(TL.duration));
