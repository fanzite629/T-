"""Synthesize one episode's narration line by line and derive its animation timeline.

Usage:
  python3 tools/build_audio.py --ep 1 --model <dir of kokoro-multi-lang-v1_0> [--say "text"]

Inputs   src/script/ep<N>.json   {title, scenes:[{id, sec, pages:[...], lines:[{t, s?, p?}]}]}
           t = subtitle text (also the spoken text after speakable()), s = spoken override, p = extra pause
Outputs  src/tl/ep<N>.js         window.TL = {title, ep, duration, scenes:[...], lines:[...]}
         exports/ep<N>-narration.wav
Per-line audio is cached under .tts-cache/ keyed by the spoken text.
"""
import argparse, hashlib, json, os, re, sys
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCENE_LEAD = 0.9      # silence at the start of each scene (visual transition)
LINE_GAP = 0.30       # silence between lines
SPEED = 1.0
SID = 45              # kokoro multi-lang v1.0 speaker: zf_xiaobei (Mandarin, female)

ZH = dict(zip('0123456789', '零一二三四五六七八九'))
# how a Chinese MCU teacher reads these tokens aloud
WORDS = {
    'MOV': 'move', 'MOVC': 'move c', 'MOVX': 'move x', 'PUSH': 'push', 'POP': 'pop', 'SWAP': 'swap',
    'ADD': 'add', 'ADDC': 'add c', 'SUBB': 'sub b', 'SETB': 'set b', 'ACALL': 'a call', 'LCALL': 'l call',
    'AJMP': 'a jump', 'LJMP': 'l jump', 'SJMP': 's jump', 'JMP': 'jump', 'DATA': 'data', 'XDATA': 'x data',
    'BIT': 'bit', 'Bit': 'bit', 'END': 'end', 'RAM': 'ram', 'MAIN': 'main', 'LOOP': 'loop', 'NEXT': 'next',
    'STOP': 'stop', 'FIRST': 'first', 'TABEL': 'table', 'ZERO': 'zero', 'Recycle': 'recycle',
    'Pi': 'p i', 'Ri': 'r i', 'Rn': 'r n', 'rel': 'r e l', 'Acc': 'a c c', 'Cy': 'c y',
    'Exclusive': 'exclusive', 'at': 'at', 'OR': 'or', 'LABEL': 'label', 'COUNT': 'count', 'Intel': 'intel',
}


def load_lexicon(model):
    words = set()
    with open(os.path.join(model, 'lexicon-us-en.txt'), encoding='utf-8') as f:
        for line in f:
            words.add(line.split(' ', 1)[0])
    return words


LEX = set()


def spell(s):
    out = []
    for ch in s:
        if ch.isdigit():
            out.append(ZH[ch])
        elif ch.isalpha():
            out.append(ch.lower())
    return ' '.join(out)


def say_token(tok):
    # hex number with H suffix: 30H, 0AAH, 8056H
    m = re.fullmatch(r'0?([0-9A-F]+)H', tok)
    if m and tok[0].isdigit():
        body = tok[:-1]
        return ' '.join(ZH[c] if c.isdigit() else c.lower() for c in body) + ' h'
    # binary with B suffix (at least 4 bits)
    if re.fullmatch(r'[01]{4,}B', tok):
        return ' '.join(ZH[c] for c in tok[:-1]) + ' b'
    if re.fullmatch(r'[01]{4,}', tok) or re.fullmatch(r'0[01]{2}', tok):
        return ' '.join(ZH[c] for c in tok)
    if re.fullmatch(r'\d+K', tok):
        return tok[:-1] + ' k'
    if re.fullmatch(r'\d+', tok):
        return tok          # decimal: number FST reads it as a quantity
    if tok in WORDS:
        return WORDS[tok]
    m = re.fullmatch(r'([A-Za-z]+)(\d+)', tok)      # R0, C6, D7, P1, NEXT1
    if m:
        head = WORDS.get(m.group(1)) or (m.group(1).lower() if m.group(1).lower() in LEX and len(m.group(1)) > 3 else spell(m.group(1)))
        return head + ' ' + ' '.join(ZH[c] for c in m.group(2))
    if tok.isalpha():
        low = tok.lower()
        if ((tok[0].isupper() and tok[1:].islower()) or tok.islower()) and low in LEX and len(tok) > 2:
            return low
        return spell(tok)
    return spell(tok)


def speakable(line):
    t = line.get('s', line['t'])
    t = re.sub(r'\{[a-z]\|([^}]*)\}', r'\1', t)
    t = t.replace('MCS-51', 'MCS 五一').replace('I/O', 'IO')
    t = re.sub(r'[_^]\{([^}]*)\}', r'\1', t)
    rep = [('→', '，变成 '), ('←', '，送入 '), ('⊕', ' 异或 '), ('×', ' 乘 '), ('÷', ' 除以 '), ('≠', ' 不等于 '),
           ('≤', ' 小于等于 '), ('≥', ' 大于等于 '), ('~', ' 到 '), ('～', ' 到 '), ('＝', ' 等于 '), ('=', ' 等于 '),
           ('<', ' 小于 '), ('>', ' 大于 '), ('+', ' 加 '), ('#', ' 立即数 '), ('@', ' at '), ('“', ''), ('”', ''),
           ('「', ''), ('」', ''), ('(', ' '), (')', ' '), ('（', '，'), ('）', '，'), ('…', '，'), ('—', '，'),
           ('；', '，'), ('/', ' '), ('·', ' '), ('…', '')]
    t = re.sub(r'(?<![0-9A-Za-z])-(?=\d)', '负', t)
    t = re.sub(r'(?<![0-9A-Za-z])\+(?=\d)', '正', t)
    t = re.sub(r'(?<=[0-9A-Za-z\s])-(?=[\s0-9A-Za-z])', ' 减 ', t)
    for a, b in rep:
        t = t.replace(a, b)
    t = re.sub(r'([0-9A-Za-z])\.(?=[0-9])', r'\1 点 ', t)
    t = re.sub(r'(?<=[0-9A-Za-z]),(?=\s*[#@0-9A-Za-z立at])', '，', t)
    t = t.replace(',', '，')
    t = re.sub(r'[0-9A-Za-z_]+', lambda m: ' ' + say_token(m.group(0)) + ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'，\s*，', '，', t)
    t = re.sub(r'^\s*，', '', t)
    # guard: every latin word must be in the lexicon, otherwise kokoro silently drops it
    for w in re.findall(r'[a-z]+', t):
        if w not in LEX:
            raise SystemExit(f'OOV "{w}" in: {line}')
    return t


def make_tts(model):
    import sherpa_onnx
    d = model.rstrip('/') + '/'
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                model=d + 'model.onnx', voices=d + 'voices.bin', tokens=d + 'tokens.txt',
                data_dir=d + 'espeak-ng-data', dict_dir=d + 'dict',
                lexicon=d + 'lexicon-us-en.txt,' + d + 'lexicon-zh.txt'),
            num_threads=4),
        rule_fsts=f'{d}date-zh.fst,{d}number-zh.fst,{d}phone-zh.fst')
    return sherpa_onnx.OfflineTts(cfg)


def synth(tts, say, cache):
    key = hashlib.sha1(f'kokoro{SID}|{SPEED}|{say}'.encode()).hexdigest()[:16]
    fp = os.path.join(cache, key + '.wav')
    if os.path.exists(fp):
        audio, sr = sf.read(fp, dtype='float32')
        return audio, sr, fp
    a = tts.generate(say, sid=SID, speed=SPEED)
    audio = np.asarray(a.samples, dtype=np.float32)
    nz = np.where(np.abs(audio) > 0.004)[0]
    if len(nz):
        audio = audio[max(0, nz[0] - int(0.10 * a.sample_rate)): nz[-1] + int(0.10 * a.sample_rate)]
    sf.write(fp, audio, a.sample_rate)
    return audio, a.sample_rate, fp


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ep', type=int)
    ap.add_argument('--model', required=True)
    ap.add_argument('--say')
    ap.add_argument('--dry', action='store_true', help='only print the spoken text of every line')
    args = ap.parse_args()
    LEX.update(load_lexicon(args.model))
    if args.say:
        print(speakable({'t': args.say}))
        return
    script = json.load(open(os.path.join(ROOT, f'src/script/ep{args.ep}.json'), encoding='utf-8'))
    if args.dry:
        for sc in script['scenes']:
            for ln in sc['lines']:
                print(sc['id'], '|', speakable(ln))
        return
    tts = make_tts(args.model)
    cache = os.path.join(ROOT, '.tts-cache')
    os.makedirs(cache, exist_ok=True)
    sr = tts.sample_rate
    chunks, lines, scenes, t = [], [], [], 0.0

    def silence(sec):
        nonlocal t
        n = int(round(sec * sr))
        chunks.append(np.zeros(n, dtype=np.float32))
        t += n / sr

    for sc in script['scenes']:
        s0 = t
        silence(SCENE_LEAD)
        for i, ln in enumerate(sc['lines']):
            audio, _, fp = synth(tts, speakable(ln), cache)
            t0 = t
            chunks.append(audio)
            t += len(audio) / sr
            lines.append({'scene': sc['id'], 'i': i, 't0': round(t0, 3), 't1': round(t, 3), 't': ln['t'],
                          'wav': os.path.basename(fp)})
            silence(LINE_GAP + ln.get('p', 0))
        silence(sc.get('tail', 0.6))
        scenes.append({'id': sc['id'], 'sec': sc['sec'], 'pages': sc['pages'], 't0': round(s0, 3), 't1': round(t, 3)})

    full = np.concatenate(chunks)
    peak = float(np.max(np.abs(full))) or 1.0
    full = full / peak * 0.89
    os.makedirs(os.path.join(ROOT, 'exports'), exist_ok=True)
    sf.write(os.path.join(ROOT, f'exports/ep{args.ep}-narration.wav'), full, sr)
    tl = {'title': script['title'], 'ep': args.ep, 'duration': round(t, 3), 'scenes': scenes, 'lines': lines}
    os.makedirs(os.path.join(ROOT, 'src/tl'), exist_ok=True)
    with open(os.path.join(ROOT, f'src/tl/ep{args.ep}.js'), 'w', encoding='utf-8') as f:
        f.write('// Generated by tools/build_audio.py — do not edit by hand.\nwindow.TL = ')
        json.dump(tl, f, ensure_ascii=False, indent=0)
        f.write(';\n')
    print(f'ep{args.ep}: duration {t:.1f}s, {len(lines)} lines')
    for s in scenes:
        print(f"  {s['id']:10s} {s['t0']:7.1f} – {s['t1']:7.1f}  ({s['t1'] - s['t0']:.1f}s)  P{s['pages']}")


if __name__ == '__main__':
    main()
