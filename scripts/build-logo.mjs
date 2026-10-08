// Genera los PNG del logo para el checkout de Shopify (Configuración > Pagos y envío > Checkout >
// Personalizar > Marca > Logo), a partir del mismo logo que usa la landing (src/ui/icons.ts).
// Uso: npm run build:logo  →  deja los archivos en dist-logo/
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const out = new URL('../dist-logo/', import.meta.url);
mkdirSync(out, { recursive: true });

const MARK = `
  <rect x="2" y="20" width="9" height="9" rx="2.2" opacity=".55"/>
  <rect x="11.5" y="13" width="9" height="16" rx="2.2" opacity=".78"/>
  <rect x="21" y="6" width="9" height="23" rx="2.2"/>
  <path d="M5 6.5a5 5 0 0 1 0 7M8.5 4a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".55"/>
`;

// Lockup horizontal: marca + "Escalera NFC", igual que el encabezado de la página.
// El viewBox es ancho a propósito (sobra espacio) y sharp lo recorta (trim) al contenido real,
// así no depende de calcular a mano el ancho del texto.
const lockup = (color, muted) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220">
  <g transform="translate(10 60) scale(2.6)" fill="${color}" color="${color}">${MARK}</g>
  <text x="110" y="148" font-family="Arial, Helvetica, sans-serif" font-size="92" font-weight="800" letter-spacing="-2" fill="${color}">Escalera<tspan font-weight="500" fill="${muted}" dx="22">NFC</tspan></text>
</svg>`;

// Solo la marca (peldaños + NFC), para usarla como ícono cuadrado si hace falta.
const mark = (color) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="256" height="256">
  <g fill="${color}" color="${color}">${MARK}</g>
</svg>`;

const files = {
  // Para fondo claro (el checkout de Shopify es blanco por defecto): texto azul marino, "NFC" en gris azulado.
  'escalera-nfc-logo-checkout.png': lockup('#0e1726', '#55607a'),
  // Para fondo oscuro, si en Marca del checkout se elige un fondo oscuro: logo en blanco.
  'escalera-nfc-logo-checkout-fondo-oscuro.png': lockup('#ffffff', 'rgba(255,255,255,.7)'),
  // Ícono cuadrado (marca sin texto), por si se pide un logo cuadrado o un ícono aparte.
  'escalera-nfc-icono-cuadrado.png': mark('#2b5bea'),
};

const PAD = { top: 40, bottom: 40, left: 40, right: 40 };
for (const [name, svg] of Object.entries(files)) {
  const isLockup = svg.includes('viewBox="0 0 900');
  await sharp(Buffer.from(svg), { density: isLockup ? 400 : 600 })
    .trim({ threshold: 5 })
    .extend({ ...PAD, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: isLockup ? 1600 : 512 })
    .png({ compressionLevel: 9 })
    .toFile(new URL(name, out).pathname);
  console.log(`dist-logo/${name}`);
}

// Versión JPG (sin transparencia, fondo blanco) por si Shopify pide ese formato en algún lado.
await sharp(Buffer.from(lockup('#0e1726', '#55607a')), { density: 400 })
  .trim({ threshold: 5 })
  .extend({ ...PAD, background: '#ffffff' })
  .resize({ width: 1600 })
  .flatten({ background: '#ffffff' })
  .jpeg({ quality: 95 })
  .toFile(new URL('escalera-nfc-logo-checkout.jpg', out).pathname);
console.log('dist-logo/escalera-nfc-logo-checkout.jpg');
