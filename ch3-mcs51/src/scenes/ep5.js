/* Episode 5: control transfer instructions (P75–P88) */
'use strict';
(() => {
const E = window.ENG;
const { C, SC, at, end, el, T, G, D, U, card, pill, arrow, path, bullets, note, cell, regs, mem, bits, code, table, column,
  pointer, sceneGroup, title, prog, setAttrs, setRich, lerp, ease } = E;
const S = window.SCENES;
const scene = (id, head, fn) => S.push(() => {
  const g = sceneGroup(id);
  title(g, id, head, E.pagesLabel(SC[id].pages));
  const L = i => at(id, i), Ee = i => end(id, i), F = (i, k) => at(id, i) + (end(id, i) - at(id, i)) * k;
  fn(g, L, Ee, F);
});
const demo = (g, x, y, tin) => pill(G(g, { in: tin }), x, y, 380, 44, '演示数据（课件未给出）', { size: 21, stroke: C.violet, fill: C.violet, bg: 'rgba(167,139,250,.1)' });

/* ---------------- intro + call/return (P75–P76) ---------------- */
S.push(() => {
  const id = 'intro5', g = sceneGroup(id);
  const L = i => at(id, i), Ee = i => end(id, i), F = (i, k) => at(id, i) + (end(id, i) - at(id, i)) * k;
  const tg = G(g, { in: SC[id].t0, out: L(2) - 0.2 });
  T(tg, 960, 360, '第 5 集', { size: 40, fill: C.cyan, anchor: 'middle' });
  T(tg, 960, 470, '3.6 控制转移指令', { size: 96, anchor: 'middle', weight: 700 });
  ['3.6.1 无条件转移', '3.6.2 条件转移', '3.6.3 其它指令', '3.6.4 综合举例'].forEach((s, k) => pill(G(tg, { in: L(0) + 1.5 + k * 1.0 }), 210 + k * 390, 570, 350, 60, s, { size: 26 }));
  T(G(tg, { in: L(1) }), 960, 720, '让程序转向非顺序单元执行 → 产生分支或循环', { size: 34, anchor: 'middle', fill: C.gold });
  const pg = G(g, { in: L(2) });
  title(pg, id, '3.6.1 调用与返回：ACALL、LCALL、RET', 'P75–P76');
  const p1 = G(pg, { out: L(7) - 0.2 });
  // 64K space split into 32 pages of 2K
  const bx = 100, by = 300, bw = 1720;
  T(G(p1, { in: L(3) }), bx, by - 20, '程序存储器 64K = 32 个 2K 页（高 5 位 = 页号，低 11 位 = 页内地址）', { size: 26, fill: C.muted, maxw: 1700 });
  const pages = G(p1, { in: L(3) });
  for (let k = 0; k < 32; k++) el('rect', { x: bx + k * bw / 32, y: by, width: bw / 32 - 3, height: 70, rx: 4, fill: k === 2 ? 'rgba(247,197,72,.5)' : C.panel2, stroke: C.line }, pages);
  T(pages, bx + 2.5 * bw / 32, by + 110, 'ACALL / AJMP：只能在当前 2K 页内', { size: 26, fill: C.gold, anchor: 'start' });
  const lc = G(p1, { in: L(5) });
  el('rect', { x: bx - 4, y: by - 6, width: bw + 4, height: 82, rx: 6, fill: 'none', stroke: C.cyan, 'stroke-width': 4 }, lc);
  T(lc, bx, by + 160, 'LCALL / LJMP：64K 任意位置', { size: 26, fill: C.cyan });
  table(G(p1, { in: L(3) }), 100, 520, [300, 420, 900], [['指令', '目标地址', '说明'], ['ACALL addr11', '改 PC 低 11 位', '子程序首地址必须在 2K 页内'], ['LCALL addr16', '16 位地址', '可在 64K 的任何位置'], ['RET', '从栈中取回', '子程序末尾，返回调用处']],
    { rh: 64, size: 28, rowIn: [L(3), L(3), L(5), L(6)], colColor: [C.gold] });
  note(p1, 100, 800, 1720, ['精确说：子程序须与 ACALL {g|下一条指令}的地址处在同一 2KB 页（PC 高 5 位不变）'], 'add', L(4), { size: 26 });
  // demo: LCALL push / RET pop
  const p2 = G(pg, { in: L(7) });
  demo(p2, 100, 210, L(7));
  const K = code(p2, 100, 280, [['1000H: LCALL 3000H', ';3 字节'], ['1003H: ……', ';返回到这里'], ['3000H: ……', ';子程序'], ['        RET', '']], { w: 760, cw: 260, lh: 64, size: 30, reveal: 'all' });
  K.step(L(7) + 2, 0).step(F(8, 0.92), 2).step(L(9), 3).step(F(9, 0.85), 1);
  const R = regs(p2, 960, 300, [['PC', '1000H'], ['SP', '60H']], { w: 200, h: 70, gx: 40 });
  const M = mem(p2, 1440, 270, [['63H', '--'], ['62H', '--'], ['61H', '--'], ['60H', '--']], { w: 160, h: 64, gap: 10, aw: 90, title: '堆栈' });
  pointer(p2, 1698, M.yOf('60H'), 'SP', [[L(7), M.yOf('60H')], [F(8, 0.45), M.yOf('61H')], [F(8, 0.65), M.yOf('62H')], [F(9, 0.55), M.yOf('60H')]], { side: 'right' });
  M.set(F(8, 0.5), '61H', '03H').set(F(8, 0.7), '62H', '10H');
  R.set(F(8, 0.45), 'SP', '61H').set(F(8, 0.65), 'SP', '62H').set(F(8, 0.9), 'PC', '3000H');
  R.set(F(9, 0.5), 'PC', '1003H').set(F(9, 0.55), 'SP', '60H');
  const ng = G(p2, { in: L(8) });
  T(ng, 960, 470, '返回地址 = 1003H（下一条指令）', { size: 28, fill: C.gold });
  T(ng, 960, 520, '先压低字节 03H，再压高字节 10H', { size: 26, fill: C.muted });
  note(p2, 100, 600, 1720, ['调用：自动把返回地址压栈 → PC = 子程序地址；RET：从栈弹回 PC'], 'key', L(9), { size: 30 });
});

/* ---------------- AJMP / LJMP / SJMP + rel calculation (P77–P78) ---------------- */
scene('jumps', '无条件跳转 AJMP、LJMP、SJMP 与偏移量', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(4) - 0.2 });
  table(p1, 100, 230, [340, 520, 840], [['指令', '跳转范围', '说明'], ['AJMP addr11', '2K 页内', '只改变低 11 位地址'], ['LJMP addr16', '64K 任意位置', '16 位目标地址'], ['SJMP rel', 'PC 当前值 −128 ~ +127', '相对跳转，通常写标号']],
    { rh: 76, size: 30, rowIn: [L(0), L(0), L(1), L(2)], colColor: [C.gold] });
  const dg = G(p1, { in: L(3) });
  arrow(dg, 960, 700, 500, 700, C.violet, 5); T(dg, 520, 680, 'rel < 0：向小地址', { size: 28, fill: C.violet });
  arrow(dg, 960, 780, 1420, 780, C.green, 5); T(dg, 1010, 830, 'rel > 0：向大地址', { size: 28, fill: C.green });
  const p2 = G(g, { in: L(4) });
  const M = mem(p2, 220, 240, [['8000H', 'MAIN: MOV A,#01H'], ['8002H', 'ADD A,#02H'], ['…', '…'], ['8006H', 'SJMP MAIN/DIR'], ['8008H', 'MOV A,@R0'], ['…', '…'], ['800FH', 'DIR: MOV A,R2']],
    { w: 420, h: 66, gap: 12, aw: 130, size: 26, old: false });
  M.focus(L(4), Ee(4), '8006H', C.gold);
  const ptr = G(p2, { in: L(6) });
  pointer(ptr, 200, M.yOf('8008H'), 'PC', []);
  T(ptr, 220, M.yOf('800FH') + 80, 'PC 当前值 = 8008H（SJMP 的下一条指令）', { size: 28, fill: C.gold });
  const fg = G(p2, { in: L(5) });
  card(fg, 1060, 240, 800, 120, { fill: 'rgba(247,197,72,.1)', stroke: C.gold });
  T(fg, 1460, 315, 'e = 目的地址 − PC 当前值（补码）', { size: 34, anchor: 'middle', fill: C.gold, weight: 700, maxw: 760 });
  const m1 = G(p2, { in: L(7) });
  card(m1, 1060, 400, 800, 170, { fill: C.panel2, stroke: C.violet });
  T(m1, 1090, 455, '→ MAIN：8000H − 8008H = −8', { size: 32, mono: true, maxw: 740 });
  T(m1, 1090, 525, '−8 的补码 = F8H', { size: 36, mono: true, fill: C.violet, weight: 700 });
  D(path(m1, `M770 ${M.yOf('8006H')} C 940 ${M.yOf('8006H')}, 940 ${M.yOf('8000H')}, 770 ${M.yOf('8000H')}`, C.violet, 4), L(7) + 0.5, 0.8);
  const m2 = G(p2, { in: L(8) });
  card(m2, 1060, 600, 800, 120, { fill: C.panel2, stroke: C.green });
  T(m2, 1090, 675, '→ DIR：800FH − 8008H = 07H', { size: 32, mono: true, fill: C.green, weight: 700, maxw: 740 });
  D(path(m2, `M770 ${M.yOf('8006H') + 10} C 1010 ${M.yOf('8006H')}, 1010 ${M.yOf('800FH')}, 770 ${M.yOf('800FH')}`, C.green, 4), L(8) + 0.5, 0.8);
  note(p2, 1060, 750, 800, ['目的地址 − 下一条指令的地址'], 'key', L(9), { size: 30 });
});

/* ---------------- JMP @A+DPTR jump table (P79–P80) ---------------- */
scene('jmpind', '间接转移 JMP @A+DPTR 与转移表', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(3) - 0.2 });
  T(G(p1, { in: L(0) }), 100, 300, 'JMP @A+DPTR    (PC) ← (A) + (DPTR)', { size: 46, mono: true, fill: C.cyan, weight: 700 });
  note(p1, 100, 380, 1720, ['DPTR 决定多分支转移程序的{g|首地址}，A 的内容动态{g|选择}其中某一分支'], 'key', L(1), { size: 30 });
  note(p1, 100, 560, 1720, ['一条间接转移指令代替了众多转移指令（多分支选择）'], 'ok', L(2), { size: 30 });
  const p2 = G(g, { in: L(3) });
  const K = code(p2, 60, 220, [['MOV DPTR,#JMP-TBL', ';表首地址送 DPTR'], ['JMP @A+DPTR', ';转向 (A)+(DPTR)'], ['……', ''], ['JMP-TBL: AJMP LABEL0', ''], ['         AJMP LABEL1', ''], ['         AJMP LABEL2', ''], ['         AJMP LABEL3', '']],
    { w: 860, cw: 330, lh: 60, size: 28 });
  K.step(L(3), 0).step(L(4), 1).step(L(5), 3).step(F(5, 0.3), 4).step(F(5, 0.55), 5).step(F(5, 0.8), 6).off(L(6));
  const rows = [];
  for (let k = 7; k >= 0; k--) rows.push([`表首+${k}`, k % 2 === 0 ? `AJMP LABEL${k / 2}` : '（地址字节）']);
  const M = mem(p2, 1000, 210, rows, { w: 300, h: 50, gap: 8, aw: 150, size: 22, old: false, title: '转移表（每条 AJMP 2 字节）' });
  const R = regs(p2, 1530, 260, [['A', '0/2/4/6'], ['DPTR', '表首']], { w: 220, h: 66, cols: 1, gy: 70 });
  const sg = G(p2, { in: L(6) });
  ['A=0 → +0', 'A=2 → +2', 'A=4 → +4', 'A=6 → +6'].forEach((s, k) => T(sg, 1530, 520 + k * 44, s, { size: 24, mono: true, fill: C.muted }));
  R.set(L(7), 'A', '04H');
  M.focus(L(7) + 1.5, Ee(7) + 0.5, '表首+4', C.gold);
  const ag = G(p2, { in: L(7) + 1 });
  D(path(ag, `M1525 ${290} C 1450 ${300}, 1420 ${M.yOf('表首+4')}, 1460 ${M.yOf('表首+4')}`, C.gold, 4), L(7) + 1, 0.8);
  T(G(p2, { in: L(7) + 3 }), 1000, 700, '→ 执行 AJMP LABEL2，到达 LABEL2', { size: 30, fill: C.green, weight: 700 });
  note(p2, 60, 700, 860, ['标号含“-”多数汇编器不接受，', '实际可写作 JMP_TBL'], 'add', L(8), { size: 26 });
});

/* ---------------- notes on transfer instructions (P81) ---------------- */
scene('jnotes', '转移类指令注意事项', (g, L, Ee, F) => {
  bullets(g, 80, 270, [['★ 调用与返回常成对使用，RET 出现在每个子程序末尾', L(0)], ['★ 调用与返回都有栈操作：使用前先建立堆栈，保护断点', L(1)]], { size: 32, gap: 80, dot: C.gold });
  const tb = table(G(g, { in: L(2) }), 80, 470, [300, 760, 700], [['', '调用指令（ACALL/LCALL）', '转移指令（AJMP/LJMP/SJMP…）'], ['相同', '都改变 PC，使程序转入非顺序单元执行', '都改变 PC，使程序转入非顺序单元执行'],
    ['返回', '执行完子程序后{g|一定返回}原断点', '跳转后{g|不一定}回到原断点'], ['堆栈', '一定有栈操作（保存断点）', '无需堆栈保存断点地址']], { rh: 80, size: 28, rowIn: [L(2), L(2), L(3), L(4)], colColor: [C.gold] });
});

/* ---------------- JZ / JNZ (P82) ---------------- */
scene('jz', '3.6.2 条件转移：JZ、JNZ', (g, L, Ee, F) => {
  note(g, 80, 220, 1760, ['条件满足 → 转移到另一地址；不满足 → 按原顺序继续执行'], 'key', L(0), { size: 30 });
  const tg = G(g, { in: L(1) });
  T(tg, 80, 400, '判零转移：以 A 的内容是否为 0 为条件', { size: 32, fill: C.cyan });
  const t2 = G(g, { in: L(2) });
  card(t2, 80, 430, 860, 120, { fill: C.panel2 }); T(t2, 110, 505, 'JZ  rel ; (A)=0 转移', { size: 34, mono: true, weight: 700, fill: C.gold });
  card(t2, 980, 430, 860, 120, { fill: C.panel2 }); T(t2, 1010, 505, 'JNZ rel ; (A)≠0 转移', { size: 34, mono: true, weight: 700, fill: C.gold });
  T(G(g, { in: L(3) }), 80, 600, 'rel：8 位偏移量，可写直接地址或标号', { size: 28, fill: C.muted });
  const K = code(G(g, { in: L(4) }), 80, 640, [['MOV A,#56H', ''], ['SUBB A,R0', ''], ['JZ next', ';结果为 0 → next'], ['…', ';否则往下执行']], { w: 820, cw: 330, lh: 58, size: 28, reveal: 'all' });
  K.step(L(4), 0).step(F(4, 0.25), 1).step(F(4, 0.5), 2);
  note(g, 980, 640, 860, ['课件未给 R0 与 C：只有 (R0)+(C) = 56H', '时 A 才为 0 并跳转，如 C=0、R0=56H'], 'warn', L(5), { size: 26 });
});

/* ---------------- CJNE (P83–P84) ---------------- */
scene('cjne', '比较转移 CJNE', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(6) - 0.2 });
  T(G(p1, { in: L(0) }), 80, 260, 'CJNE 目的数, 源数, rel    （三字节指令）', { size: 38, mono: true, fill: C.cyan, weight: 700 });
  bullets(p1, 100, 350, [['不相等 → 相对转移；相等 → 顺序执行', L(1)], ['目的 < 源 → C = 1；否则 C = 0', L(2)], ['执行后两个操作数的内容都{g|不改变}', L(2) + 3]], { size: 32, gap: 64 });
  const eg = G(p1, { in: L(3) });
  table(eg, 100, 560, [520, 1200], [['例', '含义'], ['CJNE A,#04H,MAIN', '(A)≠04H 跳 MAIN；(A)=04H 顺序；(A)<04H 则 C=1'], ['CJNE @R0,#05H,DIR', '((R0))≠05H 跳 DIR'], ['CJNE A,30H,STOP', '(A)≠(30H) 跳 STOP']],
    { rh: 66, size: 28, rowIn: [L(3), L(3), L(4), L(5)], colColor: [C.gold] });
  const p2 = G(g, { in: L(6) });
  T(p2, 80, 250, 'CJNE A,#04H,MAIN', { size: 40, mono: true, fill: C.cyan, weight: 700 });
  demo(p2, 560, 215, L(6));
  const tb = table(p2, 80, 300, [300, 400, 400, 300], [['A', '比较', '结果', 'C'], ['02H', '02H ≠ 04H，02H < 04H', '跳转到 MAIN', '1'], ['04H', '04H = 04H', '顺序执行', '0'], ['09H', '09H ≠ 04H，09H > 04H', '跳转到 MAIN', '0']],
    { rh: 70, size: 28, rowIn: [L(6), L(6) + 1, L(7), L(7) + 3.5], mono: false, colColor: [C.gold] });
  tb.hl(1, 3, L(6) + 4, Ee(6)); tb.hl(2, 2, L(7), L(7) + 3);
  const fg = G(p2, { in: L(8) });
  table(fg, 80, 640, [440, 440], [['CJNE 的四种格式', ''], ['CJNE A,#data,rel', 'CJNE A,direct,rel'], ['CJNE Rn,#data,rel', 'CJNE @Ri,#data,rel']], { rh: 70, size: 28, mono: true });
});

/* ---------------- DJNZ and delay (P84–P85) ---------------- */
scene('djnz', '循环转移 DJNZ 与软件延时', (g, L, Ee, F) => {
  const p1 = G(g, { out: L(3) - 0.2 });
  T(G(p1, { in: L(0) }), 80, 270, 'DJNZ 操作数,rel   ; 减 1，非 0 转移，为 0 顺序执行', { size: 34, mono: true, fill: C.cyan, maxw: 1760 });
  note(p1, 80, 320, 1760, ['第一操作数可以是 direct 或 Rn；{g|不影响任何标志位}'], 'key', L(1), { size: 30 });
  const eg = G(p1, { in: L(2) });
  T(eg, 100, 560, 'DJNZ R0,LOOP  ; (R0)−1 ≠ 0 转 LOOP', { size: 32, mono: true });
  T(eg, 100, 630, 'DJNZ 30H,SQ   ; (30H)−1 ≠ 0 转 SQ', { size: 32, mono: true });
  const p2 = G(g, { in: L(3), out: L(6) - 0.2 });
  const K1 = code(p2, 80, 230, [['      MOV R1,#40', ';1 周期 ×1'], ['NEXT: DJNZ R1,NEXT', ';2 周期 ×40'], ['      RET', ';2 周期 ×1']], { w: 900, cw: 330, lh: 66, size: 30, reveal: 'all' });
  K1.step(L(3), 0).step(F(3, 0.4), 1).step(F(3, 0.9), 2).off(L(5));
  // flowchart (P85)
  const fc = G(p2, { in: L(3) });
  card(fc, 1300, 230, 220, 60, { fill: C.panel2 }); T(fc, 1410, 270, 'R1 ← 40', { size: 26, anchor: 'middle', mono: true });
  card(fc, 1300, 330, 220, 60, { fill: C.panel2 }); T(fc, 1410, 370, 'R1 − 1', { size: 26, anchor: 'middle', mono: true });
  el('path', { d: 'M1410 420 L1520 480 L1410 540 L1300 480 Z', fill: C.panel2, stroke: C.line, 'stroke-width': 2 }, fc);
  T(fc, 1410, 490, '= 0 ?', { size: 26, anchor: 'middle', mono: true });
  arrow(fc, 1410, 290, 1410, 326, C.muted, 2.5); arrow(fc, 1410, 390, 1410, 416, C.muted, 2.5); arrow(fc, 1410, 540, 1410, 600, C.muted, 2.5);
  path(fc, 'M1520 480 H1600 V360 H1524', C.muted, 2.5);
  T(fc, 1610, 430, '否', { size: 24, fill: C.muted }); T(fc, 1425, 590, '是 → RET', { size: 24, fill: C.muted });
  const R = regs(p2, 1640, 230, [['R1', '--']], { w: 160, h: 66, old: false });
  R.set(F(3, 0.3), 'R1', '40');
  { const d = (Ee(4) - L(4)) / 41; for (let k = 1; k <= 40; k++) R.set(L(4) + k * d, 'R1', String(40 - k)); }
  const tg = G(p2, { in: L(5) });
  card(tg, 80, 500, 1120, 150, { fill: 'rgba(247,197,72,.1)', stroke: C.gold });
  T(tg, 110, 560, 't = [1 + 2×40 + 2] × T_{机器周期}', { size: 38, mono: true, fill: C.gold, weight: 700, maxw: 1060 });
  T(tg, 110, 620, '= 83 个机器周期', { size: 34, fill: C.green, weight: 700 });
  const p3 = G(g, { in: L(6) });
  const K2 = code(p3, 60, 220, [['       MOV R1,#50', ';1'], ['NEXT1: MOV R2,#40', ';1'], ['NEXT2: DJNZ R2,NEXT2', ';2'], ['       DJNZ R1,NEXT1', ';2'], ['       RET', ';2']], { w: 900, cw: 140, lh: 66, size: 30, reveal: 'all' });
  K2.step(L(6), 0).step(F(6, 0.3), 1).step(F(6, 0.5), 2).step(F(6, 0.75), 3).step(F(6, 0.92), 4).off(L(7));
  const br = G(p3, { in: L(7) });
  el('path', { d: 'M975 300 h30 v190 h-30', stroke: C.cyan, fill: 'none', 'stroke-width': 3 }, br);
  T(br, 1020, 390, '外层一圈：1 + 2×40 + 2 = 83', { size: 30, fill: C.cyan, maxw: 840 });
  T(br, 1020, 440, '× 50 圈', { size: 30, fill: C.cyan });
  const fg2 = G(p3, { in: L(8) });
  card(fg2, 60, 590, 1800, 140, { fill: 'rgba(247,197,72,.1)', stroke: C.gold });
  T(fg2, 90, 650, 't = [1 + (1 + 2×40 + 2)×50 + 2] × T_{机器周期}', { size: 36, mono: true, fill: C.gold, weight: 700, maxw: 1200 });
  T(fg2, 1340, 650, '= 4153 个机器周期', { size: 34, fill: C.green, weight: 700 });
  T(fg2, 90, 705, '1 + 83×50 + 2 = 4153', { size: 28, mono: true, fill: C.muted });
  note(p3, 60, 760, 900, ['12MHz 晶振：1 机器周期 = 12 时钟 = 1μs', '→ 例 2 约 4.153 ms'], 'add', L(9), { size: 26 });
  note(p3, 980, 760, 880, ['“指令周期见附录”：附录不在本 PDF 中；', '所用周期数已在课件 P85 指令旁标出'], 'warn', L(10), { size: 26, tag: '⚠ 说明' });
});

/* ---------------- bit jumps, RETI, NOP (P86) ---------------- */
scene('bitjump', '位条件转移与其它指令 RETI、NOP', (g, L, Ee, F) => {
  table(g, 80, 220, [400, 500, 500], [['指令', '跳转条件', '否则'], ['JC rel', '(C) = 1', '顺序执行'], ['JNC rel', '(C) = 0', '顺序执行'], ['JB bit,rel', '(bit) = 1', '顺序执行'],
    ['JNB bit,rel', '(bit) = 0', '顺序执行'], ['JBC bit,rel', '(bit) = 1，并将该位清 0', '顺序执行']], { rh: 68, size: 30, rowIn: [L(0), L(1), L(1) + 3, L(2), L(2) + 3.5, L(3)], colColor: [C.gold] });
  const og = G(g, { in: L(4) });
  card(og, 80, 660, 880, 200, { fill: C.panel2 });
  T(og, 110, 720, '3.6.3 其它指令', { size: 30, fill: C.cyan, weight: 700 });
  T(og, 110, 780, 'RETI：从中断返回（中断系统中详述）', { size: 28, maxw: 830 });
  T(G(og, { in: L(5) }), 110, 835, 'NOP ：空操作，只占 1 个机器周期', { size: 28, maxw: 830 });
  note(g, 1000, 660, 840, ['P86「顺序问下执行」应为', '「顺序向下执行」（笔误）'], 'warn', L(6), { size: 28 });
});

/* ---------------- example 1: sign of P1 (P87) ---------------- */
scene('ex1', '3.6.4 综合举例 1：判断 P1 的正负', (g, L, Ee, F) => {
  T(G(g, { in: L(0) }), 80, 240, '例 1：P1 口输入的数据为负 → 转 FS，否则 → 转 ZS', { size: 32, fill: C.cyan });
  const tb = table(G(g, { in: L(1) }), 80, 280, [180, 200, 460], [['地址', '机器码', '指令'], ['8000H', 'E5 90', 'ZS: MOV A,P1'], ['8002H', '33', 'RLC A'], ['8003H', '40 e1', 'JC FS'], ['8005H', '80 e2', 'SJMP ZS'], ['8007H', '', '……'], ['800AH', '', 'FS: ……']],
    { rh: 62, size: 28, mono: true, rowIn: [L(1), L(1), F(1, 0.6), L(2), F(2, 0.5), F(2, 0.7), F(2, 0.85)] });
  tb.hl(1, 1, L(1) + 1, Ee(1)); tb.hl(3, 1, L(2), F(2, 0.5)); tb.hl(4, 1, F(2, 0.5), Ee(2));
  note(g, 80, 740, 840, ['RLC A：符号位 D7 → C；C=1 即负数 → JC FS'], 'key', L(3), { size: 28 });
  const og = G(g, { in: L(4) });
  card(og, 980, 280, 880, 90, { fill: 'rgba(247,197,72,.1)', stroke: C.gold });
  T(og, 1420, 340, 'e = [目的地址 − 下条指令地址]_{补}', { size: 32, anchor: 'middle', fill: C.gold, weight: 700, maxw: 840 });
  const e1 = G(g, { in: L(5) });
  card(e1, 980, 400, 880, 100, { fill: C.panel2 });
  T(e1, 1010, 465, 'e1 = 800AH − 8005H = {g|05H}', { size: 34, mono: true, maxw: 830 });
  tb.hl(3, 1, L(5), Ee(5));
  const e2 = G(g, { in: L(6) });
  card(e2, 980, 520, 880, 100, { fill: C.panel2 });
  T(e2, 1010, 585, 'e2 = 8000H − 8007H = −7 → {g|F9H}', { size: 34, mono: true, maxw: 830 });
  tb.hl(4, 1, L(6), Ee(6));
  const dg = G(g, { in: L(7) });
  demo(dg, 980, 640, L(7));
  const B = bits(dg, 1100, 740, '10000101', { w: 58, h: 56, gap: 4, carry: '-', cname: 'C', labels: false });
  T(dg, 1090, 780, 'P1=85H', { size: 22, anchor: 'end', fill: C.muted, mono: true });
  B.set(F(7, 0.25), '0000101-'.replace('-', '?'));
  B.setC(F(7, 0.25), 1);
  T(G(dg, { in: F(7, 0.3) }), 1100, 850, 'C=1 → JC 跳到 FS（负数）', { size: 26, fill: C.red });
  T(G(dg, { in: F(7, 0.7) }), 1100, 900, 'P1=35H → C=0 → SJMP ZS 重新读', { size: 26, fill: C.green });
});

/* ---------------- example 2: count ones (P88) ---------------- */
scene('ex2', '综合举例 2：统计 20H 中 1 的个数', (g, L, Ee, F) => {
  const K = code(g, 60, 210, [['      MOV A,20H', ''], ['      MOV R1,#08H', ';计数判断 8 次'], ['      MOV R0,#00H', ';1 的个数清 0'], ['LOOP: RLC A', ''], ['      JNC ZERO', ';C=0 跳'], ['      INC R0', ';C=1 计数'],
    ['ZERO: DJNZ R1,LOOP', ''], ['STOP: SJMP STOP', ';暂停']], { w: 820, cw: 300, lh: 60, size: 28, reveal: 'all' });
  K.step(L(1), 0).step(F(1, 0.35), 1).step(F(1, 0.7), 2).step(L(2), 3).step(F(2, 0.4), 4).step(F(2, 0.75), 5).step(L(3), 6).step(F(3, 0.7), 7).off(L(4));
  demo(g, 960, 196, L(4));
  const M = mem(G(g, { in: L(4) }), 940, 300, [['20H', '0B5H']], { w: 160, h: 60, aw: 80, old: false });
  const B = bits(G(g, { in: L(4) }), 1060, 450, '--------', { w: 70, h: 66, gap: 6, carry: '-', cname: 'C', name: 'A' });
  const R = regs(G(g, { in: L(4) }), 1240, 300, [['R1', '--'], ['R0', '--']], { w: 140, h: 60, gx: 30 });
  B.set(F(4, 0.6), '10110101');
  R.set(F(4, 0.7), 'R1', '08H').set(F(4, 0.8), 'R0', '00H');
  // 8 iterations across line 5
  let a = 0xB5, c = 0, r0 = 0;
  const t0 = L(5) + 0.4, dt = (Ee(5) - L(5) - 0.6) / 8;
  const seq = [];
  for (let k = 0; k < 8; k++) {
    const out = (a >> 7) & 1;
    a = ((a << 1) & 0xFF) | c; c = out;
    if (c) r0++;
    const t = t0 + k * dt;
    B.set(t, a.toString(2).padStart(8, '0')); B.setC(t, c);
    if (c) R.set(t + dt * 0.4, 'R0', '0' + r0 + 'H');
    R.set(t + dt * 0.7, 'R1', '0' + (7 - k) + 'H');
    seq.push(out);
  }
  const sg = G(g, { in: L(5) });
  T(sg, 960, 620, '移出的位：', { size: 28, fill: C.muted });
  seq.forEach((b, k) => T(G(sg, { in: t0 + k * dt }), 1110 + k * 52, 620, String(b), { size: 34, mono: true, weight: 700, fill: b ? C.gold : C.dim }));
  T(G(g, { in: Ee(5) - 0.5 }), 960, 690, '8 轮后：R1 = 00H，R0 = 05H（5 个 1）', { size: 30, fill: C.green, weight: 700 });
  note(g, 960, 730, 900, ['C 的初值移入最低位，但 8 次只移出原来的 8 位，', '所以不影响统计结果'], 'add', L(6), { size: 26, out: L(7) - 0.2 });
  note(g, 960, 730, 900, ['SJMP STOP：跳回自身，偏移量 FEH（−2）', '常用这种死循环表示程序结束'], 'key', L(7), { size: 26 });
  pill(G(g, { in: L(8) }), 60, 760, 820, 60, '下一集：3.7 汇编语言、伪指令 · 复习 →', { size: 28 });
});
})();
