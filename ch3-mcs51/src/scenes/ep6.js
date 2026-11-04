/* Episode 6: assembly language, pseudo-instructions, review (P89–P96) */
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

/* ---------------- intro: structure, instruction vs pseudo-instruction, ORG (P89–P90) ---------------- */
S.push(() => {
  const id = 'intro6', g = sceneGroup(id);
  const L = i => at(id, i), Ee = i => end(id, i);
  const tg = G(g, { in: SC[id].t0, out: L(1) - 0.2 });
  T(tg, 960, 400, '第 6 集', { size: 40, fill: C.cyan, anchor: 'middle' });
  T(tg, 960, 510, '3.7 汇编语言、伪指令', { size: 92, anchor: 'middle', weight: 700 });
  T(tg, 960, 590, '+ 全章复习要点', { size: 36, anchor: 'middle', fill: C.gold });
  const pg = G(g, { in: L(1) });
  title(pg, id, '3.7.1 汇编语言的结构 · 3.7.2 伪指令', 'P89–P90');
  const parts = [['LOOP:', C.violet, '标号'], ['ADD', C.gold, '操作码'], ['A, 30H', C.cyan, '操作数'], [';(A)+(30H)→A', C.green, '注释']];
  let x = 140;
  parts.forEach(([s, col, lab], k) => {
    const cg = G(pg, { in: k === 0 ? L(1) : L(2) + (k - 1) * 1.2 });
    T(cg, x, 300, s, { size: 48, mono: true, fill: col, weight: 700 });
    T(cg, x, 350, lab, { size: 28, fill: col });
    x += [220, 160, 280, 400][k] + 40;
  });
  const cg = G(pg, { in: L(3) });
  card(cg, 140, 420, 790, 230, { fill: C.panel2, stroke: C.cyan });
  T(cg, 170, 480, '指令', { size: 36, fill: C.cyan, weight: 700 });
  T(cg, 170, 540, '能汇编成目标代码', { size: 30 });
  T(cg, 170, 595, '能被计算机识别和执行', { size: 30 });
  const pc = G(pg, { in: L(4) });
  card(pc, 990, 420, 790, 230, { fill: C.panel2, stroke: C.gold });
  T(pc, 1020, 480, '伪指令', { size: 36, fill: C.gold, weight: 700 });
  T(pc, 1020, 540, '用来控制汇编过程', { size: 30 });
  T(pc, 1020, 595, '{r|不}产生目标代码，{r|不}能被执行', { size: 30 });
  const og = G(pg, { in: L(5) });
  card(og, 140, 690, 1640, 220, { fill: 'rgba(6,14,28,.95)', stroke: C.violet });
  T(og, 170, 750, '(1) ORG xxxxH   起点指令（常为双字节数据）', { size: 32, mono: true, fill: C.violet, weight: 700, maxw: 1580 });
  const og2 = G(og, { in: L(6) });
  T(og2, 170, 815, '规定其后程序或数据块的起始地址', { size: 30 });
  T(og2, 170, 875, 'ORG 8100H → 下一条指令存放在 8100H', { size: 30, mono: true, fill: C.gold });
});

/* ---------------- DB (P91) ---------------- */
scene('db', '(2) DB 定义字节与 MOVC 取数', (g, L, Ee, F) => {
  const K = code(g, 60, 220, [['      ORG 2100H', ''], ['FIRST: DB 01,32,83', ';二/十/十六进制均可']], { w: 900, cw: 330, lh: 64, size: 30, reveal: 'all' });
  K.step(L(1), 0).step(F(1, 0.5), 1).off(L(5));
  const M = mem(G(g, { in: L(2) }), 1100, 230, [['2100H', '--'], ['2101H', '--'], ['2102H', '--']], { w: 220, h: 66, gap: 12, aw: 120, title: '程序存储器', old: false });
  M.set(F(2, 0.65), '2100H', '01').set(F(2, 0.75), '2101H', '32').set(F(2, 0.85), '2102H', '83');
  T(G(g, { in: F(2, 0.3) }), 1450, M.yOf('2100H') + 9, '← FIRST', { size: 28, fill: C.violet, mono: true });
  const hg = G(g, { in: L(3) });
  T(hg, 1450, M.yOf('2101H') + 9, '= 20H（十进制 32）', { size: 26, fill: C.gold });
  T(hg, 1450, M.yOf('2102H') + 9, '= 53H（十进制 83）', { size: 26, fill: C.gold });
  const ag = G(g, { in: L(4) });
  card(ag, 60, 400, 900, 170, { fill: C.panel2 });
  T(ag, 90, 450, '等价写法：', { size: 26, fill: C.muted });
  T(ag, 90, 500, 'FIRST: DB 01', { size: 28, mono: true });
  T(ag, 90, 545, '       DB 32   DB 83', { size: 28, mono: true });
  const K2 = code(G(g, { in: L(5) }), 60, 610, [['MOV DPTR,#FIRST', ';表首'], ['MOV A,#NN', ';NN=0,1,2'], ['MOVC A,@A+DPTR', ';取数']], { w: 900, cw: 330, lh: 60, size: 30, reveal: 'all' });
  K2.step(L(5), 0).step(F(5, 0.5), 1).step(F(5, 0.75), 2).off(L(7));
  const R = regs(G(g, { in: L(6) }), 1100, 560, [['NN', '0'], ['A', '--']], { w: 160, h: 64, gx: 40 });
  [[0, '01', '2100H'], [1, '32', '2101H'], [2, '83', '2102H']].forEach(([n, v, a], k) => {
    const t = F(6, 0.05 + k * 0.32);
    R.set(t, 'NN', String(n)).set(t + 0.6, 'A', v);
    M.focus(t, t + 1.4, a, C.gold);
  });
  note(g, 1100, 700, 760, ['课件同页标号写作 FIRST、FITST、FIRST1，', '应为笔误，统一按 FIRST 理解'], 'warn', L(7), { size: 26 });
});

/* ---------------- DW / DS (P92) ---------------- */
scene('dwds', '(3) DW 定义字 · (4) DS 预留空单元', (g, L, Ee, F) => {
  const K = code(g, 60, 220, [['ORG 8000H', ''], ['DW 7603H,7589H', '']], { w: 760, lh: 64, size: 30 });
  K.step(L(1), 0).step(F(1, 0.5), 1).off(L(4));
  const M = mem(G(g, { in: L(1) }), 120, 410, [['8000H', '--'], ['8001H', '--'], ['8002H', '--'], ['8003H', '--']], { w: 180, h: 60, gap: 10, aw: 120, old: false });
  M.set(F(2, 0.25), '8000H', '76H').set(F(2, 0.45), '8001H', '03H').set(F(2, 0.65), '8002H', '75H').set(F(2, 0.85), '8003H', '89H');
  const hg = G(g, { in: L(3) });
  T(hg, 440, M.yOf('8000H') + 9, '← 高字节在低地址', { size: 26, fill: C.gold });
  T(hg, 440, M.yOf('8001H') + 9, '← 低字节在高地址', { size: 26, fill: C.cyan });
  const dg = G(g, { in: L(4) });
  const K2 = code(dg, 1000, 220, [['ORG 5000H', ''], ['DS 07H', ';预留 7 个单元'], ['MOV A,#7AH', ';从 5007H 开始'], ['ADD A,#22H', ';从 5009H 开始']], { w: 860, cw: 360, lh: 60, size: 30, reveal: 'step' });
  K2.step(L(4), 0).step(F(4, 0.4), 1).step(L(6), 2).step(F(6, 0.6), 3);
  const cells = G(dg, { in: L(5) });
  for (let k = 0; k < 11; k++) {
    const a = 0x5000 + k, x = 1000 + k * 78, y = 560;
    const reserved = k < 7;
    const gg = G(cells, { in: reserved ? L(5) + k * 0.25 : L(6) + (k - 7) * 0.5 + 0.5 });
    el('rect', { x, y, width: 72, height: 80, rx: 6, fill: reserved ? 'rgba(255,255,255,.04)' : 'rgba(61,213,243,.18)', stroke: reserved ? C.dim : C.cyan, 'stroke-width': 2, 'stroke-dasharray': reserved ? '5 4' : null }, gg);
    T(gg, x + 36, y + 50, reserved ? '空' : ['74H', '7AH', '24H', '22H'][k - 7], { size: 22, anchor: 'middle', mono: true, fill: reserved ? C.dim : C.text });
    T(gg, x + 36, y - 10, (a & 0xF).toString(16).toUpperCase(), { size: 18, anchor: 'middle', mono: true, fill: C.muted });
  }
  T(G(dg, { in: L(5) }), 1000, 520, '500xH：', { size: 22, fill: C.muted });
  const bg = G(dg, { in: L(5) + 2 });
  el('path', { d: 'M1000 660 v14 H1544 v-14', stroke: C.muted, fill: 'none', 'stroke-width': 2 }, bg);
  T(bg, 1272, 705, '5000H~5006H 预留（DS 07H）', { size: 24, anchor: 'middle', fill: C.muted });
  const mg = G(dg, { in: L(6) + 0.5 });
  T(mg, 1000, 760, 'MOV A,#7AH → 74H 7AH（5007H、5008H）', { size: 24, mono: true, fill: C.cyan, maxw: 860 });
  T(G(mg, { in: L(6) + 4 }), 1000, 800, 'ADD A,#22H → 24H 22H（5009H、500AH）补充', { size: 24, mono: true, fill: C.violet, maxw: 860 });
  note(g, 60, 840, 860, ['课件“从 5000H 开使”应为“开始”（笔误）'], 'warn', L(6), { size: 24 });
});

/* ---------------- EQU (P93–P94) ---------------- */
scene('equ', '(5) EQU 赋值伪指令', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(7) - 0.2 });
  T(G(p1, { in: L(1) }), 80, 260, 'MAA EQU 30H    ; MAA 与 30H 等价', { size: 36, mono: true, fill: C.cyan, weight: 700 });
  T(G(p1, { in: L(1) + 3 }), 80, 320, 'MOV MAA,#44H  ≡  MOV 30H,#44H', { size: 32, mono: true });
  const dg = G(p1, { in: L(2) });
  const M = mem(dg, 1300, 380, [['30H', '50H']], { w: 180, h: 70, aw: 80, old: false, title: '已知' });
  const K = code(dg, 80, 400, [['MOV A,#MAA', ';A=30H'], ['MOV A,MAA', ';A=50H'], ['LJMP MAA', ';课件：PC=50H ✗']], { w: 1000, cw: 420, lh: 70, size: 34 });
  K.step(L(3), 0).step(L(4), 1).step(L(5), 2);
  const R = regs(dg, 1300, 560, [['A', '--'], ['PC', '--']], { w: 200, h: 70, gx: 40 });
  R.set(F(3, 0.6), 'A', '30H');
  M.focus(L(4), Ee(4), '30H', C.cyan); R.set(F(4, 0.7), 'A', '50H');
  R.set(F(6, 0.6), 'PC', '0030H');
  note(dg, 80, 680, 1000, ['LJMP 的操作数是目标地址本身：', 'PC = MAA = {g|0030H}，不是 (30H) = 50H'], 'warn', L(6), { size: 30 });
  const p2 = G(g, { in: L(7) });
  note(p2, 80, 220, 1760, ['给表达式或字符串命名，相当于变量赋值；EQU 只能给标号赋值{g|一次}，程序中不能更改'], 'key', L(7), { size: 28 });
  const K2 = code(G(p2, { in: L(8) }), 80, 380, [['LOOP EQU 8300H', ';LOOP = 8300H'], ['MOV A,#50H', ''], ['MOV DPTR,#LOOP', ';16 位地址进 DPTR'], ['MOVX @DPTR,A', ';(8300H)=50H']], { w: 1000, cw: 420, lh: 64, size: 32 });
  K2.step(L(8), 0).step(F(8, 0.55), 1).step(F(8, 0.7), 2).step(F(8, 0.85), 3);
  const R2 = regs(p2, 1200, 420, [['A', '--'], ['DPTR', '--']], { w: 200, h: 70, gx: 40 });
  const X = mem(p2, 1200, 600, [['8300H', '--']], { w: 200, h: 70, aw: 110, title: '片外 RAM' });
  R2.set(F(8, 0.6), 'A', '50H').set(F(8, 0.75), 'DPTR', '8300H'); X.set(F(8, 0.92), '8300H', '50H');
  note(p2, 80, 700, 1000, ['8 位与 16 位地址的区别：16 位地址', '相当于一个标号，经 DPTR 间接访问'], 'key', L(9), { size: 26 });
  note(p2, 1140, 700, 720, ['课件：EQU 可用“=”代替。', '取决于汇编器，{o|未能核实}，以手册为准'], 'warn', L(10), { size: 26, tag: '⚠ 待核实' });
});

/* ---------------- DATA/XDATA, BIT, END, DL (P94–P95) ---------------- */
scene('databit', '(6)~(9) DATA/XDATA、BIT、END、DL', (g, L, Ee, F) => {
  const rows = [['伪指令', '功能', '课件例子'], ['DATA / XDATA', '为内部 / 外部 RAM 单元命名', 'JIEGUO DATA 50H　KAI XDATA 2040H'], ['BIT', '为位地址单元命名（一个二进制位）', 'XIAO BIT 20H　CG BIT PSW.5（即 F0）'],
    ['END', '程序结束：其后内容不再生成目标代码', 'END'], ['DL', '定义标号值，可多次赋值', 'COUNT1 DL 2300H　COUNT2 DL COUNT1+1']];
  table(g, 60, 220, [300, 680, 820], rows, { rh: 84, size: 28, rowIn: [L(0), L(0), L(2), L(4), L(5)], colColor: [C.gold] });
  const cg = G(g, { in: L(5) + 3 });
  const R = regs(cg, 300, 700, [['COUNT1', '2300H'], ['COUNT2', '2301H']], { w: 220, h: 70, gx: 60, old: false });
  T(G(g, { in: L(6) }), 60, 860, '与 EQU 不同：DL 可对同一标号多次赋值', { size: 28, fill: C.green });
  note(g, 900, 660, 960, ['常见 Intel ASM51 / Keil A51 中未找到 DL；', 'Keil A51 可重复赋值的是 SET。以课程所用汇编器为准'], 'warn', L(7), { size: 26, tag: '⚠ 待核实' });
});

/* ---------------- review (P96) ---------------- */
scene('review', '复习要点与全章总结', (g, L, Ee, F) => {
  const items = [
    ['寻址方式', '7 种；寄存器间接 / 变址 / 相对各访问哪里', '第 1 集'],
    ['111 条指令', '数据传送 28 · 算术 24 · 逻辑 25 · 控制转移 17 · 位操作 17', '第 1 集'],
    ['堆栈', 'PUSH 先加后压，POP 先弹后减；SP 指向栈顶', '第 2、5 集'],
    ['累加器 A', 'MOVC、MOVX、XCH、DA 等必须用 A', '第 2–4 集'],
    ['访问存储器', '片内 RAM：MOV · 片外 RAM：MOVX · ROM：MOVC', '第 2 集'],
    ['写法是否正确', '✗ PUSH DPTR · ✗ MOV 24H.1,1 · ✗ MOV A,@R2 · ✗ A5H', '各集'],
    ['常用伪指令', 'ORG DB DW DS EQU DATA BIT END', '第 6 集']
  ];
  items.forEach(([a, b, ep], k) => {
    const rg = G(g, { in: L(k + 1) });
    const y = 210 + k * 98;
    card(rg, 60, y, 1800, 84, { fill: C.panel2 });
    T(rg, 90, y + 54, `${k + 1}. ${a}`, { size: 32, weight: 700, fill: C.gold, maxw: 380 });
    T(rg, 480, y + 54, b, { size: 28, maxw: 1150 });
    pill(rg, 1660, y + 20, 170, 44, ep, { size: 22 });
  });
  const eg = G(g, { in: L(8) });
  T(eg, 960, 225 + 7 * 98 + 10, '第 3 章 指令系统 · 全部讲完 ✓', { size: 30, anchor: 'middle', fill: C.green, weight: 700 });
});
})();
