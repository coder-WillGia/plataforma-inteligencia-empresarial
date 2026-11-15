import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

// Deterministic PRNG so generated data is reproducible and realistic
let seed = 20261115;
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function randFloat(min, max, decimals = 2) {
  const val = rand() * (max - min) + min;
  return Number(val.toFixed(decimals));
}
function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

const meses = [
  { codigo: '2026-01', nombre: 'Ene 2026' },
  { codigo: '2026-02', nombre: 'Feb 2026' },
  { codigo: '2026-03', nombre: 'Mar 2026' },
  { codigo: '2026-04', nombre: 'Abr 2026' },
  { codigo: '2026-05', nombre: 'May 2026' },
  { codigo: '2026-06', nombre: 'Jun 2026' },
  { codigo: '2026-07', nombre: 'Jul 2026' },
  { codigo: '2026-08', nombre: 'Ago 2026' },
  { codigo: '2026-09', nombre: 'Sep 2026' },
  { codigo: '2026-10', nombre: 'Oct 2026' },
  { codigo: '2026-11', nombre: 'Nov 2026' },
  { codigo: '2026-12', nombre: 'Dic 2026' },
];

// ============================================================================
// 1. GENERATE MINERIA DATA (mineria.json)
// ============================================================================
function generateMineria() {
  const unidades = [
    'Tajo Abierto Antamina Norte',
    'Unidad Cerro Verde Sur',
    'Frente Las Bambas Este',
    'Mina Subterránea Yauli',
    'Tajo Toromocho Central',
  ];
  const minerales = ['Cobre', 'Zinc', 'Plata', 'Oro', 'Molibdeno'];

  // 24 production records across 12 months (2 records per month across key units)
  const produccion = [];
  let prodIdx = 1;
  for (const m of meses) {
    for (let u = 0; u < 2; u++) {
      const unidad = unidades[(prodIdx + u) % unidades.length];
      const mineral = minerales[(prodIdx + u) % minerales.length];
      const objetivo = randInt(42000, 65000);
      // Introduce realistic variance: some months exceed target, some fall slightly below
      const factor = u === 0 && (m.codigo === '2026-04' || m.codigo === '2026-09')
        ? randFloat(0.84, 0.91, 3)
        : randFloat(0.93, 1.07, 3);
      const extraidas = Math.round(objetivo * factor);
      const cumplimiento = Number(((extraidas / objetivo) * 100).toFixed(1));
      const horasOp = randInt(640, 720);
      const eficiencia = Number(Math.min(99.5, Math.max(72.0, cumplimiento * randFloat(0.95, 1.01, 3))).toFixed(1));
      const estado = cumplimiento >= 98 ? 'Cumplido' : cumplimiento >= 90 ? 'En Riesgo' : 'Bajo Objetivo';

      produccion.push({
        id: `PRD-${String(prodIdx).padStart(3, '0')}`,
        mes: m.codigo,
        mesNombre: m.nombre,
        fecha: `${m.codigo}-15`,
        unidadMinera: unidad,
        mineral,
        turno: u === 0 ? 'Día' : 'Noche',
        toneladasExtraidas: extraidas,
        toneladasObjetivo: objetivo,
        leyMineralPct: randFloat(0.65, 2.45, 2),
        horasOperacion: horasOp,
        eficienciaPct: eficiencia,
        estado,
        observaciones:
          estado === 'Bajo Objetivo'
            ? 'Parada no programada en chancadora primaria y lluvias en tajo.'
            : estado === 'En Riesgo'
            ? 'Menor ley de cabeza en frente secundario.'
            : 'Operación continua dentro de parámetros óptimos.',
      });
      prodIdx++;
    }
  }

  // 22 Maquinarias (min required: 20)
  const catalogoMaq = [
    { tipo: 'Camión Minero', marca: 'Caterpillar', modelo: '797F' },
    { tipo: 'Camión Minero', marca: 'Komatsu', modelo: '930E-5' },
    { tipo: 'Pala Eléctrica', marca: 'P&H', modelo: '4100XPC' },
    { tipo: 'Perforadora Rotativa', marca: 'Epiroc', modelo: 'Pit Viper 351' },
    { tipo: 'Cargador Frontal', marca: 'Komatsu', modelo: 'WA1200-6' },
    { tipo: 'Tractor de Orugas', marca: 'Caterpillar', modelo: 'D11T' },
    { tipo: 'Motoniveladora', marca: 'Caterpillar', modelo: '24M' },
    { tipo: 'Excavadora Hidráulica', marca: 'Hitachi', modelo: 'EX5600-7' },
    { tipo: 'Camión Cisterna', marca: 'Caterpillar', modelo: '785D' },
    { tipo: 'Scooptram Subterráneo', marca: 'Sandvik', modelo: 'LH621' },
  ];

  const maquinarias = [];
  for (let i = 1; i <= 22; i++) {
    const spec = catalogoMaq[(i - 1) % catalogoMaq.length];
    const unidad = unidades[(i - 1) % unidades.length];
    const isLowAvail = i === 4 || i === 11 || i === 17;
    const isMaint = i === 4 || i === 15;
    const isDown = i === 17;

    const horasTotalesMes = 720;
    const horasInactividad = isDown
      ? randInt(190, 260)
      : isLowAvail
      ? randInt(130, 175)
      : isMaint
      ? randInt(75, 115)
      : randInt(18, 65);
    const horasOperadas = horasTotalesMes - horasInactividad;
    const disponibilidadPct = Number(((horasOperadas / horasTotalesMes) * 100).toFixed(1));
    const eficienciaOperacionalPct = Number(
      Math.min(98.5, Math.max(65.0, disponibilidadPct * randFloat(0.92, 0.99, 3))).toFixed(1)
    );

    const estado = isDown
      ? 'Inoperativa'
      : isMaint
      ? 'En Mantenimiento'
      : isLowAvail
      ? 'En Revisión'
      : 'Operativa';

    maquinarias.push({
      id: `MAQ-${String(i).padStart(3, '0')}`,
      codigo: `EQ-${spec.marca.slice(0, 3).toUpperCase()}-${100 + i}`,
      nombre: `${spec.tipo} #${String(i).padStart(2, '0')} (${spec.modelo})`,
      tipo: spec.tipo,
      marca: spec.marca,
      modelo: spec.modelo,
      ubicacion: unidad,
      estado,
      horasOperadasMes: horasOperadas,
      horasInactividadMes: horasInactividad,
      disponibilidadPct,
      eficienciaOperacionalPct,
      ultimoMantenimiento: `2026-${String(randInt(8, 10)).padStart(2, '0')}-${String(randInt(5, 28)).padStart(2, '0')}`,
      proximoMantenimiento: `2026-12-${String(randInt(2, 28)).padStart(2, '0')}`,
      consumoCombustibleGalHora: randFloat(18.5, 84.0, 1),
    });
  }

  // 34 Mantenimientos (min required: 30)
  const tiposMant = ['Preventivo', 'Correctivo', 'Predictivo'];
  const prioridades = ['Baja', 'Media', 'Alta', 'Crítica'];
  const estadosMant = ['Completado', 'En Proceso', 'Programado', 'Vencido'];
  const tecnicos = [
    'Ing. Carlos Huamán',
    'Ing. Rosa Quispe',
    'Téc. Jorge Mendoza',
    'Ing. Luis Paredes',
    'Téc. Miguel Cáceres',
    'Ing. Elena Vargas',
  ];
  const descripcionesMant = [
    'Cambio de tren de fuerza y revisión de convertidor de par',
    'Inspección ultrasónica de cilindros hidráulicos de levante',
    'Reemplazo de filtros de alta presión y análisis tribológico de aceite',
    'Reparación correctiva de sistema de enfriamiento y radiador principal',
    'Calibración de sensores de carga útil y telemetría VIMS',
    'Overhaul programado de motor diésel de 2000 HP',
    'Mantenimiento de sistema eléctrico de potencia y alternador',
    'Sustitución de neumáticos gigantes 59/80R63 y alineamiento',
  ];

  const mantenimientos = [];
  for (let i = 1; i <= 34; i++) {
    const maq = maquinarias[(i - 1) % maquinarias.length];
    const tipo = i % 3 === 0 ? 'Correctivo' : i % 5 === 0 ? 'Predictivo' : 'Preventivo';
    const prioridad =
      tipo === 'Correctivo'
        ? pick(['Alta', 'Crítica'])
        : pick(['Baja', 'Media', 'Alta']);
    const estado =
      i <= 20
        ? 'Completado'
        : i <= 26
        ? 'En Proceso'
        : i <= 31
        ? 'Programado'
        : 'Vencido';
    const mesNum = String(randInt(1, 11)).padStart(2, '0');
    const diaNum = String(randInt(1, 27)).padStart(2, '0');
    const duracionHoras = tipo === 'Correctivo' ? randInt(16, 72) : randInt(6, 24);
    const costoPEN =
      tipo === 'Correctivo'
        ? randInt(28000, 145000)
        : tipo === 'Predictivo'
        ? randInt(8500, 26000)
        : randInt(12000, 48000);

    mantenimientos.push({
      id: `MNT-${String(i).padStart(3, '0')}`,
      maquinariaId: maq.id,
      maquinariaNombre: maq.nombre,
      tipo,
      prioridad,
      fechaProgramada: `2026-${mesNum}-${diaNum}`,
      fechaEjecucion: estado === 'Completado' || estado === 'En Proceso' ? `2026-${mesNum}-${diaNum}` : null,
      duracionHoras,
      costoPEN,
      tecnicoResponsable: tecnicos[i % tecnicos.length],
      estado,
      descripcion: descripcionesMant[i % descripcionesMant.length],
    });
  }

  // 24 Incidentes de Seguridad (min required: 20)
  const tiposInc = ['Mecánico', 'Operacional', 'Seguridad Personal', 'Ambiental', 'Eléctrico'];
  const severidades = ['Leve', 'Moderado', 'Grave', 'Crítico'];
  const estadosInc = ['Cerrado', 'En Investigación', 'Acción Correctiva'];
  const titulosInc = [
    'Fuga de aceite hidráulico en rampa de acarreo principal',
    'Sobrecalentamiento de frenos húmedos en descenso cargado',
    'Desprendimiento menor de talud en banco 4250',
    'Cortocircuito en subestación móvil de pala eléctrica',
    'Cuasi-accidente en maniobra de estacionamiento de camión minero',
    'Exposición a vibración excesiva en perforadora rotativa',
    'Falla de sensor de proximidad y anticolisión en turno noche',
    'Derrame controlado de reactivo en planta concentradora',
  ];

  const incidentes = [];
  for (let i = 1; i <= 24; i++) {
    const maq = maquinarias[(i * 2) % maquinarias.length];
    const mesObj = meses[(i - 1) % meses.length];
    const severidad =
      i % 9 === 0
        ? 'Crítico'
        : i % 4 === 0
        ? 'Grave'
        : i % 2 === 0
        ? 'Moderado'
        : 'Leve';
    const estado =
      i <= 15
        ? 'Cerrado'
        : i <= 20
        ? 'Acción Correctiva'
        : 'En Investigación';
    const diasPerdidos =
      severidad === 'Crítico'
        ? randInt(5, 14)
        : severidad === 'Grave'
        ? randInt(2, 5)
        : severidad === 'Moderado'
        ? randInt(0, 2)
        : 0;

    incidentes.push({
      id: `INC-${String(i).padStart(3, '0')}`,
      fecha: `${mesObj.codigo}-${String(randInt(2, 27)).padStart(2, '0')}`,
      mes: mesObj.codigo,
      titulo: titulosInc[(i - 1) % titulosInc.length],
      tipo: tiposInc[(i - 1) % tiposInc.length],
      severidad,
      area: maq.ubicacion,
      maquinariaId: maq.id,
      maquinariaNombre: maq.nombre,
      diasPerdidos,
      trabajadoresAfectados: severidad === 'Crítico' || severidad === 'Grave' ? randInt(1, 3) : randInt(0, 1),
      estado,
      responsable: tecnicos[(i + 1) % tecnicos.length],
      medidaCorrectiva:
        severidad === 'Crítico' || severidad === 'Grave'
          ? 'Bloqueo LOTOTO inmediato, auditoría IPERC y reentrenamiento obligatorio de cuadrilla.'
          : 'Revisión de procedimiento escrito de trabajo seguro (PETS) y charla de 5 minutos.',
    });
  }

  return { produccion, maquinarias, mantenimientos, incidentes };
}

// ============================================================================
// 2. GENERATE FINANZAS DATA (finanzas.json)
// ============================================================================
function generateFinanzas() {
  const nombresEmpresas = [
    'Agroindustrias del Norte SAC', 'Textiles Andinos EIRL', 'Constructora Pacífico Sur SAA',
    'Transportes Rápidos Huancayo SAC', 'Comercializadora Santa Rosa SRL', 'Importaciones Lima Global SAC',
    'Minera Aurífera San Juan SAC', 'Pesquera Mar Brava SAC', 'Distribuidora Farmacéutica Salud SAC',
    'Servicios Logísticos Callao SAC', 'Inversiones Gastronómicas Perú SAC', 'MetalMecánica Arequipa EIRL',
    'Agroexportadora Valle Verde SAC', 'Tecnología y Redes Andinas SAC', 'Plásticos Industriales Ate SAC',
    'Panificadora San Martín SRL', 'Clínica Dental Sonrisa SAC', 'Ferretería Mayorista El Sol EIRL',
    'Hotelera Cusco Imperial SAC', 'Almacenes Generales Trujillo SAC'
  ];
  const nombresPersonas = [
    'Juan Carlos Gómez', 'María Fernanda Rodríguez', 'Luis Alberto Díaz', 'Ana Lucía Torres',
    'Pedro Pablo Sánchez', 'Carmen Rosa Flores', 'Jorge Luis Chávez', 'Patricia Elena Mendoza',
    'Ricardo Javier Morales', 'Silvia Beatriz Castillo', 'Fernando José Romero', 'Gabriela Rocío Vargas',
    'Roberto Carlos Silva', 'Claudia Marcela Reyes', 'Miguel Ángel Cruz', 'Verónica Paola Ortiz',
    'Alejandro David Ramos', 'Diana Carolina Medina', 'Héctor Manuel Castro', 'Natalia Sofía Ruiz'
  ];
  const ciudades = ['Lima', 'Arequipa', 'Trujillo', 'Piura', 'Cusco', 'Chiclayo', 'Huancayo', 'Ica', 'Tacna', 'Pucallpa'];
  const segmentos = ['Corporativo', 'PYME', 'Microempresa', 'Consumo Preferente', 'Consumo Masivo'];
  const sectores = ['Comercio', 'Manufactura', 'Servicios', 'Construcción', 'Agroindustria', 'Transporte'];

  // 105 Clientes (min required: 100)
  const clientes = [];
  for (let i = 1; i <= 105; i++) {
    const esEmpresa = i <= 45;
    const segmento = esEmpresa
      ? i <= 15
        ? 'Corporativo'
        : i <= 35
        ? 'PYME'
        : 'Microempresa'
      : i <= 75
      ? 'Consumo Preferente'
      : 'Consumo Masivo';

    const baseNombre = esEmpresa
      ? `${nombresEmpresas[(i - 1) % nombresEmpresas.length]} ${i > 20 ? `Filial ${i}` : ''}`.trim()
      : `${nombresPersonas[(i - 1) % nombresPersonas.length]} (${i})`;

    const tipoDocumento = esEmpresa ? 'RUC' : 'DNI';
    const documento = esEmpresa
      ? `20${String(450000000 + i * 1379).slice(0, 9)}`
      : `${String(40000000 + i * 2413).slice(0, 8)}`;

    const ingresosMensualesPEN =
      segmento === 'Corporativo'
        ? randInt(180000, 650000)
        : segmento === 'PYME'
        ? randInt(45000, 160000)
        : segmento === 'Microempresa'
        ? randInt(12000, 42000)
        : segmento === 'Consumo Preferente'
        ? randInt(8500, 25000)
        : randInt(3200, 8200);

    // Distribute risk realistically
    const scoreCrediticio =
      i % 11 === 0
        ? randInt(360, 490)
        : i % 5 === 0
        ? randInt(500, 610)
        : i % 3 === 0
        ? randInt(620, 710)
        : randInt(720, 845);

    const nivelRiesgo =
      scoreCrediticio < 500
        ? 'Crítico'
        : scoreCrediticio < 615
        ? 'Alto'
        : scoreCrediticio < 715
        ? 'Moderado'
        : 'Bajo';

    const estado =
      nivelRiesgo === 'Crítico'
        ? 'Bloqueado'
        : nivelRiesgo === 'Alto'
        ? 'Observado'
        : 'Activo';

    clientes.push({
      id: `CLI-${String(i).padStart(3, '0')}`,
      documento,
      tipoDocumento,
      nombre: baseNombre,
      segmento,
      sectorEconomico: sectores[(i - 1) % sectores.length],
      ciudad: ciudades[(i - 1) % ciudades.length],
      ingresosMensualesPEN,
      scoreCrediticio,
      nivelRiesgo,
      telefono: `9${String(10000000 + i * 75312).slice(0, 8)}`,
      email: `contacto.cli${i}@empresarial.pe`,
      fechaRegistro: `2025-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
      estado,
    });
  }

  // 155 Créditos (min required: 150) + Cronogramas de Cuotas y Pagos
  const productos = [
    'Capital de Trabajo',
    'Activo Fijo',
    'Leasing Empresarial',
    'Hipotecario Comercial',
    'Consumo Personal',
  ];

  const creditos = [];
  const cuotas = [];
  const pagos = [];
  let cuotaCounter = 1;
  let pagoCounter = 1;

  for (let i = 1; i <= 155; i++) {
    const cli = clientes[(i - 1) % clientes.length];
    const mesObj = meses[(i - 1) % meses.length];
    const producto =
      cli.tipoDocumento === 'RUC'
        ? productos[(i - 1) % 3]
        : productos[3 + (i % 2)];

    const montoDesembolsadoPEN =
      cli.segmento === 'Corporativo'
        ? randInt(120000, 480000)
        : cli.segmento === 'PYME'
        ? randInt(40000, 140000)
        : cli.segmento === 'Microempresa'
        ? randInt(12000, 38000)
        : randInt(8000, 45000);

    const tasaAnualPct =
      cli.segmento === 'Corporativo'
        ? randFloat(8.5, 13.5, 1)
        : cli.segmento === 'PYME'
        ? randFloat(14.0, 22.5, 1)
        : randFloat(18.0, 32.0, 1);

    const plazoMeses = pick([12, 18, 24, 36]);
    const cuotasTotales = 4; // 4 representative quarterly/tranche installments tracked per credit in schedule (620 total cuotas!)

    // Determine credit delinquency status correlated with client risk
    const isDefault = cli.nivelRiesgo === 'Crítico' || (cli.nivelRiesgo === 'Alto' && i % 2 === 0);
    const isCompleted = !isDefault && i <= 18;

    let cuotasPagadas = 0;
    let cuotasVencidas = 0;
    let maxDiasMora = 0;
    let montoRecuperadoPEN = 0;

    const creditoId = `CRD-${String(i).padStart(3, '0')}`;
    const capitalPorCuota = Math.round(montoDesembolsadoPEN / cuotasTotales);
    const interesPorCuota = Math.round((montoDesembolsadoPEN * (tasaAnualPct / 100)) / cuotasTotales);

    for (let c = 1; c <= cuotasTotales; c++) {
      const cuotaId = `CUO-${String(cuotaCounter++).padStart(4, '0')}`;
      let estadoCuota = 'Pendiente';
      let diasMora = 0;
      let montoMoraPEN = 0;
      let montoPagadoPEN = 0;
      let fechaPago = null;

      const mesVenc = Math.min(12, ((i + c * 2 - 1) % 12) + 1);
      const fechaVencimiento = `2026-${String(mesVenc).padStart(2, '0')}-20`;

      if (isCompleted || c <= 2) {
        if (isDefault && c === 2) {
          estadoCuota = 'Vencida';
          diasMora = cli.nivelRiesgo === 'Crítico' ? randInt(65, 135) : randInt(22, 60);
          montoMoraPEN = Math.round(capitalPorCuota * 0.04);
          cuotasVencidas++;
          if (diasMora > maxDiasMora) maxDiasMora = diasMora;
        } else {
          estadoCuota = 'Pagada';
          montoPagadoPEN = capitalPorCuota + interesPorCuota;
          montoRecuperadoPEN += capitalPorCuota;
          cuotasPagadas++;
          fechaPago = `2026-${String(mesVenc).padStart(2, '0')}-${String(randInt(10, 19)).padStart(2, '0')}`;

          // Register payment record for the first 280 paid installments
          if (pagoCounter <= 285) {
            pagos.push({
              id: `PAG-${String(pagoCounter++).padStart(4, '0')}`,
              creditoId,
              cuotaId,
              clienteId: cli.id,
              clienteNombre: cli.nombre,
              fechaPago,
              mesPago: `2026-${String(mesVenc).padStart(2, '0')}`,
              montoPEN: montoPagadoPEN,
              metodoPago: pick([
                'Transferencia Bancaria',
                'Débito Automático',
                'Ventanilla',
                'Billetera Digital',
              ]),
              referencia: `OP-${20260000 + pagoCounter}`,
              estado: 'Confirmado',
            });
          }
        }
      } else if (c === 3 && isDefault) {
        estadoCuota = 'Vencida';
        diasMora = randInt(15, 45);
        montoMoraPEN = Math.round(capitalPorCuota * 0.025);
        cuotasVencidas++;
        if (diasMora > maxDiasMora) maxDiasMora = diasMora;
      }

      const montoTotalPEN = capitalPorCuota + interesPorCuota + montoMoraPEN;

      cuotas.push({
        id: cuotaId,
        creditoId,
        clienteId: cli.id,
        clienteNombre: cli.nombre,
        numeroCuota: c,
        fechaVencimiento,
        montoCapitalPEN: capitalPorCuota,
        montoInteresPEN: interesPorCuota,
        montoMoraPEN,
        montoTotalPEN,
        montoPagadoPEN,
        diasMora,
        estado: estadoCuota,
        fechaPago,
      });
    }

    const saldoCapitalPEN = Math.max(0, montoDesembolsadoPEN - montoRecuperadoPEN);
    const estadoCredito = isCompleted
      ? 'Cancelado'
      : maxDiasMora > 90
      ? 'En Cobranza Judicial'
      : cuotasVencidas > 0
      ? 'Vencido'
      : 'Vigente';

    const nivelRiesgoCredito =
      maxDiasMora > 60
        ? 'Crítico'
        : maxDiasMora > 15
        ? 'Alto'
        : cli.nivelRiesgo === 'Moderado'
        ? 'Moderado'
        : 'Bajo';

    creditos.push({
      id: creditoId,
      clienteId: cli.id,
      clienteNombre: cli.nombre,
      clienteDocumento: cli.documento,
      segmento: cli.segmento,
      producto,
      montoDesembolsadoPEN,
      saldoCapitalPEN,
      montoRecuperadoPEN,
      tasaAnualPct,
      plazoMeses,
      cuotasTotales,
      cuotasPagadas,
      cuotasVencidas,
      diasMora: maxDiasMora,
      fechaDesembolso: `${mesObj.codigo}-${String(randInt(2, 25)).padStart(2, '0')}`,
      mesDesembolso: mesObj.codigo,
      mesNombre: mesObj.nombre,
      estado: estadoCredito,
      nivelRiesgo: nivelRiesgoCredito,
    });
  }

  return { clientes, creditos, cuotas, pagos };
}

// ============================================================================
// 3. GENERATE LOGISTICA DATA (logistica.json)
// ============================================================================
function generateLogistica() {
  // 18 Vehículos (min required: 15)
  const tiposVeh = [
    { tipo: 'Tracto Camión 30T', marca: 'Volvo', modelo: 'FH16 600', cap: 30 },
    { tipo: 'Tracto Camión 30T', marca: 'Scania', modelo: 'R500', cap: 30 },
    { tipo: 'Camión Furgón 15T', marca: 'Mercedes-Benz', modelo: 'Actros 2645', cap: 15 },
    { tipo: 'Camión Refrigerado 10T', marca: 'Hino', modelo: 'FM 280', cap: 10 },
    { tipo: 'Plataforma Pesada 25T', marca: 'Freightliner', modelo: 'Cascadia 126', cap: 25 },
    { tipo: 'Furgoneta Reparto 3.5T', marca: 'Hyundai', modelo: 'HD78', cap: 3.5 },
  ];
  const ciudadesBase = ['Lima - Callao', 'Arequipa', 'Trujillo', 'Piura', 'Cusco', 'Huancayo'];

  const vehiculos = [];
  const letrasPlaca = ['A', 'B', 'C', 'D', 'F', 'T', 'V', 'W'];
  for (let i = 1; i <= 18; i++) {
    const spec = tiposVeh[(i - 1) % tiposVeh.length];
    const placa = `${letrasPlaca[i % letrasPlaca.length]}${letrasPlaca[(i + 3) % letrasPlaca.length]}${
      (i % 9) + 1
    }-${String(700 + i * 11).slice(0, 3)}`;
    const estado =
      i === 6 || i === 14
        ? 'En Mantenimiento'
        : i === 18
        ? 'Fuera de Servicio'
        : i % 2 === 0
        ? 'En Ruta'
        : 'Disponible';

    vehiculos.push({
      id: `VEH-${String(i).padStart(3, '0')}`,
      placa,
      tipo: spec.tipo,
      marca: spec.marca,
      modelo: spec.modelo,
      anio: 2021 + (i % 5),
      capacidadToneladas: spec.cap,
      kilometraje: randInt(42000, 215000),
      consumoKmGalon: randFloat(7.5, 16.5, 1),
      estado,
      ubicacionActual: ciudadesBase[(i - 1) % ciudadesBase.length],
      ultimoMantenimiento: `2026-${String(randInt(7, 10)).padStart(2, '0')}-${String(randInt(3, 27)).padStart(2, '0')}`,
    });
  }

  // 22 Conductores (min required: 20)
  const nombresCond = [
    'Marco Antonio Quispe', 'César Augusto Mamani', 'Víctor Raúl Huamani', 'Rubén Darío Condori',
    'Óscar Eduardo Rojas', 'Edgar Iván Salazar', 'Hugo Alberto Gutiérrez', 'Walter Enrique Flores',
    'Julio César Espinoza', 'Néstor Fabián Aguilar', 'Raúl Alfonso Delgado', 'Sergio Daniel Vega',
    'Arturo José Campos', 'Wilfredo Tomás León', 'Germán Patricio Reyes', 'Cristian Paúl Carrillo',
    'Mario Esteban Navarro', 'Segundo Manuel Pineda', 'Félix Orlando Benites', 'Percy Rolando Acosta',
    'Renato Alonso Valdivia', 'Gustavo Adolfo Ponce'
  ];

  const conductores = [];
  for (let i = 1; i <= 22; i++) {
    const veh = vehiculos[(i - 1) % vehiculos.length];
    const dni = `${String(41000000 + i * 3197).slice(0, 8)}`;
    const estado =
      i === 20
        ? 'Suspendido'
        : i % 5 === 0
        ? 'Descanso'
        : i % 2 === 0
        ? 'En Ruta'
        : 'Activo';

    conductores.push({
      id: `CON-${String(i).padStart(3, '0')}`,
      nombre: nombresCond[i - 1],
      dni,
      licencia: `Q${dni}`,
      categoriaLicencia: 'A-IIIc Profesional',
      telefono: `9${String(20000000 + i * 48913).slice(0, 8)}`,
      vehiculoAsignadoId: veh.id,
      entregasCompletadas: 0, // Calculated from pedidos below
      entregasRetrasadas: 0,
      cumplimientoPct: 100,
      tiempoPromedioHoras: 0,
      calificacion: randFloat(3.8, 4.9, 1),
      estado,
    });
  }

  // 26 Rutas (min required: 25)
  const definicionRutas = [
    { nombre: 'Lima - Arequipa (Panamericana Sur)', origen: 'Lima', destino: 'Arequipa', corredor: 'Costa Sur', km: 1015, hrs: 18 },
    { nombre: 'Lima - Trujillo (Panamericana Norte)', origen: 'Lima', destino: 'Trujillo', corredor: 'Costa Norte', km: 560, hrs: 10 },
    { nombre: 'Lima - Piura (Corredor Norte)', origen: 'Lima', destino: 'Piura', corredor: 'Costa Norte', km: 985, hrs: 17 },
    { nombre: 'Lima - Huancayo (Carretera Central)', origen: 'Lima', destino: 'Huancayo', corredor: 'Sierra Central', km: 305, hrs: 8.5 },
    { nombre: 'Arequipa - Cusco (Vía Juliaca)', origen: 'Arequipa', destino: 'Cusco', corredor: 'Sur Andino', km: 510, hrs: 10.5 },
    { nombre: 'Lima - Chiclayo (Panamericana Norte)', origen: 'Lima', destino: 'Chiclayo', corredor: 'Costa Norte', km: 770, hrs: 13.5 },
    { nombre: 'Lima - Ica (Autopista Sur)', origen: 'Lima', destino: 'Ica', corredor: 'Costa Sur', km: 305, hrs: 4.5 },
    { nombre: 'Callao - Centro Distribución Lurín', origen: 'Callao', destino: 'Lurín', corredor: 'Lima Metropolitana', km: 48, hrs: 2.2 },
    { nombre: 'Callao - Huachipa Hub Industrial', origen: 'Callao', destino: 'Huachipa', corredor: 'Lima Metropolitana', km: 35, hrs: 1.8 },
    { nombre: 'Arequipa - Tacna (Frontera Sur)', origen: 'Arequipa', destino: 'Tacna', corredor: 'Costa Sur', km: 370, hrs: 6.5 },
    { nombre: 'Trujillo - Cajamarca (Sierra Norte)', origen: 'Trujillo', destino: 'Cajamarca', corredor: 'Costa Norte', km: 300, hrs: 7.5 },
    { nombre: 'Lima - Pucallpa (Federico Basadre)', origen: 'Lima', destino: 'Pucallpa', corredor: 'Oriente', km: 745, hrs: 19 },
    { nombre: 'Lima - Ayacucho (Vía Libertadores)', origen: 'Lima', destino: 'Ayacucho', corredor: 'Sierra Central', km: 575, hrs: 11.5 },
    { nombre: 'Cusco - Puerto Maldonado (Interoceánica)', origen: 'Cusco', destino: 'Puerto Maldonado', corredor: 'Sur Andino', km: 480, hrs: 9.5 },
    { nombre: 'Piura - Tumbes (Eje Fronterizo)', origen: 'Piura', destino: 'Tumbes', corredor: 'Costa Norte', km: 285, hrs: 5.0 },
    { nombre: 'Lima - Chimbote (Costa Central)', origen: 'Lima', destino: 'Chimbote', corredor: 'Costa Norte', km: 430, hrs: 7.5 },
    { nombre: 'Huancayo - Huánuco (Sierra Central)', origen: 'Huancayo', destino: 'Huánuco', corredor: 'Sierra Central', km: 245, hrs: 6.5 },
    { nombre: 'Arequipa - Moquegua (Corredor Minero)', origen: 'Arequipa', destino: 'Moquegua', corredor: 'Sur Andino', km: 220, hrs: 4.0 },
    { nombre: 'Lima - Huaraz (Callejón de Huaylas)', origen: 'Lima', destino: 'Huaraz', corredor: 'Sierra Central', km: 405, hrs: 8.0 },
    { nombre: 'Chiclayo - Tarapoto (Fernando Belaunde)', origen: 'Chiclayo', destino: 'Tarapoto', corredor: 'Oriente', km: 625, hrs: 14.0 },
    { nombre: 'Lima - Chincha (Sur Chico)', origen: 'Lima', destino: 'Chincha', corredor: 'Costa Sur', km: 200, hrs: 3.2 },
    { nombre: 'Cusco - Espinar (Corredor Minero Sur)', origen: 'Cusco', destino: 'Espinar', corredor: 'Sur Andino', km: 240, hrs: 5.5 },
    { nombre: 'Lima - Cerro de Pasco (Ruta Minera)', origen: 'Lima', destino: 'Cerro de Pasco', corredor: 'Sierra Central', km: 295, hrs: 8.0 },
    { nombre: 'Trujillo - Piura (Interconexión Norte)', origen: 'Trujillo', destino: 'Piura', corredor: 'Costa Norte', km: 425, hrs: 7.0 },
    { nombre: 'Arequipa - Puno (Altiplano)', origen: 'Arequipa', destino: 'Puno', corredor: 'Sur Andino', km: 295, hrs: 6.0 },
    { nombre: 'Callao - Ventanilla Zona Logística', origen: 'Callao', destino: 'Ventanilla', corredor: 'Lima Metropolitana', km: 22, hrs: 1.2 },
  ];

  const rutas = definicionRutas.map((r, idx) => {
    const num = idx + 1;
    const isCongested = num === 4 || num === 12 || num === 22;
    return {
      id: `RUT-${String(num).padStart(3, '0')}`,
      codigo: `RT-${r.corredor.slice(0, 3).toUpperCase()}-${String(num).padStart(2, '0')}`,
      nombre: r.nombre,
      origen: r.origen,
      destino: r.destino,
      corredor: r.corredor,
      distanciaKm: r.km,
      tiempoEstimadoHoras: r.hrs,
      tiempoPromedioRealHoras: r.hrs,
      peajesPEN: Math.round(r.km * 0.45),
      costoBasePEN: Math.round(r.km * 4.2 + 350),
      totalViajes: 0,
      viajesRetrasados: 0,
      cumplimientoPct: 100,
      nivelRiesgoRuta: isCongested ? 'Alto' : r.corredor === 'Sierra Central' || r.corredor === 'Oriente' ? 'Medio' : 'Bajo',
      estado: isCongested ? 'Congestionada' : 'Activa',
    };
  });

  // 210 Pedidos (min required: 200)
  const clientesLogistica = [
    'Alicorp SAA', 'Gloria SA', 'Backus & Johnston', 'Ferreyros SAA', 'Supermercados Peruanos SA',
    'Cencosud Retail Perú', 'Sodimac Perú SA', 'Aceros Arequipa Corporación', 'Cementos Pacasmayo SAA',
    'Química Suiza SA', 'InRetail Pharma', 'San Fernando SA', 'Ransa Comercial', 'Unacem SAA', 'Minsur SA'
  ];

  const pedidos = [];
  for (let i = 1; i <= 210; i++) {
    const ruta = rutas[(i - 1) % rutas.length];
    const veh = vehiculos[(i - 1) % vehiculos.length];
    const cond = conductores[(i - 1) % conductores.length];
    const cliente = clientesLogistica[(i - 1) % clientesLogistica.length];

    // Spread dates across the last 30 days of Oct/Nov 2026 so daily charts have rich points
    const dayIndex = (i % 15) + 1;
    const fechaPedido = `2026-11-${String(dayIndex).padStart(2, '0')}`;
    const fechaEntregaEstimada = `2026-11-${String(Math.min(30, dayIndex + 1)).padStart(2, '0')}`;

    const isProblemRoute = ruta.estado === 'Congestionada';
    const isProblemDriver = cond.id === 'CON-004' || cond.id === 'CON-011' || cond.id === 'CON-020';

    let estado = 'Entregado';
    if (i > 188) {
      estado = i % 2 === 0 ? 'En Tránsito' : 'Pendiente';
    } else if ((isProblemRoute && i % 2 === 0) || (isProblemDriver && i % 2 === 0) || i % 7 === 0) {
      estado = i > 175 ? 'Retrasado' : 'Entregado';
    }

    const delayed =
      estado === 'Retrasado' ||
      (estado === 'Entregado' && ((isProblemRoute && i % 2 === 0) || (isProblemDriver && i % 2 === 0) || i % 6 === 0));

    const horasRetraso = delayed ? randFloat(1.5, 6.8, 1) : 0;
    const tiempoRealHoras = Number(
      (ruta.tiempoEstimadoHoras + (delayed ? horasRetraso : randFloat(-0.8, 0.3, 1))).toFixed(1)
    );
    const entregadoATiempo = !delayed;

    // If still delayed in transit, mark state as Retrasado so KPIs show active delayed orders too
    if (delayed && i > 165 && estado === 'Entregado') {
      estado = 'Retrasado';
    }

    const pesoToneladas = Number(Math.min(veh.capacidadToneladas, randFloat(2.0, veh.capacidadToneladas * 0.95, 1)).toFixed(1));
    const costoEnvioPEN = Math.round(ruta.costoBasePEN + pesoToneladas * 85);

    pedidos.push({
      id: `PED-${String(i).padStart(4, '0')}`,
      codigoGuia: `GR-001-${String(80000 + i)}`,
      cliente,
      origen: ruta.origen,
      destino: ruta.destino,
      rutaId: ruta.id,
      rutaNombre: ruta.nombre,
      vehiculoId: veh.id,
      vehiculoPlaca: veh.placa,
      conductorId: cond.id,
      conductorNombre: cond.nombre,
      fechaPedido,
      fechaEntregaEstimada,
      fechaEntregaReal: estado === 'Entregado' || estado === 'Retrasado' ? fechaEntregaEstimada : null,
      tiempoEstimadoHoras: ruta.tiempoEstimadoHoras,
      tiempoRealHoras,
      pesoToneladas,
      costoEnvioPEN,
      prioridad: i % 8 === 0 ? 'Crítica' : i % 3 === 0 ? 'Express' : 'Normal',
      estado,
      entregadoATiempo,
      horasRetraso,
      observaciones: delayed
        ? isProblemRoute
          ? 'Congestión severa y control vial en corredor.'
          : 'Demora en ventana de recepción de almacén destino.'
        : 'Entrega conforme según guía de remisión.',
    });
  }

  // Update aggregated metrics on conductores and rutas for consistency
  for (const cond of conductores) {
    const misPedidos = pedidos.filter((p) => p.conductorId === cond.id);
    const completados = misPedidos.filter((p) => p.estado === 'Entregado' || p.estado === 'Retrasado');
    const retrasados = completados.filter((p) => !p.entregadoATiempo || p.estado === 'Retrasado');
    cond.entregasCompletadas = completados.length;
    cond.entregasRetrasadas = retrasados.length;
    cond.cumplimientoPct =
      completados.length > 0
        ? Number((((completados.length - retrasados.length) / completados.length) * 100).toFixed(1))
        : 100;
    const avgTime =
      completados.length > 0
        ? completados.reduce((acc, p) => acc + p.tiempoRealHoras, 0) / completados.length
        : 0;
    cond.tiempoPromedioHoras = Number(avgTime.toFixed(1));
  }

  for (const ruta of rutas) {
    const misPedidos = pedidos.filter((p) => p.rutaId === ruta.id);
    const evaluables = misPedidos.filter((p) => p.estado === 'Entregado' || p.estado === 'Retrasado');
    const retrasados = evaluables.filter((p) => !p.entregadoATiempo || p.estado === 'Retrasado');
    ruta.totalViajes = misPedidos.length;
    ruta.viajesRetrasados = retrasados.length;
    ruta.cumplimientoPct =
      evaluables.length > 0
        ? Number((((evaluables.length - retrasados.length) / evaluables.length) * 100).toFixed(1))
        : 100;
    const avgReal =
      evaluables.length > 0
        ? evaluables.reduce((acc, p) => acc + p.tiempoRealHoras, 0) / evaluables.length
        : ruta.tiempoEstimadoHoras;
    ruta.tiempoPromedioRealHoras = Number(avgReal.toFixed(1));
  }

  return { pedidos, vehiculos, conductores, rutas };
}

const mineriaData = generateMineria();
const finanzasData = generateFinanzas();
const logisticaData = generateLogistica();

fs.writeFileSync(path.join(dataDir, 'mineria.json'), JSON.stringify(mineriaData, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'finanzas.json'), JSON.stringify(finanzasData, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'logistica.json'), JSON.stringify(logisticaData, null, 2), 'utf8');

console.log('Datos generados exitosamente en:', dataDir);
console.log('Minería:', {
  produccion: mineriaData.produccion.length,
  maquinarias: mineriaData.maquinarias.length,
  mantenimientos: mineriaData.mantenimientos.length,
  incidentes: mineriaData.incidentes.length,
});
console.log('Finanzas:', {
  clientes: finanzasData.clientes.length,
  creditos: finanzasData.creditos.length,
  cuotas: finanzasData.cuotas.length,
  pagos: finanzasData.pagos.length,
});
console.log('Logística:', {
  pedidos: logisticaData.pedidos.length,
  vehiculos: logisticaData.vehiculos.length,
  conductores: logisticaData.conductores.length,
  rutas: logisticaData.rutas.length,
});
