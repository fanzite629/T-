/* Player: builds scenes, keeps the narration audio and the animation clock in sync. */
'use strict';
(() => {
const ENG = window.ENG, TL = ENG.TL, DUR = TL.duration;
const $ = id => document.getElementById(id);
const audio = $('audio'), scrub = $('scrub'), btnPlay = $('btnPlay');
let t = 0, playing = false, last = 0, audioOK = false;

const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function render(tt) {
  ENG.applyAll(tt);
  scrub.value = tt;
  $('time').textContent = `${fmt(tt)} / ${fmt(DUR)}`;
}
function seek(tt) {
  t = Math.max(0, Math.min(DUR, tt));
  if (audioOK) try { audio.currentTime = t; } catch (_) {}
  render(t);
}
function play() {
  if (t >= DUR - 0.05) seek(0);
  playing = true; last = performance.now();
  btnPlay.textContent = '❚❚ 暂停'; $('bigPlay').classList.remove('show');
  if (audioOK) { audio.currentTime = t; audio.play().catch(() => {}); }
}
function pause() { playing = false; btnPlay.textContent = '▶ 播放'; audio.pause(); }
function loop(now) {
  if (playing) {
    const dt = (now - last) / 1000 * audio.playbackRate; last = now;
    // audio is the master clock while it is actually playing
    if (audioOK && !audio.paused && !audio.seeking) t = audio.currentTime; else t += dt;
    if (t >= DUR) { t = DUR; pause(); }
    render(t);
  }
  requestAnimationFrame(loop);
}
const sceneAt = tt => TL.scenes.findIndex(s => tt >= s.t0 && tt < s.t1);

async function init() {
  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch (_) {}
  ENG.init();
  for (const build of window.SCENES) build();
  scrub.max = DUR;
  audio.addEventListener('canplay', () => { audioOK = true; });
  audio.addEventListener('error', () => { audioOK = false; });
  if (audio.readyState >= 3) audioOK = true;

  btnPlay.onclick = () => (playing ? pause() : play());
  $('bigPlay').onclick = play;
  $('btnBack').onclick = () => seek(t - 5);
  $('btnFwd').onclick = () => seek(t + 5);
  scrub.oninput = () => seek(parseFloat(scrub.value));
  $('rate').onchange = e => { audio.playbackRate = parseFloat(e.target.value); };
  const toggle = (btn, cls) => { const on = document.body.classList.toggle(cls); btn.classList.toggle('on', !on); };
  $('btnCap').onclick = () => toggle($('btnCap'), 'hide-caps');
  $('btnNotes').onclick = () => toggle($('btnNotes'), 'hide-notes');
  $('btnMute').onclick = () => { audio.muted = !audio.muted; $('btnMute').classList.toggle('on', !audio.muted); };
  $('btnFs').onclick = () => (document.fullscreenElement ? document.exitFullscreen() : $('player').requestFullscreen?.());
  ENG.svg.addEventListener('click', e => {
    const n = e.target.closest('[data-seek]');
    if (n) seek(parseFloat(n.getAttribute('data-seek')));
  });
  let idle;
  const wake = () => { $('player').classList.remove('idle'); clearTimeout(idle); if (document.fullscreenElement) idle = setTimeout(() => $('player').classList.add('idle'), 2500); };
  document.addEventListener('mousemove', wake);
  document.addEventListener('fullscreenchange', wake);
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'SELECT') return;
    const k = e.key.toLowerCase();
    if (k === ' ') { e.preventDefault(); playing ? pause() : play(); }
    else if (k === 'arrowleft') seek(t - 5);
    else if (k === 'arrowright') seek(t + 5);
    else if (k === 'pagedown') { const i = sceneAt(t); if (TL.scenes[i + 1]) seek(TL.scenes[i + 1].t0 + 0.05); }
    else if (k === 'pageup') { const i = sceneAt(t); const s = TL.scenes[t - TL.scenes[i].t0 > 2 ? i : Math.max(0, i - 1)]; seek(s.t0 + 0.05); }
    else if (k === 'c') $('btnCap').click();
    else if (k === 'n') $('btnNotes').click();
    else if (k === 'm') $('btnMute').click();
    else if (k === 'f') $('btnFs').click();
    else if (k === 'h') document.body.classList.toggle('clean');
  });
  const q = new URLSearchParams(location.search);
  if (q.get('clean') === '1') document.body.classList.add('clean');
  if (q.get('cap') === '0') $('btnCap').click();
  if (q.get('notes') === '0') $('btnNotes').click();
  seek(q.has('t') ? parseFloat(q.get('t')) : 0);
  $('bigPlay').classList.toggle('show', !q.has('t'));
  requestAnimationFrame(loop);
  window.__render = tt => { pause(); $('bigPlay').classList.remove('show'); t = tt; render(tt); };
  window.__ready = true;
}
init();
})();
