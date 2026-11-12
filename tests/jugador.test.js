import test from 'node:test';
import assert from 'node:assert/strict';
import { crearJuego, actualizarJuego, recogerObjeto } from '../src/core/game.js';
import { cargarDatos } from './ayudas.js';

const datos = cargarDatos();
const DT = 1 / 60;
const QUIETO = { ejeX: 0, saltoPulsado: false, saltoMantenido: false };

function crearJuegoDePrueba(armaId = 'clavo') {
  return crearJuego({ datos, armaId, salaId: 'inicio', semilla: 1 });
}

test('el jugador cae y aterriza sobre el suelo de la sala', () => {
  const juego = crearJuegoDePrueba();
  juego.jugador.caja.y -= 120;
  const alturaDePartida = juego.jugador.caja.y;

  for (let paso = 0; paso < 120; paso++) actualizarJuego(juego, DT, QUIETO);

  assert.equal(juego.jugador.enSuelo, true, 'no llegó a tocar el suelo');
  assert.ok(juego.jugador.caja.y > alturaDePartida, 'no descendió');
  assert.equal(juego.jugador.velocidad.y, 0);
});

test('el salto sube y vuelve al suelo si se mantiene pulsado', () => {
  const juego = crearJuegoDePrueba();
  for (let paso = 0; paso < 10; paso++) actualizarJuego(juego, DT, QUIETO);

  const alturaInicial = juego.jugador.caja.y;
  let alturaMaxima = 0;

  for (let paso = 0; paso < 90; paso++) {
    const entrada = { ejeX: 0, saltoPulsado: paso === 0, saltoMantenido: paso < 40 };
    actualizarJuego(juego, DT, entrada);
    alturaMaxima = Math.max(alturaMaxima, alturaInicial - juego.jugador.caja.y);
  }

  assert.ok(alturaMaxima > 60, `el salto solo alcanzó ${alturaMaxima.toFixed(1)} px`);
  assert.equal(juego.jugador.enSuelo, true, 'no volvió a aterrizar');
});

test('soltar el botón pronto recorta la altura del salto', () => {
  const medirSalto = (mantenerFotogramas) => {
    const juego = crearJuegoDePrueba();
    for (let paso = 0; paso < 10; paso++) actualizarJuego(juego, DT, QUIETO);
    const alturaInicial = juego.jugador.caja.y;
    let alturaMaxima = 0;

    for (let paso = 0; paso < 90; paso++) {
      const entrada = { ejeX: 0, saltoPulsado: paso === 0, saltoMantenido: paso < mantenerFotogramas };
      actualizarJuego(juego, DT, entrada);
      alturaMaxima = Math.max(alturaMaxima, alturaInicial - juego.jugador.caja.y);
    }
    return alturaMaxima;
  };

  const alto = medirSalto(90);
  const corto = medirSalto(1);

  assert.ok(corto < alto, `el salto corto (${corto.toFixed(1)}) no fue menor que el largo (${alto.toFixed(1)})`);
});

test('con Alas de ceniza el jugador dispone de un salto extra', () => {
  const juego = crearJuegoDePrueba();
  recogerObjeto(juego, 'alas_de_ceniza');
  for (let paso = 0; paso < 10; paso++) actualizarJuego(juego, DT, QUIETO);

  const alturaInicial = juego.jugador.caja.y;
  let alturaMaxima = 0;

  for (let paso = 0; paso < 120; paso++) {
    const entrada = { ejeX: 0, saltoPulsado: paso === 0 || paso === 24, saltoMantenido: true };
    actualizarJuego(juego, DT, entrada);
    alturaMaxima = Math.max(alturaMaxima, alturaInicial - juego.jugador.caja.y);
  }

  assert.ok(alturaMaxima > 160, `el doble salto solo alcanzó ${alturaMaxima.toFixed(1)} px`);
});

test('el jugador se mueve en horizontal y no atraviesa las paredes', () => {
  const juego = crearJuegoDePrueba();
  const xInicial = juego.jugador.caja.x;

  for (let paso = 0; paso < 240; paso++) {
    actualizarJuego(juego, DT, { ejeX: 1, saltoPulsado: false, saltoMantenido: false });
  }

  assert.ok(juego.jugador.caja.x > xInicial, 'no se movió a la derecha');
  assert.ok(
    juego.jugador.caja.x + juego.jugador.caja.w <= juego.mundo.anchoPx,
    'salió del ancho de la sala'
  );
});
