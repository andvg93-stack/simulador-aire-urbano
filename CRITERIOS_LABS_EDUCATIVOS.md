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

# Aplicación de los criterios: Población expuesta

## Decisiones de implementación

- La métrica principal se mantiene en habitantes y se denomina **Población expuesta**. No se interpreta como concentración, enfermedad, censo ni semáforo sanitario.
- Se elimina la conversión automática distancia→habitantes. La población experimental se controla directamente entre 27.300 y 80.000 habitantes.
- `modelo-exposicion.js` es la fuente compartida para la base de 78.000 habitantes, la proporción susceptible 18.000/78.000, los efectos P1–P10, el límite inferior de 35 % y los resultados antes/después.
- Las dos vistas conservan 16 figuras representativas. Las personas cambian de condición o ubicación; nunca desaparecen al mejorar el resultado.
- El mapa relaciona fuente, pluma, hogares, colegio, trabajo y espacio protegido. La vista diaria usa un ciclo determinista de 6.000 ms equivalente a 24 horas.
- La permanencia modifica persona-horas, pero no inventa cambios en la cantidad de habitantes. El entorno y la capa de susceptibilidad son controles explicativos sin efecto numérico.
- P10 se representa mediante alertas, horarios y espacios protegidos y no atenúa la fuente; las demás medidas urbanas aplican sus coeficientes compartidos.
- `current` transfiere el estado del simulador y conserva un experimento base independiente; `value` mantiene compatibilidad e inicializa ambos. También se aceptan `vulnerable`, `view` y `embedded`.
- El recurso abre en el diálogo educativo y cierra por control interno, control externo, Escape o mensaje, preservando plan, presupuesto, año, historial y foco.

## Criterios de lectura

La exposición depende de concentración, ubicación y patrones de tiempo-actividad. La distancia a una vía se conserva como elemento visual, pero no se usa como una relación universal, pues también intervienen tráfico, meteorología, topografía y uso del suelo. Persona-horas es una comparación educativa y no una dosis inhalada. La susceptibilidad es contexto secundario y no un puntaje clínico.

Fuentes de contexto: [EPA, Human Exposure Modeling Overview](https://www.epa.gov/fera/human-exposure-modeling-overview), [EPA, Near Roadway Air Pollution FAQ](https://www.epa.gov/sites/default/files/2015-11/documents/420f14044_0.pdf) y [OMS, grupos en mayor riesgo](https://www.who.int/publications/i/item/B09563).

## Plan integrado: viento, altura de mezcla, ventilación y estancamiento

- Un único laboratorio explicará la cadena causal: viento y altura de mezcla son entradas físicas; el coeficiente de ventilación y el estancamiento son resultados derivados.
- La magnitud principal será `viento × altura de mezcla` en m²/s. La ventilación relativa se normalizará entre 35 y 1210 m²/s al intervalo 0–100; estancamiento será siempre `100 − ventilación`.
- Las cuatro tarjetas abrirán la misma ruta integrada con foco inicial propio, manteniendo las URLs antiguas y preservando políticas, presupuesto, año, historial y foco.
- Las vistas sincronizadas serán transporte horizontal, mezcla vertical, ventilación combinada y episodio de 24 horas. La dirección cambiará el receptor a sotavento sin modificar cifras.
- El experimento partirá de 1,5 m/s y 102 m; P5 aplicará +5 % a mezcla, P6 +18 % a viento y +15 % a mezcla, y P5+P6 sumará ambos efectos sin modificar el plan principal.
- La animación tendrá ciclo determinista de 6000 ms, pausa exacta, movimiento reducido, restablecimiento y descripción completa mediante `render_game_to_text()`.
- No se usarán categorías sanitarias ni umbrales universales de buena/mala ventilación; la escala 0–100 se identificará como interna del simulador.

### Aceptación específica

- Base: 153,0 m²/s, ventilación 10,0 y estancamiento 90,0.
- P5: 160,65 m²/s, 10,7 y 89,3; P6: 207,62 m²/s, 14,7 y 85,3; P5+P6: 216,65 m²/s, 15,5 y 84,5.
- Extremos: 0,5×70 producirá 35 m²/s, 0/100 y 100/100; 5,5×220 producirá 1210 m²/s, 100/100 y 0/100.
- Playwright cubrirá las cuatro rutas, vistas, dirección, medidas, tiempo, teclado, movimiento reducido, geometría, escritorio, móvil, cierres e integración con el simulador.

### Fuentes oficiales

- [NWCG, Smoke Management Guide](https://www.govinfo.gov/content/pkg/GOVPUB-A13-PURL-gpo250381/pdf/GOVPUB-A13-PURL-gpo250381.pdf)
- [NWS, Smoke Dispersal / Ventilation Rate](https://www.weather.gov/sgf/firewx_smoke_dispersal)
- [IDEAM, estado de la calidad del aire en Colombia](https://www.ideam.gov.co/sites/default/files/prensa/boletines/2024-08-14/informe_del_estado_de_la_calidad_del_aire_en_colombia_2020.pdf)
- [EPA, modelos recomendados de dispersión](https://www.epa.gov/scram/air-quality-dispersion-modeling-preferred-and-recommended-models)
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

---

# Auditoría y plan específico: compuestos orgánicos volátiles (COV)

## Diagnóstico del recurso actual

La revisión de código y la auditoría con Playwright en escritorio y móvil confirmaron:

- Correcto: `?value=33.9` conserva el resultado de 33,9 µg/m³; el deslizador y la selección de extracción responden; la página no desborda en 390×844 y no produjo errores de consola.
- Defectuoso: “En vivo” es una escena estática. `advanceTime(5000)` no cambia vapores, trayectorias ni fotograma.
- Crítico: la tarjeta COV todavía navega directamente. Al regresar se recarga `index.html`; P8 deja de estar seleccionada y los 20 puntos usados vuelven a cero.
- Incorrecto semánticamente: el recurso llama “emisión” a un resultado expresado en µg/m³, que es una unidad de concentración. No separa actividad, flujo emitido, concentración ambiental y exposición cercana.
- Inconsistente: 33,9 µg/m³ se convierte internamente en “44 % de uso de solventes” mediante una interpolación sin significado físico visible.
- Inconsistente: el control recorre 5–70 µg/m³, aunque la tarjeta y el modelo principal presentan COV en un intervalo de 5–50 µg/m³.
- Inconsistente con el simulador: activar “extracción” con el escenario transferido reduce 33,9 a 16,0 µg/m³, aproximadamente 52,9 %. P8 en el modelo principal aplica −35 % y debería producir 22,0 µg/m³.
- Incorrecto conceptualmente: “Emisión baja/media/alta” sale de tercios arbitrarios del deslizador y aparenta ser una clasificación sanitaria o normativa.
- Insuficiente: la escena solo representa un taller interior con cuatro recipientes. El simulador modela una concentración urbana y también incluye combustibles, tráfico, comercio, industria y productos volátiles.
- Insuficiente: todos los COV se tratan como una sustancia única. No se explica que composición, toxicidad, volatilidad y reactividad fotoquímica varían entre compuestos ni que una cifra agregada depende del método de medición.
- Insuficiente: no muestra exposición directa cerca de la fuente, formación de O₃ y aerosol orgánico secundario, ni los efectos exactos de P1, P2, P3, P4, P5, P6, P8 y P9.
- Limitado para pruebas: `render_game_to_text()` no informa fase, moléculas visibles, fuente, medidas, concentración antes/después ni respuesta secundaria.

## Objetivo educativo

El estudiante deberá comprender que:

- COV es una familia de sustancias que pueden evaporarse e incorporarse al aire; no es un compuesto químico único.
- El uso o almacenamiento de un producto, la masa emitida, la concentración en el aire y la exposición son magnitudes relacionadas, pero no intercambiables.
- Las fuentes urbanas incluyen combustibles y tráfico, solventes y recubrimientos, procesos industriales y productos de limpieza o consumo.
- La composición importa: distintos COV presentan toxicidades y reactividades fotoquímicas diferentes. Un valor agregado menor no demuestra por sí solo que una mezcla sea más segura.
- Los COV pueden afectar directamente a personas próximas a la fuente y, además, reaccionar en la atmósfera para formar O₃ y aerosol orgánico secundario.
- El control en la fuente —sustitución, contención, prevención de fugas y recuperación de vapores— precede conceptualmente al tratamiento final.
- P8 es la medida directa del simulador para COV, mientras las políticas de movilidad, vegetación, ventilación y actividad urbana producen reducciones menores o efectos indirectos.

La variable principal continuará en µg/m³ para no rehacer tarjetas, gráficas y reporte, pero se rotulará como **concentración equivalente didáctica de COV reactivos**. No se presentará como TVOC medido, concentración de benceno ni inventario de emisiones.

## Contenido visible propuesto

El laboratorio tendrá dos vistas sincronizadas:

1. **Fuentes y control:** perfiles urbanos de combustibles/tráfico, solventes/recubrimientos, productos de limpieza/comercio y mezcla. Mostrará evaporación, fugas, recipientes, recuperación de vapores, contención y sustitución en la fuente.
2. **Destino y efectos:** recorrido desde la fuente hasta una zona de exposición cercana y, en paralelo, transformación atmosférica simplificada hacia O₃ y aerosol orgánico secundario. La vista diferenciará efecto directo y efecto secundario sin simular toxicología exacta.

Ambas vistas mostrarán:

- Concentración actual transferida desde el simulador, separada de la base experimental de 33,9 µg/m³ para evitar reducciones duplicadas.
- COV antes/después de las medidas, reducción porcentual y diferencia absoluta.
- Respuesta secundaria de O₃ antes/después mediante la misma función compartida con NOx y O₃.
- Perfil de fuente destacado y estrategias de control visibles.
- Nota permanente: la cifra representa una mezcla equivalente didáctica; no permite clasificar riesgo sanitario sin conocer composición, método y tiempo de exposición.
- Contexto colombiano: la Resolución 2254 de 2017 no establece un máximo de calidad del aire para COV agregados; la guía nacional de Minambiente aborda control, monitoreo y seguimiento de emisiones por fuentes y compuestos.
- Contexto OMS: las guías mundiales de 2021 cubren seis contaminantes clásicos y no fijan un valor para COV agregados. El benceno se mostrará únicamente como ejemplo de evaluación específica, nunca como marcador para el valor total del simulador.

No habrá barra normativa ni estados “bajo/medio/alto”. El resultado dirá “sin cambio”, “reducción de X %” o “X % por encima de la base experimental”.

## Controles y comportamiento esperado

| Control | Opciones | Resultado visible esperado |
|---|---|---|
| Vista | Fuentes y control; Destino y efectos | Cambia la escena sin reiniciar concentración, fuente, medidas ni fase. |
| Concentración experimental | 5–50 µg/m³, paso 0,1; inicio 33,9 | Cambia cifra y densidad de la mezcla equivalente, sin alterar fuente, composición ni controles. |
| Perfil de fuente | Combustibles y tráfico; Solventes y recubrimientos; Productos y limpieza; Mixta | Cambia emisores, colores de familias y explicación; no modifica silenciosamente la concentración. |
| Medida complementaria | Sin medida; P1; P2; P3; P4; P5; P6; P9 | Aplica exactamente −8 %, −4 %, −4 %, −4 %, −2 %, −6 % y −3 % a COV, además de sus efectos compartidos sobre NOx y meteorología. |
| Control directo | Sin P8; con P8 | Aplica −35 % a COV y cambia visualmente sustitución, contención y recuperación de vapores. |
| Reproducir/pausar | Estado binario | Mueve vapores, captura, transporte y productos secundarios; al pausar conserva exactamente el fotograma. |
| Restablecer | Acción | Recupera vista de fuentes, 33,9 µg/m³, fuente mixta, ninguna medida y fase cero; respeta movimiento reducido. |

El perfil de fuente es explicativo: no asignará un factor numérico de toxicidad o reactividad a una mezcla no caracterizada.

## Reglas del modelo que debe reproducir

Se extenderá el modelo compartido con P5 y una función pura `evaluateCovExperiment({ covUgM3, measure, covControl })`. La reducción se calculará de forma aditiva con los mismos coeficientes de `index.html`; la respuesta de O₃ reutilizará `ozoneResponse`.

Con base experimental de 33,9 µg/m³:

| Medida | COV después | Reducción | Respuesta de O₃ del modelo actual |
|---|---:|---:|---:|
| P1 | 31,188 µg/m³ | 8 % | +8 % |
| P2 | 32,544 µg/m³ | 4 % | +8 % |
| P3 | 32,544 µg/m³ | 4 % | Sin cambio |
| P4 | 32,544 µg/m³ | 4 % | Sin cambio |
| P5 | 33,222 µg/m³ | 2 % | Sin cambio |
| P6 | 31,866 µg/m³ | 6 % | −9 % por ventilación |
| P8 | 22,035 µg/m³ | 35 % | −12 % |
| P9 | 32,883 µg/m³ | 3 % | Sin cambio |
| P1 + P8 | 19,323 µg/m³ | 43 % | −12 % |
| P6 + P8 | 20,001 µg/m³ | 41 % | −21 % por química y ventilación |

La interfaz redondeará a una cifra decimal; el estado textual conservará precisión suficiente para las pruebas. Las combinaciones no se codificarán como una tabla paralela.

## Implementación e interfaces previstas

- Mantener `recurso-cov.html`, añadir favicon válido y cargar el modelo compartido antes de `recurso-didactico.js`.
- Crear `renderCovLab()` y estilos aislados de COV; la configuración genérica actual dejará de usarse para esta ruta.
- Extender el modelo compartido con el efecto de P5 y el evaluador puro de COV; actualizar P5 en `index.html` para que simulador y laboratorio consuman una sola fuente de coeficientes.
- Mantener `COV` y µg/m³ en tarjeta, gráficas y reporte por compatibilidad, acompañados de la definición “concentración equivalente didáctica de COV reactivos” en laboratorio y nota metodológica del reporte.
- Aceptar `current=<µg/m³>`, `value=<µg/m³>` como compatibilidad, `view=sources|fate` y `embedded=1`.
- Con `current`, mostrar el estado transferido e iniciar el experimento en 33,9 µg/m³. Con `value`, inicializar ambos con el valor heredado. Si aparecen los dos, `current` tendrá precedencia para el estado y el experimento conservará su base independiente.
- Incorporar COV al diálogo educativo existente, con título y descripción propios. Cerrar mediante control externo, control interno, Escape o `educational-resource:close`, conservando políticas, presupuesto, año, historial y foco.
- Implementar animación determinista con ciclo de 6000 ms. `advanceTime(ms)` solo avanzará la fase al reproducir.
- Ampliar `render_game_to_text()` con vista, coordenadas, valor actual, experimento antes/después, fuente, medidas, efectos de COV/NOx/viento, O₃ antes/después, reproducción, fase y entidades visibles.
- Representar sustitución, contención, captura y recuperación como estrategias didácticas asociadas a P8, sin asignar eficiencias adicionales no presentes en el simulador.
- Registrar implementación, pruebas y desviaciones en `progress.md`.

## Aceptación específica de COV

- Verificar ausencia de parámetros, `current=33.9`, `value=33.9` y precedencia de `current`; nunca convertir el valor transferido en un porcentaje visible de solventes.
- Probar 5, 33,9 y 50 µg/m³, comprobando cifras, densidad y mensajes relativos; el control no deberá producir 70 µg/m³.
- Comparar P1, P2, P3, P4, P5, P6, P8 y P9, además de todas las combinaciones previstas con P8, contra la función compartida.
- Confirmar visual y textualmente P1/P2 con O₃ +8 %, P6 con −9 %, P8 y P1+P8 con −12 %, y P6+P8 con −21 %.
- Confirmar que cambiar fuente o vista no altera cifras ni reinicia la fase.
- Verificar reproducción, pausa, restablecimiento, movimiento reducido y avance determinista; vapores y productos secundarios permanecerán dentro del `viewBox`.
- Abrir con P8 seleccionada y 20 puntos usados; cerrar por las cuatro vías y conservar exactamente política, presupuesto, año e historial, restaurando el foco a COV.
- Revisar recurso directo y diálogo en 1280×900 y 390×844, pestañas por teclado, etiquetas accesibles, desbordamiento, consola y solicitudes fallidas.
- Ejecutar regresión de PM2.5/PM10, CO₂, NOx, O₃, recursos genéricos, gráficas, reporte y auditoría de las 370 combinaciones.

## Fuentes primarias y oficiales

- [Minambiente, Guía nacional para el control, monitoreo y seguimiento de emisiones de COV](https://www.minambiente.gov.co/wp-content/uploads/2021/12/GUIA-EMISIONES-COMPUESTOS-VOLATILES.pdf)
- [Minambiente, Resolución 2254 de 2017](https://www.minambiente.gov.co/wp-content/uploads/2021/10/Resolucion-2254-de-2017.pdf)
- [OMS, alcance de las guías mundiales de calidad del aire de 2021](https://www.who.int/news-room/questions-and-answers/item/who-global-air-quality-guidelines)
- [OMS, información sobre exposición a benceno](https://www.who.int/teams/environment-climate-change-and-health/chemical-safety-and-health/health-impacts/chemicals/benzene)
- [EPA, panorama técnico y diferencias entre COV interiores y exteriores](https://www.epa.gov/indoor-air-quality-iaq/technical-overview-volatile-organic-compounds)
- [EPA, definición regulatoria y diferencias de reactividad fotoquímica](https://www.epa.gov/air-emissions-inventories/what-definition-voc)

---

# Auditoría y plan específico: temperatura urbana

## Diagnóstico del recurso actual

La revisión del código, el estado textual y las capturas de Playwright en 1280×900 y 390×844 confirmaron:

- Correcto: `?value=25.7` termina mostrando 25,7 °C; el deslizador responde, la composición general es legible y no existe desbordamiento horizontal en 390×844.
- Defectuoso: la compatibilidad solo funciona accidentalmente dentro del intervalo visual de 22–29 °C. `?value=18` se recorta y muestra 22 °C; `?value=34` se recorta y muestra 29 °C, aunque la tarjeta y el modelo principal trabajan entre 18 y 34 °C.
- Incorrecto semánticamente: el valor recibido se transforma en cobertura verde mediante `(29 − temperatura) / 0,07`. Por ello una condición meteorológica se convierte silenciosamente en una característica urbana que el simulador nunca midió.
- Inconsistente: el único control es cobertura verde de 0–100 %, pero su resultado solo recorre 29–22 °C. La relación fija de −7 °C no proviene del modelo principal y no se identifica como un supuesto separado.
- Defectuoso: la etiqueta “En vivo” describe una escena estática. `advanceTime(5000)` no cambia el SVG ni el estado textual; tampoco existen controles para reproducir, pausar o restablecer.
- Crítico: Temperatura aún no usa el diálogo educativo. La tarjeta navega a otra página y el enlace de regreso recarga `index.html`, por lo que elimina políticas, presupuesto usado, año e historial.
- Insuficiente: la escena divide la ciudad en “superficie impermeable” y “cobertura verde”, pero muestra un solo termómetro y un único resultado. No diferencia temperatura del aire, temperatura superficial ni diferencia urbano–entorno, que es la base del concepto de isla de calor.
- Insuficiente: variar el deslizador cambia el número de árboles, pero no representa balance de energía, sombra móvil, evapotranspiración, reflectancia, almacenamiento diurno ni liberación nocturna de calor.
- Inconsistente con el simulador: no muestra los efectos exactos de P4 (−0,2 °C), P5 (−1,1 °C) y P6 (−0,4 °C), ni su interacción con la respuesta simplificada de O₃ ya utilizada por el modelo compartido.
- Incorrecto conceptualmente: “Menor carga térmica / Carga intermedia / Mayor carga térmica” se obtiene de tercios arbitrarios de cobertura verde y aparenta clasificar el riesgo de una temperatura sin considerar humedad, radiación, viento, duración, actividad, adaptación ni vulnerabilidad.
- Limitado para pruebas: `render_game_to_text()` no informa valor actual transferido, temperatura antes/después, medidas, entorno, vista, momento, O₃, fase ni entidades visibles.
- Menor: `recurso-temperatura.html` no declara un favicon válido y continúa cargando la ruta genérica sin soporte para `current`, `embedded` o vista inicial.

## Objetivo educativo

El estudiante deberá comprender que:

- La temperatura urbana es una condición meteorológica expresada en °C, no una emisión ni un contaminante criterio.
- La isla de calor es una diferencia térmica entre áreas urbanizadas y su entorno o entre zonas de la misma ciudad; una temperatura absoluta aislada no demuestra por sí sola que exista una isla de calor.
- Temperatura del aire y temperatura de la superficie son magnitudes distintas. Asfalto, cubiertas, vegetación y sombra modifican el intercambio de energía, pero no deben presentarse como mediciones equivalentes.
- Superficies oscuras pueden absorber y almacenar energía durante el día y liberarla después; árboles y vegetación aportan sombra y evapotranspiración; superficies reflectivas absorben menos radiación.
- Reducir la carga térmica urbana no equivale a cambiar instantáneamente el clima regional. Las intervenciones del laboratorio representan efectos didácticos del modelo sobre un escenario urbano común.
- El impacto del calor sobre las personas depende también de humedad, radiación, viento, duración, esfuerzo, ropa, adaptación y vulnerabilidad. Por tanto, el laboratorio no asignará un semáforo sanitario usando solo °C.
- En presencia de radiación y precursores adecuados, temperaturas más altas pueden favorecer la formación de O₃; la temperatura no crea ozono por sí sola.
- P4, P5 y P6 tienen efectos diferentes y acumulables en el simulador: movilidad activa, arborización técnica y corredores de ventilación.

La métrica principal seguirá siendo **temperatura urbana representativa del escenario, en °C**. Se rotulará como valor didáctico exterior y no como temperatura superficial, índice de calor, sensación térmica o pronóstico.

## Contenido visible propuesto

El laboratorio tendrá dos vistas sincronizadas:

1. **Superficies y balance de energía:** cañón urbano con radiación incidente, energía reflejada, almacenamiento en superficies, sombra, evapotranspiración y liberación de calor. Los flujos serán cualitativos y estarán rotulados como representación didáctica.
2. **Aire, exposición y química:** temperatura del aire en una zona urbana, personas al sol y a la sombra, ventilación y un módulo secundario de O₃. La vista explicará qué variables faltan para evaluar estrés térmico y mostrará la respuesta química simplificada sin convertirla en pronóstico.

Ambas vistas mostrarán:

- Temperatura actual transferida desde el simulador, separada de la base experimental de 25,7 °C para evitar aplicar dos veces una política ya implementada.
- Temperatura experimental antes y después, diferencia absoluta en °C y cambio respecto de la base experimental.
- P4, P5 y P6 visibles como intervenciones demostrativas, con los mismos efectos del simulador.
- O₃ antes/después en ppb y el factor atribuible a temperatura según `NoxModel.ozoneResponse`, siempre acompañado de NOx, COV y radiación como condiciones necesarias.
- Perfiles de superficie —impermeable oscura, reflectiva, vegetada y mixta— que cambian la ilustración y la explicación, pero no alteran silenciosamente la temperatura experimental.
- Comparación día/noche que cambia los flujos visuales de absorción y liberación de energía, conservando las cifras hasta que el estudiante modifique una variable o medida.
- Nota permanente: la Resolución 2254 de 2017 no define un máximo de calidad del aire para temperatura; las alertas de calor requieren criterios locales y más variables que la temperatura del aire.

No habrá estados “bajo/intermedio/alto”. El resultado se expresará como “sin cambio”, “reducción de X °C” o “aumento de X °C respecto al escenario experimental”. La sección de exposición enumerará los factores faltantes y remitirá a alertas oficiales, sin inventar umbrales sanitarios.

## Controles y comportamiento esperado

| Control | Opciones | Resultado visible esperado |
|---|---|---|
| Vista | Superficies y energía; Aire, exposición y química | Cambia la escena sin reiniciar temperatura, perfil, momento, medidas ni fase. |
| Temperatura experimental | 18–34 °C, paso 0,1; inicio 25,7 °C | Cambia el termómetro, la intensidad térmica y la respuesta secundaria de O₃; no modifica perfil, momento ni medidas. |
| Perfil urbano | Impermeable oscuro; Reflectivo; Vegetado; Mixto | Cambia superficies, sombra, reflectancia y explicación; no asigna por sí solo una temperatura oculta. |
| Momento | Día; Noche | Durante el día destaca radiación, reflexión, sombra y evapotranspiración; de noche destaca liberación de energía almacenada. No altera silenciosamente la cifra. |
| Medidas demostrativas | P4, P5 y P6 como controles independientes | Aplica respectivamente −0,2, −1,1 y −0,4 °C; las combinaciones suman los mismos efectos que el simulador y cambian los elementos urbanos asociados. |
| Reproducir/pausar | Estado binario | Anima radiación, flujos de calor, evapotranspiración, aire y química; al pausar conserva exactamente el fotograma. |
| Restablecer | Acción | Recupera vista de superficies, 25,7 °C, perfil mixto, momento diurno, ninguna medida y fase cero; respeta movimiento reducido. |

## Reglas del modelo que debe reproducir

Se añadirá al modelo compartido una función pura `evaluateTemperatureExperiment({ temperatureC, measures })`. Los efectos se obtendrán de los mismos coeficientes usados por `index.html`; no habrá una segunda tabla numérica dentro del recurso.

Con base experimental de 25,7 °C:

| Medidas | Temperatura después | Diferencia |
|---|---:|---:|
| Ninguna | 25,7 °C | 0,0 °C |
| P4 | 25,5 °C | −0,2 °C |
| P5 | 24,6 °C | −1,1 °C |
| P6 | 25,3 °C | −0,4 °C |
| P4 + P5 | 24,4 °C | −1,3 °C |
| P4 + P6 | 25,1 °C | −0,6 °C |
| P5 + P6 | 24,2 °C | −1,5 °C |
| P4 + P5 + P6 | 24,0 °C | −1,7 °C |

La respuesta de O₃ reutilizará `ozoneResponse` con NOx, COV y viento de referencia. En el modelo actual, solo la temperatura por encima de 25,7 °C añade un factor de +3 % de O₃ por cada °C; no se extrapolará esta simplificación como relación atmosférica universal. Por ejemplo, 30,0 °C produce 22,806 ppb desde una base de 20,2 ppb, mientras P5 reduce el escenario a 28,9 °C y 22,139 ppb. La interfaz redondeará temperatura y O₃ a una cifra decimal; el estado textual conservará precisión suficiente para verificar los coeficientes.

## Implementación e interfaces previstas

- Mantener `recurso-temperatura.html`, añadir favicon válido y cargar `modelo-nox.js` antes de `recurso-didactico.js`.
- Crear `renderTemperatureLab()` y estilos aislados; la configuración genérica `temp` dejará de renderizar esta ruta.
- Extender `modelo-nox.js` con el evaluador puro de temperatura, consumiendo `policyEffects` para P4, P5 y P6 y reutilizando `ozoneResponse`.
- Mantener °C en tarjeta, gráficas y reporte. Añadir al reporte una nota metodológica breve: temperatura exterior representativa, no temperatura superficial, índice de calor ni pronóstico.
- Aceptar `current=<°C>`, `value=<°C>` como compatibilidad, `view=energy|exposure`, `moment=day|night` y `embedded=1`.
- Con `current`, mostrar el estado transferido e iniciar el experimento en 25,7 °C. Con `value`, inicializar estado y experimento con el valor heredado. Si aparecen ambos, `current` tendrá precedencia para el estado y el experimento conservará su base independiente.
- Incorporar Temperatura al diálogo educativo existente, con título y descripción propios. Cerrar mediante botón externo, botón interno, Escape o `educational-resource:close`, conservando año, políticas, presupuesto, historial y estado de simulación, y restaurando el foco a la tarjeta.
- Implementar una fase determinista de 6000 ms. `advanceTime(ms)` solo avanzará cuando esté reproduciendo; al estar pausado no cambiará estado ni SVG.
- Ampliar `render_game_to_text()` con vista, coordenadas, temperatura actual, temperatura antes/después, diferencia, perfil, momento, medidas, factores de O₃, reproducción, fase y entidades o flujos visibles.
- Mantener los SVG dentro del `viewBox`, las pestañas operables con flechas, controles con etiquetas accesibles y estado inicial pausado cuando el sistema solicite movimiento reducido.
- Registrar implementación, pruebas, resultados y cualquier desviación en `progress.md`.

## Aceptación específica de Temperatura

- Verificar ausencia de parámetros, `current=25.7`, `value=25.7` y precedencia de `current`; el valor transferido nunca se convertirá en cobertura verde.
- Probar 18, 25,7, 30 y 34 °C, comprobando cifra, termómetro, intensidad y estado textual; 18 y 34 no podrán recortarse a 22 y 29.
- Comparar P4, P5 y P6 y sus ocho combinaciones contra `evaluateTemperatureExperiment()`; con base 25,7 °C, la combinación completa deberá producir 24,0 °C.
- Verificar a 30 °C la respuesta secundaria de O₃ antes/después y el efecto de P5, sin presentar la relación como pronóstico ni límite sanitario.
- Confirmar que cambiar perfil, momento o vista no altera cifras ni reinicia la fase.
- Verificar reproducción, pausa, restablecimiento, movimiento reducido y `advanceTime`; todos los rayos, flujos, hojas, personas y moléculas permanecerán dentro del `viewBox`.
- Abrir con P5 seleccionada, 25 puntos usados y un estado conocido de año e historial; cerrar por las cuatro vías y conservar exactamente plan, presupuesto, año e historial, restaurando el foco a Temperatura.
- Revisar recurso directo y diálogo en 1280×900 y 390×844, navegación por teclado, foco visible, textos accesibles, ausencia de desbordamiento, cero errores de consola y cero solicitudes 404.
- Ejecutar regresión de PM2.5/PM10, CO₂, NOx, O₃, COV, recursos genéricos restantes, gráficas, reporte y auditoría de las 370 combinaciones de políticas.

## Fuentes primarias y oficiales

- [IDEAM, Glosario meteorológico: definición de isla de calor](https://www.ideam.gov.co/documents/11769/72085840/Anexo%2B10.%2BGlosario%2Bmeteorol%C3%B3gico.pdf)
- [EPA, efectos de las islas de calor](https://www.epa.gov/heatislands/learn-about-heat-island-effects)
- [EPA, medición de islas de calor y diferencia entre temperatura del aire y de la superficie](https://www.epa.gov/heatislands/measuring-heat-islands)
- [EPA, guía de reducción: vegetación, techos y pavimentos fríos](https://www.epa.gov/heatislands/guide-reducing-heat-islands)
- [EPA, tendencias de ozono ajustadas por condiciones meteorológicas](https://www.epa.gov/air-trends/trends-ozone-adjusted-weather-conditions)
- [OMS, calor y salud](https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health)
- [OMS/WMO, guía para sistemas de alerta por calor](https://www.who.int/docs/default-source/climate-change/heat-waves-and-health---guidance-on-warning-system-development.pdf)
- [Ministerio de Ambiente y Desarrollo Sostenible, Resolución 2254 de 2017](https://www.minambiente.gov.co/wp-content/uploads/2021/10/Resolucion-2254-de-2017.pdf)
