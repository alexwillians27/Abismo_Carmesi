# Backlog de Abismo Carmesí

Alcance congelado en `v0.1` (Fase 0). Toda idea nueva entra aquí, no al código.
Método MoSCoW copiado de la tabla del Anexo A, apartado 9.

## Debe (MVP, sin esto no hay prototipo)

- Movimiento y salto fluido (coyote time, buffer de salto, altura variable)
- Tres armas con perfil de datos diferenciado
- Cuatro enemigos: patrullero, perseguidor, volador y tirador
- Generador de salas con semilla y validador de alcanzabilidad
- Diez objetos con etiquetas, modificadores y sinergias
- Salas del tesoro con elección de objeto
- Estructuras destruibles (muro, plataforma, pilar, barril, bloque reforzado, vasija)
- Menú sencillo

## Debería (si el MVP va en plazo)

- Pantalla de resumen de run (salas, objetos, tiempo)
- Semillas compartibles
- Opciones de control

## Podría (más adelante)

- Minimapa
- Un jefe sencillo
- Guardado de récords

## No por ahora

- Arte final y animaciones
- Música y efectos de sonido definitivos
- Narrativa
- Multijugador
- Localización

## Ideas aparcadas

| Fecha | Idea | Motivo para esperar |
| --- | --- | --- |
| — | — | — |

## Estado de la Fase 0

- [x] MVP congelado (este archivo) y etiqueta `v0.1`
- [x] Prototipo separado en `data/`, `src/core`, `src/services`, `src/presentation` e `index.html`
- [x] Motor ejecutable sin pantalla con `npm test`

## Estado de la Fase 2 · Combate

- [x] Golpe en cuatro direcciones con hitbox, cadencia, retroceso y pogo
- [x] Las 3 armas se comportan distinto y se configuran desde el JSON
- [x] Patrullero, perseguidor, volador y tirador con comportamientos separados
- [x] Salud discreta, daño por contacto y por proyectil, invulnerabilidad
- [ ] Pantalla de muerte con resumen de la run (es de la Fase 5; ahora solo se avisa en el texto bajo el canvas)
