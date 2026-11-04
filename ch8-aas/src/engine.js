/*
 * Rendering engine: every visual property is a pure function of time t.
 * Timing comes from window.TL (generated from the synthesized narration),
 * so animation events are anchored to the start/end of narration lines.
 */
'use strict';
window.ENG = (() => {
const TL = window.TL;
const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('stage');

const C = {
  bg0: '#0B1A2E', bg1: '#06101F', panel: '#0F2138', panel2: '#14304F', line: '#1D3554',
  text: '#EAF2FB', muted: '#8EA3BC', dim: '#5D7390',
  cyan: '#3DD5F3', cyanDeep: '#1B6E86', gold: '#F7C548', red: '#FF7A6B', green: '#6EE7A8',
  violet: '#A78BFA', blue: '#5B8CFF', orange: '#FFA94D', pink: '#F472B6'
};

/* ---------- timing ---------- */
const LN = {}; TL.lines.forEach(l => { (LN[l.scene] = LN[l.scene] || [])[l.i] = l; });
const SC = Object.fromEntries(TL.scenes.map(s => [s.id, s]));
const at = (s, i) => LN[s][i].t0;
const end = (s, i) => LN[s][i].t1;

/* ---------- math ---------- */
const clamp = x => Math.max(0, Math.min(1, x));
const prog = (t, a, d) => clamp((t - a) / d);
const ease = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = x => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, k) => a + (b - a) * k;
const E = (t, a, d) => ease(prog(t, a, d));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let r = Math.imul(seed ^ seed >>> 15, 1 | seed); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }

/* ---------- DOM ---------- */
function el(tag, attrs = {}, parent = svg) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function setAttrs(e, a) { for (const k in a) e.setAttribute(k, a[k]); }
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
  const size = o.size || 26;
  const e = el('text', {
    x, y, 'font-size': size, fill: o.fill || C.text, 'text-anchor': o.anchor || 'start',
    'font-weight': o.weight || 400, class: o.cls, 'data-maxw': o.maxw, opacity: o.op,
    'font-family': o.mono ? 'Consolas, Menlo, monospace' : null
  }, parent);
  setRich(e, s, size);
  return e;
}

/* ---------- registries ---------- */
const R = [], DR = [], U = [];
function G(parent, o = {}) {
  const g = el('g', { class: o.cls }, parent || svg);
  if (o.in != null || o.out != null) {
    R.push({ g, tin: o.in ?? -1, din: o.d ?? 0.6, tout: o.out, dout: o.od ?? 0.5,
      fx: o.fx || 'up', dy: o.dy ?? 18, ox: o.ox || 0, oy: o.oy || 0 });
  }
  return g;
}
function D(path, t0, dur = 0.8) {
  path.setAttribute('pathLength', 1);
  path.setAttribute('stroke-dasharray', '1 1');
  DR.push({ p: path, t0, dur });
  return path;
}
// dim a group outside [t0, t1] (focus while narrated)
function focus(g, t0, t1, lo = 0.35) {
  U.push(t => {
    const a = prog(t, t0 - 0.2, 0.4) * (1 - prog(t, t1, 0.4));
    g.setAttribute('opacity', lerp(lo, 1, a).toFixed(3));
  });
}
function applyAll(t) {
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
  for (const u of U) u(t);
}

/* ---------- markers (one per colour) ---------- */
let defs;
const markers = {};
function arrowId(color) {
  if (markers[color]) return markers[color];
  const id = 'arr' + Object.keys(markers).length;
  const m = el('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
  el('path', { d: 'M0 0L10 5L0 10z', fill: color }, m);
  return (markers[color] = id);
}

/* ---------- components ---------- */
function card(parent, x, y, w, h, o = {}) {
  return el('rect', { x, y, width: w, height: h, rx: o.rx ?? 16, fill: o.fill || C.panel,
    stroke: o.stroke || C.line, 'stroke-width': o.sw || 1.6, opacity: o.op }, parent);
}
function pill(parent, x, y, w, h, s, o = {}) {
  const g = el('g', {}, parent);
  el('rect', { x, y, width: w, height: h, rx: h / 2, fill: o.bg || 'rgba(61,213,243,.08)', stroke: o.stroke || C.cyan, 'stroke-width': 1.6 }, g);
  T(g, x + w / 2, y + h / 2 + (o.size || 24) * 0.36, s, { size: o.size || 24, anchor: 'middle', fill: o.fill || C.cyan, weight: o.weight || 500, maxw: w - 16 });
  return g;
}
function arrow(parent, x1, y1, x2, y2, color = C.cyan, w = 2.5, dash) {
  return el('path', { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: color, 'stroke-width': w, fill: 'none',
    'marker-end': `url(#${arrowId(color)})`, 'stroke-dasharray': dash }, parent);
}
function axes(parent, ox, oy, w, h, xl, yl, o = {}) {
  const g = el('g', {}, parent);
  const mk = `url(#${arrowId(C.muted)})`;
  el('path', { d: `M${ox} ${oy} H${ox + w}`, stroke: C.muted, 'stroke-width': 2, 'marker-end': mk }, g);
  el('path', { d: `M${ox} ${oy} V${oy - h}`, stroke: C.muted, 'stroke-width': 2, 'marker-end': mk }, g);
  T(g, ox + w, oy + 34, xl, { size: o.size || 22, fill: C.muted, anchor: 'end' });
  T(g, ox - 12, oy - h + 8, yl, { size: o.size || 22, fill: C.muted, anchor: 'end' });
  return g;
}
function curve(fn, x0, x1, mapX, mapY, steps = 240) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const v = x0 + (x1 - x0) * i / steps;
    d += (i ? 'L' : 'M') + mapX(v).toFixed(1) + ' ' + mapY(fn(v)).toFixed(1);
  }
  return d;
}
const gauss = (x, mu, s, a) => a * Math.exp(-((x - mu) ** 2) / (2 * s * s));
// bullet list: items = [[text, tin], ...]
function bullets(parent, x, y, items, o = {}) {
  const gap = o.gap || 52, size = o.size || 26;
  items.forEach(([s, tin, extra], k) => {
    const g = G(parent, { in: tin, cls: o.cls });
    el('circle', { cx: x + 8, cy: y + k * gap - size * 0.34, r: 5.5, fill: o.dot || C.cyan }, g);
    T(g, x + 26, y + k * gap, s, { size, fill: o.fill || C.text, maxw: o.maxw, weight: o.weight });
    if (extra) extra(g, k);
  });
}
function sceneGroup(id) {
  const s = SC[id];
  return G(svg, { in: s.t0, d: 0.6, out: s.t1 - 0.45, od: 0.45, fx: 'none' });
}
function title(parent, id, text, sub) {
  const s = SC[id];
  const g = G(parent, { in: s.t0 + 0.1, d: 0.6 });
  T(g, 60, 150, text, { size: 44, weight: 700, maxw: 1200 });
  if (sub) T(g, 62, 192, sub, { size: 22, fill: C.muted, maxw: 1200 });
  return g;
}
// swap sub-title of a scene along with steps: steps = [[tin, text], ...]
function stepLabel(parent, x, y, steps, o = {}) {
  steps.forEach(([tin, s], k) => {
    const tout = steps[k + 1] ? steps[k + 1][0] - 0.3 : null;
    const g = G(parent, { in: tin, out: tout, od: 0.3 });
    el('rect', { x: x, y: y - 30, width: 6, height: 38, rx: 3, fill: o.color || C.gold }, g);
    T(g, x + 20, y, s, { size: o.size || 30, fill: o.color || C.gold, weight: 700, maxw: o.maxw || 1100 });
  });
}

function init() {
  defs = el('defs');
  defs.innerHTML = `
    <radialGradient id="bgGrad" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="${C.bg0}"/><stop offset="1" stop-color="${C.bg1}"/></radialGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.2" fill="#1C3352"/></pattern>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
    <linearGradient id="rainbow" x1="0" x2="1"><stop offset="0" stop-color="#7B3FE4"/><stop offset=".18" stop-color="#3B5BFF"/><stop offset=".36" stop-color="#2EC4F0"/><stop offset=".52" stop-color="#3EE07A"/><stop offset=".68" stop-color="#F5E642"/><stop offset=".84" stop-color="#FF9A3C"/><stop offset="1" stop-color="#FF4A4A"/></linearGradient>
    <linearGradient id="rainbowV" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF4A4A"/><stop offset=".2" stop-color="#FF9A3C"/><stop offset=".4" stop-color="#F5E642"/><stop offset=".6" stop-color="#3EE07A"/><stop offset=".8" stop-color="#3B5BFF"/><stop offset="1" stop-color="#7B3FE4"/></linearGradient>
    <linearGradient id="whiteBeam" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset="1" stop-color="#FFF6D8" stop-opacity=".7"/></linearGradient>`;
  el('rect', { width: 1920, height: 1080, fill: 'url(#bgGrad)' });
  el('rect', { width: 1920, height: 1080, fill: 'url(#dots)', opacity: 0.5 });
}

return { TL, C, SC, LN, at, end, clamp, prog, ease, eo, lerp, E, rng, el, setAttrs, setRich, T, G, D, U, focus,
  applyAll, arrowId, card, pill, arrow, axes, curve, gauss, bullets, sceneGroup, title, stepLabel, init, svg };
})();
