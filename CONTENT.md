# CONTENT.md

Texto final de la landing, en español de México, de tú. Este documento es la fuente de `src/content/content.es-MX.ts`.

## 0. Convenciones

- `[[FALTA: CÓDIGO pregunta]]` es un dato que falta. En la página se ve como un aviso visible: "Falta responder: pregunta (CÓDIGO)". Los códigos son los de `PREGUNTAS-CLIENTE.md`.
- `{variable}` se llena con datos de Shopify o del flujo:
  - `{n}`: número de tarjetas del pack, leído del título de la variante.
  - `{pack}`: título de la variante tal cual ("10 tarjetas"). Si es 1, dice "1 tarjeta".
  - `{total}`: precio de la variante.
  - `{porTarjeta}`: `{total}` dividido entre `{n}`, redondeado a centavos.
  - `{desde}`: el `{porTarjeta}` más bajo entre los packs disponibles.
  - `{marca}`: Escalera NFC (logotipo pedido por el cliente, 2026-10-07).
- Formato de dinero: `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })` más " MXN". Ejemplo: "$1,250.00 MXN". Sin centavos cuando el monto es entero: "$1,250 MXN".
- Un botón conserva su nombre en todo el flujo. Botones del flujo: **Comprar tarjetas**, **Elegir cantidad**, **Agregar tu link**, **Revisar pedido**, **Ir a pagar**, **Volver**, **Ayuda**, **Cerrar**, **Reintentar**.

## 1. Intenciones del comprador

### 1.1 Para mi negocio
- **Quién es:** dueño de un local con uno o pocos puntos de contacto (mostrador, mesa, entrada).
- **Qué necesita saber:**
  - Que la tarjeta llega lista, programada con su link.
  - Cómo consigue su link.
  - Cuánto cuesta y cuándo llega.
- **Objeciones:**
  - "¿Funciona con el celular de mis clientes?"
  - "¿Y si me equivoco de link?"
  - "¿Hay que instalar algo?"
  - "¿Es seguro pagar aquí?"
- **Decisión:** pack de 1 a 10 tarjetas.
- **Lo que pasa después:** pega su link en la página o lo manda por WhatsApp. Recibe las tarjetas programadas y bloqueadas.

### 1.2 Para varias sucursales
- **Quién es:** una cadena o un dueño con varias sucursales, cada una con su propio Perfil de Negocio.
- **Qué necesita saber:**
  - Que cada tarjeta puede llevar el link de una sucursal distinta.
  - Cómo indica cuál va en cada una.
- **Objeciones:**
  - "¿Se van a mezclar los links?"
  - "¿Cuánto tarda un pedido grande?"
  - "¿Dan factura?"
- **Decisión:** pack de 10 a 100 tarjetas.
- **Lo que pasa después:** paga y manda por WhatsApp qué link va en cada tarjeta. Recibe las tarjetas programadas y bloqueadas.

### 1.3 Para revender
- **Quién es:** una agencia o un emprendedor que vende las tarjetas a otros negocios.
- **Qué necesita saber:**
  - Que le llegan sin programar y sin bloquear.
  - Que recibe un video para programarlas.
  - Que el precio es el mismo para todos.
  - Que no hay marca blanca.
- **Objeciones:**
  - "¿Hay precio de mayoreo?" No.
  - "¿Me ayudan si mi cliente tiene un problema?" Sí, por WhatsApp.
  - "¿Puedo poner mi marca?" No.
- **Decisión:** pack de 50 o 100 tarjetas.
- **Lo que pasa después:** paga y recibe el video tutorial `[[FALTA: PR2b ¿Por dónde y cuándo se manda el video al revendedor?]]`. Las tarjetas llegan en blanco.

### Atributos que viajan al pedido

Los atributos aparecen en las notas del pedido en Shopify y van legibles para que el cliente los entienda sin tabla.

| Atributo | Valor |
|---|---|
| `intencion` | "Para mi negocio", "Para varias sucursales" o "Para revender" |
| `link_google` | El link pegado. Solo con "Para mi negocio", y solo si lo pegó |
| `link_por_whatsapp` | "Sí", cuando eligió mandar el link después |

## 2. Pantallas

### 2.1 Entrada (`#/`)

**Titular:** Tarjeta NFC para tus reseñas de Google

**Bajada:** Tu cliente acerca su celular a la tarjeta y se abre tu página de reseñas en Google. No tiene que instalar nada.

**Cómo funciona** (es una secuencia real, por eso va numerada):
1. Pones la tarjeta en tu mostrador, mesa o entrada.
2. Tu cliente acerca su celular a la tarjeta.
3. Se abre tu página de reseñas de Google.

**Ficha (etiquetas):** 10 × 10 cm. Acrílico de 2 mm. Chip NFC NTAG 213.

**Disponibilidad:** Disponible / Agotado (según Shopify).

**Datos de confianza** (lista con íconos):
- Pagas en el checkout seguro de Shopify.
- Envío a todo México desde Morelia.
- Para tu negocio, llega programada con tu link.
- Si una tarjeta falla, te la reponemos.

**Precio:** Desde {desde} MXN por tarjeta.
**Nota de precio:** Precios en pesos mexicanos. `[[FALTA: PE3 ¿Los precios incluyen IVA?]]`

**Botón:** Comprar tarjetas

**Texto alternativo de la imagen fija:** Tarjeta de acrílico de 10 × 10 cm con chip NFC para reseñas de Google.

### 2.2 Para qué la quieres (`#/intencion`)

**Titular:** ¿Para qué la quieres?

**Opciones** (selección única):

| Opción | Descripción |
|---|---|
| Para mi negocio | Para tu mostrador, mesas o entrada. Te llegan programadas con tu link de reseñas. |
| Para varias sucursales | Cada tarjeta puede llevar el link de una sucursal distinta. Te llegan programadas. |
| Para revender | Te llegan sin programar, con un video para que las programes tú. |

**Botón:** Elegir cantidad
**Botón secundario:** Volver
**Error sin selección:** Elige para qué la quieres para seguir.

### 2.3 Cantidad (`#/cantidad`)

**Titular:** Elige cuántas tarjetas

**Bajada según la intención:**
- **Para mi negocio:** Cuenta los lugares donde la vas a poner: mostrador, mesas, entrada.
- **Para varias sucursales:** Cuenta cuántas tarjetas va a tener cada sucursal y súmalas.
- **Para revender:** El precio es el mismo para todos. No hay precio de mayoreo.

**Fila de pack:**
- Título: {pack}
- Precio: {total} MXN
- Precio unitario: {porTarjeta} MXN por tarjeta. Si {n} es 1, esta línea no se muestra.
- Estado agotado: Agotado

**Nota bajo la lista** (solo si el precio por tarjeta baja de verdad al subir de pack, calculado con los precios de Shopify):
En los packs más grandes cada tarjeta cuesta menos.

**Nota de precio:** Precios en pesos mexicanos. `[[FALTA: PE3 ¿Los precios incluyen IVA?]]` El envío se calcula al pagar, según tu dirección.

**Bajo la pila 3D** (altura real, 2 mm por tarjeta): {pack}: {alto} de alto. Ejemplos: "10 tarjetas: 2 cm de alto" y "100 tarjetas: 20 cm de alto". Con 1 tarjeta: "1 tarjeta: 2 mm de alto".

**Botón:**
- **Para mi negocio:** Agregar tu link
- **Para varias sucursales y Para revender:** Revisar pedido

**Botón secundario:** Volver
**Error sin selección:** Elige una cantidad para seguir.

### 2.4 Tu link (`#/personaliza`)

Solo aparece con "Para mi negocio".

**Titular:** Tu link de reseñas de Google

**Bajada:** Programamos tus tarjetas con este link y las bloqueamos para que nadie lo pueda cambiar.

**Campo:**
- Etiqueta: Link de reseñas
- Ejemplo dentro del campo: https://g.page/r/...
- Ayuda: En tu Perfil de Negocio de Google, entra a Leer opiniones, luego a Obtener más opiniones y selecciona Copiar.

**Opción** (casilla): Lo mando por WhatsApp después de pagar

**Aviso:** Revisa que el link abra la página de reseñas de tu negocio. `[[FALTA: PR6b Si el negocio cambia de link con la tarjeta bloqueada, ¿qué pasa?]]`

**Errores:**
- **Vacío y sin la casilla:** Pega tu link o marca que lo mandas por WhatsApp.
- **No es un link de Google** (dominios aceptados: `g.page`, `google.com`, `goo.gl`, `maps.app.goo.gl`): Ese link no es de Google. Cópialo otra vez desde tu Perfil de Negocio.
- **Más de 130 caracteres:** Ese link es muy largo para el chip. Usa el que da Obtener más opiniones.

**Botón:** Revisar pedido
**Botón secundario:** Volver

### 2.5 Resumen (`#/resumen`)

**Titular:** Revisa tu pedido

**Renglones:**

| Renglón | Valor | Acción |
|---|---|---|
| Uso | Para mi negocio / Para varias sucursales / Para revender | Cambiar uso |
| Cantidad | {pack} | Cambiar cantidad |
| Link (solo Para mi negocio) | {link}, o "Lo mandas por WhatsApp después de pagar" | Cambiar link |
| Total | {total} MXN | — |
| Envío | Se calcula al pagar, según tu dirección. | — |

Nota bajo el total: `[[FALTA: PE3 ¿Los precios incluyen IVA?]]`

**Qué pasa después** (secuencia real, numerada):

*Para mi negocio:*
1. Al presionar Ir a pagar, pasas al pago de Shopify, en otra página.
2. Pagas y te llega la confirmación por correo.
3. Si no pegaste tu link, nos lo mandas por WhatsApp. `[[FALTA: PR13 ¿Quién escribe primero, el comprador o ustedes?]]`
4. Programamos tus tarjetas con tu link y las bloqueamos.
5. Las enviamos desde Morelia por FedEx o Paquetexpress. `[[FALTA: EN5 ¿Cuántos días hábiles tarda la preparación?]]` `[[FALTA: EN6 ¿Cuántos días tarda la entrega?]]`

*Para varias sucursales:*
1. Al presionar Ir a pagar, pasas al pago de Shopify, en otra página.
2. Pagas y te llega la confirmación por correo.
3. Nos mandas por WhatsApp qué link va en cada tarjeta. `[[FALTA: PR13 ¿Quién escribe primero, el comprador o ustedes?]]`
4. Programamos cada tarjeta con su link y las bloqueamos.
5. Las enviamos desde Morelia por FedEx o Paquetexpress. `[[FALTA: EN5 ¿Cuántos días hábiles tarda la preparación?]]` `[[FALTA: EN6 ¿Cuántos días tarda la entrega?]]`

*Para revender:*
1. Al presionar Ir a pagar, pasas al pago de Shopify, en otra página.
2. Pagas y te llega la confirmación por correo.
3. Te mandamos el video para programarlas. `[[FALTA: PR2b ¿Por dónde y cuándo se manda el video al revendedor?]]`
4. Las enviamos sin programar y sin bloquear, desde Morelia, por FedEx o Paquetexpress. `[[FALTA: EN5 ¿Cuántos días hábiles tarda la preparación?]]` `[[FALTA: EN6 ¿Cuántos días tarda la entrega?]]`

**Pie de la tarjeta de pedido:** Pago seguro en Shopify. Esta página no ve los datos de tu tarjeta. Debajo, etiquetas de texto con los medios: Visa, Mastercard, American Express, UnionPay, Apple Pay, Google Pay, Shop Pay, OXXO (sujetas a PA1).

**Bloque "Pago en Shopify":**
- Título: Pagas en Shopify
- Texto: El pago se hace en el checkout de Shopify. Esta página no ve ni guarda los datos de tu tarjeta.

**Bloque "Formas de pago":**
- Título: Formas de pago
- Texto: Tarjeta de crédito o débito Visa, Mastercard, American Express o UnionPay. Apple Pay, Google Pay y Shop Pay. Efectivo en OXXO. Por ahora no hay meses sin intereses.
- Aviso: `[[FALTA: PA1 ¿Ya está activo Shopify Payments con estos medios?]]`
- OXXO: Con OXXO recibes un voucher para pagar en efectivo. `[[FALTA: PA3 ¿Cuántos días dura el voucher y cuándo se prepara el pedido?]]`

**Bloque "Envío":**
- Título: Envío
- Texto: Enviamos desde Morelia, Michoacán, a todo México, por FedEx o Paquetexpress. El costo lo ves en el checkout antes de pagar.
- Aviso: `[[FALTA: EN7 ¿Siempre hay número de rastreo y por dónde llega?]]`

**Bloque "Factura":**
- Título: Factura
- Aviso: `[[FALTA: FA1 ¿Emiten factura (CFDI)?]]` `[[FALTA: FA2 ¿Cómo se pide?]]` `[[FALTA: FA3 ¿Hasta cuándo se puede pedir?]]`

**Bloque "Si una tarjeta falla":**
- Título: Si una tarjeta falla
- Texto: Te la reponemos o te devolvemos tu dinero, y nosotros pagamos el envío. Escríbenos por WhatsApp.
- Aviso: `[[FALTA: PV1 ¿Hasta cuántos días después de recibirla se puede reportar?]]` `[[FALTA: PV4 ¿En cuántos días hábiles se resuelve?]]`

**Enlaces de políticas:**

| Texto | Ruta | Estado |
|---|---|---|
| Política de privacidad | `https://{dominio}/policies/privacy-policy` | Existe |
| Política de reembolso | `https://{dominio}/policies/refund-policy` | `[[FALTA: PV6 Crear la política de reembolso en Shopify]]` |
| Política de envío | `https://{dominio}/policies/shipping-policy` | `[[FALTA: PV6 Crear la política de envío en Shopify]]` |
| Términos del servicio | `https://{dominio}/policies/terms-of-service` | `[[FALTA: PV6 Crear los términos del servicio en Shopify]]` |

**Botón:** Ir a pagar
**Texto bajo el botón:** Te llevamos al checkout de Shopify. Ahí pones tu dirección y ves el costo de envío antes de pagar.
**Botón secundario:** Volver

### 2.6 Barra inferior fija (móvil)

Está en todos los pasos. En la entrada muestra "Desde {desde} MXN por tarjeta." y el botón Comprar tarjetas, para que el botón quede siempre a la mano del pulgar. En escritorio deja de ser fija y cierra la columna del flujo.

- Antes de elegir pack: Todavía no eliges cantidad.
- Con pack: dos renglones. Arriba {pack}, abajo {total} MXN.
- Botón: el principal del paso actual (Elegir cantidad, Agregar tu link, Revisar pedido o Ir a pagar).

### 2.7 Ayuda (panel, accesible desde cualquier paso)

- **Botón que lo abre:** Ayuda
- **Título del panel:** Ayuda
- **Contacto:**
  - Botón: Escribir por WhatsApp. Abre `https://wa.me/522286461167` con este texto: "Hola, tengo una pregunta sobre las tarjetas NFC."
  - Número visible: +52 228 646 1167
  - Botón: Escribir un correo. Abre `mailto:packoescalerashopify@gmail.com`.
  - Horario: `[[FALTA: NE4b ¿En qué horario contestan el WhatsApp?]]`
- **Preguntas frecuentes:** las de la sección 4.
- **Botón:** Cerrar

### 2.8 Pie

- {marca}
- Morelia, Michoacán, México.
- WhatsApp +52 228 646 1167
- packoescalerashopify@gmail.com
- Íconos de contacto (sin texto, con nombre accesible): WhatsApp, correo, Instagram (https://www.instagram.com/packoescalera/) y TikTok (https://www.tiktok.com/@packoescalera).
- Política de privacidad, Política de reembolso, Política de envío y Términos del servicio. Son los mismos enlaces de 2.5; los que no existan no se muestran en producción.

## 3. Estados

| Estado | Texto |
|---|---|
| Cargando packs | Cargando precios |
| La API falla y se usa el respaldo | No pudimos actualizar los precios. El total exacto lo confirma Shopify antes de pagar. |
| Fallan la API y el respaldo | No pudimos cargar los packs. Revisa tu conexión y toca Reintentar, o escríbenos por WhatsApp. |
| Un pack agotado | Agotado |
| El pack elegido se agotó al llegar al resumen | Este pack se agotó. Elige otra cantidad. (Botón: Cambiar cantidad) |
| Todos agotados | Por ahora no hay tarjetas disponibles. Escríbenos por WhatsApp. |
| Abriendo el checkout (botón en carga) | Abriendo el pago de Shopify |
| El 3D no carga o no hay WebGL | Sin texto; se muestra la imagen fija con su texto alternativo. |
| Ruta desconocida en el hash | Sin texto; vuelve a la entrada. |
| Llega a `#/resumen` sin pack elegido | Sin texto; vuelve al primer paso que falte. |

## 4. Preguntas frecuentes

1. **¿Qué celulares pueden leer la tarjeta?**
   Los que tienen NFC. En iPhone XR, XS, SE de 2.ª generación y posteriores, basta con acercarlo con la pantalla encendida. En iPhone 7, 8 y X hay que abrir el lector NFC desde el Centro de control. En Android, el NFC tiene que estar activado, y no todos los modelos lo tienen.

2. **¿Y si el celular de mi cliente no tiene NFC?**
   No va a poder leerla. La tarjeta no lleva código QR.

3. **¿Mi cliente tiene que instalar una app?**
   No. El celular abre el link sin instalar nada.

4. **¿Las tarjetas llegan listas para usar?**
   Si las compras para tu negocio o para tus sucursales, sí: llegan programadas con tu link y bloqueadas. Si las compras para revender, llegan en blanco y te mandamos un video para programarlas. `[[FALTA: PR2c ¿Qué app se usa para programarlas?]]`

5. **¿Dónde consigo mi link de reseñas?**
   En tu Perfil de Negocio de Google, entra a Leer opiniones, luego a Obtener más opiniones y selecciona Copiar.

6. **¿Puedo poner un link distinto en cada tarjeta?**
   Sí. Elige Para varias sucursales y, después de pagar, mándanos por WhatsApp qué link va en cada tarjeta.

7. **¿Puedo cambiar el link después?**
   `[[FALTA: PR6b Si el negocio cambia de link con la tarjeta bloqueada, ¿qué pasa?]]`

8. **¿Puedo comprar una sola tarjeta?**
   Sí. Elige 1 tarjeta en la cantidad. Esta pregunta solo se muestra si existe esa variante en Shopify.

9. **¿Cómo puedo pagar?**
   Con tarjeta de crédito o débito Visa, Mastercard, American Express o UnionPay, con Apple Pay, Google Pay o Shop Pay, o en efectivo en OXXO. Por ahora no hay meses sin intereses. `[[FALTA: PA1 ¿Ya está activo Shopify Payments con estos medios?]]`

10. **¿Es seguro pagar?**
    El pago se hace en el checkout de Shopify. Esta página no recibe los datos de tu tarjeta.

11. **¿Cuánto cuesta el envío?**
    Lo calcula Shopify al pagar, según tu dirección. No hay envío gratis. Enviamos desde Morelia, Michoacán, a todo México, por FedEx o Paquetexpress.

12. **¿Cuánto tarda en llegar?**
    `[[FALTA: EN5 ¿Cuántos días hábiles tarda la preparación?]]` `[[FALTA: EN6 ¿Cuántos días tarda la entrega?]]`

13. **¿Puedo rastrear mi pedido?**
    `[[FALTA: EN7 ¿Siempre hay número de rastreo y por dónde llega?]]`

14. **¿Dan factura?**
    `[[FALTA: FA1 ¿Emiten factura (CFDI)?]]` `[[FALTA: FA2 ¿Cómo se pide?]]` `[[FALTA: FA3 ¿Hasta cuándo se puede pedir?]]`

15. **¿Qué pasa si una tarjeta no funciona?**
    Te la reponemos o te devolvemos tu dinero, y nosotros pagamos el envío. Escríbenos por WhatsApp. `[[FALTA: PV1 ¿Hasta cuántos días después de recibirla se puede reportar?]]` `[[FALTA: PV4 ¿En cuántos días hábiles se resuelve?]]`

16. **¿Aceptan cambios o devoluciones?**
    Solo si la tarjeta llega con falla. `[[FALTA: PV7 Revisar con un asesor la política sin cambios ni devoluciones frente a la LFPC]]`

17. **¿Hay precio especial para revendedores?**
    No. El precio es el mismo para todos. Las tarjetas llevan un solo diseño, sin marca blanca.

18. **¿La tarjeta me asegura más reseñas?**
    No. Hace más fácil llegar a tu página de reseñas. Lo que escriba cada cliente depende de su experiencia.

19. **¿Puedo dar un descuento a quien deje una reseña?**
    No. Google prohíbe ofrecer descuentos, regalos o pagos a cambio de reseñas, y pedirlas solo a los clientes contentos. Pídela a todos por igual.

## 5. Metadatos

- `<html lang="es-MX">`
- `<title>`: Tarjetas NFC para reseñas de Google | {marca}
- `description`: Tarjeta de acrílico con chip NFC. Tu cliente la toca con su celular y se abre tu página de reseñas de Google. Envíos desde Morelia a todo México.
- `og:title`: igual que `<title>`
- `og:description`: igual que `description`
- `og:image`: `[[FALTA: imagen para compartir; sale del arte final de la tarjeta]]`

## 6. Fuentes

| Afirmación | Fuente | Estado |
|---|---|---|
| Acrílico, 10 × 10 cm, 2 mm | Cliente (PR1) | Confirmado |
| Chip NTAG 213 | Shopify y cliente (PR1) | Confirmado |
| El NTAG 213 tiene 144 bytes de memoria de usuario (límite de 130 caracteres para el link) | Hoja de datos NXP NTAG213/215/216 | Confirmado, con margen para el encabezado NDEF |
| Un solo diseño | Cliente (PR9) | Confirmado |
| Sin QR impreso | Cliente (PR7) | Confirmado |
| Sin personalización impresa | Cliente (PR8) | Confirmado |
| Consumidor final: llega programada y bloqueada | Cliente (PR2, PR5) | Confirmado |
| Revendedor: llega en blanco, sin bloquear, con video | Cliente (PR2, PR5) | Confirmado |
| Varias sucursales: un link por tarjeta, por WhatsApp | Cliente (PR4) | Confirmado |
| El link se manda por WhatsApp | Cliente (PR3) | Confirmado |
| Cambio de link con tarjeta bloqueada | — | `[[FALTA: PR6b]]` |
| Se vende 1 tarjeta | Cliente (PR10) | Confirmado; falta crear la variante |
| Lectura en iPhone XR/XS/SE 2 y posteriores sin abrir nada; iPhone 7, 8 y X desde el Centro de control | Apple, "Models that support NFC Tag Reader" (support.apple.com/guide/iphone/aside/asd-nfc-reader) | Confirmado |
| Android requiere NFC activado; no todos lo tienen | Conocimiento general; no se promete compatibilidad universal | Redacción prudente |
| Precios de cada pack | Storefront API en vivo | Hoy son de prueba; los carga el cliente |
| IVA | — | `[[FALTA: PE3]]` |
| Precio igual para todos, sin mayoreo | Cliente (PE4, RE1) | Confirmado |
| Sin pedidos de más de 100 | Cliente (PE5) | Confirmado; la página no ofrece cotización |
| Medios: Visa, Mastercard, American Express (solo MXN) y UnionPay; Apple Pay, Google Pay y Shop Pay; OXXO de $10 a $10,000 MXN | Shopify Help Center, métodos de pago de Shopify Payments en México | Confirmado en documentación; activación `[[FALTA: PA1]]` |
| Sin meses sin intereses por ahora | Cliente (PA2) | Confirmado |
| Ningún pack pasa de $10,000 MXN | Cliente (PA4) | Confirmado |
| Vigencia del voucher OXXO | — | `[[FALTA: PA3]]` |
| El pago ocurre en el checkout de Shopify | Prueba del link de compra (redirige al checkout) | Verificado |
| La confirmación llega por correo | Notificación estándar de Shopify al confirmar el pedido | Confirmado (comportamiento por defecto) |
| Envío desde Morelia, Michoacán | Cliente (EN1) | Confirmado |
| FedEx o Paquetexpress | Cliente (EN2) | Confirmado |
| Cobertura en todo México | Cliente (EN3) | Confirmado |
| Sin envío gratis; lo calcula Shopify | Cliente (EN4) y brief | Confirmado |
| Preparación y tránsito | — | `[[FALTA: EN5, EN6]]` |
| Rastreo | Cliente: "puede ser" | `[[FALTA: EN7]]` |
| Factura | — | `[[FALTA: FA1, FA2, FA3]]` |
| Tarjeta con falla: reposición o reembolso, envío a cargo del vendedor | Cliente (PV1, PV4, PV5) | Confirmado; plazos `[[FALTA: PV1, PV4]]` |
| Sin cambios ni devoluciones, salvo falla | Cliente (PV2, PV3) | `[[FALTA: PV7]]` revisión legal |
| Políticas en Shopify | Storefront API: solo existe privacidad | `[[FALTA: PV6]]` |
| Pasos para copiar el link: Leer opiniones, Obtener más opiniones, Copiar | Google, "Crea un vínculo o un código QR para solicitar opiniones" (support.google.com/business/answer/16816815) | Confirmado |
| Google prohíbe incentivos, desalentar reseñas negativas y pedirlas solo a clientes contentos | Google, política de contenido de Maps, "Participación falsa" (support.google.com/contributionpolicy/answer/7400114) | Confirmado |
| WhatsApp +52 228 646 1167 | Cliente (NE4) | Confirmado; el link `wa.me` se prueba en la Fase 4 |
| Correo packoescalerashopify@gmail.com | Cliente (NE4) | Confirmado |
| Instagram y TikTok @packoescalera | Cliente (NE5) | Confirmado |
| Ciudad: Morelia | Cliente (NE3) | Confirmado |
| Nombre comercial: Escalera NFC | Cliente, vía desarrollador (2026-10-07) | Confirmado |
| Horario de atención | — | `[[FALTA: NE4b]]` |
| Testimonios | Cliente: no hay testimonios con permiso | No se muestran |

## 7. Lo que sigue en `[[FALTA]]`

| Código | Qué falta | Dónde aparece |
|---|---|---|
| NE4b | Horario de WhatsApp | Ayuda |
| PE3 | IVA incluido o no | Entrada, cantidad, resumen |
| PA1 | Shopify Payments activo con los medios listados | Resumen, FAQ 9 |
| PA3 | Vigencia del voucher OXXO y cuándo se prepara el pedido | Resumen |
| PR2b | Canal y momento del video para revendedores | Resumen, intención 1.3 |
| PR2c | App para programar | FAQ 4 |
| PR6b | Cambio de link con tarjeta bloqueada | Tu link, FAQ 7 |
| PR13 | Quién escribe primero por WhatsApp después de pagar | Resumen |
| EN5 | Días de preparación | Resumen, FAQ 12 |
| EN6 | Días de tránsito | Resumen, FAQ 12 |
| EN7 | Rastreo | Resumen, FAQ 13 |
| FA1, FA2, FA3 | Factura | Resumen, FAQ 14 |
| PV1 | Plazo para reportar una falla | Resumen, FAQ 15 |
| PV4 | Plazo de resolución | Resumen, FAQ 15 |
| PV6 | Políticas de reembolso, envío y términos | Resumen, pie |
| PV7 | Revisión legal de "sin cambios ni devoluciones" | FAQ 16 |
| og:image | Imagen para compartir | Metadatos |

Lo que no es texto pero bloquea el lanzamiento (tareas en Shopify, detalladas en `PREGUNTAS-CLIENTE.md`):
- Precios finales.
- Variante de 1 tarjeta.
- Pesos de las variantes.
- Tarifas de envío.
- Nombre de la tienda.
