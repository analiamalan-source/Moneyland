import { useState, useMemo, useRef, useEffect } from "react";

// ── DATOS AGREGADOS (Rivero·Malan 2026) ──────────────────────────────────────
const AGG = {"pivot_pers":{"Ocio y cultura":{"1":-173870.17,"2":-8247.7,"3":-7145.0,"4":-7753.77},"Salud":{"1":-29785.46,"2":-9910.72,"3":-20510.21,"4":-47388.03},"Vivienda":{"1":-65798.74,"2":-5353.44,"3":-70192.89,"4":-7930.56},"Otros gastos":{"1":-10228.03,"2":-13386.12,"3":-26356.51,"4":-4903.72},"Cuidado personal":{"1":-37821.65,"2":-17104.56,"3":-22544.74,"4":-21001.54},"Transferencias":{"1":22285.0,"2":0.0},"Alimentación":{"1":-36276.92,"2":-28274.62,"3":-25097.13,"4":-19186.89},"Tarjetas":{"1":-209391.76,"2":-99540.54},"Servicios del hogar":{"1":-31467.96,"2":-55427.55,"3":-26363.26,"4":-22907.19},"Gasto de personal":{"1":-38274.0,"2":-23310.0,"3":-32957.0,"4":-34175.0},"Ingresos":{"1":597453.0,"2":203822.0,"3":547295.0,"4":476695.2},"Transporte":{"1":-31673.77,"2":-3326.85,"3":-24379.36,"4":-10523.03},"Regalos y donaciones":{"1":-8715.0,"2":-2115.0,"3":-10413.35,"4":-2084.0},"Educación":{"1":-600.0,"2":-70658.6,"3":-79147.0,"4":-80437.46},"Finanzas":{"1":-3441.8,"2":-843.75,"3":-3077.08,"4":-843.75},"Inversiones":{"3":-7800.0,"4":-4130.0},"Servicios":{"3":-12475.41,"4":-878.0},"Impuestos y trámites":{"3":-3281.79,"4":-29112.08},"Pagos":{"3":-31231.22,"4":-72889.67},"Mascotas":{"3":-945.0}},"kpi_mes":{"Deseos":{"1":-378701.36,"2":-104162.8,"3":-123771.7,"4":-27744.26},"Necesidades":{"1":-298643.9,"2":-233336.65,"3":-272345.25,"4":-334270.43},"Transferencias":{"1":22285.0,"2":0.0},"Ingresos":{"1":597453.0,"2":203822.0,"3":547295.0,"4":476695.2},"Inversiones":{"3":-7800.0,"4":-4130.0}},"pivot_neg":{"Marketing":{"1":-11700.0,"2":-46800.0,"4":-29403.0},"Servicios":{"2":-1402.05},"Ingresos":{"4":37670.9},"Licencias / suscripciones":{"4":-4680.53}},"flujo_banco":{"ITAU USD":{"1":-34910.46,"2":-47970.0,"3":-15514.2,"4":95399.1},"SCOTIABANK UYU":{"1":-30510.7,"2":67277.07,"3":-836.06,"4":39831.78},"SCOTIABANK USD":{"1":-12278.22,"2":-24960.39},"ITAU UYU":{"1":8392.12,"2":-176226.18,"3":159728.31,"4":-21093.0}},"monthly":{"1":{"ing":1110864.54,"egr":1180171.8},"2":{"ing":345161.21,"egr":527040.71},"3":{"ing":601196.91,"egr":457818.86},"4":{"ing":573496.32,"egr":459358.44}},"top_gastos":{"Tarjetas":308932.3,"Educación":234038.67,"Vivienda":149306.84,"Servicios del hogar":136187.06,"Gasto de personal":128716.0,"Alimentación":112010.87,"Salud":107593.42,"Ocio y cultura":196869.17,"Cuidado personal":98472.49},"recent":[{"f":"2026-04-30","t":"Personal","c1":"Ingresos","c2":"Sueldo","cat":"Ingresos","b":"ITAU UYU","d":"ANMA ABRIL","tot":113902.0},{"f":"2026-04-30","t":"Personal","c1":"Gasto de personal","c2":"Servicio doméstico / Niñera","cat":"Deseos","b":"SCOTIABANK UYU","d":"MIDI/TRN/ABRIL","tot":-23823.0},{"f":"2026-04-29","t":"Personal","c1":"Cuidado personal","c2":"Peluquería / Uñas / Estética","cat":"Deseos","b":"ITAU UYU","d":"Uñas","tot":-1990.0},{"f":"2026-04-28","t":"Negocio","c1":"Ingresos","c2":"Mentorías","cat":"Ingresos","b":"ITAU UYU","d":"Johanna RUMBO","tot":10000.0},{"f":"2026-04-27","t":"Personal","c1":"Pagos","c2":"Pago tarjetas","cat":"Necesidad","b":"SCOTIABANK UYU","d":"INTERNET0 PAGOTARD","tot":-36841.91},{"f":"2026-04-27","t":"Negocio","c1":"Ingresos","c2":"Mentorías","cat":"Ingresos","b":"ITAU USD","d":"METODO RUMBO","tot":27670.9},{"f":"2026-04-20","t":"Personal","c1":"Ingresos","c2":"Otros","cat":"Ingresos","b":"ITAU USD","d":"Renta del campo","tot":95518.2},{"f":"2026-04-20","t":"Negocio","c1":"Marketing","c2":"Publicidad en redes sociales","cat":"Fijo","b":"ITAU USD","d":"","tot":-23820.0}]};

const DISP_REGS = [{"id":577,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Ingresos","c2":"Sueldo","cat":"Ingresos","d":"ANMA ABRIL 60","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":113902.0,"iva":null,"tot":113902.0},{"id":578,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Transporte","c2":"Combustible","cat":"Variable","d":"300426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":-1837.1,"iva":null,"tot":-1837.1},{"id":579,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Salud","c2":"Medicamentos","cat":"Necesidad","d":"300426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":-1102.0,"iva":null,"tot":-1102.0},{"id":580,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Salud","c2":"Medicamentos","cat":"Necesidad","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":18.44,"iva":null,"tot":18.44},{"id":581,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"300426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":-680.7,"iva":null,"tot":-680.7},{"id":582,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":11.16,"iva":null,"tot":11.16},{"id":641,"f":"2026-04-30","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Gasto de personal","c2":"Servicio doméstico / Niñera","cat":"Deseos","d":"MIDI/TRN/ABRIL 26","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":-23823.0,"iva":null,"tot":-23823.0},{"id":575,"f":"2026-04-29","m":"4","b":"ITAU UYU","t":"Personal","c1":"Cuidado personal","c2":"Peluquería / Uñas / Estética","cat":"Deseos","d":"Uñas","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-29","usd":null,"tc":null,"p":-1990.0,"iva":null,"tot":-1990.0},{"id":576,"f":"2026-04-29","m":"4","b":"ITAU UYU","t":"Personal","c1":"Cuidado personal","c2":"Peluquería / Uñas / Estética","cat":"Deseos","d":"Color","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-29","usd":null,"tc":null,"p":-1665.0,"iva":null,"tot":-1665.0},{"id":642,"f":"2026-04-29","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Servicios del hogar","c2":"Agua (OSE)","cat":"Necesidad","d":"PAGANZA -               986879","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-29","usd":null,"tc":null,"p":-1142.79,"iva":null,"tot":-1142.79},{"id":643,"f":"2026-04-29","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"EL RINCON EMPANADAS /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-29","usd":null,"tc":null,"p":-291.76,"iva":null,"tot":-291.76},{"id":572,"f":"2026-04-28","m":"4","b":"ITAU UYU","t":"Personal","c1":"Educación","c2":"Libros y útiles","cat":"Necesidad","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-28","usd":null,"tc":null,"p":7.21,"iva":null,"tot":7.21},{"id":573,"f":"2026-04-28","m":"4","b":"ITAU UYU","t":"Personal","c1":"Educación","c2":"Libros y útiles","cat":"Necesidad","d":"280426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-28","usd":null,"tc":null,"p":-1603.0,"iva":null,"tot":-1603.0},{"id":574,"f":"2026-04-28","m":"4","b":"ITAU UYU","t":"Negocio","c1":"Ingresos","c2":"Mentorías","cat":"Ingresos","d":"Johanna Método RUMBO","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-28","usd":null,"tc":null,"p":10000.0,"iva":null,"tot":10000.0},{"id":644,"f":"2026-04-28","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"THE COFFEETERIA     /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-28","usd":null,"tc":null,"p":-533.64,"iva":null,"tot":-533.64},{"id":645,"f":"2026-04-28","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Ingresos","c2":"Sueldo","cat":"Ingresos","d":"SUELDOS SCOTIABANK         - S","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-28","usd":null,"tc":null,"p":238800.0,"iva":null,"tot":238800.0},{"id":568,"f":"2026-04-27","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":45.74,"iva":null,"tot":45.74},{"id":569,"f":"2026-04-27","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":15.12,"iva":null,"tot":15.12},{"id":570,"f":"2026-04-27","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"250426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":-922.27,"iva":null,"tot":-922.27},{"id":571,"f":"2026-04-27","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"250426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":-620.0,"iva":null,"tot":-620.0},{"id":586,"f":"2026-04-27","m":"4","b":"ITAU USD","t":"Negocio","c1":"Ingresos","c2":"Mentorías","cat":"Ingresos","d":"METODO RUMBO DIEGO LUJAMBIO","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-27","usd":697.0,"tc":39.7,"p":27670.9,"iva":null,"tot":27670.9},{"id":646,"f":"2026-04-27","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Pagos","c2":"Pago tarjetas","cat":"Necesidad","d":"INTERNET0 PAGOTARD 1124267700","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":-36841.91,"iva":null,"tot":-36841.91},{"id":647,"f":"2026-04-27","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"THE COFFEETERIA     /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":-1067.28,"iva":null,"tot":-1067.28},{"id":648,"f":"2026-04-27","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"MIGUITA DE PAN      /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":-927.54,"iva":null,"tot":-927.54},{"id":649,"f":"2026-04-23","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Regalos y donaciones","c2":"Donaciones / Caridad","cat":"Deseos","d":"Pérez scremini","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-23","usd":null,"tc":null,"p":-1000.0,"iva":null,"tot":-1000.0},{"id":650,"f":"2026-04-23","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Pagos","c2":"Pago tarjetas","cat":"Necesidad","d":"Santander","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-23","usd":null,"tc":null,"p":-7952.04,"iva":null,"tot":-7952.04},{"id":651,"f":"2026-04-23","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Servicios del hogar","c2":"Internet / Telefonía","cat":"Necesidad","d":"ANTEL","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-23","usd":null,"tc":null,"p":-2380.0,"iva":null,"tot":-2380.0},{"id":652,"f":"2026-04-23","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Impuestos y trámites","c2":"Tasas municipales","cat":"Necesidad","d":"PAGANZA -               986879","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-23","usd":null,"tc":null,"p":-1146.08,"iva":null,"tot":-1146.08},{"id":653,"f":"2026-04-23","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Gasto de personal","c2":"Servicio doméstico / Niñera","cat":"Deseos","d":"MIDI/TRN/ADEL ABRIL 26","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-23","usd":null,"tc":null,"p":-4000.0,"iva":null,"tot":-4000.0},{"id":654,"f":"2026-04-22","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Gasto de personal","c2":"Servicio doméstico / Niñera","cat":"Deseos","d":"BPS","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-22","usd":null,"tc":null,"p":-6352.0,"iva":null,"tot":-6352.0}];

// ── TAXONOMÍA ────────────────────────────────────────────────────────────────
const TX = {
  Negocio:{Ventas:{cat:"Ingresos",subs:["Tienda física (contado)","Tienda física (crédito)","Tienda online (crédito)","Tienda online (contado)","Devoluciones (-)","Descuentos comerciales (-)","Mentorías","Pies","Cejas"]},Costos:{cat:"Gasto Variable",subs:["Materia prima / materiales","Insumos de producción","Envases y embalajes","Repuestos y accesorios","Herramientas menores"]},Comisiones:{cat:"Gasto Variable",subs:["Mercado pago / Mercado libre","Tarjetas"]},Personal:{cat:"Gasto Fijo",subs:["Sueldos","Aportes patronales","Aguinaldo","Salario vacacional","Indemnizaciones","Bonos / incentivos","Viáticos / reintegros"]},Servicios:{cat:"Gasto Fijo",subs:["Electricidad","Agua","Internet","Telefonía móvil / fija","Alarma y monitoreo","ChatGPT","Licencias / suscripciones"]},Transporte:{cat:"Gasto Variable",subs:["Combustible","Peajes","Patentes y permisos","Seguros de vehículos","Envíos / fletes a clientes","Estacionamiento"]},Alquileres:{cat:"Gasto Fijo",subs:["Local comercial","Oficina / cowork","Depósito / galpón"]},Mantenimiento:{cat:"Gasto Fijo",subs:["Reparaciones de equipos","Mantenimiento preventivo","Servicios técnicos (IT)"]},Marketing:{cat:"Gasto Fijo",subs:["Publicidad en redes sociales","Publicidad en buscadores","Diseño gráfico / branding","Promociones y descuentos"]},Honorarios:{cat:"Gasto Fijo",subs:["Contador","Abogado","Consultor externo","Diseñador / agencia creativa"]},Capacitación:{cat:"Gasto Fijo",subs:["Cursos online","Talleres presenciales","Libros y materiales"]},"Otros gastos":{cat:"Gasto Fijo",subs:["Pequeños suministros de oficina","Donaciones y patrocinio","Multas y recargos"]},Intereses:{cat:"Gasto Fijo",subs:["Intereses de préstamos bancarios","Intereses por financiación de tarjetas"]},Impuestos:{cat:"Gasto Variable",subs:["IVA débito","IRPF / IRNR","Impuesto a la renta (IRAE)","Tasas municipales"]},Ingresos:{cat:"Ingresos",subs:["Mentorías","Otros"]},Cobros:{cat:"Cobros",subs:["Cobros"]},"Préstamo recibido":{cat:"Financiamiento",subs:["Préstamo recibido"]},"Préstamo pagado":{cat:"Financiamiento",subs:["Préstamo pagado"]},"Intereses pagados":{cat:"Financiamiento",subs:["Intereses pagados"]},"Distribución de dividendos":{cat:"Financiamiento",subs:["Distribución de dividendos"]},Pagos:{cat:"Pagos",subs:["Pagos"]}},
  Personal:{Ingresos:{cat:"Ingresos",subs:["Sueldo","Alquileres","Otros"]},Vivienda:{cat:"Necesidad",subs:["Alquiler / Hipoteca","Contribución inmobiliaria / Gastos comunes","Seguro del hogar / Otros seguros","Reparaciones","Limpieza","Jardinería","Decoración / Bazar / Mercería"]},"Servicios del hogar":{cat:"Necesidad",subs:["Electricidad (UTE)","Agua (OSE)","Internet / Telefonía","Gas / Saneamiento / Leña","Seguridad"]},Alimentación:{cat:"Necesidad",subs:["Supermercado","Delivery / Restaurantes / Cafeterías","Cumpleaños"]},Transporte:{cat:"Necesidad",subs:["Combustible","Boleto / STM / Taxi–apps","Peajes","Estacionamiento","Mantenimiento vehículo","Seguro del auto","Patente"]},Salud:{cat:"Necesidad",subs:["Mutualista / Seguro médico","Medicamentos","Odontología / Óptica","Psicoterapia / Fisioterapia","Seguro de vida"]},Educación:{cat:"Necesidad",subs:["Matrícula / Cuota colegio / Guardería","Libros y útiles","Cursos / Talleres / Actividades niños","Plataformas educativas","Celulares / Tablets / Computadoras","Uniformes"]},"Cuidado personal":{cat:"Deseos",subs:["Peluquería / Uñas / Estética","Gimnasio / Deporte","Spa / Bienestar","Ropa y calzado"]},Mascotas:{cat:"Deseos",subs:["Alimento","Veterinario / Vacunas","Peluquería / Accesorios"]},"Ocio y cultura":{cat:"Deseos",subs:["Streaming / Música","Cine / Conciertos","Hobbies","Viajes / Vacaciones","Suscripciones (Netflix, HBO, Canva, ChatGPT, etc.)"]},Finanzas:{cat:"Deseos",subs:["Comisiones bancarias","Mantenimiento tarjeta","Intereses financiación"]},"Impuestos y trámites":{cat:"Necesidad",subs:["IVA / IRPF / IRAE / Fonasa","Tasas municipales","Timbres / Sellados","Multas","Fondo de solidaridad","Caja profesional"]},"Regalos y donaciones":{cat:"Deseos",subs:["Regalos","Donaciones / Caridad"]},Imprevistos:{cat:"Necesidad",subs:["Imprevistos"]},"Otros gastos":{cat:"Deseos",subs:["Otros gastos","Seguro de vida sobre saldo"]},Transferencias:{cat:"Transferencias",subs:["Transferencias"]},"Gasto de personal":{cat:"Deseos",subs:["Servicio doméstico / Niñera"]},Inversiones:{cat:"Inversiones",subs:["Inversiones"]},Cobros:{cat:"Cobros",subs:["Cobros"]},"Préstamo recibido":{cat:"Cobros",subs:["Préstamo recibido"]},"Préstamo pagado":{cat:"Pagos",subs:["Préstamo pagado"]},Pagos:{cat:"Pagos",subs:["Pagos"]},Tarjetas:{cat:"Pagos",subs:["Pago tarjetas"]},Servicios:{cat:"Necesidad",subs:["Varios"]}}
};

const BANCOS_LIST = ["ITAU UYU","ITAU USD","SCOTIABANK UYU","SCOTIABANK USD","BROU UYU","BROU USD","OCA","VISA SCOTIA","VISA ITAU","MASTER OCA","AMEX SCOTIA","PREX","Otro"];
const FORMAS = ["Cobro efectivo","Cobro transferencia","Cobro crédito","Pago efectivo","Pago transferencia","Pago crédito"];
const MESES_NOM = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const CAT_C = {"Ingresos":"#60f0a0","Gasto Fijo":"#f06060","Gasto Variable":"#f0a060","Cobros":"#c8f060","Pagos":"#c860f0","Necesidad":"#8888ee","Deseos":"#cc88cc","Transferencias":"#60c8f0","Inversiones":"#60c8f0","Variable":"#f0a060","Fijo":"#f06060"};
const MESES_DISP = ["1","2","3","4"];

const fmtN = (n) => "$ " + Math.abs(n||0).toLocaleString("es-UY",{minimumFractionDigits:0,maximumFractionDigits:0});
const fmtD = (d) => { if(!d) return "—"; const [y,m,day]=d.split("-"); return `${day}/${m}/${y}`; };
const today = () => new Date().toISOString().split("T")[0];
const addDays = (d,n) => { if(!d||!n) return d; const dt=new Date(d); dt.setDate(dt.getDate()+parseInt(n)); return dt.toISOString().split("T")[0]; };

const emptyForm = () => ({fecha:today(),bancoCobPag:"",tipo:"Personal",c1:"Ingresos",c2:"Sueldo",cat:"Ingresos",desc:"",forma:"Cobro transferencia",bancoEmisor:"SCOTIABANK UYU",plazo:"",fechaCP:today(),fechaManual:false,usd:"",tc:"",pesos:"",iva:""});

export default function FinCFO() {
  const [regs, setRegs] = useState(DISP_REGS);
  const [form, setForm] = useState(emptyForm());
  const [mainTab, setMainTab] = useState("dashboard");
  const [config, setConfig] = useState({
    bancos: [
      {id:1,nombre:"Itaú UYU",moneda:"UYU",tipo:"Ambos",activo:true},
      {id:2,nombre:"Itaú USD",moneda:"USD",tipo:"Ambos",activo:true},
      {id:3,nombre:"Scotiabank UYU",moneda:"UYU",tipo:"Ambos",activo:true},
      {id:4,nombre:"Scotiabank USD",moneda:"USD",tipo:"Ambos",activo:true},
    ],
    tarjetas: [
      {id:1,nombre:"OCA",banco:"Itaú UYU",moneda:"UYU",tipoCarta:"crédito",tipo:"Personal",activo:true},
      {id:2,nombre:"Visa Scotiabank",banco:"Scotiabank UYU",moneda:"UYU",tipoCarta:"crédito",tipo:"Ambos",activo:true},
      {id:3,nombre:"Visa Itaú",banco:"Itaú UYU",moneda:"UYU",tipoCarta:"crédito",tipo:"Ambos",activo:true},
      {id:4,nombre:"Master OCA",banco:"Itaú UYU",moneda:"UYU",tipoCarta:"crédito",tipo:"Personal",activo:true},
    ]
  });
  const [configTab, setConfigTab] = useState("bancos");
  const [editingConfig, setEditingConfig] = useState(null);
  const [newBanco, setNewBanco] = useState({nombre:"",moneda:"UYU",tipo:"Ambos",activo:true});
  const [newTarjeta, setNewTarjeta] = useState({nombre:"",banco:"",moneda:"UYU",tipoCarta:"crédito",tipo:"Personal",activo:true});
  const [reportTab, setReportTab] = useState("rentabilidad");
  const [filterMes, setFilterMes] = useState("todos");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [searchQ, setSearchQ] = useState("");
  const [colDropOpen, setColDropOpen] = useState(false);
  const colDropRef = useRef(null);
  const [visibleCols, setVisibleCols] = useState(["fecha","tipo","banco","categoria","concepto","descripcion","subtotal","total"]);

  useEffect(()=>{
    if(!colDropOpen) return;
    const h=(e)=>{if(colDropRef.current&&!colDropRef.current.contains(e.target))setColDropOpen(false);};
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[colDropOpen]);
  const [dashFiltro, setDashFiltro] = useState("todos");
  const [persDesde, setPersDesde] = useState("1");
  const [persHasta, setPersHasta] = useState("4");
  const [persBancos, setPersBancos] = useState([]);
  const [bancoDropOpen, setBancoDropOpen] = useState(false);
  const [saldosInicialEdit, setSaldosInicialEdit] = useState({});
  const [saldosFinalEdit, setSaldosFinalEdit] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editFechaCP, setEditFechaCP] = useState("");
  const [saved, setSaved] = useState(false);
  const bancoDropRef = useRef(null);

  useEffect(()=>{
    if(!bancoDropOpen) return;
    const h = (e)=>{ if(bancoDropRef.current&&!bancoDropRef.current.contains(e.target)) setBancoDropOpen(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[bancoDropOpen]);

  const bancosActivos = config.bancos.filter(b=>b.activo).map(b=>b.nombre);
  const tarjetasActivas = config.tarjetas.filter(t=>t.activo).map(t=>t.nombre);
  const mediosPago = [...bancosActivos, ...tarjetasActivas];
  const c1Opts = Object.keys(TX[form.tipo]||{});
  const c2Opts = TX[form.tipo]?.[form.c1]?.subs||[];
  const catAuto = TX[form.tipo]?.[form.c1]?.cat||"";
  const usdN = parseFloat(form.usd)||0;
  const tcN = parseFloat(form.tc)||0;
  const pesosCalc = usdN&&tcN ? usdN*tcN : parseFloat(form.pesos)||0;
  const ivaNum = parseFloat(form.iva)||0;
  const totalCalc = pesosCalc + ivaNum;
  const fechaCPCalc = form.plazo&&!form.fechaManual ? addDays(form.fecha,form.plazo) : form.fechaCP;
  const anoF = form.fecha ? new Date(form.fecha).getFullYear() : "";
  const mesF = form.fecha ? MESES_NOM[new Date(form.fecha).getMonth()+1] : "";

  function setF(field,val){
    setForm(prev=>{
      const n={...prev,[field]:val};
      if(field==="tipo"){n.c1=Object.keys(TX[val]||{})[0]||"";n.c2=TX[val]?.[n.c1]?.subs[0]||"";n.cat=TX[val]?.[n.c1]?.cat||"";}
      if(field==="c1"){n.c2=TX[prev.tipo]?.[val]?.subs[0]||"";n.cat=TX[prev.tipo]?.[val]?.cat||"";}
      if(field==="plazo"&&!n.fechaManual) n.fechaCP=addDays(n.fecha,val);
      if(field==="fecha"&&!n.fechaManual) n.fechaCP=addDays(val,n.plazo);
      return n;
    });
  }

  function submit(){
    const mes=form.fecha?String(new Date(form.fecha).getMonth()+1):"";
    const reg={id:Date.now(),f:form.fecha,m:mes,a:form.fecha?String(new Date(form.fecha).getFullYear()):"",b:form.bancoCobPag,t:form.tipo,c1:form.c1,c2:form.c2,cat:catAuto,d:form.desc,fm:form.forma,be:form.bancoEmisor,tot:totalCalc};
    setRegs(p=>[reg,...p]);
    setForm(emptyForm());
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  }

  // Dashboard data from AGG
  const monthly = AGG.monthly;
  const maxBar = Math.max(...Object.values(monthly).map(v=>Math.max(v.ing,v.egr)),1);
  const totalIng = Object.values(monthly).reduce((s,v)=>s+v.ing,0);
  const totalEgr = Object.values(monthly).reduce((s,v)=>s+v.egr,0);

  // Finanzas personales
  const pivot_pers = AGG.pivot_pers;
  const kpi_mes = AGG.kpi_mes;
  const mesesFiltrados = MESES_DISP.filter(m=>+m>=+persDesde&&+m<=+persHasta);
  const bancosPersList = ["ITAU UYU","ITAU USD","SCOTIABANK UYU","SCOTIABANK USD"];

  const pvGet = (c1,m) => (pivot_pers[c1]?.[m]||0);
  const rowTot = (c1) => mesesFiltrados.reduce((s,m)=>s+pvGet(c1,m),0);
  const colTot = (m) => Object.keys(pivot_pers).reduce((s,c1)=>s+pvGet(c1,m),0);
  const grandTot = mesesFiltrados.reduce((s,m)=>s+colTot(m),0);

  const kpiGet = (grp) => mesesFiltrados.reduce((s,m)=>s+(kpi_mes[grp]?.[m]||0),0);
  const persIng = kpiGet("Ingresos");
  const persDes = kpiGet("Deseos");
  const persNec = kpiGet("Necesidades");
  const persInv = kpiGet("Inversiones");

  // CAT_GRUPO for pivot subtotals
  const CAT_GRUPO = {'Necesidad':'Necesidades','Deseos':'Deseos','Inversiones':'Inversiones','Transferencias':'Transferencias','Ingresos':'Ingresos','Fijo':'Necesidades','Variable':'Necesidades'};
  const pivotCat = {};
  mesesFiltrados.forEach(m=>{
    pivotCat[m]={Necesidades:0,Deseos:0,Inversiones:0,Transferencias:0,Ingresos:0};
  });
  // Build pivotCat from kpi_mes directly
  mesesFiltrados.forEach(m=>{
    Object.keys(kpi_mes).forEach(g=>{
      if(pivotCat[m]&&pivotCat[m][g]!==undefined) pivotCat[m][g]=(kpi_mes[g]?.[m]||0);
    });
  });

  const GRUPOS = {
    Necesidades:["Vivienda","Servicios del hogar","Alimentación","Transporte","Salud","Educación","Cuidado personal","Impuestos y trámites","Mascotas","Otros gastos","Servicios","Pagos","Tarjetas","Pago tarjeta","Imprevistos"],
    Deseos:["Ocio y cultura","Gasto de personal","Alimentación","Cuidado personal","Regalos y donaciones","Otros gastos","Vivienda","Salud","Servicios","Educación","Pago tarjeta","Finanzas"],
    Inversiones:["Inversiones"],
    Transferencias:["Transferencias","Préstamo pagado","Préstamo recibido","Cobros"],
  };
  const GRUPO_COLOR={Necesidades:"#60c8f0",Deseos:"#cc88cc",Inversiones:"#f0c060",Transferencias:"#888"};
  const GRUPO_BG={Necesidades:"rgba(96,200,240,0.05)",Deseos:"rgba(204,136,204,0.05)",Inversiones:"rgba(240,192,96,0.05)",Transferencias:"rgba(128,128,128,0.04)"};
  const GRUPO_LABEL={Necesidades:"Pagos por necesidades",Deseos:"Pagos por deseos",Inversiones:"Inversiones",Transferencias:"Transferencias"};

  const grupoTotMes = (g,m) => pivotCat[m]?.[g]||0;
  const grupoTot = (g) => mesesFiltrados.reduce((s,m)=>s+grupoTotMes(g,m),0);

  const fmtCell = (v) => { if(!v) return ""; return (v<0?"-":"")+"$ "+Math.abs(v).toLocaleString("es-UY",{minimumFractionDigits:0,maximumFractionDigits:0}); };
  const cellSt = (v) => ({textAlign:"right",fontFamily:"Syne",fontSize:11,fontWeight:v!==0?"600":"400",color:v>0?"#60f0a0":v<0?"#f06060":"#333",padding:"5px 10px",borderRight:"1px solid rgba(255,255,255,0.04)",whiteSpace:"nowrap"});

  // Sort pivot rows by abs total desc
  const FILAS_BASE = ["Vivienda","Servicios del hogar","Alimentación","Transporte","Salud","Educación","Cuidado personal","Mascotas","Ocio y cultura","Finanzas","Impuestos y trámites","Regalos y donaciones","Imprevistos","Otros gastos","Gasto de personal","Servicios","Transferencias","Tarjetas","Pagos","Préstamo pagado","Préstamo recibido","Cobros","Inversiones"];
  const FILAS_SORTED = [...FILAS_BASE].sort((a,b)=>Math.abs(rowTot(b))-Math.abs(rowTot(a)));

  // Conciliación
  const SF_EXT = {"ITAU UYU":{"1":198684.21,"2":22458.40,"3":182186.76,"4":161093.36},"SCOTIABANK UYU":{"1":187432.74,"2":279951.69,"3":218789.74,"4":216673.05},"ITAU USD":{"1":2764.47,"2":1534.47,"3":1100.66,"4":3503.66},"SCOTIABANK USD":{"1":20199.09,"2":19990.11,"3":19727.28,"4":19666.35}};
  const FL_B = AGG.flujo_banco;
  const FL_BT = {"ITAU UYU":{"Personal":{"1":8392.12,"2":-174824.13,"3":159728.31,"4":-24799.47},"Negocio":{"2":-1402.05,"4":3706.47}},"ITAU USD":{"Personal":{"1":-23210.46,"2":-1170.0,"3":-15514.2,"4":95518.2},"Negocio":{"1":-11700.0,"2":-46800.0,"4":-119.1}},"SCOTIABANK UYU":{"Personal":{"1":-30510.7,"2":67277.07,"3":-836.06,"4":39831.78},"Negocio":{}},"SCOTIABANK USD":{"Personal":{"1":-12278.22,"2":-24960.39},"Negocio":{}}};
  const getSI = (b,m) => { const me=parseInt(m); if(saldosInicialEdit[b]?.[m]!==undefined) return saldosInicialEdit[b][m]; if(me===1) return (SF_EXT[b]?.["1"]||0)-(FL_B[b]?.["1"]||0); return saldosFinalEdit[b]?.[String(me-1)]??SF_EXT[b]?.[String(me-1)]??0; };
  const getSF = (b,m) => saldosFinalEdit[b]?.[m]??SF_EXT[b]?.[m]??0;
  const getFlPers = (b,m) => FL_BT[b]?.Personal?.[m]||0;
  const getFlNeg = (b,m) => FL_BT[b]?.Negocio?.[m]||0;
  const getFl = (b,m) => getFlPers(b,m)+getFlNeg(b,m);
  const getDC = (b,m,mon) => mon==="UYU"?0:getSF(b,m)-(getSI(b,m)+getFl(b,m));
  const editSI = (b,m,v) => setSaldosInicialEdit(p=>({...p,[b]:{...(p[b]||{}),[m]:parseFloat(v)||0}}));
  const editSF = (b,m,v) => setSaldosFinalEdit(p=>({...p,[b]:{...(p[b]||{}),[m]:parseFloat(v)||0}}));
  const fmtC = (v,cur) => { const s=cur==="USD"?"U$S ":"$ "; return (v<0?"-":"")+s+Math.abs(v||0).toLocaleString("es-UY",{minimumFractionDigits:2,maximumFractionDigits:2}); };
  const ctrlSt = (v) => ({fontFamily:"Syne",fontSize:11,fontWeight:700,textAlign:"right",padding:"7px 10px",color:Math.abs(v)<0.1?"#60f0a0":"#f06060",background:Math.abs(v)<0.1?"rgba(96,240,160,0.05)":"rgba(240,96,96,0.08)"});
  const inpSt = (c) => ({width:"100%",background:"#1a1a24",border:`1px solid ${c}44`,borderRadius:4,color:c,fontFamily:"Syne",fontSize:11,fontWeight:700,padding:"5px 8px",textAlign:"right",outline:"none",boxSizing:"border-box"});
  const BANCOS_CONC=[{id:"ITAU UYU",label:"Itaú UYU",moneda:"UYU"},{id:"SCOTIABANK UYU",label:"Scotiabank UYU",moneda:"UYU"},{id:"ITAU USD",label:"Itaú USD",moneda:"USD"},{id:"SCOTIABANK USD",label:"Scotiabank USD",moneda:"USD"}];

  const periodoLabel = persDesde===persHasta ? MESES_NOM[+persDesde] : `${MESES_NOM[+persDesde]} – ${MESES_NOM[+persHasta]}`;

  const S = {
    page:{minHeight:"100vh",background:"#09090d",color:"#ede8e0",fontFamily:"'DM Mono',monospace",fontSize:13},
    bar:{display:"flex",alignItems:"center",padding:"0 20px",height:50,borderBottom:"1px solid rgba(255,255,255,0.06)",gap:10,flexShrink:0},
    logo:{fontFamily:"Syne",fontSize:18,fontWeight:800,letterSpacing:-0.5},
    tabs:{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"0 20px",flexShrink:0,overflowX:"auto"},
    tab:a=>({padding:"10px 14px",fontSize:11,cursor:"pointer",background:"none",border:"none",borderBottom:a?"2px solid #c8f060":"2px solid transparent",color:a?"#c8f060":"#555",fontFamily:"DM Mono",whiteSpace:"nowrap"}),
    body:{padding:20,maxWidth:1000,margin:"0 auto"},
    card:{background:"#131318",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:16,marginBottom:12},
    secT:{fontFamily:"Syne",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:0.8,marginBottom:12},
    lbl:{display:"block",fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:0.7,marginBottom:4},
    inp:{width:"100%",background:"#1c1c26",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,padding:"8px 10px",color:"#ede8e0",fontFamily:"DM Mono",fontSize:12,outline:"none",boxSizing:"border-box"},
    sel:{width:"100%",background:"#1c1c26",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,padding:"8px 10px",color:"#ede8e0",fontFamily:"DM Mono",fontSize:12,outline:"none",cursor:"pointer",boxSizing:"border-box"},
    calc:{width:"100%",background:"#0e0e16",border:"1px solid rgba(255,255,255,0.04)",borderRadius:5,padding:"8px 10px",color:"#c8f060",fontFamily:"Syne",fontSize:13,fontWeight:700,boxSizing:"border-box"},
    g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
    g3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12},
    g4:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12},
    g5:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:12},
    badge:(c)=>({display:"inline-block",fontSize:10,padding:"2px 7px",borderRadius:3,background:(CAT_C[c]||"#888")+"20",color:CAT_C[c]||"#888",border:`1px solid ${CAT_C[c]||"#888"}33`}),
    pill:(c)=>({fontSize:9,padding:"2px 6px",borderRadius:3,background:c+"20",color:c,display:"inline-block"}),
  };

  const selStyle = {background:"#1c1c26",border:"1px solid rgba(255,255,255,0.1)",borderRadius:5,color:"#ede8e0",fontFamily:"DM Mono",fontSize:11,padding:"5px 8px",cursor:"pointer"};

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet"/>

      {/* TOPBAR */}
      <div style={S.bar}>
        <div style={S.logo}>Fin<span style={{color:"#c8f060"}}>CFO</span></div>
        <div style={{fontSize:10,color:"#444",background:"#1c1c26",border:"1px solid rgba(255,255,255,0.07)",borderRadius:4,padding:"2px 8px",letterSpacing:1}}>RIVERO · MALAN · 2026 · UYU</div>
        <div style={{marginLeft:"auto",fontSize:11,color:"#555"}}>671 registros · Ene–Abr 2026</div>
      </div>

      {/* MAIN TABS */}
      <div style={S.tabs}>
        {[["dashboard","Dashboard"],["form","+ Nuevo"],["registros","Registros"],["informes","Informes"],["config","⚙ Configuración"]].map(([k,l])=>(
          <button key={k} style={S.tab(mainTab===k)} onClick={()=>setMainTab(k)}>{l}</button>
        ))}
      </div>

      <div style={S.body}>

        {/* ── DASHBOARD ── */}
        {mainTab==="dashboard" && (
          <>
            <div style={{display:"flex",gap:6,marginBottom:14,alignItems:"center"}}>
              {["todos","Personal","Negocio"].map(f=>(
                <button key={f} onClick={()=>setDashFiltro(f)}
                  style={{background:dashFiltro===f?"rgba(200,240,96,0.12)":"#131318",border:`1px solid ${dashFiltro===f?"rgba(200,240,96,0.4)":"rgba(255,255,255,0.06)"}`,color:dashFiltro===f?"#c8f060":"#555",borderRadius:5,padding:"5px 14px",fontFamily:"DM Mono",fontSize:11,cursor:"pointer"}}>
                  {f==="todos"?"Todo":f}
                </button>
              ))}
            </div>
            <div style={{...S.g4,marginBottom:12}}>
              {[
                {label:"Ingresos",val:fmtN(totalIng),color:"#60f0a0",sub:"Ene–Abr 2026"},
                {label:"Egresos",val:fmtN(totalEgr),color:"#f06060",sub:"Ene–Abr 2026"},
                {label:"Resultado neto",val:fmtN(totalIng-totalEgr),color:(totalIng-totalEgr)>=0?"#c8f060":"#f06060",sub:"Ene–Abr 2026"},
                {label:"Registros",val:"671",color:"#60c8f0",sub:"16 negocio · 655 personal"},
              ].map(k=>(
                <div key={k.label} style={S.card}>
                  <div style={{...S.lbl,marginBottom:6}}>{k.label}</div>
                  <div style={{fontFamily:"Syne",fontSize:20,fontWeight:800,color:k.color,marginBottom:3}}>{k.val}</div>
                  <div style={{fontSize:10,color:"#444"}}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div style={{...S.g2,marginBottom:12}}>
              <div style={S.card}>
                <div style={S.secT}>Flujo mensual</div>
                <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
                  {MESES_DISP.map(m=>{
                    const v=monthly[m]||{ing:0,egr:0};
                    const selStyle2 = {background:"#1c1c26",border:"1px solid rgba(255,255,255,0.1)",borderRadius:5,color:"#ede8e0",fontFamily:"DM Mono",fontSize:11,padding:"5px 8px",cursor:"pointer"};
          const dropZone = (ref, label, tipo, active) => (
            <div style={{border:"1.5px dashed rgba(255,255,255,0.12)",borderRadius:8,padding:32,textAlign:"center",cursor:active?"pointer":"not-allowed",opacity:active?1:0.5,marginBottom:12}}
              onClick={()=>active&&ref.current.click()}
              onMouseEnter={e=>active&&(e.currentTarget.style.borderColor="rgba(200,240,96,0.4)")}
              onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.12)")}>
              <div style={{fontSize:28,marginBottom:8}}>{tipo==="banco"?"🏦":"💳"}</div>
              <div style={{fontSize:13,color:"#888"}}>{fileName||label}</div>
              <div style={{fontSize:11,color:"#444",marginTop:4}}>PDF · Excel · CSV</div>
              <input ref={ref} type="file" accept=".csv,.txt,.pdf,.xls,.xlsx" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],tipo)}/>
            </div>
          );

          return (
                      <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
                        <div style={{width:"100%",display:"flex",gap:2,alignItems:"flex-end",height:72}}>
                          <div style={{flex:1,height:Math.max(Math.round((v.ing/maxBar)*72),2),background:"#60f0a0",borderRadius:"3px 3px 0 0",opacity:.8}} title={fmtN(v.ing)}/>
                          <div style={{flex:1,height:Math.max(Math.round((v.egr/maxBar)*72),2),background:"#f06060",borderRadius:"3px 3px 0 0",opacity:.7}} title={fmtN(v.egr)}/>
                        </div>
                        <div style={{fontSize:9,color:"#444",marginTop:4}}>{MESES_NOM[+m]}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:14,marginTop:10}}>
                  {[["#60f0a0","Ingresos"],["#f06060","Egresos"]].map(([c,l])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#555"}}>
                      <div style={{width:8,height:8,background:c,borderRadius:2}}/>{l}
                    </div>
                  ))}
                </div>
              </div>
              <div style={S.card}>
                <div style={S.secT}>Top gastos</div>
                {Object.entries(AGG.top_gastos).slice(0,6).map(([cat,val])=>(
                  <div key={cat} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60%"}}>{cat}</span>
                      <span style={{fontFamily:"Syne",fontSize:11,fontWeight:700,color:"#f06060"}}>{fmtN(val)}</span>
                    </div>
                    <div style={{height:3,background:"#1c1c26",borderRadius:2}}>
                      <div style={{height:3,width:`${(val/Object.values(AGG.top_gastos)[0])*100}%`,background:"#f06060",borderRadius:2,opacity:.5}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={S.card}>
              <div style={S.secT}>Últimos movimientos</div>
              {AGG.recent.map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:(r.tot||0)>0?"#60f0a0":"#f06060",flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.c1} · {r.c2||r.d}</div>
                    <div style={{fontSize:10,color:"#444"}}>{r.b} · {fmtD(r.f)}</div>
                  </div>
                  <span style={S.badge(r.cat)}>{r.cat}</span>
                  <div style={{fontFamily:"Syne",fontSize:13,fontWeight:700,color:(r.tot||0)>0?"#60f0a0":"#f06060",minWidth:80,textAlign:"right"}}>
                    {(r.tot||0)>0?"+":"-"}{fmtN(r.tot).replace("$ ","")}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── + NUEVO ── */}
        {mainTab==="form" && (()=>{
          const [loadType, setLoadType] = useState("manual");
          const [bancoCarga, setBancoCarga] = useState("");
          const [periodoMes, setPeriodoMes] = useState("4");
          const [periodoAno, setPeriodoAno] = useState("2026");
          const [fileContent, setFileContent] = useState(null);
          const [fileName, setFileName] = useState("");
          const [loadStep, setLoadStep] = useState("upload");
          const [loadMovs, setLoadMovs] = useState([]);
          const [loadError, setLoadError] = useState("");
          const fileRef = useRef(null);
          const fileRef2 = useRef(null);

          const downloadTemplate = () => {
            const headers = ["Fecha","Banco cobra/paga","Tipo","Concepto 1","Concepto 2","Descripcion","Forma cobro/pago","Banco emisor","Plazo dias","USD","TC","Pesos","IVA"];
            const example = ["2026-05-01","Itaú UYU","Personal","Alimentación","Supermercado","Devoto","Pago transferencia","Itaú UYU","0","","","1500",""];
            const csv = [headers.join(","), example.join(",")].join("\n");
            const blob = new Blob([csv], {type:"text/csv"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href=url; a.download="FinCFO_plantilla_carga.csv"; a.click();
          };

          const parseMasiva = (text) => {
            const lines = text.split("\n").filter(l=>l.trim());
            const header = lines[0].split(",");
            const movs = [];
            for(let i=1;i<lines.length;i++){
              const cols = lines[i].split(",");
              if(cols.length<3) continue;
              const get=(name)=>{const idx=header.findIndex(h=>h.toLowerCase().includes(name.toLowerCase()));return idx>=0?(cols[idx]||"").trim():"";};
              const fecha=get("fecha"); const c1=get("concepto 1");
              if(!fecha||!c1) continue;
              const pesos=parseFloat(get("pesos"))||0; const iva=parseFloat(get("iva"))||null;
              movs.push({id:i,f:fecha,m:String(new Date(fecha).getMonth()+1),b:get("banco cobra"),t:get("tipo")||"Personal",c1,c2:get("concepto 2"),cat:TX[get("tipo")||"Personal"]?.[c1]?.cat||"",d:get("descripcion"),fm:get("forma"),be:get("banco emisor"),plazo:get("plazo"),usd:parseFloat(get("usd"))||null,tc:parseFloat(get("tc"))||null,p:pesos,iva,tot:pesos+(iva||0),fechaCP:fecha,status:"ok"});
            }
            return movs;
          };

          const procesarConIA = async (texto, tipo) => {
            setLoadStep("processing");
            const prompt = tipo==="banco"
              ? `Analizá este extracto bancario uruguayo. Para cada movimiento determiná: fecha (YYYY-MM-DD), descripcion, monto (positivo=ingreso/negativo=gasto), moneda (UYU/USD), tipo (Personal/Negocio), concepto1 (de: Ingresos,Ventas,Vivienda,Servicios del hogar,Alimentación,Transporte,Salud,Educación,Cuidado personal,Mascotas,Ocio y cultura,Finanzas,Impuestos y trámites,Regalos y donaciones,Imprevistos,Otros gastos,Gasto de personal,Transferencias,Tarjetas,Pagos,Inversiones,Marketing,Servicios,Personal,Honorarios,Impuestos), concepto2, esPagoTarjeta (true si paga OCA/Visa/Master), confianza (alta/media/baja). Banco: ${bancoCarga}, Período: ${MESES_NOM[+periodoMes]} ${periodoAno}. Respondé SOLO JSON: {"movimientos":[{"fecha":"","descripcion":"","monto":0,"moneda":"UYU","tipo":"Personal","concepto1":"","concepto2":"","esPagoTarjeta":false,"confianza":"alta"}]}`
              : `Analizá este estado de tarjeta de crédito uruguaya. Para cada gasto: fecha (YYYY-MM-DD), descripcion, monto (positivo=gasto), moneda (UYU/USD), tipo (Personal/Negocio), concepto1, concepto2, confianza (alta/media/baja). Ignorá los pagos al banco. Tarjeta: ${bancoCarga}, Período: ${MESES_NOM[+periodoMes]} ${periodoAno}. Respondé SOLO JSON: {"movimientos":[{"fecha":"","descripcion":"","monto":0,"moneda":"UYU","tipo":"Personal","concepto1":"","concepto2":"","confianza":"alta"}],"totalTarjeta":0}`;
            try {
              const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`${prompt}\n\nArchivo:\n${texto.slice(0,4000)}`}]})});
              const data = await res.json();
              const raw = data.content?.[0]?.text||"";
              const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
              const movs = (parsed.movimientos||[]).map((m,i)=>({id:i+1,f:m.fecha,m:String(new Date(m.fecha||"2026-01-01").getMonth()+1),b:bancoCarga,t:m.tipo||"Personal",c1:m.concepto1,c2:m.concepto2||"",cat:TX[m.tipo||"Personal"]?.[m.concepto1]?.cat||"",d:m.descripcion,fm:tipo==="banco"?"Pago transferencia":"Pago crédito",be:bancoCarga,plazo:"0",p:Math.abs(m.monto||0),iva:null,tot:m.monto||0,moneda:m.moneda||"UYU",esPagoTarjeta:m.esPagoTarjeta||false,confianza:m.confianza||"alta",status:m.confianza==="baja"?"revisar":"ok",pendiente:m.esPagoTarjeta||false}));
              setLoadMovs(movs); setLoadStep("review");
            } catch(e) { setLoadError("Error al procesar con IA. Verificá el archivo."); setLoadStep("upload"); }
          };

          const handleFile = async (file, tipo) => {
            setFileName(file.name); setLoadError("");
            const text = await file.text();
            if(tipo==="masiva"){ setLoadMovs(parseMasiva(text)); setLoadStep("review"); }
            else await procesarConIA(text, tipo);
          };

          const confirmar = () => {
            const nuevos = loadMovs.filter(m=>!m.pendiente).map(m=>({...m,id:Date.now()+m.id}));
            setRegs(prev=>[...nuevos,...prev]);
            setLoadStep("done"); setLoadMovs([]);
          };

          const updateMov = (id,field,val) => setLoadMovs(prev=>prev.map(m=>m.id===id?{...m,[field]:val}:m));

          return (
          <>
            <div style={{fontFamily:"Syne",fontSize:18,fontWeight:800,marginBottom:4}}>Nuevo registro</div>
            <div style={{color:"#555",fontSize:12,marginBottom:16}}>Elegí cómo querés cargar</div>

            {/* Selector de modo */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
              {[{k:"manual",icon:"✏️",title:"Manual",desc:"Un registro a mano"},{k:"masiva",icon:"📊",title:"Carga masiva",desc:"Excel con muchos registros"},{k:"banco",icon:"🏦",title:"Extracto bancario",desc:"La IA categoriza"},{k:"tarjeta",icon:"💳",title:"Tarjeta de crédito",desc:"La IA categoriza"}].map(opt=>(
                <div key={opt.k} onClick={()=>{setLoadType(opt.k);setLoadStep("upload");setLoadMovs([]);setLoadError("");}}
                  style={{...S.card,cursor:"pointer",border:`1px solid ${loadType===opt.k?"rgba(200,240,96,0.4)":"rgba(255,255,255,0.06)"}`,background:loadType===opt.k?"rgba(200,240,96,0.06)":"#131318"}}>
                  <div style={{fontSize:22,marginBottom:6}}>{opt.icon}</div>
                  <div style={{fontFamily:"Syne",fontSize:12,fontWeight:700,color:loadType===opt.k?"#c8f060":"#ede8e0",marginBottom:3}}>{opt.title}</div>
                  <div style={{fontSize:10,color:"#555"}}>{opt.desc}</div>
                </div>
              ))}
            </div>

            {/* ── CARGA MASIVA ── */}
            {loadType==="masiva" && loadStep==="upload" && (
              <div style={S.card}>
                <div style={S.secT}>Carga masiva</div>
                <p style={{fontSize:12,color:"#888",marginBottom:16}}>Descargá la plantilla, completala y subila. Ideal para carga inicial histórica.</p>
                <button onClick={downloadTemplate} style={{background:"rgba(200,240,96,0.1)",border:"1px solid rgba(200,240,96,0.3)",borderRadius:6,color:"#c8f060",fontFamily:"Syne",fontSize:13,fontWeight:700,padding:"10px 20px",cursor:"pointer",marginBottom:20,display:"block"}}>⬇ Descargar plantilla CSV</button>
                <div style={{border:"1.5px dashed rgba(255,255,255,0.12)",borderRadius:8,padding:32,textAlign:"center",cursor:"pointer"}} onClick={()=>fileRef.current.click()}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(200,240,96,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"}>
                  <div style={{fontSize:28,marginBottom:8}}>📂</div>
                  <div style={{fontSize:13,color:"#888"}}>{fileName||"Subir CSV completado"}</div>
                  <input ref={fileRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],"masiva")}/>
                </div>
                {loadError&&<div style={{color:"#f06060",fontSize:12,marginTop:10}}>{loadError}</div>}
              </div>
            )}

            {/* ── BANCO / TARJETA — UPLOAD ── */}
            {(loadType==="banco"||loadType==="tarjeta") && loadStep==="upload" && (
              <div style={S.card}>
                <div style={S.secT}>{loadType==="banco"?"Estado de cuenta bancario":"Estado de cuenta de tarjeta"}</div>
                <div style={{...S.g3,marginBottom:16}}>
                  <div>
                    <label style={S.lbl}>{loadType==="banco"?"Banco":"Tarjeta"}</label>
                    <select value={bancoCarga} onChange={e=>setBancoCarga(e.target.value)} style={S.sel}>
                      <option value="">— seleccionar —</option>
                      {(loadType==="banco"?bancosActivos:tarjetasActivas).map(b=><option key={b}>{b}</option>)}
                    </select>
                    {!bancoCarga&&<div style={{fontSize:10,color:"#f06060",marginTop:4}}>Crealo primero en ⚙ Configuración</div>}
                  </div>
                  <div><label style={S.lbl}>Mes</label>
                    <select value={periodoMes} onChange={e=>setPeriodoMes(e.target.value)} style={S.sel}>
                      {["1","2","3","4","5","6","7","8","9","10","11","12"].map(m=><option key={m} value={m}>{MESES_NOM[+m]}</option>)}
                    </select>
                  </div>
                  <div><label style={S.lbl}>Año</label><input type="number" value={periodoAno} onChange={e=>setPeriodoAno(e.target.value)} style={S.inp}/></div>
                </div>
                {dropZone(fileRef2, `Subir ${loadType==="banco"?"extracto bancario":"estado de tarjeta"}`, loadType, !!bancoCarga)}
                {loadError&&<div style={{color:"#f06060",fontSize:12,marginTop:10}}>{loadError}</div>}
              </div>
            )}

            {/* ── PROCESANDO ── */}
            {loadStep==="processing" && (
              <div style={{...S.card,textAlign:"center",padding:48}}>
                <div style={{fontFamily:"Syne",fontSize:16,fontWeight:700,marginBottom:8}}>Procesando con IA...</div>
                <div style={{fontSize:12,color:"#555",marginBottom:28}}>Leyendo movimientos y categorizando</div>
                <div style={{display:"flex",justifyContent:"center",gap:6}}>
                  {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#c8f060",animation:`bounce 1.2s ${i*0.2}s ease-in-out infinite`}}/>)}
                </div>
                <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.3}40%{transform:translateY(-8px);opacity:1}}`}</style>
              </div>
            )}

            {/* ── REVISIÓN ── */}
            {loadStep==="review" && (
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
                  {[{l:"Detectados",v:loadMovs.length,c:"#ede8e0"},{l:"Confianza alta",v:loadMovs.filter(m=>m.confianza==="alta"||!m.confianza).length,c:"#60f0a0"},{l:"A revisar",v:loadMovs.filter(m=>m.confianza&&m.confianza!=="alta").length,c:"#f0a060"},{l:"Pagos tarjeta",v:loadMovs.filter(m=>m.esPagoTarjeta).length,c:"#c860f0"}].map(k=>(
                    <div key={k.l} style={S.card}><div style={{...S.lbl,marginBottom:4}}>{k.l}</div><div style={{fontFamily:"Syne",fontSize:20,fontWeight:800,color:k.c}}>{k.v}</div></div>
                  ))}
                </div>
                <div style={{...S.card,padding:0,marginBottom:12}}>
                  <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{fontFamily:"Syne",fontSize:13,fontWeight:700,marginBottom:4}}>Revisá y ajustá si es necesario</div>
                    {loadMovs.some(m=>m.esPagoTarjeta)&&<div style={{fontSize:11,color:"#c860f0"}}>💳 Los pagos de tarjeta quedarán pendientes de conciliación</div>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"80px 1fr 140px 100px 80px",gap:4,padding:"6px 10px",fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:0.5}}>
                    <div>Fecha</div><div>Descripción</div><div>Concepto 1</div><div>Tipo</div><div style={{textAlign:"right"}}>Monto</div>
                  </div>
                  {loadMovs.map(m=>(
                    <div key={m.id} style={{display:"grid",gridTemplateColumns:"80px 1fr 140px 100px 80px",gap:4,padding:"7px 10px",borderTop:"1px solid rgba(255,255,255,0.03)",background:m.esPagoTarjeta?"rgba(200,96,240,0.05)":m.confianza==="baja"?"rgba(240,160,96,0.05)":"transparent",alignItems:"center"}}>
                      <div style={{fontSize:11,color:"#555"}}>{fmtD(m.f)}</div>
                      <div>
                        <div style={{fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.d}</div>
                        <div style={{display:"flex",gap:4,marginTop:2}}>
                          {m.esPagoTarjeta&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:"rgba(200,96,240,0.2)",color:"#c860f0"}}>💳 pendiente</span>}
                          {m.confianza==="baja"&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:"rgba(240,160,96,0.2)",color:"#f0a060"}}>⚠ revisar</span>}
                        </div>
                      </div>
                      <select value={m.c1||""} onChange={e=>updateMov(m.id,"c1",e.target.value)}
                        style={{background:"#1c1c26",border:`1px solid ${m.confianza==="baja"?"rgba(240,160,96,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:4,color:m.confianza==="baja"?"#f0a060":"#ede8e0",fontFamily:"DM Mono",fontSize:10,padding:"3px 6px",cursor:"pointer"}}>
                        {Object.keys(TX[m.t||"Personal"]||TX.Personal).map(c=><option key={c}>{c}</option>)}
                      </select>
                      <select value={m.t||"Personal"} onChange={e=>updateMov(m.id,"t",e.target.value)}
                        style={{background:"#1c1c26",border:"1px solid rgba(255,255,255,0.08)",borderRadius:4,color:"#ede8e0",fontFamily:"DM Mono",fontSize:10,padding:"3px 6px",cursor:"pointer"}}>
                        <option>Personal</option><option>Negocio</option>
                      </select>
                      <div style={{fontFamily:"Syne",fontSize:12,fontWeight:700,textAlign:"right",color:(m.tot||0)>0?"#60f0a0":"#f06060"}}>
                        {(m.tot||0)>0?"+":"-"}{fmtN(Math.abs(m.tot||0)).replace("$ ","")}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>setLoadStep("upload")} style={{background:"#131318",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#555",fontFamily:"DM Mono",fontSize:12,padding:"10px 20px",cursor:"pointer"}}>← Volver</button>
                  <button onClick={confirmar} style={{flex:1,background:"#c8f060",color:"#09090d",border:"none",borderRadius:8,padding:13,fontFamily:"Syne",fontSize:14,fontWeight:800,cursor:"pointer"}}>
                    Confirmar — registrar {loadMovs.filter(m=>!m.esPagoTarjeta).length} · dejar {loadMovs.filter(m=>m.esPagoTarjeta).length} pendientes →
                  </button>
                </div>
              </>
            )}

            {/* ── HECHO ── */}
            {loadStep==="done" && (
              <div style={{...S.card,textAlign:"center",padding:40}}>
                <div style={{fontSize:32,marginBottom:12}}>✓</div>
                <div style={{fontFamily:"Syne",fontSize:18,fontWeight:800,color:"#60f0a0",marginBottom:8}}>Registros importados</div>
                {(loadType==="banco"||loadType==="tarjeta")&&<div style={{fontSize:12,color:"#555",marginBottom:16}}>Los pagos de tarjeta quedaron pendientes — cargá el estado de la tarjeta para conciliarlos</div>}
                <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                  <button onClick={()=>{setLoadStep("upload");setFileName("");setBancoCarga("");}} style={{background:"#131318",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#888",fontFamily:"DM Mono",fontSize:12,padding:"8px 20px",cursor:"pointer"}}>Cargar otro</button>
                  {loadType==="banco"&&<button onClick={()=>{setLoadType("tarjeta");setLoadStep("upload");}} style={{background:"rgba(200,96,240,0.15)",border:"1px solid rgba(200,96,240,0.3)",borderRadius:6,color:"#c860f0",fontFamily:"DM Mono",fontSize:12,padding:"8px 20px",cursor:"pointer"}}>💳 Cargar tarjeta</button>}
                </div>
              </div>
            )}

            {/* ── REGISTRO MANUAL ── */}
            {loadType==="manual" && loadStep==="upload" && (
              <>
            <div style={{fontFamily:"Syne",fontSize:18,fontWeight:800,marginBottom:4}}>Nuevo registro</div>
            <div style={{color:"#555",fontSize:12,marginBottom:16}}>Los campos * se calculan automáticamente (modo manual)</div>
            <div style={S.card}>
              <div style={S.secT}>Identificación</div>
              <div style={{...S.g5,marginBottom:12}}>
                <div><label style={S.lbl}>Fecha</label><input type="date" style={S.inp} value={form.fecha} onChange={e=>setF("fecha",e.target.value)}/></div>
                <div><label style={S.lbl}>Año *</label><div style={S.calc}>{anoF||"—"}</div></div>
                <div><label style={S.lbl}>Mes *</label><div style={S.calc}>{mesF||"—"}</div></div>
                <div><label style={S.lbl}>Banco cobra/paga</label>
                  <select style={S.sel} value={form.bancoCobPag} onChange={e=>setF("bancoCobPag",e.target.value)}>
                    <option value="">—</option>{bancosActivos.map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
                <div><label style={S.lbl}>Tipo</label>
                  <select style={S.sel} value={form.tipo} onChange={e=>setF("tipo",e.target.value)}>
                    <option>Personal</option><option>Negocio</option>
                  </select>
                </div>
              </div>
              <div style={{...S.g3,marginBottom:12}}>
                <div><label style={S.lbl}>Concepto 1</label>
                  <select style={S.sel} value={form.c1} onChange={e=>setF("c1",e.target.value)}>
                    {c1Opts.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={S.lbl}>Concepto 2</label>
                  <select style={S.sel} value={form.c2} onChange={e=>setF("c2",e.target.value)}>
                    {c2Opts.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={S.lbl}>Categoría *</label>
                  <div style={{...S.calc,fontSize:12,paddingTop:9}}><span style={S.badge(catAuto)}>{catAuto||"—"}</span></div>
                </div>
              </div>
              <div><label style={S.lbl}>Descripción</label><input type="text" style={S.inp} value={form.desc} placeholder="Descripción libre..." onChange={e=>setF("desc",e.target.value)}/></div>
            </div>
            <div style={S.card}>
              <div style={S.secT}>Forma de cobro / pago</div>
              <div style={S.g4}>
                <div><label style={S.lbl}>Forma</label>
                  <select style={S.sel} value={form.forma} onChange={e=>setF("forma",e.target.value)}>
                    {FORMAS.map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
                <div><label style={S.lbl}>Banco emisor</label>
                  <select style={S.sel} value={form.bancoEmisor} onChange={e=>setF("bancoEmisor",e.target.value)}>
                    <option value="">—</option>{mediosPago.map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
                <div><label style={S.lbl}>Plazo (días)</label><input type="number" style={S.inp} value={form.plazo} min="0" placeholder="0" onChange={e=>setF("plazo",e.target.value)}/></div>
                <div>
                  <label style={S.lbl}>Fecha cobro/pago</label>
                  <div style={{display:"flex",gap:6,marginBottom:6}}>
                    <button onClick={()=>setForm(p=>({...p,fechaManual:false}))}
                      style={{background:!form.fechaManual?"rgba(200,240,96,0.15)":"#1c1c26",border:`1px solid ${!form.fechaManual?"rgba(200,240,96,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:4,color:!form.fechaManual?"#c8f060":"#555",fontFamily:"DM Mono",fontSize:10,padding:"4px 10px",cursor:"pointer"}}>
                      ● Auto
                    </button>
                    <button onClick={()=>setForm(p=>({...p,fechaManual:true,fechaCP:fechaCPCalc||p.fecha}))}
                      style={{background:form.fechaManual?"rgba(200,240,96,0.15)":"#1c1c26",border:`1px solid ${form.fechaManual?"rgba(200,240,96,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:4,color:form.fechaManual?"#c8f060":"#555",fontFamily:"DM Mono",fontSize:10,padding:"4px 10px",cursor:"pointer"}}>
                      ✎ Manual
                    </button>
                  </div>
                  {form.fechaManual ? (
                    <input key="manual" type="date" style={{...S.inp,color:"#c8f060"}}
                      defaultValue={fechaCPCalc||form.fecha}
                      onChange={e=>setForm(p=>({...p,fechaCP:e.target.value}))}/>
                  ) : (
                    <div style={{...S.calc,fontSize:12}}>{fmtD(fechaCPCalc)||"completá fecha y plazo"}</div>
                  )}
                </div>
              </div>
            </div>
            <div style={S.card}>
              <div style={S.secT}>Montos</div>
              <div style={S.g5}>
                <div><label style={S.lbl}>USD</label><input type="number" style={S.inp} value={form.usd} placeholder="0.00" step="0.01" onChange={e=>setF("usd",e.target.value)}/></div>
                <div><label style={S.lbl}>TC</label><input type="number" style={S.inp} value={form.tc} placeholder="ej: 41.50" step="0.01" onChange={e=>setF("tc",e.target.value)}/></div>
                <div><label style={S.lbl}>$ UYU {form.usd&&form.tc?"*":""}</label>
                  {form.usd&&form.tc?<div style={S.calc}>{fmtN(pesosCalc)}</div>:<input type="number" style={S.inp} value={form.pesos} placeholder="0.00" step="0.01" onChange={e=>setF("pesos",e.target.value)}/>}
                </div>
                <div><label style={S.lbl}>IVA ($)</label><input type="number" style={S.inp} value={form.iva} placeholder="0.00" step="0.01" onChange={e=>setF("iva",e.target.value)}/></div>
                <div><label style={S.lbl}>Total * (UYU)</label>
                  <div style={{...S.calc,color:["Ingresos","Cobros"].includes(catAuto)?"#60f0a0":"#f06060"}}>{fmtN(totalCalc)}</div>
                </div>
              </div>
            </div>
            <button onClick={submit} style={{width:"100%",background:saved?"#60f0a0":"#c8f060",color:"#09090d",border:"none",borderRadius:8,padding:13,fontFamily:"Syne",fontSize:14,fontWeight:800,cursor:"pointer",transition:"background .3s"}}>
              {saved?"✓ Guardado":"Guardar registro →"}
            </button>
              </>
            )}
          </>;
        })()}

        {/* ── REGISTROS ── */}
        {mainTab==="registros" && (()=>{
          const ALL_COLS = [
            {id:"fecha",      label:"Fecha"},
            {id:"tipo",       label:"Tipo"},
            {id:"banco",      label:"Banco C/P"},
            {id:"categoria",  label:"Categoría"},
            {id:"concepto",   label:"Concepto"},
            {id:"descripcion",label:"Descripción"},
            {id:"forma",      label:"Forma cobro/pago"},
            {id:"bancoEmisor",label:"Banco emisor"},
            {id:"plazo",      label:"Plazo (días)"},
            {id:"fechaCP",    label:"Fecha cobro/pago"},
            {id:"moneda",     label:"Moneda"},
            {id:"tc",         label:"Tipo de cambio"},
            {id:"subtotal",   label:"Subtotal (sin IVA)"},
            {id:"iva",        label:"IVA"},
            {id:"total",      label:"Total (con IVA)"},
          ];
          const vc = visibleCols;
          const toggleCol = (id) => setVisibleCols(prev=>prev.includes(id)?prev.filter(c=>c!==id):[...prev,id]);

          const filteredRegs = regs.filter(r=>{
            if(filterTipo!=="todos"&&r.t!==filterTipo) return false;
            if(searchQ&&!(r.d+r.c1+r.c2+r.b).toLowerCase().includes(searchQ.toLowerCase())) return false;
            return true;
          }).slice(0,80);

          const startEdit = (r) => { setEditingId(r.id); setEditFechaCP(r.fechaCP||r.f||""); };
          const saveEdit = (id) => {
            setRegs(prev=>prev.map(r=>r.id===id?{...r,fechaCP:editFechaCP}:r));
            setEditingId(null);
          };

          return (
            <>
              {/* Toolbar */}
              <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Buscar..." style={{...S.inp,width:160,padding:"5px 10px"}}/>
                {["todos","Negocio","Personal"].map(t=>(
                  <button key={t} onClick={()=>setFilterTipo(t)}
                    style={{background:filterTipo===t?"rgba(200,240,96,0.1)":"#131318",border:`1px solid ${filterTipo===t?"rgba(200,240,96,0.35)":"rgba(255,255,255,0.06)"}`,color:filterTipo===t?"#c8f060":"#555",borderRadius:4,padding:"4px 10px",fontFamily:"DM Mono",fontSize:10,cursor:"pointer"}}>
                    {t}
                  </button>
                ))}

                {/* Selector de columnas */}
                <div style={{position:"relative",marginLeft:4}} ref={colDropRef}>
                  <button onClick={()=>setColDropOpen(o=>!o)}
                    style={{background:"#131318",border:"1px solid rgba(255,255,255,0.1)",borderRadius:5,color:"#888",fontFamily:"DM Mono",fontSize:10,padding:"5px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                    ⊞ Columnas ({vc.length}) <span style={{fontSize:8,opacity:0.6}}>{colDropOpen?"▲":"▼"}</span>
                  </button>
                  {colDropOpen&&(
                    <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,background:"#1c1c26",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,zIndex:999,minWidth:200,padding:"6px 0",boxShadow:"0 12px 32px rgba(0,0,0,0.7)"}}>
                      {ALL_COLS.map(col=>{
                        const on=vc.includes(col.id);
                        return (
                          <div key={col.id} onClick={()=>toggleCol(col.id)}
                            style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",cursor:"pointer",fontSize:11,color:on?"#c8f060":"#888"}}
                            onMouseEnter={e=>e.currentTarget.style.background="rgba(200,240,96,0.07)"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <span style={{width:12,height:12,borderRadius:2,border:`1px solid ${on?"#c8f060":"rgba(255,255,255,0.2)"}`,background:on?"#c8f060":"transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#0d0d10",flexShrink:0}}>{on?"✓":""}</span>
                            {col.label}
                          </div>
                        );
                      })}
                      <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"6px 12px",display:"flex",gap:6}}>
                        <button onClick={()=>setVisibleCols(ALL_COLS.map(c=>c.id))} style={{flex:1,background:"rgba(200,240,96,0.08)",border:"1px solid rgba(200,240,96,0.2)",borderRadius:4,color:"#c8f060",fontFamily:"DM Mono",fontSize:10,padding:"4px",cursor:"pointer"}}>Todas</button>
                        <button onClick={()=>setVisibleCols(["fecha","tipo","banco","categoria","concepto","descripcion","subtotal","total"])} style={{flex:1,background:"#1a1a24",border:"1px solid rgba(255,255,255,0.08)",borderRadius:4,color:"#555",fontFamily:"DM Mono",fontSize:10,padding:"4px",cursor:"pointer"}}>Reset</button>
                        <button onClick={()=>setColDropOpen(false)} style={{flex:1,background:"rgba(200,240,96,0.12)",border:"1px solid rgba(200,240,96,0.35)",borderRadius:4,color:"#c8f060",fontFamily:"DM Mono",fontSize:10,padding:"4px",cursor:"pointer",fontWeight:700}}>Aplicar →</button>
                      </div>
                    </div>
                  )}
                </div>

                <span style={{marginLeft:"auto",fontSize:11,color:"#555"}}>{filteredRegs.length} registros</span>
              </div>

              {/* Tabla con scroll horizontal */}
              <div style={{...S.card,padding:0,overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                      {ALL_COLS.filter(c=>vc.includes(c.id)).map(c=>(
                        <th key={c.id} style={{textAlign:c.id==="total"?"right":"left",padding:"7px 10px",fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:0.5,whiteSpace:"nowrap",background:"#131318",position:c.id==="fecha"?"sticky":undefined,left:c.id==="fecha"?0:undefined,zIndex:c.id==="fecha"?1:undefined}}>
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegs.map(r=>{
                      const isPos=(r.tot||0)>0;
                      return (
                        <tr key={r.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="#1c1c26"; const ic=e.currentTarget.querySelector('.edit-ic'); if(ic)ic.style.opacity="1";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent"; const ic=e.currentTarget.querySelector('.edit-ic'); if(ic)ic.style.opacity="0";}}>
                          {vc.includes("fecha")&&<td style={{padding:"7px 10px",fontSize:11,color:"#555",whiteSpace:"nowrap",background:"#131318",position:"sticky",left:0}}>{fmtD(r.f)}</td>}
                          {vc.includes("tipo")&&<td style={{padding:"7px 10px"}}><span style={S.pill(r.t==="Negocio"?"#60c8f0":"#c8f060")}>{r.t}</span></td>}
                          {vc.includes("banco")&&<td style={{padding:"7px 10px",fontSize:11,color:"#666",whiteSpace:"nowrap",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis"}}>{r.b||"—"}</td>}
                          {vc.includes("categoria")&&<td style={{padding:"7px 10px"}}><span style={S.badge(r.cat)}>{(r.cat||"").slice(0,10)}</span></td>}
                          {vc.includes("concepto")&&<td style={{padding:"7px 10px",fontSize:12,whiteSpace:"nowrap",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis"}}>{r.c1}{r.c2?` · ${r.c2}`:""}</td>}
                          {vc.includes("descripcion")&&<td style={{padding:"7px 10px",fontSize:11,color:"#666",whiteSpace:"nowrap",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis"}}>{r.d||"—"}</td>}
                          {vc.includes("forma")&&<td style={{padding:"7px 10px",fontSize:11,color:"#666",whiteSpace:"nowrap"}}>{r.fm||"—"}</td>}
                          {vc.includes("bancoEmisor")&&<td style={{padding:"7px 10px",fontSize:11,color:"#666",whiteSpace:"nowrap"}}>{r.be||"—"}</td>}
                          {vc.includes("plazo")&&<td style={{padding:"7px 10px",fontSize:11,color:"#666",textAlign:"right"}}>{r.plazo||"—"}</td>}
                          {vc.includes("fechaCP")&&<td style={{padding:"4px 6px",whiteSpace:"nowrap"}}>
                            {editingId===r.id ? (
                              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                                <input
                                  type="date"
                                  value={editFechaCP}
                                  onChange={e=>setEditFechaCP(e.target.value)}
                                  autoFocus
                                  style={{background:"#1c1c26",border:"1px solid #c8f060",borderRadius:4,color:"#c8f060",fontFamily:"DM Mono",fontSize:11,padding:"3px 6px",outline:"none",width:130}}
                                />
                                <button onClick={()=>saveEdit(r.id)} style={{background:"#c8f060",border:"none",borderRadius:3,color:"#09090d",fontFamily:"DM Mono",fontSize:10,padding:"3px 7px",cursor:"pointer",fontWeight:700}}>✓</button>
                                <button onClick={()=>setEditingId(null)} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:3,color:"#555",fontFamily:"DM Mono",fontSize:10,padding:"3px 6px",cursor:"pointer"}}>✕</button>
                              </div>
                            ) : (
                              <div style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={()=>startEdit(r)}>
                                <span style={{fontSize:11,color:"#60c8f0"}}>{r.fechaCP?fmtD(r.fechaCP):"—"}</span>
                                <span className="edit-ic" style={{fontSize:9,color:"#c8f060",opacity:0,transition:"opacity 0.1s"}}>✎</span>
                              </div>
                            )}
                          </td>}
                          {vc.includes("moneda")&&<td style={{padding:"7px 10px",fontSize:11,color:"#666"}}>{r.usd?"USD":"UYU"}</td>}
                          {vc.includes("tc")&&<td style={{padding:"7px 10px",fontSize:11,color:"#666",textAlign:"right"}}>{r.tc||"—"}</td>}
                          {vc.includes("subtotal")&&<td style={{padding:"7px 10px",fontFamily:"Syne",fontSize:11,fontWeight:600,textAlign:"right",color:isPos?"#60f0a0":"#f06060",whiteSpace:"nowrap"}}>{r.p!=null?(isPos?"+":"-")+fmtN(r.p).replace("$ ",""):"—"}</td>}
                          {vc.includes("iva")&&<td style={{padding:"7px 10px",fontSize:11,color:"#f0a060",textAlign:"right"}}>{r.iva?fmtN(r.iva).replace("$ ",""):"—"}</td>}
                          {vc.includes("total")&&<td style={{padding:"7px 10px",fontFamily:"Syne",fontSize:12,fontWeight:700,textAlign:"right",color:isPos?"#60f0a0":"#f06060",whiteSpace:"nowrap"}}>{isPos?"+":"-"}{fmtN(r.tot).replace("$ ","")}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}

        {/* ── INFORMES ── */}
        {mainTab==="informes" && (
          <>
            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              {[["rentabilidad","Rentabilidad negocio"],["flujo","Flujo de fondos"],["personal","Finanzas personales"],["conciliacion","Conciliación bancaria"]].map(([k,l])=>(
                <button key={k} onClick={()=>setReportTab(k)}
                  style={{background:reportTab===k?"rgba(200,240,96,0.1)":"#131318",border:`1px solid ${reportTab===k?"rgba(200,240,96,0.35)":"rgba(255,255,255,0.06)"}`,color:reportTab===k?"#c8f060":"#555",borderRadius:5,padding:"7px 14px",fontFamily:"DM Mono",fontSize:11,cursor:"pointer"}}>
                  {l}
                </button>
              ))}
            </div>

            {/* ── RENTABILIDAD ── */}
            {reportTab==="rentabilidad" && (()=>{
              const PIVOT_RENT = {"Ventas":{},"Ingresos":{"4":37670.9},"Costos":{},"Comisiones":{},"Transporte":{},"Marketing":{"1":-11700.0,"2":-46800.0,"4":-29403.0},"Personal":{},"Servicios":{"2":-1402.05},"Licencias / suscripciones":{"4":-4680.53},"Alquileres":{},"Mantenimiento":{},"Honorarios":{},"Capacitación":{},"Otros gastos":{},"Intereses":{},"Impuestos":{}};

              const GRUPOS_RENT={"Ingresos":["Ventas","Ingresos"],"Gastos variables":["Costos","Comisiones","Transporte","Marketing"],"Gastos fijos":["Personal","Servicios","Licencias / suscripciones","Alquileres","Mantenimiento","Honorarios","Capacitación","Otros gastos"],"Intereses":["Intereses"],"Impuesto a la renta":["Impuestos"]};
              const GRUPO_RENT_COLOR={"Ingresos":"#60f0a0","Gastos variables":"#f0a060","Gastos fijos":"#f06060","Intereses":"#f06090","Impuesto a la renta":"#cc6060"};
              const GRUPO_RENT_BG={"Ingresos":"rgba(96,240,160,0.05)","Gastos variables":"rgba(240,160,96,0.05)","Gastos fijos":"rgba(240,96,96,0.05)","Intereses":"rgba(240,96,144,0.05)","Impuesto a la renta":"rgba(200,96,96,0.05)"};

              const pvR = (c1,m) => PIVOT_RENT[c1]?.[m]||0;
              const rowTotR = (c1) => MESES_DISP.reduce((s,m)=>s+pvR(c1,m),0);
              const grupoTotRMes = (g,m) => (GRUPOS_RENT[g]||[]).reduce((s,c1)=>s+pvR(c1,m),0);
              const grupoTotR = (g) => MESES_DISP.reduce((s,m)=>s+grupoTotRMes(g,m),0);

              // Resultado antes de impuesto = todo excepto impuestos
              const resAntesMes = (m) => ["Ingresos","Gastos variables","Gastos fijos","Intereses"].reduce((s,g)=>s+grupoTotRMes(g,m),0);
              const resAntes = MESES_DISP.reduce((s,m)=>s+resAntesMes(m),0);

              // Resultado final = resultado antes + impuestos
              const resFinalMes = (m) => resAntesMes(m) + grupoTotRMes("Impuesto a la renta",m);
              const resFinal = MESES_DISP.reduce((s,m)=>s+resFinalMes(m),0);

              const ingresos = grupoTotR("Ingresos");
              const gastos = grupoTotR("Gastos variables")+grupoTotR("Gastos fijos");
              const margen = ingresos>0?((ingresos+gastos)/ingresos*100).toFixed(1):0;

              return (
                <>
                  <div style={{fontSize:11,color:"#555",marginBottom:14}}>Movimientos NEGOCIO · por fecha de transacción · sin IVA</div>

                  {/* KPIs */}
                  <div style={{...S.g4,marginBottom:14}}>
                    {[
                      {label:"Ingresos",val:fmtN(ingresos),color:"#60f0a0"},
                      {label:"Gastos totales",val:fmtN(Math.abs(gastos)),color:"#f06060"},
                      {label:`Margen bruto`,val:`${margen}%`,color:"#60c8f0"},
                      {label:"Resultado neto",val:(resFinal>=0?"+":"-")+fmtN(Math.abs(resFinal)),color:resFinal>=0?"#c8f060":"#f06060"},
                    ].map(k=>(
                      <div key={k.label} style={S.card}>
                        <div style={{...S.lbl,marginBottom:6}}>{k.label}</div>
                        <div style={{fontFamily:"Syne",fontSize:18,fontWeight:800,color:k.color}}>{k.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tabla pivot */}
                  <div style={{...S.card,padding:0,overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                          <th style={{textAlign:"left",padding:"8px 12px",fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:0.7,background:"#131318",position:"sticky",left:0,zIndex:1,minWidth:200}}>Concepto</th>
                          {MESES_DISP.map(m=><th key={m} style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#555",textTransform:"uppercase",minWidth:110,whiteSpace:"nowrap"}}>{MESES_NOM[+m]}</th>)}
                          <th style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#888",textTransform:"uppercase",minWidth:110,fontWeight:700,borderLeft:"1px solid rgba(255,255,255,0.08)"}}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(GRUPOS_RENT).map(([grupo,filas])=>{
                          const color=GRUPO_RENT_COLOR[grupo];
                          const bg=GRUPO_RENT_BG[grupo];
                          const gTot=grupoTotR(grupo);
                          const filasOrd=grupo==="Ingresos"?filas:[...filas].sort((a,b)=>Math.abs(rowTotR(b))-Math.abs(rowTotR(a)));
                          return [
                            // Header grupo
                            <tr key={`hdr-${grupo}`} style={{background:bg,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                              <td colSpan={MESES_DISP.length+2} style={{padding:"6px 12px",fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:1,background:bg,position:"sticky",left:0}}>
                                {grupo}
                              </td>
                            </tr>,
                            // Filas
                            ...filasOrd.map((c1,i)=>{
                              const rt=rowTotR(c1);
                              const hasData=MESES_DISP.some(m=>pvR(c1,m)!==0);
                              return (
                                <tr key={c1} style={{borderBottom:"1px solid rgba(255,255,255,0.03)",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}
                                  onMouseEnter={e=>e.currentTarget.style.background="rgba(200,240,96,0.04)"}
                                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":"rgba(255,255,255,0.01)"}>
                                  <td style={{padding:"5px 12px 5px 20px",fontSize:12,color:hasData?"#ede8e0":"#333",background:"#131318",position:"sticky",left:0,borderRight:"1px solid rgba(255,255,255,0.06)"}}>{c1}</td>
                                  {MESES_DISP.map(m=>{const v=pvR(c1,m);return <td key={m} style={cellSt(v)}>{fmtCell(v)}</td>;})}
                                  <td style={{...cellSt(rt),borderLeft:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)",fontWeight:700}}>{fmtCell(rt)}</td>
                                </tr>
                              );
                            }),
                            // Subtotal grupo
                            <tr key={`sub-${grupo}`} style={{borderTop:"1px solid rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.04)",background:bg}}>
                              <td style={{padding:"6px 12px",fontSize:11,fontWeight:700,color,background:bg,position:"sticky",left:0,borderRight:"1px solid rgba(255,255,255,0.06)"}}>Total {grupo}</td>
                              {MESES_DISP.map(m=>{const v=grupoTotRMes(grupo,m);return <td key={m} style={{...cellSt(v),fontFamily:"Syne",fontWeight:700,color:v!==0?color:"#333"}}>{fmtCell(v)}</td>;})}
                              <td style={{...cellSt(gTot),fontFamily:"Syne",fontWeight:800,borderLeft:"1px solid rgba(255,255,255,0.08)",background:bg,color:gTot!==0?color:"#333"}}>{fmtCell(gTot)}</td>
                            </tr>,
                            // Subtotal resultado antes de impuesto (después de Intereses)
                            grupo==="Intereses" ? (
                              <tr key="res-antes" style={{borderTop:"2px solid rgba(255,255,255,0.12)",borderBottom:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)"}}>
                                <td style={{padding:"8px 12px",fontSize:12,fontWeight:800,color:"#c8f060",background:"rgba(255,255,255,0.02)",position:"sticky",left:0,borderRight:"1px solid rgba(255,255,255,0.06)"}}>Resultado antes de impuesto</td>
                                {MESES_DISP.map(m=>{const v=resAntesMes(m);return <td key={m} style={{...cellSt(v),fontFamily:"Syne",fontWeight:800,fontSize:12,color:v>=0?"#c8f060":"#f06060"}}>{fmtCell(v)}</td>;})}
                                <td style={{...cellSt(resAntes),fontFamily:"Syne",fontWeight:800,fontSize:12,borderLeft:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:resAntes>=0?"#c8f060":"#f06060"}}>{fmtCell(resAntes)}</td>
                              </tr>
                            ) : null,
                          ];
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{borderTop:"2px solid rgba(255,255,255,0.15)",background:"#0e0e16"}}>
                          <td style={{padding:"10px 12px",fontSize:12,fontWeight:800,color:"#c8f060",position:"sticky",left:0,background:"#0e0e16",borderRight:"1px solid rgba(255,255,255,0.06)"}}>RESULTADO NETO</td>
                          {MESES_DISP.map(m=>{const v=resFinalMes(m);return <td key={m} style={{...cellSt(v),fontFamily:"Syne",fontWeight:800,fontSize:13,color:v>=0?"#c8f060":"#f06060"}}>{fmtCell(v)}</td>;})}
                          <td style={{...cellSt(resFinal),fontFamily:"Syne",fontWeight:800,fontSize:13,borderLeft:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:resFinal>=0?"#c8f060":"#f06060"}}>{fmtCell(resFinal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              );
            })()}

            {/* ── FLUJO DE FONDOS ── */}
            {reportTab==="flujo" && (()=>{
              // Datos negocio por C1 y mes (reales + nuevos conceptos en 0)
              const PIVOT_NEG = {"Ventas":{},"Ingresos":{"4":37670.9},"Costos":{},"Comisiones":{},"Transporte":{},"Marketing":{"1":-11700.0,"2":-46800.0,"4":-29403.0},"Impuestos":{},"Personal":{},"Servicios":{"2":-1402.05},"Licencias / suscripciones":{"4":-4680.53},"Alquileres":{},"Mantenimiento":{},"Honorarios":{},"Capacitación":{},"Otros gastos":{},"Inversiones":{},"Distribución de dividendos":{},"Préstamo recibido":{},"Préstamo pagado":{},"Intereses pagados":{}};

              const GRUPOS_NEG={Cobros:["Ventas","Ingresos"],"Gastos variables":["Costos","Comisiones","Transporte","Marketing","Impuestos"],"Gastos fijos":["Personal","Servicios","Licencias / suscripciones","Alquileres","Mantenimiento","Honorarios","Capacitación","Otros gastos"],Inversiones:["Inversiones"],Financiamiento:["Distribución de dividendos","Préstamo recibido","Préstamo pagado","Intereses pagados"]};
              const GRUPO_NEG_COLOR={Cobros:"#60f0a0","Gastos variables":"#f0a060","Gastos fijos":"#f06060",Inversiones:"#60c8f0",Financiamiento:"#c860f0"};
              const GRUPO_NEG_BG={Cobros:"rgba(96,240,160,0.05)","Gastos variables":"rgba(240,160,96,0.05)","Gastos fijos":"rgba(240,96,96,0.05)",Inversiones:"rgba(96,200,240,0.05)",Financiamiento:"rgba(200,96,240,0.05)"};

              const pvNeg = (c1,m) => PIVOT_NEG[c1]?.[m]||0;
              const rowTotNeg = (c1) => MESES_DISP.reduce((s,m)=>s+pvNeg(c1,m),0);
              const grupoTotNegMes = (g,m) => (GRUPOS_NEG[g]||[]).reduce((s,c1)=>s+pvNeg(c1,m),0);
              const grupoTotNeg = (g) => MESES_DISP.reduce((s,m)=>s+grupoTotNegMes(g,m),0);
              const colTotNeg = (m) => Object.keys(PIVOT_NEG).reduce((s,c1)=>s+pvNeg(c1,m),0);
              const grandTotNeg = MESES_DISP.reduce((s,m)=>s+colTotNeg(m),0);

              // KPIs
              const cobros = grupoTotNeg("Cobros");
              const gastos = grupoTotNeg("Gastos variables")+grupoTotNeg("Gastos fijos");
              const flujoNeto = grandTotNeg;

              return (
                <>
                  <div style={{fontSize:11,color:"#555",marginBottom:14}}>Movimientos NEGOCIO · por mes · sin IVA</div>

                  {/* KPIs */}
                  <div style={{...S.g3,marginBottom:14}}>
                    {[
                      {label:"Cobros",val:fmtN(cobros),color:"#60f0a0"},
                      {label:"Gastos totales",val:fmtN(Math.abs(gastos)),color:"#f06060"},
                      {label:"Flujo neto",val:(flujoNeto>=0?"+":"-")+fmtN(Math.abs(flujoNeto)),color:flujoNeto>=0?"#c8f060":"#f06060"},
                    ].map(k=>(
                      <div key={k.label} style={S.card}>
                        <div style={{...S.lbl,marginBottom:6}}>{k.label}</div>
                        <div style={{fontFamily:"Syne",fontSize:20,fontWeight:800,color:k.color}}>{k.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tabla pivot */}
                  <div style={{...S.card,padding:0,overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                          <th style={{textAlign:"left",padding:"8px 12px",fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:0.7,background:"#131318",position:"sticky",left:0,zIndex:1,minWidth:200}}>Concepto</th>
                          {MESES_DISP.map(m=><th key={m} style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#555",textTransform:"uppercase",minWidth:110,whiteSpace:"nowrap"}}>{MESES_NOM[+m]}</th>)}
                          <th style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#888",textTransform:"uppercase",minWidth:110,fontWeight:700,borderLeft:"1px solid rgba(255,255,255,0.08)"}}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(GRUPOS_NEG).map(([grupo,filas])=>{
                          const color=GRUPO_NEG_COLOR[grupo];
                          const bg=GRUPO_NEG_BG[grupo];
                          const gTot=grupoTotNeg(grupo);
                          // Sort: Cobros keep order, gastos by abs desc
                          const filasOrd = grupo==="Cobros" ? filas : [...filas].sort((a,b)=>Math.abs(rowTotNeg(b))-Math.abs(rowTotNeg(a)));
                          return [
                            // Header grupo
                            <tr key={`hdr-${grupo}`} style={{background:bg,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                              <td colSpan={MESES_DISP.length+2} style={{padding:"6px 12px",fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:1,background:bg,position:"sticky",left:0}}>
                                {grupo}
                              </td>
                            </tr>,
                            // Filas
                            ...filasOrd.map((c1,i)=>{
                              const rt=rowTotNeg(c1);
                              const hasData=MESES_DISP.some(m=>pvNeg(c1,m)!==0);
                              return (
                                <tr key={c1} style={{borderBottom:"1px solid rgba(255,255,255,0.03)",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}
                                  onMouseEnter={e=>e.currentTarget.style.background="rgba(200,240,96,0.04)"}
                                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":"rgba(255,255,255,0.01)"}>
                                  <td style={{padding:"5px 12px 5px 20px",fontSize:12,color:hasData?"#ede8e0":"#333",background:"#131318",position:"sticky",left:0,borderRight:"1px solid rgba(255,255,255,0.06)"}}>{c1}</td>
                                  {MESES_DISP.map(m=>{const v=pvNeg(c1,m);return <td key={m} style={cellSt(v)}>{fmtCell(v)}</td>;})}
                                  <td style={{...cellSt(rt),borderLeft:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)",fontWeight:700}}>{fmtCell(rt)}</td>
                                </tr>
                              );
                            }),
                            // Subtotal grupo
                            <tr key={`sub-${grupo}`} style={{borderTop:"1px solid rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.04)",background:bg}}>
                              <td style={{padding:"6px 12px",fontSize:11,fontWeight:700,color,background:bg,position:"sticky",left:0,borderRight:"1px solid rgba(255,255,255,0.06)"}}>Total {grupo}</td>
                              {MESES_DISP.map(m=>{const v=grupoTotNegMes(grupo,m);return <td key={m} style={{...cellSt(v),fontFamily:"Syne",fontWeight:700,color:v!==0?color:"#333"}}>{fmtCell(v)}</td>;})}
                              <td style={{...cellSt(gTot),fontFamily:"Syne",fontWeight:800,borderLeft:"1px solid rgba(255,255,255,0.08)",background:bg,color:gTot!==0?color:"#333"}}>{fmtCell(gTot)}</td>
                            </tr>
                          ];
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{borderTop:"2px solid rgba(255,255,255,0.15)",background:"#0e0e16"}}>
                          <td style={{padding:"8px 12px",fontSize:11,fontWeight:700,color:"#888",position:"sticky",left:0,background:"#0e0e16",borderRight:"1px solid rgba(255,255,255,0.06)"}}>FLUJO NETO</td>
                          {MESES_DISP.map(m=>{const v=colTotNeg(m);return <td key={m} style={{...cellSt(v),fontFamily:"Syne",fontWeight:800,fontSize:12}}>{fmtCell(v)}</td>;})}
                          <td style={{...cellSt(grandTotNeg),fontFamily:"Syne",fontWeight:800,fontSize:12,borderLeft:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)"}}>{fmtCell(grandTotNeg)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              );
            })()}

            {/* ── FINANZAS PERSONALES ── */}
            {reportTab==="personal" && (
              <>
                <div style={{fontSize:11,color:"#555",marginBottom:14}}>Movimientos PERSONAL · neto por categoría y mes · con IVA</div>

                {/* Filtros */}
                <div style={{...S.card,marginBottom:14,padding:"14px 16px",overflow:"visible"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                    <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:0.8}}>Período</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <label style={{fontSize:11,color:"#666"}}>Desde</label>
                      <select value={persDesde} onChange={e=>{setPersDesde(e.target.value);if(+e.target.value>+persHasta)setPersHasta(e.target.value);}} style={selStyle}>
                        {MESES_DISP.map(m=><option key={m} value={m}>{MESES_NOM[+m]}</option>)}
                      </select>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <label style={{fontSize:11,color:"#666"}}>Hasta</label>
                      <select value={persHasta} onChange={e=>{setPersHasta(e.target.value);if(+e.target.value<+persDesde)setPersDesde(e.target.value);}} style={selStyle}>
                        {MESES_DISP.map(m=><option key={m} value={m}>{MESES_NOM[+m]}</option>)}
                      </select>
                    </div>
                    <div style={{width:1,height:20,background:"rgba(255,255,255,0.08)"}}/>
                    <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:0.8}}>Banco</div>
                    <div style={{position:"relative"}} ref={bancoDropRef}>
                      <button onClick={()=>setBancoDropOpen(o=>!o)}
                        style={{background:"#1c1c26",border:`1px solid ${persBancos.length>0?"rgba(200,240,96,0.4)":"rgba(255,255,255,0.1)"}`,borderRadius:5,color:persBancos.length>0?"#c8f060":"#666",fontFamily:"DM Mono",fontSize:11,padding:"5px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                        {persBancos.length===0?"Todos los bancos":persBancos.length===1?persBancos[0]:`${persBancos.length} bancos`}
                        <span style={{fontSize:9,opacity:0.6}}>{bancoDropOpen?"▲":"▼"}</span>
                      </button>
                      {bancoDropOpen&&(
                        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,background:"#1c1c26",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,zIndex:999,minWidth:220,padding:"6px 0",boxShadow:"0 12px 32px rgba(0,0,0,0.7)"}}>
                          <div onClick={()=>{setPersBancos([]);setBancoDropOpen(false);}}
                            style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",cursor:"pointer",fontSize:11,color:persBancos.length===0?"#c8f060":"#888",borderBottom:"1px solid rgba(255,255,255,0.06)"}}
                            onMouseEnter={e=>e.currentTarget.style.background="rgba(200,240,96,0.07)"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <span style={{width:12,height:12,borderRadius:2,border:`1px solid ${persBancos.length===0?"#c8f060":"rgba(255,255,255,0.2)"}`,background:persBancos.length===0?"#c8f060":"transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#0d0d10",flexShrink:0}}>{persBancos.length===0?"✓":""}</span>
                            Todos los bancos
                          </div>
                          {bancosPersList.map(b=>{
                            const chk=persBancos.includes(b);
                            return (
                              <div key={b} onClick={()=>setPersBancos(p=>chk?p.filter(x=>x!==b):[...p,b])}
                                style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",cursor:"pointer",fontSize:11,color:chk?"#c8f060":"#888"}}
                                onMouseEnter={e=>e.currentTarget.style.background="rgba(200,240,96,0.07)"}
                                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                                <span style={{width:12,height:12,borderRadius:2,border:`1px solid ${chk?"#c8f060":"rgba(255,255,255,0.2)"}`,background:chk?"#c8f060":"transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#0d0d10",flexShrink:0}}>{chk?"✓":""}</span>
                                {b}
                              </div>
                            );
                          })}
                          <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"6px 12px"}}>
                            <button onClick={()=>setBancoDropOpen(false)} style={{width:"100%",background:"rgba(200,240,96,0.1)",border:"1px solid rgba(200,240,96,0.25)",borderRadius:4,color:"#c8f060",fontFamily:"DM Mono",fontSize:11,padding:"5px",cursor:"pointer"}}>Aplicar →</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{marginLeft:"auto",fontSize:11,color:"#c8f060",fontFamily:"Syne",fontWeight:700}}>
                      {periodoLabel}{persBancos.length>0?` · ${persBancos.length===1?persBancos[0]:persBancos.length+" bancos"}`:""}
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
                  {(()=>{
                    const ing=Math.abs(persIng)||1;
                    const pct=(v)=>ing>0?(Math.abs(v)/ing*100).toFixed(1)+"%":"—";
                    return [
                      {label:"Cobros",val:fmtN(persIng),color:"#60f0a0",sub:periodoLabel},
                      {label:"Necesidades",val:fmtN(Math.abs(persNec)),color:"#60c8f0",pct:pct(persNec)},
                      {label:"Deseos",val:fmtN(Math.abs(persDes)),color:"#cc88cc",pct:pct(persDes)},
                      {label:"Inversiones",val:fmtN(Math.abs(persInv)),color:"#f0c060",pct:pct(persInv)},
                      {label:"Resultado neto",val:(grandTot>=0?"+":"-")+fmtN(Math.abs(grandTot)),color:grandTot>=0?"#c8f060":"#f06060",sub:periodoLabel},
                    ].map(k=>(
                      <div key={k.label} style={S.card}>
                        <div style={{...S.lbl,marginBottom:4}}>{k.label}</div>
                        <div style={{fontFamily:"Syne",fontSize:16,fontWeight:800,color:k.color,marginBottom:3}}>{k.val}</div>
                        {k.pct?(
                          <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                            <span style={{fontFamily:"Syne",fontSize:14,fontWeight:700,color:k.color}}>{k.pct}</span>
                            <span style={{fontSize:9,color:"#444"}}>de ingresos</span>
                          </div>
                        ):<div style={{fontSize:10,color:"#555"}}>{k.sub}</div>}
                      </div>
                    ));
                  })()}
                </div>

                {/* Pivot table */}
                <div style={{...S.card,padding:0,overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                    <thead>
                      <tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                        <th style={{textAlign:"left",padding:"8px 12px",fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:0.7,background:"#131318",position:"sticky",left:0,zIndex:1,minWidth:180}}>Concepto</th>
                        {mesesFiltrados.map(m=><th key={m} style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#555",textTransform:"uppercase",minWidth:110,whiteSpace:"nowrap"}}>{MESES_NOM[+m]}</th>)}
                        <th style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#888",textTransform:"uppercase",minWidth:110,fontWeight:700,borderLeft:"1px solid rgba(255,255,255,0.08)"}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Cobros por ingresos */}
                      {(()=>{
                        const rt=rowTot("Ingresos");
                        return (
                          <tr style={{borderBottom:"2px solid rgba(96,240,160,0.2)",background:"rgba(96,240,160,0.04)"}}>
                            <td style={{padding:"7px 12px",fontSize:12,fontWeight:700,color:"#60f0a0",background:"rgba(96,240,160,0.04)",position:"sticky",left:0,borderRight:"1px solid rgba(255,255,255,0.06)"}}>Cobros por ingresos</td>
                            {mesesFiltrados.map(m=>{const v=pvGet("Ingresos",m);return <td key={m} style={cellSt(v)}>{fmtCell(v)}</td>;})}
                            <td style={{...cellSt(rt),borderLeft:"1px solid rgba(255,255,255,0.08)",fontWeight:800}}>{fmtCell(rt)}</td>
                          </tr>
                        );
                      })()}

                      {Object.entries(GRUPOS).map(([grupo,filasGrupo])=>{
                        const filasOrd=[...filasGrupo].sort((a,b)=>Math.abs(rowTot(b))-Math.abs(rowTot(a)));
                        const gTotM=(m)=>grupoTotMes(grupo,m);
                        const gTot=grupoTot(grupo);
                        const color=GRUPO_COLOR[grupo];
                        const bg=GRUPO_BG[grupo];
                        return [
                          <tr key={`hdr-${grupo}`} style={{background:bg,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                            <td colSpan={mesesFiltrados.length+2} style={{padding:"6px 12px",fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:1,background:bg,position:"sticky",left:0}}>
                              {GRUPO_LABEL[grupo]||grupo}
                            </td>
                          </tr>,
                          ...filasOrd.map((fila,i)=>{
                            const rt=rowTot(fila);
                            const hasData=mesesFiltrados.some(m=>pvGet(fila,m)!==0);
                            return (
                              <tr key={fila} style={{borderBottom:"1px solid rgba(255,255,255,0.03)",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}
                                onMouseEnter={e=>e.currentTarget.style.background="rgba(200,240,96,0.04)"}
                                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":"rgba(255,255,255,0.01)"}>
                                <td style={{padding:"5px 12px 5px 20px",fontSize:12,color:hasData?"#ede8e0":"#333",background:"#131318",position:"sticky",left:0,borderRight:"1px solid rgba(255,255,255,0.06)"}}>{fila}</td>
                                {mesesFiltrados.map(m=>{const v=pvGet(fila,m);return <td key={m} style={{...cellSt(v),fontSize:11}}>{fmtCell(v)}</td>;})}
                                <td style={{...cellSt(rt),borderLeft:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)",fontWeight:700,fontSize:11}}>{fmtCell(rt)}</td>
                              </tr>
                            );
                          }),
                          <tr key={`sub-${grupo}`} style={{borderTop:"1px solid rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.04)",background:bg}}>
                            <td style={{padding:"6px 12px",fontSize:11,fontWeight:700,color,background:bg,position:"sticky",left:0,borderRight:"1px solid rgba(255,255,255,0.06)"}}>Total {GRUPO_LABEL[grupo]||grupo}</td>
                            {mesesFiltrados.map(m=>{const v=gTotM(m);return <td key={m} style={{...cellSt(v),fontFamily:"Syne",fontWeight:700,color:v!==0?color:"#333"}}>{fmtCell(v)}</td>;})}
                            <td style={{...cellSt(gTot),fontFamily:"Syne",fontWeight:800,borderLeft:"1px solid rgba(255,255,255,0.08)",background:bg,color:gTot!==0?color:"#333"}}>{fmtCell(gTot)}</td>
                          </tr>
                        ];
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{borderTop:"2px solid rgba(255,255,255,0.15)",background:"#0e0e16"}}>
                        <td style={{padding:"8px 12px",fontSize:11,fontWeight:700,color:"#888",position:"sticky",left:0,background:"#0e0e16",borderRight:"1px solid rgba(255,255,255,0.06)"}}>NETO</td>
                        {mesesFiltrados.map(m=>{const v=colTot(m);return <td key={m} style={{...cellSt(v),fontFamily:"Syne",fontWeight:800,fontSize:12}}>{fmtCell(v)}</td>;})}
                        <td style={{...cellSt(grandTot),fontFamily:"Syne",fontWeight:800,fontSize:12,borderLeft:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)"}}>{fmtCell(grandTot)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}

            {/* ── CONCILIACIÓN BANCARIA ── */}
            {reportTab==="conciliacion" && (
              <div style={{...S.card,textAlign:"center",padding:40}}>
                <div style={{fontSize:28,marginBottom:12}}>🏦</div>
                <div style={{fontFamily:"Syne",fontSize:16,fontWeight:700,color:"#ede8e0",marginBottom:8}}>Conciliación bancaria</div>
                <div style={{fontSize:12,color:"#555",lineHeight:1.8}}>Disponible en la versión con base de datos.<br/>Cargá tus extractos bancarios para habilitarla.</div>
              </div>
            )}
          </>
        )}
                {/* ── CONFIGURACIÓN ── */}
        {mainTab==="config" && (
          <>
            <div style={{fontFamily:"Syne",fontSize:18,fontWeight:800,marginBottom:4}}>Configuración</div>
            <div style={{color:"#555",fontSize:12,marginBottom:16}}>Gestioná tus bancos y tarjetas. Solo los activos aparecen en el formulario.</div>

            {/* Sub-tabs */}
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {[["bancos","🏦 Bancos y cuentas"],["tarjetas","💳 Tarjetas"]].map(([k,l])=>(
                <button key={k} onClick={()=>setConfigTab(k)}
                  style={{background:configTab===k?"rgba(200,240,96,0.1)":"#131318",border:`1px solid ${configTab===k?"rgba(200,240,96,0.35)":"rgba(255,255,255,0.06)"}`,color:configTab===k?"#c8f060":"#555",borderRadius:5,padding:"7px 16px",fontFamily:"DM Mono",fontSize:11,cursor:"pointer"}}>
                  {l}
                </button>
              ))}
            </div>

            {/* ── BANCOS ── */}
            {configTab==="bancos" && (
              <>
                {/* Tabla de bancos */}
                <div style={{...S.card,padding:0,marginBottom:16}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 80px 100px 80px 80px",gap:4,padding:"8px 14px",fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <div>Nombre</div><div>Moneda</div><div>Tipo</div><div style={{textAlign:"center"}}>Activo</div><div></div>
                  </div>
                  {config.bancos.map(b=>(
                    <div key={b.id} style={{display:"grid",gridTemplateColumns:"1fr 80px 100px 80px 80px",gap:4,padding:"10px 14px",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.04)"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#1c1c26"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {editingConfig?.id===b.id && editingConfig?.table==="bancos" ? (
                        <>
                          <input value={editingConfig.nombre} onChange={e=>setEditingConfig(p=>({...p,nombre:e.target.value}))}
                            style={{...S.inp,padding:"4px 8px",fontSize:12}}/>
                          <select value={editingConfig.moneda} onChange={e=>setEditingConfig(p=>({...p,moneda:e.target.value}))}
                            style={{...S.sel,padding:"4px 6px",fontSize:11}}>
                            <option>UYU</option><option>USD</option>
                          </select>
                          <select value={editingConfig.tipo} onChange={e=>setEditingConfig(p=>({...p,tipo:e.target.value}))}
                            style={{...S.sel,padding:"4px 6px",fontSize:11}}>
                            <option>Personal</option><option>Negocio</option><option>Ambos</option>
                          </select>
                          <div style={{textAlign:"center"}}>
                            <input type="checkbox" checked={editingConfig.activo} onChange={e=>setEditingConfig(p=>({...p,activo:e.target.checked}))}/>
                          </div>
                          <div style={{display:"flex",gap:4}}>
                            <button onClick={()=>{setConfig(p=>({...p,bancos:p.bancos.map(x=>x.id===b.id?{...editingConfig}:x)}));setEditingConfig(null);}}
                              style={{background:"#c8f060",border:"none",borderRadius:3,color:"#09090d",fontFamily:"DM Mono",fontSize:10,padding:"3px 8px",cursor:"pointer",fontWeight:700}}>✓</button>
                            <button onClick={()=>setEditingConfig(null)}
                              style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:3,color:"#555",fontFamily:"DM Mono",fontSize:10,padding:"3px 6px",cursor:"pointer"}}>✕</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{fontSize:12,fontWeight:b.activo?600:400,color:b.activo?"#ede8e0":"#555"}}>{b.nombre}</div>
                          <div><span style={{fontSize:10,padding:"2px 7px",borderRadius:3,background:b.moneda==="USD"?"rgba(240,192,96,0.15)":"rgba(96,200,240,0.15)",color:b.moneda==="USD"?"#f0c060":"#60c8f0"}}>{b.moneda}</span></div>
                          <div style={{fontSize:11,color:"#666"}}>{b.tipo}</div>
                          <div style={{textAlign:"center"}}>
                            <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:b.activo?"rgba(96,240,160,0.15)":"rgba(255,255,255,0.05)",color:b.activo?"#60f0a0":"#444"}}>{b.activo?"Activo":"Inactivo"}</span>
                          </div>
                          <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                            <button onClick={()=>setEditingConfig({...b,table:"bancos"})}
                              style={{background:"none",border:"1px solid rgba(255,255,255,0.08)",borderRadius:3,color:"#888",fontFamily:"DM Mono",fontSize:10,padding:"3px 8px",cursor:"pointer"}}>✎</button>
                            <button onClick={()=>setConfig(p=>({...p,bancos:p.bancos.map(x=>x.id===b.id?{...x,activo:!x.activo}:x)}))}
                              style={{background:"none",border:`1px solid ${b.activo?"rgba(240,96,96,0.3)":"rgba(96,240,160,0.3)"}`,borderRadius:3,color:b.activo?"#f06060":"#60f0a0",fontFamily:"DM Mono",fontSize:10,padding:"3px 8px",cursor:"pointer"}}>
                              {b.activo?"Desactivar":"Activar"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Agregar banco */}
                <div style={S.card}>
                  <div style={S.secT}>Agregar banco / cuenta</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 100px 120px auto",gap:10,alignItems:"end"}}>
                    <div>
                      <label style={S.lbl}>Nombre</label>
                      <input value={newBanco.nombre} onChange={e=>setNewBanco(p=>({...p,nombre:e.target.value}))}
                        placeholder="ej: BROU UYU" style={S.inp}/>
                    </div>
                    <div>
                      <label style={S.lbl}>Moneda</label>
                      <select value={newBanco.moneda} onChange={e=>setNewBanco(p=>({...p,moneda:e.target.value}))} style={S.sel}>
                        <option>UYU</option><option>USD</option>
                      </select>
                    </div>
                    <div>
                      <label style={S.lbl}>Tipo</label>
                      <select value={newBanco.tipo} onChange={e=>setNewBanco(p=>({...p,tipo:e.target.value}))} style={S.sel}>
                        <option>Personal</option><option>Negocio</option><option>Ambos</option>
                      </select>
                    </div>
                    <button onClick={()=>{
                      if(!newBanco.nombre.trim()) return;
                      setConfig(p=>({...p,bancos:[...p.bancos,{...newBanco,id:Date.now(),activo:true}]}));
                      setNewBanco({nombre:"",moneda:"UYU",tipo:"Ambos",activo:true});
                    }} style={{background:"#c8f060",border:"none",borderRadius:6,color:"#09090d",fontFamily:"Syne",fontSize:12,fontWeight:700,padding:"9px 16px",cursor:"pointer",whiteSpace:"nowrap"}}>
                      + Agregar
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── TARJETAS ── */}
            {configTab==="tarjetas" && (
              <>
                <div style={{...S.card,padding:0,marginBottom:16}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 120px 80px 80px 80px 100px",gap:4,padding:"8px 14px",fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <div>Nombre</div><div>Banco emisor</div><div>Tipo</div><div>Moneda</div><div style={{textAlign:"center"}}>Activo</div><div></div>
                  </div>
                  {config.tarjetas.map(t=>(
                    <div key={t.id} style={{display:"grid",gridTemplateColumns:"1fr 120px 80px 80px 80px 100px",gap:4,padding:"10px 14px",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.04)"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#1c1c26"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {editingConfig?.id===t.id && editingConfig?.table==="tarjetas" ? (
                        <>
                          <input value={editingConfig.nombre} onChange={e=>setEditingConfig(p=>({...p,nombre:e.target.value}))} style={{...S.inp,padding:"4px 8px",fontSize:12}}/>
                          <select value={editingConfig.banco} onChange={e=>setEditingConfig(p=>({...p,banco:e.target.value}))} style={{...S.sel,padding:"4px 6px",fontSize:11}}>
                            {config.bancos.filter(b=>b.activo).map(b=><option key={b.id}>{b.nombre}</option>)}
                          </select>
                          <select value={editingConfig.tipoCarta} onChange={e=>setEditingConfig(p=>({...p,tipoCarta:e.target.value}))} style={{...S.sel,padding:"4px 6px",fontSize:11}}>
                            <option>crédito</option><option>débito</option>
                          </select>
                          <select value={editingConfig.moneda} onChange={e=>setEditingConfig(p=>({...p,moneda:e.target.value}))} style={{...S.sel,padding:"4px 6px",fontSize:11}}>
                            <option>UYU</option><option>USD</option>
                          </select>
                          <div style={{textAlign:"center"}}>
                            <input type="checkbox" checked={editingConfig.activo} onChange={e=>setEditingConfig(p=>({...p,activo:e.target.checked}))}/>
                          </div>
                          <div style={{display:"flex",gap:4}}>
                            <button onClick={()=>{setConfig(p=>({...p,tarjetas:p.tarjetas.map(x=>x.id===t.id?{...editingConfig}:x)}));setEditingConfig(null);}}
                              style={{background:"#c8f060",border:"none",borderRadius:3,color:"#09090d",fontFamily:"DM Mono",fontSize:10,padding:"3px 8px",cursor:"pointer",fontWeight:700}}>✓</button>
                            <button onClick={()=>setEditingConfig(null)}
                              style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:3,color:"#555",fontFamily:"DM Mono",fontSize:10,padding:"3px 6px",cursor:"pointer"}}>✕</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{fontSize:12,fontWeight:t.activo?600:400,color:t.activo?"#ede8e0":"#555"}}>{t.nombre}</div>
                          <div style={{fontSize:11,color:"#666",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.banco}</div>
                          <div><span style={{fontSize:10,padding:"2px 7px",borderRadius:3,background:t.tipoCarta==="crédito"?"rgba(200,96,240,0.15)":"rgba(96,200,240,0.15)",color:t.tipoCarta==="crédito"?"#c860f0":"#60c8f0"}}>{t.tipoCarta}</span></div>
                          <div><span style={{fontSize:10,padding:"2px 7px",borderRadius:3,background:t.moneda==="USD"?"rgba(240,192,96,0.15)":"rgba(96,200,240,0.15)",color:t.moneda==="USD"?"#f0c060":"#60c8f0"}}>{t.moneda}</span></div>
                          <div style={{textAlign:"center"}}>
                            <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:t.activo?"rgba(96,240,160,0.15)":"rgba(255,255,255,0.05)",color:t.activo?"#60f0a0":"#444"}}>{t.activo?"Activo":"Inactivo"}</span>
                          </div>
                          <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                            <button onClick={()=>setEditingConfig({...t,table:"tarjetas"})}
                              style={{background:"none",border:"1px solid rgba(255,255,255,0.08)",borderRadius:3,color:"#888",fontFamily:"DM Mono",fontSize:10,padding:"3px 8px",cursor:"pointer"}}>✎</button>
                            <button onClick={()=>setConfig(p=>({...p,tarjetas:p.tarjetas.map(x=>x.id===t.id?{...x,activo:!x.activo}:x)}))}
                              style={{background:"none",border:`1px solid ${t.activo?"rgba(240,96,96,0.3)":"rgba(96,240,160,0.3)"}`,borderRadius:3,color:t.activo?"#f06060":"#60f0a0",fontFamily:"DM Mono",fontSize:10,padding:"3px 8px",cursor:"pointer"}}>
                              {t.activo?"Desactivar":"Activar"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Agregar tarjeta */}
                <div style={S.card}>
                  <div style={S.secT}>Agregar tarjeta</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 100px 120px auto",gap:10,alignItems:"end"}}>
                    <div>
                      <label style={S.lbl}>Nombre</label>
                      <input value={newTarjeta.nombre} onChange={e=>setNewTarjeta(p=>({...p,nombre:e.target.value}))}
                        placeholder="ej: Visa BROU" style={S.inp}/>
                    </div>
                    <div>
                      <label style={S.lbl}>Banco emisor</label>
                      <select value={newTarjeta.banco} onChange={e=>setNewTarjeta(p=>({...p,banco:e.target.value}))} style={S.sel}>
                        <option value="">— seleccionar —</option>
                        {config.bancos.filter(b=>b.activo).map(b=><option key={b.id}>{b.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={S.lbl}>Tipo</label>
                      <select value={newTarjeta.tipoCarta} onChange={e=>setNewTarjeta(p=>({...p,tipoCarta:e.target.value}))} style={S.sel}>
                        <option>crédito</option><option>débito</option>
                      </select>
                    </div>
                    <div>
                      <label style={S.lbl}>Personal / Negocio</label>
                      <select value={newTarjeta.tipo} onChange={e=>setNewTarjeta(p=>({...p,tipo:e.target.value}))} style={S.sel}>
                        <option>Personal</option><option>Negocio</option><option>Ambos</option>
                      </select>
                    </div>
                    <button onClick={()=>{
                      if(!newTarjeta.nombre.trim()||!newTarjeta.banco) return;
                      setConfig(p=>({...p,tarjetas:[...p.tarjetas,{...newTarjeta,id:Date.now(),activo:true}]}));
                      setNewTarjeta({nombre:"",banco:"",moneda:"UYU",tipoCarta:"crédito",tipo:"Personal",activo:true});
                    }} style={{background:"#c8f060",border:"none",borderRadius:6,color:"#09090d",fontFamily:"Syne",fontSize:12,fontWeight:700,padding:"9px 16px",cursor:"pointer",whiteSpace:"nowrap"}}>
                      + Agregar
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
