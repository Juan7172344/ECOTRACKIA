/**
 * EcoTrack AI — extracción de consumos desde lenguaje natural.
 *
 * Función serverless (Vercel). Existe por una sola razón de seguridad:
 * la API key vive aquí, en el servidor, y nunca viaja al navegador.
 * Si la llamada al modelo se hiciera desde el HTML, cualquier visitante
 * podría leer la clave en el inspector del navegador.
 *
 * Variables de entorno requeridas:
 *   ANTHROPIC_API_KEY   (obligatoria)
 *   ANTHROPIC_MODEL     (opcional, por defecto claude-haiku-4-5-20251001)
 */

const MODELO = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

export default async function handler(req, res) {
  // Sonda de disponibilidad: el frontend la usa para saber si hay IA.
  if (req.method === "GET") {
    return res.status(200).json({ ok: Boolean(process.env.ANTHROPIC_API_KEY) });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Falta configurar ANTHROPIC_API_KEY" });
  }

  const { texto, instruccion } = req.body || {};

  if (typeof texto !== "string" || !texto.trim()) {
    return res.status(400).json({ error: "Falta el texto a interpretar" });
  }
  if (texto.length > 2000) {
    return res.status(400).json({ error: "El texto excede los 2000 caracteres" });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 1000,
        messages: [
          { role: "user", content: String(instruccion || "") + texto },
          // Precargar la apertura del objeto fuerza al modelo a continuar
          // en JSON: elimina los preámbulos y las cercas de markdown.
          { role: "assistant", content: "{" }
        ]
      })
    });

    if (!r.ok) {
      const detalle = await r.text();
      console.error("Error del modelo:", r.status, detalle);
      return res.status(502).json({ error: "El modelo no respondió correctamente" });
    }

    const data = await r.json();

    const crudo = (data.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("");

    // Se recompone la llave inicial y se limpia cualquier resto de markdown.
    const limpio = ("{" + crudo).replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(limpio);
    } catch (e) {
      // Segundo intento: recortar al primer objeto JSON bien formado.
      const m = limpio.match(/\{[\s\S]*\}/);
      if (!m) throw e;
      parsed = JSON.parse(m[0]);
    }

    if (!parsed || !Array.isArray(parsed.items)) {
      return res.status(502).json({ error: "Respuesta con forma inesperada" });
    }

    return res.status(200).json({
      items: parsed.items,
      consejo: typeof parsed.consejo === "string" ? parsed.consejo : ""
    });

  } catch (err) {
    console.error("extract:", err);
    // El frontend interpreta cualquier fallo como señal para usar
    // su intérprete local, así que el usuario nunca ve un error técnico.
    return res.status(500).json({ error: "No fue posible interpretar el texto" });
  }
}
