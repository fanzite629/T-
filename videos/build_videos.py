"""Build editable, deterministic HyperFrames lessons from approved scripts and real speech."""
from pathlib import Path
import csv, html, json, math, re, shutil
import pypdfium2 as pdfium
from lesson_panels import P

ROOT=Path(__file__).resolve().parent
SOURCE=ROOT.parent/'docs/mcu-video-scripts'
esc=lambda s:html.escape(str(s),quote=True)
BG='#F7F9FC'; INK='#172B4D'; BLUE='#1D4ED8'; GREEN='#13735B'; ORANGE='#B45309'; PALE='#E8EFFB'

def svg(content):
    return f'<svg viewBox="0 0 1680 620" width="100%" height="100%" role="img" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="{BLUE}"/></marker></defs>{content}</svg>'
def txt(x,y,text,size=32,fill=INK,anchor='middle',weight=500):
    return f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" fill="{fill}" font-weight="{weight}">{esc(text)}</text>'
def rect(x,y,w,h,label='',fill=PALE,stroke=BLUE,size=34):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="{fill}" stroke="{stroke}" stroke-width="3"/>'+ (txt(x+w/2,y+h/2+size*.35,label,size) if label else '')
def arrow(x1,y1,x2,y2,label='',color=BLUE):
    length=math.hypot(x2-x1,y2-y1);ux=(x2-x1)/length;uy=(y2-y1)/length
    bx=x2-18*ux;by=y2-18*uy
    head=f'<polygon points="{x2},{y2} {bx-9*uy},{by+9*ux} {bx+9*uy},{by-9*ux}" fill="{color}"/>'
    return f'<path d="M{x1},{y1} L{x2},{y2}" fill="none" stroke="{color}" stroke-width="5"/>'+head+ (txt((x1+x2)/2,(y1+y2)/2-17,label,29,color) if label else '')

def diagram(kind,p):
    out=''
    if kind=='blocks':
        out+=rect(60,260,250,120,'输入设备')+rect(715,90,250,120,'控制器')+rect(715,260,250,120,'运算器')+rect(715,440,250,120,'存储器')+rect(1350,260,250,120,'输出设备')
        out+=arrow(310,320,715,320,'输入信息')+arrow(965,320,1350,320,'输出结果')+arrow(840,210,840,260)+arrow(840,380,840,440)
        out+=txt(420,500,'程序和数据都需要存储',32,GREEN)
    elif kind=='mcu':
        out+=rect(200,40,1280,530,'',BG,BLUE)+txt(840,100,'单片机芯片边界',34,BLUE)
        for x,y,w,h,label in [(280,160,280,130,'CPU'),(700,160,300,130,'ROM / Flash'),(1110,160,280,130,'RAM'),(280,390,260,100,'时钟 / 定时器'),(680,390,300,100,'并口 / 串口'),(1110,390,280,100,'中断')]:out+=rect(x,y,w,h,label,size=30)
        out+=arrow(560,225,700,225)+arrow(1000,225,1110,225)+arrow(830,290,830,390)+txt(840,600,'芯片还需要电源、时钟和合适的外围电路',30,GREEN)
    elif kind=='bus':
        stage=p.get('stage',0)
        out+=rect(70,170,290,280,'CPU',size=56)+rect(1270,170,340,280,'存储器',size=52)
        for y,label in [(190,'AB 地址：找谁'),(320,'DB 数据：传什么'),(450,'CB 控制：怎样传')]:
            out+=arrow(1240,y,390,y,label) if y==320 and stage==2 else arrow(390,y,1240,y,label)
        if stage>=1:out+=txt(820,110,'地址 30H · 控制信号 READ',38,BLUE)+txt(1440,510,'[30H] = 5AH',36,GREEN)
        if stage==2:out+=rect(650,263,370,105,'5AH → CPU',fill='#DFF1E8',stroke=GREEN,size=40)
    elif kind=='pinout':
        left=['P1.0','P1.1','P1.2','P1.3','P1.4','P1.5','P1.6','P1.7','RST','P3.0 / RXD','P3.1 / TXD','P3.2 / INT0','P3.3 / INT1','P3.4 / T0','P3.5 / T1','P3.6 / WR','P3.7 / RD','XTAL2','XTAL1','GND']
        right=['VCC','P0.0 / AD0','P0.1 / AD1','P0.2 / AD2','P0.3 / AD3','P0.4 / AD4','P0.5 / AD5','P0.6 / AD6','P0.7 / AD7','EA / VPP','ALE / PROG','PSEN','P2.7 / A15','P2.6 / A14','P2.5 / A13','P2.4 / A12','P2.3 / A11','P2.2 / A10','P2.1 / A9','P2.0 / A8']
        out+=rect(640,5,400,590,'',fill=PALE)+txt(840,295,'8051',52,BLUE)+txt(840,347,'DIP40 俯视',30)
        out+='<path d="M805,5 Q840,62 875,5" fill="none" stroke="#1D4ED8" stroke-width="4"/>'
        for i,(l,r) in enumerate(zip(left,right)):
            y=28+i*29
            out+=txt(584,y,l,27,anchor='end')+txt(680,y,i+1,25)+txt(1000,y,40-i,25)+txt(1096,y,r,27,anchor='start')
            out+=f'<path d="M610,{y-9} H640 M1040,{y-9} H1070" stroke="{BLUE}" stroke-width="3"/>'
        out+=txt(250,604,'INT0 / INT1 / WR / RD / EA / PSEN：低有效标记见分功能表',20,anchor='start')
    elif kind=='port':
        out+=txt(600,80,'VCC',42)+f'<path d="M600,110 V150 L580,165 L620,185 L580,205 L620,225 L600,240 V310 H1120 M600,310 V390 L660,450 M600,480 V530 H540 M555,545 H645 M570,560 H630" fill="none" stroke="{BLUE}" stroke-width="5"/>'
        out+=txt(820,210,'外接上拉电阻',36)+txt(1250,325,'P0引脚',44)+txt(890,445,'内部下拉开关',36)
        out+=txt(280,380,'写0：导通→拉低',34,GREEN)+txt(280,445,'写1：释放输出',34,ORANGE)+txt(840,610,'普通I/O模式：写1本身不提供推挽高电平',32,ORANGE)
    elif kind=='ea':
        external=p.get('external',False)
        out+=txt(230,100,'8051程序空间',42)+txt(1320,100,'EA = '+('0' if external else '1'),50,BLUE)
        out+=rect(80,200,1520,180,'',fill=PALE)
        if external:out+=txt(840,300,'0000H～FFFFH：全部片外',50,BLUE)
        else:
            out+=rect(80,200,440,180,'片内4KB',fill='#DFF1E8',stroke=GREEN,size=48)+txt(1050,300,'剩余片外60KB',48,BLUE)+txt(80,440,'0000H',32,anchor='start')+txt(520,440,'0FFFH / 1000H',32)+txt(1600,440,'FFFFH',32,anchor='end')
        out+=txt(840,555,'这是程序映射，不是数据RAM的选择',36,ORANGE)
    elif kind=='mux':
        st=p.get('stage',0)
        out+=rect(40,140,300,350,'CPU',size=60)+rect(650,310,300,150,'373锁存器',size=32)+rect(1300,130,330,370,'外部程序存储',size=32)
        out+=arrow(340,180,1300,180,'P2 = 12H（高地址）')+arrow(340,350,650,350,'P0 = '+('74H' if st==2 else '34H'))+arrow(950,350,1300,350,'低地址34H')
        if st>=1:out+=txt(800,510,'锁存器继续保持34H',30,GREEN)
        if st==2:out+=arrow(1290,580,355,580,'/PSEN有效：代码74H返回CPU')
        else:out+=txt(840,590,'ALE配合锁存器保留低八位地址',34,BLUE)
    elif kind=='stack':
        st=p.get('stage',0); vals=['—','12H','34H' if st>0 else '—','—']
        for i,(addr,val) in enumerate(zip(['07H','08H','09H','0AH'],vals)):
            out+=rect(650,60+i*120,400,105,addr+'     '+val,size=43)
        out+=txt(300,180,'复位SP = 07H',38)+txt(300,270,'PUSH：先加再存',34,BLUE)+txt(300,360,'POP：先取再减',34,GREEN)
        target=1 if st in [0,2] else 2
        out+=arrow(1390,112+target*120,1080,112+target*120,'SP')+txt(1320,520,'后进先出',42,ORANGE)
        if st==2:out+=txt(840,600,'先弹34H，再弹12H',35,GREEN)
    elif kind=='psw':
        labels=['CY','AC','F0','RS1','RS0','OV','—','P']
        for i,label in enumerate(labels):
            x=45+i*200;out+=txt(x+90,160,7-i,36)+rect(x,210,180,150,label,size=48)
        out+=txt(840,460,'高位 ← 程序状态字 PSW → 低位',36,BLUE)+txt(840,555,'F0可由软件使用；RS1/RS0选择寄存器组',35,GREEN)
    elif kind=='clock':
        for i in range(12):
            x=40+i*134;out+=rect(x,215,125,130,'P'+str(i%2+1),size=36)
            if i%2==0:out+=txt(x+129,155,'S'+str(i//2+1),40,BLUE)
        out+=txt(840,450,'1机器周期 = 6个状态 × 2个节拍 = 12个时钟周期',38)+txt(840,555,'12MHz → 1μs；6MHz → 2μs',42,GREEN)
    elif kind=='memory':
        for x,title,body in [(30,'CODE 程序空间',['0000H～FFFFH','指令 / 查表常量','取指、MOVC']),(590,'内部RAM / SFR',['RAM：运行数据','SFR：硬件控制','MOV等内部访问']),(1150,'XDATA 外部数据',['0000H～FFFFH','扩展数据 / 外设','MOVX'])]:
            out+=rect(x,70,500,460,'',fill=PALE)+txt(x+250,140,title,36,BLUE)
            for j,line in enumerate(body):out+=txt(x+250,245+j*90,line,33)
        out+=txt(840,600,'各空间独立编址，同一个地址数字不等于同一个单元',34,ORANGE)
    elif kind=='ram':
        for y,h,a,b,count in [(40,130,'00H～1FH','4组R0～R7','32B'),(195,130,'20H～2FH','位寻址区','16B = 128bit'),(350,210,'30H～7FH','一般数据区','80B')]:
            out+=rect(410,y,1050,h,'',fill=PALE)+txt(240,y+h/2+12,a,37)+txt(760,y+h/2+12,b,43)+txt(1240,y+h/2+12,count,38,GREEN)
        out+=txt(840,610,'32 + 16 + 80 = 128 Byte',34,BLUE)
    elif kind=='upperram':
        out+=rect(100,100,650,390,'',fill=PALE)+rect(930,100,650,390,'',fill='#DFF1E8',stroke=GREEN)
        out+=txt(425,190,'SFR：80H～FFH',44,BLUE)+txt(425,295,'直接寻址',50)+txt(425,395,'90H → P1',42)
        out+=txt(1255,190,'高RAM：80H～FFH',43,GREEN)+txt(1255,295,'间接寻址',50)+txt(1255,395,'@R0，R0 = 90H',38)
        out+=txt(840,580,'仅适用于有高128字节RAM的型号，如AT89S52',35,ORANGE)
    else:raise ValueError(kind)
    return svg(out)

STYLE='''
@font-face{font-family:Lesson;src:url("assets/fonts/lesson.woff2") format("woff2");font-weight:100 900;font-style:normal}
*{box-sizing:border-box}html,body{margin:0;width:1920px;height:1080px;background:#F7F9FC;overflow:hidden}
#root{width:100%;height:100%;font-family:Lesson,sans-serif;color:#172B4D}
.lesson-head{position:absolute;left:80px;right:80px;top:46px;display:flex;align-items:center;justify-content:space-between;gap:32px}
.course{font-size:28px;font-weight:600;color:#13735B;letter-spacing:3px}.topic{font-size:42px;font-weight:700;line-height:1.3;max-width:1250px;margin-top:12px}
.source{font-size:28px;color:#405578;text-align:right;flex-shrink:0}.head-rule{position:absolute;left:80px;right:80px;top:161px;height:3px;background:#D7E1F1}
.panel{position:absolute;inset:185px 85px 122px}.panel-inner{width:100%;height:100%;display:flex;flex-direction:column;gap:24px}
.panel-title{font-size:43px;line-height:1.3;font-weight:650;margin:0;color:#1D4ED8;flex-shrink:0;min-height:60px}
.content{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:24px}
.step{font-size:38px;line-height:1.6;padding:15px 30px;border-bottom:2px solid #D7E1F1}.step-num{color:#13735B;font-size:28px;margin-right:24px;font-weight:700}
.formula{font-size:43px;line-height:1.55;padding:18px 28px;background:#E8EFFB;border-radius:16px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.formula:last-child{color:#13735B;background:#E3F0EA}.formula.long{font-size:34px}
table{width:100%;border-collapse:separate;border-spacing:0;font-size:34px;line-height:1.4;table-layout:fixed}th{background:#172B4D;color:#F7F9FC;padding:18px;text-align:left;font-weight:600}td{padding:18px;border-bottom:2px solid #D7E1F1;background:#E8EFFB;overflow-wrap:anywhere}tr:nth-child(even) td{background:#F1F5FB}.dense{font-size:28px}.dense td,.dense th{padding:14px 18px}.tiny-table{font-size:26px}
.flow{display:flex;justify-content:center;align-items:center;gap:20px}.node{min-height:160px;display:flex;align-items:center;justify-content:center;flex:1;padding:25px 16px;border:3px solid #1D4ED8;border-radius:18px;background:#E8EFFB;text-align:center;font-size:35px;font-weight:600;line-height:1.5;max-width:380px}.link{font-size:46px;color:#1D4ED8;flex-shrink:0}
.diagram{height:620px;max-height:100%;width:100%;display:flex;align-items:center;justify-content:center}.diagram svg{font-family:Lesson,sans-serif}
.pdf{display:block;max-width:100%;max-height:100%;object-fit:contain;margin:auto;border:1px solid #D7E1F1}.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;height:100%;min-height:0;padding-bottom:64px}.gallery figure{margin:0;min-height:0;display:flex;flex-direction:column;align-items:center;gap:8px}.gallery img{width:100%;min-height:0;flex:1;object-fit:contain}.gallery figcaption{font-size:28px;color:#405578;flex-shrink:0}
.bit-row{display:flex;align-items:center;justify-content:center;gap:14px}.bit-label{font-size:35px;min-width:140px}.bit{width:118px;height:105px;display:flex;justify-content:center;align-items:center;border:2px solid #1D4ED8;background:#E8EFFB;border-radius:12px;font-size:42px;font-variant-numeric:tabular-nums}.bit:first-of-type{color:#B45309}
.panel-no{position:absolute;bottom:89px;left:85px;font-size:20px;color:#405578}.track{position:absolute;left:85px;right:85px;bottom:99px;height:4px;background:#D7E1F1}.track-fill{height:100%;width:100%;background:#1D4ED8;transform-origin:left center}
.caption{position:absolute;bottom:25px;left:110px;right:110px;display:flex;justify-content:center;z-index:30}.caption span{font-size:35px;line-height:1.4;background:#172B4D;color:#F7F9FC;border-radius:10px;padding:10px 26px;max-width:1640px;text-align:center;white-space:pre-wrap}.pause-note{position:absolute;right:85px;bottom:112px;font-size:28px;color:#13735B}
'''

def render_panel(p):
    kind=p['kind']
    if kind=='steps':return ''.join(f'<div class="step reveal"><span class="step-num">{i:02d}</span>{esc(t)}</div>' for i,t in enumerate(p['rows'],1))
    if kind=='formula':return ''.join(f'<div class="formula reveal {"long" if len(t)>43 else ""}">{esc(t)}</div>' for t in p['rows'])
    if kind=='flow':return '<div class="flow">'+''.join(('<div class="link">→</div>' if i else '')+f'<div class="node reveal">{esc(t)}</div>' for i,t in enumerate(p['nodes']))+'</div>'
    if kind=='table':
        length=max(len(str(x)) for row in p['rows'] for x in row)
        cls='dense' if len(p['rows'])>4 or length>22 or len(p['headers'])>5 else ''
        return f'<table class="{cls}"><thead><tr>'+''.join(f'<th>{esc(h)}</th>' for h in p['headers'])+'</tr></thead><tbody>'+''.join('<tr class="reveal">'+''.join(f'<td>{esc(x)}</td>' for x in row)+'</tr>' for row in p['rows'])+'</tbody></table>'
    if kind=='source':return f'<img class="pdf" src="assets/source/page-{p["page"]:03d}.jpg" alt="原课件第{p["page"]}页"/>'
    if kind=='gallery':return '<div class="gallery">'+''.join(f'<figure><img src="assets/source/page-{page:03d}.jpg" alt="课件第{page}页"/><figcaption>课件第{page}页 · 历史资料示例</figcaption></figure>' for page in p['pages'])+'</div>'
    if kind=='bits':return ''.join('<div class="bit-row"><div class="bit-label">'+esc(label)+'</div>'+''.join('<div class="bit reveal">'+esc(x)+'</div>' for x in row.split())+'</div>' for label,row in p['rows'])
    return '<div class="diagram">'+diagram(kind,p)+'</div>'

def caption_groups(meta):
    text=meta['text'].replace('\n',' ');cursor=0;groups=[];current='';begin=None;end=0
    for w in meta['words']:
        pos=text.find(w['text'],cursor)
        if pos<0:piece=w['text']
        else:piece=text[cursor:pos+len(w['text'])];cursor=pos+len(w['text'])
        piece=piece.strip() if not current else piece
        if current and (len(current+piece)>28 or (piece[:1] in '。！？；' and len(current)>8)):
            groups.append({'start':begin,'end':end+.12,'text':current.strip()});current='';begin=None
        if begin is None:begin=w['start']
        current+=piece;end=w['start']+w['duration']
    if current:groups.append({'start':begin,'end':min(meta['duration'],end+.2),'text':(current+text[cursor:]).strip()})
    for i,g in enumerate(groups[:-1]):g['end']=min(g['end'],groups[i+1]['start'])
    for g in groups:g['text']=g['text'].lstrip('，。；：！？、 ').replace(' C P U',' CPU').replace(' S F R',' SFR')
    return groups

def stamp(t):
    ms=round(t*1000);s,ms=divmod(ms,1000);m,s=divmod(s,60);h,m=divmod(m,60)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'

def write_brief(project,n):
    (project/'BRIEF.md').write_text(f'''---
workflow: general-video
flow: automation
storyboard: no
language: zh-CN
aspect: landscape
---

# 第一、二章单片机课程实际视频制作：第{n}章

用户已要求Codex直接制作视频；沿用已确认的逐字稿、全PDF知识覆盖和每部25分钟以内的要求。本工程制作一部1920×1080、24fps、中文配音、中文字幕的完整教学视频。用户已授权成片制作和渲染，执行到交付。

受众是课程初学者。叙事沿 approved script.json 的28段推进；实际配音已生成，时间以音频测量为准。每章镜头预算24分钟，完整MP4不得超过1500秒。

## 设计决定

沿用仓库暖白工程课堂规范。用清晰表格、演算、结构关系、引脚和地址图分步解释；原课件图片仅在需要实物/历史/电路来源时使用。字幕覆盖在画面上，不遮挡关键数值。没有背景音乐，避免干扰计算与技术听辨。

## 运动与停留

采用dynamic-content-sequencing和discrete-text-sequence：由真实音频时间驱动分屏和字幕，表格条目依次出现；数值和电路稳定可读。课堂阅读停留有明确教学目的，不使用装饰性循环运动。首末段已包含开场和收束。

## 来源

正文来自../../docs/mcu-video-scripts/ch{n:02d}/script.json；技术边界和原始页码保留。人工重绘图示是教学可视化，不冒充原PDF截图。
''',encoding='utf-8')
    design=(SOURCE/'design-spec.md').read_text(encoding='utf-8')
    design+='\n本成片嵌入可再分发的Noto Sans SC（SIL OFL许可）；技术数字使用固定宽度数位格。新增浅色表底#E8EFFB/#F1F5FB、分隔线#D7E1F1、次要文字#405578和完成态#E3F0EA/#DFF1E8。主要文字不低于28px；全引脚定位图标签27px，后续专用引脚表放大解释。\n'
    (project/'frame.md').write_text(design,encoding='utf-8')

def source_assets(project,n,data):
    folder=project/'assets/source';folder.mkdir(parents=True,exist_ok=True)
    pages=set()
    for scenes in P[n]:
        for p in scenes:
            if p['kind']=='source':pages.add(p['page'])
            if p['kind']=='gallery':pages.update(p['pages'])
    pdf=pdfium.PdfDocument(SOURCE.parent/data['source_pdf'])
    for number in sorted(pages):
        target=folder/f'page-{number:03d}.jpg'
        if target.exists():continue
        page=pdf[number-1];w,h=page.get_size();image=page.render(scale=min(2400/w,1800/h)).to_pil().convert('RGB');image.save(target,quality=94)
        page.close()
    pdf.close()

def prepare_font():
    from fontTools import subset
    fontdir=ROOT/'mcu-ch01/assets/fonts'
    content=json.dumps(P,ensure_ascii=False)+(SOURCE/'ch01/script.json').read_text(encoding='utf-8')+(SOURCE/'ch02/script.json').read_text(encoding='utf-8')+Path(__file__).read_text(encoding='utf-8')
    content+='原课件第页历史资料示例单片机课程讲解暂停思考核对课堂位编址程序存储器数据直接间接机器周期时钟高低输入输出背景 '+''.join(chr(i) for i in range(32,127))+'¹²³⁴⁵⁶⁷⁸⁹⁰×÷−＋＝→←↔～·μ≈①②③④⑤⑥⑦⑧'
    options=subset.Options();options.flavor='woff2';options.layout_features=['*'];options.name_IDs=['*']
    font=subset.load_font(str(fontdir/'NotoSansSC.ttf'),options);sub=subset.Subsetter(options);sub.populate(text=content);sub.subset(font);subset.save_font(font,str(fontdir/'lesson.woff2'),options)
    for name in ['lesson.woff2','OFL.txt']:
        dst=ROOT/'mcu-ch02/assets/fonts'/name;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(fontdir/name,dst)
    dst=ROOT/'mcu-ch02/assets/vendor/gsap.min.js';dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/'mcu-ch01/assets/vendor/gsap.min.js',dst)

def build(n):
    project=ROOT/f'mcu-ch{n:02d}';comps=project/'compositions';comps.mkdir(exist_ok=True)
    data=json.loads((SOURCE/f'ch{n:02d}/script.json').read_text(encoding='utf-8'))
    audio=json.loads((project/'audio-meta.json').read_text(encoding='utf-8'))['scenes']
    budgets=list(csv.DictReader((SOURCE/f'ch{n:02d}/timeline.csv').open(encoding='utf-8-sig')))
    write_brief(project,n);source_assets(project,n,data)
    hosts=[];all_captions=[];scenes=[];story=['# 视频分镜执行表\n\n依据逐字稿，使用已生成配音测量时长。分屏图示与字幕随口播推进。\n']
    global_time=0
    for i,(s,a,budget,panels) in enumerate(zip(data['scenes'],audio,budgets,P[n]),1):
        sid=s['id'];duration=max(float(budget['计划结束秒'])-float(budget['计划开始秒']),math.ceil(a['duration']+s['hold_seconds']+1))
        vo_start=.5;groups=caption_groups(a)
        # Keep the final recap readable after the voice ends. Earlier states track the spoken explanation.
        weights=[1]*len(panels)
        if panels[0]['kind']=='source':weights[0]=.7
        panel_time=0;panel_html=[];animations=[];panel_records=[]
        content_end=a['duration']+.5
        intervals=[]
        for j,p in enumerate(panels):
            start=panel_time
            panel_time+=content_end*weights[j]/sum(weights)
            end=duration if j==len(panels)-1 else panel_time
            pid=f'{sid}-panel-{j}'
            panel_html.append(f'<section id="{pid}" class="clip panel" data-start="{start:.3f}" data-duration="{end-start:.3f}" data-track-index="1"><div class="panel-inner"><h2 class="panel-title">{esc(p["title"])}</h2><div class="content">{render_panel(p)}</div></div></section>')
            animations.append(f'tl.fromTo("#{pid} .panel-inner",{{opacity:0}},{{opacity:1,duration:0.22,ease:"power1.out",immediateRender:false}},{start:.3f});')
            if p['kind'] in ('steps','formula','flow','table','bits'):
                animations.append(f'tl.fromTo("#{pid} .reveal",{{opacity:0,y:10}},{{opacity:1,y:0,duration:0.28,stagger:0.09,ease:"power2.out",immediateRender:false}},{start+.2:.3f});')
            panel_records.append({'index':j,'title':p['title'],'kind':p['kind'],'start':round(global_time+start,3),'end':round(global_time+end,3)})
        captions=[]
        for j,g in enumerate(groups):
            start=vo_start+g['start'];end=min(duration,vo_start+g['end'])
            captions.append(f'<div id="{sid}-caption-{j}" class="clip caption" data-start="{start:.3f}" data-duration="{max(.05,end-start):.3f}" data-track-index="3"><span>{esc(g["text"])}</span></div>')
            all_captions.append(dict(start=global_time+start,end=global_time+end,text=g['text']))
        title=s['title'].split('：')[0]
        page_label=', '.join(map(str,s['source_pages']))
        comp=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"></head><body><template>
<style>{STYLE}</style>
<div id="root" data-composition-id="{sid}" data-width="1920" data-height="1080" data-duration="{duration}">
<header class="lesson-head"><div><div class="course">单片机课程 · 第{n}章</div><div class="topic">{i:02d} / {title}</div></div><div class="source"><div>原PDF第 {page_label} 页</div><div>第 {i} / 28 段</div></div></header><div class="head-rule"></div>
{''.join(panel_html)}
<div class="track"><div id="{sid}-progress" class="track-fill"></div></div><div class="pause-note">需要练习时可暂停核对</div>
{''.join(captions)}
<audio id="{sid}-voice" src="assets/audio/{sid}.mp3" data-start="{vo_start}" data-duration="{a['duration']}" data-track-index="4" data-volume="1"></audio>
</div><script>
(()=>{{const tl=gsap.timeline({{paused:true}});{''.join(animations)}tl.fromTo("#{sid}-progress",{{scaleX:0}},{{scaleX:1,duration:{duration},ease:"none"}},0);window.__timelines["{sid}"]=tl;}})();
</script></template></body></html>'''
        (comps/f'{sid}.html').write_text(comp,encoding='utf-8')
        hosts.append(f'<div id="{sid}" class="clip" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{global_time}" data-duration="{duration}" data-track-index="1" data-width="1920" data-height="1080"></div>')
        scenes.append({'id':sid,'title':s['title'],'source_pages':s['source_pages'],'start':global_time,'end':global_time+duration,'voice_duration':a['duration'],'panels':panel_records})
        story.append(f'\n## Frame {i}\n\nstatus: animated\nsrc: compositions/{sid}.html\nshape: dynamic-content-sequencing + discrete-text-sequence\n\n{global_time:.2f}–{global_time+duration:.2f}s；来源页{s["source_pages"]}。\n\n'+ '\n'.join('- '+p['title'] for p in panels)+'\n')
        global_time+=duration
    assert global_time<=1500, f'Chapter {n} too long: {global_time}'
    root_html=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"><script src="assets/vendor/gsap.min.js"></script><style>{STYLE}.clip[data-composition-src]{{position:absolute;inset:0;width:100%;height:100%}}</style></head><body><div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-fps="24" data-duration="{global_time}">{''.join(hosts)}</div><script>window.__timelines["main"]=gsap.timeline({{paused:true}});</script></body></html>'''
    (project/'index.html').write_text(root_html,encoding='utf-8')
    (project/'STORYBOARD.md').write_text(''.join(story),encoding='utf-8')
    (project/'timeline.json').write_text(json.dumps({'chapter':n,'width':1920,'height':1080,'fps':24,'duration':global_time,'voice_seconds':sum(x['duration'] for x in audio),'scenes':scenes,'captions':all_captions},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (project/'subtitles.srt').write_text('\n\n'.join(f'{i}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(all_captions,1))+'\n',encoding='utf-8-sig')
    print(f'Chapter {n}: {global_time}s; {len(scenes)} scenes; {sum(len(x["panels"]) for x in scenes)} visual states; {len(all_captions)} captions')

if __name__=='__main__':
    prepare_font()
    for n in (1,2):build(n)
