// Genera las fotos de producto de cada variante de color para Shopify (Productos > Tarjetas NFC > Multimedia,
// y después asignar cada foto a sus variantes). Así el checkout muestra la tarjeta negra, la blanca o las dos.
// Uso: npm run build:photos  →  deja los archivos en dist-photos/
// Parte del mismo arte que la landing (src/assets/card/front-*.png).
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const out = new URL('../dist-photos/', import.meta.url);
mkdirSync(out, { recursive: true });

const SIZE = 2048; // cuadrada: Shopify la recorta igual en la ficha y en el checkout
const CARD = 960; // lado del arte
const BORDER = 30; // canto de acrílico alrededor del arte
const RADIUS = 0.11; // esquinas, en proporción al lado

const roundedMask = (side, r) =>
  Buffer.from(`<svg width="${side}" height="${side}"><rect width="${side}" height="${side}" rx="${r}" ry="${r}" fill="#fff"/></svg>`);

/** Una tarjeta: el arte con esquinas redondeadas sobre un canto de acrílico claro. PNG con transparencia. */
async function card(color) {
  const side = CARD + BORDER * 2;
  const art = await sharp(new URL(`../src/assets/card/front-${color}.png`, import.meta.url).pathname)
    .resize(CARD, CARD, { kernel: 'lanczos3' })
    .composite([{ input: roundedMask(CARD, CARD * RADIUS * 0.82), blend: 'dest-in' }])
    .png()
    .toBuffer();
  // Canto: degradado frío con un borde fino más oscuro, como el acrílico pulido.
  const edge = Buffer.from(`
    <svg width="${side}" height="${side}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="0.5" stop-color="#e3e9f1"/>
          <stop offset="1" stop-color="#cfd8e4"/>
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="${side - 3}" height="${side - 3}" rx="${side * RADIUS}" fill="url(#g)" stroke="#b9c4d3" stroke-width="3"/>
    </svg>`);
  return sharp(edge)
    .composite([{ input: art, left: BORDER, top: BORDER }])
    .png()
    .toBuffer();
}

/** Tarjeta girada con sombra suave debajo, lista para apoyar sobre el fondo. */
async function placed(color, angle, scale = 1) {
  const side = Math.round((CARD + BORDER * 2) * scale);
  const rotated = await sharp(await sharp(await card(color)).resize(side, side).png().toBuffer())
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const { width, height } = await sharp(rotated).metadata();
  const pad = 120;
  // Sombra: la silueta en azul noche, desenfocada y corrida hacia abajo.
  const silhouette = await sharp(rotated).extractChannel('alpha').toBuffer();
  const shadow = await sharp({ create: { width, height, channels: 3, background: '#0e1a3a' } })
    .joinChannel(silhouette)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .blur(42)
    .linear([1, 1, 1, 0.32], [0, 0, 0, 0])
    .png()
    .toBuffer();
  return sharp(shadow)
    .composite([{ input: rotated, left: pad, top: pad - 34 }])
    .png()
    .toBuffer();
}

function background() {
  return Buffer.from(`
    <svg width="${SIZE}" height="${SIZE}">
      <defs>
        <radialGradient id="bg" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="1" stop-color="#e8edf5"/>
        </radialGradient>
      </defs>
      <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
    </svg>`);
}

/** Compone las tarjetas centradas en el lienzo. Cada una: color, ángulo y desplazamiento desde el centro. */
async function photo(name, cards) {
  const layers = [];
  for (const { color, angle, dx, dy, scale } of cards) {
    const input = await placed(color, angle, scale);
    const { width, height } = await sharp(input).metadata();
    layers.push({ input, left: Math.round(SIZE / 2 - width / 2 + dx), top: Math.round(SIZE / 2 - height / 2 + dy) });
  }
  const file = new URL(`tarjeta-${name}.jpg`, out).pathname;
  const info = await sharp(background()).composite(layers).jpeg({ quality: 92, mozjpeg: true }).toFile(file);
  console.log(`dist-photos/tarjeta-${name}.jpg: ${(info.size / 1024).toFixed(0)} KB`);
}

await photo('negro', [{ color: 'negro', angle: -6, dx: 0, dy: -20, scale: 1.3 }]);
await photo('blanco', [{ color: 'blanco', angle: -6, dx: 0, dy: -20, scale: 1.3 }]);
// Mixto: la blanca atrás, girada a la izquierda; la negra adelante, girada a la derecha.
await photo('mixto', [
  { color: 'blanco', angle: -11, dx: -220, dy: -130 },
  { color: 'negro', angle: 5, dx: 170, dy: 120 },
]);
