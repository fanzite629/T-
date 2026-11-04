# 第 9 章 紫外吸收光谱分析 · 讲解视频

根据《现代分析仪器及应用》第 9 章课件（54 页）制作的完整讲解视频。目标是：只看这个视频，就能学会课件中的全部知识点。

## 交付物

| 文件 | 内容 |
|---|---|
| `exports/uv-spectroscopy-lesson.mp4` | 成片：1920×1080、25 fps，带中文配音和字幕，约 15 分 40 秒 |
| `index.html` | 交互版：可拖动时间轴、点击顶部章节标签跳转、0.75–1.5 倍速、字幕和注释开关、全屏 |
| `docs/transcript.md` | 带时间戳的完整讲稿，可当复习笔记 |
| `docs/subtitles.srt` | 字幕文件 |
| `docs/accuracy-notes.md` | 课件内部不一致之处的处理、视频补充内容的说明、配音校对结果 |

## 内容结构

| 时间 | 章节 | 课件页 |
|---|---|---|
| 00:00 | 导入与学习路线 | P2 |
| 00:19 | 紫外光区划分、仪器工作过程、方法特点 | P3、P5–6 |
| 01:28 | 9-1 分子吸收光谱：三种运动与能级、跃迁能量、带状光谱、吸收曲线、与原子光谱对比 | P7–12 |
| 03:26 | 9-2 价电子与四种跃迁：σ、π、n 电子，能量顺序，比尔定律与 κ，电子弛豫，四种跃迁逐一讲解 | P13–21 |
| 06:42 | 9-3 无机化合物：电荷迁移、配位场跃迁、血红素与叶绿素、六种跃迁总表 | P22–26 |
| 08:05 | 生色团、助色团、红移与蓝移、R/K/B/E 吸收带 | P27–34 |
| 10:03 | 9-5 分光光度计：光源、单色器、样品室、检测器、显示系统、双光束 | P35–40 |
| 11:27 | 9-6 应用：定性分析、光谱比较法、标准曲线法 | P41–44 |
| 12:39 | 与原子吸收光谱的比较 | P51–53 |
| 13:33 | 6 道课堂练习（每题停顿 3 秒，再给答案和解析） | P45–50 |
| 15:04 | 全章总结图 | — |

## 重新生成

字幕、动画和讲稿共用同一份时间数据：讲稿 `src/script.json` → 逐句合成配音 → 由配音时长生成 `src/timeline.js`。

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
node tools/render-video.mjs exports/uv-spectroscopy-lesson.mp4 25 4
```

语音模型来自 k2-fsa/sherpa-onnx 的 GitHub releases：`tts-models/matcha-icefall-zh-baker.tar.bz2` 和 `vocoder-models/vocos-22khz-univ.onnx`。
