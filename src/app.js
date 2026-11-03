/*
 * 电位分析法 · 一分钟动态思维导图
 * Rendering model: every visual property is a pure function of time t (seconds).
 * render(t) can therefore be called for any t (scrubbing, frame-exact video export).
 */
(() => {
'use strict';

const L = window.LESSON;
const DUR = L.duration;
const SEG = Object.fromEntries(L.segments.map(s => [s.id, s]));
const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('stage');

const C = {
  bg0: '#0B1A2E', bg1: '#06101F', panel: '#0F2138', panel2: '#132A47', line: '#1D3554',
  text: '#EAF2FB', muted: '#8EA3BC', dim: '#5D7390',
  cyan: '#3DD5F3', cyanDeep: '#1B6E86', gold: '#F7C548', goldDeep: '#7A5C14',
  ref: '#C3CEDD', glass: '#9FB8D0', ion: '#FF8A7A', fion: '#7EE0B0', counter: '#6C8CFF'
};

/* ---------- math helpers ---------- */
const clamp = x => Math.max(0, Math.min(1, x));
const prog = (t, a, d) => clamp((t - a) / d);
const ease = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = x => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, k) => a + (b - a) * k;
const E = (t, a, d) => ease(prog(t, a, d));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let r = Math.imul(seed ^ seed >>> 15, 1 | seed); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }

/* ---------- DOM helpers ---------- */
function el(tag, attrs = {}, parent = svg) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function setAttrs(e, a) { for (const k in a) e.setAttribute(k, a[k]); }

// Rich text: "pH_{试}", "H^{+}" → sub/superscript tspans.
function setRich(e, s, size) {
  while (e.firstChild) e.removeChild(e.firstChild);
  const re = /([_^])\{([^}]*)\}/g;
  let i = 0, m, shift = 0;
  const add = (str, o = {}) => {
    const ts = el('tspan', {}, e); ts.textContent = str;
    if (o.size) ts.setAttribute('font-size', o.size);
    if (o.dy) ts.setAttribute('dy', o.dy.toFixed(2));
  };
  while ((m = re.exec(s))) {
    if (m.index > i) { add(s.slice(i, m.index), { dy: -shift }); shift = 0; }
    const sh = m[1] === '_' ? size * 0.28 : -size * 0.38;
    add(m[2], { size: (size * 0.68).toFixed(1), dy: sh - shift });
    shift = sh; i = re.lastIndex;
  }
  if (i < s.length) add(s.slice(i), { dy: -shift });
  else if (shift) add('​', { dy: -shift });
}
function T(parent, x, y, s, o = {}) {
  const size = o.size || 24;
  const e = el('text', {
    x, y, 'font-size': size, fill: o.fill || C.text, 'text-anchor': o.anchor || 'start',
    'font-weight': o.weight || 400, class: o.cls, 'data-maxw': o.maxw, opacity: o.op
  }, parent);
  setRich(e, s, size);
  return e;
}

/* ---------- timeline registries ---------- */
const R = [];   // reveal groups
const DR = [];  // stroke draw-on
const U = [];   // custom per-frame updaters

// Group that fades/slides in at `in`, fades out at `out`.
function G(parent, o = {}) {
  const g = el('g', { class: o.cls }, parent);
  if (o.in != null || o.out != null) {
    R.push({ g, tin: o.in ?? -1, din: o.d ?? 0.6, tout: o.out, dout: o.od ?? 0.5,
      fx: o.fx || 'up', dy: o.dy ?? 16, ox: o.ox || 0, oy: o.oy || 0 });
  }
  return g;
}
function D(path, t0, dur = 0.8) {
  path.setAttribute('pathLength', 1);
  path.setAttribute('stroke-dasharray', '1 1');
  DR.push({ p: path, t0, dur });
  return path;
}
function applyReveals(t) {
  for (const r of R) {
    const ai = ease(prog(t, r.tin, r.din));
    const ao = r.tout != null ? 1 - ease(prog(t, r.tout, r.dout)) : 1;
    const a = ai * ao;
    if (a <= 0.002) { r.g.setAttribute('display', 'none'); continue; }
    r.g.removeAttribute('display');
    r.g.setAttribute('opacity', a.toFixed(3));
    let tr = '';
    if (r.fx === 'up') tr = `translate(0 ${((1 - ai) * r.dy).toFixed(2)})`;
    else if (r.fx === 'left') tr = `translate(${((1 - ai) * -r.dy).toFixed(2)} 0)`;
    else if (r.fx === 'scale') { const s = 0.6 + 0.4 * eo(prog(t, r.tin, r.din)); tr = `translate(${r.ox} ${r.oy}) scale(${s.toFixed(3)}) translate(${-r.ox} ${-r.oy})`; }
    if (tr) r.g.setAttribute('transform', tr); else r.g.removeAttribute('transform');
  }
  for (const d of DR) d.p.setAttribute('stroke-dashoffset', (1 - eo(prog(t, d.t0, d.dur))).toFixed(4));
}

/* ---------- shared drawing primitives ---------- */
function beaker(parent, x, y, w, h, fillTop, tint = C.cyan, tintOp = 0.14) {
  const g = el('g', {}, parent);
  el('rect', { x: x + 3, y: fillTop, width: w - 6, height: y + h - fillTop - 3, rx: 14, fill: tint, opacity: tintOp }, g);
  el('line', { x1: x + 4, y1: fillTop, x2: x + w - 4, y2: fillTop, stroke: tint, 'stroke-width': 2, opacity: 0.55 }, g);
  const p = el('path', { d: `M${x} ${y} V${y + h - 18} Q${x} ${y + h} ${x + 18} ${y + h} H${x + w - 18} Q${x + w} ${y + h} ${x + w} ${y + h - 18} V${y}`,
    fill: 'none', stroke: '#7FA7C9', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  return { g, p };
}
function ion(parent, x, y, sign = '+', color = C.ion, r = 9) {
  const g = el('g', { transform: `translate(${x} ${y})` }, parent);
  el('circle', { r, fill: color, opacity: 0.9 }, g);
  T(g, 0, r * 0.42, sign, { size: r * 1.3, anchor: 'middle', fill: '#0B1A2E', weight: 700 });
  return g;
}
function pill(parent, x, y, w, h, s, o = {}) {
  const g = el('g', {}, parent);
  el('rect', { x, y, width: w, height: h, rx: h / 2, fill: o.bg || 'rgba(61,213,243,.08)', stroke: o.stroke || C.cyan, 'stroke-width': 1.6 }, g);
  T(g, x + w / 2, y + h / 2 + (o.size || 22) * 0.36, s, { size: o.size || 22, anchor: 'middle', fill: o.fill || C.cyan, weight: o.weight || 500, maxw: w - 20 });
  return g;
}
function arrow(parent, x1, y1, x2, y2, color = C.cyan, w = 2.5, dash) {
  return el('path', { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: color, 'stroke-width': w, fill: 'none',
    'marker-end': `url(#arr-${color === C.gold ? 'gold' : 'cyan'})`, 'stroke-dasharray': dash }, parent);
}
// Nernst-type formula with a real fraction. Returns group; centered at (cx, cy).
function fracFormula(parent, cx, cy, size, left, num, den, right, color = C.gold) {
  const g = el('g', {}, parent);
  const tl = T(g, 0, cy + size * 0.35, left, { size, fill: color, weight: 500 });
  const tn = T(g, 0, cy - size * 0.18, num, { size: size * 0.72, fill: color, anchor: 'middle', weight: 500 });
  const td = T(g, 0, cy + size * 0.72, den, { size: size * 0.72, fill: color, anchor: 'middle', weight: 500 });
  const tr = T(g, 0, cy + size * 0.35, right, { size, fill: color, weight: 500 });
  const bar = el('line', { stroke: color, 'stroke-width': Math.max(2, size / 20) }, g);
  const wl = tl.getComputedTextLength(), wn = tn.getComputedTextLength(), wd = td.getComputedTextLength(), wr = tr.getComputedTextLength();
  const wf = Math.max(wn, wd) + size * 0.3, gap = size * 0.18;
  const total = wl + gap + wf + gap + wr;
  let x = cx - total / 2;
  tl.setAttribute('x', x); x += wl + gap;
  tn.setAttribute('x', x + wf / 2); td.setAttribute('x', x + wf / 2);
  setAttrs(bar, { x1: x, x2: x + wf, y1: cy + size * 0.05, y2: cy + size * 0.05 });
  x += wf + gap; tr.setAttribute('x', x);
  g.dataset.w = total;
  return g;
}
function axes(parent, ox, oy, w, h, xl, yl) {
  const g = el('g', {}, parent);
  el('path', { d: `M${ox} ${oy} H${ox + w}`, stroke: C.muted, 'stroke-width': 2, 'marker-end': 'url(#arr-muted)' }, g);
  el('path', { d: `M${ox} ${oy} V${oy - h}`, stroke: C.muted, 'stroke-width': 2, 'marker-end': 'url(#arr-muted)' }, g);
  T(g, ox + w + 6, oy + 30, xl, { size: 22, fill: C.muted, anchor: 'end' });
  T(g, ox - 12, oy - h + 6, yl, { size: 22, fill: C.muted, anchor: 'end' });
  return g;
}
function sceneTitle(parent, kicker, title, tin) {
  const g = G(parent, { in: tin, d: 0.6 });
  T(g, 760, 126, kicker, { size: 26, fill: C.cyan, weight: 500 });
  T(g, 760, 180, title, { size: 40, weight: 700, maxw: 1110 });
  return g;
}

/* =====================================================================
 * Build
 * ===================================================================== */
function build() {
  /* ---- defs ---- */
  const defs = el('defs');
  defs.innerHTML = `
    <radialGradient id="bgGrad" cx="50%" cy="42%" r="75%">
      <stop offset="0" stop-color="${C.bg0}"/><stop offset="1" stop-color="${C.bg1}"/>
    </radialGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.2" fill="#1C3352"/>
    </pattern>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <marker id="arr-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.cyan}"/></marker>
    <marker id="arr-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.gold}"/></marker>
    <marker id="arr-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.muted}"/></marker>
    <linearGradient id="indGrad" x1="0" x2="1"><stop offset="0" stop-color="#1A4E78"/><stop offset=".5" stop-color="#2A77AE"/><stop offset="1" stop-color="#1A4E78"/></linearGradient>
    <linearGradient id="refGrad" x1="0" x2="1"><stop offset="0" stop-color="#3D4B5E"/><stop offset=".5" stop-color="#66778D"/><stop offset="1" stop-color="#3D4B5E"/></linearGradient>
    <pattern id="crystal" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="#E9C46A"/><path d="M0 10L10 0" stroke="#B8902F" stroke-width="1.4"/>
    </pattern>
    <pattern id="porous" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="#8B7355"/><circle cx="3" cy="3" r="1.2" fill="#5B4A36"/>
    </pattern>
    <clipPath id="clipG4"><rect x="1440" y="230" width="420" height="312"/></clipPath>`;

  /* ---- background ---- */
  el('rect', { width: 1920, height: 1080, fill: 'url(#bgGrad)' });
  el('rect', { width: 1920, height: 1080, fill: 'url(#dots)', opacity: 0.55 });
  T(svg, 60, 64, '现代分析仪器及应用 · 第 4 章 电位分析法', { size: 22, fill: C.muted });

  // divider between map and scene panel
  const div = G(svg, { in: 5.0, out: 55.6, fx: 'none' });
  el('line', { x1: 720, y1: 230, x2: 720, y2: 880, stroke: C.line, 'stroke-width': 2 }, div);

  buildIntro();
  buildMap();      // persistent mind map (compact → full summary)
  buildScene1();
  buildScene2();
  buildScene3();
  buildScene4();
  buildScene5();
  buildFinal();
  buildCaption();
}

/* ---------- 0–5 s: phenomenon first ---------- */
function buildIntro() {
  const g = G(svg, { in: 0, d: 0.4, out: 4.1, od: 0.7, fx: 'none' });
  T(g, 960, 170, '先看现象', { size: 24, fill: C.muted, anchor: 'middle' });
  // pH meter
  el('rect', { x: 560, y: 250, width: 360, height: 230, rx: 22, fill: C.panel, stroke: C.line, 'stroke-width': 2 }, g);
  el('rect', { x: 590, y: 280, width: 300, height: 124, rx: 10, fill: '#050D19', stroke: C.cyanDeep, 'stroke-width': 2 }, g);
  T(g, 608, 314, 'pH', { size: 24, fill: C.muted });
  const val = T(g, 872, 384, '--.--', { size: 76, fill: C.cyan, anchor: 'end', weight: 500 });
  T(g, 740, 452, 'pH 计', { size: 22, fill: C.muted, anchor: 'middle' });
  // cup of water
  el('rect', { x: 1063, y: 520, width: 234, height: 177, rx: 12, fill: C.cyan, opacity: 0.13 }, g);
  el('path', { d: 'M1050 420 L1066 690 Q1068 700 1080 700 H1280 Q1292 700 1294 690 L1310 420', fill: 'none', stroke: '#7FA7C9', 'stroke-width': 3 }, g);
  const ripple = el('ellipse', { cx: 1180, cy: 520, rx: 30, ry: 6, fill: 'none', stroke: C.cyan, 'stroke-width': 2 }, g);
  T(g, 1180, 750, '一杯待测的水', { size: 22, fill: C.muted, anchor: 'middle' });
  // probe + cable
  const cable = el('path', { fill: 'none', stroke: '#4F6C8E', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
  const probe = el('g', {}, g);
  el('rect', { x: -18, y: 0, width: 36, height: 250, rx: 10, fill: 'url(#indGrad)', stroke: C.glass, 'stroke-width': 2 }, probe);
  el('circle', { cx: 0, cy: 262, r: 18, fill: 'rgba(61,213,243,.25)', stroke: C.gold, 'stroke-width': 3 }, probe);

  U.push(t => {
    const k = E(t, 0.6, 1.2);
    const top = lerp(110, 330, k);
    probe.setAttribute('transform', `translate(1180 ${top})`);
    cable.setAttribute('d', `M920 330 C1010 330 1060 ${top - 120} 1180 ${top}`);
    const rk = prog(t, 1.75, 0.9);
    setAttrs(ripple, { rx: 30 + rk * 110, ry: 6 + rk * 12, opacity: rk > 0 && rk < 1 ? (1 - rk).toFixed(2) : 0 });
    let s = '--.--';
    if (t >= 1.8 && t < 3.0) { const n = Math.floor(t * 14); s = (2 + ((n * 37) % 900) / 100).toFixed(2); }
    else if (t >= 3.0) s = '5.50';
    if (val.textContent !== s) val.textContent = s;
  });

  // The question: big in the intro, then shrinks into the centre node of the mind map.
  const q = el('g', { id: 'question' }, svg);
  const qt = T(q, 0, 0, 'pH 计为什么能知道一杯水有多酸？', { size: 64, weight: 700, anchor: 'middle' });
  U.push(t => {
    const a = E(t, 2.6, 0.7);
    if (a <= 0) { q.setAttribute('display', 'none'); return; }
    q.removeAttribute('display');
    const k = E(t, 4.1, 0.9), kf = E(t, 56.0, 1.6);
    let x = lerp(960, 370, k), y = lerp(880, 567, k), s = lerp(1, 0.29, k);
    x = lerp(x, 960, kf); y = lerp(y, 268, kf); s = lerp(s, 0.42, kf);
    q.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(4)})`);
    q.setAttribute('opacity', a.toFixed(3));
    qt.setAttribute('fill', k > 0.5 ? C.muted : C.text);
  });
}

/* ---------- persistent mind map ---------- */
const BR = [
  { n: 1, label: '测什么？',         key: '零电流 · 电位差',   pc: [220, 320], card: [60, 150, 560, 340],  seg: 'b1',
    bullets: ['近似零电流下，测两电极间电位差', '电位差（电动势 E）反映离子活度 a', 'a = γc：可理解为“有效浓度”'], pages: '课件 P13、15–16' },
  { n: 2, label: '为什么能测？',     key: '能斯特方程',        pc: [160, 650], card: [60, 520, 560, 340],  seg: 'b2',
    bullets: ['能斯特方程：E 与 lg a 呈直线', 'a 变 → E 变 → 校准后由 E 反推 a', '斜率 2.303RT/nF：25 ℃、n=1 约 59.16 mV'], pages: '课件 P16–19、46、58' },
  { n: 3, label: '用什么测？',       key: '指示 + 参比电极',   pc: [520, 320], card: [1300, 150, 560, 340], seg: 'b3',
    bullets: ['指示电极（玻璃电极）：随活度变 = 传感器', '参比电极（甘汞、Ag-AgCl）：电位恒定 = 基准', '敏感玻璃膜对 H^{+} 响应'], pages: '课件 P20–26' },
  { n: 4, label: '怎样测 pH？',      key: '先校准 · 再测定',   pc: [580, 650], card: [1300, 520, 560, 340], seg: 'b4',
    bullets: ['K′ 无法确定 → 先用标准缓冲液定位', 'pH_{试} = pH_{标} + ΔE ÷ 59.16 mV（25 ℃）', '缓冲液只用于校准，不加入样品'], pages: '课件 P27、31–35' },
  { n: 5, label: '其他离子 · 测准',  key: 'ISE · 定量 · 误差',  pc: [370, 800], card: [680, 520, 560, 340],  seg: 'b5',
    bullets: ['换敏感膜：LaF_{3} 单晶 → F^{−} 电极', '标准曲线法 / 标准加入法', '恒温 · TISAB · 控干扰 · 等读数稳定'], pages: '课件 P40、46、55、58–70' }
];
const PILL_W = 240, PILL_H = 76;
let jumpTo = () => {};

function buildMap() {
  const map = el('g', { id: 'map' });
  const links = el('g', {}, map);
  const nodes = el('g', {}, map);

  // centre node
  const cg = el('g', {}, map);
  const cRect = el('rect', { rx: 22, fill: C.panel, stroke: C.cyan, 'stroke-width': 2.5 }, cg);
  const cTitle = el('g', {}, cg);
  T(cTitle, 0, 0, '电位分析法', { size: 40, weight: 700, anchor: 'middle', fill: C.gold });
  // final-only content inside centre node
  const cExtra = G(cg, { in: 57.3, d: 0.8 });
  T(cExtra, 960, 334, '测电位差 E  →  反推离子活度 a  →  得到 pH 或浓度', { size: 24, anchor: 'middle', fill: C.text, maxw: 520 });
  fracFormula(cExtra, 960, 410, 40, 'E = K ±', '2.303RT', 'nF', 'lg a');

  const items = BR.map((b, i) => {
    const link = el('path', { fill: 'none', stroke: C.cyan, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, links);
    link.setAttribute('pathLength', 1); link.setAttribute('stroke-dasharray', '1 1');
    const g = el('g', { class: 'clickable' }, nodes);
    const rect = el('rect', { rx: 18, fill: C.panel, 'stroke-width': 2 }, g);
    const head = el('g', {}, g);
    el('circle', { cx: 14, cy: -8, r: 15, fill: C.cyan }, head);
    T(head, 14, -1, String(b.n), { size: 20, anchor: 'middle', fill: C.bg1, weight: 700 });
    T(head, 38, 0, b.label, { size: 24, weight: 700 });
    const key = T(g, 0, 0, b.key, { size: 17, fill: C.muted });
    const body = G(g, { in: 57.2 + i * 0.18, d: 0.7 });
    const [x, y, w, h] = b.card;
    b.bullets.forEach((s, j) => {
      el('circle', { cx: x + 38, cy: y + 112 + j * 64, r: 5, fill: C.cyan }, body);
      T(body, x + 56, y + 120 + j * 64, s, { size: 23, maxw: w - 80 });
    });
    T(body, x + 32, y + h - 22, b.pages, { size: 16, fill: C.dim });
    g.addEventListener('click', () => jumpTo(b.seg));
    return { b, link, g, rect, head, key };
  });
  svg.appendChild(document.getElementById('question')); // keep the question above the centre node
  cg.classList.add('clickable');
  cg.addEventListener('click', () => jumpTo('final'));

  U.push(t => {
    const show = t >= 4.3;
    map.setAttribute('display', show ? '' : 'none');
    if (!show) return;
    const kf = E(t, 56.0, 1.6);
    // centre node rect: compact → full
    const ca = E(t, 4.3, 0.8);
    const cr = [lerp(200, 680, kf), lerp(462, 150, kf), lerp(340, 560, kf), lerp(136, 330, kf)];
    setAttrs(cRect, { x: cr[0], y: cr[1], width: cr[2], height: cr[3] });
    cg.setAttribute('opacity', ca.toFixed(3));
    const ccx = cr[0] + cr[2] / 2, ccy = cr[1] + cr[3] / 2;
    cTitle.setAttribute('transform', `translate(${lerp(370, 960, kf)} ${lerp(522, 222, kf)}) scale(${lerp(1, 1.4, kf)})`);

    items.forEach(({ b, link, g, rect, head, key }) => {
      const s0 = SEG[b.seg].t0, s1 = SEG[b.seg].t1;
      const appear = E(t, s0 - 0.15, 0.5);
      const lineP = eo(prog(t, s0 - 0.55, 0.5));
      // emphasis: active segment = 1; visited but inactive = 0.32; final = 1
      const act = prog(t, s0 - 0.3, 0.5) * (1 - prog(t, s1 - 0.25, 0.5));
      let em = lerp(0.32, 1, act); em = lerp(em, 1, kf);
      const [px, py] = b.pc, [x, y, w, h] = b.card;
      const rx = lerp(px - PILL_W / 2, x, kf), ry = lerp(py - PILL_H / 2, y, kf);
      const rw = lerp(PILL_W, w, kf), rh = lerp(PILL_H, h, kf);
      setAttrs(rect, { x: rx, y: ry, width: rw, height: rh,
        stroke: act > 0.5 && kf < 0.5 ? C.cyan : (kf > 0.5 ? '#2C5A7E' : '#2A4766'),
        fill: act > 0.5 && kf < 0.5 ? '#123552' : C.panel });
      rect.setAttribute('filter', act > 0.5 && kf < 0.5 ? 'url(#softGlow)' : '');
      const hx = lerp(px - 108, x + 28, kf), hy = lerp(py - 2, y + 56, kf), hs = lerp(1, 1.3, kf);
      head.setAttribute('transform', `translate(${hx} ${hy}) scale(${hs})`);
      setAttrs(key, { x: px - 70, y: py + 26, opacity: (1 - E(t, 55.9, 0.4)).toFixed(3) });
      const pop = 0.7 + 0.3 * eo(prog(t, s0 - 0.15, 0.5));
      const cxn = rx + rw / 2, cyn = ry + rh / 2;
      g.setAttribute('transform', kf > 0 ? '' : `translate(${cxn} ${cyn}) scale(${pop.toFixed(3)}) translate(${-cxn} ${-cyn})`);
      g.setAttribute('opacity', (appear * em).toFixed(3));
      g.setAttribute('display', appear <= 0.002 ? 'none' : '');
      const mx = (ccx + cxn) / 2;
      link.setAttribute('d', `M${ccx} ${ccy} C${mx} ${ccy} ${mx} ${cyn} ${cxn} ${cyn}`);
      link.setAttribute('stroke-dashoffset', (1 - lineP).toFixed(4));
      link.setAttribute('opacity', (lineP > 0 ? lerp(0.35, 0.95, Math.max(act, kf)) : 0).toFixed(3));
    });
  });
}

/* ---------- 5–15 s: branch ① what is measured ---------- */
function buildScene1() {
  const S = SEG.b1;
  const g = G(svg, { in: S.t0, d: 0.5, out: S.t1 - 0.4, od: 0.45, fx: 'none' });
  sceneTitle(g, '分支 ① · 测什么？', '在近似零电流下，测两电极间的电位差', 5.25);

  const bk = G(g, { in: 5.4, d: 0.5, fx: 'none' });
  const { p } = beaker(bk, 980, 520, 400, 300, 590);
  D(p, 5.4, 0.9);
  T(bk, 1180, 862, '待测溶液', { size: 22, fill: C.muted, anchor: 'middle' });

  // ions (H+) with deterministic drift; some get a counter-ion halo at ~11.6 s
  const r = rng(7), ions = [];
  while (ions.length < 18) {
    const x = 1000 + r() * 360, y = 612 + r() * 190;
    if ((x > 1056 && x < 1124) || (x > 1236 && x < 1304)) continue;
    const ig = el('g', {}, bk);
    const halo = el('g', {}, ig);
    el('circle', { cx: 15, cy: -11, r: 7, fill: C.counter }, halo);
    T(halo, 15, -7.5, '−', { size: 11, anchor: 'middle', fill: C.bg1, weight: 700 });
    const core = ion(ig, 0, 0, '+', C.ion, 9);
    ions.push({ ig, halo, core, x, y, ph: r() * 6.28, bound: ions.length % 3 === 0 });
  }
  U.push(t => {
    if (t < S.t0 - 0.5 || t > S.t1 + 0.5) return;
    const kb = E(t, 11.6, 0.8);
    for (const o of ions) {
      const dx = Math.sin(t * 0.9 + o.ph) * 10, dy = Math.cos(t * 0.7 + o.ph * 1.3) * 7;
      o.ig.setAttribute('transform', `translate(${(o.x + dx).toFixed(1)} ${(o.y + dy).toFixed(1)})`);
      o.ig.setAttribute('opacity', (E(t, 6.2, 0.8) * (o.bound ? lerp(1, 0.38, kb) : 1)).toFixed(3));
      o.halo.setAttribute('opacity', o.bound ? kb.toFixed(3) : 0);
    }
  });

  // electrodes descend
  const eg = el('g', {}, g);
  const ind = el('g', {}, eg);
  el('rect', { x: 1068, y: 360, width: 44, height: 380, rx: 14, fill: 'url(#indGrad)', stroke: C.glass, 'stroke-width': 2 }, ind);
  el('circle', { cx: 1090, cy: 748, r: 24, fill: 'rgba(61,213,243,.28)', stroke: C.gold, 'stroke-width': 3 }, ind);
  const ref = el('g', {}, eg);
  el('rect', { x: 1248, y: 360, width: 44, height: 410, rx: 14, fill: 'url(#refGrad)', stroke: C.ref, 'stroke-width': 2 }, ref);
  el('rect', { x: 1262, y: 762, width: 16, height: 14, fill: 'url(#porous)' }, ref);
  U.push(t => {
    const k = E(t, 6.0, 1.4);
    eg.setAttribute('transform', `translate(0 ${lerp(-330, 0, k).toFixed(1)})`);
    eg.setAttribute('opacity', E(t, 5.9, 0.4).toFixed(3));
  });
  const lab = G(g, { in: 7.5 });
  T(lab, 1052, 470, '指示电极', { size: 24, fill: C.cyan, anchor: 'end', weight: 700 });
  T(lab, 1052, 498, '随离子活度变化', { size: 18, fill: C.muted, anchor: 'end' });
  T(lab, 1308, 470, '参比电极', { size: 24, fill: C.ref, weight: 700 });
  T(lab, 1308, 498, '电位恒定', { size: 18, fill: C.muted });

  // meter + wires
  const mg = G(g, { in: 7.2, d: 0.5 });
  el('rect', { x: 1100, y: 206, width: 160, height: 116, rx: 14, fill: C.panel, stroke: C.line, 'stroke-width': 2 }, mg);
  el('rect', { x: 1114, y: 220, width: 132, height: 64, rx: 8, fill: '#050D19', stroke: C.cyanDeep }, mg);
  T(mg, 1124, 242, 'E / V', { size: 15, fill: C.muted });
  const mv = T(mg, 1236, 276, '-.---', { size: 30, fill: C.cyan, anchor: 'end', weight: 500 });
  T(mg, 1180, 310, '电位计', { size: 16, fill: C.muted, anchor: 'middle' });
  const w1 = el('path', { d: 'M1090 360 V264 H1100', fill: 'none', stroke: '#6E8FB3', 'stroke-width': 3 }, g);
  const w2 = el('path', { d: 'M1270 360 V264 H1260', fill: 'none', stroke: '#6E8FB3', 'stroke-width': 3 }, g);
  D(w1, 7.4, 0.6); D(w2, 7.4, 0.6);
  T(mg, 1180, 346, '（数值仅示意）', { size: 15, fill: C.dim, anchor: 'middle', cls: 'note' });
  U.push(t => {
    let s = '-.---';
    if (t >= 8.0 && t < 9.0) s = (0.215 * E(t, 8.0, 1.0)).toFixed(3);
    else if (t >= 9.0) s = '0.215';
    if (mv.textContent !== s) mv.textContent = s;
  });
  const ic = G(g, { in: 9.6 });
  T(ic, 1074, 306, 'I ≈ 0', { size: 24, fill: C.gold, anchor: 'end', weight: 700 });

  // explanation column
  const blocks = [
    [7.8, '测量：电位差 E', '两电极组成原电池的电动势'],
    [9.6, '条件：近似零电流', '高阻抗电位计，几乎不取电流'],
    [11.6, '反映：离子活度 a', 'a = γc，可理解为“有效浓度”']
  ];
  blocks.forEach(([tin, h, s], i) => {
    const bg = G(g, { in: tin, cls: 'note' });
    el('rect', { x: 1440, y: 392 + i * 112, width: 6, height: 70, rx: 3, fill: i === 2 ? C.gold : C.cyan }, bg);
    T(bg, 1462, 420 + i * 112, h, { size: 28, weight: 700, maxw: 410 });
    T(bg, 1462, 454 + i * 112, s, { size: 20, fill: C.muted, maxw: 410 });
  });
  const tag = G(g, { in: 13.2, cls: 'note' });
  pill(tag, 1440, 740, 300, 48, '属于电化学分析方法', { size: 21 });
  const leg = G(g, { in: 12.2, cls: 'note' });
  ion(leg, 1452, 834, '+', C.ion, 8);
  T(leg, 1468, 840, '自由发挥作用', { size: 17, fill: C.muted });
  const lg2 = el('g', { opacity: 0.45 }, leg); ion(lg2, 1602, 834, '+', C.ion, 8);
  el('circle', { cx: 1616, cy: 824, r: 6, fill: C.counter }, leg);
  T(leg, 1632, 840, '受相互作用牵制（示意）', { size: 17, fill: C.muted });
}

/* ---------- 15–27 s: branch ② why (Nernst) ---------- */
function buildScene2() {
  const S = SEG.b2;
  const g = G(svg, { in: S.t0, d: 0.5, out: S.t1 - 0.4, od: 0.45, fx: 'none' });
  sceneTitle(g, '分支 ② · 为什么能测？', '活度一变，电位就跟着变', 15.25);

  const xs = [840, 990, 1140], counts = [2, 6, 18], labs = ['a', '10a', '100a'], es = ['E_{0}', 'E_{0} + S', 'E_{0} + 2S'];
  const r = rng(21);
  xs.forEach((cx, i) => {
    const bg = G(g, { in: 15.5 + i * 0.9, fx: 'scale', ox: cx, oy: 300 });
    beaker(bg, cx - 55, 236, 110, 124, 262);
    for (let k = 0; k < counts[i]; k++) ion(bg, cx - 40 + r() * 80, 278 + r() * 70, '+', C.ion, 6);
    T(bg, cx, 396, labs[i], { size: 26, anchor: 'middle', weight: 700 });
    T(bg, cx, 430, es[i], { size: 22, anchor: 'middle', fill: C.gold });
  });
  const cnote = G(g, { in: 17.4, cls: 'note' });
  T(cnote, 990, 462, '（离子点数仅示意浓淡）', { size: 16, fill: C.dim, anchor: 'middle' });

  // graph E vs lg a
  const gr = G(g, { in: 15.6, fx: 'none' });
  axes(gr, 1340, 620, 500, 390, 'lg a', 'E');
  const pts = [[1420, 560], [1570, 440], [1720, 320]];
  pts.forEach(([x, y], i) => {
    const pg = G(gr, { in: 15.8 + i * 0.9, fx: 'scale', ox: x, oy: y });
    el('line', { x1: x, y1: y, x2: x, y2: 620, stroke: C.dim, 'stroke-dasharray': '4 6' }, pg);
    el('circle', { cx: x, cy: y, r: 9, fill: C.gold, filter: 'url(#softGlow)' }, pg);
    T(pg, x, 650, ['lg a', 'lg a + 1', 'lg a + 2'][i], { size: 17, fill: C.muted, anchor: 'middle' });
  });
  const steps = G(gr, { in: 17.9, cls: 'note' });
  [[0, 1], [1, 2]].forEach(([a, b]) => {
    const [x1, y1] = pts[a], [x2, y2] = pts[b];
    el('path', { d: `M${x1} ${y1} H${x2} V${y2}`, stroke: C.cyan, 'stroke-width': 1.6, fill: 'none', 'stroke-dasharray': '5 5' }, steps);
    T(steps, x2 + 12, (y1 + y2) / 2 + 8, 'S', { size: 22, fill: C.cyan, weight: 700 });
  });
  const line = el('path', { d: 'M1370 600 L1810 248', stroke: C.cyan, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, gr);
  D(line, 18.6, 0.9);
  const lt = G(gr, { in: 19.3 });
  T(lt, 1380, 300, 'E 与 lg a 呈直线关系', { size: 24, fill: C.cyan, weight: 500 });

  // intuition text → later replaced by chain
  const it = G(g, { in: 18.0, out: 23.4, od: 0.4 });
  T(it, 780, 530, '活度每增大 10 倍', { size: 32, weight: 700 });
  T(it, 780, 584, '→ 电位改变同一个量 S', { size: 32, weight: 700, fill: C.gold });
  const ch = G(g, { in: 23.8 });
  pill(ch, 780, 500, 112, 50, 'a 变', { size: 24 });
  arrow(ch, 900, 525, 940, 525);
  pill(ch, 948, 500, 112, 50, 'E 变', { size: 24 });
  arrow(ch, 1068, 525, 1108, 525);
  pill(ch, 1116, 500, 150, 50, '由 E 反推 a', { size: 22, stroke: C.gold, fill: C.gold, bg: 'rgba(247,197,72,.08)' });
  T(ch, 780, 598, '已知斜率 + 校准，就能由测得的 E 求出 a', { size: 20, fill: C.muted, cls: 'note', maxw: 490 });

  // reverse lookup on the graph
  const rl = G(gr, { in: 24.0, d: 0.3, fx: 'none' });
  const h1 = el('path', { d: 'M1340 380 H1645', stroke: C.gold, 'stroke-width': 2.5, fill: 'none', 'stroke-dasharray': '8 6' }, rl);
  const v1 = el('path', { d: 'M1645 380 V612', stroke: C.gold, 'stroke-width': 2.5, fill: 'none', 'marker-end': 'url(#arr-gold)' }, rl);
  D(h1, 24.1, 0.6); D(v1, 24.7, 0.6);
  T(rl, 1330, 386, '测得 E', { size: 20, fill: C.gold, anchor: 'end', weight: 700 });
  const rl2 = G(gr, { in: 25.2 });
  el('rect', { x: 1600, y: 662, width: 96, height: 30, rx: 6, fill: C.bg1 }, rl2);
  T(rl2, 1648, 684, '求得 a', { size: 20, fill: C.gold, anchor: 'middle', weight: 700 });

  // formula
  const fm = G(g, { in: 20.6, d: 0.7 });
  el('rect', { x: 770, y: 712, width: 1090, height: 160, rx: 18, fill: 'rgba(247,197,72,.06)', stroke: C.gold, 'stroke-opacity': 0.55, 'stroke-width': 1.6 }, fm);
  T(fm, 794, 744, '能斯特方程（离子选择性电极响应式）', { size: 18, fill: C.gold });
  fracFormula(fm, 1315, 784, 50, 'E = K ±', '2.303RT', 'nF', 'lg a');
  const lgd = G(g, { in: 21.7 });
  T(lgd, 1315, 856, 'E：电极电位 / 电动势　K：一定条件下的常数　n：离子电荷数　a：离子活度', { size: 20, fill: C.text, anchor: 'middle', maxw: 1060 });
  const nt = G(g, { in: 22.6, cls: 'note' });
  T(nt, 1315, 906, '斜率 2.303RT/nF：25 ℃、n = 1 时约 59.16 mV ｜ ±：ISE 作正极时，阳离子取 +、阴离子取 −（课件 P58）', { size: 18, fill: C.muted, anchor: 'middle', maxw: 1090 });
}

/* ---------- 27–39 s: branch ③ electrodes ---------- */
function buildScene3() {
  const S = SEG.b3;
  const g = G(svg, { in: S.t0, d: 0.5, out: S.t1 - 0.4, od: 0.45, fx: 'none' });
  sceneTitle(g, '分支 ③ · 用什么测？', '一支是“传感器”，一支是“基准”', 27.25);

  /* glass electrode (indicator), cx = 1150 */
  const ge = G(g, { in: 27.3, d: 0.4, fx: 'none' });
  el('path', { d: 'M1030 560 Q1150 540 1270 560 V760 H1030 Z', fill: C.cyan, opacity: 0.08 }, ge);
  T(ge, 1262, 750, '试液', { size: 18, fill: C.muted, anchor: 'end' });
  el('path', { d: 'M1116 420 V603 A58 58 0 1 0 1184 603 V420 Z', fill: C.cyan, opacity: 0.2 }, ge);
  const tube = el('path', { d: 'M1110 256 V600 M1190 600 V256', stroke: C.glass, 'stroke-width': 4, fill: 'none' }, ge);
  D(tube, 27.3, 0.8);
  const memb = el('path', { d: 'M1110 600 A64 64 0 1 0 1190 600', stroke: C.gold, 'stroke-width': 5, fill: 'none', filter: 'url(#softGlow)' }, ge);
  D(memb, 27.9, 0.8);
  el('rect', { x: 1098, y: 220, width: 104, height: 40, rx: 8, fill: '#2B3E57', stroke: C.glass, 'stroke-width': 2 }, ge);
  el('line', { x1: 1150, y1: 220, x2: 1150, y2: 200, stroke: '#D7DEE8', 'stroke-width': 4 }, ge);
  el('line', { x1: 1150, y1: 260, x2: 1150, y2: 630, stroke: '#D7DEE8', 'stroke-width': 4 }, ge);
  el('rect', { x: 1143, y: 590, width: 14, height: 52, rx: 7, fill: '#8B7E74' }, ge);
  U.push(t => { if (t > 29.5 && t < 39) memb.setAttribute('stroke-width', (5 + 2.2 * Math.max(0, Math.sin((t - 29.5) * 5))).toFixed(2)); });

  // H+ exchange at membrane surface
  const hx = el('g', {}, g);
  const hs = [];
  for (let i = 0; i < 9; i++) {
    const ang = Math.PI * (0.05 + 0.9 * i / 8); // lower half around bulb
    hs.push({ ang, g: ion(hx, 0, 0, '+', C.ion, 8) });
  }
  U.push(t => {
    const a = E(t, 29.8, 0.5) * (1 - E(t, 38.6, 0.4));
    hx.setAttribute('opacity', a.toFixed(3));
    if (a <= 0) return;
    const k = E(t, 30.0, 1.2);
    hs.forEach((o, i) => {
      const rr = lerp(118, 76, k) + Math.sin(t * 3 + i) * 3 * k;
      const x = 1150 + Math.cos(o.ang) * rr, y = 650 + Math.sin(o.ang) * rr;
      o.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    });
  });

  const gl = [
    [28.4, 238, '绝缘帽 / 导线', null, 1098],
    [28.8, 360, '内参比电极 Ag/AgCl', null, 1146],
    [29.2, 470, '内参比溶液', '0.1 mol/L HCl', 1116]
  ];
  gl.forEach(([tin, y, a, b, tx]) => {
    const lg = G(g, { in: tin, fx: 'left' });
    el('line', { x1: 1050, y1: y - 7, x2: tx, y2: y - 7, stroke: C.dim, 'stroke-width': 1.5 }, lg);
    T(lg, 1040, y, a, { size: 21, anchor: 'end', maxw: 280 });
    if (b) T(lg, 1040, y + 26, b, { size: 17, anchor: 'end', fill: C.muted });
  });
  const mlab = G(g, { in: 29.6, fx: 'left' });
  el('line', { x1: 1050, y1: 640, x2: 1090, y2: 640, stroke: C.gold, 'stroke-width': 2 }, mlab);
  T(mlab, 1040, 634, '敏感玻璃膜', { size: 26, anchor: 'end', fill: C.gold, weight: 700 });
  T(mlab, 1040, 662, '厚 30–100 μm，对 H^{+} 响应', { size: 17, anchor: 'end', fill: C.muted });
  const hn = G(g, { in: 30.6, cls: 'note' });
  T(hn, 780, 720, 'H^{+} 在膜表面与水化层交换，', { size: 17, fill: C.muted });
  T(hn, 780, 744, '并不穿透玻璃（课件 P47）', { size: 17, fill: C.muted });

  const gr1 = G(g, { in: 31.0 });
  T(gr1, 790, 812, '指示电极 ≈ 传感器', { size: 28, fill: C.cyan, weight: 700 });
  T(gr1, 790, 846, '电位随 H^{+} 活度（pH）变化', { size: 19, fill: C.muted, maxw: 310 });
  miniGraph(gr1, 1120, 868, 170, 80, true, 31.2);

  /* reference electrode (SCE), cx = 1560 */
  const re = G(g, { in: 32.6, d: 0.4, fx: 'none' });
  el('path', { d: 'M1524 300 V690 Q1524 708 1542 708 H1578 Q1596 708 1596 690 V300 Z', fill: C.ref, opacity: 0.1 }, re);
  const ot = el('path', { d: 'M1520 256 V690 Q1520 712 1542 712 H1578 Q1600 712 1600 690 V256', stroke: C.glass, 'stroke-width': 4, fill: 'none' }, re);
  D(ot, 32.6, 0.8);
  el('rect', { x: 1550, y: 706, width: 20, height: 18, fill: 'url(#porous)' }, re);
  el('rect', { x: 1508, y: 220, width: 104, height: 40, rx: 8, fill: '#2B3E57', stroke: C.glass, 'stroke-width': 2 }, re);
  el('line', { x1: 1560, y1: 220, x2: 1560, y2: 200, stroke: '#D7DEE8', 'stroke-width': 4 }, re);
  el('rect', { x: 1545, y: 262, width: 30, height: 250, rx: 8, fill: 'none', stroke: C.glass, 'stroke-width': 2 }, re);
  el('line', { x1: 1560, y1: 260, x2: 1560, y2: 334, stroke: '#D7DEE8', 'stroke-width': 3 }, re);
  el('rect', { x: 1548, y: 332, width: 24, height: 40, rx: 4, fill: '#C9D2DC' }, re);
  el('rect', { x: 1548, y: 372, width: 24, height: 64, rx: 2, fill: '#E8E2D0', opacity: 0.75 }, re);
  el('rect', { x: 1548, y: 494, width: 24, height: 16, fill: 'url(#porous)' }, re);
  for (let i = 0; i < 6; i++) el('rect', { x: 1530 + i * 10, y: 684 - (i % 2) * 6, width: 8, height: 8, fill: '#E6EEF7', opacity: 0.7, transform: `rotate(${i * 17} ${1534 + i * 10} ${688})` }, re);

  const rl = [
    [33.4, 352, 'Hg（汞）', null, 1576],
    [33.7, 406, 'Hg_{2}Cl_{2}（甘汞）', null, 1576],
    [34.0, 590, '饱和 KCl 溶液', '晶体保持饱和', 1600],
    [34.3, 718, '液接部位', null, 1574]
  ];
  rl.forEach(([tin, y, a, b, tx]) => {
    const lg = G(g, { in: tin, fx: 'up' });
    el('line', { x1: tx, y1: y - 7, x2: 1630, y2: y - 7, stroke: C.dim, 'stroke-width': 1.5 }, lg);
    T(lg, 1640, y, a, { size: 21, maxw: 230 });
    if (b) T(lg, 1640, y + 26, b, { size: 17, fill: C.muted });
  });
  const gr2 = G(g, { in: 34.8 });
  T(gr2, 1340, 812, '参比电极 ≈ 基准尺', { size: 28, fill: C.ref, weight: 700 });
  T(gr2, 1340, 846, '饱和甘汞电极：+0.2438 V，恒定', { size: 19, fill: C.muted, maxw: 340 });
  miniGraph(gr2, 1700, 868, 160, 80, false, 35.0);

  const sum = G(g, { in: 36.2 });
  el('rect', { x: 780, y: 902, width: 1080, height: 50, rx: 10, fill: 'rgba(247,197,72,.07)', stroke: C.gold, 'stroke-opacity': 0.5 }, sum);
  T(sum, 1320, 936, 'E = E_{SCE} − E_{玻璃}：参比电位恒定，E 的变化反映指示电极的响应', { size: 24, fill: C.gold, anchor: 'middle', weight: 500, maxw: 1050 });
}
function miniGraph(parent, ox, oy, w, h, sloped, tin) {
  const g = el('g', {}, parent);
  el('path', { d: `M${ox} ${oy} H${ox + w} M${ox} ${oy} V${oy - h}`, stroke: C.muted, 'stroke-width': 1.5, fill: 'none' }, g);
  T(g, ox + w + 4, oy + 6, 'pH', { size: 15, fill: C.muted, anchor: 'end' });
  T(g, ox - 6, oy - h + 12, 'E', { size: 15, fill: C.muted, anchor: 'end' });
  const y0 = sloped ? oy - 12 : oy - h / 2, y1 = sloped ? oy - h + 8 : oy - h / 2;
  const ln = el('path', { d: `M${ox + 6} ${y0} L${ox + w - 6} ${y1}`, stroke: sloped ? C.cyan : C.ref, 'stroke-width': 3, fill: 'none' }, g);
  D(ln, tin, 0.7);
  const dot = el('circle', { r: 6, fill: sloped ? C.cyan : C.ref }, g);
  U.push(t => {
    const k = (Math.sin((t - tin) * 1.6) + 1) / 2;
    setAttrs(dot, { cx: lerp(ox + 6, ox + w - 6, k), cy: lerp(y0, y1, k), opacity: prog(t, tin + 0.6, 0.3) });
  });
}

/* ---------- 39–49 s: branch ④ pH measurement ---------- */
function buildScene4() {
  const S = SEG.b4;
  const g = G(svg, { in: S.t0, d: 0.5, out: S.t1 - 0.4, od: 0.45, fx: 'none' });
  sceneTitle(g, '分支 ④ · 怎样测 pH？', '先用标准缓冲液校准，再测待测溶液', 39.25);

  // meter
  const mg = G(g, { in: 39.3, d: 0.5 });
  el('rect', { x: 800, y: 214, width: 330, height: 156, rx: 18, fill: C.panel, stroke: C.line, 'stroke-width': 2 }, mg);
  el('rect', { x: 822, y: 232, width: 286, height: 92, rx: 10, fill: '#050D19', stroke: C.cyanDeep, 'stroke-width': 2 }, mg);
  T(mg, 838, 262, 'pH', { size: 20, fill: C.muted });
  const val = T(mg, 1094, 308, '--.--', { size: 56, fill: C.cyan, anchor: 'end', weight: 500 });
  const st = T(mg, 965, 354, '', { size: 18, fill: C.muted, anchor: 'middle' });

  // beakers
  const bs = G(g, { in: 39.4, d: 0.5 });
  beaker(bs, 800, 600, 200, 200, 650, C.gold, 0.14);
  T(bs, 900, 840, '标准缓冲液', { size: 22, anchor: 'middle', fill: C.gold, weight: 700 });
  T(bs, 900, 868, 'pH 4.00（已知）', { size: 18, anchor: 'middle', fill: C.muted });
  beaker(bs, 1140, 600, 200, 200, 650, C.cyan, 0.14);
  T(bs, 1240, 840, '待测溶液', { size: 22, anchor: 'middle', fill: C.cyan, weight: 700 });
  const sl = T(bs, 1240, 868, 'pH = ?', { size: 18, anchor: 'middle', fill: C.muted });

  // probe + cable
  const cable = el('path', { fill: 'none', stroke: '#4F6C8E', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
  const probe = el('g', {}, g);
  el('rect', { x: -20, y: 0, width: 40, height: 210, rx: 10, fill: 'url(#indGrad)', stroke: C.glass, 'stroke-width': 2 }, probe);
  el('line', { x1: -6, y1: 10, x2: -6, y2: 200, stroke: '#D7DEE8', 'stroke-width': 2, opacity: 0.6 }, probe);
  el('rect', { x: 8, y: 176, width: 8, height: 10, fill: 'url(#porous)' }, probe);
  el('circle', { cx: 0, cy: 222, r: 18, fill: 'rgba(61,213,243,.3)', stroke: C.gold, 'stroke-width': 3 }, probe);
  const pl = G(g, { in: 39.8, out: 42.6, od: 0.3, cls: 'note' });
  T(pl, 1020, 470, 'pH 复合电极', { size: 18, fill: C.muted });
  T(pl, 1020, 494, '（玻璃 + 参比）', { size: 16, fill: C.dim });

  U.push(t => {
    if (t < S.t0 - 0.5 || t > S.t1 + 0.5) return;
    const down1 = E(t, 39.5, 0.9), up = E(t, 43.0, 0.5), across = E(t, 43.5, 0.5), down2 = E(t, 44.0, 0.5);
    const x = lerp(900, 1240, across);
    let top = lerp(330, 520, down1); top = lerp(top, 360, up); top = lerp(top, 520, down2);
    probe.setAttribute('transform', `translate(${x} ${top})`);
    probe.setAttribute('opacity', E(t, 39.3, 0.4).toFixed(3));
    cable.setAttribute('d', `M965 370 C965 440 ${x} ${top - 110} ${x} ${top}`);
    cable.setAttribute('opacity', E(t, 39.3, 0.4).toFixed(3));
    let s = '--.--', status = '';
    if (t >= 39.9 && t < 41.0) { s = (3 + ((Math.floor(t * 14) * 37) % 300) / 100).toFixed(2); status = '定位中…'; }
    else if (t >= 41.0 && t < 43.0) { s = '4.00'; status = '已校准 ✓（定位 K′）'; }
    else if (t >= 43.0 && t < 44.5) { s = '4.00'; status = '移入待测溶液…'; }
    else if (t >= 44.5 && t < 46.0) { s = (4 + 1.5 * eo(prog(t, 44.5, 1.5))).toFixed(2); status = '等待读数稳定…'; }
    else if (t >= 46.0) { s = '5.50'; status = '读数稳定'; }
    if (val.textContent !== s) val.textContent = s;
    if (st.textContent !== status) st.textContent = status;
    const sv = t >= 46.0 ? 'pH 5.50' : 'pH = ?';
    if (sl.textContent !== sv) sl.textContent = sv;
  });

  // calibration graph: slope known, intercept K' unknown → pinned by the buffer
  const gr = G(g, { in: 39.9, fx: 'none' });
  axes(gr, 1440, 540, 420, 320, 'pH', 'E');
  T(gr, 1440, 566, '0', { size: 15, fill: C.dim, anchor: 'middle' });
  const fam = el('g', { 'clip-path': 'url(#clipG4)' }, gr);
  const lines = [-120, -60, 0, 60, 120].map(off => el('path', { stroke: C.cyan, 'stroke-width': 3, fill: 'none' }, fam));
  const lab1 = G(gr, { in: 40.2, out: 41.5, od: 0.3 });
  T(lab1, 1460, 222, '斜率已知（59.16 mV/pH），K′ 未知', { size: 19, fill: C.muted });
  const lab2 = G(gr, { in: 41.7 });
  T(lab2, 1460, 222, '标准缓冲液定位 → K′ 确定', { size: 19, fill: C.gold, weight: 700 });
  const stdP = G(gr, { in: 40.8, fx: 'scale', ox: 1640, oy: 420 });
  el('circle', { cx: 1640, cy: 420, r: 9, fill: C.gold, filter: 'url(#softGlow)' }, stdP);
  el('line', { x1: 1640, y1: 430, x2: 1640, y2: 540, stroke: C.dim, 'stroke-dasharray': '4 5' }, stdP);
  T(stdP, 1640, 566, '4.00', { size: 16, fill: C.gold, anchor: 'middle' });
  const smpP = G(gr, { in: 45.2, fx: 'scale', ox: 1715, oy: 375 });
  el('circle', { cx: 1715, cy: 375, r: 9, fill: C.cyan, filter: 'url(#softGlow)' }, smpP);
  el('line', { x1: 1715, y1: 385, x2: 1715, y2: 540, stroke: C.dim, 'stroke-dasharray': '4 5' }, smpP);
  T(smpP, 1724, 566, '5.50', { size: 16, fill: C.cyan, anchor: 'start' });
  el('path', { d: 'M1650 420 H1760 M1750 420 V375 M1715 375 H1760', stroke: C.gold, 'stroke-width': 1.6, fill: 'none', 'stroke-dasharray': '4 4' }, smpP);
  T(smpP, 1768, 404, 'ΔE', { size: 18, fill: C.gold, weight: 700 });
  U.push(t => {
    if (t < S.t0 || t > S.t1 + 0.5) return;
    const k = E(t, 41.0, 0.8);
    lines.forEach((p, i) => {
      const off = [-120, -60, 0, 60, 120][i] * (1 - k);
      p.setAttribute('d', `M1440 ${540 + off} L1860 ${330 + off}`);
      p.setAttribute('stroke-dasharray', k > 0.95 ? 'none' : '8 7');
      p.setAttribute('opacity', (i === 2 ? lerp(0.5, 1, k) : 0.45 * (1 - k)).toFixed(3));
    });
  });

  // calculation
  const f1 = G(g, { in: 44.8 });
  T(f1, 1440, 640, 'pH_{试} = pH_{标} + (E_{试} − E_{标}) ÷ (2.303RT/F)', { size: 23, fill: C.gold, weight: 500, maxw: 430 });
  const f2 = G(g, { in: 46.0 });
  T(f2, 1440, 686, '= 4.00 + 88.7 mV ÷ 59.16 mV', { size: 23, maxw: 430 });
  T(f2, 1440, 730, '= 5.50（25 ℃，数值为示例）', { size: 23, fill: C.cyan, weight: 700, maxw: 430 });
  const warn = G(g, { in: 47.0 });
  el('rect', { x: 1430, y: 768, width: 440, height: 92, rx: 12, fill: 'rgba(255,138,122,.08)', stroke: C.ion, 'stroke-width': 1.6 }, warn);
  T(warn, 1450, 806, '⚠ 标准缓冲液只用于校准', { size: 22, fill: C.ion, weight: 700, maxw: 400 });
  T(warn, 1450, 840, '不加入样品；校准与测定条件（温度）相同', { size: 18, fill: C.muted, maxw: 400 });
}

/* ---------- 49–56 s: branch ⑤ other ions & accuracy ---------- */
function buildScene5() {
  const S = SEG.b5;
  const g = G(svg, { in: S.t0, d: 0.5, out: S.t1 - 0.4, od: 0.45, fx: 'none' });
  sceneTitle(g, '分支 ⑤ · 测其他离子、测得准', '换一张敏感膜，测另一种离子', 49.25);

  // electrode with swappable membrane
  const eg = G(g, { in: 49.3, d: 0.4, fx: 'none' });
  el('path', { d: 'M790 620 Q900 600 1010 620 V740 H790 Z', fill: C.fion, opacity: 0.07 }, eg);
  el('rect', { x: 870, y: 240, width: 60, height: 330, rx: 10, fill: 'url(#indGrad)', stroke: C.glass, 'stroke-width': 2 }, eg);
  el('rect', { x: 860, y: 220, width: 80, height: 34, rx: 8, fill: '#2B3E57', stroke: C.glass, 'stroke-width': 2 }, eg);
  const bulb = el('circle', { cx: 900, cy: 596, r: 34, fill: 'rgba(61,213,243,.25)', stroke: C.gold, 'stroke-width': 4 }, eg);
  const disc = el('rect', { x: 866, y: 566, width: 68, height: 24, rx: 3, fill: 'url(#crystal)', stroke: C.gold, 'stroke-width': 2 }, eg);
  const fions = el('g', {}, eg);
  const r = rng(5), fs = [];
  for (let i = 0; i < 10; i++) fs.push({ x: 810 + r() * 180, y: 640 + r() * 90, ph: r() * 6, g: ion(fions, 0, 0, '−', C.fion, 8) });
  U.push(t => {
    if (t < S.t0 - 0.5 || t > S.t1 + 0.5) return;
    const k = E(t, 49.6, 0.9);
    setAttrs(bulb, { opacity: (1 - k).toFixed(3), transform: `translate(0 ${(k * 30).toFixed(1)})` });
    setAttrs(disc, { opacity: E(t, 50.0, 0.6).toFixed(3), transform: `translate(0 ${((1 - E(t, 50.0, 0.8)) * 50).toFixed(1)})` });
    fions.setAttribute('opacity', E(t, 50.4, 0.6).toFixed(3));
    fs.forEach(o => o.g.setAttribute('transform', `translate(${(o.x + Math.sin(t + o.ph) * 8).toFixed(1)} ${(o.y + Math.cos(t * 0.8 + o.ph) * 6).toFixed(1)})`));
  });
  const ml = G(g, { in: 50.6, fx: 'left' });
  T(ml, 956, 568, '敏感膜：LaF_{3} 单晶', { size: 24, fill: C.gold, weight: 700 });
  T(ml, 956, 598, '（掺 EuF_{3}）→ F^{−} 选择电极', { size: 19, fill: C.muted });
  const ef = G(g, { in: 51.2 });
  T(ef, 790, 790, 'E = K − S·lg a(F^{−})', { size: 30, fill: C.gold, weight: 500 });
  T(ef, 790, 824, '阴离子取 “−”（课件 P46）', { size: 18, fill: C.muted, cls: 'note' });
  const fn = G(g, { in: 51.6, cls: 'note' });
  T(fn, 790, 852, 'F^{−} 电极宜在 pH 5–7 使用，OH^{−} 为主要干扰', { size: 18, fill: C.muted, maxw: 470 });

  // standard curve (anion → E decreases with lg c)
  const gr = G(g, { in: 51.4, fx: 'none' });
  axes(gr, 1310, 540, 550, 320, 'lg c(F^{−})', 'E');
  const pts = [[1380, 300], [1490, 360], [1600, 420], [1710, 480]];
  pts.forEach(([x, y], i) => {
    const pg = G(gr, { in: 51.6 + i * 0.2, fx: 'scale', ox: x, oy: y });
    el('circle', { cx: x, cy: y, r: 8, fill: C.gold }, pg);
  });
  const sline = el('path', { d: 'M1350 284 L1790 524', stroke: C.cyan, 'stroke-width': 3.5, fill: 'none' }, gr);
  D(sline, 52.3, 0.6);
  const lk = G(gr, { in: 52.9, d: 0.3, fx: 'none' });
  const lh = el('path', { d: 'M1310 390 H1545', stroke: C.ion, 'stroke-width': 2.4, fill: 'none', 'stroke-dasharray': '7 5' }, lk);
  const lv = el('path', { d: 'M1545 390 V532', stroke: C.ion, 'stroke-width': 2.4, fill: 'none', 'stroke-dasharray': '7 5' }, lk);
  D(lh, 52.9, 0.4); D(lv, 53.3, 0.4);
  T(lk, 1555, 384, '样品', { size: 18, fill: C.ion, weight: 700 });
  const l1 = G(gr, { in: 51.8 });
  T(l1, 1460, 252, '① 标准曲线法：先建关系，再查结果', { size: 21, fill: C.cyan, weight: 500, maxw: 390 });

  const sa = G(g, { in: 53.4 });
  el('rect', { x: 1300, y: 596, width: 560, height: 116, rx: 12, fill: C.panel, stroke: C.line, 'stroke-width': 1.6 }, sa);
  T(sa, 1322, 632, '② 标准加入法', { size: 22, fill: C.cyan, weight: 700 });
  T(sa, 1322, 666, '加入小体积、高浓度标准液，由 ΔE 求 c_{x}', { size: 19, maxw: 520 });
  T(sa, 1322, 696, 'c_{s} ≈ 100 c_{x}，V_{s} ≈ V_{0}/100（课件 P64）', { size: 16, fill: C.muted, cls: 'note', maxw: 520 });

  const chips = ['恒温：温度影响斜率', 'TISAB：稳定离子强度', '控干扰：K_{ij} 越小越好', '等读数稳定（响应时间）'];
  const cx0 = 1300, cw = 272;
  chips.forEach((s, i) => {
    const cg = G(g, { in: 54.0 + i * 0.25 });
    const x = i < 2 ? cx0 + i * (cw + 16) : cx0 + (i - 2) * (cw + 16);
    const y = i < 2 ? 740 : 800;
    pill(cg, x, y, cw, 46, s, { size: 18, stroke: C.gold, fill: C.text, bg: 'rgba(247,197,72,.06)', weight: 400 });
  });
}

/* ---------- 56–60 s: full summary ---------- */
function buildFinal() {
  const g = G(svg, { in: 58.2, d: 0.7 });
  el('rect', { x: 380, y: 888, width: 1160, height: 64, rx: 32, fill: 'rgba(247,197,72,.08)', stroke: C.gold, 'stroke-width': 2 }, g);
  T(g, 960, 931, '记忆口令：两极测电位 · 方程定关系 · 校准求含量', { size: 30, fill: C.gold, anchor: 'middle', weight: 700, maxw: 1120 });
  const src = G(svg, { in: 58.6 });
  T(src, 1860, 64, '依据第 4 章课件整理 · 页码为 PDF 页序', { size: 18, fill: C.dim, anchor: 'end' });
}

/* ---------- caption ---------- */
let capText, capBg, capG;
function buildCaption() {
  capG = el('g', { class: 'caption' });
  capBg = el('rect', { y: 976, height: 58, rx: 12, fill: 'rgba(3,8,16,.78)' }, capG);
  capText = el('text', { x: 960, y: 1015, 'font-size': 30, fill: C.text, 'text-anchor': 'middle', 'font-weight': 500 }, capG);
  let cur = null;
  U.push(t => {
    const c = L.cues.find(([a, b]) => t >= a && t < b);
    const s = c ? c[2] : '';
    if (s !== cur) {
      cur = s;
      capText.textContent = s;
      const w = s ? capText.getComputedTextLength() + 56 : 0;
      setAttrs(capBg, { x: 960 - w / 2, width: w });
    }
    let a = 0;
    if (c) a = Math.min(prog(t, c[0], 0.2), 1 - prog(t, c[1] - 0.15, 0.15));
    capG.setAttribute('opacity', a.toFixed(3));
  });
}

/* =====================================================================
 * Player
 * ===================================================================== */
let t = 0, playing = false, last = 0, stopAt = null, mode = 'auto';
const $ = id => document.getElementById(id);
const scrub = $('scrub'), btnPlay = $('btnPlay'), timeEl = $('time');

function render(tt) {
  applyReveals(tt);
  for (const u of U) u(tt);
  scrub.value = tt;
  timeEl.textContent = `${tt.toFixed(1).padStart(4, '0')} / ${DUR.toFixed(1)} s`;
  const seg = L.segments.find(s => tt >= s.t0 && tt < s.t1) || L.segments[L.segments.length - 1];
  document.querySelectorAll('#segRow button').forEach(b => b.classList.toggle('active', b.dataset.id === seg.id));
}
function play() {
  if (t >= DUR - 0.01) t = 0;
  playing = true; last = performance.now();
  btnPlay.textContent = '❚❚ 暂停'; $('bigPlay').classList.remove('show');
}
function pause() { playing = false; btnPlay.textContent = '▶ 播放'; }
function seek(tt) { t = Math.max(0, Math.min(DUR, tt)); render(t); }
function loop(now) {
  if (playing) {
    t += (now - last) / 1000; last = now;
    if (stopAt != null && t >= stopAt) { t = stopAt; stopAt = null; pause(); }
    if (t >= DUR) { t = DUR; pause(); }
    render(t);
  }
  requestAnimationFrame(loop);
}
jumpTo = id => {
  const s = SEG[id];
  if (id === 'final') { stopAt = null; seek(DUR); pause(); return; }
  seek(s.t0);
  stopAt = mode === 'manual' ? s.t1 - 0.45 : null;
  play();
};

function setupControls() {
  const row = $('segRow');
  L.segments.forEach(s => {
    const b = document.createElement('button');
    b.textContent = s.label; b.dataset.id = s.id; b.title = `${s.label}（${s.t0}–${s.t1} s）`;
    b.style.left = `${(s.t0 / DUR) * 100}%`; b.style.width = `calc(${((s.t1 - s.t0) / DUR) * 100}% - 3px)`;
    b.onclick = () => jumpTo(s.id);
    row.appendChild(b);
  });
  btnPlay.onclick = () => (playing ? pause() : play());
  $('bigPlay').onclick = play;
  $('btnReplay').onclick = () => { stopAt = null; seek(0); play(); };
  scrub.oninput = () => { stopAt = null; seek(parseFloat(scrub.value)); };
  $('btnMode').onclick = () => {
    mode = mode === 'auto' ? 'manual' : 'auto';
    $('btnMode').textContent = mode === 'auto' ? '模式：自动' : '模式：手动';
    $('btnMode').classList.toggle('on', mode === 'manual');
    if (mode === 'manual') { pause(); seek(DUR); } // show the full map to pick a branch from
    else stopAt = null;
  };
  const toggle = (btn, cls) => { const on = document.body.classList.toggle(cls); btn.classList.toggle('on', !on); };
  $('btnCap').onclick = () => toggle($('btnCap'), 'hide-caps');
  $('btnNotes').onclick = () => toggle($('btnNotes'), 'hide-notes');
  $('btnMap').onclick = () => jumpTo('final');
  $('btnFs').onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else $('player').requestFullscreen?.();
  };
  let idleTimer;
  const wake = () => {
    $('player').classList.remove('idle'); clearTimeout(idleTimer);
    if (document.fullscreenElement) idleTimer = setTimeout(() => $('player').classList.add('idle'), 2500);
  };
  document.addEventListener('mousemove', wake);
  document.addEventListener('fullscreenchange', wake);
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' && e.key !== ' ') return;
    const k = e.key.toLowerCase();
    if (k === ' ') { e.preventDefault(); playing ? pause() : play(); }
    else if (k === 'arrowleft') seek(t - 1);
    else if (k === 'arrowright') seek(t + 1);
    else if (k === 'r') $('btnReplay').click();
    else if (k === 'f') $('btnFs').click();
    else if (k === 'c') $('btnCap').click();
    else if (k === 'n') $('btnNotes').click();
    else if (k === 'h') document.body.classList.toggle('clean');
    else if (k === '0') jumpTo('final');
    else if ('12345'.includes(k)) jumpTo('b' + k);
  });
}

async function init() {
  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch (_) {}
  build();
  setupControls();
  const q = new URLSearchParams(location.search);
  if (q.get('clean') === '1') document.body.classList.add('clean');
  if (q.get('cap') === '0') $('btnCap').click();
  if (q.get('notes') === '0') $('btnNotes').click();
  if (q.get('mode') === 'manual') $('btnMode').click();
  const t0 = q.has('t') ? parseFloat(q.get('t')) : 0;
  seek(t0);
  requestAnimationFrame(loop);
  if (q.get('autoplay') !== '0' && !q.has('t') && mode === 'auto') play();
  else if (!playing) $('bigPlay').classList.toggle('show', t0 === 0);
  // hooks for automated checks / frame-exact video export
  window.__render = tt => { pause(); $('bigPlay').classList.remove('show'); seek(tt); };
  window.__ready = true;
}
init();
})();
