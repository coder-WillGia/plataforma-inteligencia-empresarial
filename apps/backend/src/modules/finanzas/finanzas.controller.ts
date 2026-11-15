import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { FinanzasService } from './finanzas.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
  CreateClienteDto,
  CreateCreditoDto,
  CreatePagoDto,
  UpdateClienteDto,
  UpdateCreditoDto,
  UpdateCuotaDto,
} from './dto/finanzas.dto';

@Controller('finanzas')
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

  @Get('dashboard')
  getDashboard() {
    return this.finanzasService.getDashboard();
  }

  @Get('kpis')
  getKpis() {
    return this.finanzasService.getKpis();
  }

  @Get('graficos')
  getGraficos() {
    return this.finanzasService.getGraficos();
  }

  @Get('recomendaciones')
  getRecomendaciones() {
    return this.finanzasService.getRecomendaciones();
  }

  // Clientes
  @Get('clientes')
  findAllClientes(@Query() query: PaginationQueryDto) {
    return this.finanzasService.findAllClientes(query);
  }

  @Get('clientes/:id')
  findOneCliente(@Param('id') id: string) {
    return this.finanzasService.findOneCliente(id);
  }

  @Post('clientes')
  createCliente(@Body() dto: CreateClienteDto) {
    return this.finanzasService.createCliente(dto);
  }

  @Put('clientes/:id')
  updateCliente(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
    return this.finanzasService.updateCliente(id, dto);
  }

  // Créditos
  @Get('creditos')
  findAllCreditos(@Query() query: PaginationQueryDto) {
    return this.finanzasService.findAllCreditos(query);
  }

  @Get('creditos/:id')
  findOneCredito(@Param('id') id: string) {
    return this.finanzasService.findOneCredito(id);
  }

  @Post('creditos')
  createCredito(@Body() dto: CreateCreditoDto) {
    return this.finanzasService.createCredito(dto);
  }

  @Put('creditos/:id')
  updateCredito(@Param('id') id: string, @Body() dto: UpdateCreditoDto) {
    return this.finanzasService.updateCredito(id, dto);
  }

  // Cuotas
  @Get('cuotas')
  findAllCuotas(@Query() query: PaginationQueryDto) {
    return this.finanzasService.findAllCuotas(query);
  }

  @Put('cuotas/:id')
  updateCuota(@Param('id') id: string, @Body() dto: UpdateCuotaDto) {
    return this.finanzasService.updateCuota(id, dto);
  }

  // Pagos
  @Get('pagos')
  findAllPagos(@Query() query: PaginationQueryDto) {
    return this.finanzasService.findAllPagos(query);
  }

  @Post('pagos')
  createPago(@Body() dto: CreatePagoDto) {
    return this.finanzasService.createPago(dto);
  }
}
