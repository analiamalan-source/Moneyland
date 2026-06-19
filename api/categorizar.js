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
      ? `Analizá este extracto bancario uruguayo. Para cada movimiento: fecha (YYYY-MM-DD), descripcion, monto (positivo=ingreso negativo=gasto), moneda (UYU/USD), tipo (Personal/Negocio), concepto1 (de: Ingresos,Ventas,Vivienda,Servicios del hogar,Alimentación,Transporte,Salud,Educación,Cuidado personal,Mascotas,Ocio y cultura,Finanzas,Impuestos y trámites,Regalos y donaciones,Imprevistos,Otros gastos,Gasto de personal,Transferencias,Tarjetas,Pagos,Inversiones,Marketing,Servicios,Personal,Honorarios,Impuestos), concepto2, esPagoTarjeta, confianza (alta/media/baja).
esPagoTarjeta debe ser true SOLO cuando el movimiento es un pago/traspaso desde la cuenta bancaria para saldar el resumen de una tarjeta de crédito (ej: "PAGO OCA", "PAGOTARD", "TRASPASO A PAGO OCA", "DEB. VARIOS VISA-ILINK", "PAGO TARJETA"). Esos pagos quedan pendientes de conciliación con el resumen de la tarjeta y NO se registran como gasto.
esPagoTarjeta debe ser false para todo lo demás, incluyendo compras pagadas con tarjeta de débito (esas son gastos normales y se registran igual que cualquier otro movimiento).
Banco: ${banco} Período: ${mesNombre} ${ano}. Solo JSON: {"movimientos":[{"fecha":"","descripcion":"","monto":0,"moneda":"UYU","tipo":"Personal","concepto1":"","concepto2":"","esPagoTarjeta":false,"confianza":"alta"}]}`
      : `Analizá este estado de tarjeta uruguaya. Para cada gasto: fecha (YYYY-MM-DD), descripcion, monto, moneda, tipo (Personal/Negocio), concepto1, concepto2, confianza.
monto debe llevar el signo real del movimiento, no forzarlo siempre a positivo: positivo para un consumo/compra normal, NEGATIVO para una devolución, nota de crédito, ajuste a favor o descuento que reduce lo que se debe. Para saber el signo real fijate en el documento original: si el monto aparece con "-" o entre paréntesis, si está en una columna separada de "créditos"/"devoluciones", o si la descripción dice "devolución", "crédito", "ajuste a favor", "nota de crédito" — en esos casos el monto va en negativo aunque en el texto plano aparezca solo el número sin signo.
IMPORTANTE: excluí del array de movimientos la línea del pago general que el titular hizo el mes pasado para saldar el resumen anterior — NO es un gasto, es un pago/abono que redujo el saldo. El formato varía según el emisor de la tarjeta, pero conceptualmente es: un movimiento que no es una compra/consumo puntual sino el pago recibido que liquida (total o parcialmente) la deuda del período anterior. Suele aparecer con descripciones como "Pago", "Recibo de pago", "Su pago", "Pago recibido", "Abono", "Pago anterior", a veces en una sección separada de "Pagos/Créditos". No confundas esto con una devolución o ajuste de un comercio puntual (esos sí son gastos negativos legítimos y van incluidos, con signo negativo).
El estado de cuenta suele tener movimientos en dos monedas (pesos uruguayos y dólares), mezclados o en secciones separadas. Para CADA movimiento determiná su moneda real buscando la marca que la indique: puede ser una columna específica (ej. "Moneda", "Tipo de cambio"), un encabezado de sección (ej. "Operaciones y consumos en dólares", "Resumen en moneda extranjera", "Pesos uruguayos"), o un símbolo junto al monto (ej. "U$S", "USD", "US$" vs "$"). No asumas que todo está en UYU: revisá cada fila individualmente. moneda debe ser "USD" solo para los movimientos donde encontraste esa marca; el resto "UYU".
Tarjeta: ${banco} Período: ${mesNombre} ${ano}. Solo JSON: {"movimientos":[{"fecha":"","descripcion":"","monto":0,"moneda":"UYU","tipo":"Personal","concepto1":"","concepto2":"","confianza":"alta"}],"totalTarjeta":0}`;

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
