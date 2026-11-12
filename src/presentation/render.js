// Capa de presentación: en el prototipo es un canvas 2D; en Unity serían sprites
// sin cambiar nada del núcleo.

import { cajaDeAtaque } from '../core/combat.js';

const COLORES = {
  fondo: '#0b0b0f',
  margen: '#2b2b38',
  muro: '#191922',
  plataforma: '#21212c',
  borde: '#33334a',
  puerta: '#d8a24a',
  enemigo: '#e04a4a',
  enemigoGolpeado: '#ffd2d2',
  heroe: '#4a94ff',
  halo: 'rgba(74, 148, 255, 0.18)',
  golpe: 'rgba(232, 232, 238, 0.22)',
  proyectilJugador: '#cfe4ff',
  proyectilEnemigo: '#ff9a5a',
  vidaLlena: '#e0574a',
  vidaVacia: '#2a2a35',
  hudFondo: 'rgba(10, 10, 14, 0.72)',
  hudTexto: '#c9c9d6',
  hudTenue: '#8a8a99'
};

export function crearRenderizador(canvas) {
  const ctx = canvas.getContext('2d');
  const escala = Math.min(globalThis.devicePixelRatio || 1, 2);

  function preparar(mundo) {
    const ancho = mundo.anchoPx * escala;
    const alto = mundo.altoPx * escala;
    if (canvas.width !== ancho || canvas.height !== alto) {
      canvas.width = ancho;
      canvas.height = alto;
    }
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
  }

  function circulo(x, y, radio, color) {
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function dibujarPuerta(puerta, tileSize) {
    const grosor = 4;
    ctx.fillStyle = COLORES.puerta;
    if (puerta.lado === 'izquierda') ctx.fillRect(puerta.x, puerta.y, grosor, tileSize);
    else if (puerta.lado === 'derecha') ctx.fillRect(puerta.x + tileSize - grosor, puerta.y, grosor, tileSize);
    else if (puerta.lado === 'arriba') ctx.fillRect(puerta.x, puerta.y, tileSize, grosor);
    else if (puerta.lado === 'abajo') ctx.fillRect(puerta.x, puerta.y + tileSize - grosor, tileSize, grosor);
  }

  function dibujarVida(jugador, x, y) {
    const tamano = 9;
    for (let indice = 0; indice < jugador.saludMaxima; indice++) {
      ctx.fillStyle = indice < jugador.salud ? COLORES.vidaLlena : COLORES.vidaVacia;
      ctx.fillRect(x + indice * (tamano + 4), y, tamano, tamano);
    }
  }

  return {
    dibujar(juego) {
      const { mundo, jugador, arma, objetos, sinergias, enemigos, proyectiles, ataque } = juego;
      preparar(mundo);

      ctx.clearRect(0, 0, mundo.anchoPx, mundo.altoPx);
      ctx.fillStyle = COLORES.fondo;
      ctx.fillRect(0, 0, mundo.anchoPx, mundo.altoPx);

      // Escenario: solo líneas de margen y bloques.
      ctx.strokeStyle = COLORES.margen;
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, mundo.anchoPx - 2, mundo.altoPx - 2);

      for (const solido of mundo.solidos) {
        ctx.fillStyle = solido.tipo === 'plataforma' ? COLORES.plataforma : COLORES.muro;
        ctx.fillRect(solido.x, solido.y, solido.w, solido.h);
        ctx.fillStyle = COLORES.borde;
        ctx.fillRect(solido.x, solido.y, solido.w, 2);
      }

      for (const puerta of mundo.puertas) dibujarPuerta(puerta, mundo.tileSize);

      // Golpe activo: solo el área, sin animación.
      if (ataque && ataque.forma === 'melee') {
        const caja = cajaDeAtaque(jugador, arma, ataque.direccion);
        ctx.fillStyle = COLORES.golpe;
        ctx.fillRect(caja.x, caja.y, caja.w, caja.h);
      }

      // Enemigos vivos: puntos rojos que se aclaran al ser golpeados.
      for (const enemigo of enemigos) {
        if (!enemigo.vivo) continue;
        const centroX = enemigo.caja.x + enemigo.caja.w / 2;
        const centroY = enemigo.caja.y + enemigo.caja.h / 2;
        const radio = Math.min(enemigo.caja.w, enemigo.caja.h) / 2;
        circulo(centroX, centroY, radio, enemigo.golpeado > 0 ? COLORES.enemigoGolpeado : COLORES.enemigo);
      }

      for (const proyectil of proyectiles) {
        circulo(
          proyectil.x,
          proyectil.y,
          proyectil.radio,
          proyectil.origen === 'jugador' ? COLORES.proyectilJugador : COLORES.proyectilEnemigo
        );
      }

      // Héroe: punto azul; parpadea mientras es invulnerable.
      const centroX = jugador.caja.x + jugador.caja.w / 2;
      const centroY = jugador.caja.y + jugador.caja.h / 2;
      if (jugador.invulnerable <= 0 || Math.floor(juego.reloj * 20) % 2 === 0) {
        circulo(centroX, centroY, 16, COLORES.halo);
        circulo(centroX, centroY, 7, COLORES.heroe);
      }

      // HUD mínimo: vida, arma y build.
      const restantes = enemigos.filter((enemigo) => enemigo.vivo).length;
      ctx.fillStyle = COLORES.hudFondo;
      ctx.fillRect(8, 8, 300, 64);
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillStyle = COLORES.hudTexto;
      ctx.fillText(
        `${arma.nombre} · daño ${redondear(arma.dano)} · cadencia ${redondear(arma.cadencia)} s`,
        16,
        25
      );
      dibujarVida(jugador, 16, 33);
      ctx.fillStyle = COLORES.hudTenue;
      ctx.fillText(
        `objetos ${objetos.length} · sinergias ${sinergias.length} · enemigos ${restantes}`,
        16,
        62
      );
    }
  };
}

function redondear(valor) {
  return Math.round(valor * 100) / 100;
}
