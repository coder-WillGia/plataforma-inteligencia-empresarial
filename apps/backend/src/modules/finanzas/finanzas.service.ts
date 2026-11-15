import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonStorageService } from '../../common/services/json-storage.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
  ClienteFinanciero,
  CreditoFinanciero,
  CuotaCredito,
  FinanzasDataStore,
  FinanzasKpis,
  PagoCredito,
  RecomendacionFinanzas,
} from './interfaces/finanzas.interface';
import {
  CreateClienteDto,
  CreateCreditoDto,
  CreatePagoDto,
  UpdateClienteDto,
  UpdateCreditoDto,
  UpdateCuotaDto,
} from './dto/finanzas.dto';

const MESES_NOMBRES: Record<string, string> = {
  '01': 'Ene',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dic',
};

@Injectable()
export class FinanzasService {
  private readonly fileName = 'finanzas.json';

  constructor(private readonly storage: JsonStorageService) {}

  private getStore(): FinanzasDataStore {
    return this.storage.readData<FinanzasDataStore>(this.fileName);
  }

  private saveStore(store: FinanzasDataStore): void {
    this.storage.writeData<FinanzasDataStore>(this.fileName, store);
  }

  private formatMesNombre(mesCode: string): string {
    const parts = mesCode.split('-');
    if (parts.length === 2) {
      const m = MESES_NOMBRES[parts[1]] || parts[1];
      return `${m} ${parts[0]}`;
    }
    return mesCode;
  }

  getKpis(): FinanzasKpis {
    const store = this.getStore();

    const montoDesembolsadoPEN = store.creditos.reduce(
      (acc, c) => acc + Number(c.montoDesembolsadoPEN || 0),
      0,
    );
    const carteraTotalPEN = store.creditos.reduce(
      (acc, c) => acc + Number(c.saldoCapitalPEN || 0),
      0,
    );
    const montoRecuperadoPEN = store.creditos.reduce(
      (acc, c) => acc + Number(c.montoRecuperadoPEN || 0),
      0,
    );

    const creditosActivos = store.creditos.filter((c) => c.estado !== 'Cancelado').length;
    const creditosVencidosList = store.creditos.filter(
      (c) => c.estado === 'Vencido' || c.estado === 'En Cobranza Judicial',
    );
    const creditosVencidos = creditosVencidosList.length;

    const carteraVencidaPEN = creditosVencidosList.reduce(
      (acc, c) => acc + Number(c.saldoCapitalPEN || 0),
      0,
    );
    const carteraVigentePEN = Math.max(0, carteraTotalPEN - carteraVencidaPEN);

    const indiceMorosidadPct =
      carteraTotalPEN > 0
        ? Number(((carteraVencidaPEN / carteraTotalPEN) * 100).toFixed(2))
        : 0;

    const recuperacionCarteraPct =
      montoDesembolsadoPEN > 0
        ? Number(((montoRecuperadoPEN / montoDesembolsadoPEN) * 100).toFixed(1))
        : 0;

    return {
      carteraTotalPEN,
      creditosActivos,
      totalCreditos: store.creditos.length,
      montoDesembolsadoPEN,
      indiceMorosidadPct,
      carteraVencidaPEN,
      carteraVigentePEN,
      creditosVencidos,
      recuperacionCarteraPct,
      montoRecuperadoPEN,
      totalClientes: store.clientes.length,
    };
  }

  getGraficos() {
    const store = this.getStore();

    // 1. Evolución de colocaciones y Morosidad mensual (por mesDesembolso)
    const mapaMensual = new Map<
      string,
      {
        mes: string;
        mesNombre: string;
        colocacionesPEN: number;
        carteraVigentePEN: number;
        carteraVencidaPEN: number;
        morosidadPct: number;
        cantidadCreditos: number;
      }
    >();

    for (const c of store.creditos) {
      const mes = c.mesDesembolso || c.fechaDesembolso.slice(0, 7);
      const item = mapaMensual.get(mes) || {
        mes,
        mesNombre: c.mesNombre || this.formatMesNombre(mes),
        colocacionesPEN: 0,
        carteraVigentePEN: 0,
        carteraVencidaPEN: 0,
        morosidadPct: 0,
        cantidadCreditos: 0,
      };

      item.colocacionesPEN += Number(c.montoDesembolsadoPEN || 0);
      item.cantidadCreditos += 1;
      if (c.estado === 'Vencido' || c.estado === 'En Cobranza Judicial') {
        item.carteraVencidaPEN += Number(c.saldoCapitalPEN || 0);
      } else if (c.estado === 'Vigente') {
        item.carteraVigentePEN += Number(c.saldoCapitalPEN || 0);
      }

      const totalSaldoMes = item.carteraVigentePEN + item.carteraVencidaPEN;
      item.morosidadPct =
        totalSaldoMes > 0
          ? Number(((item.carteraVencidaPEN / totalSaldoMes) * 100).toFixed(1))
          : 0;

      mapaMensual.set(mes, item);
    }

    const evolucionColocaciones = Array.from(mapaMensual.values()).sort((a, b) =>
      a.mes.localeCompare(b.mes),
    );

    // 2. Cartera Vigente vs Vencida por Segmento
    const segmentos = ['Corporativo', 'PYME', 'Microempresa', 'Consumo Preferente', 'Consumo Masivo'];
    const carteraPorSegmento = segmentos.map((seg) => {
      const creds = store.creditos.filter((c) => c.segmento === seg);
      const vigente = creds
        .filter((c) => c.estado === 'Vigente')
        .reduce((acc, c) => acc + c.saldoCapitalPEN, 0);
      const vencida = creds
        .filter((c) => c.estado === 'Vencido' || c.estado === 'En Cobranza Judicial')
        .reduce((acc, c) => acc + c.saldoCapitalPEN, 0);
      return {
        segmento: seg,
        vigentePEN: vigente,
        vencidaPEN: vencida,
        totalPEN: vigente + vencida,
      };
    });

    // 3. Distribución por Nivel de Riesgo
    const niveles = ['Bajo', 'Moderado', 'Alto', 'Crítico'];
    const distribucionRiesgo = niveles.map((nivel) => {
      const creds = store.creditos.filter((c) => c.nivelRiesgo === nivel);
      const clientesCount = store.clientes.filter((cl) => cl.nivelRiesgo === nivel).length;
      return {
        nivel,
        cantidadCreditos: creds.length,
        cantidadClientes: clientesCount,
        saldoCarteraPEN: creds.reduce((acc, c) => acc + c.saldoCapitalPEN, 0),
      };
    });

    // 4. Envejecimiento de Mora (Tramos de días de mora)
    const tramosMora = [
      { tramo: 'Al día (0 días)', min: 0, max: 0 },
      { tramo: 'Mora Temprana (1-30d)', min: 1, max: 30 },
      { tramo: 'Mora Media (31-60d)', min: 31, max: 60 },
      { tramo: 'Mora Tardía (61-90d)', min: 61, max: 90 },
      { tramo: 'Judicial (>90d)', min: 91, max: 9999 },
    ].map((t) => {
      const creds = store.creditos.filter(
        (c) => c.estado !== 'Cancelado' && c.diasMora >= t.min && c.diasMora <= t.max,
      );
      return {
        tramo: t.tramo,
        cantidadCreditos: creds.length,
        saldoPEN: creds.reduce((acc, c) => acc + c.saldoCapitalPEN, 0),
      };
    });

    return {
      evolucionColocaciones,
      carteraVigenteVsVencida: carteraPorSegmento,
      morosidadMensual: evolucionColocaciones,
      distribucionRiesgo,
      tramosMora,
    };
  }

  getRecomendaciones(): RecomendacionFinanzas[] {
    const store = this.getStore();
    const kpis = this.getKpis();
    const recomendaciones: RecomendacionFinanzas[] = [];

    // Regla 1: Créditos en cobranza judicial o mora > 60 días
    const creditosCriticos = store.creditos.filter((c) => c.diasMora > 60 && c.estado !== 'Cancelado');
    if (creditosCriticos.length > 0) {
      const exposicionPEN = creditosCriticos.reduce((acc, c) => acc + c.saldoCapitalPEN, 0);
      recomendaciones.push({
        id: 'REC-FIN-01',
        nivel: 'Crítico',
        categoria: 'Morosidad',
        titulo: `${creditosCriticos.length} créditos superan los 60 días de atraso (Riesgo de Incobrabilidad)`,
        descripcion: `La exposición en mora severa y judicial alcanza S/ ${exposicionPEN.toLocaleString('es-PE')}. Destacan deudores como ${creditosCriticos.slice(0, 2).map((c) => c.clienteNombre).join(' y ')}.`,
        accionSugerida:
          'Activar protocolo de reestructuración extraordinaria con garantías reales o iniciar ejecución coactiva de garantías.',
        indicadorRelacionado: `Exposición Crítica: S/ ${exposicionPEN.toLocaleString('es-PE')}`,
      });
    }

    // Regla 2: Clientes de alto/crítico riesgo con créditos activos
    const clientesRiesgo = store.clientes.filter(
      (cl) => cl.nivelRiesgo === 'Crítico' || cl.nivelRiesgo === 'Alto',
    );
    if (clientesRiesgo.length > 0) {
      recomendaciones.push({
        id: 'REC-FIN-02',
        nivel: 'Alerta',
        categoria: 'Riesgo Crediticio',
        titulo: `${clientesRiesgo.length} clientes calificados en Riesgo Alto o Crítico`,
        descripcion: `Se identificó deterioro en el score crediticio (< 615 pts) en clientes de los segmentos PYME y Microempresa, incrementando la provisión requerida por SBS.`,
        accionSugerida:
          'Congelar líneas de crédito revolventes adicionales y exigir aval mancomunado en renovaciones de capital de trabajo.',
        indicadorRelacionado: `${clientesRiesgo.length} clientes observados/bloqueados`,
      });
    }

    // Regla 3: Índice de morosidad global > 8%
    if (kpis.indiceMorosidadPct > 8) {
      recomendaciones.push({
        id: 'REC-FIN-03',
        nivel: 'Alerta',
        categoria: 'Cartera',
        titulo: `Índice de morosidad de cartera (${kpis.indiceMorosidadPct}%) por encima del umbral objetivo (8.0%)`,
        descripcion: `La cartera vencida totaliza S/ ${kpis.carteraVencidaPEN.toLocaleString('es-PE')} frente a una cartera activa de S/ ${kpis.carteraTotalPEN.toLocaleString('es-PE')}.`,
        accionSugerida:
          'Intensificar campaña de cobranza preventiva 5 días antes del vencimiento de cuota y ofrecer descuento del 50% en intereses moratorios por pronto pago.',
        indicadorRelacionado: `Morosidad actual: ${kpis.indiceMorosidadPct}%`,
      });
    }

    // Regla 4: Cuotas vencidas pendientes de gestión inmediata
    const cuotasVencidas = store.cuotas.filter((cu) => cu.estado === 'Vencida');
    if (cuotasVencidas.length > 0) {
      const montoCuotasVenc = cuotasVencidas.reduce((acc, cu) => acc + cu.montoTotalPEN, 0);
      recomendaciones.push({
        id: 'REC-FIN-04',
        nivel: 'Optimización',
        categoria: 'Cobranza',
        titulo: `${cuotasVencidas.length} cuotas vencidas recuperables en corto plazo`,
        descripcion: `El flujo de caja inmediato puede recuperar S/ ${montoCuotasVenc.toLocaleString('es-PE')} mediante gestión telefónica y enlaces de pago digital automatizados.`,
        accionSugerida:
          'Priorizar cobranza de cuotas con mora entre 15 y 45 días donde la probabilidad de normalización supera el 78%.',
        indicadorRelacionado: `Flujo por recuperar: S/ ${montoCuotasVenc.toLocaleString('es-PE')}`,
      });
    }

    return recomendaciones;
  }

  getDashboard() {
    return {
      kpis: this.getKpis(),
      graficos: this.getGraficos(),
      recomendaciones: this.getRecomendaciones(),
    };
  }

  // ==================== CRUD CLIENTES ====================
  findAllClientes(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.clientes,
      query,
      ['id', 'documento', 'nombre', 'segmento', 'sectorEconomico', 'ciudad', 'email'],
      { estado: query.estado, nivelRiesgo: query.nivelRiesgo, segmento: query.segmento },
    );
  }

  findOneCliente(id: string): ClienteFinanciero {
    const store = this.getStore();
    const item = store.clientes.find((c) => c.id === id);
    if (!item) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return item;
  }

  createCliente(dto: CreateClienteDto): ClienteFinanciero {
    const store = this.getStore();
    const nextNum = store.clientes.length + 1;
    const id = `CLI-${String(nextNum).padStart(3, '0')}`;
    const score = Number(dto.scoreCrediticio);
    const nivelRiesgo: ClienteFinanciero['nivelRiesgo'] =
      score < 500 ? 'Crítico' : score < 615 ? 'Alto' : score < 715 ? 'Moderado' : 'Bajo';
    const estado: ClienteFinanciero['estado'] =
      dto.estado || (nivelRiesgo === 'Crítico' ? 'Bloqueado' : nivelRiesgo === 'Alto' ? 'Observado' : 'Activo');

    const nuevo: ClienteFinanciero = {
      id,
      documento: dto.documento,
      tipoDocumento: dto.tipoDocumento,
      nombre: dto.nombre,
      segmento: dto.segmento,
      sectorEconomico: dto.sectorEconomico,
      ciudad: dto.ciudad,
      ingresosMensualesPEN: Number(dto.ingresosMensualesPEN),
      scoreCrediticio: score,
      nivelRiesgo,
      telefono: dto.telefono,
      email: dto.email,
      fechaRegistro: new Date().toISOString().slice(0, 10),
      estado,
    };

    store.clientes.unshift(nuevo);
    this.saveStore(store);
    return nuevo;
  }

  updateCliente(id: string, dto: UpdateClienteDto): ClienteFinanciero {
    const store = this.getStore();
    const idx = store.clientes.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`Cliente ${id} no encontrado`);

    const actual = store.clientes[idx];
    const score =
      dto.scoreCrediticio !== undefined ? Number(dto.scoreCrediticio) : actual.scoreCrediticio;
    const nivelRiesgo: ClienteFinanciero['nivelRiesgo'] =
      score < 500 ? 'Crítico' : score < 615 ? 'Alto' : score < 715 ? 'Moderado' : 'Bajo';

    const actualizado: ClienteFinanciero = {
      ...actual,
      ...dto,
      ingresosMensualesPEN:
        dto.ingresosMensualesPEN !== undefined
          ? Number(dto.ingresosMensualesPEN)
          : actual.ingresosMensualesPEN,
      scoreCrediticio: score,
      nivelRiesgo,
    };

    store.clientes[idx] = actualizado;
    this.saveStore(store);
    return actualizado;
  }

  // ==================== CRUD CRÉDITOS ====================
  findAllCreditos(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.creditos,
      query,
      ['id', 'clienteId', 'clienteNombre', 'clienteDocumento', 'segmento', 'producto', 'estado'],
      { estado: query.estado, nivelRiesgo: query.nivelRiesgo, segmento: query.segmento },
    );
  }

  findOneCredito(id: string) {
    const store = this.getStore();
    const credito = store.creditos.find((c) => c.id === id);
    if (!credito) throw new NotFoundException(`Crédito ${id} no encontrado`);
    const cuotas = store.cuotas.filter((cu) => cu.creditoId === id);
    const pagos = store.pagos.filter((p) => p.creditoId === id);
    return { ...credito, cuotas, pagos };
  }

  createCredito(dto: CreateCreditoDto): CreditoFinanciero {
    const store = this.getStore();
    const cli = store.clientes.find((c) => c.id === dto.clienteId);
    const nextNum = store.creditos.length + 1;
    const id = `CRD-${String(nextNum).padStart(3, '0')}`;
    const monto = Number(dto.montoDesembolsadoPEN);
    const tasa = Number(dto.tasaAnualPct);
    const plazo = Number(dto.plazoMeses);
    const mesDesembolso = dto.fechaDesembolso.slice(0, 7);
    const cuotasTotales = 4;

    const nuevo: CreditoFinanciero = {
      id,
      clienteId: dto.clienteId,
      clienteNombre: cli ? cli.nombre : 'Cliente Corporativo',
      clienteDocumento: cli ? cli.documento : '20500000001',
      segmento: cli ? cli.segmento : 'PYME',
      producto: dto.producto,
      montoDesembolsadoPEN: monto,
      saldoCapitalPEN: monto,
      montoRecuperadoPEN: 0,
      tasaAnualPct: tasa,
      plazoMeses: plazo,
      cuotasTotales,
      cuotasPagadas: 0,
      cuotasVencidas: 0,
      diasMora: 0,
      fechaDesembolso: dto.fechaDesembolso,
      mesDesembolso,
      mesNombre: this.formatMesNombre(mesDesembolso),
      estado: dto.estado || 'Vigente',
      nivelRiesgo: cli ? cli.nivelRiesgo : 'Bajo',
    };

    // Generar cronograma inicial de 4 cuotas para el nuevo crédito
    const capCuota = Math.round(monto / cuotasTotales);
    const intCuota = Math.round((monto * (tasa / 100)) / cuotasTotales);
    for (let c = 1; c <= cuotasTotales; c++) {
      const cuotaId = `CUO-${String(store.cuotas.length + c).padStart(4, '0')}`;
      store.cuotas.unshift({
        id: cuotaId,
        creditoId: id,
        clienteId: nuevo.clienteId,
        clienteNombre: nuevo.clienteNombre,
        numeroCuota: c,
        fechaVencimiento: `2026-12-${String(10 + c * 4).padStart(2, '0')}`,
        montoCapitalPEN: capCuota,
        montoInteresPEN: intCuota,
        montoMoraPEN: 0,
        montoTotalPEN: capCuota + intCuota,
        montoPagadoPEN: 0,
        diasMora: 0,
        estado: 'Pendiente',
        fechaPago: null,
      });
    }

    store.creditos.unshift(nuevo);
    this.saveStore(store);
    return nuevo;
  }

  updateCredito(id: string, dto: UpdateCreditoDto): CreditoFinanciero {
    const store = this.getStore();
    const idx = store.creditos.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`Crédito ${id} no encontrado`);

    const actual = store.creditos[idx];
    const montoDesembolsadoPEN =
      dto.montoDesembolsadoPEN !== undefined
        ? Number(dto.montoDesembolsadoPEN)
        : actual.montoDesembolsadoPEN;
    const saldoCapitalPEN =
      dto.saldoCapitalPEN !== undefined ? Number(dto.saldoCapitalPEN) : actual.saldoCapitalPEN;
    const diasMora = dto.diasMora !== undefined ? Number(dto.diasMora) : actual.diasMora;
    const nivelRiesgo: CreditoFinanciero['nivelRiesgo'] =
      dto.nivelRiesgo ||
      (diasMora > 60 ? 'Crítico' : diasMora > 15 ? 'Alto' : actual.nivelRiesgo);

    const actualizado: CreditoFinanciero = {
      ...actual,
      ...dto,
      montoDesembolsadoPEN,
      saldoCapitalPEN,
      montoRecuperadoPEN: Math.max(0, montoDesembolsadoPEN - saldoCapitalPEN),
      tasaAnualPct:
        dto.tasaAnualPct !== undefined ? Number(dto.tasaAnualPct) : actual.tasaAnualPct,
      diasMora,
      nivelRiesgo,
    };

    store.creditos[idx] = actualizado;
    this.saveStore(store);
    return actualizado;
  }

  // ==================== CRUD CUOTAS Y PAGOS ====================
  findAllCuotas(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.cuotas,
      query,
      ['id', 'creditoId', 'clienteId', 'clienteNombre', 'estado', 'fechaVencimiento'],
      { estado: query.estado },
    );
  }

  updateCuota(id: string, dto: UpdateCuotaDto): CuotaCredito {
    const store = this.getStore();
    const idx = store.cuotas.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`Cuota ${id} no encontrada`);

    const actual = store.cuotas[idx];
    const estado = dto.estado || actual.estado;
    const montoPagadoPEN =
      dto.montoPagadoPEN !== undefined
        ? Number(dto.montoPagadoPEN)
        : estado === 'Pagada'
        ? actual.montoTotalPEN
        : actual.montoPagadoPEN;

    const actualizada: CuotaCredito = {
      ...actual,
      ...dto,
      estado,
      montoPagadoPEN,
      diasMora: estado === 'Pagada' ? 0 : dto.diasMora ?? actual.diasMora,
      fechaPago: estado === 'Pagada' ? new Date().toISOString().slice(0, 10) : actual.fechaPago,
    };

    store.cuotas[idx] = actualizada;
    this.saveStore(store);
    return actualizada;
  }

  findAllPagos(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.pagos,
      query,
      ['id', 'creditoId', 'cuotaId', 'clienteNombre', 'metodoPago', 'referencia', 'fechaPago'],
      { estado: query.estado },
    );
  }

  createPago(dto: CreatePagoDto): PagoCredito {
    const store = this.getStore();
    const creditoIdx = store.creditos.findIndex((c) => c.id === dto.creditoId);
    if (creditoIdx === -1) {
      throw new NotFoundException(`Crédito ${dto.creditoId} no encontrado`);
    }
    const credito = store.creditos[creditoIdx];

    // Buscar cuota asociada o la primera cuota pendiente/vencida del crédito
    let cuotaIdx = -1;
    if (dto.cuotaId) {
      cuotaIdx = store.cuotas.findIndex((cu) => cu.id === dto.cuotaId);
    } else {
      cuotaIdx = store.cuotas.findIndex(
        (cu) => cu.creditoId === dto.creditoId && cu.estado !== 'Pagada',
      );
    }

    const monto = Number(dto.montoPEN);
    let cuotaId = dto.cuotaId || 'CUO-GEN';

    if (cuotaIdx !== -1) {
      const cuota = store.cuotas[cuotaIdx];
      cuotaId = cuota.id;
      cuota.montoPagadoPEN = Number(cuota.montoPagadoPEN || 0) + monto;
      cuota.estado = cuota.montoPagadoPEN >= cuota.montoCapitalPEN ? 'Pagada' : 'Parcial';
      if (cuota.estado === 'Pagada') {
        cuota.diasMora = 0;
        cuota.fechaPago = dto.fechaPago;
      }
      store.cuotas[cuotaIdx] = cuota;
    }

    // Actualizar saldo del crédito y recuperación
    credito.montoRecuperadoPEN = Math.min(
      credito.montoDesembolsadoPEN,
      Number(credito.montoRecuperadoPEN || 0) + monto,
    );
    credito.saldoCapitalPEN = Math.max(
      0,
      credito.montoDesembolsadoPEN - credito.montoRecuperadoPEN,
    );

    const cuotasDelCredito = store.cuotas.filter((cu) => cu.creditoId === credito.id);
    credito.cuotasPagadas = cuotasDelCredito.filter((cu) => cu.estado === 'Pagada').length;
    credito.cuotasVencidas = cuotasDelCredito.filter((cu) => cu.estado === 'Vencida').length;

    if (credito.saldoCapitalPEN === 0) {
      credito.estado = 'Cancelado';
      credito.diasMora = 0;
    } else if (credito.cuotasVencidas === 0 && credito.estado === 'Vencido') {
      credito.estado = 'Vigente';
      credito.diasMora = 0;
    }

    store.creditos[creditoIdx] = credito;

    const nextNum = store.pagos.length + 1;
    const nuevoPago: PagoCredito = {
      id: `PAG-${String(nextNum).padStart(4, '0')}`,
      creditoId: credito.id,
      cuotaId,
      clienteId: credito.clienteId,
      clienteNombre: credito.clienteNombre,
      fechaPago: dto.fechaPago,
      mesPago: dto.fechaPago.slice(0, 7),
      montoPEN: monto,
      metodoPago: dto.metodoPago,
      referencia: dto.referencia || `OP-${20260000 + nextNum}`,
      estado: 'Confirmado',
    };

    store.pagos.unshift(nuevoPago);
    this.saveStore(store);
    return nuevoPago;
  }
}
