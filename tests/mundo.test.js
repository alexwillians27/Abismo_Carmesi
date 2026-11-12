import test from 'node:test';
import assert from 'node:assert/strict';
import { crearMundo } from '../src/core/world.js';
import { crearJugador } from '../src/core/player.js';
import { cargarDatos } from './ayudas.js';

const datos = cargarDatos();

test('la sala de inicio coloca al jugador sobre suelo sólido', () => {
  const mundo = crearMundo(datos.porId.sala.inicio, datos);
  assert.ok(mundo.solidos.length > 0, 'la sala no tiene sólidos');

  const jugador = crearJugador(mundo.spawn, datos.parametros);
  const pies = jugador.caja.y + jugador.caja.h;
  const apoyado = mundo.solidos.some(
    (solido) =>
      solido.x < jugador.caja.x + jugador.caja.w &&
      solido.x + solido.w > jugador.caja.x &&
      Math.abs(solido.y - pies) < 0.5
  );

  assert.ok(apoyado, 'no hay ningún sólido justo bajo los pies del jugador');
});

test('la sala de combate contiene los cuatro enemigos y sus puertas', () => {
  const mundo = crearMundo(datos.porId.sala.combate1, datos);

  assert.equal(mundo.enemigos.length, 4);
  assert.deepEqual(
    new Set(mundo.enemigos.map((enemigo) => enemigo.tipo)),
    new Set(['patrullero', 'perseguidor', 'volador', 'tirador'])
  );
  assert.ok(mundo.puertas.length >= 2, 'faltan puertas');
  for (const puerta of mundo.puertas) {
    assert.ok(['izquierda', 'derecha', 'arriba', 'abajo'].includes(puerta.lado));
  }
});

test('un símbolo desconocido en la sala es un error claro', () => {
  const salaRota = { id: 'rota', tipo: 'combate', filas: ['###X', '#.S#', '####'] };
  assert.throws(() => crearMundo(salaRota, datos), /Símbolo desconocido/);
});

test('una sala sin punto de inicio es un error claro', () => {
  const salaRota = { id: 'sin_inicio', tipo: 'combate', filas: ['####', '#..#', '####'] };
  assert.throws(() => crearMundo(salaRota, datos), /punto de inicio/);
});
