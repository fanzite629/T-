"""Add chapter navigation to an encoded lesson and verify delivery metadata."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('chapter', type=int, choices=[1, 2])
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    project = ROOT / f'mcu-ch{args.chapter:02d}'
    timeline = json.loads((project / 'timeline.json').read_text(encoding='utf-8'))
    metadata = [';FFMETADATA1', f'title=单片机课程 第{args.chapter}章', 'artist=Codex', 'comment=依据原课件制作，含普通话配音和内嵌字幕']
    for scene in timeline['scenes']:
        title = scene['title'].replace('\\', '\\\\').replace('=', '\\=').replace(';', '\\;').replace('#', '\\#').replace('\n', ' ')
        metadata += ['[CHAPTER]', 'TIMEBASE=1/1000', f"START={round(scene['start'] * 1000)}", f"END={round(scene['end'] * 1000)}", f'title={title}']
    metadata_path = project / 'chapters.ffmetadata'
    metadata_path.write_text('\n'.join(metadata) + '\n', encoding='utf-8')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg = os.environ.get('FFMPEG') or shutil.which('ffmpeg') or 'ffmpeg'
    ffprobe = os.environ.get('FFPROBE') or shutil.which('ffprobe') or 'ffprobe'
    subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(args.input), '-i', str(metadata_path), '-map', '0:v:0', '-map', '0:a:0', '-map_metadata', '1', '-map_chapters', '1', '-c', 'copy', '-movflags', '+faststart', str(args.output)], check=True)
    info = json.loads(subprocess.check_output([ffprobe, '-v', 'error', '-show_format', '-show_streams', '-show_chapters', '-of', 'json', str(args.output)], text=True, encoding='utf-8'))
    video = next(x for x in info['streams'] if x['codec_type'] == 'video')
    audio = next(x for x in info['streams'] if x['codec_type'] == 'audio')
    duration = float(info['format']['duration'])
    assert abs(duration - timeline['duration']) < 0.15 and duration <= 1500, duration
    assert (video['width'], video['height']) == (1920, 1080)
    assert video['r_frame_rate'] == '24/1'
    assert len(info['chapters']) == len(timeline['scenes']) == 28
    assert float(audio['duration']) >= duration - 0.15
    result = {
        'chapter': args.chapter, 'file': args.output.name, 'duration_seconds': duration,
        'width': video['width'], 'height': video['height'], 'fps': video['r_frame_rate'],
        'video_codec': video['codec_name'], 'audio_codec': audio['codec_name'],
        'audio_channels': audio['channels'], 'navigation_chapters': len(info['chapters']),
        'bytes': args.output.stat().st_size, 'sha256': hashlib.file_digest(args.output.open('rb'), 'sha256').hexdigest(),
    }
    (project / 'delivery.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()
