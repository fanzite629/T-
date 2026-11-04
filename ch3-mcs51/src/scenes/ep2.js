/* Episode 2: data transfer instructions (P21–P41) */
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

/* ---------------- intro: five classes + operating domains (P21–P23) ---------------- */
S.push(() => {
  const id = 'intro2', g = sceneGroup(id);
  const L = i => at(id, i);
  const tg = G(g, { in: SC[id].t0, out: L(1) - 0.2 });
  T(tg, 960, 420, '第 2 集', { size: 40, fill: C.cyan, anchor: 'middle' });
  T(tg, 960, 530, '3.3 数据传送指令', { size: 96, anchor: 'middle', weight: 700 });
  T(tg, 960, 600, '课件 P21–P41', { size: 30, anchor: 'middle', fill: C.gold });
  title(G(g, { in: L(1) }), id, '3.3 数据传送指令：五类与操作域', 'P21–P23');
  const cls = [['片内 RAM 传送', 'MOV', L(1)], ['栈操作', 'PUSH  POP', L(1) + 2.5], ['交换', 'SWAP XCH XCHD', L(2)],
    ['程序存储器传送', 'MOVC', L(2) + 3], ['片外 RAM / I/O 传送', 'MOVX', L(2) + 5]];
  cls.forEach(([a, b, t], k) => {
    const cg = G(g, { in: t });
    card(cg, 70, 215 + k * 118, 560, 100, { fill: C.panel2 });
    T(cg, 95, 255 + k * 118, `${k + 1}. ${a}`, { size: 28, maxw: 520 });
    T(cg, 95, 297 + k * 118, b, { size: 28, mono: true, fill: C.gold, weight: 700 });
  });
  // operating-domain diagram (P23)
  const dg = G(g, { in: L(3) });
  const box = (x, y, w, h, fill, lines, tin) => {
    const bg = G(dg, { in: tin });
    el('rect', { x, y, width: w, height: h, rx: 10, fill, stroke: C.text, 'stroke-width': 2, opacity: 0.9 }, bg);
    lines.forEach((s, k) => T(bg, x + w / 2, y + h / 2 - (lines.length - 1) * 19 + k * 38 + 10, s, { size: 26, anchor: 'middle', fill: C.bg1, weight: 700 }));
    return bg;
  };
  box(700, 300, 200, 440, '#3B6FD8', ['程序', '存储器', 'ROM', 'EPROM'], L(3));
  box(1120, 260, 220, 170, '#F6B98A', ['特殊功能', '寄存器 SFR'], L(3));
  box(1120, 450, 220, 290, '#F49AC8', ['片内', 'RAM', '128 字节'], L(3));
  box(1600, 300, 220, 440, '#9BE7F5', ['片外', '数据', '存储器', 'RAM'], L(4));
  const a1 = G(dg, { in: L(3) + 1 });
  D(arrow(a1, 905, 500, 1110, 500, C.cyan, 5), L(3) + 1, 0.8);
  T(a1, 1005, 480, 'MOVC', { size: 30, anchor: 'middle', fill: C.cyan, weight: 700, mono: true });
  const a2 = G(dg, { in: L(4) + 0.5 });
  D(arrow(a2, 1350, 345, 1590, 345, C.violet, 5), L(4) + 0.5, 0.8);
  D(arrow(a2, 1590, 385, 1350, 385, C.violet, 5), L(4) + 0.9, 0.8);
  T(a2, 1470, 325, 'MOVX', { size: 30, anchor: 'middle', fill: C.violet, weight: 700, mono: true });
  const a3 = G(dg, { in: L(5) });
  path(a3, 'M1345 420 C 1420 470, 1420 520, 1345 570', C.gold, 4);
  path(a3, 'M1345 640 C 1430 670, 1430 720, 1345 730', C.gold, 4);
  ['MOV', 'PUSH', 'POP', 'XCH', 'XCHD', 'SWAP'].forEach((s, k) => T(a3, 1440, 470 + k * 44, s, { size: 26, mono: true, fill: C.gold, weight: 700 }));
  note(g, 700, 790, 1140, ['MOVC 访问的是程序存储器（片内 ROM 或片外 EPROM 均可），', '课件图中只标了“片外”'], 'add', L(6), { size: 26 });
});

/* ---------------- MOV: formats and step-by-step run (P24–P25) ---------------- */
scene('mov1', '1. MOV 指令：格式与逐条执行', (g, L, Ee, F) => {
  const hg = G(g, { in: L(0), out: L(2) - 0.2 });
  note(hg, 80, 220, 1760, ['MOV 指令只影响 {g|P} 标志位（P 随 A 中 1 的个数自动变化）'], 'key', L(0), { size: 32 });
  const fg = G(hg, { in: L(1) });
  table(fg, 160, 400, [400, 1200], [['操作数', '可以是'], ['目的操作数', 'A、Rn、direct、@Ri、SFR'], ['源操作数', 'Rn、direct、@Ri、#data、SFR']], { rh: 80, size: 34, colColor: [C.gold] });
  const pg = G(g, { in: L(2) });
  const lines = [['MOV R0,#30H', ';(R0)=30H'], ['MOV R1,#31H', ';(R1)=31H'], ['MOV 5FH,#0AAH', ';(5FH)=AAH'], ['MOV 30H,#00H', ';(30H)=00H'],
    ['MOV 31H,#01H', ';(31H)=01H'], ['MOV A,R0', ';(A)=30H'], ['MOV R1,A', ';(R1)=30H'], ['MOV A,@R0', ';(A)=00H'], ['MOV 30H,31H', ';(30H)=01H'],
    ['MOV A,5FH', ';(A)=AAH'], ['MOV 5FH,#5FH', ';(5FH)=5FH'], ['MOV DPTR,#9000H', ';DPH=90H,DPL=00H'], ['MOV A,30H', ';(A)=01H'],
    ['MOV B,A', ';(B)即(F0H)=01H'], ['MOV TMOD,#11H', ';(TMOD)即(89H)=11H']];
  const K = code(pg, 60, 200, lines, { w: 900, cw: 400, lh: 46, size: 26 });
  const st = [[L(3), 0], [F(3, 0.5), 1], [L(4), 2], [L(5), 3], [F(5, 0.5), 4], [L(6), 5], [L(7), 6], [L(8), 7], [L(9), 8], [L(10), 9],
    [L(11), 10], [L(12), 11], [L(13), 12], [L(14), 13], [L(15), 14]];
  st.forEach(([t, k]) => K.step(t, k));
  K.off(L(16));
  const R = regs(pg, 1010, 270, [['A', '--'], ['R0', '--'], ['R1', '--'], ['B', '--'], ['DPH', '--'], ['DPL', '--'], ['TMOD', '--'], ['P', '-']],
    { cols: 4, w: 180, h: 66, gx: 26, gy: 70 });
  const M = mem(pg, 1010, 520, [['30H', '--'], ['31H', '--'], ['5FH', '--']], { w: 200, h: 62, gap: 14, title: '片内 RAM' });
  const d = 0.9;
  R.set(L(3) + d, 'R0', '30H').set(F(3, 0.5) + d, 'R1', '31H');
  M.set(L(4) + 1.6, '5FH', 'AAH').set(L(5) + 1.4, '30H', '00H').set(F(5, 0.5) + 1.4, '31H', '01H');
  R.set(L(6) + d, 'A', '30H').set(L(6) + d, 'P', '0');
  R.set(L(7) + d, 'R1', '30H');
  R.focus(L(8), Ee(8), 'R0', C.cyan); M.focus(L(8) + 1.2, Ee(8), '30H', C.cyan);
  R.set(F(8, 0.75), 'A', '00H').set(F(8, 0.75), 'P', '0');
  M.focus(L(9), Ee(9), '31H', C.cyan); M.set(F(9, 0.5), '30H', '01H');
  M.focus(L(10), Ee(10), '5FH', C.cyan); R.set(F(10, 0.6), 'A', 'AAH').set(F(10, 0.6), 'P', '0');
  M.set(F(11, 0.8), '5FH', '5FH');
  R.set(F(12, 0.5), 'DPH', '90H').set(F(12, 0.75), 'DPL', '00H');
  M.focus(L(13), Ee(13), '30H', C.cyan); R.set(F(13, 0.6), 'A', '01H').set(F(13, 0.6), 'P', '1');
  R.set(F(14, 0.6), 'B', '01H');
  R.set(F(15, 0.6), 'TMOD', '11H');
  R.focus(L(16), Ee(17), 'P', C.gold); R.focus(L(16), Ee(16), 'A', C.cyan);
  const ng = G(pg, { in: L(16), out: L(17) - 0.2 });
  card(ng, 1010, 760, 830, 140, { fill: 'rgba(6,14,28,.95)', stroke: C.gold });
  T(ng, 1035, 810, 'P = A 中“1”的个数为奇数时 1，偶数时 0', { size: 26, maxw: 780 });
  T(ng, 1035, 860, '30H、00H、AAH → 偶数个 1 → P=0；01H → P=1', { size: 26, fill: C.gold, maxw: 780 });
  note(pg, 1010, 760, 830, ['MOV 不改变 CY、AC、OV 等运算标志'], 'ok', L(17), { size: 28 });
});

/* ---------------- MOV notes (1)(2): SFR names, undefined addresses, encodings (P25–P26) ---------------- */
scene('mov2', 'MOV 注意（1）（2）：SFR 名称与地址', (g, L, Ee, F) => {
  const SFR = { 0x80: 'P0', 0x81: 'SP', 0x82: 'DPL', 0x83: 'DPH', 0x87: 'PCON', 0x88: 'TCON', 0x89: 'TMOD', 0x8A: 'TL0', 0x8B: 'TL1',
    0x8C: 'TH0', 0x8D: 'TH1', 0x90: 'P1', 0x98: 'SCON', 0x99: 'SBUF', 0xA0: 'P2', 0xA8: 'IE', 0xB0: 'P3', 0xB8: 'IP', 0xD0: 'PSW', 0xE0: 'ACC', 0xF0: 'B' };
  const c1 = G(g, { in: L(1) });
  card(c1, 60, 210, 800, 230, { fill: C.panel2 });
  T(c1, 85, 260, '（1）指令中常写 SFR 的{c|名称}', { size: 30, weight: 700, maxw: 750 });
  T(c1, 85, 305, '操作与直接地址完全相同', { size: 26, fill: C.muted });
  const c1b = G(c1, { in: L(2) });
  T(c1b, 85, 360, 'MOV B,A        ≡ 对 F0H 操作', { size: 26, mono: true, fill: C.gold });
  T(c1b, 85, 410, 'MOV TMOD,#11H  ≡ 对 89H 操作', { size: 26, mono: true, fill: C.gold });
  const c2 = G(g, { in: L(3) });
  card(c2, 60, 460, 800, 210, { fill: C.panel2 });
  T(c2, 85, 510, '（2）80H~FFH 只有 {c|21} 个 SFR', { size: 30, weight: 700, maxw: 750 });
  const c2b = G(c2, { in: L(4) });
  T(c2b, 85, 565, '未定义地址{r|不可操作}：', { size: 28 });
  T(c2b, 85, 615, '写入数据丢失，读出数据不定', { size: 28, fill: C.red });
  // SFR map 80H..FFH
  const mg = G(g, { in: L(3) });
  const x0 = 960, y0 = 250, cw = 50, ch = 44;
  T(mg, x0 + 8 * cw + 40, y0 - 22, '80H~FFH 地址分布（标准 8051 的 21 个 SFR，补充）', { size: 22, anchor: 'middle', fill: C.muted, maxw: 900 });
  for (let c = 0; c < 16; c++) T(mg, x0 + 60 + c * cw + cw / 2, y0 + 10, c.toString(16).toUpperCase(), { size: 18, anchor: 'middle', fill: C.muted, mono: true });
  const div8 = [];
  for (let r = 0; r < 8; r++) {
    T(mg, x0 + 50, y0 + 22 + r * ch + ch / 2 + 7, (8 + r).toString(16).toUpperCase() + 'x', { size: 18, anchor: 'end', fill: C.muted, mono: true });
    for (let c = 0; c < 16; c++) {
      const a = 0x80 + r * 16 + c, nm = SFR[a];
      const rx = x0 + 60 + c * cw, ry = y0 + 22 + r * ch;
      const rc = el('rect', { x: rx + 1, y: ry + 1, width: cw - 2, height: ch - 2, rx: 4, fill: nm ? 'rgba(61,213,243,.25)' : 'rgba(255,255,255,.03)', stroke: C.line }, mg);
      if (nm) T(mg, rx + cw / 2, ry + ch / 2 + 6, nm, { size: nm.length > 3 ? 13 : 16, anchor: 'middle', fill: C.text, weight: 600, maxw: cw - 4 });
      if (a % 8 === 0) div8.push(rc);
    }
  }
  U.push(t => {
    const on = t >= L(9) && t < SC.mov2.t1;
    div8.forEach(r => setAttrs(r, { stroke: on ? C.gold : C.line, 'stroke-width': on ? 3 : 1 }));
  });
  // encodings
  const eg = G(g, { in: L(5) });
  const tb = table(eg, 60, 700, [420, 420, 300, 300], [['指令', '目标代码（补充）', '字节数', '结果'], ['MOV A,#01H', '74H 01H', '2', '(A)=01H'], ['MOV E0H,#01H', '75H E0H 01H', '3', '(E0H)=01H']],
    { rh: 58, size: 28, mono: true, rowIn: [L(5), L(5), L(5)] });
  tb.hl(1, 3, L(5) + 3, L(6)); tb.hl(2, 3, L(5) + 3, L(6));
  tb.hl(1, 1, L(7), L(8)); tb.hl(2, 1, L(7), L(8));
  note(g, 1500, 700, 360, ['应写作', 'MOV 0E0H,#01H'], 'warn', L(8), { size: 26 });
  const bg = G(g, { in: L(9) });
  card(bg, 960, 640, 880, 50, { fill: 'rgba(247,197,72,.1)', stroke: C.gold });
  T(bg, 980, 674, '金框：地址能被 8 整除 → 可位寻址，如 ACC.7、PSW.3、P1.1', { size: 24, fill: C.gold, maxw: 840 });
});

/* ---------------- MOV notes (3): @Ri, # vs direct, bit moves (P27–P28) ---------------- */
scene('mov3', 'MOV 注意（3）：@Ri、# 与位传送', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(6) - 0.2 });
  T(p1, 80, 240, '@ 的意义：以 Ri 的{g|内容}为地址', { size: 34, fill: C.cyan });
  const K = code(p1, 80, 290, [['MOV 40H,#30H', ';(40H)=30H'], ['MOV R0,#40H', ';(R0)=40H'], ['MOV A,@R0', ';(A)=(40H)=30H']], { w: 860, cw: 380, lh: 64, size: 32 });
  K.step(L(1), 0).step(L(2), 1).step(L(3), 2);
  const R = regs(p1, 1120, 320, [['R0', '--'], ['A', '--']], { w: 200, h: 80, cols: 1, gy: 90 });
  const M = mem(p1, 1450, 300, [['41H', '…'], ['40H', '--'], ['3FH', '…']], { w: 200, h: 70, title: '片内 RAM' });
  M.set(L(1) + 1.4, '40H', '30H');
  R.set(L(2) + 1.2, 'R0', '40H');
  R.focus(L(3) + 0.5, Ee(4), 'R0', C.cyan);
  M.focus(L(3) + 1.5, Ee(3), '40H', C.cyan);
  R.set(F(3, 0.75), 'A', '30H');
  const ag = G(p1, { in: L(3) + 1 });
  D(path(ag, 'M1325 360 C 1390 360, 1400 395, 1555 395', C.cyan, 4), L(3) + 1, 0.8);
  note(p1, 80, 610, 1760, ['R0 中的 40H 不是被操作的数，而是被操作数所在的{g|地址}'], 'key', L(4), { size: 30 });
  note(p1, 80, 770, 1760, ['Ri 只能是 R0 或 R1；@R2~@R7 无效！'], 'warn', L(5), { size: 30, tag: '⚠ 注意' });
  const p2 = G(g, { in: L(6) });
  const tb = table(p2, 80, 220, [380, 640, 380, 360], [
    ['指令', '操作', '源操作数', '结果单元'],
    ['MOV A,40H', '(40H) 单元的内容 → A', '直接寻址', 'A'],
    ['MOV A,#40H', '立即数 40H → A', '立即寻址', 'A'],
    ['MOV 40H,#40H', '立即数 40H → 40H 单元', '立即寻址', '40H 单元'],
    ['MOV 40H,30H', '(30H) 单元的内容 → 40H 单元', '直接寻址', '40H 单元']
  ], { rh: 66, size: 28, rowIn: [L(6), L(6), L(7), L(8), L(9)], colColor: [C.gold] });
  tb.hl(2, 0, L(10), Ee(10)); tb.hl(3, 0, L(10), Ee(10));
  note(p2, 80, 580, 860, ['直接地址和立即数都以数字出现，', '区别只在有没有 {g|#}'], 'key', L(10), { size: 28 });
  const sg = G(p2, { in: L(11) });
  card(sg, 980, 580, 860, 160, { fill: C.panel2 });
  T(sg, 1005, 625, 'MOV A,#01H ; MOV R0,A', { size: 28, mono: true, fill: C.cyan });
  const R2 = regs(sg, 1010, 690, [['A', '--'], ['R0', '--']], { w: 150, h: 46, gx: 140, ls: 20 });
  R2.set(L(11) + 2.5, 'A', '01H').set(L(11) + 4, 'R0', '01H');
  T(sg, 1640, 720, '源 A 不变', { size: 26, fill: C.green });
  const bg = G(p2, { in: L(12) });
  card(bg, 80, 780, 1760, 120, { fill: 'rgba(6,14,28,.95)', stroke: C.violet });
  T(bg, 110, 852, 'MOV C,bit    MOV bit,C', { size: 34, mono: true, fill: C.violet, weight: 700 });
  T(bg, 700, 852, '位传送都与 C 有关；bit 为位地址或位名，传送该位的内容', { size: 28, maxw: 1110 });
});

/* ---------------- MOV notes (4): Rn and register banks (P29) ---------------- */
scene('mov4', 'MOV 注意（4）：Rn 与工作寄存器区', (g, L, Ee, F) => {
  const x0 = 980, y0 = 250, cw = 210, ch = 62;
  const bg = G(g, { in: L(1) });
  const banks = [];
  for (let b = 0; b < 4; b++) {
    const bx = x0 + b * cw;
    T(bg, bx + cw / 2 - 6, y0 - 16, `${b} 区`, { size: 26, anchor: 'middle', fill: C.cyan, weight: 700 });
    const hi = el('rect', { x: bx - 2, y: y0 - 4, width: cw - 8, height: 8 * ch + 8, rx: 10, fill: 'rgba(247,197,72,.15)', stroke: C.gold, 'stroke-width': 3, opacity: 0 }, bg);
    banks.push(hi);
    for (let r = 0; r < 8; r++) {
      const a = b * 8 + r;
      el('rect', { x: bx + 4, y: y0 + r * ch + 4, width: cw - 20, height: ch - 8, rx: 6, fill: C.panel2, stroke: C.line }, bg);
      T(bg, bx + 20, y0 + r * ch + 40, `R${r}`, { size: 24, mono: true, weight: 700 });
      T(bg, bx + cw - 30, y0 + r * ch + 40, a.toString(16).toUpperCase().padStart(2, '0') + 'H', { size: 22, mono: true, anchor: 'end', fill: C.muted });
    }
  }
  const addrG = G(g, { in: L(4) });
  card(addrG, x0, y0 + 8 * ch + 20, 4 * cw - 10, 60, { fill: 'rgba(167,139,250,.1)', stroke: C.violet });
  T(addrG, x0 + 20, y0 + 8 * ch + 60, '各区地址（补充）：00H~07H · 08H~0FH · 10H~17H · 18H~1FH', { size: 24, fill: C.violet, maxw: 4 * cw - 40 });
  U.push(t => {
    let b = -1;
    if (t >= L(3) && t < Ee(3)) b = Math.min(3, Math.floor((t - L(3)) / ((Ee(3) - L(3)) / 4)));
    else if (t >= L(5) && t < L(7)) b = 0;
    else if (t >= L(7) + 2) b = 1;
    banks.forEach((h, k) => h.setAttribute('opacity', k === b ? 1 : 0));
  });
  const pg = G(g, { in: L(2) });
  T(pg, 80, 250, 'PSW（程序状态字）', { size: 28, fill: C.muted });
  const P = regs(pg, 80, 320, [['CY', '0'], ['AC', '0'], ['F0', '0'], ['RS1', '0'], ['RS0', '0'], ['OV', '0'], ['—', '0'], ['P', '0']], { w: 96, h: 60, gx: 6, ls: 20 });
  P.focus(L(2), Ee(4), 'RS1', C.gold); P.focus(L(2), Ee(4), 'RS0', C.gold);
  T(pg, 80, 430, 'PSW.4 = RS1，PSW.3 = RS0', { size: 24, fill: C.muted, mono: true });
  const tb = table(G(g, { in: L(3) }), 80, 470, [180, 180, 400], [['RS1', 'RS0', '选中'], ['0', '0', '0 区（复位默认）'], ['0', '1', '1 区'], ['1', '0', '2 区'], ['1', '1', '3 区']],
    { rh: 58, size: 28, mono: false });
  for (let k = 0; k < 4; k++) { const d = (Ee(3) - L(3)) / 4; tb.hl(k + 1, 2, L(3) + k * d, L(3) + (k + 1) * d); }
  tb.hl(1, 2, L(5), L(7)); tb.hl(2, 2, L(7) + 2, SC.mov4.t1);
  note(g, 80, 790, 780, ['上电复位 (PSW)=00H → 默认 0 区；', '用位操作指令改 RS1/RS0 切换'], 'key', L(5), { size: 26, out: L(7) - 0.2 });
  const sg = G(g, { in: L(7) });
  card(sg, 80, 790, 780, 120, { fill: 'rgba(6,14,28,.95)', stroke: C.violet });
  T(sg, 105, 840, 'SETB PSW.3  ; RS0=1 → 1 区', { size: 28, mono: true, fill: C.violet, maxw: 740 });
  T(sg, 105, 885, '此时 R0 ↔ 片内 RAM 08H（补充示例）', { size: 26, maxw: 740 });
  P.set(L(7) + 1.5, 'RS0', '1');
});

/* ---------------- stack: PUSH / POP (P30–P32) ---------------- */
scene('stack1', '2. 栈操作指令 PUSH、POP', (g, L, Ee, F) => {
  const cg = G(g, { out: L(3) - 0.2 });
  note(cg, 80, 230, 1760, ['堆栈：在片内 RAM 中划出的一块特殊的连续区域，用来存放需要保存的信息'], 'key', L(1), { size: 30 });
  const sg = G(cg, { in: L(2) });
  T(sg, 120, 470, 'MOV SP,#60H', { size: 48, mono: true, fill: C.gold, weight: 700 });
  T(sg, 120, 530, 'SP 的内容 = 堆栈起始位置 60H；栈向地址增大的方向生成', { size: 30 });
  const ug = G(sg, { in: L(2) + 2 });
  arrow(ug, 1500, 760, 1500, 440, C.cyan, 5);
  T(ug, 1530, 600, '地址增大', { size: 28, fill: C.cyan });
  const pg = G(g, { in: L(3) });
  const K = code(pg, 60, 210, [['MOV SP,#60H', ';建立堆栈'], ['MOV DPTR,#8056H', ';DPH=80H,DPL=56H'], ['PUSH DPH', ';入栈存'], ['PUSH DPL', ';入栈存'],
    ['MOV DPTR,#2000H', ';修改数据指针'], ['……', ''], ['POP DPL', ';恢复 DPL'], ['POP DPH', ';恢复 DPH']], { w: 860, cw: 380, lh: 58, size: 28 });
  K.step(L(4), 0).step(L(5), 1).step(L(6), 2).step(L(7), 3).step(L(8), 4).step(L(9), 5).step(F(9, 0.3), 6).step(L(10), 7).off(L(12));
  const R = regs(pg, 990, 280, [['SP', '--'], ['DPH', '--'], ['DPL', '--']], { w: 140, h: 70, gx: 20 });
  const M = mem(pg, 1480, 260, [['63H', '--'], ['62H', '--'], ['61H', '--'], ['60H', '--']], { w: 180, h: 70, gap: 10, aw: 80, title: '片内 RAM（堆栈区）' });
  const ptr = G(pg, { in: L(4) });
  pointer(ptr, 1748, M.yOf('60H'), 'SP', [[L(4), M.yOf('60H')], [L(6) + 1.0, M.yOf('61H')], [L(7) + 1.0, M.yOf('62H')], [F(9, 0.75), M.yOf('61H')], [F(10, 0.7), M.yOf('60H')]], { side: 'right' });
  R.set(L(4) + 1.5, 'SP', '60H');
  R.set(L(5) + 2, 'DPH', '80H').set(L(5) + 3, 'DPL', '56H');
  R.set(L(6) + 1.0, 'SP', '61H'); M.set(L(6) + 3, '61H', '80H'); R.focus(L(6) + 2.5, Ee(6), 'DPH', C.cyan);
  R.set(L(7) + 1.0, 'SP', '62H'); M.set(L(7) + 3, '62H', '56H'); R.focus(L(7) + 2.5, Ee(7), 'DPL', C.cyan);
  R.set(F(8, 0.3), 'DPH', '20H').set(F(8, 0.3), 'DPL', '00H');
  M.focus(F(9, 0.4), F(9, 0.75), '62H', C.cyan); R.set(F(9, 0.6), 'DPL', '56H'); R.set(F(9, 0.75), 'SP', '61H');
  M.focus(L(10), F(10, 0.6), '61H', C.cyan); R.set(F(10, 0.4), 'DPH', '80H'); R.set(F(10, 0.7), 'SP', '60H');
  const kg = G(pg, { in: L(11) });
  T(kg, 1480, M.yOf('60H') + 70, '弹出后 61H、62H 数据仍在（未清除）', { size: 22, fill: C.muted });
  const rg = G(pg, { in: L(12) });
  card(rg, 1000, 650, 840, 200, { fill: 'rgba(247,197,72,.08)', stroke: C.gold });
  T(rg, 1030, 715, 'PUSH：SP {g|先加 1}，后压入', { size: 36, weight: 700, maxw: 780 });
  T(rg, 1030, 790, 'POP ：{g|先弹出}，SP 后减 1', { size: 36, weight: 700, maxw: 780 });
  const dg = G(pg, { in: L(8) + 0.8, out: L(12) - 0.2 });
  T(dg, 1000, 700, 'DPTR 被改写，但 8056H 已保存在栈中', { size: 28, fill: C.green, maxw: 840 });
});

/* ---------------- stack notes (P33) ---------------- */
scene('stack2', '使用栈操作指令注意', (g, L, Ee, F) => {
  bullets(g, 80, 260, [
    ['① 先进后出', L(1)],
    ['② 常成对使用，注意顺序', L(2)],
    ['③ PUSH：SP 先加 1 后压入', L(4)],
    ['④ POP ：先弹出后 SP 减 1', L(4) + 2],
    ['⑤ 栈向地址增大方向生成（SP 指向见右）', L(5)],
    ['   调用子程序、中断也用栈，防止溢出', L(8)],
    ['⑥ 操作数只能是 direct（含 SFR）', L(9)]
  ], { size: 32, gap: 74, maxw: 860 });
  const wg = G(g, { in: L(3), out: L(5) - 0.2 });
  card(wg, 1000, 220, 840, 420, { fill: 'rgba(255,122,107,.06)', stroke: C.red });
  T(wg, 1030, 275, '若出栈顺序写反：', { size: 30, fill: C.red, weight: 700 });
  T(wg, 1030, 330, 'POP DPH  ; DPH ← (62H)=56H', { size: 28, mono: true });
  T(wg, 1030, 380, 'POP DPL  ; DPL ← (61H)=80H', { size: 28, mono: true });
  const R = regs(wg, 1060, 470, [['DPH', '--'], ['DPL', '--']], { w: 150, h: 64, gx: 20, ls: 20 });
  R.set(L(3) + 4, 'DPH', '56H').set(L(3) + 5.5, 'DPL', '80H');
  const xg = G(wg, { in: L(3) + 7 });
  T(xg, 1440, 515, 'DPTR = 5680H ≠ 8056H ✗', { size: 30, fill: C.red, weight: 700, mono: true });
  const sg = G(g, { in: L(5) });
  const M = mem(sg, 1100, 260, [['63H', ''], ['62H', '56H'], ['61H', '80H'], ['60H', '']], { w: 180, h: 66, gap: 10, aw: 90, old: false });
  pointer(sg, 1378, M.yOf('62H'), 'SP', [], { side: 'right' });
  const tg = G(sg, { in: L(6) });
  T(tg, 1540, M.yOf('62H') + 9, '← 栈顶（最后压入）', { size: 26, fill: C.gold });
  T(tg, 1540, M.yOf('60H') + 9, '← 栈底一端', { size: 26, fill: C.muted });
  note(g, 1000, 600, 840, ['课件 P33⑤ 写“SP 指在栈底”，与 P32 示意图', '不一致；按 PUSH/POP 规则，SP 指向{g|栈顶}'], 'warn', L(7), { size: 26 });
  const og = G(g, { in: L(10) });
  card(og, 80, 800, 1760, 110, { fill: 'rgba(6,14,28,.95)', stroke: C.cyan });
  T(og, 110, 868, '✓ PUSH DPH / PUSH DPL      ✗ PUSH DPTR      累加器写作 PUSH ACC（补充）', { size: 30, mono: true, maxw: 1700 });
});

/* ---------------- XCH / XCHD / SWAP (P34–P35) ---------------- */
scene('xch', '3. 交换指令 XCH、XCHD、SWAP', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(8) - 0.2 });
  const e1 = G(p1, { in: L(1) });
  card(e1, 60, 210, 820, 400, { fill: C.panel2 });
  T(e1, 85, 260, '例 1  全字节交换 XCH', { size: 30, fill: C.cyan, weight: 700 });
  T(e1, 85, 310, 'MOV A,#30H  MOV R0,#05H', { size: 26, mono: true });
  T(e1, 85, 355, 'XCH A,R0', { size: 30, mono: true, fill: C.gold, weight: 700 });
  const R1 = regs(e1, 160, 450, [['A', '--'], ['R0', '--']], { w: 200, h: 80, gx: 160 });
  R1.set(L(1) + 2.5, 'A', '30H').set(L(1) + 4, 'R0', '05H');
  const x1 = G(e1, { in: L(2) + 0.5 });
  D(path(x1, 'M260 545 C 330 600, 470 600, 550 545', C.gold, 4), L(2) + 0.5, 0.7);
  D(path(x1, 'M540 445 C 470 395, 330 395, 270 445', C.gold, 4), L(2) + 0.5, 0.7);
  R1.set(L(2) + 1.4, 'A', '05H').set(L(2) + 1.4, 'R0', '30H');
  const e2 = G(p1, { in: L(3) });
  card(e2, 920, 210, 940, 400, { fill: C.panel2 });
  T(e2, 945, 260, '例 2  低半字节交换 XCHD', { size: 30, fill: C.cyan, weight: 700 });
  T(e2, 945, 310, 'MOV A,#12H  MOV R1,#50H  MOV 50H,#34H', { size: 24, mono: true, maxw: 890 });
  T(e2, 945, 355, 'XCHD A,@R1      (R1)=50H', { size: 30, mono: true, fill: C.gold, weight: 700 });
  T(e2, 975, 492, '(A)', { size: 24, anchor: 'end', fill: C.cyan, mono: true });
  T(e2, 1645, 492, '(50H)', { size: 24, anchor: 'start', fill: C.cyan, mono: true });
  const aH = cell(e2, 985, 440, 80, 80, '1', { old: false }), aL = cell(e2, 1070, 440, 80, 80, '2', { old: false, fill: 'rgba(247,197,72,.14)' });
  const mH = cell(e2, 1465, 440, 80, 80, '3', { old: false }), mL = cell(e2, 1550, 440, 80, 80, '4', { old: false, fill: 'rgba(247,197,72,.14)' });
  const x2 = G(e2, { in: L(4) + 1 });
  D(path(x2, 'M1110 525 C 1200 580, 1500 580, 1590 525', C.gold, 4), L(4) + 1, 0.8);
  D(path(x2, 'M1590 435 C 1500 380, 1200 380, 1110 435', C.gold, 4), L(4) + 1, 0.8);
  aL.set(L(4) + 2.2, '4'); mL.set(L(4) + 2.2, '2');
  const r2 = G(e2, { in: L(5) });
  T(r2, 1065, 598, '(A)=14H', { size: 28, anchor: 'middle', fill: C.green, mono: true, weight: 700 });
  T(r2, 1545, 598, '(50H)=32H', { size: 28, anchor: 'middle', fill: C.green, mono: true, weight: 700 });
  note(p1, 60, 650, 1800, ['目的操作数只能是 A；XCH 的源可以是 Rn、direct、@Ri、SFR（也称累加器 A 传送指令）'], 'key', L(6), { size: 28 });
  note(p1, 60, 790, 1800, ['XCHD 的源操作数只能是 @Ri（XCHD A,@R0 / XCHD A,@R1）'], 'add', L(7), { size: 28 });
  const p2 = G(g, { in: L(8) });
  T(p2, 120, 260, 'SWAP A    高低四位互换；操作数只有一个，必须是 A', { size: 34, fill: C.cyan, maxw: 1700 });
  const B = bits(G(p2, { in: L(9) }), 420, 430, '11000011', { w: 110, h: 100, gap: 10, nib: true, name: 'A', hex: '0C3H' });
  const sw = G(p2, { in: L(10) });
  D(path(sw, `M${B.xOf(1) + 30} 545 C ${B.xOf(2)} 640, ${B.xOf(5)} 640, ${B.xOf(6) - 30} 545`, C.gold, 5), L(10) + 0.5, 0.9);
  D(path(sw, `M${B.xOf(6) + 30} 545 C ${B.xOf(5) + 60} 680, ${B.xOf(2) - 60} 680, ${B.xOf(1) - 30} 545`, C.cyan, 5), L(10) + 0.5, 0.9);
  B.set(L(10) + 2.5, '00111100', '3CH');
  const rg = G(p2, { in: L(10) + 3 });
  T(rg, 960, 780, 'SWAP A 之后：(A) = 00111100B = 3CH', { size: 40, anchor: 'middle', fill: C.green, weight: 700, mono: true });
});

/* ---------------- MOVC: square table (P36–P37) ---------------- */
scene('movc', '4. 程序存储器传送指令 MOVC：查平方表', (g, L, Ee, F) => {
  const hg = G(g, { in: L(1) });
  T(hg, 80, 240, 'MOVC A,@A+PC     ; (A)+(PC)   形成地址 → 内容送 A', { size: 28, mono: true, maxw: 1760 });
  T(G(g, { in: L(2) }), 80, 290, 'MOVC A,@A+DPTR   ; (A)+(DPTR) 形成地址 → 内容送 A', { size: 28, mono: true, maxw: 1760 });
  note(g, 80, 320, 1000, ['例：进入子程序前 (A)=n，执行后 (A)=n²，0 ≤ n ≤ 9'], 'q', L(3), { size: 28 });
  const K = code(G(g, { in: L(4) }), 80, 470, [['SQ:  MOV DPTR,#TABEL', ';表首地址送 DPTR'], ['     MOVC A,@A+DPTR', ';查表'], ['     RET', ';返回'], ['TABEL: DB 00H,01H,04H……', ';以下略']], { w: 1000, cw: 340, lh: 58, size: 28 });
  K.step(L(5), 0).step(L(6), 1).step(L(8), 2);
  const R = regs(G(g, { in: L(5) }), 140, 790, [['DPTR', '--'], ['A', 'n']], { w: 220, h: 70, gx: 60 });
  R.set(L(5) + 2, 'DPTR', 'TABEL');
  R.set(L(7) + 0.5, 'A', '03H');
  const rows = [];
  const sq = ['00H', '01H', '04H', '09H', '10H', '19H', '24H', '31H', '40H', '51H'];
  for (let k = 9; k >= 0; k--) rows.push([`TABEL+${k}`, sq[k]]);
  const tg = G(g, { in: L(4) });
  const M = mem(tg, 1240, 250, rows, { w: 150, h: 54, gap: 10, aw: 170, title: '程序存储器：平方表', old: false });
  const fill = G(g, { in: L(4) + 6 });
  card(fill, 1580, 250 + 0 * 64, 270, 7 * 64 - 10, { fill: 'rgba(167,139,250,.1)', stroke: C.violet });
  T(fill, 1600, 300, 'n=3~9 课件', { size: 22, fill: C.violet });
  T(fill, 1600, 335, '省略，此处补全', { size: 22, fill: C.violet });
  T(fill, 1600, 380, '(9²=81=51H)', { size: 22, fill: C.violet, mono: true });
  M.focus(L(6), Ee(6), 'TABEL+0', C.muted);
  M.focus(L(7) + 1.5, Ee(7) + 1, 'TABEL+3', C.gold);
  R.set(F(7, 0.85), 'A', '09H');
  const ag = G(g, { in: L(7) + 1.5 });
  D(path(ag, `M1235 ${M.yOf('TABEL+3')} C 1120 ${M.yOf('TABEL+3')}, 900 760, 680 820`, C.gold, 4), L(7) + 1.5, 0.8);
  const ng = G(g, { in: L(9) });
  card(ng, 700, 760, 520, 150, { fill: 'rgba(6,14,28,.95)', stroke: C.gold });
  T(ng, 720, 810, 'MOVC 目的操作数只能是 A', { size: 26, fill: C.gold, maxw: 480 });
  T(ng, 720, 860, '标号 TABEL 沿用课件拼写', { size: 24, fill: C.muted, maxw: 480 });
});

/* ---------------- MOVX (P38–P39) ---------------- */
scene('movx', '5. 片外 RAM 传送指令 MOVX', (g, L, Ee, F) => {
  const tb = table(g, 80, 220, [420, 200, 560], [['指令', '方向', '地址宽度'], ['MOVX A,@Ri', '读', '8 位（Ri 内容）'], ['MOVX A,@DPTR', '读', '16 位（DPTR 内容）'], ['MOVX @Ri,A', '写', '8 位（Ri 内容）'], ['MOVX @DPTR,A', '写', '16 位（DPTR 内容）']],
    { rh: 70, size: 30, mono: false, rowIn: [L(0), L(1), L(1) + 2.5, L(2), L(2) + 2.5], colColor: [C.gold] });
  tb.hl(2, 2, L(4), Ee(4)); tb.hl(4, 2, L(4), Ee(4));
  const dg = G(g, { in: L(1) });
  const A = regs(dg, 1340, 300, [['A', '']], { w: 150, h: 90 });
  card(dg, 1600, 250, 250, 300, { fill: '#9BE7F5', stroke: C.text });
  T(dg, 1725, 380, '片外', { size: 30, anchor: 'middle', fill: C.bg1, weight: 700 });
  T(dg, 1725, 425, '数据 RAM', { size: 30, anchor: 'middle', fill: C.bg1, weight: 700 });
  D(arrow(dg, 1595, 320, 1500, 320, C.cyan, 5), L(1) + 0.5, 0.6);
  T(dg, 1545, 300, '读', { size: 26, anchor: 'middle', fill: C.cyan });
  const wg = G(dg, { in: L(2) });
  D(arrow(wg, 1500, 380, 1595, 380, C.violet, 5), L(2) + 0.5, 0.6);
  T(wg, 1545, 420, '写', { size: 26, anchor: 'middle', fill: C.violet });
  note(g, 80, 600, 860, ['@ 仍表示：以其内容为地址'], 'key', L(3), { size: 28 });
  note(g, 980, 600, 870, ['@DPTR：16 位地址 → 64K 空间；', '访问外部 I/O 也用 MOVX'], 'key', L(4), { size: 28 });
  note(g, 80, 760, 860, ['4 条 MOVX 的另一端都是 A：', '片外 RAM 的数据都经过累加器'], 'ok', L(5), { size: 28 });
  const xg = G(g, { in: L(6) });
  card(xg, 980, 760, 870, 140, { fill: 'rgba(6,14,28,.95)', stroke: C.violet });
  T(xg, 1005, 815, 'MOV  A,@R0 → 片内 RAM', { size: 30, mono: true, fill: C.cyan });
  T(xg, 1005, 865, 'MOVX A,@R0 → 片外 RAM', { size: 30, mono: true, fill: C.violet });
});

/* ---------------- comprehensive example (P40–P41) ---------------- */
const comboState = (g, init) => {
  const R = regs(g, 1000, 250, [['A', init.A], ['R0', init.R0], ['SP', init.SP], ['DPH', init.DPH], ['DPL', init.DPL]], { w: 150, h: 62, gx: 18 });
  const M = mem(g, 1000, 400, [['30H', init.m30], ['50H', init.m50], ['61H', init.m61], ['62H', init.m62]], { w: 150, h: 54, gap: 10, aw: 80, title: '片内 RAM' });
  const X = mem(g, 1300, 400, [['8400H', init.x8400]], { w: 150, h: 54, aw: 110, title: '片外 RAM' });
  return { R, M, X };
};
scene('combo1', '数据传送综合举例（上）', (g, L, Ee, F) => {
  const K = code(g, 60, 200, [['     ORG 8000H', ''], ['MOV SP,#60H', ';(SP)=60H 建立堆栈'], ['MOV A,#12H', ';(A)=12H'], ['MOV R0,#50H', ';(R0)=50H'], ['MOV 30H,#03H', ';(30H)=03H'],
    ['MOV DPTR,#8400H', ';(DPTR)=8400H'], ['MOVX @DPTR,A', ';(8400H)=12H'], ['MOV @R0,A', ';(50H)=12H'], ['XCH A,30H', ';(A)=03H,(30H)=12H']], { w: 880, cw: 400, lh: 64, size: 28 });
  K.step(L(0), 0).step(L(1), 1).step(L(2), 2).step(F(2, 0.35), 3).step(F(2, 0.7), 4).step(L(3), 5).step(L(4), 6).step(L(5), 7).step(L(6), 8);
  const { R, M, X } = comboState(g, { A: '--', R0: '--', SP: '--', DPH: '--', DPL: '--', m30: '--', m50: '--', m61: '--', m62: '--', x8400: '--' });
  R.set(L(1) + 1.5, 'SP', '60H');
  R.set(F(2, 0.25), 'A', '12H').set(F(2, 0.6), 'R0', '50H'); M.set(F(2, 0.95), '30H', '03H');
  R.set(F(3, 0.6), 'DPH', '84H').set(F(3, 0.6), 'DPL', '00H');
  R.focus(L(4), Ee(4), 'A', C.cyan); X.set(F(4, 0.7), '8400H', '12H');
  R.focus(L(5), F(5, 0.5), 'R0', C.cyan); M.set(F(5, 0.8), '50H', '12H');
  R.set(F(6, 0.6), 'A', '03H'); M.set(F(6, 0.6), '30H', '12H');
  const ng = G(g, { in: L(0) });
  T(ng, 1000, 730, 'DPTR = DPH:DPL', { size: 24, fill: C.muted, mono: true });
});
scene('combo2', '数据传送综合举例（下）', (g, L, Ee, F) => {
  const K = code(g, 60, 200, [['PUSH DPH', ';(SP)=61H (61H)=84H'], ['PUSH DPL', ';(SP)=62H (62H)=00H'], ['MOV DPTR,#TABEL', ';(DPTR)=8600H'], ['MOVC A,@A+DPTR', ';(8600H+03H)→A=44H'],
    ['POP DPL', ';(DPL)=00H (SP)=61H'], ['POP DPH', ';(DPH)=84H (SP)=60H'], ['MOV 30H,A', ';(30H)=44H'], ['XCHD A,@R0', ';(A)=42H (50H)=14H'], ['MOVX A,@DPTR', ';(A)=12H'],
    ['XCH A,@R0', ';(A)=14H (50H)=12H'], ['     ORG 8600H', ''], ['TABEL: DB 11H,22H', ''], ['       DB 33H,44H', '']], { w: 900, cw: 420, lh: 52, size: 26, reveal: 'step' });
  K.step(L(0), 0).step(L(1), 1).step(L(2), 2).step(L(3), 3).step(L(5), 4).step(L(6), 5).step(L(7), 6).step(L(8), 7).step(L(9), 8).step(L(10), 9).off(L(11));
  const { R, M, X } = comboState(g, { A: '03H', R0: '50H', SP: '60H', DPH: '84H', DPL: '00H', m30: '12H', m50: '12H', m61: '--', m62: '--', x8400: '12H' });
  const P = mem(g, 1600, 400, [['8600H', '11H'], ['8601H', '22H'], ['8602H', '33H'], ['8603H', '44H']], { w: 130, h: 54, gap: 10, aw: 110, title: 'ROM（TABEL）', old: false });
  R.set(L(0) + 1.5, 'SP', '61H'); M.set(L(0) + 3.5, '61H', '84H');
  R.set(L(1) + 1.0, 'SP', '62H'); M.set(L(1) + 2.5, '62H', '00H');
  R.set(F(2, 0.7), 'DPH', '86H').set(F(2, 0.7), 'DPL', '00H');
  R.focus(L(3), Ee(3), 'A', C.cyan); P.focus(F(3, 0.6), Ee(4), '8603H', C.gold);
  R.set(F(4, 0.7), 'A', '44H');
  M.focus(L(5), F(5, 0.5), '62H', C.cyan); R.set(F(5, 0.45), 'DPL', '00H').set(F(5, 0.8), 'SP', '61H');
  M.focus(L(6), F(6, 0.4), '61H', C.cyan); R.set(F(6, 0.35), 'DPH', '84H').set(F(6, 0.6), 'SP', '60H');
  M.set(F(7, 0.6), '30H', '44H');
  R.set(F(8, 0.8), 'A', '42H'); M.set(F(8, 0.8), '50H', '14H');
  X.focus(L(9), Ee(9), '8400H', C.cyan); R.set(F(9, 0.7), 'A', '12H');
  R.set(F(10, 0.6), 'A', '14H'); M.set(F(10, 0.6), '50H', '12H');
  note(g, 1000, 730, 860, ['终态：A=14H，SP=60H，DPTR=8400H', '(30H)=44H，(50H)=12H，片外(8400H)=12H'], 'ok', L(11), { size: 26 });
});
})();
