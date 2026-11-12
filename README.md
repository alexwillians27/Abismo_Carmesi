# Abismo Carmesí

Juego 2D de plataformas con estructura roguelite, inspirado en **Hollow Knight** (exploración y combate preciso) y **The Binding of Isaac** (runs, objetos con sinergias, salas del tesoro).

## Estado

Fase 0 (cimientos) completada. El prototipo ya está separado en datos, núcleo, servicios y presentación, y el motor se puede probar sin pantalla. Sin arte: héroe = punto azul, enemigos = puntos rojos, escenario = líneas de margen.

## Cómo ejecutarlo

```bash
npm run serve      # http://localhost:5173
```

Hace falta servirlo por HTTP: los módulos ES y `fetch` no funcionan abriendo el archivo con `file://`. También vale `npx serve` o la extensión Live Server.

Controles: **← →** mover, **Espacio** saltar, **Esc** volver al menú.

## Cómo probarlo

```bash
npm test
```

Ejecuta el motor en Node con entradas simuladas y semilla fija, sin navegador ni DOM.

## Estructura

```
├── index.html              Página del prototipo (menú, canvas y HUD)
├── data/                   Datos externos; ajustar aquí no requiere tocar código
│   ├── player.json         Parámetros del héroe: gravedad, salto, coyote, buffer…
│   ├── weapons.json        Las 3 armas con perfil de datos
│   ├── items.json          Los 10 objetos y sus sinergias
│   ├── enemies.json        Los 4 enemigos del prototipo
│   └── rooms.json          Salas predefinidas en cuadrícula de 16 × 11
├── src/
│   ├── core/               Núcleo puro: reglas, física, objetos, generación. Sin DOM
│   │   ├── datos.js        Indexa los JSON por id
│   │   ├── game.js         Estado de la run y recálculo de estadísticas
│   │   ├── items.js        Modificadores y sinergias
│   │   ├── physics.js      Colisiones AABB por ejes separados
│   │   ├── player.js       Controlador del jugador
│   │   ├── rng.js          Aleatoriedad con semilla
│   │   └── world.js        Sala en cuadrícula → sólidos, enemigos, puertas
│   ├── services/           Servicios sustituibles (entrada, carga de datos)
│   ├── presentation/       Dibujo, bucle y menú
│   └── …
├── tests/                  Pruebas del motor con node:test
├── scripts/serve.js        Servidor estático sin dependencias
├── assets/                 Reservado para arte y audio de producción
├── docs/                   Requisitos, plan por fases, dossier y Anexo A (GDD)
└── informes/               Informe profesional del proyecto
```

## Capas y migración

El objetivo del Anexo A es migrar a Unity sin reescribir la lógica:

| Capa | Hoy | En Unity |
| --- | --- | --- |
| `src/core` | JS puro, sin DOM | Mismo código portado a C# |
| `src/services` | Teclado y `fetch` | Input System y carga de assets |
| `src/presentation` | Canvas 2D | Sprites, Tilemap y UI Toolkit |
| `data` | JSON | ScriptableObjects |

Los nombres de campos de los JSON van sin tildes (`dano`, `danoAterrizaje`) para que se puedan usar tal cual como identificadores en el código.

## Siguiente paso

Fase 1: panel de ajuste del salto en vivo y prueba de sensación con tres personas. Ver `docs/plan_fases.md` y el plan interactivo en `docs/Abismo Carmesí · Plan paso a paso.html`.

## Contenido de la carpeta

- `docs/requisitos.md` – requisitos y decisiones de diseño acordados
- `docs/plan_fases.md` – plan paso a paso con checklist
- `docs/Dossier de Proyecto Abismo Carmesí (título provisional).md` – guía, acta de constitución, análisis de sector y propuesta
- `docs/Anexo A Documento de diseño (GDD) y plan técnico de migración.md` – GDD y plan de migración
- `BACKLOG.md` – alcance congelado del MVP y bolsa de ideas aparcadas
