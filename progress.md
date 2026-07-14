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

## Cierre del año 5 y retroalimentación

- Solicitud activa: destacar claramente "Exportar reporte" al finalizar el año 5 y enriquecer el reporte de un plan no aceptable con fortalezas, aspectos por mejorar y pautas concretas.
- Decisión: la llamada visual se activará solo cuando el reporte esté realmente disponible y respetará la preferencia de movimiento reducido.
- Decisión: la retroalimentación se calculará con los mismos criterios técnicos usados para clasificar el plan, evitando mensajes genéricos.
- Implementado: botón final con contraste luminoso, marca de verificación, pulso breve, etiqueta accesible y desplazamiento automático de la barra de acciones en móvil.
- Implementado: la exportación anticipada queda bloqueada y `render_game_to_text` informa disponibilidad y estado del reporte.
- Implementado: el resultado no aceptable distingue avances, metas incumplidas con cifras y recomendaciones por contaminante, exposición, aceptación, equidad, ozono y tiempo de implementación.
- Verificación: flujo completo sin políticas, plan no aceptable P3 y plan aceptable P1+P2; exportación anticipada bloqueada y cero errores de consola.
- Verificación visual: año 5 y reporte revisados en 1440×900, 1100×800 y 390×844; el botón queda completamente visible en móvil y el reporte no tiene desbordamiento horizontal.
- Pendientes conocidos: ninguno dentro de este alcance.

## Rediseño editorial del reporte

- Solicitud activa: aproximar el reporte final al dashboard editorial de la referencia, permitiendo varias hojas impresas cuando sea necesario.
- Implementado: plantilla unificada para estados aceptable, parcial y no aceptable, con cabecera, resumen, KPIs, gráficas normalizadas, tabla comparativa, diagnóstico, políticas, impacto global y nota final.
- Implementado: diseño responsivo y reglas de impresión A4 con transición de página controlada antes del bloque social y térmico.
- Implementado: acciones de volver y guardar ubicadas fuera del reporte para no cubrir información; los planes aceptables muestran aspectos a sostener en lugar de una falsa debilidad.
- Verificación funcional: estados aceptable (P1+P2), parcialmente aceptable (P1+P10+P4) y no aceptable (P3), sin errores de consola.
- Verificación visual: reporte completo revisado a 1280 px y 390 px; sin desbordamiento global y con tablas desplazables en móvil.
- Verificación PDF: salida A4 de dos páginas renderizada y revisada para planes aceptables y no aceptables; sin recortes, superposiciones ni glifos defectuosos.
- Pendientes conocidos: ninguno dentro del rediseño del reporte.

## Reporte de ejemplo

- Generado con P1, P2 y P3: presupuesto 95/100, tres políticas y resultado parcialmente aceptable.
- Artefactos: PDF A4 de dos páginas, vista completa en pantalla y previsualizaciones PNG de cada página en `output/pdf/`.
- Verificación: datos equivalentes a la referencia, dos páginas A4 confirmadas y revisión visual sin recortes, superposiciones ni errores de consola.
