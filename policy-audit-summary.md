# Auditoria de balance de politicas

Generado: 2026-06-11T21:39:16.310Z

## Resumen

- Combinaciones evaluadas: 441
- Aceptables: 144
- Parcialmente aceptables: 88
- No aceptables: 209
- Existe plan aceptable: si
- Politicas aceptables por si solas: ninguna
- Politicas veneno: ninguna
- Politicas boton de ganar: ninguna

## Mejores planes aceptables

| Politicas | Costo | PM2.5 | PM10 | NOx | Exposicion | Aceptacion | Fallas |
|---|---:|---:|---:|---:|---:|---:|---|
| P3+P4+P5 | 45 | 25,0% | 21,0% | 25,0% | 21,0% | 75 | - |
| P3+P5+P6 | 50 | 27,0% | 26,0% | 23,0% | 25,0% | 62 | - |
| P1+P3+P5 | 55 | 35,0% | 28,0% | 40,0% | 27,0% | 55 | - |
| P3+P4+P6 | 55 | 30,0% | 23,0% | 33,0% | 24,0% | 58 | - |
| P3+P4+P5+P9 | 55 | 26,4% | 22,0% | 27,0% | 22,2% | 75 | - |
| P10+P3+P4+P5 | 55 | 25,0% | 21,0% | 25,0% | 24,6% | 77 | - |
| P1+P3+P4 | 60 | 38,0% | 25,0% | 50,0% | 26,0% | 51 | - |
| P3+P5+P6+P9 | 60 | 28,4% | 27,0% | 25,0% | 26,2% | 62 | - |
| P10+P3+P5+P6 | 60 | 27,0% | 26,0% | 23,0% | 28,6% | 64 | - |
| P3+P4+P5+P7 | 60 | 25,4% | 25,4% | 25,0% | 21,8% | 76 | - |
| P1+P3+P5+P9 | 65 | 36,4% | 29,0% | 42,0% | 28,2% | 55 | - |
| P1+P10+P3+P5 | 65 | 35,0% | 28,0% | 40,0% | 30,6% | 57 | - |

## Analisis marginal

| Politica | Con aceptable | Sin aceptable | Mejora | Empeora | Igual |
|---|---:|---:|---:|---:|---:|
| P1 | 65 | si | 91 | 6 | 37 |
| P2 | 48 | si | 64 | 0 | 41 |
| P3 | 106 | si | 125 | 15 | 69 |
| P4 | 67 | si | 71 | 0 | 85 |
| P5 | 75 | si | 83 | 0 | 85 |
| P6 | 64 | si | 80 | 10 | 59 |
| P7 | 49 | si | 25 | 0 | 150 |
| P8 | 33 | si | 9 | 1 | 146 |
| P9 | 55 | si | 15 | 0 | 173 |
| P10 | 52 | si | 22 | 0 | 166 |

## Chequeos de intencion

- OK: P7 impacta especialmente PM10. Mayor reduccion individual PM10 al efecto completo: P7 (22,0%); al ano 5 P7 queda en 4,4% por degradacion.
- OK: P8 reduce COV sin disparar O3. COV 30,0%, O3 17,8 ppb al efecto completo; al ano 5 COV 6,0%.
- OK: P10 mejora exposicion sin reducir emisiones. Exposicion 18,0%, PM2.5 0,0%, NOx 0,0% al efecto completo.
- OK: P6 mejora ventilacion y estancamiento. Vent 25 vs 6; estancamiento 75 vs 94.
- OK: P3 reduce emisiones y penaliza aceptacion. PM2.5 12,0%, aceptacion 55.

## Todos los planes aceptables

- P3+P4+P5 (costo 45)
- P3+P5+P6 (costo 50)
- P1+P3+P5 (costo 55)
- P3+P4+P6 (costo 55)
- P3+P4+P5+P9 (costo 55)
- P10+P3+P4+P5 (costo 55)
- P1+P3+P4 (costo 60)
- P3+P5+P6+P9 (costo 60)
- P10+P3+P5+P6 (costo 60)
- P3+P4+P5+P7 (costo 60)
- P1+P3+P5+P9 (costo 65)
- P1+P10+P3+P5 (costo 65)
- P2+P3+P5 (costo 65)
- P3+P4+P6+P9 (costo 65)
- P10+P3+P4+P6 (costo 65)
- P1+P6 (costo 65)
- P3+P5+P6+P7 (costo 65)
- P10+P3+P4+P5+P9 (costo 65)
- P1+P3+P4+P9 (costo 70)
- P1+P10+P3+P4 (costo 70)
- P1+P3+P5+P7 (costo 70)
- P2+P3+P4 (costo 70)
- P3+P4+P6+P7 (costo 70)
- P2+P3+P7+P9 (costo 70)
- P10+P3+P5+P6+P9 (costo 70)
- P3+P4+P5+P7+P9 (costo 70)
- P3+P4+P5+P8 (costo 70)
- P10+P3+P4+P5+P7 (costo 70)
- P1+P3+P4+P7 (costo 75)
- P2+P3+P6 (costo 75)
- P1+P10+P3+P5+P9 (costo 75)
- P3+P4+P5+P6 (costo 75)
- P2+P3+P5+P9 (costo 75)
- P10+P2+P3+P5 (costo 75)
- P10+P3+P4+P6+P9 (costo 75)
- P1+P6+P9 (costo 75)
- P3+P5+P6+P7+P9 (costo 75)
- P1+P10+P6 (costo 75)
- P3+P5+P6+P8 (costo 75)
- P10+P3+P5+P6+P7 (costo 75)
- P1+P3+P4+P5 (costo 80)
- P1+P10+P3+P4+P9 (costo 80)
- P1+P3+P5+P7+P9 (costo 80)
- P2+P3+P4+P9 (costo 80)
- P1+P3+P5+P8 (costo 80)
- P1+P10+P3+P5+P7 (costo 80)
- P10+P2+P3+P4 (costo 80)
- P2+P3+P5+P7 (costo 80)
- P3+P4+P6+P7+P9 (costo 80)
- P1+P4+P5 (costo 80)
- P3+P4+P6+P8 (costo 80)
- P10+P3+P4+P6+P7 (costo 80)
- P10+P2+P3+P7+P9 (costo 80)
- P1+P6+P7 (costo 80)
- P3+P4+P5+P8+P9 (costo 80)
- P10+P3+P4+P5+P8 (costo 80)
- P1+P3+P5+P6 (costo 85)
- P1+P3+P4+P7+P9 (costo 85)
- P1+P3+P4+P8 (costo 85)
- P1+P10+P3+P4+P7 (costo 85)
- P2+P3+P6+P9 (costo 85)
- P10+P2+P3+P6 (costo 85)
- P3+P4+P5+P6+P9 (costo 85)
- P2+P3+P4+P7 (costo 85)
- P10+P3+P4+P5+P6 (costo 85)
- P10+P2+P3+P5+P9 (costo 85)
- P1+P5+P6 (costo 85)
- P1+P10+P6+P9 (costo 85)
- P3+P5+P6+P8+P9 (costo 85)
- P1+P4+P7+P9 (costo 85)
- P10+P3+P5+P6+P8 (costo 85)
- P1+P10+P4+P7 (costo 85)
- P3+P4+P5+P7+P8 (costo 85)
- P1+P10+P2+P3 (costo 90)
- P1+P3+P4+P5+P9 (costo 90)
- P1+P10+P3+P4+P5 (costo 90)
- P2+P3+P4+P5 (costo 90)
- P2+P3+P6+P7 (costo 90)
- P1+P3+P5+P8+P9 (costo 90)
- P10+P2+P3+P4+P9 (costo 90)
- P1+P4+P6 (costo 90)
- P1+P10+P3+P5+P8 (costo 90)
- P3+P4+P5+P6+P7 (costo 90)
- P1+P2+P9 (costo 90)
- P2+P3+P5+P7+P9 (costo 90)
- P2+P3+P5+P8 (costo 90)
- P1+P4+P5+P9 (costo 90)
- P10+P2+P3+P5+P7 (costo 90)
- P3+P4+P6+P8+P9 (costo 90)
- P1+P10+P4+P5 (costo 90)
- P10+P3+P4+P6+P8 (costo 90)
- P1+P6+P7+P9 (costo 90)
- P1+P6+P8 (costo 90)
- P1+P10+P6+P7 (costo 90)
- P3+P5+P6+P7+P8 (costo 90)
- P2+P6+P7 (costo 90)
- P1+P5+P8+P9 (costo 90)
- P1+P3+P5+P6+P9 (costo 95)
- P1+P10+P3+P5+P6 (costo 95)
- P1+P3+P4+P5+P7 (costo 95)
- P2+P3+P5+P6 (costo 95)
- P1+P3+P4+P8+P9 (costo 95)
- P1+P10+P3+P4+P8 (costo 95)
- P10+P2+P3+P6+P9 (costo 95)
- P2+P3+P4+P7+P9 (costo 95)
- P1+P3+P5+P7+P8 (costo 95)
- P2+P3+P4+P8 (costo 95)
- P10+P2+P3+P4+P7 (costo 95)
- P1+P5+P6+P9 (costo 95)
- P1+P2+P7 (costo 95)
- P1+P10+P5+P6 (costo 95)
- P1+P4+P5+P7 (costo 95)
- P3+P4+P6+P7+P8 (costo 95)
- P2+P5+P6 (costo 95)
- P2+P3+P7+P8+P9 (costo 95)
- P10+P2+P3+P7+P8 (costo 95)
- P1+P10+P4+P7+P9 (costo 95)
- P1+P2+P3+P5 (costo 100)
- P1+P10+P2+P3+P9 (costo 100)
- P1+P3+P5+P6+P7 (costo 100)
- P2+P3+P4+P6 (costo 100)
- P2+P3+P4+P5+P9 (costo 100)
- P10+P2+P3+P4+P5 (costo 100)
- P1+P3+P4+P7+P8 (costo 100)
- P2+P3+P6+P7+P9 (costo 100)
- P1+P2+P5 (costo 100)
- P2+P3+P6+P8 (costo 100)
- P1+P4+P6+P9 (costo 100)
- P10+P2+P3+P6+P7 (costo 100)
- P1+P10+P4+P6 (costo 100)
- P3+P4+P5+P6+P8 (costo 100)
- P1+P10+P2+P9 (costo 100)
- P2+P3+P5+P8+P9 (costo 100)
- P1+P5+P6+P7 (costo 100)
- P2+P4+P6 (costo 100)
- P10+P2+P3+P5+P8 (costo 100)
- P1+P10+P4+P5+P9 (costo 100)
- P1+P6+P8+P9 (costo 100)
- P1+P10+P6+P7+P9 (costo 100)
- P2+P4+P5+P9 (costo 100)
- P1+P10+P6+P8 (costo 100)
- P2+P6+P7+P9 (costo 100)
- P10+P2+P6+P7 (costo 100)
- P1+P10+P5+P8+P9 (costo 100)
