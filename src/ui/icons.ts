// Íconos de trazo propios (24 × 24). Se insertan como SVG en línea, decorativos (aria-hidden).

const PATHS = {
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  truck: '<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 10h4l3 3.2v3.3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  nfc: '<path d="M7 8.5a5 5 0 0 1 0 7"/><path d="M10.5 6a8.5 8.5 0 0 1 0 12"/><path d="M14 3.5a12 12 0 0 1 0 17"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 0 1-13.2 4.9"/><path d="M4.5 12a7.5 7.5 0 0 1 13.2-4.9"/><path d="M18 3.5v3.8h-3.8"/><path d="M6 20.5v-3.8h3.8"/>',
  store: '<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 12v8h13v-8"/><path d="M10 20v-4.5h4V20"/>',
  buildings: '<path d="M3.5 20.5h17"/><path d="M5 20.5V6l7-2.5v17"/><path d="M12 9.5l7 2.5v8.5"/><path d="M8 9h1M8 12.5h1M8 16h1M15.5 15h1"/>',
  box: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5"/><path d="M12 12v9"/>',
  chat: '<path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.4A7.5 7.5 0 1 1 20 11.5z"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  back: '<path d="M14.5 6 8.5 12l6 6"/>',
  help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.8 9.5a2.3 2.3 0 1 1 3.2 2.1c-.6.3-1 .8-1 1.4v.5"/><path d="M12 16.5h.01"/>',
  check: '<path d="m5.5 12.5 4 4 9-9"/>',
  minus: '<path d="M6 12h12"/>',
  plus: '<path d="M6 12h12M12 6v12"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
} as const;

export type IconName = keyof typeof PATHS;

// Íconos de redes, de relleno y monocromáticos (24 × 24), dibujados para este sitio.
const SOCIAL = {
  whatsapp:
    '<path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.8L2.4 21.6l4.8-1.3A9.7 9.7 0 1 0 12 2.2zm0 1.8a7.9 7.9 0 1 1-4.1 14.7l-.3-.2-2.8.8.8-2.7-.2-.3A7.9 7.9 0 0 1 12 4z"/><path d="M8.9 7.3c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.1.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.3-.8-.7-1.3-1.5-1.4-1.8-.2-.3 0-.4.1-.5l.4-.4.3-.4v-.5l-.8-2z"/>',
  mail: '<path d="M4 4.5h16A2.5 2.5 0 0 1 22.5 7v10a2.5 2.5 0 0 1-2.5 2.5H4A2.5 2.5 0 0 1 1.5 17V7A2.5 2.5 0 0 1 4 4.5zm.3 2 7.7 5.6 7.7-5.6H4.3zM3.5 8.3V17c0 .3.2.5.5.5h16c.3 0 .5-.2.5-.5V8.3l-7.9 5.8a1 1 0 0 1-1.2 0L3.5 8.3z"/>',
  instagram:
    '<path d="M7.6 2h8.8A5.6 5.6 0 0 1 22 7.6v8.8a5.6 5.6 0 0 1-5.6 5.6H7.6A5.6 5.6 0 0 1 2 16.4V7.6A5.6 5.6 0 0 1 7.6 2zm0 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/>',
  tiktok:
    '<path d="M13.2 2h3.2a4.9 4.9 0 0 0 4.4 4.6v3.3a8 8 0 0 1-4.4-1.4v6.6a6.3 6.3 0 1 1-6.3-6.3c.3 0 .7 0 1 .1v3.4a3 3 0 1 0 2.1 2.8V2z"/>',
} as const;

export type SocialName = keyof typeof SOCIAL;

export function socialIcon(name: SocialName): SVGSVGElement {
  const wrapper = document.createElement('span');
  wrapper.innerHTML = `<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">${SOCIAL[name]}</svg>`;
  return wrapper.firstElementChild as SVGSVGElement;
}

export function icon(name: IconName, className = 'icon'): SVGSVGElement {
  const wrapper = document.createElement('span');
  wrapper.innerHTML = `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
  return wrapper.firstElementChild as SVGSVGElement;
}

/** Logotipo: tres peldaños (escalera) con ondas NFC, y el nombre. */
export function logo(): HTMLElement {
  const el = document.createElement('span');
  el.className = 'logo';
  // Monocromático: toma el color del texto (currentColor).
  el.innerHTML = `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false" fill="currentColor">
    <rect x="2" y="20" width="9" height="9" rx="2.2" opacity=".55"/>
    <rect x="11.5" y="13" width="9" height="16" rx="2.2" opacity=".78"/>
    <rect x="21" y="6" width="9" height="23" rx="2.2"/>
    <path d="M5 6.5a5 5 0 0 1 0 7M8.5 4a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".55"/>
  </svg><span class="logo-word">Escalera<b>NFC</b></span>`;
  return el;
}
