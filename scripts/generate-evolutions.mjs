/**
 * Generates Evo 2 (golden glow) and Evo 3 (rainbow shimmer) variants
 * for every creature image in public/creatures/.
 *
 * Run once:
 *   npm install canvas --save-dev
 *   node scripts/generate-evolutions.mjs
 *
 * Output files:
 *   public/creatures/creature_X_evo2.png  (golden)
 *   public/creatures/creature_X_evo3.png  (rainbow)
 */

import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const creaturesDir = join(__dirname, '../public/creatures');

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

// Canvas size for each evolution image
const SIZE = 256;

// ─── Helper: draw glow aura behind the sprite ────────────────────────────────
function drawAura(ctx, color, alpha, radius = 90) {
  const grad = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 20, SIZE / 2, SIZE / 2, radius);
  grad.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
  grad.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

// ─── Helper: draw sparkles scattered around the canvas ───────────────────────
function drawSparkles(ctx, count = 18) {
  const colors = ['#fff', '#ffd700', '#ff69b4', '#00e5ff', '#b39ddb'];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 2 + Math.random() * 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    // 4-point star
    ctx.beginPath();
    for (let p = 0; p < 8; p++) {
      const angle = (p * Math.PI) / 4;
      const dist = p % 2 === 0 ? r : r * 0.4;
      p === 0 ? ctx.moveTo(Math.cos(angle) * dist, Math.sin(angle) * dist)
              : ctx.lineTo(Math.cos(angle) * dist, Math.sin(angle) * dist);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// ─── Helper: apply a color tint over an already-drawn sprite ─────────────────
function applyTint(ctx, r, g, b, alpha) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.restore();
}

// ─── Main loop ────────────────────────────────────────────────────────────────
for (const table of TABLES) {
  const src = join(creaturesDir, `creature_${table}.png`);
  if (!existsSync(src)) {
    console.warn(`⚠️  Skipping table ${table} — source not found`);
    continue;
  }

  const base = await loadImage(src);

  // ── Evo 2: golden glow ─────────────────────────────────────────────────────
  {
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');

    // Golden aura
    drawAura(ctx, 'rgb(255,200,0)', 0.55);

    // Draw base sprite scaled to canvas
    ctx.drawImage(base, 0, 0, SIZE, SIZE);

    // Golden tint overlay
    applyTint(ctx, 255, 180, 0, 0.28);

    // Soft outer glow ring
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    const ring = ctx.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.28, SIZE / 2, SIZE / 2, SIZE * 0.52);
    ring.addColorStop(0, 'rgba(255,215,0,0)');
    ring.addColorStop(0.7, 'rgba(255,215,0,0.45)');
    ring.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = ring;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.restore();

    writeFileSync(join(creaturesDir, `creature_${table}_evo2.png`), canvas.toBuffer('image/png'));
    console.log(`✅  creature_${table}_evo2.png`);
  }

  // ── Evo 3: rainbow shimmer + sparkles ─────────────────────────────────────
  {
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');

    // Rainbow aura (cycle hue)
    const rainbow = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 10, SIZE / 2, SIZE / 2, SIZE * 0.52);
    rainbow.addColorStop(0.0, 'rgba(255,100,200,0.5)');
    rainbow.addColorStop(0.2, 'rgba(255,215,0,0.45)');
    rainbow.addColorStop(0.4, 'rgba(0,230,118,0.45)');
    rainbow.addColorStop(0.6, 'rgba(0,200,255,0.45)');
    rainbow.addColorStop(0.8, 'rgba(170,0,255,0.45)');
    rainbow.addColorStop(1.0, 'rgba(255,100,200,0)');
    ctx.fillStyle = rainbow;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Draw base sprite
    ctx.drawImage(base, 0, 0, SIZE, SIZE);

    // Holographic tint
    applyTint(ctx, 200, 100, 255, 0.22);

    // Sparkles on top
    drawSparkles(ctx, 22);

    // Bright white edge glow
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    const edgeGrad = ctx.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.2, SIZE / 2, SIZE / 2, SIZE * 0.5);
    edgeGrad.addColorStop(0, 'rgba(255,255,255,0)');
    edgeGrad.addColorStop(0.8, 'rgba(255,255,255,0)');
    edgeGrad.addColorStop(1, 'rgba(255,255,255,0.55)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.restore();

    writeFileSync(join(creaturesDir, `creature_${table}_evo3.png`), canvas.toBuffer('image/png'));
    console.log(`✅  creature_${table}_evo3.png`);
  }
}

console.log('\n🎉 All evolution images generated in public/creatures/');
