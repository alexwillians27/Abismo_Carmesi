// Física y colisiones encapsuladas: si se migra a Unity, esta capa se sustituye
// por Collider2D/Rigidbody2D sin tocar el resto del juego.

export function solapan(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * Mueve una caja contra una lista de sólidos resolviendo un eje cada vez,
 * para que la velocidad alta no atraviese paredes (riesgo del Anexo A, 10).
 * Devuelve la caja resultante y los contactos del movimiento.
 */
export function moverConColisiones(caja, dx, dy, solidos) {
  const resultado = { x: caja.x, y: caja.y, w: caja.w, h: caja.h };
  const contacto = { suelo: false, techo: false, izquierda: false, derecha: false };

  resultado.x += dx;
  for (const solido of solidos) {
    if (!solapan(resultado, solido)) continue;
    if (dx > 0) {
      resultado.x = solido.x - resultado.w;
      contacto.derecha = true;
    } else if (dx < 0) {
      resultado.x = solido.x + solido.w;
      contacto.izquierda = true;
    }
  }

  resultado.y += dy;
  for (const solido of solidos) {
    if (!solapan(resultado, solido)) continue;
    if (dy > 0) {
      resultado.y = solido.y - resultado.h;
      contacto.suelo = true;
    } else if (dy < 0) {
      resultado.y = solido.y + solido.h;
      contacto.techo = true;
    }
  }

  return { caja: resultado, contacto };
}
