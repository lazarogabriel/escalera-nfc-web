// Falla si queda algún [[FALTA en los textos. Corre antes de `npm run build`.
// `npm run build:preview` no lo corre: publica con los avisos "Falta responder" visibles.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../src/content/', import.meta.url);
const found = [];

for (const file of readdirSync(dir)) {
  const lines = readFileSync(new URL(file, dir), 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith("//")) return;
    for (const m of line.matchAll(/\[\[FALTA:\s*([^\]]*)\]\]/g)) {
      found.push(`${join('src/content', file)}:${i + 1}  ${m[1]}`);
    }
  });
}

if (found.length) {
  const codes = new Set(found.map((f) => f.split(/\s{2}/)[1].split(' ')[0]));
  console.error(`check:content: quedan ${found.length} [[FALTA]] (${codes.size} preguntas: ${[...codes].join(', ')})\n`);
  console.error(found.join('\n'));
  console.error('\nResponde en PREGUNTAS-CLIENTE.md y reemplaza el texto en src/content/. Para publicar una vista previa: npm run build:preview');
  process.exit(1);
}
console.log('check:content: sin [[FALTA]].');
