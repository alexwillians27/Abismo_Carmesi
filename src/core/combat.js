// Combate del núcleo: golpes, daño, retroceso, pogo y proyectiles.
// No conoce el dibujo: devuelve cajas y estados que la presentación puede pintar.

import { solapan } from './physics.js';

/** Caja del golpe según la dirección y el alcance del arma. */
export function cajaDeAtaque(jugador, arma, direccion) {
  const { x, y, w, h } = jugador.caja;
  const alcance = arma.alcance;

  if (direccion === 'arriba') return { x: x + w * 0.1, y: y - alcance, w: w * 0.8, h: alcance };
  if (direccion === 'abajo') return { x: x + w * 0.1, y: y + h, w: w * 0.8, h: alcance };
  if (direccion === 'izquierda') return { x: x - alcance, y: y + h * 0.15, w: alcance, h: h * 0.7 };
  return { x: x + w, y: y + h * 0.15, w: alcance, h: h * 0.7 };
}

/** Traduce la entrada abstracta en una de las cuatro direcciones del golpe. */
export function direccionDeAtaque(entrada, jugador) {
  const ejeY = Number(entrada?.ejeY ?? 0);
  if (ejeY < 0) return 'arriba';
  if (ejeY > 0) return 'abajo';
  return jugador.mirando < 0 ? 'izquierda' : 'derecha';
}

export function puedeAtacar(juego) {
  return !juego.terminado && juego.jugador.cooldownAtaque <= 0;
}

/** Arranca un ataque si la cadencia lo permite. Devuelve el ataque o null. */
export function intentarAtacar(juego, entrada) {
  if (!puedeAtacar(juego)) return null;

  const { arma, jugador } = juego;
  const direccion = direccionDeAtaque(entrada, jugador);
  jugador.cooldownAtaque = arma.cadencia;

  const ataque = {
    armaId: arma.id,
    forma: arma.forma ?? 'melee',
    direccion,
    tiempo: arma.duracion ?? 0.12,
    golpeados: []
  };

  if (ataque.forma === 'proyectil') lanzarProyectil(juego, direccion);
  juego.ataque = ataque;
  return ataque;
}

function lanzarProyectil(juego, direccion) {
  const { arma, jugador } = juego;
  const velocidad = arma.velocidadProyectil ?? 480;
  const radio = arma.radioProyectil ?? 4;
  const centroX = jugador.caja.x + jugador.caja.w / 2;
  const centroY = jugador.caja.y + jugador.caja.h / 2;

  const signos = {
    derecha: { x: 1, y: 0 },
    izquierda: { x: -1, y: 0 },
    arriba: { x: 0, y: -1 },
    abajo: { x: 0, y: 1 }
  }[direccion];

  juego.proyectiles.push({
    origen: 'jugador',
    x: centroX + signos.x * (jugador.caja.w / 2 + radio),
    y: centroY + signos.y * (jugador.caja.h / 2 + radio),
    vx: signos.x * velocidad,
    vy: signos.y * velocidad,
    radio,
    dano: arma.dano,
    retroceso: arma.retroceso,
    vida: (arma.alcance ?? 200) / velocidad
  });
}

function aplicarRetroceso(juego, enemigo, retroceso, direccion) {
  const signo =
    direccion === 'izquierda'
      ? -1
      : direccion === 'derecha'
        ? 1
        : -Math.sign(juego.jugador.mirando || 1);

  enemigo.empujeX = signo * retroceso;
  enemigo.empujeTiempo = 0.15;
}

/** Aplica daño a un enemigo; devuelve true si el golpe lo ha derrotado. */
export function danarEnemigo(juego, enemigo, dano, retroceso = 0, direccion = 'derecha') {
  if (!enemigo.vivo) return false;

  enemigo.salud -= dano;
  enemigo.golpeado = 0.12;
  aplicarRetroceso(juego, enemigo, retroceso, direccion);

  if (enemigo.salud > 0) return false;

  enemigo.salud = 0;
  enemigo.vivo = false;
  juego.enemigosDerrotados += 1;
  return true;
}

/** Aplica daño al héroe respetando la invulnerabilidad temporal. */
export function danarJugador(juego, dano, empujeX = 0) {
  const { jugador, parametros } = juego;
  if (juego.terminado || jugador.invulnerable > 0) return false;

  jugador.salud = Math.max(0, jugador.salud - dano);
  jugador.invulnerable = parametros.invulnerabilidad;

  if (empujeX !== 0) {
    jugador.velocidad.x = Math.sign(empujeX) * parametros.retrocesoRecibido;
    jugador.velocidad.y = Math.min(jugador.velocidad.y, -parametros.retrocesoRecibido * 0.4);
  }

  if (jugador.salud <= 0) juego.terminado = true;
  return true;
}

/** Avanza el golpe activo: cada enemigo recibe como mucho un impacto por ataque. */
export function actualizarAtaque(juego, dt) {
  const { jugador } = juego;
  jugador.cooldownAtaque = Math.max(0, jugador.cooldownAtaque - dt);

  const ataque = juego.ataque;
  if (!ataque) return;

  if (ataque.forma === 'melee') {
    const caja = cajaDeAtaque(jugador, juego.arma, ataque.direccion);

    for (const enemigo of juego.enemigos) {
      if (!enemigo.vivo || ataque.golpeados.includes(enemigo.id)) continue;
      if (!solapan(caja, enemigo.caja)) continue;

      ataque.golpeados.push(enemigo.id);
      danarEnemigo(juego, enemigo, juego.arma.dano, juego.arma.retroceso, ataque.direccion);
      if (ataque.direccion === 'abajo' && !jugador.enSuelo) rebotar(juego);
    }
  }

  ataque.tiempo -= dt;
  if (ataque.tiempo <= 0) juego.ataque = null;
}

/** Pogo: golpear hacia abajo en el aire devuelve al héroe hacia arriba. */
function rebotar(juego) {
  const { jugador, parametros } = juego;
  jugador.velocidad.y = -parametros.rebotePogo;
  jugador.saltosAereosUsados = 0;
  jugador.saltoActivo = true;
  jugador.enSuelo = false;
}

/** Proyectiles de ambos bandos: se mueven, chocan con sólidos y hacen daño. */
export function actualizarProyectiles(juego, dt) {
  const activos = [];

  for (const proyectil of juego.proyectiles) {
    proyectil.x += proyectil.vx * dt;
    proyectil.y += proyectil.vy * dt;
    proyectil.vida -= dt;
    if (proyectil.vida <= 0) continue;

    const caja = {
      x: proyectil.x - proyectil.radio,
      y: proyectil.y - proyectil.radio,
      w: proyectil.radio * 2,
      h: proyectil.radio * 2
    };

    if (juego.mundo.solidos.some((solido) => solapan(caja, solido))) continue;

    if (proyectil.origen === 'jugador') {
      const objetivo = juego.enemigos.find(
        (enemigo) => enemigo.vivo && solapan(caja, enemigo.caja)
      );
      if (objetivo) {
        danarEnemigo(
          juego,
          objetivo,
          proyectil.dano,
          proyectil.retroceso,
          proyectil.vx < 0 ? 'izquierda' : 'derecha'
        );
        continue;
      }
    } else if (solapan(caja, juego.jugador.caja)) {
      danarJugador(juego, proyectil.dano, proyectil.vx);
      continue;
    }

    activos.push(proyectil);
  }

  juego.proyectiles = activos;
}
