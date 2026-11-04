"""Regenerate review documents from script.json. No third-party packages required."""
from pathlib import Path
import csv
import hashlib
import json
import math
import re

ROOT=Path(__file__).resolve().parent
RATE=210
SLOW_RATE=190
MAX_VIDEO_SECONDS=1500
TOPICS={
1: ['课程封面','课程名称、学时与授课安排','课程重要性','单片机/DSP/ARM应用示意','成绩构成','8031芯片实物','工程岗位与能力','招聘截图1','招聘截图2','招聘截图3','招聘截图4','第一章八节目录','电子计算机历史起点','计算机器件演进','五大部件与存储程序','微处理器与微型计算机','AB/DB/CB三总线','PC与工业PC系统','4004与处理器演进','功能部件与实物对应','单片机定义与MCU','通用计算机与嵌入式用途','通用型单片机','专用型单片机','单片机四阶段发展概述','经典厂家与型号','MCS-51及兼容系列','基本/增强/低功耗型','专用/超8位/Flash型','应用及温度等级示例','应用领域','单片机系统与PC实物','鼠标中的控制器','光驱中的控制器','U盘中的控制器','学习一种结构的方法','单片机组成框图','测控系统输入输出链路','数制补充目录','数制/转换/无符号运算目录','十进制与位权','二进制整数和小数','十六进制与位权','基数/进位/位权总结','111.101B按权展开','215D除二取余','0.6875D乘二取整','小数近似与9AB.7C5H转换','二进制转十六进制与加法','二进制减法和乘法','二进制除法','进制转换课后题','符号位及原码初步','原码/反码/补码定义','-4和-7的编码','正负零及10000000B解释','8位各编码范围','±13/±0/±1/±10编码练习','全章复习要点','存储器分类树','地址/单元/单元位数与旅店类比','bit/Byte/Word/容量/地址范围','2764引脚与容量计算'],
2: ['第二章六节目录','51/52基本型与增强型','8031/8051/AT89S52参数比较','内部详细结构图','内部简化结构图','8031芯片实物','DIP40引脚排列','40引脚功能分组','P0/P1/P2及上拉、总线复用','P3八种第二功能','扩展系统中端口分工','复位原理与三类复位电路','复位后的寄存器状态','EA/VPP与ALE/PROG','PSEN/RD/WR/晶振/电源','P0复用及373锁存器','SFR表上半','SFR表下半及位寻址星号','ACC/B/PSW/SP/DPTR','PSW各位与标志意义','RS1/RS0及四组寄存器','时序目录','时钟周期与12时钟机器周期','S1—S6及P1/P2节拍','取指/执行与ALE时序','指令长度、周期与12MHz例','RAM/ROM技术分类','独立编址与多存储空间图','空白页（已核对）','MOV与MOVX访问区分','程序存储器、复位和中断入口','低128字节RAM分区','SFR/位区与位地址','全章复习要点']}

def stamp(sec):
    return f'{sec//3600:02d}:{sec//60%60:02d}:{sec%60:02d}' if sec>=3600 else f'{sec//60:02d}:{sec%60:02d}'

def count(text):
    return len(re.findall(r'[\u3400-\u9fffA-Za-z0-9]',text))

def write_csv(path,header,rows):
    with path.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.writer(f);w.writerow(header);w.writerows(rows)

def build():
    stats=[]
    for folder in sorted(ROOT.glob('ch[0-9][0-9]')):
        data=json.loads((folder/'script.json').read_text(encoding='utf-8'))
        n=data['chapter']; scenes=data['scenes']; total=data['source_page_count']
        assert len(TOPICS[n])==total
        seen=set(); time=0; chars=0
        planned=data['planned_video_seconds']; cap=data['max_video_seconds']
        assert 0 < planned <= cap <= MAX_VIDEO_SECONDS, 'Each video must fit within 25 minutes'
        for i,scene in enumerate(scenes,1):
            assert scene['id']==f'CH{n:02d}-S{i:02d}'
            assert scene['narration'].strip() and len(scene['visual_steps'])>=3
            assert all(1<=p<=total for p in scene['source_pages'])
            seen.update(scene['source_pages'])
            units=count(scene['narration']);chars+=units
            assert isinstance(scene['hold_seconds'],int) and scene['hold_seconds']>=0
            scene['_chars']=units
            scene['_estimate']=math.ceil(units/RATE*60)+scene['hold_seconds']
            scene['_slow_estimate']=math.ceil(units/SLOW_RATE*60)+scene['hold_seconds']
        assert seen==set(range(1,total+1)),f'Uncovered source pages: {set(range(1,total+1))-seen}'
        estimated=sum(sc['_estimate'] for sc in scenes)
        slow_estimated=sum(sc['_slow_estimate'] for sc in scenes)
        remaining=planned-slow_estimated
        assert remaining>=0, f'Chapter {n} exceeds its production budget by {-remaining}s; shorten narration, do not speed up'
        # Reserve more reading time for dense tables and worked examples.
        weights=[sc.get('reading_weight',1) for sc in scenes]
        assert all(isinstance(w,int) and w>0 for w in weights)
        shares=[remaining*w//sum(weights) for w in weights]
        remainder=remaining-sum(shares)
        order=sorted(range(len(scenes)), key=lambda i: remaining*weights[i]%sum(weights), reverse=True)
        for i in order[:remainder]:shares[i]+=1
        for sc,extra in zip(scenes,shares):
            seconds=sc['_slow_estimate']+extra
            sc['_start']=time;sc['_end']=time+seconds;sc['_reading_reserve']=extra
            time+=seconds
        assert time==planned
        pdf=ROOT.parent/data['source_pdf']; sha=hashlib.sha256(pdf.read_bytes()).hexdigest()
        header=f"# 第{n}章｜{data['title']}\n\n"
        header+=f"原始资料：[{data['source_pdf']}](../../{data['source_pdf'].replace(' ','%20')})，{total}页。页码均为PDF物理页码，从1起算。\n\n"
        header+=f"**{data['edition']}。** 本章{len(scenes)}段，口播计数字符{chars:,}；制作时间表预算 **{stamp(planned)}**，最终完整视频上限 **{stamp(cap)}**（包含片头、片尾、转场与停顿）。\n\n"
        header+=f"按每分钟{RATE}个计数字符加指定停顿，口播排稿估时为{stamp(estimated)}；按较慢的{SLOW_RATE}个计数字符估算为{stamp(slow_estimated)}。时间表另分配{remaining}秒供图表阅读、演算和自然停连，距上限还留{cap-planned}秒调整余量。估算不等于音频实测；实际配音后必须核对总时长，超预算先精简措辞，保留推导步骤。\n\n"
        header+='**使用方式：**“逐字口播”是可朗读正文；画面、屏幕文字、理解检查和制作备注不读入配音。连续纯口播见[narration.txt](narration.txt)。完整页码对应见[coverage.csv](coverage.csv)，引脚/公式等速查见[reference-tables.md](reference-tables.md)。\n\n'
        header+='教学补充算例均在分镜或备注中标识；原课件的过时表述、型号混用和笔误处理见[技术校核说明](../technical-notes.md)。画面规格见[统一设计规范](../design-spec.md)。\n\n'
        header+='## 导航与制作时间预算\n\n以下是24分钟版的镜头预算，不是已录制音频的时间戳。图表随口播同步展开；理解检查用本段停留预算，不逐题另加等待。\n\n|段落|主题|PDF页|预算区间|\n|---|---|---|---|\n'
        for sc in scenes:
            header+=f"|{sc['id']}|{sc['title']}|{', '.join(map(str,sc['source_pages']))}|{stamp(sc['_start'])}–{stamp(sc['_end'])}|\n"
        parts=[header]
        for sc in scenes:
            part=f"\n## {sc['id']}｜{sc['title']}\n\n"
            part+=f"**PDF页：** {', '.join(map(str,sc['source_pages']))}　 **制作预算：** {stamp(sc['_start'])}–{stamp(sc['_end'])}（{sc['_end']-sc['_start']}秒）。\n\n"
            part+=f"口播＋固定停留按{RATE}字/分钟估算{sc['_estimate']}秒，按{SLOW_RATE}字/分钟估算{sc['_slow_estimate']}秒；预算内固定停留{sc['hold_seconds']}秒，另有图表/停连余量{sc['_reading_reserve']}秒。{sc['timing_note']}\n\n"
            part+='### 逐字口播\n\n'+sc['narration'].replace('\n','\n\n')+'\n\n'
            part+='### 画面执行顺序\n\n'
            part+='\n'.join(f'{j}. {v}' for j,v in enumerate(sc['visual_steps'],1))+'\n\n'
            part+='### 屏幕核心文字\n\n```text\n'+sc['screen_text']+'\n```\n\n'
            part+='**理解检查（教师/制作使用）：** '+sc['understanding_check']+'\n'
            if sc['production_note']:part+='\n**制作备注：** '+sc['production_note']+'\n'
            parts.append(part)
        (folder/'manuscript.md').write_text(''.join(parts),encoding='utf-8')
        (folder/'narration.txt').write_text('\n\n'.join(sc['narration'].replace('\n','\n\n') for sc in scenes)+'\n',encoding='utf-8')
        coverage=[]
        for p in range(1,total+1):
            covered=[sc for sc in scenes if p in sc['source_pages']]
            typ='关键概念口播＋分步图示/复习'
            if n==1 and p in list(range(1,13))+[39,40]:typ='导学/背景合并讲解＋原页或图表展示'
            if n==1 and p in [32,33,34,35]:typ='应用图像讲解'
            if n==1 and p in [52,58]:typ='代表题口播推导＋全部答案分屏；可暂停自测'
            if n==2 and p in [7,8,13,17,18]:typ='分组口播解释＋完整引脚/寄存器表分屏'
            if n==2 and p==29:typ='原页空白；补充复习转场'
            coverage.append([p,TOPICS[n][p-1],typ,'; '.join(sc['id'] for sc in covered),'; '.join(f"{stamp(sc['_start'])}–{stamp(sc['_end'])}" for sc in covered),'已纳入脚本（非成片验收）'])
        write_csv(folder/'coverage.csv',['PDF物理页码','原页主题','处理方式','对应段落','制作预算时间段','覆盖状态'],coverage)
        write_csv(folder/'timeline.csv',['段落ID','主题','源PDF页码','计划开始秒','计划结束秒','口播计数字符','固定停留秒','常速估算秒','较慢语速估算秒','图表与停连余量秒','同步说明'],[[sc['id'],sc['title'],','.join(map(str,sc['source_pages'])),sc['_start'],sc['_end'],sc['_chars'],sc['hold_seconds'],sc['_estimate'],sc['_slow_estimate'],sc['_reading_reserve'],'时间为制作预算；图表随口播展开；按实际音频重对齐且总时长≤25分钟'] for sc in scenes])
        stats.append({'chapter':n,'pdf_pages':total,'scenes':len(scenes),'narration_characters':chars,'estimated_seconds':estimated,'estimated_duration':stamp(estimated),'slower_estimated_seconds':slow_estimated,'slower_estimated_duration':stamp(slow_estimated),'planned_video_seconds':planned,'planned_video_duration':stamp(planned),'max_video_seconds':cap,'reading_and_delivery_reserve_seconds':remaining,'final_adjustment_reserve_seconds':cap-planned,'measured_video_seconds':None,'source_sha256':sha,'covered_pages':len(seen)})
    (ROOT/'validation.json').write_text(json.dumps({'scope':'script and design, not rendered video','rate_assumption':RATE,'slower_rate_assumption':SLOW_RATE,'counting_method':'CJK ideographs, Latin letters and digits; punctuation excluded; not a measured speech rate','chapters':stats},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(stats,ensure_ascii=False,indent=2))

if __name__=='__main__':build()
