"""Generate Chinese narration and word-boundary metadata; resumable by content hash."""
from pathlib import Path
import asyncio, hashlib, json, os, shutil, subprocess, sys
import edge_tts

ROOT=Path(__file__).resolve().parent
SOURCE=ROOT.parent/'docs/mcu-video-scripts'
VOICE='zh-CN-XiaoxiaoNeural'
RATE='-15%'
FFPROBE=os.environ.get('FFPROBE') or shutil.which('ffprobe') or 'ffprobe'

def duration(path):
    return float(subprocess.check_output([str(FFPROBE),'-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(path)],text=True).strip())

async def generate(n,scene,sem):
    directory=ROOT/f'mcu-ch{n:02d}'/'assets/audio'
    directory.mkdir(parents=True,exist_ok=True)
    path=directory/f"{scene['id']}.mp3"
    meta=path.with_suffix('.json')
    spoken=scene['narration'].strip()
    sha=hashlib.sha256((VOICE+RATE+spoken).encode()).hexdigest()
    if path.exists() and meta.exists():
        cached=json.loads(meta.read_text(encoding='utf-8'))
        if cached.get('sha256')==sha:
            print('cached',scene['id'],cached['duration'],flush=True);return cached
    async with sem:
        for attempt in range(3):
            words=[]
            try:
                job=edge_tts.Communicate(spoken,VOICE,rate=RATE,boundary='WordBoundary',connect_timeout=15,receive_timeout=90)
                with path.with_suffix('.tmp').open('wb') as stream:
                    async for chunk in job.stream():
                        if chunk['type']=='audio':stream.write(chunk['data'])
                        elif chunk['type']=='WordBoundary':
                            words.append({'start':chunk['offset']/1e7,'duration':chunk['duration']/1e7,'text':chunk['text']})
                path.with_suffix('.tmp').replace(path)
                dur=duration(path)
                assert words and dur>5
                result={'id':scene['id'],'voice':VOICE,'rate':RATE,'sha256':sha,'text':spoken,'duration':dur,'words':words,'provider':'Microsoft Edge online TTS via edge-tts 7.3.1'}
                meta.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
                print('generated',scene['id'],round(dur,2),'seconds',len(words),'boundaries',flush=True)
                return result
            except Exception as error:
                print('retry',scene['id'],attempt+1,type(error).__name__,str(error)[:150],flush=True)
                if attempt==2:raise
                await asyncio.sleep(2+attempt*3)

async def main():
    sem=asyncio.Semaphore(3)
    for n in (1,2):
        script=json.loads((SOURCE/f'ch{n:02d}/script.json').read_text(encoding='utf-8'))
        result=await asyncio.gather(*(generate(n,s,sem) for s in script['scenes']))
        total=sum(x['duration'] for x in result)
        print('CHAPTER',n,'voice total',round(total,2),flush=True)
        (ROOT/f'mcu-ch{n:02d}/audio-meta.json').write_text(json.dumps({'voice':VOICE,'rate':RATE,'voice_seconds':total,'scenes':result},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':asyncio.run(main())
