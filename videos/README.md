# 单片机课程：第一章、第二章讲解视频

Codex 根据原课件和已校订的逐字稿制作。每章 24 分钟，1920×1080、24 fps，包含普通话配音、内嵌字幕、独立 SRT、表格与计算过程。

| 工程 | 原课件 | 分段 | 画面状态 | 时间 |
|---|---:|---:|---:|---:|
| [第一章：绪论](mcu-ch01/) | 63 页 | 28 | 91 | 24:00 |
| [第二章：单片机系统结构](mcu-ch02/) | 34 页 | 28 | 88 | 24:00 |

知识点按教学逻辑合并讲解；原课件的页码追溯保留在画面右上角和逐页覆盖表中。原课件中的封面、重复页、空白页也登记来源，不用无意义停留占用视频时间。第一章历史资料图片保留为来源示例；第二章保留经典 8051、8031、AT89S52 的型号边界。

## 观看与复习材料

- 成片入口见仓库根目录及本目录的 `delivery.json`（完成导出后写入）。
- [第一章字幕](mcu-ch01/subtitles.srt)、[第二章字幕](mcu-ch02/subtitles.srt)。成片已带字幕，通常无需另行加载。
- [第一章分镜](mcu-ch01/STORYBOARD.md)、[第二章分镜](mcu-ch02/STORYBOARD.md)。
- [逐字稿、完整习题答案、参考表和逐页覆盖](../docs/mcu-video-scripts/README.md)。
- 每段末尾保留阅读和核对时间；练习较长时可暂停。

## 预览和重新导出

环境：Node.js 20+、Python 3.11+、Chrome、FFmpeg 和 FFprobe（后两者加入 PATH）。随仓库保存生成好的配音、字体、图片和 HTML；只预览或渲染时不必重新请求语音服务。

```powershell
cd videos/mcu-ch01
npx --yes hyperframes@0.9.11 preview --background
npx --yes hyperframes@0.9.11 check
npx --yes hyperframes@0.9.11 render --fps 24 --workers 4 --crf 20 --strict --no-best-effort --output renders/ch01.mp4
```

第二章切换到 `videos/mcu-ch02` 后使用相同命令。有支持的显卡时可加 `--gpu`。Windows 首次运行若下载专用浏览器过慢，可在当前 PowerShell 会话指定已安装的 Chrome：

```powershell
$env:HYPERFRAMES_BROWSER_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:PRODUCER_FORCE_SCREENSHOT='true'
```

修改正文应先改 `docs/mcu-video-scripts/ch01/script.json` 或 `ch02/script.json`；修改画面内容改 `videos/lesson_panels.py`。然后从仓库根目录执行：

```powershell
python -m pip install -r videos/requirements.txt
python videos/build_audio.py
python videos/build_videos.py
```

`build_audio.py` 仅重新生成内容有变化的语音。生成新语音需要联网；语音来自 Microsoft Edge 在线语音，通过 edge-tts 7.3.1 调用，使用 `zh-CN-XiaoxiaoNeural`，速度 `-15%`。已有配音不依赖联网播放。语音服务可用性及输出可能随服务调整；本次成片使用仓库中冻结的音频文件。

`build_videos.py` 会重新生成画面、字幕和时间轴。字幕来自实际语音返回的词时间，保留正文标点；公式、地址和寄存器的规范写法显示在主画面中。无背景音乐，避免影响技术术语听辨。

## 资源与复核

- 原始课件在 `docs/`；技术校订见 [technical-notes.md](../docs/mcu-video-scripts/technical-notes.md)。
- 图解、表格和动画由 Codex 制作；原课件截图标明页码，不把重绘图冒充原图。
- Noto Sans SC 字体许可证随 `assets/fonts/OFL.txt` 保存。完整字体用于重新生成子集，播放使用 WOFF2 子集。
- GSAP 3.15.0 保留原文件头版权及许可证入口；HyperFrames CLI 固定为 0.9.11。
- 自动检查覆盖布局、运行时、对比度、音频和时间轴；画面另作人工抽查。详细结果将在 `qa-report.md` 中记录。

