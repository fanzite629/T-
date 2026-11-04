"""Validate source coverage, narration assets, captions and render time budgets."""
from pathlib import Path
import csv
import json

ROOT = Path(__file__).resolve().parent
results = []
for chapter, pages in [(1, 63), (2, 34)]:
    project = ROOT / f'mcu-ch{chapter:02d}'
    source = ROOT.parent / f'docs/mcu-video-scripts/ch{chapter:02d}'
    timeline = json.loads((project / 'timeline.json').read_text(encoding='utf-8'))
    audio = json.loads((project / 'audio-meta.json').read_text(encoding='utf-8'))
    script = json.loads((source / 'script.json').read_text(encoding='utf-8'))
    coverage = list(csv.DictReader((source / 'coverage.csv').open(encoding='utf-8-sig')))
    assert len(coverage) == pages
    assert {int(x['PDF物理页码']) for x in coverage} == set(range(1, pages + 1))
    assert set(p for s in timeline['scenes'] for p in s['source_pages']) == set(range(1, pages + 1))
    assert len(timeline['scenes']) == len(audio['scenes']) == len(script['scenes']) == 28
    previous = 0
    for scene, speech, original in zip(timeline['scenes'], audio['scenes'], script['scenes']):
        assert scene['id'] == speech['id'] == original['id']
        assert speech['text'] == original['narration'].strip()
        assert abs(scene['start'] - previous) < 0.01
        assert speech['duration'] + 0.5 < scene['end'] - scene['start']
        assert (project / 'assets/audio' / (scene['id'] + '.mp3')).stat().st_size > 1000
        assert abs(scene['panels'][0]['start'] - scene['start']) < 0.01
        assert abs(scene['panels'][-1]['end'] - scene['end']) < 0.01
        for first, second in zip(scene['panels'], scene['panels'][1:]):
            assert abs(first['end'] - second['start']) < 0.01
        previous = scene['end']
    assert previous == timeline['duration'] == 1440
    for first, second in zip(timeline['captions'], timeline['captions'][1:]):
        assert first['start'] < first['end'] <= second['start'] + 0.01
    assert timeline['captions'][-1]['end'] <= 1440
    results.append({'chapter': chapter, 'source_pages': pages, 'source_coverage_complete': True,
        'scenes': 28, 'visual_states': sum(len(s['panels']) for s in timeline['scenes']),
        'captions': len(timeline['captions']), 'duration_seconds': 1440,
        'voice_seconds': round(timeline['voice_seconds'], 3), 'audio_and_script_match': True,
        'panel_intervals_contiguous': True, 'caption_intervals_ordered': True})

(ROOT / 'source-validation.json').write_text(json.dumps({'ok': True, 'chapters': results}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(results, ensure_ascii=False))
