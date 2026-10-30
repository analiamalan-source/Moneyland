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

descripcion: copiá la descripción EXACTA tal como aparece en el extracto, sin resumirla ni reescribirla.
esPagoTarjeta debe ser true SOLO cuando el movimiento es un pago/traspaso desde la cuenta bancaria para saldar el resumen de una tarjeta de crédito. Fijate en la descripción original completa — aunque empiece con otra palabra, si contiene "PAGOTARD", "PagoTarD", "PAGO TARD", "TARJETA", "TARD" seguido de espacio, punto o fin de texto, es un pago de tarjeta. Ejemplos: "PAGO OCA", "PAGOTARD", "PAGO TARD", "INTERNET0 PagoTarD 1124267700", "TRASPASO A PAGO OCA", "DEB. VARIOS VISA-ILINK", "PAGO TARJETA". Esos pagos quedan pendientes de conciliación con el resumen de la tarjeta y NO se registran como gasto.
esPagoTarjeta debe ser false para todo lo demás, incluyendo compras pagadas con tarjeta de débito (esas son gastos normales y se registran igual que cualquier otro movimiento).
saldoFinal: el saldo de la cuenta al cierre del período (último día del extracto), tal como figura en el documento. Si no aparece claramente, usá 0.
Banco: ${banco} Período: ${mesNombre} ${ano}.
FORMATO DE SALIDA (compacto, es obligatorio): respondé SOLO un JSON con cada movimiento como ARRAY de 9 posiciones, en este orden: [fecha, descripcion, monto, moneda, tipo, concepto1, concepto2, esPagoTarjeta (1 o 0), confianza]. Ejemplo: {"m":[["2026-10-03","COMPRA SUPERMERCADO",-1500,"UYU","Personal","Alimentación","Supermercado",0,"alta"],["2026-10-05","CREDITO SUELDO",3000,"UYU","Personal","Ingresos","Sueldo",0,"alta"]],"saldoFinal":0}`
      : `Analizá este estado de tarjeta uruguaya. Para cada movimiento: fecha (YYYY-MM-DD), descripcion, monto, moneda, tipo (Personal/Negocio), concepto1, concepto2, confianza.

REGLA DE SIGNO — OBLIGATORIA:
- Compra / consumo normal → monto NEGATIVO (es un gasto). Ejemplo: -1500
- Devolución / crédito / nota de crédito / ajuste a favor / cashback → monto POSITIVO (reduce lo que se debe). Ejemplo: 500
La MAYORÍA de los movimientos en un estado de tarjeta son compras: deben ir en NEGATIVO. Solo van en positivo las devoluciones y créditos reales.
NUNCA pongas todos los montos como positivos — si ves que todos saldrían positivos, revisá el signo de cada uno.

EXCLUÍ del array (no son consumos, son campos informativos):
- La línea del pago general que el titular hizo el mes pasado para saldar el resumen anterior — es un pago/abono al saldo, NO un consumo ni una devolución de comercio. Suele aparecer como "Pago", "Recibo de pago", "Su pago", "Pago recibido", "Abono", "Pago anterior", a veces en una sección "Pagos/Créditos". No confundas esto con devoluciones de comercios puntuales (esas sí van incluidas, con monto negativo).
- El interés bonificable y su IVA — son campos informativos que muestran el interés que se hubiera cobrado pero fue bonificado; no forman parte del saldo a liquidar y no deben incluirse como movimientos.
- Las líneas de totales y resúmenes ("** TOTAL Tarjeta ...", "Total devolución IVA ...", saldos, límites, pago mínimo): no son movimientos.
- Una misma línea puede traer varios importes. Si un monto tiene prefijo [ORIG] es el importe en la MONEDA ORIGINAL de una compra hecha en el exterior (por ejemplo reales): es solo informativo, NO es el monto del movimiento. El monto del movimiento es el [USD] (o [UYU]) de esa misma línea.
- Algunos estados muestran los consumos en positivo y las devoluciones/créditos en negativo (ej. "Devolucion Iva Ley 17934 -104,53"). Normalizá siempre con la regla de signo de arriba: consumo NEGATIVO, devolución/crédito POSITIVO.

Para CADA movimiento determiná su moneda real. Prioridad:
1. Si el monto tiene prefijo [USD] o [UYU] (ej: "[USD]25,99" o "[UYU]1.500") usá esa etiqueta directamente — indica la columna del PDF en que apareció.
2. Si no hay prefijo, buscá encabezados de sección ("Operaciones en dólares", "Resumen en moneda extranjera", "Pesos uruguayos") o símbolos junto al monto ("U$S", "USD", "US$" vs "$").
moneda debe ser "USD" solo cuando encontraste esa marca o prefijo; el resto "UYU".

Tarjeta: ${banco} Período: ${mesNombre} ${ano}.
FORMATO DE SALIDA (compacto, es obligatorio): respondé SOLO un JSON con cada movimiento como ARRAY de 8 posiciones, en este orden: [fecha, descripcion, monto, moneda, tipo, concepto1, concepto2, confianza]. Ejemplo: {"m":[["2026-10-03","COMPRA COMERCIO",-500,"UYU","Personal","Alimentación","Supermercado","alta"],["2026-10-04","devolución ejemplo",200,"UYU","Personal","Otros gastos","","alta"]],"totalTarjeta":0}`;

  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    messages: [
      { role: "user", content: `${prompt}\n\nArchivo:\n${texto.slice(0, 40000)}` },
    ],
  });

  const MAX_INTENTOS = 3;
  let lastError = null;

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body,
      });

      // Si es error de servidor de Anthropic (5xx) o rate limit (429), reintentar
      if (response.status === 429 || response.status >= 500) {
        const espera = intento * 1500; // 1.5s, 3s, 4.5s
        await new Promise(r => setTimeout(r, espera));
        lastError = `HTTP ${response.status}`;
        continue;
      }

      const data = await response.json();
      // Se pide a la IA un formato compacto (arrays) porque casi todo el tiempo de espera es ella escribiendo
      // la respuesta; acá se expande al formato de objetos que usa la app. Si algo no cuadra, se devuelve tal cual.
      try {
        const crudo = data.content?.[0]?.text || "";
        const ini = crudo.indexOf("{"), fin = crudo.lastIndexOf("}");
        if (ini >= 0 && fin > ini) {
          const j = JSON.parse(crudo.slice(ini, fin + 1));
          if (Array.isArray(j.m)) {
            const esBanco = tipo === "banco";
            const movimientos = j.m.filter(Array.isArray).map(a => esBanco
              ? { fecha: a[0], descripcion: a[1], monto: a[2], moneda: a[3], tipo: a[4], concepto1: a[5], concepto2: a[6] || "", esPagoTarjeta: a[7] === 1 || a[7] === true || a[7] === "1", confianza: a[8] || "alta" }
              : { fecha: a[0], descripcion: a[1], monto: a[2], moneda: a[3], tipo: a[4], concepto1: a[5], concepto2: a[6] || "", confianza: a[7] || "alta" });
            const salida = esBanco ? { movimientos, saldoFinal: j.saldoFinal ?? 0 } : { movimientos, totalTarjeta: j.totalTarjeta ?? 0 };
            data.content[0].text = JSON.stringify(salida);
          }
        }
      } catch (e) { /* respuesta no compacta o truncada: la app la procesa como antes */ }
      return res.status(200).json(data);
    } catch (e) {
      lastError = e.message;
      if (intento < MAX_INTENTOS) {
        await new Promise(r => setTimeout(r, intento * 1500));
      }
    }
  }

  return res.status(500).json({ error: `Error al procesar con IA (${lastError}). Intentá de nuevo.` });
}
