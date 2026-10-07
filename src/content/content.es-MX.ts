// Todos los textos de la página. Única fuente; viene de CONTENT.md.
// [[FALTA: CÓDIGO pregunta]] se muestra como aviso "Falta responder" y bloquea `npm run build`.
// {variables} se llenan con fill().

import type { Intent } from '../state/flow';

const IVA = '[[FALTA: PE3 ¿Los precios incluyen IVA?]]';
const PREPARACION = '[[FALTA: EN5 ¿Cuántos días hábiles tarda la preparación?]]';
const ENTREGA = '[[FALTA: EN6 ¿Cuántos días tarda la entrega?]]';
const RASTREO = '[[FALTA: EN7 ¿Siempre hay número de rastreo y por dónde llega?]]';
const QUIEN_ESCRIBE = '[[FALTA: PR13 ¿Quién escribe primero, el comprador o ustedes?]]';
const VIDEO = '[[FALTA: PR2b ¿Por dónde y cuándo se manda el video al revendedor?]]';
const CAMBIO_LINK = '[[FALTA: PR6b Si el negocio cambia de link con la tarjeta bloqueada, ¿qué pasa?]]';
const MEDIOS_ACTIVOS = '[[FALTA: PA1 ¿Ya está activo Shopify Payments con estos medios?]]';
const FACTURA = '[[FALTA: FA1 ¿Emiten factura (CFDI)?]] [[FALTA: FA2 ¿Cómo se pide?]] [[FALTA: FA3 ¿Hasta cuándo se puede pedir?]]';
const PLAZOS_FALLA =
  '[[FALTA: PV1 ¿Hasta cuántos días después de recibirla se puede reportar?]] [[FALTA: PV4 ¿En cuántos días hábiles se resuelve?]]';

const MEDIOS =
  'Tarjeta de crédito o débito Visa, Mastercard, American Express o UnionPay. Apple Pay, Google Pay y Shop Pay. Efectivo en OXXO. Por ahora no hay meses sin intereses.';
const ENVIO = 'Enviamos desde Morelia, Michoacán, a todo México, por FedEx o Paquetexpress.';
const PASOS_LINK = 'En tu Perfil de Negocio de Google, entra a Leer opiniones, luego a Obtener más opiniones y selecciona Copiar.';
const PAGO_SHOPIFY = 'El pago se hace en el checkout de Shopify. Esta página no ve ni guarda los datos de tu tarjeta.';
const REPOSICION = 'Te la reponemos o te devolvemos tu dinero, y nosotros pagamos el envío. Escríbenos por WhatsApp.';

export const content = {
  brand: 'Escalera NFC',

  meta: {
    title: 'Tarjetas NFC para reseñas de Google',
    description:
      'Tarjeta de acrílico con chip NFC. Tu cliente la toca con su celular y se abre tu página de reseñas de Google. Envíos desde Morelia a todo México.',
  },

  actions: {
    buy: 'Comprar tarjetas',
    chooseQuantity: 'Elegir cantidad',
    addLink: 'Agregar tu link',
    review: 'Revisar pedido',
    pay: 'Ir a pagar',
    back: 'Volver',
    help: 'Ayuda',
    close: 'Cerrar',
    retry: 'Reintentar',
    changeIntent: 'Cambiar uso',
    changeQuantity: 'Cambiar cantidad',
    changeLink: 'Cambiar link',
  },

  pending: {
    label: 'Falta responder',
  },

  entry: {
    title: 'Tarjeta NFC para tus reseñas de Google',
    lead: 'Tu cliente acerca su celular a la tarjeta y se abre tu página de reseñas en Google. No tiene que instalar nada.',
    stepsTitle: 'Cómo funciona',
    steps: [
      'Pones la tarjeta en tu mostrador, mesa o entrada.',
      'Tu cliente acerca su celular a la tarjeta.',
      'Se abre tu página de reseñas de Google.',
    ],
    specs: ['10 × 10 cm', 'Acrílico de 2 mm', 'Chip NFC NTAG 213'],
    available: 'Disponible',
    soldOut: 'Agotado',
    trust: [
      { icon: 'lock', text: 'Pagas en el checkout seguro de Shopify.' },
      { icon: 'truck', text: 'Envío a todo México desde Morelia.' },
      { icon: 'nfc', text: 'Para tu negocio, llega programada con tu link.' },
      { icon: 'refresh', text: 'Si una tarjeta falla, te la reponemos.' },
    ] as const,
    priceFrom: 'Desde {desde} MXN por tarjeta.',
    priceNote: `Precios en pesos mexicanos. ${IVA}`,
    imageAlt: 'Tarjeta de acrílico de 10 × 10 cm con chip NFC para reseñas de Google.',
  },

  intent: {
    title: '¿Para qué la quieres?',
    options: {
      negocio: {
        label: 'Para mi negocio',
        description: 'Para tu mostrador, mesas o entrada. Te llegan programadas con tu link de reseñas.',
      },
      sucursales: {
        label: 'Para varias sucursales',
        description: 'Cada tarjeta puede llevar el link de una sucursal distinta. Te llegan programadas.',
      },
      reventa: {
        label: 'Para revender',
        description: 'Te llegan sin programar, con un video para que las programes tú.',
      },
    } satisfies Record<Intent, { label: string; description: string }>,
    errorEmpty: 'Elige para qué la quieres para seguir.',
  },

  quantity: {
    title: 'Elige cuántas tarjetas',
    lead: {
      negocio: 'Cuenta los lugares donde la vas a poner: mostrador, mesas, entrada.',
      sucursales: 'Cuenta cuántas tarjetas va a tener cada sucursal y súmalas.',
      reventa: 'El precio es el mismo para todos. No hay precio de mayoreo.',
    } satisfies Record<Intent, string>,
    oneCard: '1 tarjeta',
    total: '{total} MXN',
    perCard: '{porTarjeta} MXN por tarjeta',
    soldOut: 'Agotado',
    volumeNote: 'En los packs más grandes cada tarjeta cuesta menos.',
    stackHeight: '{pack}: {alto} de alto',
    priceNote: `Precios en pesos mexicanos. ${IVA} El envío se calcula al pagar, según tu dirección.`,
    errorEmpty: 'Elige una cantidad para seguir.',
  },

  personalize: {
    title: 'Tu link de reseñas de Google',
    lead: 'Programamos tus tarjetas con este link y las bloqueamos para que nadie lo pueda cambiar.',
    fieldLabel: 'Link de reseñas',
    placeholder: 'https://g.page/r/...',
    help: PASOS_LINK,
    later: 'Lo mando por WhatsApp después de pagar',
    warning: `Revisa que el link abra la página de reseñas de tu negocio. ${CAMBIO_LINK}`,
    errors: {
      empty: 'Pega tu link o marca que lo mandas por WhatsApp.',
      'not-google': 'Ese link no es de Google. Cópialo otra vez desde tu Perfil de Negocio.',
      'too-long': 'Ese link es muy largo para el chip. Usa el que da Obtener más opiniones.',
    },
  },

  summary: {
    title: 'Revisa tu pedido',
    rows: {
      intent: 'Uso',
      quantity: 'Cantidad',
      link: 'Link',
      linkLater: 'Lo mandas por WhatsApp después de pagar',
      total: 'Total',
      shipping: 'Envío',
      shippingValue: 'Se calcula al pagar, según tu dirección.',
    },
    totalNote: IVA,
    paymentTitle: 'Formas de pago',
    paymentChips: ['Visa', 'Mastercard', 'American Express', 'UnionPay', 'Apple Pay', 'Google Pay', 'Shop Pay', 'OXXO'],
    secure: 'Pago seguro en Shopify. Esta página no ve los datos de tu tarjeta.',
    nextTitle: 'Qué pasa después',
    next: {
      negocio: [
        'Al presionar Ir a pagar, pasas al pago de Shopify, en otra página.',
        'Pagas y te llega la confirmación por correo.',
        `Si no pegaste tu link, nos lo mandas por WhatsApp. ${QUIEN_ESCRIBE}`,
        'Programamos tus tarjetas con tu link y las bloqueamos.',
        `Las enviamos desde Morelia por FedEx o Paquetexpress. ${PREPARACION} ${ENTREGA}`,
      ],
      sucursales: [
        'Al presionar Ir a pagar, pasas al pago de Shopify, en otra página.',
        'Pagas y te llega la confirmación por correo.',
        `Nos mandas por WhatsApp qué link va en cada tarjeta. ${QUIEN_ESCRIBE}`,
        'Programamos cada tarjeta con su link y las bloqueamos.',
        `Las enviamos desde Morelia por FedEx o Paquetexpress. ${PREPARACION} ${ENTREGA}`,
      ],
      reventa: [
        'Al presionar Ir a pagar, pasas al pago de Shopify, en otra página.',
        'Pagas y te llega la confirmación por correo.',
        `Te mandamos el video para programarlas. ${VIDEO}`,
        `Las enviamos sin programar y sin bloquear, desde Morelia, por FedEx o Paquetexpress. ${PREPARACION} ${ENTREGA}`,
      ],
    } satisfies Record<Intent, string[]>,
    blocks: [
      { title: 'Pagas en Shopify', body: PAGO_SHOPIFY },
      { title: 'Formas de pago', body: `${MEDIOS} ${MEDIOS_ACTIVOS}` },
      {
        title: 'Efectivo en OXXO',
        body: 'Con OXXO recibes un voucher para pagar en efectivo. [[FALTA: PA3 ¿Cuántos días dura el voucher y cuándo se prepara el pedido?]]',
      },
      { title: 'Envío', body: `${ENVIO} El costo lo ves en el checkout antes de pagar. ${RASTREO}` },
      { title: 'Factura', body: FACTURA },
      { title: 'Si una tarjeta falla', body: `${REPOSICION} ${PLAZOS_FALLA}` },
    ],
    policies: {
      privacyPolicy: 'Política de privacidad',
      refundPolicy: 'Política de reembolso',
      shippingPolicy: 'Política de envío',
      termsOfService: 'Términos del servicio',
    },
    policiesPending:
      '[[FALTA: PV6 Crear en Shopify las políticas de reembolso, envío y términos del servicio]]',
    payNote: 'Te llevamos al checkout de Shopify. Ahí pones tu dirección y ves el costo de envío antes de pagar.',
    soldOut: 'Este pack se agotó. Elige otra cantidad.',
  },

  bar: {
    empty: 'Todavía no eliges cantidad.',
  },

  help: {
    title: 'Ayuda',
    whatsapp: 'Escribir por WhatsApp',
    whatsappMessage: 'Hola, tengo una pregunta sobre las tarjetas NFC.',
    whatsappDisplay: '+52 228 646 1167',
    email: 'Escribir un correo',
    emailAddress: 'packoescalerashopify@gmail.com',
    hours: '[[FALTA: NE4b ¿En qué horario contestan el WhatsApp?]]',
    faqTitle: 'Preguntas frecuentes',
  },

  faq: [
    {
      q: '¿Qué celulares pueden leer la tarjeta?',
      a: 'Los que tienen NFC. En iPhone XR, XS, SE de 2.ª generación y posteriores, basta con acercarlo con la pantalla encendida. En iPhone 7, 8 y X hay que abrir el lector NFC desde el Centro de control. En Android, el NFC tiene que estar activado, y no todos los modelos lo tienen.',
    },
    { q: '¿Y si el celular de mi cliente no tiene NFC?', a: 'No va a poder leerla. La tarjeta no lleva código QR.' },
    { q: '¿Mi cliente tiene que instalar una app?', a: 'No. El celular abre el link sin instalar nada.' },
    {
      q: '¿Las tarjetas llegan listas para usar?',
      a: 'Si las compras para tu negocio o para tus sucursales, sí: llegan programadas con tu link y bloqueadas. Si las compras para revender, llegan en blanco y te mandamos un video para programarlas. [[FALTA: PR2c ¿Qué app se usa para programarlas?]]',
    },
    { q: '¿Dónde consigo mi link de reseñas?', a: PASOS_LINK },
    {
      q: '¿Puedo poner un link distinto en cada tarjeta?',
      a: 'Sí. Elige Para varias sucursales y, después de pagar, mándanos por WhatsApp qué link va en cada tarjeta.',
    },
    { q: '¿Puedo cambiar el link después?', a: CAMBIO_LINK },
    // Solo se muestra si existe un pack de 1 tarjeta en Shopify.
    { q: '¿Puedo comprar una sola tarjeta?', a: 'Sí. Elige 1 tarjeta en la cantidad.', requiresSingleCard: true },
    { q: '¿Cómo puedo pagar?', a: `${MEDIOS} ${MEDIOS_ACTIVOS}` },
    { q: '¿Es seguro pagar?', a: PAGO_SHOPIFY },
    { q: '¿Cuánto cuesta el envío?', a: `Lo calcula Shopify al pagar, según tu dirección. No hay envío gratis. ${ENVIO}` },
    { q: '¿Cuánto tarda en llegar?', a: `${PREPARACION} ${ENTREGA}` },
    { q: '¿Puedo rastrear mi pedido?', a: RASTREO },
    { q: '¿Dan factura?', a: FACTURA },
    { q: '¿Qué pasa si una tarjeta no funciona?', a: `${REPOSICION} ${PLAZOS_FALLA}` },
    {
      q: '¿Aceptan cambios o devoluciones?',
      a: 'Solo si la tarjeta llega con falla. [[FALTA: PV7 Revisar con un asesor la política sin cambios ni devoluciones frente a la LFPC]]',
    },
    {
      q: '¿Hay precio especial para revendedores?',
      a: 'No. El precio es el mismo para todos. Las tarjetas llevan un solo diseño, sin marca blanca.',
    },
    {
      q: '¿La tarjeta me asegura más reseñas?',
      a: 'No. Hace más fácil llegar a tu página de reseñas. Lo que escriba cada cliente depende de su experiencia.',
    },
    {
      q: '¿Puedo dar un descuento a quien deje una reseña?',
      a: 'No. Google prohíbe ofrecer descuentos, regalos o pagos a cambio de reseñas, y pedirlas solo a los clientes contentos. Pídela a todos por igual.',
    },
  ] as { q: string; a: string; requiresSingleCard?: boolean }[],

  footer: {
    city: 'Morelia, Michoacán, México.',
    contactTitle: 'Contacto',
    whatsapp: 'WhatsApp',
    email: 'Correo',
    instagram: { label: 'Instagram', url: 'https://www.instagram.com/packoescalera/' },
    tiktok: { label: 'TikTok', url: 'https://www.tiktok.com/@packoescalera' },
  },

  states: {
    loading: 'Cargando precios',
    fallback: 'No pudimos actualizar los precios. El total exacto lo confirma Shopify antes de pagar.',
    failed: 'No pudimos cargar los packs. Revisa tu conexión y toca Reintentar, o escríbenos por WhatsApp.',
    allSoldOut: 'Por ahora no hay tarjetas disponibles. Escríbenos por WhatsApp.',
    opening: 'Abriendo el pago de Shopify',
  },
};

export type Content = typeof content;

/** Reemplaza {variables}. Deja la llave visible si falta un valor, para que se note. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}
