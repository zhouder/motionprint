// ============================================================
// MotionPrint — Main Process Entry
// ============================================================

import { app, BrowserWindow, screen, globalShortcut } from 'electron';
import * as path from 'path';
import { createTray, destroyTray } from './tray';
import { registerIpcHandlers } from './ipc-handlers';
import { getStorage } from './storage';
import { getSampler } from './sampler';

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;
let startHidden = false;

function createWindow(): void {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = Math.min(1200, Math.floor(screenWidth * 0.8));
  const winHeight = Math.min(800, Math.floor(screenHeight * 0.8));

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    minWidth: 900,
    minHeight: 600,
    title: 'MotionPrint',
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    if (!startHidden) {
      mainWindow?.show();
    }
  });

  // Close to tray, not quit
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Load the renderer
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'));
  }
}

function showWindow(): void {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  } else {
    createWindow();
  }
}

app.whenReady().then(async () => {
  // Initialize storage
  const storage = getStorage();
  await storage.init();

  // Initialize sampler
  const sampler = getSampler(storage);

  // Register IPC handlers
  registerIpcHandlers(storage, sampler);

  // Create tray
  createTray({
    onShow: showWindow,
    onQuit: () => {
      isQuitting = true;
      sampler.stop();
      destroyTray();
      app.quit();
    },
    sampler,
  });

  // Create main window
  createWindow();

  // Auto-start recording
  const settings = await storage.getSettings();

  // Configure auto-start on boot
  app.setLoginItemSettings({
    openAtLogin: settings.launchAtStartup,
    openAsHidden: true,
  });

  if (settings.firstRun) {
    // Don't auto-start on first run — user needs to see privacy notice
  } else {
    sampler.start();
    // If launched at startup, keep window hidden
    if (settings.launchAtStartup) {
      startHidden = true;
    }
  }

  // Register global shortcut: Ctrl+Shift+M to toggle window visibility
  globalShortcut.register('Ctrl+Shift+M', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        showWindow();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      showWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit — keep running in tray
});

app.on('before-quit', () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
  const sampler = getSampler();
  sampler.stop();
  destroyTray();
});