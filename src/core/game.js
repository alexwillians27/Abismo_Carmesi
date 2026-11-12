import { crearAleatorio } from './rng.js';
import { crearJugador, actualizarJugador } from './player.js';
import { calcularEstadisticas } from './items.js';
import { crearMundo } from './world.js';

/** Estadísticas de partida: los parámetros del héroe y el perfil del arma. */
export function estadisticasBase(datos, arma) {
  return {
    velocidadMaxima: datos.parametros.velocidadMaxima,
    saltosMaximos: datos.parametros.saltosMaximos,
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
  juego.reloj += dt;
  actualizarJugador(
    juego.jugador,
    entrada,
    dt,
    juego.parametros,
    juego.mundo.solidos,
    { ancho: juego.mundo.anchoPx }
  );
  return juego;
}
