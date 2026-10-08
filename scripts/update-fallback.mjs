// Regenera src/shop/variants.fallback.json desde la Storefront API.
// Uso: npm run update:fallback (lee .env)
import { readFileSync, writeFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => /^\w+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);
const { VITE_SHOPIFY_DOMAIN: domain, VITE_SHOPIFY_API_VERSION: version, VITE_SHOPIFY_PRODUCT_HANDLE: handle } = env;

const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `query($h: String!) { product(handle: $h) { variants(first: 20) { nodes { id title availableForSale price { amount currencyCode } selectedOptions { name value } } } } }`,
    variables: { h: handle },
  }),
});
const json = await res.json();
const nodes = json.data?.product?.variants.nodes;
if (!nodes) {
  console.error('No se pudo leer el producto:', JSON.stringify(json.errors ?? json));
  process.exit(1);
}

const out = {
  actualizado: new Date().toISOString().slice(0, 10),
  nota: 'Respaldo si falla la Storefront API. Regenerar con npm run update:fallback cada vez que cambie un precio o un pack.',
  variants: nodes.map((v) => ({
    id: v.id,
    title: v.title,
    availableForSale: v.availableForSale,
    price: v.price.amount,
    currencyCode: v.price.currencyCode,
    selectedOptions: v.selectedOptions,
  })),
};
writeFileSync(new URL('../src/shop/variants.fallback.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`variants.fallback.json: ${out.variants.length} packs (${out.variants.map((v) => `${v.title} $${v.price}`).join(', ')})`);
