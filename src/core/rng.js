// Aleatoriedad con semilla: la misma semilla da siempre la misma secuencia.
// Sirve para reproducir errores y compartir runs (Anexo A, apartado 8).

export function crearAleatorio(semilla = 1) {
  let estado = Number(semilla) >>> 0;
  if (estado === 0) estado = 0x9e3779b9;

  return function aleatorio() {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function enteroEntre(aleatorio, minimo, maximo) {
  return minimo + Math.floor(aleatorio() * (maximo - minimo + 1));
}

export function elegir(aleatorio, elementos) {
  return elementos[Math.floor(aleatorio() * elementos.length)];
}
