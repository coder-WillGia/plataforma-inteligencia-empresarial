import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { LogisticaService } from './logistica.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
  CreateConductorDto,
  CreatePedidoDto,
  CreateRutaDto,
  CreateVehiculoDto,
  UpdateConductorDto,
  UpdatePedidoDto,
  UpdateRutaDto,
  UpdateVehiculoDto,
} from './dto/logistica.dto';

@Controller('logistica')
export class LogisticaController {
  constructor(private readonly logisticaService: LogisticaService) {}

  @Get('dashboard')
  getDashboard() {
    return this.logisticaService.getDashboard();
  }

  @Get('kpis')
  getKpis() {
    return this.logisticaService.getKpis();
  }

  @Get('graficos')
  getGraficos() {
    return this.logisticaService.getGraficos();
  }

  @Get('recomendaciones')
  getRecomendaciones() {
    return this.logisticaService.getRecomendaciones();
  }

  // Pedidos
  @Get('pedidos')
  findAllPedidos(@Query() query: PaginationQueryDto) {
    return this.logisticaService.findAllPedidos(query);
  }

  @Get('pedidos/:id')
  findOnePedido(@Param('id') id: string) {
    return this.logisticaService.findOnePedido(id);
  }

  @Post('pedidos')
  createPedido(@Body() dto: CreatePedidoDto) {
    return this.logisticaService.createPedido(dto);
  }

  @Put('pedidos/:id')
  updatePedido(@Param('id') id: string, @Body() dto: UpdatePedidoDto) {
    return this.logisticaService.updatePedido(id, dto);
  }

  // Vehículos
  @Get('vehiculos')
  findAllVehiculos(@Query() query: PaginationQueryDto) {
    return this.logisticaService.findAllVehiculos(query);
  }

  @Post('vehiculos')
  createVehiculo(@Body() dto: CreateVehiculoDto) {
    return this.logisticaService.createVehiculo(dto);
  }

  @Put('vehiculos/:id')
  updateVehiculo(@Param('id') id: string, @Body() dto: UpdateVehiculoDto) {
    return this.logisticaService.updateVehiculo(id, dto);
  }

  // Conductores
  @Get('conductores')
  findAllConductores(@Query() query: PaginationQueryDto) {
    return this.logisticaService.findAllConductores(query);
  }

  @Post('conductores')
  createConductor(@Body() dto: CreateConductorDto) {
    return this.logisticaService.createConductor(dto);
  }

  @Put('conductores/:id')
  updateConductor(@Param('id') id: string, @Body() dto: UpdateConductorDto) {
    return this.logisticaService.updateConductor(id, dto);
  }

  // Rutas
  @Get('rutas')
  findAllRutas(@Query() query: PaginationQueryDto) {
    return this.logisticaService.findAllRutas(query);
  }

  @Post('rutas')
  createRuta(@Body() dto: CreateRutaDto) {
    return this.logisticaService.createRuta(dto);
  }

  @Put('rutas/:id')
  updateRuta(@Param('id') id: string, @Body() dto: UpdateRutaDto) {
    return this.logisticaService.updateRuta(id, dto);
  }
}
