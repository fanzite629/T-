/* Episode 4: arithmetic instructions and PSW (P54–P74) */
'use strict';
(() => {
const E = window.ENG;
const { C, SC, at, end, el, T, G, D, U, card, pill, arrow, path, bullets, note, cell, regs, mem, bits, code, table, column,
  pointer, sceneGroup, title, prog, setAttrs, lerp, ease } = E;
const S = window.SCENES;
const scene = (id, head, fn) => S.push(() => {
  const g = sceneGroup(id);
  title(g, id, head, E.pagesLabel(SC[id].pages));
  const L = i => at(id, i), Ee = i => end(id, i), F = (i, k) => at(id, i) + (end(id, i) - at(id, i)) * k;
  fn(g, L, Ee, F);
});
const CW = 0.602; // DejaVu Sans Mono advance width (em)
// vertical dashed marker between bit columns (k = number of bit columns from the right edge)
const vline = (g, xr, size, k, y0, y1, col = C.red) => el('path', { d: `M${xr - k * size * CW + 2} ${y0} V${y1}`, stroke: col, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g);
const flagRow = (g, x, y, names, o = {}) => regs(g, x, y, names.map(n => [n, '-']), { w: o.w || 96, h: o.h || 64, gx: o.gx ?? 14, ls: 22, lc: C.gold });

/* ---------------- intro: PSW and CY (P54–P55) ---------------- */
S.push(() => {
  const id = 'intro4', g = sceneGroup(id);
  const L = i => at(id, i), Ee = i => end(id, i);
  const tg = G(g, { in: SC[id].t0, out: L(1) - 0.2 });
  T(tg, 960, 380, '第 4 集', { size: 40, fill: C.cyan, anchor: 'middle' });
  T(tg, 960, 490, '3.5 算术运算指令', { size: 96, anchor: 'middle', weight: 700 });
  ['加法', '减法', '十进制调整', '乘法', '除法'].forEach((s, k) => pill(G(tg, { in: L(0) + 1.5 + k * 0.8 }), 330 + k * 260, 600, 220, 60, `3.5.${k + 1} ${s}`, { size: 24 }));
  const pg = G(g, { in: L(1) });
  title(pg, id, '程序状态字 PSW 各位的意义', 'P54–P55');
  const names = [['CY', '进位位', '#F472B6'], ['AC', '半进位位', '#9BE7F5'], ['F0', '用户标志', '#C4B5FD'], ['RS1', '工作寄存器', '#FDBA74'], ['RS0', '选择位', '#93C5FD'],
    ['OV', '溢出位', '#FDE68A'], ['—', '未定义', '#E5E7EB'], ['P', '奇偶位', '#F0ABFC']];
  names.forEach(([n, d, col], k) => {
    const cg = G(pg, { in: L(2) + (k < 6 ? k * 0.9 : (Ee(2) - L(2)) + (k - 6) * 1.2) });
    const x = 160 + k * 200;
    el('rect', { x, y: 300, width: 190, height: 110, rx: 10, fill: col, opacity: 0.9 }, cg);
    T(cg, x + 95, 372, n, { size: 44, anchor: 'middle', weight: 700, fill: C.bg1, mono: true });
    T(cg, x + 95, 450, `PSW.${7 - k}`, { size: 22, anchor: 'middle', fill: C.muted, mono: true });
    T(cg, x + 95, 495, d, { size: 26, anchor: 'middle', fill: C.text, maxw: 185 });
  });
  const cy = G(g, { in: L(4) });
  card(cy, 160, 560, 1600, 330, { fill: C.panel2, stroke: '#F472B6' });
  T(cy, 190, 620, '★ 高位进位标志 CY（简称 C）', { size: 34, fill: '#F472B6', weight: 700 });
  T(cy, 190, 680, '反映算术运算时，最高位 D7 向更高位有无{g|进位}或{g|借位}', { size: 32, maxw: 1540 });
  const by = G(cy, { in: L(5) });
  T(by, 190, 760, '有 → CY = 1', { size: 36, fill: C.green, weight: 700, mono: true });
  T(by, 700, 760, '无 → CY = 0', { size: 36, fill: C.muted, weight: 700, mono: true });
  T(by, 190, 840, '进位：加法溢出最高位；借位：减法不够减', { size: 28, fill: C.muted });
});

/* ---------------- AC and overflow concept (P56–P57) ---------------- */
scene('acflag', '半进位 AC 与溢出的概念', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(4) - 0.2 });
  T(G(p1, { in: L(0) }), 80, 240, '★ AC：低半字节向高半字节（D3 → D4）有无进位或借位', { size: 32, fill: '#9BE7F5', maxw: 1760 });
  const sz = 44;
  const a1 = G(p1, { in: L(1) });
  column(a1, 700, 360, [{ s: '10101101', in: L(1) }, { s: '+ 10101000', in: L(1) + 0.5 }, { line: true, in: L(1) + 1 }, { s: '1 01010101', in: L(1) + 1.2, fill: C.gold }], { size: sz, lw: 300 });
  vline(a1, 700, sz, 4, 310, 590);
  T(G(a1, { in: L(1) + 2 }), 220, 680, 'D3 → D4 有进位：AC = 1', { size: 32, fill: C.red });
  T(G(a1, { in: L(2) }), 220, 735, '最高位有进位：CY = 1', { size: 32, fill: C.gold });
  const a2 = G(p1, { in: L(3) });
  column(a2, 1560, 360, [{ s: '10100101', in: L(3) }, { s: '- 00011000', in: L(3) + 0.5 }, { line: true, in: L(3) + 1 }, { s: '10001101', in: L(3) + 1.2, fill: C.gold }], { size: sz, lw: 300 });
  vline(a2, 1560, sz, 4, 310, 590);
  T(G(a2, { in: L(3) + 3 }), 1100, 680, 'D3 向 D4 有借位：AC = 1', { size: 32, fill: C.red });
  T(G(a2, { in: L(3) + 5 }), 1100, 735, '最高位无借位：CY = 0', { size: 32, fill: C.gold });
  const p2 = G(g, { in: L(4) });
  T(p2, 80, 240, '★ OV：运算结果是否溢出（有 → 1，无 → 0）', { size: 32, fill: '#FDE68A' });
  const rg = G(p2, { in: L(5) });
  table(rg, 80, 280, [260, 300], [['8 位有符号数', '范围'], ['原码', '−127 ~ +127'], ['反码', '−127 ~ +127'], ['补码', '−128 ~ +127']], { rh: 58, size: 28 });
  T(rg, 80, 560, '超出范围 → 溢出', { size: 30, fill: C.red, weight: 700 });
  const ex = G(p2, { in: L(6) });
  T(ex, 760, 320, '例：120 + 105 = 225', { size: 32, weight: 700 });
  column(ex, 1300, 420, [{ s: '01111000', in: L(6), note: '120' }, { s: '+ 01101001', in: L(6) + 1, note: '105' }, { line: true, in: L(6) + 2 },
    { s: '11100001', in: L(6) + 2.3, fill: C.red, note: '符号位 = 1 → 负数？！' }], { size: sz, lw: 320, nw: 520 });
  const sg = G(p2, { in: L(7) });
  el('rect', { x: 1300 - 8 * sz * CW - 6, y: 420 + 3 * sz * 1.45 - sz * 0.95, width: sz * CW + 10, height: sz * 1.1, rx: 6, fill: 'none', stroke: C.red, 'stroke-width': 3 }, sg);
  const cg = G(p2, { in: L(8) });
  card(cg, 760, 690, 1100, 200, { fill: C.panel2 });
  T(cg, 790, 745, 'C6：D6 → D7 的进位    C7：D7 → 更高位的进位', { size: 28, maxw: 1040 });
  T(cg, 790, 805, '本例：C7 = 0，C6 = 1  →  OV = 1', { size: 34, mono: true, fill: C.gold, weight: 700 });
  T(G(cg, { in: L(9) }), 790, 860, '数值位溢出侵犯符号位，结果错误', { size: 28, fill: C.red });
});

/* ---------------- ranges + complement wheel (P58, P61) ---------------- */
scene('ranges', '溢出判断：三种编码的范围与补码圆环', (g, L, Ee, F) => {
  const rows = [['编码', '范围（8 位）', '表示', '0 的写法'], ['原码', '1111 1111B ~ 0111 1111B', '−127 ~ +127', '00H、80H'], ['反码', '1000 0000B ~ 0111 1111B', '−127 ~ +127', '00H、FFH'], ['补码', '1000 0000B ~ 0111 1111B', '−128 ~ +127', '只有 00H']];
  const tb = table(g, 60, 220, [140, 440, 230, 200], rows, { rh: 70, size: 26, rowIn: [L(0), L(0), L(1), L(2)], colColor: [C.gold] });
  tb.hl(3, 2, L(2) + 2, SC.ranges.t1);
  const ex = G(g, { in: L(0) });
  T(ex, 60, 560, '原码：FFH … 81H, 00H(80H), 01H … 7FH', { size: 24, mono: true, fill: C.muted });
  T(G(g, { in: L(1) }), 60, 610, '反码：80H … FEH, 00H(FFH), 01H … 7FH', { size: 24, mono: true, fill: C.muted });
  T(G(g, { in: L(2) }), 60, 660, '补码：80H … FFH, 00H, 01H … 7FH', { size: 24, mono: true, fill: C.cyan });
  T(G(g, { in: L(2) + 1 }), 60, 700, '      −128 … −1,   0,   1 … 127', { size: 24, mono: true, fill: C.cyan });
  // wheel
  const wg = G(g, { in: L(3) });
  const cx = 1480, cy = 560, r = 270;
  el('circle', { cx, cy, r, fill: 'rgba(91,140,255,.18)', stroke: C.blue, 'stroke-width': 3 }, wg);
  // value v in [-128,127] → angle; 0 at bottom, increasing clockwise toward the right side? choose: positive on right
  const ang = v => Math.PI / 2 - (v / 128) * Math.PI; // 0 → bottom(90deg in svg y-down: sin=1), 128 → top
  const pos = (v, rr) => [cx + rr * Math.cos(ang(v)) * -1, cy + rr * Math.sin(ang(v))];
  [[0, '0'], [1, '1'], [-1, '−1'], [64, '64'], [-64, '−64'], [127, '127'], [-127, '−127'], [-128, '−128']].forEach(([v, s]) => {
    const [x, y] = pos(v === -128 ? 128 : v, r + 40);
    const [x1, y1] = pos(v === -128 ? 128 : v, r - 12), [x2, y2] = pos(v === -128 ? 128 : v, r + 12);
    el('path', { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: C.text, 'stroke-width': 2 }, wg);
    T(wg, x + (v === 127 ? 30 : v === -127 ? -30 : 0), y + 9 + (v === -128 ? -8 : 0), s, { size: 26, anchor: 'middle', mono: true, fill: v === -128 || v === 127 ? C.gold : C.text });
  });
  T(wg, cx + 120, cy + 10, '正数 →', { size: 26, fill: C.green });
  T(wg, cx - 220, cy + 10, '← 负数', { size: 26, fill: C.violet });
  // moving dot: 0 → 127 → wraps to -128
  const dot = el('circle', { r: 16, fill: C.gold, opacity: 0 }, wg);
  const lab = T(wg, cx, cy - 40, '', { size: 34, anchor: 'middle', mono: true, fill: C.gold, weight: 700 });
  U.push(t => {
    if (t < L(3) + 1) { dot.setAttribute('opacity', 0); E.setRich(lab, '', 34); return; }
    let v;
    const k1 = prog(t, L(3) + 1, 4), k2 = prog(t, L(4) + 0.8, 1.4);
    if (t < L(4) + 0.8) v = Math.round(127 * ease(k1));
    else v = k2 < 0.5 ? 127 : -128;
    const [x, y] = pos(v === -128 ? 128 + 0.01 : v, r);
    setAttrs(dot, { cx: x, cy: y, opacity: 1, fill: v === -128 ? C.red : C.gold });
    E.setRich(lab, v === -128 ? '127 + 1 → −128 溢出！' : String(v), 34);
    lab.setAttribute('fill', v === -128 ? C.red : C.gold);
  });
});

/* ---------------- overflow rule (P59–P60) ---------------- */
scene('ovrule', '溢出规律：OV = C7 ⊕ C6', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(4) - 0.2 });
  T(G(p1, { in: L(0) }), 80, 250, '又例：(−3) + (−2) = −5', { size: 36, weight: 700 });
  const tb = table(G(p1, { in: L(1) }), 80, 300, [140, 280, 280], [['', '−3', '−2'], ['原码', '10000011', '10000010'], ['反码', '11111100', '11111101'], ['补码', '11111101', '11111110']], { rh: 62, size: 28, mono: true });
  tb.hl(3, 1, L(2), Ee(3)); tb.hl(3, 2, L(2), Ee(3));
  const sz = 46;
  column(G(p1, { in: L(2) }), 1500, 380, [{ s: '11111101', in: L(2) }, { s: '+ 11111110', in: L(2) + 0.6 }, { line: true, in: L(2) + 1.2 }, { s: '1 11111011', in: L(2) + 1.5, fill: C.green, note: '−5 的补码' }], { size: sz, lw: 360, nw: 300 });
  const dg = G(p1, { in: L(2) + 3 });
  el('path', { d: `M${1500 - 10 * sz * CW - 4} ${380 + 3 * sz * 1.45 + 14} l${sz * CW + 6} -${sz}`, stroke: C.red, 'stroke-width': 4 }, dg);
  T(dg, 1000, 700, '丢掉最高位进位', { size: 26, fill: C.red });
  note(p1, 900, 760, 940, ['C7 = 1，C6 = 1 → OV = 0：无溢出，结果正确'], 'ok', L(3), { size: 30 });
  const p2 = G(g, { in: L(4) });
  const rt = table(p2, 160, 230, [160, 160, 900, 200], [['C7', 'C6', '含义', 'OV'], ['0', '0', '数值位、符号位均无溢出', '0'], ['0', '1', '数值位溢出侵犯符号位', '1'], ['1', '0', '符号位有溢出', '1'], ['1', '1', '均有进位但结果正确', '0']],
    { rh: 76, size: 32, rowIn: [L(4), L(4), L(5), L(6), L(7)], mono: false });
  rt.hl(2, 3, L(5), Ee(5)); rt.hl(3, 3, L(6), Ee(6));
  const fg = G(p2, { in: L(8) });
  card(fg, 160, 640, 1600, 110, { fill: 'rgba(247,197,72,.10)', stroke: C.gold });
  T(fg, 960, 712, 'C7 与 C6 相同 → OV=0；相异 → OV=1：  OV = C7 ⊕ C6', { size: 38, anchor: 'middle', fill: C.gold, weight: 700, maxw: 1560 });
  note(p2, 160, 780, 1600, ['CY 主要用于{g|无符号数}运算，OV 主要用于{g|有符号数}运算'], 'key', L(9), { size: 30 });
});

/* ---------------- P, RS, F0 (P62) ---------------- */
scene('pflag', '奇偶标志 P、RS1/RS0 与 F0', (g, L, Ee, F) => {
  T(G(g, { in: L(0) }), 80, 250, '★ P：A 中 1 的个数   偶数个 → P = 0   奇数个 → P = 1', { size: 34, fill: '#F0ABFC', maxw: 1760 });
  const B1 = bits(G(g, { in: L(1) }), 300, 360, '01000000', { w: 80, h: 70, gap: 8, name: 'A', hex: '40H' });
  T(G(g, { in: L(1) + 1 }), 1200, 405, '1 个 1 → P = 1', { size: 32, fill: C.green, weight: 700 });
  const B2 = bits(G(g, { in: L(1) + 3 }), 300, 500, '00110101', { w: 80, h: 70, gap: 8, name: 'A', hex: '35H' });
  T(G(g, { in: L(1) + 4 }), 1200, 545, '4 个 1 → P = 0', { size: 32, fill: C.muted, weight: 700 });
  for (const [B, s, t] of [[B1, '01000000', L(1) + 0.5], [B2, '00110101', L(1) + 3.5]]) s.split('').forEach((c, k) => { if (c === '1') B.cells[k].focus(t, Ee(1) + 0.5, C.gold); });
  note(g, 80, 640, 860, ['RS1、RS0：切换 Rn 的工作区', '00→0 区  01→1 区  10→2 区  11→3 区'], 'key', L(2), { size: 28 });
  note(g, 980, 640, 860, ['F0：用户标志，', '可视实际需要规定其意义'], 'key', L(3), { size: 28 });
});

/* ---------------- ADD / ADDC (P63) ---------------- */
scene('add', '3.5.1 加法指令 ADD、ADDC 与标志变化', (g, L, Ee, F) => {
  T(G(g, { in: L(0) }), 60, 240, 'ADD  A,源 ; (A)+(源) → A', { size: 30, mono: true, fill: C.cyan });
  T(G(g, { in: L(1) }), 60, 290, 'ADDC A,源 ; (A)+(源)+(C) → A', { size: 30, mono: true, fill: C.cyan });
  T(G(g, { in: L(2) }), 1000, 265, '影响：CY  AC  OV  P', { size: 34, fill: C.gold, weight: 700 });
  const K = code(g, 60, 330, [['MOV A,#05H', ''], ['ADD A,#3BH', ';A=40H'], ['ADD A,#0F5H', ';A=35H'], ['ADDC A,#70H', ';A=A6H']], { w: 700, cw: 220, lh: 64, size: 30 });
  K.step(L(3), 0).step(F(3, 0.3), 1).step(L(6), 2).step(L(8), 3);
  const R = regs(g, 120, 690, [['A', '--']], { w: 200, h: 80 });
  const Fl = flagRow(g, 400, 690, ['CY', 'AC', 'OV', 'P']);
  const C6 = regs(g, 400, 860, [['C6', '-'], ['C7', '-']], { w: 96, h: 50, gx: 14, ls: 20, lc: C.muted });
  R.set(F(3, 0.2), 'A', '05H');
  const sz = 46, xr = 1500;
  const step = (i, rowsS, tin, tout) => {
    const sg = G(g, { in: tin, out: tout, od: 0.25 });
    card(sg, 880, 330, 980, 470, { fill: C.panel2 });
    column(sg, xr, 440, rowsS, { size: sz, lw: 360, nw: 300 });
    vline(sg, xr, sz, 4, 390, 640, C.red);
    vline(sg, xr, sz, 7, 390, 640, C.violet);
    T(sg, xr - 4 * sz * CW - 20, 380, 'D4|D3', { size: 20, fill: C.red, anchor: 'middle' });
    T(sg, xr - 7 * sz * CW - 20, 380, 'D7|D6', { size: 20, fill: C.violet, anchor: 'middle' });
    return sg;
  };
  step(3, [{ s: '00000101', in: L(3), note: '05H' }, { s: '+ 00111011', in: L(3) + 1, note: '3BH' }, { line: true, in: L(3) + 2 }, { s: '01000000', in: L(3) + 2.5, fill: C.gold, note: '40H' }], L(3), L(6) - 0.2);
  step(6, [{ s: '01000000', in: L(6), note: '40H' }, { s: '+ 11110101', in: L(6) + 1, note: 'F5H' }, { line: true, in: L(6) + 2 }, { s: '1 00110101', in: L(6) + 2.5, fill: C.gold, note: '35H' }], L(6), L(8) - 0.2);
  step(8, [{ s: '00110101', in: L(8), note: '35H' }, { s: '+ 01110000', in: L(8) + 1, note: '70H' }, { s: '+        1', in: L(8) + 3, note: 'C', nfill: C.gold }, { line: true, in: L(8) + 4 }, { s: '10100110', in: L(8) + 4.5, fill: C.gold, note: 'A6H' }], L(8), null);
  R.set(F(3, 0.85), 'A', '40H');
  const fl = (t, cy, ac, ov, p, c6, c7) => { Fl.set(t, 'CY', cy).set(t + 0.5, 'AC', ac).set(t + 1, 'OV', ov).set(t + 1.5, 'P', p); C6.set(t + 1, 'C6', c6).set(t + 1, 'C7', c7); };
  fl(L(4), '0', '1', '0', '1', '0', '0');
  Fl.focus(L(4), Ee(4), 'CY'); Fl.focus(F(4, 0.4), Ee(4), 'AC'); Fl.focus(L(5), Ee(5), 'OV'); Fl.focus(F(5, 0.6), Ee(5), 'P');
  R.set(F(6, 0.8), 'A', '35H');
  fl(L(7), '1', '0', '0', '0', '1', '1');
  R.set(F(8, 0.85), 'A', 'A6H');
  fl(L(9), '0', '0', '1', '0', '1', '0');
  Fl.focus(L(10), Ee(10), 'OV', C.red);
  note(g, 880, 830, 980, ['53 + 112 + 1 = 166 > 127 → 有符号溢出'], 'warn', L(10), { size: 28, tag: '⚠ OV=1 的含义' });
});

/* ---------------- INC (P64) ---------------- */
scene('inc', '自增 1 指令 INC', (g, L, Ee, F) => {
  T(G(g, { in: L(0) }), 80, 250, 'INC A ; (A)+1 → A        INC R0 ; (R0)+1 → R0', { size: 32, mono: true, fill: C.cyan, maxw: 1760 });
  note(g, 80, 290, 1760, ['INC 指令{g|不影响} PSW 中的标志位'], 'key', L(1), { size: 30 });
  const dg = G(g, { in: L(3) });
  pill(dg, 80, 440, 400, 46, '演示数据（课件未给出）', { size: 22, stroke: C.violet, fill: C.violet, bg: 'rgba(167,139,250,.1)' });
  const pane = (x, ins, tin, a2, cy2, ac2) => {
    const pg = G(g, { in: tin });
    card(pg, x, 510, 860, 300, { fill: C.panel2 });
    T(pg, x + 30, 570, ins, { size: 34, mono: true, fill: C.gold, weight: 700 });
    const R = regs(pg, x + 60, 650, [['A', 'FFH'], ['CY', '原值'], ['AC', '原值']], { w: 180, h: 70, gx: 40 });
    return R;
  };
  T(G(g, { in: L(2) }), 80, 420, '分别运行：A 都加 1，但 PSW 不同', { size: 30 });
  const R1 = pane(80, 'INC A', L(2), '00H');
  const R2 = pane(980, 'ADD A,#01H', L(2));
  R1.set(L(3) + 3, 'A', '00H');
  R2.set(L(3) + 5, 'A', '00H').set(L(3) + 6, 'CY', '1').set(L(3) + 6.5, 'AC', '1');
  note(g, 80, 840, 1760, ['P 位总随 A 的内容变化；INC 不影响的是 CY、AC、OV 这些运算标志'], 'add', L(4), { size: 28 });
});

/* ---------------- SUBB / DEC (P65–P66) ---------------- */
scene('subb', '3.5.2 减法指令 SUBB 与 DEC', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(6) - 0.2 });
  T(G(p1, { in: L(0) }), 60, 240, 'SUBB A,源 ; (A)−(源)−(C) → A', { size: 32, mono: true, fill: C.cyan });
  T(G(p1, { in: L(1) }), 1000, 240, '影响：CY  AC  OV  P', { size: 32, fill: C.gold, weight: 700 });
  const K = code(G(p1, { in: L(2) }), 60, 290, [['SETB C', ';C=1'], ['MOV A,#73H', ''], ['SUBB A,#86H', ';A=ECH']], { w: 700, cw: 220, lh: 64, size: 30 });
  K.step(L(2), 0).step(F(2, 0.4), 1).step(F(2, 0.7), 2);
  const R = regs(G(p1, { in: L(2) }), 120, 590, [['A', '--']], { w: 200, h: 80 });
  const Fl = flagRow(G(p1, { in: L(2) }), 400, 590, ['CY', 'AC', 'OV', 'P']);
  Fl.set(F(2, 0.15), 'CY', '1'); R.set(F(2, 0.5), 'A', '73H');
  const sz = 46, xr = 1520;
  const cg = G(p1, { in: L(3) });
  card(cg, 880, 290, 980, 470, { fill: C.panel2 });
  column(cg, xr, 390, [{ s: '1 01110011', in: L(3), note: '73H（借 1）' }, { s: '- 10000110', in: L(3) + 1, note: '86H' }, { line: true, in: L(3) + 2 },
    { s: '11101101', in: L(3) + 2.5, note: '' }, { s: '-        1', in: L(3) + 4, note: 'C', nfill: C.gold }, { s: '11101100', in: L(3) + 5, fill: C.gold, note: 'ECH' }], { size: sz, lw: 360, nw: 300 });
  vline(cg, xr, sz, 4, 340, 690, C.red);
  R.set(F(3, 0.9), 'A', 'ECH');
  Fl.set(L(4) + 0.5, 'CY', '1').set(L(4) + 1.5, 'AC', '1').set(L(4) + 2.5, 'OV', '1').set(L(4) + 3.5, 'P', '1');
  note(p1, 60, 720, 780, ['115 − (−122) − 1 = 236 > 127', '→ OV = 1'], 'warn', L(5), { size: 28, tag: '⚠ 为什么 OV=1' });
  const p2 = G(g, { in: L(6) });
  note(p2, 80, 230, 1760, ['减法{r|没有}不带借位的指令：不需要减 C 时，先 {g|CLR C} 再 SUBB'], 'warn', L(6), { size: 32, tag: '⚠ 注意' });
  note(p2, 80, 400, 1760, ['ADD、ADDC、SUBB：加数或被减数必须先存入 {g|A}，结果也在 A'], 'key', L(7), { size: 32 });
  const dg = G(p2, { in: L(8) });
  card(dg, 80, 580, 1760, 200, { fill: C.panel2 });
  T(dg, 110, 650, 'DEC A ; (A)−1 → A', { size: 40, mono: true, fill: C.cyan, weight: 700 });
  T(dg, 110, 730, 'DEC 指定单元内容减 1，结果在原单元；不影响 PSW 标志位', { size: 30, maxw: 1700 });
});

/* ---------------- add/sub worked example (P67–P68) ---------------- */
scene('addsub', '加减法综合举例', (g, L, Ee, F) => {
  const K = code(g, 60, 200, [['MOV R0,#50H', ''], ['MOV A,#55H', ''], ['ADD A,#7FH', ';55+7F=D4 C=0'], ['MOV @R0,A', ';(50H)=D4H'], ['INC R0', ';R0=51H'], ['ADD A,#70H', ';D4+70=144 C=1'],
    ['MOV @R0,A', ';(51H)=44H'], ['INC R0', ';R0=52H'], ['ADDC A,#22H', ';44+22+1=67 C=0'], ['MOV @R0,A', ';(52H)=67H'], ['INC R0', ';R0=53H'], ['SUBB A,#89H', ';67-89=DE C=1'],
    ['MOV @R0,A', ';(53H)=DEH'], ['INC R0', ';R0=54H'], ['SUBB A,#0AFH', ';DE-AF-1=2E C=0'], ['MOV @R0,A', ';(54H)=2EH']], { w: 860, cw: 400, lh: 45, size: 25 });
  const R = regs(g, 1000, 250, [['R0', '--'], ['A', '--'], ['C', '-']], { w: 170, h: 70, gx: 30 });
  const M = mem(g, 1000, 440, [['50H', '--'], ['51H', '--'], ['52H', '--'], ['53H', '--'], ['54H', '--']], { w: 170, h: 58, gap: 10, aw: 90, title: '片内 RAM' });
  const ptr = G(g, { in: L(1) });
  K.step(L(1), 0).step(F(1, 0.5), 1);
  R.set(F(1, 0.3), 'R0', '50H').set(F(1, 0.8), 'A', '55H');
  K.step(L(2), 2).step(F(2, 0.7), 3);
  R.set(F(2, 0.4), 'A', 'D4H').set(F(2, 0.55), 'C', '0'); M.set(F(2, 0.9), '50H', 'D4H');
  K.step(L(3), 4).step(F(3, 0.2), 5).step(F(3, 0.75), 6);
  R.set(F(3, 0.15), 'R0', '51H').set(F(3, 0.55), 'A', '44H').set(F(3, 0.6), 'C', '1'); M.set(F(3, 0.9), '51H', '44H');
  K.step(L(4), 7).step(F(4, 0.2), 8).step(F(4, 0.8), 9);
  R.set(F(4, 0.15), 'R0', '52H').set(F(4, 0.65), 'A', '67H').set(F(4, 0.7), 'C', '0'); M.set(F(4, 0.92), '52H', '67H');
  K.step(L(5), 10).step(F(5, 0.2), 11).step(F(5, 0.75), 12).step(F(5, 0.9), 13);
  R.set(F(5, 0.12), 'R0', '53H').set(F(5, 0.6), 'A', 'DEH').set(F(5, 0.62), 'C', '1'); M.set(F(5, 0.8), '53H', 'DEH'); R.set(F(5, 0.95), 'R0', '54H');
  K.step(L(6), 14).step(F(6, 0.85), 15).off(L(7));
  R.set(F(6, 0.6), 'A', '2EH').set(F(6, 0.7), 'C', '0'); M.set(F(6, 0.95), '54H', '2EH');
  R.focus(L(7), Ee(7), 'C', C.gold);
  note(g, 1000, 790, 860, ['INC R0、MOV @R0,A 不影响 C：', 'ADDC/SUBB 用的 C 来自前一条加减法'], 'key', L(7), { size: 26, out: L(8) - 0.2 });
  note(g, 1000, 790, 860, ['50H~54H：D4H、44H、67H、DEH、2EH', '与课件 P67–P68 一致'], 'ok', L(8), { size: 26 });
});

/* ---------------- DA A (P69–P71) ---------------- */
scene('da', '3.5.3 十进制加法调整 DA A', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(9) - 0.2 });
  T(G(p1, { in: L(0) }), 60, 240, 'DA A ：BCD 码相加后的十进制调整', { size: 34, fill: C.cyan });
  const sz = 44, xr = 700;
  const eg = G(p1, { in: L(1) });
  T(eg, 60, 310, '例 1：96 + 89 = 185', { size: 32, weight: 700 });
  column(eg, xr, 400, [{ s: '10010110', in: L(2), note: '96' }, { s: '+ 10001001', in: L(2) + 0.6, note: '89' }, { line: true, in: L(2) + 1.2 },
    { s: '1 00011111', in: L(2) + 1.5, fill: C.red, note: '1111 不是十进制数字！' }, { s: '+ 01100110', in: L(5) + 1, note: '加 66H', nfill: C.green }, { line: true, in: L(6) },
    { s: '1 10000101', in: L(6) + 0.5, fill: C.green, note: 'CY=1，A=85H → 185' }], { size: sz, lw: 330, nw: 420 });
  vline(eg, xr, sz, 4, 350, 720, C.red);
  const rg = G(p1, { in: L(3) });
  card(rg, 1240, 280, 620, 420, { fill: C.panel2, stroke: C.gold });
  T(rg, 1265, 335, '调整原则', { size: 32, fill: C.gold, weight: 700 });
  T(rg, 1265, 395, '① 以半字节为单位，过 9 加 6 或 60H', { size: 26, maxw: 580 });
  const r2 = G(rg, { in: L(4) });
  T(r2, 1265, 455, '② AC = 1 → 低半字节加 6', { size: 26, maxw: 580 });
  T(r2, 1265, 515, '③ CY = 1 → 高半字节加 60H', { size: 26, maxw: 580 });
  T(r2, 1265, 575, '④ AC = 1 且 CY = 1 → 加 66H', { size: 26, maxw: 580 });
  T(G(rg, { in: L(5) }), 1265, 650, '本例：低 4 位 > 9，CY=1 → +66H', { size: 26, fill: C.green, maxw: 580 });
  const p2 = G(g, { in: L(7), out: L(9) - 0.2 });
  card(p2, 60, 740, 1800, 180, { fill: 'rgba(6,14,28,.97)', stroke: C.cyan });
  T(p2, 90, 795, '例 2：19 + 58 = 77   MOV A,#19H / ADD A,#58H / DA A / MOV 50H,A', { size: 28, mono: true, maxw: 1740 });
  T(p2, 90, 850, '00011001 + 01011000 = 01110001 (71H)，AC=1', { size: 28, mono: true, fill: C.text, maxw: 1740 });
  T(G(p2, { in: L(8) }), 90, 900, '+ 00000110 → 01110111 (77H)，(50H) = 77H', { size: 28, mono: true, fill: C.green, maxw: 1740 });
  const p3 = G(g, { in: L(9) });
  bullets(p3, 80, 280, [
    ['① 只能用在{g|加法}指令之后，减法结果不能调整', L(9)],
    ['② 依据 A 的原始值和 PSW 状态，对 A 加 06H、60H 或 66H', L(10)],
    ['③ 两个加数都必须是{g|压缩 BCD 码}；不是把任意二进制/十六进制和变成十进制', L(11)],
    ['④ 两个压缩 BCD 码按二进制相加后，必须经 DA A 才得到 BCD 和', L(12)]
  ], { size: 32, gap: 110, maxw: 1700 });
});

/* ---------------- MUL AB (P72–P73) ---------------- */
scene('mul', '3.5.4 乘法指令 MUL AB', (g, L, Ee, F) => {
  T(G(g, { in: L(0) }), 60, 240, 'MUL AB   （51 系列只有无符号乘除法）', { size: 34, mono: true, fill: C.cyan });
  const ig = G(g, { in: L(1) });
  T(ig, 60, 300, 'A × B → 16 位积：低 8 位 → A，高 8 位 → B', { size: 30 });
  T(G(g, { in: L(2) }), 60, 350, 'B = 0（积 ≤ 8 位）→ OV=0，否则 OV=1；CY=0；AC 不变', { size: 30, fill: C.gold, maxw: 1760 });
  const ex = (x, ins, tin, a0, b0, a1, b1, ov, prodTxt, tres) => {
    const pg = G(g, { in: tin });
    card(pg, x, 400, 860, 500, { fill: C.panel2 });
    T(pg, x + 30, 455, ins, { size: 30, weight: 700, maxw: 800 });
    const R = regs(pg, x + 60, 540, [['A', '--'], ['B', '--']], { w: 180, h: 70, gx: 40 });
    const Fl = flagRow(pg, x + 500, 540, ['OV', 'CY'], { w: 100 });
    R.set(tin + 2, 'A', a0).set(tin + 3, 'B', b0);
    R.set(tres, 'A', a1).set(tres, 'B', b1);
    Fl.set(tres + 0.5, 'OV', ov).set(tres + 0.5, 'CY', '0');
    T(G(pg, { in: tres }), x + 60, 720, prodTxt, { size: 30, mono: true, fill: C.green, maxw: 780 });
    T(G(pg, { in: tres }), x + 60, 780, '高 8 位 → B ┃ 低 8 位 → A', { size: 26, fill: C.muted });
    return Fl;
  };
  ex(60, '例：16 × 9 = 144   MOV A,#10H / MOV B,#09H', L(3), '10H', '09H', '90H', '00H', '0', '积 = 0090H（144）', L(4));
  const Fl2 = ex(1000, '例：80 × 160 = 12800   MOV A,#50H / MOV B,#0A0H', L(5), '50H', 'A0H', '00H', '32H', '1', '积 = 3200H（12800）', L(6));
  Fl2.focus(L(6) + 3, Ee(6) + 0.5, 'OV', C.red);
});

/* ---------------- DIV AB (P73–P74) ---------------- */
scene('div', '3.5.5 除法指令 DIV AB', (g, L, Ee, F) => {
  T(G(g, { in: L(0) }), 60, 240, 'DIV AB ; A ÷ B：商（整数部分）→ A，余数 → B', { size: 32, mono: true, fill: C.cyan, maxw: 1760 });
  note(g, 60, 280, 1760, ['运行后 CY = 0；B = 0 为非法除法：商不定，OV = 1；B ≠ 0 时 OV = 0'], 'key', L(1), { size: 30 });
  const pg = G(g, { in: L(2) });
  card(pg, 60, 440, 1800, 430, { fill: C.panel2 });
  T(pg, 90, 500, '例：251 ÷ 18 = 13 余 17', { size: 34, weight: 700 });
  T(pg, 90, 560, 'MOV A,#251 ; FBH      MOV B,#18 ; 12H      DIV AB', { size: 30, mono: true, fill: C.gold });
  const R = regs(pg, 160, 670, [['A', '--'], ['B', '--']], { w: 200, h: 80, gx: 60 });
  const Fl = flagRow(pg, 760, 670, ['OV', 'CY'], { w: 110 });
  R.set(L(2) + 4, 'A', 'FBH').set(L(2) + 6, 'B', '12H');
  R.set(F(3, 0.3), 'A', '0DH').set(F(3, 0.5), 'B', '11H');
  Fl.set(F(3, 0.75), 'OV', '0').set(F(3, 0.75), 'CY', '0');
  T(G(pg, { in: F(3, 0.3) }), 1100, 715, 'A = 0DH = 13（商）', { size: 32, fill: C.green, mono: true });
  T(G(pg, { in: F(3, 0.5) }), 1100, 775, 'B = 11H = 17（余数）', { size: 32, fill: C.green, mono: true });
  pill(G(g, { in: L(4) }), 60, 890, 640, 56, '下一集：3.6 控制转移指令 →', { size: 28 });
});
})();
