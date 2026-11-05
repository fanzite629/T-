/* Scenes part 1: chrome, captions, intro, light & EM spectrum, optical methods, history, Mg example, resonance lines */
'use strict';
(() => {
const { TL, C, SC, at, end, prog, lerp, E, eo, el, setAttrs, setRich, T, G, D, U, focus, card, pill, arrow,
  axes, curve, gauss, bullets, sceneGroup, title, stepLabel, svg } = window.ENG;
const S = window.SCENES = window.SCENES || [];
const mid = (s, i) => (at(s, i) + end(s, i)) / 2;

/* ================= chrome: header, progress chips, captions ================= */
S.push(function chrome() {
  T(svg, 60, 58, '现代分析仪器及应用 · 第 8 章 原子吸收光谱分析', { size: 20, fill: C.muted, maxw: 520 });
  const groups = [
    [['intro'], '导入'], [['light', 'optics', 'history'], '光与光谱'],
    [['mg', 'res', 'profile', 'broad', 'integ', 'boltz'], '8-2 原理'], [['quiz1'], '练习一'],
    [['inst', 'hcl', 'flame', 'furnace', 'optsys'], '8-3 仪器'], [['quant'], '8-4 定量'],
    [['feat'], '8-7 特点'], [['quiz2'], '练习二'], [['sum'], '总结']];
  const x0 = 610, w = 136, gap = 5;
  const chips = groups.map(([ids, label], k) => {
    const t0 = SC[ids[0]].t0, t1 = SC[ids[ids.length - 1]].t1;
    const g = el('g', { class: 'clickable', 'data-seek': t0 + 0.05 });
    const r = el('rect', { x: x0 + k * (w + gap), y: 34, width: w, height: 30, rx: 6 }, g);
    const tx = T(g, x0 + k * (w + gap) + w / 2, 55, label, { size: 16, anchor: 'middle', maxw: w - 8 });
    return { t0, t1, r, tx, g };
  });
  const full = groups.length * (w + gap) - gap;
  el('rect', { x: x0, y: 70, width: full, height: 3, rx: 1.5, fill: C.line });
  const bar = el('rect', { x: x0, y: 70, height: 3, rx: 1.5, fill: C.cyan });
  U.push(t => {
    const show = t >= SC.light.t0 - 0.3;
    chips.forEach(({ t0, t1, r, tx, g }) => {
      const on = t >= t0 && t < t1, done = t >= t1;
      setAttrs(r, { fill: on ? C.cyan : (done ? '#16324F' : C.panel), stroke: on ? C.cyan : C.line });
      tx.setAttribute('fill', on ? C.bg1 : (done ? C.text : C.muted));
      g.setAttribute('opacity', show ? 1 : 0);
    });
    bar.setAttribute('width', (full * Math.min(1, t / TL.duration)).toFixed(1));
    bar.setAttribute('opacity', show ? 1 : 0);
  });
});

S.push(function captions() {
  const g = el('g', { class: 'caption' });
  const bg = el('rect', { rx: 12, fill: 'rgba(3,8,16,.80)' }, g);
  const l1 = el('text', { x: 960, 'font-size': 32, fill: C.text, 'text-anchor': 'middle', 'font-weight': 500 }, g);
  const l2 = el('text', { x: 960, 'font-size': 32, fill: C.text, 'text-anchor': 'middle', 'font-weight': 500 }, g);
  const plain = s => s.replace(/[_^]\{([^}]*)\}/g, '$1');
  let cur = null;
  U.push(t => {
    const ln = TL.lines.find(l => t >= l.t0 - 0.05 && t < l.t1 + 0.25);
    const s = ln ? ln.t : '';
    if (s !== cur) {
      cur = s;
      setRich(l1, s, 32); setRich(l2, '', 32);
      let w = s ? l1.getComputedTextLength() : 0;
      let two = false;
      if (w > 1700) {
        // split at the punctuation closest to the middle of the visible text
        const p = plain(s), midc = p.length / 2;
        let best = -1;
        for (let i = 0; i < s.length; i++) if ('，；：、。'.includes(s[i]) && i < s.length - 1) {
          const pos = plain(s.slice(0, i)).length;
          if (best < 0 || Math.abs(pos - midc) < Math.abs(plain(s.slice(0, best)).length - midc)) best = i;
        }
        if (best < 0) best = Math.floor(s.length / 2);
        setRich(l1, s.slice(0, best + 1), 30); setRich(l2, s.slice(best + 1), 30);
        l1.setAttribute('font-size', 30); l2.setAttribute('font-size', 30);
        w = Math.max(l1.getComputedTextLength(), l2.getComputedTextLength());
        two = true;
      } else { l1.setAttribute('font-size', 32); }
      setAttrs(l1, { y: two ? 996 : 1016 }); setAttrs(l2, { y: 1036 });
      setAttrs(bg, { x: 960 - (w + 56) / 2, width: w + 56, y: two ? 962 : 976, height: two ? 90 : 56 });
    }
    let a = 0;
    if (ln) a = Math.min(prog(t, ln.t0 - 0.05, 0.15), 1 - prog(t, ln.t1 + 0.1, 0.15));
    g.setAttribute('opacity', a.toFixed(3));
  });
});

/* shared drawing: a hollow-cathode lamp icon, a flame icon, generic boxes */
function lampIcon(p, x, y, label, col = C.gold) {
  const g = el('g', {}, p);
  el('rect', { x: x - 70, y: y - 34, width: 120, height: 68, rx: 30, fill: 'rgba(247,197,72,.10)', stroke: '#9FB8D0', 'stroke-width': 2.5 }, g);
  el('rect', { x: x - 48, y: y - 16, width: 46, height: 32, rx: 6, fill: 'none', stroke: col, 'stroke-width': 4 }, g);
  el('rect', { x: x - 100, y: y - 14, width: 32, height: 28, rx: 4, fill: C.panel2, stroke: C.line }, g);
  el('circle', { cx: x + 30, cy: y, r: 9, fill: col, filter: 'url(#glow)' }, g);
  if (label) T(g, x - 10, y + 70, label, { size: 22, anchor: 'middle', fill: C.muted, maxw: 220 });
  return g;
}
function flameIcon(p, x, y, s = 1, label) {
  const g = el('g', {}, p);
  el('path', { d: `M${x} ${y - 110 * s} C${x + 40 * s} ${y - 60 * s} ${x + 46 * s} ${y - 20 * s} ${x + 30 * s} ${y} L${x - 30 * s} ${y} C${x - 46 * s} ${y - 20 * s} ${x - 40 * s} ${y - 60 * s} ${x} ${y - 110 * s}z`, fill: 'rgba(255,169,77,.35)', stroke: C.orange, 'stroke-width': 2.5 }, g);
  el('path', { d: `M${x} ${y - 66 * s} C${x + 20 * s} ${y - 36 * s} ${x + 20 * s} ${y - 12 * s} ${x + 12 * s} ${y} L${x - 12 * s} ${y} C${x - 20 * s} ${y - 12 * s} ${x - 20 * s} ${y - 36 * s} ${x} ${y - 66 * s}z`, fill: 'rgba(91,140,255,.55)' }, g);
  el('rect', { x: x - 60 * s, y, width: 120 * s, height: 18 * s, rx: 4, fill: '#56708F' }, g);
  if (label) T(g, x, y + 56 * s, label, { size: 22, anchor: 'middle', fill: C.muted, maxw: 240 });
  return g;
}
function box(p, x, y, w, h, s, o = {}) {
  const g = el('g', {}, p);
  el('rect', { x, y, width: w, height: h, rx: 14, fill: o.fill || C.panel, stroke: o.stroke || C.cyanDeep, 'stroke-width': o.sw || 2 }, g);
  T(g, x + w / 2, y + h / 2 + (o.size || 26) * 0.36, s, { size: o.size || 26, anchor: 'middle', weight: o.weight || 600, fill: o.color || C.text, maxw: w - 16 });
  return g;
}
window.DRAW = { lampIcon, flameIcon, box };

/* ================= intro ================= */
S.push(function intro() {
  const id = 'intro', g = sceneGroup(id);
  const tg = G(g, { in: at(id, 0) - 0.6, out: at(id, 1) - 0.1, od: 0.4 });
  T(tg, 960, 380, '第 8 章', { size: 40, fill: C.cyan, anchor: 'middle', weight: 500 });
  T(tg, 960, 490, '原子吸收光谱分析', { size: 96, anchor: 'middle', weight: 700 });
  T(tg, 960, 560, '现代分析仪器及应用 · Atomic Absorption Spectrometry（AAS）', { size: 28, fill: C.muted, anchor: 'middle' });
  el('line', { x1: 720, y1: 600, x2: 1200, y2: 600, stroke: C.gold, 'stroke-width': 2 }, tg);

  // the question: lead in tap water
  const q = G(g, { in: at(id, 1), out: at(id, 2) - 0.3, od: 0.4 });
  el('path', { d: 'M820 330 L860 760 Q862 790 892 790 L1028 790 Q1058 790 1060 760 L1100 330', fill: 'none', stroke: '#9FB8D0', 'stroke-width': 4 }, q);
  el('path', { d: 'M834 470 L860 760 Q862 790 892 790 L1028 790 Q1058 790 1060 760 L1086 470z', fill: 'rgba(91,140,255,.25)' }, q);
  const r = window.ENG.rng(7);
  for (let k = 0; k < 40; k++) el('circle', { cx: 870 + r() * 180, cy: 500 + r() * 270, r: 4, fill: 'rgba(234,242,251,.35)' }, q);
  const pb = G(q, { in: at(id, 1) + 1.2, fx: 'scale', ox: 990, oy: 640 });
  el('circle', { cx: 990, cy: 640, r: 9, fill: C.red, filter: 'url(#glow)' }, pb);
  T(pb, 1012, 632, 'Pb', { size: 22, fill: C.red, weight: 700 });
  T(q, 1180, 520, '有没有铅？', { size: 48, weight: 700 });
  T(G(q, { in: at(id, 1) + 2 }), 1180, 590, '含量：十亿分之几（μg/L 级）', { size: 30, fill: C.gold });

  // the idea: lamp -> atoms -> detector
  const ideaIn = at(id, 2);
  const ig = G(g, { in: ideaIn, out: at(id, 4) - 0.3, od: 0.4, fx: 'none' });
  lampIcon(ig, 300, 560, '待测元素的光源');
  const b1 = el('rect', { x: 360, y: 550, height: 20, fill: C.gold, opacity: 0.85, rx: 4 }, ig);
  // atom cloud
  const cl = G(ig, { in: ideaIn + 0.6, fx: 'none' });
  el('ellipse', { cx: 900, cy: 560, rx: 190, ry: 120, fill: 'rgba(61,213,243,.08)', stroke: C.cyanDeep, 'stroke-dasharray': '8 8', 'stroke-width': 2 }, cl);
  const rr = window.ENG.rng(3);
  const atoms = [];
  for (let k = 0; k < 26; k++) atoms.push(el('circle', { cx: 740 + rr() * 320, cy: 470 + rr() * 180, r: 9, fill: C.cyan }, cl));
  T(cl, 900, 720, '样品的原子蒸气', { size: 24, fill: C.muted, anchor: 'middle' });
  const b2 = el('rect', { x: 1090, y: 553, height: 14, fill: C.gold, opacity: 0.6, rx: 4 }, ig);
  const det = G(ig, { in: ideaIn + 0.6, fx: 'none' });
  el('rect', { x: 1400, y: 500, width: 120, height: 120, rx: 12, fill: C.panel2, stroke: C.cyanDeep, 'stroke-width': 2 }, det);
  el('circle', { cx: 1460, cy: 560, r: 30, fill: 'none', stroke: C.cyan, 'stroke-width': 4 }, det);
  T(det, 1460, 680, '检测器', { size: 24, fill: C.muted, anchor: 'middle' });
  const meter = G(ig, { in: at(id, 3), fx: 'none' });
  card(meter, 1580, 470, 260, 180, { stroke: C.gold });
  T(meter, 1710, 520, '吸收了多少？', { size: 24, anchor: 'middle', fill: C.gold });
  const aTxt = T(meter, 1710, 600, 'A = 0.00', { size: 44, anchor: 'middle', weight: 700, mono: true });
  T(G(ig, { in: at(id, 3) + 2.5 }), 960, 840, '吸收越多 → 原子越多 → 含量越高', { size: 36, anchor: 'middle', fill: C.gold, weight: 700 });
  U.push(t => {
    b1.setAttribute('width', (340 * E(t, ideaIn + 0.2, 0.7)).toFixed(1));
    b2.setAttribute('width', (310 * E(t, ideaIn + 1.0, 0.6)).toFixed(1));
    const k = E(t, at(id, 3), 1.6);
    b2.setAttribute('opacity', lerp(0.95, 0.35, k).toFixed(2));
    b2.setAttribute('height', lerp(20, 9, k).toFixed(1)); b2.setAttribute('y', lerp(550, 555.5, k).toFixed(1));
    atoms.forEach((a, j) => a.setAttribute('fill', j < Math.round(26 * k) ? C.gold : C.cyan));
    aTxt.textContent = 'A = ' + (0.42 * k).toFixed(2);
  });

  // roadmap
  const steps = [['光与光谱基础', 'P2–14'], ['8-2 基本原理', 'P15–41'], ['8-3 分光光度计', 'P42–70'], ['8-4 定量分析', 'P71–76'], ['8-7 特点 · 练习', 'P77–81']];
  const t0 = at(id, 4), span = end(id, 5) - t0;
  T(G(g, { in: t0 - 0.2 }), 960, 330, '本章学习路线', { size: 44, anchor: 'middle', weight: 700 });
  steps.forEach(([s, pg], k) => {
    const x = 110 + k * 350, y = 470;
    const sg = G(g, { in: t0 + span * k / 6, fx: 'scale', ox: x + 150, oy: y + 90 });
    card(sg, x, y, 300, 180, { stroke: C.cyanDeep });
    el('circle', { cx: x + 150, cy: y + 52, r: 26, fill: C.cyan }, sg);
    T(sg, x + 150, y + 61, String(k + 1), { size: 26, anchor: 'middle', fill: C.bg1, weight: 700 });
    T(sg, x + 150, y + 122, s, { size: 28, anchor: 'middle', weight: 600, maxw: 280 });
    T(sg, x + 150, y + 160, '课件 ' + pg, { size: 20, anchor: 'middle', fill: C.muted });
    if (k < 4) arrow(sg, x + 306, y + 90, x + 344, y + 90, C.cyanDeep, 2.5);
  });
});

/* ================= light & EM spectrum ================= */
S.push(function light() {
  const id = 'light', g = sceneGroup(id);
  title(g, id, '光的本质与电磁波谱', '课件 P2–6');
  // A: particle vs wave
  const A = G(g, { in: at(id, 0), out: at(id, 3) - 0.4, fx: 'none' });
  [[110, '牛顿', '微粒说', '光是沿直线高速飞行的粒子流', C.gold, 1], [1000, '惠更斯', '波动说', '光以球面波的形式在介质中传播', C.cyan, 2]].forEach(([x, who, th, desc, c, li]) => {
    const p = G(A, { in: at(id, li) - 0.2, fx: 'up' });
    card(p, x, 260, 810, 620, { stroke: c });
    T(p, x + 40, 330, who, { size: 40, weight: 700, fill: c });
    T(p, x + 40 + (who.length * 42), 330, '· ' + th, { size: 34, weight: 600 });
    T(p, x + 40, 384, desc, { size: 26, fill: C.muted, maxw: 740 });
    el('circle', { cx: x + 120, cy: 640, r: 40, fill: '#FFF6D8', filter: 'url(#glow)' }, p);
    if (li === 1) {
      const dots = [];
      for (let k = 0; k < 5; k++) for (let j = 0; j < 3; j++) dots.push([el('circle', { r: 8, fill: c }, p), k, j]);
      U.push(t => {
        dots.forEach(([d, k, j]) => {
          const ph = ((t - at(id, 1)) * 0.5 + k / 5) % 1;
          setAttrs(d, { cx: x + 180 + Math.max(0, ph) * 560, cy: 580 + j * 60 });
        });
      });
    } else {
      const cp = el('clipPath', { id: 'clipHuy' }, svg.querySelector('defs'));
      el('rect', { x, y: 260, width: 810, height: 620, rx: 16 }, cp);
      const rg = el('g', { 'clip-path': 'url(#clipHuy)' }, p);
      const rings = [0, 1, 2, 3].map(() => el('circle', { cx: x + 120, cy: 640, fill: 'none', stroke: c, 'stroke-width': 3 }, rg));
      U.push(t => {
        rings.forEach((r, k) => {
          const ph = ((t - at(id, 2)) * 0.35 + k / 4) % 1;
          setAttrs(r, { r: (60 + Math.max(0, ph) * 560).toFixed(1), opacity: (1 - Math.max(0, ph)).toFixed(2) });
        });
      });
    }
  });
  T(G(A, { in: at(id, 2) + 1.5 }), 960, 930, '光本质之争', { size: 28, anchor: 'middle', fill: C.muted });

  // B: modern view + E = hν
  const B = G(g, { in: at(id, 3), out: at(id, 6) - 0.4, fx: 'none' });
  card(B, 110, 260, 1700, 210, { stroke: C.violet });
  T(B, 150, 320, '光 = 电磁辐射', { size: 36, weight: 700, fill: C.violet });
  bullets(B, 160, 380, [['以巨大速度通过空间传播，不需要任何物质作为传播媒介', at(id, 3) + 0.4], ['光量子流：既有波动性，也有微粒性（波粒二象性）', at(id, 4)]], { size: 26, gap: 50, dot: C.violet, maxw: 1580 });
  const fm = G(B, { in: at(id, 5) - 0.2 });
  T(fm, 960, 570, 'E = hν = hc / λ', { size: 64, anchor: 'middle', weight: 700, fill: C.gold });
  const wv = (x0, y0, lam, col, lbl) => {
    let d = `M${x0} ${y0}`;
    for (let x = 0; x <= 700; x += 4) d += ` L${x0 + x} ${(y0 + 40 * Math.sin(x / lam * 2 * Math.PI)).toFixed(1)}`;
    el('path', { d, stroke: col, 'stroke-width': 4, fill: 'none' }, fm);
    T(fm, x0 + 720, y0 + 10, lbl, { size: 26, fill: col, maxw: 360 });
  };
  wv(260, 690, 230, C.red, '波长长 · 频率低 · 能量小');
  wv(260, 830, 60, C.violet, '波长短 · 频率高 · 能量大');

  // C: EM spectrum
  const bands = [['无线电波', '10^{3} m', '#5D7390'], ['微波', '10^{−2} m', '#6B7FA0'], ['太赫兹', '~10^{−4} m', '#A78BFA'], ['红外', '10^{−5} m', '#C0504D'],
    ['可见光', '5×10^{−7} m', 'url(#rainbowSpec)'], ['紫外', '10^{−8} m', '#7B3FE4'], ['X 射线', '10^{−10} m', '#3B5BFF'], ['γ 射线', '10^{−12} m', '#1B6E86']];
  const sp = G(g, { in: at(id, 6), fx: 'none' });
  el('linearGradient', { id: 'rainbowSpec', x1: '0', x2: '1' }, svg.querySelector('defs')).innerHTML = '<stop offset="0" stop-color="#FF4A4A"/><stop offset=".3" stop-color="#F5E642"/><stop offset=".55" stop-color="#3EE07A"/><stop offset=".8" stop-color="#3B5BFF"/><stop offset="1" stop-color="#7B3FE4"/>';
  T(sp, 160, 300, '电磁波谱（波长从长到短）', { size: 30, weight: 700 });
  const bw = 200, bx = 160, by = 340;
  bands.forEach(([n, lam, col], k) => {
    const isT = k === 2;
    const bg = G(sp, { in: isT ? at(id, 7) : at(id, 6) + k * 0.35, fx: 'up' });
    el('rect', { x: bx + k * bw + 3, y: by, width: bw - 6, height: 90, rx: 8, fill: col, opacity: isT ? 0.85 : 0.9, stroke: isT ? C.gold : 'none', 'stroke-width': 3 }, bg);
    T(bg, bx + k * bw + bw / 2, by + 56, n, { size: 26, anchor: 'middle', weight: 700, fill: k === 4 ? C.bg1 : C.text, maxw: bw - 14 });
    T(bg, bx + k * bw + bw / 2, by + 126, lam, { size: 22, anchor: 'middle', fill: C.muted, maxw: bw - 10 });
  });
  arrow(G(sp, { in: at(id, 6) + 2.8 }), 1740, 510, 180, 510, C.muted, 2);
  T(G(sp, { in: at(id, 6) + 2.8 }), 960, 545, '波长 λ 变短 · 频率 ν 变高 · 光子能量 E 变大 ←', { size: 22, anchor: 'middle', fill: C.muted });
  const th = G(sp, { in: at(id, 7) + 0.3, out: at(id, 9) - 0.3 });
  card(th, 160, 590, 1600, 290, { stroke: C.violet });
  T(th, 200, 645, '太赫兹（THz）', { size: 32, weight: 700, fill: C.violet });
  T(th, 200, 700, '频率 0.1–10 THz，波长约 0.03–3 mm；对应分子振动、电子自旋能级', { size: 26, maxw: 1520 });
  T(G(th, { in: at(id, 8) }), 200, 755, '特点：瞬态、带宽、稳定、相干、穿透、低能 ·“改变未来世界的十大技术”之一', { size: 26, maxw: 1520 });
  T(G(th, { in: at(id, 8) + 2.5 }), 200, 810, '应用：医疗诊断 · 物体成像 · 工业探伤', { size: 26, fill: C.gold, maxw: 1520 });
  T(G(th, { in: at(id, 7) + 1 }), 200, 860, '注：课件 P5 写作“3 mm～0.03 m”，按 0.1–10 THz 换算应为 3 mm～0.03 mm', { size: 20, fill: C.muted, cls: 'note', maxw: 1520 });
  // methods under the bands
  const mt = G(sp, { in: at(id, 9) });
  const methods = [[0, '核磁共振'], [1, '顺磁共振'], [3, '红外吸收 · 拉曼'], [4, '原子吸收 · 原子发射 · 紫外-可见 · 荧光'], [6, 'X 射线衍射 · XPS'], [7, '莫斯鲍尔谱']];
  methods.forEach(([k, s], j) => {
    const cx = bx + k * bw + bw / 2 + (k === 4 ? 100 : 0);
    const isAA = k === 4;
    el('line', { x1: bx + k * bw + bw / 2 + (k === 4 ? 100 : 0), y1: 572, x2: cx, y2: 640 + (j % 2) * 90, stroke: isAA ? C.gold : C.line, 'stroke-width': 2 }, mt);
    const p = pill(mt, cx - (isAA ? 260 : 120), 640 + (j % 2) * 90, isAA ? 520 : 240, 50, s, { size: 22, stroke: isAA ? C.gold : C.cyanDeep, fill: isAA ? C.gold : C.text, bg: isAA ? 'rgba(247,197,72,.12)' : 'rgba(61,213,243,.05)' });
    if (isAA) p.setAttribute('filter', 'url(#glow)');
  });
  T(mt, 960, 880, '原子吸收光谱主要利用 紫外 – 可见光区（约 190–900 nm）', { size: 28, anchor: 'middle', fill: C.gold, weight: 600 });
  T(mt, 1790, 300, '注：可见光约 4–7.6×10^{−7} m，课件 P4 表中“5×10^{−6}”应为 5×10^{−7}', { size: 18, fill: C.muted, anchor: 'end', cls: 'note' });
});

/* ================= optical methods ================= */
S.push(function optics() {
  const id = 'optics', g = sceneGroup(id);
  title(g, id, '光学分析法分类', '课件 P7');
  const inter = ['发射', '吸收', '反射', '折射', '散射', '干涉', '衍射'];
  T(G(g, { in: at(id, 0) }), 60, 262, '物质 × 电磁辐射 的相互作用：', { size: 28, fill: C.muted });
  inter.forEach((s, k) => {
    const p = G(g, { in: at(id, 1) + k * 0.35, fx: 'scale', ox: 520 + k * 140 + 60, oy: 252 });
    pill(p, 470 + k * 140, 228, 120, 44, s, { size: 24, stroke: k === 1 ? C.gold : C.cyanDeep, fill: k === 1 ? C.gold : C.text });
  });
  const links = el('g', {}, g);
  const link = (x1, y1, x2, y2, t0, c = C.cyanDeep) => D(el('path', { d: `M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`, stroke: c, 'stroke-width': 2.5, fill: 'none' }, links), t0, 0.6);
  const root = G(g, { in: at(id, 0) + 0.3, fx: 'scale', ox: 210, oy: 600 });
  box(root, 70, 560, 280, 80, '光学分析法', { stroke: C.cyan, size: 32, color: C.cyan });
  const sp = G(g, { in: at(id, 2), fx: 'left' });
  box(sp, 430, 440, 220, 70, '光谱法', { stroke: C.gold, color: C.gold, size: 30 });
  link(350, 600, 430, 475, at(id, 2));
  const at1 = G(g, { in: at(id, 3), fx: 'left' }), mo1 = G(g, { in: at(id, 3) + 0.8, fx: 'left' });
  box(at1, 740, 340, 220, 64, '原子光谱', { stroke: C.gold });
  box(mo1, 740, 560, 220, 64, '分子光谱', { stroke: C.violet });
  link(650, 475, 740, 372, at(id, 3)); link(650, 475, 740, 592, at(id, 3) + 0.8);
  const atomLeaves = ['原子发射', '原子吸收', '原子荧光', 'X 射线荧光'];
  const AA = [];
  atomLeaves.forEach((s, k) => {
    const p = G(g, { in: at(id, 4) + k * 0.45, fx: 'scale', ox: 1100 + k * 190, oy: 372 });
    const b = box(p, 1020 + k * 205, 340, 190, 64, s, { size: 24, stroke: C.line });
    if (k === 1) AA.push(b);
  });
  link(960, 372, 1020, 372, at(id, 4));
  ['紫外-可见', '红外', '分子荧光', '分子磷光', '核磁共振'].forEach((s, k) => {
    const p = G(g, { in: at(id, 5) + k * 0.4, fx: 'scale', ox: 1100 + k * 165, oy: 592 });
    box(p, 1020 + k * 166, 560, 154, 64, s, { size: 22, stroke: C.line });
  });
  link(960, 592, 1020, 592, at(id, 5));
  const np = G(g, { in: at(id, 6), fx: 'left' });
  box(np, 430, 740, 220, 70, '非光谱法', { stroke: C.muted, size: 30 });
  link(350, 600, 430, 775, at(id, 6));
  ['折射法', '干涉法', '衍射法', '旋光法', '圆二色性法'].forEach((s, k) => {
    const p = G(g, { in: at(id, 6) + 0.6 + k * 0.35, fx: 'scale', ox: 820 + k * 200, oy: 775 });
    box(p, 740 + k * 200, 743, 184, 64, s, { size: 22, stroke: C.line });
  });
  link(650, 775, 740, 775, at(id, 6) + 0.5);
  T(G(g, { in: at(id, 2) + 0.5 }), 430, 545, '测辐射随波长的分布', { size: 20, fill: C.muted, cls: 'note' });
  T(G(g, { in: at(id, 6) + 0.5 }), 430, 845, '不测光谱，测折射、偏振等变化', { size: 20, fill: C.muted, cls: 'note' });
  const hi = G(g, { in: at(id, 7), fx: 'none' });
  el('rect', { x: 1215, y: 330, width: 210, height: 84, rx: 16, fill: 'none', stroke: C.gold, 'stroke-width': 5, filter: 'url(#glow)' }, hi);
  T(hi, 1320, 460, '本章：原子吸收光谱（AAS）', { size: 28, anchor: 'middle', fill: C.gold, weight: 700 });
  U.push(t => { if (AA[0]) AA[0].firstChild.setAttribute('stroke', t > at(id, 7) ? C.gold : C.line); });
});

/* ================= history ================= */
S.push(function history() {
  const id = 'history', g = sceneGroup(id);
  title(g, id, '原子吸收光谱的发现与发展', '课件 P8–14');
  // A: solar spectrum & Fraunhofer lines
  const A = G(g, { in: at(id, 0), out: at(id, 6) - 0.4, fx: 'none' });
  const X = l => 160 + (l - 380) / 400 * 1600;
  el('rect', { x: 160, y: 420, width: 1600, height: 150, rx: 6, fill: 'url(#rainbow)' }, A);
  T(A, 160, 610, '380 nm', { size: 20, fill: C.muted });
  T(A, 1760, 610, '780 nm', { size: 20, fill: C.muted, anchor: 'end' });
  T(A, 160, 380, '太阳光谱（示意）', { size: 24, fill: C.muted });
  const rr = window.ENG.rng(11);
  const faint = G(A, { in: at(id, 1), fx: 'none' });
  for (let k = 0; k < 70; k++) el('rect', { x: X(390 + rr() * 380), y: 420, width: 1.5, height: 150, fill: '#05080F', opacity: 0.35 + rr() * 0.35 }, faint);
  const FL = [['A', 759.4, 'O_{2}'], ['B', 686.7, 'O_{2}'], ['C', 656.3, 'H'], ['D', 589.3, 'Na'], ['E', 527.0, 'Fe'], ['F', 486.1, 'H'], ['G', 430.8, 'Fe/Ca'], ['H', 396.8, 'Ca^{+}']];
  const fg = G(A, { in: at(id, 2) + 1, fx: 'none' });
  FL.forEach(([n, l, elm], k) => {
    const lg = G(fg, { in: at(id, 2) + 1 + k * 0.25, fx: 'none' });
    el('rect', { x: X(l) - 2.5, y: 420, width: n === 'D' ? 7 : 5, height: 150, fill: '#05080F' }, lg);
    T(lg, X(l), 410 - (k % 2) * 0, n, { size: 26, anchor: 'middle', weight: 700, fill: C.gold });
    const hl = G(lg, { in: at(id, 3), fx: 'none' });
    T(hl, X(l), 650, elm, { size: 22, anchor: 'middle', fill: ['C', 'D', 'F'].includes(n) ? C.gold : C.muted });
    T(hl, X(l), 680, l.toFixed(1), { size: 18, anchor: 'middle', fill: C.muted });
  });
  T(G(A, { in: at(id, 3) + 2 }), 1760, 720, 'D 线实为钠双线：D_{2} 589.0 nm、D_{1} 589.6 nm', { size: 22, anchor: 'end', fill: C.gold });
  T(G(A, { in: at(id, 3) + 0.4 }), 160, 720, '注：课件 P8 把 E 线写成“铁 430.790”，E 线实为 Fe 527.0 nm（430.8 nm 是 G 线）', { size: 18, fill: C.muted, cls: 'note' });
  const yrs = [[1, '1802', '伍朗斯顿', '发现太阳光谱中的暗线'], [2, '1814', '夫琅和费', '观察 500 多条暗线，8 条最明显的标 A–H'], [4, '1859', '克希荷夫 · 本生', '每条暗线对应一种元素']];
  yrs.forEach(([li, y, who, what], k) => {
    const p = G(A, { in: at(id, li), fx: 'up' });
    card(p, 160 + k * 545, 770, 510, 130, { stroke: C.cyanDeep });
    T(p, 190 + k * 545, 820, y, { size: 34, weight: 700, fill: C.cyan });
    T(p, 300 + k * 545, 820, who, { size: 28, weight: 600, maxw: 350 });
    T(p, 190 + k * 545, 868, what, { size: 22, fill: C.muted, maxw: 460 });
  });
  const why = G(A, { in: at(id, 5), fx: 'none' });
  card(why, 160, 236, 1600, 96, { stroke: C.gold, fill: 'rgba(247,197,72,.07)' });
  T(why, 960, 296, '太阳内部发出连续光谱 → 穿过太阳大气 → 大气中的原子吸收各自的特征波长 → 暗线', { size: 28, anchor: 'middle', fill: C.gold, maxw: 1560 });

  // B: stars & Doppler
  const B = G(g, { in: at(id, 6), out: at(id, 8) - 0.4, fx: 'none' });
  T(B, 160, 290, '恒星光谱（哈佛分类，19 世纪末）', { size: 28, weight: 700 });
  const stars = [['B', '#9FC3FF', [420, 447, 471, 486]], ['A', '#D8E6FF', [410, 434, 486, 656]], ['G', '#FFE9A8', [393, 397, 431, 517, 589, 656]], ['M', '#FF9A6B', [430, 476, 517, 589, 616, 671, 706]]];
  stars.forEach(([cls, col, lines], k) => {
    const y = 330 + k * 92;
    el('circle', { cx: 190, cy: y + 30, r: 24, fill: col, filter: 'url(#glow)' }, B);
    T(B, 240, y + 40, cls, { size: 28, weight: 700 });
    el('rect', { x: 290, y, width: 700, height: 60, rx: 4, fill: 'url(#rainbow)' }, B);
    lines.forEach(l => el('rect', { x: 290 + (l - 380) / 400 * 700, y, width: 4, height: 60, fill: '#05080F' }, B));
  });
  T(B, 160, 730, '吸收线的波长和吸光度 → 恒星表层大气的成分', { size: 26, fill: C.gold, maxw: 840 });
  const dp = G(B, { in: at(id, 7), fx: 'none' });
  card(dp, 1060, 270, 760, 620, { stroke: C.violet });
  T(dp, 1100, 330, '多普勒效应：谱线整体移动', { size: 30, weight: 700, fill: C.violet });
  const rows = [['实验室', 0, C.muted], ['远离我们 → 红移', 1, C.red], ['靠近我们 → 蓝移', -1, C.blue]];
  const shifts = [];
  rows.forEach(([lbl, dir, c], k) => {
    const y = 400 + k * 150;
    T(dp, 1100, y - 12, lbl, { size: 24, fill: c });
    el('rect', { x: 1100, y, width: 680, height: 60, rx: 4, fill: 'url(#rainbow)' }, dp);
    const lg = el('g', {}, dp);
    [440, 486, 589, 656].forEach(l => el('rect', { x: 1100 + (l - 380) / 400 * 680, y, width: 4, height: 60, fill: '#05080F' }, lg));
    shifts.push([lg, dir]);
  });
  T(dp, 1100, 870, '红移规律 → 宇宙膨胀 → 大爆炸理论的重要证据', { size: 24, fill: C.gold, maxw: 700 });
  U.push(t => shifts.forEach(([lg, dir]) => lg.setAttribute('transform', `translate(${(dir * 46 * E(t, at(id, 7) + 0.5, 1.5)).toFixed(1)} 0)`)));

  // C: becoming an instrument
  const Cg = G(g, { in: at(id, 8), out: at(id, 12) - 0.4, fx: 'none' });
  el('line', { x1: 160, y1: 470, x2: 1760, y2: 470, stroke: C.line, 'stroke-width': 4 }, Cg);
  const ms = [[8, 330, '1955', '沃尔什 Walsh', ['提出峰值吸收原理', '解决带宽和光强问题', '定量测量成为可能'], C.gold],
    [9, 860, '1959', '里沃夫 L’vov', ['开创石墨炉', '电热原子吸收法'], C.cyan],
    [10, 1390, '50 年代末–60 年代初', '商品仪器问世', ['Hilger、Varian Techtron、', 'Perkin-Elmer 等公司'], C.violet]];
  ms.forEach(([li, x, yr, who, lines, c]) => {
    const p = G(Cg, { in: at(id, li), fx: 'up' });
    el('circle', { cx: x, cy: 470, r: 16, fill: c }, p);
    T(p, x, 420, yr, { size: yr.length > 6 ? 26 : 40, anchor: 'middle', weight: 700, fill: c, maxw: 440 });
    card(p, x - 230, 510, 460, 200, { stroke: c });
    T(p, x, 560, who, { size: 28, anchor: 'middle', weight: 700, maxw: 420 });
    lines.forEach((s, j) => T(p, x, 605 + j * 36, s, { size: 23, anchor: 'middle', fill: C.muted, maxw: 420 }));
  });
  const fr = G(Cg, { in: at(id, 11) });
  card(fr, 160, 750, 1600, 150, { stroke: C.green });
  T(fr, 200, 805, '前沿', { size: 30, weight: 700, fill: C.green });
  T(fr, 320, 805, '① 连续光源原子吸收光谱仪（如耶拿 contrAA 系列）：可多元素同时检测', { size: 25, maxw: 1420 });
  T(fr, 320, 860, '② 色谱 – 原子吸收联用：测定有机化合物的复杂混合物（形态分析）', { size: 25, maxw: 1420 });

  // D: applications
  const Dg = G(g, { in: at(id, 12), fx: 'none' });
  const apps = [['临床医学', '头发中微量元素 · 血液中微量镉', C.red], ['食品分析', '罐头中痕量锡 · 酱油中砷', C.gold], ['环境分析', '工业污水中的金属', C.green],
    ['药物分析', '药物中重金属铅 · 中药中的铜', C.violet], ['冶金', '矿石中的金属分析', C.blue], ['化工', '催化剂中镍含量', C.orange]];
  apps.forEach(([h, s, c], k) => {
    const x = 160 + (k % 3) * 540, y = 290 + Math.floor(k / 3) * 300;
    const p = G(Dg, { in: at(id, 12) + k * 0.4, fx: 'scale', ox: x + 250, oy: y + 120 });
    card(p, x, y, 500, 250, { stroke: c });
    T(p, x + 250, y + 100, h, { size: 38, anchor: 'middle', weight: 700, fill: c });
    T(p, x + 250, y + 165, s, { size: 24, anchor: 'middle', fill: C.text, maxw: 460 });
  });
});

/* ================= 8-2: measuring Mg ================= */
S.push(function mg() {
  const id = 'mg', g = sceneGroup(id);
  title(g, id, '8-2 基本原理 · 例：测镁', '课件 P15');
  const y = 470;
  const ap = G(g, { in: at(id, 0) + 0.5, fx: 'none' });
  lampIcon(ap, 230, y, 'Mg 空心阴极灯');
  // flame + atoms
  const fl = flameIcon(ap, 760, y + 70, 1.1, '雾化 → 原子蒸气');
  const atoms = [];
  const rr = window.ENG.rng(5);
  for (let k = 0; k < 14; k++) atoms.push(el('circle', { cx: 700 + rr() * 120, cy: y - 40 + rr() * 80, r: 7, fill: C.cyan }, ap));
  el('rect', { x: 1060, y: y - 70, width: 180, height: 140, rx: 14, fill: C.panel2, stroke: C.cyanDeep, 'stroke-width': 2 }, ap);
  el('path', { d: `M1110 ${y + 40} L1150 ${y - 40} L1190 ${y + 40}z`, fill: 'rgba(61,213,243,.2)', stroke: C.cyan, 'stroke-width': 2 }, ap);
  T(ap, 1150, y + 120, '单色器', { size: 22, fill: C.muted, anchor: 'middle' });
  el('rect', { x: 1360, y: y - 60, width: 120, height: 120, rx: 12, fill: C.panel2, stroke: C.cyanDeep, 'stroke-width': 2 }, ap);
  el('circle', { cx: 1420, cy: y, r: 30, fill: 'none', stroke: C.cyan, 'stroke-width': 4 }, ap);
  T(ap, 1420, y + 120, '检测器', { size: 22, fill: C.muted, anchor: 'middle' });
  card(ap, 1580, y - 80, 260, 160, { stroke: C.gold });
  T(ap, 1710, y - 30, 'Mg 含量', { size: 24, fill: C.gold, anchor: 'middle' });
  const read = T(ap, 1710, y + 40, '—', { size: 40, anchor: 'middle', weight: 700, mono: true });
  const b1 = el('rect', { x: 290, y: y - 10, height: 20, fill: C.gold, rx: 3 }, ap);
  const b2 = el('rect', { x: 840, y: y - 6, height: 12, fill: C.gold, opacity: 0.55, rx: 3 }, ap);
  T(G(ap, { in: at(id, 2) + 1 }), 520, y - 40, 'λ = 285.2 nm', { size: 26, anchor: 'middle', fill: C.gold, weight: 700 });
  U.push(t => {
    const s1 = E(t, at(id, 1), 1.2);
    atoms.forEach((a, j) => { a.setAttribute('opacity', (s1 * (j < 14 ? 1 : 0)).toFixed(2)); });
    b1.setAttribute('width', (390 * E(t, at(id, 2), 1)).toFixed(1));
    const k3 = E(t, at(id, 3), 1.4);
    atoms.forEach((a, j) => a.setAttribute('fill', j < Math.round(14 * k3 * 0.6) ? C.gold : C.cyan));
    b2.setAttribute('width', (520 * E(t, at(id, 3) + 0.6, 1)).toFixed(1));
    b2.setAttribute('opacity', lerp(0.9, 0.45, k3).toFixed(2));
    read.textContent = t > at(id, 4) + 1.5 ? 'A → c' : '—';
  });
  const steps = [['① 试液喷成雾状 → 挥发成蒸气', 1], ['② 镁空心阴极灯发出 285.2 nm 特征谱线', 2], ['③ 部分光被基态镁原子吸收而减弱', 3], ['④ 单色器 + 检测器测减弱程度 → 求 Mg 含量', 4]];
  steps.forEach(([s, li], k) => {
    const p = G(g, { in: at(id, li), fx: 'up' });
    card(p, 120 + (k % 2) * 850, 690 + Math.floor(k / 2) * 110, 820, 90, { stroke: C.cyanDeep });
    T(p, 150 + (k % 2) * 850, 747 + Math.floor(k / 2) * 110, s, { size: 27, maxw: 770 });
    focus(p, at(id, li), end(id, li) + 0.5, 0.55);
  });
  const an = G(g, { in: at(id, 5), fx: 'none' });
  card(an, 1180, 240, 680, 100, { stroke: C.gold, fill: 'rgba(247,197,72,.08)' });
  T(an, 1520, 302, '太阳光 → 太阳大气 → 暗线：同一个道理', { size: 26, anchor: 'middle', fill: C.gold, maxw: 640 });
});

/* ================= resonance lines ================= */
S.push(function res() {
  const id = 'res', g = sceneGroup(id);
  title(g, id, '一、共振线', '课件 P16–18');
  const L = G(g, { in: at(id, 0), fx: 'none' });
  const lv = [[840, 'E_{0} = 0  基态', C.muted], [540, 'E_{1}  第一激发态', C.cyan], [455, 'E_{2}', C.dim], [405, 'E_{3}', C.dim], [375, 'E_{4}', C.dim]];
  lv.forEach(([y, s, c], k) => {
    const p = G(L, { in: k === 0 ? at(id, 0) : at(id, 1) + (k - 1) * 0.25, fx: 'none' });
    el('line', { x1: 180, y1: y, x2: 700, y2: y, stroke: c, 'stroke-width': k < 2 ? 4 : 2 }, p);
    T(p, 720, y + 9, s, { size: k < 2 ? 26 : 20, fill: c });
  });
  const e = el('circle', { cx: 440, r: 14, fill: C.gold, filter: 'url(#glow)' }, L);
  const ph = el('path', { d: 'M0 0 q12 -16 24 0 t24 0 t24 0 t24 0 t24 0', stroke: C.gold, 'stroke-width': 3.5, fill: 'none' }, L);
  const ph2 = el('path', { d: 'M0 0 q12 -16 24 0 t24 0 t24 0 t24 0 t24 0', stroke: C.gold, 'stroke-width': 3.5, fill: 'none' }, L);
  U.push(t => {
    // absorb (line 1, again line 3), emit (line 4)
    const up1 = E(t, at(id, 1) + 0.8, 0.7), dn1 = E(t, at(id, 2) + 2.0, 0.5);
    const up2 = E(t, at(id, 3) + 0.8, 0.7), dn2 = E(t, at(id, 4) + 0.3, 0.7);
    let k = up1 - dn1; if (t > at(id, 3)) k = up2 - dn2;
    e.setAttribute('cy', lerp(840, 540, Math.max(0, k)).toFixed(1));
    const ia = t < at(id, 3) ? at(id, 1) : at(id, 3);
    const pa = prog(t, ia, 0.8);
    ph.setAttribute('transform', `translate(${lerp(40, 300, pa).toFixed(1)} 760)`);
    ph.setAttribute('opacity', (pa > 0 && pa < 1 ? 1 : 0).toString());
    const pe = prog(t, at(id, 4) + 0.6, 1.0);
    ph2.setAttribute('transform', `translate(${lerp(480, 760, pe).toFixed(1)} 640)`);
    ph2.setAttribute('opacity', (pe > 0 && pe < 1 ? 1 : 0).toString());
  });
  const fm = G(g, { in: at(id, 2) });
  T(fm, 440, 950 - 30, 'ΔE = E_{1} − E_{0} = hν = hc / λ', { size: 34, anchor: 'middle', weight: 700, fill: C.gold });
  const ab = G(g, { in: at(id, 3) + 0.4 });
  D(arrow(ab, 300, 836, 300, 548, C.cyan, 4), at(id, 3) + 0.4, 0.6);
  T(ab, 285, 690, '共振吸收线', { size: 24, fill: C.cyan, anchor: 'end', weight: 600 });
  const em = G(g, { in: at(id, 4) });
  D(arrow(em, 580, 544, 580, 834, C.gold, 4), at(id, 4), 0.6);
  T(em, 598, 690, '共振发射线', { size: 24, fill: C.gold, weight: 600 });
  // right card: characteristic lines
  const R = G(g, { in: at(id, 5), fx: 'none' });
  card(R, 960, 250, 900, 640, { stroke: C.cyanDeep });
  T(R, 1000, 305, '共振线 = 元素的“指纹”', { size: 32, weight: 700, fill: C.cyan });
  const ax = G(R, { in: at(id, 5) + 0.3 });
  el('line', { x1: 1000, y1: 700, x2: 1820, y2: 700, stroke: C.muted, 'stroke-width': 2 }, ax);
  [200, 300, 400, 500, 600].forEach(v => { const x = 1000 + (v - 200) / 400 * 800; el('line', { x1: x, y1: 700, x2: x, y2: 710, stroke: C.muted }, ax); T(ax, x, 738, String(v), { size: 18, fill: C.muted, anchor: 'middle' }); });
  T(ax, 1820, 770, 'λ / nm', { size: 20, fill: C.muted, anchor: 'end' });
  const ellist = [['Zn', 213.9, C.violet], ['Fe', 248.3, C.orange], ['Mg', 285.2, C.cyan], ['Cu', 324.8, C.gold], ['Ca', 422.7, C.green], ['Na', 589.0, C.pink]];
  ellist.forEach(([s, l, c], k) => {
    const x = 1000 + (l - 200) / 400 * 800;
    const p = G(ax, { in: at(id, 5) + 0.5 + k * 0.3, fx: 'up' });
    el('rect', { x: x - 3, y: 400, width: 6, height: 300, fill: c, filter: 'url(#glow)' }, p);
    T(p, x, 380 - (k % 2) * 36, `${s} ${l}`, { size: 20, anchor: 'middle', fill: c, weight: 700 });
  });
  T(G(R, { in: at(id, 6) }), 1000, 820, '不同元素外层电子排布不同 → 共振线波长不同 → 特征谱线', { size: 24, maxw: 820 });
  T(G(R, { in: at(id, 7) }), 1000, 862, '对大多数元素，共振线也是最灵敏的“灵敏线”', { size: 24, fill: C.gold, maxw: 820 });
  T(G(R, { in: at(id, 5) + 2 }), 1820, 305, '常用分析线（补充）', { size: 18, fill: C.muted, anchor: 'end', cls: 'note' });
  const fin = G(g, { in: at(id, 8), fx: 'none' });
  card(fin, 60, 250, 860, 90, { stroke: C.gold, fill: 'rgba(247,197,72,.08)' });
  T(fin, 490, 307, 'AAS：测基态原子蒸气对共振线的吸收', { size: 30, anchor: 'middle', fill: C.gold, weight: 700, maxw: 820 });
});
})();
