# CONTENT.md

Texto final de la landing, en español de México, de tú. Este documento es la fuente de `src/content/content.es-MX.ts`. Última actualización con las respuestas del cliente: 2026-10-08.

## 0. Convenciones

- `[[FALTA: CÓDIGO pregunta]]` es un dato que falta. En la página se ve como un aviso visible: "Falta responder: pregunta (CÓDIGO)". Los códigos son los de `PREGUNTAS-CLIENTE.md`. Hoy solo queda PV6.
- `{variable}` se llena con datos de Shopify o del flujo:
  - `{n}`: número de tarjetas. En reventa se lee del título de la variante ("30 tarjetas"); en negocio es lo que eligió con + y −.
  - `{pack}`: "1 tarjeta" o "{n} tarjetas".
  - `{precio}`: precio de la variante de 1 tarjeta.
  - `{total}`: precio de la variante por la cantidad.
  - `{porTarjeta}`: precio del pack dividido entre `{n}`, redondeado a centavos.
  - `{desde}`: el `{porTarjeta}` más bajo entre los packs de reventa disponibles.
  - `{marca}`: Escalera NFC.
- Formato de dinero: `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })` más " MXN". Sin centavos cuando el monto es entero: "$1,250 MXN".
- Un botón conserva su nombre en todo el flujo: **Comprar tarjetas**, **Elegir cantidad**, **Agregar tu link**, **Revisar pedido**, **Ir a pagar**, **Volver**, **Ayuda**, **Cerrar**, **Reintentar**.

## 1. Intenciones del comprador

### 1.1 Para mi negocio
- **Quién es:** dueño de uno o varios locales.
- **Qué compra:** tarjetas sueltas a $449 MXN cada una, de 1 a 3, con + y −. Usa la variante "1 tarjeta" de Shopify con la cantidad elegida.
- **Lo que pasa después:** pega su link en la página o marca que le escriban por WhatsApp. El vendedor le escribe por WhatsApp para confirmar qué link va en cada tarjeta (sirve también para quien tiene varias sucursales). Recibe las tarjetas programadas y bloqueadas.

### 1.2 Para revender
- **Quién es:** una agencia o un emprendedor que vende las tarjetas a otros negocios.
- **Qué compra:** un pack de 10, 30, 50 o 100 tarjetas. Mientras más grande el pack, menos cuesta cada tarjeta.
- **Qué necesita saber:** que le llegan sin programar y sin bloquear, que recibe por WhatsApp un video para programarlas con NFC Tools, que no hay marca blanca, y cuánto puede ganar.
- **Ganancia estimada:** cada pack muestra cuánto gana si revende cada tarjeta entre $350 y $500 MXN: `350 × n − precio` a `500 × n − precio`. Con los precios del cliente: 10 tarjetas $1,910 a $3,410; 30 tarjetas $6,030 a $10,530; 50 tarjetas $10,550 a $18,050; 100 tarjetas $22,100 a $37,100.

La opción "Para varias sucursales" se eliminó (cliente, 2026-10-08).

### Lo que viaja al pedido

Viaja en el cart permalink (`/cart/{variante}:{cantidad}?attributes[clave]=valor&note=...`). Shopify lo adjunta al pedido sin backend propio.

| Atributo | Valor |
|---|---|
| `intencion` | "Para mi negocio" o "Para revender" |
| `link_google` | El link pegado. Solo con "Para mi negocio", y solo si lo pegó |
| `link_por_whatsapp` | "Sí", cuando no pegó link |

Además va `note`, la nota del pedido, con lo mismo en texto legible: "Uso: …", "Link de reseñas: …" o "No puso link: escribirle por WhatsApp para saber qué link va en cada tarjeta."

**Dónde se ve:** admin de Shopify → Pedidos → abrir el pedido. La nota aparece arriba, en "Notas"; los atributos, en "Detalles adicionales". Es el comportamiento estándar de Shopify.

## 2. Pantallas

### 2.1 Entrada (`#/`)

**Titular:** Tarjeta NFC para tus reseñas de Google

**Bajada:** Tu cliente acerca su celular a la tarjeta y se abre tu página de reseñas en Google. No tiene que instalar nada.

**Nota de medida** (texto chico): Mide 12 × 12 cm.

**Precio:** {precio} MXN por tarjeta. Al lado: Disponible / Agotado.
**Debajo:** Para revender, desde {desde} MXN por tarjeta.
**Nota de precio:** Precios en pesos mexicanos.

**Datos de confianza** (lista con íconos):
- Pagas en el checkout seguro de Shopify.
- Envío gratis a todo México.
- Para tu negocio, llega programada con tu link.
- Garantía de 5 años.

**Cómo funciona** (numerada):
1. Pones la tarjeta en tu mostrador, mesa o entrada.
2. Tu cliente acerca su celular a la tarjeta.
3. Se abre tu página de reseñas de Google.

**Botón:** Comprar tarjetas

**Texto alternativo de la imagen fija:** Tarjeta NFC de 12 × 12 cm para reseñas de Google.

### 2.2 Para qué la quieres (`#/intencion`)

**Titular:** ¿Para qué la quieres?

| Opción | Descripción |
|---|---|
| Para mi negocio | Para tu mostrador, mesas o entrada. Te llegan programadas con tu link de reseñas. |
| Para revender | Packs de 10 a 100 tarjetas sin programar, con un video para que las programes tú. |

**Botón:** Elegir cantidad
**Error sin selección:** Elige para qué la quieres para seguir.

### 2.3 Cantidad (`#/cantidad`)

**Titular:** Elige cuántas tarjetas

*Para mi negocio:*
- Bajada: Cuenta los lugares donde la vas a poner: mostrador, mesas, entrada.
- Contador: botones − y + (nombres accesibles "Una tarjeta menos" y "Una tarjeta más"), de 1 a 3 (máximo 3; con más, se elige Para revender). En el centro, {pack}. Al lado: {precio} MXN por tarjeta y el total, {total} MXN.
- Si no existe la variante de 1 tarjeta o está agotada: Por ahora no hay tarjetas disponibles. Escríbenos por WhatsApp.
- Botón: Agregar tu link

*Para revender:*
- Bajada: Mientras más grande el pack, menos cuesta cada tarjeta.
- Fila de pack: {pack}, {total} MXN, {porTarjeta} MXN por tarjeta, y "Ganancia: {desde} a {hasta} MXN".
- Bajo la lista: En los packs más grandes cada tarjeta cuesta menos. (solo si de verdad baja) y Ganancia estimada si revendes cada tarjeta entre $350 y $500 MXN.
- Error sin selección: Elige una cantidad para seguir.
- Botón: Revisar pedido

**Nota de precio:** Precios en pesos mexicanos. Envío gratis a todo México.

### 2.4 Tu link (`#/personaliza`)

Solo con "Para mi negocio".

**Titular:** Tu link de reseñas de Google
**Bajada:** Programamos tus tarjetas con este link y las bloqueamos para que nadie lo pueda cambiar.
**Campo:** Link de reseñas. Ejemplo: https://g.page/r/... Ayuda: En tu Perfil de Negocio de Google, entra a Leer opiniones, luego a Obtener más opiniones y selecciona Copiar.
**Casilla:** No lo tengo o quiero links distintos: escríbanme por WhatsApp
**Aviso:** Revisa que el link abra la página de reseñas de tu negocio.

**Errores:**
- Vacío y sin la casilla: Pega tu link o marca que te escribamos por WhatsApp.
- No es de Google (`g.page`, `google.com`, `goo.gl`, `maps.app.goo.gl`): Ese link no es de Google. Cópialo otra vez desde tu Perfil de Negocio.
- Más de 130 caracteres: Ese link es muy largo para la tarjeta. Usa el que da Obtener más opiniones.

**Botón:** Revisar pedido

### 2.5 Resumen (`#/resumen`)

**Titular:** Revisa tu pedido

| Renglón | Valor | Acción |
|---|---|---|
| Uso | Para mi negocio / Para revender | Cambiar uso |
| Cantidad | {pack} | Cambiar cantidad |
| Link (solo negocio) | {link}, o "Te escribimos por WhatsApp después de pagar" | Cambiar link |
| Envío | Gratis a todo México. | — |
| Total | {total} MXN | — |

**Pie:** Pago seguro en Shopify. Esta página no ve los datos de tu tarjeta. Íconos: Visa, Mastercard, American Express, Apple Pay, Google Pay.

**Qué pasa después** (numerada):

*Para mi negocio:*
1. Al presionar Ir a pagar, pasas al pago de Shopify, en otra página.
2. Pagas y te llega la confirmación por correo.
3. Te escribimos por WhatsApp para confirmar qué link va en cada tarjeta.
4. Programamos tus tarjetas y las bloqueamos.
5. Las enviamos por FedEx o Paquetexpress. Te llegan en 2 a 8 días hábiles. Te mandamos la guía y el número de rastreo por WhatsApp.

*Para revender:*
1. Al presionar Ir a pagar, pasas al pago de Shopify, en otra página.
2. Pagas y te llega la confirmación por correo.
3. Te mandamos por WhatsApp el video para programarlas con la app NFC Tools.
4. Las enviamos sin programar y sin bloquear, por FedEx o Paquetexpress. Te llegan en 2 a 8 días hábiles. Te mandamos la guía y el número de rastreo por WhatsApp.

**Bloques:**
- **Pagas en Shopify:** El pago se hace en el checkout de Shopify. Esta página no ve ni guarda los datos de tu tarjeta.
- **Formas de pago:** Tarjeta de crédito o débito (Visa, Mastercard o American Express), Apple Pay o Google Pay. Se paga en una sola exhibición, sin meses sin intereses.
- **Envío:** Enviamos gratis a todo México, por FedEx o Paquetexpress. Te llegan en 2 a 8 días hábiles. Te mandamos la guía y el número de rastreo por WhatsApp.
- **Factura:** Por el momento no emitimos factura.
- **Si una tarjeta falla:** Garantía de 5 años. Si una tarjeta falla, escríbenos por WhatsApp en cuanto lo notes y la resolvemos de inmediato: te la reponemos o te devolvemos tu dinero, y nosotros pagamos el envío.

**Políticas:** Política de privacidad, Política de reembolso, Política de envío, Términos del servicio (`https://{dominio}/policies/...`). Solo se muestran las que existen. `[[FALTA: PV6 Crear en Shopify las políticas de reembolso, envío y términos del servicio]]`

**Botón:** Ir a pagar
**Texto bajo el botón:** Te llevamos al checkout de Shopify. Ahí pones tu dirección de entrega.

### 2.6 Barra inferior fija (móvil)

- Entrada: {precio} MXN por tarjeta. y el botón Comprar tarjetas.
- Sin cantidad: Todavía no eliges cantidad.
- Con cantidad: arriba {pack}, abajo {total} MXN.
- Botón: el principal del paso.

### 2.7 Ayuda (panel)

- Escribir por WhatsApp (`https://wa.me/522286461167`, texto "Hola, tengo una pregunta sobre las tarjetas NFC."). Número visible: +52 228 646 1167.
- Escribir un correo (`mailto:packoescalerashopify@gmail.com`).
- Sin horario de atención (NE4b eliminado).
- Preguntas frecuentes: sección 4.

### 2.8 Pie

{marca} · Morelia, Michoacán, México. · Íconos de WhatsApp, correo, Instagram (@packoescalera), TikTok (@packoescalera) y Ayuda.

## 3. Estados

| Estado | Texto |
|---|---|
| Cargando | Cargando precios |
| Falla la API y se usa el respaldo | No pudimos actualizar los precios. El total exacto lo confirma Shopify antes de pagar. |
| Fallan la API y el respaldo | No pudimos cargar los packs. Revisa tu conexión y toca Reintentar, o escríbenos por WhatsApp. |
| Pack agotado | Agotado |
| El pack se agotó al llegar al resumen | Este pack se agotó. Elige otra cantidad. |
| Todo agotado, o no existe la variante de 1 tarjeta (negocio) | Por ahora no hay tarjetas disponibles. Escríbenos por WhatsApp. |
| Abriendo el checkout | Abriendo el pago de Shopify |

## 4. Preguntas frecuentes

1. **¿Qué celulares pueden leer la tarjeta?** Los que tienen NFC. En iPhone XR, XS, SE de 2.ª generación y posteriores, basta con acercarlo con la pantalla encendida. En iPhone 7, 8 y X hay que abrir el lector NFC desde el Centro de control. En Android, el NFC tiene que estar activado, y no todos los modelos lo tienen.
2. **¿Y si el celular de mi cliente no tiene NFC?** No va a poder leerla. La tarjeta no lleva código QR.
3. **¿Mi cliente tiene que instalar una app?** No. El celular abre el link sin instalar nada.
4. **¿Las tarjetas llegan listas para usar?** Si las compras para tu negocio, sí: llegan programadas con tu link y bloqueadas. Si las compras para revender, llegan en blanco y te mandamos por WhatsApp un video para programarlas con la app NFC Tools.
5. **¿Dónde consigo mi link de reseñas?** En tu Perfil de Negocio de Google, entra a Leer opiniones, luego a Obtener más opiniones y selecciona Copiar. Si no lo encuentras, después de pagar te escribimos por WhatsApp y te ayudamos.
6. **¿Puedo poner un link distinto en cada tarjeta?** Sí, por ejemplo si tienes varias sucursales. Después de pagar te escribimos por WhatsApp para saber qué link va en cada tarjeta.
7. **¿Puedo comprar una sola tarjeta?** Sí. Elige Para mi negocio y con + y − eliges cuántas quieres. (Solo si existe la variante de 1 tarjeta.)
8. **¿Cómo puedo pagar?** Tarjeta de crédito o débito (Visa, Mastercard o American Express), Apple Pay o Google Pay. Se paga en una sola exhibición, sin meses sin intereses.
9. **¿Es seguro pagar?** El pago se hace en el checkout de Shopify. Esta página no ve ni guarda los datos de tu tarjeta.
10. **¿Cuánto cuesta el envío?** Enviamos gratis a todo México, por FedEx o Paquetexpress.
11. **¿Cuánto tarda en llegar?** De 2 a 8 días hábiles.
12. **¿Puedo rastrear mi pedido?** Sí. Te mandamos la guía y el número de rastreo por WhatsApp.
13. **¿Dan factura?** Por el momento no emitimos factura.
14. **¿Qué pasa si una tarjeta no funciona?** Garantía de 5 años. Si una tarjeta falla, escríbenos por WhatsApp en cuanto lo notes y la resolvemos de inmediato: te la reponemos o te devolvemos tu dinero, y nosotros pagamos el envío.
15. **¿Aceptan cambios o devoluciones?** No hay cambios ni devoluciones, salvo que la tarjeta tenga un error de fabricación.
16. **¿Hay precio especial para revendedores?** Sí. Para revender se venden packs, y mientras más grande el pack, menos cuesta cada tarjeta. Llevan un solo diseño, sin marca blanca.
17. **¿La tarjeta me asegura más reseñas?** No. Hace más fácil llegar a tu página de reseñas. Lo que escriba cada cliente depende de su experiencia.
18. **¿Puedo dar un descuento a quien deje una reseña?** No. Google prohíbe ofrecer descuentos, regalos o pagos a cambio de reseñas, y pedirlas solo a los clientes contentos. Pídela a todos por igual.

## 5. Metadatos

- `<html lang="es-MX">`
- `<title>` y `og:title`: Tarjetas NFC para reseñas de Google | {marca}
- `description` y `og:description`: Tarjeta NFC para reseñas de Google. Tu cliente la toca con su celular y se abre tu página de reseñas. Envío gratis a todo México.
- `og:image`: pendiente; sale del arte final de la tarjeta.

## 6. Fuentes

| Afirmación | Fuente |
|---|---|
| 12 × 12 cm; no se mencionan acrílico ni chip | Cliente, 2026-10-08 |
| Límite de 130 caracteres para el link (NTAG 213, 144 bytes de usuario) | Hoja de datos NXP NTAG213/215/216 |
| Un solo diseño, sin QR, sin personalización impresa | Cliente (PR7, PR8, PR9) |
| Negocio: programada y bloqueada; reventa: en blanco, con video por WhatsApp, app NFC Tools | Cliente (PR2, PR5, PR2b, PR2c) |
| El vendedor escribe primero por WhatsApp para pedir los links | Cliente (PR13) |
| Precios: $449 por tarjeta; packs de 10, 30, 50 y 100 | Cliente, 2026-10-08. En la página salen de Shopify |
| Rango de reventa $350 a $500 por tarjeta | Cliente, 2026-10-08 |
| Pagos: tarjeta de crédito y débito, Apple Pay, Google Pay; una sola exhibición | Cliente (PA1) |
| Envío gratis a todo México por FedEx o Paquetexpress, 2 a 8 días hábiles, rastreo por WhatsApp | Cliente (EN2, EN3, EN6, EN7) |
| Sin factura por el momento | Cliente (FA1) |
| Garantía de 5 años; resolución inmediata | Cliente (PV1, PV4) |
| Sin cambios ni devoluciones salvo error de fabricación | Cliente (PV7). Ver aviso legal en `PREGUNTAS-CLIENTE.md` |
| Lectura en iPhone | Apple, "Models that support NFC Tag Reader" |
| Pasos para copiar el link de reseñas | Google, support.google.com/business/answer/16816815 |
| Política de Google sobre incentivos | Google, support.google.com/contributionpolicy/answer/7400114 |
| Contacto, ciudad y redes | Cliente (NE3, NE4, NE5) |
