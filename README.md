# MotionPrint

**Your daily digital fingerprint — generated from mouse movement.**

> **中文版本：[README.zh.md](README.zh.md)**

MotionPrint runs quietly in your system tray, recording mouse position, clicks, and scrolls. Every day, it transforms your activity into a unique piece of generative art — like a personal "mouse canvas" that produces a different fingerprint each day.

---

## Quick Download & Usage

**[⬇ Download MotionPrint v1.0.0](https://github.com/zhouder/motionprint/releases/download/v1.0.0/MotionPrint-1.0.0-win.zip)** (107 MB, Windows x64)

1. **Download** the zip file from the link above
2. **Extract** the zip to any folder
3. **Double-click** `MotionPrint.exe` to launch
4. The app starts minimized to the **system tray** (bottom-right taskbar area)
5. Click the tray icon to open the window — recording begins automatically
6. Press **Ctrl + Shift + M** to show/hide the window at any time
7. Enable **auto-start on boot** in Settings

**No installation required** — just extract and run. All data stays local on your machine.

For older releases, visit the [Releases page](https://github.com/zhouder/motionprint/releases).

---

## Privacy Model

MotionPrint is built with privacy as a core design principle, not an afterthought.

### What MotionPrint records
- Mouse cursor position (x, y coordinates)
- Mouse clicks (left, right, middle)
- Scroll wheel events (direction and amount)

### What MotionPrint NEVER records
- Keyboard input of any kind
- Screen contents (no screenshots)
- Window titles or application names
- File names, paths, or contents
- Web page URLs or browser history
- Clipboard contents

### Data storage
- All data is stored **locally** in `%APPDATA%/MotionPrint/data/`
- Each day is stored as a separate JSON file
- The app makes **zero network requests** — no servers, no cloud, no telemetry
- You can disable raw data retention in Settings
- You can delete any day's data or clear everything at any time

### First-run experience
On first launch, MotionPrint shows a clear privacy notice explaining exactly what is and isn't tracked. Recording only begins after you accept.

---

## Installation

### Download
Download the latest version from the [Releases page](https://github.com/zhouder/motionprint/releases):

- **`MotionPrint-1.0.0-win.zip`** — Portable version (extract and run, no installation needed)

### From Source
```bash
git clone https://github.com/your-org/motionprint.git
cd motionprint
npm install
npm run build
npm start
```

---

## Development

### Prerequisites
- Node.js 18+
- npm 9+
- Windows 10 or 11 (the app is Windows-only for global mouse hooks)

### Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev mode (main + renderer with hot reload) |
| `npm run build` | Build for production |
| `npm start` | Run the built app |
| `npm run pack` | Package for testing (unpacked) |
| `npm run dist` | Build Windows installer |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

### Project Structure
```
motionprint/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts       # App entry, window creation
│   │   ├── tray.ts        # System tray and menu
│   │   ├── sampler.ts     # Mouse polling + global hooks
│   │   ├── storage.ts     # JSON file persistence
│   │   └── ipc-handlers.ts # IPC bridge
│   ├── preload/
│   │   └── index.ts       # contextBridge API
│   ├── renderer/         # React app
│   │   ├── components/    # UI components
│   │   ├── renderers/     # 3 rendering themes
│   │   ├── hooks/         # React hooks
│   │   ├── utils/         # Palette generation, export
│   │   └── styles/        # Global CSS
│   └── shared/
│       └── types.ts       # Shared TypeScript types
├── assets/
│   └── icon.png
├── electron-builder.yml
├── vite.config.ts
└── package.json
```

### Tech Stack
- **Runtime**: Electron 33
- **UI**: React 18 + TypeScript 5
- **Build**: Vite (renderer) + tsc (main) + electron-builder
- **Mouse capture**: Polling at 30Hz (active) / 2Hz (idle) + uiohook-napi for clicks/scrolls
- **Rendering**: Canvas 2D API
- **Storage**: Local JSON files per day
- **Packaging**: NSIS installer for Windows

---

## Features

### 3 Rendering Themes
1. **Terrain** — Movement frequency creates a topographic heatmap.
2. **Ink Wash** — Traditional ink brush style. Stays create dark ink pools.
3. **Neon** — Dark cyberpunk aesthetic with glowing neon tubes.

### System Tray
- Start / Pause / Stop recording from the tray menu
- App minimizes to tray — recording continues in the background
- Double-click tray icon to open the window

### Gallery
- Calendar view of all recorded days
- Click any date to re-render with any theme
- Export as PNG at common wallpaper resolutions (HD, 1440p, 4K, UWQHD, portrait)

### Stats
- Total distance moved (meters/kilometers)
- Active time
- Click count
- Scroll count
- Longest pause
- Total sample count

---

## Performance

- **CPU**: Polling at 30Hz uses negligible CPU (< 0.5% on modern hardware)
- **Memory**: Typically under 100 MB RAM
- **Idle detection**: Drops to 2Hz polling when no movement is detected for 60 seconds
- **Disk**: Daily JSON files are ~50-500 KB depending on activity
- **Spatial compression**: Redundant intermediate points are filtered out
- **Configurable**: Sampling rate, idle threshold, and idle rate are all adjustable in Settings

---

## Rendering Guarantees

- Same input data + same date + same theme = **identical output, every time**
- All color palettes are deterministically seeded from the date string
- No randomness in any renderer — reproducibility is guaranteed
- Raw data is never modified during rendering

---

## License

MIT