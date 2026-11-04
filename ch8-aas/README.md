# 第 8 章 原子吸收光谱分析 · 讲解视频

根据《现代分析仪器及应用》第 8 章课件（81 页）制作的完整讲解视频。目标是：只看这个视频，就能学会课件中的全部知识点。重点讲方法背后的机理，而不只是罗列结论：为什么要用锐线光源、为什么测峰值而不测积分、为什么基态原子数约等于总原子数、为什么单色器放在原子化器之后、为什么标准加入法能抵消基体效应。

## 交付物

| 文件 | 内容 |
|---|---|
| `exports/aas-lesson.mp4` | 成片：1920×1080、25 fps，带中文配音和字幕，约 23 分 54 秒 |
| `index.html` | 交互版：可拖动时间轴、点击顶部章节标签跳转、0.75–1.5 倍速、字幕和注释开关、全屏 |
| `docs/transcript.md` | 带时间戳的完整讲稿，可当复习笔记 |
| `docs/subtitles.srt` | 字幕文件 |
| `docs/accuracy-notes.md` | 课件中的错误与不一致之处、视频补充内容的说明、配音说明 |

## 内容结构

| 时间 | 章节 | 课件页 |
|---|---|---|
| 00:00 | 导入与学习路线 | P1 |
| 00:30 | 光的本质、E = hν、电磁波谱、太赫兹 | P2–6 |
| 01:37 | 光学分析法分类 | P7 |
| 02:19 | 夫琅和费线、克希荷夫与本生、恒星光谱与红移、Walsh 与 L’vov、前沿与应用 | P8–14 |
| 03:47 | 8-2 测镁的完整过程 | P15 |
| 04:21 | 一、共振线（基态、激发态、特征谱线） | P16–18 |
| 05:15 | 二、谱线轮廓（朗伯定律、K₀、ν₀、Δν） | P19–21 |
| 06:00 | 三、五种变宽：自然、多普勒、压力（共振 / 劳伦兹）、自吸、场致 | P22–28 |
| 07:46 | 四、积分吸收的难题，锐线光源与峰值吸收，推导 A = kLN₀ | P29–34 |
| 09:21 | 玻耳兹曼分布，N₀ ≈ N，A = k′c | P35–37 |
| 10:17 | 课堂练习（一）：4 题 | P38–41 |
| 11:27 | 8-3 仪器四部分、单色器位置、光源调制 | P42–46 |
| 12:25 | 空心阴极灯：结构、溅射与激发过程、灯电流 | P47–52 |
| 14:02 | 火焰原子化：雾化过程、三类火焰、常用火焰表、优缺点 | P53–61 |
| 16:32 | 石墨炉：结构、四段程序升温、优缺点 | P62–65 |
| 17:52 | 单色器参数与通带、光电倍增管、单 / 双光束 | P66–70 |
| 19:22 | 8-4 标准曲线法、标准加入法（计算法、作图法） | P71–76 |
| 21:41 | 8-7 特点及应用 | P77 |
| 22:32 | 课堂练习（二）：3 题 | P78–81 |
| 23:13 | 全章总结图 | — |

每道练习题出题后停顿 3 秒（画面有倒计时），再给出答案和解析。

## 重新生成

与第 9 章用同一套流程。讲稿 `src/script.json` 先逐句合成配音，再由配音时长生成 `src/timeline.js`；字幕、动画和讲稿都使用这份时间数据。

```bash
pip install sherpa-onnx soundfile numpy
```

```bash
python3 tools/build_audio.py --model <matcha-icefall-zh-baker 目录> --vocoder <vocos-22khz-univ.onnx>
```

```bash
ffmpeg -y -i exports/narration.wav -ac 1 -b:a 64k exports/narration.mp3
```

```bash
node tools/gen-docs.mjs
```

```bash
node tools/check.mjs exports/check
```

```bash
node tools/render-video.mjs exports/aas-lesson.mp4 25 4
```

语音模型来自 k2-fsa/sherpa-onnx 的 GitHub releases：`tts-models/matcha-icefall-zh-baker.tar.bz2` 和 `vocoder-models/vocos-22khz-univ.onnx`。
