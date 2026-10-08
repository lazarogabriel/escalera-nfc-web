// Arma un tema de Shopify con la landing y lo comprime en escalera-nfc-tema.zip, listo para subir en
// Tienda online > Temas > Agregar tema > Subir archivo .zip.
// Uso: npm run build:shopify            (con avisos "Falta responder" visibles, como GitHub Pages)
//      npm run build:shopify -- --final  (falla si queda algún [[FALTA]])
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const dist = `${root}dist-shopify/`;
const theme = `${root}dist-shopify-theme/`;
const zipName = 'escalera-nfc-tema.zip';
const final = process.argv.includes('--final');

const run = (cmd, args, env = {}) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });

// 1. Build con rutas relativas: Shopify sirve todos los archivos del tema desde una sola carpeta assets/ de su CDN.
if (final) run('npm', ['run', 'check:content']);
run('npx', ['tsc', '--noEmit']);
run('npx', ['vite', 'build', '--mode', final ? 'production' : 'preview', '--outDir', 'dist-shopify', '--emptyOutDir'], {
  VITE_BASE: './',
});

// 2. Del index.html de Vite salen el <head> y el <body>; las rutas ./assets/x pasan a la URL del CDN de Shopify.
// Sin el ?v= que agrega asset_url: los chunks importan index.js sin query y, si no coincide, el navegador
// lo carga dos veces y la app se monta duplicada. Los nombres con hash de Vite ya invalidan la caché.
const html = readFileSync(`${dist}index.html`, 'utf8');
const assetUrl = (file) => `{{ '${file}' | asset_url | split: '?' | first }}`;
const toLiquid = (s) =>
  s.replace(/(?:\.\/|\/)assets\/([\w.-]+)/g, (_, file) => assetUrl(file)).replace(/(?:\.\/|\/)favicon\.svg/g, assetUrl('favicon.svg'));
const head = toLiquid(html.match(/<head>([\s\S]*)<\/head>/)[1]).trim();
const body = toLiquid(html.match(/<body>([\s\S]*)<\/body>/)[1]).trim();

// 3. Tema mínimo (shopify.dev/docs/storefronts/themes/architecture).
rmSync(theme, { recursive: true, force: true });
for (const dir of ['assets', 'config', 'layout', 'locales', 'templates']) mkdirSync(`${theme}${dir}`, { recursive: true });

cpSync(`${dist}assets`, `${theme}assets`, { recursive: true });
for (const file of readdirSync(dist)) {
  if (file !== 'index.html' && file !== 'assets') cpSync(`${dist}${file}`, `${theme}assets/${file}`, { recursive: true });
}

// Página de inicio: la landing completa. Sin layout para que no cargue nada más que la app.
writeFileSync(
  `${theme}templates/index.liquid`,
  `{% layout none %}
<!doctype html>
<html lang="es-MX" data-step="entrada">
  <head>
    ${head}
    {{ content_for_header }}
  </head>
  <body>
    ${body}
  </body>
</html>
`,
);

// Cualquier otra página de la tienda (producto, colección, carrito, 404...) vuelve a la landing.
// El checkout no usa el tema: los links /cart/... siguen yendo directo al pago.
writeFileSync(
  `${theme}layout/theme.liquid`,
  `<!doctype html>
<html lang="es-MX">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0; url={{ routes.root_url }}" />
    <title>{{ shop.name }}</title>
    {{ content_for_header }}
  </head>
  <body>
    {{ content_for_layout }}
    <p><a href="{{ routes.root_url }}">Ir a {{ shop.name }}</a></p>
  </body>
</html>
`,
);
for (const name of ['404', 'product', 'collection', 'list-collections', 'cart', 'page', 'search', 'blog', 'article']) {
  writeFileSync(`${theme}templates/${name}.liquid`, '');
}

// Página de contraseña (mientras la tienda esté cerrada): sin redirección, para no entrar en bucle.
writeFileSync(
  `${theme}templates/password.liquid`,
  `{% layout none %}
<!doctype html>
<html lang="es-MX">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ shop.name }}</title>
    {{ content_for_header }}
    <style>
      body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #0a1638; color: #fff; }
      form { display: grid; gap: 0.75rem; width: min(320px, 90vw); }
      input, button { font: inherit; padding: 0.75rem; border-radius: 10px; border: 0; }
      button { background: #2b5bea; color: #fff; font-weight: 700; }
    </style>
  </head>
  <body>
    {% form 'storefront_password' %}
      <h1>{{ shop.name }}</h1>
      <p>Muy pronto.</p>
      {{ form.errors | default_errors }}
      <input type="password" name="password" placeholder="Contraseña" aria-label="Contraseña" />
      <button type="submit">Entrar</button>
    {% endform %}
  </body>
</html>
`,
);

writeFileSync(
  `${theme}config/settings_schema.json`,
  JSON.stringify(
    [
      {
        name: 'theme_info',
        theme_name: 'Escalera NFC',
        theme_version: JSON.parse(readFileSync(`${root}package.json`, 'utf8')).version,
        theme_author: 'Escalera NFC',
        theme_documentation_url: 'https://github.com/lazarogabriel/escalera-nfc-web',
        theme_support_url: 'https://github.com/lazarogabriel/escalera-nfc-web',
      },
    ],
    null,
    2,
  ) + '\n',
);
writeFileSync(`${theme}locales/es.default.json`, '{}\n');

// 4. Zip con las carpetas en la raíz (Shopify rechaza un zip con una carpeta envolvente).
if (existsSync(`${root}${zipName}`)) rmSync(`${root}${zipName}`);
execFileSync('zip', ['-r', '-q', `${root}${zipName}`, '.'], { cwd: theme });
console.log(`\nListo: ${zipName}${final ? '' : ' (vista previa, con avisos "Falta responder")'}`);
console.log('Súbelo en Shopify: Tienda online > Temas > Agregar tema > Subir archivo .zip');
