// Escena de la tarjeta: acrílico de 2 mm con el arte impreso por detrás, luz de estudio y sombras suaves.
// 1 unidad = 100 mm. La tarjeta mide 1 × 1 × 0.02.

import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PCFSoftShadowMap,
  RepeatWrapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RingGeometry,
  Scene,
  Shape,
  ShapeGeometry,
  ShadowMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import art2048 from '../assets/card/card-front-2048.webp';
import art1024 from '../assets/card/card-front-1024.webp';
import type { Step } from '../state/flow';
import type { CardStage, StageOptions } from './stage';

const CARD = 1;
const THICK = 0.02; // 2 mm
const RADIUS = 0.05; // 5 mm
const BEVEL = 0.0045;
const GAP = 0.0006;
const PRINT_INSET = 0.003;
const PRINT_DEPTH = 0.0015;
const MAX_CARDS = 100;

// Mismos tonos que el fondo CSS de .stage (styles.css).
const STAGE_CENTER = '#2a4bb4';
const STAGE_MID = '#13256e';
const STAGE_EDGE = '#081233';
const WAVE = 0x7fb2ff;
const STAR = 0xf5b301;

interface Pose {
  elev: number;
  azim: number;
  /** <1 acerca la cámara. */
  zoom: number;
  /** Altura a la que flota la tarjeta sobre el piso. */
  lift: number;
  tiltX: number;
  tiltY: number;
}

// En los pasos con una sola tarjeta, la tarjeta se levanta y mira a la cámara (tiltX > 0), como en una foto de producto.
// En los pasos con pila, descansa plana sobre el piso.
const POSES: Record<Step, Pose> = {
  entrada: { elev: 16, azim: -16, zoom: 0.92, lift: 0.5, tiltX: 1.0, tiltY: 0.16 },
  intencion: { elev: 18, azim: 18, zoom: 1.12, lift: 0.48, tiltX: 0.92, tiltY: -0.2 },
  cantidad: { elev: 34, azim: -30, zoom: 1.12, lift: 0, tiltX: 0, tiltY: 0 },
  personaliza: { elev: 12, azim: -6, zoom: 1.06, lift: 0.52, tiltX: 1.12, tiltY: 0.06 },
  resumen: { elev: 36, azim: -24, zoom: 1.1, lift: 0, tiltX: 0, tiltY: 0 },
};

const STEPS_WITH_STACK: Step[] = ['cantidad', 'personaliza', 'resumen'];
const FLOATING_STEPS: Step[] = ['entrada', 'intencion', 'personaliza'];

function roundedRect(w: number, h: number, r: number): Shape {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function star(outer: number, inner: number): Shape {
  const s = new Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  return s;
}

/** De XY a XZ, con la cara hacia +Y. La parte de arriba del dibujo queda al fondo. */
function lieFlat<T extends BufferGeometry>(geometry: T): T {
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/** UV planares: el rectángulo w × h ocupa la textura entera. Antes de lieFlat. */
function planarUV(geometry: ShapeGeometry, w: number, h: number) {
  const uv = geometry.attributes.uv;
  const pos = geometry.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
}

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d')!);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function backgroundTexture() {
  return canvasTexture(1024, 1024, (ctx) => {
    const g = ctx.createRadialGradient(512, 420, 0, 512, 480, 740);
    g.addColorStop(0, STAGE_CENTER);
    g.addColorStop(0.45, STAGE_MID);
    g.addColorStop(1, STAGE_EDGE);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 1024);
  });
}

/** Mancha de luz suave en el piso, bajo la tarjeta. */
function floorGlowTexture() {
  return canvasTexture(256, 256, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(120, 160, 255, 0.5)');
    g.addColorStop(0.5, 'rgba(70, 110, 230, 0.16)');
    g.addColorStop(1, 'rgba(40, 70, 180, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  });
}

/** Sombra horneada para equipos flojos (sin mapa de sombras en tiempo real). */
function bakedShadowTexture() {
  return canvasTexture(256, 256, (ctx) => {
    ctx.shadowColor = 'rgba(2, 6, 20, 0.8)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetX = 1024; // se dibuja fuera del lienzo y solo queda la sombra
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.roundRect(48 - 1024, 54, 160, 160, 14);
    ctx.fill();
  });
}

/** Pantalla del teléfono: formulario genérico de calificación, sin marcas de terceros. */
function phoneScreenTexture() {
  return canvasTexture(512, 1024, (ctx) => {
    const bg = ctx.createLinearGradient(0, 0, 0, 1024);
    bg.addColorStop(0, '#1a2a5c');
    bg.addColorStop(1, '#0b1330');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 1024);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.roundRect(196, 30, 120, 34, 17); // isla de la cámara
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(40, 250, 432, 540, 36);
    ctx.fill();
    ctx.fillStyle = '#dfe5f2';
    ctx.beginPath();
    ctx.arc(110, 330, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9d2e6';
    for (const [x, y, w] of [
      [162, 310, 200],
      [162, 344, 140],
      [80, 600, 352],
      [80, 640, 352],
      [80, 680, 240],
    ]) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, 16, 8);
      ctx.fill();
    }
    // Estrellas vacías: las llenas se encienden encima, en 3D.
    ctx.strokeStyle = '#c3cce0';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    for (let i = 0; i < 5; i++) {
      const cx = 256 + (i - 2) * 76;
      const cy = 470;
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const r = k % 2 ? 13 : 30;
        const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
        k ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.stroke();
    }
  });
}

export async function createCardScene({ canvas, reducedMotion, lowPower }: StageOptions): Promise<CardStage> {
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  // Celulares: densidad completa de la pantalla (hasta 3), porque a 2 la tarjeta se ve blanda en un iPhone.
  // Escritorio: hasta 2 (pantallas más grandes, más píxeles por cuadro).
  const isTouch = matchMedia('(pointer: coarse)').matches;
  let pixelRatio = Math.min(window.devicePixelRatio, lowPower ? 1.25 : isTouch ? 3 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = !lowPower;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  scene.background = backgroundTexture();

  // Entorno de estudio: la habitación neutra de three más una franja de luz larga que se refleja en el acrílico.
  const room = new RoomEnvironment();
  const strip = new Mesh(new PlaneGeometry(14, 1.2), new MeshBasicMaterial({ color: new Color(6, 6, 6) }));
  strip.position.set(0, 9, -2);
  strip.rotation.x = Math.PI / 2.4;
  room.add(strip);
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(room, 0.03).texture;
  scene.environmentIntensity = 0.75;
  pmrem.dispose();

  scene.add(new HemisphereLight(0xcfe0ff, 0x0a1438, 0.2));
  const key = new DirectionalLight(0xfff3e6, 1.8);
  key.position.set(-1.6, 3.4, 1.8);
  key.castShadow = !lowPower;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = key.shadow.camera.bottom = -1.6;
  key.shadow.camera.right = key.shadow.camera.top = 1.6;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 10;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.01;
  const rim = new DirectionalLight(0x8fb4ff, 1.6);
  rim.position.set(2.2, 1.4, -2.6);
  scene.add(key, rim);

  const camera = new PerspectiveCamera(28, 1, 0.05, 40);

  // Piso: luz suave y sombra.
  const floorGlow = new Mesh(
    lieFlat(new PlaneGeometry(3.2, 3.2)),
    new MeshBasicMaterial({ map: floorGlowTexture(), transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false }),
  );
  floorGlow.position.y = -0.0005;
  const floorShadow = lowPower
    ? new Mesh(lieFlat(new PlaneGeometry(1.7, 1.7)), new MeshBasicMaterial({ map: bakedShadowTexture(), transparent: true, depthWrite: false }))
    : new Mesh(lieFlat(new PlaneGeometry(6, 6)), new ShadowMaterial({ color: 0x020617, opacity: 0.55 }));
  floorShadow.receiveShadow = true;
  scene.add(floorGlow, floorShadow);

  // Tarjeta: placa de acrílico biselada (instanciada para la pila) con el arte impreso por detrás.
  const slabGeometry = lieFlat(
    new ExtrudeGeometry(roundedRect(CARD, CARD, RADIUS), {
      depth: THICK - GAP - BEVEL * 2,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelOffset: -BEVEL,
      bevelSegments: 6,
      curveSegments: 40,
    }),
  );
  slabGeometry.translate(0, BEVEL, 0);

  // Caras de la placa: acrílico transparente y brillante sobre el arte. Sin transmisión física: el arte se ve nítido
  // y rinde en celulares de gama media. El reflejo del estudio y el clearcoat dan el aspecto de acrílico.
  const acrylicFace = new MeshPhysicalMaterial({
    color: 0xf4fbff,
    metalness: 0,
    roughness: 0.02,
    transparent: true,
    opacity: 0.05,
    clearcoat: 0.6,
    clearcoatRoughness: 0.015,
    specularIntensity: 0.6,
    envMapIntensity: 0.6,
    depthWrite: false,
  });
  // Canto pulido: opaco y brillante, con el tono frío del acrílico de canto. Opaco para que la pila no tenga ruido.
  const acrylicEdge = new MeshPhysicalMaterial({
    color: 0xcfe6ee,
    metalness: 0,
    roughness: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    sheen: 0.4,
    sheenColor: new Color(0x9fd8ff),
    envMapIntensity: 1.6,
  });

  const texture = await new TextureLoader().loadAsync(lowPower ? art1024 : art2048);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  // Capa impresa con espesor (0.15 mm): en la pila se ve como una línea blanca entre cantos de acrílico.
  const printGeometry = new ExtrudeGeometry(roundedRect(CARD - PRINT_INSET * 2, CARD - PRINT_INSET * 2, RADIUS - PRINT_INSET), {
    depth: PRINT_DEPTH,
    bevelEnabled: false,
    curveSegments: 40,
  });
  {
    // UV planares en las tapas: el arte ocupa la tarjeta completa.
    const uv = printGeometry.attributes.uv;
    const pos = printGeometry.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / CARD + 0.5, pos.getY(i) / CARD + 0.5);
  }
  lieFlat(printGeometry);
  // El arte se muestra con sus colores exactos (sin luz ni mapeo de tonos, que lo lavaban).
  // El volumen y el brillo los pone la capa de acrílico de encima y el canto.
  const printMaterial = new MeshBasicMaterial({ map: texture, color: 0xf4f4f4, toneMapped: false });
  const printEdge = new MeshStandardMaterial({ color: 0xf4f6fa, roughness: 0.7 });

  const slab = new Mesh(slabGeometry, [acrylicFace, acrylicEdge]);
  const print = new Mesh(printGeometry, [printMaterial, printEdge]);
  print.position.y = BEVEL;
  print.castShadow = true;
  const topCard = new Group();
  topCard.add(print, slab);

  // Debajo de la tarjeta de arriba, la pila es un bloque con textura de capas: una franja por tarjeta
  // (canto de acrílico, línea blanca de impresión y una junta). Con mipmaps se ve limpia a cualquier distancia,
  // sin el ruido que darían 100 geometrías finas, y cuesta una sola llamada de dibujo.
  const layerTexture = canvasTexture(16, 128, (ctx) => {
    const edge = ctx.createLinearGradient(0, 0, 0, 128);
    edge.addColorStop(0, '#e4f2f7');
    edge.addColorStop(0.5, '#c8e1ea');
    edge.addColorStop(1, '#dcecf2');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, 16, 128);
    ctx.fillStyle = '#fbfcfe';
    ctx.fillRect(0, 108, 16, 12);
    ctx.fillStyle = '#7f97ab';
    ctx.fillRect(0, 124, 16, 4);
  });
  layerTexture.wrapS = layerTexture.wrapT = RepeatWrapping;
  layerTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const blockGeometry = lieFlat(new ExtrudeGeometry(roundedRect(CARD, CARD, RADIUS), { depth: 1, bevelEnabled: false, curveSegments: 40 }));
  const block = new Mesh(blockGeometry, [
    new MeshStandardMaterial({ color: 0xe8f2f6, roughness: 0.4 }),
    new MeshPhysicalMaterial({ map: layerTexture, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.3 }),
  ]);
  block.castShadow = true;
  block.visible = false;

  const card = new Group(); // pose del paso
  card.add(block, topCard);
  const floater = new Group(); // flotación suave, aparte de la pose
  floater.add(card);
  scene.add(floater);

  // Teléfono para el momento del tap. Vive en el espacio de la tarjeta para seguir su pose.
  const PHONE_W = 0.36;
  const PHONE_H = 0.74;
  const PHONE_D = 0.03;
  const SCREEN_W = PHONE_W - 0.026;
  const SCREEN_H = PHONE_H - 0.026;
  const phoneBody = lieFlat(
    new ExtrudeGeometry(roundedRect(PHONE_W, PHONE_H, 0.06), {
      depth: PHONE_D - 0.012,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelOffset: -0.006,
      bevelSegments: 4,
      curveSegments: 28,
    }),
  );
  phoneBody.translate(0, 0.006, 0);
  const glass = new MeshPhysicalMaterial({ color: 0x05070d, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.2 });
  const phoneFrame = new MeshPhysicalMaterial({ color: 0x3a3f49, metalness: 0.95, roughness: 0.28, envMapIntensity: 1.3 });
  const phoneMesh = new Mesh(phoneBody, [glass, phoneFrame]);
  phoneMesh.castShadow = !lowPower;
  const screenGeometry = new ShapeGeometry(roundedRect(SCREEN_W, SCREEN_H, 0.048), 28);
  planarUV(screenGeometry, SCREEN_W, SCREEN_H);
  lieFlat(screenGeometry);
  const screen = new Mesh(screenGeometry, new MeshBasicMaterial({ map: phoneScreenTexture(), toneMapped: false }));
  screen.position.y = PHONE_D + 0.0006;
  const starGeometry = lieFlat(new ShapeGeometry(star(0.02, 0.0088)));
  const starMaterial = new MeshBasicMaterial({ color: STAR, toneMapped: false });
  const stars = [0, 1, 2, 3, 4].map((i) => {
    const s = new Mesh(starGeometry, starMaterial);
    // Sobre las estrellas vacías de la pantalla (x = 256 ± 76 px, y = 470 px de 512 × 1024).
    s.position.set(((i - 2) * 76 * SCREEN_W) / 512, PHONE_D + 0.0012, (470 / 1024 - 0.5) * SCREEN_H);
    s.scale.setScalar(0.001);
    return s;
  });
  const phone = new Group();
  phone.add(phoneMesh, screen, ...stars);
  phone.visible = false;
  card.add(phone);

  // Ondas NFC.
  const waves = [0, 1].map(() => {
    const wave = new Mesh(
      lieFlat(new RingGeometry(0.965, 1, 128)),
      new MeshBasicMaterial({ color: WAVE, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, toneMapped: false }),
    );
    wave.scale.setScalar(0.01);
    card.add(wave);
    return wave;
  });

  // Vista: pose del paso + altura de la pila.
  let step: Step = 'entrada';
  let selectedCount = 1;
  const view = { ...POSES.entrada, count: 1 };

  function applyView() {
    const n = Math.max(1, Math.round(view.count));
    const below = n - 1;
    block.visible = below > 0;
    block.scale.y = Math.max(below, 0.0001) * THICK;
    layerTexture.repeat.set(1, Math.max(below, 1));
    topCard.position.y = below * THICK;
    card.position.y = view.lift;
    card.rotation.set(view.tiltX, view.tiltY, 0);
    const height = n * THICK;
    floorGlow.scale.setScalar(1 + height * 0.25);

    const radius = Math.hypot(CARD / 2, CARD / 2, height / 2);
    const vfov = (camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    // En el celular la vitrina es baja: se acerca la cámara (salvo en la entrada, que ya llena la vitrina).
    // En la pila, cuanto más alta, menos se acerca, para que no choque con el logo.
    const mobileZoom = canvas.clientWidth >= 960 || step === 'entrada' ? 1 : 0.86 + 0.12 * Math.min(1, (n - 1) / 99);
    const distance = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * view.zoom * mobileZoom;
    const elev = (view.elev * Math.PI) / 180;
    const azim = (view.azim * Math.PI) / 180;
    const target = new Vector3(0, view.lift + height / 2, 0);
    camera.position.set(
      distance * Math.cos(elev) * Math.sin(azim),
      target.y + distance * Math.sin(elev),
      distance * Math.cos(elev) * Math.cos(azim),
    );
    camera.lookAt(target);
  }

  // Render bajo demanda. Si el fotograma pasa de 28 ms (menos de ~35 fps) durante 2 s, baja la resolución, sin bajar de 1.5
  // en pantallas densas (por debajo la tarjeta se ve pixelada);
  // si vuelve a ir fluido (menos de 14 ms) durante 3 s, la sube de nuevo hasta el máximo.
  const maxPixelRatio = pixelRatio;
  const minPixelRatio = Math.min(maxPixelRatio, 1.5);
  let raf = 0;
  let slowSince = 0;
  let fastSince = 0;
  let lastFrame = 0;
  let resizingUntil = 0;
  let visible = true;
  function invalidate() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }
  function setQuality(next: number) {
    pixelRatio = next;
    renderer.setPixelRatio(pixelRatio);
    applySize();
  }
  function frame(time: number) {
    raf = 0;
    renderer.render(scene, camera);
    const delta = time - lastFrame;
    lastFrame = time;
    // Los cuadros durante un cambio de tamaño no cuentan: son lentos por el cambio, no por el equipo.
    if (delta <= 0 || delta >= 100 || time < resizingUntil) {
      slowSince = fastSince = 0;
      return;
    }
    // 40 ms: el iPhone en ahorro de batería anima a 30 fps (33 ms) y eso no es lentitud del equipo.
    if (delta > 40) {
      fastSince = 0;
      slowSince ||= time;
      if (time - slowSince > 2000 && pixelRatio > minPixelRatio) {
        setQuality(Math.max(minPixelRatio, pixelRatio * 0.85));
        slowSince = 0;
      }
    } else {
      slowSince = 0;
      if (delta < 14 && pixelRatio < maxPixelRatio) {
        fastSince ||= time;
        if (time - fastSince > 3000) {
          setQuality(Math.min(maxPixelRatio, pixelRatio * 1.25));
          fastSince = 0;
        }
      } else {
        fastSince = 0;
      }
    }
  }

  /** Tamaño real del lienzo (caro: se hace al terminar de cambiar de tamaño). */
  function applySize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    applyView();
    invalidate();
  }

  // Mientras la vitrina se agranda o se achica, solo se corrige la proporción de la cámara:
  // el navegador estira el lienzo y la imagen se ve bien sin recrear los búferes en cada cuadro.
  let sizeTimer = 0;
  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    resizingUntil = performance.now() + 400;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    applyView();
    invalidate();
    clearTimeout(sizeTimer);
    sizeTimer = window.setTimeout(applySize, 180);
  }

  const onUpdate = () => {
    applyView();
    invalidate();
  };

  // Flotación suave mientras la tarjeta está en el aire.
  const float =
    reducedMotion || lowPower
      ? null
      : gsap
          .timeline({ repeat: -1, yoyo: true, onUpdate: invalidate })
          .to(floater.position, { y: 0.018, duration: 2.8, ease: 'sine.inOut' }, 0)
          .to(floater.rotation, { z: 0.02, x: -0.015, duration: 3.4, ease: 'sine.inOut' }, 0);

  function settleFloat(on: boolean) {
    if (!float) return;
    if (on && visible) return void float.paused(false);
    float.paused(true);
    if (on) return;
    gsap.to(floater.position, { y: 0, duration: 0.6, ease: 'power2.out', onUpdate: invalidate });
    gsap.to(floater.rotation, { x: 0, z: 0, duration: 0.6, ease: 'power2.out', onUpdate: invalidate });
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  // Sin render cuando el escenario no se ve (por ejemplo, al bajar en el resumen).
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    float?.paused(!visible || !FLOATING_STEPS.includes(step));
    if (visible) invalidate();
  });
  visibilityObserver.observe(canvas);

  /** Movimiento reducido: fundido de 150 ms y cambio instantáneo. */
  function crossfade(apply: () => void) {
    canvas.style.transition = 'opacity 150ms linear';
    canvas.style.opacity = '0';
    setTimeout(() => {
      apply();
      onUpdate();
      canvas.style.opacity = '1';
    }, 150);
  }

  function goTo(next: Step) {
    const target = { ...POSES[next], count: STEPS_WITH_STACK.includes(next) ? selectedCount : 1 };
    if (reducedMotion) return crossfade(() => Object.assign(view, target));
    settleFloat(FLOATING_STEPS.includes(next));
    gsap.to(view, { ...target, duration: 1.1, ease: 'power3.inOut', overwrite: 'auto', onUpdate });
  }

  let tapPlayed = false;
  let tap: gsap.core.Timeline | null = null;

  function resetExit() {
    floater.position.set(0, 0, 0);
    floater.rotation.set(0, 0, 0);
    floorShadow.visible = floorGlow.visible = true;
    settleFloat(FLOATING_STEPS.includes(step));
    invalidate();
  }
  // Al volver con Atrás desde el checkout, el navegador puede restaurar la página tal como quedó.
  const onPageShow = (e: PageTransitionEvent) => e.persisted && resetExit();
  window.addEventListener('pageshow', onPageShow);

  applySize();

  return {
    setStep(next) {
      if (next === step) return;
      step = next;
      if (tap) {
        tap.progress(1);
        tap = null;
      }
      goTo(step);
    },

    setCount(cards) {
      selectedCount = Math.min(MAX_CARDS, Math.max(1, cards));
      if (!STEPS_WITH_STACK.includes(step)) return;
      if (reducedMotion) {
        view.count = selectedCount;
        return onUpdate();
      }
      gsap.to(view, {
        count: selectedCount,
        duration: 0.5 + Math.min(0.7, Math.abs(selectedCount - view.count) / 140),
        ease: 'power2.out',
        overwrite: 'auto',
        onUpdate,
      });
    },

    playTap() {
      if (tapPlayed || reducedMotion || step !== 'entrada') return;
      tapPlayed = true;
      // El teléfono se apoya sobre el ícono NFC del arte (mitad inferior de la tarjeta).
      const top = THICK + 0.012; // la entrada siempre muestra una sola tarjeta
      const contact = new Vector3(-0.02, 0, 0.17);
      waves.forEach((w) => w.position.set(contact.x, top - 0.01, contact.z));
      phone.position.set(1.4, 0.9, 1.2);
      phone.rotation.set(-0.5, -0.7, 0.35);
      phone.visible = true;

      tap = gsap
        .timeline({
          delay: 0.5,
          onUpdate: invalidate,
          onComplete: () => {
            phone.visible = false;
            tap = null;
            invalidate();
          },
        })
        .to(phone.position, { x: contact.x + 0.04, y: top + 0.09, z: contact.z + 0.1, duration: 1.0, ease: 'power3.out' })
        .to(phone.rotation, { x: -0.12, y: -0.18, z: 0.04, duration: 1.0, ease: 'power3.out' }, '<')
        .to(phone.position, { y: top + 0.012, duration: 0.28, ease: 'power2.in' })
        .to(phone.rotation, { x: 0, duration: 0.28, ease: 'power2.in' }, '<')
        .addLabel('contact');
      waves.forEach((wave, i) => {
        tap!
          .fromTo(wave.scale, { x: 0.06, y: 0.06, z: 0.06 }, { x: 0.36, y: 0.36, z: 0.36, duration: 1.1, ease: 'power2.out' }, `contact+=${i * 0.3}`)
          .fromTo(wave.material, { opacity: 0.65 }, { opacity: 0, duration: 1.1, ease: 'power1.in' }, '<');
      });
      tap
        .to(stars.map((s) => s.scale), { x: 1, y: 1, z: 1, duration: 0.32, stagger: 0.11, ease: 'back.out(2.4)' }, 'contact+=0.35')
        .to(phone.position, { y: top + 0.12, duration: 0.5, ease: 'power2.out' }, '+=0.55')
        .to(phone.position, { x: 1.5, y: 0.9, z: -0.9, duration: 0.8, ease: 'power3.in' })
        .to(phone.rotation, { x: -0.4, y: 0.6, z: -0.3, duration: 0.8, ease: 'power3.in' }, '<');
    },

    playExit() {
      return new Promise<void>((resolve) => {
        if (reducedMotion) return resolve();
        float?.paused(true);
        gsap
          .timeline({ onUpdate: invalidate, onComplete: resolve })
          .to(floater.position, { y: 0.25, z: 0.6, duration: 0.55, ease: 'power2.in' }, 0)
          .to(floater.rotation, { x: -0.5, duration: 0.55, ease: 'power2.in' }, 0)
          .set([floorShadow, floorGlow], { visible: false });
      });
    },

    dispose() {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('pageshow', onPageShow);
      cancelAnimationFrame(raf);
      float?.kill();
      tap?.kill();
      gsap.killTweensOf([view, floater.position, floater.rotation]);
      renderer.dispose();
    },
  };
}
