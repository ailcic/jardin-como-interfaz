# El jardín como interfaz

Experimento filosófico de humanidades digitales. *El jardín de las delicias* de El Bosco funciona como interfaz para recorrer los ejes de las Jornadas de Filosofía «Lo humano, lo no humano, las humanidades» (FFyH–UNC, noviembre de 2026).

Cada sector del tríptico aloja una lectura filosófica. El camino por el que se llega a cada sector compone, a medida que se navega, un argumento propio: dos recorridos distintos producen dos argumentos distintos. Cada recorrido tiene un enlace (`#r=sector.sector…`) y se puede copiar con sus referencias.

## Uso

Abrí `index.html` en el navegador. También podés servir la carpeta con:

```
python3 -m http.server 8001
```

No hay dependencias ni paso de compilación. Todo el contenido está en `js/datos.js`.

Para proyectar, el botón «Modo exposición» (o `?expo` en la dirección) pone el cuadro, la lectura y el argumento en una sola pantalla, con letra grande y un recorrido guiado opcional. Teclas: → siguiente, ← anterior, C conclusión, Z acercar, F pantalla completa, + y − tamaño de letra, Esc salir.

## Documentación

- `docs/abstract.md`: abstract de la ponencia.
- `docs/mapeo-ejes.md`: qué sector corresponde a qué eje, y por qué.
- `docs/bitacora.md`: registro del proceso de construcción asistido por IA.
- `CLAUDE.md`: contexto y convenciones para seguir el desarrollo con Claude Code.

## Estado

Prototipo 0.2. El tríptico abierto usa una reproducción en dominio público (`img/`); el exterior sigue siendo un esquema. Las lecturas son borradores.

Sitio publicado: https://ailcic.github.io/jardin-como-interfaz/

## Licencia

Por ahora, el código y los textos se publican bajo [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es) (atribución, sin uso comercial, sin obras derivadas); el texto legal está en `LICENSE`. Las reproducciones del tríptico en `img/` no son del autor y no quedan cubiertas por esta licencia.
