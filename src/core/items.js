// El código solo interpreta modificadores: los objetos y sus sinergias viven en data/items.json.

export function aplicarModificadores(estadisticas, modificadores = []) {
  const resultado = { ...estadisticas };
  const fijados = {};

  for (const { estadistica, tipo, valor } of modificadores) {
    if (typeof valor !== 'number') {
      throw new Error(`El modificador «${estadistica}» no tiene un valor numérico`);
    }
    const actual = typeof resultado[estadistica] === 'number' ? resultado[estadistica] : 0;

    if (tipo === 'sumar') resultado[estadistica] = actual + valor;
    else if (tipo === 'multiplicativo') resultado[estadistica] = actual * valor;
    else if (tipo === 'fijar') fijados[estadistica] = valor;
    else throw new Error(`Tipo de modificador desconocido: «${tipo}»`);
  }

  // «fijar» se aplica al final para que ningún orden de la lista lo altere.
  return { ...resultado, ...fijados };
}

export function sinergiasActivas(idsObjetos, catalogo = []) {
  return catalogo.filter((sinergia) => sinergia.objetos.every((id) => idsObjetos.includes(id)));
}

export function calcularEstadisticas(base, objetos = [], catalogoSinergias = []) {
  const modificadores = [];
  for (const objeto of objetos) modificadores.push(...(objeto.modificadores ?? []));

  const activas = sinergiasActivas(objetos.map((objeto) => objeto.id), catalogoSinergias);
  for (const sinergia of activas) modificadores.push(...(sinergia.modificadores ?? []));

  return { estadisticas: aplicarModificadores(base, modificadores), sinergias: activas };
}
