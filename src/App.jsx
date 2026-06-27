import { useState, useMemo, useRef, useEffect, Fragment } from "react";
import * as XLSX from "xlsx";
// ── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ayyglgljvlrhgcllevup.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eWdsZ2xqdmxyaGdjbGxldnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNjI4OTcsImV4cCI6MjA5NTczODg5N30.yDFT4fM9fjemIFbF-qFCDSR6kShO_A-uuwywB0Z1Rxs";

const sb = {
  from: (table) => ({
    select: async (cols="*") => {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}`, {
        headers: {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`}
      });
      return r.json();
    },
    insert: async (data) => {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: "POST",
        headers: {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation"},
        body: JSON.stringify(data)
      });
      return r.json();
    },
    delete: async (id) => {
      await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: "DELETE",
        headers: {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`}
      });
    },
  }),
  auth: {
    signUp: async (email, password) => {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {"apikey": SUPABASE_KEY, "Content-Type": "application/json"},
        body: JSON.stringify({email, password})
      });
      return r.json();
    },
    signIn: async (email, password) => {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {"apikey": SUPABASE_KEY, "Content-Type": "application/json"},
        body: JSON.stringify({email, password})
      });
      return r.json();
    },
    refresh: async (refresh_token) => {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: {"apikey": SUPABASE_KEY, "Content-Type": "application/json"},
        body: JSON.stringify({refresh_token})
      });
      return r.json();
    },
    signOut: async (token) => {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}`}
      });
    },
    getUser: async (token) => {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}`}
      });
      return r.json();
    }
  }
};



// ── DATOS AGREGADOS (Rivero·Malan 2026) ──────────────────────────────────────
const AGG = {"pivot_pers":{"Ocio y cultura":{"1":-173870.17,"2":-8247.7,"3":-7145.0,"4":-7753.77},"Salud":{"1":-29785.46,"2":-9910.72,"3":-20510.21,"4":-47388.03},"Vivienda":{"1":-65798.74,"2":-5353.44,"3":-70192.89,"4":-7930.56},"Otros gastos":{"1":-10228.03,"2":-13386.12,"3":-26356.51,"4":-4903.72},"Cuidado personal":{"1":-37821.65,"2":-17104.56,"3":-22544.74,"4":-21001.54},"Transferencias":{"1":22285.0,"2":0.0},"Alimentación":{"1":-36276.92,"2":-28274.62,"3":-25097.13,"4":-19186.89},"Tarjetas":{"1":-209391.76,"2":-99540.54},"Servicios del hogar":{"1":-31467.96,"2":-55427.55,"3":-26363.26,"4":-22907.19},"Gasto de personal":{"1":-38274.0,"2":-23310.0,"3":-32957.0,"4":-34175.0},"Ingresos":{"1":597453.0,"2":203822.0,"3":547295.0,"4":476695.2},"Transporte":{"1":-31673.77,"2":-3326.85,"3":-24379.36,"4":-10523.03},"Regalos y donaciones":{"1":-8715.0,"2":-2115.0,"3":-10413.35,"4":-2084.0},"Educación":{"1":-600.0,"2":-70658.6,"3":-79147.0,"4":-80437.46},"Finanzas":{"1":-3441.8,"2":-843.75,"3":-3077.08,"4":-843.75},"Inversiones":{"3":-7800.0,"4":-4130.0},"Servicios":{"3":-12475.41,"4":-878.0},"Impuestos y trámites":{"3":-3281.79,"4":-29112.08},"Pagos":{"3":-31231.22,"4":-72889.67},"Mascotas":{"3":-945.0}},"kpi_mes":{"Deseos":{"1":-378701.36,"2":-104162.8,"3":-123771.7,"4":-27744.26},"Necesidades":{"1":-298643.9,"2":-233336.65,"3":-272345.25,"4":-334270.43},"Transferencias":{"1":22285.0,"2":0.0},"Ingresos":{"1":597453.0,"2":203822.0,"3":547295.0,"4":476695.2},"Inversiones":{"3":-7800.0,"4":-4130.0}},"pivot_neg":{"Marketing":{"1":-11700.0,"2":-46800.0,"4":-29403.0},"Servicios":{"2":-1402.05},"Ingresos":{"4":37670.9},"Licencias / suscripciones":{"4":-4680.53}},"flujo_banco":{"ITAU USD":{"1":-34910.46,"2":-47970.0,"3":-15514.2,"4":95399.1},"SCOTIABANK UYU":{"1":-30510.7,"2":67277.07,"3":-836.06,"4":39831.78},"SCOTIABANK USD":{"1":-12278.22,"2":-24960.39},"ITAU UYU":{"1":8392.12,"2":-176226.18,"3":159728.31,"4":-21093.0}},"monthly":{"1":{"ing":1110864.54,"egr":1180171.8},"2":{"ing":345161.21,"egr":527040.71},"3":{"ing":601196.91,"egr":457818.86},"4":{"ing":573496.32,"egr":459358.44}},"top_gastos":{"Tarjetas":308932.3,"Educación":234038.67,"Vivienda":149306.84,"Servicios del hogar":136187.06,"Gasto de personal":128716.0,"Alimentación":112010.87,"Salud":107593.42,"Ocio y cultura":196869.17,"Cuidado personal":98472.49},"recent":[{"f":"2026-04-30","t":"Personal","c1":"Ingresos","c2":"Sueldo","cat":"Ingresos","b":"ITAU UYU","d":"ANMA ABRIL","tot":113902.0},{"f":"2026-04-30","t":"Personal","c1":"Gasto de personal","c2":"Servicio doméstico / Niñera","cat":"Deseos","b":"SCOTIABANK UYU","d":"MIDI/TRN/ABRIL","tot":-23823.0},{"f":"2026-04-29","t":"Personal","c1":"Cuidado personal","c2":"Peluquería / Uñas / Estética","cat":"Deseos","b":"ITAU UYU","d":"Uñas","tot":-1990.0},{"f":"2026-04-28","t":"Negocio","c1":"Ingresos","c2":"Mentorías","cat":"Ingresos","b":"ITAU UYU","d":"Johanna RUMBO","tot":10000.0},{"f":"2026-04-27","t":"Personal","c1":"Pagos","c2":"Pago tarjetas","cat":"Necesidad","b":"SCOTIABANK UYU","d":"INTERNET0 PAGOTARD","tot":-36841.91},{"f":"2026-04-27","t":"Negocio","c1":"Ingresos","c2":"Mentorías","cat":"Ingresos","b":"ITAU USD","d":"METODO RUMBO","tot":27670.9},{"f":"2026-04-20","t":"Personal","c1":"Ingresos","c2":"Otros","cat":"Ingresos","b":"ITAU USD","d":"Renta del campo","tot":95518.2},{"f":"2026-04-20","t":"Negocio","c1":"Marketing","c2":"Publicidad en redes sociales","cat":"Fijo","b":"ITAU USD","d":"","tot":-23820.0}]};

const DISP_REGS = [{"id":577,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Ingresos","c2":"Sueldo","cat":"Ingresos","d":"ANMA ABRIL 60","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":113902.0,"iva":null,"tot":113902.0},{"id":578,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Transporte","c2":"Combustible","cat":"Variable","d":"300426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":-1837.1,"iva":null,"tot":-1837.1},{"id":579,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Salud","c2":"Medicamentos","cat":"Necesidad","d":"300426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":-1102.0,"iva":null,"tot":-1102.0},{"id":580,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Salud","c2":"Medicamentos","cat":"Necesidad","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":18.44,"iva":null,"tot":18.44},{"id":581,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"300426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":-680.7,"iva":null,"tot":-680.7},{"id":582,"f":"2026-04-30","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":11.16,"iva":null,"tot":11.16},{"id":641,"f":"2026-04-30","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Gasto de personal","c2":"Servicio doméstico / Niñera","cat":"Deseos","d":"MIDI/TRN/ABRIL 26","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-30","usd":null,"tc":null,"p":-23823.0,"iva":null,"tot":-23823.0},{"id":575,"f":"2026-04-29","m":"4","b":"ITAU UYU","t":"Personal","c1":"Cuidado personal","c2":"Peluquería / Uñas / Estética","cat":"Deseos","d":"Uñas","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-29","usd":null,"tc":null,"p":-1990.0,"iva":null,"tot":-1990.0},{"id":576,"f":"2026-04-29","m":"4","b":"ITAU UYU","t":"Personal","c1":"Cuidado personal","c2":"Peluquería / Uñas / Estética","cat":"Deseos","d":"Color","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-29","usd":null,"tc":null,"p":-1665.0,"iva":null,"tot":-1665.0},{"id":642,"f":"2026-04-29","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Servicios del hogar","c2":"Agua (OSE)","cat":"Necesidad","d":"PAGANZA -               986879","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-29","usd":null,"tc":null,"p":-1142.79,"iva":null,"tot":-1142.79},{"id":643,"f":"2026-04-29","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"EL RINCON EMPANADAS /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-29","usd":null,"tc":null,"p":-291.76,"iva":null,"tot":-291.76},{"id":572,"f":"2026-04-28","m":"4","b":"ITAU UYU","t":"Personal","c1":"Educación","c2":"Libros y útiles","cat":"Necesidad","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-28","usd":null,"tc":null,"p":7.21,"iva":null,"tot":7.21},{"id":573,"f":"2026-04-28","m":"4","b":"ITAU UYU","t":"Personal","c1":"Educación","c2":"Libros y útiles","cat":"Necesidad","d":"280426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-28","usd":null,"tc":null,"p":-1603.0,"iva":null,"tot":-1603.0},{"id":574,"f":"2026-04-28","m":"4","b":"ITAU UYU","t":"Negocio","c1":"Ingresos","c2":"Mentorías","cat":"Ingresos","d":"Johanna Método RUMBO","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-28","usd":null,"tc":null,"p":10000.0,"iva":null,"tot":10000.0},{"id":644,"f":"2026-04-28","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"THE COFFEETERIA     /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-28","usd":null,"tc":null,"p":-533.64,"iva":null,"tot":-533.64},{"id":645,"f":"2026-04-28","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Ingresos","c2":"Sueldo","cat":"Ingresos","d":"SUELDOS SCOTIABANK         - S","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-28","usd":null,"tc":null,"p":238800.0,"iva":null,"tot":238800.0},{"id":568,"f":"2026-04-27","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":45.74,"iva":null,"tot":45.74},{"id":569,"f":"2026-04-27","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":15.12,"iva":null,"tot":15.12},{"id":570,"f":"2026-04-27","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"250426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":-922.27,"iva":null,"tot":-922.27},{"id":571,"f":"2026-04-27","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"250426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":-620.0,"iva":null,"tot":-620.0},{"id":586,"f":"2026-04-27","m":"4","b":"ITAU USD","t":"Negocio","c1":"Ingresos","c2":"Mentorías","cat":"Ingresos","d":"METODO RUMBO DIEGO LUJAMBIO","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-27","usd":697.0,"tc":39.7,"p":27670.9,"iva":null,"tot":27670.9},{"id":646,"f":"2026-04-27","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Pagos","c2":"Pago tarjetas","cat":"Necesidad","d":"INTERNET0 PAGOTARD 1124267700","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":-36841.91,"iva":null,"tot":-36841.91},{"id":647,"f":"2026-04-27","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"THE COFFEETERIA     /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":-1067.28,"iva":null,"tot":-1067.28},{"id":648,"f":"2026-04-27","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"MIGUITA DE PAN      /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-27","usd":null,"tc":null,"p":-927.54,"iva":null,"tot":-927.54},{"id":649,"f":"2026-04-23","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Regalos y donaciones","c2":"Donaciones / Caridad","cat":"Deseos","d":"Pérez scremini","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-23","usd":null,"tc":null,"p":-1000.0,"iva":null,"tot":-1000.0},{"id":650,"f":"2026-04-23","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Pagos","c2":"Pago tarjetas","cat":"Necesidad","d":"Santander","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-23","usd":null,"tc":null,"p":-7952.04,"iva":null,"tot":-7952.04},{"id":651,"f":"2026-04-23","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Servicios del hogar","c2":"Internet / Telefonía","cat":"Necesidad","d":"ANTEL","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-23","usd":null,"tc":null,"p":-2380.0,"iva":null,"tot":-2380.0},{"id":652,"f":"2026-04-23","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Impuestos y trámites","c2":"Tasas municipales","cat":"Necesidad","d":"PAGANZA -               986879","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-23","usd":null,"tc":null,"p":-1146.08,"iva":null,"tot":-1146.08},{"id":653,"f":"2026-04-23","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Gasto de personal","c2":"Servicio doméstico / Niñera","cat":"Deseos","d":"MIDI/TRN/ADEL ABRIL 26","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-23","usd":null,"tc":null,"p":-4000.0,"iva":null,"tot":-4000.0},{"id":654,"f":"2026-04-22","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Gasto de personal","c2":"Servicio doméstico / Niñera","cat":"Deseos","d":"BPS","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-22","usd":null,"tc":null,"p":-6352.0,"iva":null,"tot":-6352.0},{"id":655,"f":"2026-04-22","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Servicios del hogar","c2":"Internet / Telefonía","cat":"Necesidad","d":"PAGANZA -               986879","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-22","usd":null,"tc":null,"p":-1709.8,"iva":null,"tot":-1709.8},{"id":656,"f":"2026-04-22","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"THE COFFEETERIA     /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-22","usd":null,"tc":null,"p":-533.64,"iva":null,"tot":-533.64},{"id":567,"f":"2026-04-21","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-21","usd":null,"tc":null,"p":-988.0,"iva":null,"tot":-988.0},{"id":657,"f":"2026-04-21","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"THE COFFEETERIA     /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-21","usd":null,"tc":null,"p":-533.64,"iva":null,"tot":-533.64},{"id":565,"f":"2026-04-20","m":"4","b":"ITAU UYU","t":"Personal","c1":"Ocio y cultura","c2":"Cine / Conciertos","cat":"Deseos","d":"El club de la cumbia","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-20","usd":null,"tc":null,"p":-1260.0,"iva":null,"tot":-1260.0},{"id":566,"f":"2026-04-20","m":"4","b":"ITAU UYU","t":"Personal","c1":"Ocio y cultura","c2":"Cine / Conciertos","cat":"Deseos","d":"El club de la cumbia","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-20","usd":null,"tc":null,"p":20.66,"iva":null,"tot":20.66},{"id":584,"f":"2026-04-20","m":"4","b":"ITAU USD","t":"Negocio","c1":"Marketing","c2":"Publicidad en redes sociales","cat":"Fijo","d":"","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-20","usd":-600.0,"tc":39.7,"p":-23820.0,"iva":null,"tot":-23820.0},{"id":585,"f":"2026-04-20","m":"4","b":"ITAU USD","t":"Personal","c1":"Ingresos","c2":"Otros","cat":"Ingresos","d":"Renta del campo","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-20","usd":2406.0,"tc":39.7,"p":95518.2,"iva":null,"tot":95518.2},{"id":658,"f":"2026-04-20","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Ocio y cultura","c2":"Cine / Conciertos","cat":"Deseos","d":"SALA DEL MUSEO BARRA/MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-20","usd":null,"tc":null,"p":-1534.43,"iva":null,"tot":-1534.43},{"id":659,"f":"2026-04-20","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Servicios del hogar","c2":"Gas / Saneamiento / Leña","cat":"Necesidad","d":"PUNTO GAS MAESTRO   /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-20","usd":null,"tc":null,"p":-2691.15,"iva":null,"tot":-2691.15},{"id":660,"f":"2026-04-20","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"TIENDA INGLESA      /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-20","usd":null,"tc":null,"p":-2812.32,"iva":null,"tot":-2812.32},{"id":661,"f":"2026-04-20","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Educación","c2":"Cursos / Talleres / Actividades niños","cat":"Deseos","d":"Equipo futbol diconsa","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-20","usd":null,"tc":null,"p":-1400.0,"iva":null,"tot":-1400.0},{"id":662,"f":"2026-04-20","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"THE COFFEETERIA     /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-20","usd":null,"tc":null,"p":-533.64,"iva":null,"tot":-533.64},{"id":564,"f":"2026-04-17","m":"4","b":"ITAU UYU","t":"Personal","c1":"Otros gastos","c2":"Otros gastos","cat":"Deseos","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-17","usd":null,"tc":null,"p":600.0,"iva":null,"tot":600.0},{"id":663,"f":"2026-04-17","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Salud","c2":"Seguro de vida","cat":"Necesidad","d":"PAGANZA -               986879","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-17","usd":null,"tc":null,"p":-7462.0,"iva":null,"tot":-7462.0},{"id":561,"f":"2026-04-16","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-16","usd":null,"tc":null,"p":10.48,"iva":null,"tot":10.48},{"id":562,"f":"2026-04-16","m":"4","b":"ITAU UYU","t":"Personal","c1":"Transporte","c2":"Estacionamiento","cat":"Fijo","d":"160426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-16","usd":null,"tc":null,"p":-340.0,"iva":null,"tot":-340.0},{"id":563,"f":"2026-04-16","m":"4","b":"ITAU UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"160426 ANALIA MALAN","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-16","usd":null,"tc":null,"p":-639.0,"iva":null,"tot":-639.0},{"id":664,"f":"2026-04-16","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"EL RINCON EMPANADAS /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-16","usd":null,"tc":null,"p":-275.09,"iva":null,"tot":-275.09},{"id":556,"f":"2026-04-15","m":"4","b":"ITAU UYU","t":"Personal","c1":"Impuestos y trámites","c2":"IVA / IRPF / IRAE / Fonasa","cat":"Necesidad","d":"","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-15","usd":null,"tc":null,"p":-16971.0,"iva":null,"tot":-16971.0},{"id":557,"f":"2026-04-15","m":"4","b":"ITAU UYU","t":"Personal","c1":"Impuestos y trámites","c2":"IVA / IRPF / IRAE / Fonasa","cat":"Necesidad","d":"","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-15","usd":null,"tc":null,"p":-7439.0,"iva":null,"tot":-7439.0},{"id":558,"f":"2026-04-15","m":"4","b":"ITAU UYU","t":"Personal","c1":"Finanzas","c2":"Mantenimiento tarjeta","cat":"Deseos","d":"","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-15","usd":null,"tc":null,"p":-781.25,"iva":null,"tot":-781.25},{"id":559,"f":"2026-04-15","m":"4","b":"ITAU UYU","t":"Personal","c1":"Finanzas","c2":"Mantenimiento tarjeta","cat":"Deseos","d":"","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-15","usd":null,"tc":null,"p":-68.75,"iva":null,"tot":-68.75},{"id":560,"f":"2026-04-15","m":"4","b":"ITAU UYU","t":"Personal","c1":"Finanzas","c2":"Mantenimiento tarjeta","cat":"Deseos","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-15","usd":null,"tc":null,"p":6.25,"iva":null,"tot":6.25},{"id":665,"f":"2026-04-15","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"THE COFFEETERIA     /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-15","usd":null,"tc":null,"p":-411.52,"iva":null,"tot":-411.52},{"id":555,"f":"2026-04-14","m":"4","b":"ITAU UYU","t":"Personal","c1":"Cuidado personal","c2":"Gimnasio / Deporte","cat":"Deseos","d":"","fm":"Cobro por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-14","usd":null,"tc":null,"p":375.0,"iva":null,"tot":375.0},{"id":666,"f":"2026-04-14","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"THE COFFEETERIA     /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-14","usd":null,"tc":null,"p":-533.64,"iva":null,"tot":-533.64},{"id":554,"f":"2026-04-13","m":"4","b":"ITAU UYU","t":"Personal","c1":"Cuidado personal","c2":"Gimnasio / Deporte","cat":"Deseos","d":"","fm":"Pago por transferencia","be":"ITAU","plazo":"","fechaCP":"2026-04-13","usd":null,"tc":null,"p":-3750.0,"iva":null,"tot":-3750.0},{"id":667,"f":"2026-04-13","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Delivery / Restaurantes / Cafeterías","cat":"Deseos","d":"THE COFFEETERIA     /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-13","usd":null,"tc":null,"p":-533.64,"iva":null,"tot":-533.64},{"id":668,"f":"2026-04-13","m":"4","b":"SCOTIABANK UYU","t":"Personal","c1":"Alimentación","c2":"Supermercado","cat":"Necesidad","d":"MIGUITA DE PAN      /MONTEVI","fm":"Pago con tarjeta de crédito","be":"SCOTIABANK","plazo":"","fechaCP":"2026-04-13","usd":null,"tc":null,"p":-879.34,"iva":null,"tot":-879.34}];

// ── TAXONOMÍA ────────────────────────────────────────────────────────────────
const TX = {
  Negocio:{Ventas:{cat:"Ingresos",subs:["Tienda física (contado)","Tienda física (crédito)","Tienda online (crédito)","Tienda online (contado)","Devoluciones (-)","Descuentos comerciales (-)","Mentorías","Pies","Cejas"]},Costos:{cat:"Gasto Variable",subs:["Materia prima / materiales","Insumos de producción","Envases y embalajes","Repuestos y accesorios","Herramientas menores"]},Comisiones:{cat:"Gasto Variable",subs:["Mercado pago / Mercado libre","Tarjetas"]},Personal:{cat:"Gasto Fijo",subs:["Sueldos","Aportes patronales","Aguinaldo","Salario vacacional","Indemnizaciones","Bonos / incentivos","Viáticos / reintegros"]},Servicios:{cat:"Gasto Fijo",subs:["Electricidad","Agua","Internet","Telefonía móvil / fija","Alarma y monitoreo","ChatGPT","Licencias / suscripciones"]},Transporte:{cat:"Gasto Variable",subs:["Combustible","Peajes","Patentes y permisos","Seguros de vehículos","Envíos / fletes a clientes","Estacionamiento"]},Alquileres:{cat:"Gasto Fijo",subs:["Local comercial","Oficina / cowork","Depósito / galpón"]},Mantenimiento:{cat:"Gasto Fijo",subs:["Reparaciones de equipos","Mantenimiento preventivo","Servicios técnicos (IT)"]},Marketing:{cat:"Gasto Fijo",subs:["Publicidad en redes sociales","Publicidad en buscadores","Diseño gráfico / branding","Promociones y descuentos"]},Honorarios:{cat:"Gasto Fijo",subs:["Contador","Abogado","Consultor externo","Diseñador / agencia creativa"]},Capacitación:{cat:"Gasto Fijo",subs:["Cursos online","Talleres presenciales","Libros y materiales"]},"Otros gastos":{cat:"Gasto Fijo",subs:["Pequeños suministros de oficina","Donaciones y patrocinio","Multas y recargos"]},Intereses:{cat:"Gasto Fijo",subs:["Intereses de préstamos bancarios","Intereses por financiación de tarjetas"]},Impuestos:{cat:"Gasto Variable",subs:["IVA débito","IRPF / IRNR","Impuesto a la renta (IRAE)","Tasas municipales"]},Ingresos:{cat:"Ingresos",subs:["Mentorías","Otros"]},Cobros:{cat:"Cobros",subs:["Cobros"]},"Préstamo recibido":{cat:"Financiamiento",subs:["Préstamo recibido"]},"Préstamo pagado":{cat:"Financiamiento",subs:["Préstamo pagado"]},"Intereses pagados":{cat:"Financiamiento",subs:["Intereses pagados"]},"Distribución de dividendos":{cat:"Financiamiento",subs:["Distribución de dividendos"]},Pagos:{cat:"Pagos",subs:["Pagos"]}},
  Personal:{Ingresos:{cat:"Ingresos",subs:["Sueldo","Alquileres","Otros"]},Vivienda:{cat:"Necesidad",subs:["Alquiler / Hipoteca","Contribución inmobiliaria / Gastos comunes","Seguro del hogar / Otros seguros","Reparaciones","Limpieza","Jardinería","Decoración / Bazar / Mercería"]},"Servicios del hogar":{cat:"Necesidad",subs:["Electricidad (UTE)","Agua (OSE)","Internet / Telefonía","Gas / Saneamiento / Leña","Seguridad"]},Alimentación:{cat:"Necesidad",subs:["Supermercado","Delivery / Restaurantes / Cafeterías","Cumpleaños"]},Transporte:{cat:"Necesidad",subs:["Combustible","Boleto / STM / Taxi–apps","Peajes","Estacionamiento","Mantenimiento vehículo","Seguro del auto","Patente"]},Salud:{cat:"Necesidad",subs:["Mutualista / Seguro médico","Medicamentos","Odontología / Óptica","Psicoterapia / Fisioterapia","Seguro de vida"]},Educación:{cat:"Necesidad",subs:["Matrícula / Cuota colegio / Guardería","Libros y útiles","Cursos / Talleres / Actividades niños","Plataformas educativas","Celulares / Tablets / Computadoras","Uniformes"]},"Cuidado personal":{cat:"Deseos",subs:["Peluquería / Uñas / Estética","Gimnasio / Deporte","Spa / Bienestar","Ropa y calzado"]},Mascotas:{cat:"Deseos",subs:["Alimento","Veterinario / Vacunas","Peluquería / Accesorios"]},"Ocio y cultura":{cat:"Deseos",subs:["Streaming / Música","Cine / Conciertos","Hobbies","Viajes / Vacaciones","Suscripciones (Netflix, HBO, Canva, ChatGPT, etc.)"]},Finanzas:{cat:"Deseos",subs:["Comisiones bancarias","Mantenimiento tarjeta","Intereses financiación"]},"Impuestos y trámites":{cat:"Necesidad",subs:["IVA / IRPF / IRAE / Fonasa","Tasas municipales","Timbres / Sellados","Multas","Fondo de solidaridad","Caja profesional"]},"Regalos y donaciones":{cat:"Deseos",subs:["Regalos","Donaciones / Caridad"]},Imprevistos:{cat:"Necesidad",subs:["Imprevistos"]},"Otros gastos":{cat:"Deseos",subs:["Otros gastos","Seguro de vida sobre saldo"]},Transferencias:{cat:"Transferencias",subs:["Transferencias"]},"Gasto de personal":{cat:"Deseos",subs:["Servicio doméstico / Niñera"]},Inversiones:{cat:"Inversiones",subs:["Inversiones"]},Cobros:{cat:"Cobros",subs:["Cobros"]},"Préstamo recibido":{cat:"Cobros",subs:["Préstamo recibido"]},"Préstamo pagado":{cat:"Pagos",subs:["Préstamo pagado"]},Pagos:{cat:"Pagos",subs:["Pagos"]},Tarjetas:{cat:"Pagos",subs:["Pago tarjetas"]},Servicios:{cat:"Necesidad",subs:["Varios"]}}
};

const BANCOS_LIST = ["ITAU UYU","ITAU USD","SCOTIABANK UYU","SCOTIABANK USD","BROU UYU","BROU USD","OCA","VISA SCOTIA","VISA ITAU","MASTER OCA","AMEX SCOTIA","PREX","Otro"];
const FORMAS = ["Cobro efectivo","Cobro transferencia","Cobro crédito","Pago efectivo","Pago transferencia","Pago crédito","Pago tarjeta de crédito"];
const MESES_NOM = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const CAT_C = {"Ingresos":"#4CAF82","Gasto Fijo":"#f06060","Gasto Variable":"#f0a060","Cobros":"#DDB863","Pagos":"#c860f0","Necesidad":"#8888ee","Deseos":"#cc88cc","Transferencias":"#1D445C","Inversiones":"#1D445C","Variable":"#f0a060","Fijo":"#f06060"};
const MESES_DISP = ["1","2","3","4"];

// Patrones de descripción que indican un pago/traspaso para saldar una tarjeta de crédito
// (quedan pendientes de conciliación con el extracto de la tarjeta). Se chequean en mayúsculas.
const PAGO_TARJETA_PATTERNS = ["PAGO OCA","PAGOTARD","PAGO TARJETA","PAGO TARD","TRASPASO A PAGO","VISA-ILINK","DEB. VARIOS VISA","DEB. VARIOS MASTER","DEB. VARIOS OCA","DEB VARIOS VISA","DEB VARIOS MASTER","DEB VARIOS OCA"];
const PAGO_TARJETA_RE = /PAGOTARD|\bTARD\b|\bTARJETA\b/;

// Normaliza una descripción de movimiento para usarla como "patrón" de aprendizaje:
// quita números/fechas/montos variables, dejando solo la parte fija del texto.
const normalizarDesc = (d) => (d||"").toUpperCase().replace(/[0-9]+/g," ").replace(/\s+/g," ").trim();

// Convierte un número en formato es-UY ("1.500,50" o "1.500"), US ("1,500.50") o estándar ("1500.50") a float.
const parseNum = (s) => {
  if(s===null||s===undefined||s==="") return 0;
  let v = String(s).trim();
  if(!v) return 0;
  const hasComma = v.includes(",");
  const hasDot = v.includes(".");
  if(hasComma && hasDot) {
    // Tiene los dos: el que aparece más a la derecha es el decimal, el otro es separador de miles
    if(v.lastIndexOf(",") > v.lastIndexOf(".")) v = v.replace(/\./g,"").replace(",","."); // es-UY: 1.234,56
    else v = v.replace(/,/g,""); // US: 1,234.56
  } else if(hasComma) {
    // Solo coma -> decimal es-UY (ej "1500,50")
    v = v.replace(",",".");
  } else if(hasDot) {
    // Solo punto: si separa grupos de 3 dígitos (ej "1.500", "-100.000", "12.345.678")
    // es separador de miles es-UY, no decimal. "1500.5" (2 decimales) se deja como está.
    const neg = v.startsWith("-");
    const body = neg ? v.slice(1) : v;
    const parts = body.split(".");
    const last = parts[parts.length-1];
    if(parts.length>1 && last.length===3 && parts.slice(0,-1).every(p=>p.length>=1&&p.length<=3)) {
      v = (neg?"-":"") + parts.join("");
    }
  }
  return parseFloat(v)||0;
};

const fmtN = (n) => "$ " + Math.abs(n||0).toLocaleString("es-UY",{minimumFractionDigits:0,maximumFractionDigits:0});
const fmtD = (d) => { if(!d) return "—"; const [y,m,day]=d.split("-"); return `${day}/${m}/${y}`; };
const today = () => new Date().toISOString().split("T")[0];
const addDays = (d,n) => { if(!d||!n) return d; const days=parseInt(n); if(isNaN(days)) return d; const dt=new Date(d); if(isNaN(dt.getTime())) return d; dt.setDate(dt.getDate()+days); return dt.toISOString().split("T")[0]; };
// Convierte una fecha en formato dd/mm/yyyy o dd-mm-yyyy (es-UY) a "yyyy-mm-dd". Si ya viene en ISO, la deja igual.
const parseFecha = (s) => {
  if(!s) return "";
  s = String(s).trim();
  if(/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(m) return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
  return s;
};

const emptyForm = () => ({fecha:today(),bancoCobPag:"",tipo:"Personal",c1:"Ingresos",c2:"Sueldo",cat:"Ingresos",desc:"",forma:"Cobro transferencia",bancoEmisor:"SCOTIABANK UYU",plazo:"",fechaCP:today(),fechaManual:false,usd:"",tc:"",pesos:"",iva:""});

export default function Moneyland() {
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
  const [searchQ, setSearchQ] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [colDropOpen, setColDropOpen] = useState(false);
  const colDropRef = useRef(null);
  const [visibleCols, setVisibleCols] = useState(["fecha","tipo","banco","categoria","concepto","descripcion","forma","subtotal","total"]);
  const [colFilters, setColFilters] = useState({});
  const [filterDropOpen, setFilterDropOpen] = useState(null);
  const [colFilterSearch, setColFilterSearch] = useState("");
  const filterDropRef = useRef(null);

  useEffect(()=>{
    if(!colDropOpen) return;
    const h=(e)=>{if(colDropRef.current&&!colDropRef.current.contains(e.target))setColDropOpen(false);};
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[colDropOpen]);

  useEffect(()=>{
    if(!filterDropOpen) return;
    const h=(e)=>{if(filterDropRef.current&&!filterDropRef.current.contains(e.target)){setFilterDropOpen(null);setColFilterSearch("");}};
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[filterDropOpen]);
  const [dashFiltro, setDashFiltro] = useState("todos");
  const [persDesde, setPersDesde] = useState("1");
  const [persHasta, setPersHasta] = useState("4");
  const [persBancos, setPersBancos] = useState([]);
  const [bancoDropOpen, setBancoDropOpen] = useState(false);
  const [saldosInicialEdit, setSaldosInicialEdit] = useState({});
  const [saldosFinalEdit, setSaldosFinalEdit] = useState({});
  const [conciliaciones, setConciliaciones] = useState([]);
  const [saldoExtractoDetectado, setSaldoExtractoDetectado] = useState(null);
  const [conciliarAno, setConciliarAno] = useState("2026");
  const [conciliarMeses, setConciliarMeses] = useState(["1","2","3","4","5","6","7","8","9","10","11","12"]);
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loadType, setLoadType] = useState("manual");
  const [loadStep, setLoadStep] = useState("upload");
  const [loadMovs, setLoadMovs] = useState([]);
  const [montoEdit, setMontoEdit] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [bancoCarga, setBancoCarga] = useState("");
  const [periodoMes, setPeriodoMes] = useState("5");
  const [periodoAno, setPeriodoAno] = useState("2026");
  const [fechaPagoTarjeta, setFechaPagoTarjeta] = useState("");
  const [tcCarga, setTcCarga] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);
  const fileRef2 = useRef(null);
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [reglas, setReglas] = useState({});
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [pendienteSelUYU, setPendienteSelUYU] = useState(null);
  const [pendienteSelUSD, setPendienteSelUSD] = useState(null);

  // Load session from localStorage on mount, renovando el token si ya venció o está por vencer
  useEffect(()=>{
    const saved = localStorage.getItem("ml_session");
    if(!saved) return;
    let sess;
    try { sess = JSON.parse(saved); } catch(e){ return; }
    const expSoon = !sess.expires_at || (sess.expires_at*1000 - Date.now() < 60000);
    if(expSoon && sess.refresh_token) {
      sb.auth.refresh(sess.refresh_token).then(data=>{
        if(data.access_token) {
          const newSess = {...sess, ...data};
          setSession(newSess);
          localStorage.setItem("ml_session", JSON.stringify(newSess));
        } else {
          setSession(sess);
        }
      });
    } else {
      setSession(sess);
    }
  },[]);

  // Renueva el token periódicamente para que sesiones largas no se corten
  useEffect(()=>{
    if(!session?.refresh_token) return;
    const id = setInterval(()=>{
      const expSoon = !session.expires_at || (session.expires_at*1000 - Date.now() < 5*60000);
      if(!expSoon) return;
      sb.auth.refresh(session.refresh_token).then(data=>{
        if(data.access_token) {
          const newSess = {...session, ...data};
          setSession(newSess);
          localStorage.setItem("ml_session", JSON.stringify(newSess));
        }
      });
    }, 4*60000);
    return ()=>clearInterval(id);
  },[session]);

  // Load data from Supabase when session changes
  useEffect(()=>{
    if(!session?.access_token) return;
    loadFromDB();
  },[session]);

  const loadFromDB = async () => {
    if(!session?.access_token) return;
    setDbLoading(true);
    try {
      const headers = {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${session.access_token}`};
      const [regsRes, bancosRes, tarjetasRes, reglasRes, pagosPendRes, conciRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/registros?select=*&order=fecha.desc`, {headers}),
        fetch(`${SUPABASE_URL}/rest/v1/bancos?select=*`, {headers}),
        fetch(`${SUPABASE_URL}/rest/v1/tarjetas?select=*`, {headers}),
        fetch(`${SUPABASE_URL}/rest/v1/reglas_categorizacion?select=*`, {headers}),
        fetch(`${SUPABASE_URL}/rest/v1/pagos_tarjeta_pendientes?select=*`, {headers}),
        fetch(`${SUPABASE_URL}/rest/v1/conciliacion_bancaria?select=*`, {headers}),
      ]);
      const regsData = await regsRes.json();
      const bancosData = await bancosRes.json();
      const tarjetasData = await tarjetasRes.json();
      const reglasData = await reglasRes.json();
      const pagosPendData = await pagosPendRes.json();
      if(Array.isArray(regsData)) setRegs(regsData.map(r=>({...r, f:r.fecha, m:r.mes, b:r.banco_cob_pag, t:r.tipo, c1:r.concepto1, c2:r.concepto2, cat:r.categoria, d:r.descripcion, fm:r.forma, be:r.banco_emisor, p:r.pesos, tot:r.total, fechaCP:r.fecha_cp||r.fecha})));
      if(Array.isArray(bancosData) && bancosData.length>0) setConfig(prev=>({...prev, bancos:bancosData}));
      if(Array.isArray(tarjetasData) && tarjetasData.length>0) setConfig(prev=>({...prev, tarjetas:tarjetasData.map(t=>({...t, tipoCarta:t.tipoCarta||t.tipo_carta||"crédito"}))}));
      if(Array.isArray(reglasData)) {
        const map = {};
        reglasData.forEach(r=>{ map[r.patron] = {t:r.tipo, c1:r.concepto1, c2:r.concepto2, esPagoTarjeta:r.es_pago_tarjeta}; });
        setReglas(map);
      } else {
        console.error("Error cargando reglas_categorizacion:", reglasData);
      }
      if(Array.isArray(pagosPendData)) setPagosPendientes(pagosPendData);
      else console.error("Error cargando pagos_tarjeta_pendientes:", pagosPendData);
      const conciData = await conciRes.json();
      if(Array.isArray(conciData)) setConciliaciones(conciData);
    } catch(e){ console.error(e); }
    setDbLoading(false);
  };

  const handleLogin = async () => {
    setAuthLoading(true); setAuthError("");
    const data = await sb.auth.signIn(authEmail, authPass);
    if(data.access_token) {
      setSession(data);
      localStorage.setItem("ml_session", JSON.stringify(data));
    } else {
      setAuthError("Email o contraseña incorrectos");
    }
    setAuthLoading(false);
  };

  const handleRegister = async () => {
    setAuthLoading(true); setAuthError("");
    const data = await sb.auth.signUp(authEmail, authPass);
    if(data.id || data.user?.id) {
      setAuthError("¡Registro exitoso! Revisá tu email para confirmar la cuenta.");
    } else {
      setAuthError(data.msg || data.error_description || "Error al registrarse");
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if(session?.access_token) await sb.auth.signOut(session.access_token);
    setSession(null);
    localStorage.removeItem("ml_session");
    setRegs(DISP_REGS);
  };

  const saveRegToDB = async (reg) => {
    if(!session?.access_token) return null;
    const headers = {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json"};
    const r = await fetch(`${SUPABASE_URL}/rest/v1/registros`, {
      method: "POST",
      headers: {...headers, "Prefer": "return=representation"},
      body: JSON.stringify({
        user_id: session.user?.id,
        fecha: reg.f, mes: reg.m, ano: reg.a,
        banco_cob_pag: reg.b, tipo: reg.t,
        concepto1: reg.c1, concepto2: reg.c2,
        categoria: reg.cat, descripcion: reg.d,
        forma: reg.fm, banco_emisor: reg.be,
        plazo: reg.plazo, pesos: reg.p,
        iva: reg.iva, total: reg.tot
      })
    });
    const data = await r.json();
    const id = Array.isArray(data) ? data[0]?.id : null;
    // best-effort: solo aplica si existen las columnas fecha_cp, usd y tc
    if(id) {
      fetch(`${SUPABASE_URL}/rest/v1/registros?id=eq.${id}`, {
        method: "PATCH",
        headers: {...headers, "Prefer": "return=minimal"},
        body: JSON.stringify({ fecha_cp: reg.fechaCP, usd: reg.usd??null, tc: reg.tc??null })
      }).catch(()=>{});
    }
    return id;
  };

  const deleteAllRegs = async () => {
    if(!session?.access_token) return;
    await fetch(`${SUPABASE_URL}/rest/v1/registros?user_id=eq.${session.user?.id}`, {
      method: "DELETE",
      headers: {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${session.access_token}`}
    });
    setRegs([]);
  };

  const updateRegInDB = async (id, reg) => {
    if(!session?.access_token) return;
    const headers = {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json", "Prefer": "return=minimal"};
    await fetch(`${SUPABASE_URL}/rest/v1/registros?id=eq.${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        fecha: reg.f, mes: reg.m, ano: reg.a,
        banco_cob_pag: reg.b, tipo: reg.t,
        concepto1: reg.c1, concepto2: reg.c2,
        categoria: reg.cat, descripcion: reg.d,
        forma: reg.fm, banco_emisor: reg.be,
        plazo: reg.plazo, pesos: reg.p,
        iva: reg.iva, total: reg.tot
      })
    });
    // best-effort: solo aplica si existen las columnas fecha_cp, usd y tc
    fetch(`${SUPABASE_URL}/rest/v1/registros?id=eq.${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ fecha_cp: reg.fechaCP, usd: reg.usd??null, tc: reg.tc??null })
    }).catch(()=>{});
  };

  // Borra varios registros (por id) de Supabase y del estado local
  const deleteRegsFromDB = async (ids) => {
    if(!ids.length) return;
    if(session?.access_token) {
      await fetch(`${SUPABASE_URL}/rest/v1/registros?id=in.(${ids.join(",")})`, {
        method: "DELETE",
        headers: {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${session.access_token}`}
      });
    }
    setRegs(prev=>prev.filter(r=>!ids.includes(r.id)));
  };
  // Guarda/actualiza una regla de clasificación aprendida para futuras cargas
  const saveReglaToDB = async (patron, regla) => {
    if(!session?.access_token || !patron) return;
    setReglas(prev=>({...prev, [patron]: {t:regla.t, c1:regla.c1, c2:regla.c2, esPagoTarjeta:!!regla.esPagoTarjeta}}));
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/reglas_categorizacion?on_conflict=user_id,patron`, {
        method: "POST",
        headers: {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=minimal"},
        body: JSON.stringify({
          user_id: session.user?.id,
          patron,
          tipo: regla.t,
          concepto1: regla.c1,
          concepto2: regla.c2,
          es_pago_tarjeta: !!regla.esPagoTarjeta
        })
      });
      if(!r.ok) console.error("Error guardando regla de clasificación:", patron, r.status, await r.text());
    } catch(e) { console.error("Error guardando regla de clasificación:", patron, e); }
  };
  // Guarda un pago a tarjeta detectado en un extracto bancario, para conciliarlo luego con el estado de la tarjeta
  const authHeaders = () => ({"apikey":SUPABASE_KEY,"Authorization":`Bearer ${session.access_token}`,"Content-Type":"application/json"});

  const saveBancoToDB = async (banco) => {
    if(!session?.access_token) return null;
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/bancos`, {method:"POST", headers:{...authHeaders(),"Prefer":"return=representation"}, body:JSON.stringify({nombre:banco.nombre, moneda:banco.moneda, tipo:banco.tipo, activo:banco.activo})});
      const d = await r.json(); return Array.isArray(d)?d[0]:null;
    } catch(e){console.error("saveBanco",e);return null;}
  };
  const updateBancoToDB = async (id, upd) => {
    if(!session?.access_token) return;
    try { await fetch(`${SUPABASE_URL}/rest/v1/bancos?id=eq.${id}`, {method:"PATCH", headers:{...authHeaders(),"Prefer":"return=minimal"}, body:JSON.stringify(upd)}); } catch(e){console.error("updateBanco",e);}
  };
  const saveTarjetaToDB = async (t) => {
    if(!session?.access_token) return null;
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/tarjetas`, {method:"POST", headers:{...authHeaders(),"Prefer":"return=representation"}, body:JSON.stringify({nombre:t.nombre, banco:t.banco, moneda:t.moneda, tipo_carta:t.tipoCarta, tipo:t.tipo, activo:t.activo})});
      const d = await r.json();
      const row = Array.isArray(d)?d[0]:null;
      return row ? {...row, tipoCarta: row.tipo_carta} : null;
    } catch(e){console.error("saveTarjeta",e);return null;}
  };
  const updateTarjetaToDB = async (id, upd) => {
    if(!session?.access_token) return;
    const dbUpd = {...upd};
    if("tipoCarta" in dbUpd) { dbUpd.tipo_carta = dbUpd.tipoCarta; delete dbUpd.tipoCarta; }
    try { await fetch(`${SUPABASE_URL}/rest/v1/tarjetas?id=eq.${id}`, {method:"PATCH", headers:{...authHeaders(),"Prefer":"return=minimal"}, body:JSON.stringify(dbUpd)}); } catch(e){console.error("updateTarjeta",e);}
  };

  const savePagoPendiente = async (pago) => {
    if(!session?.access_token) return;
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/pagos_tarjeta_pendientes`, {
        method: "POST",
        headers: {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json", "Prefer": "return=representation"},
        body: JSON.stringify({
          user_id: session.user?.id,
          tarjeta: pago.tarjeta,
          banco: pago.banco,
          fecha: pago.fecha,
          mes: pago.mes,
          ano: pago.ano,
          moneda: pago.moneda,
          monto: pago.monto,
          descripcion: pago.descripcion,
          conciliado: false
        })
      });
      const data = await r.json();
      const nuevo = Array.isArray(data) ? data[0] : null;
      if(nuevo) setPagosPendientes(prev=>[...prev, nuevo]);
      else console.error("Error guardando pago pendiente:", pago, data);
    } catch(e) { console.error("Error guardando pago pendiente:", pago, e); }
  };
  // Marca un pago pendiente como conciliado al confirmar el estado de la tarjeta correspondiente
  const marcarPendienteConciliado = async (id) => {
    if(!session?.access_token || !id) return;
    setPagosPendientes(prev=>prev.map(p=>p.id===id?{...p,conciliado:true}:p));
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/pagos_tarjeta_pendientes?id=eq.${id}`, {
        method: "PATCH",
        headers: {"apikey": SUPABASE_KEY, "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json", "Prefer": "return=minimal"},
        body: JSON.stringify({ conciliado: true })
      });
    } catch(e) { console.error("Error conciliando pago pendiente:", id, e); }
  };

  const upsertConciliacion = async ({banco, moneda, ano, mes, ...fields}) => {
    if(!session?.access_token) return;
    setConciliaciones(prev => {
      const idx = prev.findIndex(c => c.banco===banco && c.moneda===moneda && c.ano===ano && c.mes===mes);
      if(idx>=0){ const n=[...prev]; n[idx]={...n[idx],...fields}; return n; }
      return [...prev, {banco, moneda, ano, mes, ...fields}];
    });
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/conciliacion_bancaria`, {
        method: "POST",
        headers: {...authHeaders(), "Prefer": "resolution=merge-duplicates"},
        body: JSON.stringify({banco, moneda, ano, mes, ...fields})
      });
    } catch(e) { console.error("Error guardando conciliacion:", e); }
  };

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

  async function submit(){
    const mes=form.fecha?String(new Date(form.fecha).getMonth()+1):"";
    const reg={id:Date.now(),f:form.fecha,m:mes,a:form.fecha?String(new Date(form.fecha).getFullYear()):"",b:form.bancoCobPag,t:form.tipo,c1:form.c1,c2:form.c2,cat:catAuto,d:form.desc,fm:form.forma,be:form.bancoEmisor,plazo:form.plazo,fechaCP:fechaCPCalc,usd:usdN||null,tc:tcN||null,p:pesosCalc,iva:ivaNum||null,tot:totalCalc};
    const id = await saveRegToDB(reg);
    setRegs(p=>[{...reg,id:id||reg.id},...p]);
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
  const GRUPO_COLOR={Necesidades:"#1D445C",Deseos:"#cc88cc",Inversiones:"#f0c060",Transferencias:"#8C8C8C"};
  const GRUPO_BG={Necesidades:"rgba(96,200,240,0.05)",Deseos:"rgba(204,136,204,0.05)",Inversiones:"rgba(240,192,96,0.05)",Transferencias:"rgba(128,128,128,0.04)"};
  const GRUPO_LABEL={Necesidades:"Pagos por necesidades",Deseos:"Pagos por deseos",Inversiones:"Inversiones",Transferencias:"Transferencias"};

  const grupoTotMes = (g,m) => pivotCat[m]?.[g]||0;
  const grupoTot = (g) => mesesFiltrados.reduce((s,m)=>s+grupoTotMes(g,m),0);

  const fmtCell = (v) => { if(!v) return ""; return (v<0?"-":"")+"$ "+Math.abs(v).toLocaleString("es-UY",{minimumFractionDigits:0,maximumFractionDigits:0}); };
  const cellSt = (v) => ({textAlign:"right",fontFamily:"Lora",fontSize:11,fontWeight:v!==0?"600":"400",color:v>0?"#4CAF82":v<0?"#f06060":"#333",padding:"5px 10px",borderRight:"1px solid rgba(255,255,255,0.04)",whiteSpace:"nowrap"});

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
  const ctrlSt = (v) => ({fontFamily:"Lora",fontSize:11,fontWeight:700,textAlign:"right",padding:"7px 10px",color:Math.abs(v)<0.1?"#4CAF82":"#f06060",background:Math.abs(v)<0.1?"rgba(96,240,160,0.05)":"rgba(240,96,96,0.08)"});
  const inpSt = (c) => ({width:"100%",background:"#1A1A1A",border:`1px solid ${c}44`,borderRadius:4,color:c,fontFamily:"Lora",fontSize:11,fontWeight:700,padding:"5px 8px",textAlign:"right",outline:"none",boxSizing:"border-box"});
  const BANCOS_CONC=[{id:"ITAU UYU",label:"Itaú UYU",moneda:"UYU"},{id:"SCOTIABANK UYU",label:"Scotiabank UYU",moneda:"UYU"},{id:"ITAU USD",label:"Itaú USD",moneda:"USD"},{id:"SCOTIABANK USD",label:"Scotiabank USD",moneda:"USD"}];

  const periodoLabel = persDesde===persHasta ? MESES_NOM[+persDesde] : `${MESES_NOM[+persDesde]} – ${MESES_NOM[+persHasta]}`;

  const S = {
    page:{minHeight:"100vh",background:"#0A0A0A",color:"#F8F4E8",fontFamily:"'Roboto',sans-serif",fontSize:13},
    bar:{display:"flex",alignItems:"center",padding:"0 20px",height:50,borderBottom:"1px solid rgba(221,184,99,0.12)",gap:10,flexShrink:0},
    logo:{fontFamily:"Lora",fontSize:18,fontWeight:800,letterSpacing:-0.5},
    tabs:{display:"flex",borderBottom:"1px solid rgba(221,184,99,0.12)",padding:"0 20px",flexShrink:0,overflowX:"auto"},
    tab:a=>({padding:"10px 14px",fontSize:11,cursor:"pointer",background:"none",border:"none",borderBottom:a?"2px solid #c8f060":"2px solid transparent",color:a?"#DDB863":"#8C8C8C",fontFamily:"Roboto",whiteSpace:"nowrap"}),
    body:{padding:20,maxWidth:1000,margin:"0 auto"},
    card:{background:"#141414",border:"1px solid rgba(221,184,99,0.12)",borderRadius:8,padding:16,marginBottom:12},
    secT:{fontFamily:"Lora",fontSize:11,fontWeight:700,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.8,marginBottom:12},
    lbl:{display:"block",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.7,marginBottom:4},
    inp:{width:"100%",background:"#1E1E1E",border:"1px solid rgba(221,184,99,0.15)",borderRadius:5,padding:"8px 10px",color:"#F8F4E8",fontFamily:"Roboto",fontSize:12,outline:"none",boxSizing:"border-box"},
    sel:{width:"100%",background:"#1E1E1E",border:"1px solid rgba(221,184,99,0.15)",borderRadius:5,padding:"8px 10px",color:"#F8F4E8",fontFamily:"Roboto",fontSize:12,outline:"none",cursor:"pointer",boxSizing:"border-box"},
    calc:{width:"100%",background:"#111111",border:"1px solid rgba(255,255,255,0.04)",borderRadius:5,padding:"8px 10px",color:"#DDB863",fontFamily:"Lora",fontSize:13,fontWeight:700,boxSizing:"border-box"},
    g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
    g3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12},
    g4:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12},
    g5:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:12},
    badge:(c)=>({display:"inline-block",fontSize:10,padding:"2px 7px",borderRadius:3,background:(CAT_C[c]||"#8C8C8C")+"20",color:CAT_C[c]||"#8C8C8C",border:`1px solid ${CAT_C[c]||"#8C8C8C"}33`}),
    pill:(c)=>({fontSize:9,padding:"2px 6px",borderRadius:3,background:c+"20",color:c,display:"inline-block"}),
  };

  const selStyle = {background:"#1E1E1E",border:"1px solid rgba(221,184,99,0.18)",borderRadius:5,color:"#F8F4E8",fontFamily:"Roboto",fontSize:11,padding:"5px 8px",cursor:"pointer"};

  const downloadTemplate = () => {
    const rows = [
      "sep=;",
      "Fecha;Año;Mes;Banco cobra/paga;Tipo;Concepto 1;Concepto 2;Categoría;Descripcion;Forma cobro/pago;Banco emisor;Plazo dias;Fecha de cobro / pago;USD;TC;Pesos;IVA;Total"
    ];
    const csv = "﻿" + rows.join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})); a.download = "FinCFO_plantilla.csv"; a.click();
  };

  const procesarConIA = async (texto, tipo) => {
    setLoadStep("processing");
    try {
      const res = await fetch("/api/categorizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, tipo, banco: bancoCarga, mesNombre: MESES_NOM[+periodoMes], ano: periodoAno }),
      });
      const data = await res.json();
      const parsed = JSON.parse((data.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim());
      // Para extractos bancarios, la moneda es la de la cuenta elegida (cada cuenta es de una sola moneda) —
      // no se confía en lo que la IA detecte por movimiento, que puede ser inconsistente.
      const monedaCuenta = tipo==="banco" ? (config.bancos.find(b=>b.nombre===bancoCarga)?.moneda || "UYU") : null;
      const movs = (parsed.movimientos||[]).map((m,i)=>{
        const desc = (m.descripcion||"").toUpperCase();
        const regla = reglas[normalizarDesc(m.descripcion)];
        const matchesPagoTarjeta = PAGO_TARJETA_PATTERNS.some(p=>desc.includes(p)) || PAGO_TARJETA_RE.test(desc);
        const esPagoTarjeta = (tipo==="banco") && (matchesPagoTarjeta || (regla ? !!regla.esPagoTarjeta : m.esPagoTarjeta||false));
        const t = regla?.t || m.tipo || "Personal";
        const c1 = regla?.c1 || m.concepto1;
        const c2 = regla?.c2 ?? (m.concepto2||"");
        const fecha = (tipo==="tarjeta" && fechaPagoTarjeta) ? fechaPagoTarjeta : m.fecha;
        const fm = tipo==="banco" ? "Pago transferencia" : "Pago tarjeta de crédito";
        const moneda = tipo==="banco" ? monedaCuenta : (m.moneda||"UYU");
        return {id:i+1,f:fecha,m:String(new Date(fecha||"2026-01-01").getMonth()+1),b:bancoCarga,t,c1,c2,cat:TX[t]?.[c1]?.cat||"",d:m.descripcion,fm,be:bancoCarga,plazo:"0",fechaCP:fecha,usd:null,tc:null,p:Math.abs(m.monto||0)*(m.monto<0?-1:1),iva:null,tot:m.monto||0,moneda,esPagoTarjeta,confianza:regla?"alta":(m.confianza||"alta"),pendiente:esPagoTarjeta};
      });
      if(tipo==="banco" && typeof parsed.saldoFinal === "number" && parsed.saldoFinal !== 0) {
        setSaldoExtractoDetectado(parsed.saldoFinal);
      } else if(tipo==="banco") {
        setSaldoExtractoDetectado(null);
      }
      setLoadMovs(movs); setLoadStep("review");
    } catch(e) { setLoadError("Error al procesar. Verificá el archivo."); setLoadStep("upload"); }
  };

  const extractPdfText = async (file) => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).href;
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    let text = "";
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      const items = content.items.filter(i => i.str && i.str.trim());
      items.sort((a, b) => {
        const dy = b.transform[5] - a.transform[5];
        return Math.abs(dy) > 3 ? dy : a.transform[4] - b.transform[4];
      });
      // Detectar x del encabezado de columna USD para etiquetar montos por columna
      let usdColX = null;
      for (const item of items) {
        if (/U\$S|U\$\$|USD/i.test(item.str.trim()) && usdColX === null) {
          usdColX = item.transform[4] + (item.width || 0) / 2;
        }
      }
      let lastY = null;
      let row = [];
      const flush = () => { if (row.length) { text += row.join("\t") + "\n"; row = []; } };
      for (const item of items) {
        const y = item.transform[5];
        const xCenter = item.transform[4] + (item.width || 0) / 2;
        if (lastY !== null && Math.abs(y - lastY) > 3) flush();
        let str = item.str;
        if (usdColX !== null && /^[\d.,]+$/.test(str.trim())) {
          if (Math.abs(xCenter - usdColX) < 35) str = `[USD]${str}`;
          else if (xCenter < usdColX - 20) str = `[UYU]${str}`;
        }
        row.push(str);
        lastY = y;
      }
      flush();
      text += "\n";
    }
    return text;
  };

  const handleFile = async (file, tipo) => {
    setFileName(file.name); setLoadError("");
    let text;
    if(/\.xlsx?$/i.test(file.name)){
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, {type:"array", cellDates:true});
      const sheet = wb.Sheets[wb.SheetNames[0]];
      text = XLSX.utils.sheet_to_csv(sheet, {dateNF:"yyyy-mm-dd"});
    } else if(/\.pdf$/i.test(file.name)){
      text = await extractPdfText(file);
    } else {
      text = await file.text();
    }
    if(tipo==="masiva"){
      let lines = text.split(/\r?\n/).filter(l=>l.trim());
      if(/^sep=/i.test(lines[0])) lines = lines.slice(1);
      // Detecta el separador: ; (plantilla es-UY) o , (xlsx exportado por SheetJS)
      const delim = lines[0].split(";").length > lines[0].split(",").length ? ";" : ",";
      const clean = (s) => (s||"").trim().replace(/^"(.*)"$/,"$1").trim();
      // Normaliza encabezados para comparar sin tildes, mayúsculas ni espacios
      const norm = (s) => (s||"").toLowerCase().normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]","g"),"").replace(/\s+/g,"");
      const hdr = lines[0].split(delim).map(clean);
      const movs = [];
      for(let i=1;i<lines.length;i++){
        const cols = lines[i].split(delim).map(clean);
        if(cols.length<3) continue;
        const get=(key)=>{
          const target = norm(key);
          let idx = hdr.findIndex(h=>norm(h)===target);
          if(idx<0) idx = hdr.findIndex(h=>norm(h).includes(target));
          return idx>=0?(cols[idx]||"").trim():"";
        };
        const f=parseFecha(get("fecha")),c1=get("concepto1");
        if(!f||!c1||isNaN(new Date(f).getTime())) continue;
        const t = get("tipo")||"Personal";
        const plazo = get("plazodias");
        const usd = parseNum(get("usd"));
        const tc = parseNum(get("tc"));
        const pesosCSV = parseNum(get("pesos"));
        const p = (usd&&tc) ? usd*tc : pesosCSV;
        const iva = parseNum(get("iva"))||null;
        const totalCSV = get("total");
        const tot = totalCSV ? parseNum(totalCSV) : p+(iva||0);
        const cat = get("categoria") || TX[t]?.[c1]?.cat || "";
        const fechaCP = parseFecha(get("fechadecobro/pago")) || (plazo?addDays(f,plazo):f);
        movs.push({id:i,f,m:String(new Date(f).getMonth()+1),b:get("bancocobra/paga"),t,c1,c2:get("concepto2"),cat,d:get("descripcion"),fm:get("formacobro/pago"),be:get("bancoemisor"),plazo,fechaCP,usd:usd||null,tc:tc||null,p,iva,tot,pendiente:false,confianza:"alta"});
      }
      setLoadMovs(movs); setLoadStep("review");
    } else await procesarConIA(text, tipo);
  };

  const confirmar = async () => {
    const tcVal = parseFloat(tcCarga)||0;
    const toSave = loadMovs.filter(m=>!m.pendiente).map(m=>{
      const base = {...m, a: m.f ? String(new Date(m.f).getFullYear()) : ""};
      if(m.moneda==="USD" && tcVal) {
        const usdAmt = Math.abs(m.tot||0);
        const sign = (m.tot||0)<0 ? -1 : 1;
        const pesos = usdAmt * tcVal * sign;
        return {...base, usd:usdAmt, tc:tcVal, p:pesos, tot:pesos};
      }
      return base;
    });
    const ids = await Promise.all(toSave.map(m=>saveRegToDB(m)));
    // Aprende la clasificación de cada movimiento (incluidos los pendientes de conciliación) para futuras cargas
    loadMovs.forEach(m=>{
      const patron = normalizarDesc(m.d);
      if(patron) saveReglaToDB(patron, {t:m.t, c1:m.c1, c2:m.c2, esPagoTarjeta:!!m.esPagoTarjeta});
      if(m.esPagoTarjeta && m.tarjetaDestino) {
        savePagoPendiente({tarjeta:m.tarjetaDestino, banco:bancoCarga, fecha:m.f, mes:periodoMes, ano:periodoAno, moneda:m.monedaPago||m.moneda||"UYU", monto:Math.abs(m.tot||0), descripcion:m.d});
      }
    });
    const diffRegs = [];
    if(loadType==="tarjeta") {
      const monedasUsadas = [...new Set(loadMovs.map(m=>m.moneda||"UYU"))];
      for(const moneda of monedasUsadas) {
        const pendId = moneda==="USD" ? pendienteSelUSD : pendienteSelUYU;
        if(!pendId) continue;
        const pend = pagosPendientes.find(p=>p.id===pendId);
        if(!pend) continue;
        const totalCalc = loadMovs.filter(m=>(m.moneda||"UYU")===moneda).reduce((s,m)=>s+(m.tot||0),0);
        const diff = Math.abs(totalCalc) - Math.abs(pend.monto);
        if(Math.abs(diff)>=1) {
          const fechaDiff = fechaPagoTarjeta || today();
          diffRegs.push({id:Date.now()+Math.random(), f:fechaDiff, m:String(new Date(fechaDiff).getMonth()+1), a:String(new Date(fechaDiff).getFullYear()), b:bancoCarga, t:"Personal", c1:"Otros gastos", c2:"Otros gastos", cat:TX.Personal["Otros gastos"].cat, d:`Diferencia de conciliación con pago bancario (${moneda})`, fm:"Ajuste", be:bancoCarga, plazo:"0", fechaCP:fechaDiff, usd:null, tc:null, p:diff, iva:null, tot:diff, moneda});
        }
      }
      if(pendienteSelUYU) marcarPendienteConciliado(pendienteSelUYU);
      if(pendienteSelUSD) marcarPendienteConciliado(pendienteSelUSD);
      setPendienteSelUYU(null); setPendienteSelUSD(null);
    }
    const diffIds = await Promise.all(diffRegs.map(m=>saveRegToDB(m)));
    setRegs(prev=>[
      ...diffRegs.map((m,i)=>({...m,id:diffIds[i]||m.id})),
      ...toSave.map((m,i)=>({...m,id:ids[i]||(Date.now()+m.id)})),
      ...prev
    ]);
    if(loadType==="banco" && saldoExtractoDetectado != null) {
      const monedaBanco = config.bancos.find(b=>b.nombre===bancoCarga)?.moneda || "UYU";
      await upsertConciliacion({banco:bancoCarga, moneda:monedaBanco, ano:periodoAno, mes:periodoMes, saldo_extracto:saldoExtractoDetectado});
      setSaldoExtractoDetectado(null);
    }
    setLoadStep("done"); setLoadMovs([]);
  };

  // ── PANTALLA DE LOGIN ──────────────────────────────────────────────────────
  if(!session?.access_token) {
    return (
      <div style={{minHeight:"100vh",background:"#0A0A0A",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Roboto',sans-serif"}}>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Lora:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet"/>
        <div style={{background:"#141414",border:"1px solid rgba(221,184,99,0.2)",borderRadius:12,padding:40,width:"100%",maxWidth:400,margin:"0 20px"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontFamily:"Lora",fontSize:28,fontWeight:700,color:"#F8F4E8",marginBottom:4}}>
              Money<span style={{color:"#DDB863"}}>land</span>
            </div>
            <div style={{fontSize:12,color:"#8C8C8C"}}>Tu CFO digital</div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:24}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{setAuthMode(m);setAuthError("");}}
                style={{flex:1,padding:"8px",borderRadius:6,border:`1px solid ${authMode===m?"rgba(221,184,99,0.5)":"rgba(221,184,99,0.15)"}`,background:authMode===m?"rgba(221,184,99,0.12)":"transparent",color:authMode===m?"#DDB863":"#8C8C8C",fontFamily:"Roboto",fontSize:12,cursor:"pointer"}}>
                {m==="login"?"Iniciar sesión":"Registrarse"}
              </button>
            ))}
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.7,marginBottom:4}}>Email</label>
            <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)}
              placeholder="tu@email.com"
              onKeyDown={e=>e.key==="Enter"&&(authMode==="login"?handleLogin():handleRegister())}
              style={{width:"100%",background:"#1E1E1E",border:"1px solid rgba(221,184,99,0.2)",borderRadius:6,padding:"10px 12px",color:"#F8F4E8",fontFamily:"Roboto",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:24}}>
            <label style={{display:"block",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.7,marginBottom:4}}>Contraseña</label>
            <input type="password" value={authPass} onChange={e=>setAuthPass(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e=>e.key==="Enter"&&(authMode==="login"?handleLogin():handleRegister())}
              style={{width:"100%",background:"#1E1E1E",border:"1px solid rgba(221,184,99,0.2)",borderRadius:6,padding:"10px 12px",color:"#F8F4E8",fontFamily:"Roboto",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
          </div>
          {authError&&<div style={{fontSize:12,marginBottom:16,padding:"8px 12px",borderRadius:6,background:authError.includes("exitoso")?"rgba(76,175,130,0.1)":"rgba(240,96,96,0.1)",color:authError.includes("exitoso")?"#4CAF82":"#f06060"}}>{authError}</div>}
          <button onClick={authMode==="login"?handleLogin:handleRegister}
            disabled={authLoading||!authEmail||!authPass}
            style={{width:"100%",background:"#DDB863",color:"#0A0A0A",border:"none",borderRadius:8,padding:"12px",fontFamily:"Lora",fontSize:14,fontWeight:700,cursor:"pointer",opacity:authLoading||!authEmail||!authPass?0.6:1}}>
            {authLoading?"Cargando...":(authMode==="login"?"Entrar →":"Crear cuenta →")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Lora:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet"/>

      {/* TOPBAR */}
      <div style={S.bar}>
        <div style={S.logo}>Money<span style={{color:"#DDB863"}}>land</span></div>
        <div style={{fontSize:10,color:"#4A4A4A",background:"#1E1E1E",border:"1px solid rgba(255,255,255,0.07)",borderRadius:4,padding:"2px 8px",letterSpacing:1}}>RIVERO · MALAN · 2026 · UYU</div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
          {dbLoading&&<div style={{fontSize:10,color:"#DDB863"}}>Sincronizando...</div>}
          {session?.user?.email&&<div style={{fontSize:11,color:"#8C8C8C"}}>{session.user.email}</div>}
          <button onClick={handleLogout} style={{background:"none",border:"1px solid rgba(221,184,99,0.2)",borderRadius:4,color:"#8C8C8C",fontFamily:"Roboto",fontSize:11,padding:"3px 10px",cursor:"pointer"}}>Salir</button>
        </div>
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
                  style={{background:dashFiltro===f?"rgba(221,184,99,0.14)":"#141414",border:`1px solid ${dashFiltro===f?"rgba(221,184,99,0.5)":"rgba(221,184,99,0.12)"}`,color:dashFiltro===f?"#DDB863":"#8C8C8C",borderRadius:5,padding:"5px 14px",fontFamily:"Roboto",fontSize:11,cursor:"pointer"}}>
                  {f==="todos"?"Todo":f}
                </button>
              ))}
            </div>
            <div style={{...S.g4,marginBottom:12}}>
              {[
                {label:"Ingresos",val:fmtN(totalIng),color:"#4CAF82",sub:"Ene–Abr 2026"},
                {label:"Egresos",val:fmtN(totalEgr),color:"#f06060",sub:"Ene–Abr 2026"},
                {label:"Resultado neto",val:fmtN(totalIng-totalEgr),color:(totalIng-totalEgr)>=0?"#DDB863":"#f06060",sub:"Ene–Abr 2026"},
                {label:"Registros",val:"671",color:"#1D445C",sub:"16 negocio · 655 personal"},
              ].map(k=>(
                <div key={k.label} style={S.card}>
                  <div style={{...S.lbl,marginBottom:6}}>{k.label}</div>
                  <div style={{fontFamily:"Lora",fontSize:20,fontWeight:800,color:k.color,marginBottom:3}}>{k.val}</div>
                  <div style={{fontSize:10,color:"#4A4A4A"}}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div style={{...S.g2,marginBottom:12}}>
              <div style={S.card}>
                <div style={S.secT}>Flujo mensual</div>
                <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
                  {MESES_DISP.map(m=>{
                    const v=monthly[m]||{ing:0,egr:0};
                    return (
                      <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
                        <div style={{width:"100%",display:"flex",gap:2,alignItems:"flex-end",height:72}}>
                          <div style={{flex:1,height:Math.max(Math.round((v.ing/maxBar)*72),2),background:"#4CAF82",borderRadius:"3px 3px 0 0",opacity:.8}} title={fmtN(v.ing)}/>
                          <div style={{flex:1,height:Math.max(Math.round((v.egr/maxBar)*72),2),background:"#f06060",borderRadius:"3px 3px 0 0",opacity:.7}} title={fmtN(v.egr)}/>
                        </div>
                        <div style={{fontSize:9,color:"#4A4A4A",marginTop:4}}>{MESES_NOM[+m]}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:14,marginTop:10}}>
                  {[["#4CAF82","Ingresos"],["#f06060","Egresos"]].map(([c,l])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#8C8C8C"}}>
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
                      <span style={{fontFamily:"Lora",fontSize:11,fontWeight:700,color:"#f06060"}}>{fmtN(val)}</span>
                    </div>
                    <div style={{height:3,background:"#1E1E1E",borderRadius:2}}>
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
                  <div style={{width:6,height:6,borderRadius:"50%",background:(r.tot||0)>0?"#4CAF82":"#f06060",flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.c1} · {r.c2||r.d}</div>
                    <div style={{fontSize:10,color:"#4A4A4A"}}>{r.b} · {fmtD(r.f)}</div>
                  </div>
                  <span style={S.badge(r.cat)}>{r.cat}</span>
                  <div style={{fontFamily:"Lora",fontSize:13,fontWeight:700,color:(r.tot||0)>0?"#4CAF82":"#f06060",minWidth:80,textAlign:"right"}}>
                    {(r.tot||0)>0?"+":"-"}{fmtN(r.tot).replace("$ ","")}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── + NUEVO ── */}
        {mainTab==="form" && (
          <>
            <div style={{fontFamily:"Lora",fontSize:18,fontWeight:800,marginBottom:16}}>Nuevo registro</div>

            {/* Selector de modo */}
            <div style={{...S.g4,marginBottom:20}}>
              {[{k:"manual",i:"✏️",t:"Manual",d:"Un registro"},{k:"masiva",i:"📊",t:"Carga masiva",d:"Subí un CSV"},{k:"banco",i:"🏦",t:"Extracto banco",d:"IA categoriza"},{k:"tarjeta",i:"💳",t:"Tarjeta crédito",d:"IA categoriza"}].map(o=>(
                <div key={o.k} onClick={()=>{setLoadType(o.k);setLoadStep("upload");setLoadMovs([]);setLoadError("");setFileName("");setFechaPagoTarjeta("");setPendienteSelUYU(null);setPendienteSelUSD(null);}}
                  style={{...S.card,cursor:"pointer",border:`1px solid ${loadType===o.k?"rgba(221,184,99,0.4)":"rgba(221,184,99,0.12)"}`,background:loadType===o.k?"rgba(221,184,99,0.08)":"#141414",marginBottom:0,transition:"all .1s"}}>
                  <div style={{fontSize:22,marginBottom:6}}>{o.i}</div>
                  <div style={{fontFamily:"Lora",fontSize:12,fontWeight:700,color:loadType===o.k?"#DDB863":"#F8F4E8",marginBottom:3}}>{o.t}</div>
                  <div style={{fontSize:10,color:"#8C8C8C"}}>{o.d}</div>
                </div>
              ))}
            </div>

            {/* CARGA MASIVA */}
            {loadType==="masiva"&&loadStep==="upload"&&(
              <div style={S.card}>
                <div style={S.secT}>Carga masiva</div>
                <p style={{fontSize:12,color:"#8C8C8C",marginBottom:16}}>Descargá la plantilla, completala y subila. Ideal para carga inicial histórica.</p>
                <button onClick={downloadTemplate} style={{background:"rgba(221,184,99,0.1)",border:"1px solid rgba(221,184,99,0.3)",borderRadius:6,color:"#DDB863",fontFamily:"Lora",fontSize:13,fontWeight:700,padding:"10px 20px",cursor:"pointer",marginBottom:20,display:"block"}}>⬇ Descargar plantilla CSV</button>
                <div style={{border:"1.5px dashed rgba(221,184,99,0.2)",borderRadius:8,padding:32,textAlign:"center",cursor:"pointer"}}
                  onClick={()=>fileRef.current?.click()}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(221,184,99,0.5)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(221,184,99,0.2)"}>
                  <div style={{fontSize:28,marginBottom:8}}>📂</div>
                  <div style={{fontSize:13,color:"#8C8C8C"}}>{fileName||"Subir CSV completado"}</div>
                  <input ref={fileRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],"masiva")}/>
                </div>
                {loadError&&<div style={{color:"#f06060",fontSize:12,marginTop:10}}>{loadError}</div>}
              </div>
            )}

            {/* BANCO / TARJETA — UPLOAD */}
            {(loadType==="banco"||loadType==="tarjeta")&&loadStep==="upload"&&(
              <div style={S.card}>
                <div style={S.secT}>{loadType==="banco"?"Estado de cuenta bancario":"Estado de cuenta de tarjeta"}</div>
                <div style={{...(loadType==="tarjeta"?S.g4:S.g3),marginBottom:16}}>
                  <div>
                    <label style={S.lbl}>{loadType==="banco"?"Banco":"Tarjeta"}</label>
                    <select value={bancoCarga} onChange={e=>{setBancoCarga(e.target.value);setPendienteSelUYU(null);setPendienteSelUSD(null);}} style={S.sel}>
                      <option value="">— seleccionar —</option>
                      {(loadType==="banco"?bancosActivos:tarjetasActivas).map(b=><option key={b}>{b}</option>)}
                    </select>
                    {!bancoCarga&&<div style={{fontSize:10,color:"#f06060",marginTop:4}}>Crealo primero en ⚙ Config</div>}
                  </div>
                  <div><label style={S.lbl}>Mes</label>
                    <select value={periodoMes} onChange={e=>setPeriodoMes(e.target.value)} style={S.sel}>
                      {["1","2","3","4","5","6","7","8","9","10","11","12"].map(m=><option key={m} value={m}>{MESES_NOM[+m]}</option>)}
                    </select>
                  </div>
                  <div><label style={S.lbl}>Año</label><input type="number" value={periodoAno} onChange={e=>setPeriodoAno(e.target.value)} style={S.inp}/></div>
                  {loadType==="tarjeta"&&(
                    <div>
                      <label style={S.lbl}>Fecha de pago *</label>
                      <input type="date" value={fechaPagoTarjeta} onChange={e=>setFechaPagoTarjeta(e.target.value)} style={{...S.inp,color:fechaPagoTarjeta?"#DDB863":"#8C8C8C"}}/>
                      <div style={{fontSize:10,color:"#8C8C8C",marginTop:4}}>Cuándo salió del banco</div>
                    </div>
                  )}
                </div>
                {loadType==="tarjeta" && bancoCarga && (()=>{
                  const pendientesTarjeta = pagosPendientes.filter(p=>p.tarjeta===bancoCarga && !p.conciliado);
                  if(!pendientesTarjeta.length) return null;
                  return (
                    <div style={{...S.card,background:"rgba(200,96,240,0.06)",border:"1px solid rgba(200,96,240,0.3)",marginBottom:16,padding:"12px 16px"}}>
                      <div style={{fontFamily:"Lora",fontSize:13,fontWeight:700,color:"#c860f0",marginBottom:8}}>💳 Pagos detectados en el banco para esta tarjeta</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {pendientesTarjeta.map(p=>{
                          const sel = (p.moneda==="USD"?pendienteSelUSD:pendienteSelUYU)===p.id;
                          return (
                            <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,background:sel?"rgba(200,96,240,0.12)":"#1A1A1A",border:`1px solid ${sel?"rgba(200,96,240,0.5)":"rgba(255,255,255,0.06)"}`,borderRadius:6,padding:"6px 10px"}}>
                              <div style={{fontSize:11,color:"#F8F4E8"}}>{fmtD(p.fecha)} — {p.moneda==="USD"?"U$S ":"$ "}{Math.abs(p.monto).toLocaleString("es-UY",{minimumFractionDigits:0,maximumFractionDigits:0})} {p.moneda} ({p.banco})</div>
                              <button type="button" onClick={()=>{
                                setFechaPagoTarjeta(p.fecha);
                                if(p.moneda==="USD") setPendienteSelUSD(p.id); else setPendienteSelUYU(p.id);
                              }} style={{background:sel?"#c860f0":"rgba(221,184,99,0.1)",border:"none",borderRadius:4,color:sel?"#0A0A0A":"#DDB863",fontFamily:"Roboto",fontSize:10,padding:"4px 10px",cursor:"pointer",fontWeight:700,whiteSpace:"nowrap"}}>
                                {sel?"✓ Vinculado":"Usar esta fecha"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                {/* Para tarjeta también se requiere la fecha de pago antes de subir */}
                {(() => { const canUpload = bancoCarga && (loadType==="banco" || fechaPagoTarjeta); return (
                <div style={{border:"1.5px dashed rgba(221,184,99,0.2)",borderRadius:8,padding:32,textAlign:"center",cursor:canUpload?"pointer":"not-allowed",opacity:canUpload?1:0.5}}
                  onClick={()=>canUpload&&fileRef2.current?.click()}
                  onMouseEnter={e=>bancoCarga&&(e.currentTarget.style.borderColor="rgba(221,184,99,0.5)")}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(221,184,99,0.2)"}>
                  <div style={{fontSize:28,marginBottom:8}}>{loadType==="banco"?"🏦":"💳"}</div>
                  <div style={{fontSize:13,color:"#8C8C8C"}}>{fileName||`Subir ${loadType==="banco"?"extracto bancario":"estado de tarjeta"} — PDF · Excel · CSV`}</div>
                  <input ref={fileRef2} type="file" accept=".csv,.txt,.pdf,.xls,.xlsx" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],loadType)}/>
                </div>
                ); })()}
                {loadError&&<div style={{color:"#f06060",fontSize:12,marginTop:10}}>{loadError}</div>}
              </div>
            )}

            {/* PROCESANDO */}
            {loadStep==="processing"&&(
              <div style={{...S.card,textAlign:"center",padding:48}}>
                <div style={{fontFamily:"Lora",fontSize:16,fontWeight:700,marginBottom:8}}>Procesando con IA...</div>
                <div style={{fontSize:12,color:"#8C8C8C",marginBottom:28}}>Leyendo y categorizando movimientos</div>
                <div style={{display:"flex",justifyContent:"center",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#DDB863",animation:`bounce 1.2s ${i*0.2}s ease-in-out infinite`}}/>)}</div>
                <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.3}40%{transform:translateY(-8px);opacity:1}}`}</style>
              </div>
            )}

            {/* REVISIÓN */}
            {loadStep==="review"&&(
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
                  {[{l:"Detectados",v:loadMovs.length,c:"#F8F4E8"},{l:"Alta confianza",v:loadMovs.filter(m=>m.confianza==="alta"||!m.confianza).length,c:"#4CAF82"},{l:"A revisar",v:loadMovs.filter(m=>m.confianza&&m.confianza!=="alta").length,c:"#f0a060"},{l:"💳 Pagos tarjeta",v:loadMovs.filter(m=>m.esPagoTarjeta).length,c:"#c860f0"}].map(k=>(
                    <div key={k.l} style={S.card}><div style={{...S.lbl,marginBottom:4}}>{k.l}</div><div style={{fontFamily:"Lora",fontSize:20,fontWeight:800,color:k.c}}>{k.v}</div></div>
                  ))}
                </div>
                {/* Panel saldo final extracto — solo para extractos bancarios */}
                {loadType==="banco"&&(
                  <div style={{...S.card,background:"rgba(29,68,92,0.08)",border:"1px solid rgba(29,68,92,0.35)",marginBottom:12,padding:"12px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                      <span style={{fontSize:16}}>🏦</span>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"Lora",fontSize:13,fontWeight:700,color:"#5AAFDF"}}>Saldo final del extracto</div>
                        <div style={{fontSize:11,color:"#8C8C8C",marginTop:2}}>{saldoExtractoDetectado!=null?"La IA detectó este valor del PDF — corregilo si no es exacto.":"No se detectó saldo final — ingresalo para la conciliación bancaria."}</div>
                      </div>
                      <input type="number" step="0.01" value={saldoExtractoDetectado??""} onChange={e=>setSaldoExtractoDetectado(e.target.value===""?null:parseFloat(e.target.value))}
                        placeholder="Ej: 187432.74"
                        style={{...S.inp,width:160,color:saldoExtractoDetectado!=null?"#5AAFDF":"#8C8C8C"}}/>
                    </div>
                  </div>
                )}
                {/* Panel tipo de cambio para movimientos en USD */}
                {loadMovs.some(m=>m.moneda==="USD")&&(
                  <div style={{...S.card,background:"rgba(221,184,99,0.06)",border:"1px solid rgba(221,184,99,0.3)",marginBottom:12,padding:"12px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                      <span style={{fontSize:16}}>💱</span>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"Lora",fontSize:13,fontWeight:700,color:"#DDB863"}}>Movimientos en USD detectados</div>
                        <div style={{fontSize:11,color:"#8C8C8C",marginTop:2}}>{loadMovs.filter(m=>m.moneda==="USD").length} movimiento(s) en USD — ingresá el tipo de cambio para convertir a pesos uruguayos</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:11,color:"#8C8C8C",whiteSpace:"nowrap"}}>1 USD =</span>
                        <input type="number" step="0.01" min="0" value={tcCarga} onChange={e=>setTcCarga(e.target.value)}
                          placeholder="Ej: 43.50"
                          style={{...S.inp,width:110,color:tcCarga?"#DDB863":"#8C8C8C"}}/>
                        <span style={{fontSize:11,color:"#8C8C8C"}}>UYU</span>
                      </div>
                    </div>
                  </div>
                )}

                {loadType==="tarjeta" && loadMovs.length>0 && (()=>{
                  const currencies = [...new Set(loadMovs.map(m=>m.moneda||"UYU"))];
                  return (
                    <div style={{...S.card,marginBottom:12,padding:"12px 16px"}}>
                      <div style={{fontFamily:"Lora",fontSize:13,fontWeight:700,marginBottom:8}}>🔎 Totales por moneda</div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {currencies.map(moneda=>{
                          const totalCalc = loadMovs.filter(m=>(m.moneda||"UYU")===moneda).reduce((s,m)=>s+(m.tot||0),0);
                          const pendId = moneda==="USD" ? pendienteSelUSD : pendienteSelUYU;
                          const pend = pendId ? pagosPendientes.find(p=>p.id===pendId) : null;
                          const pre = moneda==="USD" ? "U$S " : "$ ";
                          const absTotal = Math.abs(totalCalc);
                          if(!pend) return (
                            <div key={moneda} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,background:"#1A1A1A",border:"1px solid rgba(255,255,255,0.06)",borderRadius:6,padding:"8px 12px"}}>
                              <div style={{fontSize:11,color:"#8C8C8C"}}>{moneda} — Total tarjeta: {pre}{absTotal.toLocaleString("es-UY",{maximumFractionDigits:0})}</div>
                              <div style={{fontSize:10,color:"#5A5A5A"}}>Sin pago de banco vinculado</div>
                            </div>
                          );
                          const diff = absTotal - Math.abs(pend.monto);
                          const ok = Math.abs(diff) < 1;
                          return (
                            <div key={moneda} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,background:ok?"rgba(76,175,130,0.08)":"rgba(240,96,96,0.08)",border:`1px solid ${ok?"rgba(76,175,130,0.3)":"rgba(240,96,96,0.3)"}`,borderRadius:6,padding:"8px 12px"}}>
                              <div style={{fontSize:11,color:"#8C8C8C"}}>{moneda} — Pago banco: {pre}{Math.abs(pend.monto).toLocaleString("es-UY",{maximumFractionDigits:0})} · Total tarjeta: {pre}{absTotal.toLocaleString("es-UY",{maximumFractionDigits:0})}</div>
                              <div style={{fontFamily:"Lora",fontSize:12,fontWeight:700,color:ok?"#4CAF82":"#f06060",whiteSpace:"nowrap"}}>{ok?"✓ Coincide":`⚠ Dif. ${diff>0?"+":""}${diff.toLocaleString("es-UY",{maximumFractionDigits:0})}`}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <div style={{...S.card,padding:0,marginBottom:12}}>
                  <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(221,184,99,0.12)"}}>
                    <div style={{fontFamily:"Lora",fontSize:13,fontWeight:700,marginBottom:4}}>Revisá y ajustá si es necesario</div>
                    {loadMovs.some(m=>m.esPagoTarjeta)&&<div style={{fontSize:11,color:"#c860f0"}}>💳 Los pagos de tarjeta quedarán pendientes de conciliación</div>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"80px 1fr 140px 100px 110px 90px 24px",gap:4,padding:"6px 10px",fontSize:10,color:"#4A4A4A",textTransform:"uppercase"}}><div>Fecha</div><div>Descripción</div><div>Concepto 1</div><div>Tipo</div><div style={{textAlign:"right"}}>Monto</div><div style={{textAlign:"center"}}>Conciliación</div><div/></div>
                  {loadMovs.map(m=>{
                    const tcVal = parseFloat(tcCarga)||0;
                    const isUSD = m.moneda==="USD";
                    const montoDisplay = isUSD && tcVal ? Math.abs(m.tot||0)*tcVal : Math.abs(m.tot||0);
                    const sign = (m.tot||0)>=0;
                    const editing = montoEdit?.id === m.id;
                    return (
                    <div key={m.id} style={{display:"grid",gridTemplateColumns:"80px 1fr 140px 100px 110px 90px 24px",gap:4,padding:"7px 10px",borderTop:"1px solid rgba(255,255,255,0.03)",background:m.esPagoTarjeta?"rgba(200,96,240,0.05)":m.confianza==="baja"?"rgba(240,160,96,0.05)":"transparent",alignItems:"center"}}>
                      <div style={{fontSize:11,color:"#8C8C8C"}}>{m.f}</div>
                      <div><div style={{fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.d}</div>
                        <div style={{display:"flex",gap:4,marginTop:2}}>
                          {isUSD&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:"rgba(29,68,92,0.4)",color:"#5AAFDF"}}>USD</span>}
                          {m.esPagoTarjeta&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:"rgba(200,96,240,0.2)",color:"#c860f0"}}>💳 pendiente</span>}
                          {m.confianza==="baja"&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:"rgba(240,160,96,0.2)",color:"#f0a060"}}>⚠ revisar</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:3}}>
                        <select value={m.c1||""} onChange={e=>{const newC1=e.target.value;setLoadMovs(p=>p.map(x=>x.id===m.id?{...x,c1:newC1,cat:TX[x.t||"Personal"]?.[newC1]?.cat||x.cat}:x));}}
                          style={{background:"#1E1E1E",border:`1px solid ${m.confianza==="baja"?"rgba(240,160,96,0.4)":"rgba(221,184,99,0.15)"}`,borderRadius:4,color:m.confianza==="baja"?"#f0a060":"#F8F4E8",fontFamily:"Roboto",fontSize:10,padding:"3px 6px",cursor:"pointer"}}>
                          {Object.keys(TX[m.t||"Personal"]||TX.Personal).map(c=><option key={c}>{c}</option>)}
                        </select>
                        <select value={m.cat||""} onChange={e=>setLoadMovs(p=>p.map(x=>x.id===m.id?{...x,cat:e.target.value}:x))}
                          style={{background:"#151515",border:"1px solid rgba(255,255,255,0.06)",borderRadius:4,color:CAT_C[m.cat]||"#8C8C8C",fontFamily:"Roboto",fontSize:9,padding:"2px 5px",cursor:"pointer"}}>
                          {Object.keys(CAT_C).map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <select value={m.t||"Personal"} onChange={e=>setLoadMovs(p=>p.map(x=>x.id===m.id?{...x,t:e.target.value}:x))}
                        style={{background:"#1E1E1E",border:"1px solid rgba(221,184,99,0.15)",borderRadius:4,color:"#F8F4E8",fontFamily:"Roboto",fontSize:10,padding:"3px 6px",cursor:"pointer"}}>
                        <option>Personal</option><option>Negocio</option>
                      </select>
                      <div style={{textAlign:"right"}}>
                        {editing ? (
                          <div style={{display:"flex",gap:3,alignItems:"center",justifyContent:"flex-end"}}>
                            <button type="button" title="Cambiar signo"
                              onClick={()=>setLoadMovs(p=>p.map(x=>x.id===m.id?{...x,tot:-(x.tot||0),p:-(x.p||0)}:x))}
                              style={{background:sign?"rgba(76,175,130,0.15)":"rgba(240,96,96,0.15)",border:`1px solid ${sign?"rgba(76,175,130,0.4)":"rgba(240,96,96,0.4)"}`,borderRadius:3,color:sign?"#4CAF82":"#f06060",fontSize:11,fontWeight:700,padding:"1px 5px",cursor:"pointer",lineHeight:1}}>
                              {sign?"+":"−"}
                            </button>
                            <input type="number" autoFocus value={montoEdit.val}
                              onChange={e=>setMontoEdit(p=>({...p,val:e.target.value}))}
                              onBlur={()=>{
                                const abs = Math.abs(parseFloat(montoEdit.val)||0);
                                const newTot = sign ? abs : -abs;
                                setLoadMovs(p=>p.map(x=>x.id===m.id?{...x,tot:newTot,p:newTot}:x));
                                setMontoEdit(null);
                              }}
                              onKeyDown={e=>e.key==="Enter"&&e.target.blur()}
                              style={{width:60,background:"#1A1A1A",border:"1px solid rgba(221,184,99,0.4)",borderRadius:3,color:"#F8F4E8",fontFamily:"Lora",fontSize:11,padding:"2px 4px",textAlign:"right"}}/>
                          </div>
                        ) : (
                          <div onClick={()=>setMontoEdit({id:m.id,val:String(Math.abs(m.tot||0))})} title="Clic para editar"
                            style={{fontFamily:"Lora",fontSize:12,fontWeight:700,color:sign?"#4CAF82":"#f06060",cursor:"pointer",userSelect:"none"}}>
                            {sign?"+":"−"}{"$ "+montoDisplay.toLocaleString("es-UY",{minimumFractionDigits:0,maximumFractionDigits:0})}
                          </div>
                        )}
                        {isUSD&&!editing&&<div style={{fontSize:9,color:"#5AAFDF"}}>USD {Math.abs(m.tot||0).toLocaleString("es-UY",{minimumFractionDigits:2,maximumFractionDigits:2})}{tcVal?"":" (sin TC)"}</div>}
                      </div>
                      <div style={{textAlign:"center"}}>
                        <button type="button" onClick={()=>setLoadMovs(p=>p.map(x=>x.id===m.id?{...x,esPagoTarjeta:!x.esPagoTarjeta,pendiente:!x.esPagoTarjeta}:x))}
                          style={{background:m.esPagoTarjeta?"rgba(200,96,240,0.15)":"#1E1E1E",border:`1px solid ${m.esPagoTarjeta?"rgba(200,96,240,0.4)":"rgba(221,184,99,0.15)"}`,borderRadius:4,color:m.esPagoTarjeta?"#c860f0":"#8C8C8C",fontFamily:"Roboto",fontSize:9,padding:"3px 6px",cursor:"pointer",whiteSpace:"nowrap"}}>
                          {m.esPagoTarjeta?"💳 Pendiente":"Registrar"}
                        </button>
                        {loadType==="banco"&&m.esPagoTarjeta&&(
                          <>
                            <select value={m.tarjetaDestino||""} onChange={e=>setLoadMovs(p=>p.map(x=>x.id===m.id?{...x,tarjetaDestino:e.target.value}:x))}
                              style={{marginTop:4,width:"100%",background:"#1E1E1E",border:`1px solid ${m.tarjetaDestino?"rgba(200,96,240,0.4)":"rgba(240,96,96,0.5)"}`,borderRadius:4,color:m.tarjetaDestino?"#c860f0":"#f06060",fontFamily:"Roboto",fontSize:9,padding:"3px 4px",cursor:"pointer"}}>
                              <option value="">— tarjeta —</option>
                              {tarjetasActivas.map(t=><option key={t} value={t}>{t}</option>)}
                            </select>
                            <select value={m.monedaPago||m.moneda||"UYU"} onChange={e=>setLoadMovs(p=>p.map(x=>x.id===m.id?{...x,monedaPago:e.target.value}:x))}
                              title="¿Qué parte de la tarjeta (UYU o USD) cubre este pago?"
                              style={{marginTop:3,width:"100%",background:"#1E1E1E",border:"1px solid rgba(221,184,99,0.2)",borderRadius:4,color:"#DDB863",fontFamily:"Roboto",fontSize:9,padding:"3px 4px",cursor:"pointer"}}>
                              <option value="UYU">paga UYU</option>
                              <option value="USD">paga USD</option>
                            </select>
                          </>
                        )}
                      </div>
                      <div style={{display:"flex",alignItems:"flex-start",paddingTop:2}}>
                        <button type="button" title="Eliminar fila"
                          onClick={()=>setLoadMovs(p=>p.filter(x=>x.id!==m.id))}
                          style={{background:"transparent",border:"none",color:"#4A4A4A",fontSize:14,lineHeight:1,cursor:"pointer",padding:"2px 3px",borderRadius:3}}
                          onMouseEnter={e=>e.target.style.color="#f06060"}
                          onMouseLeave={e=>e.target.style.color="#4A4A4A"}>×</button>
                      </div>
                    </div>
                    );
                  })}
                </div>
                {(()=>{
                  const hasUSD = loadMovs.some(m=>m.moneda==="USD");
                  const tcMissing = hasUSD && !parseFloat(tcCarga);
                  const tarjetaFaltante = loadType==="banco" && loadMovs.some(m=>m.esPagoTarjeta && !m.tarjetaDestino);
                  const blocked = tcMissing || tarjetaFaltante;
                  return (
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={()=>setLoadStep("upload")} style={{background:"#141414",border:"1px solid rgba(221,184,99,0.2)",borderRadius:6,color:"#8C8C8C",fontFamily:"Roboto",fontSize:12,padding:"10px 20px",cursor:"pointer"}}>← Volver</button>
                    <button onClick={blocked?null:confirmar} disabled={blocked}
                      style={{flex:1,background:blocked?"#2A2A2A":"#DDB863",color:blocked?"#555":"#0A0A0A",border:blocked?"1px solid rgba(221,184,99,0.2)":"none",borderRadius:8,padding:13,fontFamily:"Lora",fontSize:14,fontWeight:800,cursor:blocked?"not-allowed":"pointer"}}>
                      {tcMissing?"Ingresá el tipo de cambio para los movimientos en USD →":tarjetaFaltante?"Elegí a qué tarjeta corresponde cada pago pendiente →":`Confirmar — registrar ${loadMovs.filter(m=>!m.esPagoTarjeta).length} · dejar ${loadMovs.filter(m=>m.esPagoTarjeta).length} pendientes →`}
                    </button>
                  </div>
                  );
                })()}
              </>
            )}

            {/* HECHO */}
            {loadStep==="done"&&(
              <div style={{...S.card,textAlign:"center",padding:40}}>
                <div style={{fontSize:32,marginBottom:12}}>✓</div>
                <div style={{fontFamily:"Lora",fontSize:18,fontWeight:800,color:"#4CAF82",marginBottom:8}}>Registros importados</div>
                {(loadType==="banco"||loadType==="tarjeta")&&<div style={{fontSize:12,color:"#8C8C8C",marginBottom:16}}>Los pagos de tarjeta quedaron pendientes de conciliación</div>}
                <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                  <button onClick={()=>{setLoadStep("upload");setFileName("");setBancoCarga("");}} style={{background:"#141414",border:"1px solid rgba(221,184,99,0.2)",borderRadius:6,color:"#8C8C8C",fontFamily:"Roboto",fontSize:12,padding:"8px 20px",cursor:"pointer"}}>Cargar otro</button>
                  {loadType==="banco"&&<button onClick={()=>{setLoadType("tarjeta");setLoadStep("upload");}} style={{background:"rgba(200,96,240,0.15)",border:"1px solid rgba(200,96,240,0.3)",borderRadius:6,color:"#c860f0",fontFamily:"Roboto",fontSize:12,padding:"8px 20px",cursor:"pointer"}}>💳 Cargar tarjeta</button>}
                </div>
              </div>
            )}

            {/* MANUAL */}
            {loadType==="manual"&&(
              <>
                <div style={{color:"#8C8C8C",fontSize:12,marginBottom:16}}>Los campos * se calculan automáticamente</div>
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
                      style={{background:!form.fechaManual?"rgba(221,184,99,0.15)":"#1E1E1E",border:`1px solid ${!form.fechaManual?"rgba(221,184,99,0.5)":"rgba(221,184,99,0.15)"}`,borderRadius:4,color:!form.fechaManual?"#DDB863":"#8C8C8C",fontFamily:"Roboto",fontSize:10,padding:"4px 10px",cursor:"pointer"}}>
                      ● Auto
                    </button>
                    <button onClick={()=>setForm(p=>({...p,fechaManual:true,fechaCP:fechaCPCalc||p.fecha}))}
                      style={{background:form.fechaManual?"rgba(221,184,99,0.15)":"#1E1E1E",border:`1px solid ${form.fechaManual?"rgba(221,184,99,0.5)":"rgba(221,184,99,0.15)"}`,borderRadius:4,color:form.fechaManual?"#DDB863":"#8C8C8C",fontFamily:"Roboto",fontSize:10,padding:"4px 10px",cursor:"pointer"}}>
                      ✎ Manual
                    </button>
                  </div>
                  {form.fechaManual ? (
                    <input key="manual" type="date" style={{...S.inp,color:"#DDB863"}}
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
                  <div style={{...S.calc,color:["Ingresos","Cobros"].includes(catAuto)?"#4CAF82":"#f06060"}}>{fmtN(totalCalc)}</div>
                </div>
              </div>
            </div>
            <button onClick={submit} style={{width:"100%",background:saved?"#4CAF82":"#DDB863",color:"#0A0A0A",border:"none",borderRadius:8,padding:13,fontFamily:"Lora",fontSize:14,fontWeight:800,cursor:"pointer",transition:"background .3s"}}>
              {saved?"✓ Guardado":"Guardar registro →"}
            </button>
            </>
            )}
          </>
        )}

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
          const colCount = ALL_COLS.filter(c=>vc.includes(c.id)).length;
          const toggleCol = (id) => setVisibleCols(prev=>prev.includes(id)?prev.filter(c=>c!==id):[...prev,id]);

          // Valor "de exhibición" de cada celda, usado tanto para los filtros tipo Excel como para sus listas de opciones
          const colValue = (colId, r) => {
            switch(colId) {
              case "fecha": return r.f ? fmtD(r.f) : "—";
              case "tipo": return r.t || "—";
              case "banco": return r.b || "—";
              case "categoria": return r.cat || "—";
              case "concepto": return r.c1 ? (r.c1 + (r.c2 ? ` · ${r.c2}` : "")) : "—";
              case "descripcion": return r.d || "—";
              case "forma": return r.fm || "—";
              case "bancoEmisor": return r.be || "—";
              case "plazo": return (r.plazo!==undefined&&r.plazo!==null&&r.plazo!=="") ? String(r.plazo) : "—";
              case "fechaCP": return r.fechaCP ? fmtD(r.fechaCP) : "—";
              case "moneda": return r.usd ? "USD" : "UYU";
              case "tc": return (r.tc!==undefined&&r.tc!==null&&r.tc!=="") ? String(r.tc) : "—";
              case "subtotal": return r.p!=null ? fmtN(r.p) : "—";
              case "iva": return r.iva!=null ? fmtN(r.iva) : "—";
              case "total": return r.tot!=null ? fmtN(r.tot) : "—";
              default: return "—";
            }
          };
          const uniqueVals = (colId) => [...new Set(regs.map(r=>colValue(colId,r)))].sort((a,b)=>a.localeCompare(b,"es",{numeric:true}));
          const toggleColFilterVal = (colId, val) => {
            setColFilters(prev=>{
              const all = uniqueVals(colId);
              const current = prev[colId] || all;
              const next = current.includes(val) ? current.filter(v=>v!==val) : [...current, val];
              if(next.length===all.length){ const {[colId]:_, ...rest}=prev; return rest; }
              return {...prev,[colId]:next};
            });
          };
          const activeFilterCount = Object.keys(colFilters).length;

          const filteredAll = regs.filter(r=>{
            if(searchQ&&![r.d,r.c1,r.c2,r.b].join(" ").toLowerCase().includes(searchQ.toLowerCase())) return false;
            for(const colId of Object.keys(colFilters)){
              if(!colFilters[colId].includes(colValue(colId,r))) return false;
            }
            return true;
          });
          const filteredRegs = filteredAll.slice(0,80);

          // Exporta los registros filtrados a CSV (mismo formato que la plantilla de carga masiva)
          const exportToCSV = (data) => {
            const csvNum = (n) => (n===null||n===undefined||n==="") ? "" : String(n).replace(".",",");
            const rows = [
              "sep=;",
              "Fecha;Año;Mes;Banco cobra/paga;Tipo;Concepto 1;Concepto 2;Categoría;Descripcion;Forma cobro/pago;Banco emisor;Plazo dias;Fecha de cobro / pago;USD;TC;Pesos;IVA;Total"
            ];
            data.forEach(r=>{
              rows.push([
                r.f||"", r.a||(r.f?String(new Date(r.f).getFullYear()):""), r.m||"",
                r.b||"", r.t||"", r.c1||"", r.c2||"", r.cat||"", (r.d||"").replace(/[;\r\n]/g," "),
                r.fm||"", r.be||"", r.plazo??"", r.fechaCP||"",
                csvNum(r.usd), csvNum(r.tc), csvNum(r.p), csvNum(r.iva), csvNum(r.tot)
              ].join(";"));
            });
            const csv = "﻿" + rows.join("\r\n");
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})); a.download = `FinCFO_registros.csv`; a.click();
          };

          const allFilteredSelected = filteredAll.length>0 && filteredAll.every(r=>selectedIds.includes(r.id));
          const toggleSelectAll = () => {
            if(allFilteredSelected) setSelectedIds(prev=>prev.filter(id=>!filteredAll.some(r=>r.id===id)));
            else setSelectedIds(prev=>[...new Set([...prev, ...filteredAll.map(r=>r.id)])]);
          };
          const toggleSelectOne = (id) => setSelectedIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
          const eliminarSeleccionados = async () => {
            if(!selectedIds.length) return;
            if(!window.confirm(`¿Eliminar ${selectedIds.length} registro(s)? Esta acción no se puede deshacer.`)) return;
            await deleteRegsFromDB(selectedIds);
            setSelectedIds([]);
          };

          const startEdit = (r) => {
            setEditingId(r.id);
            setEditRow({f:r.f||"",t:r.t||"Personal",b:r.b||"",c1:r.c1||"",c2:r.c2||"",cat:r.cat||"",d:r.d||"",fm:r.fm||"",be:r.be||"",plazo:r.plazo??"",fechaCP:r.fechaCP||r.f||"",usd:r.usd??"",tc:r.tc??"",p:r.p??"",iva:r.iva??""});
          };
          const cancelEdit = () => { setEditingId(null); setEditRow(null); };
          const saveEdit = async (id) => {
            const mes = editRow.f?String(new Date(editRow.f).getMonth()+1):"";
            const ano = editRow.f?String(new Date(editRow.f).getFullYear()):"";
            const cat = editRow.cat||TX[editRow.t]?.[editRow.c1]?.cat||"";
            const p = parseFloat(editRow.p)||0;
            const iva = editRow.iva===""?null:parseFloat(editRow.iva)||0;
            const usd = editRow.usd===""?null:parseFloat(editRow.usd)||0;
            const tc = editRow.tc===""?null:parseFloat(editRow.tc)||0;
            const updated = {f:editRow.f,m:mes,a:ano,b:editRow.b,t:editRow.t,c1:editRow.c1,c2:editRow.c2,cat,d:editRow.d,fm:editRow.fm,be:editRow.be,plazo:editRow.plazo,fechaCP:editRow.fechaCP,usd,tc,p,iva,tot:p+(iva||0)};
            await updateRegInDB(id, updated);
            const patron = normalizarDesc(updated.d);
            if(patron) saveReglaToDB(patron, {t:updated.t, c1:updated.c1, c2:updated.c2, esPagoTarjeta:false});
            setRegs(prev=>prev.map(r=>r.id===id?{...r,...updated}:r));
            cancelEdit();
          };

          return (
            <>
              {/* Toolbar */}
              <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Buscar..." style={{...S.inp,width:160,padding:"5px 10px"}}/>

                {activeFilterCount>0 && (
                  <button onClick={()=>setColFilters({})}
                    style={{background:"rgba(221,184,99,0.12)",border:"1px solid rgba(221,184,99,0.45)",borderRadius:4,color:"#DDB863",fontFamily:"Roboto",fontSize:10,padding:"4px 10px",cursor:"pointer"}}>
                    ✕ Limpiar filtros ({activeFilterCount})
                  </button>
                )}

                <button onClick={()=>exportToCSV(filteredAll)}
                  style={{background:"rgba(76,175,130,0.1)",border:"1px solid rgba(76,175,130,0.35)",borderRadius:4,color:"#4CAF82",fontFamily:"Roboto",fontSize:10,padding:"4px 10px",cursor:"pointer"}}>
                  ⬇ Exportar ({filteredAll.length})
                </button>

                {/* Selector de columnas */}
                <div style={{position:"relative",marginLeft:4}} ref={colDropRef}>
                  <button onClick={()=>setColDropOpen(o=>!o)}
                    style={{background:"#141414",border:"1px solid rgba(221,184,99,0.18)",borderRadius:5,color:"#8C8C8C",fontFamily:"Roboto",fontSize:10,padding:"5px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                    ⊞ Columnas ({vc.length}) <span style={{fontSize:8,opacity:0.6}}>{colDropOpen?"▲":"▼"}</span>
                  </button>
                  {colDropOpen&&(
                    <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,background:"#1E1E1E",border:"1px solid rgba(221,184,99,0.22)",borderRadius:6,zIndex:999,minWidth:200,padding:"6px 0",boxShadow:"0 12px 32px rgba(0,0,0,0.7)"}}>
                      {ALL_COLS.map(col=>{
                        const on=vc.includes(col.id);
                        return (
                          <div key={col.id} onClick={()=>toggleCol(col.id)}
                            style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",cursor:"pointer",fontSize:11,color:on?"#DDB863":"#8C8C8C"}}
                            onMouseEnter={e=>e.currentTarget.style.background="rgba(221,184,99,0.1)"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <span style={{width:12,height:12,borderRadius:2,border:`1px solid ${on?"#DDB863":"rgba(255,255,255,0.2)"}`,background:on?"#DDB863":"transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#0d0d10",flexShrink:0}}>{on?"✓":""}</span>
                            {col.label}
                          </div>
                        );
                      })}
                      <div style={{borderTop:"1px solid rgba(221,184,99,0.12)",padding:"6px 12px",display:"flex",gap:6}}>
                        <button onClick={()=>setVisibleCols(ALL_COLS.map(c=>c.id))} style={{flex:1,background:"rgba(221,184,99,0.1)",border:"1px solid rgba(221,184,99,0.3)",borderRadius:4,color:"#DDB863",fontFamily:"Roboto",fontSize:10,padding:"4px",cursor:"pointer"}}>Todas</button>
                        <button onClick={()=>setVisibleCols(["fecha","tipo","banco","categoria","concepto","descripcion","subtotal","total"])} style={{flex:1,background:"#1A1A1A",border:"1px solid rgba(221,184,99,0.15)",borderRadius:4,color:"#8C8C8C",fontFamily:"Roboto",fontSize:10,padding:"4px",cursor:"pointer"}}>Reset</button>
                        <button onClick={()=>setColDropOpen(false)} style={{flex:1,background:"rgba(221,184,99,0.14)",border:"1px solid rgba(221,184,99,0.45)",borderRadius:4,color:"#DDB863",fontFamily:"Roboto",fontSize:10,padding:"4px",cursor:"pointer",fontWeight:700}}>Aplicar →</button>
                      </div>
                    </div>
                  )}
                </div>

                {selectedIds.length>0 && (
                  <button onClick={eliminarSeleccionados}
                    style={{background:"rgba(240,96,96,0.12)",border:"1px solid rgba(240,96,96,0.4)",borderRadius:4,color:"#f06060",fontFamily:"Roboto",fontSize:10,padding:"5px 10px",cursor:"pointer"}}>
                    🗑 Eliminar seleccionados ({selectedIds.length})
                  </button>
                )}

                <span style={{marginLeft:"auto",fontSize:11,color:"#8C8C8C"}}>
                  {filteredAll.length>filteredRegs.length
                    ? `Mostrando ${filteredRegs.length} de ${filteredAll.length} registros — afiná la búsqueda para ver más`
                    : `${filteredRegs.length} registros`}
                </span>
              </div>

              {/* Tabla con scroll horizontal */}
              <div style={{...S.card,padding:0,overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid rgba(221,184,99,0.15)"}}>
                      <th style={{padding:"7px 8px",background:"#141414",width:28}}>
                        <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} style={{cursor:"pointer"}}/>
                      </th>
                      {ALL_COLS.filter(c=>vc.includes(c.id)).map(c=>{
                        const filterActive = !!colFilters[c.id];
                        const isOpen = filterDropOpen===c.id;
                        return (
                        <th key={c.id} style={{textAlign:c.id==="total"?"right":"left",padding:"7px 10px",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.5,whiteSpace:"nowrap",background:"#141414",position:c.id==="fecha"?"sticky":"relative",left:c.id==="fecha"?28:undefined,zIndex:isOpen?1001:(c.id==="fecha"?1:undefined)}}>
                          <div style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",justifyContent:c.id==="total"?"flex-end":"flex-start"}}
                            onClick={()=>{setFilterDropOpen(o=>o===c.id?null:c.id); setColFilterSearch("");}}>
                            {c.label}
                            <span style={{fontSize:8,color:filterActive?"#DDB863":"#5A5A5A"}}>▾</span>
                          </div>
                          {isOpen && (
                            <div ref={filterDropRef} style={{position:"absolute",top:"calc(100% + 4px)",left:0,background:"#1E1E1E",border:"1px solid rgba(221,184,99,0.22)",borderRadius:6,zIndex:1001,minWidth:180,maxWidth:240,boxShadow:"0 12px 32px rgba(0,0,0,0.7)",textTransform:"none",fontWeight:400}}>
                              <div style={{padding:8}}>
                                <input value={colFilterSearch} onChange={e=>{
                                  const val = e.target.value;
                                  setColFilterSearch(val);
                                  if(val.trim()) {
                                    const matched = uniqueVals(c.id).filter(v=>v.toLowerCase().includes(val.toLowerCase()));
                                    setColFilters(prev=>({...prev,[c.id]:matched}));
                                  } else {
                                    setColFilters(prev=>{ const {[c.id]:_, ...rest}=prev; return rest; });
                                  }
                                }} placeholder="Buscar valor..." autoFocus style={{...S.inp,width:"100%",fontSize:10,padding:"4px 8px",boxSizing:"border-box"}}/>
                              </div>
                              <div style={{display:"flex",gap:6,padding:"0 8px 6px"}}>
                                <button onClick={()=>setColFilters(prev=>{const {[c.id]:_,...rest}=prev; return rest;})} style={{flex:1,background:"rgba(221,184,99,0.1)",border:"1px solid rgba(221,184,99,0.3)",borderRadius:4,color:"#DDB863",fontFamily:"Roboto",fontSize:9,padding:"3px",cursor:"pointer"}}>Todos</button>
                                <button onClick={()=>setColFilters(prev=>({...prev,[c.id]:[]}))} style={{flex:1,background:"#1A1A1A",border:"1px solid rgba(221,184,99,0.15)",borderRadius:4,color:"#8C8C8C",fontFamily:"Roboto",fontSize:9,padding:"3px",cursor:"pointer"}}>Ninguno</button>
                              </div>
                              <div style={{maxHeight:200,overflowY:"auto",padding:"0 8px"}}>
                                {uniqueVals(c.id).filter(v=>v.toLowerCase().includes(colFilterSearch.toLowerCase())).map(v=>{
                                  const checked = !colFilters[c.id] || colFilters[c.id].includes(v);
                                  return (
                                    <div key={v} onClick={()=>toggleColFilterVal(c.id,v)}
                                      style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",cursor:"pointer",fontSize:11,color:checked?"#F8F4E8":"#5A5A5A"}}>
                                      <span style={{width:11,height:11,borderRadius:2,border:`1px solid ${checked?"#DDB863":"rgba(255,255,255,0.2)"}`,background:checked?"#DDB863":"transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#0d0d10",flexShrink:0}}>{checked?"✓":""}</span>
                                      <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div style={{padding:8,borderTop:"1px solid rgba(221,184,99,0.12)"}}>
                                <button onClick={()=>{setFilterDropOpen(null);setColFilterSearch("");}} style={{width:"100%",background:"rgba(221,184,99,0.14)",border:"1px solid rgba(221,184,99,0.45)",borderRadius:4,color:"#DDB863",fontFamily:"Roboto",fontSize:10,padding:"4px",cursor:"pointer",fontWeight:700}}>Aplicar →</button>
                              </div>
                            </div>
                          )}
                        </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegs.map(r=>{
                      const isPos=(r.tot||0)>0;
                      return (
                      <Fragment key={r.id}>
                        <tr style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="#1E1E1E"; const ic=e.currentTarget.querySelector('.edit-ic'); if(ic)ic.style.opacity="1";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent"; const ic=e.currentTarget.querySelector('.edit-ic'); if(ic)ic.style.opacity="0";}}>
                          <td style={{padding:"7px 8px",width:28}}>
                            <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={()=>toggleSelectOne(r.id)} style={{cursor:"pointer"}}/>
                          </td>
                          {vc.includes("fecha")&&<td style={{padding:"7px 10px",fontSize:11,color:"#8C8C8C",whiteSpace:"nowrap",background:"#141414",position:"sticky",left:28,cursor:"pointer"}} onClick={()=>editingId===r.id?cancelEdit():startEdit(r)}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              {fmtD(r.f)}
                              <span className="edit-ic" style={{fontSize:9,color:"#DDB863",opacity:0,transition:"opacity 0.1s"}}>✎</span>
                            </div>
                          </td>}
                          {vc.includes("tipo")&&<td style={{padding:"7px 10px"}}><span style={S.pill(r.t==="Negocio"?"#1D445C":"#DDB863")}>{r.t}</span></td>}
                          {vc.includes("banco")&&<td style={{padding:"7px 10px",fontSize:11,color:"#4A4A4A",whiteSpace:"nowrap",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis"}}>{r.b||"—"}</td>}
                          {vc.includes("categoria")&&<td style={{padding:"7px 10px"}}><span style={S.badge(r.cat)}>{(r.cat||"").slice(0,10)}</span></td>}
                          {vc.includes("concepto")&&<td style={{padding:"7px 10px",fontSize:12,whiteSpace:"nowrap",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis"}}>{r.c1}{r.c2?` · ${r.c2}`:""}</td>}
                          {vc.includes("descripcion")&&<td style={{padding:"7px 10px",fontSize:11,color:"#4A4A4A",whiteSpace:"nowrap",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis"}}>{r.d||"—"}</td>}
                          {vc.includes("forma")&&<td style={{padding:"7px 10px",fontSize:11,color:"#4A4A4A",whiteSpace:"nowrap"}}>{r.fm||"—"}</td>}
                          {vc.includes("bancoEmisor")&&<td style={{padding:"7px 10px",fontSize:11,color:"#4A4A4A",whiteSpace:"nowrap"}}>{r.be||"—"}</td>}
                          {vc.includes("plazo")&&<td style={{padding:"7px 10px",fontSize:11,color:"#4A4A4A",textAlign:"right"}}>{r.plazo||"—"}</td>}
                          {vc.includes("fechaCP")&&<td style={{padding:"7px 10px",fontSize:11,color:"#1D445C",whiteSpace:"nowrap"}}>{r.fechaCP?fmtD(r.fechaCP):"—"}</td>}
                          {vc.includes("moneda")&&<td style={{padding:"7px 10px",fontSize:11,color:"#4A4A4A"}}>{r.usd?"USD":"UYU"}</td>}
                          {vc.includes("tc")&&<td style={{padding:"7px 10px",fontSize:11,color:"#4A4A4A",textAlign:"right"}}>{r.tc||"—"}</td>}
                          {vc.includes("subtotal")&&<td style={{padding:"7px 10px",fontFamily:"Lora",fontSize:11,fontWeight:600,textAlign:"right",color:isPos?"#4CAF82":"#f06060",whiteSpace:"nowrap"}}>{r.p!=null?(isPos?"+":"-")+fmtN(r.p).replace("$ ",""):"—"}</td>}
                          {vc.includes("iva")&&<td style={{padding:"7px 10px",fontSize:11,color:"#f0a060",textAlign:"right"}}>{r.iva?fmtN(r.iva).replace("$ ",""):"—"}</td>}
                          {vc.includes("total")&&<td style={{padding:"7px 10px",fontFamily:"Lora",fontSize:12,fontWeight:700,textAlign:"right",color:isPos?"#4CAF82":"#f06060",whiteSpace:"nowrap"}}>{isPos?"+":"-"}{fmtN(r.tot).replace("$ ","")}</td>}
                        </tr>
                        {editingId===r.id && editRow && (
                          <tr style={{borderBottom:"1px solid rgba(221,184,99,0.15)"}}>
                            <td colSpan={colCount+1} style={{padding:14,background:"#1A1A1A"}}>
                              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
                                <div><label style={S.lbl}>Fecha</label><input type="date" value={editRow.f} onChange={e=>setEditRow(p=>({...p,f:e.target.value}))} style={S.inp}/></div>
                                <div><label style={S.lbl}>Tipo</label>
                                  <select value={editRow.t} onChange={e=>{const nt=e.target.value; const nc1=Object.keys(TX[nt])[0]; setEditRow(p=>({...p,t:nt,c1:nc1,c2:TX[nt][nc1].subs[0]}));}} style={S.sel}>
                                    <option>Personal</option><option>Negocio</option>
                                  </select>
                                </div>
                                <div><label style={S.lbl}>Banco C/P</label>
                                  <select value={editRow.b} onChange={e=>setEditRow(p=>({...p,b:e.target.value}))} style={S.sel}>
                                    {!BANCOS_LIST.includes(editRow.b)&&editRow.b&&<option value={editRow.b}>{editRow.b}</option>}
                                    {BANCOS_LIST.map(bn=><option key={bn}>{bn}</option>)}
                                  </select>
                                </div>
                                <div><label style={S.lbl}>Concepto</label>
                                  <select value={editRow.c1} onChange={e=>{const nc1=e.target.value; setEditRow(prev=>({...prev,c1:nc1,c2:TX[prev.t]?.[nc1]?.subs?.[0]||"",cat:TX[prev.t]?.[nc1]?.cat||prev.cat}));}} style={S.sel}>
                                    {Object.keys(TX[editRow.t]||{}).map(c=><option key={c}>{c}</option>)}
                                  </select>
                                </div>
                                <div><label style={S.lbl}>Subconcepto</label>
                                  <select value={editRow.c2} onChange={e=>setEditRow(p=>({...p,c2:e.target.value}))} style={S.sel}>
                                    {(TX[editRow.t]?.[editRow.c1]?.subs||[]).map(s=><option key={s}>{s}</option>)}
                                    {!(TX[editRow.t]?.[editRow.c1]?.subs||[]).includes(editRow.c2)&&editRow.c2&&<option value={editRow.c2}>{editRow.c2}</option>}
                                  </select>
                                </div>
                                <div><label style={S.lbl}>Categoría</label>
                                  <select value={editRow.cat||""} onChange={e=>setEditRow(p=>({...p,cat:e.target.value}))} style={S.sel}>
                                    {Object.keys(CAT_C).map(c=><option key={c} value={c}>{c}</option>)}
                                  </select>
                                </div>
                                <div style={{gridColumn:"span 2"}}><label style={S.lbl}>Descripción</label><input value={editRow.d} onChange={e=>setEditRow(p=>({...p,d:e.target.value}))} style={S.inp}/></div>
                                <div><label style={S.lbl}>Forma cobro/pago</label>
                                  <select value={editRow.fm} onChange={e=>setEditRow(p=>({...p,fm:e.target.value}))} style={S.sel}>
                                    {FORMAS.map(f=><option key={f}>{f}</option>)}
                                  </select>
                                </div>
                                <div><label style={S.lbl}>Banco emisor</label>
                                  <select value={editRow.be} onChange={e=>setEditRow(p=>({...p,be:e.target.value}))} style={S.sel}>
                                    {!BANCOS_LIST.includes(editRow.be)&&editRow.be&&<option value={editRow.be}>{editRow.be}</option>}
                                    {BANCOS_LIST.map(bn=><option key={bn}>{bn}</option>)}
                                  </select>
                                </div>
                                <div><label style={S.lbl}>Plazo (días)</label><input type="number" value={editRow.plazo} onChange={e=>setEditRow(p=>({...p,plazo:e.target.value}))} style={S.inp}/></div>
                                <div><label style={S.lbl}>Fecha cobro/pago</label><input type="date" value={editRow.fechaCP} onChange={e=>setEditRow(p=>({...p,fechaCP:e.target.value}))} style={S.inp}/></div>
                                <div><label style={S.lbl}>USD (moneda original)</label><input type="number" step="0.01" value={editRow.usd} placeholder="0.00" onChange={e=>setEditRow(p=>({...p,usd:e.target.value}))} style={S.inp}/></div>
                                <div><label style={S.lbl}>Tipo de cambio</label><input type="number" step="0.01" value={editRow.tc} placeholder="0.00" onChange={e=>setEditRow(p=>({...p,tc:e.target.value}))} style={S.inp}/></div>
                                <div><label style={S.lbl}>Subtotal (sin IVA)</label><input type="number" step="0.01" value={editRow.p} onChange={e=>setEditRow(p=>({...p,p:e.target.value}))} style={S.inp}/></div>
                                <div><label style={S.lbl}>IVA</label><input type="number" step="0.01" value={editRow.iva} onChange={e=>setEditRow(p=>({...p,iva:e.target.value}))} style={S.inp}/></div>
                                <div><label style={S.lbl}>Total (con IVA)</label><div style={S.calc}>{fmtN((parseFloat(editRow.p)||0)+(parseFloat(editRow.iva)||0))}</div></div>
                              </div>
                              <div style={{display:"flex",gap:8,marginTop:12}}>
                                <button onClick={()=>saveEdit(r.id)} style={{background:"#DDB863",border:"none",borderRadius:6,color:"#0A0A0A",fontFamily:"Lora",fontSize:12,fontWeight:700,padding:"8px 16px",cursor:"pointer"}}>Guardar</button>
                                <button onClick={cancelEdit} style={{background:"none",border:"1px solid rgba(221,184,99,0.18)",borderRadius:6,color:"#8C8C8C",fontFamily:"Roboto",fontSize:12,padding:"8px 16px",cursor:"pointer"}}>Cancelar</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
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
                  style={{background:reportTab===k?"rgba(221,184,99,0.12)":"#141414",border:`1px solid ${reportTab===k?"rgba(221,184,99,0.45)":"rgba(221,184,99,0.12)"}`,color:reportTab===k?"#DDB863":"#8C8C8C",borderRadius:5,padding:"7px 14px",fontFamily:"Roboto",fontSize:11,cursor:"pointer"}}>
                  {l}
                </button>
              ))}
            </div>

            {/* ── RENTABILIDAD ── */}
            {reportTab==="rentabilidad" && (()=>{
              const PIVOT_RENT = {
                // Ingresos
                "Ventas":                    {},
                "Ingresos":                  {"4":37670.9},
                // Gastos variables
                "Costos":                    {},
                "Comisiones":                {},
                "Transporte":                {},
                "Marketing":                 {"1":-11700.0,"2":-46800.0,"4":-29403.0},
                // Gastos fijos
                "Personal":                  {},
                "Servicios":                 {"2":-1402.05},
                "Licencias / suscripciones": {"4":-4680.53},
                "Alquileres":                {},
                "Mantenimiento":             {},
                "Honorarios":                {},
                "Capacitación":              {},
                "Otros gastos":              {},
                // Intereses
                "Intereses":                 {},
                // Impuestos
                "Impuestos":                 {},
              };

              const GRUPOS_RENT = {
                "Ingresos":        ["Ventas","Ingresos"],
                "Gastos variables":["Costos","Comisiones","Transporte","Marketing"],
                "Gastos fijos":    ["Personal","Servicios","Licencias / suscripciones","Alquileres","Mantenimiento","Honorarios","Capacitación","Otros gastos"],
                "Intereses":       ["Intereses"],
                "Impuesto a la renta": ["Impuestos"],
              };
              const GRUPO_RENT_COLOR = {
                "Ingresos":"#4CAF82",
                "Gastos variables":"#f0a060",
                "Gastos fijos":"#f06060",
                "Intereses":"#f06090",
                "Impuesto a la renta":"#cc6060",
              };
              const GRUPO_RENT_BG = {
                "Ingresos":"rgba(96,240,160,0.05)",
                "Gastos variables":"rgba(240,160,96,0.05)",
                "Gastos fijos":"rgba(240,96,96,0.05)",
                "Intereses":"rgba(240,96,144,0.05)",
                "Impuesto a la renta":"rgba(200,96,96,0.05)",
              };

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
                  <div style={{fontSize:11,color:"#8C8C8C",marginBottom:14}}>Movimientos NEGOCIO · por fecha de transacción · sin IVA</div>

                  {/* KPIs */}
                  <div style={{...S.g4,marginBottom:14}}>
                    {[
                      {label:"Ingresos",val:fmtN(ingresos),color:"#4CAF82"},
                      {label:"Gastos totales",val:fmtN(Math.abs(gastos)),color:"#f06060"},
                      {label:`Margen bruto`,val:`${margen}%`,color:"#1D445C"},
                      {label:"Resultado neto",val:(resFinal>=0?"+":"-")+fmtN(Math.abs(resFinal)),color:resFinal>=0?"#DDB863":"#f06060"},
                    ].map(k=>(
                      <div key={k.label} style={S.card}>
                        <div style={{...S.lbl,marginBottom:6}}>{k.label}</div>
                        <div style={{fontFamily:"Lora",fontSize:18,fontWeight:800,color:k.color}}>{k.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tabla pivot */}
                  <div style={{...S.card,padding:0,overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid rgba(221,184,99,0.18)"}}>
                          <th style={{textAlign:"left",padding:"8px 12px",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.7,background:"#141414",position:"sticky",left:0,zIndex:1,minWidth:200}}>Concepto</th>
                          {MESES_DISP.map(m=><th key={m} style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",minWidth:110,whiteSpace:"nowrap"}}>{MESES_NOM[+m]}</th>)}
                          <th style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",minWidth:110,fontWeight:700,borderLeft:"1px solid rgba(221,184,99,0.15)"}}>Total</th>
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
                            <tr key={`hdr-${grupo}`} style={{background:bg,borderTop:"1px solid rgba(221,184,99,0.15)"}}>
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
                                  <td style={{padding:"5px 12px 5px 20px",fontSize:12,color:hasData?"#F8F4E8":"#333",background:"#141414",position:"sticky",left:0,borderRight:"1px solid rgba(221,184,99,0.12)"}}>{c1}</td>
                                  {MESES_DISP.map(m=>{const v=pvR(c1,m);return <td key={m} style={cellSt(v)}>{fmtCell(v)}</td>;})}
                                  <td style={{...cellSt(rt),borderLeft:"1px solid rgba(221,184,99,0.15)",background:"rgba(255,255,255,0.02)",fontWeight:700}}>{fmtCell(rt)}</td>
                                </tr>
                              );
                            }),
                            // Subtotal grupo
                            <tr key={`sub-${grupo}`} style={{borderTop:"1px solid rgba(221,184,99,0.15)",borderBottom:"1px solid rgba(255,255,255,0.04)",background:bg}}>
                              <td style={{padding:"6px 12px",fontSize:11,fontWeight:700,color,background:bg,position:"sticky",left:0,borderRight:"1px solid rgba(221,184,99,0.12)"}}>Total {grupo}</td>
                              {MESES_DISP.map(m=>{const v=grupoTotRMes(grupo,m);return <td key={m} style={{...cellSt(v),fontFamily:"Lora",fontWeight:700,color:v!==0?color:"#333"}}>{fmtCell(v)}</td>;})}
                              <td style={{...cellSt(gTot),fontFamily:"Lora",fontWeight:800,borderLeft:"1px solid rgba(221,184,99,0.15)",background:bg,color:gTot!==0?color:"#333"}}>{fmtCell(gTot)}</td>
                            </tr>,
                            // Subtotal resultado antes de impuesto (después de Intereses)
                            grupo==="Intereses" ? (
                              <tr key="res-antes" style={{borderTop:"2px solid rgba(221,184,99,0.2)",borderBottom:"1px solid rgba(221,184,99,0.15)",background:"rgba(255,255,255,0.02)"}}>
                                <td style={{padding:"8px 12px",fontSize:12,fontWeight:800,color:"#DDB863",background:"rgba(255,255,255,0.02)",position:"sticky",left:0,borderRight:"1px solid rgba(221,184,99,0.12)"}}>Resultado antes de impuesto</td>
                                {MESES_DISP.map(m=>{const v=resAntesMes(m);return <td key={m} style={{...cellSt(v),fontFamily:"Lora",fontWeight:800,fontSize:12,color:v>=0?"#DDB863":"#f06060"}}>{fmtCell(v)}</td>;})}
                                <td style={{...cellSt(resAntes),fontFamily:"Lora",fontWeight:800,fontSize:12,borderLeft:"1px solid rgba(221,184,99,0.15)",background:"rgba(255,255,255,0.03)",color:resAntes>=0?"#DDB863":"#f06060"}}>{fmtCell(resAntes)}</td>
                              </tr>
                            ) : null,
                          ];
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{borderTop:"2px solid rgba(221,184,99,0.22)",background:"#111111"}}>
                          <td style={{padding:"10px 12px",fontSize:12,fontWeight:800,color:"#DDB863",position:"sticky",left:0,background:"#111111",borderRight:"1px solid rgba(221,184,99,0.12)"}}>RESULTADO NETO</td>
                          {MESES_DISP.map(m=>{const v=resFinalMes(m);return <td key={m} style={{...cellSt(v),fontFamily:"Lora",fontWeight:800,fontSize:13,color:v>=0?"#DDB863":"#f06060"}}>{fmtCell(v)}</td>;})}
                          <td style={{...cellSt(resFinal),fontFamily:"Lora",fontWeight:800,fontSize:13,borderLeft:"1px solid rgba(221,184,99,0.15)",background:"rgba(255,255,255,0.04)",color:resFinal>=0?"#DDB863":"#f06060"}}>{fmtCell(resFinal)}</td>
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
              const PIVOT_NEG = {
                // Cobros
                "Ventas":          {},
                "Ingresos":        {"4":37670.9},
                // Gastos variables
                "Costos":          {},
                "Comisiones":      {},
                "Transporte":      {},
                "Marketing":       {"1":-11700.0,"2":-46800.0,"4":-29403.0},
                "Impuestos":       {},
                // Gastos fijos
                "Personal":        {},
                "Servicios":       {"2":-1402.05},
                "Licencias / suscripciones": {"4":-4680.53},
                "Alquileres":      {},
                "Mantenimiento":   {},
                "Honorarios":      {},
                "Capacitación":    {},
                "Otros gastos":    {},
                // Inversiones
                "Inversiones":     {},
                // Financiamiento
                "Distribución de dividendos": {},
                "Préstamo recibido":          {},
                "Préstamo pagado":            {},
                "Intereses pagados":          {},
              };

              const GRUPOS_NEG = {
                Cobros:             ["Ventas","Ingresos"],
                "Gastos variables": ["Costos","Comisiones","Transporte","Marketing","Impuestos"],
                "Gastos fijos":     ["Personal","Servicios","Licencias / suscripciones","Alquileres","Mantenimiento","Honorarios","Capacitación","Otros gastos"],
                Inversiones:        ["Inversiones"],
                Financiamiento:     ["Distribución de dividendos","Préstamo recibido","Préstamo pagado","Intereses pagados"],
              };
              const GRUPO_NEG_COLOR = {
                Cobros:"#4CAF82",
                "Gastos variables":"#f0a060",
                "Gastos fijos":"#f06060",
                Inversiones:"#1D445C",
                Financiamiento:"#c860f0",
              };
              const GRUPO_NEG_BG = {
                Cobros:"rgba(96,240,160,0.05)",
                "Gastos variables":"rgba(240,160,96,0.05)",
                "Gastos fijos":"rgba(240,96,96,0.05)",
                Inversiones:"rgba(96,200,240,0.05)",
                Financiamiento:"rgba(200,96,240,0.05)",
              };

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
                  <div style={{fontSize:11,color:"#8C8C8C",marginBottom:14}}>Movimientos NEGOCIO · por mes · sin IVA</div>

                  {/* KPIs */}
                  <div style={{...S.g3,marginBottom:14}}>
                    {[
                      {label:"Cobros",val:fmtN(cobros),color:"#4CAF82"},
                      {label:"Gastos totales",val:fmtN(Math.abs(gastos)),color:"#f06060"},
                      {label:"Flujo neto",val:(flujoNeto>=0?"+":"-")+fmtN(Math.abs(flujoNeto)),color:flujoNeto>=0?"#DDB863":"#f06060"},
                    ].map(k=>(
                      <div key={k.label} style={S.card}>
                        <div style={{...S.lbl,marginBottom:6}}>{k.label}</div>
                        <div style={{fontFamily:"Lora",fontSize:20,fontWeight:800,color:k.color}}>{k.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tabla pivot */}
                  <div style={{...S.card,padding:0,overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid rgba(221,184,99,0.18)"}}>
                          <th style={{textAlign:"left",padding:"8px 12px",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.7,background:"#141414",position:"sticky",left:0,zIndex:1,minWidth:200}}>Concepto</th>
                          {MESES_DISP.map(m=><th key={m} style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",minWidth:110,whiteSpace:"nowrap"}}>{MESES_NOM[+m]}</th>)}
                          <th style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",minWidth:110,fontWeight:700,borderLeft:"1px solid rgba(221,184,99,0.15)"}}>Total</th>
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
                            <tr key={`hdr-${grupo}`} style={{background:bg,borderTop:"1px solid rgba(221,184,99,0.15)"}}>
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
                                  <td style={{padding:"5px 12px 5px 20px",fontSize:12,color:hasData?"#F8F4E8":"#333",background:"#141414",position:"sticky",left:0,borderRight:"1px solid rgba(221,184,99,0.12)"}}>{c1}</td>
                                  {MESES_DISP.map(m=>{const v=pvNeg(c1,m);return <td key={m} style={cellSt(v)}>{fmtCell(v)}</td>;})}
                                  <td style={{...cellSt(rt),borderLeft:"1px solid rgba(221,184,99,0.15)",background:"rgba(255,255,255,0.02)",fontWeight:700}}>{fmtCell(rt)}</td>
                                </tr>
                              );
                            }),
                            // Subtotal grupo
                            <tr key={`sub-${grupo}`} style={{borderTop:"1px solid rgba(221,184,99,0.15)",borderBottom:"1px solid rgba(255,255,255,0.04)",background:bg}}>
                              <td style={{padding:"6px 12px",fontSize:11,fontWeight:700,color,background:bg,position:"sticky",left:0,borderRight:"1px solid rgba(221,184,99,0.12)"}}>Total {grupo}</td>
                              {MESES_DISP.map(m=>{const v=grupoTotNegMes(grupo,m);return <td key={m} style={{...cellSt(v),fontFamily:"Lora",fontWeight:700,color:v!==0?color:"#333"}}>{fmtCell(v)}</td>;})}
                              <td style={{...cellSt(gTot),fontFamily:"Lora",fontWeight:800,borderLeft:"1px solid rgba(221,184,99,0.15)",background:bg,color:gTot!==0?color:"#333"}}>{fmtCell(gTot)}</td>
                            </tr>
                          ];
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{borderTop:"2px solid rgba(221,184,99,0.22)",background:"#111111"}}>
                          <td style={{padding:"8px 12px",fontSize:11,fontWeight:700,color:"#8C8C8C",position:"sticky",left:0,background:"#111111",borderRight:"1px solid rgba(221,184,99,0.12)"}}>FLUJO NETO</td>
                          {MESES_DISP.map(m=>{const v=colTotNeg(m);return <td key={m} style={{...cellSt(v),fontFamily:"Lora",fontWeight:800,fontSize:12}}>{fmtCell(v)}</td>;})}
                          <td style={{...cellSt(grandTotNeg),fontFamily:"Lora",fontWeight:800,fontSize:12,borderLeft:"1px solid rgba(221,184,99,0.15)",background:"rgba(255,255,255,0.04)"}}>{fmtCell(grandTotNeg)}</td>
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
                <div style={{fontSize:11,color:"#8C8C8C",marginBottom:14}}>Movimientos PERSONAL · neto por categoría y mes · con IVA</div>

                {/* Filtros */}
                <div style={{...S.card,marginBottom:14,padding:"14px 16px",overflow:"visible"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                    <div style={{fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.8}}>Período</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <label style={{fontSize:11,color:"#4A4A4A"}}>Desde</label>
                      <select value={persDesde} onChange={e=>{setPersDesde(e.target.value);if(+e.target.value>+persHasta)setPersHasta(e.target.value);}} style={selStyle}>
                        {MESES_DISP.map(m=><option key={m} value={m}>{MESES_NOM[+m]}</option>)}
                      </select>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <label style={{fontSize:11,color:"#4A4A4A"}}>Hasta</label>
                      <select value={persHasta} onChange={e=>{setPersHasta(e.target.value);if(+e.target.value<+persDesde)setPersDesde(e.target.value);}} style={selStyle}>
                        {MESES_DISP.map(m=><option key={m} value={m}>{MESES_NOM[+m]}</option>)}
                      </select>
                    </div>
                    <div style={{width:1,height:20,background:"rgba(221,184,99,0.15)"}}/>
                    <div style={{fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.8}}>Banco</div>
                    <div style={{position:"relative"}} ref={bancoDropRef}>
                      <button onClick={()=>setBancoDropOpen(o=>!o)}
                        style={{background:"#1E1E1E",border:`1px solid ${persBancos.length>0?"rgba(221,184,99,0.5)":"rgba(221,184,99,0.18)"}`,borderRadius:5,color:persBancos.length>0?"#DDB863":"#4A4A4A",fontFamily:"Roboto",fontSize:11,padding:"5px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                        {persBancos.length===0?"Todos los bancos":persBancos.length===1?persBancos[0]:`${persBancos.length} bancos`}
                        <span style={{fontSize:9,opacity:0.6}}>{bancoDropOpen?"▲":"▼"}</span>
                      </button>
                      {bancoDropOpen&&(
                        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,background:"#1E1E1E",border:"1px solid rgba(221,184,99,0.22)",borderRadius:6,zIndex:999,minWidth:220,padding:"6px 0",boxShadow:"0 12px 32px rgba(0,0,0,0.7)"}}>
                          <div onClick={()=>{setPersBancos([]);setBancoDropOpen(false);}}
                            style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",cursor:"pointer",fontSize:11,color:persBancos.length===0?"#DDB863":"#8C8C8C",borderBottom:"1px solid rgba(221,184,99,0.12)"}}
                            onMouseEnter={e=>e.currentTarget.style.background="rgba(221,184,99,0.1)"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <span style={{width:12,height:12,borderRadius:2,border:`1px solid ${persBancos.length===0?"#DDB863":"rgba(255,255,255,0.2)"}`,background:persBancos.length===0?"#DDB863":"transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#0d0d10",flexShrink:0}}>{persBancos.length===0?"✓":""}</span>
                            Todos los bancos
                          </div>
                          {bancosPersList.map(b=>{
                            const chk=persBancos.includes(b);
                            return (
                              <div key={b} onClick={()=>setPersBancos(p=>chk?p.filter(x=>x!==b):[...p,b])}
                                style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",cursor:"pointer",fontSize:11,color:chk?"#DDB863":"#8C8C8C"}}
                                onMouseEnter={e=>e.currentTarget.style.background="rgba(221,184,99,0.1)"}
                                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                                <span style={{width:12,height:12,borderRadius:2,border:`1px solid ${chk?"#DDB863":"rgba(255,255,255,0.2)"}`,background:chk?"#DDB863":"transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#0d0d10",flexShrink:0}}>{chk?"✓":""}</span>
                                {b}
                              </div>
                            );
                          })}
                          <div style={{borderTop:"1px solid rgba(221,184,99,0.12)",padding:"6px 12px"}}>
                            <button onClick={()=>setBancoDropOpen(false)} style={{width:"100%",background:"rgba(221,184,99,0.12)",border:"1px solid rgba(221,184,99,0.35)",borderRadius:4,color:"#DDB863",fontFamily:"Roboto",fontSize:11,padding:"5px",cursor:"pointer"}}>Aplicar →</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{marginLeft:"auto",fontSize:11,color:"#DDB863",fontFamily:"Lora",fontWeight:700}}>
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
                      {label:"Cobros",val:fmtN(persIng),color:"#4CAF82",sub:periodoLabel},
                      {label:"Necesidades",val:fmtN(Math.abs(persNec)),color:"#1D445C",pct:pct(persNec)},
                      {label:"Deseos",val:fmtN(Math.abs(persDes)),color:"#cc88cc",pct:pct(persDes)},
                      {label:"Inversiones",val:fmtN(Math.abs(persInv)),color:"#f0c060",pct:pct(persInv)},
                      {label:"Resultado neto",val:(grandTot>=0?"+":"-")+fmtN(Math.abs(grandTot)),color:grandTot>=0?"#DDB863":"#f06060",sub:periodoLabel},
                    ].map(k=>(
                      <div key={k.label} style={S.card}>
                        <div style={{...S.lbl,marginBottom:4}}>{k.label}</div>
                        <div style={{fontFamily:"Lora",fontSize:16,fontWeight:800,color:k.color,marginBottom:3}}>{k.val}</div>
                        {k.pct?(
                          <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                            <span style={{fontFamily:"Lora",fontSize:14,fontWeight:700,color:k.color}}>{k.pct}</span>
                            <span style={{fontSize:9,color:"#4A4A4A"}}>de ingresos</span>
                          </div>
                        ):<div style={{fontSize:10,color:"#8C8C8C"}}>{k.sub}</div>}
                      </div>
                    ));
                  })()}
                </div>

                {/* Pivot table */}
                <div style={{...S.card,padding:0,overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                    <thead>
                      <tr style={{borderBottom:"1px solid rgba(221,184,99,0.18)"}}>
                        <th style={{textAlign:"left",padding:"8px 12px",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.7,background:"#141414",position:"sticky",left:0,zIndex:1,minWidth:180}}>Concepto</th>
                        {mesesFiltrados.map(m=><th key={m} style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",minWidth:110,whiteSpace:"nowrap"}}>{MESES_NOM[+m]}</th>)}
                        <th style={{textAlign:"right",padding:"8px 10px",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",minWidth:110,fontWeight:700,borderLeft:"1px solid rgba(221,184,99,0.15)"}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Cobros por ingresos */}
                      {(()=>{
                        const rt=rowTot("Ingresos");
                        return (
                          <tr style={{borderBottom:"2px solid rgba(96,240,160,0.2)",background:"rgba(96,240,160,0.04)"}}>
                            <td style={{padding:"7px 12px",fontSize:12,fontWeight:700,color:"#4CAF82",background:"rgba(96,240,160,0.04)",position:"sticky",left:0,borderRight:"1px solid rgba(221,184,99,0.12)"}}>Cobros por ingresos</td>
                            {mesesFiltrados.map(m=>{const v=pvGet("Ingresos",m);return <td key={m} style={cellSt(v)}>{fmtCell(v)}</td>;})}
                            <td style={{...cellSt(rt),borderLeft:"1px solid rgba(221,184,99,0.15)",fontWeight:800}}>{fmtCell(rt)}</td>
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
                          <tr key={`hdr-${grupo}`} style={{background:bg,borderTop:"1px solid rgba(221,184,99,0.15)"}}>
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
                                <td style={{padding:"5px 12px 5px 20px",fontSize:12,color:hasData?"#F8F4E8":"#333",background:"#141414",position:"sticky",left:0,borderRight:"1px solid rgba(221,184,99,0.12)"}}>{fila}</td>
                                {mesesFiltrados.map(m=>{const v=pvGet(fila,m);return <td key={m} style={{...cellSt(v),fontSize:11}}>{fmtCell(v)}</td>;})}
                                <td style={{...cellSt(rt),borderLeft:"1px solid rgba(221,184,99,0.15)",background:"rgba(255,255,255,0.02)",fontWeight:700,fontSize:11}}>{fmtCell(rt)}</td>
                              </tr>
                            );
                          }),
                          <tr key={`sub-${grupo}`} style={{borderTop:"1px solid rgba(221,184,99,0.15)",borderBottom:"1px solid rgba(255,255,255,0.04)",background:bg}}>
                            <td style={{padding:"6px 12px",fontSize:11,fontWeight:700,color,background:bg,position:"sticky",left:0,borderRight:"1px solid rgba(221,184,99,0.12)"}}>Total {GRUPO_LABEL[grupo]||grupo}</td>
                            {mesesFiltrados.map(m=>{const v=gTotM(m);return <td key={m} style={{...cellSt(v),fontFamily:"Lora",fontWeight:700,color:v!==0?color:"#333"}}>{fmtCell(v)}</td>;})}
                            <td style={{...cellSt(gTot),fontFamily:"Lora",fontWeight:800,borderLeft:"1px solid rgba(221,184,99,0.15)",background:bg,color:gTot!==0?color:"#333"}}>{fmtCell(gTot)}</td>
                          </tr>
                        ];
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{borderTop:"2px solid rgba(221,184,99,0.22)",background:"#111111"}}>
                        <td style={{padding:"8px 12px",fontSize:11,fontWeight:700,color:"#8C8C8C",position:"sticky",left:0,background:"#111111",borderRight:"1px solid rgba(221,184,99,0.12)"}}>NETO</td>
                        {mesesFiltrados.map(m=>{const v=colTot(m);return <td key={m} style={{...cellSt(v),fontFamily:"Lora",fontWeight:800,fontSize:12}}>{fmtCell(v)}</td>;})}
                        <td style={{...cellSt(grandTot),fontFamily:"Lora",fontWeight:800,fontSize:12,borderLeft:"1px solid rgba(221,184,99,0.15)",background:"rgba(255,255,255,0.04)"}}>{fmtCell(grandTot)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}

            {/* ── CONCILIACIÓN BANCARIA ── */}
            {reportTab==="conciliacion" && (()=>{
              const TODOS_MESES = ["1","2","3","4","5","6","7","8","9","10","11","12"];
              const mesesVer = TODOS_MESES.filter(m=>conciliarMeses.includes(m));
              const toggleMes = (m) => setConciliarMeses(p=>p.includes(m)?p.filter(x=>x!==m):[...p,m].sort((a,b)=>+a-+b));
              const pre = (mon) => mon==="USD"?"U$S ":"$ ";
              const fmtV = (v, mon) => v==null?"—":`${pre(mon)}${Math.abs(v).toLocaleString("es-UY",{minimumFractionDigits:0,maximumFractionDigits:0})}`;
              const bancosActivos = config.bancos.filter(b=>b.activo!==false);
              const anosDisp = ["2025","2026","2027"];
              const stickyCel = {background:"#141414",position:"sticky",left:0,zIndex:1,borderRight:"1px solid rgba(221,184,99,0.1)"};
              const inpConci = (color) => ({width:120,background:"#111",border:`1px solid ${color}33`,borderRadius:4,color,fontFamily:"Lora",fontSize:12,padding:"4px 8px",textAlign:"right",outline:"none",boxSizing:"border-box"});
              // Calcula todas las filas para un banco (siempre los 12 meses para propagar saldo_inicial)
              const computar = (bancoDef) => {
                const byMes = {};
                let prevSaldoFinal = null;
                for(let n=1; n<=12; n++){
                  const mes = String(n);
                  const conci = conciliaciones.find(c=>c.banco===bancoDef.nombre&&c.moneda===bancoDef.moneda&&c.ano===conciliarAno&&c.mes===mes);
                  const regsDelMes = regs.filter(r=>{
                    if(r.b!==bancoDef.nombre||r.moneda!==bancoDef.moneda) return false;
                    const fcp = r.fechaCP||r.f||"";
                    const d = new Date(fcp+"T00:00:00");
                    return String(d.getMonth()+1)===mes&&String(d.getFullYear())===conciliarAno;
                  });
                  const pagosT = pagosPendientes.filter(p=>{
                    if(p.banco!==bancoDef.nombre||p.moneda!==bancoDef.moneda) return false;
                    const d = new Date((p.fecha||"")+"T00:00:00");
                    return String(d.getMonth()+1)===mes&&String(d.getFullYear())===conciliarAno;
                  });
                  const cobros = regsDelMes.filter(r=>(r.tot||0)>0).reduce((s,r)=>s+(r.tot||0),0);
                  const pagos = regsDelMes.filter(r=>(r.tot||0)<0).reduce((s,r)=>s+Math.abs(r.tot||0),0)+pagosT.reduce((s,p)=>s+(p.monto||0),0);
                  const saldo_inicial = conci?.saldo_inicial??prevSaldoFinal;
                  const saldo_final_calc = saldo_inicial!=null ? saldo_inicial+cobros-pagos : null;
                  const saldo_extracto = conci?.saldo_extracto??null;
                  const diferencia = saldo_final_calc!=null&&saldo_extracto!=null ? saldo_final_calc-saldo_extracto : null;
                  byMes[mes] = {cobros,pagos,saldo_inicial,saldo_final_calc,saldo_extracto,diferencia,conci};
                  if(saldo_final_calc!=null) prevSaldoFinal = saldo_final_calc;
                }
                return byMes;
              };
              return (
                <>
                  {/* Controles */}
                  <div style={{...S.card,marginBottom:14,padding:"12px 16px"}}>
                    <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.7}}>Año</span>
                        {anosDisp.map(y=>(
                          <button key={y} onClick={()=>setConciliarAno(y)}
                            style={{background:conciliarAno===y?"rgba(221,184,99,0.12)":"transparent",border:`1px solid ${conciliarAno===y?"rgba(221,184,99,0.5)":"rgba(221,184,99,0.15)"}`,color:conciliarAno===y?"#DDB863":"#4A4A4A",borderRadius:4,padding:"3px 12px",fontFamily:"Roboto",fontSize:11,cursor:"pointer"}}>
                            {y}
                          </button>
                        ))}
                      </div>
                      <div style={{width:1,height:20,background:"rgba(221,184,99,0.15)"}}/>
                      <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.7,marginRight:2}}>Meses</span>
                        {TODOS_MESES.map(m=>(
                          <button key={m} onClick={()=>toggleMes(m)}
                            style={{background:conciliarMeses.includes(m)?"rgba(221,184,99,0.12)":"transparent",border:`1px solid ${conciliarMeses.includes(m)?"rgba(221,184,99,0.5)":"rgba(221,184,99,0.1)"}`,color:conciliarMeses.includes(m)?"#DDB863":"#4A4A4A",borderRadius:4,padding:"2px 9px",fontFamily:"Roboto",fontSize:11,cursor:"pointer"}}>
                            {MESES_NOM[+m]}
                          </button>
                        ))}
                        <button onClick={()=>setConciliarMeses([...TODOS_MESES])}
                          style={{background:"transparent",border:"1px solid rgba(221,184,99,0.12)",color:"#4A4A4A",borderRadius:4,padding:"2px 9px",fontFamily:"Roboto",fontSize:10,cursor:"pointer",marginLeft:4}}>
                          Todos
                        </button>
                      </div>
                    </div>
                  </div>

                  {bancosActivos.length===0&&<div style={{...S.card,color:"#8C8C8C",fontSize:12}}>No hay bancos activos. Configurá tus cuentas en ⚙ Configuración.</div>}

                  {bancosActivos.map(bancoDef=>{
                    const byMes = computar(bancoDef);
                    const mon = bancoDef.moneda;
                    return (
                      <div key={bancoDef.nombre+mon} style={{...S.card,padding:0,marginBottom:16}}>
                        {/* Header banco */}
                        <div style={{padding:"10px 16px",borderBottom:"1px solid rgba(221,184,99,0.12)",display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontFamily:"Lora",fontSize:14,fontWeight:800}}>{bancoDef.nombre}</span>
                          <span style={{fontSize:10,padding:"2px 8px",borderRadius:3,background:mon==="USD"?"rgba(240,192,96,0.1)":"rgba(29,68,92,0.2)",color:mon==="USD"?"#f0c060":"#5AAFDF",border:`1px solid ${mon==="USD"?"rgba(240,192,96,0.25)":"rgba(29,68,92,0.4)"}`}}>{mon}</span>
                          <span style={{fontSize:10,color:"#4A4A4A"}}>· {conciliarAno}</span>
                          <span style={{marginLeft:"auto",fontSize:10,color:"#4A4A4A"}}>Saldo inicial primer mes: ingresarlo manualmente, los siguientes se propagan</span>
                        </div>
                        {/* Tabla con scroll horizontal */}
                        <div style={{overflowX:"auto"}}>
                          <table style={{borderCollapse:"collapse",fontSize:12,minWidth:mesesVer.length*140+220}}>
                            <thead>
                              <tr style={{borderBottom:"1px solid rgba(221,184,99,0.12)"}}>
                                <th style={{...stickyCel,padding:"7px 16px",fontSize:10,color:"#4A4A4A",textTransform:"uppercase",letterSpacing:0.5,textAlign:"left",fontWeight:500,minWidth:200}}>Concepto</th>
                                {mesesVer.map(m=><th key={m} style={{padding:"7px 14px",fontSize:10,color:"#8C8C8C",textTransform:"uppercase",letterSpacing:0.5,textAlign:"right",fontWeight:500,minWidth:140,whiteSpace:"nowrap"}}>{MESES_NOM[+m]} {conciliarAno}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {/* Saldo inicial */}
                              <tr style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                                <td style={{...stickyCel,padding:"7px 16px",color:"#8C8C8C"}}>Saldo inicial <span style={{fontSize:9,opacity:0.6}}>· editable</span></td>
                                {mesesVer.map(m=>{
                                  const d=byMes[m];
                                  return (
                                    <td key={m} style={{padding:"4px 8px",textAlign:"right"}}>
                                      <input type="number" step="0.01"
                                        value={d?.conci?.saldo_inicial??""}
                                        placeholder={d?.saldo_inicial!=null&&d?.conci?.saldo_inicial==null?d.saldo_inicial.toLocaleString("es-UY",{maximumFractionDigits:0}):"—"}
                                        onChange={e=>upsertConciliacion({banco:bancoDef.nombre,moneda:mon,ano:conciliarAno,mes:m,saldo_inicial:e.target.value===""?null:parseFloat(e.target.value)})}
                                        style={inpConci("#DDB863")}/>
                                    </td>
                                  );
                                })}
                              </tr>
                              {/* Cobros */}
                              <tr style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                                <td style={{...stickyCel,padding:"7px 16px 7px 24px",color:"#4CAF82"}}>+ Cobros</td>
                                {mesesVer.map(m=>{const v=byMes[m]?.cobros??0;return <td key={m} style={{padding:"7px 14px",textAlign:"right",fontFamily:"Lora",fontSize:11,color:v>0?"#4CAF82":"#3A3A3A"}}>{v>0?fmtV(v,mon):"—"}</td>;})}
                              </tr>
                              {/* Pagos */}
                              <tr style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                                <td style={{...stickyCel,padding:"7px 16px 7px 24px",color:"#f06060"}}>− Pagos</td>
                                {mesesVer.map(m=>{const v=byMes[m]?.pagos??0;return <td key={m} style={{padding:"7px 14px",textAlign:"right",fontFamily:"Lora",fontSize:11,color:v>0?"#f06060":"#3A3A3A"}}>{v>0?fmtV(v,mon):"—"}</td>;})}
                              </tr>
                              {/* Saldo calculado */}
                              <tr style={{borderBottom:"2px solid rgba(221,184,99,0.15)",background:"rgba(255,255,255,0.015)"}}>
                                <td style={{...stickyCel,padding:"8px 16px",fontWeight:700,color:"#F8F4E8",background:"rgba(255,255,255,0.015)"}}>= Saldo final calculado</td>
                                {mesesVer.map(m=>{const v=byMes[m]?.saldo_final_calc;return <td key={m} style={{padding:"8px 14px",textAlign:"right",fontFamily:"Lora",fontSize:12,fontWeight:700,color:"#F8F4E8"}}>{fmtV(v,mon)}</td>;})}
                              </tr>
                              {/* Saldo extracto */}
                              <tr style={{borderBottom:"1px solid rgba(29,68,92,0.3)"}}>
                                <td style={{...stickyCel,padding:"7px 16px",color:"#5AAFDF"}}>Saldo extracto <span style={{fontSize:9,opacity:0.6}}>· editable / auto</span></td>
                                {mesesVer.map(m=>{
                                  const d=byMes[m];
                                  return (
                                    <td key={m} style={{padding:"4px 8px",textAlign:"right"}}>
                                      <input type="number" step="0.01"
                                        value={d?.saldo_extracto??""}
                                        placeholder="—"
                                        onChange={e=>upsertConciliacion({banco:bancoDef.nombre,moneda:mon,ano:conciliarAno,mes:m,saldo_extracto:e.target.value===""?null:parseFloat(e.target.value)})}
                                        style={inpConci("#5AAFDF")}/>
                                    </td>
                                  );
                                })}
                              </tr>
                              {/* Diferencia */}
                              <tr>
                                <td style={{...stickyCel,padding:"8px 16px",fontWeight:700,color:"#8C8C8C"}}>Diferencia</td>
                                {mesesVer.map(m=>{
                                  const diff=byMes[m]?.diferencia;
                                  const ok=diff!=null&&Math.abs(diff)<1;
                                  const haydif=diff!=null&&Math.abs(diff)>=1;
                                  return (
                                    <td key={m} style={{padding:"8px 14px",textAlign:"right",background:ok?"rgba(76,175,130,0.08)":haydif?"rgba(240,96,96,0.08)":"transparent"}}>
                                      {diff==null?<span style={{color:"#3A3A3A"}}>—</span>:ok?
                                        <span style={{color:"#4CAF82",fontWeight:700}}>✓ OK</span>:
                                        <span style={{color:"#f06060",fontWeight:700}}>⚠ {diff>0?"+":""}{diff.toLocaleString("es-UY",{maximumFractionDigits:0})}</span>
                                      }
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </>
        )}
        {/* ── CONFIGURACIÓN ── */}
        {mainTab==="config" && (
          <>
            <div style={{fontFamily:"Lora",fontSize:18,fontWeight:800,marginBottom:4}}>Configuración</div>
            <div style={{color:"#8C8C8C",fontSize:12,marginBottom:16}}>Gestioná tus bancos y tarjetas. Solo los activos aparecen en el formulario.</div>

            {/* Sub-tabs */}
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {[["bancos","🏦 Bancos y cuentas"],["tarjetas","💳 Tarjetas"]].map(([k,l])=>(
                <button key={k} onClick={()=>setConfigTab(k)}
                  style={{background:configTab===k?"rgba(221,184,99,0.12)":"#141414",border:`1px solid ${configTab===k?"rgba(221,184,99,0.45)":"rgba(221,184,99,0.12)"}`,color:configTab===k?"#DDB863":"#8C8C8C",borderRadius:5,padding:"7px 16px",fontFamily:"Roboto",fontSize:11,cursor:"pointer"}}>
                  {l}
                </button>
              ))}
            </div>

            {/* ── BANCOS ── */}
            {configTab==="bancos" && (
              <>
                {/* Tabla de bancos */}
                <div style={{...S.card,padding:0,marginBottom:16}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 80px 100px 80px 80px",gap:4,padding:"8px 14px",fontSize:10,color:"#4A4A4A",textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid rgba(221,184,99,0.12)"}}>
                    <div>Nombre</div><div>Moneda</div><div>Tipo</div><div style={{textAlign:"center"}}>Activo</div><div></div>
                  </div>
                  {config.bancos.map(b=>(
                    <div key={b.id} style={{display:"grid",gridTemplateColumns:"1fr 80px 100px 80px 80px",gap:4,padding:"10px 14px",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.04)"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#1E1E1E"}
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
                            <button onClick={async()=>{await updateBancoToDB(b.id,{nombre:editingConfig.nombre,moneda:editingConfig.moneda,tipo:editingConfig.tipo,activo:editingConfig.activo});setConfig(p=>({...p,bancos:p.bancos.map(x=>x.id===b.id?{...editingConfig}:x)}));setEditingConfig(null);}}
                              style={{background:"#DDB863",border:"none",borderRadius:3,color:"#0A0A0A",fontFamily:"Roboto",fontSize:10,padding:"3px 8px",cursor:"pointer",fontWeight:700}}>✓</button>
                            <button onClick={()=>setEditingConfig(null)}
                              style={{background:"none",border:"1px solid rgba(221,184,99,0.18)",borderRadius:3,color:"#8C8C8C",fontFamily:"Roboto",fontSize:10,padding:"3px 6px",cursor:"pointer"}}>✕</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{fontSize:12,fontWeight:b.activo?600:400,color:b.activo?"#F8F4E8":"#8C8C8C"}}>{b.nombre}</div>
                          <div><span style={{fontSize:10,padding:"2px 7px",borderRadius:3,background:b.moneda==="USD"?"rgba(240,192,96,0.15)":"rgba(96,200,240,0.15)",color:b.moneda==="USD"?"#f0c060":"#1D445C"}}>{b.moneda}</span></div>
                          <div style={{fontSize:11,color:"#4A4A4A"}}>{b.tipo}</div>
                          <div style={{textAlign:"center"}}>
                            <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:b.activo?"rgba(96,240,160,0.15)":"rgba(255,255,255,0.05)",color:b.activo?"#4CAF82":"#4A4A4A"}}>{b.activo?"Activo":"Inactivo"}</span>
                          </div>
                          <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                            <button onClick={()=>setEditingConfig({...b,table:"bancos"})}
                              style={{background:"none",border:"1px solid rgba(221,184,99,0.15)",borderRadius:3,color:"#8C8C8C",fontFamily:"Roboto",fontSize:10,padding:"3px 8px",cursor:"pointer"}}>✎</button>
                            <button onClick={async()=>{const a=!b.activo;await updateBancoToDB(b.id,{activo:a});setConfig(p=>({...p,bancos:p.bancos.map(x=>x.id===b.id?{...x,activo:a}:x)}));}}
                              style={{background:"none",border:`1px solid ${b.activo?"rgba(240,96,96,0.3)":"rgba(96,240,160,0.3)"}`,borderRadius:3,color:b.activo?"#f06060":"#4CAF82",fontFamily:"Roboto",fontSize:10,padding:"3px 8px",cursor:"pointer"}}>
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
                    <button onClick={async()=>{
                      if(!newBanco.nombre.trim()) return;
                      const guardado = await saveBancoToDB({...newBanco,activo:true});
                      if(guardado) { setConfig(p=>({...p,bancos:[...p.bancos,guardado]})); setNewBanco({nombre:"",moneda:"UYU",tipo:"Ambos",activo:true}); }
                    }} style={{background:"#DDB863",border:"none",borderRadius:6,color:"#0A0A0A",fontFamily:"Lora",fontSize:12,fontWeight:700,padding:"9px 16px",cursor:"pointer",whiteSpace:"nowrap"}}>
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
                  <div style={{display:"grid",gridTemplateColumns:"1fr 120px 80px 80px 80px 100px",gap:4,padding:"8px 14px",fontSize:10,color:"#4A4A4A",textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid rgba(221,184,99,0.12)"}}>
                    <div>Nombre</div><div>Banco emisor</div><div>Tipo</div><div>Moneda</div><div style={{textAlign:"center"}}>Activo</div><div></div>
                  </div>
                  {config.tarjetas.map(t=>(
                    <div key={t.id} style={{display:"grid",gridTemplateColumns:"1fr 120px 80px 80px 80px 100px",gap:4,padding:"10px 14px",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.04)"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#1E1E1E"}
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
                            <button onClick={async()=>{await updateTarjetaToDB(t.id,{nombre:editingConfig.nombre,banco:editingConfig.banco,moneda:editingConfig.moneda,tipoCarta:editingConfig.tipoCarta,tipo:editingConfig.tipo,activo:editingConfig.activo});setConfig(p=>({...p,tarjetas:p.tarjetas.map(x=>x.id===t.id?{...editingConfig}:x)}));setEditingConfig(null);}}
                              style={{background:"#DDB863",border:"none",borderRadius:3,color:"#0A0A0A",fontFamily:"Roboto",fontSize:10,padding:"3px 8px",cursor:"pointer",fontWeight:700}}>✓</button>
                            <button onClick={()=>setEditingConfig(null)}
                              style={{background:"none",border:"1px solid rgba(221,184,99,0.18)",borderRadius:3,color:"#8C8C8C",fontFamily:"Roboto",fontSize:10,padding:"3px 6px",cursor:"pointer"}}>✕</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{fontSize:12,fontWeight:t.activo?600:400,color:t.activo?"#F8F4E8":"#8C8C8C"}}>{t.nombre}</div>
                          <div style={{fontSize:11,color:"#4A4A4A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.banco}</div>
                          <div><span style={{fontSize:10,padding:"2px 7px",borderRadius:3,background:t.tipoCarta==="crédito"?"rgba(200,96,240,0.15)":"rgba(96,200,240,0.15)",color:t.tipoCarta==="crédito"?"#c860f0":"#1D445C"}}>{t.tipoCarta}</span></div>
                          <div><span style={{fontSize:10,padding:"2px 7px",borderRadius:3,background:t.moneda==="USD"?"rgba(240,192,96,0.15)":"rgba(96,200,240,0.15)",color:t.moneda==="USD"?"#f0c060":"#1D445C"}}>{t.moneda}</span></div>
                          <div style={{textAlign:"center"}}>
                            <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:t.activo?"rgba(96,240,160,0.15)":"rgba(255,255,255,0.05)",color:t.activo?"#4CAF82":"#4A4A4A"}}>{t.activo?"Activo":"Inactivo"}</span>
                          </div>
                          <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                            <button onClick={()=>setEditingConfig({...t,table:"tarjetas"})}
                              style={{background:"none",border:"1px solid rgba(221,184,99,0.15)",borderRadius:3,color:"#8C8C8C",fontFamily:"Roboto",fontSize:10,padding:"3px 8px",cursor:"pointer"}}>✎</button>
                            <button onClick={async()=>{const a=!t.activo;await updateTarjetaToDB(t.id,{activo:a});setConfig(p=>({...p,tarjetas:p.tarjetas.map(x=>x.id===t.id?{...x,activo:a}:x)}));}}
                              style={{background:"none",border:`1px solid ${t.activo?"rgba(240,96,96,0.3)":"rgba(96,240,160,0.3)"}`,borderRadius:3,color:t.activo?"#f06060":"#4CAF82",fontFamily:"Roboto",fontSize:10,padding:"3px 8px",cursor:"pointer"}}>
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
                    <button onClick={async()=>{
                      if(!newTarjeta.nombre.trim()||!newTarjeta.banco) return;
                      const guardada = await saveTarjetaToDB({...newTarjeta,activo:true});
                      if(guardada) { setConfig(p=>({...p,tarjetas:[...p.tarjetas,guardada]})); setNewTarjeta({nombre:"",banco:"",moneda:"UYU",tipoCarta:"crédito",tipo:"Personal",activo:true}); }
                    }} style={{background:"#DDB863",border:"none",borderRadius:6,color:"#0A0A0A",fontFamily:"Lora",fontSize:12,fontWeight:700,padding:"9px 16px",cursor:"pointer",whiteSpace:"nowrap"}}>
                      + Agregar
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── ZONA DE PELIGRO ── */}
            <div style={{...S.card,marginTop:16,border:"1px solid rgba(240,96,96,0.25)"}}>
              <div style={{...S.secT,color:"#f06060"}}>Zona de peligro</div>
              <div style={{color:"#8C8C8C",fontSize:12,marginBottom:10}}>Borra todos los movimientos guardados en Registros. No se puede deshacer.</div>
              <button onClick={async()=>{
                if(!window.confirm("¿Borrar TODOS tus registros guardados? Esta acción no se puede deshacer.")) return;
                await deleteAllRegs();
              }} style={{background:"none",border:"1px solid rgba(240,96,96,0.4)",borderRadius:6,color:"#f06060",fontFamily:"Lora",fontSize:12,fontWeight:700,padding:"9px 16px",cursor:"pointer"}}>
                Borrar todos mis registros
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
