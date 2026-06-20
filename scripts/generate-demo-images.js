// Generate demo images by rendering mock data programmatically
// Then save as PNG files for README

const fs = require('fs');
const path = require('path');

// Create a simple PNG file with a gradient + shapes
// This avoids needing any canvas library

function createTerrainPNG(filepath) {
  // We'll generate PNG data manually
  const w = 800, h = 450;
  const raw = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // Dark background
      raw[i] = 13;   // R
      raw[i+1] = 17; // G
      raw[i+2] = 23; // B
      raw[i+3] = 255; // A
    }
  }

  // Draw some heatmap-like cells
  for (let c = 0; c < 20; c++) {
    const cx = 100 + Math.floor(Math.random() * 600);
    const cy = 50 + Math.floor(Math.random() * 350);
    const size = 20 + Math.floor(Math.random() * 40);
    const hue = [180, 140, 80, 200, 50][c % 5];
    for (let dy = -size/2; dy < size/2; dy++) {
      for (let dx = -size/2; dx < size/2; dx++) {
        const px = Math.floor(cx + dx);
        const py = Math.floor(cy + dy);
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const i = (py * w + px) * 4;
          raw[i] = Math.min(255, raw[i] + 30);
          raw[i+1] = Math.min(255, raw[i+1] + 20);
          raw[i+2] = Math.min(255, raw[i+2] + 15);
        }
      }
    }
  }

  // Draw path lines
  for (let s = 0; s < 50; s++) {
    const x1 = Math.floor(Math.random() * w);
    const y1 = Math.floor(Math.random() * h);
    const x2 = Math.floor(Math.random() * w);
    const y2 = Math.floor(Math.random() * h);
    const steps = Math.max(Math.abs(x2-x1), Math.abs(y2-y1));
    for (let t = 0; t < steps; t++) {
      const px = Math.floor(x1 + (x2-x1) * t / steps);
      const py = Math.floor(y1 + (y2-y1) * t / steps);
      if (px >= 0 && px < w && py >= 0 && py < h) {
        const i = (py * w + px) * 4;
        raw[i] = 200; raw[i+1] = 180; raw[i+2] = 150;
      }
    }
  }

  savePNG(filepath, raw, w, h);
}

function createInkPNG(filepath) {
  const w = 800, h = 450;
  const raw = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      raw[i] = 13; raw[i+1] = 17; raw[i+2] = 23; raw[i+3] = 255;
    }
  }

  // Ink splatter paths
  for (let s = 0; s < 30; s++) {
    const x1 = Math.floor(Math.random() * w);
    const y1 = Math.floor(Math.random() * h);
    const x2 = Math.floor(Math.random() * w);
    const y2 = Math.floor(Math.random() * h);
    const steps = Math.max(Math.abs(x2-x1), Math.abs(y2-y1));
    const width = 1 + Math.floor(Math.random() * 4);
    for (let t = 0; t < steps; t++) {
      for (let d = -width; d <= width; d++) {
        const px = Math.floor(x1 + (x2-x1) * t / steps + d);
        const py = Math.floor(y1 + (y2-y1) * t / steps);
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const i = (py * w + px) * 4;
          const alpha = 0.3 + Math.random() * 0.7;
          raw[i] = Math.floor(80 + Math.random() * 40);
          raw[i+1] = Math.floor(60 + Math.random() * 30);
          raw[i+2] = Math.floor(40 + Math.random() * 20);
          raw[i+3] = Math.floor(255 * alpha);
        }
      }
    }
  }

  // Ink splatters (clicks)
  for (let c = 0; c < 8; c++) {
    const cx = Math.floor(Math.random() * w);
    const cy = Math.floor(Math.random() * h);
    for (let r = 0; r < 6; r++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 3 + Math.random() * 8;
      const px = Math.floor(cx + Math.cos(angle) * dist);
      const py = Math.floor(cy + Math.sin(angle) * dist);
      if (px >= 0 && px < w && py >= 0 && py < h) {
        const i = (py * w + px) * 4;
        raw[i] = 180; raw[i+1] = 100; raw[i+2] = 60;
      }
    }
  }

  savePNG(filepath, raw, w, h);
}

function createNeonPNG(filepath) {
  const w = 800, h = 450;
  const raw = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const t = y / h;
      raw[i] = Math.floor(10 + t * 3);
      raw[i+1] = Math.floor(10 + t * 5);
      raw[i+2] = Math.floor(15 + t * 5);
      raw[i+3] = 255;
    }
  }

  const colors = [
    [0, 200, 255], [255, 50, 100], [180, 255, 50],
    [200, 100, 255], [255, 200, 0], [50, 200, 100]
  ];

  // Neon glow paths
  for (let s = 0; s < 25; s++) {
    const x1 = Math.floor(Math.random() * w);
    const y1 = Math.floor(Math.random() * h);
    const x2 = Math.floor(Math.random() * w);
    const y2 = Math.floor(Math.random() * h);
    const col = colors[s % colors.length];
    const steps = Math.max(Math.abs(x2-x1), Math.abs(y2-y1));

    // Glow (wide, semi-transparent)
    for (let t = 0; t < steps; t += 1) {
      for (let d = -4; d <= 4; d++) {
        const px = Math.floor(x1 + (x2-x1) * t / steps + d);
        const py = Math.floor(y1 + (y2-y1) * t / steps);
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const i = (py * w + px) * 4;
          const alpha = 0.15 - Math.abs(d) * 0.03;
          raw[i] = Math.min(255, raw[i] + Math.floor(col[0] * alpha));
          raw[i+1] = Math.min(255, raw[i+1] + Math.floor(col[1] * alpha));
          raw[i+2] = Math.min(255, raw[i+2] + Math.floor(col[2] * alpha));
        }
      }
    }

    // Core (thin, bright)
    for (let t = 0; t < steps; t += 1) {
      const px = Math.floor(x1 + (x2-x1) * t / steps);
      const py = Math.floor(y1 + (y2-y1) * t / steps);
      if (px >= 0 && px < w && py >= 0 && py < h) {
        const i = (py * w + px) * 4;
        raw[i] = 255; raw[i+1] = 255; raw[i+2] = 255;
      }
    }
  }

  savePNG(filepath, raw, w, h);
}

// PNG encoder - creates valid PNG files from raw RGBA data
function savePNG(filepath, raw, w, h) {
  // Build IDAT (deflate compressed RGBA data)
  const zlib = require('zlib');
  const rawLines = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    const off = y * (1 + w * 4);
    rawLines[off] = 0; // filter none per row
    raw.copy(rawLines, off + 1, y * w * 4, (y + 1) * w * 4);
  }
  const compressed = zlib.deflateSync(rawLines);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeB, data]);
    const crc = crc32(crcData);
    const crcB = Buffer.alloc(4);
    crcB.writeUInt32BE(crc);
    return Buffer.concat([len, typeB, data, crcB]);
  }

  // CRC-32
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        if (crc & 1) { crc = (crc >>> 1) ^ 0xEDB88320; }
        else { crc = crc >>> 1; }
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const png = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
  fs.writeFileSync(filepath, png);
  console.log('Saved: ' + filepath + ' (' + png.length + ' bytes)');
}

// ---- Generate all 3 preview images ----
const assetsDir = 'D:/claude/workspace/motionprint/assets/screenshots';
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

createTerrainPNG(path.join(assetsDir, 'demo-terrain.png'));
createInkPNG(path.join(assetsDir, 'demo-ink.png'));
createNeonPNG(path.join(assetsDir, 'demo-neon.png'));