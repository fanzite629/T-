"""Narration QA: transcribe every synthesized line with SenseVoice and compare its Chinese characters
with the subtitle text (LCS recall). Lines below the threshold are listed for manual review.
Usage: python3 tools/asr_check.py --ep 1 --asr <sense-voice dir> [--th 0.85]"""
import argparse, json, os, re, sys
import soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def lcs(a, b):
    m = [0] * (len(b) + 1)
    for x in a:
        prev = 0
        for j, y in enumerate(b):
            cur = m[j + 1]
            m[j + 1] = prev + 1 if x == y else max(m[j + 1], m[j])
            prev = cur
    return m[-1]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--ep', type=int); ap.add_argument('--asr'); ap.add_argument('--th', type=float, default=0.85)
    a = ap.parse_args()
    import sherpa_onnx
    d = a.asr.rstrip('/') + '/'
    r = sherpa_onnx.OfflineRecognizer.from_sense_voice(model=d + 'model.int8.onnx', tokens=d + 'tokens.txt', use_itn=False, num_threads=4, language='zh')
    src = open(os.path.join(ROOT, f'src/tl/ep{a.ep}.js'), encoding='utf-8').read()
    tl = json.loads(src[src.index('{'):src.rindex('}') + 1])
    han = lambda s: re.findall(r'[一-鿿]', s)
    bad, tot = [], []
    for ln in tl['lines']:
        audio, sr = sf.read(os.path.join(ROOT, '.tts-cache', ln['wav']), dtype='float32')
        s = r.create_stream(); s.accept_waveform(sr, audio); r.decode_stream(s)
        ref, hyp = han(ln['t']), han(s.result.text)
        rec = lcs(ref, hyp) / max(1, len(ref))
        tot.append(rec)
        if rec < a.th: bad.append((rec, ln['scene'], ln['i'], ln['t'], s.result.text))
    print(f'ep{a.ep}: {len(tot)} lines, mean Chinese recall {sum(tot) / len(tot):.3f}, flagged {len(bad)}')
    for b in bad: print(f'  {b[0]:.2f} {b[1]}[{b[2]}] {b[3]}\n       ASR: {b[4]}')

main()
