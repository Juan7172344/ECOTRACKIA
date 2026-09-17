# Bitácora de Vibe Coding — MVP "EcoTrack AI"

**Proyecto Integrador Capstone · De la Idea a la Realidad con Vibe Coding**
Producto vivo: `https://claude.ai/artifact/DcHQuPsKNiQ1DnebsUxxhP`

---

## 1. Definición del "vibe"

**Quién es el usuario.** Doña Marta, dueña de una tienda con tres motos de domicilio en Bogotá. No sabe qué es un "alcance 2" ni quiere saberlo. Tiene dos minutos entre cliente y cliente.

**La personalidad de la app.** Un contador amable, no un dashboard corporativo. Nunca regaña, nunca muestra una cifra sin explicar de dónde salió, y siempre termina con una sola cosa que se puede hacer mañana. Si el texto es ambiguo, asume un promedio **y lo dice en voz alta** en vez de pedir otro dato.

**El flujo.** Una sola pantalla, tres momentos:

```
escribes tu día  →  aparece el recibo de carbono  →  queda en la bitácora
```

**La estética.** No SaaS azul. Verde musgo y papel reciclado, tipografía Bricolage Grotesque para los titulares (ancha, un poco terca) e IBM Plex Sans/Mono para los datos, porque los números deben leerse como números. El resultado se presenta como un **recibo**: total arriba, desglose línea por línea abajo. Es la metáfora que el dueño de un negocio ya entiende.

---

## 2. Master Prompt inicial

> Construye el MVP de **EcoTrack AI**, una app web de una sola página para que dueños de negocios pequeños en Colombia calculen su huella de carbono escribiendo en lenguaje natural lo que hicieron en el día.
>
> **Flujo:** un campo de texto grande, tres ejemplos con un clic, y un botón "Calcular huella". Al enviar, una IA interpreta el texto y extrae consumos medibles; la app calcula y muestra un "recibo de carbono": total en kg CO₂e, una equivalencia comprensible (km en camioneta, árboles al año), una barra apilada por categoría, una tabla con actividad / cantidad / factor / kg, y una sola recomendación accionable.
>
> **Arquitectura que quiero:** la IA **solo extrae y estructura**; la aritmética la hace el navegador con una tabla fija de factores de emisión. El número nunca puede depender de que el modelo calcule bien.
>
> **Categorías:** electricidad (kWh), gasolina (L), diésel (L), gas natural (m³), transporte_km, domicilios_km, agua (m³), residuos (kg), papel (kg).
>
> **Estética:** minimalista, verde musgo sobre papel reciclado, sin tarjetas genéricas ni gradientes; una sola animación al revelar el resultado.
>
> **No negociable:** debe funcionar aunque la IA no responda (intérprete local de respaldo con expresiones regulares), respetar `prefers-reduced-motion` y modo oscuro, y guardar el historial en el navegador con `try/catch`.

**Por qué este prompt funciona:** define usuario, flujo, arquitectura, contrato de datos y restricciones **antes** de pedir una sola línea de código. Los tres primeros párrafos son producto; el último es ingeniería defensiva. Un prompt que solo dice "hazme una calculadora de huella de carbono bonita" produce diez pantallas genéricas y ninguna decisión.

---

## 3. Prompts de iteración

| # | Prompt en lenguaje natural | Qué cambió |
|---|---|---|
| 1 | *"El hero abre con un número gigante y no hay ningún número todavía. Haz que el héroe sea el campo de texto en sí: el usuario debe entender en dos segundos que aquí se escribe."* | Se eliminó la sección de estadísticas falsas; el `<textarea>` subió arriba del pliegue con borde de 1.5px y esquina superior izquierda recta (forma de globo de conversación). |
| 2 | *"Minimalista y en tonos verdes, pero no el verde neón de startup. Verde musgo, papel reciclado, y que la barra por categoría use colores que se distingan sin depender solo del color."* | Paleta en tokens CSS (`--moss #3A6B45`, `--paper #F1F3EC`) + leyenda textual junto a la barra apilada, para daltónicos. |
| 3 | *"Cuando la IA asume algo, quiero que se vea. Debajo de cada línea de la tabla, si hubo un supuesto, muéstralo en gris pequeño."* | Campo `supuesto` añadido al esquema JSON y renderizado como subtexto. Esto es confianza, no decoración. |
| 4 | *"Agrega una bitácora lateral con el acumulado, pero que no rompa nada si el navegador bloquea el almacenamiento."* | `localStorage` envuelto en `try/catch`, con estado vacío que invita a actuar en vez de decir "sin datos". |
| 5 | *"El total dice 47 kg y eso no significa nada para nadie. Tradúcelo."* | Línea de equivalencia: kilómetros en camioneta y árboles-año. |

> **Capturas:** insertar aquí las capturas del estado inicial (v1, tarjetas genéricas), el paso 2 (cambio de paleta) y el resultado final con el recibo desplegado.

---

## 4. La funcionalidad de IA

**Qué hace.** Convierte prosa desordenada en datos estructurados. La entrada *"5 camionetas de reparto que recorrieron 40 km cada una y 200 kWh de luz"* se vuelve:

```json
{
  "items": [
    {"categoria":"transporte_km","cantidad":200,"actividad":"5 camionetas × 40 km","supuesto":""},
    {"categoria":"electricidad","cantidad":200,"actividad":"Consumo del local","supuesto":""}
  ],
  "consejo": "Agrupa las rutas de reparto por zona: menos kilómetros con los mismos pedidos."
}
```

Nota la multiplicación 5 × 40: eso es exactamente lo que un formulario tradicional le pediría al usuario que hiciera a mano.

**La decisión de diseño más importante del proyecto:** la IA **no calcula**. Extrae. La multiplicación por el factor de emisión ocurre en JavaScript contra una tabla fija y auditable. Resultado: las cifras son reproducibles y verificables, y el modelo se usa donde es insustituible (entender lenguaje humano) y no donde es débil (aritmética consistente).

**Degradación elegante.** Si la capacidad de IA no está disponible o falla, un intérprete local con expresiones regulares captura los patrones más comunes y la app sigue entregando un número, avisando que está en "modo local".

---

## 5. Debugging con IA

**El error.** En la primera versión el modelo devolvía a veces ` ```json {...} ``` ` con cercas de markdown, y `JSON.parse` fallaba con `Unexpected token`. Peor: fallaba de forma intermitente, así que la app funcionaba en la demo y se rompía en la tercera prueba.

**Cómo lo resolví sin escribir código a mano.** Le pasé a la IA el error, la entrada que lo provocó y la salida cruda del modelo, y pedí:

> *"Este parseo falla de forma intermitente. No parchees el síntoma con un `.replace` de backticks: dame una estrategia de tres capas — cómo endurecer el prompt para que el formato sea inequívoco, cómo validar la forma del objeto antes de usarlo, y qué debe hacer la app cuando aun así falle, sin mostrarle un error técnico al dueño del negocio."*

**Las tres capas que salieron:**
1. **Prompt:** instrucción explícita *"Responde SOLO con JSON, sin markdown ni texto adicional"* más un ejemplo literal del objeto esperado.
2. **Validación:** `if (!data || !Array.isArray(data.items)) throw` — nunca confiar en la forma, solo en el contrato.
3. **Recuperación:** el `catch` no muestra un error; cambia al intérprete local y marca el resultado como "respaldo local". El usuario obtiene su número igual.

**Lo aprendido.** El bug real no era el parseo: era haber asumido que un modelo generativo es determinista. La pregunta correcta a la IA no fue *"arregla este error"* sino *"¿dónde está mi supuesto equivocado?"*.

### Segundo desafío: la clave expuesta

**El problema.** Al preparar el despliegue fuera del entorno de prototipado, la forma obvia era llamar al modelo directamente desde el `index.html`. Se lo planteé a la IA y la respuesta fue una objeción, no código:

> *"Quiero llamar a la API del modelo desde el frontend para no montar backend. ¿Qué me estoy perdiendo?"*

La API key en el HTML es legible por cualquier visitante desde el inspector del navegador. No es un riesgo teórico: hay bots que rastrean repositorios públicos buscando exactamente ese patrón, y el consumo se factura a la cuenta de quien la expuso.

**La solución.** Una única función serverless (`api/extract.js`) que guarda la clave en variable de entorno y hace de intermediaria. El navegador nunca ve la credencial. De paso resolvió el problema de formato de la sección anterior con una técnica mejor que el `.replace`: **precargar el turno del asistente con `{`**, de modo que el modelo no puede empezar con un preámbulo ni con cercas de markdown, solo continuar el objeto.

```js
messages: [
  { role: "user", content: instruccion + texto },
  { role: "assistant", content: "{" }   // el modelo solo puede seguir en JSON
]
```

**Lo aprendido.** La IA acepta sin chistar una arquitectura insegura si se la describes con suficiente seguridad. Preguntar *"¿qué me estoy perdiendo?"* en vez de *"hazlo"* es la diferencia entre un MVP y un incidente de seguridad.

---

## 6. Por qué el Vibe Coding aceleró esto

**Dónde estuvo el ahorro.** El trabajo tradicional se va en sintaxis: escribir el parser, la grilla responsive, los estados de carga, el modo oscuro. Aquí ese costo tiende a cero y el cuello de botella se corre a **saber qué pedir**. Las decisiones que hicieron bueno el MVP —que la IA extraiga pero no calcule, que los supuestos sean visibles, que el total venga con una equivalencia humana— ninguna es una decisión de código. Son decisiones de producto, y son las que un desarrollador tradicional habría tomado en la semana tres, cuando ya es caro cambiarlas.

**El cambio real de oficio.** Iterar el diseño pasó de "reescribir el CSS" a "describir la intención" (*"tonos verdes, minimalista"*), lo que permitió probar direcciones estéticas en minutos en vez de horas. El rol se parece menos a escribir y más a dirigir: dar contexto, juzgar el resultado, y saber cuándo el resultado bonito está mal.

**Lo honesto.** La IA genera con entusiasmo lo que no se le pide y acepta sin chistar una arquitectura mala si se la describes con seguridad. La velocidad no sustituye el criterio: sin la decisión de sacar la aritmética del modelo, este MVP habría sido una app rápida, bonita y con números en los que nadie debería confiar. La aceleración es real; la responsabilidad sobre el resultado no se delega.

---

## 7. Entregables

- **Proyecto vivo:** `https://claude.ai/artifact/DcHQuPsKNiQ1DnebsUxxhP`
- **Bitácora:** este documento.
- **Video demo (2 min) — guion sugerido:** 0:00 el problema (mostrar un formulario de huella de carbono tradicional) · 0:20 escribir la frase del caso de estudio y calcular · 0:50 señalar el desglose y el supuesto visible · 1:10 el prompt de extracción y la separación IA/aritmética · 1:40 el fallo de parseo y cómo se resolvió.
