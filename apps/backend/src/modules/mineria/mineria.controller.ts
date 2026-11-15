import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MineriaService } from './mineria.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
  CreateIncidenteDto,
  CreateMantenimientoDto,
  CreateMaquinariaDto,
  CreateProduccionDto,
  UpdateIncidenteDto,
  UpdateMantenimientoDto,
  UpdateMaquinariaDto,
  UpdateProduccionDto,
} from './dto/mineria.dto';

@Controller('mineria')
export class MineriaController {
  constructor(private readonly mineriaService: MineriaService) {}

  @Get('dashboard')
  getDashboard() {
    return this.mineriaService.getDashboard();
  }

  @Get('kpis')
  getKpis() {
    return this.mineriaService.getKpis();
  }

  @Get('graficos')
  getGraficos() {
    return this.mineriaService.getGraficos();
  }

  @Get('recomendaciones')
  getRecomendaciones() {
    return this.mineriaService.getRecomendaciones();
  }

  // Producción
  @Get('produccion')
  findAllProduccion(@Query() query: PaginationQueryDto) {
    return this.mineriaService.findAllProduccion(query);
  }

  @Get('produccion/:id')
  findOneProduccion(@Param('id') id: string) {
    return this.mineriaService.findOneProduccion(id);
  }

  @Post('produccion')
  createProduccion(@Body() dto: CreateProduccionDto) {
    return this.mineriaService.createProduccion(dto);
  }

  @Put('produccion/:id')
  updateProduccion(@Param('id') id: string, @Body() dto: UpdateProduccionDto) {
    return this.mineriaService.updateProduccion(id, dto);
  }

  // Maquinarias
  @Get('maquinarias')
  findAllMaquinarias(@Query() query: PaginationQueryDto) {
    return this.mineriaService.findAllMaquinarias(query);
  }

  @Get('maquinarias/:id')
  findOneMaquinaria(@Param('id') id: string) {
    return this.mineriaService.findOneMaquinaria(id);
  }

  @Post('maquinarias')
  createMaquinaria(@Body() dto: CreateMaquinariaDto) {
    return this.mineriaService.createMaquinaria(dto);
  }

  @Put('maquinarias/:id')
  updateMaquinaria(@Param('id') id: string, @Body() dto: UpdateMaquinariaDto) {
    return this.mineriaService.updateMaquinaria(id, dto);
  }

  // Mantenimientos
  @Get('mantenimientos')
  findAllMantenimientos(@Query() query: PaginationQueryDto) {
    return this.mineriaService.findAllMantenimientos(query);
  }

  @Get('mantenimientos/:id')
  findOneMantenimiento(@Param('id') id: string) {
    return this.mineriaService.findOneMantenimiento(id);
  }

  @Post('mantenimientos')
  createMantenimiento(@Body() dto: CreateMantenimientoDto) {
    return this.mineriaService.createMantenimiento(dto);
  }

  @Put('mantenimientos/:id')
  updateMantenimiento(@Param('id') id: string, @Body() dto: UpdateMantenimientoDto) {
    return this.mineriaService.updateMantenimiento(id, dto);
  }

  // Incidentes
  @Get('incidentes')
  findAllIncidentes(@Query() query: PaginationQueryDto) {
    return this.mineriaService.findAllIncidentes(query);
  }

  @Get('incidentes/:id')
  findOneIncidente(@Param('id') id: string) {
    return this.mineriaService.findOneIncidente(id);
  }

  @Post('incidentes')
  createIncidente(@Body() dto: CreateIncidenteDto) {
    return this.mineriaService.createIncidente(dto);
  }

  @Put('incidentes/:id')
  updateIncidente(@Param('id') id: string, @Body() dto: UpdateIncidenteDto) {
    return this.mineriaService.updateIncidente(id, dto);
  }
}
