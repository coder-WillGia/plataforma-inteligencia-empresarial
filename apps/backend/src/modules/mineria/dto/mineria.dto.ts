import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProduccionDto {
  @IsString()
  mes: string;

  @IsOptional()
  @IsString()
  mesNombre?: string;

  @IsString()
  fecha: string;

  @IsString()
  unidadMinera: string;

  @IsString()
  mineral: string;

  @IsString()
  turno: 'Día' | 'Noche';

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  toneladasExtraidas: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  toneladasObjetivo: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  leyMineralPct: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  horasOperacion: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateProduccionDto {
  @IsOptional()
  @IsString()
  mes?: string;

  @IsOptional()
  @IsString()
  fecha?: string;

  @IsOptional()
  @IsString()
  unidadMinera?: string;

  @IsOptional()
  @IsString()
  mineral?: string;

  @IsOptional()
  @IsString()
  turno?: 'Día' | 'Noche';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  toneladasExtraidas?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  toneladasObjetivo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  leyMineralPct?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  horasOperacion?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CreateMaquinariaDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsString()
  tipo: string;

  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsString()
  ubicacion: string;

  @IsString()
  estado: 'Operativa' | 'En Mantenimiento' | 'Inoperativa' | 'En Revisión';

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  horasOperadasMes: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  horasInactividadMes: number;

  @IsOptional()
  @IsString()
  ultimoMantenimiento?: string;

  @IsOptional()
  @IsString()
  proximoMantenimiento?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  consumoCombustibleGalHora?: number;
}

export class UpdateMaquinariaDto {
  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsString()
  estado?: 'Operativa' | 'En Mantenimiento' | 'Inoperativa' | 'En Revisión';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  horasOperadasMes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  horasInactividadMes?: number;

  @IsOptional()
  @IsString()
  ultimoMantenimiento?: string;

  @IsOptional()
  @IsString()
  proximoMantenimiento?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  consumoCombustibleGalHora?: number;
}

export class CreateMantenimientoDto {
  @IsString()
  maquinariaId: string;

  @IsString()
  tipo: 'Preventivo' | 'Correctivo' | 'Predictivo';

  @IsString()
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';

  @IsString()
  fechaProgramada: string;

  @IsOptional()
  @IsString()
  fechaEjecucion?: string | null;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  duracionHoras: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costoPEN: number;

  @IsString()
  tecnicoResponsable: string;

  @IsString()
  estado: 'Completado' | 'En Proceso' | 'Programado' | 'Vencido';

  @IsString()
  descripcion: string;
}

export class UpdateMantenimientoDto {
  @IsOptional()
  @IsString()
  maquinariaId?: string;

  @IsOptional()
  @IsString()
  tipo?: 'Preventivo' | 'Correctivo' | 'Predictivo';

  @IsOptional()
  @IsString()
  prioridad?: 'Baja' | 'Media' | 'Alta' | 'Crítica';

  @IsOptional()
  @IsString()
  fechaProgramada?: string;

  @IsOptional()
  @IsString()
  fechaEjecucion?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  duracionHoras?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  costoPEN?: number;

  @IsOptional()
  @IsString()
  tecnicoResponsable?: string;

  @IsOptional()
  @IsString()
  estado?: 'Completado' | 'En Proceso' | 'Programado' | 'Vencido';

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class CreateIncidenteDto {
  @IsString()
  fecha: string;

  @IsString()
  titulo: string;

  @IsString()
  tipo: 'Mecánico' | 'Operacional' | 'Seguridad Personal' | 'Ambiental' | 'Eléctrico';

  @IsString()
  severidad: 'Leve' | 'Moderado' | 'Grave' | 'Crítico';

  @IsString()
  area: string;

  @IsString()
  maquinariaId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  diasPerdidos: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  trabajadoresAfectados: number;

  @IsString()
  estado: 'Cerrado' | 'En Investigación' | 'Acción Correctiva';

  @IsString()
  responsable: string;

  @IsString()
  medidaCorrectiva: string;
}

export class UpdateIncidenteDto {
  @IsOptional()
  @IsString()
  fecha?: string;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  tipo?: 'Mecánico' | 'Operacional' | 'Seguridad Personal' | 'Ambiental' | 'Eléctrico';

  @IsOptional()
  @IsString()
  severidad?: 'Leve' | 'Moderado' | 'Grave' | 'Crítico';

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  maquinariaId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  diasPerdidos?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  trabajadoresAfectados?: number;

  @IsOptional()
  @IsString()
  estado?: 'Cerrado' | 'En Investigación' | 'Acción Correctiva';

  @IsOptional()
  @IsString()
  responsable?: string;

  @IsOptional()
  @IsString()
  medidaCorrectiva?: string;
}
