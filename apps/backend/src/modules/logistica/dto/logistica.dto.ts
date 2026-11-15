import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePedidoDto {
  @IsString()
  cliente: string;

  @IsString()
  rutaId: string;

  @IsString()
  vehiculoId: string;

  @IsString()
  conductorId: string;

  @IsString()
  fechaPedido: string;

  @IsString()
  fechaEntregaEstimada: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  pesoToneladas: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tiempoRealHoras?: number;

  @IsString()
  prioridad: 'Normal' | 'Express' | 'Crítica';

  @IsString()
  estado: 'Entregado' | 'En Tránsito' | 'Pendiente' | 'Retrasado';

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdatePedidoDto {
  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @IsString()
  rutaId?: string;

  @IsOptional()
  @IsString()
  vehiculoId?: string;

  @IsOptional()
  @IsString()
  conductorId?: string;

  @IsOptional()
  @IsString()
  estado?: 'Entregado' | 'En Tránsito' | 'Pendiente' | 'Retrasado';

  @IsOptional()
  @IsString()
  prioridad?: 'Normal' | 'Express' | 'Crítica';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tiempoRealHoras?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  horasRetraso?: number;

  @IsOptional()
  @IsBoolean()
  entregadoATiempo?: boolean;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CreateVehiculoDto {
  @IsString()
  placa: string;

  @IsString()
  tipo: string;

  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @Type(() => Number)
  @IsNumber()
  anio: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  capacidadToneladas: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  kilometraje: number;

  @IsString()
  estado: 'En Ruta' | 'Disponible' | 'En Mantenimiento' | 'Fuera de Servicio';

  @IsString()
  ubicacionActual: string;
}

export class UpdateVehiculoDto {
  @IsOptional()
  @IsString()
  placa?: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  estado?: 'En Ruta' | 'Disponible' | 'En Mantenimiento' | 'Fuera de Servicio';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  kilometraje?: number;

  @IsOptional()
  @IsString()
  ubicacionActual?: string;
}

export class CreateConductorDto {
  @IsString()
  nombre: string;

  @IsString()
  dni: string;

  @IsString()
  licencia: string;

  @IsString()
  categoriaLicencia: string;

  @IsString()
  telefono: string;

  @IsString()
  vehiculoAsignadoId: string;

  @IsString()
  estado: 'Activo' | 'En Ruta' | 'Descanso' | 'Suspendido';
}

export class UpdateConductorDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  vehiculoAsignadoId?: string;

  @IsOptional()
  @IsString()
  estado?: 'Activo' | 'En Ruta' | 'Descanso' | 'Suspendido';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  calificacion?: number;
}

export class CreateRutaDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsString()
  origen: string;

  @IsString()
  destino: string;

  @IsString()
  corredor: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  distanciaKm: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  tiempoEstimadoHoras: number;

  @IsString()
  estado: 'Activa' | 'Congestionada' | 'Restringida';
}

export class UpdateRutaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tiempoEstimadoHoras?: number;

  @IsOptional()
  @IsString()
  estado?: 'Activa' | 'Congestionada' | 'Restringida';

  @IsOptional()
  @IsString()
  nivelRiesgoRuta?: 'Bajo' | 'Medio' | 'Alto';
}
