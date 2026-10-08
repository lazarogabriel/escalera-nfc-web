import './styles.css';
import { loadCatalog } from './shop/shopify';
import { createFlow } from './state/flow';
import { loadStage, isLowPower, type CardStage } from './three/stage';
import { mountApp } from './ui/app';

const flow = createFlow();
let stage: CardStage | null = null;

mountApp({
  root: document.getElementById('app')!,
  header: document.querySelector<HTMLElement>('header.top')!,
  showcase: document.querySelector<HTMLElement>('.stage')!,
  flow,
  catalog: loadCatalog,
  stage: () => stage,
});
flow.start();

// El 3D llega después del primer contenido visible. Hasta entonces (o si falla) queda la imagen fija.
const canvas = document.querySelector<HTMLCanvasElement>('#tarjeta-3d');
if (canvas) {
  const start = async () => {
    stage = await loadStage({
      canvas,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      lowPower: isLowPower(),
      color: flow.state.preview,
    });
    if (!stage) return;
    document.documentElement.classList.add('has-3d');
    // Tocar o deslizar la tarjeta muestra el otro color (solo en los pasos en que se mira sola).
    stage.onCardTap(() => flow.update({ preview: flow.state.preview === 'negro' ? 'blanco' : 'negro' }));
    // Re-render: el 3D recibe el paso, el color y la pila actuales.
    flow.update({});
    if (flow.state.step === 'entrada') stage.playTap();
  };
  'requestIdleCallback' in window ? requestIdleCallback(() => void start(), { timeout: 1500 }) : setTimeout(start, 300);
}
