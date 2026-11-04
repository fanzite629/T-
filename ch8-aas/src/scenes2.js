/* Scenes part 2: line profile, broadening, integral vs peak absorption, Boltzmann & Beer's law, quiz 1 */
'use strict';
(() => {
const { TL, C, SC, at, end, prog, lerp, E, eo, el, setAttrs, T, G, D, U, focus, card, pill, arrow,
  axes, curve, gauss, bullets, sceneGroup, title, stepLabel, svg } = window.ENG;
const S = window.SCENES;
const { lampIcon, flameIcon, box } = window.DRAW;

/* ================= line profile ================= */
S.push(function profile() {
  const id = 'profile', g = sceneGroup(id);
  title(g, id, '二、谱线轮廓', '课件 P19–21');
  // Lambert absorption through vapour
  const A = G(g, { in: at(id, 0), fx: 'none' });
  T(A, 120, 400, 'I_{0,ν}', { size: 34, fill: C.gold, weight: 700 });
  const bIn = el('rect', { x: 120, y: 430, height: 24, fill: C.gold, rx: 4 }, A);
  el('rect', { x: 360, y: 360, width: 300, height: 170, rx: 10, fill: 'rgba(61,213,243,.14)', stroke: C.cyan, 'stroke-width': 2.5 }, A);
  T(A, 510, 455, '原子蒸气', { size: 28, anchor: 'middle', weight: 600 });
  el('path', { d: 'M360 330 H660', stroke: C.muted, 'stroke-width': 2 }, A);
  el('path', { d: 'M360 320 V340 M660 320 V340', stroke: C.muted, 'stroke-width': 2 }, A);
  T(A, 510, 318, 'L', { size: 28, anchor: 'middle', fill: C.muted, weight: 700 });
  const bOut = el('rect', { x: 660, y: 436, height: 12, fill: C.gold, opacity: 0.55, rx: 4 }, A);
  T(G(A, { in: at(id, 0) + 1.8 }), 860, 400, 'I_{ν}', { size: 34, fill: C.gold, weight: 700 });
  U.push(t => { bIn.setAttribute('width', (240 * E(t, at(id, 0) + 0.3, 0.8)).toFixed(1)); bOut.setAttribute('width', (240 * E(t, at(id, 0) + 1.1, 0.8)).toFixed(1)); });
  const law = G(g, { in: at(id, 1) });
  card(law, 100, 580, 820, 150, { stroke: C.gold, fill: 'rgba(247,197,72,.06)' });
  T(law, 510, 650, 'I_{ν} = I_{0,ν} · e^{−Kν·L}', { size: 46, anchor: 'middle', weight: 700, fill: C.gold });
  T(law, 510, 705, '朗伯（Lambert）定律', { size: 24, anchor: 'middle', fill: C.muted });
  T(G(g, { in: at(id, 2) }), 100, 790, 'K_{ν}：吸收系数，随频率 ν 变化', { size: 30, fill: C.cyan, maxw: 820 });
  T(G(g, { in: at(id, 3) }), 100, 850, '→ 吸收线不是几何线，而有一定宽度', { size: 30, maxw: 820 });

  // graphs: Iv vs v (dip), Kv vs v (peak)
  const gx = 1040, gy = 520, gw = 360, gh = 230;
  const g1 = G(g, { in: at(id, 3), fx: 'none' });
  axes(g1, gx, gy, gw, gh, 'ν', 'I_{ν}', { size: 22 });
  const mx = v => gx + 20 + v * (gw - 40), my1 = v => gy - v * (gh - 30);
  D(el('path', { d: curve(v => 0.9 - 0.65 * Math.exp(-((v - 0.5) ** 2) / 0.006), 0, 1, mx, my1), stroke: C.gold, 'stroke-width': 3.5, fill: 'none' }, g1), at(id, 3) + 0.2, 1.2);
  T(g1, gx + gw / 2, gy + 70, 'I_{ν} 与 ν 的关系', { size: 22, anchor: 'middle', fill: C.muted });
  const g2 = G(g, { in: at(id, 4), fx: 'none' });
  const hx = 1460, hy = 880, hw = 400, hh = 600;
  axes(g2, hx, hy, hw, hh, 'ν', 'K_{ν}', { size: 24 });
  const nx = v => hx + 20 + v * (hw - 40), ny = v => hy - v * (hh - 100);
  const prof = v => Math.exp(-((v - 0.5) ** 2) / 0.012);
  D(el('path', { d: curve(prof, 0, 1, nx, ny), stroke: C.cyan, 'stroke-width': 4, fill: 'none' }, g2), at(id, 4) + 0.2, 1.2);
  el('path', { d: curve(prof, 0, 1, nx, ny) + `L${nx(1)} ${hy} L${nx(0)} ${hy}z`, fill: 'rgba(61,213,243,.12)' }, G(g2, { in: at(id, 4) + 1 }));
  T(g2, hx + hw / 2, 240 + 40, '谱线轮廓（line profile）', { size: 26, anchor: 'middle', fill: C.cyan, weight: 700 });
  // annotations
  const an = G(g2, { in: at(id, 5) });
  el('line', { x1: hx, y1: ny(1), x2: nx(0.5), y2: ny(1), stroke: C.gold, 'stroke-dasharray': '6 6', 'stroke-width': 2 }, an);
  el('line', { x1: nx(0.5), y1: ny(1), x2: nx(0.5), y2: hy, stroke: C.gold, 'stroke-dasharray': '6 6', 'stroke-width': 2 }, an);
  T(an, hx - 10, ny(1) + 8, 'K_{0}', { size: 26, anchor: 'end', fill: C.gold, weight: 700 });
  T(an, nx(0.5), hy + 36, 'ν_{0}', { size: 26, anchor: 'middle', fill: C.gold, weight: 700 });
  el('circle', { cx: nx(0.5), cy: ny(1), r: 8, fill: C.gold }, an);
  const hw2 = Math.sqrt(2 * 0.012 * Math.log(2) / 2); // half-width at half max in v units (σ² = 0.006)
  const an2 = G(g2, { in: at(id, 6) });
  el('line', { x1: hx, y1: ny(0.5), x2: nx(0.5 - hw2), y2: ny(0.5), stroke: C.violet, 'stroke-dasharray': '6 6', 'stroke-width': 2 }, an2);
  T(an2, hx - 10, ny(0.5) + 8, 'K_{0}/2', { size: 24, anchor: 'end', fill: C.violet, weight: 700 });
  arrow(an2, nx(0.5), ny(0.5), nx(0.5 + hw2) - 2, ny(0.5), C.violet, 3);
  arrow(an2, nx(0.5), ny(0.5), nx(0.5 - hw2) + 2, ny(0.5), C.violet, 3);
  T(an2, nx(0.5 + hw2) + 14, ny(0.5) - 10, 'Δν 半宽度', { size: 24, fill: C.violet, weight: 700 });
  T(an2, nx(0.5 + hw2) + 14, ny(0.5) + 24, '10^{−3}～10^{−2} nm', { size: 22, fill: C.violet });
  const sum = G(g, { in: at(id, 7) });
  card(sum, 1020, 590, 340, 260, { stroke: C.gold });
  T(sum, 1190, 640, '描述一条吸收线', { size: 26, anchor: 'middle', weight: 700, fill: C.gold });
  [['K_{0}', '最大吸收系数'], ['ν_{0}', '中心（峰值）频率'], ['Δν', '半宽度']].forEach(([a, b], k) => {
    T(sum, 1045, 700 + k * 50, a, { size: 28, weight: 700, fill: C.cyan });
    T(sum, 1135, 700 + k * 50, b, { size: 24, maxw: 215 });
  });
  U.push(t => { g1.setAttribute('opacity', t > at(id, 7) - 0.3 ? Math.max(0, 1 - prog(t, at(id, 7) - 0.3, 0.3)).toFixed(2) : '1'); });
});

/* ================= broadening ================= */
S.push(function broad() {
  const id = 'broad', g = sceneGroup(id);
  title(g, id, '三、吸收线变宽的原因', '课件 P22–28');
  stepLabel(g, 60, 262, [[at(id, 0), '原子性质 + 外界因素'], [at(id, 1), '1. 自然宽度 Δν_{N}'], [at(id, 3), '2. 多普勒变宽（热变宽）Δν_{D}'],
    [at(id, 8), '3. 压力变宽（碰撞变宽）'], [at(id, 12), '4. 自吸变宽 · 5. 场致变宽'], [at(id, 14), '比一比：谁起主要作用？']]);
  // right list
  const R = G(g, { in: at(id, 0) + 0.3, fx: 'none' });
  card(R, 1240, 310, 620, 600, { stroke: C.cyanDeep });
  const items = [['1. 自然宽度', '~10^{−5} nm，可忽略', 1, 3], ['2. 多普勒变宽', '~10^{−3} nm，主要因素', 3, 8], ['3a. 共振变宽', '同种原子碰撞，可忽略', 9, 10], ['3b. 劳伦兹变宽', '~10^{−3} nm，主要因素', 10, 12], ['4. 自吸变宽', '灯电流越大越严重', 12, 13], ['5. 场致变宽', '电场 / 磁场，影响小', 13, 14]];
  items.forEach(([h, s, a, b], k) => {
    const p = G(R, { in: at(id, a), fx: 'left' });
    el('rect', { x: 1260, y: 330 + k * 95, width: 580, height: 80, rx: 12, fill: C.panel2 }, p);
    T(p, 1285, 380 + k * 95, h, { size: 27, weight: 700, fill: C.cyan, maxw: 230 });
    T(p, 1525, 380 + k * 95, s, { size: 23, maxw: 300 });
    U.push(t => {
      if (t < at(id, a)) return;
      const on = t >= at(id, a) - 0.1 && t < at(id, b);
      const main = (k === 1 || k === 3) && t >= at(id, 14);
      p.firstChild.setAttribute('stroke', on || main ? C.gold : 'none');
      p.firstChild.setAttribute('stroke-width', 3);
      p.setAttribute('opacity', on || main || t < at(id, 14) && t >= at(id, b) ? 1 : (t >= at(id, 14) ? 0.4 : 1));
    });
  });
  const vx = 80, vw = 1100;
  // intro split
  const I = G(g, { in: at(id, 0), out: at(id, 1) - 0.3, fx: 'none' });
  box(I, 160, 450, 420, 140, '原子本身的性质', { stroke: C.cyan, size: 32 });
  box(I, 680, 450, 420, 140, '外界因素', { stroke: C.orange, size: 32 });
  T(I, 370, 650, '自然宽度', { size: 26, anchor: 'middle', fill: C.muted });
  T(I, 890, 650, '多普勒 · 压力 · 自吸 · 场致', { size: 26, anchor: 'middle', fill: C.muted, maxw: 420 });
  // natural
  const N = G(g, { in: at(id, 1), out: at(id, 3) - 0.3, fx: 'none' });
  axes(N, 160, 820, 900, 460, 'ν', 'K_{ν}');
  const nx = v => 180 + v * 860;
  D(el('path', { d: curve(v => 400 * Math.exp(-((v - 0.5) ** 2) / 0.00003), 0, 1, nx, v => 820 - v, 600), stroke: C.cyan, 'stroke-width': 3, fill: 'none' }, N), at(id, 1) + 0.3, 1);
  T(N, 620, 400, '自然宽度 ~10^{−5} nm（极窄）', { size: 26, fill: C.cyan });
  const nb = G(N, { in: at(id, 2) });
  card(nb, 640, 470, 440, 200, { stroke: C.violet });
  T(nb, 860, 520, '不确定性原理', { size: 28, anchor: 'middle', fill: C.violet, weight: 700 });
  T(nb, 860, 570, 'ΔE · Δt ≈ h / 2π', { size: 28, anchor: 'middle' });
  T(nb, 860, 620, '寿命 Δt 越长 → ΔE 越小 → 谱线越窄', { size: 22, anchor: 'middle', fill: C.muted, maxw: 420 });
  // doppler
  const Dp = G(g, { in: at(id, 3), out: at(id, 8) - 0.3, fx: 'none' });
  const dA = G(Dp, { in: at(id, 3), out: at(id, 5) - 0.3, fx: 'none' });
  el('rect', { x: 980, y: 400, width: 120, height: 120, rx: 12, fill: C.panel2, stroke: C.cyanDeep, 'stroke-width': 2 }, dA);
  T(dA, 1040, 560, '检测器', { size: 22, anchor: 'middle', fill: C.muted });
  const at1 = el('circle', { r: 16, fill: C.blue }, dA), at2 = el('circle', { r: 16, fill: C.red }, dA);
  const w1 = el('path', { stroke: C.blue, 'stroke-width': 3, fill: 'none' }, dA), w2 = el('path', { stroke: C.red, 'stroke-width': 3, fill: 'none' }, dA);
  const dl1 = G(dA, { in: at(id, 4) }), dl2 = G(dA, { in: at(id, 4) + 1.5 });
  T(dl1, 160, 370, '朝向检测器 → 波被压缩 → 频率变高', { size: 24, fill: C.blue });
  T(dl2, 160, 650, '背离检测器 → 波被拉长 → 频率变低', { size: 24, fill: C.red });
  const wavePath = (x0, x1, y, lam) => { let d = `M${x0} ${y}`; for (let x = x0; x <= x1; x += 3) d += ` L${x} ${(y + 18 * Math.sin((x - x0) / lam * 2 * Math.PI)).toFixed(1)}`; return d; };
  U.push(t => {
    const p = prog(t, at(id, 3), end(id, 5) - at(id, 3));
    const xa = 300 + 220 * p, xb = 700 - 220 * p;
    setAttrs(at1, { cx: xa, cy: 450 }); setAttrs(at2, { cx: xb, cy: 520 });
    w1.setAttribute('d', wavePath(xa + 20, 970, 450, 34));
    w2.setAttribute('d', wavePath(xb + 20, 970, 520, 70));
  });
  const dB = G(Dp, { in: at(id, 5), out: at(id, 6) - 0.3, fx: 'none' });
  const bx = v => 180 + v * 860, by = y => 890 - y;
  const dsum = v => [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12].reduce((s, d, k) => s + Math.exp(-((v - 0.5 - d) ** 2) / 0.0016) * [0.3, 0.55, 0.85, 1, 0.85, 0.55, 0.3][k], 0);
  [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12].forEach((d, k) => el('path', { d: curve(v => 200 * [0.3, 0.55, 0.85, 1, 0.85, 0.55, 0.3][k] * Math.exp(-((v - 0.5 - d) ** 2) / 0.0016), 0, 1, bx, by, 300), stroke: C.dim, 'stroke-width': 2, fill: 'none' }, dB));
  D(el('path', { d: curve(v => 150 * dsum(v), 0, 1, bx, by, 400), stroke: C.cyan, 'stroke-width': 4, fill: 'none' }, dB), at(id, 5) + 1, 1);
  T(dB, 1040, 760, '叠加 → 变宽', { size: 26, fill: C.cyan, anchor: 'end' });
  const dC = G(Dp, { in: at(id, 6), fx: 'none' });
  card(dC, 100, 320, 1080, 160, { stroke: C.gold, fill: 'rgba(247,197,72,.06)' });
  T(dC, 640, 395, 'Δν_{D} = (2ν_{0}/c)·√(2 ln2 · RT / M) = 7.162×10^{−7} · ν_{0} · √(T/M)', { size: 32, anchor: 'middle', weight: 700, fill: C.gold, maxw: 1040 });
  T(dC, 640, 450, 'T：热力学温度　M：相对原子质量　ν_{0}：中心频率', { size: 22, anchor: 'middle', fill: C.muted });
  const dx = v => 200 + v * 880, dy = y => 890 - y;
  axes(dC, 180, 890, 920, 360, 'ν', 'K_{ν}');
  const nT = G(dC, { in: at(id, 7) });
  el('path', { d: curve(v => 300 * Math.exp(-((v - 0.5) ** 2) / 0.002), 0, 1, dx, dy), stroke: C.blue, 'stroke-width': 3.5, fill: 'none' }, nT);
  T(nT, dx(0.5) + 60, dy(290), 'T 低 / M 大', { size: 24, fill: C.blue });
  const wT = G(dC, { in: at(id, 7) + 1.2 });
  el('path', { d: curve(v => 160 * Math.exp(-((v - 0.5) ** 2) / 0.008), 0, 1, dx, dy), stroke: C.red, 'stroke-width': 3.5, fill: 'none' }, wT);
  T(wT, dx(0.72), dy(120), 'T 高 / M 小：更宽', { size: 24, fill: C.red });
  // pressure
  const P = G(g, { in: at(id, 8), out: at(id, 12) - 0.3, fx: 'none' });
  const rr = window.ENG.rng(21);
  const parts = [];
  for (let k = 0; k < 18; k++) parts.push({ x: 140 + rr() * 980, y: 360 + rr() * 240, vx: (rr() - 0.5) * 140, vy: (rr() - 0.5) * 90, c: k < 6 ? C.cyan : C.muted, r: k < 6 ? 15 : 11, e: el('circle', { fill: k < 6 ? C.cyan : '#5D7390' }, P) });
  el('rect', { x: 120, y: 340, width: 1020, height: 280, rx: 16, fill: 'none', stroke: C.line, 'stroke-width': 2 }, P);
  U.push(t => {
    const tt = t - at(id, 8);
    parts.forEach(p => {
      const W = 980, H = 240;
      let x = ((p.x - 140 + p.vx * tt) % (2 * W) + 2 * W) % (2 * W); if (x > W) x = 2 * W - x;
      let y = ((p.y - 360 + p.vy * tt) % (2 * H) + 2 * H) % (2 * H); if (y > H) y = 2 * H - y;
      setAttrs(p.e, { cx: (140 + x).toFixed(1), cy: (360 + y).toFixed(1), r: p.r });
    });
  });
  const lg = G(P, { in: at(id, 8) + 1 });
  el('circle', { cx: 150, cy: 660, r: 12, fill: C.cyan }, lg); T(lg, 172, 668, '待测原子', { size: 22, fill: C.muted });
  el('circle', { cx: 330, cy: 660, r: 9, fill: '#5D7390' }, lg); T(lg, 350, 668, '火焰气体等其他粒子', { size: 22, fill: C.muted });
  T(lg, 700, 668, '碰撞 → 激发态寿命变短 → 谱线变宽', { size: 22, fill: C.gold });
  const ph = G(P, { in: at(id, 9) });
  card(ph, 120, 700, 490, 200, { stroke: C.cyan });
  T(ph, 150, 750, '共振变宽（赫鲁兹马克）', { size: 26, weight: 700, fill: C.cyan, maxw: 440 });
  T(ph, 150, 800, '同种待测原子之间碰撞', { size: 22, maxw: 440 });
  T(ph, 150, 845, '浓度很低 → 一般可忽略', { size: 22, fill: C.muted, maxw: 440 });
  const pl = G(P, { in: at(id, 10) });
  card(pl, 640, 700, 500, 200, { stroke: C.gold });
  T(pl, 670, 750, '劳伦兹变宽 Δν_{L}', { size: 26, weight: 700, fill: C.gold, maxw: 450 });
  T(pl, 670, 800, '与其他粒子碰撞 · ~10^{−3} nm', { size: 22, maxw: 450 });
  T(G(pl, { in: at(id, 11) }), 670, 852, 'Δν_{L} = 2N_{A}σ^{2}p·√[2/(πRT)·(1/A + 1/M)]', { size: 21, fill: C.gold, maxw: 460 });
  const plt = G(P, { in: at(id, 11) + 1.5 });
  T(plt, 640, 318, 'σ^{2}、p ↑ → 变宽 ↑　　T、质量 ↑ → 变宽 ↓（与多普勒相反）', { size: 22, anchor: 'middle', fill: C.muted, maxw: 1080 });
  // self absorption & field
  const SA = G(g, { in: at(id, 12), out: at(id, 14) - 0.3, fx: 'none' });
  el('rect', { x: 140, y: 380, width: 520, height: 220, rx: 100, fill: 'rgba(247,197,72,.08)', stroke: '#9FB8D0', 'stroke-width': 3 }, SA);
  el('rect', { x: 200, y: 440, width: 150, height: 100, rx: 10, fill: 'none', stroke: C.gold, 'stroke-width': 5 }, SA);
  T(SA, 275, 580, '阴极（发射）', { size: 20, anchor: 'middle', fill: C.gold });
  for (let k = 0; k < 7; k++) el('circle', { cx: 410 + (k % 4) * 50, cy: 455 + Math.floor(k / 4) * 60, r: 11, fill: C.cyan }, SA);
  T(SA, 480, 580, '灯内基态原子（吸收）', { size: 20, anchor: 'middle', fill: C.cyan });
  const ex = v => 760 + v * 380, ey = y => 600 - y;
  axes(SA, 740, 600, 420, 240, 'ν', 'I');
  const k12 = t => E(t, at(id, 12) + 1.5, 2);
  const selfPath = el('path', { stroke: C.gold, 'stroke-width': 3.5, fill: 'none' }, SA);
  U.push(t => {
    const k = k12(t);
    selfPath.setAttribute('d', curve(v => 200 * Math.exp(-((v - 0.5) ** 2) / (0.004 + 0.004 * k)) * (1 - 0.55 * k * Math.exp(-((v - 0.5) ** 2) / 0.0015)), 0, 1, ex, ey));
  });
  T(SA, 980, 345, '灯电流 ↑ → 自吸 ↑ → 谱线变宽、中心变低', { size: 22, anchor: 'middle', fill: C.gold, maxw: 440 });
  const fd = G(SA, { in: at(id, 13) });
  card(fd, 140, 700, 1020, 150, { stroke: C.violet });
  T(fd, 170, 760, '5. 场致变宽', { size: 28, weight: 700, fill: C.violet });
  T(fd, 170, 810, '外界电场、带电粒子和离子形成的电场及磁场使谱线变宽，影响较小', { size: 23, maxw: 960 });
  // compare (log scale)
  const CP = G(g, { in: at(id, 14), fx: 'none' });
  T(CP, 140, 380, '典型宽度（对数刻度）', { size: 26, fill: C.muted });
  const bars = [['自然宽度', -5, C.dim], ['多普勒', -3, C.cyan], ['劳伦兹', -3, C.gold]];
  const lx = e => 360 + (e + 6) * 200;
  [-6, -5, -4, -3, -2].forEach(e => { el('line', { x1: lx(e), y1: 430, x2: lx(e), y2: 760, stroke: C.line, 'stroke-dasharray': '4 6' }, CP); T(CP, lx(e), 800, `10^{${e === -6 ? '−6' : '−' + (-e)}} nm`, { size: 20, anchor: 'middle', fill: C.muted }); });
  bars.forEach(([n, e, c], k) => {
    T(CP, 340, 495 + k * 110, n, { size: 26, anchor: 'end', weight: 600, fill: c });
    const r = el('rect', { x: lx(-6), y: 460 + k * 110, height: 54, rx: 8, fill: c }, CP);
    U.push(t => r.setAttribute('width', ((lx(e) - lx(-6)) * E(t, at(id, 14) + k * 0.3, 0.8)).toFixed(1)));
  });
});

/* ================= integral vs peak absorption ================= */
S.push(function integ() {
  const id = 'integ', g = sceneGroup(id);
  title(g, id, '四、积分吸收与峰值吸收', '课件 P29–34');
  stepLabel(g, 60, 262, [[at(id, 0), '1. 积分吸收：整块面积'], [at(id, 4), '难题：吸收线太窄'], [at(id, 7), '2. 锐线光源与峰值吸收（Walsh, 1955）'], [at(id, 11), '推导：A 与 N_{0} 成正比']]);
  // A: integral
  const A = G(g, { in: at(id, 0), out: at(id, 4) - 0.3, fx: 'none' });
  const ax = v => 160 + v * 700, ay = y => 860 - y;
  axes(A, 140, 860, 740, 520, 'ν', 'K_{ν}');
  const prof = v => 440 * Math.exp(-((v - 0.5) ** 2) / 0.008);
  el('path', { d: curve(prof, 0, 1, ax, ay) + `L${ax(1)} 860 L${ax(0)} 860z`, fill: 'rgba(61,213,243,.25)' }, G(A, { in: at(id, 0) + 1 }));
  el('path', { d: curve(prof, 0, 1, ax, ay), stroke: C.cyan, 'stroke-width': 4, fill: 'none' }, A);
  T(G(A, { in: at(id, 0) + 1.5 }), ax(0.5), ay(160), '面积', { size: 34, anchor: 'middle', weight: 700 });
  const fA = G(A, { in: at(id, 1) });
  card(fA, 960, 330, 900, 160, { stroke: C.gold, fill: 'rgba(247,197,72,.06)' });
  T(fA, 1410, 425, '∫ K_{ν} dν = (π e^{2} / mc) · N_{0} f', { size: 46, anchor: 'middle', weight: 700, fill: C.gold });
  bullets(A, 980, 560, [['N_{0}：单位体积内的基态原子数（基态原子密度）', at(id, 2)], ['f：振子强度，一定条件下对一定元素为定值', at(id, 2) + 2], ['e、m：电子电荷与质量；c：光速', at(id, 2) + 3.5]], { size: 25, gap: 56, maxw: 860 });
  const fA2 = G(A, { in: at(id, 3) });
  card(fA2, 960, 760, 900, 110, { stroke: C.green });
  T(fA2, 1410, 828, '积分吸收 ∝ N_{0}　——　理论基础，绝对测量', { size: 30, anchor: 'middle', fill: C.green, weight: 700 });
  // B: the problem, drawn to scale
  const B = G(g, { in: at(id, 4), out: at(id, 7) - 0.3, fx: 'none' });
  T(B, 960, 360, '按比例画：1 nm = 7000 px', { size: 22, anchor: 'middle', fill: C.muted, cls: 'note' });
  const bx0 = 260, bwid = 1400;
  const band = G(B, { in: at(id, 5), fx: 'none' });
  el('rect', { x: bx0, y: 420, width: bwid, height: 360, fill: 'rgba(247,197,72,.14)', stroke: C.gold, 'stroke-width': 2 }, band);
  T(band, bx0 + bwid / 2, 820, '单色器通带：最窄约 0.2 nm（连续光源分光后）', { size: 28, anchor: 'middle', fill: C.gold });
  el('rect', { x: bx0 + bwid / 2 - 3.5, y: 420, width: 7, height: 360, fill: C.cyan, filter: 'url(#glow)' }, B);
  T(B, bx0 + bwid / 2, 405, '吸收线 ~10^{−3} nm', { size: 26, anchor: 'middle', fill: C.cyan, weight: 700 });
  const bad = G(B, { in: at(id, 6) });
  card(bad, 1250, 450, 400, 230, { stroke: C.red, fill: C.panel });
  T(bad, 1450, 520, '被吸收 ≈ 0.5%', { size: 40, anchor: 'middle', weight: 700, fill: C.red });
  T(bad, 1450, 580, '信号淹没在 99.5% 的光中', { size: 24, anchor: 'middle', maxw: 370 });
  T(bad, 1450, 630, '现有分光装置无法实现', { size: 24, anchor: 'middle', fill: C.muted, maxw: 370 });
  // C: sharp line source (like P34 figure)
  const Cg = G(g, { in: at(id, 7), out: at(id, 11) - 0.3, fx: 'none' });
  const cx = v => 160 + v * 760, cy = y => 880 - y;
  axes(Cg, 140, 880, 800, 560, 'ν', 'K_{ν} / I');
  el('path', { d: curve(v => 420 * Math.exp(-((v - 0.5) ** 2) / 0.012), 0, 1, cx, cy), stroke: C.cyan, 'stroke-width': 4, fill: 'rgba(61,213,243,.10)' }, Cg);
  T(Cg, cx(0.78), cy(160), '吸收线', { size: 26, fill: C.cyan, weight: 700 });
  const em = G(Cg, { in: at(id, 8) });
  el('path', { d: curve(v => 500 * Math.exp(-((v - 0.5) ** 2) / 0.0004), 0, 1, cx, cy, 500), stroke: C.gold, 'stroke-width': 4, fill: 'rgba(247,197,72,.35)' }, em);
  T(em, cx(0.56), cy(470), '锐线光源的发射线', { size: 26, fill: C.gold, weight: 700 });
  const cond = G(Cg, { in: at(id, 8) + 0.5 });
  card(cond, 1000, 320, 860, 520, { stroke: C.gold });
  T(cond, 1040, 380, '锐线光源的两个条件', { size: 32, weight: 700, fill: C.gold });
  const c1 = G(cond, { in: at(id, 9) });
  T(c1, 1040, 460, '① ν_{0e} = ν_{0a}：中心频率一致', { size: 30, weight: 600, maxw: 790 });
  T(c1, 1070, 505, '→ 光源用待测元素制成（因此不能用于定性）', { size: 23, fill: C.muted, maxw: 760 });
  const c2 = G(cond, { in: at(id, 10) });
  T(c2, 1040, 590, '② Δν_{e} < Δν_{a}：发射线比吸收线窄', { size: 30, weight: 600, maxw: 790 });
  T(c2, 1070, 635, '→ 空心阴极灯可以提供', { size: 23, fill: C.muted, maxw: 760 });
  el('line', { x1: cx(0.5), y1: cy(0), x2: cx(0.5), y2: cy(520), stroke: C.gold, 'stroke-dasharray': '5 6', 'stroke-width': 2 }, c1);
  T(c1, cx(0.5), cy(-40), 'ν_{0}', { size: 24, anchor: 'middle', fill: C.gold });
  const wd = G(Cg, { in: at(id, 10) + 0.8 });
  T(wd, 1040, 760, '在发射线范围内，K_{ν} ≈ K_{0}', { size: 30, fill: C.cyan, weight: 700, maxw: 790 });
  // D: derivation
  const Dg = G(g, { in: at(id, 11), fx: 'none' });
  const steps = [[11, 'K_{ν} ≈ K_{0}（锐线、中心对准）', C.cyan], [12, 'A = lg(I_{0}/I) = lg e^{K0·L} = 0.434 K_{0} L', C.text],
    [13, 'K_{0} = (2√(π ln2) / Δν_{D}) · (e^{2}/mc) · N_{0} f', C.text], [14, 'A = 0.434 · (2√(π ln2)/Δν_{D}) · (e^{2}/mc) · N_{0} f L = k L N_{0}', C.gold]];
  steps.forEach(([li, s, c], k) => {
    const p = G(Dg, { in: at(id, li) + (k === 1 ? 1.5 : 0), fx: 'left' });
    const hl = k === 3;
    el('rect', { x: 140, y: 320 + k * 140, width: 1640, height: 110, rx: 16, fill: hl ? 'rgba(247,197,72,.14)' : C.panel, stroke: hl ? C.gold : C.line, 'stroke-width': hl ? 3 : 1.6 }, p);
    T(p, 180, 390 + k * 140, s, { size: hl ? 38 : 36, weight: 700, fill: c, maxw: 1560 });
    if (k > 0) arrow(p, 960, 292 + k * 140, 960, 318 + k * 140, C.muted, 2);
  });
  T(G(Dg, { in: at(id, 12) }), 1760, 520, '代入 I = I_{0} e^{−K0·L}', { size: 22, anchor: 'end', fill: C.muted });
  T(G(Dg, { in: at(id, 13) }), 1760, 660, '多普勒变宽为主时', { size: 22, anchor: 'end', fill: C.muted });
  T(G(Dg, { in: at(id, 14) + 2 }), 960, 900, '吸光度 A 与基态原子数 N_{0} 成线性关系', { size: 32, anchor: 'middle', fill: C.gold, weight: 700 });
});

/* ================= Boltzmann & Beer ================= */
S.push(function boltz() {
  const id = 'boltz', g = sceneGroup(id);
  title(g, id, '基态原子数与定量基础', '课件 P35–37');
  const L = G(g, { in: at(id, 0), fx: 'none' });
  el('line', { x1: 120, y1: 820, x2: 640, y2: 820, stroke: C.muted, 'stroke-width': 4 }, L);
  el('line', { x1: 120, y1: 460, x2: 640, y2: 460, stroke: C.cyan, 'stroke-width': 4 }, L);
  T(L, 660, 828, 'E_{0} 基态 N_{0}', { size: 24, fill: C.muted });
  T(L, 660, 468, 'E_{j} 激发态 N_{j}', { size: 24, fill: C.cyan });
  const rr = window.ENG.rng(9);
  const pool = [];
  for (let k = 0; k < 60; k++) pool.push({ x: 140 + rr() * 480, e: el('circle', { r: 8, fill: C.gold }, L) });
  const tempT = T(L, 380, 920, '', { size: 26, anchor: 'middle', fill: C.orange, weight: 600 });
  U.push(t => {
    // excited count grows during line 3 (temperature rising), back to few for line 4+
    const hot = E(t, at(id, 3), 1.2) * (1 - E(t, at(id, 4), 1));
    const nEx = Math.round(1 + 10 * hot);
    pool.forEach((p, k) => {
      const up = k < nEx;
      setAttrs(p.e, { cx: p.x.toFixed(1), cy: up ? 440 - (k % 2) * 18 : 800 - (k % 3) * 18, fill: up ? C.cyan : C.gold });
    });
    tempT.textContent = t < at(id, 3) ? '' : (hot > 0.5 ? '温度升高 → 激发态原子按指数增加' : 'T < 3000 K：激发态原子极少');
  });
  const F = G(g, { in: at(id, 1) + 0.5 });
  card(F, 960, 250, 900, 200, { stroke: C.gold, fill: 'rgba(247,197,72,.06)' });
  T(F, 1410, 340, 'N_{j} / N_{0} = (P_{j} / P_{0}) · e^{−Ej / kT}', { size: 44, anchor: 'middle', weight: 700, fill: C.gold });
  T(G(F, { in: at(id, 2) }), 1410, 405, 'P：统计权重（能级简并度）　E_{j}：激发能　k：玻耳兹曼常数　T：热力学温度', { size: 21, anchor: 'middle', fill: C.muted, maxw: 860 });
  const tb = G(g, { in: at(id, 4) + 0.3 });
  card(tb, 960, 480, 900, 330, { stroke: C.cyanDeep });
  T(tb, 990, 530, 'N_{j}/N_{0} 的数量级（按上式计算，补充）', { size: 24, weight: 700, fill: C.cyan, maxw: 840 });
  const rows = [['元素 · 共振线', '2000 K', '3000 K'], ['Na 589.0 nm', '9.9×10^{−6}', '5.8×10^{−4}'], ['Ca 422.7 nm', '1.2×10^{−7}', '3.6×10^{−5}'], ['Zn 213.9 nm', '7.5×10^{−15}', '5.5×10^{−10}']];
  rows.forEach((r, k) => {
    const p = G(tb, { in: at(id, 5) + (k ? (k - 1) * 0.5 : -0.5) });
    r.forEach((s, j) => T(p, [990, 1390, 1630][j], 580 + k * 50, s, { size: 25, fill: k === 0 ? C.muted : (j === 2 && k === 1 ? C.gold : C.text), weight: k === 0 ? 400 : 600, maxw: 300 }));
  });
  T(G(tb, { in: at(id, 5) + 2 }), 990, 788, '绝大部分 < 1%，波长越短越小', { size: 23, fill: C.gold, maxw: 840 });
  const ch = G(g, { in: at(id, 6), fx: 'none' });
  const chain = [['A ∝ N_{0}', 6], ['N_{0} ≈ N', 6], ['N ∝ c', 7], ['A = k′c', 8]];
  chain.forEach(([s, li], k) => {
    const p = G(ch, { in: at(id, li) + (k === 1 ? 1 : 0), fx: 'scale', ox: 1030 + k * 230, oy: 890 });
    const last = k === 3;
    el('rect', { x: 960 + k * 230, y: 850, width: 200, height: 80, rx: 14, fill: last ? 'rgba(247,197,72,.16)' : C.panel2, stroke: last ? C.gold : C.cyanDeep, 'stroke-width': last ? 3 : 2 }, p);
    T(p, 1060 + k * 230, 902, s, { size: 30, anchor: 'middle', weight: 700, fill: last ? C.gold : C.text, maxw: 186 });
    if (k < 3) arrow(p, 1162 + k * 230, 890, 1188 + k * 230, 890, C.muted, 2.5);
  });
  T(G(g, { in: at(id, 9) }), 380, 280, '朗伯-比尔定律：AAS 定量的基础', { size: 30, anchor: 'middle', fill: C.gold, weight: 700 });
  focus(tb, at(id, 4), at(id, 6), 0.45);
});

/* ================= quiz helper ================= */
// Q: [questionLine, [answerLines...], question, options, answerIndex, why]
window.QUIZ = function quizScene(id, name, sub, Q, intro) {
  const g = sceneGroup(id);
  title(g, id, name, sub);
  const ig = G(g, { in: at(id, 0), out: at(id, 1) - 0.3 });
  T(ig, 960, 540, intro, { size: 52, anchor: 'middle', weight: 700 });
  T(ig, 960, 610, '每题停顿 3 秒，可随时暂停', { size: 26, anchor: 'middle', fill: C.muted });
  Q.forEach(([ql, al, q, opts, ans, why], n) => {
    const nextQ = Q[n + 1] ? at(id, Q[n + 1][0]) - 0.35 : null;
    const qg = G(g, { in: at(id, ql) - 0.2, out: nextQ, od: 0.3, fx: 'left' });
    T(qg, 80, 300, `第 ${n + 1} / ${Q.length} 题`, { size: 26, fill: C.cyan, weight: 700 });
    T(qg, 80, 370, q, { size: 38, weight: 700, maxw: 1500 });
    opts.forEach((o, k) => {
      const og = el('g', {}, qg);
      const r = el('rect', { x: 80, y: 420 + k * 104, width: 1300, height: 86, rx: 14, fill: C.panel, stroke: C.line, 'stroke-width': 2 }, og);
      el('circle', { cx: 130, cy: 463 + k * 104, r: 24, fill: C.panel2, stroke: C.cyanDeep }, og);
      T(og, 130, 472 + k * 104, 'ABCD'[k], { size: 26, anchor: 'middle', weight: 700 });
      T(og, 180, 474 + k * 104, o, { size: 28, maxw: 1180 });
      U.push(t => {
        const shown = t >= at(id, al[0]) - 0.1;
        const good = k === ans;
        setAttrs(r, { stroke: shown && good ? C.green : C.line, fill: shown && good ? 'rgba(110,231,168,.14)' : C.panel });
        og.setAttribute('opacity', shown && !good ? 0.4 : 1);
      });
    });
    const cd = G(qg, { in: end(id, ql), out: at(id, al[0]) - 0.1, od: 0.2, fx: 'none' });
    el('circle', { cx: 1640, cy: 600, r: 90, fill: 'none', stroke: C.line, 'stroke-width': 12 }, cd);
    const ring = el('circle', { cx: 1640, cy: 600, r: 90, fill: 'none', stroke: C.gold, 'stroke-width': 12, transform: 'rotate(-90 1640 600)', 'stroke-linecap': 'round' }, cd);
    ring.setAttribute('pathLength', 1); ring.setAttribute('stroke-dasharray', '1 1');
    const num = T(cd, 1640, 622, '3', { size: 64, anchor: 'middle', fill: C.gold, weight: 700 });
    T(cd, 1640, 740, '想一想', { size: 28, anchor: 'middle', fill: C.muted });
    U.push(t => {
      const a = end(id, ql), b = at(id, al[0]);
      if (t < a || t > b) return;
      ring.setAttribute('stroke-dashoffset', prog(t, a, b - a).toFixed(3));
      num.textContent = String(Math.max(1, Math.ceil(b - t)));
    });
    const ag = G(qg, { in: at(id, al[0]), fx: 'scale', ox: 1640, oy: 600 });
    el('circle', { cx: 1640, cy: 560, r: 90, fill: 'rgba(110,231,168,.15)', stroke: C.green, 'stroke-width': 4 }, ag);
    T(ag, 1640, 590, 'ABCD'[ans], { size: 90, anchor: 'middle', fill: C.green, weight: 700 });
    const wg = G(qg, { in: at(id, al[0]) + 0.6 });
    card(wg, 80, 845, 1780, 80, { stroke: C.green, fill: 'rgba(110,231,168,.06)' });
    T(wg, 110, 897, '解析：' + why, { size: 26, fill: C.green, maxw: 1720 });
  });
  return g;
};

S.push(function quiz1() {
  const id = 'quiz1';
  const g = window.QUIZ(id, '课堂练习（一）', '课件 P38–41，共 4 题', [
    [1, [2, 3], '1. 原子吸收光谱是（ ）', ['分子的振动、转动能级跃迁时对光的选择吸收产生的', '基态原子吸收了特征辐射跃迁到激发态后又回到基态时所产生的', '分子的电子吸收特征辐射后跃迁到激发态所产生的', '基态原子吸收特征辐射后跃迁到激发态所产生的'], 3, 'B 是“又回到基态”的发射过程；A、C 讲的是分子光谱'],
    [4, [5], '2. 由原子无规则的热运动所产生的谱线变宽称为（ ）', ['自然变宽', '斯塔克变宽', '劳伦茨变宽', '多普勒变宽'], 3, '多普勒变宽又叫热变宽'],
    [6, [7], '3. 被测元素的相对原子质量愈小、温度愈高，谱线的热变宽将（ ）', ['愈严重', '愈不严重', '基本不变', '不变'], 0, 'Δν_{D} = 7.162×10^{−7}·ν_{0}·√(T/M)：T↑、M↓ → Δν_{D}↑'],
    [8, [9, 10], '4. 为实现峰值吸收测量，除要求 Δν_{e} < Δν_{a} 外，还必须使（ ）', ['ν_{0a} < ν_{0e}', 'ν_{0a} = ν_{0e}', 'ν_{0a} > ν_{0e}', '与中心频率无关'], 1, '发射线与吸收线的中心频率必须一致']
  ], '4 道题：先想一想，再看答案');
  // note about the misprinted stem of Q4
  const nt = G(g, { in: at(id, 10) });
  card(nt, 1440, 250, 420, 170, { stroke: C.gold, fill: 'rgba(247,197,72,.10)' });
  T(nt, 1460, 300, '课件 P41 原题写作', { size: 22, fill: C.gold, maxw: 380 });
  T(nt, 1460, 340, '“Δν_{a} < Δν_{e}”，条件写反了', { size: 22, fill: C.gold, maxw: 380 });
  T(nt, 1460, 385, '正确：Δν_{e} < Δν_{a}', { size: 24, fill: C.text, weight: 700, maxw: 380 });
});
})();
