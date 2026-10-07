# DESIGN.md

## Decisión vigente: Vitrina (2026-10-07)

Reemplaza a la dirección A. El cliente pidió un estilo más moderno, que se note que es una tienda, con degradados sobrios, logotipo "Escalera NFC" y una tarjeta 3D más grande y de mejor calidad.

- **Estructura:** encabezado azul noche con el logotipo. Arriba, una vitrina oscura con degradado radial azul donde vive la tarjeta 3D. Abajo, una hoja clara con esquinas redondeadas que monta sobre la vitrina; en escritorio son dos columnas.
- **Paleta:**

| Nombre | Hex | Uso |
|---|---|---|
| Noche | `#0a1638` | Encabezado, pie, borde de la vitrina |
| Vitrina | `#2a4bb4` a `#13256e` a `#070f2e` | Degradado radial detrás de la tarjeta |
| Fondo | `#f4f6fb` | Hoja de compra |
| Tinta | `#0e1726` | Texto (16.6:1) |
| Tinta 2 | `#4a5568` | Texto secundario (7:1) |
| Marca | `#3b6cff` a `#1b3bb5` | Botones y selección, en degradado (texto blanco 5.5:1 o más) |
| Disponible | `#0f7a55` | Disponibilidad y pago seguro |

- **Tipografía:** Plus Jakarta Sans variable (OFL), alojada en el proyecto. 800 para titulares y precios, 600 y 700 para etiquetas, 400 para texto.
- **Componentes de tienda:**
  - etiquetas de ficha técnica;
  - precio destacado con disponibilidad;
  - lista de confianza con íconos;
  - packs en mosaico seleccionable;
  - resumen como carrito, con miniatura y medios de pago en texto;
  - barra de compra fija.
- **Tarjeta 3D:**
  - acrílico con canto pulido y biselado, capa brillante sobre el arte impreso;
  - entorno de estudio, sombras suaves en tiempo real y flotación suave;
  - en los pasos de una sola tarjeta, se levanta y mira a la cámara;
  - en los pasos de cantidad, descansa sobre el piso y la pila crece a escala real, con una franja por tarjeta.
- **Momento del tap:** un teléfono modelado entra, se apoya sobre el ícono NFC del arte, salen dos ondas y se encienden cinco estrellas en su pantalla.
- **Se mantiene:** sin logos de terceros salvo el arte del producto, medios de pago nombrados con texto, movimiento reducido con fundidos, contraste AA.

Lo que sigue abajo es el historial de la Fase 2 y queda como referencia.

## Decisión (elegida por el cliente)

**Dirección A, Mostrador, con la pila de B.**
- Todo lo visual es de A: paleta, Atkinson Hyperlegible Next, layout, tap visto desde arriba.
- En el paso de cantidad, la cámara baja para ver las tarjetas de canto y la pila crece a su altura real (2 mm por tarjeta). Debajo va el texto "{n} tarjetas: {alto} de alto".
- La pila pasa a ser un segundo momento destacado, más corto que el tap.
- Nada más se toma de B: ni la serif, ni la mono, ni el formato de nota.

## Punto de partida

- **El objeto:** un cuadrado de acrílico de 10 × 10 cm y 2 mm, con un solo diseño, que vive sobre un mostrador.
- **El comprador:** un dueño de negocio que entra desde el celular y quiere saber tres cosas: qué recibe, cuánto cuesta y si es seguro pagar.
- **De dónde sale la confianza:**
  - Datos concretos: medidas, precio por tarjeta, desde dónde se envía.
  - Un flujo que no esconde nada.
  - Una pantalla que se ve tranquila.
- **Dónde va la audacia:** solo en un momento 3D por dirección. Todo lo demás queda quieto.

## Reglas comunes a las tres direcciones

- **Texto:** capitalización de oración siempre. Sin etiquetas en mayúsculas ni letterspacing.
- **Lista de packs:** filas separadas por una línea fina, no tarjetas con sombra. La fila elegida cambia de fondo y muestra una marca de selección. No usa elevación.
- **Numeración:** solo la llevan las secuencias reales (cómo funciona y qué pasa después).
- **Animación:** sin animaciones de entrada por sección. Al cambiar de paso, un solo fundido de 150 ms. Con `prefers-reduced-motion`, cambios instantáneos.
- **Hover:** solo cambia el color de botones y filas, sin movimiento.
- **Tamaños:** áreas táctiles de 44 px o más. Tamaño base 17 px en móvil y 18 px en escritorio.
- **Fuentes:** en `src/assets/fonts/`, en WOFF2, recortadas a latín básico más `áéíóúüñ¿¡×$,.` y cifras. `font-display: swap`.
- **Barra inferior fija en móvil:** pack y total a la izquierda, botón principal a la derecha, con `env(safe-area-inset-bottom)`.
- **Escritorio:** el mismo flujo en dos columnas. La tarjeta 3D queda fija en una columna y los pasos van en la otra. Ningún contenido es exclusivo del escritorio.
- **"Falta responder":** un aviso con borde punteado y el código visible. Cada dirección lo pinta con su color de aviso. Se tiene que notar, pero no confundirse con un error del comprador.

---

## Dirección A: Mostrador

**En una frase:** la pantalla es la superficie del mostrador y la tarjeta se ve desde arriba, apoyada en ella, como la vería el dueño del local.

### Paleta

| Nombre | Hex | Uso | Contraste |
|---|---|---|---|
| Formica | `#DDE0DA` | Fondo general, la superficie | — |
| Mostrador claro | `#EEF0EC` | Paneles (ayuda, resumen), fila elegida | — |
| Tinta | `#1D2528` | Texto principal | 11.7:1 sobre Formica |
| Grafito | `#4A5559` | Texto secundario, líneas | 5.8:1 sobre Formica |
| Verde botella | `#0E5A4F` | Botón principal, foco, selección | 8.1:1 con texto blanco |
| Estrella | `#E8A900` | Solo las cinco estrellas del momento del tap. Nunca en texto | Decorativo |

El aviso "Falta responder" usa borde punteado en Grafito y fondo Mostrador claro.

### Tipografía

Una sola familia: **Atkinson Hyperlegible Next** (Braille Institute, SIL OFL).
- 700 para titulares.
- 400 para texto.
- Cifras tabulares en precios.

**Por qué:**
- Se diseñó para que no se confundan letras parecidas (`I l 1`, `0 O`, `rn m`). Eso importa justo donde el comprador no se puede equivocar: el precio, la cantidad y el link de Google que pega.
- El público no es diseñador y muchos leen en celulares con la pantalla al mínimo de brillo, en el local.
- Tiene peso 700 sin ser display, así que el titular no grita.

### Layout

**Móvil, 360 px.** Todo el contenido se alinea a una sola guía izquierda de 20 px. La tarjeta ocupa el tercio superior.

```
┌────────────────────────────┐
│                     Ayuda  │
│                            │
│        ┌──────────┐        │  tarjeta vista desde arriba,
│        │  arte    │        │  apoyada en la Formica,
│        │ tarjeta  │        │  con sombra de contacto
│        └──────────┘        │
│                            │
│ Tarjeta NFC para tus       │  titular a la guía de 20 px
│ reseñas de Google          │
│ Tu cliente acerca su       │
│ celular y se abre tu...    │
│                            │
│ 1  Pones la tarjeta...     │
│ 2  Tu cliente acerca...    │
│ 3  Se abre tu página...    │
│ ────────────────────────── │
│ Acrílico 10 × 10 cm, 2 mm  │
│ Desde $XX MXN por tarjeta  │
│ ┌────────────────────────┐ │
│ │    Comprar tarjetas    │ │
│ └────────────────────────┘ │
└────────────────────────────┘

#/cantidad
┌────────────────────────────┐
│ Volver              Ayuda  │
│     ┌────────┐             │  la pila crece a la izquierda;
│     │▤▤▤▤▤▤▤▤│             │  la tarjeta se ve un poco ladeada
│     └────────┘             │
│ Elige cuántas tarjetas     │
│ ────────────────────────── │
│ 1 tarjeta          $XX     │
│ ────────────────────────── │
│ 10 tarjetas       $XXX   ● │  fila elegida: fondo Mostrador
│ $XX por tarjeta            │  claro y marca de selección
│ ────────────────────────── │
│ 20 tarjetas        Agotado │
│ ────────────────────────── │
│ 50 tarjetas       $XXX     │
│ ────────────────────────── │
│ Precios en pesos... FALTA  │
├────────────────────────────┤
│ 10 tarjetas   ┌──────────┐ │  barra fija
│ $XXX MXN      │Agregar tu│ │
│               │   link   │ │
└───────────────┴──────────┴─┘
```

**Escritorio, 1440 px.** Dos columnas sobre la misma Formica. La izquierda (7/12) tiene la tarjeta fija, vista desde arriba, más grande. La derecha (5/12) tiene los pasos, alineados a su propia guía izquierda, con un ancho máximo de 520 px. La barra fija desaparece y el total con el botón cierra la columna derecha.

```
┌──────────────────────────────────────────────────────────────┐
│ {marca}                                               Ayuda  │
│                                                              │
│        ┌────────────────┐         │ Tarjeta NFC para tus     │
│        │                │         │ reseñas de Google        │
│        │   arte de la   │         │ Tu cliente acerca su...  │
│        │    tarjeta     │         │                          │
│        │                │         │ 1  Pones la tarjeta...   │
│        └────────────────┘         │ 2  Tu cliente acerca...  │
│                                   │ 3  Se abre tu página...  │
│                                   │ ──────────────────────── │
│                                   │ Acrílico 10 × 10 cm, 2mm │
│                                   │ Desde $XX MXN            │
│                                   │ [ Comprar tarjetas ]     │
└──────────────────────────────────────────────────────────────┘
```

### La tarjeta 3D

- **Cámara:** cenital, a unos 15° de inclinación.
- **Material:** frente y dorso con el arte real. El canto lleva un material distinto, algo más claro y translúcido, con mapa de entorno.
- **Sombra:** una sola sombra de contacto horneada en textura, sin sombras en tiempo real.
- **Luz:** ambiente más una direccional suave.

**El momento memorable es el tap, visto desde arriba.**
1. La silueta de un teléfono, solo el contorno en Tinta y la pantalla oscura, entra desde el borde inferior de la pantalla del comprador, donde tiene el pulgar.
2. Se apoya sobre la tarjeta.
3. Desde ese punto sale un solo anillo que se expande sobre la Formica, como una onda en la superficie, no un brillo.
4. En la pantalla de la silueta se encienden cinco estrellas en Estrella, una tras otra.
5. La silueta se retira.

Dura unos 2.4 s y pasa una sola vez, en la entrada. El botón está disponible desde el primer instante.

**Los otros momentos, sobrios:**
- **Pila:** las tarjetas se apilan con su espesor real. Por encima de 20 se representa la altura con una pila continua, sin 100 mallas.
- **Salida al pago:** la tarjeta se desliza hacia el botón y la página navega.

### Por qué sirve aquí

Muestra el producto donde va a vivir. El comprador entiende el uso sin leer: "esto va en mi mostrador y mis clientes lo tocan". La Formica gris verdosa es una superficie de negocio real; no es crema, no es blanco clínico y no es oscuro.

---

## Dirección B: Remisión

**En una frase:** la página se lee como una nota de remisión que se va llenando. Cada paso completa un renglón del pedido, y la tarjeta está a escala real junto a una regla.

### Paleta

| Nombre | Hex | Uso | Contraste |
|---|---|---|---|
| Papel bond | `#F3F4F1` | Fondo. Blanco frío, no crema | — |
| Renglón | `#C9CED6` | Líneas de la nota, regla | Decorativo |
| Negro de impresión | `#1A1A1A` | Texto principal | 15.8:1 |
| Azul de copia | `#213F84` | Botón principal, enlaces, valores llenados por el comprador | 9.0:1 sobre Papel; 10:1 con blanco |
| Gris de formulario | `#5A6070` | Texto secundario, nombres de campo | 5.7:1 |
| Rojo de corrección | `#A1281A` | Solo errores y "Agotado" | 6.7:1 |

El aviso "Falta responder" va con borde punteado en Azul de copia y el texto en Gris de formulario. Es un campo en blanco de la nota, que es justo lo que es.

### Tipografía

Dos familias, muy distintas:
- **Source Serif 4** (Adobe, OFL), en su corte de texto, de bajo contraste, 600 y 400, para titulares y texto.
- **IBM Plex Mono** (IBM, OFL), 400 y 500, solo para cifras y valores: medidas, precios, cantidades, el link pegado.

**Por qué:**
- La serif de bajo contraste se lee como documento comercial, no como revista.
- La mono separa lo que es dato de lo que es explicación. Un precio en mono se lee como cifra de factura, con alineación tabular en la lista de packs.
- El link de Google en mono deja ver cada carácter, lo que ayuda a detectar errores.

### Layout

**Móvil, 360 px.** Columna única. Cada pantalla tiene dos zonas: arriba la tarjeta a escala con la regla, abajo el renglón activo. Los renglones ya llenados se apilan arriba del activo como una nota que crece. Alineación: nombres de campo a la izquierda y valores en mono a la derecha, en la misma línea de base.

```
#/cantidad
┌────────────────────────────┐
│ Volver              Ayuda  │
│ ┌──┐ ┌──┐ ┌──┐             │  pila de cantos con regla
│ │  │ │  │ │  │  ┊ 20 mm    │  en mm a la derecha:
│ └──┘ └──┘ └──┘  ┊          │  "10 tarjetas: 20 mm de alto"
│ ────────────────────────── │
│ Uso        Para mi negocio │  renglón ya llenado (Azul)
│ ────────────────────────── │
│ Elige cuántas tarjetas     │  renglón activo
│                            │
│ 1 tarjeta         $   XX   │  precios en mono,
│ 10 tarjetas    ●  $  XXX   │  alineados al decimal
│   $XX.XX por tarjeta       │
│ 20 tarjetas       Agotado  │  Rojo de corrección
│ 50 tarjetas       $  XXX   │
│ 100 tarjetas      $ XXXX   │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│ ┆ Falta responder: ¿IVA? ┆ │
│ ┆ (PE3)                  ┆ │
├────────────────────────────┤
│ 10 tarjetas   [Agregar tu  │
│ $XXX MXN        link]      │
└────────────────────────────┘
```

**Escritorio, 1440 px.** La izquierda es la nota completa, con todos los renglones visibles y los pendientes en gris. La derecha es la tarjeta a escala sobre la regla. En una pantalla de 96 dpi, 10 cm se ven con su tamaño de referencia aproximado: es un apoyo visual, no una promesa de medida exacta.

```
┌──────────────────────────────────────────────────────────────┐
│ {marca}                                               Ayuda  │
│ ┌───────────────────────────┐                                │
│ │ Uso      Para mi negocio  │       ┌────────────────┐  ┊0   │
│ │ ───────────────────────── │       │                │  ┊    │
│ │ Cantidad 10 tarjetas      │       │  tarjeta a     │  ┊5   │
│ │ ───────────────────────── │       │  escala        │  ┊    │
│ │ Link     (pendiente)      │       │                │  ┊10cm│
│ │ ───────────────────────── │       └────────────────┘       │
│ │ Total        $ XXX MXN    │                                │
│ │ [ Revisar pedido ]        │                                │
│ └───────────────────────────┘                                │
└──────────────────────────────────────────────────────────────┘
```

### La tarjeta 3D

- **Cámara:** frontal, ortográfica, para que la escala sea honesta. Una perspectiva leve solo en la pila.
- **Material:** acrílico con mapa de entorno neutro y canto marcado. La regla es parte de la escena, como geometría de líneas, no un adorno.

**El momento memorable es la pila a escala real.**
1. Al elegir cantidad, la cámara gira 80° hasta ver las tarjetas de canto.
2. La pila crece hasta su altura real: 2 mm por tarjeta, con 100 tarjetas son 20 cm.
3. La regla se reetiqueta en cm: "100 tarjetas: 20 cm de alto".

Es un dato verificable convertido en imagen. El dueño se imagina la caja que va a recibir.

**Los otros momentos, sobrios:**
- **Tap:** un teléfono en contorno toca la tarjeta y aparecen cinco estrellas, todo plano y sin onda.
- **Salida al pago:** la nota se "firma" (el renglón Total se subraya) y la página navega.

### Por qué sirve aquí

Un dueño de negocio vive entre notas, facturas y remisiones. Este formato le resulta familiar, pone los datos al frente y hace visible lo pendiente.

---

## Dirección C: Canto

**En una frase:** la identidad sale del canto del acrílico, ese filo pulido de 2 mm que concentra la luz y se ve más claro que la cara. La tarjeta empieza de perfil, como una línea, y gira para mostrarse.

### Paleta

| Nombre | Hex | Uso | Contraste |
|---|---|---|---|
| Aluminio | `#E4E6E7` | Fondo, gris frío de exhibidor | — |
| Grafito | `#23272A` | Texto principal | 12.0:1 |
| Gris perfil | `#5F676B` | Texto secundario | 4.6:1 |
| Canto | `#7FBFAE` | Fondo de la fila elegida, canto de la tarjeta. Nunca texto sobre Aluminio | 7.1:1 con Grafito encima |
| Canto profundo | `#2F6F62` | Botón principal, foco, enlaces | 5.9:1 con blanco; 4.7:1 sobre Aluminio |
| Blanco | `#FFFFFF` | Paneles de ayuda y resumen | — |

El aviso "Falta responder" lleva borde punteado en Canto profundo sobre Blanco.

### Tipografía

Una familia, en dos anchos: **Archivo** (Omnibus-Type, OFL), variable en peso y ancho.
- Titulares en ancho 87 (semicondensado), peso 700.
- Texto en ancho 100, peso 400.

**Por qué:**
- El español de México trae palabras largas ("programamos", "Paquetexpress", "personalización"). A 360 px, un titular de 8 palabras en una grotesca normal se parte en 4 renglones; semicondensado entra en 2 o 3 sin bajar de tamaño.
- Usar un solo archivo variable reduce el peso de las fuentes.
- Su origen como grotesca de periódico le da un tono informativo, no publicitario.

### Layout

**Móvil, 360 px.** La tarjeta vive en una franja horizontal arriba, de 30 % de alto, y casi siempre se ve de tres cuartos. El contenido va abajo, en una columna con margen de 20 px. La franja de la tarjeta y el contenido comparten el mismo borde izquierdo.

```
#/ (entrada, antes del giro)
┌────────────────────────────┐
│                     Ayuda  │
│                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━   │  la tarjeta de perfil:
│                            │  una línea de 2 mm, color Canto
│ Tarjeta NFC para tus       │
│ reseñas de Google          │  Archivo semicondensado
│ ...                        │
│ [ Comprar tarjetas ]       │
└────────────────────────────┘

#/intencion
┌────────────────────────────┐
│ Volver              Ayuda  │
│      ╱‾‾‾‾‾‾‾‾╱            │  tarjeta de tres cuartos
│     ╱________╱             │
│ ¿Para qué la quieres?      │
│ ────────────────────────── │
│ Para mi negocio          ● │  fila elegida: fondo Canto
│ Para tu mostrador, mesas...│
│ ────────────────────────── │
│ Para varias sucursales     │
│ Cada tarjeta puede...      │
│ ────────────────────────── │
│ Para revender              │
│ Te llegan sin programar... │
├────────────────────────────┤
│ Para mi negocio [Elegir    │
│                  cantidad] │
└────────────────────────────┘
```

**Escritorio, 1440 px.** La tarjeta pasa a la derecha, grande, en una columna fija de la mitad del ancho. El flujo queda a la izquierda, alineado a una guía de 120 px. El fondo es el mismo Aluminio de lado a lado, sin paneles.

```
┌──────────────────────────────────────────────────────────────┐
│ {marca}                                               Ayuda  │
│                                                              │
│   Tarjeta NFC para tus              ╱‾‾‾‾‾‾‾‾‾‾‾‾╱           │
│   reseñas de Google                ╱            ╱            │
│   Tu cliente acerca...            ╱____________╱             │
│                                                              │
│   1  Pones la tarjeta...                                     │
│   2  ...                                                     │
│   [ Comprar tarjetas ]                                       │
└──────────────────────────────────────────────────────────────┘
```

### La tarjeta 3D

- **Material:** acrílico con mapa de entorno de estudio. El canto tiene un material propio en Canto, con algo de translucidez simulada (un color más claro hacia el centro del espesor), sin transmisión física.
- **Luz:** sin bloom ni partículas.

**El momento memorable es el giro de perfil a frente.**
1. Al cargar, la tarjeta es solo su canto: una línea de 2 mm en Canto, al ancho de la columna.
2. Cuando termina de cargar el 3D, gira 90° sobre su eje vertical y muestra el frente con el arte.
3. En ese mismo giro, un teléfono en contorno la toca y aparecen las estrellas.

Pasa una sola vez. Con movimiento reducido, se muestra directamente de frente.

**Los otros momentos, sobrios:**
- **Pila:** se ven solo los cantos, una franja verde agua que se engrosa.
- **Salida al pago:** la tarjeta vuelve a ponerse de perfil y la página navega.

### Por qué sirve aquí

El canto pulido, que se ve más claro que la cara, es un rasgo físico del acrílico. El verde agua lo exagera un poco para que se lea en pantalla. Le da a la página una identidad atada al objeto y no a una marca inventada.

**Advertencia:** el tinte verde en el canto es propio del vidrio. En el acrílico transparente real el canto se ve claro o apenas azulado. Si eliges C, hay que confirmar con una foto del producto real qué color tiene el canto, y ajustar el tono para no mostrar algo que la tarjeta no tiene. El fondo Aluminio y el grafito mantienen todo sobrio.

---

## Revisión contra la lista de lo que no quieres

| Dirección | Primera versión | Qué cambié y por qué |
|---|---|---|
| A, Mostrador | Fondo blanco puro con botones en azul tipo Google y una cuadrícula de 3 beneficios con íconos | El blanco con azul de Google es la página de producto por defecto y además sugiere afiliación con Google. Pasé a Formica gris verdosa con verde botella, y eliminé la cuadrícula: los beneficios son los tres pasos reales. |
| A, Mostrador | Onda del tap con resplandor (glow) | Un resplandor es un brillo decorativo. Quedó un anillo de una línea sobre la superficie, sin bloom. |
| B, Remisión | Fondo crema, Fraunces de alto contraste y sello en terracota | Era exactamente el patrón prohibido. Pasé a blanco bond frío, serif de texto de bajo contraste y azul de copia. El rojo queda solo para errores. |
| B, Remisión | Campos numerados 01 a 05 como en un formulario | Los campos no son una secuencia que el comprador deba seguir en orden en la nota. Les quité la numeración; se numeran solo "cómo funciona" y "qué pasa después". |
| C, Canto | Fondo casi negro con el canto como acento luminoso | Era el patrón "casi negro con acento ácido", y además un brillo. Pasé a Aluminio claro y desaturé el verde agua hasta un tono de material, no de neón. |
| C, Canto | Panel de resumen con efecto de vidrio esmerilado, como si fuera acrílico | Glassmorphism. El resumen es un panel blanco plano. |
| Todas | Leyenda "Paso 2 de 4" arriba de cada titular | Era una etiqueta pequeña encima del título. El progreso ya se ve en la barra inferior y en el botón Volver; la quité. |

Revisé que ninguna tenga:
- titulares en mayúsculas, ni una palabra resaltada en el titular;
- texto con degradado, ni degradados decorativos;
- tarjetas idénticas con sombra suave;
- cadenas con punto medio o guion largo, ni flechas en botones;
- folclor decorativo;
- animaciones de entrada por sección.

## Recomendación

**Recomiendo A, Mostrador.**

- **Es la que mejor se entiende sin leer.** Ver la tarjeta sobre un mostrador y un teléfono que la toca explica el producto en dos segundos, justo lo que necesita alguien que llega desde el celular.
- **Su momento memorable es el que justifica el 3D.** El tap es la razón de ser del producto, y verlo desde arriba, con el teléfono entrando desde donde está el pulgar del comprador, lo conecta con su propio gesto.
- **Atkinson Hyperlegible ayuda donde se puede perder dinero:** al leer el precio y al pegar el link.
- **Es la más barata de renderizar en un Android de gama media.** Tiene una cámara casi fija, una sombra horneada y nada de giros grandes.

**Lo que tomaría de las otras si te gustan:**
- De B, el dato de la pila: "100 tarjetas: 20 cm de alto" como texto bajo la pila de A. Es cierto y se entiende.
- De C, un material propio para el canto, más claro que la cara. Así se nota que es acrílico y no plástico plano. El tono se ajusta según una foto del canto real.

Espero tu elección. Puede ser una dirección tal cual o una combinación explícita, por ejemplo "A con el dato de la pila de B".
