// Máquina de estados del flujo. El paso vive en el hash (#/cantidad) para que Atrás funcione.
// Las elecciones viven solo en memoria: la página no guarda datos.

export type Step = 'entrada' | 'intencion' | 'cantidad' | 'personaliza' | 'resumen';
export type Intent = 'negocio' | 'sucursales' | 'reventa';

export interface FlowState {
  step: Step;
  intent: Intent | null;
  variantId: string | null;
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
      return state.variantId !== null;
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
  let state: FlowState = { step: 'entrada', intent: null, variantId: null, link: '', linkLater: false };
  const listeners = new Set<Listener>();

  function set(patch: Partial<FlowState>) {
    const previous = state;
    state = { ...state, ...patch };
    // Cambiar de intención puede dejar sin sentido el link.
    if (patch.intent && patch.intent !== 'negocio') state = { ...state, link: '', linkLater: false };
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
