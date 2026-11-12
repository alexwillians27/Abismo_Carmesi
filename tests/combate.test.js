import test from 'node:test';
import assert from 'node:assert/strict';
import { crearJuego, actualizarJuego } from '../src/core/game.js';
import { cargarDatos } from './ayudas.js';

const datos = cargarDatos();
const DT = 1 / 60;
const QUIETO = { ejeX: 0, ejeY: 0, saltoPulsado: false, saltoMantenido: false, ataquePulsado: false };
const ATACAR_DERECHA = { ...QUIETO, ataquePulsado: true };
const ATACAR_ABAJO = { ...QUIETO, ejeY: 1, ataquePulsado: true };

function nuevoJuego(armaId = 'clavo') {
  return crearJuego({ datos, armaId, salaId: 'combate1', semilla: 7 });
}

/** Deja vivo un solo enemigo del tipo indicado para aislar el comportamiento. */
function dejarSolo(juego, tipoId) {
  const elegido = juego.enemigos.find((enemigo) => enemigo.tipo.id === tipoId);
  assert.ok(elegido, `la sala de combate no tiene ${tipoId}`);
  for (const enemigo of juego.enemigos) enemigo.vivo = enemigo === elegido;
  return elegido;
}

function colocar(enemigo, x, y) {
  enemigo.caja.x = x;
  enemigo.caja.y = y;
  enemigo.origen = { x: x + enemigo.caja.w / 2, y: y + enemigo.caja.h / 2 };
  enemigo.velocidad = { x: 0, y: 0 };
  enemigo.empujeTiempo = 0;
}

test('el Clavo golpea a un enemigo en su alcance y le quita vida', () => {
  const juego = nuevoJuego('clavo');
  const enemigo = dejarSolo(juego, 'patrullero');
  colocar(enemigo, juego.jugador.caja.x + juego.jugador.caja.w + 4, juego.jugador.caja.y);

  actualizarJuego(juego, DT, ATACAR_DERECHA);

  assert.equal(enemigo.salud, enemigo.saludMaxima - 1);
  assert.equal(enemigo.vivo, true);
  assert.ok(juego.ataque, 'el ataque debería durar algo más de un fotograma');
});

test('el ataque respeta la cadencia y no golpea dos veces seguidas', () => {
  const juego = nuevoJuego('clavo');
  const enemigo = dejarSolo(juego, 'patrullero');
  colocar(enemigo, juego.jugador.caja.x + juego.jugador.caja.w + 4, juego.jugador.caja.y);

  actualizarJuego(juego, DT, ATACAR_DERECHA);
  const trasPrimerGolpe = enemigo.salud;

  actualizarJuego(juego, DT, ATACAR_DERECHA);
  assert.equal(enemigo.salud, trasPrimerGolpe, 'el segundo ataque entró antes de tiempo');
  assert.ok(juego.jugador.cooldownAtaque > 0);

  for (let paso = 0; paso < 20; paso++) actualizarJuego(juego, DT, QUIETO);
  assert.equal(juego.jugador.cooldownAtaque, 0);

  colocar(enemigo, juego.jugador.caja.x + juego.jugador.caja.w + 4, juego.jugador.caja.y);
  actualizarJuego(juego, DT, ATACAR_DERECHA);
  assert.equal(enemigo.salud, trasPrimerGolpe - 1);
});

test('el Martillo hace más daño y empuja más que el Clavo', () => {
  const conClavo = nuevoJuego('clavo');
  const conClavoEnemigo = dejarSolo(conClavo, 'patrullero');
  colocar(conClavoEnemigo, conClavo.jugador.caja.x + conClavo.jugador.caja.w + 4, conClavo.jugador.caja.y);
  actualizarJuego(conClavo, DT, ATACAR_DERECHA);

  const conMartillo = nuevoJuego('martillo');
  const conMartilloEnemigo = dejarSolo(conMartillo, 'patrullero');
  colocar(conMartilloEnemigo, conMartillo.jugador.caja.x + conMartillo.jugador.caja.w + 4, conMartillo.jugador.caja.y);
  actualizarJuego(conMartillo, DT, ATACAR_DERECHA);

  assert.ok(conMartilloEnemigo.salud < conClavoEnemigo.salud, 'el Martillo no pega más');
  assert.ok(
    Math.abs(conMartilloEnemigo.empujeX) > Math.abs(conClavoEnemigo.empujeX),
    'el Martillo no empuja más'
  );
});

test('golpear hacia abajo en el aire rebota al héroe (pogo)', () => {
  const juego = nuevoJuego('clavo');
  const enemigo = dejarSolo(juego, 'patrullero');

  juego.jugador.caja.x = 150;
  juego.jugador.caja.y = 140;
  juego.jugador.enSuelo = false;
  juego.jugador.velocidad.y = 120;
  colocar(enemigo, 150, 140 + juego.jugador.caja.h + 8);

  actualizarJuego(juego, DT, ATACAR_ABAJO);

  assert.ok(juego.jugador.velocidad.y < 0, `no rebotó: ${juego.jugador.velocidad.y}`);
  assert.equal(enemigo.salud, enemigo.saludMaxima - 1);
});

test('el patrullero recorre su plataforma y da la vuelta en el borde', () => {
  const juego = nuevoJuego('clavo');
  const enemigo = dejarSolo(juego, 'patrullero');
  juego.jugador.caja.x = 400;

  const direcciones = new Set();
  let xMinima = Infinity;
  let xMaxima = -Infinity;

  for (let paso = 0; paso < 600; paso++) {
    actualizarJuego(juego, DT, QUIETO);
    direcciones.add(enemigo.direccion);
    xMinima = Math.min(xMinima, enemigo.caja.x);
    xMaxima = Math.max(xMaxima, enemigo.caja.x);
  }

  assert.ok(direcciones.size > 1, 'nunca cambió de dirección');
  assert.ok(xMinima >= 0 && xMaxima + enemigo.caja.w <= juego.mundo.anchoPx, 'salió de la sala');
  assert.equal(enemigo.enSuelo, true, 'debería seguir sobre la plataforma');
});

test('el perseguidor se acerca al héroe cuando lo detecta', () => {
  const juego = nuevoJuego('clavo');
  const enemigo = dejarSolo(juego, 'perseguidor');
  const jugador = juego.jugador;

  colocar(enemigo, jugador.caja.x + 220, jugador.caja.y - 8);
  const distanciaInicial = Math.abs(enemigo.caja.x - jugador.caja.x);

  for (let paso = 0; paso < 30; paso++) actualizarJuego(juego, DT, QUIETO);

  const distanciaFinal = Math.abs(enemigo.caja.x - jugador.caja.x);
  assert.ok(distanciaFinal < distanciaInicial - 20, `no se acercó: ${distanciaInicial} → ${distanciaFinal}`);
});

test('el volador oscila en el aire sin caer', () => {
  const juego = nuevoJuego('clavo');
  const enemigo = dejarSolo(juego, 'volador');
  juego.jugador.caja.x = 330;

  const origenY = enemigo.origen.y;
  let centroMinimo = Infinity;
  let centroMaximo = -Infinity;

  for (let paso = 0; paso < 120; paso++) {
    actualizarJuego(juego, DT, QUIETO);
    const centroY = enemigo.caja.y + enemigo.caja.h / 2;
    centroMinimo = Math.min(centroMinimo, centroY);
    centroMaximo = Math.max(centroMaximo, centroY);
  }

  assert.ok(centroMaximo - centroMinimo > 10, 'no osciló');
  assert.ok(
    Math.max(Math.abs(centroMinimo - origenY), Math.abs(centroMaximo - origenY)) < 60,
    'se alejó demasiado de su origen: debería volar, no caer'
  );
});

test('el tirador dispara desde lejos y su proyectil quita salud', () => {
  const juego = nuevoJuego('clavo');
  dejarSolo(juego, 'tirador');
  juego.jugador.caja.x = 330;

  const saludInicial = juego.jugador.salud;
  let huboDisparo = false;

  for (let paso = 0; paso < 240 && juego.jugador.salud === saludInicial; paso++) {
    actualizarJuego(juego, DT, QUIETO);
    if (juego.proyectiles.some((proyectil) => proyectil.origen === 'enemigo')) huboDisparo = true;
  }

  assert.ok(huboDisparo, 'el tirador no disparó');
  assert.ok(juego.jugador.salud < saludInicial, 'el proyectil no hizo daño');
});

test('el contacto quita una sola unidad de vida por la invulnerabilidad', () => {
  const juego = nuevoJuego('clavo');
  const enemigo = dejarSolo(juego, 'patrullero');
  colocar(enemigo, juego.jugador.caja.x, juego.jugador.caja.y);

  const saludInicial = juego.jugador.salud;

  actualizarJuego(juego, DT, QUIETO);
  assert.equal(juego.jugador.salud, saludInicial - 1);
  assert.ok(juego.jugador.invulnerable > 0);

  actualizarJuego(juego, DT, QUIETO);
  assert.equal(juego.jugador.salud, saludInicial - 1, 'volvió a recibir daño durante la invulnerabilidad');
});

test('al quedarse sin salud la run termina', () => {
  const juego = nuevoJuego('clavo');
  const enemigo = dejarSolo(juego, 'patrullero');
  juego.jugador.salud = 1;
  colocar(enemigo, juego.jugador.caja.x, juego.jugador.caja.y);

  actualizarJuego(juego, DT, QUIETO);

  assert.equal(juego.jugador.salud, 0);
  assert.equal(juego.terminado, true);
});

test('la Aguja de ceniza daña a distancia con un proyectil', () => {
  const juego = nuevoJuego('aguja');
  const enemigo = dejarSolo(juego, 'tirador');
  juego.jugador.caja.x = 330;

  const saludInicial = enemigo.salud;

  for (let paso = 0; paso < 40; paso++) {
    actualizarJuego(juego, DT, paso === 0 ? ATACAR_DERECHA : QUIETO);
  }

  assert.ok(enemigo.salud < saludInicial, `el proyectil no llegó: ${enemigo.salud}`);
});
