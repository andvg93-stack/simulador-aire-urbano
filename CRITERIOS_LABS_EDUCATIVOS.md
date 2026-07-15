# Criterios comunes para los laboratorios educativos

Versión: 1.0  
Fecha: 2026-07-15  
Estado: criterio de trabajo obligatorio para los recursos restantes

## Propósito

Este documento define cómo auditar, diseñar, implementar y aceptar cada laboratorio educativo del simulador. El laboratorio debe explicar un fenómeno, responder de forma visible a cada control, usar las mismas relaciones del modelo principal y conservar intacto el plan del estudiante.

## 1. Especificación previa obligatoria

Antes de modificar código, cada recurso debe tener un plan con estas secciones:

1. **Objetivo de aprendizaje:** qué relación causal debe poder explicar el estudiante al terminar.
2. **Alcance y límites:** qué representa el recurso y qué no pretende simular.
3. **Contenido visible:** escena, variables, etiquetas, referencias, resultados y comparaciones.
4. **Controles:** opciones, variable que cambia, resultado visible e invariantes que no deben cambiar.
5. **Conexión con el simulador:** dato recibido, políticas disponibles, coeficientes y estado que debe conservarse.
6. **Comportamiento temporal:** qué se mueve, cómo se pausa, qué restablece y qué debe hacer `advanceTime(ms)`.
7. **Pruebas de aceptación:** valores extremos, puntos de referencia, combinaciones, accesibilidad, escritorio y móvil.

La tabla mínima de controles es:

| Control | Opciones o rango | Qué modifica | Qué no debe modificar | Evidencia esperada |
|---|---|---|---|---|
| Nombre | Valores exactos | Variable o elementos | Invariantes | Cambio en cifra, texto, SVG y estado textual |

## 2. Integridad científica y semántica

- Identificar siempre el tipo de variable: emisión, concentración, exposición, condición meteorológica, índice o resultado social.
- No intercambiar flujo de emisión y concentración ambiental.
- No comparar una familia química con la norma de una especie individual sin explicarlo; por ejemplo, NOx no es sinónimo de NO₂.
- Toda cifra visible debe incluir unidad, período de promediación cuando corresponda y significado. Un valor adimensional debe llamarse explícitamente índice y explicar su base.
- Una conversión o escala didáctica debe ser única, explícita, acotada y compartida por tarjeta, laboratorio, gráfica, estado textual y reporte.
- Las referencias deben ser oficiales o primarias, estar fechadas y conservar su período de promediación.
- No usar categorías arbitrarias como “bajo/medio/alto”. Los estados deben describir el cambio frente al escenario base o una referencia realmente comparable.
- El color nunca será la única forma de expresar un estado.
- El lenguaje debe indicar que es una representación didáctica y evitar prometer precisión fisiológica, química o regulatoria que el modelo no tiene.
- Si la ciencia real es no lineal, el laboratorio no puede sustituirla silenciosamente por una suma lineal. Puede simplificarla si declara la regla y reproduce la misma simplificación del simulador.

## 3. Relación con el modelo principal

- El valor actual transferido desde el simulador se presenta por separado del experimento cuando aplicar de nuevo una política produciría una reducción duplicada.
- Las políticas demostrativas usan exactamente los coeficientes y reglas del modelo principal, incluidos efectos indirectos y combinaciones.
- Aplicar una medida dentro del laboratorio no selecciona, implementa ni elimina políticas del plan principal.
- Cambiar una fuente ilustrada no altera silenciosamente el valor base.
- Un control modifica solamente las variables declaradas; densidad, tamaño, velocidad, color y trayectoria no deben mezclarse sin una razón pedagógica explícita.
- Restablecer recupera el estado inicial documentado y no un valor genérico.

## 4. Contrato de integración

- Conservar la URL histórica del recurso y la compatibilidad con `?value=`.
- Preferir parámetros explícitos como `current`, `focus`, valores relacionados, vista inicial y `embedded=1`.
- Abrir desde la tarjeta en el diálogo educativo con `iframe`, sin recargar `index.html`.
- Cerrar mediante botón externo, botón interno, Escape o mensaje `educational-resource:close`.
- Al cerrar, conservar exactamente año, políticas planeadas e implementadas, presupuesto, historial, estado de simulación y cualquier selección activa.
- Restaurar el foco a la tarjeta que abrió el recurso.
- Navegación directa fuera del diálogo debe seguir disponible.
- Evitar solicitudes fallidas, recursos 404 y dependencias de red necesarias para que funcione el laboratorio.

## 5. Simulación visible y determinista

- El distintivo “En vivo” solo se usa si existe movimiento observable.
- La animación no depende de valores aleatorios. Una misma entrada y una misma fase producen el mismo fotograma.
- Reproducir mueve los elementos declarados; pausar conserva el fotograma exacto.
- `advanceTime(ms)` avanza realmente la fase si está reproduciendo y no cambia nada si está pausado.
- El movimiento automático debe poder desactivarse durante pruebas con tiempo virtual.
- Todas las entidades permanecen dentro del `viewBox` o su salida está intencionalmente documentada.
- `render_game_to_text()` debe representar lo que se ve: entradas, valores antes/después, medida, fase, reproducción, entidades visibles y estados relevantes.

## 6. Accesibilidad y diseño adaptable

- Todos los controles tienen etiqueta accesible, estado comprensible y orden lógico de teclado.
- Botones, rangos, selectores, pestañas y diálogo son operables sin ratón.
- El SVG tiene nombre y descripción accesibles; los textos esenciales no existen solamente dentro de una imagen.
- Se respeta `prefers-reduced-motion`; el recurso puede iniciar pausado sin perder funcionalidad.
- No hay pérdida de contenido ni desbordamiento horizontal en 1280×900 y 390×844.
- Los controles y resultados permanecen legibles con ampliación y no dependen de hover.

## 7. Matriz mínima de pruebas

Para cada laboratorio se debe verificar con Playwright:

1. Apertura directa y apertura desde su tarjeta.
2. Transferencia exacta del valor actual y compatibilidad de parámetros heredados.
3. Mínimo, máximo, valor inicial y todos los puntos de referencia.
4. Cada opción de cada control y las combinaciones con interacciones entre variables.
5. Coincidencia numérica con los efectos y reglas del modelo principal.
6. Cambio coherente de cifra, explicación, escena y `render_game_to_text()`.
7. Reproducir, pausar, restablecer y avance determinista.
8. Conservación exacta de un estado conocido, como P1 seleccionado, 35 puntos usados, año e historial.
9. Cierre interno, cierre externo, Escape y restauración de foco.
10. Capturas en 1280×900 y 390×844, además de movimiento reducido y navegación por teclado.
11. Geometría dentro del SVG, ausencia de elementos aleatorios, cero errores de consola y cero solicitudes 404.
12. Regresión de los laboratorios ya mejorados y de las demás rutas educativas.

## 8. Definición de terminado

Un recurso no se considera terminado porque el control cambie un número. Se acepta únicamente cuando el cambio esperado ocurre de forma visible, numérica y textual; coincide con el simulador; la explicación es científicamente defendible; no se pierde el estado principal; y toda la matriz de pruebas queda registrada en `progress.md`.

---

# Aplicación de los criterios: auditoría y plan de NOx

## Diagnóstico reproducido

| Área | Resultado |
|---|---|
| Transferencia | `?value=94` produce 94 ppb y el control responde. |
| Extremos | El recurso produce 15 ppb en 0 % y 125 ppb en 100 %, aunque el simulador declara un rango de 10–120 ppb. |
| Animación | `advanceTime(5000)` no cambia el SVG; “En vivo” describe una escena estática. |
| Integración | Con P1 seleccionado, volver recarga el simulador y el presupuesto usado pasa de 35 a 0. |
| Semántica | El resultado se llama “emisión” pero se expresa en ppb, una unidad de concentración. |
| Especie | Se usa NOx para efectos respiratorios y referencias sin separar la familia NOx de la especie regulada NO₂. |
| Ozono | El dibujo siempre conduce a O₃; no muestra COV, meteorología ni la respuesta no lineal que sí aplica el modelo principal. |
| Categorías | “Emisión baja/media/alta” sale del porcentaje del slider y no de una referencia científica. |
| Políticas | No permite probar P1, P2, P3, P4, P6, P8 ni P9, ni muestra antes/después. |
| Estado textual | Solo informa control y resultado; omite fase, fuentes, política, química y elementos visibles. |
| Adaptación | En 390×844 no existe desbordamiento horizontal y los controles permanecen legibles. |
| Consola | Falta favicon y se genera una solicitud 404. |

## Decisión semántica recomendada

Mantener la clave interna `nox` y sus coeficientes para no alterar el modelo. En la interfaz, separar dos usos:

- **NOx:** familia precursora usada en la vista de emisiones y química del ozono.
- **NO₂ equivalente:** indicador secundario usado para exposición y referencias. El laboratorio mantendrá NOx en ppb como métrica principal y mostrará, solo como contexto, la equivalencia aproximada de NO₂ con `µg/m³ = ppb × 46,0055 / 24,45` a 25 °C y 1 atm. Esta equivalencia supone NO₂ y no es una medición de la composición real de NOx.

El valor transferido se describirá como un **escenario didáctico equivalente a una hora**. Solo se clasificará contra el máximo colombiano de NO₂ de una hora. Los valores anuales y de 24 horas aparecerán como contexto separado y nunca se compararán directamente con el fotograma de una hora.

## Objetivo de aprendizaje

El estudiante deberá comprender que:

- NOx es una familia de gases producida principalmente por combustión; NO₂ es una de sus especies y se usa como indicador de exposición y regulación.
- Más actividad de combustión aumenta el flujo emitido, pero fuente, concentración y exposición no son la misma magnitud.
- NOx participa en la formación de ozono y material particulado secundario.
- La respuesta del O₃ depende del balance entre NOx, COV y meteorología; reducir solo NOx no garantiza una disminución inmediata de O₃ en la simplificación del simulador.
- Las políticas de movilidad, combustión, ventilación y control de COV tienen efectos diferentes y pueden producir resultados indirectos.

## Contenido visible propuesto

El laboratorio tendrá dos vistas sincronizadas:

1. **Fuentes y exposición:** tráfico, buses, combustión estacionaria, pluma urbana, mezcla y un punto de monitoreo. Mostrará NOx como precursor y NO₂ equivalente como indicador de concentración.
2. **Química del ozono:** NOx, COV, radiación, ventilación y O₃, con trayectorias animadas y el régimen didáctico resultante.

Ambas vistas mostrarán:

- Valor actual transferido desde el simulador, separado del escenario experimental.
- Valor experimental antes y después de la medida y reducción porcentual.
- Resultado de O₃ antes y después cuando la combinación lo afecte.
- Referencia comparable: Colombia, NO₂ 200 µg/m³, promedio de 1 hora.
- Contexto no comparable directamente: Colombia 60 µg/m³ anual, meta 2030 de 40 µg/m³ anual; OMS 10 µg/m³ anual y 25 µg/m³ en 24 horas.
- Nota visible sobre el carácter didáctico de la equivalencia NOx–NO₂.

Con esta convención, 94 ppb se muestran además como aproximadamente 176,9 µg/m³ de NO₂ equivalente; el máximo colombiano de 200 µg/m³ corresponde aproximadamente a 106,3 ppb en las mismas condiciones. La tarjeta, las gráficas y el reporte principal pueden conservar NOx en ppb.

## Controles y comportamiento esperado

| Control | Opciones | Resultado visible esperado |
|---|---|---|
| Vista | Fuentes y exposición; Química del ozono | Cambia la representación sin reiniciar valores, política ni fase. |
| Concentración experimental | 10–120 ppb, paso 1; inicio 94 | Cambia número y densidad, pero no transforma la fuente ni el período de promediación. |
| Fuente destacada | Tráfico liviano; buses y carga; combustión estacionaria; mixta | Cambia emisores y explicación, sin alterar silenciosamente la concentración. |
| Medida sobre NOx | Sin medida; P1; P2; P3; P4; P6; P9 | Aplica exactamente −25 %, −35 %, −10 %, −10 %, −8 % y −8 %. |
| Control adicional de COV | Sin P8; con P8 | Aplica −35 % a COV y permite observar la respuesta combinada de O₃; no cambia NOx. |
| Reproducir/pausar | Estado binario | Mueve pluma, moléculas y reacción; al pausar conserva el fotograma. |
| Restablecer | Acción | Recupera 94 ppb, fuente mixta, sin medidas, vista inicial y fase cero; conserva el valor actual leído del simulador. |

Los estados dejarán de llamarse “Emisión baja/media/alta”. Para el escenario de una hora dirán “Dentro del máximo colombiano de 1 hora” o “Supera el máximo colombiano de 1 hora”. Las referencias anual y de 24 horas solo tendrán rótulos informativos.

## Reglas del modelo que debe reproducir

Con base experimental de 94 ppb:

| Medida | NOx después | Efecto directo esperado sobre O₃ con el modelo actual |
|---|---:|---:|
| P1 | 70,5 ppb | +8 % porque NOx baja al menos 20 % y COV menos de 10 %. |
| P2 | 61,1 ppb | +8 % por la misma regla. |
| P3 | 84,6 ppb | Sin cambio por química NOx–COV. |
| P4 | 84,6 ppb | Sin cambio por química NOx–COV. |
| P6 | 86,5 ppb | −9 % por el aumento de 18 % en viento del modelo. |
| P9 | 86,5 ppb | Sin cambio por química NOx–COV. |
| P8 | 94,0 ppb | −12 % porque COV baja al menos 20 %. |
| P1 + P8 | 70,5 ppb | −12 % por el control suficiente de COV. |

La implementación debe calcular las combinaciones con la misma función del simulador, no con una segunda tabla independiente.

## Implementación e interfaces previstas

- Crear una ruta especializada de NOx en `recurso-didactico.js` y estilos aislados en `recurso-didactico.css`.
- Mantener `recurso-nox.html` y `?value=`; aceptar `current`, `embedded` y vista inicial.
- Incorporar NOx al diálogo educativo generalizado y preservar estado y foco.
- Mantener `nox` como variable interna y visible en ppb en tarjeta, gráficas y reporte; limitar la conversión secundaria a NO₂ equivalente al panel de exposición y referencias del laboratorio.
- Implementar una fase determinista y hacer que `advanceTime(ms)` mueva realmente los elementos.
- Ampliar `render_game_to_text()` con vista, valor actual, concentración experimental, fuente, medidas, NOx antes/después, COV, O₃ antes/después, reproducción, fase y entidades visibles.
- Añadir favicon válido y eliminar la solicitud 404.
- Registrar implementación, pruebas y cualquier desviación de este plan en `progress.md`.

## Aceptación específica de NOx

- Confirmar 94 ppb al abrir y 10/120 en extremos, sin llegar a 125; verificar además 94 ppb ≈ 176,9 µg/m³ y el marcador de 200 µg/m³ ≈ 106,3 ppb.
- Verificar todas las medidas y combinaciones con P8 contra `calculateValues()` y la lógica NOx–COV–O₃.
- Confirmar que P1 y P2 pueden aumentar O₃ en la simplificación actual y que P1+P8 lo reduce; la escena y el texto deben coincidir.
- Validar que solo el resultado equivalente de una hora se compare con el máximo colombiano de una hora.
- Comprobar movimiento dentro del `viewBox`, pausa exacta, restablecimiento y avance determinista.
- Abrir con P1 y 35 puntos usados; cerrar por las cuatro vías y conservar política, presupuesto, año e historial.
- Revisar 1280×900 y 390×844, movimiento reducido, teclado, foco, consola y regresión de PM y CO₂.

## Fuentes primarias y oficiales

- [Ministerio de Ambiente y Desarrollo Sostenible, Resolución 2254 de 2017](https://www.minambiente.gov.co/wp-content/uploads/2021/10/Resolucion-2254-de-2017.pdf)
- [OMS, valores guía y efectos de NO₂](https://www.who.int/teams/environment-climate-change-and-health/air-quality-and-health/health-impacts/types-of-pollutants)
- [EPA, información básica sobre NO₂ y su relación con NOx](https://www.epa.gov/no2-pollution/basic-information-about-no2)
- [EPA, formación secundaria y regímenes NOx/COV](https://www.epa.gov/sites/default/files/2020-09/documents/epa-454_r-19-003.pdf)

---

# Auditoría y plan específico: ozono troposférico (O₃)

## Diagnóstico del recurso actual

La revisión de código y la auditoría funcional en escritorio y móvil confirmaron:

- Correcto: el control responde, la interfaz es legible y no presenta desbordamiento horizontal en 390×844.
- Incorrecto: `?value=20.2`, que corresponde al estado base del simulador, termina mostrando 35,2 ppb. El recurso transforma el valor mediante una escala arbitraria de radiación y precursores en vez de conservar la concentración recibida.
- Incorrecto: el control de radiación no recorre el intervalo declarado de 10–60 ppb; con precursores altos produce aproximadamente 30,6–53,1 ppb, mientras cambiar ambos precursores a “bajo” entrega 39,4 ppb incluso con radiación máxima.
- Defectuoso: la etiqueta “En vivo” acompaña una escena estática. `advanceTime(5000)` no cambia moléculas, trayectorias ni fotograma.
- Insuficiente: NOx, COV y radiación se combinan con una media ponderada siempre positiva que contradice la respuesta no lineal ya implementada en el modelo compartido NOx–COV–meteorología–O₃.
- Insuficiente: la escena muestra tres cajas, una flecha y un óvalo; no representa fuentes, formación secundaria, transporte, punto receptor, exposición ni período de promediación.
- Incorrecto conceptualmente: “Formación baja/media/alta” no es una categoría sanitaria ni regulatoria y mezcla intensidad de formación con concentración ambiental.
- Crítico: regresar a `index.html` recarga el simulador. En la prueba con P1 seleccionado se perdieron la política y los 35 puntos usados.
- Menor: falta favicon y se genera una solicitud 404.

## Objetivo educativo

El estudiante deberá comprender que:

- El ozono troposférico es un contaminante secundario: no se emite directamente, sino que se forma a partir de NOx y COV en presencia de radiación solar.
- La zona de mayor concentración puede estar a sotavento y separada de las fuentes precursoras debido a mezcla, tiempo de reacción y transporte atmosférico.
- La respuesta del O₃ a una medida depende del balance entre NOx, COV y meteorología; reducir NOx de forma aislada no garantiza una disminución inmediata en la simplificación química del simulador.
- La concentración y la exposición se evalúan para un período definido. La referencia colombiana y la guía OMS de corto plazo comparables son de 100 µg/m³ en 8 horas.
- El ozono troposférico perjudicial no debe confundirse con el ozono estratosférico que protege frente a parte de la radiación ultravioleta.

El laboratorio de O₃ complementará al de NOx: NOx explica con mayor detalle los precursores; O₃ se concentrará en formación secundaria, transporte a sotavento, concentración resultante y exposición de 8 horas.

## Contenido visible propuesto

El laboratorio tendrá dos vistas sincronizadas:

1. **Formación y transporte:** fuentes urbanas a la izquierda, mezcla de NOx y COV, radiación solar, parcela de aire en movimiento y formación progresiva de O₃ hacia una zona receptora a sotavento. Las trayectorias serán deterministas y permanecerán dentro del `viewBox`.
2. **Exposición y referencias:** estación de monitoreo, entorno urbano y vegetación, concentración efectiva antes/después y una barra de referencia de 8 horas. La escena se rotulará como representación didáctica y no como modelo de dosis fisiológica.

Ambas vistas mostrarán:

- Concentración actual transferida desde el simulador, separada del experimento para evitar aplicar dos veces una política ya seleccionada.
- O₃ experimental antes y después de la medida, cambio porcentual y sentido del cambio.
- Valor principal en ppb y conversión secundaria aproximada a µg/m³ a 25 °C y 1 atm, usando `µg/m³ = ppb × 47,9982 / 24,45`.
- Colombia: 100 µg/m³ en 8 horas, equivalentes aproximadamente a 50,9 ppb bajo la convención anterior.
- OMS: 100 µg/m³ en 8 horas como guía comparable.
- OMS: 60 µg/m³ para temporada pico, aproximadamente 30,6 ppb, mostrado solo como contexto porque no clasifica una observación individual de 8 horas.
- Explicación breve de que el O₃ puede transportarse y afectar comunidades alejadas de la fuente precursora.

Con esta convención, la base de 20,2 ppb corresponde aproximadamente a 39,7 µg/m³. La conversión es únicamente de unidades; no inventa una nueva respuesta química.

## Controles y comportamiento esperado

| Control | Opciones | Resultado visible esperado |
|---|---|---|
| Vista | Formación y transporte; Exposición y referencias | Cambia la representación sin reiniciar concentración, medidas, zona ni fase. |
| Concentración experimental | 10–60 ppb, paso 0,1; inicio 20,2 | Cambia el valor base y la densidad de O₃, pero no modifica silenciosamente precursores ni meteorología. |
| Zona observada | Cerca de las fuentes; Fondo urbano; A sotavento | Destaca el receptor y cambia la explicación de transporte; no altera el resultado numérico por sí sola. |
| Medida sobre NOx | Sin medida; P1; P2; P3; P4; P6; P9 | Aplica los efectos compartidos de cada política sobre NOx, COV, temperatura y viento, y calcula O₃ con la misma función del simulador. |
| Control adicional de COV | Sin P8; con P8 | Aplica el efecto compartido de P8 y permite observar la respuesta combinada; no usa una tabla paralela. |
| Reproducir/pausar | Estado binario | Mueve precursores, parcela de aire, O₃ y viento; al pausar conserva exactamente el fotograma. |
| Restablecer | Acción | Recupera vista de formación, 20,2 ppb, zona a sotavento, ninguna medida y fase cero; respeta movimiento reducido. |

La radiación solar se representará como condición necesaria de la escena, no como un deslizador con una fórmula arbitraria. Tampoco se añadirán controles independientes de temperatura o viento mientras el modelo principal no defina su respuesta experimental; P6 sí mostrará el efecto de ventilación ya existente.

Los estados visibles serán:

- “Dentro del máximo colombiano y de la guía OMS de 8 horas”.
- “Supera el máximo colombiano y la guía OMS de 8 horas”.

El mensaje siempre incluirá valor, unidad y período. No dependerá exclusivamente del color y no utilizará “bajo/medio/alto”.

## Reglas del modelo que debe reproducir

El cálculo deberá reutilizar `window.NoxModel`, sus efectos de política y `ozoneResponse`. Con base experimental de 20,2 ppb:

| Medida | O₃ después | Cambio esperado |
|---|---:|---:|
| P1 | 21,816 ppb | +8 % |
| P2 | 21,816 ppb | +8 % |
| P3 | 20,200 ppb | Sin cambio |
| P4 | 20,200 ppb | Sin cambio neto con el redondeo del modelo actual |
| P6 | 18,382 ppb | −9 % por ventilación |
| P9 | 20,200 ppb | Sin cambio |
| P8 | 17,776 ppb | −12 % por control suficiente de COV |
| P1 + P8 | 17,776 ppb | −12 % |
| P6 + P8 | 15,958 ppb | −21 % por química y ventilación |

La interfaz puede redondear a una cifra decimal, pero `render_game_to_text()` conservará precisión suficiente para verificar el cálculo. Todas las combinaciones deberán provenir de una función pura compartida, no de valores codificados en la vista.

## Implementación e interfaces previstas

- Mantener `recurso-ozono.html`, añadir favicon válido y crear una ruta especializada de O₃ en `recurso-didactico.js` con estilos aislados en `recurso-didactico.css`.
- Extender `modelo-nox.js` con conversión O₃ ppb–µg/m³ y un evaluador puro del experimento que reutilice los coeficientes y `ozoneResponse` existentes.
- Eliminar o dejar de usar la fórmula genérica `ozoneScene` basada en porcentajes arbitrarios, para que no queden dos modelos activos.
- Aceptar `current=<ppb>`, `value=<ppb>` como compatibilidad, `view=formation|exposure` y `embedded=1`.
- Con `current`, mostrar el estado transferido pero iniciar el experimento en 20,2 ppb. Con `value`, inicializar valor mostrado y experimento con el valor heredado. Si ambos aparecen, `current` tendrá precedencia para el estado transferido y el experimento conservará su base independiente.
- Incorporar O₃ al diálogo educativo generalizado, con título y descripción propios. Cerrar mediante botón externo, botón interno, Escape o `educational-resource:close`, restaurando el foco y conservando año, políticas, presupuesto, historial y estado de simulación.
- Implementar animación determinista con ciclo de 6000 ms. `advanceTime(ms)` solo avanzará la fase cuando esté reproduciendo y no cambiará nada al estar pausado.
- Ampliar `render_game_to_text()` con vista, sistema de coordenadas, concentración actual, experimento antes/después, conversión, estado de referencia, zona, medidas, reducciones de NOx/COV, factores de química/temperatura/viento, reproducción, fase y entidades visibles.
- Mantener textos, SVG y controles accesibles; las pestañas responderán a teclado y la preferencia de movimiento reducido iniciará en pausa.
- Registrar implementación, pruebas y desviaciones en `progress.md`.

## Aceptación específica de O₃

- Verificar ausencia de parámetros, `current=20.2`, `value=20.2` y precedencia de `current`, sin que 20,2 se convierta en 35,2.
- Probar 10, 20,2, 30,6, 50,9, 51,0 y 60 ppb, comprobando cifras, conversión, densidad, marcador y mensajes; el máximo del control será 60 ppb.
- Comparar P1, P2, P3, P4, P6, P8 y P9, además de todas sus combinaciones relevantes con P8, contra la función compartida.
- Confirmar visual y textualmente P1/P2 con O₃ +8 %, P6 con −9 %, P8 y P1+P8 con −12 %, y P6+P8 con −21 %.
- Confirmar que cambiar vista o zona no altera resultados ni reinicia la fase.
- Verificar reproducción, pausa, restablecimiento, movimiento reducido y avance determinista; todas las moléculas, trayectorias y puntos receptores permanecerán dentro del `viewBox`.
- Abrir con P1 seleccionado, 35 puntos usados y un estado conocido de año e historial; cerrar por las cuatro vías y comprobar conservación exacta y restauración de foco.
- Revisar el recurso directo y el diálogo en 1280×900 y 390×844, navegación por teclado, etiquetas accesibles, ausencia de desbordamiento, cero errores de consola y cero solicitudes 404.
- Ejecutar regresión de PM2.5/PM10, CO₂, NOx, recursos genéricos, gráficas, reporte y auditoría de las 370 combinaciones de políticas.

## Fuentes primarias y oficiales

- [Ministerio de Ambiente y Desarrollo Sostenible, Resolución 2254 de 2017](https://www.minambiente.gov.co/wp-content/uploads/2021/10/Resolucion-2254-de-2017.pdf)
- [OMS, preguntas y respuestas sobre las guías mundiales de calidad del aire](https://www.who.int/news-room/questions-and-answers/item/who-global-air-quality-guidelines)
- [EPA, información básica sobre ozono troposférico](https://www.epa.gov/ground-level-ozone-pollution/ground-level-ozone-basics)
