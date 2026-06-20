# MotionPrint

**你的每日数字指纹——由鼠标轨迹生成的艺术作品。**

MotionPrint 静静地在系统托盘中运行，记录鼠标位置、点击和滚动。每天结束时，它会将你的活动转化为一幅独特的生成艺术作品。把它想象成个人的"鼠标画布"——每一天都产生不同的指纹。

<p align="center">
  <em>截图：将导出的 PNG 放入 <code>assets/screenshots/</code> 目录</em>
</p>

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

### Windows（推荐）
从 [Releases](https://github.com/your-org/motionprint/releases) 下载最新安装包：

- `MotionPrint-Setup-1.0.0.exe` — 标准安装程序（NSIS）

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
│   │   ├── renderers/     # 5 种渲染主题
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

### 5 种渲染主题
1. **流线** — 鼠标路径化为流动的线条，速度决定线宽和颜色
2. **星图** — 活动点化为星辰，点击产生明亮的星爆
3. **地形** — 移动频率生成地形热力图
4. **墨迹** — 传统水墨画风格，停留形成浓墨池，移动形成笔触
5. **霓虹** — 暗黑赛博朋克风格，发光霓虹管线

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

---

## 截图

将截图放入 `assets/screenshots/` 目录：
- `live-preview.png` — 今日实时预览及统计
- `gallery.png` — 日历画廊视图
- `streamline.png` — 流线主题示例
- `starmap.png` — 星图主题示例
- `terrain.png` — 地形主题示例
- `ink.png` — 墨迹主题示例
- `neon.png` — 霓虹主题示例
- `privacy-notice.png` — 首次运行隐私声明
- `settings.png` — 设置页面
- `tray-menu.png` — 系统托盘菜单