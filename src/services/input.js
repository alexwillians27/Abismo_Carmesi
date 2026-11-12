// Entrada abstracta: el núcleo solo ve { ejeX, saltoPulsado, saltoMantenido },
// así que al migrar solo se cambia este archivo por el Input System del motor.

const IZQUIERDA = ['ArrowLeft', 'a', 'A'];
const DERECHA = ['ArrowRight', 'd', 'D'];
const SALTO = ['Space', 'w', 'W', 'ArrowUp', 'z', 'Z'];

export function crearEntrada(objetivo = window) {
  const estado = { izquierda: false, derecha: false, salto: false, saltoPulsado: false };

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
    if (SALTO.includes(evento.key)) {
      estado.salto = true;
      estado.saltoPulsado = true;
      evento.preventDefault();
    }
  };

  const alSoltar = (evento) => {
    if (IZQUIERDA.includes(evento.key)) estado.izquierda = false;
    if (DERECHA.includes(evento.key)) estado.derecha = false;
    if (SALTO.includes(evento.key)) estado.salto = false;
  };

  const alPerderFoco = () => {
    estado.izquierda = false;
    estado.derecha = false;
    estado.salto = false;
  };

  objetivo.addEventListener('keydown', alPulsar);
  objetivo.addEventListener('keyup', alSoltar);
  objetivo.addEventListener('blur', alPerderFoco);

  return {
    /** Devuelve el estado de este fotograma; la pulsación de salto se consume una sola vez. */
    leer() {
      const entrada = {
        ejeX: (estado.derecha ? 1 : 0) - (estado.izquierda ? 1 : 0),
        saltoPulsado: estado.saltoPulsado,
        saltoMantenido: estado.salto
      };
      estado.saltoPulsado = false;
      return entrada;
    },
    destruir() {
      objetivo.removeEventListener('keydown', alPulsar);
      objetivo.removeEventListener('keyup', alSoltar);
      objetivo.removeEventListener('blur', alPerderFoco);
    }
  };
}
