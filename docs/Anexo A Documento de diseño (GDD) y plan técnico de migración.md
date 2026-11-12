# Anexo A: Documento de diseño (GDD) y plan técnico de migración

*Proyecto: Abismo Carmesí (título provisional) · Versión 1.0 · Noviembre 2026*

## 1. Controles y movimiento

| Acción | Descripción |
| --- | --- |
| Mover | Izquierda y derecha con aceleración y frenado cortos |
| Saltar | Altura variable: mantener pulsado salta más alto, soltar corta el salto |
| Atacar | Ataque en 4 direcciones (horizontal, arriba, abajo) con el arma equipada |
| Interactuar | Recoger objetos, abrir cofres, elegir en salas del tesoro |
| Pausa | Abre el menú de pausa |

### Parámetros de sensación del salto

Todos los valores se guardan en un archivo de datos, para ajustarlos sin tocar código.

- **Buffer de salto:** si se pulsa saltar poco antes de aterrizar, el salto se ejecuta al tocar el suelo. Valor inicial orientativo: 0,10 s.
- **Coyote time:** se puede saltar durante un instante tras abandonar una plataforma. Valor inicial orientativo: 0,10 s.
- **Gravedad asimétrica:** caída más rápida que la subida para un salto firme.
- **Corte de salto:** al soltar el botón en ascenso se reduce la velocidad vertical.
- **Velocidad máxima de caída** limitada para mantener el control.

## 2. Combate

- Daño por contacto y por ataque, con breve invulnerabilidad tras recibir un golpe.
- Retroceso configurable por arma.
- Ataque hacia abajo en el aire que rebota sobre enemigos y pinchos (pogo).
- Salud del héroe en unidades discretas (corazones o máscaras), recuperable con objetos.

### Perfil de arma (datos)

| Campo | Significado |
| --- | --- |
| id | Identificador único |
| daño | Daño por impacto |
| cadencia | Tiempo entre ataques |
| alcance | Distancia o tamaño del área |
| retroceso | Empuje al enemigo y al héroe |
| rompeEstructuras | Nivel de destrucción que puede aplicar |
| etiquetas | Para sinergias con objetos |

## 3. Enemigos del prototipo

Todos se representan con un punto rojo; se diferencian por comportamiento.

| Enemigo | Comportamiento | Función de diseño |
| --- | --- | --- |
| Patrullero | Camina de lado a lado sobre una plataforma | Enseñar el combate básico |
| Perseguidor | Persigue al héroe al detectarlo | Presión y movimiento |
| Volador | Se mueve en el aire con trayectoria sinusoidal | Obliga a atacar hacia arriba |
| Tirador | Dispara proyectiles desde distancia | Obliga a usar cobertura y movimiento |

## 4. Salas y generación

### Tipos de sala

- **Inicio:** punto de aparición, sin enemigos.
- **Combate:** enemigos y plataformas, puertas que se abren al terminar o libres según la variante.
- **Tesoro:** contiene objetos coleccionables; los objetos no aparecen como recompensa de limpiar salas.
- **Estructura especial:** sala con mecánica propia (por ejemplo, muros destruibles que ocultan un atajo).
- **Final:** salida del mapa del prototipo.

### Algoritmo propuesto

1. Elegir el tamaño del mapa (pequeño por ahora) y la semilla.
2. Colocar la sala de inicio en la cuadrícula.
3. Expandir salas conectadas por puertas compatibles hasta alcanzar el número objetivo.
4. Asignar el tipo de cada sala, garantizando una de tesoro y una final alejada del inicio.
5. Aplicar estructuras modificadoras a las salas de combate.
6. Validar: todas las salas accesibles, ningún salto imposible, puertas coherentes.
7. Si falla la validación, repetir con una semilla derivada.

### Formato de sala predefinida

Cada sala es un archivo de datos con tamaño, matriz de tiles o rectángulos sólidos, lista de puertas con posición y lado, puntos de aparición de enemigos y etiquetas (tipo, dificultad).

## 5. Estructuras destruibles

| Estructura | Resistencia | Efecto al destruirse |
| --- | --- | --- |
| Muro frágil | Baja | Abre un paso o un atajo |
| Pilar | Media | Libera una plataforma o cae como hazard |
| Barril explosivo | Baja | Daño en área a enemigos y al héroe |
| Bloque reforzado | Alta | Solo lo rompe el arma pesada o la Piedra sísmica |
| Tarro de botín | Muy baja | Suelta monedas o recursos |

La resistencia se compara con el nivel de destrucción del arma, así los objetos y armas cambian el alcance del héroe sobre el mundo.

## 6. Sistema de objetos y sinergias

Cada objeto declara **etiquetas** y un conjunto de **modificadores**. El sistema de sinergias evalúa las combinaciones al recoger un objeto.

- Regla simple: dos objetos con una etiqueta compartida activan un bonus.
- Reglas explícitas: pares concretos (por ejemplo, Alas de ceniza + Piedra sísmica) con efecto especial.
- Todo se define en datos; el código solo interpreta modificadores.

Buenas prácticas de equilibrado: ningún objeto debe ser obligatorio, y las sinergias más poderosas exigen decisiones o riesgo.

## 7. Interfaz y flujo

- **Menú principal:** Jugar, Opciones, Salir.
- **HUD mínimo:** salud, recursos y objetos recogidos.
- **Pausa:** continuar, opciones, volver al menú.
- **Pantalla de muerte:** resumen de la run (salas, objetos, tiempo) y reinicio rápido.

## 8. Arquitectura técnica

### Capas

1. **Núcleo de juego (puro):** reglas, estado, combate, objetos, sinergias, generador. Sin dependencias del motor.
2. **Servicios:** física y colisiones, entrada, tiempo, aleatoriedad con semilla.
3. **Presentación:** dibujo, cámara, interfaz, sonido.
4. **Datos:** armas, objetos, salas, enemigos y parámetros en archivos externos.

### Correspondencia con Unity

| Concepto del prototipo | Equivalente en Unity |
| --- | --- |
| Perfil de arma u objeto (datos) | ScriptableObject |
| Sala predefinida | Prefab o Tilemap |
| Enemigo | Prefab con componentes |
| Entrada abstracta | Input System con acciones |
| Colisiones propias | Collider2D y Rigidbody2D, o controlador cinemático propio |
| Menú | UI Toolkit o uGUI |
| Generador de salas | Script en C# que instancia prefabs con semilla |

### Plan de migración

1. Congelar el prototipo y etiquetar la versión en Git.
2. Crear el proyecto en el motor destino con la misma estructura de carpetas.
3. Portar primero los **datos** y el **núcleo** (lógica pura), con pruebas que comparen resultados.
4. Reescribir la capa de presentación con los recursos del motor.
5. Recrear el controlador del jugador y ajustar el salto hasta igualar la sensación del prototipo.
6. Reconstruir el generador de salas con prefabs y validar con las mismas semillas.
7. Pruebas de regresión y comparación de rendimiento.

## 9. Backlog priorizado (MoSCoW)

| Prioridad | Elementos |
| --- | --- |
| Debe | Movimiento, 3 armas, 4 enemigos, generador, 10 objetos, salas del tesoro, destruibles, menú |
| Debería | Pantalla de resumen de run, semillas compartibles, opciones de control |
| Podría | Mini mapa, un jefe sencillo, guardado de récords |
| No por ahora | Arte final, música, narrativa, multijugador |

## 10. Registro de riesgos técnicos

| Riesgo | Mitigación |
| --- | --- |
| Colisiones inestables a alta velocidad | Movimiento por ejes separados y límite de velocidad |
| Salas que bloquean al jugador | Validador de conectividad y de saltos |
| Sinergias que rompen el equilibrio | Pruebas por pares y topes de multiplicadores |
| Dependencia del motor actual | Mantener el núcleo sin referencias al motor |
| Explosión de contenido | Plantillas de datos y herramientas de validación |
