// Prepara el arte de cada color para la tarjeta 3D, la imagen fija y las miniaturas.
// Uso: npm run prepare:card
// Toma src/assets/card/front-negro.png y front-blanco.png (arte plano y cuadrado, sin márgenes),
// que salen del PDF del proveedor con scripts/render-card-pdf.swift.
import sharp from 'sharp';

// 2048 para pantallas de alta densidad, 1024 para equipos flojos y la imagen fija, 256 para miniaturas.
for (const color of ['negro', 'blanco']) {
  const src = `src/assets/card/front-${color}.png`;
  for (const size of [2048, 1024, 256]) {
    const info = await sharp(src)
      .flatten({ background: '#ffffff' })
      .resize(size, size, { kernel: 'lanczos3' })
      .webp({ quality: size === 256 ? 82 : 88, effort: 6 })
      .toFile(`src/assets/card/card-${color}-${size}.webp`);
    console.log(`card-${color}-${size}.webp: ${(info.size / 1024).toFixed(1)} KB`);
  }
}
