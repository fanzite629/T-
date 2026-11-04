/* Scenes part 1: chrome, intro, UV regions & overview, 9-1, 9-2 valence electrons & transitions */
'use strict';
(() => {
const { TL, C, SC, LN, at, end, prog, lerp, E, eo, el, setAttrs, setRich, T, G, D, U, focus, arrowId, card, pill, arrow,
  axes, curve, gauss, bullets, sceneGroup, title, stepLabel, svg } = window.ENG;
const S = window.SCENES = window.SCENES || [];
const mid = (s, i) => (at(s, i) + end(s, i)) / 2;

/* ================= chrome: header, progress chips, captions ================= */
S.push(function chrome() {
  T(svg, 60, 58, '现代分析仪器及应用 · 第 9 章 紫外吸收光谱分析', { size: 20, fill: C.muted });
  const labels = { intro: '导入', region: '光区·概览', mol: '9-1 分子光谱', valence: '9-2 跃迁', inorg: '9-3 无机',
    band: '吸收带', inst: '9-5 仪器', app: '9-6 应用', cmp: '对比原吸', quiz: '练习', sum: '总结' };
  const x0 = 660, w = 108, gap = 4;
  const chips = TL.scenes.map((s, k) => {
    const g = el('g', { class: 'clickable', 'data-seek': s.t0 + 0.05 });
    const r = el('rect', { x: x0 + k * (w + gap), y: 34, width: w, height: 30, rx: 6 }, g);
    const tx = T(g, x0 + k * (w + gap) + w / 2, 55, labels[s.id] || s.id, { size: 15, anchor: 'middle', maxw: w - 6 });
    return { s, r, tx };
  });
  // thin overall progress under the chips
  el('rect', { x: x0, y: 70, width: TL.scenes.length * (w + gap) - gap, height: 3, rx: 1.5, fill: C.line });
  const bar = el('rect', { x: x0, y: 70, height: 3, rx: 1.5, fill: C.cyan });
  U.push(t => {
    const show = t >= SC.region.t0 - 0.3;
    chips.forEach(({ s, r, tx }) => {
      const on = t >= s.t0 && t < s.t1, done = t >= s.t1;
      setAttrs(r, { fill: on ? C.cyan : (done ? '#16324F' : C.panel), stroke: on ? C.cyan : C.line });
      tx.setAttribute('fill', on ? C.bg1 : (done ? C.text : C.muted));
      r.parentNode.setAttribute('opacity', show ? 1 : 0);
    });
    bar.setAttribute('width', ((TL.scenes.length * (w + gap) - gap) * Math.min(1, t / TL.duration)).toFixed(1));
    bar.setAttribute('opacity', show ? 1 : 0);
  });
});

S.push(function captions() {
  const g = el('g', { class: 'caption' });
  const bg = el('rect', { rx: 12, fill: 'rgba(3,8,16,.80)' }, g);
  const l1 = el('text', { x: 960, 'font-size': 32, fill: C.text, 'text-anchor': 'middle', 'font-weight': 500 }, g);
  const l2 = el('text', { x: 960, 'font-size': 32, fill: C.text, 'text-anchor': 'middle', 'font-weight': 500 }, g);
  const plain = s => s.replace(/[_^]\{([^}]*)\}/g, '$1');
  let cur = null;
  U.push(t => {
    const ln = TL.lines.find(l => t >= l.t0 - 0.05 && t < l.t1 + 0.25);
    const s = ln ? ln.t : '';
    if (s !== cur) {
      cur = s;
      setRich(l1, s, 32); setRich(l2, '', 32);
      let w = s ? l1.getComputedTextLength() : 0;
      let two = false;
      if (w > 1700) {
        // split at the punctuation closest to the middle of the visible text
        const p = plain(s), midc = p.length / 2;
        let best = -1;
        for (let i = 0; i < s.length; i++) if ('，；：、'.includes(s[i])) {
          const pos = plain(s.slice(0, i)).length;
          if (best < 0 || Math.abs(pos - midc) < Math.abs(plain(s.slice(0, best)).length - midc)) best = i;
        }
        if (best < 0) best = Math.floor(s.length / 2);
        setRich(l1, s.slice(0, best + 1), 30); setRich(l2, s.slice(best + 1), 30);
        l1.setAttribute('font-size', 30); l2.setAttribute('font-size', 30);
        w = Math.max(l1.getComputedTextLength(), l2.getComputedTextLength());
        two = true;
      } else { l1.setAttribute('font-size', 32); }
      setAttrs(l1, { y: two ? 996 : 1016 }); setAttrs(l2, { y: 1036 });
      setAttrs(bg, { x: 960 - (w + 56) / 2, width: w + 56, y: two ? 962 : 976, height: two ? 90 : 56 });
    }
    let a = 0;
    if (ln) a = Math.min(prog(t, ln.t0 - 0.05, 0.15), 1 - prog(t, ln.t1 + 0.1, 0.15));
    g.setAttribute('opacity', a.toFixed(3));
  });
});

/* ================= intro ================= */
S.push(function intro() {
  const id = 'intro', g = sceneGroup(id);
  const tg = G(g, { in: at(id, 0) - 0.6, out: at(id, 1) - 0.1, od: 0.4 });
  T(tg, 960, 380, '第 9 章', { size: 40, fill: C.cyan, anchor: 'middle', weight: 500 });
  T(tg, 960, 490, '紫外吸收光谱分析', { size: 96, anchor: 'middle', weight: 700 });
  T(tg, 960, 560, '现代分析仪器及应用', { size: 28, fill: C.muted, anchor: 'middle' });
  el('line', { x1: 760, y1: 600, x2: 1160, y2: 600, stroke: C.gold, 'stroke-width': 2 }, tg);

  // light through a solution
  const bg = G(g, { in: at(id, 1), out: at(id, 3) - 0.3, od: 0.4, fx: 'none' });
  el('circle', { cx: 260, cy: 470, r: 46, fill: '#FFF6D8', filter: 'url(#glow)' }, bg);
  T(bg, 260, 560, '光源', { size: 24, fill: C.muted, anchor: 'middle' });
  const b1 = el('rect', { x: 310, y: 458, height: 24, fill: 'url(#whiteBeam)', rx: 4 }, bg);
  el('rect', { x: 860, y: 360, width: 130, height: 230, rx: 10, fill: 'rgba(91,140,255,.22)', stroke: '#9FB8D0', 'stroke-width': 3 }, bg);
  T(bg, 925, 630, '溶液', { size: 24, fill: C.muted, anchor: 'middle' });
  const b2 = el('rect', { x: 990, y: 460, height: 20, fill: '#FFF6D8', opacity: 0.55, rx: 4 }, bg);
  el('rect', { x: 1300, y: 430, width: 520, height: 80, rx: 8, fill: 'url(#rainbow)' }, bg);
  el('rect', { x: 1300, y: 430, width: 110, height: 80, rx: 8, fill: '#4B2A85' }, bg);
  T(bg, 1355, 545, '紫外', { size: 22, fill: C.violet, anchor: 'middle' });
  T(bg, 1610, 545, '可见', { size: 22, fill: C.muted, anchor: 'middle' });
  const notch = G(bg, { in: mid(id, 1), fx: 'none' });
  el('rect', { x: 1322, y: 430, width: 48, height: 80, fill: '#05080F' }, notch);
  el('rect', { x: 1500, y: 430, width: 26, height: 80, fill: '#05080F', opacity: 0.85 }, notch);
  T(notch, 1346, 410, '被“吃掉”', { size: 24, fill: C.red, anchor: 'middle', weight: 700 });
  arrow(notch, 1346, 380, 1346, 424, C.red);
  U.push(t => {
    b1.setAttribute('width', (550 * E(t, at(id, 1), 0.8)).toFixed(1));
    b2.setAttribute('width', (310 * E(t, at(id, 1) + 0.6, 0.6)).toFixed(1));
  });
  // energy levels
  const lv = G(g, { in: at(id, 2), out: at(id, 3) - 0.3, od: 0.4 });
  el('line', { x1: 760, y1: 860, x2: 1160, y2: 860, stroke: C.muted, 'stroke-width': 3 }, lv);
  el('line', { x1: 760, y1: 720, x2: 1160, y2: 720, stroke: C.cyan, 'stroke-width': 3 }, lv);
  T(lv, 1180, 868, '低能级', { size: 22, fill: C.muted });
  T(lv, 1180, 728, '高能级', { size: 22, fill: C.cyan });
  const ph = el('path', { d: 'M560 790 q15 -18 30 0 t30 0 t30 0 t30 0 t30 0 t30 0', stroke: C.violet, 'stroke-width': 3, fill: 'none' }, lv);
  const dot = el('circle', { cx: 960, r: 12, fill: C.gold, filter: 'url(#glow)' }, lv);
  T(lv, 960, 930, '吸收光 → 电子从低能级跃迁到高能级', { size: 26, anchor: 'middle', fill: C.gold });
  U.push(t => {
    const k = E(t, at(id, 2) + 0.8, 0.7);
    dot.setAttribute('cy', lerp(860, 720, k).toFixed(1));
    ph.setAttribute('transform', `translate(${lerp(0, 220, prog(t, at(id, 2), 0.8)).toFixed(1)} 0)`);
    ph.setAttribute('opacity', (1 - prog(t, at(id, 2) + 0.7, 0.2)).toFixed(2));
  });

  // roadmap
  const steps = ['9-1 分子吸收光谱', '9-2 有机化合物的跃迁', '9-3 无机化合物的跃迁', '生色团与吸收带',
    '9-5 分光光度计', '9-6 定性与定量', '与原子吸收比较', '课堂练习'];
  const t0 = at(id, 3), span = end(id, 4) - t0;
  T(G(g, { in: t0 - 0.2 }), 960, 300, '本章学习路线', { size: 40, anchor: 'middle', weight: 700 });
  steps.forEach((s, k) => {
    const row = Math.floor(k / 4), col = k % 4;
    const x = 150 + col * 420, y = 380 + row * 230;
    const sg = G(g, { in: t0 + span * k / 9, fx: 'scale', ox: x + 180, oy: y + 70 });
    card(sg, x, y, 360, 140, { stroke: C.cyanDeep });
    el('circle', { cx: x + 44, cy: y + 70, r: 24, fill: C.cyan }, sg);
    T(sg, x + 44, y + 79, String(k + 1), { size: 24, anchor: 'middle', fill: C.bg1, weight: 700 });
    T(sg, x + 84, y + 79, s, { size: 25, weight: 500, maxw: 262 });
    if (col < 3) arrow(sg, x + 366, y + 70, x + 414, y + 70, C.cyanDeep, 2.5);
  });
});

/* ================= UV regions & method overview ================= */
S.push(function region() {
  const id = 'region', g = sceneGroup(id);
  title(g, id, '紫外光区与方法概览', '课件 P3、P5–6');
  stepLabel(g, 60, 262, [[at(id, 0), '紫外光区的划分'], [at(id, 6), '分光光度计的工作过程'], [at(id, 11), '方法特点']]);

  const A = G(g, { in: at(id, 0), out: at(id, 6) - 0.4, fx: 'none' });
  const X = nm => 160 + nm * 4;
  const far = G(A, { in: at(id, 0), fx: 'none' });
  el('rect', { x: X(10), y: 400, width: X(180) - X(10), height: 56, fill: '#3D2270', stroke: C.violet, 'stroke-width': 1.5 }, far);
  T(far, (X(10) + X(180)) / 2, 380, '远紫外（真空紫外）10–180 nm', { size: 26, anchor: 'middle', fill: C.violet, weight: 700 });
  const near = G(A, { in: at(id, 2), fx: 'none' });
  el('rect', { x: X(180), y: 400, width: X(400) - X(180), height: 56, fill: '#5B3FC4', stroke: C.violet, 'stroke-width': 1.5 }, near);
  T(near, (X(180) + X(400)) / 2, 380, '近紫外 180–400 nm', { size: 26, anchor: 'middle', fill: '#C9B8FF', weight: 700 });
  [10, 180, 275, 320, 400].forEach(v => {
    const tg = G(A, { in: v <= 180 ? at(id, 0) : at(id, 2), fx: 'none' });
    el('line', { x1: X(v), y1: 456, x2: X(v), y2: 470, stroke: C.muted, 'stroke-width': 2 }, tg);
    T(tg, X(v), 496, String(v), { size: 20, fill: C.muted, anchor: 'middle' });
  });
  T(A, X(400) + 34, 496, 'nm', { size: 20, fill: C.muted });
  // O2 absorbs far UV
  const o2 = G(A, { in: at(id, 1) });
  [260, 400, 540, 680].forEach((x, k) => {
    el('circle', { cx: x - 10, cy: 560 + (k % 2) * 20, r: 16, fill: '#E86A6A', opacity: 0.85 }, o2);
    el('circle', { cx: x + 14, cy: 560 + (k % 2) * 20, r: 16, fill: '#E86A6A', opacity: 0.85 }, o2);
  });
  T(o2, 540, 650, '被 O_{2} 强烈吸收，空气中无法传播', { size: 26, anchor: 'middle', fill: C.red, weight: 500 });
  T(o2, 540, 688, '→ 需在真空条件下测量', { size: 22, anchor: 'middle', fill: C.muted });
  const subs = [
    [3, 320, 400, '320–400 nm', ['穿透大部分透明', '玻璃、塑料'], 1510],
    [4, 275, 320, '275–320 nm', ['不到 2% 到达地表', '会被玻璃吸收'], 1200],
    [5, 180, 275, '180–275 nm', ['几乎被臭氧层完全吸收', '灭菌灯所用波段'], 890]
  ];
  subs.forEach(([li, a, b, h, body, cx]) => {
    const sg = G(A, { in: at(id, li) });
    el('rect', { x: X(a), y: 400, width: X(b) - X(a), height: 56, fill: 'none', stroke: C.gold, 'stroke-width': 4 }, sg);
    el('path', { d: `M${(X(a) + X(b)) / 2} 470 L${cx + 140} 560`, stroke: C.gold, 'stroke-width': 1.5, fill: 'none' }, sg);
    card(sg, cx, 560, 280, 170, { stroke: C.gold });
    T(sg, cx + 20, 604, h, { size: 26, fill: C.gold, weight: 700 });
    body.forEach((s, k) => T(sg, cx + 20, 648 + k * 36, s, { size: 22, maxw: 250 }));
    focus(sg, at(id, li), end(id, li), 0.55);
  });
  const nt = G(A, { in: at(id, 5) + 1.5, cls: 'note' });
  T(nt, 960, 820, '注：课件另一页（P17）采用“远紫外 10–200 nm、近紫外 200–400 nm”的划分，界限略有不同。', { size: 21, fill: C.muted, anchor: 'middle', maxw: 1700 });

  // instrument flow
  const B = G(g, { in: at(id, 6), out: SC[id].t1 - 0.5, fx: 'none' });
  const names = [['光源', '钨灯 / 氘灯'], ['单色器', '选出单色光'], ['吸收池', '样品 / 参比'], ['检测器', '光信号 → 电信号'], ['显示系统', '']];
  const bx = k => 110 + k * 350;
  names.forEach(([n, s], k) => {
    const bgp = G(B, { in: at(id, 6) + k * 0.45, fx: 'scale', ox: bx(k) + 125, oy: 400 });
    card(bgp, bx(k), 320, 250, 160, { stroke: C.cyanDeep, fill: C.panel2 });
    T(bgp, bx(k) + 125, 380, n, { size: 32, anchor: 'middle', weight: 700 });
    if (s) T(bgp, bx(k) + 125, 424, s, { size: 21, anchor: 'middle', fill: C.muted });
  });
  const disp = T(G(B, { in: at(id, 6) + 1.8, fx: 'none' }), bx(4) + 125, 438, '0.000', { size: 40, anchor: 'middle', fill: C.cyan, weight: 500 });
  const beam1 = el('rect', { x: bx(0) + 250, y: 392, height: 16, fill: 'url(#rainbow)', rx: 3 }, B);
  const beam2 = el('rect', { x: bx(1) + 250, y: 393, height: 14, fill: C.violet, rx: 3 }, B);
  const beam3 = el('rect', { x: bx(2) + 250, y: 395, height: 10, fill: C.violet, opacity: 0.45, rx: 3 }, B);
  const sig = el('path', { d: `M${bx(3) + 250} 400 q12 -24 25 0 t25 0 t25 0 t25 0`, stroke: C.gold, 'stroke-width': 3, fill: 'none' }, B);
  const lb = (x, y, s, tin, c) => T(G(B, { in: tin }), x, y, s, { size: 22, anchor: 'middle', fill: c || C.muted });
  lb(bx(0) + 300, 540, '连续辐射（复合光）', at(id, 8), C.text);
  lb(bx(1) + 300, 580, '单色光', at(id, 8) + 0.8, C.violet);
  lb(bx(2) + 300, 540, '部分被吸收', at(id, 9), C.red);
  lb(bx(3) + 300, 580, '电信号放大', at(id, 10), C.gold);
  U.push(t => {
    if (t < SC[id].t0 || t > SC[id].t1) return;
    beam1.setAttribute('width', (100 * E(t, at(id, 8), 0.7)).toFixed(1));
    beam2.setAttribute('width', (100 * E(t, at(id, 8) + 0.8, 0.7)).toFixed(1));
    beam3.setAttribute('width', (100 * E(t, at(id, 9), 0.7)).toFixed(1));
    sig.setAttribute('opacity', E(t, at(id, 10), 0.5).toFixed(2));
    const k = E(t, at(id, 10) + 0.5, 1.2);
    disp.textContent = (0.575 * k).toFixed(3);
  });
  const feats = [
    [11, '灵敏度较高', '10^{−4}～10^{−6} g/mL'],
    [12, '精密度、准确度较高', '0.2%～0.5%'],
    [13, '选择性较好', ''],
    [13, '仪器简单 · 费用少', '分析快 · 易掌握推广'],
    [13, '应用范围广', '']
  ];
  feats.forEach(([li, h, s], k) => {
    const x = 70 + k * 360;
    const fg = G(B, { in: at(id, li) + (k >= 2 ? (k - 2) * 1.1 : 0) });
    card(fg, x, 640, 320, 210, { stroke: C.gold });
    el('circle', { cx: x + 40, cy: 690, r: 18, fill: C.gold }, fg);
    T(fg, x + 40, 698, String(k + 1), { size: 20, anchor: 'middle', fill: C.bg1, weight: 700 });
    T(fg, x + 70, 698, h, { size: 26, fill: C.gold, weight: 700, maxw: 240 });
    if (s) T(fg, x + 30, 770, s, { size: 26, maxw: 270 });
  });
});

/* ================= 9-1 molecular absorption spectra ================= */
S.push(function mol() {
  const id = 'mol', g = sceneGroup(id);
  title(g, id, '9-1 分子吸收光谱', '课件 P7–12');
  stepLabel(g, 60, 262, [[at(id, 0), '三种运动 → 三种能级'], [at(id, 6), '三种跃迁的能量'], [at(id, 10), '为什么是带状光谱？'],
    [at(id, 16), '吸收光谱曲线'], [at(id, 21), '分子光谱 vs 原子光谱']]);

  /* A: three motions */
  const A = G(g, { in: at(id, 0), out: at(id, 6) - 0.4, fx: 'none' });
  const mg = el('g', {}, A);
  const bond = el('line', { stroke: '#7FA7C9', 'stroke-width': 6 }, mg);
  const n1 = el('circle', { r: 42, fill: '#2F6FB0', stroke: C.cyan, 'stroke-width': 2 }, mg);
  const n2 = el('circle', { r: 34, fill: '#7A4FC4', stroke: C.violet, 'stroke-width': 2 }, mg);
  const orb = el('ellipse', { rx: 80, ry: 34, fill: 'none', stroke: C.cyan, 'stroke-dasharray': '4 6', opacity: 0.6 }, mg);
  const eDot = el('circle', { r: 9, fill: C.gold, filter: 'url(#glow)' }, mg);
  const rotArc = el('path', { d: 'M330 360 A190 190 0 0 1 630 360', stroke: C.green, 'stroke-width': 3, fill: 'none', 'marker-end': `url(#${arrowId(C.green)})` }, A);
  U.push(t => {
    if (t < SC[id].t0 || t > at(id, 6)) return;
    const vib = E(t, mid(id, 1), 0.6), rot = prog(t, at(id, 2), 0.4);
    const ang = rot > 0 ? (t - at(id, 2)) * 0.9 : 0;
    const dd = 90 + vib * 14 * Math.sin(t * 9);
    const cx = 480, cy = 560, ca = Math.cos(ang), sa = Math.sin(ang);
    const p1 = [cx - dd * ca, cy - dd * sa], p2 = [cx + dd * ca, cy + dd * sa];
    setAttrs(bond, { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] });
    setAttrs(n1, { cx: p1[0], cy: p1[1] }); setAttrs(n2, { cx: p2[0], cy: p2[1] });
    setAttrs(orb, { cx: p1[0], cy: p1[1], transform: `rotate(${(ang * 57.3).toFixed(1)} ${p1[0]} ${p1[1]})` });
    const ea = t * 4;
    const ex = 80 * Math.cos(ea), ey = 34 * Math.sin(ea);
    setAttrs(eDot, { cx: p1[0] + ex * ca - ey * sa, cy: p1[1] + ex * sa + ey * ca });
    rotArc.setAttribute('opacity', rot.toFixed(2));
  });
  const motions = [[1, '① 电子运动', '电子相对于原子核的运动', C.gold], [1, '② 振动', '原子核在平衡位置附近的振动', C.cyan], [2, '③ 转动', '分子绕其重心的转动', C.green]];
  motions.forEach(([li, h, s, c], k) => {
    const tin = k === 1 ? mid(id, 1) : at(id, li);
    const mg2 = G(A, { in: tin, fx: 'left' });
    card(mg2, 1000, 300 + k * 110, 840, 92, { stroke: c });
    T(mg2, 1030, 357 + k * 110, h, { size: 28, fill: c, weight: 700 });
    T(mg2, 1210, 357 + k * 110, s, { size: 26, maxw: 610 });
  });
  const eq = G(A, { in: at(id, 3) });
  card(eq, 1000, 650, 840, 90, { stroke: C.gold, fill: 'rgba(247,197,72,.06)' });
  T(eq, 1420, 708, 'E_{分子} = E_{电子} + E_{振动} + E_{转动}', { size: 38, anchor: 'middle', fill: C.gold, weight: 500 });
  const lvls = G(A, { in: at(id, 4) });
  ['电子能级', '振动能级', '转动能级'].forEach((s, k) => pill(lvls, 1000 + k * 290, 770, 260, 52, s, { size: 24, stroke: [C.gold, C.cyan, C.green][k], fill: [C.gold, C.cyan, C.green][k] }));
  const tr = G(A, { in: at(id, 5) });
  T(tr, 480, 800, '跃迁：受激发，从低能级转移到高能级', { size: 28, anchor: 'middle', weight: 700, fill: C.gold });
  T(tr, 480, 842, '→ 产生吸收', { size: 26, anchor: 'middle', fill: C.muted });

  /* B: energy diagram */
  const B = G(g, { in: at(id, 6), out: at(id, 10) - 0.4, fx: 'none' });
  const vy = (base, v) => base - [0, 32, 60, 84, 104][v];
  [[820, 'A', '电子基态'], [480, 'B', '电子激发态']].forEach(([base, lab, nm], k) => {
    const lg = G(B, { in: at(id, 6) + k * 0.4, fx: 'none' });
    for (let v = 0; v < 5; v++) {
      el('line', { x1: 170, y1: vy(base, v), x2: 760, y2: vy(base, v), stroke: v ? C.muted : C.text, 'stroke-width': v ? 1.5 : 3 }, lg);
      for (let j = 1; j < 4; j++) el('line', { x1: 170, y1: vy(base, v) - j * 6, x2: 280, y2: vy(base, v) - j * 6, stroke: C.dim, 'stroke-width': 1 }, lg);
    }
    T(lg, 780, base + 8, lab, { size: 26, weight: 700 });
    T(lg, 160, base + 8, nm, { size: 20, fill: C.muted, anchor: 'end' });
  });
  T(G(B, { in: at(id, 6) + 0.6 }), 520, 870, 'v = 0…4 为振动能级；左侧细线为转动能级（示意）', { size: 19, fill: C.dim, anchor: 'middle', cls: 'note' });
  const arrs = [[at(id, 6) + 1.2, 640, 820, 480, C.gold, '电子跃迁'], [at(id, 7) + 1.2, 430, 820, 788, C.cyan, '振动跃迁'], [at(id, 8), 225, 820, 808, C.green, '转动跃迁']];
  arrs.forEach(([tin, x, y1, y2, c, s]) => {
    const ag = G(B, { in: tin, fx: 'none' });
    const p = arrow(ag, x, y1, x, y2 + 4, c, 3.5); D(p, tin, 0.6);
    T(ag, x + 12, (y1 + y2) / 2 + (y1 - y2 < 60 ? -40 : 0), s, { size: 22, fill: c, weight: 700 });
  });
  const tb = G(B, { in: at(id, 6) });
  const tx = 940;
  card(tb, tx, 300, 900, 300, { stroke: C.line });
  ['跃迁类型', '所需能量 / eV', '波长范围'].forEach((s, k) => T(tb, tx + 30 + [0, 260, 560][k], 350, s, { size: 24, fill: C.muted }));
  el('line', { x1: tx + 20, y1: 368, x2: tx + 880, y2: 368, stroke: C.line, 'stroke-width': 2 }, tb);
  const rows = [[6, '外层电子跃迁', '1 – 20', '10 – 1200 nm', C.gold], [7, '振动跃迁', '0.05 – 1', '约 2.5 – 1000 μm', C.cyan], [8, '转动跃迁', '0.005 – 0.05', '', C.green]];
  rows.forEach(([li, a, b, c, col], k) => {
    const rg = G(tb, { in: at(id, li) + (k === 1 ? 0.8 : 0.4), fx: 'left' });
    T(rg, tx + 30, 420 + k * 70, a, { size: 27, fill: col, weight: 700 });
    T(rg, tx + 290, 420 + k * 70, b, { size: 27 });
    if (c) T(rg, tx + 590, 420 + k * 70 + (k === 1 ? 35 : 0), c, { size: 27 });
  });
  T(G(B, { in: at(id, 8) + 1, cls: 'note' }), tx, 640, '注：振动、转动跃迁的波长在课件中合并给出（原文显示为“2.5–1000 m”，应为 μm）。', { size: 19, fill: C.dim, maxw: 900 });
  const conc = G(B, { in: at(id, 9) });
  card(conc, tx, 690, 900, 120, { stroke: C.gold, fill: 'rgba(247,197,72,.06)' });
  T(conc, tx + 30, 740, '紫外光谱：外层价电子在电子能级间跃迁', { size: 28, fill: C.gold, weight: 700 });
  T(conc, tx + 30, 786, '→ 属于电子光谱', { size: 26 });

  /* C: why a band */
  const Cg = G(g, { in: at(id, 10), out: at(id, 16) - 0.4, fx: 'none' });
  const gy = v => 840 - v * 26, ey = v => 440 - v * 26;
  for (let v = 0; v < 4; v++) {
    el('line', { x1: 140, y1: gy(v), x2: 740, y2: gy(v), stroke: v ? C.muted : C.text, 'stroke-width': v ? 1.5 : 3 }, Cg);
    el('line', { x1: 140, y1: ey(v), x2: 740, y2: ey(v), stroke: v ? C.muted : C.cyan, 'stroke-width': v ? 1.5 : 3 }, Cg);
  }
  T(Cg, 760, gy(0) + 8, '基态 + 振动/转动能级', { size: 20, fill: C.muted });
  T(Cg, 760, ey(0) + 8, '激发态 + 振动/转动能级', { size: 20, fill: C.cyan });
  const fan = [];
  for (let k = 0; k < 12; k++) {
    const x = 170 + k * 48, from = gy(k % 2), to = ey((k * 7) % 4);
    const ag = G(Cg, { in: at(id, 11) + k * 0.18, fx: 'none' });
    D(arrow(ag, x, from, x, to + 4, C.gold, 2.4), at(id, 11) + k * 0.18, 0.4);
    fan.push(to - from);
  }
  const px = l => 980 + l * 820, py = a => 760 - a * 400;
  axes(G(Cg, { in: at(id, 10) + 0.3 }), 980, 760, 840, 430, '波长 λ', 'A');
  const sticks = G(Cg, { in: at(id, 12) - 0.3, fx: 'none' });
  const rs = window.ENG.rng(4);
  const centers = [];
  for (let k = 0; k < 18; k++) {
    const l = 0.32 + rs() * 0.36;
    const h = Math.exp(-((l - 0.5) ** 2) / 0.012) * 0.82 + 0.06;
    centers.push(l);
    const ln = el('line', { x1: px(l), y1: 760, x2: px(l), y2: py(h), stroke: C.gold, 'stroke-width': 3 }, sticks);
    D(ln, at(id, 12) + k * 0.06, 0.3);
  }
  U.push(t => sticks.setAttribute('opacity', lerp(1, 0.25, E(t, at(id, 13) + 0.6, 0.8)).toFixed(2)));
  const env = el('path', { d: curve(l => Math.exp(-((l - 0.5) ** 2) / 0.016) * 0.88 + 0.03, 0.02, 0.98, px, py), stroke: C.cyan, 'stroke-width': 5, fill: 'none' }, Cg);
  D(env, at(id, 13), 1.4);
  T(G(Cg, { in: at(id, 12) }), 1000, 340, '一条条相近的谱线', { size: 24, fill: C.gold });
  T(G(Cg, { in: at(id, 13) + 0.8 }), 1590, 420, '→ 连成谱带', { size: 26, fill: C.cyan, weight: 700 });
  const fac = G(Cg, { in: at(id, 14) });
  ['分子结构的复杂性', '溶剂效应', '仪器的分辨率'].forEach((s, k) => pill(fac, 980 + k * 290, 800, 270, 50, s, { size: 22 }));
  const band = G(Cg, { in: at(id, 15), fx: 'scale', ox: 1400, oy: 900 });
  T(band, 1400, 912, '紫外吸收光谱是带状光谱', { size: 40, fill: C.gold, weight: 700, anchor: 'middle' });

  /* D: absorption curve */
  const Dg = G(g, { in: at(id, 16), out: at(id, 21) - 0.4, fx: 'none' });
  const ox = 180, oy = 860, W = 1160, H = 520;
  const f = u => 0.95 * Math.exp(-u / 0.09) + gauss(u, 0.40, 0.07, 0.78) + gauss(u, 0.53, 0.03, 0.22) + gauss(u, 0.77, 0.07, 0.42) + 0.06;
  const cx = u => ox + 20 + u * (W - 60), cy = a => oy - a * (H - 40) / 1.05;
  axes(Dg, ox, oy, W, H, 'λ', 'A');
  const cpath = el('path', { d: curve(f, 0, 1, cx, cy, 300), stroke: C.cyan, 'stroke-width': 5, fill: 'none' }, Dg);
  cpath.setAttribute('pathLength', 1); cpath.setAttribute('stroke-dasharray', '1 1');
  const scan = el('g', {}, Dg);
  el('line', { y1: oy, y2: oy - H + 10, stroke: C.violet, 'stroke-width': 2, 'stroke-dasharray': '6 6' }, scan);
  T(scan, 0, oy - H, '扫描波长', { size: 20, fill: C.violet, anchor: 'middle' });
  U.push(t => {
    if (t < at(id, 16) - 1 || t > SC[id].t1) return;
    const k = prog(t, at(id, 16) + 0.5, end(id, 17) - at(id, 16) - 0.5);
    cpath.setAttribute('stroke-dashoffset', (1 - k).toFixed(4));
    scan.setAttribute('transform', `translate(${cx(k).toFixed(1)} 0)`);
    scan.setAttribute('opacity', k > 0 && k < 1 ? 1 : 0);
  });
  const def = G(Dg, { in: at(id, 17) });
  card(def, 1420, 330, 440, 230, { stroke: C.cyanDeep });
  T(def, 1445, 380, '吸收光谱曲线', { size: 28, weight: 700, fill: C.cyan });
  T(def, 1445, 428, '横坐标：波长 λ', { size: 24 });
  T(def, 1445, 470, '纵坐标：吸光度 A', { size: 24 });
  T(def, 1445, 512, '溶液浓度一定', { size: 22, fill: C.muted });
  const mark = (tin, u, lab, c, dy = -26, drop) => {
    const mg3 = G(Dg, { in: tin, fx: 'scale', ox: cx(u), oy: cy(f(u)) });
    el('circle', { cx: cx(u), cy: cy(f(u)), r: 8, fill: c }, mg3);
    T(mg3, cx(u), cy(f(u)) + dy, lab, { size: 26, fill: c, anchor: 'middle', weight: 700 });
    if (drop) {
      el('line', { x1: cx(u), y1: cy(f(u)) + 10, x2: cx(u), y2: oy, stroke: c, 'stroke-dasharray': '6 6', 'stroke-width': 2 }, mg3);
      T(mg3, cx(u), oy + 34, drop, { size: 24, fill: c, anchor: 'middle', weight: 700 });
    }
  };
  mark(at(id, 18), 0.395, '最强峰', C.gold, -26, 'λ_{max}');
  mark(at(id, 19), 0.765, '次强峰', C.green, -26);
  mark(at(id, 19) + 0.8, 0.548, '肩峰', C.violet, -26);
  mark(at(id, 19) + 1.6, 0.655, '峰谷', C.red, 46, 'λ_{min}');
  mark(at(id, 20), 0.03, '末端吸收', C.orange, 10);

  /* E: molecule vs atom */
  const Eg = G(g, { in: at(id, 21), fx: 'none' });
  [[0, '分子光谱', 'E_{分} = E_{电} + E_{振} + E_{转}', '带状光谱', 0.07], [1, '原子光谱', 'E_{原} = E_{电}', '线状光谱', 0.004]].forEach(([k, h, eqs, kind, w]) => {
    const x0 = 100 + k * 900;
    const pg = G(Eg, { in: at(id, 21) + k * 1.2 });
    card(pg, x0, 310, 820, 560, { stroke: k ? C.violet : C.cyan });
    T(pg, x0 + 410, 370, h, { size: 34, anchor: 'middle', weight: 700, fill: k ? C.violet : C.cyan });
    T(pg, x0 + 410, 440, eqs, { size: 34, anchor: 'middle', fill: C.gold });
    const ax = x0 + 90, ay = 780;
    axes(pg, ax, ay, 640, 260, 'λ', 'A', { size: 20 });
    el('path', { d: curve(u => Math.exp(-((u - 0.5) ** 2) / (2 * w * w)), 0, 1, u => ax + 20 + u * 600, a => ay - a * 220, 400), stroke: k ? C.violet : C.cyan, 'stroke-width': 4, fill: 'none' }, pg);
    const kg = G(pg, { in: at(id, 22) + k * 0.6 });
    T(kg, x0 + 410, 840, kind, { size: 30, anchor: 'middle', weight: 700, fill: C.gold });
  });
  T(G(Eg, { in: at(id, 22) + 1.4 }), 960, 912, '原子只有电子能级，没有振动、转动能级', { size: 24, anchor: 'middle', fill: C.muted });
});

/* ================= 9-2 valence electrons & transitions ================= */
S.push(function valence() {
  const id = 'valence', g = sceneGroup(id);
  title(g, id, '9-2 有机化合物的紫外吸收光谱', '课件 P13–21、P18');
  stepLabel(g, 60, 262, [[at(id, 0), '共价键与三种价电子'], [at(id, 7), '四种跃迁与所需能量'], [at(id, 11), '吸收强度与电子弛豫'], [at(id, 16), '四种跃迁逐一看']]);

  /* A: covalent bond */
  const A = G(g, { in: at(id, 0), out: at(id, 3) - 0.4, fx: 'none' });
  const a1 = el('circle', { r: 130, fill: 'rgba(61,213,243,.18)', stroke: C.cyan, 'stroke-width': 2 }, A);
  const a2 = el('circle', { r: 130, fill: 'rgba(167,139,250,.18)', stroke: C.violet, 'stroke-width': 2 }, A);
  const c1 = el('circle', { r: 16, fill: C.cyan }, A), c2 = el('circle', { r: 16, fill: C.violet }, A);
  const pair = G(A, { in: at(id, 1) + 1.0 });
  T(pair, 500, 588, '↑↓', { size: 44, anchor: 'middle', fill: C.gold, weight: 700 });
  U.push(t => {
    if (t < SC[id].t0 || t > at(id, 3)) return;
    const k = E(t, at(id, 1), 1.0);
    const d = lerp(320, 170, k);
    setAttrs(a1, { cx: 500 - d / 2 - 40, cy: 570 }); setAttrs(a2, { cx: 500 + d / 2 + 40, cy: 570 });
    setAttrs(c1, { cx: 500 - d / 2 - 40, cy: 570 }); setAttrs(c2, { cx: 500 + d / 2 + 40, cy: 570 });
  });
  const bl = G(A, { in: at(id, 1) + 1.4 });
  T(bl, 500, 790, '轨道重叠 → 共用自旋相反的电子对', { size: 28, anchor: 'middle', weight: 700 });
  T(bl, 500, 832, '→ 能量降低而成键', { size: 26, anchor: 'middle', fill: C.gold });
  const chain = [['价电子的分布与结合', C.text], ['价电子能级跃迁', C.cyan], ['紫外吸收光谱', C.gold]];
  chain.forEach(([s, c], k) => {
    const cg = G(A, { in: at(id, 2) + k * 0.7 });
    card(cg, 1150, 340 + k * 170, 560, 100, { stroke: c });
    T(cg, 1430, 402 + k * 170, s, { size: 30, anchor: 'middle', fill: c, weight: 700 });
    if (k < 2) arrow(cg, 1430, 444 + k * 170, 1430, 504 + k * 170, C.muted);
  });

  /* B: three electron types + formaldehyde */
  const B = G(g, { in: at(id, 3), out: at(id, 7) - 0.4, fx: 'none' });
  const types = [
    [3, 330, 'σ 电子', '轨道“头碰头”→ 单键', 'C–H、C–C', C.cyan],
    [4, 960, 'π 电子', '轨道“肩并肩”→ 双键', 'C=C、C=O', C.gold],
    [5, 1590, 'n 电子', '未成键的孤对电子', '如 C=O 中 O 上的孤对电子', C.red]
  ];
  types.forEach(([li, x, h, s1, s2, c], k) => {
    const tg = G(B, { in: at(id, li) });
    card(tg, x - 280, 300, 560, 380, { stroke: c });
    const dg = el('g', {}, tg);
    if (k === 0) {
      el('ellipse', { cx: x - 60, cy: 430, rx: 90, ry: 42, fill: 'rgba(61,213,243,.25)', stroke: c, 'stroke-width': 2 }, dg);
      el('ellipse', { cx: x + 60, cy: 430, rx: 90, ry: 42, fill: 'rgba(61,213,243,.25)', stroke: c, 'stroke-width': 2 }, dg);
      el('circle', { cx: x - 110, cy: 430, r: 9, fill: C.text }, dg); el('circle', { cx: x + 110, cy: 430, r: 9, fill: C.text }, dg);
    } else if (k === 1) {
      [-45, 45].forEach(dx => {
        el('ellipse', { cx: x + dx, cy: 390, rx: 30, ry: 52, fill: 'rgba(247,197,72,.22)', stroke: c, 'stroke-width': 2 }, dg);
        el('ellipse', { cx: x + dx, cy: 480, rx: 30, ry: 52, fill: 'rgba(247,197,72,.22)', stroke: c, 'stroke-width': 2 }, dg);
        el('circle', { cx: x + dx, cy: 435, r: 9, fill: C.text }, dg);
      });
      el('line', { x1: x - 45, y1: 435, x2: x + 45, y2: 435, stroke: C.muted, 'stroke-width': 3 }, dg);
    } else {
      el('circle', { cx: x, cy: 435, r: 46, fill: 'rgba(255,122,107,.18)', stroke: c, 'stroke-width': 2 }, dg);
      T(dg, x, 448, 'O', { size: 40, anchor: 'middle', weight: 700 });
      [[-70, -20], [-70, 20], [70, -20], [70, 20]].forEach(([dx, dy]) => el('circle', { cx: x + dx, cy: 435 + dy, r: 7, fill: c }, dg));
    }
    T(tg, x, 570, h, { size: 36, anchor: 'middle', weight: 700, fill: c });
    T(tg, x, 614, s1, { size: 24, anchor: 'middle', maxw: 520 });
    T(tg, x, 652, s2, { size: 22, anchor: 'middle', fill: C.muted, maxw: 520 });
  });
  const hc = G(B, { in: at(id, 6) });
  card(hc, 560, 712, 800, 210, { stroke: C.line });
  T(hc, 600, 760, '例：甲醛', { size: 26, weight: 700 });
  const fx = 1010, fy = 820;
  el('line', { x1: fx, y1: fy, x2: fx - 90, y2: fy - 50, stroke: C.cyan, 'stroke-width': 4 }, hc);
  el('line', { x1: fx, y1: fy, x2: fx - 90, y2: fy + 50, stroke: C.cyan, 'stroke-width': 4 }, hc);
  el('line', { x1: fx + 20, y1: fy - 8, x2: fx + 130, y2: fy - 8, stroke: C.gold, 'stroke-width': 4 }, hc);
  el('line', { x1: fx + 20, y1: fy + 8, x2: fx + 130, y2: fy + 8, stroke: C.cyan, 'stroke-width': 4 }, hc);
  T(hc, fx, fy + 12, 'C', { size: 36, anchor: 'middle', weight: 700 });
  T(hc, fx + 158, fy + 12, 'O', { size: 36, anchor: 'middle', weight: 700 });
  T(hc, fx - 110, fy - 46, 'H', { size: 30, anchor: 'middle' }); T(hc, fx - 110, fy + 64, 'H', { size: 30, anchor: 'middle' });
  [[-14, -32], [14, -32], [-14, 34], [14, 34]].forEach(([dx, dy]) => el('circle', { cx: fx + 158 + dx, cy: fy + dy, r: 6, fill: C.red }, hc));
  T(hc, fx - 60, fy - 46, 'σ', { size: 26, fill: C.cyan, weight: 700 });
  T(hc, fx + 75, fy - 22, 'π', { size: 26, fill: C.gold, weight: 700, anchor: 'middle' });
  T(hc, fx + 200, fy - 30, 'n', { size: 28, fill: C.red, weight: 700 });

  /* C: orbital ladder */
  const Cg = G(g, { in: at(id, 7), out: at(id, 11) - 0.4, fx: 'none' });
  const lev = { 'σ': 820, 'π': 700, 'n': 580, 'π*': 440, 'σ*': 330 };
  const lname = { 'σ': 'σ 成键轨道', 'π': 'π 成键轨道', 'n': 'n 非键轨道', 'π*': 'π^{*} 反键轨道', 'σ*': 'σ^{*} 反键轨道' };
  ['σ', 'π', 'n', 'π*', 'σ*'].forEach((k, j) => {
    const lg = G(Cg, { in: at(id, 7) + j * 0.5, fx: 'left' });
    el('line', { x1: 140, y1: lev[k], x2: 760, y2: lev[k], stroke: k.includes('*') ? C.violet : C.text, 'stroke-width': 3 }, lg);
    T(lg, 780, lev[k] + 9, lname[k], { size: 24, fill: k.includes('*') ? C.violet : C.text });
  });
  T(G(Cg, { in: at(id, 7) }), 110, 330, '能量 ↑', { size: 22, fill: C.muted, anchor: 'end' });
  const trs = [['σ', 'σ*', 210, 'σ→σ^{*}', C.violet], ['n', 'σ*', 360, 'n→σ^{*}', C.orange], ['π', 'π*', 510, 'π→π^{*}', C.cyan], ['n', 'π*', 660, 'n→π^{*}', C.red]];
  trs.forEach(([a, b, x, s, c], k) => {
    const tg = G(Cg, { in: at(id, 8) + k * 0.7, fx: 'none' });
    D(arrow(tg, x, lev[a], x, lev[b] + 4, c, 4), at(id, 8) + k * 0.7, 0.5);
    T(tg, x, 870, s, { size: 24, fill: c, anchor: 'middle', weight: 700 });
  });
  const ineq = G(Cg, { in: at(id, 9) });
  card(ineq, 1040, 360, 820, 180, { stroke: C.gold, fill: 'rgba(247,197,72,.06)' });
  T(ineq, 1070, 410, '跃迁所需能量', { size: 26, fill: C.muted });
  T(ineq, 1450, 486, 'σ→σ^{*} > n→σ^{*} ≥ π→π^{*} > n→π^{*}', { size: 36, anchor: 'middle', fill: C.gold, weight: 700, maxw: 780 });
  const wl = G(Cg, { in: at(id, 10) });
  card(wl, 1040, 600, 820, 180, { stroke: C.cyanDeep });
  T(wl, 1450, 672, '能量越大 ⟹ 吸收波长越短', { size: 34, anchor: 'middle', weight: 700, fill: C.cyan });
  T(wl, 1450, 728, 'σ→σ^{*} 在远紫外；n→π^{*} 在近紫外', { size: 24, anchor: 'middle', fill: C.muted });

  /* D: absorption strength + relaxation */
  const Dg = G(g, { in: at(id, 11), out: at(id, 16) - 0.4, fx: 'none' });
  card(Dg, 70, 300, 900, 620, { stroke: C.cyanDeep });
  T(Dg, 100, 350, '① 吸收光子', { size: 30, weight: 700, fill: C.cyan });
  T(G(Dg, { in: at(id, 11) + 0.3 }), 520, 440, '比尔定律  A = κbc', { size: 48, anchor: 'middle', fill: C.gold, weight: 700 });
  const kd = G(Dg, { in: at(id, 12) });
  T(kd, 100, 510, 'κ：摩尔吸收系数，约 0～10^{5} L/(mol·cm)', { size: 25, maxw: 840 });
  T(kd, 100, 552, '取决于 捕获光子的横截面积（约 10^{−15} cm^{2}）', { size: 23, fill: C.muted, maxw: 840 });
  T(kd, 100, 590, '和 跃迁几率 P（0～1）', { size: 23, fill: C.muted, maxw: 840 });
  const bx = v => 140 + v * 150; // log10 kappa 0..5
  const sc = G(Dg, { in: at(id, 13), fx: 'none' });
  [[0, 2, C.red, '弱吸收'], [2, 4, C.gold, '中等'], [4, 5, C.cyan, '强吸收']].forEach(([a, b, c, s], k) => {
    const zg = G(sc, { in: at(id, 13) + [0.0, 0.5, 1.0][[2, 0, 1][k]], fx: 'none' });
    el('rect', { x: bx(a), y: 650, width: bx(b) - bx(a), height: 40, fill: c, opacity: 0.75 }, zg);
    T(zg, (bx(a) + bx(b)) / 2, 678, s, { size: 22, anchor: 'middle', fill: C.bg1, weight: 700 });
  });
  for (let v = 0; v <= 5; v++) T(sc, bx(v), 724, '10^{' + v + '}', { size: 20, anchor: 'middle', fill: C.muted });
  T(sc, 100, 780, 'κ = 10^{4}～10^{5}：强吸收', { size: 25, fill: C.cyan, weight: 500 });
  T(sc, 100, 822, 'κ < 10^{2}：弱吸收，多为禁阻跃迁（P < 0.01）', { size: 25, fill: C.red, weight: 500, maxw: 840 });
  const rx = G(Dg, { in: at(id, 14), fx: 'none' });
  card(rx, 1010, 300, 850, 620, { stroke: C.violet });
  T(rx, 1040, 350, '② 电子弛豫：激发态 → 基态', { size: 30, weight: 700, fill: C.violet });
  el('line', { x1: 1080, y1: 450, x2: 1300, y2: 450, stroke: C.cyan, 'stroke-width': 3 }, rx);
  el('line', { x1: 1080, y1: 800, x2: 1300, y2: 800, stroke: C.text, 'stroke-width': 3 }, rx);
  T(rx, 1190, 434, '激发态', { size: 22, fill: C.cyan, anchor: 'middle' });
  T(rx, 1190, 836, '基态', { size: 22, anchor: 'middle' });
  el('circle', { cx: 1190, cy: 450, r: 11, fill: C.gold, filter: 'url(#glow)' }, rx);
  const ways = [['放热', C.orange], ['引发光化学反应', C.pink], ['发出荧光或磷光', C.green]];
  ways.forEach(([s, c], k) => {
    const wg = G(rx, { in: at(id, 15) + k * 0.8 });
    const y = 480 + k * 130;
    el('path', { d: `M1200 460 Q1320 ${y} 1440 ${y + 40}`, stroke: c, 'stroke-width': 3, fill: 'none', 'marker-end': `url(#${arrowId(c)})` }, wg);
    card(wg, 1450, y + 6, 380, 70, { stroke: c });
    T(wg, 1640, y + 52, s, { size: 26, anchor: 'middle', fill: c, weight: 700 });
  });
  T(G(rx, { in: at(id, 15) + 2.6, cls: 'note' }), 1040, 890, '光化学反应可使激发态分子分解为另一种化合物', { size: 20, fill: C.muted });

  /* E: the four transitions on a λ–lgκ map */
  const Eg = G(g, { in: at(id, 16), fx: 'none' });
  const ox = 1000, oy = 790, X = l => ox + (l - 100) * 2.25, Y = v => oy - v * 82;
  el('rect', { x: X(100), y: Y(5) - 10, width: X(200) - X(100), height: oy - Y(5) + 10, fill: C.violet, opacity: 0.07 }, Eg);
  axes(Eg, ox, oy, 840, 440, 'λ / nm', 'lg κ');
  [100, 150, 200, 250, 300, 350, 400].forEach(v => {
    el('line', { x1: X(v), y1: oy, x2: X(v), y2: oy + 8, stroke: C.muted }, Eg);
    T(Eg, X(v), oy + 30, String(v), { size: 18, fill: C.muted, anchor: 'middle' });
  });
  for (let v = 1; v <= 5; v++) T(Eg, ox - 10, Y(v) + 6, String(v), { size: 18, fill: C.muted, anchor: 'end' });
  T(Eg, (X(100) + X(200)) / 2, Y(5) + 18, '远紫外', { size: 20, fill: C.violet, anchor: 'middle' });
  T(Eg, (X(200) + X(400)) / 2, Y(5) + 18, '近紫外', { size: 20, fill: C.muted, anchor: 'middle' });
  const bars = [
    [16, 110, 150, 3.8, 4.3, C.violet, 'σ→σ^{*}', [130, 4.45, 'middle']],
    [19, 180, 220, 2.0, 3.9, C.orange, 'n→σ^{*}', [224, 2.9, 'start']],
    [21, 160, 225, 4.0, 4.5, C.cyan, 'π→π^{*}', [229, 4.62, 'start']],
    [25, 200, 400, 0.6, 1.9, C.red, 'n→π^{*}', [300, 2.05, 'middle']]
  ];
  bars.forEach(([li, a, b, lo, hi, c, s, [lx, ly, la]]) => {
    const bg2 = G(Eg, { in: at(id, li) + 0.4, fx: 'scale', ox: (X(a) + X(b)) / 2, oy: Y((lo + hi) / 2) });
    el('rect', { x: X(a), y: Y(hi), width: X(b) - X(a), height: Y(lo) - Y(hi), rx: 8, fill: c, opacity: 0.35, stroke: c, 'stroke-width': 2 }, bg2);
    T(bg2, X(lx), Y(ly), s, { size: 22, fill: c, anchor: la, weight: 700 });
  });
  const ex = G(Eg, { in: at(id, 17) + 1.2 });
  [[125, 'CH_{4}'], [135, 'C_{2}H_{6}'], [150, 'C_{4}H_{10}']].forEach(([l, s], k) => {
    el('line', { x1: X(l), y1: Y(4.3) + 2, x2: X(l), y2: oy, stroke: C.violet, 'stroke-dasharray': '3 5' }, ex);
    T(ex, X(l), oy + 56 + k * 24, s + ' ' + l, { size: 17, fill: C.violet, anchor: 'middle' });
  });
  const rs2 = G(Eg, { in: at(id, 22) + 0.5 });
  el('circle', { cx: X(165), cy: Y(4.0), r: 8, fill: C.cyan }, rs2);
  el('circle', { cx: X(217), cy: Y(4.32), r: 8, fill: C.gold }, rs2);
  el('path', { d: `M${X(165)} ${Y(4.0) - 14} Q${X(191)} ${Y(4.9)} ${X(217) - 6} ${Y(4.32) - 14}`, stroke: C.red, 'stroke-width': 3, fill: 'none', 'marker-end': `url(#${arrowId(C.red)})` }, rs2);
  T(rs2, X(150), Y(4.0) + 34, '乙烯 165', { size: 18, fill: C.cyan, anchor: 'middle' });
  T(rs2, X(229), Y(4.2), '丁二烯 217', { size: 18, fill: C.gold });
  T(rs2, X(196), Y(5.15), '共轭 → 红移', { size: 20, fill: C.red, anchor: 'middle', weight: 700 });

  const cards = [
    [16, 19, '① σ→σ^{*}', C.violet, [
      [16, '所需能量最高：远紫外，λ < 150 nm'],
      [17, '发生在饱和烃中，强吸收'],
      [17, '例：CH_{4} 125 nm · C_{2}H_{6} 135 nm（κ = 10^{4}）· C_{4}H_{10} 150 nm', 1.2],
      [18, '近紫外无吸收 → 饱和烃常用作溶剂']]],
    [19, 21, '② n→σ^{*}', C.orange, [
      [19, '能量较小：λ ≈ 200 nm'],
      [19, 'κ ≈ 10^{2}～10^{4}：中等强度吸收', 1.6],
      [20, '含 N、O、S、卤素杂原子的饱和化合物'],
      [20, '如 –NH_{2}、–OH、–X（助色团）', 1.6]]],
    [21, 25, '③ π→π^{*}', C.cyan, [
      [21, '孤立双键吸收在 200 nm 左右'],
      [21, 'κ > 10^{4}：强吸收', 1.6],
      [22, '乙烯 λ_{max} 165 nm（κ = 10^{4}）'],
      [22, '1,3-丁二烯 λ_{max} 217 nm（κ = 21000）', 1.6],
      [23, '共轭体系增大 → 红移，κ 增大'],
      [24, '生色团：C=C、C=O、C≡C']]],
    [25, null, '④ n→π^{*}', C.red, [
      [25, '能量最小：200～400 nm（近紫外）'],
      [25, 'κ < 10^{2}：弱吸收', 2.0],
      [26, '杂原子直接连接双键：'],
      [26, 'C=O、C=S、–N=O、–N=N–', 1.4]]]
  ];
  cards.forEach(([li, nx, h, c, items]) => {
    const cg = G(Eg, { in: at(id, li), out: nx != null ? at(id, nx) - 0.35 : null, od: 0.3, fx: 'left' });
    card(cg, 70, 300, 880, 620, { stroke: c });
    T(cg, 110, 370, h, { size: 44, fill: c, weight: 700 });
    bullets(cg, 110, 450, items.map(([l, s, dt]) => [s, at(id, l) + (dt || 0)]), { size: 26, gap: 74, dot: c, maxw: 800 });
  });
});
})();
