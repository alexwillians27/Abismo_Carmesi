import test from 'node:test';
import assert from 'node:assert/strict';
import { crearJuego, recogerObjeto } from '../src/core/game.js';
import { cargarDatos } from './ayudas.js';

const datos = cargarDatos();

function crearJuegoDePrueba(armaId = 'clavo') {
  return crearJuego({ datos, armaId, salaId: 'inicio', semilla: 1 });
}

test('un objeto modifica las estadísticas del jugador', () => {
  const juego = crearJuegoDePrueba();
  const velocidadInicial = juego.estadisticas.velocidadMaxima;

  recogerObjeto(juego, 'botas_ligeras');

  assert.equal(juego.objetos.length, 1);
  assert.ok(juego.estadisticas.velocidadMaxima > velocidadInicial);
  assert.equal(juego.parametros.velocidadMaxima, juego.estadisticas.velocidadMaxima);
  assert.ok(Math.abs(juego.estadisticas.velocidadMaxima - velocidadInicial * 1.2) < 1e-9);
});

test('un objeto no se aplica dos veces', () => {
  const juego = crearJuegoDePrueba();
  const velocidadInicial = juego.estadisticas.velocidadMaxima;

  recogerObjeto(juego, 'botas_ligeras');
  recogerObjeto(juego, 'botas_ligeras');

  assert.equal(juego.objetos.length, 1);
  assert.ok(Math.abs(juego.estadisticas.velocidadMaxima - velocidadInicial * 1.2) < 1e-9);
});

test('las sinergias solo se activan al reunir sus dos objetos', () => {
  const juego = crearJuegoDePrueba();

  recogerObjeto(juego, 'alas_de_ceniza');
  assert.equal(juego.sinergias.length, 0, 'una sinergia se activó con un solo objeto');
  assert.equal(juego.estadisticas.saltosMaximos, 2);

  recogerObjeto(juego, 'piedra_sismica');
  assert.deepEqual(
    juego.sinergias.map((sinergia) => sinergia.id),
    ['caida_sismica']
  );
  assert.ok(juego.estadisticas.danoAterrizaje > 0);
});

test('el arma define el daño base y los objetos pueden cambiarlo', () => {
  const juego = crearJuegoDePrueba('martillo');
  assert.equal(juego.estadisticas.dano, datos.porId.arma.martillo.dano);
  assert.equal(juego.estadisticas.rompeEstructuras, datos.porId.arma.martillo.rompeEstructuras);

  recogerObjeto(juego, 'reloj_oxidado');
  assert.ok(juego.estadisticas.cadencia < datos.porId.arma.martillo.cadencia);
});

test('recoger un objeto inexistente es un error claro', () => {
  const juego = crearJuegoDePrueba();
  assert.throws(() => recogerObjeto(juego, 'no_existe'), /No existe el objeto/);
});
