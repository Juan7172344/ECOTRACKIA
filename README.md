# EcoTrack AI

Calculadora de huella de carbono para negocios pequeños. En vez de un formulario de veinte campos, el dueño del negocio escribe lo que hizo en el día —*"5 camionetas de reparto, 40 km cada una, y 200 kWh de luz"*— y la aplicación devuelve un recibo de carbono con el desglose línea por línea.

Proyecto Integrador Capstone: **De la Idea a la Realidad con Vibe Coding**.

## La decisión de arquitectura

La IA **no calcula**. Extrae.

```
texto libre  →  [ IA: extracción ]  →  JSON estructurado  →  [ JS: factores fijos ]  →  kg CO₂e
```

El modelo se encarga de lo que es insustituible —entender lenguaje humano desordenado, resolver que "5 camionetas × 40 km" son 200 km— y la aritmética ocurre en el navegador contra una tabla de factores de emisión fija y auditable. Así las cifras son reproducibles y verificables, y ningún número depende de que un modelo generativo multiplique bien dos veces seguidas.

## Estructura

```
index.html        La aplicación completa: UI, lógica de cálculo, bitácora local.
api/extract.js    Función serverless. Guarda la API key y hace de proxy al modelo.
```

Sin build, sin dependencias, sin `node_modules`.

## Desplegar en Vercel

1. Sube este repositorio a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New… → Project** → importa el repositorio.
3. No cambies nada en *Framework Preset* (queda en `Other`). Vercel detecta `api/extract.js` automáticamente como función serverless.
4. En **Environment Variables** añade:

   | Nombre | Valor |
   |---|---|
   | `ANTHROPIC_API_KEY` | tu clave de [console.anthropic.com](https://console.anthropic.com) |
   | `ANTHROPIC_MODEL` | *(opcional)* por defecto `claude-haiku-4-5-20251001` |

5. **Deploy**. En menos de un minuto tendrás la URL pública.

> **Nunca pongas la API key dentro de `index.html`.** Cualquier visitante puede leerla desde el inspector del navegador y consumir tu cuota. Esa es la única razón por la que existe `api/extract.js`.

## Correr en local

```bash
npm i -g vercel
vercel dev
```

Crea un archivo `.env.local` con `ANTHROPIC_API_KEY=sk-ant-...` en la raíz. **Ese archivo no debe subirse al repositorio.**

## Si solo usas GitHub Pages

GitHub Pages sirve archivos estáticos y no ejecuta funciones serverless, así que `api/extract.js` no correrá. La aplicación seguirá funcionando: detecta que no hay backend, muestra "Modo local" y usa un intérprete de expresiones regulares que reconoce los patrones más comunes (`kWh`, litros de combustible, kilómetros, kilos de residuos). Entrega un número válido, pero sin la interpretación de lenguaje natural.

Para la demo completa con IA, usa Vercel.

## Factores de emisión

Aproximaciones de uso educativo:

| Categoría | Factor | Unidad |
|---|---|---|
| Electricidad (red colombiana) | 0,164 | kg CO₂e/kWh |
| Gasolina | 2,31 | kg CO₂e/L |
| Diésel | 2,68 | kg CO₂e/L |
| Gas natural | 2,02 | kg CO₂e/m³ |
| Vehículo liviano | 0,25 | kg CO₂e/km |
| Moto | 0,08 | kg CO₂e/km |
| Agua | 0,35 | kg CO₂e/m³ |
| Residuos | 0,58 | kg CO₂e/kg |
| Papel | 1,30 | kg CO₂e/kg |

Un MVP como este no reemplaza un inventario de gases de efecto invernadero bajo ISO 14064 o GHG Protocol.

## Bitácora del proceso

El documento con los prompts, las iteraciones de diseño y el debugging está en `BITACORA.md`.
