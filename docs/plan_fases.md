# Plan por fases

- [x] **Fase 0 – Cimientos** (completada)
  - Alcance del MVP congelado en `BACKLOG.md` con la tabla MoSCoW del Anexo A.
  - Prototipo separado en `data/`, `src/core` (núcleo sin DOM), `src/services` (entrada y datos), `src/presentation` (dibujo y menú) e `index.html`.
  - Motor ejecutable en Node con entradas simuladas y semilla fija: `npm test`.

- [ ] **Fase 1 – Movimiento** (base hecha; pendiente el ajuste)
  - Coyote time, buffer de salto, corte de salto y gravedad asimétrica ya funcionan con los valores de `data/player.json`.
  - Pendiente: panel de ajuste en vivo y prueba de sensación con tres personas para fijar los números.

- [x] **Fase 2 – Combate** (completada)
  - Golpe melee en cuatro direcciones con hitbox por alcance de arma, cadencia y pogo al golpear hacia abajo en el aire.
  - Perfil de arma completo en `data/weapons.json`: `forma`, `duracion`, `alcance`, `retroceso` y `rompeEstructuras`; la Aguja añade proyectil (`velocidadProyectil`, `radioProyectil`).
  - Cuatro enemigos con comportamiento propio en `src/core/enemies.js`: patrullero que da la vuelta en el borde, perseguidor, volador sinusoidal y tirador con proyectiles.
  - Salud en unidades discretas, daño por contacto y por proyectil, invulnerabilidad de 0,8 s y retroceso.
  - Siguen siendo formas geométricas: sin imágenes ni animaciones.

- [ ] **Fase 3 – Generador de salas** (salas predefinidas, estructuras, destruibles)
- [ ] **Fase 4 – Objetos y tesoro** (10 objetos, sinergias, salas del tesoro)
- [ ] **Fase 5 – Mundo y cierre**
- [ ] **Fase 6 – Migración a Unity**
