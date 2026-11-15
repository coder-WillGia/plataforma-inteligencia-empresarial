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

export interface FinanzasDataStore {
  clientes: ClienteFinanciero[];
  creditos: CreditoFinanciero[];
  cuotas: CuotaCredito[];
  pagos: PagoCredito[];
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

export interface RecomendacionFinanzas {
  id: string;
  nivel: 'Crítico' | 'Alerta' | 'Optimización';
  categoria: 'Morosidad' | 'Riesgo Crediticio' | 'Cobranza' | 'Cartera';
  titulo: string;
  descripcion: string;
  accionSugerida: string;
  indicadorRelacionado: string;
}
