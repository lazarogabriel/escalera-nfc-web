import { defineConfig } from 'vite';

// Página de proyecto en GitHub Pages: https://<usuario>.github.io/escalera-nfc-web/
// Con dominio propio, cambiar VITE_BASE a "/".
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE ?? '/escalera-nfc-web/',
  define: {
    __SHOW_PENDING__: JSON.stringify(mode !== 'production'),
  },
  build: {
    target: 'es2022',
    // three.js + GSAP van en un chunk aparte (~175 KB gzip) que se carga después del primer contenido visible.
    chunkSizeWarningLimit: 700,
  },
}));
