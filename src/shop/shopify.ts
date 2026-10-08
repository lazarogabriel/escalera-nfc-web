// Cliente de la Storefront API, constructor del link de compra y respaldo.
// La landing nunca calcula envíos ni recibe datos de pago: solo lee packs y arma el permalink.

const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN;
const API_VERSION = import.meta.env.VITE_SHOPIFY_API_VERSION;
const HANDLE = import.meta.env.VITE_SHOPIFY_PRODUCT_HANDLE;
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const API_TIMEOUT_MS = 6000;
const VARIANT_GID_PREFIX = 'gid://shopify/ProductVariant/';

export interface Pack {
  /** ID numérico: lo que sigue a gid://shopify/ProductVariant/ */
  variantId: string;
  /** Título de la variante tal cual ("10 tarjetas"). */
  title: string;
  /** Cantidad de tarjetas, leída del título. */
  cards: number;
  available: boolean;
  price: number;
  currency: string;
}

export type PolicyKey = 'privacyPolicy' | 'refundPolicy' | 'shippingPolicy' | 'termsOfService';

export interface Policy {
  key: PolicyKey;
  url: string;
}

export interface Catalog {
  packs: Pack[];
  /** Solo las políticas que existen en Shopify. Vacío si se usa el respaldo. */
  policies: Policy[];
  source: 'api' | 'fallback';
}

interface RawVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: string;
  currencyCode: string;
}

const QUERY = /* GraphQL */ `
  query Landing($handle: String!) {
    shop {
      privacyPolicy { url }
      refundPolicy { url }
      shippingPolicy { url }
      termsOfService { url }
    }
    product(handle: $handle) {
      variants(first: 20) {
        nodes { id title availableForSale price { amount currencyCode } }
      }
    }
  }
`;

export class CatalogError extends Error {}

export async function loadCatalog(): Promise<Catalog> {
  try {
    return await fetchFromApi();
  } catch (apiError) {
    console.warn('Storefront API falló, se usa el respaldo.', apiError);
    return fetchFallback();
  }
}

async function fetchFromApi(): Promise<Catalog> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['X-Shopify-Storefront-Access-Token'] = TOKEN;

  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: QUERY, variables: { handle: HANDLE } }),
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (!res.ok) throw new CatalogError(`HTTP ${res.status}`);

  const json = await res.json();
  if (json.errors?.length) throw new CatalogError(json.errors[0].message);
  const product = json.data?.product;
  if (!product) throw new CatalogError(`No existe el producto "${HANDLE}"`);

  const raw: RawVariant[] = product.variants.nodes.map((v: any) => ({
    id: v.id,
    title: v.title,
    availableForSale: v.availableForSale,
    price: v.price.amount,
    currencyCode: v.price.currencyCode,
  }));
  // Shopify devuelve los títulos en inglés; el texto visible sale de content.
  const policies = Object.entries(json.data.shop ?? {})
    .filter(([, policy]) => policy)
    .map(([key, policy]) => ({ key: key as PolicyKey, url: (policy as { url: string }).url }));

  return { packs: toPacks(raw), policies, source: 'api' };
}

async function fetchFallback(): Promise<Catalog> {
  // Va dentro del bundle (chunk aparte): funciona igual en GitHub Pages y en el tema de Shopify.
  const { variants } = (await import('./variants.fallback.json')).default as { variants: RawVariant[] };
  return { packs: toPacks(variants), policies: [], source: 'fallback' };
}

function toPacks(raw: RawVariant[]): Pack[] {
  const packs = raw
    .map((v): Pack | null => {
      const cards = Number(v.title.match(/\d+/)?.[0]);
      if (!cards || !v.id.startsWith(VARIANT_GID_PREFIX)) return null;
      return {
        variantId: v.id.slice(VARIANT_GID_PREFIX.length),
        title: v.title,
        cards,
        available: v.availableForSale,
        price: Number(v.price),
        currency: v.currencyCode,
      };
    })
    .filter((p): p is Pack => p !== null)
    .sort((a, b) => a.cards - b.cards);
  if (!packs.length) throw new CatalogError('No hay packs válidos');
  return packs;
}

export interface CheckoutAttributes {
  /** Texto legible de la intención ("Para mi negocio"). */
  intencion: string;
  link_google?: string;
  link_por_whatsapp?: string;
}

/**
 * Además de los atributos, arma una nota legible ("note" del cart permalink) para que el link de reseñas
 * se vea de entrada en el pedido de Shopify, sin tener que abrir el detalle de los atributos.
 */
function buildOrderNote(attributes: CheckoutAttributes): string {
  const lines = [`Uso: ${attributes.intencion}`];
  if (attributes.link_google) lines.push(`Link de reseñas: ${attributes.link_google}`);
  if (attributes.link_por_whatsapp) lines.push('No puso link: escribirle por WhatsApp para saber qué link va en cada tarjeta.');
  return lines.join('\n');
}

/** Cart permalink: https://{dominio}/cart/{variantId}:{cantidad}?attributes[clave]=valor&note=... */
export function buildCheckoutUrl(pack: Pack, quantity: number, attributes: CheckoutAttributes): string {
  const params = Object.entries(attributes)
    .filter(([, value]) => value)
    .map(([key, value]) => `attributes[${key}]=${encodeURIComponent(value!)}`);
  params.push(`note=${encodeURIComponent(buildOrderNote(attributes))}`);
  return `https://${DOMAIN}/cart/${pack.variantId}:${quantity}?${params.join('&')}`;
}

export function pricePerCard(pack: Pack): number {
  return Math.round((pack.price / pack.cards) * 100) / 100;
}

/** true si cada pack más grande disponible cuesta menos por tarjeta que el anterior. */
export function hasVolumeDiscount(packs: Pack[]): boolean {
  const perCard = packs.filter((p) => p.available).map(pricePerCard);
  return perCard.length > 1 && perCard.every((v, i) => i === 0 || v < perCard[i - 1]);
}
