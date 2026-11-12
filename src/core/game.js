import { crearAleatorio } from './rng.js';
import { crearJugador, actualizarJugador } from './player.js';
import { calcularEstadisticas } from './items.js';
import { crearMundo } from './world.js';
import { actualizarEnemigos, crearEnemigos } from './enemies.js';
import { actualizarAtaque, actualizarProyectiles, intentarAtacar } from './combat.js';

/** Estadísticas de partida: los parámetros del héroe y el perfil del arma. */
export function estadisticasBase(datos, arma) {
  return {
    velocidadMaxima: datos.parametros.velocidadMaxima,
    saltosMaximos: datos.parametros.saltosMaximos,
    saludMaxima: datos.parametros.saludMaxima ?? 5,
    dano: arma.dano,
    cadencia: arma.cadencia,
    alcance: arma.alcance,
    retroceso: arma.retroceso,
    rompeEstructuras: arma.rompeEstructuras,
    critico: 0,
    escudosPorSala: 0,
    radioRecogida: 0,
    repeticiones: 0,
    danoAterrizaje: 0,
    quemadura: 0,
    perforante: 0
  };
}

export function crearJuego({ datos, armaId, salaId = 'inicio', semilla = 1 }) {
  const arma = datos.porId.arma[armaId] ?? datos.armas[0];
  if (!arma) throw new Error('Los datos no tienen ninguna arma');

  const sala = datos.porId.sala[salaId];
  if (!sala) throw new Error(`No existe la sala «${salaId}»`);

  const mundo = crearMundo(sala, datos);
  const juego = {
    datos,
    mundo,
    arma,
    semilla,
    aleatorio: crearAleatorio(semilla),
    objetos: [],
    jugador: crearJugador(mundo.spawn, datos.parametros),
    enemigos: crearEnemigos(mundo, datos),
    proyectiles: [],
    ataque: null,
    enemigosDerrotados: 0,
    terminado: false,
    estadisticas: {},
    sinergias: [],
    parametros: {},
    reloj: 0
  };

  recalcular(juego);
  return juego;
}

function recalcular(juego) {
  const { estadisticas, sinergias } = calcularEstadisticas(
    estadisticasBase(juego.datos, juego.arma),
    juego.objetos,
    juego.datos.sinergias
  );

  juego.estadisticas = estadisticas;
  juego.sinergias = sinergias;
  juego.parametros = {
    ...juego.datos.parametros,
    velocidadMaxima: estadisticas.velocidadMaxima,
    saltosMaximos: estadisticas.saltosMaximos
  };

  juego.jugador.saludMaxima = estadisticas.saludMaxima ?? juego.jugador.saludMaxima;
  juego.jugador.salud = Math.min(juego.jugador.salud, juego.jugador.saludMaxima);
}

export function recogerObjeto(juego, objetoId) {
  const objeto = juego.datos.porId.objeto[objetoId];
  if (!objeto) throw new Error(`No existe el objeto «${objetoId}»`);
  if (juego.objetos.some((recogido) => recogido.id === objeto.id)) return objeto;

  juego.objetos.push(objeto);
  recalcular(juego);
  return objeto;
}

export function actualizarJuego(juego, dt, entrada) {
  if (juego.terminado) return juego;

  juego.reloj += dt;
  actualizarJugador(
    juego.jugador,
    entrada,
    dt,
    juego.parametros,
    juego.mundo.solidos,
    { ancho: juego.mundo.anchoPx }
  );

  // El golpe se resuelve antes de mover a los enemigos para que el pogo cuente.
  if (entrada?.ataquePulsado) intentarAtacar(juego, entrada);
  actualizarAtaque(juego, dt);
  actualizarEnemigos(juego, dt);
  actualizarProyectiles(juego, dt);

  return juego;
}
