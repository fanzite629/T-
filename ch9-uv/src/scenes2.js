/* Scenes part 2: 9-3 inorganic, chromophores & bands, 9-5 instrument, 9-6 applications, vs AAS, quiz, summary */
'use strict';
(() => {
const { TL, C, SC, at, end, prog, lerp, E, eo, el, setAttrs, T, G, D, U, focus, arrowId, card, pill, arrow,
  axes, curve, gauss, bullets, sceneGroup, title, stepLabel, svg } = window.ENG;
const S = window.SCENES;
const mid = (s, i) => (at(s, i) + end(s, i)) / 2;

/* ================= 9-3 inorganic ================= */
S.push(function inorg() {
  const id = 'inorg', g = sceneGroup(id);
  title(g, id, '9-3 无机化合物的紫外吸收光谱', '课件 P22–26（主要针对配位化合物）');
  stepLabel(g, 60, 262, [[at(id, 0), '电荷迁移跃迁'], [at(id, 4), '配位场跃迁'], [at(id, 8), '结构相似，金属不同'], [at(id, 9), '六种跃迁总表']]);

  const A = G(g, { in: at(id, 0), out: at(id, 4) - 0.4, fx: 'none' });
  const dn = G(A, { in: at(id, 1), fx: 'none' });
  el('circle', { cx: 300, cy: 560, r: 100, fill: 'rgba(61,213,243,.15)', stroke: C.cyan, 'stroke-width': 2 }, dn);
  el('circle', { cx: 700, cy: 560, r: 100, fill: 'rgba(247,197,72,.15)', stroke: C.gold, 'stroke-width': 2 }, dn);
  T(dn, 300, 572, 'A', { size: 44, anchor: 'middle', weight: 700, fill: C.cyan });
  T(dn, 700, 572, 'B', { size: 44, anchor: 'middle', weight: 700, fill: C.gold });
  T(dn, 300, 700, '电子给予体', { size: 24, anchor: 'middle', fill: C.cyan });
  T(dn, 700, 700, '电子接受体', { size: 24, anchor: 'middle', fill: C.gold });
  T(dn, 500, 566, '···', { size: 40, anchor: 'middle', fill: C.muted });
  const ee = el('circle', { r: 11, fill: C.text, filter: 'url(#glow)' }, dn);
  U.push(t => {
    const k = E(t, at(id, 1) + 0.8, 1.2);
    setAttrs(ee, { cx: lerp(330, 670, k), cy: 520 - Math.sin(k * Math.PI) * 90 });
  });
  T(G(A, { in: at(id, 1) + 2 }), 500, 800, 'A···B → A^{+}···B^{−}', { size: 40, anchor: 'middle', fill: C.gold, weight: 500 });
  const ca = G(A, { in: at(id, 1), fx: 'none' });
  card(ca, 1000, 310, 860, 600, { stroke: C.cyanDeep });
  T(ca, 1030, 365, '电荷迁移跃迁', { size: 34, weight: 700, fill: C.cyan });
  bullets(ca, 1040, 440, [
    ['电子：给予体 → 与接受体相联系的轨道', at(id, 1) + 0.5],
    ['近紫外区 ~ 可见光区之间', at(id, 2)],
    ['谱带较宽、吸收强度大', at(id, 2) + 1.4],
    ['κ_{max} ≥ 10^{4}：强吸收带', at(id, 2) + 2.8],
    ['多见于金属离子配合物、水合无机离子', at(id, 3)],
    ['例：Fe^{3+} + nSCN^{−} → Fe(SCN)_{n}^{3−n}', at(id, 3) + 2]
  ], { size: 26, gap: 74, maxw: 780 });

  const B = G(g, { in: at(id, 4), out: at(id, 8) - 0.4, fx: 'none' });
  // d orbitals
  const dg = G(B, { in: at(id, 5), fx: 'none' });
  for (let k = 0; k < 5; k++) el('line', { x1: 110 + k * 64, y1: 470, x2: 160 + k * 64, y2: 470, stroke: C.text, 'stroke-width': 4 }, dg);
  T(dg, 255, 520, '5 个 d 轨道（简并）', { size: 22, anchor: 'middle', fill: C.muted });
  arrow(dg, 440, 470, 530, 470, C.muted);
  T(dg, 485, 450, '配体', { size: 20, anchor: 'middle', fill: C.muted });
  const dsplit = G(dg, { in: at(id, 5) + 1.2, fx: 'none' });
  for (let k = 0; k < 2; k++) el('line', { x1: 600 + k * 70, y1: 380, x2: 652 + k * 70, y2: 380, stroke: C.gold, 'stroke-width': 4 }, dsplit);
  for (let k = 0; k < 3; k++) el('line', { x1: 565 + k * 70, y1: 550, x2: 617 + k * 70, y2: 550, stroke: C.cyan, 'stroke-width': 4 }, dsplit);
  T(dsplit, 660, 600, '分裂成能量不等的几组', { size: 22, fill: C.muted, anchor: 'middle' });
  const dj = G(dg, { in: at(id, 5) + 2.2, fx: 'none' });
  D(arrow(dj, 660, 545, 660, 388, C.red, 3.5), at(id, 5) + 2.2, 0.5);
  T(dj, 676, 470, 'd–d', { size: 24, fill: C.red, weight: 700 });
  // f orbitals
  const fg = G(B, { in: at(id, 6), fx: 'none' });
  for (let k = 0; k < 7; k++) el('line', { x1: 100 + k * 46, y1: 780, x2: 136 + k * 46, y2: 780, stroke: C.text, 'stroke-width': 4 }, fg);
  T(fg, 255, 830, '7 个 f 轨道（镧系、锕系）', { size: 22, anchor: 'middle', fill: C.muted });
  arrow(fg, 440, 780, 530, 780, C.muted);
  [[690, 3], [760, 2], [830, 2]].forEach(([y, n], r) => {
    for (let k = 0; k < n; k++) el('line', { x1: 570 + k * 60, y1: y + 0 - (r === 0 ? 0 : 0), x2: 614 + k * 60, y2: y, stroke: [C.gold, C.violet, C.cyan][r], 'stroke-width': 4 }, fg);
  });
  D(arrow(fg, 600, 826, 600, 696, C.red, 3), at(id, 6) + 1.5, 0.5);
  T(fg, 586, 770, 'f–f', { size: 24, fill: C.red, weight: 700, anchor: 'end' });
  const cb = G(B, { in: at(id, 4), fx: 'none' });
  card(cb, 1000, 310, 860, 600, { stroke: C.violet });
  T(cb, 1030, 365, '配位场跃迁', { size: 34, weight: 700, fill: C.violet });
  bullets(cb, 1040, 440, [
    ['包括 d–d 跃迁和 f–f 跃迁', at(id, 4) + 0.4],
    ['过渡金属：5 个简并 d 轨道分裂成几组', at(id, 5)],
    ['镧系、锕系：7 个简并 f 轨道分裂', at(id, 6)],
    ['电子在分裂后的轨道间跃迁 → 吸收', at(id, 6) + 2],
    ['κ_{max} < 100：弱吸收带', at(id, 7)]
  ], { size: 26, gap: 80, dot: C.violet, maxw: 780 });

  // heme vs chlorophyll
  const Cg = G(g, { in: at(id, 8), out: at(id, 9) - 0.4, fx: 'none' });
  [[560, 'Fe', '血红素', '#C0392B'], [1360, 'Mg', '叶绿素', '#2E9E4F']].forEach(([cx, m, nm, col], k) => {
    const pg = G(Cg, { in: at(id, 8) + k * 1.0, fx: 'scale', ox: cx, oy: 560 });
    el('rect', { x: cx - 300, y: 300, width: 600, height: 560, rx: 20, fill: col, opacity: 0.12, stroke: col, 'stroke-width': 2 }, pg);
    el('rect', { x: cx - 150, y: 410, width: 300, height: 300, rx: 70, fill: 'none', stroke: C.text, 'stroke-width': 4 }, pg);
    [[0, -150], [150, 0], [0, 150], [-150, 0]].forEach(([dx, dy]) => {
      el('circle', { cx: cx + dx * 0.95, cy: 560 + dy * 0.95, r: 36, fill: C.bg0, stroke: C.text, 'stroke-width': 3 }, pg);
      el('line', { x1: cx + dx * 0.55, y1: 560 + dy * 0.55, x2: cx + dx * 0.18, y2: 560 + dy * 0.18, stroke: C.muted, 'stroke-width': 3 }, pg);
      T(pg, cx + dx * 0.55, 560 + dy * 0.55 + 8, 'N', { size: 22, anchor: 'middle', fill: C.cyan, weight: 700 });
    });
    el('circle', { cx, cy: 560, r: 42, fill: col }, pg);
    T(pg, cx, 574, m, { size: 36, anchor: 'middle', weight: 700 });
    T(pg, cx, 800, nm, { size: 36, anchor: 'middle', weight: 700 });
  });
  T(G(Cg, { in: at(id, 8) + 2.5 }), 960, 920, '都是卟啉环结构，络合的金属不同，颜色差别很大（结构为示意）', { size: 26, anchor: 'middle', fill: C.gold });

  // six transitions table
  const Dg = G(g, { in: at(id, 9), fx: 'none' });
  const cols = [70, 330, 560, 760], cw = [260, 230, 200, 1090];
  const rows = [
    ['σ→σ^{*}', '< 150 nm', '强吸收', '一直存在，普通仪器不可检测；饱和烷烃适合做溶剂', C.violet],
    ['π→π^{*}', '< 200 nm', '强吸收', '单个双键 < 200 nm；形成共轭体系后波长红移，吸光系数增大', C.cyan],
    ['n→π^{*}', '> 200 nm', '弱吸收', '杂原子与分子双键或三键相连', C.red],
    ['n→σ^{*}', '≈ 200 nm', '中强吸收', '含有杂原子的有机化合物', C.orange],
    ['电荷迁移跃迁', '> 200 nm', '强吸收', '配合物，电子从配体向中心金属转移', C.gold],
    ['配位场跃迁', '> 200 nm', '弱吸收', '镧系和锕系，外层有 d 轨道或 f 轨道', C.violet]
  ];
  el('rect', { x: 60, y: 300, width: 1800, height: 62, rx: 10, fill: C.panel2 }, Dg);
  ['跃迁类型', '波长范围', '吸收强弱', '跃迁特征'].forEach((s, k) => T(Dg, cols[k] + 20, 342, s, { size: 26, fill: C.muted, weight: 700 }));
  rows.forEach(([a, b, c, d, col], k) => {
    const y = 372 + k * 88;
    const li = k < 2 ? 10 : 11;
    const rg = G(Dg, { in: at(id, 9) + 0.3 + k * 0.25, fx: 'left' });
    el('rect', { x: 60, y, width: 1800, height: 80, rx: 8, fill: C.panel, stroke: C.line }, rg);
    T(rg, cols[0] + 20, y + 52, a, { size: 28, fill: col, weight: 700, maxw: cw[0] - 20 });
    T(rg, cols[1] + 20, y + 52, b, { size: 26, maxw: cw[1] - 20 });
    T(rg, cols[2] + 20, y + 52, c, { size: 26, fill: c.startsWith('强') ? C.cyan : (c.startsWith('弱') ? C.red : C.gold), weight: 700, maxw: cw[2] - 20 });
    T(rg, cols[3] + 20, y + 52, d, { size: 24, maxw: cw[3] - 30 });
    focus(rg, at(id, li), end(id, li) + (li === 11 ? 3 : 0), 0.45);
  });
});

/* ================= chromophores, auxochromes, absorption bands ================= */
S.push(function band() {
  const id = 'band', g = sceneGroup(id);
  title(g, id, '生色团、助色团与吸收带', '课件 P27–34');
  stepLabel(g, 60, 262, [[at(id, 0), '生色团与助色团'], [at(id, 4), '红移与蓝移'], [at(id, 5), '四种吸收带：R、K、B、E']]);

  const A = G(g, { in: at(id, 0), out: at(id, 4) - 0.4, fx: 'none' });
  const cg = G(A, { in: at(id, 0), fx: 'none' });
  card(cg, 70, 300, 860, 620, { stroke: C.gold });
  T(cg, 100, 360, '生色团（chromophore）', { size: 34, weight: 700, fill: C.gold });
  T(cg, 100, 420, '含 π→π^{*} 或 n→π^{*} 跃迁的基团', { size: 26, maxw: 800 });
  T(cg, 100, 462, '能在紫外-可见区产生吸收', { size: 26, maxw: 800 });
  ['C=C', 'C=O', '–N=N–', '–NO_{2}', '–C=S'].forEach((s, k) => {
    const pg = G(cg, { in: at(id, 1) + k * 0.4, fx: 'scale', ox: 210 + (k % 3) * 250, oy: 560 + Math.floor(k / 3) * 110 });
    pill(pg, 110 + (k % 3) * 250, 530 + Math.floor(k / 3) * 110, 210, 64, s, { size: 30, stroke: C.gold, fill: C.gold, bg: 'rgba(247,197,72,.08)' });
  });
  const ag = G(A, { in: at(id, 2), fx: 'none' });
  card(ag, 990, 300, 870, 620, { stroke: C.cyan });
  T(ag, 1020, 360, '助色团（auxochrome）', { size: 34, weight: 700, fill: C.cyan });
  T(ag, 1020, 420, '含非键电子的杂原子饱和基团', { size: 26 });
  T(ag, 1020, 462, '本身无紫外吸收', { size: 26, fill: C.muted });
  const ag2 = G(ag, { in: at(id, 3) });
  T(ag2, 1020, 504, '使吸收峰增强，并向长波方向移动', { size: 26, fill: C.cyan, weight: 500 });
  ['–OH', '–NH_{2}', '–SH', '–Cl', '–Br', '–I'].forEach((s, k) => pill(ag2, 1020 + k * 136, 540, 120, 52, s, { size: 24 }));
  const px = l => 1060 + (l - 200) * 3.2, py = a => 870 - a * 220;
  el('path', { d: `M1040 870 H1830`, stroke: C.muted, 'stroke-width': 2 }, ag2);
  T(ag2, 1830, 900, 'λ', { size: 20, fill: C.muted, anchor: 'end' });
  el('path', { d: curve(l => gauss(l, 300, 26, 0.6), 200, 440, px, py), stroke: C.muted, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '6 6' }, ag2);
  const live = el('path', { stroke: C.cyan, 'stroke-width': 4, fill: 'none' }, ag2);
  U.push(t => {
    if (t < at(id, 3) - 0.5 || t > at(id, 4)) return;
    const k = E(t, at(id, 3) + 2.5, 1.5);
    live.setAttribute('d', curve(l => gauss(l, 300 + 22 * k, 26, 0.6 + 0.35 * k), 200, 440, px, py));
  });
  T(ag2, 1500, 660, '引入助色团后', { size: 20, fill: C.cyan });

  // red / blue shift
  const B = G(g, { in: at(id, 4), out: at(id, 5) - 0.4, fx: 'none' });
  const bx = l => 360 + (l - 200) * 6, by = a => 820 - a * 380;
  el('rect', { x: 330, y: 380, width: 600, height: 470, fill: '#3B5BFF', opacity: 0.06 }, B);
  el('rect', { x: 990, y: 380, width: 620, height: 470, fill: '#FF4A4A', opacity: 0.06 }, B);
  axes(B, 330, 820, 1300, 440, 'λ', 'A');
  el('path', { d: curve(l => gauss(l, 300, 22, 0.9), 200, 400, bx, by), stroke: C.muted, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '6 6' }, B);
  const sp = el('path', { stroke: C.gold, 'stroke-width': 5, fill: 'none' }, B);
  const red = G(B, { in: at(id, 4) + 0.6 });
  arrow(red, 1060, 420, 1360, 420, C.red, 4);
  T(red, 1210, 400, '红移（长移）：向长波', { size: 28, anchor: 'middle', fill: C.red, weight: 700 });
  const blue = G(B, { in: mid(id, 4) + 0.6 });
  arrow(blue, 860, 420, 560, 420, C.blue, 4);
  T(blue, 710, 400, '蓝移（紫移、短移）：向短波', { size: 28, anchor: 'middle', fill: C.blue, weight: 700 });
  T(G(B, { in: at(id, 4) + 1.5 }), 960, 912, '原因：结构改变（共轭、引入助色团）或换用不同溶剂', { size: 26, anchor: 'middle', fill: C.muted });
  U.push(t => {
    if (t < at(id, 4) - 0.5 || t > at(id, 5)) return;
    const m = mid(id, 4);
    const s = 40 * E(t, at(id, 4) + 0.6, 1.2) * (1 - E(t, m, 0.6)) - 40 * E(t, m + 0.6, 1.2);
    sp.setAttribute('d', curve(l => gauss(l, 300 + s, 22, 0.9), 200, 400, bx, by));
  });

  // bands
  const Cg = G(g, { in: at(id, 5), fx: 'none' });
  const X = l => 1010 + (l - 170) * 3.5, Y = v => 820 - v * 92;
  const pl = G(Cg, { in: at(id, 5), fx: 'none' });
  axes(pl, 990, 820, 860, 500, 'λ / nm', 'lg κ');
  [180, 220, 260, 300, 340, 380].forEach(v => { el('line', { x1: X(v), y1: 820, x2: X(v), y2: 828, stroke: C.muted }, pl); T(pl, X(v), 852, String(v), { size: 18, fill: C.muted, anchor: 'middle' }); });
  for (let v = 1; v <= 5; v++) T(pl, 980, Y(v) + 6, String(v), { size: 18, fill: C.muted, anchor: 'end' });
  T(G(pl, { in: at(id, 6), cls: 'note' }), 1420, 900, '曲线为示意，用于比较位置与强弱', { size: 18, fill: C.dim, anchor: 'middle' });
  const lg = k => Math.log10(1 + k);
  // R band (with solvent blue shift)
  const rP = el('path', { stroke: C.red, 'stroke-width': 4, fill: 'none' }, Cg);
  const rL = T(Cg, 0, 0, 'R', { size: 30, fill: C.red, weight: 700, anchor: 'middle' });
  const kP = el('path', { stroke: C.cyan, 'stroke-width': 4, fill: 'none' }, Cg);
  const kL = T(Cg, 0, 0, 'K', { size: 30, fill: C.cyan, weight: 700, anchor: 'middle' });
  U.push(t => {
    if (t < at(id, 5) - 0.5 || t > SC[id].t1) return;
    const rA = E(t, at(id, 6), 0.6) * (1 - E(t, at(id, 8), 0.5));
    const rs = -18 * E(t, at(id, 7) + 3.2, 1.2);
    rP.setAttribute('d', curve(l => lg(gauss(l, 320 + rs, 22, 60)), 170, 400, X, Y));
    rP.setAttribute('opacity', rA.toFixed(2));
    setAttrs(rL, { x: X(320 + rs), y: Y(lg(60)) - 16, opacity: rA.toFixed(2) });
    const kA = E(t, at(id, 8), 0.6) * (1 - E(t, at(id, 11), 0.5));
    const conj = E(t, at(id, 9) + 0.3, 1.2), solv = E(t, mid(id, 9) + 0.6, 1.2);
    const mu = 225 + 30 * conj + 12 * solv, amp = 11000 + 14000 * conj;
    kP.setAttribute('d', curve(l => lg(gauss(l, mu, 16, amp)), 170, 400, X, Y));
    kP.setAttribute('opacity', kA.toFixed(2));
    setAttrs(kL, { x: X(mu), y: Y(lg(amp)) - 16, opacity: kA.toFixed(2) });
  });
  const rNote = G(Cg, { in: at(id, 7) + 3.0, out: at(id, 8) - 0.3, od: 0.3 });
  arrow(rNote, X(330), Y(2.4), X(300), Y(2.4), C.blue, 3);
  T(rNote, X(315), Y(2.4) - 16, '溶剂极性↑ → 蓝移', { size: 22, fill: C.blue, anchor: 'middle', weight: 700 });
  const kNote1 = G(Cg, { in: at(id, 9) + 0.3, out: at(id, 11) - 0.3, od: 0.3 });
  T(kNote1, X(330), Y(4.6), '共轭双键增加 → 红移、增强', { size: 22, fill: C.cyan, weight: 700 });
  const kNote2 = G(Cg, { in: mid(id, 9) + 0.6, out: at(id, 11) - 0.3, od: 0.3 });
  T(kNote2, X(330), Y(4.2), '溶剂极性↑ → 红移（与 R 带相反）', { size: 22, fill: C.gold, weight: 700 });
  // benzene: E1, E2, B
  const benz = l => gauss(l, 184, 7, 60000) + gauss(l, 204, 8, 7900) + [233, 239, 244, 249, 255, 261, 268].reduce((s, m, k) => s + gauss(l, m, 2.2, [60, 100, 150, 200, 220, 150, 80][k]), 0) + gauss(l, 252, 14, 40);
  const bP = el('path', { d: curve(l => lg(benz(l)), 172, 300, X, Y, 600), stroke: C.green, 'stroke-width': 3.5, fill: 'none' }, G(Cg, { in: at(id, 11) + 1, out: at(id, 15) - 0.3, od: 0.4, fx: 'none' }));
  D(bP, at(id, 11) + 1, 1.5);
  const bl = (tin, l, v, s, c) => { const q = G(Cg, { in: tin, out: at(id, 15) - 0.3, od: 0.3 }); T(q, X(l), Y(v), s, { size: 26, fill: c, weight: 700, anchor: 'middle' }); };
  bl(at(id, 12) + 0.5, 252, 3.0, 'B 带（精细结构）', C.violet);
  bl(at(id, 13) + 0.5, 184, 5.05, 'E_{1}', C.green);
  bl(at(id, 13) + 1.0, 212, 4.25, 'E_{2}', C.green);
  T(G(Cg, { in: at(id, 11) + 1, out: at(id, 15) - 0.3, od: 0.3 }), X(330), Y(4.6), '苯（示意）', { size: 24, fill: C.green });
  // acetophenone: K, B, R
  const ace = l => gauss(l, 242, 14, 13000) + gauss(l, 279, 10, 1100) + gauss(l, 319, 18, 50);
  const aP = el('path', { d: curve(l => lg(ace(l)), 180, 400, X, Y, 500), stroke: C.gold, 'stroke-width': 4, fill: 'none' }, G(Cg, { in: at(id, 15), fx: 'none' }));
  D(aP, at(id, 15), 1.4);
  const al = G(Cg, { in: at(id, 15) + 1.2 });
  T(al, X(242), Y(lg(13000)) - 14, 'K', { size: 30, fill: C.cyan, weight: 700, anchor: 'middle' });
  T(al, X(279), Y(lg(1100)) - 14, 'B', { size: 30, fill: C.violet, weight: 700, anchor: 'middle' });
  T(al, X(325), Y(lg(50)) - 14, 'R', { size: 30, fill: C.red, weight: 700, anchor: 'middle' });
  T(al, X(330), Y(4.6), '乙酰苯（苯乙酮，示意）', { size: 24, fill: C.gold });

  const cards = [
    [5, 6, '吸收带', C.text, [[5, '说明吸收峰在紫外光谱中的位置'], [5, 'R 带 · K 带 · B 带 · E 带', 2]]],
    [6, 8, 'R 带', C.red, [[6, 'n→π^{*}：含杂原子的不饱和基团'], [6, '如 C=O、–N=N–', 2], [7, '能量小：λ_{max} 250～400 nm'], [7, 'κ_{max} < 100：弱吸收', 1.4], [7, '溶剂极性增强 → R 带蓝移', 3.0]]],
    [8, 11, 'K 带', C.cyan, [[8, '共轭双键 π→π^{*}：如 (–CH=CH–)_{n}、–CH=C–CO–'], [8, 'λ_{max} > 200 nm，κ_{max} > 10^{4}：强吸收', 2.5],
      [9, '共轭双键增加 → 红移，强度增加'], [9, '溶剂极性增加 → 红移（与 R 带相反）', 3.0], [10, '共轭分子的特征带：判断共轭结构，应用最多']]],
    [11, 15, 'B 带 · E 带（芳香族）', C.green, [[11, '都是芳香族化合物的特征吸收带'], [12, 'B：π→π^{*} 与苯环振动重叠'], [12, 'λ_{max} 230～270 nm，宽带，有精细结构，κ_{max} ≈ 200', 3.5],
      [13, 'E：苯环环形共轭体系的 π→π^{*}'], [14, 'E_{1} ≈ 185 nm，κ_{max} > 10^{4}'], [14, 'E_{2} ≈ 204 nm，κ_{max} ≈ 7000', 2.5]]],
    [15, null, '乙酰苯：三带同现', C.gold, [[15, '同一分子中可同时看到 K、B、R 带'], [15, 'K：共轭 π→π^{*}（强）', 1.5], [15, 'B：苯环（中等，精细结构）', 2.5], [15, 'R：C=O 的 n→π^{*}（弱）', 3.5]]]
  ];
  cards.forEach(([li, nx, h, c, items]) => {
    const kg = G(Cg, { in: at(id, li), out: nx != null ? at(id, nx) - 0.35 : null, od: 0.3, fx: 'left' });
    card(kg, 70, 300, 880, 620, { stroke: c });
    T(kg, 110, 372, h, { size: 40, fill: c, weight: 700 });
    bullets(kg, 110, 452, items.map(([l, s, dt]) => [s, at(id, l) + (dt || 0)]), { size: 25, gap: 76, dot: c, maxw: 800 });
  });
  T(G(Cg, { in: at(id, 14) + 3, out: at(id, 15) - 0.3, cls: 'note' }), 110, 900, '注：课件 P32 写作 E_{1} 约 180 nm、E_{2} 约 200 nm；P33 写作 185 nm、204 nm。', { size: 18, fill: C.dim, maxw: 820 });
});

/* ================= 9-5 instrument ================= */
S.push(function inst() {
  const id = 'inst', g = sceneGroup(id);
  title(g, id, '9-5 紫外及可见光分光光度计', '课件 P35–40');
  const parts = ['光源', '单色器', '样品室', '检测器', '显示记录'];
  const spans = [[1, 4], [4, 8], [8, 9], [9, 11], [11, 12]];
  parts.forEach((s, k) => {
    const pg = G(g, { in: at(id, 0) + k * 0.3, fx: 'scale', ox: 160 + k * 380, oy: 250 });
    el('rect', { x: 70 + k * 380, y: 222, width: 300, height: 56, rx: 28, fill: C.panel2, stroke: C.cyan, 'stroke-width': 1.6 }, pg);
    T(pg, 220 + k * 380, 259, `${'①②③④⑤'[k]} ${s}`, { size: 26, anchor: 'middle', weight: 700 });
    if (k < 4) arrow(pg, 376 + k * 380, 250, 444 + k * 380, 250, C.cyanDeep);
    const [a, b] = spans[k];
    U.push(t => {
      if (t < SC[id].t0 || t > SC[id].t1) return;
      const on = t >= at(id, a) - 0.2 && t < (b < 12 ? at(id, b) - 0.2 : at(id, 12) - 0.2);
      pg.firstChild.setAttribute('fill', on ? C.cyan : C.panel2);
      pg.childNodes[1].setAttribute('fill', on ? C.bg1 : C.text);
    });
  });
  const pane = (a, b) => G(g, { in: at(id, a), out: b != null ? at(id, b) - 0.4 : null, fx: 'none' });

  // source
  const P1 = pane(1, 4);
  const bulb = (x, nm, c) => {
    el('circle', { cx: x, cy: 470, r: 70, fill: c, opacity: 0.18, filter: 'url(#blur6)' }, P1);
    el('circle', { cx: x, cy: 470, r: 54, fill: 'none', stroke: c, 'stroke-width': 3 }, P1);
    el('path', { d: `M${x - 22} 480 q11 -30 22 0 t22 0`, stroke: c, 'stroke-width': 3, fill: 'none' }, P1);
    el('rect', { x: x - 26, y: 524, width: 52, height: 40, rx: 6, fill: '#5D7390' }, P1);
    T(P1, x, 610, nm, { size: 26, anchor: 'middle', weight: 700, fill: c });
  };
  bulb(240, '钨灯', C.orange); bulb(560, '氢灯 / 氘灯', C.violet);
  const req = G(P1, { in: at(id, 1) + 1 });
  ['连续光谱', '强度足够', '稳定性好', '寿命长'].forEach((s, k) => pill(req, 90 + k * 200, 680, 180, 50, s, { size: 22 }));
  const lx = l => 1010 + (l - 100) * 0.9; // 100–1000 nm
  const ax = G(P1, { in: at(id, 2) - 0.4, fx: 'none' });
  el('path', { d: `M${lx(100)} 760 H${lx(1000) + 20}`, stroke: C.muted, 'stroke-width': 2, 'marker-end': `url(#${arrowId(C.muted)})` }, ax);
  [100, 200, 350, 400, 600, 800, 1000].forEach(v => { el('line', { x1: lx(v), y1: 760, x2: lx(v), y2: 770, stroke: C.muted }, ax); T(ax, lx(v), 796, String(v), { size: 18, fill: C.muted, anchor: 'middle' }); });
  T(ax, lx(1000) + 20, 830, 'λ / nm', { size: 20, fill: C.muted, anchor: 'end' });
  el('rect', { x: lx(400), y: 340, width: lx(760) - lx(400), height: 400, fill: 'url(#rainbow)', opacity: 0.08 }, ax);
  T(ax, (lx(400) + lx(760)) / 2, 370, '可见区', { size: 20, fill: C.muted, anchor: 'middle' });
  const w = G(P1, { in: at(id, 2) });
  el('rect', { x: lx(320), y: 560, width: lx(1000) - lx(320), height: 50, rx: 6, fill: C.orange, opacity: 0.55 }, w);
  arrow(w, lx(1000) - 10, 585, lx(1000) + 40, 585, C.orange, 3);
  T(w, lx(320) + 14, 594, '钨灯 320–2500 nm（可见区）', { size: 22, fill: C.text, weight: 500 });
  const d2 = G(P1, { in: at(id, 3) });
  el('rect', { x: lx(165), y: 440, width: lx(350) - lx(165), height: 50, rx: 6, fill: C.violet, opacity: 0.3 }, d2);
  el('rect', { x: lx(200), y: 440, width: lx(350) - lx(200), height: 50, rx: 6, fill: C.violet, opacity: 0.7 }, d2);
  T(d2, lx(165), 425, '氢/氘灯 165–350 nm（紫外区）', { size: 22, fill: C.violet, weight: 700 });
  T(d2, lx(200), 520, '有效 200–350 nm', { size: 20, fill: C.text });
  T(G(P1, { in: at(id, 3) + 3, cls: 'note' }), 1010, 880, '注：课件 P40 的总结图写作“氢灯、氘灯 185～375 nm”，与 P36 略有出入。', { size: 18, fill: C.dim, maxw: 850 });

  // monochromator
  const P2 = pane(4, 8);
  const yA = 600;
  const slit = (x, lab, n) => {
    el('rect', { x: x - 6, y: yA - 120, width: 12, height: 104, fill: '#9FB8D0' }, P2);
    el('rect', { x: x - 6, y: yA + 16, width: 12, height: 104, fill: '#9FB8D0' }, P2);
    const lg = G(P2, { in: at(id, 5) + n * 0.5 });
    T(lg, x, yA + 168, lab, { size: 22, anchor: 'middle', fill: C.gold, weight: 700 });
  };
  slit(160, '① 入射狭缝', 0);
  const lens = (x, lab, n) => {
    el('ellipse', { cx: x, cy: yA, rx: 18, ry: 110, fill: 'rgba(159,184,208,.18)', stroke: '#9FB8D0', 'stroke-width': 2 }, P2);
    T(G(P2, { in: at(id, 5) + n * 0.5 }), x, yA + 168, lab, { size: 22, anchor: 'middle', fill: C.gold, weight: 700 });
  };
  lens(400, '② 准光装置', 1);
  el('path', { d: `M640 ${yA + 110} L760 ${yA - 110} L880 ${yA + 110} Z`, fill: 'rgba(159,184,208,.18)', stroke: '#C9D6E3', 'stroke-width': 2.5 }, P2);
  T(G(P2, { in: at(id, 5) + 1.0 }), 760, yA + 168, '③ 色散元件', { size: 22, anchor: 'middle', fill: C.gold, weight: 700 });
  lens(1080, '④ 聚焦装置', 3);
  // exit slit
  el('rect', { x: 1314, y: yA - 140, width: 12, height: 110, fill: '#9FB8D0' }, P2);
  el('rect', { x: 1314, y: yA - 10, width: 12, height: 130, fill: '#9FB8D0' }, P2);
  T(G(P2, { in: at(id, 5) + 2.0 }), 1320, yA + 168, '⑤ 出射狭缝', { size: 22, anchor: 'middle', fill: C.gold, weight: 700 });
  const rays = G(P2, { in: at(id, 5) - 0.3, fx: 'none' });
  el('path', { d: `M60 ${yA} L160 ${yA} L400 ${yA - 70} L400 ${yA + 70} L160 ${yA} Z`, fill: '#FFF6D8', opacity: 0.25 }, rays);
  el('rect', { x: 400, y: yA - 70, width: 300, height: 140, fill: '#FFF6D8', opacity: 0.22 }, rays);
  const cols = ['#FF4A4A', '#FF9A3C', '#F5E642', '#3EE07A', '#2EC4F0', '#3B5BFF', '#7B3FE4'];
  cols.forEach((c, k) => {
    const y1 = yA - 70 + k * 20, yf = yA - 120 + k * 32;
    el('path', { d: `M820 ${yA - 10 + k * 4} L1080 ${y1} L1320 ${yf}`, stroke: c, 'stroke-width': 5, fill: 'none', opacity: 0.85 }, rays);
  });
  el('path', { d: `M1326 ${yA - 24} L1460 ${yA - 24}`, stroke: '#2EC4F0', 'stroke-width': 7 }, rays);
  T(rays, 1470, yA - 16, '单色光', { size: 24, fill: '#2EC4F0', weight: 700 });
  T(rays, 80, yA - 30, '复合光', { size: 22, fill: C.text });
  const mb = G(P2, { in: at(id, 4) + 0.2 });
  T(mb, 70, 340, '作用：把复合光分解成单色光，并选出任一波长的单色光', { size: 26, maxw: 1200 });
  const pm = G(P2, { in: at(id, 7) });
  card(pm, 1500, 320, 360, 210, { stroke: C.gold });
  T(pm, 1520, 362, '棱镜：折射率随波长不同', { size: 22, fill: C.gold, weight: 700, maxw: 330 });
  T(pm, 1520, 410, '玻璃：350～2000 nm', { size: 24 });
  T(pm, 1520, 452, '石英：185～4000 nm', { size: 24, fill: C.violet, weight: 700 });
  T(pm, 1520, 498, '色散元件也可用光栅', { size: 22, fill: C.muted });

  // sample cell
  const P3 = pane(8, 9);
  [[600, '石英吸收池', '紫外区必须用', C.violet], [1300, '玻璃吸收池', '可见区一般用', C.orange]].forEach(([x, a, b, c], k) => {
    const cg = G(P3, { in: at(id, 8) + k * 1.5, fx: 'scale', ox: x, oy: 560 });
    el('rect', { x: x - 300, y: 552, width: 600, height: 18, fill: k ? '#F5E642' : C.violet, opacity: 0.5 }, cg);
    el('rect', { x: x - 70, y: 400, width: 140, height: 280, rx: 8, fill: 'rgba(91,140,255,.18)', stroke: '#C9D6E3', 'stroke-width': 4 }, cg);
    T(cg, x, 740, a, { size: 32, anchor: 'middle', weight: 700, fill: c });
    T(cg, x, 790, b, { size: 26, anchor: 'middle' });
  });
  T(P3, 960, 360, '样品室放置吸收池（比色皿）及池架附件', { size: 26, anchor: 'middle', fill: C.muted });

  // detector
  const P4 = pane(9, 11);
  el('rect', { x: 140, y: 470, width: 300, height: 18, fill: C.violet, opacity: 0.9 }, P4);
  T(P4, 290, 450, 'I_{0} 入射光', { size: 24, anchor: 'middle', fill: C.violet });
  el('rect', { x: 440, y: 380, width: 120, height: 200, rx: 8, fill: 'rgba(91,140,255,.18)', stroke: '#C9D6E3', 'stroke-width': 3 }, P4);
  T(P4, 500, 620, '吸收池', { size: 22, anchor: 'middle', fill: C.muted });
  el('rect', { x: 560, y: 472, width: 300, height: 14, fill: C.violet, opacity: 0.45 }, P4);
  const tI = G(P4, { in: at(id, 10) + 2.4 });
  T(tI, 710, 450, 'I 透射光', { size: 26, anchor: 'middle', fill: C.gold, weight: 700 });
  el('rect', { x: 860, y: 370, width: 220, height: 220, rx: 14, fill: C.panel2, stroke: C.cyan, 'stroke-width': 2 }, P4);
  T(P4, 970, 470, '检测器', { size: 30, anchor: 'middle', weight: 700 });
  T(P4, 970, 510, '光电效应', { size: 22, anchor: 'middle', fill: C.muted });
  const sig = el('path', { d: 'M1080 480 q15 -30 30 0 t30 0 t30 0 t30 0 t30 0', stroke: C.gold, 'stroke-width': 3, fill: 'none' }, P4);
  D(sig, at(id, 9) + 1.5, 1);
  T(G(P4, { in: at(id, 9) + 1.5 }), 1150, 540, '电信号', { size: 24, anchor: 'middle', fill: C.gold });
  const dl = G(P4, { in: at(id, 10) });
  ['光电池', '光电管', '光电倍增管'].forEach((s, k) => pill(dl, 1300, 380 + k * 80, 300, 56, s, { size: 26 }));
  const em = G(P4, { in: at(id, 10) + 2.4 });
  card(em, 140, 700, 1100, 110, { stroke: C.gold, fill: 'rgba(247,197,72,.06)' });
  T(em, 690, 768, '注意：检测器接收的是 透射光 的强度', { size: 34, anchor: 'middle', fill: C.gold, weight: 700 });

  // display
  const P5 = pane(11, 12);
  card(P5, 560, 380, 800, 300, { stroke: C.cyan, fill: '#050D19' });
  T(P5, 960, 560, 'A = 0.575', { size: 80, anchor: 'middle', fill: C.cyan, weight: 500 });
  ['检流计', '数字显示', '微机：自动控制与结果处理'].forEach((s, k) => pill(G(P5, { in: at(id, 11) + k * 0.8 }), 300 + k * 460 - (k === 2 ? 40 : 0), 760, k === 2 ? 480 : 360, 56, s, { size: 24 }));

  // double beam
  const P6 = pane(12, null);
  const y1 = 430, y2 = 690;
  el('rect', { x: 80, y: 520, width: 180, height: 120, rx: 12, fill: C.panel2, stroke: C.cyanDeep }, P6);
  T(P6, 170, 590, '光源+单色器', { size: 20, anchor: 'middle', maxw: 170 });
  el('rect', { x: 260, y: 572, width: 200, height: 14, fill: C.violet }, P6);
  el('line', { x1: 470, y1: 540, x2: 530, y2: 620, stroke: '#C9D6E3', 'stroke-width': 6 }, P6);
  T(P6, 500, 520, '分束', { size: 20, anchor: 'middle', fill: C.muted });
  el('path', { d: `M500 572 L500 ${y1} L1450 ${y1}`, stroke: C.violet, 'stroke-width': 10, fill: 'none', opacity: 0.8 }, P6);
  el('path', { d: `M500 586 L500 ${y2} L1450 ${y2}`, stroke: C.violet, 'stroke-width': 10, fill: 'none', opacity: 0.8 }, P6);
  [[y1, '样品池'], [y2, '参比池']].forEach(([y, s]) => {
    el('rect', { x: 860, y: y - 70, width: 110, height: 140, rx: 8, fill: 'rgba(91,140,255,.2)', stroke: '#C9D6E3', 'stroke-width': 3 }, P6);
    T(P6, 915, y + 110, s, { size: 24, anchor: 'middle' });
  });
  el('rect', { x: 1450, y: 380, width: 200, height: 360, rx: 14, fill: C.panel2, stroke: C.cyan, 'stroke-width': 2 }, P6);
  T(P6, 1550, 570, '检测器', { size: 28, anchor: 'middle', weight: 700 });
  T(P6, 1550, 610, '两路比较', { size: 22, anchor: 'middle', fill: C.muted });
  T(P6, 960, 340, '双光束分光光度计', { size: 34, anchor: 'middle', weight: 700, fill: C.cyan });
  const db = G(P6, { in: at(id, 12) + 2.5 });
  T(db, 960, 880, '光源波动同时影响两路 → 相互比较后抵消误差', { size: 30, anchor: 'middle', fill: C.gold, weight: 700 });
  T(G(P6, { in: at(id, 12) + 3, cls: 'note' }), 960, 920, '依据：课件 P5 的样品/参比双池示意图与练习第 6 题', { size: 18, fill: C.dim, anchor: 'middle' });
});

/* ================= 9-6 applications ================= */
S.push(function app() {
  const id = 'app', g = sceneGroup(id);
  title(g, id, '9-6 紫外吸收光谱的应用', '课件 P41–44');
  stepLabel(g, 60, 262, [[at(id, 0), '定性 + 定量'], [at(id, 1), '定性分析：能做什么、局限在哪'], [at(id, 4), '定性分析：依据与方法'], [at(id, 7), '定量分析：标准曲线法']]);

  const A = G(g, { in: at(id, 0), out: at(id, 4) - 0.4, fx: 'none' });
  const uses = ['有机化合物鉴定', '同分异构体鉴别', '物质结构推断'];
  uses.forEach((s, k) => pill(G(A, { in: at(id, 1) + k * 0.9 }), 80 + k * 300, 320, 280, 60, s, { size: 25 }));
  // molecule schematic: only chromophore/auxochrome "seen"
  const mg = G(A, { in: at(id, 2), fx: 'none' });
  const nodes = [[240, 560], [340, 500], [440, 560], [440, 680], [340, 740], [240, 680], [560, 500], [680, 560], [800, 500], [140, 500]];
  [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [2, 6], [6, 7], [7, 8], [0, 9]].forEach(([a, b]) => el('line', { x1: nodes[a][0], y1: nodes[a][1], x2: nodes[b][0], y2: nodes[b][1], stroke: C.dim, 'stroke-width': 5 }, mg));
  nodes.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 14, fill: C.dim }, mg));
  const hl = G(mg, { in: at(id, 2) + 1 });
  el('ellipse', { cx: 620, cy: 530, rx: 90, ry: 56, fill: 'rgba(247,197,72,.18)', stroke: C.gold, 'stroke-width': 3 }, hl);
  T(hl, 620, 455, '生色团', { size: 24, fill: C.gold, anchor: 'middle', weight: 700 });
  el('ellipse', { cx: 140, cy: 500, rx: 50, ry: 40, fill: 'rgba(61,213,243,.18)', stroke: C.cyan, 'stroke-width': 3 }, hl);
  T(hl, 140, 445, '助色团', { size: 24, fill: C.cyan, anchor: 'middle', weight: 700 });
  T(G(mg, { in: at(id, 2) + 2 }), 470, 830, '紫外光谱主要反映生色团、助色团，而非整个分子', { size: 26, anchor: 'middle', fill: C.text, maxw: 860 });
  const lim = G(A, { in: at(id, 3) });
  card(lim, 1000, 420, 860, 440, { stroke: C.red });
  T(lim, 1040, 480, '单凭紫外光谱不能完全确定分子结构', { size: 30, fill: C.red, weight: 700, maxw: 800 });
  T(lim, 1040, 540, '必须与其他手段结合：', { size: 26 });
  ['红外光谱 IR', '核磁共振 NMR', '质谱 MS'].forEach((s, k) => pill(lim, 1040 + k * 270, 600, 250, 60, s, { size: 24, stroke: C.gold, fill: C.gold }));

  const B = G(g, { in: at(id, 4), out: at(id, 7) - 0.4, fx: 'none' });
  const crit = ['吸收光谱的形状', '吸收峰的数目', '最大吸收波长位置', '相应的摩尔吸收系数'];
  crit.forEach((s, k) => {
    const cg = G(B, { in: at(id, 4) + k * 0.9, fx: 'scale', ox: 180 + k * 450, oy: 360 });
    card(cg, 70 + k * 450, 310, 420, 100, { stroke: C.cyan });
    T(cg, 280 + k * 450, 372, s, { size: 28, anchor: 'middle', weight: 700, maxw: 390 });
  });
  const ox = 140, oy = 860, cx = l => ox + 20 + l * 760, cy = a => oy - a * 330;
  const unknown = l => gauss(l, 0.35, 0.07, 0.8) + gauss(l, 0.7, 0.06, 0.45) + 0.04;
  const lib = [l => gauss(l, 0.5, 0.1, 0.9) + 0.04, l => gauss(l, 0.3, 0.05, 0.5) + gauss(l, 0.8, 0.08, 0.7) + 0.04, unknown];
  const cmpG = G(B, { in: at(id, 5), fx: 'none' });
  axes(cmpG, ox, oy, 800, 380, 'λ', 'A');
  el('path', { d: curve(unknown, 0, 1, cx, cy), stroke: C.cyan, 'stroke-width': 5, fill: 'none' }, cmpG);
  T(cmpG, 170, 500, '未知纯化合物', { size: 24, fill: C.cyan, weight: 700 });
  const libP = el('path', { stroke: C.gold, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '8 6' }, cmpG);
  const libL = T(cmpG, 600, 500, '', { size: 24, fill: C.gold });
  const ok = G(cmpG, { in: at(id, 5) + 4.6, fx: 'scale', ox: 760, oy: 600 });
  T(ok, 760, 620, '✓ 吻合', { size: 40, fill: C.green, weight: 700, anchor: 'middle' });
  U.push(t => {
    if (t < at(id, 5) || t > at(id, 7)) return;
    const k = Math.min(2, Math.floor((t - at(id, 5)) / 1.6));
    libP.setAttribute('d', curve(lib[k], 0, 1, cx, cy));
    libL.textContent = `已知谱图 ${k + 1}`;
  });
  const sad = G(B, { in: at(id, 6) });
  card(sad, 1040, 520, 820, 330, { stroke: C.gold });
  T(sad, 1070, 580, '光谱比较法', { size: 32, fill: C.gold, weight: 700 });
  T(sad, 1070, 636, '与已知纯化合物的光谱或标准谱图比较', { size: 25, maxw: 770 });
  T(sad, 1070, 700, 'Sadtler 标准谱图库', { size: 28, weight: 700 });
  T(sad, 1070, 746, '《The Sadtler Standard Spectra, Ultraviolet》', { size: 20, fill: C.muted, maxw: 770 });
  T(sad, 1070, 800, '收录约 46000 种化合物的紫外标准谱图', { size: 25, fill: C.cyan, maxw: 770 });

  const Cg = G(g, { in: at(id, 7), fx: 'none' });
  const cs = [0.15, 0.3, 0.45, 0.6, 0.75];
  cs.forEach((c, k) => {
    const vg = G(Cg, { in: at(id, 7) + 0.5 + k * 0.35, fx: 'scale', ox: 150 + k * 140, oy: 500 });
    el('rect', { x: 110 + k * 140, y: 380, width: 80, height: 200, rx: 8, fill: '#3B5BFF', opacity: 0.1 + c * 0.9, stroke: '#C9D6E3', 'stroke-width': 2 }, vg);
    T(vg, 150 + k * 140, 620, `c_{${k + 1}}`, { size: 24, anchor: 'middle', fill: C.muted });
  });
  T(G(Cg, { in: at(id, 7) + 2 }), 430, 680, '一系列不同浓度的标准溶液', { size: 24, anchor: 'middle', fill: C.muted });
  const sx = c => 1060 + c * 900, sy = a => 840 - a * 520;
  axes(G(Cg, { in: at(id, 8) - 0.3 }), 1040, 840, 820, 520, '浓度 c', '吸光度 A');
  cs.forEach((c, k) => {
    const pg = G(Cg, { in: at(id, 8) + 0.8 + k * 0.45, fx: 'scale', ox: sx(c), oy: sy(c) });
    el('circle', { cx: sx(c), cy: sy(c), r: 9, fill: C.gold }, pg);
  });
  T(G(Cg, { in: at(id, 8) + 0.6 }), 1080, 360, '在 λ 最佳处测 A', { size: 24, fill: C.muted });
  D(el('path', { d: `M${sx(0)} ${sy(0)} L${sx(0.85)} ${sy(0.85)}`, stroke: C.cyan, 'stroke-width': 4, fill: 'none' }, Cg), at(id, 8) + 3.2, 0.8);
  const lk = G(Cg, { in: at(id, 9), fx: 'none' });
  const Ax = 0.52;
  D(el('path', { d: `M1040 ${sy(Ax)} H${sx(Ax)}`, stroke: C.red, 'stroke-width': 3, 'stroke-dasharray': '8 6', fill: 'none' }, lk), at(id, 9) + 0.8, 0.6);
  D(el('path', { d: `M${sx(Ax)} ${sy(Ax)} V840`, stroke: C.red, 'stroke-width': 3, fill: 'none', 'marker-end': `url(#${arrowId(C.red)})` }, lk), at(id, 9) + 1.4, 0.6);
  T(G(lk, { in: at(id, 9) + 0.8 }), 1030, sy(Ax) + 8, 'A_{试}', { size: 24, fill: C.red, anchor: 'end', weight: 700 });
  T(G(lk, { in: at(id, 9) + 2 }), sx(Ax), 880, 'c_{试}', { size: 26, fill: C.red, anchor: 'middle', weight: 700 });
  pill(G(Cg, { in: at(id, 9) + 3 }), 110, 740, 360, 56, '完全相同的条件下测定', { size: 24 });
  pill(G(Cg, { in: at(id, 9) + 4 }), 500, 740, 300, 56, '适合大批量样品', { size: 24, stroke: C.gold, fill: C.gold });
  const law = G(Cg, { in: at(id, 10) });
  card(law, 110, 820, 820, 100, { stroke: C.gold, fill: 'rgba(247,197,72,.06)' });
  T(law, 520, 885, 'A = κbc：b 一定时，A ∝ c', { size: 38, anchor: 'middle', fill: C.gold, weight: 700 });
});

/* ================= UV vs AAS ================= */
S.push(function cmp() {
  const id = 'cmp', g = sceneGroup(id);
  title(g, id, '紫外（分子）吸收光谱 vs 原子吸收光谱', '课件 P51–53');
  const L0 = 70, A0 = 340, M0 = 1110, W = 740;
  el('rect', { x: 60, y: 230, width: 1800, height: 60, rx: 10, fill: C.panel2 }, g);
  T(g, A0 + W / 2, 270, '原子吸收光谱', { size: 28, anchor: 'middle', weight: 700, fill: C.violet });
  T(g, M0 + W / 2, 270, '紫外（分子）吸收光谱', { size: 28, anchor: 'middle', weight: 700, fill: C.cyan });
  const row = (y, h, lab, tin, c) => {
    const rg = G(g, { in: tin, fx: 'left' });
    el('rect', { x: 60, y, width: 1800, height: h, rx: 10, fill: C.panel, stroke: C.line }, rg);
    T(rg, L0 + 10, y + h / 2 + 10, lab, { size: 26, weight: 700, fill: c || C.gold, maxw: 250 });
    return rg;
  };
  const same = row(300, 170, '相同点', at(id, 1), C.green);
  T(G(same, { in: at(id, 1) + 0.3 }), A0, 352, '① 都属于吸收光谱：吸收辐射能，发生电子跃迁', { size: 26, maxw: 1480 });
  T(G(same, { in: at(id, 2) }), A0, 402, '② 波长范围都在近紫外到红外区', { size: 26, maxw: 1480 });
  T(G(same, { in: at(id, 2) + 2.2 }), A0, 452, '③ 测量仪器的组成部件类似', { size: 26, maxw: 1480 });
  const r1 = row(480, 90, '吸收机制', at(id, 3));
  T(r1, A0, 535, '原子外层电子跃迁；只有电子能级', { size: 25, maxw: W - 20 });
  T(G(r1, { in: at(id, 5) }), M0, 535, '价电子跃迁，伴随振动、转动能级', { size: 25, maxw: W - 20 });
  const r2 = row(580, 150, '光谱形状', at(id, 4));
  const mini = (x0, w, c, s, tin) => {
    const mg = G(r2, { in: tin });
    el('path', { d: `M${x0} 710 H${x0 + 260}`, stroke: C.muted, 'stroke-width': 2 }, mg);
    el('path', { d: curve(u => Math.exp(-((u - 0.5) ** 2) / (2 * w * w)), 0, 1, u => x0 + u * 260, a => 710 - a * 100, 300), stroke: c, 'stroke-width': 3, fill: 'none' }, mg);
    T(mg, x0 + 290, 650, s[0], { size: 26, weight: 700, fill: c });
    T(mg, x0 + 290, 694, s[1], { size: 22, maxw: 430 });
  };
  mini(A0, 0.006, C.violet, ['线状光谱', '谱线窄：(1–5)×10^{−3} nm'], at(id, 4));
  mini(M0, 0.12, C.cyan, ['带状光谱', '谱线宽：半宽度约 10 nm'], at(id, 5));
  const r3 = row(740, 80, '光源', at(id, 6));
  T(r3, A0, 790, '锐线光源：空心阴极灯', { size: 25, maxw: W - 20 });
  T(r3, M0, 790, '连续光源：钨灯或氘灯', { size: 25, maxw: W - 20 });
  const r4 = row(830, 110, '仪器组成', at(id, 7));
  const chainT = (x, y, items, hlIdx, c, tin) => {
    const cg = G(r4, { in: tin });
    let cx = x;
    items.forEach((s, k) => {
      const w = s.length * 22 + 22;
      el('rect', { x: cx, y: y - 30, width: w, height: 44, rx: 8, fill: k === hlIdx ? 'rgba(247,197,72,.18)' : C.panel2, stroke: k === hlIdx ? C.gold : C.line }, cg);
      T(cg, cx + w / 2, y + 0, s, { size: 20, anchor: 'middle', fill: k === hlIdx ? C.gold : C.text });
      cx += w;
      if (k < items.length - 1) { T(cg, cx + 10, y, '→', { size: 20, fill: C.muted, anchor: 'middle' }); cx += 20; }
    });
  };
  chainT(A0, 892, ['光源', '原子化器', '单色器', '检测器', '数据输出'], 1, C.violet, at(id, 7));
  chainT(M0, 892, ['光源', '单色器', '吸收池', '检测器', '数据输出'], 2, C.cyan, at(id, 8));
});

/* ================= quiz ================= */
S.push(function quiz() {
  const id = 'quiz', g = sceneGroup(id);
  title(g, id, '课堂练习', '课件 P45–50，共 6 题');
  const Q = [
    [1, [2], '紫外-可见光谱产生的原因（ ）', ['分子的振动能级跃迁', '分子的转动能级跃迁', '分子外层电子（伴随振转能级）的能级跃迁', '分子的平均动能'], 2, '外层电子跃迁，同时伴随振动、转动能级变化'],
    [3, [4], '下列电子跃迁中，所需能量最大的是（ ）', ['π→π^{*}', 'n→π^{*}', 'σ→σ^{*}', 'n→σ^{*}'], 2, 'σ→σ^{*} > n→σ^{*} ≥ π→π^{*} > n→π^{*}'],
    [5, [6, 7], '同时有 π→π^{*}、n→π^{*}、σ→σ^{*} 跃迁的是（ ）', ['一氯甲烷', '苯乙酮', '1,3-丁二烯', '甲醇'], 1, '苯环与 C=O 提供 π，O 提供 n，还有 σ 键'],
    [8, [9], '关于可见分光光度计，叙述错误的是（ ）', ['光源是钨灯或卤钨灯', '单色器可采用光栅、棱镜', '吸收池必须使用石英吸收池', '检测器可采用光电管或光电倍增管'], 2, '可见区一般用玻璃池；紫外区才必须用石英池'],
    [10, [11], '紫外分光光度计中，光电倍增管接受的是（ ）', ['入射光的强度', '透射光的强度', '吸收光的强度', '散射光的强度'], 1, '检测器接收透过吸收池的光'],
    [12, [13], '双光束与单光束分光光度计相比，突出优点是（ ）', ['可以扩大波长的应用范围', '可以采用快速响应的检测系统', '可以不需要空白对比', '可以抵消因光源的变化而产生的误差'], 3, '样品光路与参比光路同时测量、相互比较']
  ];
  const ig = G(g, { in: at(id, 0), out: at(id, 1) - 0.3 });
  T(ig, 960, 540, '6 道题：先想一想，再看答案', { size: 52, anchor: 'middle', weight: 700 });
  T(ig, 960, 610, '每题停顿 3 秒，可随时暂停', { size: 26, anchor: 'middle', fill: C.muted });
  Q.forEach(([ql, al, q, opts, ans, why], n) => {
    const nextQ = Q[n + 1] ? at(id, Q[n + 1][0]) - 0.35 : null;
    const qg = G(g, { in: at(id, ql) - 0.2, out: nextQ, od: 0.3, fx: 'left' });
    T(qg, 80, 300, `第 ${n + 1} / 6 题`, { size: 26, fill: C.cyan, weight: 700 });
    T(qg, 80, 370, q, { size: 40, weight: 700, maxw: 1500 });
    opts.forEach((o, k) => {
      const og = el('g', {}, qg);
      const r = el('rect', { x: 80, y: 420 + k * 104, width: 1300, height: 86, rx: 14, fill: C.panel, stroke: C.line, 'stroke-width': 2 }, og);
      el('circle', { cx: 130, cy: 463 + k * 104, r: 24, fill: C.panel2, stroke: C.cyanDeep }, og);
      T(og, 130, 472 + k * 104, 'ABCD'[k], { size: 26, anchor: 'middle', weight: 700 });
      T(og, 180, 474 + k * 104, o, { size: 30, maxw: 1180 });
      U.push(t => {
        const shown = t >= at(id, al[0]) - 0.1;
        const good = k === ans;
        setAttrs(r, { stroke: shown && good ? C.green : C.line, fill: shown && good ? 'rgba(110,231,168,.14)' : C.panel });
        og.setAttribute('opacity', shown && !good ? 0.4 : 1);
      });
    });
    // countdown ring during the thinking pause
    const cd = G(qg, { in: end(id, ql), out: at(id, al[0]) - 0.1, od: 0.2, fx: 'none' });
    el('circle', { cx: 1640, cy: 600, r: 90, fill: 'none', stroke: C.line, 'stroke-width': 12 }, cd);
    const ring = el('circle', { cx: 1640, cy: 600, r: 90, fill: 'none', stroke: C.gold, 'stroke-width': 12, transform: 'rotate(-90 1640 600)', 'stroke-linecap': 'round' }, cd);
    ring.setAttribute('pathLength', 1); ring.setAttribute('stroke-dasharray', '1 1');
    const num = T(cd, 1640, 622, '3', { size: 64, anchor: 'middle', fill: C.gold, weight: 700 });
    T(cd, 1640, 740, '想一想', { size: 28, anchor: 'middle', fill: C.muted });
    U.push(t => {
      const a = end(id, ql), b = at(id, al[0]);
      if (t < a || t > b) return;
      const k = prog(t, a, b - a);
      ring.setAttribute('stroke-dashoffset', k.toFixed(3));
      num.textContent = String(Math.max(1, Math.ceil((b - t))));
    });
    const ag = G(qg, { in: at(id, al[0]), fx: 'scale', ox: 1640, oy: 600 });
    el('circle', { cx: 1640, cy: 560, r: 90, fill: 'rgba(110,231,168,.15)', stroke: C.green, 'stroke-width': 4 }, ag);
    T(ag, 1640, 590, 'ABCD'[ans], { size: 90, anchor: 'middle', fill: C.green, weight: 700 });
    const wg = G(qg, { in: at(id, al[0]) + 0.6 });
    card(wg, 80, 845, 1780, 80, { stroke: C.green, fill: 'rgba(110,231,168,.06)' });
    T(wg, 110, 897, '解析：' + why, { size: 28, fill: C.green, maxw: 1720 });
  });
});

/* ================= summary map ================= */
S.push(function sum() {
  const id = 'sum', g = sceneGroup(id);
  T(G(g, { in: SC[id].t0 + 0.2 }), 60, 150, '全章总结', { size: 44, weight: 700 });
  const links = el('g', {}, g); // connectors sit underneath the cards
  const center = [760, 300, 400, 170];
  const cardsD = [
    ['① 9-1 分子吸收光谱', ['E_{分} = E_{电} + E_{振} + E_{转}', '价电子跃迁 + 振转 → 带状光谱', 'λ_{max}、λ_{min}、肩峰、末端吸收'], [60, 230], C.cyan, 1],
    ['② 9-2 有机物四种跃迁', ['σ→σ^{*} > n→σ^{*} ≥ π→π^{*} > n→π^{*}', 'A = κbc；κ ≥ 10^{4} 强，< 10^{2} 弱', '共轭 → 红移、κ 增大'], [60, 460], C.violet, 2],
    ['③ 9-3 无机物两种跃迁', ['电荷迁移：强吸收，κ_{max} ≥ 10^{4}', '配位场 d–d、f–f：弱吸收，κ_{max} < 100', '六种跃迁总表'], [60, 690], C.orange, 2],
    ['④ 生色团 · 助色团 · 吸收带', ['生色团吸收；助色团增强并红移', 'R 弱（极性↑蓝移）· K 强（共轭，极性↑红移）', 'B 精细结构 · E_{1}/E_{2}（芳香族）'], [1220, 230], C.gold, 3],
    ['⑤ 9-5 分光光度计', ['光源（钨灯 / 氘灯）→ 单色器（棱镜 / 光栅）', '→ 吸收池（紫外用石英）→ 检测器（透射光）→ 显示', '双光束：抵消光源波动误差'], [1220, 460], C.cyan, 4],
    ['⑥ 9-6 应用', ['定性：形状、峰数、λ_{max}、κ；光谱比较法', '须结合 IR、NMR、MS', '定量：A = κbc，标准曲线法'], [1220, 690], C.green, 5]
  ];
  const cg = G(g, { in: SC[id].t0 + 0.3, fx: 'scale', ox: 960, oy: 385 });
  el('rect', { x: center[0], y: center[1], width: center[2], height: center[3], rx: 22, fill: C.panel2, stroke: C.gold, 'stroke-width': 3 }, cg);
  T(cg, 960, 375, '紫外吸收光谱分析', { size: 36, anchor: 'middle', weight: 700, fill: C.gold });
  T(cg, 960, 420, '价电子跃迁 → 吸收 → 结构与含量', { size: 22, anchor: 'middle', fill: C.muted });
  cardsD.forEach(([h, lines, [x, y], c, li], k) => {
    const lk = el('path', { d: `M960 385 C${x < 960 ? 760 : 1160} 385 ${x < 960 ? 720 : 1200} ${y + 100} ${x < 960 ? x + 640 : x} ${y + 100}`, stroke: c, 'stroke-width': 2.5, fill: 'none', opacity: 0.6 }, links);
    D(lk, SC[id].t0 + 0.5 + k * 0.2, 0.6);
    const kg = G(g, { in: SC[id].t0 + 0.6 + k * 0.25, fx: 'scale', ox: x + 320, oy: y + 100 });
    card(kg, x, y, 640, 200, { stroke: c });
    T(kg, x + 24, y + 48, h, { size: 28, fill: c, weight: 700, maxw: 600 });
    lines.forEach((s, j) => T(kg, x + 24, y + 96 + j * 40, s, { size: 21, maxw: 600 }));
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
  const aas = G(g, { in: SC[id].t0 + 2.2 });
  card(aas, 760, 520, 400, 370, { stroke: C.violet });
  T(aas, 960, 566, '与原子吸收比较', { size: 26, anchor: 'middle', weight: 700, fill: C.violet });
  ['同：都是吸收光谱', '原子：线状 · 空心阴极灯', '分子：带状 · 钨灯 / 氘灯', '原子：原子化器在单色器前', '分子：单色器在吸收池前'].forEach((s, k) => T(aas, 790, 616 + k * 52, s, { size: 21, maxw: 350 }));
});
})();
