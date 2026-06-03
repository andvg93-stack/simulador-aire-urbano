# Simulador de Calidad de Aire Urbano

Aplicación estática para simular la evolución de calidad de aire en un entorno urbano durante cinco años. El simulador permite seleccionar políticas públicas, revisar el efecto gradual sobre contaminantes y exportar un reporte final imprimible como PDF.

## Uso

Abra `index.html` desde un servidor estático para que `routes.json` pueda cargarse correctamente.

```powershell
python -m http.server 8000
```

Luego visite `http://localhost:8000/`.

## Publicación

El proyecto está preparado para GitHub Pages desde la raíz del branch `main`.

URL esperada:

```text
https://andresvargas.github.io/simulador-aire-urbano/
```
