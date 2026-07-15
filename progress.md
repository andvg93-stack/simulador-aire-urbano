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

## Laboratorio comparativo de material particulado

- Solicitud activa: rediseñar PM2.5 y PM10 como un único laboratorio comparativo integrado al simulador, con animación respiratoria, referencias Colombia/OMS y medidas demostrativas.
- Auditoría previa: los valores y sliders funcionaban, pero las partículas respiratorias quedaban fuera del SVG, la escena no se animaba, las categorías eran relativas y volver al simulador eliminaba el plan en curso.
- Rama de trabajo: `codex/recurso-material-particulado`.
- Criterios: conservar URLs y `?value=`, aceptar `focus`, `pm25`, `pm10` y `embedded`, preservar estado del simulador, usar efectos P1/P7 y verificar escritorio/móvil con Playwright.
- Implementado: laboratorio PM compartido con comparación de tamaño, trayectorias respiratorias, referencias Colombia/OMS, fuentes, medidas P1/P7, reproducción, pausa, restablecimiento y estado determinista.
- Implementado: diálogo con iframe desde las tarjetas PM que conserva el estado del simulador y restaura el foco al cerrar.
- Ajuste de prueba: el bucle automático se desactiva cuando el cliente instala tiempo virtual; en ese modo la escena avanza solo mediante `advanceTime(ms)`.
- Verificación funcional parcial: diálogo conserva P1 y 35 puntos, restaura foco, cierra con control interno o Escape; referencias OMS/Colombia, P7, P1+P7, pausa, avance y restablecimiento entregan los estados esperados sin errores de consola.
- Hallazgo corregido: los parámetros ausentes ya no se convierten en cero, por lo que `?value=` vuelve a inicializar correctamente la ruta heredada.
- Verificación funcional final: extremos 5/80 y 10/120, umbrales 15/37/45/75, P1, P7 y P1+P7 coinciden con el modelo; pausa conserva la fase y 600 ms de avance producen 0,1 de recorrido.
- Verificación geométrica: todas las partículas quedan dentro del `viewBox`; los depósitos PM2.5 se ubican más profundos que PM10 y la comparación real mantiene la razón 70:10:2,5.
- Verificación visual: diálogo revisado en 1440×900 y 390×844, recurso completo en 1280×900 y vistas móviles segmentadas; no hay desbordamiento horizontal, recortes funcionales ni rótulos superpuestos.
- Regresión: URLs heredadas de PM2.5/PM10 y recurso CO₂ siguen funcionando; cliente determinista ejecutado para ambos focos, preferencia de movimiento reducido respetada y cero errores de consola.
- Pendientes conocidos: ninguno dentro del alcance del laboratorio de material particulado.

## Laboratorio de CO₂

- Solicitud activa: separar emisiones urbanas y concentración atmosférica, integrar el recurso sin perder el plan y reemplazar la escena estática por un laboratorio determinista.
- Rama de trabajo: `codex/recurso-co2`.
- Decisión de modelo: CO₂ pasa de una falsa concentración reducible de 496 ppm a un índice relativo de emisiones con base 100 y rango 65–115; los coeficientes de P1, P2, P3, P4, P5 y P9 no cambian.
- Implementado: la tarjeta, las gráficas y el reporte principal identifican la métrica como `Emisiones CO₂` en índice relativo.
- Implementado: el diálogo educativo se generalizó para CO₂ y material particulado, conservando estado, cierre interno, Escape y restauración de foco.
- Implementado: laboratorio con vistas de fuentes y clima, actividad relativa, fuente destacada, seis medidas, resultados antes/después, referencia atmosférica fechada y animación determinista.
- Compatibilidad: `?current=` recibe el índice actual y `?value=` normaliza enlaces heredados con la relación `value / 496 × 100`.
- Verificación inicial: sintaxis JavaScript válida y auditoría de 370 combinaciones de políticas completada con 39 planes aceptables, sin alterar sus criterios.
- Verificación funcional: a actividad 100, P1=90, P2=85, P3=95, P4=93, P5=97 y P9=95; los extremos 50/150 cambian densidad e índice sin alterar la referencia de 431 ppm.
- Verificación determinista: la pausa conserva la fase, 600 ms de avance producen 0,1 de recorrido al reproducir y restablecer recupera vista, actividad, fuente, medida y fase iniciales.
- Verificación de compatibilidad: `?value=496` produce 100, `?value=350` produce 70,56 y `?current=65` conserva 65 sin recorte silencioso.
- Verificación integrada: P1 y sus 35 puntos se conservan al cerrar desde el recurso o con Escape; el foco vuelve a la tarjeta CO₂ y PM2.5/PM10 mantienen su diálogo y valores.
- Verificación del reporte: el escenario P1+P2 termina en índice 75 y la tabla final muestra `Emisiones CO₂`, base 100, resultado 75, reducción 25% y unidad `índice`, sin ppm heredadas.
- Verificación visual: fuentes y clima revisados en 1280×900; recurso y diálogo revisados en 390×844, sin desbordamiento horizontal, solapamientos ni recortes de controles.
- Accesibilidad y estabilidad: movimiento reducido inicia en pausa, todos los controles son alcanzables por teclado, las moléculas permanecen dentro del `viewBox` y no hay errores de consola ni solicitudes 404.
- Cliente determinista oficial ejecutado después de los ajustes finales; estado textual y captura coinciden.
- Pendientes conocidos: ninguno dentro del alcance del laboratorio de CO₂.
- Ajuste de presentación solicitado: el índice permanece como variable interna, pero todos los valores visibles usan una escala didáctica acotada de 431 ppm en índice 70 a 496 ppm en índice 100; valores internos fuera del intervalo se muestran en el límite más cercano.
- Ajuste aplicado: tarjeta, estado textual, laboratorio, gráfica normalizada, tabla y resumen del reporte convierten CO₂ con la misma función, manteniendo intactos los efectos de las políticas.
- Verificación de la escala: 70=431 ppm, 100=496 ppm, P1=474,3, P2=463,5, P3/P9=485,2, P4=480,8 y P5=489,5 ppm; índices menores de 70 permanecen en 431 y mayores de 100 en 496.
- Verificación de coherencia: el escenario P1+P2 termina en 442 ppm tanto en tarjeta como en reporte; la tabla y el resumen gráfico muestran una variación de −10,9% calculada sobre los valores visibles.
- Verificación visual final: P2 muestra 496→464 ppm en escritorio y móvil, sin desbordamiento ni errores de consola.

## Auditoría y plan del laboratorio de NOx

- Rama de trabajo: `codex/recurso-nox`.
- Se creó `CRITERIOS_LABS_EDUCATIVOS.md` como especificación reutilizable para objetivo, contenido, controles, integridad científica, integración, determinismo, accesibilidad y aceptación de los laboratorios restantes.
- Auditoría Playwright: `?value=94` funciona y la vista móvil no desborda; el control entrega 15–125 ppb, `advanceTime(5000)` no cambia el SVG y falta favicon.
- Hallazgo crítico: volver desde NOx recarga el simulador; P1 y sus 35 puntos usados se pierden.
- Hallazgo científico: el recurso llama “emisión” a una concentración en ppb, no separa NOx de NO₂ y representa una respuesta siempre positiva hacia O₃ que no coincide con la lógica NOx–COV–meteorología del modelo.
- Decisión de plan: conservar `nox` como variable interna, separar NOx precursor de NO₂ equivalente para exposición y comparar únicamente períodos compatibles.
- Referencias verificadas: Colombia establece para NO₂ 200 µg/m³ en 1 hora y 60 µg/m³ anual, con meta anual de 40 µg/m³ desde 2030; OMS 2021 recomienda 10 µg/m³ anual y 25 µg/m³ en 24 horas.
- Alcance de esta iteración: auditoría, criterios y plan documentados; la implementación del nuevo laboratorio NOx queda pendiente de autorización explícita.
