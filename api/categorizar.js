export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { texto, tipo, banco, mesNombre, ano } = req.body;
  if (!texto || !tipo) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key no configurada" });
  }

  const prompt =
    tipo === "banco"
      ? `Analizá este extracto bancario uruguayo. Para cada movimiento: fecha (YYYY-MM-DD), descripcion, monto, moneda (UYU/USD), tipo (Personal/Negocio), concepto1 (de: Ingresos,Ventas,Vivienda,Servicios del hogar,Alimentación,Transporte,Salud,Educación,Cuidado personal,Mascotas,Ocio y cultura,Finanzas,Impuestos y trámites,Regalos y donaciones,Imprevistos,Otros gastos,Gasto de personal,Transferencias,Tarjetas,Pagos,Inversiones,Marketing,Servicios,Personal,Honorarios,Impuestos), concepto2, esPagoTarjeta, confianza (alta/media/baja).

REGLA DE SIGNO — OBLIGATORIA:
- Débitos / gastos / pagos / compras / transferencias salientes → monto NEGATIVO (ej: -1500)
- Créditos / ingresos / cobros / depósitos / transferencias entrantes → monto POSITIVO (ej: +3000)
La MAYORÍA de los movimientos en un extracto bancario son débitos: deben ir en NEGATIVO. Solo van en positivo los ingresos/créditos reales.
NUNCA pongas todos los montos como positivos — si detectás que todos saldrían positivos, revisá el signo de cada uno.

esPagoTarjeta debe ser true SOLO cuando el movimiento es un pago/traspaso desde la cuenta bancaria para saldar el resumen de una tarjeta de crédito (ej: "PAGO OCA", "PAGOTARD", "TRASPASO A PAGO OCA", "DEB. VARIOS VISA-ILINK", "PAGO TARJETA"). Esos pagos quedan pendientes de conciliación con el resumen de la tarjeta y NO se registran como gasto.
esPagoTarjeta debe ser false para todo lo demás, incluyendo compras pagadas con tarjeta de débito (esas son gastos normales y se registran igual que cualquier otro movimiento).
Banco: ${banco} Período: ${mesNombre} ${ano}. Solo JSON: {"movimientos":[{"fecha":"","descripcion":"","monto":-1500,"moneda":"UYU","tipo":"Personal","concepto1":"","concepto2":"","esPagoTarjeta":false,"confianza":"alta"},{"fecha":"","descripcion":"ingreso ejemplo","monto":3000,"moneda":"UYU","tipo":"Personal","concepto1":"Ingresos","concepto2":"","esPagoTarjeta":false,"confianza":"alta"}]}`
      : `Analizá este estado de tarjeta uruguaya. Para cada movimiento: fecha (YYYY-MM-DD), descripcion, monto, moneda, tipo (Personal/Negocio), concepto1, concepto2, confianza.

REGLA DE SIGNO — OBLIGATORIA:
- Compra / consumo normal → monto POSITIVO. Ejemplo: 1500
- Devolución / crédito / nota de crédito / ajuste a favor → monto NEGATIVO (con signo menos). Ejemplo: -500
Indicadores de que el monto debe ir NEGATIVO: aparece con "-" o entre paréntesis en el documento; está en una columna de "Créditos" o "Devoluciones"; la descripción incluye palabras como devolución, crédito, ajuste, nota de crédito, reintegro, cashback.
NUNCA pongas un crédito o devolución como número positivo, aunque el documento no muestre el signo explícitamente.

EXCLUÍ del array (no son consumos, son campos informativos):
- La línea del pago general que el titular hizo el mes pasado para saldar el resumen anterior — es un pago/abono al saldo, NO un consumo ni una devolución de comercio. Suele aparecer como "Pago", "Recibo de pago", "Su pago", "Pago recibido", "Abono", "Pago anterior", a veces en una sección "Pagos/Créditos". No confundas esto con devoluciones de comercios puntuales (esas sí van incluidas, con monto negativo).
- El interés bonificable y su IVA — son campos informativos que muestran el interés que se hubiera cobrado pero fue bonificado; no forman parte del saldo a liquidar y no deben incluirse como movimientos.

Para CADA movimiento determiná su moneda real. Prioridad:
1. Si el monto tiene prefijo [USD] o [UYU] (ej: "[USD]25,99" o "[UYU]1.500") usá esa etiqueta directamente — indica la columna del PDF en que apareció.
2. Si no hay prefijo, buscá encabezados de sección ("Operaciones en dólares", "Resumen en moneda extranjera", "Pesos uruguayos") o símbolos junto al monto ("U$S", "USD", "US$" vs "$").
moneda debe ser "USD" solo cuando encontraste esa marca o prefijo; el resto "UYU".

Tarjeta: ${banco} Período: ${mesNombre} ${ano}. Solo JSON: {"movimientos":[{"fecha":"","descripcion":"","monto":500,"moneda":"UYU","tipo":"Personal","concepto1":"","concepto2":"","confianza":"alta"},{"fecha":"","descripcion":"devolución ejemplo","monto":-200,"moneda":"UYU","tipo":"Personal","concepto1":"","concepto2":"","confianza":"alta"}],"totalTarjeta":0}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 8192,
        messages: [
          { role: "user", content: `${prompt}\n\nArchivo:\n${texto.slice(0, 40000)}` },
        ],
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Error llamando a la API de IA" });
  }
}
