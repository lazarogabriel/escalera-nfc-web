# Escalera NFC: landing de tarjetas NFC para reseñas

Página de compra guiada (Vite, TypeScript, Three.js, GSAP) que termina en el checkout de Shopify. Se publica en GitHub Pages.

## Correr

```bash
npm install
cp .env.example .env
npm run dev            # http://localhost:5173/escalera-nfc-web/
npx vite --host        # para abrirla desde el celular en la misma red
```

## Cambiar textos

Todo el texto está en `src/content/content.es-MX.ts` (la referencia con fuentes es `CONTENT.md`).

- Un dato pendiente se escribe `[[FALTA: CÓDIGO pregunta]]` y se ve en la página como "Falta responder".
- Las preguntas pendientes para el cliente están en `PREGUNTAS-CLIENTE.md`.
- `npm run check:content` lista los pendientes. `npm run build` falla mientras quede alguno; `npm run build:preview` construye igual, con los avisos visibles.

## Precios y packs

Salen de Shopify (Storefront API) en cada visita: si se cambia un precio o se agrega un pack en Shopify, la página lo muestra sin tocar código.

Si la API falla, se usa `public/variants.fallback.json`. Actualizarlo cada vez que cambien precios o packs:

```bash
npm run update:fallback
```

## Arte de la tarjeta

Poner el frente en `src/assets/card/front.png` (cuadrado, plano, ideal 2048 px o más) y correr:

```bash
npm run prepare:card
```

## Publicar

Cada push a `main` publica con `.github/workflows/deploy.yml`. En GitHub: Settings > Pages > Source: **GitHub Actions**.

- Hoy publica `build:preview` (con avisos). Cuando no quede ningún `[[FALTA]]`, cambiar el paso a `npm run build`.
- Dominio propio: en Settings > Pages > Custom domain, y en el build usar `VITE_BASE=/` (por ejemplo `VITE_BASE=/ npm run build`). Con GitHub Actions no hace falta un archivo `CNAME`.

## Antes de lanzar (Shopify)

- Precios finales cargados y `npm run update:fallback`.
- Shopify Payments activo, políticas creadas, pesos de las variantes corregidos, tarifas de envío.
- La tienda sin contraseña y con plan activo (los links de compra no pueden saltarse la contraseña).
