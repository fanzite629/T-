/* Episode 3: logic instructions (P42–P53) */
'use strict';
(() => {
const E = window.ENG;
const { C, SC, at, end, el, T, G, D, U, card, pill, arrow, path, bullets, note, cell, regs, mem, bits, code, table, column,
  pointer, sceneGroup, title, prog, setAttrs } = E;
const S = window.SCENES;
const scene = (id, head, fn) => S.push(() => {
  const g = sceneGroup(id);
  title(g, id, head, E.pagesLabel(SC[id].pages));
  const L = i => at(id, i), Ee = i => end(id, i), F = (i, k) => at(id, i) + (end(id, i) - at(id, i)) * k;
  fn(g, L, Ee, F);
});
const bin = (v) => v.toString(2).padStart(8, '0');
const hex = (v) => (v >= 0xA0 ? '0' : '') + v.toString(16).toUpperCase().padStart(2, '0') + 'H';

/* ---------------- intro + logic rules (P42–P44) ---------------- */
S.push(() => {
  const id = 'intro3', g = sceneGroup(id);
  const L = i => at(id, i);
  const tg = G(g, { in: SC[id].t0, out: L(1) - 0.2 });
  T(tg, 960, 380, '第 3 集', { size: 40, fill: C.cyan, anchor: 'middle' });
  T(tg, 960, 490, '3.4 逻辑运算指令', { size: 96, anchor: 'middle', weight: 700 });
  ['3.4.1 对累加器 A 的逻辑操作', '3.4.2 双操作数逻辑运算', '3.4.3 位逻辑操作'].forEach((s, k) =>
    pill(G(tg, { in: L(0) + 1.5 + k * 1.6 }), 260 + k * 480, 600, 440, 60, s, { size: 26 }));
  title(G(g, { in: L(1) }), id, '3.4 逻辑运算：四种运算法则', 'P42–P44');
  const gates = [
    ['与（逻辑乘）', 'Z = A × B = A ∧ B', '&', [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]], '全 1 才出 1', L(2)],
    ['或（逻辑加）', 'Z = A + B = A ∨ B', '≥1', [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]], '有 1 就出 1', L(3)],
    ['异或', 'Z = A ⊕ B', '=1', [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]], '相同出 0，相异出 1', L(4)],
    ['非（求反）', 'Z = A̅', '1', [[0, '', 1], [1, '', 0]], '0 变 1，1 变 0', L(5)]
  ];
  gates.forEach(([nm, f, sym, tt, rule, t], k) => {
    const cg = G(g, { in: t });
    const x = 70 + k * 455;
    card(cg, x, 210, 430, 600, { fill: C.panel2 });
    T(cg, x + 215, 260, nm, { size: 32, anchor: 'middle', weight: 700, fill: C.cyan });
    T(cg, x + 215, 305, f, { size: 26, anchor: 'middle', mono: true, fill: C.gold });
    el('rect', { x: x + 160, y: 330, width: 110, height: 110, rx: 8, fill: 'none', stroke: C.text, 'stroke-width': 3 }, cg);
    T(cg, x + 215, 398, sym, { size: 34, anchor: 'middle', weight: 700 });
    el('path', { d: `M${x + 100} ${k === 3 ? 385 : 360} H${x + 160} ${k === 3 ? '' : `M${x + 100} 410 H${x + 160}`} M${x + 270} 385 H${x + 330}`, stroke: C.text, 'stroke-width': 3 }, cg);
    if (k === 3) el('circle', { cx: x + 278, cy: 385, r: 7, fill: C.panel2, stroke: C.text, 'stroke-width': 3 }, cg);
    const rows = [[k === 3 ? 'A' : 'A', k === 3 ? '' : 'B', 'Z'], ...tt.map(r => r.map(String))];
    table(cg, x + 65, 470, [100, 100, 100], rows, { rh: 46, size: 26, mono: true });
    T(cg, x + 215, 470 + rows.length * 46 + 50, rule, { size: 28, anchor: 'middle', fill: C.green, maxw: 400 });
  });
  note(g, 70, 840, 1780, ['8 位数据的逻辑运算 = 8 个位各自运算，位与位之间{g|没有进位}'], 'add', L(6), { size: 28 });
});

/* ---------------- 3.4.1 CPL / CLR / rotates (P45–P46) ---------------- */
scene('accops', '3.4.1 对 A 的逻辑操作：CPL、CLR 与移位', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(2) - 0.2 });
  T(G(p1, { in: L(0) }), 100, 250, 'CPL A  ; A 按位求反          CLR A  ; A 清 0', { size: 34, mono: true, fill: C.cyan, maxw: 1700 });
  const dg = G(p1, { in: L(1) });
  pill(dg, 100, 300, 360, 46, '演示数据（课件未给出）', { size: 22, stroke: C.violet, fill: C.violet, bg: 'rgba(167,139,250,.1)' });
  const B = bits(dg, 360, 460, '11100010', { w: 90, h: 80, gap: 10, name: 'A', hex: '0E2H' });
  B.set(F(1, 0.45), '00011101', '1DH');
  B.set(F(1, 0.85), '00000000', '00H');
  T(G(dg, { in: F(1, 0.45) }), 360, 640, 'CPL A → 00011101B = 1DH', { size: 30, mono: true, fill: C.gold });
  T(G(dg, { in: F(1, 0.85) }), 360, 700, 'CLR A → 00000000B = 00H', { size: 30, mono: true, fill: C.gold });
  // four rotate diagrams
  const rot = (x, y, name, withC, dir, tin) => {
    const rg = G(g, { in: tin });
    card(rg, x, y, 860, 290, { fill: C.panel2 });
    T(rg, x + 25, y + 50, name, { size: 36, mono: true, weight: 700, fill: C.gold });
    const bx = x + (withC ? 250 : 160), by = y + 110, bw = 54;
    if (withC) {
      el('rect', { x: x + 120, y: by, width: 70, height: 60, rx: 8, fill: 'rgba(247,197,72,.15)', stroke: C.gold, 'stroke-width': 2 }, rg);
      T(rg, x + 155, by + 40, 'C', { size: 30, anchor: 'middle', fill: C.gold, weight: 700, mono: true });
    }
    for (let k = 0; k < 8; k++) {
      el('rect', { x: bx + k * (bw + 4), y: by, width: bw, height: 60, rx: 6, fill: C.bg0, stroke: C.line, 'stroke-width': 2 }, rg);
      T(rg, bx + k * (bw + 4) + bw / 2, by + 40, String(7 - k), { size: 24, anchor: 'middle', fill: C.muted, mono: true });
    }
    const right = bx + 8 * (bw + 4) - 4, left = withC ? x + 120 : bx;
    const lo = by + 60, col = withC ? C.cyan : C.green;
    // inner shift arrow
    if (dir === 'R') D(arrow(rg, bx + 20, by - 18, right - 20, by - 18, col, 3), tin + 0.4, 0.6);
    else D(arrow(rg, right - 20, by - 18, bx + 20, by - 18, col, 3), tin + 0.4, 0.6);
    // wrap-around loop
    const d = dir === 'R' ? `M${right - 10} ${lo} V${lo + 50} H${left + 10} V${lo + 8}` : `M${left + 10} ${lo} V${lo + 50} H${right - 10} V${lo + 8}`;
    D(path(rg, d, col, 3), tin + 0.8, 0.9);
    let txt = '';
    if (name.startsWith('RRC')) txt = 'D0 → C，原 C → D7（9 位循环）';
    else if (name.startsWith('RR')) txt = 'D0 → D7（8 位循环）';
    else if (name.startsWith('RLC')) txt = 'D7 → C，原 C → D0（9 位循环）';
    else txt = 'D7 → D0（8 位循环）';
    T(rg, x + 330, y + 50, txt, { size: 26, fill: C.text, maxw: 510 });
  };
  rot(60, 210, 'RR A', false, 'R', L(3));
  rot(1000, 210, 'RRC A', true, 'R', L(4));
  rot(60, 530, 'RL A', false, 'L', L(5));
  rot(1000, 530, 'RLC A', true, 'L', L(6));
  const mg = G(g, { in: L(7) });
  card(mg, 60, 845, 1800, 80, { fill: 'rgba(6,14,28,.95)', stroke: C.gold });
  T(mg, 90, 897, '{g|R}=循环 Recycle · 第 2 字母 {g|L}左/{g|R}右 · 第 3 字母 {g|C}=连同 C 共 9 位', { size: 32, maxw: 1740 });
});

/* ---------------- rotate example (P47) ---------------- */
scene('rotex', '移位举例：从 E2H 开始逐条执行', (g, L, Ee, F) => {
  const K = code(g, 60, 220, [['CLR C', ';C=0'], ['MOV A,#0E2H', ';11100010  E2H'], ['RL A', ';11000101  C5H'], ['RLC A', ';10001010  C=1'], ['RR A', ';01000101  45H'],
    ['RRC A', ';10100010  C=1'], ['SWAP A', ';00101010  2AH']], { w: 760, cw: 380, lh: 66, size: 30 });
  K.step(F(1, 0.05), 0).step(F(1, 0.5), 1).step(L(2), 2).step(L(3), 3).step(L(4), 4).step(L(5), 5).step(L(6), 6).off(L(7));
  const B = bits(g, 960, 330, '--------', { w: 82, h: 82, gap: 8, carry: '-', cname: 'C', hex: '--' });
  B.setC(F(1, 0.2), 0);
  B.set(F(1, 0.75), '11100010', 'E2H');
  const steps = [
    [2, '11000101', 'C5H', null, 'RL：D7 的 1 → D0'],
    [3, '10001010', '8AH', 1, 'RLC：D7 的 1 → C，C 的 0 → D0'],
    [4, '01000101', '45H', null, 'RR：D0 的 0 → D7'],
    [5, '10100010', 'A2H', 1, 'RRC：D0 的 1 → C，C 的 1 → D7'],
    [6, '00101010', '2AH', null, 'SWAP：1010 ↔ 0010']
  ];
  steps.forEach(([i, v, h, c, txt], k) => {
    const t = F(i, 0.55);
    B.set(t, v, h);
    if (c != null) B.setC(t, c);
    const lg = G(g, { in: L(i), out: steps[k + 1] ? L(steps[k + 1][0]) - 0.1 : null, od: 0.2 });
    T(lg, 960, 520, txt, { size: 32, fill: C.gold, weight: 600, maxw: 900 });
  });
  const ag = G(g, { in: L(2) });
  const hist = [['E2H', '—', ''], ['C5H', '0', 'RL'], ['8AH', '1', 'RLC'], ['45H', '1', 'RR'], ['A2H', '1', 'RRC'], ['2AH', '1', 'SWAP']];
  const tb = table(ag, 960, 600, [200, 220, 200], [['指令', 'A', 'C'], ...hist.map(([a, c, n]) => [n || 'MOV', a, c])],
    { rh: 44, size: 24, mono: true, rowIn: [L(2), L(1), L(2), L(3), L(4), L(5), L(6)] });
  note(g, 60, 720, 760, ['课件 P47 各行结果逐位核对：全部正确'], 'ok', L(7), { size: 28 });
});

/* ---------------- 3.4.2 ANL / ORL / XRL (P48–P49) ---------------- */
scene('dualops', '3.4.2 双操作数逻辑运算 ANL、ORL、XRL', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(3) - 0.2 });
  T(G(p1, { in: L(0) }), 140, 300, 'ANL / ORL / XRL   第一操作数, 第二操作数', { size: 40, mono: true, fill: C.cyan, maxw: 1650 });
  const og = G(p1, { in: L(1) });
  [['ANL', '与', C.gold], ['ORL', '或', C.green], ['XRL', '异或（Exclusive-OR）', C.violet]].forEach(([a, b, col], k) => {
    card(og, 140 + k * 560, 370, 520, 120, { fill: C.panel2, stroke: col });
    T(og, 170 + k * 560, 445, a, { size: 44, mono: true, weight: 700, fill: col });
    T(og, 300 + k * 560, 445, b, { size: 32, maxw: 340 });
  });
  note(p1, 140, 560, 1640, ['结果存放在{g|第一操作数}指出的地址'], 'key', L(2), { size: 34 });
  const p2 = G(g, { in: L(3) });
  const K = code(p2, 60, 210, [['MOV A,#46H', ';01000110'], ['MOV 40H,#59H', ';01011001'], ['ANL A,#37H', ';A=06H'], ['ORL 40H,A', ';(40H)=5FH'], ['ORL A,40H', ';A=5FH'], ['XRL A,#55H', ';A=0AH']],
    { w: 760, cw: 300, lh: 64, size: 30 });
  K.step(F(3, 0.1), 0).step(F(3, 0.55), 1).step(L(4), 2).step(L(5), 3).step(L(6), 4).step(L(7), 5).off(L(8));
  const R = regs(p2, 120, 680, [['A', '--']], { w: 200, h: 80 });
  const M = mem(p2, 380, 640, [['40H', '--']], { w: 200, h: 80, aw: 80, title: '片内 RAM' });
  R.set(F(3, 0.3), 'A', '46H'); M.set(F(3, 0.8), '40H', '59H');
  const ops = [
    [4, 0x46, 0x37, 0x46 & 0x37, 'AND', 'A', '#37H', 'A'],
    [5, 0x59, 0x06, 0x59 | 0x06, 'OR', '(40H)', 'A', '40H'],
    [6, 0x06, 0x5F, 0x06 | 0x5F, 'OR', 'A', '(40H)', 'A'],
    [7, 0x5F, 0x55, 0x5F ^ 0x55, 'XOR', 'A', '#55H', 'A']
  ];
  ops.forEach(([i, a, b, r, op, na, nb, dst], k) => {
    const og2 = G(p2, { in: L(i), out: k < 3 ? L(ops[k + 1][0]) - 0.15 : null, od: 0.2 });
    card(og2, 900, 210, 960, 420, { fill: C.panel2 });
    const sym = { AND: '∧', OR: '∨', XOR: '⊕' }[op];
    T(og2, 930, 260, `${na} ${sym} ${nb}`, { size: 30, fill: C.cyan, mono: true });
    const rowY = [330, 400, 500];
    const vals = [a, b, r];
    vals.forEach((v, j) => {
      const g3 = G(og2, { in: L(i) + (j === 2 ? 1.6 : j * 0.5) });
      const s = bin(v);
      for (let q = 0; q < 8; q++) {
        const on = s[q] === '1';
        el('rect', { x: 1050 + q * 62, y: rowY[j] - 42, width: 56, height: 56, rx: 6, fill: j === 2 ? (on ? 'rgba(110,231,168,.25)' : C.bg0) : C.bg0, stroke: j === 2 ? C.green : C.line, 'stroke-width': 2 }, g3);
        T(g3, 1078 + q * 62, rowY[j] - 4, s[q], { size: 30, anchor: 'middle', mono: true, weight: 700, fill: j === 2 ? C.green : C.text });
      }
      T(g3, 1040, rowY[j] - 4, j === 1 ? sym : '', { size: 34, anchor: 'end', fill: C.gold });
      T(g3, 1560, rowY[j] - 4, hex(v), { size: 30, mono: true, fill: j === 2 ? C.green : C.muted });
    });
    el('rect', { x: 1050, y: 440, width: 8 * 62 - 6, height: 3, fill: C.muted }, og2);
    T(G(og2, { in: L(i) + 2 }), 930, 600, `结果 → ${dst === 'A' ? 'A' : '40H 单元'}（第一操作数）`, { size: 28, fill: C.gold });
  });
  R.set(F(4, 0.8), 'A', '06H'); M.set(F(5, 0.8), '40H', '5FH'); R.set(F(6, 0.8), 'A', '5FH'); R.set(F(7, 0.8), 'A', '0AH');
  R.focus(L(5), Ee(5), 'A', C.cyan); M.focus(L(6), Ee(6), '40H', C.cyan);
  note(p2, 900, 660, 960, ['结果在第一操作数（目的）中，第二操作数不变；', '目的操作数只能是 A 或 direct'], 'key', L(8), { size: 28 });
});

/* ---------------- masks, set bits, invert bits (P50–P51) ---------------- */
scene('masks', '逻辑运算的用途：掩码、置位、取反', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(7) - 0.2 });
  T(G(p1, { in: L(1) }), 80, 250, 'MOV A,#0F6H   ; A = 11110110（有符号数）', { size: 32, mono: true, fill: C.cyan });
  const row = (y, mask, res, lab, i) => {
    const rg = G(p1, { in: L(i) });
    T(rg, 80, y + 42, `ANL A,#${mask}`, { size: 30, mono: true, fill: C.gold, weight: 700 });
    const sm = bin(parseInt(mask, 16)), sr = bin(res), sa = bin(0xF6);
    for (let q = 0; q < 8; q++) {
      const keep = sm[q] === '1';
      el('rect', { x: 420 + q * 52, y, width: 46, height: 56, rx: 6, fill: keep ? 'rgba(61,213,243,.18)' : 'rgba(255,255,255,.02)', stroke: C.line }, rg);
      T(rg, 443 + q * 52, y + 38, sm[q], { size: 26, anchor: 'middle', mono: true, fill: keep ? C.cyan : C.dim });
      el('rect', { x: 900 + q * 52, y, width: 46, height: 56, rx: 6, fill: keep ? 'rgba(110,231,168,.2)' : 'rgba(255,255,255,.02)', stroke: C.line }, rg);
      T(rg, 923 + q * 52, y + 38, sr[q], { size: 26, anchor: 'middle', mono: true, fill: keep ? C.green : C.dim, weight: 700 });
    }
    T(rg, 860, y + 38, '→', { size: 30, anchor: 'middle', fill: C.muted });
    T(rg, 1340, y + 38, `A = ${hex(res)}`, { size: 30, mono: true, fill: C.green, weight: 700 });
    T(rg, 1540, y + 38, lab, { size: 28, maxw: 320 });
  };
  const base = G(p1, { in: L(1) });
  T(base, 420, 300, '掩码', { size: 22, fill: C.muted }); T(base, 900, 300, '结果（各自由 F6H 算起）', { size: 22, fill: C.muted });
  row(320, '0FH', 0xF6 & 0x0F, '① 屏蔽高 4 位', 2);
  row(410, '7FH', 0xF6 & 0x7F, '② 屏蔽符号位', 3);
  row(500, '80H', 0xF6 & 0x80, '③ 切取符号位', 4);
  note(p1, 80, 600, 1760, ['课件三个结果均由 F6H 分别算出；若连续执行：② 得 06H，③ 得 00H。按三个独立例子理解'], 'warn', L(5), { size: 26 });
  note(p1, 80, 740, 1760, ['掩码中为 1 的位{n|保留}，为 0 的位{r|清掉}：不同掩码 → 屏蔽不同部分'], 'key', L(6), { size: 28 });
  const p2 = G(g, { in: L(7) });
  const xr = (y, op, tin, res, col, lab) => {
    const rg = G(p2, { in: tin });
    card(rg, 60, y, 1800, 300, { fill: C.panel2, stroke: col });
    T(rg, 90, y + 55, op, { size: 34, mono: true, fill: col, weight: 700 });
    T(rg, 90, y + 100, lab, { size: 26, fill: C.muted });
    const rowsB = [['P1', 'xxxxxxxx'], ['', '00110011'], ['P1', res]];
    rowsB.forEach(([nm, s], j) => {
      const yy = y + 60 + j * 74;
      T(rg, 860, yy + 40, j === 1 ? (op.startsWith('ORL') ? '∨' : '⊕') : nm, { size: 28, anchor: 'end', fill: C.gold, mono: true });
      for (let q = 0; q < 8; q++) {
        const hit = '00110011'[q] === '1';
        el('rect', { x: 880 + q * 64, y: yy, width: 58, height: 58, rx: 6, fill: j === 2 && hit ? 'rgba(110,231,168,.22)' : C.bg0, stroke: j === 1 && hit ? col : C.line, 'stroke-width': 2 }, rg);
        const ch = s[q];
        T(rg, 909 + q * 64, yy + 40, ch === 'X' ? 'x' : ch, { size: 30, anchor: 'middle', mono: true, fill: j === 2 && hit ? C.green : C.text, weight: 700 });
        if (ch === 'X') el('rect', { x: 899 + q * 64, y: yy + 12, width: 20, height: 3, fill: C.green }, rg);
      }
    });
    T(rg, 1420, y + 60 + 2 * 74 + 40, 'D7 … D0', { size: 24, fill: C.muted, mono: true });
  };
  xr(210, 'ORL P1,#00110011B', L(7), 'xx11xx11', C.green, '置 1：与 1 相或');
  xr(540, 'XRL P1,#00110011B', L(9), 'xxXXxxXX', C.violet, '取反：与 1 相异或');
  const tg = G(p2, { in: L(8) });
  T(tg, 100, 400, 'D0、D1、D4、D5 置 1', { size: 30, fill: C.green, weight: 700 });
  T(tg, 100, 445, '其他位不变', { size: 26, fill: C.muted });
  const tg2 = G(p2, { in: L(10) });
  T(tg2, 100, 730, 'D0、D1、D4、D5 取反', { size: 30, fill: C.violet, weight: 700 });
  T(tg2, 100, 775, '其他位不变', { size: 26, fill: C.muted });
  note(p2, 1440, 230, 400, ['课件未给 P1 原值：', 'x = 任意位，x̄ = 取反'], 'add', L(11), { size: 24 });
});

/* ---------------- 3.4.3 bit logic (P52–P53) ---------------- */
scene('bitlogic', '3.4.3 位逻辑操作指令', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(3) - 0.2 });
  const t1 = table(p1, 120, 240, [420, 700, 300], [['指令', '功能', '结果'], ['ORL C,bit', 'C 与该位的内容相或', '→ C'], ['ANL C,bit', 'C 与该位的内容相与', '→ C'],
    ['CLR C / CLR bit', '清 0', ''], ['CPL C / CPL bit', '求反', ''], ['SETB C / SETB bit', '置 1', '']], { rh: 76, size: 32, rowIn: [L(0), L(1), L(1) + 2.5, L(2), L(2) + 1, L(2) + 2], colColor: [C.gold] });
  note(p1, 120, 740, 1420, ['参与运算的只有{g|一位数}'], 'key', L(0), { size: 32 });
  const p2 = G(g, { in: L(3) });
  const K = code(p2, 60, 210, [['MOV 24H,#02H', ';(24H)=02H'], ['MOV 2EH,#05H', ';(2EH)=05H'], ['MOV C,21H', ';C=1'], ['ANL C,72H', ';C=1'], ['CLR C', ';C=0'], ['ORL C,24H', ';C=0']],
    { w: 700, cw: 280, lh: 64, size: 30 });
  K.step(L(3), 0).step(L(4), 1).step(L(5), 2).step(L(6), 3).step(L(7), 4).step(L(8), 5).off(L(9));
  const sub24 = ['27H', '26H', '25H', '24H', '23H', '22H', '21H', '20H'];
  const sub2E = ['77H', '76H', '75H', '74H', '73H', '72H', '71H', '70H'];
  T(p2, 1010, 270, '字节 24H', { size: 26, fill: C.cyan, weight: 700 });
  const B24 = bits(p2, 1010, 310, '--------', { w: 92, h: 70, gap: 8, sub: sub24 });
  T(p2, 1010, 500, '字节 2EH', { size: 26, fill: C.cyan, weight: 700 });
  const B2E = bits(p2, 1010, 540, '--------', { w: 92, h: 70, gap: 8, sub: sub2E });
  T(p2, 1500, 270, '紫色 = 位地址', { size: 22, fill: C.violet });
  B24.set(F(3, 0.45), '00000010'); B2E.set(F(4, 0.4), '00000101');
  B24.cells[6].focus(F(3, 0.6), Ee(5), C.gold);
  B2E.cells[5].focus(F(4, 0.6), Ee(6), C.gold); B2E.cells[7].focus(F(4, 0.8), Ee(4), C.gold);
  const Cc = regs(p2, 340, 720, [['C', '-']], { w: 120, h: 80 });
  Cc.set(F(5, 0.7), 'C', '1').set(F(6, 0.7), 'C', '1').set(F(7, 0.5), 'C', '0').set(F(8, 0.85), 'C', '0');
  B24.cells[3].focus(L(8) + 1, Ee(9), C.red);
  const wg = G(p2, { in: L(8) + 1 });
  T(wg, 1010, 470, '↑ 位地址 24H = 字节 24H 的 D4 = 0', { size: 26, fill: C.red });
  note(p2, 60, 830, 900, ['同样写 24H：MOV 24H,#02H 是{g|字节地址}；', 'ORL C,24H 是{g|位地址}'], 'key', L(9), { size: 26, out: L(10) - 0.2 });
  const ng = G(p2, { in: L(10) });
  card(ng, 1010, 700, 850, 210, { fill: 'rgba(6,14,28,.95)', stroke: C.cyan });
  T(ng, 1035, 750, '片内 RAM：字节 20H~2FH ↔ 位 00H~7FH（128 位）', { size: 26, maxw: 800 });
  T(G(ng, { in: L(11) }), 1035, 805, 'SFR：字节地址能被 8 整除的才可位寻址，', { size: 26, maxw: 800 });
  T(G(ng, { in: L(11) }), 1035, 850, '其余位不能参与位逻辑运算', { size: 26, maxw: 800 });
  pill(G(g, { in: L(12) }), 60, 860, 640, 60, '下一集：3.5 算术运算指令与 PSW →', { size: 28 });
});
})();
