export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RecomendacionItem {
  id: string;
  nivel: 'Crítico' | 'Alerta' | 'Optimización';
  categoria: string;
  titulo: string;
  descripcion: string;
  accionSugerida: string;
  indicadorRelacionado: string;
}

// ==================== MINERIA ====================
export interface RegistroProduccion {
  id: string;
  mes: string;
  mesNombre: string;
  fecha: string;
  unidadMinera: string;
  mineral: string;
  turno: 'Día' | 'Noche';
  toneladasExtraidas: number;
  toneladasObjetivo: number;
  leyMineralPct: number;
  horasOperacion: number;
  eficienciaPct: number;
  estado: 'Cumplido' | 'En Riesgo' | 'Bajo Objetivo';
  observaciones: string;
}

export interface Maquinaria {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  marca: string;
  modelo: string;
  ubicacion: string;
  estado: 'Operativa' | 'En Mantenimiento' | 'Inoperativa' | 'En Revisión';
  horasOperadasMes: number;
  horasInactividadMes: number;
  disponibilidadPct: number;
  eficienciaOperacionalPct: number;
  ultimoMantenimiento: string;
  proximoMantenimiento: string;
  consumoCombustibleGalHora: number;
}

export interface Mantenimiento {
  id: string;
  maquinariaId: string;
  maquinariaNombre: string;
  tipo: 'Preventivo' | 'Correctivo' | 'Predictivo';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  fechaProgramada: string;
  fechaEjecucion: string | null;
  duracionHoras: number;
  costoPEN: number;
  tecnicoResponsable: string;
  estado: 'Completado' | 'En Proceso' | 'Programado' | 'Vencido';
  descripcion: string;
}

export interface IncidenteSeguridad {
  id: string;
  fecha: string;
  mes: string;
  titulo: string;
  tipo: 'Mecánico' | 'Operacional' | 'Seguridad Personal' | 'Ambiental' | 'Eléctrico';
  severidad: 'Leve' | 'Moderado' | 'Grave' | 'Crítico';
  area: string;
  maquinariaId: string;
  maquinariaNombre: string;
  diasPerdidos: number;
  trabajadoresAfectados: number;
  estado: 'Cerrado' | 'En Investigación' | 'Acción Correctiva';
  responsable: string;
  medidaCorrectiva: string;
}

export interface MineriaKpis {
  produccionTotalToneladas: number;
  objetivoTotalToneladas: number;
  cumplimientoProduccionPct: number;
  disponibilidadMaquinariaPct: number;
  horasInactividadTotal: number;
  incidentesRegistrados: number;
  incidentesCriticosGraves: number;
  eficienciaOperacionalPct: number;
  costoMantenimientoTotalPEN: number;
  maquinariasOperativas: number;
  totalMaquinarias: number;
}

export interface MineriaDashboardData {
  kpis: MineriaKpis;
  graficos: {
    produccionMensual: {
      mes: string;
      mesNombre: string;
      real: number;
      objetivo: number;
      cumplimientoPct: number;
    }[];
    produccionRealVsObjetivo: {
      mes: string;
      mesNombre: string;
      real: number;
      objetivo: number;
      cumplimientoPct: number;
    }[];
    disponibilidadPorMaquinaria: {
      id: string;
      codigo: string;
      nombre: string;
      disponibilidadPct: number;
      eficienciaPct: number;
      horasInactividad: number;
      estado: string;
    }[];
    distribucionIncidentes: {
      severidad: string;
      cantidad: number;
      diasPerdidos: number;
    }[];
    incidentesPorTipo: {
      tipo: string;
      cantidad: number;
    }[];
    produccionPorMineral: {
      mineral: string;
      real: number;
      objetivo: number;
    }[];
  };
  recomendaciones: RecomendacionItem[];
}

// ==================== FINANZAS ====================
export interface ClienteFinanciero {
  id: string;
  documento: string;
  tipoDocumento: 'DNI' | 'RUC';
  nombre: string;
  segmento: 'Corporativo' | 'PYME' | 'Microempresa' | 'Consumo Preferente' | 'Consumo Masivo';
  sectorEconomico: string;
  ciudad: string;
  ingresosMensualesPEN: number;
  scoreCrediticio: number;
  nivelRiesgo: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';
  telefono: string;
  email: string;
  fechaRegistro: string;
  estado: 'Activo' | 'Observado' | 'Bloqueado';
}

export interface CreditoFinanciero {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteDocumento: string;
  segmento: string;
  producto: string;
  montoDesembolsadoPEN: number;
  saldoCapitalPEN: number;
  montoRecuperadoPEN: number;
  tasaAnualPct: number;
  plazoMeses: number;
  cuotasTotales: number;
  cuotasPagadas: number;
  cuotasVencidas: number;
  diasMora: number;
  fechaDesembolso: string;
  mesDesembolso: string;
  mesNombre: string;
  estado: 'Vigente' | 'Vencido' | 'En Cobranza Judicial' | 'Cancelado';
  nivelRiesgo: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';
}

export interface CuotaCredito {
  id: string;
  creditoId: string;
  clienteId: string;
  clienteNombre: string;
  numeroCuota: number;
  fechaVencimiento: string;
  montoCapitalPEN: number;
  montoInteresPEN: number;
  montoMoraPEN: number;
  montoTotalPEN: number;
  montoPagadoPEN: number;
  diasMora: number;
  estado: 'Pagada' | 'Pendiente' | 'Vencida' | 'Parcial';
  fechaPago: string | null;
}

export interface PagoCredito {
  id: string;
  creditoId: string;
  cuotaId: string;
  clienteId: string;
  clienteNombre: string;
  fechaPago: string;
  mesPago: string;
  montoPEN: number;
  metodoPago: string;
  referencia: string;
  estado: 'Confirmado' | 'En Validación';
}

export interface FinanzasKpis {
  carteraTotalPEN: number;
  creditosActivos: number;
  totalCreditos: number;
  montoDesembolsadoPEN: number;
  indiceMorosidadPct: number;
  carteraVencidaPEN: number;
  carteraVigentePEN: number;
  creditosVencidos: number;
  recuperacionCarteraPct: number;
  montoRecuperadoPEN: number;
  totalClientes: number;
}

export interface FinanzasDashboardData {
  kpis: FinanzasKpis;
  graficos: {
    evolucionColocaciones: {
      mes: string;
      mesNombre: string;
      colocacionesPEN: number;
      carteraVigentePEN: number;
      carteraVencidaPEN: number;
      morosidadPct: number;
      cantidadCreditos: number;
    }[];
    carteraVigenteVsVencida: {
      segmento: string;
      vigentePEN: number;
      vencidaPEN: number;
      totalPEN: number;
    }[];
    morosidadMensual: {
      mes: string;
      mesNombre: string;
      morosidadPct: number;
      carteraVencidaPEN: number;
    }[];
    distribucionRiesgo: {
      nivel: string;
      cantidadCreditos: number;
      cantidadClientes: number;
      saldoCarteraPEN: number;
    }[];
    tramosMora: {
      tramo: string;
      cantidadCreditos: number;
      saldoPEN: number;
    }[];
  };
  recomendaciones: RecomendacionItem[];
}

// ==================== LOGISTICA ====================
export interface VehiculoLogistica {
  id: string;
  placa: string;
  tipo: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidadToneladas: number;
  kilometraje: number;
  consumoKmGalon: number;
  estado: 'En Ruta' | 'Disponible' | 'En Mantenimiento' | 'Fuera de Servicio';
  ubicacionActual: string;
  ultimoMantenimiento: string;
}

export interface ConductorLogistica {
  id: string;
  nombre: string;
  dni: string;
  licencia: string;
  categoriaLicencia: string;
  telefono: string;
  vehiculoAsignadoId: string;
  entregasCompletadas: number;
  entregasRetrasadas: number;
  cumplimientoPct: number;
  tiempoPromedioHoras: number;
  calificacion: number;
  estado: 'Activo' | 'En Ruta' | 'Descanso' | 'Suspendido';
}

export interface RutaLogistica {
  id: string;
  codigo: string;
  nombre: string;
  origen: string;
  destino: string;
  corredor: string;
  distanciaKm: number;
  tiempoEstimadoHoras: number;
  tiempoPromedioRealHoras: number;
  peajesPEN: number;
  costoBasePEN: number;
  totalViajes: number;
  viajesRetrasados: number;
  cumplimientoPct: number;
  nivelRiesgoRuta: 'Bajo' | 'Medio' | 'Alto';
  estado: 'Activa' | 'Congestionada' | 'Restringida';
}

export interface PedidoLogistica {
  id: string;
  codigoGuia: string;
  cliente: string;
  origen: string;
  destino: string;
  rutaId: string;
  rutaNombre: string;
  vehiculoId: string;
  vehiculoPlaca: string;
  conductorId: string;
  conductorNombre: string;
  fechaPedido: string;
  fechaEntregaEstimada: string;
  fechaEntregaReal: string | null;
  tiempoEstimadoHoras: number;
  tiempoRealHoras: number;
  pesoToneladas: number;
  costoEnvioPEN: number;
  prioridad: 'Normal' | 'Express' | 'Crítica';
  estado: 'Entregado' | 'En Tránsito' | 'Pendiente' | 'Retrasado';
  entregadoATiempo: boolean;
  horasRetraso: number;
  observaciones: string;
}

export interface LogisticaKpis {
  totalPedidos: number;
  entregasCompletadas: number;
  entregasPendientes: number;
  entregasEnTransito: number;
  entregasRetrasadas: number;
  cumplimientoEntregasPct: number;
  tiempoPromedioEntregaHoras: number;
  vehiculosOperativos: number;
  totalVehiculos: number;
  conductoresActivos: number;
  costoTotalOperacionPEN: number;
}

export interface LogisticaDashboardData {
  kpis: LogisticaKpis;
  graficos: {
    entregasPorDia: {
      fecha: string;
      total: number;
      aTiempo: number;
      retrasadas: number;
      pendientes: number;
    }[];
    entregasATiempoVsRetrasadas: {
      fecha: string;
      total: number;
      aTiempo: number;
      retrasadas: number;
      pendientes: number;
    }[];
    rendimientoPorConductor: {
      id: string;
      nombre: string;
      entregasCompletadas: number;
      entregasRetrasadas: number;
      cumplimientoPct: number;
      tiempoPromedioHoras: number;
    }[];
    cumplimientoPorRuta: {
      id: string;
      codigo: string;
      nombre: string;
      corredor: string;
      cumplimientoPct: number;
      tiempoEstimadoHoras: number;
      tiempoPromedioRealHoras: number;
      viajesRetrasados: number;
      totalViajes: number;
    }[];
    desempenoPorCorredor: {
      corredor: string;
      cumplimientoPct: number;
      totalViajes: number;
    }[];
  };
  recomendaciones: RecomendacionItem[];
}

export interface PortalResumen {
  estadoSistema: string;
  ultimaActualizacion: string;
  mineria: {
    kpis: MineriaKpis;
    alertasActivas: number;
  };
  finanzas: {
    kpis: FinanzasKpis;
    alertasActivas: number;
  };
  logistica: {
    kpis: LogisticaKpis;
    alertasActivas: number;
  };
}
