/*
 * Rendering engine for the MCS-51 instruction-set lessons.
 * Every visual property is a pure function of time t. Timing comes from window.TL
 * (generated from the synthesized narration), so each animation event is anchored
 * to the start or end of a narration line.
 */
'use strict';
window.ENG = (() => {
const TL = window.TL;
const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('stage');
const MONO = '"DejaVu Sans Mono", Consolas, Menlo, monospace';

const C = {
  bg0: '#0B1A2E', bg1: '#06101F', panel: '#0F2138', panel2: '#14304F', line: '#1D3554',
  text: '#EAF2FB', muted: '#8EA3BC', dim: '#5D7390',
  cyan: '#3DD5F3', gold: '#F7C548', red: '#FF7A6B', green: '#6EE7A8',
  violet: '#A78BFA', blue: '#5B8CFF', orange: '#FFA94D', pink: '#F472B6'
};
const KC = { c: C.cyan, g: C.gold, r: C.red, n: C.green, v: C.violet, b: C.blue, o: C.orange, p: C.pink, m: C.muted, w: C.text };

/* ---------- timing ---------- */
const LN = {}; TL.lines.forEach(l => { (LN[l.scene] = LN[l.scene] || [])[l.i] = l; });
const SC = Object.fromEntries(TL.scenes.map(s => [s.id, s]));
const at = (s, i) => { const l = LN[s] && LN[s][i]; if (!l) throw new Error(`no line ${s}[${i}]`); return l.t0; };
const end = (s, i) => { const l = LN[s] && LN[s][i]; if (!l) throw new Error(`no line ${s}[${i}]`); return l.t1; };

/* ---------- math ---------- */
const clamp = x => Math.max(0, Math.min(1, x));
const prog = (t, a, d) => clamp((t - a) / d);
const ease = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = x => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, k) => a + (b - a) * k;

/* ---------- DOM ---------- */
function el(tag, attrs = {}, parent = svg) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function setAttrs(e, a) { for (const k in a) e.setAttribute(k, a[k]); }
// rich text: {g|coloured}, _{sub}, ^{sup}
function setRich(e, s, size) {
  while (e.firstChild) e.removeChild(e.firstChild);
  const re = /\{([a-z])\|([^}]*)\}|([_^])\{([^}]*)\}/g;
  let i = 0, m, shift = 0;
  const add = (str, o = {}) => {
    const ts = el('tspan', {}, e); ts.textContent = str;
    if (o.size) ts.setAttribute('font-size', o.size);
    if (o.dy) ts.setAttribute('dy', o.dy.toFixed(2));
    if (o.fill) ts.setAttribute('fill', o.fill);
    if (o.weight) ts.setAttribute('font-weight', o.weight);
  };
  while ((m = re.exec(s))) {
    if (m.index > i) { add(s.slice(i, m.index), { dy: -shift }); shift = 0; }
    if (m[1]) { add(m[2], { fill: KC[m[1]], dy: -shift }); shift = 0; }
    else {
      const sh = m[3] === '_' ? size * 0.28 : -size * 0.38;
      add(m[4], { size: (size * 0.68).toFixed(1), dy: sh - shift });
      shift = sh;
    }
    i = re.lastIndex;
  }
  if (i < s.length) add(s.slice(i), { dy: -shift });
  else if (shift) add('​', { dy: -shift });
}
const plain = s => s.replace(/\{[a-z]\|([^}]*)\}/g, '$1').replace(/[_^]\{([^}]*)\}/g, '$1');
function T(parent, x, y, s, o = {}) {
  const size = o.size || 26;
  const e = el('text', {
    x, y, 'font-size': size, fill: o.fill || C.text, 'text-anchor': o.anchor || 'start',
    'font-weight': o.weight || 400, class: o.cls, 'data-maxw': o.maxw, opacity: o.op,
    'font-family': o.mono ? MONO : null, 'xml:space': o.mono ? 'preserve' : null
  }, parent);
  setRich(e, String(s), size);
  return e;
}

/* ---------- registries ---------- */
const R = [], DR = [], U = [];
function G(parent, o = {}) {
  const g = el('g', { class: o.cls }, parent || svg);
  if (o.in != null || o.out != null) {
    R.push({ g, tin: o.in ?? -1, din: o.d ?? 0.5, tout: o.out, dout: o.od ?? 0.4,
      fx: o.fx || 'up', dy: o.dy ?? 16 });
  }
  return g;
}
function D(path, t0, dur = 0.8) {
  path.setAttribute('pathLength', 1);
  path.setAttribute('stroke-dasharray', '1 1');
  DR.push({ p: path, t0, dur });
  return path;
}
function applyAll(t) {
  for (const r of R) {
    const ai = ease(prog(t, r.tin, r.din));
    const ao = r.tout != null ? 1 - ease(prog(t, r.tout, r.dout)) : 1;
    const a = ai * ao;
    if (a <= 0.002) { r.g.setAttribute('display', 'none'); continue; }
    r.g.removeAttribute('display');
    r.g.setAttribute('opacity', a.toFixed(3));
    if (r.fx === 'up') r.g.setAttribute('transform', `translate(0 ${((1 - ai) * r.dy).toFixed(2)})`);
    else if (r.fx === 'left') r.g.setAttribute('transform', `translate(${((1 - ai) * -r.dy).toFixed(2)} 0)`);
  }
  for (const d of DR) d.p.setAttribute('stroke-dashoffset', (1 - eo(prog(t, d.t0, d.dur))).toFixed(4));
  for (const u of U) u(t);
}

/* ---------- markers ---------- */
let defs;
const markers = {};
function arrowId(color) {
  if (markers[color]) return markers[color];
  const id = 'arr' + Object.keys(markers).length;
  const m = el('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
  el('path', { d: 'M0 0L10 5L0 10z', fill: color }, m);
  return (markers[color] = id);
}

/* ---------- basic components ---------- */
function card(parent, x, y, w, h, o = {}) {
  return el('rect', { x, y, width: w, height: h, rx: o.rx ?? 14, fill: o.fill || C.panel,
    stroke: o.stroke || C.line, 'stroke-width': o.sw || 1.6, opacity: o.op }, parent);
}
function pill(parent, x, y, w, h, s, o = {}) {
  const g = el('g', {}, parent);
  el('rect', { x, y, width: w, height: h, rx: h / 2, fill: o.bg || 'rgba(61,213,243,.08)', stroke: o.stroke || C.cyan, 'stroke-width': 1.6 }, g);
  T(g, x + w / 2, y + h / 2 + (o.size || 24) * 0.36, s, { size: o.size || 24, anchor: 'middle', fill: o.fill || C.cyan, weight: o.weight || 500, maxw: w - 12, mono: o.mono });
  return g;
}
function arrow(parent, x1, y1, x2, y2, color = C.cyan, w = 2.5, dash) {
  return el('path', { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: color, 'stroke-width': w, fill: 'none',
    'marker-end': `url(#${arrowId(color)})`, 'stroke-dasharray': dash }, parent);
}
function path(parent, d, color = C.cyan, w = 2.5, o = {}) {
  return el('path', { d, stroke: color, 'stroke-width': w, fill: 'none', 'marker-end': o.arrow === false ? null : `url(#${arrowId(color)})`,
    'stroke-dasharray': o.dash, 'stroke-linejoin': 'round' }, parent);
}
// bullet list: items = [[text, tin], ...]
function bullets(parent, x, y, items, o = {}) {
  const gap = o.gap || 56, size = o.size || 30;
  items.forEach(([s, tin], k) => {
    const g = G(parent, { in: tin });
    el('circle', { cx: x + 8, cy: y + k * gap - size * 0.34, r: 6, fill: o.dot || C.cyan }, g);
    T(g, x + 28, y + k * gap, s, { size, fill: o.fill || C.text, maxw: o.maxw || 1700, weight: o.weight, mono: o.mono });
  });
}
// boxed note. kind: warn (课件存疑) | add (补充说明) | key (要点) | ok (结论)
const NOTE = { warn: [C.orange, '⚠ 课件存疑'], add: [C.violet, '＋ 补充说明'], key: [C.gold, '★ 要点'], ok: [C.green, '✓ 结论'], q: [C.cyan, '？ 想一想'] };
function note(parent, x, y, w, lines, kind, tin, o = {}) {
  const [col, tag] = NOTE[kind];
  const size = o.size || 26, lh = size * 1.5;
  const h = 58 + lines.length * lh;
  const g = G(parent, { in: tin, out: o.out, cls: kind === 'warn' || kind === 'add' ? 'note' : null });
  el('rect', { x, y, width: w, height: h, rx: 12, fill: 'rgba(8,16,30,.92)', stroke: col, 'stroke-width': 2 }, g);
  el('rect', { x, y, width: 8, height: h, rx: 4, fill: col }, g);
  T(g, x + 26, y + 36, o.tag || tag, { size: 22, fill: col, weight: 700 });
  lines.forEach((s, k) => T(g, x + 26, y + 36 + (k + 1) * lh, s, { size, maxw: w - 50, mono: o.mono }));
  return g;
}

/* ---------- value cells: registers / memory with before→after ---------- */
// one cell; events = [[t, value], ...] sorted; shows the previous value as "原 xx" for a while after each change
function cell(parent, x, y, w, h, init, o = {}) {
  const g = el('g', {}, parent);
  const box = el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || C.panel2, stroke: C.line, 'stroke-width': 2 }, g);
  const flash = el('rect', { x, y, width: w, height: h, rx: 8, fill: C.gold, opacity: 0 }, g);
  const size = o.size || Math.min(34, h * 0.52);
  const tv = T(g, x + w / 2, y + h / 2 + size * 0.36, init, { size, anchor: 'middle', mono: true, weight: 700, fill: o.color || C.text });
  const old = T(g, x + w / 2, y - 8, '', { size: 18, anchor: 'middle', fill: C.muted, mono: true });
  const ev = [];
  let cur = null, curOld = null;
  const api = {
    g, x, y, w, h,
    set(t, v) { ev.push([t, String(v)]); ev.sort((a, b) => a[0] - b[0]); return api; },
    hl: [],
    focus(t0, t1, col = C.cyan) { api.hl.push([t0, t1, col]); return api; }
  };
  U.push(t => {
    let v = init, prev = null, te = -1e9;
    for (const [tt, vv] of ev) if (t >= tt) { prev = v; v = vv; te = tt; }
    if (v !== cur) { setRich(tv, v, size); cur = v; }
    const k = 1 - prog(t, te, 1.3);
    flash.setAttribute('opacity', (te > -1e8 ? 0.55 * k * k : 0).toFixed(3));
    const showOld = prev !== null && prev !== v && t < te + 3.2 && o.old !== false;
    const os = showOld ? `原 ${prev}` : '';
    if (os !== curOld) { setRich(old, os, 18); curOld = os; }
    old.setAttribute('opacity', showOld ? (1 - prog(t, te + 2.7, 0.5)).toFixed(3) : 0);
    let hc = null;
    for (const [a, b, c] of api.hl) if (t >= a && t < b) hc = c;
    setAttrs(box, { stroke: hc || (t < te + 1.3 && te > -1e8 ? C.gold : C.line), 'stroke-width': hc ? 4 : 2 });
  });
  return api;
}
// labelled register row/grid. items: [[name, init, w?], ...]
function regs(parent, x, y, items, o = {}) {
  const w = o.w || 150, h = o.h || 62, gx = o.gx ?? 22, gy = o.gy ?? 64, cols = o.cols || items.length;
  const out = {};
  items.forEach(([name, init, ww], k) => {
    const cx = x + (k % cols) * (w + gx), cy = y + Math.floor(k / cols) * (h + gy);
    T(parent, cx + (ww || w) / 2, cy - 30, name, { size: o.ls || 22, anchor: 'middle', fill: o.lc || C.cyan, weight: 600, mono: true });
    out[name] = cell(parent, cx, cy, ww || w, h, init, o);
  });
  const api = {
    cells: out,
    set(t, name, v) { out[name].set(t, v); return api; },
    focus(t0, t1, name, col) { out[name].focus(t0, t1, col); return api; }
  };
  return api;
}
// memory column: rows = [[addr, init], ...] (top = high address if o.reverse)
function mem(parent, x, y, rows, o = {}) {
  const w = o.w || 140, h = o.h || 50, gap = o.gap ?? 6, aw = o.aw || 110;
  const out = {};
  if (o.title) T(parent, x + aw + w / 2, y - 18, o.title, { size: 22, anchor: 'middle', fill: o.tc || C.muted });
  rows.forEach(([addr, init], k) => {
    const cy = y + k * (h + gap);
    T(parent, x + aw - 14, cy + h / 2 + 8, addr, { size: 22, anchor: 'end', fill: C.muted, mono: true });
    out[addr] = cell(parent, x + aw, cy, w, h, init, { size: o.size || 26, old: o.old });
  });
  const api = {
    cells: out,
    set(t, a, v) { out[a].set(t, v); return api; },
    focus(t0, t1, a, col) { out[a].focus(t0, t1, col); return api; },
    yOf(a) { return out[a].y + h / 2; }
  };
  return api;
}
// 8-bit register view (D7..D0), optional carry cell on the left. value given as 8-char bit string.
function bits(parent, x, y, init, o = {}) {
  const w = o.w || 64, h = o.h || 64, gap = o.gap ?? 6;
  const g = el('g', {}, parent);
  const cx0 = o.carry != null ? x + w + 40 : x;
  const cellsB = [];
  for (let k = 0; k < 8; k++) {
    const cx = cx0 + k * (w + gap);
    if (o.labels !== false) T(g, cx + w / 2, y - 12, 'D' + (7 - k), { size: 18, anchor: 'middle', fill: C.muted, mono: true });
    if (o.sub) T(g, cx + w / 2, y + h + 26, o.sub[k], { size: 18, anchor: 'middle', fill: o.subColor || C.violet, mono: true });
    const fillC = o.nib ? (k < 4 ? 'rgba(91,140,255,.18)' : 'rgba(247,197,72,.14)') : C.panel2;
    cellsB.push(cell(g, cx, y, w, h, init[k], { size: h * 0.5, old: false, fill: fillC }));
  }
  let cC = null;
  if (o.carry != null) {
    T(g, x + w / 2, y - 12, o.cname || 'CY', { size: 18, anchor: 'middle', fill: C.gold, mono: true });
    cC = cell(g, x, y, w, h, String(o.carry), { size: h * 0.5, old: false, fill: 'rgba(247,197,72,.12)' });
  }
  if (o.name) T(g, (o.carry != null ? x : cx0) - 18, y + h / 2 + 10, o.name, { size: 26, anchor: 'end', fill: C.cyan, weight: 700, mono: true });
  let hexT = null;
  if (o.hex) hexT = cell(g, cx0 + 8 * (w + gap) + 24, y, 110, h, o.hex, { size: 28, old: false, color: C.gold });
  const api = {
    g, w, h, gap, x0: cx0,
    xOf: k => cx0 + k * (w + gap) + w / 2,
    set(t, v, hex) {
      for (let k = 0; k < 8; k++) cellsB[k].set(t, v[k]);
      if (hex && hexT) hexT.set(t, hex);
      return api;
    },
    setC(t, v) { cC.set(t, String(v)); return api; },
    cells: cellsB, carry: cC
  };
  return api;
}
// code listing with execution cursor; lines = [[code, comment?], ...]
function code(parent, x, y, lines, o = {}) {
  const lh = o.lh || 46, size = o.size || 26, w = o.w || 820, cw = o.cw || 420;
  const g = el('g', {}, parent);
  card(g, x, y, w, lines.length * lh + 30, { fill: 'rgba(6,14,28,.85)' });
  const hl = el('rect', { x: x + 6, width: w - 12, height: lh - 4, rx: 6, fill: 'rgba(61,213,243,.16)', stroke: C.cyan, 'stroke-width': 1.5, opacity: 0 }, g);
  const rows = lines.map(([c, cm], k) => {
    const yy = y + 15 + k * lh + lh * 0.68;
    const tc = T(g, x + 22, yy, c, { size, mono: true, fill: C.text });
    let tcm = null;
    if (cm) tcm = T(g, x + w - cw, yy, cm, { size: size - 2, mono: true, fill: C.green, maxw: cw - 14 });
    return { tc, tcm, yy };
  });
  const steps = []; // [t, idx]
  const reveal = o.reveal || 'step'; // comments: 'step' (appear when executed) | 'all'
  const api = {
    step(t, k) { steps.push([t, k]); steps.sort((a, b) => a[0] - b[0]); return api; },
    off(t) { steps.push([t, -1]); steps.sort((a, b) => a[0] - b[0]); return api; },
    yOf: k => y + 15 + k * lh + lh / 2, x, y, w, lh
  };
  U.push(t => {
    let cur = -2, ts = -1e9, prevK = -2, maxSeen = -1;
    for (const [tt, k] of steps) if (t >= tt) { prevK = cur; cur = k; ts = tt; if (k > maxSeen) maxSeen = k; }
    if (cur >= 0) {
      const k = prog(t, ts, 0.35), from = prevK >= 0 ? prevK : cur;
      hl.setAttribute('y', lerp(y + 15 + from * lh, y + 15 + cur * lh, ease(k)) + 2);
      hl.setAttribute('opacity', 1);
    } else hl.setAttribute('opacity', 0);
    rows.forEach((r, k) => {
      const seen = steps.some(([tt, kk]) => kk === k && t >= tt);
      if (r.tcm) r.tcm.setAttribute('opacity', reveal === 'all' || seen ? 1 : 0);
      r.tc.setAttribute('fill', k === cur ? C.cyan : (cur >= 0 && !seen && o.dimFuture ? C.dim : C.text));
    });
  });
  return api;
}
// simple table; rows of strings; o.rowIn = times
function table(parent, x, y, colW, rows, o = {}) {
  const rh = o.rh || 48, size = o.size || 24;
  const g = el('g', {}, parent);
  const W = colW.reduce((a, b) => a + b, 0);
  const cellsT = [];
  rows.forEach((r, i) => {
    const rg = o.rowIn && o.rowIn[i] != null ? G(g, { in: o.rowIn[i] }) : g;
    const head = i === 0 && o.header !== false;
    el('rect', { x, y: y + i * rh, width: W, height: rh, fill: head ? 'rgba(61,213,243,.14)' : (i % 2 ? 'rgba(255,255,255,.025)' : 'rgba(0,0,0,0)'), stroke: C.line, 'stroke-width': 1 }, rg);
    let cx = x;
    cellsT[i] = [];
    r.forEach((s, j) => {
      const hb = el('rect', { x: cx + 2, y: y + i * rh + 2, width: colW[j] - 4, height: rh - 4, rx: 4, fill: C.gold, opacity: 0 }, rg);
      const tt = T(rg, cx + colW[j] / 2, y + i * rh + rh / 2 + size * 0.36, s, { size, anchor: 'middle', fill: head ? C.cyan : (o.colColor && o.colColor[j]) || C.text, weight: head ? 700 : 400, mono: o.mono, maxw: colW[j] - 8 });
      cellsT[i][j] = { hb, tt };
      cx += colW[j];
    });
  });
  const marks = [];
  U.push(t => {
    for (const row of cellsT) for (const c of row) c.hb.setAttribute('opacity', 0);
    for (const [r, c, t0, t1] of marks) if (t >= t0 && t < t1) cellsT[r][c].hb.setAttribute('opacity', 0.35);
  });
  return { hl(r, c, t0, t1) { marks.push([r, c, t0, t1]); }, x, y, rh, colW };
}
// column arithmetic in monospace; rows: [{s, in, fill, line}], right aligned at x
function column(parent, x, y, rows, o = {}) {
  const size = o.size || 32, lh = o.lh || size * 1.45;
  rows.forEach((r, k) => {
    const g = G(parent, { in: r.in });
    const yy = y + k * lh;
    if (r.line) el('rect', { x: x - (o.lw || 330), y: yy - size * 0.95, width: o.lw || 330, height: 3, fill: C.muted }, g);
    else T(g, x, yy, r.s, { size, anchor: 'end', mono: true, fill: r.fill || C.text, weight: r.weight || 600 });
    if (r.note) T(g, x + 30, yy, r.note, { size: size * 0.72, fill: r.nfill || C.gold, maxw: o.nw || 700 });
  });
}
// moving pointer arrow (e.g. SP): events = [[t, y, label?]]
function pointer(parent, x, y0, label, events, o = {}) {
  const g = el('g', {}, parent);
  const col = o.color || C.gold;
  const a = arrow(g, x - 110, 0, x - 8, 0, col, 4);
  const tx = T(g, x - 120, 9, label, { size: 26, anchor: 'end', fill: col, weight: 700, mono: true });
  U.push(t => {
    let yy = y0, from = y0, te = -1e9;
    for (const [tt, v] of events) if (t >= tt) { from = yy; yy = v; te = tt; }
    const k = ease(prog(t, te, 0.5));
    g.setAttribute('transform', `translate(0 ${lerp(from, yy, k).toFixed(1)})`);
  });
  return g;
}
// [5,6,7] -> 'P5–P7', [14,16] -> 'P14、P16'
function pagesLabel(ps) {
  const out = []; let i = 0;
  while (i < ps.length) { let j = i; while (j + 1 < ps.length && ps[j + 1] === ps[j] + 1) j++;
    out.push(j - i >= 1 ? `P${ps[i]}–P${ps[j]}` : `P${ps[i]}`); i = j + 1; }
  return out.join('、');
}
function sceneGroup(id) {
  const s = SC[id];
  return G(svg, { in: s.t0, d: 0.5, out: s.t1 - 0.4, od: 0.4, fx: 'none' });
}
// scene title with PDF page badge
function title(parent, id, text, pages) {
  const s = SC[id];
  const g = G(parent, { in: s.t0 + 0.1, d: 0.5 });
  T(g, 60, 158, text, { size: 46, weight: 700, maxw: 1500 });
  if (pages) {
    const w = 18 * pages.length + 70;
    el('rect', { x: 1860 - w, y: 120, width: w, height: 46, rx: 23, fill: 'rgba(247,197,72,.1)', stroke: C.gold, 'stroke-width': 1.6 }, g);
    T(g, 1860 - w / 2, 151, '课件 ' + pages, { size: 22, anchor: 'middle', fill: C.gold, weight: 600 });
  }
  return g;
}
// swapping sub-heading: steps = [[tin, text], ...]
function stepLabel(parent, x, y, steps, o = {}) {
  steps.forEach(([tin, s], k) => {
    const tout = steps[k + 1] ? steps[k + 1][0] - 0.25 : (o.out ?? null);
    const g = G(parent, { in: tin, out: tout, od: 0.25 });
    el('rect', { x, y: y - 30, width: 6, height: 38, rx: 3, fill: o.color || C.gold }, g);
    T(g, x + 20, y, s, { size: o.size || 32, fill: o.color || C.gold, weight: 700, maxw: o.maxw || 1700 });
  });
}

function init() {
  defs = el('defs');
  defs.innerHTML = `
    <radialGradient id="bgGrad" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="${C.bg0}"/><stop offset="1" stop-color="${C.bg1}"/></radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#12263F" stroke-width="1"/></pattern>`;
  el('rect', { width: 1920, height: 1080, fill: 'url(#bgGrad)' });
  el('rect', { width: 1920, height: 1080, fill: 'url(#grid)', opacity: 0.45 });
}

return { TL, C, KC, SC, LN, at, end, clamp, prog, ease, eo, lerp, el, setAttrs, setRich, plain, T, G, D, U, applyAll, arrowId,
  pagesLabel, card, pill, arrow, path, bullets, note, cell, regs, mem, bits, code, table, column, pointer, sceneGroup, title, stepLabel, init, svg, MONO };
})();
