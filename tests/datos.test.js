import test from 'node:test';
import assert from 'node:assert/strict';
import { cargarDatos } from './ayudas.js';

const datos = cargarDatos();

test('hay tres armas con el perfil de datos del GDD', () => {
  assert.equal(datos.armas.length, 3);
  for (const arma of datos.armas) {
    for (const campo of [
      'id',
      'nombre',
      'tipo',
      'dano',
      'cadencia',
      'alcance',
      'retroceso',
      'rompeEstructuras',
      'etiquetas'
    ]) {
      assert.ok(campo in arma, `El arma «${arma.id}» no tiene el campo ${campo}`);
    }
    assert.ok(Array.isArray(arma.etiquetas) && arma.etiquetas.length > 0);
    assert.equal(new Set(datos.armas.map((a) => a.tipo)).size, 3, 'las armas no son de tres tipos distintos');
  }
});

test('hay diez objetos con etiquetas y modificadores', () => {
  assert.equal(datos.objetos.length, 10);
  for (const objeto of datos.objetos) {
    assert.ok(objeto.etiquetas.length > 0, `El objeto «${objeto.id}» no tiene etiquetas`);
    assert.ok(objeto.modificadores.length > 0, `El objeto «${objeto.id}» no tiene modificadores`);
  }
});

test('cada sinergia apunta a objetos que existen', () => {
  assert.ok(datos.sinergias.length >= 4, 'faltan sinergias');
  for (const sinergia of datos.sinergias) {
    assert.ok(sinergia.objetos.length >= 2);
    for (const id of sinergia.objetos) {
      assert.ok(datos.porId.objeto[id], `La sinergia «${sinergia.id}» usa el objeto inexistente ${id}`);
    }
  }
});

test('hay cuatro enemigos con comportamientos distintos', () => {
  assert.equal(datos.enemigos.length, 4);
  assert.equal(new Set(datos.enemigos.map((enemigo) => enemigo.comportamiento)).size, 4);
});

test('las salas son cuadrículas de 16 x 11 con un solo inicio', () => {
  assert.ok(datos.salas.length >= 1);
  for (const sala of datos.salas) {
    assert.equal(sala.filas.length, 11, `La sala ${sala.id} no tiene 11 filas`);
    for (const fila of sala.filas) {
      assert.equal(fila.length, 16, `La sala ${sala.id} tiene una fila de ${fila.length} caracteres`);
    }
    const inicios = sala.filas.join('').split('S').length - 1;
    assert.equal(inicios, 1, `La sala ${sala.id} debería tener un único punto de inicio`);
  }
});
