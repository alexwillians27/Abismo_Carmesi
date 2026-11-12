// Capa de presentación: en el prototipo es un canvas 2D; en Unity serían sprites
// sin cambiar nada del núcleo.

const COLORES = {
  fondo: '#0b0b0f',
  margen: '#2b2b38',
  muro: '#191922',
  plataforma: '#21212c',
  borde: '#33334a',
  puerta: '#d8a24a',
  enemigo: '#e04a4a',
  heroe: '#4a94ff',
  halo: 'rgba(74, 148, 255, 0.18)',
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

  return {
    dibujar(juego) {
      const { mundo, jugador, arma, objetos, sinergias } = juego;
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

      // Enemigos: puntos rojos.
      for (const enemigo of mundo.enemigos) circulo(enemigo.x, enemigo.y, 6, COLORES.enemigo);

      // Héroe: punto azul.
      const centroX = jugador.caja.x + jugador.caja.w / 2;
      const centroY = jugador.caja.y + jugador.caja.h / 2;
      circulo(centroX, centroY, 16, COLORES.halo);
      circulo(centroX, centroY, 7, COLORES.heroe);

      // HUD mínimo: arma y build.
      ctx.fillStyle = COLORES.hudFondo;
      ctx.fillRect(8, 8, 244, 46);
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillStyle = COLORES.hudTexto;
      ctx.fillText(
        `${arma.nombre} · daño ${redondear(arma.dano)} · cadencia ${redondear(arma.cadencia)} s`,
        16,
        25
      );
      ctx.fillStyle = COLORES.hudTenue;
      ctx.fillText(`objetos ${objetos.length} · sinergias ${sinergias.length}`, 16, 43);
    }
  };
}

function redondear(valor) {
  return Math.round(valor * 100) / 100;
}
