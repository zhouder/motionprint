const cp = require('child_process');
const zipPath = 'D:/claude/workspace/motionprint/release/MotionPrint-1.0.0-win.zip';

try {
  const result = cp.execSync(
    `gh release create v1.0.0 "${zipPath}" --title "MotionPrint v1.0.0" --notes "MotionPrint — Your daily digital fingerprint from mouse movement.

Download and extract, then run MotionPrint.exe. Press Ctrl+Shift+M to toggle window, enable auto-start in Settings.

Features: 3 themes (Terrain/Ink Wash/Neon), system tray, calendar gallery, high-res PNG export, zh/en toggle, 100% local."`,
    { cwd: 'D:/claude/workspace/motionprint' }
  );
  console.log('Release created:', result.toString());
} catch (e) {
  console.log('Error:', e.message);
  console.log('Stderr:', e.stderr?.toString() || '');
}