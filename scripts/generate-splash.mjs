/**
 * Generates iOS PWA splash screen PNGs using only the built-in
 * Canvas API available in Node 18+ (via the `canvas` npm package).
 * Run: node scripts/generate-splash.mjs
 *
 * Install once: npm install canvas --save-dev
 */

import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/splash');
mkdirSync(outDir, { recursive: true });

const BG = '#1a0533';
const TITLE = 'MultiMaestros';
const SUBTITLE = '✖ Tablas de Multiplicar';

const SIZES = [
  { file: 'splash-1290x2796.png', w: 1290, h: 2796 },
  { file: 'splash-1179x2556.png', w: 1179, h: 2556 },
  { file: 'splash-1170x2532.png', w: 1170, h: 2532 },
  { file: 'splash-1125x2436.png', w: 1125, h: 2436 },
  { file: 'splash-828x1792.png',  w: 828,  h: 1792 },
  { file: 'splash-750x1334.png',  w: 750,  h: 1334 },
];

for (const { file, w, h } of SIZES) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1a0533');
  grad.addColorStop(1, '#2d1060');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Decorative circle glow
  const glow = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, w * 0.38);
  glow.addColorStop(0, 'rgba(134,59,255,0.35)');
  glow.addColorStop(1, 'rgba(134,59,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Title
  const titleSize = Math.round(w * 0.11);
  ctx.font = `900 ${titleSize}px "Arial"`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(TITLE, w / 2, h * 0.45);

  // Subtitle
  const subSize = Math.round(w * 0.055);
  ctx.font = `700 ${subSize}px "Arial"`;
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText(SUBTITLE, w / 2, h * 0.45 + titleSize * 1.3);

  const buf = canvas.toBuffer('image/png');
  writeFileSync(join(outDir, file), buf);
  console.log(`✅  ${file}  (${w}×${h})`);
}

console.log('\nAll splash screens written to public/splash/');
