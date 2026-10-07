// Contrato entre el flujo y la tarjeta 3D. El flujo nunca espera al 3D:
// si no hay WebGL o la carga falla, queda la imagen fija y los mismos botones.

import type { Step } from '../state/flow';

export interface CardStage {
  /** Pose de cada paso. Con movimiento reducido, cambio por fundido. */
  setStep(step: Step): void;
  /** Pila a altura real (2 mm por tarjeta). */
  setCount(cards: number): void;
  /** Momento del tap en la entrada. Una sola vez. */
  playTap(): void;
  /** Salida hacia el pago. Resuelve rápido para no demorar la navegación. */
  playExit(): Promise<void>;
  dispose(): void;
}

export interface StageOptions {
  canvas: HTMLCanvasElement;
  reducedMotion: boolean;
  /** Equipo flojo: densidad de píxeles 1. */
  lowPower: boolean;
}

export function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

export function isLowPower(): boolean {
  // Solo se usa la memoria del equipo (Chrome en Android). No se usa hardwareConcurrency:
  // Safari en iPhone informa menos núcleos de los reales y un iPhone 15 quedaba como "equipo flojo".
  const nav = navigator as Navigator & { deviceMemory?: number };
  return nav.deviceMemory !== undefined && nav.deviceMemory <= 2;
}

/** Import dinámico: three.js queda fuera del primer paquete. */
export async function loadStage(options: StageOptions): Promise<CardStage | null> {
  if (!canUseWebGL()) return null;
  try {
    const { createCardScene } = await import('./scene');
    return await createCardScene(options);
  } catch (error) {
    console.warn('No cargó la escena 3D; se queda la imagen fija.', error);
    return null;
  }
}
