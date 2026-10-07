// Prepara el arte del frente para la tarjeta 3D y la imagen fija.
// Uso: npm run prepare:card -- [origen] [x y lado]
// Por defecto toma src/assets/card/front.png completo (arte plano y cuadrado, sin márgenes).
// Si el origen es una foto, pasar el recorte de la tarjeta: x, y y lado en píxeles.
import sharp from 'sharp';

const [src = 'src/assets/card/front.png', x, y, side] = process.argv.slice(2);
const meta = await sharp(src).metadata();
const crop = side
  ? { left: Number(x), top: Number(y), width: Number(side), height: Number(side) }
  : { left: 0, top: 0, width: Math.min(meta.width, meta.height), height: Math.min(meta.width, meta.height) };

// 2048 para pantallas de alta densidad, 1024 para equipos flojos y para la imagen fija.
for (const size of [2048, 1024]) {
  const info = await sharp(src)
    .extract(crop)
    .flatten({ background: '#ffffff' })
    .resize(size, size, { kernel: 'lanczos3' })
    .webp({ quality: 88, effort: 6 })
    .toFile(`src/assets/card/card-front-${size}.webp`);
  console.log(`card-front-${size}.webp: ${(info.size / 1024).toFixed(1)} KB`);
}
