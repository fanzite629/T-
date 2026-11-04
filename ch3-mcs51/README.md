# 第 3 章 单片机指令系统（MCS-51）· 讲解视频

根据 `docs/第3章  单片机指令系统（5次）.pdf`（共 96 页）制作的系列讲解视频，面向刚接触单片机的初学者，中文配音加中文字幕。课件中的所有概念、指令、图表、例题和程序示例都有覆盖：每个例子都按 MCS-51 指令规则逐条执行，画面上同步显示执行前后寄存器、存储单元和标志位的变化。

## 交付物

| 文件 | 内容 |
|---|---|
| `exports/ep1-…mp4` ~ `exports/ep6-…mp4` | 6 集成片：1920×1080、25 fps，H.264 + AAC，带中文配音和中文字幕（字幕已烧录在画面中） |
| `index.html?ep=1` ~ `?ep=6` | 交互版（视频源文件）：可拖动时间轴、点击进度条分段跳转、0.75–1.5 倍速、字幕和注释开关、全屏 |
| `docs/transcript.md` | 讲解稿：全部 6 集带时间戳的完整旁白，每节注明课件页码 |
| `docs/subtitles/ep1.srt` ~ `ep6.srt` | 外挂字幕文件 |
| `docs/page-checklist.md` / `.csv` | **96 页核对表**：每页 → 知识点 → 第几集 → 章节 → 时间段 → 核对备注 |
| `docs/accuracy-notes.md` | 核对方法、逐项核对通过的例题、课件笔误与存疑（共 23 条）、补充内容和演示数据说明 |

## 分集与课件页对应

EPISODE_TABLE

## 内容处理原则

- **以课件为准。** 处理器与指令规则按 MCS-51。课件中的每个例题和程序都逐条重新计算过，与课件一致的标为 ✓（见 `docs/accuracy-notes.md`）。
- **存疑必标。** 课件笔误、前后矛盾或与指令规则不符之处，画面上用橙色「⚠ 课件存疑」框标出，旁白也会说明。例如 P33 写“SP 指在栈底”，P93 写 LJMP MAA 后 PC=50H。两条无法核实的说法（P94 用“=”代替 EQU、P95 的 DL 伪指令）明确标为“未能核实”。
- **补充必标。** 视频补充的内容（如机器码、寄存器区地址、12MHz 换算）用紫色「＋ 补充说明」框。课件没有给出数据的地方，演示用的数值都标有“演示数据（课件未给出）”，没有冒充课件内容。

## 重新生成

讲稿、字幕和动画共用同一份时间数据：讲稿 `src/script/epN.json` → 逐句合成配音 → 由配音时长生成 `src/tl/epN.js` → 动画事件锚定到每句话的起止时间。

```bash
pip install sherpa-onnx soundfile numpy
```

```bash
python3 tools/build_audio.py --ep 1 --model <kokoro-multi-lang-v1_0 目录>
```

```bash
ffmpeg -y -i exports/ep1-narration.wav -ac 1 -b:a 64k exports/ep1-narration.mp3
```

```bash
node tools/check.mjs 1 exports/check
```

```bash
node tools/render-video.mjs 1 exports/ep1-指令系统概述与寻址方式.mp4 25 3
```

```bash
node tools/gen-docs.mjs
```

```bash
python3 tools/asr_check.py --ep 1 --asr <sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17 目录>
```

所用模型均来自 k2-fsa/sherpa-onnx 的 GitHub releases：语音合成用 `tts-models/kokoro-multi-lang-v1_0.tar.bz2`（中英混读，说话人 45），配音校对用 `asr-models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17.tar.bz2`。`tools/build_audio.py` 会把助记符、十六进制数、`#`、`@` 等转换成中文课堂读法，并检查每个英文词都在发音词典里，避免漏读。

## 配音校对结果

ASR_TABLE
