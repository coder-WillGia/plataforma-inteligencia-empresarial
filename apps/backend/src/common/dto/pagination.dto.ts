import { IsOptional, IsString } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  severidad?: string;

  @IsOptional()
  @IsString()
  nivelRiesgo?: string;

  @IsOptional()
  @IsString()
  segmento?: string;

  @IsOptional()
  @IsString()
  corredor?: string;

  @IsOptional()
  @IsString()
  prioridad?: string;

  @IsOptional()
  @IsString()
  mes?: string;

  @IsOptional()
  @IsString()
  all?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
