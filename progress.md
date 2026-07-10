Original prompt: Mejorar la UI para acercarla a la imagen de referencia, verificar visualmente y enfocarse primero en interfaz antes de mejorar la simulacion.

## Avance

- Se creo un checkpoint previo en Git antes del rediseno.
- Se incorporo el dashboard nocturno, KPIs urbanos, minigraficas y linea temporal.
- Se agregaron `window.render_game_to_text()` y `window.advanceTime(ms)` para pruebas.

## Verificacion completada

- Capturas revisadas en escritorio 1620x887 y tablet 900x800.
- Seleccion de politicas, presupuesto y avance de simulacion probados sin errores de consola.
- Cliente determinista ejecutado; el escenario y los KPIs se renderizan correctamente.

## Minigraficas

- Se reemplazaron los trazos decorativos por series calculadas desde el ano 0 hasta el ano actual.
- Cada serie usa la misma funcion de simulacion que alimenta su valor numerico y su barra.

## Presupuesto

- Disponible y usado se unificaron en una tarjeta con barra de saldo disponible.
- La barra inicia al 100% y llega exactamente a 0% cuando se agota el presupuesto.
