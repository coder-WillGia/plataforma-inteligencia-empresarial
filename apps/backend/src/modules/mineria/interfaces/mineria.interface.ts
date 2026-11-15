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

export interface MineriaDataStore {
  produccion: RegistroProduccion[];
  maquinarias: Maquinaria[];
  mantenimientos: Mantenimiento[];
  incidentes: IncidenteSeguridad[];
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

export interface RecomendacionMineria {
  id: string;
  nivel: 'Crítico' | 'Alerta' | 'Optimización';
  categoria: 'Producción' | 'Maquinaria' | 'Mantenimiento' | 'Seguridad';
  titulo: string;
  descripcion: string;
  accionSugerida: string;
  indicadorRelacionado: string;
}
