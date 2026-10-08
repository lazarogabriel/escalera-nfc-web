// Encabezado, pasos del flujo, barra de compra y panel de ayuda.

import { content as c, fill } from '../content/content.es-MX';
import { buildCheckoutUrl, hasVolumeDiscount, pricePerCard, type Catalog, type Pack } from '../shop/shopify';
import { validateGoogleLink, type Flow, type FlowState, type Intent, type Step } from '../state/flow';
import type { CardStage } from '../three/stage';
import cardThumb from '../assets/card/card-front-1024.webp';
import payVisa from '../assets/pay/visa.svg';
import payMaster from '../assets/pay/master.svg';
import payAmex from '../assets/pay/american_express.svg';
import payUnionPay from '../assets/pay/unionpay.svg';
import payApple from '../assets/pay/apple_pay.svg';
import payGoogle from '../assets/pay/google_pay.svg';
import payShop from '../assets/pay/shopify_pay.svg';
import payOxxo from '../assets/pay/oxxo.svg';

// Íconos oficiales de Shopify (activemerchant/payment_icons).
const PAY_ICONS: Record<string, string> = {
  Visa: payVisa,
  Mastercard: payMaster,
  'American Express': payAmex,
  UnionPay: payUnionPay,
  'Apple Pay': payApple,
  'Google Pay': payGoogle,
  'Shop Pay': payShop,
  OXXO: payOxxo,
};
import { h, text } from './dom';
import { money, packLabel, stackHeight } from './format';
import { icon, logo, socialIcon, type IconName, type SocialName } from './icons';

const t = (s: string) => text(s, c.pending.label);
const WHATSAPP_URL = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(c.help.whatsappMessage)}`;
const EXTERNAL = { target: '_blank', rel: 'noopener' };

const INTENT_ICONS: Record<Intent, IconName> = { negocio: 'store', sucursales: 'buildings', reventa: 'box' };

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
  const selectedPack = (s: FlowState) => packs().find((p) => p.variantId === s.variantId) ?? null;
  const labelOf = (p: Pack) => packLabel(p.cards, p.title, c.quantity.oneCard);
  const totalOf = (p: Pack) => fill(c.quantity.total, { total: money(p.price) });

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
    const pack = selectedPack(s);
    stage()?.setStep(s.step);
    if (pack) stage()?.setCount(pack.cards);
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

  function cheapestPerCard(): number | undefined {
    return packs()
      .filter((p) => p.available)
      .map(pricePerCard)
      .sort((a, b) => a - b)[0];
  }

  function entry() {
    primary = { label: c.actions.buy, run: () => flow.next() };
    const cheapest = cheapestPerCard();
    const anyAvailable = packs().some((p) => p.available);
    return [
      h('ul', { class: 'chips' }, ...c.entry.specs.map((spec) => h('li', {}, spec))),
      h('h1', {}, c.entry.title),
      h('p', { class: 'lead' }, c.entry.lead),
      catalogState.status === 'ready'
        ? h(
            'div',
            { class: 'price-line' },
            cheapest !== undefined ? h('p', { class: 'price money' }, fill(c.entry.priceFrom, { desde: money(cheapest) })) : null,
            h('span', { class: `stock ${anyAvailable ? 'in' : 'out'}` }, anyAvailable ? c.entry.available : c.entry.soldOut),
          )
        : null,
      h('p', { class: 'note' }, t(c.entry.priceNote)),
      catalogNotice(),
      h('ul', { class: 'trust' }, ...c.entry.trust.map((item) => h('li', {}, icon(item.icon), h('span', {}, item.text)))),
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
    const list = packs();
    const pack = selectedPack(s);
    primary = {
      label: s.intent === 'negocio' ? c.actions.addLink : c.actions.review,
      run: () => advance(selectedPack(flow.state)?.available === true, c.quantity.errorEmpty),
    };
    const tiles = list.map((p) =>
      option({
        name: 'pack',
        value: p.variantId,
        checked: s.variantId === p.variantId,
        disabled: !p.available,
        label: labelOf(p),
        aside: p.available ? totalOf(p) : c.quantity.soldOut,
        detail: p.available && p.cards > 1 ? fill(c.quantity.perCard, { porTarjeta: money(pricePerCard(p)) }) : undefined,
        tile: true,
        onSelect: () => flow.update({ variantId: p.variantId }),
      }),
    );
    return [
      titleWithBack(c.quantity.title),
      h('p', { class: 'lead' }, c.quantity.lead[s.intent!]),
      pack
        ? h('p', { class: 'stack-height' }, icon('box'), fill(c.quantity.stackHeight, { pack: labelOf(pack), alto: stackHeight(pack.cards) }))
        : null,
      catalogNotice(),
      list.length ? h('fieldset', { class: 'tiles' }, h('legend', { class: 'sr-only' }, c.quantity.title), ...tiles) : null,
      hasVolumeDiscount(list) ? h('p', { class: 'note' }, c.quantity.volumeNote) : null,
      h('p', { class: 'note' }, t(c.quantity.priceNote)),
      errorLine(),
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
    const pack = selectedPack(s);
    primary = { label: c.actions.pay, run: () => pay(flow.state), disabled: pack?.available !== true };
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
      pack && !pack.available
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
        pack
          ? h(
              'div',
              { class: 'order-item' },
              h('img', { src: cardThumb, alt: '', width: 64, height: 64, loading: 'lazy' }),
              h('div', {}, h('p', { class: 'order-title' }, c.meta.title), h('p', { class: 'note' }, labelOf(pack))),
              h('p', { class: 'order-price money' }, totalOf(pack)),
            )
          : null,
        h(
          'dl',
          { class: 'summary' },
          row(c.summary.rows.intent, c.intent.options[s.intent!].label, [c.actions.changeIntent, 'intencion']),
          pack ? row(c.summary.rows.quantity, labelOf(pack), [c.actions.changeQuantity, 'cantidad']) : null,
          s.intent === 'negocio'
            ? row(
                c.summary.rows.link,
                s.link && !s.linkLater ? h('span', { class: 'url' }, s.link) : c.summary.rows.linkLater,
                [c.actions.changeLink, 'personaliza'],
              )
            : null,
          row(c.summary.rows.shipping, c.summary.rows.shippingValue),
          pack ? row(c.summary.rows.total, h('strong', { class: 'money total' }, totalOf(pack))) : null,
        ),
        h('p', { class: 'note' }, t(c.summary.totalNote)),
        h('p', { class: 'secure' }, icon('lock'), c.summary.secure),
        h('ul', { class: 'pay-chips', 'aria-label': c.summary.paymentTitle }, ...c.summary.paymentChips.map((m) =>
          h('li', { title: m }, PAY_ICONS[m] ? h('img', { src: PAY_ICONS[m], alt: m, width: '38', height: '24' }) : m),
        )),
      ),
      h('h2', {}, c.summary.nextTitle),
      h('ol', { class: 'sequence' }, ...c.summary.next[s.intent!].map((step) => h('li', {}, h('span', {}, t(step))))),
      ...c.summary.blocks.map((b) => h('section', { class: 'block' }, h('h2', {}, b.title), h('p', {}, t(b.body)))),
      h(
        'section',
        { class: 'block' },
        h('ul', { class: 'policies' }, ...policies.map((p) => h('li', {}, h('a', { href: p.url }, c.summary.policies[p.key])))),
        h('p', { class: 'note' }, t(c.summary.policiesPending)),
      ),
    ];
  }

  async function pay(s: FlowState) {
    const pack = selectedPack(s);
    if (paying || !pack?.available || !s.intent) return;
    const hasLink = s.intent === 'negocio' && !s.linkLater && validateGoogleLink(s.link) === 'ok';
    const url = buildCheckoutUrl(pack, {
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
    const pack = selectedPack(s);
    if (s.step === 'entrada') {
      const cheapest = cheapestPerCard();
      barInfo.replaceChildren(
        cheapest !== undefined
          ? h('span', { class: 'bar-label' }, fill(c.entry.priceFrom, { desde: money(cheapest) }))
          : h('span', { class: 'bar-label' }, c.states.loading),
      );
    } else if (pack) {
      barInfo.replaceChildren(h('span', { class: 'bar-label' }, labelOf(pack)), h('strong', { class: 'bar-total money' }, totalOf(pack)));
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
        h('p', { class: 'note' }, t(c.help.hours)),
      ),
      h('h3', {}, c.help.faqTitle),
      faq,
    );
    dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
    // Las preguntas se arman al abrir: la de "1 tarjeta" depende de los packs de Shopify.
    const singleCard = () => packs().some((p) => p.cards === 1);
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
