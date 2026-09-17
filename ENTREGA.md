# Entrega — Proyecto Integrador Capstone
## "De la Idea a la Realidad con Vibe Coding"

### Enlaces

| Entregable | Enlace |
|---|---|
| Aplicación desplegada | `[pegar URL de Vercel]` |
| Repositorio | `[pegar URL de GitHub]` |
| Bitácora del proceso | `BITACORA.md` en el repositorio |
| Video demo | `[pegar enlace, opcional]` |

---

### Qué construí

**EcoTrack AI** resuelve el problema del caso de estudio por sustracción: elimina el formulario. El dueño de un negocio pequeño escribe en una caja de texto lo que hizo en el día, como se lo contaría a un socio —*"hoy usamos 5 camionetas de reparto que recorrieron 40 km cada una y gastamos 200 kWh de luz"*— y recibe de vuelta un **recibo de carbono**: el total en kg CO₂e, una equivalencia comprensible, una barra por categoría y el desglose línea por línea con el factor usado en cada una.

La metáfora del recibo no es decorativa. Un formulario pide que el usuario traduzca su realidad al lenguaje del sistema; un recibo le devuelve su propia realidad, sumada. Es la interfaz que el dueño de un negocio ya sabe leer.

### La decisión técnica que define el proyecto

**La IA no calcula. Extrae.**

```
texto libre → [ IA: extracción ] → JSON estructurado → [ JS: factores fijos ] → kg CO₂e
```

El modelo se ocupa de lo que es insustituible: entender lenguaje humano desordenado, inferir unidades y resolver que "5 camionetas × 40 km" son 200 kilómetros —exactamente la multiplicación que un formulario tradicional le exigiría al usuario hacer a mano—. La aritmética, en cambio, ocurre en el navegador contra una tabla de factores de emisión fija y auditable.

Esto importa porque la alternativa era dejar que el modelo entregara el número final. Habría sido más rápido de construir y habría producido cifras en las que nadie debería confiar: irreproducibles entre ejecuciones e imposibles de verificar. Una herramienta de medición que no da el mismo resultado dos veces no es una herramienta de medición.

La consecuencia de diseño es que cada supuesto que hace la IA queda visible bajo la línea correspondiente de la tabla. Si asumió un consumo promedio porque el usuario no dio una cifra, lo dice. La confianza en un número ajeno se construye mostrando de dónde salió.

### Robustez

La aplicación **nunca deja al usuario sin respuesta**. Si la IA falla, devuelve un formato inesperado o simplemente no está disponible, un intérprete local de expresiones regulares toma el relevo, entrega un cálculo y la interfaz indica que está operando en modo local. El error técnico jamás llega a la pantalla del dueño del negocio.

**Nota sobre este despliegue:** la variable `ANTHROPIC_API_KEY` no está configurada en Vercel a propósito, para no requerir una cuenta de facturación en la API solo para esta entrega. Por eso la app corre en **modo local**: el punto de estado lo indica ("Modo local (sin IA)") y el cálculo se hace con el intérprete de expresiones regulares en vez de la extracción por IA. El código de `api/extract.js` y la integración completa con el modelo están en el repositorio y documentados en esta bitácora; activarlos es cuestión de agregar una clave real y hacer un redeploy, como se explica en `README.md`.

La clave de API vive en una función serverless, nunca en el cliente. La aplicación es un solo archivo HTML autocontenido, sin build ni dependencias.

### Sobre el proceso

El trabajo tradicional se va en sintaxis: escribir el parser, la grilla responsive, los estados de carga, el modo oscuro. Con vibe coding ese costo tiende a cero y el cuello de botella se corre a **saber qué pedir**.

Las tres decisiones que hicieron bueno este MVP —separar extracción de cálculo, hacer visibles los supuestos, traducir el total a algo humano— ninguna es una decisión de código. Son decisiones de producto, y son justamente las que en un desarrollo tradicional se toman en la semana tres, cuando ya es caro cambiarlas. Poder llegar a ellas el primer día es la aceleración real.

También encontré el límite. La IA genera con entusiasmo lo que no se le pide y acepta sin objetar una arquitectura mala si se la describes con seguridad: aceptó de entrada la propuesta de poner la API key en el frontend, y solo la objetó cuando pregunté *"¿qué me estoy perdiendo?"* en vez de *"hazlo"*. La velocidad no sustituye el criterio, y la responsabilidad sobre el resultado no se delega. Esa pregunta —la que busca el supuesto equivocado en vez del código— fue la herramienta más útil de todo el proyecto.

---

### Versión corta (para el campo de comentarios de la entrega)

> EcoTrack AI: MVP web donde un negocio pequeño describe su día en lenguaje natural y recibe su huella de carbono desglosada. La decisión de arquitectura central es que la IA solo extrae y estructura el texto —resolviendo cosas como "5 camionetas × 40 km" = 200 km— mientras la aritmética la hace el navegador contra una tabla fija de factores de emisión, de modo que las cifras son reproducibles y auditables. La integración con el modelo está implementada en `api/extract.js` y documentada en la bitácora; este despliegue corre sobre el intérprete local de respaldo (sin clave de API activa) para no requerir facturación, y ese mismo respaldo es lo que garantiza que la app nunca deja al usuario sin resultado. La bitácora documenta el Master Prompt, cinco iteraciones de diseño en lenguaje natural y dos desafíos técnicos resueltos dirigiendo a la IA, sin escribir código a mano.
