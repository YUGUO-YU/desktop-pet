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