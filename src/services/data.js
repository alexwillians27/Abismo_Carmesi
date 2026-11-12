const ARCHIVOS = ['player.json', 'weapons.json', 'items.json', 'enemies.json', 'rooms.json'];

/** Carga los archivos de data/ y los deja tal cual, sin interpretarlos. */
export async function cargarDatos(base = 'data/') {
  const respuestas = await Promise.all(
    ARCHIVOS.map((archivo) => fetch(new URL(base + archivo, document.baseURI)))
  );

  for (const respuesta of respuestas) {
    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar ${respuesta.url} (${respuesta.status})`);
    }
  }

  const [player, weapons, items, enemies, rooms] = await Promise.all(
    respuestas.map((respuesta) => respuesta.json())
  );

  return { player, weapons, items, enemies, rooms };
}
