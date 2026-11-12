import { moverConColisiones } from './physics.js';

export function crearJugador(spawn, parametros) {
  const { ancho, alto } = parametros;
  return {
    caja: { x: spawn.x - ancho / 2, y: spawn.y - alto, w: ancho, h: alto },
    velocidad: { x: 0, y: 0 },
    enSuelo: false,
    coyote: 0,
    bufferSalto: 0,
    saltosAereosUsados: 0,
    saltoActivo: false,
    mirando: 1
  };
}

/**
 * Un paso de simulación del héroe. `entrada` es abstracta
 * ({ ejeX, saltoPulsado, saltoMantenido }) para no depender del teclado.
 */
export function actualizarJugador(jugador, entrada, dt, parametros, solidos, limites = null) {
  const eje = Math.max(-1, Math.min(1, Number(entrada?.ejeX ?? 0)));
  const saltoPulsado = Boolean(entrada?.saltoPulsado);
  const saltoMantenido = Boolean(entrada?.saltoMantenido);

  // Coyote time: margen para saltar justo después de dejar una plataforma.
  jugador.coyote = jugador.enSuelo ? parametros.coyoteTime : Math.max(0, jugador.coyote - dt);

  // Buffer de salto: si se pulsa poco antes de aterrizar, el salto se ejecuta al tocar suelo.
  jugador.bufferSalto = saltoPulsado ? parametros.bufferSalto : Math.max(0, jugador.bufferSalto - dt);

  // Movimiento horizontal con aceleración y frenado distintos en suelo y en aire.
  if (eje !== 0) {
    const aceleracion = jugador.enSuelo ? parametros.aceleracionSuelo : parametros.aceleracionAire;
    jugador.velocidad.x += eje * aceleracion * dt;
    jugador.mirando = Math.sign(eje);
  } else if (jugador.velocidad.x !== 0) {
    const frenado = (jugador.enSuelo ? parametros.frenadoSuelo : parametros.frenadoAire) * dt;
    jugador.velocidad.x =
      Math.abs(jugador.velocidad.x) <= frenado
        ? 0
        : jugador.velocidad.x - Math.sign(jugador.velocidad.x) * frenado;
  }
  const maxima = parametros.velocidadMaxima;
  jugador.velocidad.x = Math.max(-maxima, Math.min(maxima, jugador.velocidad.x));

  // Salto: desde el suelo (o el coyote) y después los saltos extra de los objetos.
  if (jugador.bufferSalto > 0) {
    if (jugador.coyote > 0) {
      jugador.velocidad.y = -parametros.velocidadSalto;
      jugador.bufferSalto = 0;
      jugador.coyote = 0;
      jugador.saltosAereosUsados = 0;
      jugador.saltoActivo = true;
      jugador.enSuelo = false;
    } else if (!jugador.enSuelo && jugador.saltosAereosUsados < parametros.saltosMaximos - 1) {
      jugador.velocidad.y = -parametros.velocidadSalto;
      jugador.bufferSalto = 0;
      jugador.saltosAereosUsados += 1;
      jugador.saltoActivo = true;
    }
  }

  // Corte de salto: soltar el botón en ascenso recorta la altura.
  if (jugador.saltoActivo && !saltoMantenido && jugador.velocidad.y < 0) {
    jugador.velocidad.y *= parametros.corteSalto;
    jugador.saltoActivo = false;
  }
  if (jugador.velocidad.y >= 0) jugador.saltoActivo = false;

  // Gravedad asimétrica y velocidad de caída limitada.
  const gravedad = jugador.velocidad.y < 0 ? parametros.gravedadSubida : parametros.gravedadCaida;
  jugador.velocidad.y = Math.min(
    jugador.velocidad.y + gravedad * dt,
    parametros.velocidadMaximaCaida
  );

  const { caja, contacto } = moverConColisiones(
    jugador.caja,
    jugador.velocidad.x * dt,
    jugador.velocidad.y * dt,
    solidos
  );
  jugador.caja = caja;

  if (contacto.suelo) {
    jugador.velocidad.y = 0;
    jugador.enSuelo = true;
    jugador.saltosAereosUsados = 0;
    jugador.saltoActivo = false;
  } else {
    jugador.enSuelo = false;
  }
  if (contacto.techo && jugador.velocidad.y < 0) jugador.velocidad.y = 0;
  if (contacto.izquierda || contacto.derecha) jugador.velocidad.x = 0;

  // Los límites de la sala hacen de pared infranqueable en las puertas.
  if (limites) {
    const maximoX = Math.max(0, limites.ancho - jugador.caja.w);
    jugador.caja.x = Math.max(0, Math.min(maximoX, jugador.caja.x));
    if (jugador.caja.y < 0) {
      jugador.caja.y = 0;
      jugador.velocidad.y = Math.max(0, jugador.velocidad.y);
    }
  }

  return jugador;
}
