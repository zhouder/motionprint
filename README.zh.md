# MotionPrint

**你的每日数字指纹——由鼠标轨迹生成的艺术作品。**

> **English version: [README.md](README.md)**

MotionPrint 静静地在系统托盘中运行，记录鼠标位置、点击和滚动。每一天，它都会将你的活动转化为一幅独特的生成艺术作品——如同个人的"鼠标画布"，每天产生不同的指纹。

---

## 快速下载与使用

**[⬇ 下载 MotionPrint v1.0.0](https://github.com/zhouder/motionprint/releases/download/v1.0.0/MotionPrint-1.0.0-win.zip)** (107 MB, Windows x64)

1. 点击上方链接**下载** zip 文件
2. **解压**到任意目录
3. **双击** `MotionPrint.exe` 启动
4. 应用自动最小化到**系统托盘**（右下角任务栏）
5. 点击托盘图标打开窗口——记录自动开始
6. 随时按 **Ctrl + Shift + M** 显示/隐藏窗口
7. 在设置中开启**开机自启动**

**无需安装**——解压即用。所有数据仅存储在本地。

历史版本请访问 [Releases 页面](https://github.com/zhouder/motionprint/releases)。

---

## 隐私模型

隐私是 MotionPrint 的核心设计原则，而非事后补救。

### MotionPrint 记录什么
- 鼠标光标位置（x, y 坐标）
- 鼠标点击（左键、右键、中键）
- 滚轮事件（方向和幅度）

### MotionPrint 绝不记录什么
- 任何形式的键盘输入
- 屏幕内容（不截图）
- 窗口标题或应用程序名称
- 文件名、路径或内容
- 网页 URL 或浏览器历史
- 剪贴板内容

### 数据存储
- 所有数据存储在 **本地** `%APPDATA%/MotionPrint/data/` 目录
- 每天存储为独立的 JSON 文件
- 应用 **零网络请求**——无服务器、无云端、无遥测
- 可在设置中关闭原始数据保留
- 可随时删除任意一天的数据或清空全部

### 首次运行体验
首次启动时，MotionPrint 会显示清晰的隐私声明，明确说明追踪和不追踪的内容。只有在你接受后，记录才会开始。

---

## 安装

### 下载
从 [Releases 页面](https://github.com/zhouder/motionprint/releases) 下载最新版本：

- **`MotionPrint-1.0.0-win.zip`** — 便携版（解压即用，无需安装）

### 从源码安装
```bash
git clone https://github.com/your-org/motionprint.git
cd motionprint
npm install
npm run build
npm start
```

---

## 日常使用

### 推荐的使用方式
1. **安装后**，打开设置 → 开启"开机自启动"
2. 应用会随系统启动，自动最小化到托盘
3. 24 小时后台静默监测鼠标轨迹
4. **随时**双击托盘图标打开窗口，查看今日生成的艺术作品
5. 在画廊中回顾过去每天的指纹，切换不同主题

### 托盘菜单
- 双击托盘图标：打开窗口
- 右键托盘图标：开始/暂停/停止记录、打开窗口、退出

---

## 开发

### 环境要求
- Node.js 18+
- npm 9+
- Windows 10 或 11

### 命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发模式（主进程 + 渲染进程热更新） |
| `npm run build` | 生产构建 |
| `npm start` | 运行已构建的应用 |
| `npm run pack` | 打包测试（未压缩） |
| `npm run dist` | 构建 Windows 安装包 |
| `npm run lint` | 运行 ESLint |
| `npm test` | 运行测试 |

### 项目结构
```
motionprint/
├── src/
│   ├── main/           # Electron 主进程
│   │   ├── index.ts       # 应用入口、窗口创建、开机自启
│   │   ├── tray.ts        # 系统托盘和菜单
│   │   ├── sampler.ts     # 鼠标轮询 + 全局钩子
│   │   ├── storage.ts     # JSON 文件持久化
│   │   └── ipc-handlers.ts # IPC 桥接
│   ├── preload/
│   │   └── index.ts       # contextBridge API
│   ├── renderer/         # React 应用
│   │   ├── i18n/          # 中英文翻译
│   │   ├── components/    # UI 组件
│   │   ├── renderers/     # 3 种渲染主题
│   │   ├── hooks/         # React hooks
│   │   ├── utils/         # 调色板生成、导出
│   │   └── styles/        # 全局 CSS
│   └── shared/
│       └── types.ts       # 共享 TypeScript 类型
├── assets/
│   └── icon.png
├── electron-builder.yml
├── vite.config.ts
├── README.md
├── README.zh.md
└── package.json
```

### 技术栈
- **运行时**: Electron 33
- **UI**: React 18 + TypeScript 5
- **构建**: Vite（渲染进程）+ tsc（主进程）+ electron-builder
- **鼠标捕获**: 活动时 30Hz 轮询 / 空闲时 2Hz + uiohook-napi 用于点击和滚动
- **渲染**: Canvas 2D API
- **存储**: 每日本地 JSON 文件
- **打包**: NSIS Windows 安装程序

---

## 功能

### 3 种渲染主题
1. **地形** — 移动频率生成地形热力图
2. **墨迹** — 传统水墨画风格，停留形成浓墨池
3. **霓虹** — 暗黑赛博朋克风格，发光霓虹管线

### 系统托盘
- 从托盘菜单开始/暂停/停止记录
- 关闭窗口即最小化到托盘——后台持续记录
- 双击托盘图标打开窗口

### 画廊
- 所有记录日期的日历视图
- 点击任意日期，用任意主题重新渲染
- 导出为 PNG，支持常见壁纸分辨率（HD、1440p、4K、UWQHD、竖屏）

### 统计
- 移动总距离（米/公里）
- 活跃时间
- 点击次数
- 滚动次数
- 最长停留时间
- 采样点总数

---

## 性能

- **CPU**: 30Hz 轮询在现代硬件上 CPU 占用 < 0.5%
- **内存**: 通常低于 100 MB
- **空闲检测**: 60 秒无移动后降至 2Hz 轮询
- **磁盘**: 每日 JSON 文件约 50-500 KB，取决于活动量
- **空间压缩**: 冗余中间点被过滤
- **可配置**: 采样率、空闲阈值、空闲采样率均可在设置中调整

---

## 渲染保证

- 相同输入数据 + 相同日期 + 相同主题 = **每次输出完全相同**
- 所有调色板由日期字符串确定性生成
- 所有渲染器均无随机性——可复现性得到保证
- 原始数据在渲染过程中永不修改

---

## 许可证

MIT