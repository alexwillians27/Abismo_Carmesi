// Servidor estático sin dependencias: los módulos ES y fetch() no funcionan
// abriendo index.html con file://, así que hace falta HTTP.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const raiz = process.cwd();
const puerto = Number(process.env.PORT ?? 5173);

createServer(async (peticion, respuesta) => {
  const ruta = decodeURIComponent(new URL(peticion.url, 'http://localhost').pathname);
  const archivo = normalize(join(raiz, ruta === '/' ? 'index.html' : ruta.slice(1)));

  if (!archivo.startsWith(raiz + sep)) {
    respuesta.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Prohibido');
    return;
  }

  try {
    const contenido = await readFile(archivo);
    respuesta
      .writeHead(200, {
        'Content-Type': TIPOS[extname(archivo)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store'
      })
      .end(contenido);
  } catch {
    respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado');
  }
}).listen(puerto, () => {
  console.log(`Abismo Carmesí en http://localhost:${puerto}`);
});
