import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClienteDto {
  @IsString()
  documento: string;

  @IsString()
  tipoDocumento: 'DNI' | 'RUC';

  @IsString()
  nombre: string;

  @IsString()
  segmento: 'Corporativo' | 'PYME' | 'Microempresa' | 'Consumo Preferente' | 'Consumo Masivo';

  @IsString()
  sectorEconomico: string;

  @IsString()
  ciudad: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ingresosMensualesPEN: number;

  @Type(() => Number)
  @IsNumber()
  @Min(300)
  scoreCrediticio: number;

  @IsString()
  telefono: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  estado?: 'Activo' | 'Observado' | 'Bloqueado';
}

export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  segmento?: 'Corporativo' | 'PYME' | 'Microempresa' | 'Consumo Preferente' | 'Consumo Masivo';

  @IsOptional()
  @IsString()
  sectorEconomico?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ingresosMensualesPEN?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  scoreCrediticio?: number;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  estado?: 'Activo' | 'Observado' | 'Bloqueado';
}

export class CreateCreditoDto {
  @IsString()
  clienteId: string;

  @IsString()
  producto: string;

  @Type(() => Number)
  @IsNumber()
  @Min(500)
  montoDesembolsadoPEN: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  tasaAnualPct: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  plazoMeses: number;

  @IsString()
  fechaDesembolso: string;

  @IsOptional()
  @IsString()
  estado?: 'Vigente' | 'Vencido' | 'En Cobranza Judicial' | 'Cancelado';
}

export class UpdateCreditoDto {
  @IsOptional()
  @IsString()
  producto?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  montoDesembolsadoPEN?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  saldoCapitalPEN?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tasaAnualPct?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  diasMora?: number;

  @IsOptional()
  @IsString()
  estado?: 'Vigente' | 'Vencido' | 'En Cobranza Judicial' | 'Cancelado';

  @IsOptional()
  @IsString()
  nivelRiesgo?: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';
}

export class CreatePagoDto {
  @IsString()
  creditoId: string;

  @IsOptional()
  @IsString()
  cuotaId?: string;

  @IsString()
  fechaPago: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  montoPEN: number;

  @IsString()
  metodoPago: string;

  @IsOptional()
  @IsString()
  referencia?: string;
}

export class UpdateCuotaDto {
  @IsOptional()
  @IsString()
  estado?: 'Pagada' | 'Pendiente' | 'Vencida' | 'Parcial';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  diasMora?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  montoPagadoPEN?: number;
}
