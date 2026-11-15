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

export interface LogisticaDataStore {
  pedidos: PedidoLogistica[];
  vehiculos: VehiculoLogistica[];
  conductores: ConductorLogistica[];
  rutas: RutaLogistica[];
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

export interface RecomendacionLogistica {
  id: string;
  nivel: 'Crítico' | 'Alerta' | 'Optimización';
  categoria: 'Rutas' | 'Conductores' | 'Flota' | 'Entregas';
  titulo: string;
  descripcion: string;
  accionSugerida: string;
  indicadorRelacionado: string;
}
