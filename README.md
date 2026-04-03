<<<<<<< HEAD
# 🧚 桌面精灵 V2.0

基于 Electron + React 19 + TypeScript 5 的 AI 情感交互虚拟形象应用。

## ✨ 功能特点

### V1.0 MVP (当前版本)

| 功能 | 描述 |
|------|------|
| 🧚 **虚拟形象** | 可爱猫咪精灵，玻璃拟态设计 |
| ✨ **流畅动画** | Framer Motion 驱动，丝滑交互 |
| ❤️ **情感系统** | 8种情绪状态，状态机驱动 |
| 🎮 **多种交互** | 抚摸、投喂、对话多种反馈 |
| 📱 **浮窗形态** | 无边框透明浮窗，拖拽移动 |
| 🔔 **系统托盘** | 最小化到托盘，随时唤醒 |

### 情绪系统

```
    ┌─────────┐
    │ 开心 😊 │ ←── 抚摸/投喂
    └────┬────┘
         │
    ┌────▼────┐
    │ 兴奋 😻 │ ←── 投喂/高情绪
    └────┬────┘
         │
┌────────┴────────┐
│                  │
▼                  ▼
┌────────┐    ┌──────────┐
│ 平静 😺 │    │ 若有所思 😼 │
└────┬───┘    └────┬─────┘
     │             │
     ▼             ▼
┌────────┐    ┌────────┐
│ 无聊 😿 │    │ 困倦 🙀 │
└────┬───┘    └────┬───┘
     │             │
     ▼             ▼
┌────────┐    ┌──────────┐
│ 悲伤 😿 │ ←── 长时间忽略  │
└────┬───┘    └────┬─────┘
     │             │
     └─────┬───────┘
           ▼
      ┌────────┐
      │ 生气 😾 │ ←── 极低情绪
      └────────┘
```

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | Electron 33 + React 19 |
| **语言** | TypeScript 5.7 |
| **状态管理** | Zustand 5 |
| **动画** | Framer Motion 11 |
| **样式** | Tailwind CSS 4 (CSS-first) |
| **构建** | Vite 6 + electron-builder |

## 🚀 运行指南

### 安装依赖

```bash
cd desktop-spirit-v2
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建发布

```bash
npm run build
```

## 📁 项目结构

```
desktop-spirit-v2/
├── electron/
│   ├── main.ts         # Electron 主进程
│   └── preload.ts      # 预加载脚本
├── src/
│   ├── components/
│   │   └── SpiritAvatar.tsx  # 精灵组件
│   ├── services/
│   │   └── EmotionService.ts # 情感系统 (Zustand)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css       # Tailwind + 自定义样式
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 UI 设计

- **玻璃拟态** - 毛玻璃 + 半透明效果
- **渐变按钮** - 紫色渐变主色调
- **微交互** - 悬停/点击/脉冲动画
- **心情可视化** - 5点进度条显示情绪值

---

🧚 **让桌面更有趣！**
=======
# 🐱 桌面宠物 - Desktop Pet

一款运行在 Windows 桌面上的轻量级宠物陪伴程序，兼具实用功能与情感交互。

## 功能特点

### 🎮 情绪交互
- 可爱的猫咪宠物浮窗显示
- 点击互动：抚摸、投喂
- 7种情绪状态：开心、平静、无聊、困倦、生气、好奇、惊讶

### 🌤️ 天气播报
- 城市天气查询
- 温度、天气状态展示
- 智能穿衣建议

### 📰 新闻收集
- 每日国内外重点资讯
- 卡片式展示，点击跳转阅读

### 📁 桌面整理
- 按文件类型自动分类
- 一键整理桌面文件
- 支持撤销操作

## 技术栈

- **语言**: Python 3.10+
- **GUI框架**: Flet (Flutter for Python)
- **数据存储**: SQLite

## 安装运行

### 1. 安装依赖
```bash
pip install flet requests feedparser
```

### 2. 运行程序
```bash
python main.py
```

### 3. 构建exe（可选）
```bash
pip install pyinstaller
pyinstaller main.py --onefile --noconsole
```

## 项目结构

```
desktop-pet/
├── main.py              # 主程序入口
├── ui/
│   ├── pet_window.py   # 宠物浮窗
│   ├── weather_card.py # 天气卡片
│   ├── news_card.py    # 新闻卡片
│   └── organize.py     # 文件整理
├── services/
│   ├── emotion.py      # 情绪引擎
│   ├── weather.py      # 天气服务
│   ├── news.py         # 新闻服务
│   └── file_organizer.py # 文件整理
└── utils/
    ├── database.py     # 数据库工具
    └── config.py       # 配置管理
```

## 版本

- V1.0 (MVP) - 基础功能版本

---
🐱 让桌面更有温度！
>>>>>>> 56770c4c5b27d776a93ae474e94ae0623553d528
