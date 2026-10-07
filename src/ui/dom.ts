// Ayudas mínimas de DOM. Sin framework: la página tiene cinco pasos y un panel.

type Child = Node | string | null | undefined | false;
type Attrs = Record<string, string | number | boolean | EventListener | undefined>;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value === true) el.setAttribute(key, '');
    else el.setAttribute(key, String(value));
  }
  for (const child of children) if (child) el.append(child);
  return el;
}

const PENDING = /\[\[FALTA:\s*([A-Z]+\d*[a-z]?|[\w:-]+)\s+([^\]]*)\]\]/g;

/**
 * Texto con avisos: [[FALTA: EN6 pregunta]] se vuelve un aviso visible "Falta responder: pregunta (EN6)".
 * En producción no llega a renderizarse: check:content frena el build antes.
 */
export function text(source: string, pendingLabel: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  let last = 0;
  for (const match of source.matchAll(PENDING)) {
    const before = source.slice(last, match.index).trimEnd();
    if (before) frag.append(before + ' ');
    if (__SHOW_PENDING__) {
      frag.append(h('span', { class: 'pending', 'data-code': match[1] }, `${pendingLabel}: ${match[2]} (${match[1]})`), ' ');
    }
    last = match.index! + match[0].length;
  }
  const rest = source.slice(last).trim();
  if (rest) frag.append(rest);
  return frag;
}

export function hasPending(source: string): boolean {
  return source.includes('[[FALTA');
}
