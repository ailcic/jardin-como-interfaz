# Bitácora del proceso

Registro de cómo se construye el sitio con asistencia de IA. Es material para la ponencia, que pregunta qué autoría y qué saber surgen cuando el dispositivo que encarna el problema es también el que lo examina.

Formato: fecha, qué se hizo, quién lo propuso (autor o IA), qué se decidió y qué quedó abierto.

---

## 2026-10-12 — Abstract y prototipo 0.1 (claude.ai)

- **Autor:** propone el marco en humanidades digitales, a partir de la ilustración de El Bosco que usó la circular, y la idea de un sitio con lecturas filosóficas de los ejes en cada sector de *De tuin der lusten*.
- **IA:** redacta el abstract (469 palabras). A pedido del autor lo reescribe con oraciones más largas y más subordinadas (497 palabras).
- **IA:** propone el mapeo de doce sectores a los ejes. Agrega E0, que no está en la lista de la circular: el marco del ataque a las humanidades y *El conflicto de las facultades*. Reparte E6 y E7 entre dos paneles.
- **IA:** diseña e implementa el prototipo 0.1 en un solo archivo HTML. Tiene un tríptico esquemático en SVG con puertas que se cierran, puntos por sector y lecturas con tesis, iconografía, pregunta, conceptos, reenvíos y referencias. Incluye el panel «Tu recorrido», que compone un argumento según el camino seguido y distingue reenvío de salto libre.
- **IA:** redacta las doce lecturas como borradores.
- **Abierto:** verificar la iconografía, reescribir las lecturas, reemplazar el esquema por la imagen real con IIIF y decidir la licencia.

## 2026-11-14 — Exportación a repositorio para Claude Code

- **Autor:** pide un paquete para seguir el proyecto en Claude Code.
- **IA:** divide el prototipo en `index.html`, `css/`, `js/datos.js` y `js/app.js` sin cambios de contenido, y deja el contenido separado de la lógica. Agrega `CLAUDE.md`, la documentación en `docs/` y un script para regenerar la versión de un solo archivo.

## 2026-11-14 — Imagen real, recorrido dibujado y redefinición de «mediación» (Claude Code)

- **Autor:** decide no servir la imagen por IIIF por ahora y alojar el archivo con el sitio. Pide explorar mejoras que mantengan la idea de «recorrido del cuadro a través de una idea que culmina en un argumento».
- **IA:** propone cuatro grupos de cambios: la imagen como escenario, el recorrido dibujado sobre el cuadro, un cierre para el argumento y recorridos citables. Señala que en el prototipo tocar en el cuadro el destino de un reenvío contaba como salto «sin mediación», y pregunta si es intencional.
- **Autor:** acepta todos los cambios y **elimina la idea de que el salto no tiene mediación**. Fija el criterio: mediación es «el camino por el que se llegó», y ese camino puede tener causas varias y más débiles, no una causa única próxima.
- **IA:** operacionaliza ese criterio. Mediación fuerte: el reenvío declarado por el sector anterior. Mediación débil y plural: un reenvío que había quedado abierto antes, un reenvío en sentido inverso, un eje compartido, un autor compartido, y el lugar en el cuadro, que nunca falta. La lista de causas débiles y su orden son propuesta de la IA; el autor no las revisó todavía.
- **IA:** implementa:
  - la reproducción recortada por panel, con el esquema como alternativa si no carga; las puertas cerradas siguen en esquema;
  - anclas ubicadas por panel, porque en la reproducción las alas son proporcionalmente más angostas que en las medidas nominales; recalibra a ojo once de las doce anclas con una grilla de 10 cm;
  - el trazo del recorrido sobre el cuadro (continuo para el reenvío, punteado para el camino débil), los pasos numerados, anillos en los destinos de los reenvíos del sector actual, un detalle del cuadro en cada lectura, un acercamiento opcional y un mapa chico del recorrido junto al argumento;
  - el argumento derivado solo de la secuencia de sectores, con un cierre provisorio compuesto por reglas (forma, sentido y pregunta abierta), sin generación por modelo en tiempo de ejecución;
  - enlace al recorrido (`#r=…`), copia del argumento con sus referencias, deshacer el último paso, pasos clicables y dos recorridos propuestos.
- **IA:** corrige tres defectos del prototipo: el límite de 30 pasos descartaba el primero, la vuelta por reenvío perdía su razón y la vuelta repetía la tesis entera.
- **Abierto:** el autor tiene que revisar la lista de causas débiles, reescribir las frases del cierre, definir los recorridos propuestos (los dos actuales son borradores de la IA) y confirmar las anclas. Falta una imagen del exterior y el crédito exacto de la reproducción. No se probó con interacción manual ni en el proyector; se verificó con capturas automáticas en escritorio y en ancho de celular.

## 2026-11-14 — Conclusión del recorrido e inscripción del exterior (Claude Code)

- **Autor:** pide que el argumento final se despliegue en una lectura de unas 300 palabras a modo de conclusión: responde la pregunta que suscita el punto de inicio, la explora a lo largo del recorrido, la responde desde el final y presenta una pregunta nueva que reinicia el ciclo. Decide que las frases se generen ahora de manera automática y queden en el sitio para recuperarse por reglas.
- **IA:** redacta para cada uno de los doce sectores cuatro textos: qué le pasa a la pregunta al pasar por ahí (`explora`), una respuesta breve y una desplegada cuando el recorrido termina ahí (`breve`, `responde`) y una pregunta nueva (`reabre`). Redacta también las plantillas (`FRASES`). Son unas 1.400 palabras generadas por el modelo y no revisadas por el autor.
- **IA:** decide cómo se combinan: la conclusión toma hasta tres sectores intermedios (primero, medio y último si hay más); con cinco o más sectores ronda las 280 palabras y con dos queda en unas 200. El botón «Recomenzar» convierte el final en inicio y la pregunta nueva en pregunta de partida.
- **Límite que la IA señala:** la respuesta «desde el final» está escrita para poder contestar la pregunta de cualquier sector, así que habla de «lo que se preguntaba» sin nombrar su contenido. Es una respuesta desde un lugar, no una respuesta a medida de cada par inicio–final (serían 132 pares). El autor puede querer pares a medida para los recorridos de la ponencia.
- **Autor:** agrega la imagen del exterior y pide remarcar el sentido de las palabras en latín a partir de lo que hoy se puede decir y mandar a través de un modelo de lenguaje.
- **IA:** pone la imagen en las puertas cerradas; convierte la inscripción en epígrafe del sitio; agrega en «El mundo en grisalla» un bloque con el latín, una traducción literal, los verbos *dixit* y *mandavit* resaltados y una glosa; y suma un cuarto reenvío del exterior a «El infierno musical» (E5). La glosa y la razón del reenvío son borradores de la IA.
- **Abierto:** revisión de todos esos textos por el autor; la numeración del salmo; la fuente de la imagen del exterior, que es de baja resolución y cuyo archivo declara «Copyright 1995 Nicolas Pioch».

## 2026-11-14 — Respuestas a medida, nueva imagen del exterior y estilo de manuscrito (Claude Code)

**Pedido del autor.** Redactar respuestas a medida para los dos recorridos propuestos; usar la nueva imagen del exterior; dar a todo el sitio un estilo acorde al Renacimiento holandés, con inspiración en ilustraciones de manuscritos medievales y bestiarios.

**Qué se hizo.**
- *Respuestas a medida.* Cada recorrido propuesto tiene ahora `breve` y `responde` propios, que nombran la pregunta de su inicio en lugar de hablar de «lo que se preguntaba». La IA los redactó. Regla (propuesta por la IA): solo reemplazan a la respuesta genérica del sector final cuando el recorrido coincide paso a paso con el propuesto; la conclusión lo avisa («respuesta redactada a medida para…»). Con ellas la conclusión queda en unas 340–350 palabras.
- *Exterior.* `img/exterior-1806.jpg` (aportada por el autor) reemplaza al escaneo de 876 px. La IA midió los recortes de cada hoja. En «El mundo en grisalla», el detalle muestra ahora la figura con el libro, y cada línea del latín lleva encima el detalle de cómo está pintada (decisión de la IA).
- *Estilo.* Decisiones de la IA, a revisar por el autor: fondo oscuro del color del exterior; el tríptico en un marco negro con filetes dorados como el de las puertas; todo el texto en un folio de pergamino; Texturina para títulos y latín (por la letra gótica de la inscripción) y Alegreya para el cuerpo (tipografía argentina); rúbricas en minio en lugar de etiquetas en monoespaciada; manecillas (☞) en los reenvíos, por el gesto de señalar; calderones (¶) en cada paso del argumento; inicial en la lectura, teñida con el color del panel; detalles enmarcados como miniaturas de bestiario; números romanos en los pasos.
- El acento de la interfaz pasó del rosa de la fuente de la vida al minio de las rúbricas; el rosa quedó solo sobre la pintura (anillos y arcos de reenvío). Es un cambio de significado de un token, hecho por la IA sin consulta previa.

**Abierto.** Fuente y crédito de la imagen del exterior. `img/exterior-876.jpg` quedó en la carpeta sin uso: la IA no lo borró. El tema oscuro y el proyector no se probaron. Las respuestas a medida son borradores.

## 2026-11-16 — Repositorio en GitHub y actualización de la presentación (Claude Code)

- **Autor:** pide crear el repositorio y el remoto con GitHub CLI, y actualizar la presentación para que refleje los avances.
- **IA:** crea el repositorio `jardin-como-interfaz` como **privado** (decisión de la IA, porque la licencia sigue pendiente) y sube la versión inicial.
- **IA:** actualiza `El jardín como interfaz.pptx`, que describía el prototipo 0.1:
  - reemplaza los esquemas por la imagen del exterior, un detalle del hombre-árbol y capturas del sitio actual;
  - corrige la cuenta de reenvíos (37) y reescribe «El recorrido se vuelve argumento»: ya no hay «salto libre sin mediación», sino mediación fuerte, mediación débil y plural, y vuelta;
  - agrega una diapositiva, «El recorrido responde y vuelve a preguntar», sobre el ciclo de pregunta y respuesta y la composición por reglas;
  - actualiza los próximos pasos y las notas del orador de esas diapositivas.
- **Abierto:** los textos nuevos de las diapositivas y de las notas son borradores de la IA. La última diapositiva sigue con «[URL del sitio]» sin completar. La presentación se sube al repositorio a pedido del autor.

## 2026-11-16 — Publicación abierta (Claude Code)

- **Autor:** decide hacer público el repositorio y activar GitHub Pages.
- **IA:** cambia la visibilidad a pública y publica desde la rama `main`. El sitio queda en https://ailcic.github.io/jardin-como-interfaz/.
- **Autor:** fija la licencia, por ahora, en CC BY-NC-ND.
- **IA:** agrega `LICENSE` con el texto legal de la versión 4.0 (la versión la eligió la IA, por ser la vigente), lo anota en `README.md` y `CLAUDE.md`, aclara que las reproducciones de `img/` no quedan cubiertas, y pone la dirección del sitio en la última diapositiva y en los próximos pasos de la presentación.
- **Abierto:** falta el crédito de la imagen del exterior. La licencia elegida no permite obras derivadas, lo que entra en tensión con la idea de que estudiantes sumen sectores al sitio; queda para discutir.
