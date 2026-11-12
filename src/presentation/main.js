import { prepararDatos } from '../core/datos.js';
import { crearJuego, actualizarJuego } from '../core/game.js';
import { cargarDatos } from '../services/data.js';
import { crearEntrada } from '../services/input.js';
import { crearRenderizador } from './render.js';

const SALA_INICIAL = 'combate1';
const MENSAJE_MENU = 'Elige un arma para empezar la run.';

const canvas = document.getElementById('juego');
const menu = document.getElementById('menu');
const listaArmas = document.getElementById('armas');
const estado = document.getElementById('estado');

let datos = null;
let renderizador = null;
let juego = null;
let entrada = null;
let animacion = null;
let ultimoTiempo = 0;

function describirArma(arma) {
  return `${arma.tipo} · daño ${arma.dano} · cadencia ${arma.cadencia} s`;
}

async function iniciar() {
  try {
    datos = prepararDatos(await cargarDatos());
  } catch (error) {
    estado.textContent = `No se pudieron cargar los datos: ${error.message}`;
    return;
  }

  renderizador = crearRenderizador(canvas);
  listaArmas.replaceChildren(
    ...datos.armas.map((arma) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'arma';
      boton.innerHTML = `<strong>${arma.nombre}</strong><span>${describirArma(arma)}</span>`;
      boton.addEventListener('click', () => jugar(arma.id));
      return boton;
    })
  );

  estado.textContent = MENSAJE_MENU;
}

function jugar(armaId) {
  juego = crearJuego({ datos, armaId, salaId: SALA_INICIAL });

  entrada?.destruir();
  entrada = crearEntrada();
  menu.hidden = true;
  estado.textContent = `Run con ${juego.arma.nombre}.`;

  ultimoTiempo = performance.now();
  if (animacion !== null) cancelAnimationFrame(animacion);
  animacion = requestAnimationFrame(bucle);
}

function bucle(tiempo) {
  const dt = Math.min((tiempo - ultimoTiempo) / 1000, 1 / 30);
  ultimoTiempo = tiempo;

  actualizarJuego(juego, dt, entrada.leer());
  renderizador.dibujar(juego);

  animacion = requestAnimationFrame(bucle);
}

function volverAlMenu() {
  if (animacion !== null) cancelAnimationFrame(animacion);
  animacion = null;
  entrada?.destruir();
  entrada = null;
  juego = null;
  menu.hidden = false;
  estado.textContent = MENSAJE_MENU;
}

window.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && juego) volverAlMenu();
});

iniciar();
