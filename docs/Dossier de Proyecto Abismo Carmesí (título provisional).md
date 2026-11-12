# Dossier de Proyecto: Abismo Carmesí (título provisional)

*Juego 2D de plataformas con estructura roguelite, inspirado en Hollow Knight y The Binding of Isaac*

Versión 1.0 · Noviembre 2026 · Documento vivo, revisable en cada hito

## Índice

1. Guía del proyecto
2. Acta de constitución
3. Análisis del sector
4. Propuesta de proyecto
5. Documentos anexos recomendados

---

## 1. Guía del proyecto

### 1.1 Resumen ejecutivo

Abismo Carmesí es un juego 2D de plataformas y acción en el que el jugador explora, en cada partida (run), un laberinto subterráneo generado a partir de salas predefinidas. Combina dos tradiciones: la **exploración y el combate preciso** de Hollow Knight (movimiento fluido, vista lateral, mundo interconectado) y la **rejugabilidad y las sinergias de objetos** de The Binding of Isaac (runs distintas, salas del tesoro, construcciones de build).

El proyecto parte de un prototipo deliberadamente sin arte: el héroe es un punto azul, los enemigos son puntos rojos y el escenario se representa solo con líneas de margen. El objetivo del prototipo es validar **sensación de juego y sistemas**, no estética.

### 1.2 Pilares de diseño

- **Movimiento que se siente bien.** El salto debe ser fluido, permisivo y natural: se puede saltar justo al tocar el suelo (buffer de salto), y unos instantes después de dejar una plataforma (coyote time).
- **Cada run cuenta una historia distinta.** Salas predefinidas combinadas por un generador, con estructuras que modifican el escenario, hacen que ninguna partida se repita.
- **Los objetos importan por cómo se combinan.** Diez objetos coleccionables con sinergias entre sí; el valor está en las combinaciones, no en los números sueltos.
- **El mundo responde.** Estructuras destruibles que abren caminos, esconden secretos o cambian el combate.
- **Prototipo primero, pulido después.** Todo sistema debe poder probarse con formas geométricas y migrarse a un motor profesional sin reescribirlo.

### 1.3 Bucle de juego (core loop)

1. Empezar la run y elegir una de las 3 armas básicas.
2. Explorar salas, combatir enemigos y superar tramos de plataformas.
3. Destruir estructuras para abrir atajos o encontrar recursos.
4. Localizar **salas del tesoro** (los objetos no aparecen al limpiar salas de combate) y escoger objetos.
5. Combinar objetos y arma para formar una build con sinergias.
6. Superar el mapa pequeño del prototipo, o morir y reiniciar con una run nueva.

### 1.4 Alcance del prototipo (MVP)

| Sistema | Requisito del prototipo |
| --- | --- |
| Vista y movimiento | Plataformas lateral; salto fluido con buffer de salto y coyote time |
| Armas | Mínimo 3 armas básicas con comportamiento diferenciado |
| Objetos | 10 objetos recolectables con sinergias entre ellos |
| Mapa | Pequeño pero ampliable; generado a partir de salas predefinidas |
| Salas | Combate, tesoro, y estructuras que modifican el escenario |
| Entorno | Varias estructuras destruibles |
| Estética | Héroe punto azul, enemigos punto rojo, escenario con líneas de margen |
| Interfaz | Menú sencillo |
| Arquitectura | Código separado en capas para migrar más adelante a Unity u otro motor |

### 1.5 Armas iniciales (propuesta de diseño)

- **Arma cuerpo a cuerpo (espada/garra):** ataque corto, rápido y fiable; golpe hacia arriba y hacia abajo (pogo sobre enemigos, al estilo Hollow Knight).
- **Arma a distancia (proyectil):** daño menor, alcance largo, cadencia estilo Isaac, sin necesidad de acercarse.
- **Arma de área/pesada (martillo o carga):** lenta, daño alto, rompe estructuras con facilidad.

Cada arma se interpreta como un perfil de datos (daño, cadencia, alcance, retroceso, capacidad de destruir estructuras), de modo que añadir armas sea cuestión de datos y no de código.

### 1.6 Los 10 objetos y sus sinergias (propuesta inicial)

Cada objeto lleva una etiqueta de efecto; las sinergias aparecen cuando dos objetos comparten o refuerzan etiquetas.

| # | Objeto | Efecto | Etiquetas |
| --- | --- | --- | --- |
| 1 | Botas ligeras | +velocidad de movimiento | movimiento |
| 2 | Alas de ceniza | Doble salto | movimiento, aire |
| 3 | Núcleo ardiente | El daño quema al enemigo | fuego |
| 4 | Lente rota | Los proyectiles atraviesan enemigos | proyectil |
| 5 | Colmillo | Probabilidad de crítico | ofensivo |
| 6 | Escudo de hueso | Absorbe un golpe por sala | defensa |
| 7 | Imán de brasas | Atrae monedas y recursos | utilidad |
| 8 | Eco | Los ataques se repiten con un pequeño retardo | ofensivo, proyectil |
| 9 | Piedra sísmica | Aterrizar con fuerza daña en área y rompe estructuras | aire, destrucción |
| 10 | Reloj oxidado | Reduce el tiempo de recarga de ataques | utilidad, ofensivo |

Sinergias de ejemplo: **Alas de ceniza + Piedra sísmica** (saltar y caer como ataque), **Núcleo ardiente + Eco** (el fuego se propaga con cada repetición), **Lente rota + Eco** (proyectiles múltiples que atraviesan), **Botas ligeras + Reloj oxidado** (estilo de combate veloz).

### 1.7 Generación procedimental de salas

- Biblioteca de **salas predefinidas** diseñadas a mano, con puntos de conexión (puertas) etiquetados por posición.
- El generador coloca salas en una cuadrícula, asegurando que siempre haya camino entre inicio y final, y reserva al menos una sala del tesoro por run.
- Las **estructuras modificadoras** se aplican sobre una sala base (plataformas extra, pinchos, muros destruibles, huecos) para multiplicar variantes sin dibujar salas nuevas.
- Debe existir una **semilla** (seed) para reproducir errores y compartir runs.
- Validación automática: ninguna sala debe quedar inaccesible ni obligar a un salto imposible.

### 1.8 Arquitectura técnica y migración

Objetivo: poder pasar a Unity u otro motor con coste bajo. Principios:

- Separar **lógica de juego** (reglas, generación, objetos, combate) de la **capa de presentación** (dibujo, sonido, input).
- Datos en archivos externos (armas, objetos, salas) en JSON o equivalente, no incrustados en el código.
- Una interfaz de entrada abstracta (acciones: mover, saltar, atacar) independiente del dispositivo.
- Física y colisiones encapsuladas tras una capa propia, para sustituirla por la del motor destino.
- Convenciones de nombres y estructura que mapeen bien a escenas, prefabs y ScriptableObjects de Unity.

---

## 2. Acta de constitución del proyecto

| Campo | Contenido |
| --- | --- |
| Nombre del proyecto | Abismo Carmesí (título provisional) |
| Tipo | Videojuego 2D de plataformas con estructura roguelite |
| Patrocinador / promotor | Alex (autor y propietario del proyecto) |
| Director de proyecto | Alex |
| Fecha de inicio | Noviembre 2026 |
| Fase actual | Prototipo (pre-producción) |
| Plataforma objetivo del prototipo | PC |
| Plataforma objetivo futura | PC mediante motor profesional (Unity u otro); consolas y otras plataformas como opción posterior |

### 2.1 Justificación

La combinación de plataformas de exploración y roguelite tiene una comunidad activa y referentes de éxito. El proyecto nace como ejercicio profesional de diseño y desarrollo, con la ambición de crecer desde un prototipo técnico hasta una producción más cuidada. Para quien lo desarrolla, supone además una pieza de portfolio sólida que integra diseño de sistemas, programación y arquitectura.

### 2.2 Objetivos del proyecto

**Objetivo general:** construir un prototipo jugable que valide la fusión de exploración con plataformas e incremento de poder por sinergias, y que sirva de base escalable a una versión profesional.

**Objetivos específicos (SMART):**

1. Entregar un prototipo jugable con movimiento fluido, 3 armas, 10 objetos y generación de salas.
2. Conseguir que una run completa dure entre 10 y 20 minutos en el mapa pequeño.
3. Lograr que al menos 2 de cada 3 jugadores de prueba encuentren una sinergia sin ayuda.
4. Dejar el código estructurado para migrar a un motor profesional sin reescribir la lógica.
5. Documentar el diseño de modo que un tercero pueda continuar el trabajo.

### 2.3 Alcance

**Incluye:** movimiento y salto, combate con 3 armas, enemigos básicos, 10 objetos con sinergias, salas del tesoro, estructuras destruibles, generador de salas, menú simple, arquitectura preparada para migración.

**No incluye (por ahora):** arte final, animaciones, música y efectos de sonido definitivos, jefes elaborados, narrativa, multijugador, sistema de guardado complejo, localización.

### 2.4 Entregables principales

- Prototipo jugable (build ejecutable).
- Código fuente documentado.
- Documento de diseño de juego (GDD) y esta documentación de proyecto.
- Biblioteca de salas predefinidas.
- Informe de pruebas de jugabilidad.

### 2.5 Hitos y calendario orientativo

| Hito | Contenido | Duración estimada |
| --- | --- | --- |
| H1 | Movimiento, salto fluido, cámara y colisiones | 2 semanas |
| H2 | Combate y las 3 armas, enemigos básicos | 2 semanas |
| H3 | Generador de salas y estructuras | 3 semanas |
| H4 | Objetos, salas del tesoro y sinergias | 3 semanas |
| H5 | Estructuras destruibles y equilibrado | 2 semanas |
| H6 | Menú, pruebas con jugadores y cierre del prototipo | 2 semanas |

Duración total estimada: 14 semanas, a tiempo parcial, ajustables a la disponibilidad real.

### 2.6 Presupuesto y recursos

Proyecto de bajo coste: se estima trabajo propio y herramientas gratuitas o con licencia personal. El coste principal es tiempo. Si se pasa a producción profesional, habría que presupuestar arte, audio y licencias del motor.

### 2.7 Riesgos de alto nivel

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| Ampliar el alcance sin control (scope creep) | Alta | Alto | Congelar el MVP; las ideas nuevas van a un backlog |
| Generación de salas produce niveles imposibles | Media | Alto | Validador automático y semillas reproducibles |
| El salto no se siente bien | Media | Alto | Iterar pronto con buffer, coyote time y pruebas de ajuste |
| Sinergias desequilibradas | Alta | Medio | Datos externos y pruebas frecuentes |
| Migración al motor costosa | Media | Medio | Arquitectura por capas desde el principio |
| Falta de tiempo | Media | Medio | Hitos cortos y entregables mínimos por hito |

### 2.8 Criterios de éxito

- El prototipo es jugable de principio a fin sin errores bloqueantes.
- Los jugadores de prueba afirman que el movimiento "se siente bien".
- Cada run es perceptiblemente distinta.
- Las sinergias se descubren y se disfrutan.
- El código puede migrarse por módulos al motor elegido.

### 2.8 Aprobación

Proyecto aprobado por el promotor para comenzar la fase de prototipo.

---

## 3. Análisis del sector

*Nota: este análisis es cualitativo, basado en el conocimiento del sector hasta mediados de 2026. Antes de una decisión comercial conviene contrastarlo con datos actuales de Steam, SteamDB y los informes de la industria.*

### 3.1 Contexto de mercado

El videojuego independiente en PC es un mercado muy abierto y muy saturado. Las barreras técnicas de entrada son bajas (motores accesibles, tiendas digitales), por lo que la diferenciación se logra por diseño, identidad visual y comunidad, no por tecnología. Dentro de él, los subgéneros **metroidvania** y **roguelite** llevan más de una década entre los más sólidos y con más público fiel, y se han mezclado con frecuencia.

### 3.2 Referentes y competencia directa

| Título | Qué aporta | Lección para nuestro proyecto |
| --- | --- | --- |
| Hollow Knight | Exploración interconectada, combate preciso, atmósfera | El movimiento y el "tacto" del combate son la base |
| The Binding of Isaac | Rejugabilidad por objetos y sinergias, salas del tesoro | La variedad de combinaciones sostiene cientos de horas |
| Dead Cells | Roguelite de plataformas con combate muy fluido | Demuestra que la fusión plataformas + run funciona |
| Rogue Legacy | Plataformas con salas generadas | Antecedente de salas combinadas con progreso entre runs |
| Hades | Roguelite de acción con progreso narrativo | Referente de pulido y de enganche entre runs |
| Noita | Mundo simulado y destructible | Referencia para estructuras destruibles con consecuencias |
| Enter the Gungeon | Armas muy variadas y salas predefinidas | Referente de generación a base de salas hechas a mano |

### 3.3 Público objetivo

- **Principal:** jugadores de PC de 16 a 35 años aficionados a metroidvania y roguelite, que valoran la rejugabilidad, el reto justo y el descubrimiento.
- **Secundario:** aficionados al speedrun y a la optimización de builds, comunidades de streaming y creadores de contenido.

Expectativas habituales de este público: controles precisos, alta capacidad de respuesta, progresión clara, variedad de builds y sensación de que la muerte enseña algo.

### 3.4 Análisis DAFO

|  | Positivo | Negativo |
| --- | --- | --- |
| **Interno** | **Fortalezas:** concepto claro basado en dos referentes probados; diseño por datos; arquitectura pensada para migrar; alcance de prototipo bien acotado | **Debilidades:** equipo unipersonal; sin arte ni audio; sin identidad propia definida todavía; tiempo limitado |
| **Externo** | **Oportunidades:** demanda estable del género; herramientas de desarrollo accesibles; posibilidad de comunidad temprana con demos y festivales | **Amenazas:** mercado muy saturado; comparaciones inevitables con títulos consagrados; expectativas altas de calidad en movimiento y combate |

### 3.5 Propuesta de valor y diferenciación

La mezcla de **exploración estilo metroidvania con runs generadas y sinergias de objetos** es conocida, así que la diferenciación debe venir de:

1. Un **sistema de estructuras destruibles** con consecuencias en la exploración y el combate.
2. **Sinergias entre movimiento y combate** (por ejemplo, objetos que convierten el salto y la caída en ataque).
3. Salas del tesoro con **decisiones de riesgo y recompensa** (elegir entre objetos, no solo recoger).
4. Una **identidad visual propia** en la fase de producción, que hoy aún está por definir.

### 3.6 Modelos de negocio posibles

- Venta directa en PC (Steam, itch.io): lo habitual en el género, con precio contenido.
- Demo gratuita y participación en festivales para generar lista de deseados.
- Acceso anticipado, si hay base de contenido y comunidad suficientes.

Por ahora el proyecto es de aprendizaje y portfolio; la decisión comercial se tomará al terminar el prototipo con resultados de las pruebas.

---

## 4. Propuesta de proyecto

### 4.1 Visión

Crear un juego de plataformas y acción donde cada descenso a un abismo cambiante sea una historia nueva, y donde la habilidad del jugador y la inventiva con las combinaciones de objetos importen tanto como los reflejos.

### 4.2 Estrategia de desarrollo por fases

**Fase 0: Prototipo base (actual).** Formas geométricas, sistemas completos, validar la sensación de juego.

**Fase 1: Vertical slice.** Migración al motor profesional, un bioma con arte provisional pero coherente, un jefe y música básica.

**Fase 2: Producción.** Más biomas, más armas y objetos, progreso entre runs, narrativa ligera, arte y audio definitivos.

**Fase 3: Lanzamiento y soporte.** Demo pública, página en tienda, campaña de comunidad, lanzamiento y parches.

### 4.3 Metodología de trabajo

- Desarrollo **iterativo** con ciclos cortos de 1 a 2 semanas, cada uno con un resultado jugable.
- **Backlog priorizado** con el método MoSCoW (debe, debería, podría, no por ahora).
- Control de versiones con Git, con ramas por funcionalidad y etiquetas por hito.
- Pruebas de jugabilidad al final de cada hito, con registro de observaciones.

### 4.4 Equipo y roles (a escala actual)

| Rol | Responsable hoy | Rol ideal en producción |
| --- | --- | --- |
| Dirección y diseño de juego | Alex | Game designer / director |
| Programación | Alex | Programador de gameplay y herramientas |
| Arte | Pendiente (formas geométricas) | Artista 2D y animador |
| Audio | Pendiente | Diseñador de sonido y compositor |
| Pruebas | Alex y personas de confianza | Testers externos y comunidad |

### 4.5 Plan de pruebas

- **Pruebas internas** por hito (funcionamiento y errores).
- **Pruebas de sensación**: comparar parámetros de salto y combate hasta lograr un tacto agradable.
- **Pruebas con jugadores** (5 a 10 personas): observar sin ayudar, anotar dónde se atascan y qué sinergias descubren.
- **Métricas del prototipo:** duración media de la run, tasa de muerte por sala, objetos más elegidos, sinergias descubiertas.

### 4.6 Indicadores de seguimiento (KPI)

| Indicador | Meta del prototipo |
| --- | --- |
| Duración media de una run | 10 a 20 minutos |
| Jugadores que terminan una run | Al menos 40 % |
| Jugadores que descubren una sinergia | Al menos 66 % |
| Errores bloqueantes abiertos | 0 al cierre |
| Valoración del "tacto" del movimiento (1 a 5) | 4 o más |

### 4.7 Evolución hacia un producto profesional

1. Elegir motor (Unity es la opción prevista) y migrar la lógica por módulos.
2. Definir la dirección artística: paleta, silueta del héroe y de los enemigos, tono.
3. Añadir jefes, biomas y progreso entre runs.
4. Preparar la comunicación: nombre definitivo, logotipo, tráiler y página en tienda.

### 4.8 Próximos pasos inmediatos

1. Congelar el alcance del MVP descrito en este documento.
2. Pulir el salto (buffer y coyote time) y validarlo con 3 personas.
3. Terminar el generador de salas con validación de conectividad.
4. Implementar los 10 objetos con sus etiquetas y las sinergias de la tabla.
5. Elaborar la biblioteca inicial de salas (mínimo 15 de combate, 3 de tesoro, 2 de inicio y fin).

---

## 5. Documentos anexos recomendados

Para completar el expediente profesional se recomienda elaborar:

- **Documento de diseño de juego (GDD)** con mecánicas, enemigos, objetos y niveles al detalle.
- **Documento técnico y plan de migración** a Unity.
- **Registro de riesgos** vivo y **backlog** priorizado.
- **Guía de estilo visual y de audio**, cuando se pase a producción.
- **Plan de pruebas y plantillas de informe** de jugabilidad.

El primer anexo (GDD y plan técnico) se ofrece a continuación como documento independiente.
