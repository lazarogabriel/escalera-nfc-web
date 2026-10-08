// Todos los textos de la página. Única fuente; viene de CONTENT.md.
// [[FALTA: CÓDIGO pregunta]] se muestra como aviso "Falta responder" y bloquea `npm run build`.
// {variables} se llenan con fill().

import type { Intent } from '../state/flow';

const ENTREGA = 'Te llegan en 2 a 8 días hábiles.';
const RASTREO = 'Te mandamos la guía y el número de rastreo por WhatsApp.';
const FACTURA = 'Por el momento no emitimos factura.';

const MEDIOS =
  'Tarjeta de crédito o débito (Visa, Mastercard o American Express), Apple Pay, Google Pay, Mercado Pago o transferencia bancaria. Se paga en una sola exhibición, sin meses sin intereses. Con transferencia, preparamos tu pedido cuando se acredita el pago.';
const ENVIO = 'Enviamos gratis a todo México, por FedEx o Paquetexpress.';
const PASOS_LINK = 'En tu Perfil de Negocio de Google, entra a Leer opiniones, luego a Obtener más opiniones y selecciona Copiar.';
const PAGO_SHOPIFY = 'El pago se hace en el checkout de Shopify. Esta página no ve ni guarda los datos de tu tarjeta.';
const REPOSICION =
  'Garantía de 5 años. Si una tarjeta falla, escríbenos por WhatsApp en cuanto lo notes y la resolvemos de inmediato: te la reponemos o te devolvemos tu dinero, y nosotros pagamos el envío.';

export const content = {
  brand: 'Escalera NFC',

  meta: {
    title: 'Tarjetas NFC para reseñas de Google',
    description:
      'Tarjeta NFC para reseñas de Google. Tu cliente la toca con su celular y se abre tu página de reseñas. Envío gratis a todo México.',
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
    size: 'Mide 12 × 12 cm.',
    stepsTitle: 'Cómo funciona',
    steps: [
      'Pones la tarjeta en tu mostrador, mesa o entrada.',
      'Tu cliente acerca su celular a la tarjeta.',
      'Se abre tu página de reseñas de Google.',
    ],
    available: 'Disponible',
    soldOut: 'Agotado',
    trust: [
      { icon: 'lock', text: 'Pagas en el checkout seguro de Shopify.' },
      { icon: 'truck', text: 'Envío gratis a todo México.' },
      { icon: 'nfc', text: 'Para tu negocio, llega programada con tu link.' },
      { icon: 'refresh', text: 'Garantía de 5 años.' },
    ] as const,
    freeShipping: 'Envío gratis a todo México',
    price: '{precio} MXN por tarjeta.',
    resaleFrom: 'Para revender, desde {desde} MXN por tarjeta.',
    priceNote: 'Precios en pesos mexicanos.',
    imageAlt: 'Tarjeta NFC de 12 × 12 cm para reseñas de Google.',
  },

  intent: {
    title: '¿Para qué la quieres?',
    options: {
      negocio: {
        label: 'Para mi negocio',
        description: 'Para tu mostrador, mesas o entrada. Te llegan programadas con tu link de reseñas.',
      },
      reventa: {
        label: 'Para revender',
        description: 'Packs de 10 a 100 tarjetas sin programar, con un video para que las programes tú.',
      },
    } satisfies Record<Intent, { label: string; description: string }>,
    errorEmpty: 'Elige para qué la quieres para seguir.',
  },

  quantity: {
    title: 'Elige cuántas tarjetas',
    lead: {
      negocio: 'Cuenta los lugares donde la vas a poner: mostrador, mesas, entrada.',
      reventa: 'Mientras más grande el pack, menos cuesta cada tarjeta.',
    } satisfies Record<Intent, string>,
    oneCard: '1 tarjeta',
    cards: '{n} tarjetas',
    less: 'Una tarjeta menos',
    more: 'Una tarjeta más',
    maxNote: 'Máximo 3 tarjetas. Si necesitas más, elige Para revender.',
    unitPrice: '{precio} MXN por tarjeta',
    total: '{total} MXN',
    perCard: '{porTarjeta} MXN por tarjeta',
    // Margen estimado si el revendedor cobra cada tarjeta entre estos precios (dato del cliente).
    resaleRange: { min: 350, max: 500 },
    profit: 'Ganancia: {desde} a {hasta} MXN',
    profitNote: 'Ganancia estimada si revendes cada tarjeta entre {min} y {max} MXN.',
    soldOut: 'Agotado',
    volumeNote: 'En los packs más grandes cada tarjeta cuesta menos.',
    priceNote: 'Precios en pesos mexicanos. Envío gratis a todo México.',
    errorEmpty: 'Elige una cantidad para seguir.',
  },

  personalize: {
    title: 'Tu link de reseñas de Google',
    lead: 'Programamos tus tarjetas con este link y las bloqueamos para que nadie lo pueda cambiar.',
    fieldLabel: 'Link de reseñas',
    placeholder: 'https://g.page/r/...',
    help: PASOS_LINK,
    later: 'No lo tengo o quiero links distintos: escríbanme por WhatsApp',
    warning: 'Revisa que el link abra la página de reseñas de tu negocio.',
    errors: {
      empty: 'Pega tu link o marca que te escribamos por WhatsApp.',
      'not-google': 'Ese link no es de Google. Cópialo otra vez desde tu Perfil de Negocio.',
      'too-long': 'Ese link es muy largo para la tarjeta. Usa el que da Obtener más opiniones.',
    },
  },

  summary: {
    title: 'Revisa tu pedido',
    rows: {
      intent: 'Uso',
      quantity: 'Cantidad',
      link: 'Link',
      linkLater: 'Te escribimos por WhatsApp después de pagar',
      total: 'Total',
      shipping: 'Envío',
      shippingValue: 'Gratis a todo México.',
    },
    paymentTitle: 'Formas de pago',
    paymentChips: ['Visa', 'Mastercard', 'American Express', 'Apple Pay', 'Google Pay', 'Mercado Pago', 'Transferencia'],
    secure: 'Pago seguro en Shopify. Esta página no ve los datos de tu tarjeta.',
    nextTitle: 'Qué pasa después',
    next: {
      negocio: [
        'Al presionar Ir a pagar, pasas al pago de Shopify, en otra página.',
        'Pagas y te llega la confirmación por correo.',
        'Te escribimos por WhatsApp para confirmar qué link va en cada tarjeta.',
        'Programamos tus tarjetas y las bloqueamos.',
        `Las enviamos por FedEx o Paquetexpress. ${ENTREGA} ${RASTREO}`,
      ],
      reventa: [
        'Al presionar Ir a pagar, pasas al pago de Shopify, en otra página.',
        'Pagas y te llega la confirmación por correo.',
        'Te mandamos por WhatsApp el video para programarlas con la app NFC Tools.',
        `Las enviamos sin programar y sin bloquear, por FedEx o Paquetexpress. ${ENTREGA} ${RASTREO}`,
      ],
    } satisfies Record<Intent, string[]>,
    blocks: [
      { title: 'Pagas en Shopify', body: PAGO_SHOPIFY },
      { title: 'Formas de pago', body: MEDIOS },
      { title: 'Envío', body: `${ENVIO} ${ENTREGA} ${RASTREO}` },
      { title: 'Factura', body: FACTURA },
      { title: 'Si una tarjeta falla', body: REPOSICION },
    ],
    policies: {
      privacyPolicy: 'Política de privacidad',
      refundPolicy: 'Política de reembolso',
      shippingPolicy: 'Política de envío',
      termsOfService: 'Términos del servicio',
    },
    payNote: 'Te llevamos al checkout de Shopify. Ahí pones tu dirección de entrega.',
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
      a: 'Si las compras para tu negocio, sí: llegan programadas con tu link y bloqueadas. Si las compras para revender, llegan en blanco y te mandamos por WhatsApp un video para programarlas con la app NFC Tools.',
    },
    { q: '¿Dónde consigo mi link de reseñas?', a: `${PASOS_LINK} Si no lo encuentras, después de pagar te escribimos por WhatsApp y te ayudamos.` },
    {
      q: '¿Puedo poner un link distinto en cada tarjeta?',
      a: 'Sí, por ejemplo si tienes varias sucursales. Después de pagar te escribimos por WhatsApp para saber qué link va en cada tarjeta.',
    },
    // Solo se muestra si existe la variante de 1 tarjeta en Shopify.
    { q: '¿Puedo comprar una sola tarjeta?', a: 'Sí. Elige Para mi negocio y con + y − eliges cuántas quieres.', requiresSingleCard: true },
    { q: '¿Cómo puedo pagar?', a: MEDIOS },
    { q: '¿Es seguro pagar?', a: PAGO_SHOPIFY },
    { q: '¿Cuánto cuesta el envío?', a: ENVIO },
    { q: '¿Cuánto tarda en llegar?', a: 'De 2 a 8 días hábiles.' },
    { q: '¿Puedo rastrear mi pedido?', a: `Sí. ${RASTREO}` },
    { q: '¿Dan factura?', a: FACTURA },
    { q: '¿Qué pasa si una tarjeta no funciona?', a: REPOSICION },
    {
      q: '¿Aceptan cambios o devoluciones?',
      a: 'No hay cambios ni devoluciones, salvo que la tarjeta tenga un error de fabricación.',
    },
    {
      q: '¿Hay precio especial para revendedores?',
      a: 'Sí. Para revender se venden packs, y mientras más grande el pack, menos cuesta cada tarjeta. Llevan un solo diseño, sin marca blanca.',
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
