function indexar(elementos = []) {
  return Object.fromEntries(elementos.map((elemento) => [elemento.id, elemento]));
}

/**
 * Une los archivos de datos en un único objeto con índices por id,
 * para que el núcleo no tenga que recorrer listas ni conocer el formato externo.
 */
export function prepararDatos({ player, weapons, items, enemies, rooms }) {
  const armas = weapons.armas;
  const objetos = items.objetos;
  const enemigos = enemies.tipos;
  const salas = rooms.salas;

  return {
    tileSize: rooms.tileSize,
    parametros: player.parametros,
    armas,
    objetos,
    sinergias: items.sinergias,
    enemigos,
    salas,
    porId: {
      arma: indexar(armas),
      objeto: indexar(objetos),
      enemigo: indexar(enemigos),
      sala: indexar(salas)
    }
  };
}
