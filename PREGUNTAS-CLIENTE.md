# Preguntas para el cliente

Todas las preguntas quedaron respondidas el 2026-10-08. Lo único que falta antes de publicar son las tareas en Shopify de abajo.

## Respuestas (2026-10-08)

| Código | Respuesta |
|---|---|
| NE1 | La marca es "Escalera NFC". |
| NE4b | Eliminado: no se muestra horario de WhatsApp. |
| PE3 | Eliminado: no se menciona el IVA. |
| PA1 | Tarjeta de crédito o débito, Apple Pay y Google Pay. Un solo pago, sin meses sin intereses. Sin OXXO, Shop Pay ni UnionPay. |
| PA3 | Eliminado (no hay OXXO). |
| PR2b | El video al revendedor se manda por WhatsApp. |
| PR2c | Se programan con la app NFC Tools. |
| PR6b | Eliminado: no se habla de cambiar el link. |
| PR13 | Ellos le escriben al comprador por WhatsApp para saber qué link va en cada tarjeta. |
| PR14 | Eliminado: el arte se queda como está. |
| EN5 | Eliminado: no se da plazo de preparación aparte. |
| EN6 | Entrega en 2 a 8 días hábiles. |
| EN7 | La guía y el número de rastreo se mandan por WhatsApp. |
| FA1 | Por el momento no emiten factura (FA2 y FA3 eliminados). |
| PV1, PV4 | Garantía de 5 años; una falla se reporta y se resuelve de inmediato. |
| PV7 | No hay cambios ni devoluciones, salvo error de fabricación. |
| Sucursales | Eliminada la opción "Para varias sucursales". Quien tenga varias compra como negocio y le escriben por WhatsApp para saber qué link va en cada tarjeta. |
| Medidas | 12 × 12 cm. No se mencionan acrílico ni chip. |
| Envío | Gratis a todo México. |

**Aviso sobre PV7:** la Ley Federal de Protección al Consumidor da cinco días hábiles para cancelar una compra a distancia (artículo 56). Conviene que un asesor revise el "sin cambios ni devoluciones". No es asesoría legal.

## Precios

- **Para mi negocio:** $449 MXN por tarjeta. En la página se eligen con + y − (máximo 3). 1 tarjeta $449, 2 tarjetas $898, 3 tarjetas $1,347.
- **Para revender (packs):** 10 tarjetas $1,590 ($159 c/u), 30 tarjetas $4,470 ($149 c/u), 50 tarjetas $6,950 ($139 c/u) y 100 tarjetas $12,900 ($129 c/u).
- La página muestra la ganancia estimada de cada pack si se revende cada tarjeta entre $350 y $500. La calcula con los precios de Shopify; si cambia un precio, la ganancia se actualiza sola.

## Tareas en Shopify (bloquean la publicación)

- Dejar las variantes del producto `tarjetas-nfc` así: **1 tarjeta** $449, **10 tarjetas** $1,590, **30 tarjetas** $4,470, **50 tarjetas** $6,950 y **100 tarjetas** $12,900. Borrar la de 20 tarjetas. El título de cada variante tiene que empezar con el número, porque la página lee de ahí la cantidad. Hoy no existe la de 1 tarjeta, así que "Para mi negocio" aparece como no disponible hasta que se cree.
- Después de cambiar las variantes, correr `npm run update:fallback` para actualizar el respaldo de precios.
- Corregir el peso de cada variante: 40 g por tarjeta (1 tarjeta 40 g, 10 tarjetas 400 g, 30 tarjetas 1.2 kg, 50 tarjetas 2 kg, 100 tarjetas 4 kg), más el empaque.
- Configurar el envío gratis a todo México.
- Activar Shopify Payments con tarjeta de crédito y débito, Apple Pay y Google Pay. Dejar apagados OXXO y los meses sin intereses.
- Pedir el teléfono como obligatorio en el checkout (Configuración → Checkout → Información de contacto). Sin ese dato no pueden escribirle al comprador por WhatsApp para pedirle el link ni mandarle el rastreo.
- (PV6) Crear las políticas de reembolso, envío y términos del servicio. Hoy solo existe la de privacidad. Es el único aviso "Falta responder" que queda en la página.
- Cambiar el nombre de la tienda a "Escalera NFC" (NE1).

## Dónde ver el link de reseñas de cada pedido

En el admin de Shopify → Pedidos → abrir el pedido. Arriba, en "Notas", aparece el uso ("Para mi negocio" o "Para revender") y el link de reseñas, o el aviso de que hay que escribirle por WhatsApp. Más abajo, en "Detalles adicionales", están los mismos datos por separado.
