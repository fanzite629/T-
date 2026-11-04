/* Scenes part 3: 8-3 instrument (overview, lamp, flame, furnace, optics & detection), 8-4 quantitation, 8-7 features, quiz 2, summary */
'use strict';
(() => {
const { TL, C, SC, at, end, prog, lerp, E, eo, el, setAttrs, T, G, D, U, focus, card, pill, arrow,
  axes, curve, gauss, bullets, sceneGroup, title, stepLabel, svg } = window.ENG;
const S = window.SCENES;
const { lampIcon, flameIcon, box } = window.DRAW;
const sq = (x, f) => ((x * f) % 1 + 1) % 1 < 0.5 ? 1 : 0;

/* ================= instrument overview ================= */
S.push(function inst() {
  const id = 'inst', g = sceneGroup(id);
  title(g, id, '8-3 原子吸收分光光度计', '课件 P42–46 · 又叫原子吸收光谱仪');
  const parts = [['锐线光源', '空心阴极灯', C.gold], ['原子化系统', '火焰 / 石墨炉', C.orange], ['光学系统', '单色器', C.cyan], ['检测系统', '光电倍增管 · 放大 · 显示', C.green]];
  const y = 440, xs = [130, 560, 990, 1420], w = 370;
  const P = G(g, { in: at(id, 1), fx: 'none' });
  parts.forEach(([h, s, c], k) => {
    const p = G(P, { in: at(id, 1) + k * 0.5, fx: 'up' });
    card(p, xs[k], y - 90, w, 180, { stroke: c, sw: 2.5 });
    T(p, xs[k] + w / 2, y - 18, h, { size: 34, anchor: 'middle', weight: 700, fill: c });
    T(p, xs[k] + w / 2, y + 36, s, { size: 23, anchor: 'middle', fill: C.muted, maxw: w - 30 });
    if (k < 3) arrow(p, xs[k] + w + 6, y, xs[k + 1] - 8, y, C.muted, 3);
  });
  // beam pulses travelling through
  const beam = el('rect', { x: 130, y: y + 112, height: 10, rx: 5, fill: C.gold }, P);
  U.push(t => {
    const k = E(t, at(id, 2), end(id, 3) - at(id, 2));
    beam.setAttribute('width', (1660 * k).toFixed(1));
    beam.setAttribute('opacity', t > at(id, 4) ? 0 : 0.85);
  });
  const desc = [[2, 0, '发出待测元素的锐线'], [2, 1, '样品 → 原子蒸气，吸收一部分光'], [3, 2, '共振线与邻近线分开'], [3, 3, '光 → 电 → 吸光度']];
  desc.forEach(([li, k, s]) => T(G(P, { in: at(id, li) + (k % 2) * 2.2 }), xs[k] + w / 2, y + 170, s, { size: 22, anchor: 'middle', fill: C.text, maxw: w }));
  // order matters
  const O = G(g, { in: at(id, 4), out: at(id, 6) - 0.3, fx: 'none' });
  card(O, 130, 690, 1660, 220, { stroke: C.red });
  T(O, 170, 745, '为什么单色器在原子化器之后？', { size: 30, weight: 700, fill: C.red });
  flameIcon(O, 1560, 885, 0.7);
  const rays = [];
  for (let k = 0; k < 9; k++) rays.push(el('path', { stroke: C.orange, 'stroke-width': 2.5, 'marker-end': `url(#${window.ENG.arrowId(C.orange)})` }, O));
  T(G(O, { in: at(id, 5) }), 170, 810, '火焰发出大量各种波长的光', { size: 24, maxw: 520 });
  T(G(O, { in: at(id, 5) + 1.5 }), 170, 862, '→ 先经单色器挡掉，避免直接照射检测器', { size: 24, fill: C.gold, maxw: 1100 });
  U.push(t => rays.forEach((r, k) => { const a = -Math.PI / 2 + (k - 4) * 0.36, L = 30 + 40 * E(t, at(id, 5), 0.8); r.setAttribute('d', `M${1560 + Math.cos(a) * 55} ${835 + Math.sin(a) * 50} l${(Math.cos(a) * L).toFixed(1)} ${(Math.sin(a) * L).toFixed(1)}`); }));
  // modulation
  const M = G(g, { in: at(id, 6), out: at(id, 8) - 0.3, fx: 'none' });
  const plot = (x0, y0, f, col, lbl, t0) => {
    const p = G(M, { in: t0 });
    el('line', { x1: x0, y1: y0, x2: x0 + 440, y2: y0, stroke: C.line, 'stroke-width': 2 }, p);
    D(el('path', { d: curve(f, 0, 1, v => x0 + v * 440, v => y0 - v * 70, 400), stroke: col, 'stroke-width': 3.5, fill: 'none' }, p), t0, 1);
    T(p, x0 + 220, y0 + 36, lbl, { size: 22, anchor: 'middle', fill: col, maxw: 460 });
  };
  plot(150, 830, v => 0.9 * sq(v, 6), C.gold, '光源：调制（交变）', at(id, 6) + 0.5);
  T(G(M, { in: at(id, 6) + 1.5 }), 625, 790, '+', { size: 48, anchor: 'middle', fill: C.muted });
  plot(700, 830, () => 0.5, C.orange, '火焰发射（直流）', at(id, 6) + 1.5);
  T(G(M, { in: at(id, 7) }), 1180, 790, '→', { size: 48, anchor: 'middle', fill: C.muted });
  plot(1260, 830, v => 0.9 * sq(v, 6), C.green, '交流放大器：只放大交变信号', at(id, 7) + 0.3);
  T(M, 150, 730, '光源调制 / 电源调制：区分光源辐射与火焰辐射', { size: 28, weight: 700, fill: C.gold, maxw: 1600 });
  T(G(M, { in: at(id, 7) + 1 }), 1760, 730, '（解释为补充）', { size: 20, anchor: 'end', fill: C.muted, cls: 'note' });
  // features
  const F = G(g, { in: at(id, 8), fx: 'none' });
  ['(1) 采用锐线光源', '(2) 单色器在火焰与检测器之间', '(3) 有专门的原子化系统'].forEach((s, k) => {
    const p = G(F, { in: at(id, 8) + k * 1.2, fx: 'up' });
    card(p, 130 + k * 560, 720, 520, 120, { stroke: C.cyan });
    T(p, 390 + k * 560, 792, s, { size: 28, anchor: 'middle', weight: 600, maxw: 490 });
  });
});

/* ================= hollow cathode lamp ================= */
S.push(function hcl() {
  const id = 'hcl', g = sceneGroup(id);
  title(g, id, '二、光源：空心阴极灯', '课件 P47–52');
  const R = G(g, { in: at(id, 0), out: at(id, 4) - 0.3, fx: 'none' });
  card(R, 130, 310, 1660, 120, { stroke: C.gold, fill: 'rgba(247,197,72,.06)' });
  T(R, 960, 385, '作用：提供待测元素的特征光谱 → 较高的灵敏度和准确度', { size: 32, anchor: 'middle', fill: C.gold, weight: 700, maxw: 1600 });
  const req = [['发射待测元素的共振线', '强度足够', 1], ['发射锐线', '否则测出的不是峰值吸收', 2], ['辐射稳定', '背景小', 2]];
  req.forEach(([h, s, li], k) => {
    const p = G(R, { in: at(id, li) + (k === 2 ? 2.4 : 0), fx: 'up' });
    card(p, 130 + k * 560, 480, 520, 200, { stroke: C.cyanDeep });
    el('circle', { cx: 190 + k * 560, cy: 540, r: 26, fill: C.cyan }, p);
    T(p, 190 + k * 560, 549, String(k + 1), { size: 26, anchor: 'middle', fill: C.bg1, weight: 700 });
    T(p, 235 + k * 560, 550, h, { size: 28, weight: 700, maxw: 400 });
    T(p, 160 + k * 560, 625, s, { size: 24, fill: C.muted, maxw: 480 });
  });
  T(G(R, { in: at(id, 3) }), 960, 780, '常用：空心阴极灯（应用最广）· 无极放电灯', { size: 30, anchor: 'middle', weight: 600 });
  // lamp cross-section
  const Lm = G(g, { in: at(id, 4), fx: 'none' });
  const ly = 560;
  el('rect', { x: 140, y: ly - 150, width: 900, height: 300, rx: 140, fill: 'rgba(159,184,208,.07)', stroke: '#9FB8D0', 'stroke-width': 3 }, Lm);
  el('rect', { x: 1030, y: ly - 80, width: 30, height: 160, rx: 6, fill: 'rgba(61,213,243,.25)', stroke: C.cyan, 'stroke-width': 2 }, Lm);
  T(Lm, 1045, ly + 115, '石英窗', { size: 20, anchor: 'middle', fill: C.cyan });
  // hollow cathode cup
  el('path', { d: `M520 ${ly - 70} H330 V${ly + 70} H520`, fill: 'none', stroke: C.gold, 'stroke-width': 14 }, Lm);
  el('line', { x1: 330, y1: ly, x2: 160, y2: ly, stroke: C.gold, 'stroke-width': 5 }, Lm);
  T(Lm, 425, ly - 95, '空心阴极（待测金属）', { size: 22, anchor: 'middle', fill: C.gold });
  const an = G(Lm, { in: at(id, 5) });
  el('path', { d: `M160 ${ly + 110} H700 V${ly + 40}`, fill: 'none', stroke: '#B8C4D4', 'stroke-width': 5 }, an);
  el('circle', { cx: 700, cy: ly + 32, r: 10, fill: '#B8C4D4' }, an);
  T(an, 720, ly + 138, '阳极（W / Ti / Zr）', { size: 22, fill: '#B8C4D4' });
  T(an, 860, ly - 165, '充 Ne 或 Ar，数百帕', { size: 22, fill: C.violet, anchor: 'middle' });
  const gas = [];
  const rr = window.ENG.rng(31);
  for (let k = 0; k < 16; k++) gas.push(el('circle', { cx: 560 + rr() * 420, cy: ly - 110 + rr() * 220, r: 7, fill: C.violet, opacity: 0.55 }, an));
  // process actors
  const pr = G(Lm, { in: at(id, 6), fx: 'none' });
  const glow = el('ellipse', { cx: 430, cy: ly, rx: 80, ry: 52, fill: C.pink, opacity: 0, filter: 'url(#blur6)' }, pr);
  const eDot = el('circle', { r: 8, fill: C.text }, pr), ion = el('circle', { r: 11, fill: C.violet }, pr), M1 = el('circle', { r: 12, fill: C.gold }, pr);
  const ionT = T(pr, 0, 0, '', { size: 20, fill: C.violet, weight: 700 }), mT = T(pr, 0, 0, '', { size: 20, fill: C.gold, weight: 700 });
  const out = el('rect', { x: 1060, y: ly - 8, height: 16, rx: 4, fill: C.gold }, pr);
  U.push(t => {
    glow.setAttribute('opacity', (0.5 * E(t, at(id, 6), 1)).toFixed(2));
    // electron from cathode to Ar (line 7)
    const k7 = E(t, at(id, 7), 1.2);
    setAttrs(eDot, { cx: lerp(500, 640, k7), cy: ly, opacity: t > at(id, 7) && t < at(id, 8) ? 1 : 0 });
    // Ar+ accelerates to cathode wall (line 8)
    const k8 = E(t, at(id, 8), 1.4);
    setAttrs(ion, { cx: lerp(650, 345, k8), cy: lerp(ly - 10, ly - 40, k8), opacity: t > at(id, 7) + 1 && t < at(id, 9) ? 1 : 0 });
    setAttrs(ionT, { x: lerp(650, 345, k8) + 14, y: lerp(ly - 10, ly - 40, k8) - 14 }); ionT.textContent = t > at(id, 7) + 1 && t < at(id, 9) ? 'Ar⁺' : '';
    // sputtered M (line 8 end) -> excited (line 9) -> emits (line 10)
    const k8b = E(t, at(id, 8) + 1.6, 1.0);
    const k9 = E(t, at(id, 9), 1.2);
    setAttrs(M1, { cx: lerp(345, 450, k8b) + 30 * k9, cy: lerp(ly - 40, ly - 10, k8b), opacity: t > at(id, 8) + 1.5 ? 1 : 0, fill: k9 > 0.5 ? C.red : C.gold, filter: k9 > 0.5 ? 'url(#glow)' : '' });
    setAttrs(mT, { x: lerp(345, 450, k8b) + 30 * k9 + 16, y: lerp(ly - 40, ly - 10, k8b) - 16 }); mT.textContent = t > at(id, 8) + 1.5 ? (k9 > 0.5 && t < at(id, 10) + 1 ? 'M*' : 'M') : '';
    out.setAttribute('width', (520 * E(t, at(id, 10) + 0.5, 1)).toFixed(1));
  });
  const eq = G(g, { in: at(id, 7), out: at(id, 12) - 0.3, fx: 'none' });
  card(eq, 1100, 250, 760, 270, { stroke: C.violet });
  [[7, 'Ar + e → Ar^{+} + 2e', '电离'], [8, 'Ar^{+} 轰击阴极 → M（溅射）', '溅射'], [9, 'M + e / Ar / Ar^{+} → M*', '激发'], [10, 'M* → M + hν（特征锐线）', '发光']].forEach(([li, s, n], k) => {
    const p = G(eq, { in: at(id, li), fx: 'left' });
    T(p, 1130, 300 + k * 60, n, { size: 22, fill: C.violet, weight: 700 });
    T(p, 1200, 300 + k * 60, s, { size: 26, mono: false, maxw: 640 });
  });
  T(G(Lm, { in: at(id, 6) }), 590, 260 + 0, '电压 300–500 V · 辉光放电', { size: 26, anchor: 'middle', fill: C.pink, weight: 700 });
  const nw = G(g, { in: at(id, 11), out: at(id, 12) - 0.3 });
  card(nw, 140, 760, 1720, 140, { stroke: C.gold, fill: 'rgba(247,197,72,.07)' });
  T(nw, 170, 820, '为什么是锐线？灯内温度低 → 热变宽小；气压低 → 压力变宽小', { size: 28, fill: C.gold, weight: 700, maxw: 1660 });
  T(nw, 170, 868, '因此发射线宽度 Δν_{e} 远小于火焰中吸收线宽度 Δν_{a}（推理补充）', { size: 23, fill: C.muted, maxw: 1660 });
  // current trade-off
  const cur = G(g, { in: at(id, 12), fx: 'none' });
  card(cur, 140, 730, 1720, 200, { stroke: C.cyanDeep });
  T(cur, 170, 780, '灯电流：一般 1–20 mA', { size: 28, weight: 700, fill: C.cyan });
  const sl = 600, sr = 1500, syy = 830;
  el('line', { x1: sl, y1: syy, x2: sr, y2: syy, stroke: C.line, 'stroke-width': 8, 'stroke-linecap': 'round' }, cur);
  const knob = el('circle', { cy: syy, r: 18, fill: C.gold }, cur);
  T(cur, sl, syy + 50, '小：光弱、信噪比↓', { size: 22, fill: C.muted, anchor: 'middle' });
  T(cur, sr, syy + 50, '大：热变宽、自吸↑，寿命↓', { size: 22, fill: C.muted, anchor: 'middle' });
  const okZone = G(cur, { in: at(id, 13) + 2 });
  el('rect', { x: 760, y: syy - 14, width: 260, height: 28, rx: 14, fill: 'rgba(110,231,168,.35)' }, okZone);
  T(okZone, 890, syy - 30, '满足要求时，选较低电流', { size: 22, anchor: 'middle', fill: C.green, weight: 700 });
  U.push(t => {
    let x = lerp(sl, sr, 0.5 + 0.45 * E(t, at(id, 12) + 1, 1.5));
    x = lerp(x, sl + 40, E(t, at(id, 13), 1));
    x = lerp(x, 890, E(t, at(id, 13) + 2, 0.8));
    knob.setAttribute('cx', x.toFixed(1));
  });
  const ft = G(g, { in: at(id, 14) });
  card(ft, 1100, 560 - 30, 760, 130, { stroke: C.green });
  T(ft, 1130, 588, '特点：光强大 · 稳定 · 谱线窄 · 易更换', { size: 26, fill: C.green, weight: 700, maxw: 700 });
  T(ft, 1130, 632, '多元素灯：谱线干扰大、价格贵 → 用得少', { size: 22, fill: C.muted, maxw: 700 });
});

/* ================= flame atomization ================= */
S.push(function flame() {
  const id = 'flame', g = sceneGroup(id);
  title(g, id, '三、原子化系统 · 火焰原子化', '课件 P53–61');
  stepLabel(g, 60, 262, [[at(id, 0), '作用与方法'], [at(id, 3), '火焰原子化装置：雾化器 · 雾化室 · 燃烧器'], [at(id, 10), '火焰的选择'], [at(id, 15), '常用火焰（课件 P60 表）'], [at(id, 18), '火焰法的优缺点']]);
  // A: definition
  const A = G(g, { in: at(id, 0), out: at(id, 3) - 0.3, fx: 'none' });
  const chain = ['试样溶液', '干燥 · 蒸发', '离解', '基态原子蒸气'];
  chain.forEach((s, k) => {
    const p = G(A, { in: at(id, 0) + 0.5 + k * 0.6, fx: 'scale', ox: 300 + k * 440, oy: 450 });
    box(p, 140 + k * 440, 390, 340, 110, s, { stroke: k === 3 ? C.gold : C.cyanDeep, color: k === 3 ? C.gold : C.text, size: 30 });
    if (k < 3) arrow(p, 486 + k * 440, 445, 574 + k * 440, 445, C.muted, 3);
  });
  T(G(A, { in: at(id, 1) }), 960, 580, '原子化：提供能量，使待测元素由试样转入气相，并转化为基态原子', { size: 28, anchor: 'middle', maxw: 1600 });
  [['火焰原子化法', '简单、快速，对大多数元素有较高灵敏度 · 使用最广', C.orange], ['非火焰原子化法（电热石墨炉）', '原子化效率、灵敏度和检测限更高 · 发展很快', C.violet]].forEach(([h, s, c], k) => {
    const p = G(A, { in: at(id, 2) + k * 1.5, fx: 'up' });
    card(p, 140 + k * 840, 660, 800, 200, { stroke: c });
    T(p, 180 + k * 840, 720, h, { size: 30, weight: 700, fill: c, maxw: 740 });
    T(p, 180 + k * 840, 780, s, { size: 23, maxw: 740 });
  });
  // B: nebulizer schematic
  const B = G(g, { in: at(id, 3), out: at(id, 10) - 0.3, fx: 'none' });
  const cy = 620;
  // sample beaker + capillary
  el('path', { d: 'M150 760 L160 880 H260 L270 760', fill: 'rgba(91,140,255,.25)', stroke: '#9FB8D0', 'stroke-width': 3 }, B);
  T(B, 210, 915, '试液', { size: 20, anchor: 'middle', fill: C.muted });
  el('path', { d: `M210 860 V${cy} H380`, fill: 'none', stroke: '#B8C4D4', 'stroke-width': 5 }, B);
  T(B, 230, cy - 20, '毛细管', { size: 20, fill: C.muted });
  // oxidant nozzle
  el('path', { d: `M300 ${cy + 60} H360 L385 ${cy + 10}`, fill: 'none', stroke: C.cyan, 'stroke-width': 6 }, B);
  T(B, 290, cy + 95, '助燃气', { size: 20, fill: C.cyan });
  // spray chamber
  el('path', { d: `M380 ${cy - 80} H1080 L1180 ${cy - 30} V${cy + 30} L1080 ${cy + 80} H380z`, fill: 'rgba(61,213,243,.05)', stroke: C.cyanDeep, 'stroke-width': 3 }, B);
  T(B, 730, cy - 100, '雾化室', { size: 24, anchor: 'middle', fill: C.cyan, weight: 700 });
  el('circle', { cx: 470, cy, r: 22, fill: '#B8C4D4' }, B);
  T(B, 470, cy + 120, '撞击球', { size: 20, anchor: 'middle', fill: C.muted });
  el('path', { d: `M700 ${cy + 80} V${cy + 180}`, stroke: '#9FB8D0', 'stroke-width': 6 }, B);
  T(B, 720, cy + 175, '废液管', { size: 20, fill: C.muted });
  el('path', { d: `M560 ${cy + 80} V${cy + 130} H640`, stroke: C.orange, 'stroke-width': 5, fill: 'none' }, B);
  T(B, 520, cy + 160, '燃气', { size: 20, fill: C.orange });
  // burner
  el('path', { d: `M1180 ${cy - 20} H1300 V${cy - 180} H1360 V${cy + 20} H1180`, fill: 'rgba(86,112,143,.4)', stroke: '#56708F', 'stroke-width': 3 }, B);
  T(B, 1420, cy - 120, '单缝燃烧器', { size: 22, fill: C.muted });
  const fl = G(B, { in: at(id, 7) + 1.5, fx: 'none' });
  el('ellipse', { cx: 1330, cy: cy - 260, rx: 40, ry: 90, fill: 'rgba(255,169,77,.4)', stroke: C.orange, 'stroke-width': 2.5 }, fl);
  el('ellipse', { cx: 1330, cy: cy - 225, rx: 20, ry: 50, fill: 'rgba(91,140,255,.55)' }, fl);
  T(fl, 1400, cy - 290, '火焰：蒸发 → 干燥 → 离解 → 基态原子', { size: 22, fill: C.orange, maxw: 480 });
  // droplets
  const drops = [];
  const rr = window.ENG.rng(41);
  for (let k = 0; k < 40; k++) drops.push({ r0: rr(), y0: rr() - 0.5, big: k % 4 === 0, e: el('circle', { fill: C.blue }, B) });
  U.push(t => {
    const live = t >= at(id, 4);
    drops.forEach(d => {
      if (!live) { d.e.setAttribute('opacity', 0); return; }
      const ph = ((t - at(id, 4)) * 0.28 + d.r0) % 1;
      let x, y, r;
      const broken = t >= at(id, 5);
      if (ph < 0.15) { x = lerp(390, 470, ph / 0.15); y = cy + d.y0 * 20; r = 9; }
      else if (d.big && t >= at(id, 6)) { const k = (ph - 0.15) / 0.85; x = lerp(480, 700, Math.min(1, k * 1.6)); y = cy + Math.min(1, k * 1.6) * 60 + (k > 0.62 ? (k - 0.62) * 300 : 0); r = 8; }
      else { const k = (ph - 0.15) / 0.85; x = lerp(480, 1330, k); y = k < 0.8 ? cy + d.y0 * 100 * (1 - k) : lerp(cy, cy - 200, (k - 0.8) / 0.2); r = broken ? 4 : 8; }
      setAttrs(d.e, { cx: x.toFixed(1), cy: y.toFixed(1), r, opacity: (x > 1320 && y < cy - 190) ? 0 : 0.85 });
    });
  });
  const nb = G(B, { in: at(id, 8), fx: 'none' });
  card(nb, 1400, 520, 460, 220, { stroke: C.gold });
  T(nb, 1430, 570, '雾化器要求', { size: 26, weight: 700, fill: C.gold });
  T(nb, 1430, 620, '效率高 · 雾滴细 · 喷雾稳定', { size: 23, maxw: 420 });
  T(nb, 1430, 680, '雾化效率仅 10%–12%', { size: 30, fill: C.red, weight: 700, maxw: 420 });
  T(G(B, { in: at(id, 4) }), 140, 330, '助燃气高速喷出 → 毛细管尖端负压 → 吸入试液 → 雾珠', { size: 24, maxw: 1200 });
  T(G(B, { in: at(id, 6) }), 140, 372, '大雾粒沉降 → 废液；小雾粒 + 燃气 + 助燃气 → 气溶胶 → 燃烧器', { size: 24, maxw: 1200 });
  // C: flame choice & types
  const Cg = G(g, { in: at(id, 10), out: at(id, 15) - 0.3, fx: 'none' });
  card(Cg, 140, 300, 1640, 130, { stroke: C.gold, fill: 'rgba(247,197,72,.06)' });
  T(Cg, 180, 355, '原则：保证待测元素充分离解为基态原子的前提下，尽量用低温火焰', { size: 28, fill: C.gold, weight: 700, maxw: 1580 });
  T(G(Cg, { in: at(id, 11) }), 180, 405, '温度过高 → 激发态原子增多、电离度增大 → 基态原子反而减少', { size: 24, maxw: 1580 });
  const types = [[12, '化学计量火焰', '燃助比 ≈ 1:4', ['温度高、干扰少', '稳定、背景低', '最常用'], C.cyan],
    [13, '富燃火焰', '燃助比 > 1:3（燃气多）', ['燃烧不完全，还原性', '测易形成难熔氧化物的元素', 'Mo、Cr、稀土等'], C.orange],
    [14, '贫燃火焰', '燃助比 < 1:6（燃气少）', ['燃烧充分，还原性差', '测不易氧化的元素', '碱金属、Ag、Cu、Ni、Co、Pd'], C.blue]];
  types.forEach(([li, h, r, lines, c], k) => {
    const p = G(Cg, { in: at(id, li), fx: 'up' });
    card(p, 140 + k * 550, 470, 520, 420, { stroke: c });
    flameIcon(p, 400 + k * 550, 640, 0.8 + (k === 1 ? 0.25 : k === 2 ? -0.15 : 0));
    T(p, 400 + k * 550, 700, h, { size: 30, anchor: 'middle', weight: 700, fill: c });
    T(p, 400 + k * 550, 745, r, { size: 23, anchor: 'middle', maxw: 490 });
    lines.forEach((s, j) => T(p, 400 + k * 550, 790 + j * 34, s, { size: 21, anchor: 'middle', fill: C.muted, maxw: 490 }));
  });
  // D: common flames table
  const Dg = G(g, { in: at(id, 15), out: at(id, 18) - 0.3, fx: 'none' });
  const rows = [['火焰', '燃烧速度 / cm·s^{−1}', '火焰温度 / ℃', '特点'],
    ['空气–乙炔', '160', '2300', '最常用 · 稳定、噪声低 · 测 35 种元素 · 短波紫外吸收较大', 15],
    ['氧化亚氮–乙炔', '180', '2955', '温度高、燃烧不快 · 难原子化元素 · 测 70 多种', 16],
    ['空气–氢', '320', '2050', '氧化性 · 温度较低 · 背景发射弱、透射好', 17]];
  rows.forEach((r, k) => {
    const p = G(Dg, { in: k ? at(id, r[4]) : at(id, 15), fx: 'left' });
    const y = 330 + k * 140;
    el('rect', { x: 140, y, width: 1640, height: 120, rx: 12, fill: k ? C.panel : C.panel2, stroke: k === 1 ? C.gold : C.line, 'stroke-width': k === 1 ? 2.5 : 1.5 }, p);
    [[170, 300], [500, 250], [770, 200], [990, 770]].forEach(([x, mw], j) => T(p, x, y + 72, r[j], { size: k ? (j === 3 ? 22 : 30) : 22, weight: k && j < 3 ? 700 : 400, fill: k ? (j === 2 ? C.gold : C.text) : C.muted, maxw: mw }));
  });
  T(Dg, 140, 900, '乙炔是燃气；空气、氧化亚氮是助燃气', { size: 24, fill: C.cyan });
  T(Dg, 1780, 900, '注：P57 写“最高 2600 K”，与 P60 表 2300 ℃（≈2573 K）一致', { size: 18, anchor: 'end', fill: C.muted, cls: 'note' });
  // E: pros & cons
  const Eg = G(g, { in: at(id, 18), fx: 'none' });
  card(Eg, 140, 300, 1640, 120, { stroke: C.green });
  T(Eg, 180, 375, '优点：装置不复杂 · 操作简便快速 · 精密度好 · 已成为完善、定型的常规方法', { size: 27, fill: C.green, weight: 700, maxw: 1580 });
  // pie: 10% reaches flame
  const pc = G(Eg, { in: at(id, 19), fx: 'none' });
  el('circle', { cx: 400, cy: 680, r: 170, fill: '#2A3F5C' }, pc);
  const ang = 2 * Math.PI * 0.1;
  el('path', { d: `M400 680 L400 510 A170 170 0 0 1 ${400 + 170 * Math.sin(ang)} ${680 - 170 * Math.cos(ang)}z`, fill: C.gold }, pc);
  T(pc, 470, 480, '≈10% 到达火焰', { size: 24, fill: C.gold, weight: 700 });
  T(pc, 400, 700, '≈90% 排掉', { size: 26, anchor: 'middle', fill: C.muted });
  const cons = [[19, '雾化效率低：到达火焰的试样仅为提升量（4–6 mL/min）的约 10%'], [20, '火焰稀释、高速燃烧：基态原子在吸收区仅停留约 10^{−3} s'], [21, '每次消耗试液 0.5–1 mL，血液、活体组织等少量样品受限'], [21, '不能直接分析固体试样']];
  cons.forEach(([li, s], k) => {
    const p = G(Eg, { in: at(id, li) + (k === 3 ? 2.5 : 0), fx: 'left' });
    el('rect', { x: 680, y: 470 + k * 105, width: 1100, height: 88, rx: 12, fill: 'rgba(255,122,107,.07)', stroke: C.red, 'stroke-width': 1.6 }, p);
    T(p, 710, 524 + k * 105, s, { size: 24, maxw: 1050 });
  });
  T(G(Eg, { in: at(id, 19) }), 680, 455, '缺点：灵敏度还不够高', { size: 26, fill: C.red, weight: 700 });
});

/* ================= graphite furnace ================= */
S.push(function furnace() {
  const id = 'furnace', g = sceneGroup(id);
  title(g, id, '石墨炉原子化装置', '课件 P62–65');
  const A = G(g, { in: at(id, 0), out: at(id, 5) - 0.3, fx: 'none' });
  const ty = 520;
  // tube with heating glow
  const heat = el('rect', { x: 360, y: ty - 50, width: 700, height: 100, rx: 20, fill: '#3A2A20' }, A);
  el('rect', { x: 360, y: ty - 50, width: 700, height: 100, rx: 20, fill: 'none', stroke: '#9AA8B8', 'stroke-width': 4 }, A);
  T(A, 710, ty + 90, '石墨管', { size: 24, anchor: 'middle', fill: C.muted });
  el('rect', { x: 690, y: ty - 120, width: 40, height: 70, fill: 'none', stroke: '#9AA8B8', 'stroke-width': 3 }, A);
  T(A, 760, ty - 100, '加样口', { size: 20, fill: C.muted });
  el('rect', { x: 140, y: ty - 6, width: 1100, height: 12, fill: C.gold, opacity: 0.8 }, A);
  T(A, 160, ty - 20, '光束', { size: 20, fill: C.gold });
  U.push(t => {
    const k = E(t, at(id, 0) + 1, 1.5);
    heat.setAttribute('fill', `rgb(${Math.round(lerp(58, 255, k))},${Math.round(lerp(42, 140, k))},${Math.round(lerp(32, 40, k))})`);
  });
  const ps = G(A, { in: at(id, 1) });
  el('path', { d: `M370 ${ty + 50} V${ty + 200} H1050 V${ty + 50}`, fill: 'none', stroke: C.red, 'stroke-width': 4 }, ps);
  box(ps, 600, ty + 160, 220, 80, '电源', { stroke: C.red, color: C.red, size: 26 });
  T(ps, 710, ty + 290, '10–25 V · 300 A（低电压、大电流）', { size: 24, anchor: 'middle', fill: C.red, weight: 600 });
  const gasO = G(A, { in: at(id, 2) }), gasI = G(A, { in: at(id, 3) }), cw = G(A, { in: at(id, 4) });
  [[300, ty - 110], [1120, ty - 110], [300, ty + 110], [1120, ty + 110]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 10, fill: C.violet, opacity: 0.8 }, gasO));
  T(gasO, 1280, 400, '管外 Ar：防止空气进入，保护石墨管不被氧化、烧蚀', { size: 23, fill: C.violet, maxw: 580 });
  arrow(gasI, 300, ty + 30, 400, ty + 30, C.cyan, 3); arrow(gasI, 1120, ty + 30, 1020, ty + 30, C.cyan, 3); arrow(gasI, 710, ty - 50, 710, ty - 150, C.cyan, 3);
  T(gasI, 1280, 470, '管内 Ar：两端进入、加样口排出，带走空气和初期蒸气', { size: 23, fill: C.cyan, maxw: 580 });
  el('rect', { x: 330, y: ty - 80, width: 760, height: 160, rx: 26, fill: 'none', stroke: C.blue, 'stroke-width': 3, 'stroke-dasharray': '10 8' }, cw);
  T(cw, 1280, 540, '冷却水：金属炉体周围通水，保护炉体', { size: 23, fill: C.blue, maxw: 580 });
  // B: temperature program
  const B = G(g, { in: at(id, 5), out: at(id, 11) - 0.3, fx: 'none' });
  const ox = 200, oy = 830, W = 1200, H = 480;
  axes(B, ox, oy, W, H, '时间 t', '温度 / ℃');
  const X = s => ox + s * W, Y = c => oy - c / 3200 * H;
  const stages = [[6, '干燥', 0.0, 0.22, 105, C.blue], [7, '灰化', 0.26, 0.5, 800, C.green], [8, '原子化', 0.55, 0.72, 2700, C.red], [9, '净化', 0.76, 0.9, 3000, C.violet]];
  let dStep = `M${X(0)} ${Y(25)}`, dRamp = `M${X(0)} ${Y(25)}`;
  stages.forEach(([li, n, a, b, temp]) => { dStep += ` L${X(a)} ${Y(temp)} L${X(b)} ${Y(temp)}`; dRamp += ` L${X(a + 0.05)} ${Y(temp)} L${X(b)} ${Y(temp)}`; });
  dStep += ` L${X(0.92)} ${Y(25)}`; dRamp += ` L${X(0.92)} ${Y(25)}`;
  const step = el('path', { d: dStep, stroke: C.gold, 'stroke-width': 3.5, fill: 'none', 'stroke-dasharray': '10 7' }, B);
  stages.forEach(([li, n, a, b, temp, c]) => {
    const p = G(B, { in: at(id, li), fx: 'up' });
    el('rect', { x: X(a), y: Y(temp) - 4, width: X(b) - X(a), height: oy - Y(temp) + 4, fill: c, opacity: 0.16 }, p);
    T(p, (X(a) + X(b)) / 2, Y(temp) - (temp < 300 ? 46 : 22), n, { size: 26, anchor: 'middle', weight: 700, fill: c });
    T(p, (X(a) + X(b)) / 2, oy - 20, ['105 ℃', '350–1200 ℃', '2400–3000 ℃', '更高温'][stages.findIndex(s => s[0] === li)], { size: 20, anchor: 'middle', fill: C.text, maxw: X(b) - X(a) + 30 });
  });
  const rampG = G(B, { in: at(id, 10) });
  el('path', { d: dRamp, stroke: C.cyan, 'stroke-width': 3.5, fill: 'none' }, rampG);
  T(rampG, X(0.03), Y(3050), '虚线：阶梯升温', { size: 22, fill: C.gold });
  T(rampG, X(0.03), Y(2800), '实线：斜坡升温', { size: 22, fill: C.cyan });
  const sig = G(B, { in: at(id, 8) + 1 });
  el('path', { d: curve(v => Math.exp(-((v - 0.62) ** 2) / 0.0007), 0.56, 0.71, X, v => Y(900) - v * 220), stroke: C.gold, 'stroke-width': 4, fill: 'none' }, sig);
  T(sig, X(0.635), Y(900) + 34, '吸收信号', { size: 22, fill: C.gold, weight: 700, anchor: 'middle' });
  const desc = [[6, '去除溶剂，防样品溅射'], [7, '除去易挥发的基体和有机物'], [8, '化合物分解为基态原子 · 记录信号'], [9, '高温除残渣，净化石墨管']];
  desc.forEach(([li, s], k) => { const p = G(B, { in: at(id, li) }); T(p, 1460, 360 + k * 110, ['干燥', '灰化', '原子化', '净化'][k], { size: 26, weight: 700, fill: stages[k][5] }); T(p, 1460, 400 + k * 110, s, { size: 21, maxw: 420 }); });
  T(G(B, { in: at(id, 9) + 1 }), 1880, 880, '注：P64 写“净化（高于 100 ℃）”，应为高于原子化温度', { size: 18, anchor: 'end', fill: C.muted, cls: 'note' });
  // C: pros / cons + comparison
  const Cg = G(g, { in: at(id, 11), fx: 'none' });
  card(Cg, 140, 300, 820, 380, { stroke: C.green });
  T(Cg, 180, 360, '优点', { size: 32, weight: 700, fill: C.green });
  bullets(Cg, 190, 430, [['灵敏度高', at(id, 11) + 0.3], ['试样用量少', at(id, 11) + 1.2], ['可分析固体样品', at(id, 11) + 2.1], ['可通过程序升温预处理试样', at(id, 11) + 3.0]], { size: 26, gap: 60, dot: C.green });
  const cn = G(Cg, { in: at(id, 12) });
  card(cn, 1000, 300, 780, 380, { stroke: C.red });
  T(cn, 1040, 360, '缺点', { size: 32, weight: 700, fill: C.red });
  bullets(cn, 1050, 430, [['精密度较差', at(id, 12) + 0.2], ['基体效应严重', at(id, 12) + 1.2]], { size: 26, gap: 60, dot: C.red });
  const cm = G(Cg, { in: at(id, 13) });
  [['火焰法', '快速 · 精密（RSD < 1%）', C.orange], ['石墨炉', '灵敏 · 省样品（RSD 约 3%–5%）', C.violet]].forEach(([h, s, c], k) => {
    card(cm, 140 + k * 860, 720, 780, 140, { stroke: c });
    T(cm, 180 + k * 860, 785, h, { size: 32, weight: 700, fill: c });
    T(cm, 340 + k * 860, 785, s, { size: 26, maxw: 560 });
  });
});

/* ================= optics & detection ================= */
S.push(function optsys() {
  const id = 'optsys', g = sceneGroup(id);
  title(g, id, '四、光学系统 · 五、检测系统 · 六、仪器类型', '课件 P66–70（单色器示意参考 P31）');
  const A = G(g, { in: at(id, 0), out: at(id, 8) - 0.3, fx: 'none' });
  // Czerny–Turner sketch
  const slitIn = [180, 760], m1 = [420, 360], gr = [720, 700], m2 = [1000, 360], slitOut = [1220, 760];
  el('rect', { x: slitIn[0] - 6, y: slitIn[1] - 40, width: 12, height: 80, fill: '#9AA8B8' }, A);
  el('rect', { x: slitIn[0] - 6, y: slitIn[1] - 6, width: 12, height: 12, fill: C.bg1 }, A);
  T(A, slitIn[0], slitIn[1] + 70, '入射狭缝', { size: 20, anchor: 'middle', fill: C.muted });
  el('path', { d: `M${m1[0] - 80} ${m1[1] + 20} Q${m1[0]} ${m1[1] - 30} ${m1[0] + 80} ${m1[1] + 20}`, stroke: C.cyan, 'stroke-width': 6, fill: 'none' }, A);
  el('path', { d: `M${m2[0] - 80} ${m2[1] + 20} Q${m2[0]} ${m2[1] - 30} ${m2[0] + 80} ${m2[1] + 20}`, stroke: C.cyan, 'stroke-width': 6, fill: 'none' }, A);
  T(A, m1[0], m1[1] - 30, '凹面镜', { size: 20, anchor: 'middle', fill: C.cyan }); T(A, m2[0], m2[1] - 30, '凹面镜', { size: 20, anchor: 'middle', fill: C.cyan });
  el('rect', { x: gr[0] - 90, y: gr[1] - 10, width: 180, height: 22, fill: C.orange }, A);
  for (let k = 0; k < 18; k++) el('line', { x1: gr[0] - 85 + k * 10, y1: gr[1] - 10, x2: gr[0] - 85 + k * 10, y2: gr[1] - 18, stroke: C.orange, 'stroke-width': 2 }, A);
  T(A, gr[0], gr[1] + 50, '光栅（色散元件）', { size: 20, anchor: 'middle', fill: C.orange });
  const exit = G(A, { in: at(id, 0) + 1 });
  el('rect', { x: slitOut[0] - 6, y: slitOut[1] - 40, width: 12, height: 80, fill: '#9AA8B8' }, exit);
  const slitGap = el('rect', { x: slitOut[0] - 6, width: 12, fill: C.bg1 }, exit);
  T(exit, slitOut[0], slitOut[1] + 70, '出射狭缝', { size: 20, anchor: 'middle', fill: C.muted });
  D(el('path', { d: `M${slitIn[0]} ${slitIn[1]} L${m1[0]} ${m1[1] + 6} L${gr[0]} ${gr[1] - 10}`, stroke: '#FFF6D8', 'stroke-width': 3, fill: 'none' }, A), at(id, 0) + 0.3, 1);
  const disp = G(A, { in: at(id, 1) });
  [['#FF4A4A', -26], [C.gold, 0], ['#3B5BFF', 26]].forEach(([c, dx], k) => {
    el('path', { d: `M${gr[0]} ${gr[1] - 10} L${m2[0] + dx} ${m2[1] + 6} L${slitOut[0]} ${slitOut[1] + dx * 1.6}`, stroke: c, 'stroke-width': k === 1 ? 4 : 2.5, fill: 'none', opacity: 0.9 }, disp);
  });
  T(disp, 1260, slitOut[1] - 48, '邻近线', { size: 18, fill: C.muted });
  T(disp, 1260, slitOut[1] + 6, '共振线', { size: 18, fill: C.gold });
  U.push(t => {
    const wide = 1 - 0.7 * E(t, at(id, 7), 1.2);
    const h = 70 * wide;
    setAttrs(slitGap, { y: slitOut[1] - h / 2, height: h });
  });
  const R = G(A, { in: at(id, 2), fx: 'none' });
  card(R, 1340, 250, 520, 660, { stroke: C.cyanDeep });
  T(R, 1370, 300, '单色器性能参数', { size: 28, weight: 700, fill: C.cyan });
  const ps = [[2, '线色散率 D', 'ΔX / Δλ'], [3, '倒线色散率（常用）', 'Δλ / ΔX　nm·mm^{−1}'], [4, '分辨率', 'λ̄ / Δλ'], [5, '通带宽度', 'W = D · S × 10^{−3}']];
  ps.forEach(([li, h, f], k) => {
    const p = G(R, { in: at(id, li), fx: 'left' });
    T(p, 1370, 360 + k * 100, h, { size: 23, fill: C.muted, maxw: 470 });
    T(p, 1370, 400 + k * 100, f, { size: 30, weight: 700, fill: k === 3 ? C.gold : C.text, maxw: 470 });
  });
  const ex = G(R, { in: at(id, 6) });
  T(ex, 1370, 770, 'W：nm　D：nm/mm　S：μm', { size: 20, fill: C.muted, maxw: 470 });
  T(ex, 1370, 815, '例：D = 2 nm/mm，S = 100 μm', { size: 23, maxw: 470 });
  T(ex, 1370, 855, '→ W = 2 × 100 × 10^{−3} = 0.2 nm', { size: 23, fill: C.gold, weight: 700, maxw: 470 });
  T(G(A, { in: at(id, 7) }), 700, 920 - 20, '狭缝窄 → 通带窄、分得开，但光强弱', { size: 26, anchor: 'middle', fill: C.gold, weight: 600 });
  T(A, 700, 280, '作用：把共振线与邻近谱线分开', { size: 28, anchor: 'middle', weight: 700 });
  // B: detection
  const B = G(g, { in: at(id, 8), out: at(id, 11) - 0.3, fx: 'none' });
  const chain = [['光电倍增管', C.cyan], ['放大器', C.green], ['对数变换器', C.gold], ['显示 · 记录', C.violet]];
  chain.forEach(([s, c], k) => {
    const p = G(B, { in: at(id, 8) + k * 0.5, fx: 'up' });
    box(p, 140 + k * 440, 300, 360, 100, s, { stroke: c, color: c, size: 30 });
    if (k < 3) arrow(p, 506 + k * 440, 350, 574 + k * 440, 350, C.muted, 3);
  });
  // PMT dynodes
  const pm = G(B, { in: at(id, 9), fx: 'none' });
  const dyn = [[240, 720], [380, 560], [520, 720], [660, 560], [800, 720], [940, 560], [1080, 720]];
  dyn.forEach(([x, y]) => el('path', { d: `M${x - 40} ${y} Q${x} ${y + (y > 600 ? 30 : -30)} ${x + 40} ${y}`, stroke: '#9AA8B8', 'stroke-width': 6, fill: 'none' }, pm));
  el('rect', { x: 1180, y: 580, width: 30, height: 160, fill: '#9AA8B8' }, pm);
  T(pm, 1195, 780, '阳极', { size: 20, anchor: 'middle', fill: C.muted });
  T(pm, 140, 560, 'hν →', { size: 26, fill: C.gold, weight: 700 });
  const elec = [];
  for (let k = 0; k < 64; k++) elec.push(el('circle', { r: 4, fill: C.cyan }, pm));
  const gainT = T(pm, 660, 860, '', { size: 28, anchor: 'middle', fill: C.cyan, weight: 700 });
  U.push(t => {
    const p = prog(t, at(id, 9) + 0.3, 3.5);
    const seg = Math.min(dyn.length - 0.001, p * dyn.length);
    const i = Math.floor(seg), f = seg - i;
    const a = dyn[i], b = dyn[i + 1] || [1195, 650];
    const n = Math.min(64, 2 ** (i + 1));
    elec.forEach((e, k) => {
      if (k >= n || p <= 0) { e.setAttribute('opacity', 0); return; }
      const sp = (k - n / 2) * 2.2;
      setAttrs(e, { cx: lerp(a[0], b[0], f) + sp * 0.3, cy: lerp(a[1], b[1], f) + sp, opacity: 1 });
    });
    gainT.textContent = p > 0 ? (p >= 1 ? '逐级倍增：总增益 > 10^6 倍' : `第 ${i + 1} 级：×${2 ** (i + 1)}`) : '';
  });
  T(G(B, { in: at(id, 10) }), 1300, 560, '放大器：进一步放大弱信号', { size: 24, maxw: 580 });
  T(G(B, { in: at(id, 10) + 2 }), 1300, 620, '对数变换：光强 I → 吸光度 A', { size: 24, fill: C.gold, maxw: 580 });
  T(G(B, { in: at(id, 10) + 4 }), 1300, 680, '计算机工作站：显示、记录', { size: 24, maxw: 580 });
  // C: single vs double beam
  const Cg = G(g, { in: at(id, 11), fx: 'none' });
  [['单光束', 11, C.orange], ['双光束', 12, C.green]].forEach(([n, li, c], k) => {
    const p = G(Cg, { in: at(id, li), fx: 'up' });
    const x0 = 140 + k * 860;
    card(p, x0, 300, 780, 600, { stroke: c });
    T(p, x0 + 30, 355, n, { size: 32, weight: 700, fill: c });
    lampIcon(p, x0 + 120, 470);
    if (k === 0) {
      flameIcon(p, x0 + 400, 510, 0.6);
      el('line', { x1: x0 + 180, y1: 470, x2: x0 + 700, y2: 470, stroke: C.gold, 'stroke-width': 4 }, p);
      T(p, x0 + 30, 600, '受光源强度变化影响 → 零漂', { size: 24, maxw: 720 });
    } else {
      el('path', { d: `M${x0 + 180} 470 H${x0 + 260} L${x0 + 330} 420 H${x0 + 620} L${x0 + 680} 470 H${x0 + 720}`, stroke: C.gold, 'stroke-width': 4, fill: 'none' }, p);
      el('path', { d: `M${x0 + 260} 470 L${x0 + 330} 530 H${x0 + 620} L${x0 + 680} 470`, stroke: C.cyan, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '8 6' }, p);
      flameIcon(p, x0 + 470, 440, 0.45);
      T(p, x0 + 470, 565, '参比光束（不经火焰）', { size: 20, anchor: 'middle', fill: C.cyan });
      T(p, x0 + 30, 600, '参比光束抵消光源波动 → 克服基线漂移', { size: 24, maxw: 720 });
    }
    const bx = v => x0 + 60 + v * 660, by = v => 820 - v * 110;
    axes(p, x0 + 50, 850, 690, 190, 't', '基线', { size: 20 });
    el('path', { d: curve(v => k === 0 ? 0.35 + 0.35 * v + 0.06 * Math.sin(v * 25) : 0.4 + 0.015 * Math.sin(v * 25), 0, 1, bx, by), stroke: c, 'stroke-width': 3, fill: 'none' }, p);
  });
});

/* ================= 8-4 quantitation ================= */
S.push(function quant() {
  const id = 'quant', g = sceneGroup(id);
  title(g, id, '8-4 定量分析方法', '课件 P71–76 · 基础：A = Kc');
  stepLabel(g, 60, 262, [[at(id, 0), '1. 标准曲线法'], [at(id, 9), '2. 标准加入法 · 计算法'], [at(id, 13), '2. 标准加入法 · 作图法'], [at(id, 17), '标准加入法的特点与注意']]);
  // A: calibration curve
  const A = G(g, { in: at(id, 0), out: at(id, 9) - 0.3, fx: 'none' });
  const ox = 180, oy = 860, W = 900, H = 540;
  axes(A, ox, oy, W, H, 'c', 'A');
  const X = c => ox + c / 6 * W, Y = a => oy - a / 1.0 * H;
  const fl = G(A, { in: at(id, 1), fx: 'none' });
  const cols = ['#9FC3FF', '#7FA9F5', '#5B8CFF', '#3E6FE0', '#2650BD'];
  for (let k = 0; k < 5; k++) {
    const p = G(fl, { in: at(id, 1) + k * 0.3, fx: 'up' });
    el('rect', { x: 1180 + k * 120, y: 380, width: 70, height: 120, rx: 10, fill: cols[k], opacity: 0.6, stroke: '#9FB8D0', 'stroke-width': 2 }, p);
    T(p, 1215 + k * 120, 540, `c_{${k + 1}}`, { size: 22, anchor: 'middle', fill: C.muted });
  }
  const sp = G(fl, { in: at(id, 4) - 0.2, fx: 'up' });
  el('rect', { x: 1780, y: 380, width: 70, height: 120, rx: 10, fill: C.gold, opacity: 0.5, stroke: C.gold, 'stroke-width': 2 }, sp);
  T(sp, 1815, 540, 'c_{x}', { size: 22, anchor: 'middle', fill: C.gold });
  const pts = [[1, 0.15], [2, 0.3], [3, 0.45], [4, 0.6], [5, 0.75]];
  pts.forEach(([c, a], k) => { const p = G(A, { in: at(id, 2) + k * 0.4, fx: 'scale', ox: X(c), oy: Y(a) }); el('circle', { cx: X(c), cy: Y(a), r: 10, fill: C.cyan }, p); });
  D(el('path', { d: `M${X(0)} ${Y(0)} L${X(5)} ${Y(0.75)}`, stroke: C.cyan, 'stroke-width': 3.5 }, A), at(id, 3), 1);
  const cx = 2.6, axv = 0.39;
  const sm = G(A, { in: at(id, 4) });
  el('path', { d: `M${X(0)} ${Y(axv)} H${X(cx)} V${Y(0)}`, stroke: C.gold, 'stroke-width': 2.5, 'stroke-dasharray': '8 6', fill: 'none' }, sm);
  el('circle', { cx: X(cx), cy: Y(axv), r: 11, fill: C.gold }, sm);
  T(sm, X(0) - 12, Y(axv) + 8, 'A_{x}', { size: 24, anchor: 'end', fill: C.gold, weight: 700 });
  T(sm, X(cx), oy + 36, 'c_{x}', { size: 24, anchor: 'middle', fill: C.gold, weight: 700 });
  const bend = G(A, { in: at(id, 5) });
  el('path', { d: curve(c => 0.75 + 0.18 * (1 - Math.exp(-(c - 5) / 1.2)), 5, 6, X, Y), stroke: C.red, 'stroke-width': 4, fill: 'none' }, bend);
  el('path', { d: `M${X(5)} ${Y(0.75)} L${X(6)} ${Y(0.9)}`, stroke: C.cyan, 'stroke-width': 2, 'stroke-dasharray': '6 6' }, bend);
  T(bend, X(5.9), Y(0.98), '高浓度弯曲', { size: 22, fill: C.red, anchor: 'end' });
  const zone = G(A, { in: at(id, 7) });
  el('rect', { x: ox + 2, y: Y(0.8), width: W - 40, height: Y(0.2) - Y(0.8), fill: 'rgba(110,231,168,.08)' }, zone);
  T(zone, ox + W - 50, Y(0.2) - 10, 'A：0.2–0.8', { size: 22, anchor: 'end', fill: C.green, weight: 700 });
  const tips = G(A, { in: at(id, 6), fx: 'none' });
  card(tips, 1180, 600, 680, 300, { stroke: C.cyanDeep });
  bullets(tips, 1210, 660, [['标准与样品基体组成尽量一致', at(id, 6)], ['在直线范围内：A 控制在 0.2–0.8', at(id, 7)], ['测定过程中条件保持不变', at(id, 7) + 4], ['简便快速 · 适合简单、大批量样品', at(id, 8)]], { size: 24, gap: 58, maxw: 620 });
  // B: standard addition, calculation
  const B = G(g, { in: at(id, 9), out: at(id, 13) - 0.3, fx: 'none' });
  const flask = (p, x, lbl, add, col) => {
    el('path', { d: `M${x - 22} 330 V420 L${x - 110} 600 Q${x - 120} 630 ${x - 90} 630 H${x + 90} Q${x + 120} 630 ${x + 110} 600 L${x + 22} 420 V330`, fill: 'none', stroke: '#9FB8D0', 'stroke-width': 4 }, p);
    el('path', { d: `M${x - 82} 520 L${x - 110} 600 Q${x - 120} 630 ${x - 90} 630 H${x + 90} Q${x + 120} 630 ${x + 110} 600 L${x + 82} 520z`, fill: col, opacity: 0.45 }, p);
    el('line', { x1: x - 30, y1: 370, x2: x + 30, y2: 370, stroke: C.text, 'stroke-width': 2 }, p);
    T(p, x, 680, lbl, { size: 32, anchor: 'middle', weight: 700 });
    T(p, x, 720, add, { size: 22, anchor: 'middle', fill: C.muted, maxw: 300 });
  };
  const fa = G(B, { in: at(id, 10), fx: 'up' }); flask(fa, 350, 'A', '试液 V，定容', 'rgba(91,140,255,.8)');
  const fb = G(B, { in: at(id, 10) + 1, fx: 'up' }); flask(fb, 750, 'B', '试液 V + 标准，定容', 'rgba(247,197,72,.8)');
  const drop = G(B, { in: at(id, 10) + 2.5, out: at(id, 11) - 0.2 });
  el('circle', { cx: 750, cy: 300, r: 12, fill: C.gold }, drop);
  T(drop, 790, 300, '+ 标准', { size: 22, fill: C.gold });
  const eqs = G(B, { in: at(id, 11), fx: 'none' });
  card(eqs, 1020, 320, 840, 470, { stroke: C.gold });
  [['A_{x} = K c_{x}', 0], ['A_{B} = K (c_{0} + c_{x})', 1.2], ['两式相除，消去 K：', 3]].forEach(([s, d], k) => T(G(eqs, { in: at(id, 11) + d }), 1060, 400 + k * 80, s, { size: k < 2 ? 38 : 28, weight: k < 2 ? 700 : 400, fill: k < 2 ? C.text : C.muted, maxw: 780 }));
  const res = G(eqs, { in: at(id, 11) + 4.5 });
  el('rect', { x: 1060, y: 610, width: 760, height: 110, rx: 14, fill: 'rgba(247,197,72,.14)', stroke: C.gold, 'stroke-width': 2.5 }, res);
  T(res, 1440, 682, 'c_{x} = c_{0} · A_{x} / (A_{B} − A_{x})', { size: 42, anchor: 'middle', weight: 700, fill: C.gold });
  T(G(B, { in: at(id, 12) }), 1440, 840, 'c_{0}：加入的标准溶液稀释到刻度后的浓度', { size: 26, anchor: 'middle', maxw: 840 });
  T(G(B, { in: at(id, 9) }), 140, 860, '适用：试样组成复杂、基体情况不清', { size: 26, fill: C.cyan });
  // C: standard addition, graphical
  const Cg = G(g, { in: at(id, 13), out: at(id, 17) - 0.3, fx: 'none' });
  const gx0 = 720, gy0 = 820, gW = 1080, gH = 480;
  const GX = c => gx0 + c * 200, GY = a => gy0 - a * 600;
  el('line', { x1: 160, y1: gy0, x2: gx0 + gW, y2: gy0, stroke: C.muted, 'stroke-width': 2, 'marker-end': `url(#${window.ENG.arrowId(C.muted)})` }, Cg);
  el('line', { x1: gx0, y1: gy0, x2: gx0, y2: gy0 - gH, stroke: C.muted, 'stroke-width': 2, 'marker-end': `url(#${window.ENG.arrowId(C.muted)})` }, Cg);
  T(Cg, gx0 + gW, gy0 + 36, '加入的标准浓度', { size: 22, fill: C.muted, anchor: 'end' });
  T(Cg, gx0 - 12, gy0 - gH + 8, 'A', { size: 24, fill: C.muted, anchor: 'end' });
  T(Cg, gx0, gy0 + 36, '0', { size: 22, fill: C.muted, anchor: 'middle' });
  const adds = [[0, 'c_{x}'], [1, '+c_{0}'], [2, '+2c_{0}'], [4, '+4c_{0}']];
  const slope = 0.11, inter = 0.22; // A = slope * (n + cx/c0) with cx = 2 c0 units
  adds.forEach(([n, lbl], k) => {
    const p = G(Cg, { in: at(id, 14) + k * 0.6, fx: 'scale', ox: GX(n), oy: GY(inter + slope * n) });
    el('circle', { cx: GX(n), cy: GY(inter + slope * n), r: 11, fill: C.cyan }, p);
    T(p, GX(n), gy0 + 36, n ? `${n}c_{0}` : '', { size: 22, anchor: 'middle', fill: C.muted });
    const tube = G(Cg, { in: at(id, 13) + 0.6 + k * 0.4, fx: 'up' });
    el('rect', { x: 170 + k * 120, y: 320, width: 70, height: 130, rx: 10, fill: C.blue, opacity: 0.3 + k * 0.15, stroke: '#9FB8D0', 'stroke-width': 2 }, tube);
    T(tube, 205 + k * 120, 490, lbl, { size: 22, anchor: 'middle', fill: C.muted });
  });
  D(el('path', { d: `M${GX(0)} ${GY(inter)} L${GX(4.6)} ${GY(inter + slope * 4.6)}`, stroke: C.cyan, 'stroke-width': 3.5 }, Cg), at(id, 15), 1);
  const ext = G(Cg, { in: at(id, 16), fx: 'none' });
  D(el('path', { d: `M${GX(0)} ${GY(inter)} L${GX(-2)} ${GY(0)}`, stroke: C.gold, 'stroke-width': 3.5, 'stroke-dasharray': '10 7' }, ext), at(id, 16), 1);
  el('circle', { cx: GX(-2), cy: GY(0), r: 11, fill: C.gold }, G(ext, { in: at(id, 16) + 1 }));
  const brace = G(ext, { in: at(id, 16) + 1.5 });
  el('path', { d: `M${GX(-2)} ${gy0 + 20} V${gy0 + 40} H${GX(0)} V${gy0 + 20}`, stroke: C.gold, 'stroke-width': 3, fill: 'none' }, brace);
  T(brace, (GX(-2) + GX(0)) / 2, gy0 + 76, '|截距| = c_{x}', { size: 28, anchor: 'middle', fill: C.gold, weight: 700 });
  T(G(Cg, { in: at(id, 13) }), 160, 580, '各份：试液体积相同，', { size: 24, fill: C.muted });
  T(G(Cg, { in: at(id, 13) }), 160, 620, '按比例加入标准，定容', { size: 24, fill: C.muted });
  // D: why and cautions
  const Dg = G(g, { in: at(id, 17), fx: 'none' });
  card(Dg, 140, 310, 1640, 150, { stroke: C.green, fill: 'rgba(110,231,168,.05)' });
  T(Dg, 180, 370, '为什么能抵消基体效应？', { size: 30, weight: 700, fill: C.green });
  T(Dg, 180, 425, '每一份都含有相同的样品基体 → 标准与样品在同一环境中测量，基体对斜率的影响相同', { size: 25, maxw: 1580 });
  const lim = G(Dg, { in: at(id, 18) });
  card(lim, 140, 490, 1640, 100, { stroke: C.red, fill: 'rgba(255,122,107,.06)' });
  T(lim, 180, 553, '只能在一定程度上消除基体效应，不能消除背景干扰', { size: 28, fill: C.red, weight: 700, maxw: 1580 });
  [[19, '测定应在直线范围内，只适合低含量样品'], [19, '加入标准与待测物浓度在同一数量级'], [20, '否则斜率过大或过小 → 误差很大'], [20, '适合样品数目不多的情况']].forEach(([li, s], k) => {
    const p = G(Dg, { in: at(id, li) + (k % 2) * 2.5, fx: 'up' });
    card(p, 140 + (k % 2) * 830, 630 + Math.floor(k / 2) * 130, 810, 110, { stroke: C.cyanDeep });
    T(p, 170 + (k % 2) * 830, 695 + Math.floor(k / 2) * 130, `(${k + 1}) ` + s, { size: 25, maxw: 760 });
  });
});

/* ================= 8-7 features ================= */
S.push(function feat() {
  const id = 'feat', g = sceneGroup(id);
  title(g, id, '8-7 原子吸收光谱法的特点及应用', '课件 P77');
  T(G(g, { in: at(id, 0) + 0.5 }), 960, 300, '可直接测定约 70 种元素 · 主要的定量方法', { size: 32, anchor: 'middle', fill: C.gold, weight: 700 });
  const F = [[1, '灵敏度高', ['绝对灵敏度 10^{−13}～10^{−15} g', '石墨炉尤为突出'], C.cyan],
    [2, '精密度高 · 准确度高', ['火焰法相对误差 < 1%', '石墨炉法约 3%–5%', '测基态原子：受温度影响小，重现性好'], C.green],
    [4, '选择性好 · 抗干扰强', ['每种元素用自己的锐线光源', '共振线特征性强'], C.violet],
    [5, '应用范围广', ['70 多种元素', '常量、微量、痕量、超痕量'], C.gold]];
  F.forEach(([li, h, lines, c], k) => {
    const x = 140 + (k % 2) * 840, y = 345 + Math.floor(k / 2) * 262;
    const p = G(g, { in: at(id, li), fx: 'scale', ox: x + 400, oy: y + 120 });
    card(p, x, y, 800, 236, { stroke: c, sw: 2.5 });
    el('circle', { cx: x + 50, cy: y + 55, r: 26, fill: c }, p);
    T(p, x + 50, y + 64, String(k + 1), { size: 26, anchor: 'middle', fill: C.bg1, weight: 700 });
    T(p, x + 95, y + 66, h, { size: 32, weight: 700, fill: c, maxw: 680 });
    lines.forEach((s, j) => T(G(p, { in: at(id, li) + (k === 1 && j === 2 ? at(id, 3) - at(id, 2) : 0.3 * j) }), x + 40, y + 125 + j * 44, '· ' + s, { size: 25, maxw: 730 }));
    focus(p, at(id, li), (F[k + 1] ? at(id, F[k + 1][0]) : end(id, 5)) - 0.1, 0.6);
  });
  const lim = G(g, { in: at(id, 6) });
  card(lim, 140, 868, 1640, 70, { stroke: C.red, fill: 'rgba(255,122,107,.08)' });
  T(lim, 960, 913, '局限：常规仪器一灯一元素，多元素同时测定不便（连续光源 AAS 正在改进；补充）', { size: 24, anchor: 'middle', fill: C.red, maxw: 1600 });
});

/* ================= quiz 2 ================= */
S.push(function quiz2() {
  window.QUIZ('quiz2', '课堂练习（二）', '课件 P78–81，共 3 题', [
    [1, [2], '1. 原子吸收光谱分析中，乙炔是（ ）', ['燃气－助燃气', '载气', '燃气', '助燃气'], 2, '乙炔是燃气；空气、氧化亚氮是助燃气'],
    [3, [4], '2. 原子化器的主要作用是（ ）', ['将试样中待测元素转化为基态原子', '将试样中待测元素转化为激发态原子', '将试样中待测元素转化为中性分子', '将试样中待测元素转化为离子'], 0, '只有基态原子吸收共振线；激发态和离子都会降低灵敏度'],
    [5, [6], '3. 原子吸收光谱分析仪中单色器位于（ ）', ['空心阴极灯之后', '原子化器之后', '原子化器之前', '空心阴极灯前'], 1, '光源 → 原子化器 → 单色器 → 检测器（课件 P81 给出答案 B）']
  ], '3 道题：检验仪器部分');
});

/* ================= summary ================= */
S.push(function sum() {
  const id = 'sum', g = sceneGroup(id);
  T(G(g, { in: SC[id].t0 + 0.2 }), 60, 150, '全章总结', { size: 44, weight: 700 });
  const links = el('g', {}, g);
  const cardsD = [
    ['① 原理', ['基态原子吸收共振线（元素特征谱线）', '谱线轮廓：K_{0}、ν_{0}、Δν', '变宽：多普勒 + 劳伦兹为主'], [60, 230], C.cyan, 1],
    ['② 峰值吸收', ['锐线光源：ν_{0} 一致、Δν_{e} < Δν_{a}', 'A = 0.434K_{0}L = kLN_{0}', '玻耳兹曼：N_{0} ≈ N → A = k′c'], [60, 470], C.gold, 2],
    ['③ 仪器', ['空心阴极灯 → 原子化器 → 单色器 → 检测', '火焰：快、精密 · 石墨炉：灵敏、省样', '单色器在原子化器之后；光源调制'], [1220, 230], C.orange, 3],
    ['④ 定量', ['标准曲线法：简单、大批量；A 0.2–0.8', '标准加入法：基体复杂；外推截距', 'c_{x} = c_{0}A_{x}/(A_{B} − A_{x})'], [1220, 470], C.green, 4],
    ['⑤ 特点', ['灵敏 10^{−13}～10^{−15} g · 准确（火焰 < 1%）', '选择性好 · 可测约 70 种元素'], [640, 720], C.violet, 5]];
  const cg = G(g, { in: SC[id].t0 + 0.3, fx: 'scale', ox: 960, oy: 420 });
  el('rect', { x: 760, y: 335, width: 400, height: 170, rx: 22, fill: C.panel2, stroke: C.gold, 'stroke-width': 3 }, cg);
  T(cg, 960, 410, '原子吸收光谱分析', { size: 36, anchor: 'middle', weight: 700, fill: C.gold });
  T(cg, 960, 455, '吸收多少光 → 有多少原子', { size: 22, anchor: 'middle', fill: C.muted });
  cardsD.forEach(([h, lines, [x, y], c, li], k) => {
    const w = 640, hgt = k === 4 ? 170 : 210;
    const ex = k === 4 ? 960 : (x < 700 ? x + w : x), ey = k === 4 ? y : y + hgt / 2;
    const lk = el('path', { d: `M960 ${k === 4 ? 505 : 420} C${(960 + ex) / 2} ${k === 4 ? 600 : 420} ${(960 + ex) / 2} ${ey} ${ex} ${ey}`, stroke: c, 'stroke-width': 2.5, fill: 'none', opacity: 0.6 }, links);
    D(lk, SC[id].t0 + 0.5 + k * 0.2, 0.6);
    const kg = G(g, { in: SC[id].t0 + 0.6 + k * 0.25, fx: 'scale', ox: x + w / 2, oy: y + hgt / 2 });
    card(kg, x, y, w, hgt, { stroke: c });
    T(kg, x + 24, y + 48, h, { size: 28, fill: c, weight: 700, maxw: w - 40 });
    lines.forEach((s, j) => T(kg, x + 24, y + 94 + j * 40, s, { size: 21, maxw: w - 40 }));
    U.push(t => {
      if (t < SC[id].t0 || t > SC[id].t1) return;
      const a = at(id, li), b = end(id, li);
      const act = prog(t, a - 0.2, 0.4) * (1 - prog(t, b, 0.4));
      const after = t > end(id, 5) + 0.3;
      kg.firstChild.setAttribute('stroke-width', act > 0.5 ? 4 : 1.6);
      kg.setAttribute('filter', act > 0.5 ? 'url(#glow)' : '');
      if (!after && t > at(id, 1) - 0.2) kg.setAttribute('opacity', (0.45 + 0.55 * act).toFixed(3));
    });
  });
});
})();
