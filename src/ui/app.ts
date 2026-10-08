// Encabezado, pasos del flujo, barra de compra y panel de ayuda.

import { content as c, fill } from '../content/content.es-MX';
import {
  buildCheckoutUrl,
  CARD_COLORS,
  hasVolumeDiscount,
  pricePerCard,
  type CardColor,
  type Catalog,
  type CheckoutLine,
  type PackColor,
} from '../shop/shopify';
import { stepsFor, totalCount, validateGoogleLink, type Flow, type FlowState, type Intent, type Step } from '../state/flow';
import type { CardStage } from '../three/stage';
import negroThumb from '../assets/card/card-negro-256.webp';
import blancoThumb from '../assets/card/card-blanco-256.webp';
import negroStill from '../assets/card/card-negro-1024.webp';
import blancoStill from '../assets/card/card-blanco-1024.webp';
import payVisa from '../assets/pay/visa.svg';
import payMaster from '../assets/pay/master.svg';
import payAmex from '../assets/pay/american_express.svg';
import payApple from '../assets/pay/apple_pay.svg';
import payGoogle from '../assets/pay/google_pay.svg';

// Íconos oficiales de Shopify (activemerchant/payment_icons).
const PAY_ICONS: Record<string, string> = {
  Visa: payVisa,
  Mastercard: payMaster,
  'American Express': payAmex,
  'Apple Pay': payApple,
  'Google Pay': payGoogle,
};
import { h, text } from './dom';
import { cardsLabel, money } from './format';
import { icon, logo, socialIcon, type IconName, type SocialName } from './icons';

const t = (s: string) => text(s, c.pending.label);
const WHATSAPP_URL = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(c.help.whatsappMessage)}`;
const EXTERNAL = { target: '_blank', rel: 'noopener' };

const INTENT_ICONS: Record<Intent, IconName> = { negocio: 'store', reventa: 'box' };
const MAX_NEGOCIO = 3;
const THUMBS: Record<CardColor, string> = { negro: negroThumb, blanco: blancoThumb };
const STILLS: Record<CardColor, string> = { negro: negroStill, blanco: blancoStill };
const PACK_COLORS: PackColor[] = ['negro', 'blanco', 'mixto'];
const other = (color: CardColor): CardColor => (color === 'negro' ? 'blanco' : 'negro');

/** Lo que se va a comprar: negocio lleva tarjetas sueltas de cada color; reventa, un pack. */
interface Order {
  lines: CheckoutLine[];
  /** Tarjetas de cada color. */
  counts: Record<CardColor, number>;
  cards: number;
  total: number;
  available: boolean;
}

/** Pack mixto: de a 1 en los packs chicos y de a 5 en los grandes. Nunca todas de un color. */
const mixStep = (size: number) => (size <= 30 ? 1 : 5);
function clampMix(size: number, negras: number): number {
  const step = mixStep(size);
  return Math.min(size - step, Math.max(step, Math.round(negras / step) * step));
}

export interface AppDeps {
  root: HTMLElement;
  header: HTMLElement;
  /** Vitrina de la tarjeta: ahí va el selector de color. */
  showcase: HTMLElement;
  flow: Flow;
  catalog: () => Promise<Catalog>;
  stage: () => CardStage | null;
}

type CatalogState = { status: 'loading' } | { status: 'ready'; catalog: Catalog } | { status: 'failed' };

interface PrimaryAction {
  label: string;
  run: () => void;
  disabled?: boolean;
}

const isNode = (n: Node | null): n is Node => n !== null;

export function mountApp({ root, header, showcase, flow, catalog: loadCatalog, stage }: AppDeps) {
  let catalogState: CatalogState = { status: 'loading' };
  let error = '';
  let paying = false;

  const main = h('main', { id: 'flujo', tabindex: -1 });
  const barInfo = h('div', { class: 'bar-info', 'aria-live': 'polite' });
  const barButton = h('button', { type: 'button', class: 'primary' });
  const bar = h('div', { class: 'bar', role: 'region', 'aria-label': 'Tu pedido' }, barInfo, barButton);
  const helpDialog = renderHelp();

  header.append(
    h('a', { class: 'logo-link', href: '#/', 'aria-label': c.brand }, logo()),
  );
  root.append(main, bar, renderFooter());
  const colorSwitch = renderColorSwitch();
  showcase.append(colorSwitch);
  const still = showcase.querySelector<HTMLImageElement>('.card-still');

  // Móvil: al bajar, la vitrina fija se achica para dejar lugar a la compra sin dejar de mostrar la tarjeta.
  const onScroll = () => document.documentElement.classList.toggle('compact', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });

  document.body.append(helpDialog);

  let primary: PrimaryAction = { label: c.actions.buy, run: () => flow.next() };
  barButton.addEventListener('click', () => !barButton.disabled && primary.run());

  async function fetchCatalog() {
    catalogState = { status: 'loading' };
    render(flow.state);
    try {
      catalogState = { status: 'ready', catalog: await loadCatalog() };
    } catch {
      catalogState = { status: 'failed' };
    }
    render(flow.state);
  }

  const packs = () => (catalogState.status === 'ready' ? catalogState.catalog.packs : []);
  const variant = (cards: number, color: PackColor) => packs().find((p) => p.cards === cards && p.color === color) ?? null;
  const singles = () => packs().filter((p) => p.cards === 1 && p.color !== 'mixto');
  const resalePacks = () => packs().filter((p) => p.cards > 1);
  const resaleSizes = () => [...new Set(resalePacks().map((p) => p.cards))].sort((a, b) => a - b);
  const hasMix = () => resalePacks().some((p) => p.color === 'mixto');
  const cardsText = (n: number) => cardsLabel(n, c.quantity.oneCard, c.quantity.cards);
  const totalText = (amount: number) => fill(c.quantity.total, { total: money(amount) });

  /** "2 negras y 1 blanca", "3 negras". */
  function colorsText(counts: Record<CardColor, number>): string {
    const parts = CARD_COLORS.filter((color) => counts[color] > 0).map((color) =>
      cardsLabel(counts[color], c.colors.one[color], c.colors.many[color]).replace('{n}', String(counts[color])),
    );
    return parts.length === 2 ? fill(c.colors.and, { a: parts[0], b: parts[1] }) : (parts[0] ?? '');
  }

  /** Tarjetas de cada color en un pack de reventa. */
  function packCounts(size: number, color: PackColor, mixNegras: number): Record<CardColor, number> {
    const negras = color === 'negro' ? size : color === 'mixto' ? clampMix(size, mixNegras) : 0;
    return { negro: negras, blanco: size - negras };
  }

  function orderOf(s: FlowState): Order | null {
    if (s.intent === 'negocio') {
      const lines = CARD_COLORS.filter((color) => s.counts[color] > 0).map((color) => ({ pack: variant(1, color), quantity: s.counts[color] }));
      if (!lines.length || lines.some((l) => !l.pack)) return null;
      const ready = lines as CheckoutLine[];
      return {
        lines: ready,
        counts: s.counts,
        cards: totalCount(s.counts),
        total: ready.reduce((sum, l) => sum + l.pack.price * l.quantity, 0),
        available: ready.every((l) => l.pack.available),
      };
    }
    if (!s.packSize || !s.packColor) return null;
    const pack = variant(s.packSize, s.packColor);
    if (!pack) return null;
    return {
      lines: [{ pack, quantity: 1 }],
      counts: packCounts(s.packSize, s.packColor, s.mixNegras),
      cards: pack.cards,
      total: pack.price,
      available: pack.available,
    };
  }

  /** Texto corto del pedido: "2 negras y 1 blanca" o "Pack de 30: 15 negras y 15 blancas". */
  function orderText(s: FlowState, order: Order): string {
    if (s.intent === 'negocio') return colorsText(order.counts);
    return fill(c.summary.pack[s.packColor!], { n: order.cards, mezcla: colorsText(order.counts) });
  }

  /** Color de la tarjeta de arriba: el que está mirando, si está en el pedido. */
  function topColor(s: FlowState, order: Order | null): CardColor {
    if (!order || s.step === 'entrada' || s.step === 'intencion') return s.preview;
    return order.counts[s.preview] > 0 ? s.preview : other(s.preview);
  }

  /** Lleva el pedido a la tarjeta 3D (o a la imagen fija si no hay 3D). */
  function syncShowcase(s: FlowState) {
    const order = orderOf(s);
    const top = topColor(s, order);
    stage()?.setStep(s.step);
    stage()?.setStack(order ? order.counts : { negro: 0, blanco: 0, [top]: 1 });
    stage()?.setColor(top);
    if (still && !still.src.endsWith(STILLS[top])) still.src = STILLS[top];
    colorSwitch.querySelectorAll<HTMLInputElement>('input').forEach((input) => (input.checked = input.value === s.preview));
  }

  function render(s: FlowState) {
    document.documentElement.dataset.step = s.step;
    // Re-render completo: se conserva el foco (por ejemplo, al moverse con flechas entre opciones).
    const active = document.activeElement as HTMLInputElement | null;
    const focusKey =
      active && main.contains(active)
        ? active.id
          ? `#${active.id}`
          : active.name
            ? `input[name="${active.name}"][value="${active.value}"]`
            : null
        : null;
    main.replaceChildren(...view(s).filter(isNode));
    if (focusKey) main.querySelector<HTMLElement>(focusKey)?.focus({ preventScroll: true });
    renderBar(s);
    syncShowcase(s);
  }

  function view(s: FlowState): (Node | null)[] {
    switch (s.step) {
      case 'entrada':
        return entry();
      case 'intencion':
        return intent(s);
      case 'cantidad':
        return quantity(s);
      case 'personaliza':
        return personalize(s);
      case 'resumen':
        return summary(s);
    }
  }

  // Entrada: ficha de producto.

  function resaleFrom(): number | undefined {
    return resalePacks()
      .filter((p) => p.available)
      .map(pricePerCard)
      .sort((a, b) => a - b)[0];
  }

  /** Precio de una tarjeta suelta: el más bajo entre los colores (deberían costar lo mismo). */
  function singlePrice(): number | undefined {
    return singles()
      .map((p) => p.price)
      .sort((a, b) => a - b)[0];
  }

  function entryPrice(): string | null {
    const single = singlePrice();
    if (single !== undefined) return fill(c.entry.price, { precio: money(single) });
    const from = resaleFrom();
    return from !== undefined ? fill(c.entry.resaleFrom, { desde: money(from) }) : null;
  }

  function entry() {
    primary = { label: c.actions.buy, run: () => flow.next() };
    const price = entryPrice();
    const from = resaleFrom();
    const anyAvailable = packs().some((p) => p.available);
    return [
      h('h1', {}, c.entry.title),
      h('p', { class: 'lead' }, c.entry.lead),
      h('p', { class: 'note' }, c.entry.size),
      h('p', { class: 'colors-line' }, h('span', { class: 'dots', 'aria-hidden': 'true' }, swatch('negro'), swatch('blanco')), c.entry.colors),
      catalogState.status === 'ready'
        ? h(
            'div',
            { class: 'price-line' },
            price ? h('p', { class: 'price money' }, price) : null,
            h('span', { class: `stock ${anyAvailable ? 'in' : 'out'}` }, anyAvailable ? c.entry.available : c.entry.soldOut),
          )
        : null,
      singles().length && from !== undefined ? h('p', { class: 'note money' }, fill(c.entry.resaleFrom, { desde: money(from) })) : null,
      h('p', { class: 'free-shipping' }, icon('truck'), c.entry.freeShipping),
      h('p', { class: 'note' }, t(c.entry.priceNote)),
      catalogNotice(),
      h(
        'ul',
        { class: 'trust' },
        ...c.entry.trust.map((item) =>
          h('li', 'highlight' in item ? { class: 'highlight' } : {}, icon(item.icon), h('span', {}, item.text)),
        ),
      ),
      h('h2', {}, c.entry.stepsTitle),
      h('ol', { class: 'sequence' }, ...c.entry.steps.map((step) => h('li', {}, h('span', {}, step)))),
    ];
  }

  // Para qué la quieres

  function intent(s: FlowState) {
    primary = { label: c.actions.chooseQuantity, run: () => advance(flow.state.intent !== null, c.intent.errorEmpty) };
    const options = (Object.keys(c.intent.options) as Intent[]).map((key) =>
      option({
        name: 'intencion',
        value: key,
        checked: s.intent === key,
        icon: INTENT_ICONS[key],
        label: c.intent.options[key].label,
        detail: c.intent.options[key].description,
        onSelect: () => flow.update({ intent: key }),
      }),
    );
    return [
      titleWithBack(c.intent.title),
      h('fieldset', { class: 'choices' }, h('legend', { class: 'sr-only' }, c.intent.title), ...options),
      errorLine(),
    ];
  }

  // Cantidad

  function quantity(s: FlowState) {
    return [
      titleWithBack(c.quantity.title),
      h('p', { class: 'lead' }, c.quantity.lead[s.intent!]),
      catalogNotice(),
      ...(s.intent === 'negocio' ? singleCards(s) : resale(s)),
      h('p', { class: 'note' }, t(c.quantity.priceNote)),
      errorLine(),
    ];
  }

  /** Negocio: un contador por color, con miniatura. El total de las dos no pasa de MAX_NEGOCIO. */
  function singleCards(s: FlowState): (Node | null)[] {
    primary = { label: c.actions.addLink, run: () => advance(orderOf(flow.state)?.available === true, c.states.allSoldOut) };
    if (catalogState.status !== 'ready') return [];
    if (!singles().some((p) => p.available)) return [h('p', { class: 'notice', role: 'alert' }, c.states.allSoldOut)];
    const total = totalCount(s.counts);
    const order = orderOf(s);
    const setCount = (color: CardColor, n: number) => {
      const counts = { ...s.counts, [color]: n };
      if (totalCount(counts) < 1 || totalCount(counts) > MAX_NEGOCIO || n < 0) return;
      // Al sumar se muestra ese color arriba; al quitar el último de un color, se ve el otro.
      flow.update({ counts, preview: n > 0 ? color : other(color) });
    };
    const rows = CARD_COLORS.map((color) => {
      const pack = variant(1, color);
      const usable = pack?.available === true;
      const q = s.counts[color];
      return h(
        'div',
        { class: `color-row${q > 0 && s.preview === color ? ' is-top' : ''}${usable ? '' : ' is-out'}` },
        h(
          'button',
          {
            type: 'button',
            class: 'color-peek',
            'aria-label': c.colors.names[color],
            'aria-pressed': String(s.preview === color),
            onClick: () => flow.update({ preview: color }),
          },
          h('img', { src: THUMBS[color], alt: '', width: 56, height: 56 }),
        ),
        h(
          'div',
          { class: 'color-row-name' },
          h('strong', {}, c.colors.names[color]),
          h('span', { class: 'note money' }, usable ? fill(c.quantity.unitPrice, { precio: money(pack.price) }) : c.quantity.colorSoldOut),
        ),
        h(
          'div',
          { class: 'stepper', role: 'group', 'aria-label': c.colors.names[color] },
          h('button', {
            type: 'button',
            id: `menos-${color}`,
            class: 'stepper-btn',
            'aria-label': c.quantity.less[color],
            disabled: q <= 0 || total <= 1,
            onClick: () => setCount(color, q - 1),
          }, icon('minus')),
          h('output', { class: 'stepper-value', 'aria-live': 'polite' }, String(q)),
          h('button', {
            type: 'button',
            id: `mas-${color}`,
            class: 'stepper-btn',
            'aria-label': c.quantity.more[color],
            disabled: !usable || total >= MAX_NEGOCIO,
            onClick: () => setCount(color, q + 1),
          }, icon('plus')),
        ),
      );
    });
    return [
      h(
        'div',
        { class: 'color-rows' },
        ...rows,
        h(
          'div',
          { class: 'color-rows-total' },
          h('span', {}, cardsText(total)),
          order ? h('strong', { class: 'stepper-total money' }, totalText(order.total)) : null,
        ),
      ),
      h('p', { class: 'note' }, c.quantity.maxNote),
    ];
  }

  /** Reventa: tamaño del pack, color (negras, blancas o mixto) y, si es mixto, cuántas negras. */
  function resale(s: FlowState): (Node | null)[] {
    const sizes = resaleSizes();
    primary = {
      label: c.actions.review,
      run: () => {
        const st = flow.state;
        if (!st.packSize) return advance(false, c.quantity.errorEmpty);
        if (!st.packColor) return advance(false, c.quantity.errorColor);
        advance(orderOf(st)?.available === true, c.summary.soldOut);
      },
    };
    const { min, max } = c.quantity.resaleRange;
    // Cada tamaño se muestra con el precio del color elegido (o el que esté mirando).
    const shownColor = s.packColor ?? s.preview;
    const packOf = (size: number) =>
      variant(size, shownColor) ?? resalePacks().find((p) => p.cards === size && p.available) ?? resalePacks().find((p) => p.cards === size)!;
    const shownPacks = sizes.map(packOf);
    const selectSize = (size: number) => {
      const color = s.packColor ?? s.preview;
      flow.update({ packSize: size, packColor: color, mixNegras: clampMix(size, s.mixNegras || size / 2) });
    };
    const tiles = shownPacks.map((p) => {
      const available = resalePacks().some((v) => v.cards === p.cards && v.available);
      const profitMax = max * p.cards - p.price;
      return option({
        name: 'pack',
        value: String(p.cards),
        checked: s.packSize === p.cards,
        disabled: !available,
        label: cardsText(p.cards),
        aside: available ? totalText(p.price) : c.quantity.soldOut,
        detail: available ? fill(c.quantity.perCard, { porTarjeta: money(pricePerCard(p)) }) : undefined,
        extra:
          available && profitMax > 0
            ? fill(c.quantity.profit, { desde: money(Math.max(0, min * p.cards - p.price)), hasta: money(profitMax) })
            : undefined,
        tile: true,
        onSelect: () => selectSize(p.cards),
      });
    });

    const colors = PACK_COLORS.filter((color) => color !== 'mixto' || hasMix());
    const colorUsable = (color: PackColor) =>
      s.packSize ? variant(s.packSize, color)?.available === true : resalePacks().some((p) => p.color === color && p.available);
    const colorTiles = colors.map((color) =>
      option({
        name: 'color-pack',
        value: color,
        checked: s.packColor === color,
        disabled: !colorUsable(color),
        media: packVisual(color),
        label: c.quantity.packColors[color].label,
        detail: colorUsable(color) ? c.quantity.packColors[color].detail : c.quantity.colorSoldOut,
        swatch: true,
        onSelect: () =>
          flow.update({
            packColor: color,
            preview: color === 'mixto' ? s.preview : color,
            mixNegras: s.packSize ? clampMix(s.packSize, s.mixNegras || s.packSize / 2) : s.mixNegras,
          }),
      }),
    );

    return [
      sizes.length ? h('h2', { class: 'pick-title' }, c.quantity.sizeTitle) : null,
      sizes.length ? h('fieldset', { class: 'tiles' }, h('legend', { class: 'sr-only' }, c.quantity.sizeTitle), ...tiles) : null,
      hasVolumeDiscount(shownPacks) ? h('p', { class: 'note' }, c.quantity.volumeNote) : null,
      sizes.length ? h('p', { class: 'note' }, fill(c.quantity.profitNote, { min: money(min), max: money(max) })) : null,
      sizes.length ? h('h2', { class: 'pick-title' }, c.quantity.colorTitle) : null,
      sizes.length
        ? h('fieldset', { class: `swatches cols-${colors.length}` }, h('legend', { class: 'sr-only' }, c.quantity.colorTitle), ...colorTiles)
        : null,
      s.packColor === 'mixto' && s.packSize ? mixer(s, s.packSize) : null,
    ];
  }

  /** Pack mixto: un deslizador cuyo riel muestra la proporción de negras y blancas. */
  function mixer(s: FlowState, size: number) {
    const step = mixStep(size);
    const value = clampMix(size, s.mixNegras);
    const output = h('output', { class: 'mix-value money', for: 'mezcla' });
    const range = h('input', {
      id: 'mezcla',
      type: 'range',
      min: step,
      max: size - step,
      step,
      value,
      'aria-valuetext': colorsText(packCounts(size, 'mixto', value)),
    });
    const box = h(
      'div',
      { class: 'mix' },
      h('div', { class: 'mix-head' }, h('label', { for: 'mezcla', class: 'field-label' }, c.quantity.mixLabel), output),
      range,
      h('p', { class: 'note' }, c.quantity.mixNote),
    );
    const paint = (negras: number) => {
      const counts = packCounts(size, 'mixto', negras);
      output.textContent = colorsText(counts);
      range.setAttribute('aria-valuetext', output.textContent);
      // El corte negro/blanco queda bajo el centro del control (30 px de ancho).
      const f = (negras - step) / Math.max(1, size - 2 * step);
      box.style.setProperty('--mix', `calc(15px + (100% - 30px) * ${f})`);
    };
    paint(value);
    // Sin re-render mientras arrastra: perdería el dedo. Se actualizan el texto, la barra y la pila.
    range.addEventListener('input', () => {
      const negras = clampMix(size, Number(range.value));
      flow.assign({ mixNegras: negras });
      paint(negras);
      renderBar(flow.state);
      stage()?.setStack(packCounts(size, 'mixto', negras));
    });
    return box;
  }

  /** Miniatura del color del pack: la tarjeta, o dos en abanico si es mixto. */
  function packVisual(color: PackColor): Node {
    const thumb = (cc: CardColor, cls = '') => h('img', { class: `thumb ${cls}`, src: THUMBS[cc], alt: '', width: 56, height: 56 });
    return color === 'mixto'
      ? h('span', { class: 'pack-visual mixed' }, thumb('blanco', 'back'), thumb('negro', 'front'))
      : h('span', { class: 'pack-visual' }, thumb(color));
  }

  function swatch(color: CardColor) {
    return h('span', { class: `swatch ${color}` });
  }

  // Tu link

  function personalize(s: FlowState) {
    const input = h('input', {
      id: 'link',
      type: 'url',
      inputmode: 'url',
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: 'false',
      placeholder: c.personalize.placeholder,
      value: s.link,
      'aria-describedby': 'link-error link-ayuda',
      'aria-invalid': error ? 'true' : undefined,
    });
    // Sin re-render mientras escribe: perdería el foco y el teclado.
    input.addEventListener('input', () => flow.assign({ link: input.value.trim() }));

    primary = {
      label: c.actions.review,
      run: () => {
        const check = validateGoogleLink(flow.state.link);
        if (flow.state.linkLater && check === 'empty') return advance(true, '');
        advance(check === 'ok', check === 'ok' ? '' : c.personalize.errors[check]);
      },
    };

    return [
      titleWithBack(c.personalize.title),
      h('p', { class: 'lead' }, c.personalize.lead),
      h(
        'div',
        { class: 'field' },
        h('label', { for: 'link', class: 'field-label' }, c.personalize.fieldLabel),
        input,
        h('p', { id: 'link-error', class: 'error', role: 'alert', tabindex: -1 }, error),
        h('p', { id: 'link-ayuda', class: 'note' }, c.personalize.help),
      ),
      h(
        'label',
        { class: 'check' },
        h('input', {
          type: 'checkbox',
          checked: s.linkLater,
          onChange: (e: Event) => {
            error = '';
            flow.update({ linkLater: (e.target as HTMLInputElement).checked });
          },
        }),
        h('span', {}, c.personalize.later),
      ),
      h('p', { class: 'note' }, t(c.personalize.warning)),
    ];
  }

  // Resumen: como un carrito.

  function summary(s: FlowState) {
    const order = orderOf(s);
    primary = { label: c.actions.pay, run: () => pay(flow.state), disabled: order?.available !== true };
    const row = (label: string, value: Node | string, action?: [string, Step]) =>
      h(
        'div',
        { class: 'row' },
        h('dt', {}, label),
        h('dd', {}, value),
        action ? h('button', { type: 'button', class: 'text-button', onClick: () => flow.go(action[1]) }, action[0]) : null,
      );
    const policies = catalogState.status === 'ready' ? catalogState.catalog.policies : [];

    return [
      titleWithBack(c.summary.title),
      order && !order.available
        ? h(
            'p',
            { class: 'error', role: 'alert' },
            c.summary.soldOut,
            ' ',
            h('button', { type: 'button', class: 'text-button', onClick: () => flow.go('cantidad') }, c.actions.changeQuantity),
          )
        : null,
      h(
        'section',
        { class: 'order' },
        ...(order ? orderItems(s, order) : []),
        h(
          'dl',
          { class: 'summary' },
          row(c.summary.rows.intent, c.intent.options[s.intent!].label, [c.actions.changeIntent, 'intencion']),
          order ? row(c.summary.rows.cards, orderText(s, order), [c.actions.changeCards, 'cantidad']) : null,
          s.intent === 'negocio'
            ? row(
                c.summary.rows.link,
                s.link && !s.linkLater ? h('span', { class: 'url' }, s.link) : c.summary.rows.linkLater,
                [c.actions.changeLink, 'personaliza'],
              )
            : null,
          row(c.summary.rows.shipping, c.summary.rows.shippingValue),
          order ? row(c.summary.rows.total, h('strong', { class: 'money total' }, totalText(order.total))) : null,
        ),
        h('p', { class: 'secure' }, icon('lock'), c.summary.secure),
        h('ul', { class: 'pay-chips', 'aria-label': c.summary.paymentTitle }, ...c.summary.paymentChips.map((m) =>
          h('li', { title: m }, PAY_ICONS[m] ? h('img', { src: PAY_ICONS[m], alt: m, width: '38', height: '24' }) : m),
        )),
      ),
      h('h2', {}, c.summary.nextTitle),
      h('ol', { class: 'sequence' }, ...c.summary.next[s.intent!].map((step) => h('li', {}, h('span', {}, t(step))))),
      ...c.summary.blocks.map((b) => h('section', { class: 'block' }, h('h2', {}, b.title), h('p', {}, t(b.body)))),
      policies.length
        ? h('section', { class: 'block' }, h('ul', { class: 'policies' }, ...policies.map((p) => h('li', {}, h('a', { href: p.url }, c.summary.policies[p.key])))))
        : null,
    ];
  }

  /** Renglones del resumen: uno por color en negocio; uno por pack en reventa. */
  function orderItems(s: FlowState, order: Order): Node[] {
    const item = (media: Node, title: string, detail: string, total: number) =>
      h(
        'div',
        { class: 'order-item' },
        media,
        h('div', {}, h('p', { class: 'order-title' }, title), h('p', { class: 'note' }, detail)),
        h('p', { class: 'order-price money' }, totalText(total)),
      );
    if (s.intent === 'reventa') {
      return [item(packVisual(s.packColor!), fill(c.summary.packItem, { n: order.cards }), colorsText(order.counts), order.total)];
    }
    return order.lines.map((l) => {
      const color = l.pack.color as CardColor;
      return item(packVisual(color), c.colors.item[color], cardsText(l.quantity), l.pack.price * l.quantity);
    });
  }

  async function pay(s: FlowState) {
    const order = orderOf(s);
    if (paying || !order?.available || !s.intent) return;
    const hasLink = s.intent === 'negocio' && !s.linkLater && validateGoogleLink(s.link) === 'ok';
    const url = buildCheckoutUrl(order.lines, {
      intencion: c.intent.options[s.intent].label,
      colores: colorsText(order.counts),
      link_google: hasLink ? s.link : undefined,
      link_por_whatsapp: s.intent === 'negocio' && !hasLink ? 'Sí' : undefined,
    });
    paying = true;
    renderBar(s);
    await Promise.race([stage()?.playExit(), new Promise((r) => setTimeout(r, 700))]);
    location.href = url;
  }

  // Barra de compra: precio a la izquierda, botón principal a la derecha.

  function renderBar(s: FlowState) {
    const order = orderOf(s);
    if (s.step === 'entrada') {
      barInfo.replaceChildren(h('span', { class: 'bar-label' }, entryPrice() ?? c.states.loading));
    } else if (order) {
      // Corto para que entre en una línea: solo los colores ("15 negras y 15 blancas").
      barInfo.replaceChildren(h('span', { class: 'bar-label' }, colorsText(order.counts)), h('strong', { class: 'bar-total money' }, totalText(order.total)));
    } else {
      barInfo.replaceChildren(h('span', { class: 'bar-label' }, c.bar.empty));
    }
    barButton.textContent = paying ? c.states.opening : primary.label;
    barButton.disabled = paying || primary.disabled === true;
  }

  function advance(ok: boolean, message: string) {
    if (!ok) {
      error = message;
      render(flow.state);
      main.querySelector<HTMLElement>('.error:not(:empty)')?.focus();
      return;
    }
    error = '';
    flow.next();
  }

  // Piezas

  function option(o: {
    name: string;
    value: string;
    checked: boolean;
    disabled?: boolean;
    icon?: IconName;
    /** Imagen arriba de la etiqueta (colores del pack). */
    media?: Node;
    label: string;
    detail?: string;
    extra?: string;
    aside?: string;
    tile?: boolean;
    swatch?: boolean;
    onSelect: () => void;
  }) {
    return h(
      'label',
      { class: o.swatch ? 'tile swatch-tile' : o.tile ? 'tile' : 'choice' },
      h('input', {
        type: 'radio',
        name: o.name,
        value: o.value,
        checked: o.checked,
        disabled: o.disabled,
        onChange: () => {
          error = '';
          o.onSelect();
        },
      }),
      o.icon ? h('span', { class: 'choice-icon' }, icon(o.icon)) : null,
      o.media ?? null,
      h(
        'span',
        { class: 'choice-body' },
        h('span', { class: 'choice-label' }, o.label),
        o.aside ? h('span', { class: 'choice-aside money' }, o.aside) : null,
        o.detail ? h('span', { class: 'choice-detail' }, o.detail) : null,
        o.extra ? h('span', { class: 'choice-detail choice-extra' }, o.extra) : null,
      ),
      h('span', { class: 'choice-check' }, icon('check')),
    );
  }

  function catalogNotice(): Node | null {
    if (catalogState.status === 'loading') return h('p', { class: 'note', role: 'status' }, c.states.loading);
    if (catalogState.status === 'failed')
      return h(
        'div',
        { class: 'notice', role: 'alert' },
        h('p', {}, c.states.failed),
        h('button', { type: 'button', class: 'secondary', onClick: fetchCatalog }, c.actions.retry),
        h('a', { class: 'secondary', href: WHATSAPP_URL, ...EXTERNAL }, c.help.whatsapp),
      );
    if (!catalogState.catalog.packs.some((p) => p.available)) return h('p', { class: 'notice', role: 'alert' }, c.states.allSoldOut);
    if (catalogState.catalog.source === 'fallback') return h('p', { class: 'note', role: 'status' }, c.states.fallback);
    return null;
  }

  function errorLine(): Node {
    return h('p', { class: 'error', role: 'alert', tabindex: -1 }, error);
  }

  /** Título con el botón Volver integrado a su izquierda: no ocupa una fila propia. */
  function titleWithBack(title: string) {
    return h(
      'div',
      { class: 'title-row' },
      h('button', { type: 'button', class: 'back', 'aria-label': c.actions.back, title: c.actions.back, onClick: () => flow.back() }, icon('back')),
      h('h1', {}, title),
    );
  }

  /** Selector de color sobre la vitrina: solo para mirar la tarjeta en los pasos en que se ve sola. */
  function renderColorSwitch() {
    return h(
      'fieldset',
      { class: 'color-switch' },
      h('legend', { class: 'sr-only' }, c.colors.switchLabel),
      ...CARD_COLORS.map((color) =>
        h(
          'label',
          {},
          h('input', {
            type: 'radio',
            name: 'color-vista',
            value: color,
            checked: flow.state.preview === color,
            onChange: () => flow.update({ preview: color }),
          }),
          swatch(color),
          h('span', {}, c.colors.names[color]),
        ),
      ),
    );
  }

  function renderHelp() {
    const faq = h('div', { class: 'faq' });
    const dialog = h(
      'dialog',
      { class: 'help', 'aria-labelledby': 'ayuda-titulo' },
      h(
        'div',
        { class: 'help-head' },
        h('h2', { id: 'ayuda-titulo' }, c.help.title),
        h('button', { type: 'button', class: 'icon-button', 'aria-label': c.actions.close, onClick: () => dialog.close() }, icon('close')),
      ),
      h(
        'div',
        { class: 'help-contact' },
        h('a', { class: 'primary', href: WHATSAPP_URL, ...EXTERNAL }, icon('chat'), c.help.whatsapp),
        h('p', { class: 'note money' }, c.help.whatsappDisplay),
        h('a', { class: 'secondary', href: `mailto:${c.help.emailAddress}` }, icon('mail'), c.help.email),
        h('p', { class: 'note' }, c.help.emailAddress),
      ),
      h('h3', {}, c.help.faqTitle),
      faq,
    );
    dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
    // Las preguntas se arman al abrir: la de "1 tarjeta" depende de los packs de Shopify.
    const singleCard = () => singles().length > 0;
    new MutationObserver(() => {
      if (!dialog.open) return;
      faq.replaceChildren(
        ...c.faq
          .filter((f) => !f.requiresSingleCard || singleCard())
          .map((f) => h('details', {}, h('summary', {}, f.q), h('p', {}, t(f.a)))),
      );
    }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
    return dialog;
  }

  function renderFooter() {
    return h(
      'footer',
      {},
      logo(),
      h('p', {}, c.footer.city),
      h(
        'ul',
        { class: 'social', 'aria-label': c.footer.contactTitle },
        ...([
          ['whatsapp', `${c.footer.whatsapp} ${c.help.whatsappDisplay}`, WHATSAPP_URL],
          ['mail', `${c.footer.email} ${c.help.emailAddress}`, `mailto:${c.help.emailAddress}`],
          ['instagram', c.footer.instagram.label, c.footer.instagram.url],
          ['tiktok', c.footer.tiktok.label, c.footer.tiktok.url],
        ] as [SocialName, string, string][]).map(([name, label, href]) =>
          h('li', {}, h('a', { href, 'aria-label': label, title: label, ...(name === 'mail' ? {} : EXTERNAL) }, socialIcon(name))),
        ),
        h(
          'li',
          {},
          h('button', { type: 'button', 'aria-haspopup': 'dialog', 'aria-label': c.actions.help, title: c.actions.help, onClick: () => helpDialog.showModal() }, icon('help', 'social-icon')),
        ),
      ),
    );
  }

  flow.subscribe((s, prev) => {
    const stepChanged = s.step !== prev.step;
    if (stepChanged) error = '';
    render(s);
    if (stepChanged) {
      window.scrollTo({ top: 0 });
      main.focus({ preventScroll: true });
      const steps = stepsFor(s.intent ?? prev.intent);
      const forward = steps.indexOf(s.step) >= steps.indexOf(prev.step);
      main.classList.remove('enter-forward', 'enter-back');
      void main.offsetWidth;
      main.classList.add(forward ? 'enter-forward' : 'enter-back');
    }
  });

  // Al volver con Atrás desde el checkout, el navegador puede restaurar la página con el botón en "Abriendo...".
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    paying = false;
    render(flow.state);
  });

  fetchCatalog();
}
