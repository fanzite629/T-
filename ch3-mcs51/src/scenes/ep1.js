/* Episode 1: overview (P1–P4), assembly format & symbols (P5–P8), seven addressing modes (P9–P20) */
'use strict';
(() => {
const E = window.ENG;
const { C, SC, at, end, el, T, G, D, U, card, pill, arrow, path, bullets, note, regs, mem, bits, code, table, column,
  pointer, sceneGroup, title, stepLabel, prog, setAttrs } = E;
const S = window.SCENES;
const scene = (id, head, fn) => S.push(() => {
  const g = sceneGroup(id);
  title(g, id, head, E.pagesLabel(SC[id].pages));
  fn(g, i => at(id, i), i => end(id, i), id);
});

/* ---------------- intro ---------------- */
S.push(() => {
  const id = 'intro', g = sceneGroup(id), L = i => at(id, i);
  const tg = G(g, { in: SC[id].t0, out: L(1) - 0.2 });
  T(tg, 960, 400, 'MCS-51 单片机', { size: 44, fill: C.cyan, anchor: 'middle', weight: 500 });
  T(tg, 960, 520, '第 3 章  指令系统', { size: 100, anchor: 'middle', weight: 700 });
  T(tg, 960, 600, '第 1 集 · 指令系统概述与七种寻址方式', { size: 34, anchor: 'middle', fill: C.muted });
  const og = G(g, { in: L(1) });
  T(og, 120, 200, '全章路线（课件 96 页 → 6 集）', { size: 40, weight: 700 });
  const rows = [
    ['3.0 概述 · 3.1 寻址方式 · 3.2 指令分类', 'P1–P20', '第 1 集', L(2)],
    ['3.3 数据传送指令', 'P21–P41', '第 2 集', L(2) + 1.8],
    ['3.4 逻辑运算指令', 'P42–P53', '第 3 集', L(3)],
    ['3.5 算术运算指令', 'P54–P74', '第 4 集', L(3) + 1.4],
    ['3.6 控制转移指令', 'P75–P88', '第 5 集', L(3) + 2.8],
    ['3.7 汇编语言、伪指令 · 复习要点', 'P89–P96', '第 6 集', L(4)]
  ];
  rows.forEach(([a, p, ep, t], k) => {
    const rg = G(og, { in: t });
    const y = 260 + k * 98;
    card(rg, 120, y, 1680, 80, { fill: k === 0 ? 'rgba(61,213,243,.12)' : C.panel, stroke: k === 0 ? C.cyan : C.line });
    pill(rg, 150, y + 18, 140, 44, ep, { size: 24 });
    T(rg, 330, y + 52, a, { size: 32, maxw: 1100 });
    T(rg, 1770, y + 52, p, { size: 26, anchor: 'end', fill: C.gold, mono: true });
  });
  const kg = G(g, { in: L(5) });
  card(kg, 360, 862, 1200, 64, { fill: 'rgba(247,197,72,.10)', stroke: C.gold });
  T(kg, 960, 905, '看懂每条指令 = 看清「执行前 → 执行后」寄存器、存储单元、标志位的变化', { size: 28, anchor: 'middle', fill: C.gold, maxw: 1160 });
});

/* ---------------- 3.0 overview ---------------- */
scene('overview', '3.0 概述：指令格式与 111 条指令', (g, L) => {
  const fg = G(g, { in: L(1) });
  const labels = ['① 操作码', '② 第一操作数地址', '③ 第二操作数或地址', '④ 结果数地址', '⑤ 下一条指令地址'];
  const ws = [230, 330, 360, 300, 340], tins = [L(2), L(3), L(3) + 2.2, L(4), L(4) + 2.0];
  let x = 140;
  T(g, 140, 240, '指令系统：计算机所能识别和执行的所有指令的集合', { size: 32, fill: C.cyan });
  labels.forEach((s, k) => {
    const cg = G(fg, { in: tins[k] });
    el('rect', { x, y: 290, width: ws[k] - 8, height: 90, rx: 10, fill: k === 0 ? 'rgba(247,197,72,.16)' : C.panel2, stroke: k === 0 ? C.gold : C.cyan, 'stroke-width': 2 }, cg);
    T(cg, x + (ws[k] - 8) / 2, 346, s, { size: 27, anchor: 'middle', maxw: ws[k] - 20 });
    x += ws[k];
  });
  note(g, 140, 410, 1640, ['MCS-51 指令只有 1~3 字节，不会把五项都写出：下一条指令地址通常由 PC 自动加 1 给出。'], 'add', L(5), { size: 26 });
  const tg = G(g, { in: L(6) });
  const tb = table(tg, 260, 560, [300, 160, 360, 160], [
    ['按字长', '条数', '按执行时间', '条数'],
    ['单字节指令', '49', '1 个机器周期', '64'],
    ['双字节指令', '45', '2 个机器周期', '45'],
    ['三字节指令', '17', '4 个机器周期', '2'],
    ['合计', '111', '合计', '111']
  ], { rh: 62, size: 30, rowIn: [L(6), L(7), L(7) + 1.2, L(7) + 2.4, L(9)] });
  tb.hl(4, 1, L(9), L(9) + 4); tb.hl(4, 3, L(9), L(9) + 4);
  tb.hl(3, 3, L(9) + 3.5, end('overview', 9) + 1);
  note(g, 1300, 610, 480, ['4 周期的 2 条：', 'MUL AB、DIV AB'], 'add', L(9) + 3.5, { size: 28 });
});

/* ---------------- machine code ---------------- */
scene('mcode', '指令的机器码：单字节、双字节、三字节', (g, L) => {
  const row = (y, tin, lab, ins, cmt) => {
    const rg = G(g, { in: tin });
    pill(rg, 80, y - 34, 170, 46, lab, { size: 24 });
    T(rg, 280, y, ins, { size: 34, mono: true, fill: C.cyan, weight: 700 });
    T(rg, 760, y, cmt, { size: 26, fill: C.muted, mono: true });
    return rg;
  };
  row(240, L(1), '单字节', 'MOV R0,A', ';(R0) ← (A)');
  const b1g = G(g, { in: L(2) });
  const b1 = bits(b1g, 300, 290, '11111000', { w: 62, h: 58, name: '', hex: 'F8H' });
  const sg = G(g, { in: L(3) });
  el('rect', { x: b1.xOf(5) - 36, y: 282, width: 3 * 68 + 4, height: 74, rx: 8, fill: 'none', stroke: C.violet, 'stroke-width': 3, 'stroke-dasharray': '8 6' }, sg);
  T(sg, 1060, 310, '低 3 位 rrr = 000 → R0', { size: 26, fill: C.violet });
  T(sg, 1060, 346, 'MOV R1,A：rrr = 001 → F9H（补充）', { size: 26, fill: C.violet });
  row(470, L(4), '双字节', 'MOV 20H,R0', ';(20H) ← (R0)');
  const b2g = G(g, { in: L(5) });
  bits(b2g, 300, 512, '10001000', { w: 62, h: 52, hex: '88H' });
  bits(b2g, 300, 572, '00100000', { w: 62, h: 52, labels: false, hex: '20H' });
  T(b2g, 1000, 548, '操作码', { size: 24, fill: C.gold }); T(b2g, 1000, 608, '操作数（地址）', { size: 24, fill: C.gold });
  row(700, L(6), '三字节', 'MOV 60H,#2FH', ';(60H) ← 2FH');
  const b3g = G(g, { in: L(7) });
  bits(b3g, 300, 740, '01110101', { w: 62, h: 46, hex: '75H', labels: false });
  bits(b3g, 300, 792, '01100000', { w: 62, h: 46, labels: false, hex: '60H' });
  bits(b3g, 300, 844, '00101111', { w: 62, h: 46, labels: false, hex: '2FH' });
  T(b3g, 1000, 773, '操作码', { size: 24, fill: C.gold }); T(b3g, 1000, 825, '操作数地址 60H', { size: 24, fill: C.gold });
  T(b3g, 1000, 877, '操作数 2FH', { size: 24, fill: C.gold });
});

/* ---------------- 3.1.1 format ---------------- */
scene('format', '3.1.1 汇编语言指令格式', (g0, L) => {
  const g = G(g0, { out: L(12) - 0.1, od: 0.3 });
  T(g, 80, 235, '汇编语言：用助记符书写的机器语言', { size: 32, fill: C.cyan });
  const fg = G(g, { in: L(2) });
  const parts = [['[标号:]', C.violet, 230], ['操作码助记符', C.gold, 300], ['[目的操作数,]', C.cyan, 300], ['[源操作数]', C.cyan, 260], ['[;注释]', C.green, 220]];
  let x = 150;
  parts.forEach(([s, col, w]) => {
    el('rect', { x, y: 270, width: w - 10, height: 70, rx: 10, fill: 'rgba(255,255,255,.03)', stroke: col, 'stroke-width': 2 }, fg);
    T(fg, x + (w - 10) / 2, 316, s, { size: 28, anchor: 'middle', fill: col, maxw: w - 20 });
    x += w;
  });
  const og = G(g, { in: L(3) });
  T(og, 1490, 316, '方括号 = 可省略', { size: 26, fill: C.muted });
  const eg = G(g, { in: L(4) });
  const ex = [['STAR:', C.violet, '标号'], ['MOV', C.gold, '操作码'], ['A, #01H', C.cyan, '操作数'], [';(A)=01H', C.green, '注释']];
  let ex0 = 150;
  ex.forEach(([s, col, lab], k) => {
    const w = [200, 140, 260, 300][k];
    T(eg, ex0, 420, s, { size: 40, mono: true, fill: col, weight: 700 });
    T(eg, ex0, 462, lab, { size: 24, fill: col });
    ex0 += w + 40;
  });
  bullets(g, 110, 540, [
    ['{v|标号}：代表该语句所在地址；1~6 个字符，首字符必须是字母，用冒号隔开；不产生目标代码', L(5)],
    ['{g|操作码}：指令的助记符，说明执行什么操作', L(7)],
    ['{c|操作数}：被操作数的源和目的，可以是数本身，也可以是它所在的地址', L(8)],
    ['十六进制数以 A~F 开头要加 0：{r|A5H} → {n|0A5H}，否则会被当成标号', L(9)],
    ['{n|注释}：用分号开始，不产生目标代码', L(11)]
  ], { size: 28, gap: 62 });
  const mg = G(g0, { in: L(12) + 0.2 });
  card(mg, 80, 230, 1760, 690, { fill: 'rgba(6,14,28,.97)', stroke: C.cyan });
  T(mg, 960, 300, 'MCS-51 的 7 种寻址方式（P5）', { size: 38, anchor: 'middle', weight: 700, fill: C.cyan });
  ['1 立即寻址', '2 直接寻址', '3 寄存器寻址', '4 寄存器间接寻址', '5 变址寻址', '6 相对寻址', '7 位寻址'].forEach((s, k) => {
    const x2 = k < 4 ? 260 : 1000, y2 = 400 + (k % 4) * 110;
    card(mg, x2, y2 - 52, 620, 80, { fill: C.panel2 });
    T(mg, x2 + 30, y2, s, { size: 34, weight: 600 });
  });
});

/* ---------------- symbols ---------------- */
scene('symbols', '指令说明中的符号约定', (g, L) => {
  const rows = [
    ['符号', '含义'], ['#data8、#data16', '8 位或 16 位立即数'], ['direct', '直接地址单元'], ['SFR', '特殊功能寄存器'],
    ['Rn (n = 0~7)', '通用寄存器 R0~R7'], ['@Ri (i = 0、1)', '间接寻址寄存器（只能 R0、R1）'], ['Pi (i = 0~3)', '四个并行 I/O 口'],
    ['bit', '位操作数或位地址'], ['addr11、addr16', '11 位或 16 位目的地址'], ['(X)', 'X 地址单元或寄存器中的内容'], ['((X))', '以 (X) 为地址，再取该单元的内容']
  ];
  const tins = [L(1), L(1), L(1) + 3, L(2), L(2) + 2.5, L(3), L(3) + 3.5, L(4), L(4) + 2.5, L(5), L(6)];
  table(g, 260, 210, [460, 940], rows, { rh: 62, size: 28, mono: false, rowIn: tins, colColor: [C.gold, C.text] });
});

/* ---------------- 1 register addressing ---------------- */
scene('regaddr', '寻址方式 1：寄存器寻址', (g, L) => {
  note(g, 80, 210, 1760, ['一条指令的寻址方式，指的是 {g|源操作数} 的寻址方式'], 'key', L(0), { size: 30 });
  const cg = G(g, { in: L(2) });
  T(cg, 120, 420, 'MOV A,Rn', { size: 48, mono: true, fill: C.cyan, weight: 700 });
  T(cg, 120, 470, '源操作数在工作寄存器 Rn（R0~R7）中', { size: 28, fill: C.muted });
  const dg = G(g, { in: L(3) });
  pill(dg, 120, 540, 420, 46, '演示数据（课件未给出）', { size: 22, stroke: C.violet, fill: C.violet, bg: 'rgba(167,139,250,.1)' });
  T(dg, 120, 660, 'MOV A,R5', { size: 44, mono: true, fill: C.gold, weight: 700 });
  const rg = G(g, { in: L(3) });
  const R = regs(rg, 1000, 520, [['R5', '3AH'], ['A', '??']], { w: 220, h: 90, gx: 200 });
  const ag = G(g, { in: L(4) });
  arrow(ag, 1230, 565, 1410, 565, C.gold, 4);
  R.set(L(4) + 0.6, 'A', '3AH');
  R.focus(L(4), L(4) + 3, 'R5');
  T(ag, 1000, 720, 'A ← (R5)；R5 不变', { size: 30, fill: C.green });
});

/* ---------------- 2 direct ---------------- */
scene('direct', '寻址方式 2：直接寻址', (g, L) => {
  const fg = G(g, { in: L(1) });
  T(fg, 120, 260, 'MOV A,direct', { size: 40, mono: true, fill: C.cyan, weight: 700 });
  T(fg, 620, 260, 'MOV direct1,direct2', { size: 40, mono: true, fill: C.cyan, weight: 700 });
  const eg = G(g, { in: L(2) });
  T(eg, 120, 370, 'MOV A,50H', { size: 48, mono: true, fill: C.gold, weight: 700 });
  T(eg, 120, 420, '50H 是地址，不是数据！', { size: 28, fill: C.red });
  const M = mem(eg, 620, 320, [['51H', '…'], ['50H', '(50H)'], ['4FH', '…']], { w: 180, h: 56 });
  M.focus(L(2) + 1, end('direct', 2) + 0.5, '50H', C.gold);
  const R = regs(eg, 1220, 375, [['A', '?']], { w: 200, h: 70 });
  arrow(eg, 935, 410, 1200, 410, C.gold, 4);
  R.set(end('direct', 2) - 1.2, 'A', '(50H)');
  const sg = G(g, { in: L(3) });
  T(sg, 120, 580, '直接寻址可访问三种地址空间：', { size: 32, weight: 600 });
  const sp = [['SFR 特殊功能寄存器', '唯一能访问 SFR 的寻址方式', L(4)], ['片内 RAM 低 128 字节', '00H~7FH', L(5)], ['位地址空间', '如 MOV C,20H（位地址）', L(5) + 2.5]];
  sp.forEach(([a, b, t], k) => {
    const cg = G(sg, { in: t });
    card(cg, 120 + k * 580, 620, 540, 140, { fill: C.panel2 });
    T(cg, 150 + k * 580, 680, a, { size: 32, fill: C.cyan, weight: 700, maxw: 480 });
    T(cg, 150 + k * 580, 730, b, { size: 26, fill: C.muted, maxw: 480 });
  });
  note(g, 120, 800, 1680, ['对特殊功能寄存器的操作，都算直接寻址'], 'key', L(6), { size: 30 });
});

/* ---------------- 3 indirect ---------------- */
scene('indirect', '寻址方式 3：寄存器间接寻址', (g, L, Ee) => {
  const ig = G(g, { in: L(0), out: L(4) - 0.3 });
  T(ig, 100, 260, '寄存器的内容 = 地址；该地址单元的内容 = 操作数', { size: 34, fill: C.cyan });
  const pg = G(ig, { in: L(1) });
  ['@R0', '@R1', '@DPTR'].forEach((s, k) => pill(pg, 100 + k * 220, 300, 190, 60, s, { size: 32, mono: true }));
  T(pg, 800, 342, '只有这三个，且必须写 @', { size: 30, fill: C.gold });
  const ag = G(ig, { in: L(2) });
  card(ag, 100, 420, 840, 180, { fill: C.panel2 });
  T(ag, 130, 480, '@R0、@R1：8 位地址', { size: 32, fill: C.cyan, weight: 700 });
  T(ag, 130, 540, '片内 / 片外数据 RAM 的 256 个单元', { size: 28 });
  const bg = G(ig, { in: L(3) });
  card(bg, 980, 420, 840, 180, { fill: C.panel2 });
  T(bg, 1010, 480, '@DPTR：16 位地址', { size: 32, fill: C.cyan, weight: 700 });
  T(bg, 1010, 540, '片外数据 RAM 的 64K 个单元', { size: 28 });
  // the worked question
  const qg = G(g, { in: L(4) });
  T(qg, 100, 250, '例题（P12）：(R0) = 65H，(65H) = 47H，执行 MOV A,@R0 后 (A) = ？', { size: 34, maxw: 1700 });
  const R = regs(qg, 160, 420, [['R0', '65H'], ['A', '??']], { w: 200, h: 80, gx: 0, gy: 150, cols: 1 });
  const M = mem(qg, 1080, 330, [['66H', '…'], ['65H', '47H'], ['64H', '…']], { w: 200, h: 70, title: '片内 RAM' });
  const s1 = G(qg, { in: L(5) });
  D(path(s1, 'M370 460 C 620 460, 820 430, 1060 430', C.cyan, 4), L(5) + 0.3, 1.2);
  T(s1, 560, 410, '① 65H 当作地址', { size: 28, fill: C.cyan });
  const s2 = G(qg, { in: L(6) });
  D(path(s2, 'M1180 470 C 1000 640, 600 700, 370 610', C.gold, 4), L(6) + 0.3, 1.2);
  T(s2, 640, 720, '② 取出 47H 送入 A', { size: 28, fill: C.gold });
  M.focus(L(5) + 1, L(7), '65H', C.cyan);
  R.set(L(6) + 1.6, 'A', '47H');
  T(G(qg, { in: L(7) }), 1480, 470, 'R0、(65H) 不变', { size: 28, fill: C.green });
  const xg = G(g, { in: L(8) });
  card(xg, 100, 780, 1720, 140, { fill: 'rgba(6,14,28,.95)', stroke: C.violet });
  T(xg, 140, 838, 'MOV  A,@R0  → 片内 RAM', { size: 34, mono: true, fill: C.cyan });
  T(xg, 140, 890, 'MOVX A,@R0  → 片外 RAM', { size: 34, mono: true, fill: C.violet });
  T(xg, 1000, 865, '写法相同，操作域不同，靠助记符区分', { size: 28, fill: C.text });
});

/* ---------------- 4 immediate ---------------- */
scene('imm', '寻址方式 4：立即寻址', (g, L) => {
  const fg = G(g, { in: L(0) });
  T(fg, 120, 260, '操作数直接写在指令中，用 # 表示立即数', { size: 34, fill: C.cyan });
  const cd = code(g, 120, 320, [['MOV A,#30H', ';(A) = 30H'], ['MOV A,#10000111B', ';二进制 → 87H'], ['MOV R1,#50', ';十进制 50 → 32H'], ['MOV R1,#0FDH', ';十六进制，F 开头补 0']], { w: 1000, cw: 440, lh: 64, size: 32 });
  cd.step(L(1), 0).step(L(3), 1).step(L(4), 2).step(L(5), 3).off(L(6));
  const rg = G(g, { in: L(1) });
  const R = regs(rg, 1300, 380, [['A', '--'], ['R1', '--']], { w: 220, h: 80, cols: 1, gy: 90 });
  R.set(L(1) + 1.5, 'A', '30H').set(L(3) + 3.5, 'A', '87H').set(L(4) + 4, 'R1', '32H').set(L(5) + 2.5, 'R1', 'FDH');
  const tg = G(g, { in: L(2) });
  ['十进制', '十六进制 H', '二进制 B'].forEach((s, k) => pill(tg, 120 + k * 260, 640, 230, 50, s, { size: 24 }));
  note(g, 120, 720, 1100, ['立即数只能作为{g|源操作数}，不能作目的操作数'], 'key', L(6), { size: 30 });
  note(g, 1260, 720, 560, ['P13「原操作数」应为', '「源操作数」（笔误）'], 'warn', L(7), { size: 26 });
});

/* ---------------- 5 bit addressing ---------------- */
scene('bitaddr', '寻址方式 5：位寻址与位地址表', (g, L) => {
  const ig = G(g, { in: L(0), out: L(4) - 0.3 });
  T(ig, 120, 300, 'MOV C,P1.1', { size: 52, mono: true, fill: C.cyan, weight: 700 });
  T(ig, 120, 360, '把 P1 口第 1 位的状态送到进位标志 C（CY）', { size: 30, fill: C.muted });
  const bg = G(ig, { in: L(2) });
  card(bg, 120, 430, 820, 160, { fill: C.panel2 });
  T(bg, 150, 490, '片内 RAM 位寻址区', { size: 32, fill: C.cyan, weight: 700 });
  T(bg, 150, 545, '字节 20H~2FH', { size: 28 });
  card(bg, 980, 430, 820, 160, { fill: C.panel2 });
  T(bg, 1010, 490, '可位寻址的 SFR', { size: 32, fill: C.cyan, weight: 700 });
  T(bg, 1010, 545, '字节地址能被 8 整除（如 80H、88H、D0H、E0H…）', { size: 28, maxw: 760 });
  const nb = G(ig, { in: L(3) });
  ['16 个字节', '128 位', '位地址 00H~7FH'].forEach((s, k) => pill(nb, 120 + k * 400, 650, 360, 60, s, { size: 30 }));
  // bit address table
  const tg = G(g, { in: L(4) });
  const rows = [['字节', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0']];
  const hx = n => n.toString(16).toUpperCase().padStart(2, '0') + 'H';
  for (let b = 0x2F; b >= 0x20; b--) rows.push([hx(b), ...[7, 6, 5, 4, 3, 2, 1, 0].map(k => hx((b - 0x20) * 8 + k))]);
  const tb = table(tg, 80, 200, [110, 92, 92, 92, 92, 92, 92, 92, 92], rows, { rh: 41, size: 22, mono: true, colColor: [C.gold] });
  const rowOf = b => 0x2F - b + 1;
  tb.hl(rowOf(0x20), 8, L(4) + 1, L(5)); tb.hl(rowOf(0x20), 1, L(4) + 2, L(5));
  tb.hl(rowOf(0x21), 8, L(5), L(6)); tb.hl(rowOf(0x21), 1, L(5) + 0.6, L(6));
  tb.hl(rowOf(0x2F), 8, L(5) + 3, L(6)); tb.hl(rowOf(0x2F), 1, L(5) + 3.5, L(6));
  tb.hl(rowOf(0x24), 0, L(7), end('bitaddr', 9) + 0.5); tb.hl(rowOf(0x24), 7, L(7) + 2, end('bitaddr', 10));
  tb.hl(rowOf(0x21), 0, L(9) + 2.5, end('bitaddr', 9) + 0.5);
  const fg = G(g, { in: L(6) });
  card(fg, 1000, 200, 840, 170, { fill: 'rgba(6,14,28,.95)', stroke: C.violet });
  T(fg, 1030, 252, '规律（补充）：', { size: 26, fill: C.violet });
  T(fg, 1030, 305, '位地址 = (字节地址 − 20H) × 8 + 位号', { size: 32, fill: C.text, weight: 600, maxw: 790 });
  const eg = G(g, { in: L(7) });
  T(eg, 1030, 350, '24H.1 → (24H−20H)×8+1 = 20H+1 = {g|21H}', { size: 28, mono: true, maxw: 790 });
  const ig2 = G(g, { in: L(8) });
  card(ig2, 1000, 400, 840, 170, { fill: C.panel2 });
  T(ig2, 1030, 460, 'MOV 24H.1,C', { size: 36, mono: true, fill: C.cyan, weight: 700 });
  T(ig2, 1030, 520, 'MOV 21H,C', { size: 36, mono: true, fill: C.cyan, weight: 700 });
  T(ig2, 1450, 495, '功能相同', { size: 32, fill: C.green, weight: 700 });
  note(g, 1000, 600, 840, ['位地址 21H（24H 字节的 D1）', '≠ 字节地址 21H 那个单元'], 'key', L(9), { size: 28 });
  const wg = G(g, { in: L(10) });
  card(wg, 1000, 790, 840, 130, { fill: 'rgba(255,122,107,.08)', stroke: C.red });
  T(wg, 1030, 845, '✗ MOV 24H.1,1', { size: 36, mono: true, fill: C.red, weight: 700 });
  T(wg, 1030, 895, '位传送必须有一个操作数是 C', { size: 28 });
});

/* ---------------- 6 indexed ---------------- */
scene('index', '寻址方式 6：变址间接寻址', (g, L) => {
  T(g, 100, 250, '有效地址 = 基址寄存器内容 + 变址寄存器内容', { size: 36, fill: C.cyan });
  const bg = G(g, { in: L(1) });
  pill(bg, 100, 290, 480, 56, '基址：PC 或 DPTR', { size: 28 });
  pill(bg, 620, 290, 380, 56, '变址：A', { size: 28, stroke: C.gold, fill: C.gold, bg: 'rgba(247,197,72,.08)' });
  const ig = G(g, { in: L(2) });
  ['MOVC A,@A+DPTR', 'MOVC A,@A+PC', 'JMP  @A+DPTR'].forEach((s, k) => T(ig, 100 + k * 600, 430, s, { size: 36, mono: true, weight: 700, fill: k === 2 ? C.violet : C.text }));
  const dg = G(g, { in: L(3) });
  const R = regs(dg, 200, 560, [['DPTR（基地址）', '表首'], ['A（偏移量）', 'n']], { w: 260, h: 80, cols: 1, gy: 100, ls: 24 });
  T(dg, 520, 615, '+', { size: 60, fill: C.gold, anchor: 'middle' });
  const ag = G(g, { in: L(4) });
  arrow(ag, 500, 660, 860, 660, C.gold, 4);
  const M = mem(ag, 880, 520, [['表首+n+1', '…'], ['表首+n', '表项 n'], ['表首+n−1', '…']], { w: 220, h: 70, aw: 180, title: '程序存储器 ROM' });
  D(path(ag, 'M1290 640 C 1450 640, 1450 860, 1100 860 S 380 860, 330 760', C.cyan, 4), L(4) + 2, 1.4);
  R.set(L(4) + 3.2, 'A（偏移量）', '表项 n');
  note(g, 1360, 480, 470, ['A 可随时改变', '→ 地址动态变化', '→ 主要用于{g|查表}'], 'key', L(5), { size: 28 });
});

/* ---------------- 7 relative ---------------- */
scene('rel', '寻址方式 7：相对寻址', (g, L) => {
  T(g, 100, 250, '新地址 = PC 当前值 + rel（带符号偏移量）', { size: 36, fill: C.cyan });
  const pg = G(g, { in: L(1) });
  const M = mem(pg, 300, 320, [['2062H', '目标指令'], ['…', '…'], ['2032H', '下一条'], ['2031H', 'rel=30H'], ['2030H', 'SJMP 操作码']], { w: 260, h: 70, aw: 120, gap: 12, old: false });
  T(pg, 550, 300, '程序存储器', { size: 24, fill: C.muted, anchor: 'middle' });
  const P = G(g, { in: L(2) });
  pointer(P, 315, 0, 'PC', [[L(2), M.yOf('2030H')], [L(2) + 2.6, M.yOf('2032H')], [L(3) + 2.5, M.yOf('2062H')]]);
  const cg = G(g, { in: L(2) + 2.6 });
  T(cg, 720, 420, 'SJMP 是 2 字节指令', { size: 32 });
  T(cg, 720, 470, '取完指令后 PC = {g|2032H}（PC 当前值）', { size: 32 });
  const sg = G(g, { in: L(3) });
  column(sg, 1220, 560, [{ s: '2032H', in: L(3) }, { s: '+  30H', in: L(3) + 0.8 }, { line: true, in: L(3) + 1.6 }, { s: '2062H', in: L(3) + 1.8, fill: C.gold }], { size: 40, lh: 56, lw: 300 });
  const rg = G(g, { in: L(4) });
  card(rg, 720, 760, 1100, 160, { fill: C.panel2 });
  T(rg, 750, 815, 'rel：8 位带符号数，最高位为符号位，用{g|补码}表示', { size: 30, maxw: 1040 });
  T(G(rg, { in: L(5) }), 750, 875, '范围：以 PC 当前值为起点  −128 ~ +127', { size: 32, fill: C.gold, weight: 700 });
});

/* ---------------- summary ---------------- */
scene('summary', '寻址方式小结 · 3.2 指令分类', (g, L) => {
  const sg = G(g, { in: L(0), out: L(7) - 0.3 });
  const rows = [
    ['寻址方式', '寻址空间 / 寄存器'],
    ['1 寄存器寻址', 'R0~R7，A，B，Cy，DPTR'],
    ['2 直接寻址', '片内 RAM 低 128 字节，SFR'],
    ['3 寄存器间接寻址', '片内 RAM：@R0、@R1、SP；片外 RAM：@R0、@R1、@DPTR'],
    ['4 立即寻址', '程序存储器中的立即数'],
    ['5 变址间接寻址', '程序存储器：@A+DPTR，@A+PC'],
    ['6 相对寻址', 'PC 当前值 + rel，−128 ~ +127'],
    ['7 位寻址', '片内 RAM 和 SFR 中的可位寻址单元']
  ];
  table(sg, 120, 210, [400, 1280], rows, { rh: 70, size: 28, rowIn: [L(0), L(1), L(2), L(3), L(4), L(4) + 3.5, L(5), L(5) + 4], colColor: [C.gold] });
  note(sg, 120, 790, 1680, ['B：除 MUL AB、DIV AB 中隐含使用外，按编码一般用直接地址 F0H 访问（如 MOV A,B 实为 MOV A,0F0H）'], 'add', L(6), { size: 26 });
  const cg = G(g, { in: L(7) });
  T(cg, 960, 250, '3.2 MCS-51 指令按功能分类：共 111 条', { size: 40, anchor: 'middle', weight: 700 });
  const cats = [['数据传送', 28, C.cyan], ['算术运算', 24, C.gold], ['逻辑运算', 25, C.orange], ['控制转移', 17, C.violet], ['位操作', 17, C.green]];
  let x = 160; const W = 1600;
  cats.forEach(([n, c, col], k) => {
    const w = W * c / 111;
    const bg = G(cg, { in: L(8) + (k < 3 ? k * 1.4 : 0) + (k >= 3 ? end('summary', 8) - L(8) + (k - 3) * 1.4 : 0) });
    el('rect', { x, y: 340, width: w - 6, height: 120, rx: 10, fill: col, opacity: 0.85 }, bg);
    T(bg, x + w / 2, 395, n, { size: 28, anchor: 'middle', fill: C.bg1, weight: 700, maxw: w - 12 });
    T(bg, x + w / 2, 440, c + ' 条', { size: 30, anchor: 'middle', fill: C.bg1, weight: 700 });
    x += w;
  });
  const bg2 = G(cg, { in: L(8) + 1.4 });
  el('path', { d: `M${160 + W * 28 / 111} 480 v20 H${160 + W * 77 / 111 - 6} v-20`, stroke: C.text, fill: 'none', 'stroke-width': 2 }, bg2);
  T(bg2, 160 + W * 52.5 / 111, 540, '算术逻辑运算 49 条', { size: 28, anchor: 'middle' });
  const sumg = G(cg, { in: L(9) + 3 });
  T(sumg, 960, 660, '28 + 49 + 17 + 17 = 111', { size: 56, mono: true, anchor: 'middle', fill: C.gold, weight: 700 });
  const ng = G(cg, { in: L(10) });
  pill(ng, 660, 760, 600, 70, '下一集：3.3 数据传送指令 →', { size: 32 });
});
})();
