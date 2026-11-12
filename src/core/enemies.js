// Comportamientos de los cuatro enemigos del prototipo. Todos se dibujan como
// puntos rojos: se distinguen por cómo se mueven (Anexo A, apartado 3).

import { moverConColisiones, solapan } from './physics.js';
import { danarJugador } from './combat.js';

export function crearEnemigos(mundo, datos) {
  return mundo.enemigos.map((ubicacion, indice) => {
    const tipo = datos.porId.enemigo[ubicacion.tipo];
    if (!tipo) throw new Error(`No existe el enemigo «${ubicacion.tipo}»`);
    return crearEnemigo(ubicacion, tipo, indice);
  });
}

function crearEnemigo(ubicacion, tipo, indice) {
  const ancho = tipo.ancho ?? 18;
  const alto = tipo.alto ?? 18;

  return {
    id: `${tipo.id}-${indice}`,
    tipo,
    caja: { x: ubicacion.x - ancho / 2, y: ubicacion.y - alto / 2, w: ancho, h: alto },
    origen: { x: ubicacion.x, y: ubicacion.y },
    velocidad: { x: 0, y: 0 },
    salud: tipo.salud,
    saludMaxima: tipo.salud,
    vivo: true,
    enSuelo: false,
    tocandoPared: false,
    direccion: indice % 2 === 0 ? 1 : -1,
    empujeX: 0,
    empujeTiempo: 0,
    golpeado: 0,
    fase: indice * 1.7,
    cdDisparo: tipo.cadencia ?? 1
  };
}

export function actualizarEnemigos(juego, dt) {
  for (const enemigo of juego.enemigos) {
    if (!enemigo.vivo) continue;

    enemigo.golpeado = Math.max(0, enemigo.golpeado - dt);
    enemigo.empujeTiempo = Math.max(0, enemigo.empujeTiempo - dt);

    const comportamiento = enemigo.tipo.comportamiento;
    if (comportamiento === 'vuela') {
      volar(enemigo, dt);
    } else if (enemigo.empujeTiempo > 0) {
      enemigo.velocidad.x = enemigo.empujeX;
      caer(juego, enemigo, dt);
    } else if (comportamiento === 'patrulla') {
      patrullar(juego, enemigo, dt);
    } else if (comportamiento === 'persigue') {
      perseguir(juego, enemigo, dt);
    } else if (comportamiento === 'dispara') {
      disparar(juego, enemigo, dt);
    }

    // Daño por contacto: la invulnerabilidad del héroe evita el daño por fotograma.
    if (solapan(enemigo.caja, juego.jugador.caja)) {
      const empuje = Math.sign(juego.jugador.caja.x - enemigo.caja.x) || 1;
      danarJugador(juego, enemigo.tipo.danoContacto ?? 1, empuje);
    }
  }
}

/** Gravedad y colisiones de un enemigo que camina o está quieto en el suelo. */
function caer(juego, enemigo, dt) {
  enemigo.velocidad.y = Math.min(
    enemigo.velocidad.y + juego.parametros.gravedadCaida * dt,
    juego.parametros.velocidadMaximaCaida
  );

  const { caja, contacto } = moverConColisiones(
    enemigo.caja,
    enemigo.velocidad.x * dt,
    enemigo.velocidad.y * dt,
    juego.mundo.solidos
  );

  enemigo.caja = caja;
  enemigo.enSuelo = contacto.suelo;
  enemigo.tocandoPared = contacto.izquierda || contacto.derecha;
  if (contacto.suelo) enemigo.velocidad.y = 0;
}

/** ¿Hay plataforma justo delante del enemigo, a la altura de los pies? */
function haySueloDelante(juego, enemigo) {
  const x = enemigo.direccion > 0 ? enemigo.caja.x + enemigo.caja.w + 2 : enemigo.caja.x - 2;
  const y = enemigo.caja.y + enemigo.caja.h + 2;

  return juego.mundo.solidos.some(
    (solido) => x >= solido.x && x <= solido.x + solido.w && y >= solido.y && y <= solido.y + solido.h
  );
}

function patrullar(juego, enemigo, dt) {
  enemigo.velocidad.x = enemigo.direccion * enemigo.tipo.velocidad;
  caer(juego, enemigo, dt);

  if (enemigo.tocandoPared || (enemigo.enSuelo && !haySueloDelante(juego, enemigo))) {
    enemigo.direccion *= -1;
    enemigo.velocidad.x = enemigo.direccion * enemigo.tipo.velocidad;
  }
}

function perseguir(juego, enemigo, dt) {
  const jugador = juego.jugador;
  const dx = jugador.caja.x + jugador.caja.w / 2 - (enemigo.caja.x + enemigo.caja.w / 2);
  const dy = Math.abs(jugador.caja.y - enemigo.caja.y);
  const detecta = enemigo.tipo.detecta ?? 240;

  if (Math.abs(dx) > detecta || dy > detecta) {
    enemigo.velocidad.x = 0;
    caer(juego, enemigo, dt);
    return;
  }

  enemigo.direccion = Math.sign(dx) || enemigo.direccion;
  enemigo.velocidad.x = enemigo.direccion * enemigo.tipo.velocidad;
  caer(juego, enemigo, dt);
  if (enemigo.tocandoPared) enemigo.velocidad.x = 0;
}

function volar(enemigo, dt) {
  const frecuencia = enemigo.tipo.frecuencia ?? 1.8;
  const amplitudY = enemigo.tipo.amplitud ?? 22;
  const amplitudX = enemigo.tipo.amplitudX ?? 30;

  enemigo.fase += dt * frecuencia;
  enemigo.caja.x = enemigo.origen.x - enemigo.caja.w / 2 + Math.sin(enemigo.fase) * amplitudX;
  enemigo.caja.y = enemigo.origen.y - enemigo.caja.h / 2 + Math.sin(enemigo.fase * 2) * amplitudY;
  enemigo.velocidad.x = 0;
  enemigo.velocidad.y = 0;
  enemigo.enSuelo = false;
}

function disparar(juego, enemigo, dt) {
  enemigo.velocidad.x = 0;
  caer(juego, enemigo, dt);

  const centroX = enemigo.caja.x + enemigo.caja.w / 2;
  const centroY = enemigo.caja.y + enemigo.caja.h / 2;
  const jugador = juego.jugador;

  const dx = jugador.caja.x + jugador.caja.w / 2 - centroX;
  const dy = jugador.caja.y + jugador.caja.h / 2 - centroY;
  const alcance = enemigo.tipo.alcanceDisparo ?? 300;

  enemigo.cdDisparo = Math.max(0, enemigo.cdDisparo - dt);
  if (enemigo.cdDisparo > 0) return;
  if (Math.abs(dx) > alcance || Math.abs(dy) > 48) return;

  const velocidad = enemigo.tipo.velocidadProyectil ?? 240;
  const longitud = Math.hypot(dx, dy) || 1;

  juego.proyectiles.push({
    origen: 'enemigo',
    x: centroX,
    y: centroY,
    vx: (dx / longitud) * velocidad,
    vy: (dy / longitud) * velocidad,
    radio: 4,
    dano: enemigo.tipo.danoProyectil ?? 1,
    retroceso: 0,
    vida: alcance / velocidad
  });

  enemigo.cdDisparo = enemigo.tipo.cadencia ?? 1.4;
}
