# El jardín como interfaz

Sitio web experimental de humanidades digitales. *El jardín de las delicias* de El Bosco (c. 1490–1510, Museo del Prado) funciona como interfaz de navegación. Cada sector del tríptico aloja una lectura filosófica de uno de los ejes de las Jornadas de Filosofía **«Lo humano, lo no humano, las humanidades»** (FFyH–UNC, **16 al 18 de noviembre de 2026**).

- Autor: Android, profesor de la FFyH–UNC (epistemología, filosofía de la ciencia, metodología de la investigación).
- Ponencia: *El jardín como interfaz. Un experimento de humanidades digitales sobre lo humano y lo no humano en el tríptico de El Bosco*. El abstract está en `docs/abstract.md`.
- La convocatoria es `docs/circular-jornadas-2026.pdf`, y de ahí salen los ejes.

## La tesis que el sitio tiene que encarnar

En humanidades digitales, la forma de navegar no es un soporte neutro: es parte del argumento. Toda decisión de diseño es una decisión filosófica y se defiende como tal en la exposición. Hay tres consecuencias prácticas:

1. **El recorrido es la obra.** El panel «Tu recorrido» compone un argumento con las tesis de los sectores visitados, lo dibuja sobre el cuadro y lo cierra de manera provisoria. No quitar ni simplificar este mecanismo sin consultarlo.
   - **Mediación** es *el camino por el que se llegó* a un sector. Ningún paso llega sin mediación (decisión del autor, 14-11-2026; antes el salto se leía como «sin mediación»).
   - La mediación es **fuerte** cuando el sector anterior declara un reenvío con su razón (una causa única y próxima). Da igual si se sigue desde la lectura o tocando el destino en el cuadro.
   - Si no, es **débil y plural**: varias causas más lejanas que se leen en lo ya recorrido. Hoy son: un reenvío que había quedado abierto en un sector anterior, un reenvío declarado en sentido inverso, un eje compartido, un autor compartido en las referencias, y el lugar (vecindad en un panel o paso de un panel a otro), que siempre está.
   - El argumento y el cierre se componen **por reglas**, a partir de la sola secuencia de sectores. Ningún modelo genera texto en tiempo de ejecución; esa es una decisión de diseño que se defiende en la ponencia.
2. **Apertura.** El código es abierto, el sitio queda en acceso abierto y se usan estándares abiertos (IIIF, W3C Web Annotation). Hay que preferir dependencias libres y mínimas.
3. **La IA es objeto de reflexión.** El sitio se construye con asistencia de IA, y el abstract pregunta qué autoría y qué saber surgen de eso. Por eso cada cambio significativo se registra en `docs/bitacora.md`: qué se hizo, quién lo propuso (autor o IA) y qué se decidió. Ese registro es material para la ponencia.

## Estructura

```
index.html          marcado de la página (sin contenido filosófico)
css/estilos.css     tokens de diseño y estilos (tema claro y oscuro)
js/datos.js         TODO el contenido: paneles, ejes, sectores, lecturas, reenvíos
js/app.js           lógica: tríptico, puertas, lectura, mediación, recorrido, trazo, índice, mapa de ejes
img/                reproducción del tríptico abierto (3840 px y versión liviana de 1920 px) y del exterior (1806 px; queda sin uso la anterior de 876 px)
tools/build_single.py  genera dist/jardin-como-interfaz.html (un solo archivo, para republicar como artifact de claude.ai)
docs/abstract.md    abstract enviado y versión anterior
docs/mapeo-ejes.md  tabla de sectores a ejes, con criterio
docs/bitacora.md    registro del proceso asistido por IA
```

## Cómo correr

No hay build ni dependencias. Se puede abrir `index.html` directamente (funciona con `file://`, porque no hay `fetch`) o levantar un servidor local:

```
python3 -m http.server 8001
```

Para generar una versión de un solo archivo: `python3 tools/build_single.py`.

## Arquitectura y convenciones de código

- JavaScript sin frameworks, en scripts clásicos (no módulos ES). Así funciona sin servidor. `datos.js` expone `window.JARDIN = {PANELS, TOTAL_W, TOTAL_H, EJES, SECTORES}` y `app.js` lo consume dentro de una IIFE.
- La única dependencia externa es Google Fonts: Texturina (títulos y latín; remite a la letra gótica de la inscripción), Alegreya (cuerpo) y Alegreya SC (rúbricas). Hay fuentes de respaldo declaradas.
- Los colores son tokens CSS en `:root`, redefinidos para tema oscuro con `prefers-color-scheme` y `[data-theme]`. No usar colores literales en los componentes. Lo que significan: el pardo del exterior (`--suelo`) como fondo de la página; pergamino (`--bg`, `--surface`) y tinta (`--ink`) para el folio que lleva todo el texto; minio (`--accent`) para las rúbricas y azurita (`--azul`) para lo secundario; oro (`--oro`) para los filetes del marco; un color por panel (`--dot-ext/izq/cen/der`), que también tiñe la inicial de cada lectura. El rosa de la fuente de la vida queda solo sobre la pintura (`--sobre-acento`).
- Estilo (14-11-2026, a pedido del autor): Renacimiento neerlandés con recursos de manuscritos y bestiarios. El tríptico va en un marco negro con filetes dorados, como el de las puertas; los títulos de sección son rúbricas; los reenvíos llevan manecilla (☞); cada paso del argumento, un calderón (¶); la lectura abre con inicial; los detalles van enmarcados como miniaturas. Cada recurso marca algo del contenido: no agregar ornamento que no lo haga.
- Accesibilidad: los puntos del cuadro son `<button>` con `aria-label`, la lectura usa `aria-live` y se respeta `prefers-reduced-motion`. Mantenerlo así.
- Estado: el recorrido es una lista de ids de sector y se guarda en `localStorage` con la clave `jardin-interfaz-v1`, siempre dentro de try/catch. El sector actual va en el hash (`#der-arbol`), así cada sector tiene un enlace propio. Un recorrido entero se comparte con `#r=id.id.id`; al abrirlo reemplaza al guardado.
- Imagen: `app.js` carga la reproducción y, si llega, cubre el esquema SVG, que queda como alternativa sin red. Las puertas cerradas usan `img/exterior-1806.jpg`, con el esquema como alternativa. Sobre la pintura se usan los tokens fijos `--sobre-*`, que no cambian con el tema.

## Modelo de datos

El esquema completo está documentado en la cabecera de `js/datos.js`. Lo esencial:

- **Coordenadas en centímetros nominales** relativas a cada panel, con origen arriba a la izquierda (96,5 + 192 + 96,5 de ancho, 205,5 de alto). No hay una escala única cm→px: en la reproducción las alas son proporcionalmente más angostas, así que cada ancla se ubica por fracción dentro del recorte de su panel (`IMAGEN.recortes`, en píxeles).
- Las puertas cerradas (`ext`) ocupan el ancho del panel central.
- Cada sector tiene un `eje` (código E0–E9) y entre dos y cuatro `enlaces` con su razón (`por`).
- `composeArgument()` en `app.js` arma el texto así: el primer paso dice «Partimos de…»; un reenvío dice «Por reenvío (razón), llegamos a…»; una mediación débil dice «Por el camino recorrido (causa; causa; …), llegamos a…»; una vuelta a un sector ya visto dice «Volvemos a… por reenvío (…) / por el camino recorrido (…): su tesis se lee ahora después de…» y no repite la tesis. Como pasa a minúscula la primera letra de cada tesis, **ninguna tesis puede empezar con un nombre propio**.
- **Ciclo de pregunta y respuesta.** El recorrido parte de la pregunta del primer sector, la explora en los intermedios, la responde desde el último y deja una pregunta nueva con la que se puede recomenzar (`#r=~id…` marca un recorrido recomenzado). Cada sector aporta cuatro campos: `explora`, `breve`, `responde` y `reabre` (ver la cabecera de `datos.js` para la forma gramatical de cada uno).
- `composeCierre()` arma el cierre breve y `composeConclusion()` la conclusión desplegada, de unas 300 palabras en cuatro párrafos (con dos sectores queda en unas 200). Las plantillas están en `FRASES`, en `datos.js`. Todo se recupera y combina por reglas; nada se genera al navegar. Las frases y los cuatro campos son borradores generados por la IA a pedido del autor.
- **La inscripción.** «Ipse dixit et facta sunt / Ipse mandavit et creata sunt» es el epígrafe del sitio y tiene un bloque propio en `ext-creacion` (`inscripcion`). Se lee desde lo que hoy se puede decir y mandar a través de un modelo de lenguaje; por eso el exterior reenvía a `der-musica` (E5).
- `RECORRIDOS` en `datos.js` guarda los recorridos propuestos. Los dos actuales son borradores de la IA. Cada uno trae una respuesta **a medida** (`breve`, `responde`) que nombra la pregunta de su inicio; reemplaza a la genérica del sector final solo si el recorrido coincide paso a paso con el propuesto.

## Convenciones de contenido

- La interfaz está en español rioplatense, con voseo («Tocá», «navegás»).
- La tesis es una oración. La lectura es un párrafo de 90 a 130 palabras. La pregunta queda abierta.
- La razón de cada reenvío (`por`) va en minúscula y sin punto final, porque se inserta entre paréntesis en el argumento.
- Las referencias siguen el formato autor (año). *Título*. Editorial. Se usa la primera edición en lengua original salvo que se indique otra cosa.
- Las lecturas actuales son **borradores redactados con IA** para que el autor los reescriba. No presentarlas como definitivas ni ampliarlas sin pedido.

## Pendientes

Las Jornadas son del 16 al 18 de noviembre. Prioridad para la exposición:

1. **Verificar la iconografía** contra la literatura (Belting 2002; Fraenger; la ficha del Prado). En especial:
   - La figura que señala desde la cueva (`cen-cueva`).
   - La escena de la cerda con toca de monja y el documento (`der-cerdo`).
   - La cita del exterior. «Ipse dixit et facta sunt / Ipse mandavit et creata sunt» figura como Salmo 33; hay que confirmar la numeración (Vulgata 32,9 o hebrea 33,9) y si se combina con el Salmo 148,5.
   - Las anclas, recalibradas a ojo sobre la reproducción: confirmar que cada una cae sobre el motivo que la lectura comenta.
2. **Reescritura de las lecturas** por el autor. La IA puede ayudar a editar, pero la voz es del autor.
3. **Imagen.** Hecho para el tríptico abierto: la reproducción se aloja con el sitio (decisión del autor: por ahora sin IIIF). Falta: confirmar la fuente y el crédito de la imagen del exterior (1806 px, aportada por el autor; el archivo no declara origen) y borrar `img/exterior-876.jpg`, que ya no se usa; confirmar la fuente y el crédito exactos de la reproducción del interior (el nombre del archivo original indica Wikimedia Commons); y, si se quiere zoom profundo, teselas propias. Sigue abierta la exportación de las anclas como anotaciones W3C.
   - Revisar las frases de la conclusión, los campos `explora`, `breve`, `responde` y `reabre`, la glosa de la inscripción, los recorridos propuestos y sus respuestas a medida (todos borradores de la IA).
4. **Modo exposición** para la ponencia: pantalla completa, letra grande, recorrido guiado opcional. Probarlo en el proyector.
5. **Publicación abierta**: hecho. El repositorio es público (github.com/ailcic/jardin-como-interfaz) y el sitio está en https://ailcic.github.io/jardin-como-interfaz/ (GitHub Pages desde `main`: cada push lo actualiza). Licencia provisoria, decidida por el autor el 16-11-2026: CC BY-NC-ND 4.0 para código y textos (`LICENSE`); las reproducciones en `img/` no quedan cubiertas. El autor puede cambiarla más adelante.
6. **Página de método**: las decisiones de diseño como decisiones filosóficas, más la bitácora del proceso con IA.

## Antecedentes

- Hubo un prototipo 0.1 de un solo archivo, publicado como artifact privado de claude.ai: https://claude.ai/artifact/GisFRXHrzuaAVvvPrT6Dmv
- Este repositorio sale de ese prototipo, dividido en archivos el 14 de noviembre de 2026 sin cambios de contenido.
