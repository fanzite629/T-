/* Shared chrome: episode header, segmented progress bar (clickable), captions. */
'use strict';
window.EPISODES = [
  '概述与七种寻址方式', '数据传送指令', '逻辑运算指令', '算术运算指令与 PSW', '控制转移指令', '汇编语言、伪指令与复习'
];
window.SCENES = [];
(() => {
const { TL, C, SC, prog, el, setAttrs, setRich, T, U, svg } = window.ENG;
const S = window.SCENES;

S.push(function header() {
  T(svg, 60, 62, `MCS-51 单片机 · 第 3 章 指令系统 · 第 ${window.EP} 集  ${window.EPISODES[window.EP - 1]}`, { size: 22, fill: C.muted, maxw: 1000 });
  const x0 = 1080, W = 780, y = 50;
  const total = TL.duration;
  const segs = TL.scenes.map(s => {
    const g = el('g', { class: 'clickable', 'data-seek': s.t0 + 0.05 });
    const x = x0 + W * s.t0 / total, w = Math.max(2, W * (s.t1 - s.t0) / total - 3);
    el('rect', { x, y: y - 14, width: w, height: 30, fill: 'rgba(0,0,0,0)' }, g);
    const bg = el('rect', { x, y, width: w, height: 6, rx: 3, fill: C.line }, g);
    const fg = el('rect', { x, y, width: 0, height: 6, rx: 3, fill: C.cyan }, g);
    return { s, x, w, fg };
  });
  const lab = T(svg, x0 + W, y - 14, '', { size: 20, anchor: 'end', fill: C.cyan, weight: 500 });
  let cur = null;
  U.push(t => {
    let name = '';
    for (const { s, w, fg } of segs) {
      const k = prog(t, s.t0, s.t1 - s.t0);
      fg.setAttribute('width', (w * k).toFixed(1));
      if (t >= s.t0 && t < s.t1) name = s.sec;
    }
    if (name !== cur) { setRich(lab, name, 20); cur = name; }
  });
});

S.push(function captions() {
  const g = el('g', { class: 'caption' });
  const bg = el('rect', { rx: 12, fill: 'rgba(3,8,16,.84)' }, g);
  const l1 = el('text', { x: 960, 'font-size': 34, fill: C.text, 'text-anchor': 'middle', 'font-weight': 500 }, g);
  const l2 = el('text', { x: 960, 'font-size': 34, fill: C.text, 'text-anchor': 'middle', 'font-weight': 500 }, g);
  let cur = null;
  const lines = TL.lines;
  let idx = 0;
  U.push(t => {
    let ln = null;
    for (const l of lines) if (t >= l.t0 - 0.05 && t < l.t1 + 0.25) { ln = l; }
    const s = ln ? ln.t : '';
    if (s !== cur) {
      cur = s;
      setRich(l1, s, 34); setRich(l2, '', 34);
      l1.setAttribute('font-size', 34);
      let w = s ? l1.getComputedTextLength() : 0, two = false;
      if (w > 1720) {
        const midc = s.length / 2;
        let best = -1;
        for (let i = 0; i < s.length - 1; i++) if ('，；：、。'.includes(s[i]) && (best < 0 || Math.abs(i - midc) < Math.abs(best - midc))) best = i;
        if (best < 0) best = Math.floor(midc);
        setRich(l1, s.slice(0, best + 1), 32); setRich(l2, s.slice(best + 1), 32);
        l1.setAttribute('font-size', 32); l2.setAttribute('font-size', 32);
        w = Math.max(l1.getComputedTextLength(), l2.getComputedTextLength());
        two = true;
      }
      setAttrs(l1, { y: two ? 994 : 1018 }); setAttrs(l2, { y: 1038 });
      setAttrs(bg, { x: 960 - (w + 56) / 2, width: w + 56, y: two ? 958 : 976, height: two ? 96 : 58 });
    }
    let a = 0;
    if (ln) a = Math.min(prog(t, ln.t0 - 0.05, 0.15), 1 - prog(t, ln.t1 + 0.1, 0.15));
    g.setAttribute('opacity', a.toFixed(3));
  });
});
})();
