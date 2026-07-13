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

- Se retiraron las minigraficas por resultar demasiado sutiles para comunicar los cambios.

## Recursos didacticos

- Cada uno de los 12 parametros enlaza un recurso didactico.
- Se agregaron paginas individuales para PM2.5, PM10, altura de mezcla, indice de ventilacion y estancamiento.
- Los recursos navegan en la misma pestana para evitar bloqueos de popups; cada pagina permite volver al simulador.
- Los 12 recursos enlazados muestran exactamente un control para volver al simulador, incluidos los recursos antiguos.

## Tema ambiental

- La pagina principal usa una paleta bosque, tarjetas marfil, textura vectorial de hojas y terminologia ambiental.
- Se mantuvieron intactas la simulacion y las paginas de recursos educativos.
- El panel de monitoreo reserva espacio para sus tres insights y desplaza solamente la grilla de parametros.

## Atmosfera

- Se retiraron las nubes 3D y se agrego una textura atmosferica local con nubes en los bordes.
- El HUD inferior usa transparencia y desenfoque para dejar visible el escenario.

## Presupuesto

- Disponible y usado se unificaron en una tarjeta con barra de saldo disponible.
- La barra inicia al 100% y llega exactamente a 0% cuando se agota el presupuesto.

## Rediseño de recursos educativos

- Objetivo activo: convertir los 12 recursos enlazados en laboratorios visuales, deterministas y responsivos.
- Rama de trabajo: `codex/recursos-educativos`.
- Auditoría inicial: los controles funcionan, pero las páginas antiguas recortan gráficos en móvil y las páginas nuevas carecen de una visualización del fenómeno.
- Criterios: conservar URLs y regreso, eliminar posiciones aleatorias, aceptar `?value=` y verificar cada recurso en escritorio y móvil.
- Implementado: plantilla clara compartida, 12 escenas SVG específicas, controles combinados en O₃/COV/ventilación y estado de prueba determinista.
- Verificación visual: matriz completa revisada en 1440×900 y 390×844; no hay desbordamiento horizontal ni controles fuera de pantalla.
- Verificación funcional: mínimos/máximos y controles secundarios actualizan valores, categorías y escenas en 12/12 recursos.
- Integración: las 12 tarjetas del simulador transfieren su valor actual mediante `?value=` y conservan una sola navegación de regreso.
- Accesibilidad: controles etiquetados, SVG con nombre accesible, IDs únicos y cero errores de consola.
- Pendientes conocidos: ninguno dentro del alcance de los 12 recursos enlazados; las dos páginas combinadas antiguas continúan fuera de navegación.
