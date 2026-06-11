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
      : `Analizá este estado de tarjeta uruguaya. Para cada gasto: fecha (YYYY-MM-DD), descripcion, monto (positivo=gasto), moneda, tipo (Personal/Negocio), concepto1, concepto2, confianza. Ignorá pagos al banco. Tarjeta: ${banco} Período: ${mesNombre} ${ano}. Solo JSON: {"movimientos":[{"fecha":"","descripcion":"","monto":0,"moneda":"UYU","tipo":"Personal","concepto1":"","concepto2":"","confianza":"alta"}],"totalTarjeta":0}`;

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
        max_tokens: 4096,
        messages: [
          { role: "user", content: `${prompt}\n\nArchivo:\n${texto.slice(0, 4000)}` },
        ],
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Error llamando a la API de IA" });
  }
}
