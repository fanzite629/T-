"""Decode a completed MP4 and extract one review frame from every teaching scene."""
import argparse
import concurrent.futures
import json
import os
from pathlib import Path
import shutil
import subprocess
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('chapter', type=int, choices=[1, 2])
parser.add_argument('video', type=Path)
parser.add_argument('review_dir', type=Path)
args = parser.parse_args()
project = ROOT / f'mcu-ch{args.chapter:02d}'
timeline = json.loads((project / 'timeline.json').read_text(encoding='utf-8'))
ffmpeg = os.environ.get('FFMPEG') or shutil.which('ffmpeg') or 'ffmpeg'
args.review_dir.mkdir(parents=True, exist_ok=True)
decoded = subprocess.run([ffmpeg, '-hide_banner', '-v', 'error', '-threads', '4', '-i', str(args.video), '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', '-'], capture_output=True, text=True)
assert decoded.returncode == 0 and not decoded.stderr.strip(), decoded.stderr

def frame(scene):
    at = (scene['panels'][0]['start'] + scene['panels'][0]['end']) / 2
    path = args.review_dir / (scene['id'] + '.jpg')
    subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-ss', f'{at:.3f}', '-i', str(args.video), '-frames:v', '1', '-q:v', '2', str(path)], check=True)
    return path, at

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    frames = list(pool.map(frame, timeline['scenes']))
for offset in (0, 14):
    subset = frames[offset:offset + 14]
    sheet = Image.new('RGB', (1600, 7 * 480), '#172B4D')
    draw = ImageDraw.Draw(sheet)
    for i, (path, at) in enumerate(subset):
        x = (i % 2) * 800
        y = (i // 2) * 480
        with Image.open(path) as source:
            assert source.size == (1920, 1080)
            source.thumbnail((800, 450))
            sheet.paste(source, (x, y + 30))
        draw.text((x + 15, y + 8), f'{path.stem} / {at:.2f}s', fill='white')
    sheet.save(args.review_dir / f'contact-sheet-{offset // 14 + 1}.jpg', quality=92)

result = {'chapter': args.chapter, 'decoded_entire_video_without_errors': True,
          'review_frames': len(frames), 'review_frame_dimensions': [1920, 1080]}
(project / 'encoded-validation.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result))
