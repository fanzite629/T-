"""Reliable teaching-video export from HyperFrames panels, exact speech and timed captions.

prepare: create a clean snapshot project and capture manifest.
encode: assemble the captured panels at 24 fps, with narration and ASS subtitles.
This deliberately uses readable holds and clean panel cuts instead of continuous motion.
"""
from pathlib import Path
import argparse, json, os, shutil, subprocess

ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('mode',choices=['prepare','encode'])
parser.add_argument('chapter',type=int,choices=[1,2])
parser.add_argument('work',type=Path)
parser.add_argument('--output',type=Path)
args=parser.parse_args()
project=ROOT/f'mcu-ch{args.chapter:02d}'
timeline=json.loads((project/'timeline.json').read_text(encoding='utf-8'))
stage=args.work/'project';frames=args.work/'frames'
ffmpeg=os.environ.get('FFMPEG') or shutil.which('ffmpeg') or 'ffmpeg'

if args.mode=='prepare':
    stage.mkdir(parents=True,exist_ok=True);frames.mkdir(parents=True,exist_ok=True)
    for name in ['assets','compositions']:
        shutil.copytree(project/name,stage/name,dirs_exist_ok=True)
    for name in ['hyperframes.json','meta.json']:
        shutil.copy2(project/name,stage/name)
    html=(project/'index.html').read_text(encoding='utf-8')
    html=html.replace('</head>','<style>.caption{display:none!important}.track-fill{display:none!important}</style></head>')
    (stage/'index.html').write_text(html,encoding='utf-8')
    manifest=[]
    for scene in timeline['scenes']:
        for panel in scene['panels']:
            at=f"{(panel['start']+panel['end'])/2:.3f}".rstrip('0').rstrip('.')
            manifest.append({**panel,'at':at,'image':f'at-{at}s.png'})
    (args.work/'panels.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    (args.work/'times.txt').write_text(','.join(p['at'] for p in manifest),encoding='utf-8')
    print('Snapshot project ready:',stage,'panels:',len(manifest))
else:
    assert args.output
    panels=json.loads((args.work/'panels.json').read_text(encoding='utf-8'))
    # Encode each panel's intended time span. Rounding once to the frame grid keeps total exact.
    concat=['ffconcat version 1.0']
    for panel in panels:
        picture=(frames/panel['image']).resolve();assert picture.exists(),picture
        count=round(panel['end']*24)-round(panel['start']*24)
        concat += ["file '"+picture.as_posix().replace("'","'\\''")+"'",'option framerate 24',f'duration {count/24:.9f}']
    concat += ["file '"+(frames/panels[-1]['image']).resolve().as_posix()+"'"]
    (args.work/'frames.ffconcat').write_text('\n'.join(concat)+'\n',encoding='utf-8')
    # PCM assembly has no large filter graph and preserves each scene's measured start.
    rate=48000
    with (args.work/'narration.pcm').open('wb') as out:
        for scene in timeline['scenes']:
            pcm=subprocess.check_output([ffmpeg,'-v','error','-i',str(project/'assets/audio'/f"{scene['id']}.mp3"),'-f','s16le','-ac','1','-ar',str(rate),'-'])
            scene_samples=round((scene['end']-scene['start'])*rate)
            head=round(.5*rate);body=len(pcm)//2
            assert head+body<=scene_samples
            out.write(bytes(head*2));out.write(pcm);out.write(bytes((scene_samples-head-body)*2))
    def stamp(t):
        centis=round(t*100);return f'{centis//360000}:{centis//6000%60:02}:{centis//100%60:02}.{centis%100:02}'
    ass=['[Script Info]','ScriptType: v4.00+','PlayResX: 1920','PlayResY: 1080','WrapStyle: 2','ScaledBorderAndShadow: yes','','[V4+ Styles]',
      'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
      'Style: Default,Microsoft YaHei,35,&H00FFFFFF,&H00FFFFFF,&H004D2B17,&H004D2B17,0,0,0,0,100,100,0,0,3,10,0,2,110,110,27,1','','[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
    for caption in timeline['captions']:
        text=caption['text'].replace('\\',r'\\').replace('\n',r'\N').replace('{','（').replace('}','）')
        ass.append(f"Dialogue: 0,{stamp(caption['start'])},{stamp(caption['end'])},Default,,0,0,0,,{text}")
    (args.work/'captions.ass').write_text('\n'.join(ass)+'\n',encoding='utf-8-sig')
    # Fonts are used locally for rasterizing captions, not redistributed in the repository.
    fontdir=args.work/'caption-fonts';fontdir.mkdir(exist_ok=True)
    local_font=Path(os.environ.get('WINDIR','C:/Windows'))/'Fonts/msyh.ttc'
    if local_font.exists():shutil.copy2(local_font,fontdir/'msyh.ttc')
    args.output=args.output.resolve();args.output.parent.mkdir(parents=True,exist_ok=True)
    command=[ffmpeg,'-hide_banner','-y','-f','concat','-safe','0','-i','frames.ffconcat','-f','s16le','-ar',str(rate),'-ac','1','-i','narration.pcm',
       '-vf','fps=24,ass=captions.ass:fontsdir=caption-fonts,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','20','-threads','8',
       '-c:a','aac','-b:a','128k','-t','1440','-movflags','+faststart',str(args.output)]
    subprocess.run(command,cwd=args.work,check=True)
