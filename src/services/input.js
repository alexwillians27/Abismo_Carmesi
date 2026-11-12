// Entrada abstracta: el núcleo solo ve { ejeX, ejeY, saltoPulsado, saltoMantenido, ataquePulsado },
// así que al migrar solo se cambia este archivo por el Input System del motor.

const IZQUIERDA = ['ArrowLeft', 'a', 'A'];
const DERECHA = ['ArrowRight', 'd', 'D'];
const ARRIBA = ['ArrowUp'];
const ABAJO = ['ArrowDown', 's', 'S'];
const SALTO = ['Space', 'w', 'W', 'z', 'Z'];
const ATAQUE = ['j', 'J', 'x', 'X'];

export function crearEntrada(objetivo = window) {
  const estado = {
    izquierda: false,
    derecha: false,
    arriba: false,
    abajo: false,
    salto: false,
    saltoPulsado: false,
    ataquePulsado: false
  };

  const alPulsar = (evento) => {
    if (evento.repeat) return;
    if (IZQUIERDA.includes(evento.key)) {
      estado.izquierda = true;
      evento.preventDefault();
    }
    if (DERECHA.includes(evento.key)) {
      estado.derecha = true;
      evento.preventDefault();
    }
    if (ARRIBA.includes(evento.key)) {
      estado.arriba = true;
      evento.preventDefault();
    }
    if (ABAJO.includes(evento.key)) {
      estado.abajo = true;
      evento.preventDefault();
    }
    if (SALTO.includes(evento.key)) {
      estado.salto = true;
      estado.saltoPulsado = true;
      evento.preventDefault();
    }
    if (ATAQUE.includes(evento.key)) {
      estado.ataquePulsado = true;
      evento.preventDefault();
    }
  };

  const alSoltar = (evento) => {
    if (IZQUIERDA.includes(evento.key)) estado.izquierda = false;
    if (DERECHA.includes(evento.key)) estado.derecha = false;
    if (ARRIBA.includes(evento.key)) estado.arriba = false;
    if (ABAJO.includes(evento.key)) estado.abajo = false;
    if (SALTO.includes(evento.key)) estado.salto = false;
  };

  const alPerderFoco = () => {
    estado.izquierda = false;
    estado.derecha = false;
    estado.arriba = false;
    estado.abajo = false;
    estado.salto = false;
  };

  objetivo.addEventListener('keydown', alPulsar);
  objetivo.addEventListener('keyup', alSoltar);
  objetivo.addEventListener('blur', alPerderFoco);

  return {
    /** Estado de este fotograma; las pulsaciones de salto y ataque se consumen una vez. */
    leer() {
      const entrada = {
        ejeX: (estado.derecha ? 1 : 0) - (estado.izquierda ? 1 : 0),
        ejeY: (estado.abajo ? 1 : 0) - (estado.arriba ? 1 : 0),
        saltoPulsado: estado.saltoPulsado,
        saltoMantenido: estado.salto,
        ataquePulsado: estado.ataquePulsado
      };
      estado.saltoPulsado = false;
      estado.ataquePulsado = false;
      return entrada;
    },
    destruir() {
      objetivo.removeEventListener('keydown', alPulsar);
      objetivo.removeEventListener('keyup', alSoltar);
      objetivo.removeEventListener('blur', alPerderFoco);
    }
  };
}
