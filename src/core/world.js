const MURO = '#';
const PLATAFORMA = '=';
const INICIO = 'S';
const PUERTA = 'D';
const ENEMIGOS = '1234';
const VACIO = '.';

function ladoDe(tx, ty, ancho, alto) {
  if (ty === 0) return 'arriba';
  if (ty === alto - 1) return 'abajo';
  if (tx === 0) return 'izquierda';
  if (tx === ancho - 1) return 'derecha';
  return 'interna';
}

/**
 * Construye el mundo de una sala predefinida. No conoce el dibujo ni la entrada:
 * solo geometría y entidades, para poder probarlo sin pantalla.
 */
export function crearMundo(sala, datos) {
  if (!sala) throw new Error('Falta la sala que construir');

  const { tileSize } = datos;
  const filas = sala.filas;
  const alto = filas.length;
  const ancho = filas[0]?.length ?? 0;

  const solidos = [];
  const enemigos = [];
  const puertas = [];
  let spawn = null;

  filas.forEach((fila, ty) => {
    if (fila.length !== ancho) {
      throw new Error(`La sala ${sala.id} tiene filas de distinto ancho`);
    }
    for (let tx = 0; tx < ancho; tx++) {
      const simbolo = fila[tx];
      const x = tx * tileSize;
      const y = ty * tileSize;

      if (simbolo === MURO || simbolo === PLATAFORMA) {
        solidos.push({
          x,
          y,
          w: tileSize,
          h: tileSize,
          tipo: simbolo === MURO ? 'muro' : 'plataforma'
        });
      } else if (simbolo === INICIO) {
        spawn = { x: x + tileSize / 2, y: y + tileSize };
      } else if (simbolo === PUERTA) {
        puertas.push({ x, y, lado: ladoDe(tx, ty, ancho, alto) });
      } else if (ENEMIGOS.includes(simbolo)) {
        const tipo = datos.enemigos[Number(simbolo) - 1];
        if (!tipo) {
          throw new Error(`La sala ${sala.id} usa el enemigo «${simbolo}» y no está definido`);
        }
        enemigos.push({ x: x + tileSize / 2, y: y + tileSize / 2, tipo: tipo.id });
      } else if (simbolo !== VACIO) {
        throw new Error(`Símbolo desconocido «${simbolo}» en la sala ${sala.id} (${tx}, ${ty})`);
      }
    }
  });

  if (!spawn) throw new Error(`La sala ${sala.id} no tiene punto de inicio (S)`);

  return {
    id: sala.id,
    tipo: sala.tipo,
    tileSize,
    ancho,
    alto,
    anchoPx: ancho * tileSize,
    altoPx: alto * tileSize,
    filas,
    solidos,
    enemigos,
    puertas,
    spawn
  };
}
