# 现代分析仪器及应用 · 动画教学作品

| 目录 | 内容 |
|---|---|
| 根目录 | 第 4 章《电位分析法》60 秒动态思维导图（本文以下内容） |
| [`ch8-aas/`](ch8-aas/README.md) | 第 8 章《原子吸收光谱分析》完整讲解视频（约 24 分钟，带配音） |
| [`ch9-uv/`](ch9-uv/README.md) | 第 9 章《紫外吸收光谱分析》完整讲解视频（约 15 分钟，带配音） |
| [`docs/mcu-video-scripts/`](docs/mcu-video-scripts/README.md) | 单片机课程第1、2章：每章25分钟内逐字稿、24分钟分镜预算、练习答案、逐页覆盖表与画面样张 |
| [`exports/mcu/`](exports/mcu/README.md) | 单片机课程第1、2章成片：每章24分钟，1080p，普通话配音、字幕、28个章节跳转点 |
| [`videos/`](videos/README.md) | 两章可编辑视频工程、冻结配音、SRT字幕、时间轴和重新导出方法 |

# 电位分析法 · 一分钟动态思维导图

《现代分析仪器及应用》第 4 章《电位分析法》的 60 秒动态教学作品。主线问题：**pH 计为什么能知道一杯水有多酸？**

## 交付物

| # | 内容 | 文件 |
|---|---|---|
| 1 | 章节知识结构图（4-1 至 4-8，标注课件页码，并对应动画分支） | `knowledge-map.html`、`exports/knowledge-map.png` |
| 2 | 动态 HTML 教学页面（自动 / 手动模式，可拖动时间轴，支持全屏） | `index.html`（加上 `src/`） |
| 3 | 逐秒分镜表 | `docs/storyboard.md`、`exports/storyboard-frames.png` |
| 4 | 60 秒中文配音稿和字幕文件 | `docs/voiceover.md`、`docs/voiceover.srt` |
| 5 | 最终全图（复习截图） | `exports/final-summary.png`（页面中按 `0` 也可跳到） |
| — | 专业准确性核对表 | `docs/accuracy-check.md` |
| — | 成片视频（1080p，30 fps） | `exports/potentiometry-60s.mp4`（带字幕）、`exports/potentiometry-60s-nocaption.mp4`（无字幕，用于后期配音） |

## 使用

直接用浏览器打开 `index.html` 即可，不需要服务器，也不依赖动画库。

- **自动模式**（默认）：打开后连续播放 60 秒。
- **手动模式**：先显示全图；点击某个分支节点或卡片，或点时间轴上的分段按钮，只播放该段，播完后暂停。
- 快捷键：空格 播放/暂停 · ←/→ 跳 1 秒 · `1`–`5` 跳到对应分支 · `0` 全图 · `C` 字幕 · `N` 说明文字 · `F` 全屏 · `H` 隐藏控制栏 · `R` 重播
- URL 参数：`?clean=1`（纯画面录屏）· `?cap=0`（关闭字幕）· `?notes=0`（关闭说明文字）· `?t=58`（从指定秒开始）· `?mode=manual` · `?autoplay=0`

## 实现说明

- 画面是 1920×1080 的 SVG。每个元素在任一时刻的状态都只由时间 t 决定（`render(t)`），所以拖动时间轴、跳转分支、逐帧导出视频都能精确对齐。
- 时间数据只有一份，放在 `src/data.js`：分段和配音字幕都从这里读取。`tools/gen-docs.mjs` 用它生成配音稿和 SRT。
- `tools/check.mjs`：截取关键帧，检查脚本报错和文字溢出（每个文本都设有宽度上限 `data-maxw`）。
- `tools/render-video.mjs`：用 Playwright 逐帧渲染，再交给 ffmpeg 合成 MP4。

```bash
node tools/gen-docs.mjs
```

```bash
node tools/check.mjs exports/check
```

```bash
node tools/render-video.mjs exports/potentiometry-60s.mp4 30
```
