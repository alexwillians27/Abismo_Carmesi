import { readFileSync } from 'node:fs';
import { prepararDatos } from '../src/core/datos.js';

function leerJson(nombre) {
  return JSON.parse(readFileSync(new URL(`../data/${nombre}`, import.meta.url), 'utf8'));
}

/** Devuelve los mismos datos que carga el navegador, leídos sin fetch. */
export function cargarDatos() {
  return prepararDatos({
    player: leerJson('player.json'),
    weapons: leerJson('weapons.json'),
    items: leerJson('items.json'),
    enemies: leerJson('enemies.json'),
    rooms: leerJson('rooms.json')
  });
}
