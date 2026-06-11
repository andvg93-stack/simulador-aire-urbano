# Auditoria de balance de politicas

Generado: 2026-06-11T22:05:23.156Z

## Resumen

- Combinaciones evaluadas: 370
- Aceptables: 39
- Parcialmente aceptables: 94
- No aceptables: 237
- Porcentaje aceptable: 10,5%
- Existe plan aceptable: si
- Politicas aceptables por si solas: ninguna
- Politicas veneno: ninguna
- Politicas boton de ganar: ninguna
- Advertencia por demasiados aceptables: no

## Mejores planes aceptables

| Politicas | Costo | PM2.5 | PM10 | NOx | Exposicion | Aceptacion | Equidad int. | Fallas |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| P1+P6+P9 | 75 | 30,8% | 23,9% | 36,7% | 26,7% | 55 | 60 | - |
| P1+P2 | 80 | 36,0% | 22,0% | 60,0% | 24,0% | 63 | 65 | - |
| P1+P10+P3+P5 | 85 | 31,0% | 25,0% | 35,0% | 27,6% | 52 | 56 | - |
| P1+P10+P6+P9 | 85 | 30,8% | 23,9% | 36,7% | 30,3% | 57 | 63 | - |
| P2+P6+P9 | 85 | 30,8% | 21,9% | 46,7% | 26,7% | 72 | 64 | - |
| P1+P6+P8 | 85 | 30,0% | 23,4% | 33,0% | 25,4% | 50 | 61 | - |
| P1+P2+P9 | 90 | 38,8% | 23,9% | 63,7% | 28,7% | 65 | 66 | - |
| P1+P10+P2 | 90 | 36,0% | 22,0% | 60,0% | 27,6% | 65 | 68 | - |
| P2+P3+P6 | 90 | 36,0% | 25,0% | 53,0% | 27,0% | 50 | 55 | - |
| P1+P5+P6 | 90 | 33,0% | 30,0% | 33,0% | 29,0% | 65 | 67 | - |
| P1+P3+P5+P7 | 90 | 32,1% | 36,9% | 35,0% | 26,2% | 52 | 55 | - |
| P1+P6+P7+P9 | 90 | 31,9% | 35,8% | 36,7% | 28,8% | 58 | 62 | - |

## Analisis marginal

| Politica | Con aceptable | Sin aceptable | Mejora | Empeora | Igual |
|---|---:|---:|---:|---:|---:|
| P1 | 28 | si | 69 | 0 | 33 |
| P2 | 16 | si | 48 | 0 | 26 |
| P3 | 12 | si | 28 | 13 | 108 |
| P4 | 8 | si | 48 | 0 | 68 |
| P5 | 14 | si | 43 | 0 | 86 |
| P6 | 21 | si | 46 | 0 | 70 |
| P7 | 8 | si | 29 | 0 | 120 |
| P8 | 7 | si | 30 | 0 | 107 |
| P9 | 19 | si | 27 | 0 | 135 |
| P10 | 13 | si | 11 | 0 | 151 |

## Chequeos de intencion

- OK: P3 no domina los planes aceptables. P3 aparece en 30,8% de planes aceptables.
- OK: P7 impacta especialmente PM10. Mayor reduccion individual PM10 al efecto completo: P7 (22,0%); al ano 5 P7 queda en 11,9% por degradacion.
- OK: P8 reduce COV sin disparar O3. COV 35,0%, O3 17,8 ppb al efecto completo; al ano 5 COV 23,8%.
- OK: P10 mejora exposicion sin reducir emisiones. Exposicion 18,0%, PM2.5 0,0%, NOx 0,0% al efecto completo.
- OK: P10 no maquilla planes sin reduccion minima de emisiones. Ningun plan aceptable depende de P10 para ocultar emisiones insuficientes.
- OK: P6 mejora ventilacion y estancamiento. Vent 25 vs 6; estancamiento 75 vs 94.
- OK: P3 reduce emisiones y penaliza aceptacion. PM2.5 8,0%, aceptacion 50.
- OK: P7, P8 y P9 ganan peso marginal. Mejoras P7 29, P8 30, P9 27.

## Todos los planes aceptables

- P1+P6+P9 (costo 75)
- P1+P2 (costo 80)
- P1+P10+P3+P5 (costo 85)
- P1+P10+P6+P9 (costo 85)
- P2+P6+P9 (costo 85)
- P1+P6+P8 (costo 85)
- P1+P2+P9 (costo 90)
- P1+P10+P2 (costo 90)
- P2+P3+P6 (costo 90)
- P1+P5+P6 (costo 90)
- P1+P3+P5+P7 (costo 90)
- P1+P6+P7+P9 (costo 90)
- P1+P4+P5 (costo 90)
- P1+P2+P7 (costo 95)
- P1+P4+P6 (costo 95)
- P1+P10+P3+P5+P9 (costo 95)
- P2+P3+P5+P9 (costo 95)
- P1+P6+P8+P9 (costo 95)
- P1+P4+P8+P9 (costo 95)
- P10+P2+P6+P9 (costo 95)
- P1+P10+P6+P8 (costo 95)
- P2+P6+P8 (costo 95)
- P1+P10+P2+P9 (costo 100)
- P2+P3+P6+P9 (costo 100)
- P1+P2+P8 (costo 100)
- P1+P10+P3+P4+P9 (costo 100)
- P2+P3+P4+P9 (costo 100)
- P10+P2+P3+P6 (costo 100)
- P1+P5+P6+P9 (costo 100)
- P1+P3+P5+P7+P9 (costo 100)
- P1+P4+P5+P9 (costo 100)
- P1+P10+P5+P6 (costo 100)
- P2+P5+P6 (costo 100)
- P1+P10+P3+P5+P7 (costo 100)
- P1+P10+P6+P7+P9 (costo 100)
- P2+P6+P7+P9 (costo 100)
- P1+P6+P7+P8 (costo 100)
- P1+P10+P4+P5 (costo 100)
- P3+P4+P5+P6 (costo 100)
