// Máquina de estados del flujo. El paso vive en el hash (#/cantidad) para que Atrás funcione.
// Las elecciones viven solo en memoria: la página no guarda datos.

import type { CardColor, PackColor } from '../shop/shopify';

export type Step = 'entrada' | 'intencion' | 'cantidad' | 'personaliza' | 'resumen';
export type Intent = 'negocio' | 'reventa';

export interface FlowState {
  step: Step;
  intent: Intent | null;
  /** Tarjetas sueltas por color. Solo negocio; compra la variante de 1 tarjeta de cada color. */
  counts: Record<CardColor, number>;
  /** Tamaño del pack elegido (tarjetas). Solo reventa. */
  packSize: number | null;
  /** Color del pack. Solo reventa. */
  packColor: PackColor | null;
  /** Pack mixto: cuántas son negras; el resto son blancas. */
  mixNegras: number;
  /** Color que muestra la tarjeta 3D arriba de la pila. */
  preview: CardColor;
  link: string;
  linkLater: boolean;
}

const HASH_BY_STEP: Record<Step, string> = {
  entrada: '#/',
  intencion: '#/intencion',
  cantidad: '#/cantidad',
  personaliza: '#/personaliza',
  resumen: '#/resumen',
};

const STEP_BY_HASH = new Map(Object.entries(HASH_BY_STEP).map(([step, hash]) => [hash, step as Step]));

/** Pasos en los que la tarjeta se mira sola y el color se elige solo para verla. */
export const BROWSE_STEPS: Step[] = ['entrada', 'intencion'];

export const totalCount = (counts: Record<CardColor, number>) => counts.negro + counts.blanco;

/** La personalización solo existe para "Para mi negocio". */
export function stepsFor(intent: Intent | null): Step[] {
  return intent === 'negocio'
    ? ['entrada', 'intencion', 'cantidad', 'personaliza', 'resumen']
    : ['entrada', 'intencion', 'cantidad', 'resumen'];
}

export function nextStep(state: FlowState): Step {
  const steps = stepsFor(state.intent);
  return steps[Math.min(steps.indexOf(state.step) + 1, steps.length - 1)];
}

export function previousStep(state: FlowState): Step {
  const steps = stepsFor(state.intent);
  return steps[Math.max(steps.indexOf(state.step) - 1, 0)];
}

/** Primer paso al que le falta un dato para poder llegar a `target`. */
export function firstIncompleteStep(state: FlowState, target: Step): Step {
  for (const step of stepsFor(state.intent)) {
    if (step === target) return target;
    if (!isComplete(state, step)) return step;
  }
  // `target` no existe para esta intención (personaliza sin "Para mi negocio").
  return state.intent ? 'resumen' : 'intencion';
}

export function isComplete(state: FlowState, step: Step): boolean {
  switch (step) {
    case 'entrada':
      return true;
    case 'intencion':
      return state.intent !== null;
    case 'cantidad':
      return state.intent === 'negocio' ? totalCount(state.counts) > 0 : state.packSize !== null && state.packColor !== null;
    case 'personaliza':
      return state.linkLater || validateGoogleLink(state.link) === 'ok';
    case 'resumen':
      return true;
  }
}

export type LinkCheck = 'ok' | 'empty' | 'not-google' | 'too-long';

const GOOGLE_HOSTS = ['g.page', 'google.com', 'goo.gl', 'maps.app.goo.gl'];
// NTAG 213: 144 bytes de usuario. Con encabezado NDEF y prefijo https:// comprimido, ~130 caracteres de link.
export const MAX_LINK_LENGTH = 130;

export function validateGoogleLink(raw: string): LinkCheck {
  const value = raw.trim();
  if (!value) return 'empty';
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return 'not-google';
  }
  const host = url.hostname.replace(/^www\./, '');
  const isGoogle = url.protocol === 'https:' && GOOGLE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  if (!isGoogle) return 'not-google';
  if (value.length > MAX_LINK_LENGTH) return 'too-long';
  return 'ok';
}

type Listener = (state: FlowState, previous: FlowState) => void;

export function createFlow() {
  let state: FlowState = {
    step: 'entrada',
    intent: null,
    counts: { negro: 1, blanco: 0 },
    packSize: null,
    packColor: null,
    mixNegras: 0,
    preview: 'negro',
    link: '',
    linkLater: false,
  };
  const listeners = new Set<Listener>();

  function set(patch: Partial<FlowState>) {
    const previous = state;
    // Cambiar de intención deja sin sentido la cantidad y el link elegidos. Se arranca con el color que estaba mirando.
    const reset: Partial<FlowState> =
      patch.intent && patch.intent !== state.intent
        ? {
            counts: { negro: 0, blanco: 0, [state.preview]: 1 },
            packSize: null,
            packColor: null,
            mixNegras: 0,
            link: '',
            linkLater: false,
          }
        : {};
    state = { ...state, ...reset, ...patch };
    listeners.forEach((fn) => fn(state, previous));
  }

  function syncFromHash() {
    const requested = STEP_BY_HASH.get(location.hash || '#/') ?? 'entrada';
    const allowed = firstIncompleteStep(state, requested);
    if (allowed !== requested) {
      history.replaceState(null, '', HASH_BY_STEP[allowed]);
    }
    if (allowed !== state.step) set({ step: allowed });
  }

  window.addEventListener('hashchange', syncFromHash);

  return {
    get state() {
      return state;
    },
    start() {
      syncFromHash();
      listeners.forEach((fn) => fn(state, state));
    },
    update: set,
    /** Cambia el estado sin avisar a nadie (para escribir en un campo sin re-renderizar). */
    assign(patch: Partial<FlowState>) {
      state = { ...state, ...patch };
    },
    go(step: Step) {
      location.hash = HASH_BY_STEP[step];
    },
    next() {
      location.hash = HASH_BY_STEP[nextStep(state)];
    },
    back() {
      location.hash = HASH_BY_STEP[previousStep(state)];
    },
    subscribe(fn: Listener) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export type Flow = ReturnType<typeof createFlow>;
