/*
 * El jardín como interfaz — datos del tríptico
 * ------------------------------------------------------------
 * Todo el contenido filosófico vive en este archivo. app.js solo lo dibuja.
 *
 * PANELS   paneles del tríptico. off/w = desplazamiento y ancho nominal en cm
 *          (96,5 + 192 + 96,5 = TOTAL_W). "ext" son las puertas cerradas, que
 *          cubren el ancho del panel central. "lugar" es el nombre con artículo
 *          que se usa al componer el argumento.
 * IMAGEN   reproducción y recorte en píxeles de cada panel. Las anclas se
 *          ubican por panel: fracción x/w del ancho del recorte y fracción
 *          y/TOTAL_H de su alto. No hay una escala única cm→px, porque en la
 *          reproducción las alas son proporcionalmente más angostas.
 *          "detalle" es el tamaño en cm de la región que se muestra como
 *          detalle; un sector puede fijar la suya con reg:[ancho, alto].
 * RECORRIDOS recorridos propuestos: {nombre, nota, pasos:[ids], breve, responde}.
 *          "breve" y "responde" son la respuesta A MEDIDA de ese recorrido:
 *          nombran la pregunta de su inicio y la contestan desde su final.
 *          Tienen la misma forma que los campos homónimos de un sector y los
 *          reemplazan solo cuando el recorrido coincide paso a paso con el
 *          propuesto (y no fue recomenzado desde otro).
 * FRASES   plantillas con las que app.js compone el argumento, el cierre
 *          breve y la conclusión desplegada. Los {huecos} se llenan con
 *          campos de los sectores y con datos del recorrido. Nada se genera
 *          mientras se navega: se recupera y se combina por reglas.
 * EJES     ejes de la convocatoria (tercera circular). E0 no figura en la lista
 *          de ejes: es el marco del texto de presentación.
 * SECTORES una entrada por punto navegable:
 *   id         "<panel>-<slug>", usado también como #ancla en la URL
 *   panel      ext | izq | cen | der
 *   x, y       ancla en cm nominales, relativa al panel (origen arriba a la
 *              izquierda); calibradas a ojo sobre la reproducción con una
 *              grilla de 10 cm
 *   eje        código de EJES
 *   nombre     título del sector
 *   ubic       ubicación en el cuadro, en palabras
 *   icon       descripción iconográfica (verificar contra la literatura)
 *   tesis      una oración; se usa para componer el argumento del recorrido
 *   lectura    párrafo de lectura filosófica
 *   pregunta   pregunta abierta
 *   explora    qué le pasa a la pregunta de partida cuando el recorrido pasa
 *              por este sector. Es un predicado cuyo sujeto tácito es «la
 *              pregunta»: va en minúscula, empieza con verbo y no lleva punto
 *   breve      respuesta corta cuando el recorrido termina acá. Completa
 *              «el recorrido responde que …»: minúscula y sin punto final
 *   responde   respuesta desplegada (unas 50 palabras) cuando el recorrido
 *              termina acá. Tiene que poder contestar la pregunta de
 *              cualquier sector, así que habla de «lo que se preguntaba» o
 *              «la cuestión» sin nombrar su contenido
 *   reabre     pregunta nueva que deja este final, distinta de "pregunta";
 *              con ella se puede recomenzar el ciclo desde este sector
 *              Los cuatro campos son BORRADORES generados por la IA el
 *              14-11-2026 a pedido del autor.
 *   inscripcion (opcional) texto escrito en el cuadro: {latin, trad, verbos
 *              a resaltar, fuente, glosa, recorte y recortes en px de IMAGEN.exterior}.
 *              "recorte" es el detalle que encabeza la lectura (la figura
 *              que dice); "recortes", el detalle de cada línea del latín.
 *              La del exterior es además el epígrafe del sitio. La glosa es
 *              un BORRADOR de la IA
 *   conceptos  etiquetas
 *   refs       referencias (autor, año, título, editorial)
 *   enlaces    reenvíos (entre dos y cuatro) [{to: id, por: razón del pasaje}] — la razón se
 *              inserta en el argumento compuesto, escribirla en minúscula
 *              y sin punto final. Un reenvío es la mediación fuerte; las
 *              débiles (reenvío abierto, eje o autor compartido, lugar) las
 *              calcula app.js a partir del camino
 */
window.JARDIN = (function(){
"use strict";
var PANELS = {
  ext:{nombre:"Puertas cerradas", corto:"Exterior", lugar:"el exterior", off:96.5, w:192, dot:"--dot-ext"},
  izq:{nombre:"Panel izquierdo · Paraíso", corto:"Paraíso", lugar:"el Paraíso", off:0, w:96.5, dot:"--dot-izq"},
  cen:{nombre:"Panel central · El jardín", corto:"El jardín", lugar:"el jardín", off:96.5, w:192, dot:"--dot-cen"},
  der:{nombre:"Panel derecho · Infierno", corto:"Infierno", lugar:"el Infierno", off:288.5, w:96.5, dot:"--dot-der"}
};
var TOTAL_W = 385, TOTAL_H = 205.5;

/* Reproducción del tríptico abierto. Los recortes [x0, y0, x1, y1] están en
   píxeles de la imagen completa (w × h) y delimitan la superficie pintada de
   cada panel, sin el marco negro ni las separaciones. */
var IMAGEN = {
  src:"img/jardin-3840.jpg", ligera:"img/jardin-1920.jpg", w:3840, h:2165,
  recortes:{izq:[24,21,898,2148], cen:[948,24,2915,2147], der:[2941,23,3815,2148]},
  detalle:[48,30],
  credito:"Reproducción: Wikimedia Commons, dominio público",
  /* Puertas cerradas. Los recortes incluyen el marco negro y dorado de cada
     hoja, para que la proporción coincida con la mitad del panel central.
     Imagen aportada por el autor el 14-11-2026 (1806 px); el archivo no
     declara su origen: falta confirmar fuente y crédito. */
  exterior:{src:"img/exterior-1806.jpg", w:1806, h:1920,
    recortes:{extl:[7,10,899,1903], extr:[904,10,1797,1903]},
    credito:"Exterior: reproducción aportada por el autor, fuente por confirmar"}
};

var EJES = {
  E0:"Marco: el ataque a las humanidades y a la universidad; el conflicto de las facultades",
  E1:"Lecturas y perspectivas históricas de la humanitas, lo humano, anthropos",
  E2:"Excepción o continuidad en la caracterización de lo humano",
  E3:"Debates epistemológicos y metodológicos en torno a las humanidades",
  E4:"La emergencia de las humanidades digitales y humanidades aumentadas",
  E5:"La expansión de las tecnologías de la inteligencia artificial en la filosofía y las humanidades",
  E6:"Las tensiones estéticas, éticas y políticas en relación a la construcción/destrucción de lo humano",
  E7:"La crisis de lo humano desde posthumanismos y transhumanismos",
  E8:"La filosofía y las humanidades en contextos educativos: desafíos y nuevos escenarios",
  E9:"La atención a otras ontologías que apuntan contra las dicotomías del pensamiento occidental"
};

var SECTORES = [
{id:"ext-creacion", panel:"ext", x:96, y:103, eje:"E9",
 nombre:"El mundo en grisalla",
 ubic:"Exterior de las puertas, al cerrar el tríptico",
 icon:"Con las puertas cerradas, una esfera transparente encierra un disco de tierra con vegetación bajo nubes y haces de luz, pintado en tonos de gris. Arriba a la izquierda, una pequeña figura divina sostiene un libro; la inscripción, tomada del Salmo 33, dice «Ipse dixit et facta sunt / Ipse mandavit et creata sunt». Suele leerse como el tercer día de la creación: hay plantas, no hay animales ni humanos.",
 tesis:"Antes de toda figura humana hay un mundo que ya está haciéndose: lo no humano no es el resto de lo humano sino su condición.",
 lectura:"La grisalla suspende el color, y con él la escena: lo que queda es un mundo en proceso, sin protagonista. Leído desde una metafísica del proceso, el exterior no muestra cosas terminadas sino ocasiones que devienen. Leído desde la antropología comparada, recuerda que la partición entre naturaleza y cultura es una ontología entre otras, la naturalista, y no el suelo neutral sobre el que todas se apoyan. Que el interior humano solo se alcance abriendo las puertas invierte la jerarquía habitual: lo humano es un acontecimiento interior a un mundo que lo excede y lo precede.",
 pregunta:"¿Pueden pensarse unas humanidades desde las puertas cerradas, es decir, desde un mundo en el que lo humano todavía no es el centro?",
 inscripcion:{
  latin:["Ipse dixit et facta sunt", "Ipse mandavit et creata sunt"],
  trad:["Él lo dijo, y fueron hechas", "Él lo mandó, y fueron creadas"],
  verbos:["dixit", "mandavit", "dijo", "mandó"],
  fuente:"Inscripción en lo alto de las dos hojas. Salmo 33,9 (32,9 en la Vulgata); numeración por verificar. Traducción literal.",
  glosa:"La inscripción dice que basta decir para que las cosas sean hechas y mandar para que sean creadas. Durante siglos esa fue la descripción de un poder solo divino: una palabra que no describe el mundo sino que lo produce. Hoy una versión menor y ambigua de ese poder está al alcance de cualquiera que escriba una instrucción para un modelo de lenguaje: se dice y aparece un texto, se manda y aparece una imagen o un programa. Este sitio se hizo así. La diferencia importa tanto como el parecido: el modelo no crea de la nada, recombina lo que otros ya dijeron, y quien manda no siempre sabe qué fue lo que mandó.",
  recorte:[150,170,390,330], recortes:[[405,100,705,172],[1090,100,1390,172]]
 },
 explora:"perdió a su protagonista: frente a un mundo que ya estaba haciéndose sin nadie que lo mirara, tuvo que formularse sin dar por supuesto el centro humano",
 breve:"lo humano no es el punto de partida sino un acontecimiento tardío dentro de un mundo que lo precede y lo excede",
 responde:"Lo que se preguntaba supone un mundo que ya estaba en marcha antes de cualquier figura humana. Vista desde las puertas cerradas, la cuestión no se resuelve dentro de lo humano: se resuelve reconociendo que lo humano es un acontecimiento interior a un proceso más amplio, y que toda respuesta que lo tome como suelo llega tarde.",
 reabre:"¿Qué queda de una pregunta filosófica cuando se la formula desde un mundo que no la necesita para seguir haciéndose?",
 conceptos:["proceso","naturalismo","perspectivismo","ontologías relacionales"],
 refs:["Whitehead, A. N. (1929). Process and Reality. Nueva York: Macmillan.","Descola, P. (2005). Par-delà nature et culture. París: Gallimard.","Viveiros de Castro, E. (2009). Métaphysiques cannibales. París: PUF."],
 enlaces:[{to:"cen-frutos",por:"de la grisalla sin humanos al jardín donde lo humano se mezcla con lo vegetal y lo animal"},{to:"der-ciudad",por:"el mundo antes y después: la luz gris de la creación y el resplandor del incendio"},{to:"izq-eva",por:"al abrir las puertas, la primera escena es la presentación de lo humano"},{to:"der-musica",por:"decir y mandar: de la palabra que crea a la instrucción que genera"}]},

{id:"izq-eva", panel:"izq", x:52, y:148, eje:"E1",
 nombre:"Dios presenta a Eva a Adán",
 ubic:"Primer plano del panel izquierdo",
 icon:"En el primer plano, una figura divina con rasgos de Cristo toma de la muñeca a Eva y la presenta a Adán, que despierta sentado sobre la hierba. Alrededor, el paisaje edénico se puebla de animales.",
 tesis:"La escena fundacional de la humanitas es una escena de presentación: lo humano aparece como aquello que es mostrado y nombrado, no como una naturaleza dada.",
 lectura:"La tradición ofrece varias versiones de este origen. En el mito de Protágoras, Epimeteo reparte las cualidades entre los animales y deja al humano desnudo, de modo que su humanidad depende de la técnica robada y de la justicia otorgada. En la Oratio de Pico, Dios pone a Adán en el centro sin asignarle sede fija, para que se forme a sí mismo. Heidegger reprocha al humanismo haber pensado lo humano siempre desde la animalidad más un agregado. El gesto pintado, una mano sobre una muñeca, sugiere otra cosa: lo humano como relación instituida entre figuras, antes que como esencia.",
 pregunta:"Si lo humano es algo que se presenta, ¿quién presenta hoy lo humano, y con qué instituciones?",
 explora:"se encontró con su escena de origen: lo humano no aparece como una naturaleza dada sino como algo que alguien presenta, nombra e instituye ante otros",
 breve:"lo humano es una relación instituida, algo que se presenta y se nombra, antes que una esencia que se descubre",
 responde:"Lo que estaba en juego no es una propiedad de lo humano sino un gesto que lo instituye. Vista desde la escena de presentación, la cuestión depende de quién presenta, ante quién y con qué autoridad: lo humano se sostiene mientras alguien lo muestra y lo nombra, y cambia cuando cambian las instituciones que hacen ese gesto.",
 reabre:"¿Qué pasa con lo humano cuando quienes lo presentaban, la escuela, la universidad, el libro, pierden la autoridad para hacerlo?",
 conceptos:["humanitas","dignitas hominis","indeterminación","humanismo"],
 refs:["Platón. Protágoras, 320c–322d.","Pico della Mirandola, G. (1496 [1486]). Oratio de hominis dignitate.","Heidegger, M. (1947). Brief über den Humanismus. Berna: Francke."],
 enlaces:[{to:"der-arbol",por:"el ser sin sede fija de Pico, devenido híbrido en ruinas"},{to:"izq-estanque",por:"la excepción proclamada frente a las criaturas que ya se devoran alrededor"},{to:"cen-cueva",por:"presentar lo humano y enseñarlo son el mismo gesto de señalar"}]},

{id:"izq-estanque", panel:"izq", x:58, y:187, eje:"E2",
 nombre:"Criaturas en el Edén",
 ubic:"Estanque y orillas del primer plano, panel izquierdo",
 icon:"Alrededor de la fuente y en el estanque inferior abundan animales exóticos y criaturas fantásticas. Un gato lleva un ratón en la boca; otros seres híbridos salen del agua hacia la orilla.",
 tesis:"Ya en el paraíso hay depredación: la frontera entre lo humano y lo animal no separa un orden pacífico de uno violento, sino que atraviesa el mismo jardín.",
 lectura:"El detalle desarma la imagen de un Edén sin conflicto y pone en duda que la excepción humana pueda apoyarse en la oposición entre armonía y violencia. Darwin propuso que la diferencia entre humanos y otros animales es de grado y no de clase. Uexküll mostró que cada viviente habita su propio mundo circundante. Agamben llamó máquina antropológica al dispositivo que produce lo humano separando y reincorporando lo animal dentro de sí. El estanque pintado funciona como un corte en esa máquina: las criaturas que emergen del agua no están ni dentro ni fuera del orden creado.",
 pregunta:"¿La excepcionalidad humana es un dato que se descubre o una operación que se repite?",
 explora:"tropezó con la depredación en pleno paraíso: la frontera entre lo humano y lo animal dejó de separar dos órdenes y pasó a atravesar uno solo",
 breve:"la excepción humana no es un dato que se encuentra sino un corte que hay que volver a trazar cada vez",
 responde:"Ninguna frontera firme sostiene lo que se preguntaba. Vista desde el estanque, donde ya hay depredación antes de la caída, la diferencia entre lo humano y lo demás es de grado y se mantiene por una operación repetida. La respuesta, entonces, no describe un hecho: describe un trabajo de separación que podría hacerse de otro modo.",
 reabre:"¿Quién traza hoy el corte entre lo humano y lo que no lo es, y qué queda del otro lado?",
 conceptos:["máquina antropológica","Umwelt","continuidad","diferencia de grado"],
 refs:["Darwin, C. (1871). The Descent of Man. Londres: John Murray.","Uexküll, J. von (1934). Streifzüge durch die Umwelten von Tieren und Menschen. Berlín: Springer.","Agamben, G. (2002). L'aperto. L'uomo e l'animale. Turín: Bollati Boringhieri."],
 enlaces:[{to:"cen-frutos",por:"si no hay corte de clase, el jardín central despliega la continuidad"},{to:"ext-creacion",por:"volver al mundo anterior a la distinción"},{to:"izq-buho",por:"quién observa la frontera y desde dónde"}]},

{id:"izq-buho", panel:"izq", x:47, y:99, eje:"E3",
 nombre:"El búho en la fuente de la vida",
 ubic:"Centro del panel izquierdo",
 icon:"En el eje del panel se alza una fuente rosada de formas orgánicas, de la que nacen las aguas del paraíso. En una abertura circular de su base asoma un búho. En la iconografía de la época el búho es ambivalente: puede aludir a la sabiduría, pero también a la noche, la ceguera o el pecado.",
 tesis:"El saber mira desde dentro de la fuente, no desde fuera: quien observa está alojado en aquello que observa.",
 lectura:"Hegel escribió que el búho de Minerva levanta vuelo al atardecer: la filosofía llega cuando una forma de vida ya envejeció. El búho del Bosco no vuela; espía desde el interior de la fuente. La imagen sirve para los debates de método en las humanidades: no hay vista desde ninguna parte. Fleck mostró que todo hecho científico se estabiliza dentro de un colectivo de pensamiento; Haraway llamó truco divino a la pretensión de ver todo desde ningún lugar y propuso, contra ella, conocimientos situados. La ambivalencia del ave acompaña la incertidumbre de las humanidades sobre su propio método.",
 pregunta:"¿Qué método les corresponde a unas disciplinas que estudian lo humano desde dentro de lo humano?",
 explora:"se volvió sobre quien la formula: no hay punto de vista exterior, y toda respuesta se da desde dentro de aquello mismo que se interroga",
 breve:"solo puede contestarse desde dentro, por un saber situado que forma parte de lo que observa",
 responde:"No hay un lugar exterior desde el cual contestarla. Vista desde la fuente, donde el búho mira alojado en lo que observa, la cuestión solo admite respuestas situadas: dichas por alguien, desde un colectivo y con un método que también está en discusión. Eso no la vuelve arbitraria; obliga a declarar desde dónde se responde.",
 reabre:"¿Cómo se distingue un saber situado de una mera opinión, si ya no hay vista desde ninguna parte que lo garantice?",
 conceptos:["conocimiento situado","colectivo de pensamiento","reflexividad","método"],
 refs:["Hegel, G. W. F. (1820). Grundlinien der Philosophie des Rechts, prefacio.","Fleck, L. (1935). Entstehung und Entwicklung einer wissenschaftlichen Tatsache. Basilea: Schwabe.","Haraway, D. (1988). Situated Knowledges. Feminist Studies, 14(3), 575–599."],
 enlaces:[{to:"cen-esferas",por:"la mirada alojada y el dispositivo de vidrio, dos figuras de la mediación"},{to:"cen-cueva",por:"el método, transmitido como gesto"},{to:"izq-estanque",por:"lo que el búho ve desde la fuente"}]},

{id:"cen-esferas", panel:"cen", x:26, y:137, eje:"E4",
 nombre:"Esferas y burbujas de vidrio",
 ubic:"Plano medio, izquierda del panel central",
 icon:"Parejas encerradas en esferas transparentes, campanas de cristal y valvas de molusco salpican el jardín. Un proverbio neerlandés citado a menudo a propósito del cuadro asocia la dicha y el vidrio por la misma fragilidad.",
 tesis:"Toda humanidad aumentada habita una burbuja: el medio que permite ver es también el que encierra.",
 lectura:"Sloterdijk describió la existencia humana como habitar esferas co-producidas, espacios de inmunidad compartida tan protectores como frágiles. Las humanidades digitales construyen esferas de ese tipo: bases de datos, visualizaciones, interfaces. Drucker propuso tratar los datos como capta, lo tomado y no lo dado, y leer toda visualización como interpretación y no como presentación neutral. Este mismo sitio es una burbuja: muestra el cuadro a través de un esquema, un recorte y una arquitectura de enlaces. La pregunta no es si hay mediación, sino qué mediación es pensable y cuál se vuelve invisible.",
 pregunta:"¿Qué ve unas humanidades aumentadas que no veía la lectura lineal, y qué deja de ver?",
 explora:"quedó encerrada en un medio: descubrió que solo se ve a través de una burbuja, y que aquello que permite ver es también lo que recorta",
 breve:"toda respuesta depende del medio que la hace visible, y ese medio también encierra",
 responde:"La respuesta no puede separarse del medio en que se da. Vista desde las esferas de vidrio, la cuestión siempre se formula a través de una interfaz, un recorte y una arquitectura de enlaces, como las de este sitio. Lo que se alcanza a ver es real, pero es lo que esa burbuja deja ver; otra mediación mostraría otra cosa.",
 reabre:"¿Qué quedó fuera de este recorrido por el solo hecho de haberse hecho con esta interfaz y no con otra?",
 conceptos:["esferas","capta","interfaz","mediación"],
 refs:["Sloterdijk, P. (1998). Sphären I. Blasen. Fráncfort: Suhrkamp.","McCarty, W. (2005). Humanities Computing. Basingstoke: Palgrave Macmillan.","Drucker, J. (2011). Humanities Approaches to Graphical Display. Digital Humanities Quarterly, 5(1)."],
 enlaces:[{to:"der-musica",por:"del medio frágil al instrumento que se vuelve contra quien lo toca"},{to:"izq-buho",por:"la mediación como lugar del observador"},{to:"cen-cabalgata",por:"lo que la burbuja aísla, la ronda lo pone en común"}]},

{id:"cen-cabalgata", panel:"cen", x:94, y:86, eje:"E6",
 nombre:"La cabalgata en torno al estanque",
 ubic:"Plano medio del panel central",
 icon:"Hombres desnudos montados sobre caballos, ciervos, camellos, cerdos y criaturas fabulosas giran en ronda alrededor de un estanque circular en el que se bañan mujeres.",
 tesis:"Un orden se construye haciendo girar los cuerpos: la ronda distribuye quién mira, quién es mirado y quién queda en el centro.",
 lectura:"La ronda es el lado constructivo del eje ético-político: una coreografía que ordena. Rancière llamó reparto de lo sensible a la distribución de lo visible y lo decible que precede a toda política. Arendt definió la condición humana por la pluralidad y por la aparición ante otros en un espacio común. La escena exhibe ambas cosas y su tensión: un espacio común y, a la vez, una división de roles entre quienes circulan y quienes son rodeados. La historiografía del cuadro oscila entre la utopía adamita de Fraenger y la advertencia moral sobre la lujuria; esa oscilación ya es una disputa sobre qué humanidad se construye.",
 pregunta:"¿Qué humanidad construye una estética que pone a unos en movimiento y a otros en el centro?",
 explora:"pasó a ser una cuestión de orden: quién circula, quién queda en el centro y quién mira se decide antes de cualquier respuesta",
 breve:"se decide en el reparto de los lugares: quién circula, quién queda en el centro y quién mira",
 responde:"Lo que se preguntaba se decide en una distribución de lugares antes que en una definición. Vista desde la ronda, la cuestión es política: lo humano se construye haciendo girar los cuerpos, repartiendo quién aparece y ante quién. Toda respuesta toma partido en ese reparto, incluso cuando se presenta como pura descripción.",
 reabre:"¿Qué lugares reparte la propia pregunta, y a quién deja mirando desde afuera de la ronda?",
 conceptos:["reparto de lo sensible","pluralidad","aparición","mirada"],
 refs:["Arendt, H. (1958). The Human Condition. Chicago: University of Chicago Press.","Rancière, J. (2000). Le partage du sensible. París: La Fabrique.","Fraenger, W. (1947). Hieronymus Bosch. Das tausendjährige Reich. Coburgo: Winkler."],
 enlaces:[{to:"der-ciudad",por:"construcción y destrucción: la ronda ordenada y el incendio"},{to:"der-cerdo",por:"del orden de los cuerpos al orden de las instituciones"},{to:"cen-frutos",por:"la escala humana en el primer plano"}]},

{id:"cen-frutos", panel:"cen", x:92, y:160, eje:"E7",
 nombre:"Cuerpos, aves y frutos gigantes",
 ubic:"Primer plano del panel central",
 icon:"Figuras humanas desnudas comparten el primer plano con aves de tamaño desmesurado, fresas, moras y otros frutos enormes. Algunos cuerpos se meten en frutos, cáscaras o flores; las escalas están trastocadas.",
 tesis:"Cuando la escala se desordena, lo humano deja de ser la medida: el jardín es una ecología en la que nadie ocupa el centro.",
 lectura:"El primer plano es la versión afirmativa de la crisis de lo humano. Braidotti distingue un posthumanismo crítico, que desplaza al sujeto universal y abre la vida no humana como fuerza, de los proyectos de mejoramiento. Haraway propone pensar en términos de simpoiesis, de hacer-con, y de emparentarse con otras especies en un mundo dañado. Los cuerpos del Bosco que habitan frutos y cabalgan aves no se mejoran: se componen con otras formas de vida. La desproporción no es un error de perspectiva sino una tesis sobre la medida.",
 pregunta:"¿Qué queda de las humanidades si lo humano deja de ser su medida, y qué ganan?",
 explora:"perdió su medida: entre aves y frutos gigantes, lo humano dejó de ser la escala con la que se mide todo lo demás",
 breve:"lo humano no es la medida: se compone con otras formas de vida en una ecología sin centro",
 responde:"La respuesta deja de tener a lo humano como medida. Vista desde el primer plano del jardín, donde los cuerpos habitan frutos y conviven con aves desmesuradas, la cuestión se contesta por composición: lo humano se hace con otros vivientes y no por encima de ellos. No es una pérdida; es otra manera de contar quiénes forman parte.",
 reabre:"¿Qué instituciones y qué saberes harían falta para sostener una vida en común en la que lo humano no sea la medida?",
 conceptos:["posthumanismo crítico","zoe","simpoiesis","escala"],
 refs:["Braidotti, R. (2013). The Posthuman. Cambridge: Polity.","Haraway, D. (2016). Staying with the Trouble. Durham: Duke University Press."],
 enlaces:[{to:"der-arbol",por:"la misma hibridación, leída en clave de ruina"},{to:"izq-estanque",por:"la continuidad que ya se insinuaba en el Edén"},{to:"ext-creacion",por:"un mundo sin centro humano, antes de los humanos"}]},

{id:"cen-cueva", panel:"cen", x:182, y:184, eje:"E8",
 nombre:"La figura que señala",
 ubic:"Ángulo inferior derecho del panel central",
 icon:"Desde una cavidad en el ángulo inferior derecho, un hombre de cabellos oscuros asoma y señala hacia una mujer en el interior. Es uno de los pocos personajes que parece dirigirse fuera de la escena; se lo ha leído como guía, como testigo o como figura de un comitente.",
 tesis:"Enseñar es señalar: la humanitas se transmite por gestos que indican sin asegurar lo que el otro verá.",
 lectura:"Sloterdijk leyó el humanismo como una red de cartas entre amigos que domesticaba mediante la lectura, y diagnosticó su crisis cuando otros medios desplazaron a los libros. Rancière recuperó la figura del maestro ignorante, que no explica sino que obliga a usar la propia inteligencia. Freire pensó la educación como diálogo y concientización y no como depósito. La figura que señala puede leerse en esa serie: no muestra un contenido, abre una dirección. La pregunta es qué pasa con ese gesto cuando la inteligencia artificial ofrece respuestas en lugar de señales.",
 pregunta:"En aulas donde las respuestas se generan, ¿cómo se enseña a mirar?",
 explora:"se convirtió en un gesto: alguien señala, y lo que el otro llegue a ver no queda asegurado por quien indica",
 breve:"no se entrega como un contenido: se señala, y cada quien tiene que mirar por su cuenta",
 responde:"La respuesta no puede darse como un contenido terminado. Vista desde la figura que señala, la cuestión se transmite como una dirección para mirar, y quien la recibe tiene que usar su propia inteligencia para ver algo. Por eso una respuesta generada de antemano no alcanza: enseña poco de lo que estaba en juego.",
 reabre:"¿Quién señala hoy, y hacia dónde, cuando buena parte de lo que se lee y se escribe pasa por sistemas que no señalan sino que contestan?",
 conceptos:["maestro ignorante","diálogo","domesticación","mediación pedagógica"],
 refs:["Freire, P. (1970). Pedagogia do oprimido. Río de Janeiro: Paz e Terra.","Rancière, J. (1987). Le maître ignorant. París: Fayard.","Sloterdijk, P. (1999). Regeln für den Menschenpark. Fráncfort: Suhrkamp."],
 enlaces:[{to:"der-cerdo",por:"del aula al expediente: la institución que enseña y la que firma"},{to:"der-musica",por:"la inteligencia artificial en el aula"},{to:"izq-buho",por:"el método como gesto transmitido"}]},

{id:"der-arbol", panel:"der", x:48, y:80, eje:"E7",
 nombre:"El hombre-árbol",
 ubic:"Centro del panel derecho",
 icon:"Un ser cuyo torso es una cáscara de huevo quebrada se sostiene sobre troncos huecos que apoyan en barcas. Sobre su cabeza, un disco con una gaita y figuras que lo rodean; dentro del torso, una taberna. El rostro se vuelve hacia el espectador. Es la figura del dibujo que ilustra la circular de estas Jornadas.",
 tesis:"La imagen de la convocatoria muestra lo humano ya intervenido: un cuerpo-dispositivo, habitado por otros, que mira su propia ruina.",
 lectura:"Foucault cerró Las palabras y las cosas sugiriendo que el hombre es una invención reciente y podría borrarse como un rostro dibujado en la arena. El transhumanismo, tal como lo reconstruye Bostrom, promete en cambio un humano mejorado por la técnica. El hombre-árbol es una contraimagen de esa promesa: la hibridación no lo potencia, lo ahueca y lo vuelve hospedaje. Pero su rostro es lúcido, melancólico, consciente. Es una figura de la crisis que no renuncia a la reflexión: lo humano persiste como mirada sobre su desmontaje.",
 pregunta:"¿El hombre-árbol es el fin de lo humano o la forma que toma lo humano cuando se piensa a sí mismo como ruina?",
 explora:"se topó con un cuerpo ya intervenido: lo humano apareció como un dispositivo habitado por otros, que sin embargo sigue mirando",
 breve:"lo humano persiste, pero como mirada sobre su propio desmontaje y no como figura intacta",
 responde:"Lo humano que se buscaba ya no está intacto. Visto desde el hombre-árbol, es un cuerpo ahuecado y habitado por otros, y sin embargo conserva un rostro que mira. La cuestión se contesta desde esa posición incómoda: la reflexión no necesita una figura entera; alcanza con que alguien siga registrando lo que le pasa.",
 reabre:"¿Alcanza con mirar la propia ruina, o esa lucidez es también una manera de acomodarse en ella?",
 conceptos:["fin del hombre","mejoramiento","hibridación","melancolía"],
 refs:["Foucault, M. (1966). Les mots et les choses. París: Gallimard.","Bostrom, N. (2005). A History of Transhumanist Thought. Journal of Evolution and Technology, 14(1).","Belting, H. (2002). Hieronymus Bosch. Garden of Earthly Delights. Múnich: Prestel."],
 enlaces:[{to:"izq-eva",por:"del origen presentado a la ruina habitada"},{to:"cen-frutos",por:"la hibridación en clave afirmativa"},{to:"der-musica",por:"el cuerpo-dispositivo junto a los instrumentos de tortura"}]},

{id:"der-musica", panel:"der", x:30, y:128, eje:"E5",
 nombre:"El infierno musical",
 ubic:"Plano medio izquierdo del panel derecho",
 icon:"Un laúd, un arpa en cuyas cuerdas queda atrapado un cuerpo, una zanfona y otros instrumentos agigantados se vuelven aparatos de tormento. En las nalgas de un condenado aparece escrita una partitura.",
 tesis:"El instrumento que producía armonía se vuelve dispositivo de captura: la técnica no es neutral y ejecuta a quien la ejecuta.",
 lectura:"Simondon atribuyó la alienación técnica no a las máquinas sino al desconocimiento de su modo de existencia. Stiegler pensó la técnica como fármaco, remedio y veneno a la vez. Las críticas recientes a los grandes modelos de lenguaje, como la de Bender y colegas, o el atlas material de Crawford, muestran que la inteligencia artificial no es un instrumento ingrávido sino una infraestructura extractiva. En filosofía y humanidades la pregunta es inmediata: quién toca a quién cuando escribimos con estos sistemas. Este sitio, construido con asistencia de IA, también pertenece a este panel.",
 pregunta:"Cuando la filosofía escribe con inteligencia artificial, ¿quién es el instrumento?",
 explora:"se cruzó con la técnica: el instrumento que debía servir para responder mostró que también captura a quien lo ejecuta",
 breve:"ningún instrumento es neutral, y el que usamos para responder también nos ejecuta",
 responde:"La respuesta no puede ignorar con qué instrumento se produce. Vista desde el infierno musical, donde el arpa atrapa a quien la tocaba, la cuestión incluye a la técnica que la formula: los sistemas con que hoy se escribe, y con que se armó este mismo recorrido, son infraestructuras que capturan tanto como ayudan.",
 reabre:"¿Qué parte de este argumento es tuya, qué parte es del instrumento, y cómo podría saberse la diferencia?",
 conceptos:["alienación técnica","pharmakon","extractivismo","modelos de lenguaje"],
 refs:["Simondon, G. (1958). Du mode d'existence des objets techniques. París: Aubier.","Stiegler, B. (1994). La technique et le temps 1. París: Galilée.","Bender, E. M., Gebru, T., McMillan-Major, A. y Shmitchell, S. (2021). On the Dangers of Stochastic Parrots. FAccT '21.","Crawford, K. (2021). Atlas of AI. New Haven: Yale University Press."],
 enlaces:[{to:"cen-esferas",por:"el medio que antes encerraba, ahora captura"},{to:"cen-cueva",por:"la inteligencia artificial en el aula"},{to:"der-arbol",por:"del instrumento al cuerpo convertido en dispositivo"}]},

{id:"der-cerdo", panel:"der", x:88, y:187, eje:"E0",
 nombre:"La cerda con toca de monja",
 ubic:"Ángulo inferior derecho del panel derecho",
 icon:"Un cerdo con velo de monja abraza a un hombre desnudo y lo presiona para que firme un documento; otras criaturas sostienen el tintero y un pliego con sellos. Se lo suele leer como sátira de las instituciones eclesiásticas y de la captación de bienes.",
 tesis:"El infierno también tiene burocracia: la firma arrancada es la escena de una institución que capta en lugar de pensar.",
 lectura:"Kant defendió que la facultad de filosofía, la inferior, responde solo a la razón, mientras las superiores sirven a los fines del gobierno; de esa asimetría nace el conflicto de las facultades. Derrida reclamó una universidad sin condición, con derecho a decirlo todo. Nussbaum sostuvo que las humanidades son condición de la vida democrática y no un lujo prescindible. La circular de estas Jornadas sitúa el presente en ese marco: el ataque a las humanidades como parte del anticientificismo y el negacionismo. El detalle del Bosco ofrece la escena justa: el documento que se firma sin leer.",
 pregunta:"¿Qué firma hoy la universidad sin leer, y qué la obliga a firmar?",
 explora:"entró en la institución: apareció la firma arrancada, el documento que se suscribe sin leer y la autoridad que capta en lugar de pensar",
 breve:"depende de instituciones capaces de leer antes de firmar, y hoy esa capacidad está bajo ataque",
 responde:"Lo que se preguntaba no se contesta fuera de las instituciones que alojan el pensamiento. Vista desde la firma arrancada, la cuestión depende de que exista un lugar con derecho a examinarla sin condiciones. Cuando ese lugar se debilita, la pregunta no desaparece: la contesta por adelantado quien redactó el documento.",
 reabre:"¿Qué tendría que negarse a firmar la universidad para seguir siendo el lugar donde esta pregunta puede hacerse?",
 conceptos:["conflicto de las facultades","universidad sin condición","autonomía","burocracia"],
 refs:["Kant, I. (1798). Der Streit der Fakultäten. Königsberg: Nicolovius.","Derrida, J. (2001). L'université sans condition. París: Galilée.","Nussbaum, M. (2010). Not for Profit. Princeton: Princeton University Press."],
 enlaces:[{to:"cen-cabalgata",por:"del orden de las instituciones al orden de los cuerpos"},{to:"cen-cueva",por:"del expediente al aula"},{to:"der-ciudad",por:"lo que arde cuando las instituciones del saber se debilitan"}]},

{id:"der-ciudad", panel:"der", x:50, y:24, eje:"E6",
 nombre:"La ciudad en llamas",
 ubic:"Franja superior del panel derecho",
 icon:"Contra un fondo nocturno, siluetas de edificios recortadas por el fuego; ejércitos y figuras diminutas cruzan un río o huyen. Es el horizonte del infierno.",
 tesis:"La destrucción no llega desde fuera de lo humano: es el horizonte que sus propias obras encienden.",
 lectura:"Es el lado destructivo del eje ético-político, y responde al exterior en grisalla. Benjamin imaginó al ángel de la historia viendo una única catástrofe que acumula ruinas mientras la tempestad del progreso lo empuja hacia adelante. Anders describió el desfase prometeico: producimos más de lo que podemos imaginar y nos avergüenza la perfección de nuestros productos. El incendio del Bosco no tiene autor visible; es un clima. Así se presenta lo que la circular llama el descalabro inhumano de los cambios de época: no un acontecimiento puntual sino una atmósfera.",
 pregunta:"Si la destrucción es un clima y no un acontecimiento, ¿qué tipo de pensamiento puede responderle?",
 explora:"quedó bajo la luz del incendio: la destrucción dejó de ser un hecho puntual y pasó a ser el clima en que se piensa",
 breve:"se contesta bajo un clima de destrucción que las propias obras humanas encendieron",
 responde:"La respuesta llega con el horizonte en llamas. Vista desde la ciudad que arde, la cuestión no puede tratarse como un asunto de tiempos tranquilos: la destrucción es el clima que las obras humanas produjeron, y pensar lo humano es pensar también a quien encendió ese fuego. Lo que se responda tiene que poder sostenerse ahí.",
 reabre:"¿Qué puede todavía empezar en un mundo donde la catástrofe ya no es una amenaza sino el clima?",
 conceptos:["catástrofe","desfase prometeico","progreso","época"],
 refs:["Benjamin, W. (1940). Über den Begriff der Geschichte, tesis IX.","Anders, G. (1956). Die Antiquiertheit des Menschen, vol. 1. Múnich: Beck."],
 enlaces:[{to:"ext-creacion",por:"del fuego a la luz gris de la creación"},{to:"cen-cabalgata",por:"la construcción del orden que este fuego deshace"},{to:"der-cerdo",por:"las instituciones ante la catástrofe"}]}
];

/* Recorridos propuestos. BORRADORES armados por la IA siguiendo reenvíos
   declarados; los define y reescribe el autor. Las respuestas a medida
   ("breve", "responde") también son borradores de la IA (14-11-2026). */
var RECORRIDOS = [
  {nombre:"En el sentido del tríptico", nota:"del exterior al Infierno, siempre por reenvío",
   pasos:["ext-creacion","izq-eva","izq-estanque","cen-frutos","der-arbol","der-musica"],
   breve:"unas humanidades pensadas desde un mundo sin centro humano son posibles, a condición de contar entre lo no humano a los instrumentos con los que hoy se dice y se manda",
   responde:"Sí, pueden pensarse unas humanidades desde las puertas cerradas, pero no como una vuelta a un mundo intacto. El camino que empezó donde lo humano todavía no era el centro termina frente a un instrumento que ejecuta a quien lo toca. Lo no humano desde el que hoy habría que pensar no es solo el de las plantas del tercer día: incluye a los sistemas a los que les decimos y les mandamos. Unas humanidades así tienen que estudiar también el instrumento con el que escriben."},
  {nombre:"Desde la imagen de la convocatoria", nota:"del hombre-árbol a las puertas cerradas",
   pasos:["der-arbol","izq-eva","cen-cueva","der-cerdo","der-ciudad","ext-creacion"],
   breve:"el hombre-árbol no es el fin de lo humano sino una forma tardía suya, dentro de un mundo que ya estaba haciéndose antes y que no termina con esa ruina",
   responde:"El hombre-árbol no es el fin de lo humano, porque lo humano nunca fue el principio. Desde las puertas cerradas se ve un mundo que ya estaba haciéndose antes de la escena en que alguien presentó a lo humano, y que sigue haciéndose después del incendio. La ruina existe, pero es la de una figura y de las instituciones que la sostenían, no la del mundo. El hombre-árbol es entonces la forma que toma lo humano cuando se piensa como ruina, y la grisalla le quita a esa forma el privilegio de ser la última."}
];

/* Plantillas del argumento. La conclusión tiene cuatro movimientos: la
   pregunta que plantea el punto de inicio, lo que le pasa a esa pregunta en
   los sectores intermedios, la respuesta que recibe desde el final y la
   pregunta nueva que reinicia el ciclo. Apunta a unas 300 palabras. */
var FRASES = {
  paso:{
    inicio:"Partimos de «{n}»: {tesis}",
    fuerte:"por reenvío ({causas})",
    debil:"por el camino recorrido ({causas})",
    llegada:"{como}, llegamos a «{n}»: {tesis}",
    vuelta:"Volvemos a «{n}» {como}: su tesis se lee ahora después de «{prev}»."
  },
  cierre:{
    lineal:"La pregunta de partida era: {pregunta} Desde «{b}», el recorrido responde que {breve}. Y deja otra pregunta: {reabre}",
    circular:"La pregunta de partida era: {pregunta} De vuelta en «{b}», el recorrido responde que {breve}. Y deja otra pregunta: {reabre}"
  },
  conclusion:{
    abre:"Este recorrido empezó en «{a}», con una pregunta: {pregunta} La tesis de partida era que {tesis}",
    abreRe:"Este recorrido empezó en «{a}», con la pregunta que había dejado un recorrido anterior: {pregunta} La tesis de partida era que {tesis}",
    explora:["En «{n}», la pregunta {explora}.", "Después, en «{n}», {explora}.", "Más adelante, en «{n}», {explora}."],
    restoUno:"El camino pasó además por otro sector.",
    restoVarios:"El camino pasó además por otros {k} sectores.",
    directoFuerte:"Entre el inicio y el final hubo un solo paso, dado por reenvío: {causas}.",
    directoDebil:"Entre el inicio y el final hubo un solo paso, sostenido por causas más débiles: {causas}.",
    final:"El recorrido termina en «{b}». Desde ahí, la pregunta inicial recibe su respuesta. {responde}",
    finalCircular:"El recorrido vuelve a «{b}», donde había empezado, y desde ahí contesta su propia pregunta. {responde}",
    sentido:{
      circular:"El argumento se cierra sobre sí mismo.",
      mismo:"Empezó y terminó en {l}.",
      favor:"Fue {de} {al}, en el sentido en que suele leerse el tríptico: lo posterior se lee desde lo anterior.",
      contra:"Fue {de} {al}, a contrapelo del sentido en que suele leerse el tríptico: lo anterior se lee desde lo posterior."
    },
    reabre:"Esa respuesta no cierra el asunto; abre otra pregunta: {reabre}"
  }
};

return {PANELS:PANELS, TOTAL_W:TOTAL_W, TOTAL_H:TOTAL_H, IMAGEN:IMAGEN, EJES:EJES, SECTORES:SECTORES, RECORRIDOS:RECORRIDOS, FRASES:FRASES};
})();
