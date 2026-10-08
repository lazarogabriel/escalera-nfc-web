// Encabezado, pasos del flujo, barra de compra y panel de ayuda.

import { content as c, fill } from '../content/content.es-MX';
import { buildCheckoutUrl, hasVolumeDiscount, pricePerCard, type Catalog, type Pack } from '../shop/shopify';
import { stepsFor, validateGoogleLink, type Flow, type FlowState, type Intent, type Step } from '../state/flow';
import type { CardStage } from '../three/stage';
import cardThumb from '../assets/card/card-front-1024.webp';
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

/** Lo que se va a comprar: negocio lleva N tarjetas sueltas; reventa, un pack. */
interface Line {
  pack: Pack;
  quantity: number;
  cards: number;
  total: number;
}

export interface AppDeps {
  root: HTMLElement;
  header: HTMLElement;
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

export function mountApp({ root, header, flow, catalog: loadCatalog, stage }: AppDeps) {
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
  const singlePack = () => packs().find((p) => p.cards === 1) ?? null;
  const resalePacks = () => packs().filter((p) => p.cards > 1);
  const cardsText = (n: number) => cardsLabel(n, c.quantity.oneCard, c.quantity.cards);
  const totalText = (amount: number) => fill(c.quantity.total, { total: money(amount) });

  function lineOf(s: FlowState): Line | null {
    if (s.intent === 'negocio') {
      const pack = singlePack();
      return pack && { pack, quantity: s.quantity, cards: s.quantity, total: pack.price * s.quantity };
    }
    const pack = resalePacks().find((p) => p.variantId === s.variantId);
    return pack ? { pack, quantity: 1, cards: pack.cards, total: pack.price } : null;
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
    const line = lineOf(s);
    stage()?.setStep(s.step);
    if (line) stage()?.setCount(line.cards);
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

  function entryPrice(): string | null {
    const single = singlePack();
    if (single) return fill(c.entry.price, { precio: money(single.price) });
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
      catalogState.status === 'ready'
        ? h(
            'div',
            { class: 'price-line' },
            price ? h('p', { class: 'price money' }, price) : null,
            h('span', { class: `stock ${anyAvailable ? 'in' : 'out'}` }, anyAvailable ? c.entry.available : c.entry.soldOut),
          )
        : null,
      singlePack() && from !== undefined ? h('p', { class: 'note money' }, fill(c.entry.resaleFrom, { desde: money(from) })) : null,
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

  function singleCards(s: FlowState): (Node | null)[] {
    const single = singlePack();
    primary = { label: c.actions.addLink, run: () => advance(singlePack()?.available === true, c.states.allSoldOut) };
    if (catalogState.status !== 'ready') return [];
    if (!single?.available) return [h('p', { class: 'notice', role: 'alert' }, c.states.allSoldOut)];
    const q = s.quantity;
    const setQuantity = (n: number) => flow.update({ quantity: Math.min(MAX_NEGOCIO, Math.max(1, n)) });
    return [
      h(
        'div',
        { class: 'stepper-card' },
        h(
          'div',
          { class: 'stepper', role: 'group', 'aria-label': c.quantity.title },
          h('button', { type: 'button', id: 'menos', class: 'stepper-btn', 'aria-label': c.quantity.less, disabled: q <= 1, onClick: () => setQuantity(q - 1) }, icon('minus')),
          h('output', { class: 'stepper-value', 'aria-live': 'polite' }, cardsText(q)),
          h('button', { type: 'button', id: 'mas', class: 'stepper-btn', 'aria-label': c.quantity.more, disabled: q >= MAX_NEGOCIO, onClick: () => setQuantity(q + 1) }, icon('plus')),
        ),
        h(
          'div',
          { class: 'stepper-price' },
          h('span', { class: 'note money' }, fill(c.quantity.unitPrice, { precio: money(single.price) })),
          h('strong', { class: 'stepper-total money' }, totalText(single.price * q)),
        ),
      ),
      h('p', { class: 'note' }, c.quantity.maxNote),
    ];
  }

  function resale(s: FlowState): (Node | null)[] {
    const list = resalePacks();
    primary = { label: c.actions.review, run: () => advance(lineOf(flow.state)?.pack.available === true, c.quantity.errorEmpty) };
    const { min, max } = c.quantity.resaleRange;
    const tiles = list.map((p) => {
      const profitMax = max * p.cards - p.price;
      return option({
        name: 'pack',
        value: p.variantId,
        checked: s.variantId === p.variantId,
        disabled: !p.available,
        label: cardsText(p.cards),
        aside: p.available ? totalText(p.price) : c.quantity.soldOut,
        detail: p.available ? fill(c.quantity.perCard, { porTarjeta: money(pricePerCard(p)) }) : undefined,
        extra:
          p.available && profitMax > 0
            ? fill(c.quantity.profit, { desde: money(Math.max(0, min * p.cards - p.price)), hasta: money(profitMax) })
            : undefined,
        tile: true,
        onSelect: () => flow.update({ variantId: p.variantId }),
      });
    });
    return [
      list.length ? h('fieldset', { class: 'tiles' }, h('legend', { class: 'sr-only' }, c.quantity.title), ...tiles) : null,
      hasVolumeDiscount(list) ? h('p', { class: 'note' }, c.quantity.volumeNote) : null,
      list.length ? h('p', { class: 'note' }, fill(c.quantity.profitNote, { min: money(min), max: money(max) })) : null,
    ];
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
    const line = lineOf(s);
    primary = { label: c.actions.pay, run: () => pay(flow.state), disabled: line?.pack.available !== true };
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
      line && !line.pack.available
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
        line
          ? h(
              'div',
              { class: 'order-item' },
              h('img', { src: cardThumb, alt: '', width: 64, height: 64, loading: 'lazy' }),
              h('div', {}, h('p', { class: 'order-title' }, c.meta.title), h('p', { class: 'note' }, cardsText(line.cards))),
              h('p', { class: 'order-price money' }, totalText(line.total)),
            )
          : null,
        h(
          'dl',
          { class: 'summary' },
          row(c.summary.rows.intent, c.intent.options[s.intent!].label, [c.actions.changeIntent, 'intencion']),
          line ? row(c.summary.rows.quantity, cardsText(line.cards), [c.actions.changeQuantity, 'cantidad']) : null,
          s.intent === 'negocio'
            ? row(
                c.summary.rows.link,
                s.link && !s.linkLater ? h('span', { class: 'url' }, s.link) : c.summary.rows.linkLater,
                [c.actions.changeLink, 'personaliza'],
              )
            : null,
          row(c.summary.rows.shipping, c.summary.rows.shippingValue),
          line ? row(c.summary.rows.total, h('strong', { class: 'money total' }, totalText(line.total))) : null,
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

  async function pay(s: FlowState) {
    const line = lineOf(s);
    if (paying || !line?.pack.available || !s.intent) return;
    const hasLink = s.intent === 'negocio' && !s.linkLater && validateGoogleLink(s.link) === 'ok';
    const url = buildCheckoutUrl(line.pack, line.quantity, {
      intencion: c.intent.options[s.intent].label,
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
    const line = lineOf(s);
    if (s.step === 'entrada') {
      barInfo.replaceChildren(h('span', { class: 'bar-label' }, entryPrice() ?? c.states.loading));
    } else if (line) {
      barInfo.replaceChildren(h('span', { class: 'bar-label' }, cardsText(line.cards)), h('strong', { class: 'bar-total money' }, totalText(line.total)));
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
    label: string;
    detail?: string;
    extra?: string;
    aside?: string;
    tile?: boolean;
    onSelect: () => void;
  }) {
    return h(
      'label',
      { class: o.tile ? 'tile' : 'choice' },
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
    const singleCard = () => singlePack() !== null;
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
