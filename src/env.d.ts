/// <reference types="vite/client" />

declare const __SHOW_PENDING__: boolean;

interface ImportMetaEnv {
  readonly VITE_SHOPIFY_DOMAIN: string;
  readonly VITE_SHOPIFY_API_VERSION: string;
  readonly VITE_SHOPIFY_PRODUCT_HANDLE: string;
  readonly VITE_SHOPIFY_STOREFRONT_TOKEN?: string;
  readonly VITE_WHATSAPP_NUMBER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
