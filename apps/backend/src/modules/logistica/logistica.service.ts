import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonStorageService } from '../../common/services/json-storage.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
  ConductorLogistica,
  LogisticaDataStore,
  LogisticaKpis,
  PedidoLogistica,
  RecomendacionLogistica,
  RutaLogistica,
  VehiculoLogistica,
} from './interfaces/logistica.interface';
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

@Injectable()
export class LogisticaService {
  private readonly fileName = 'logistica.json';

  constructor(private readonly storage: JsonStorageService) {}

  private getStore(): LogisticaDataStore {
    return this.storage.readData<LogisticaDataStore>(this.fileName);
  }

  private saveStore(store: LogisticaDataStore): void {
    this.recomputeDriverAndRouteStats(store);
    this.storage.writeData<LogisticaDataStore>(this.fileName, store);
  }

  private recomputeDriverAndRouteStats(store: LogisticaDataStore): void {
    for (const cond of store.conductores) {
      const misPedidos = store.pedidos.filter((p) => p.conductorId === cond.id);
      const evaluables = misPedidos.filter(
        (p) => p.estado === 'Entregado' || p.estado === 'Retrasado',
      );
      const retrasados = evaluables.filter(
        (p) => !p.entregadoATiempo || p.estado === 'Retrasado',
      );
      cond.entregasCompletadas = evaluables.length;
      cond.entregasRetrasadas = retrasados.length;
      cond.cumplimientoPct =
        evaluables.length > 0
          ? Number(
              (((evaluables.length - retrasados.length) / evaluables.length) * 100).toFixed(1),
            )
          : 100;
      const avgTime =
        evaluables.length > 0
          ? evaluables.reduce((acc, p) => acc + Number(p.tiempoRealHoras || 0), 0) /
            evaluables.length
          : 0;
      cond.tiempoPromedioHoras = Number(avgTime.toFixed(1));
    }

    for (const ruta of store.rutas) {
      const misPedidos = store.pedidos.filter((p) => p.rutaId === ruta.id);
      const evaluables = misPedidos.filter(
        (p) => p.estado === 'Entregado' || p.estado === 'Retrasado',
      );
      const retrasados = evaluables.filter(
        (p) => !p.entregadoATiempo || p.estado === 'Retrasado',
      );
      ruta.totalViajes = misPedidos.length;
      ruta.viajesRetrasados = retrasados.length;
      ruta.cumplimientoPct =
        evaluables.length > 0
          ? Number(
              (((evaluables.length - retrasados.length) / evaluables.length) * 100).toFixed(1),
            )
          : 100;
      const avgReal =
        evaluables.length > 0
          ? evaluables.reduce((acc, p) => acc + Number(p.tiempoRealHoras || 0), 0) /
            evaluables.length
          : ruta.tiempoEstimadoHoras;
      ruta.tiempoPromedioRealHoras = Number(avgReal.toFixed(1));
    }
  }

  getKpis(): LogisticaKpis {
    const store = this.getStore();
    const totalPedidos = store.pedidos.length;
    const entregasCompletadas = store.pedidos.filter((p) => p.estado === 'Entregado').length;
    const entregasPendientes = store.pedidos.filter(
      (p) => p.estado === 'Pendiente' || p.estado === 'En Tránsito',
    ).length;
    const entregasEnTransito = store.pedidos.filter((p) => p.estado === 'En Tránsito').length;

    const pedidosConDemora = store.pedidos.filter(
      (p) => p.estado === 'Retrasado' || (!p.entregadoATiempo && p.estado === 'Entregado'),
    );
    const entregasRetrasadas = pedidosConDemora.length;

    const evaluables = store.pedidos.filter(
      (p) => p.estado === 'Entregado' || p.estado === 'Retrasado',
    );
    const aTiempo = evaluables.filter((p) => p.entregadoATiempo && p.estado === 'Entregado').length;

    const cumplimientoEntregasPct =
      evaluables.length > 0 ? Number(((aTiempo / evaluables.length) * 100).toFixed(1)) : 0;

    const tiempoPromedioEntregaHoras =
      evaluables.length > 0
        ? Number(
            (
              evaluables.reduce((acc, p) => acc + Number(p.tiempoRealHoras || 0), 0) /
              evaluables.length
            ).toFixed(1),
          )
        : 0;

    const vehiculosOperativos = store.vehiculos.filter(
      (v) => v.estado === 'En Ruta' || v.estado === 'Disponible',
    ).length;

    const conductoresActivos = store.conductores.filter(
      (c) => c.estado === 'Activo' || c.estado === 'En Ruta',
    ).length;

    const costoTotalOperacionPEN = store.pedidos.reduce(
      (acc, p) => acc + Number(p.costoEnvioPEN || 0),
      0,
    );

    return {
      totalPedidos,
      entregasCompletadas,
      entregasPendientes,
      entregasEnTransito,
      entregasRetrasadas,
      cumplimientoEntregasPct,
      tiempoPromedioEntregaHoras,
      vehiculosOperativos,
      totalVehiculos: store.vehiculos.length,
      conductoresActivos,
      costoTotalOperacionPEN,
    };
  }

  getGraficos() {
    const store = this.getStore();

    // 1. Entregas por día y Entregas a tiempo vs retrasadas
    const mapaDias = new Map<
      string,
      { fecha: string; total: number; aTiempo: number; retrasadas: number; pendientes: number }
    >();

    for (const p of store.pedidos) {
      const f = p.fechaPedido;
      const item = mapaDias.get(f) || {
        fecha: f,
        total: 0,
        aTiempo: 0,
        retrasadas: 0,
        pendientes: 0,
      };
      item.total += 1;
      if (p.estado === 'Pendiente' || p.estado === 'En Tránsito') {
        item.pendientes += 1;
      } else if (!p.entregadoATiempo || p.estado === 'Retrasado') {
        item.retrasadas += 1;
      } else {
        item.aTiempo += 1;
      }
      mapaDias.set(f, item);
    }

    const entregasPorDia = Array.from(mapaDias.values()).sort((a, b) =>
      a.fecha.localeCompare(b.fecha),
    );

    // 2. Rendimiento por conductor (Top 12 para lectura clara)
    const rendimientoPorConductor = [...store.conductores]
      .sort((a, b) => a.cumplimientoPct - b.cumplimientoPct)
      .slice(0, 12)
      .map((c) => ({
        id: c.id,
        nombre: c.nombre.split(' ').slice(0, 2).join(' '),
        entregasCompletadas: c.entregasCompletadas,
        entregasRetrasadas: c.entregasRetrasadas,
        cumplimientoPct: c.cumplimientoPct,
        tiempoPromedioHoras: c.tiempoPromedioHoras,
      }));

    // 3. Cumplimiento por ruta (12 rutas con mayor actividad o menor cumplimiento)
    const cumplimientoPorRuta = [...store.rutas]
      .sort((a, b) => a.cumplimientoPct - b.cumplimientoPct)
      .slice(0, 12)
      .map((r) => ({
        id: r.id,
        codigo: r.codigo,
        nombre: `${r.origen} - ${r.destino}`,
        corredor: r.corredor,
        cumplimientoPct: r.cumplimientoPct,
        tiempoEstimadoHoras: r.tiempoEstimadoHoras,
        tiempoPromedioRealHoras: r.tiempoPromedioRealHoras,
        viajesRetrasados: r.viajesRetrasados,
        totalViajes: r.totalViajes,
      }));

    // 4. Desempeño por Corredor Logístico
    const corredores = ['Costa Norte', 'Costa Sur', 'Sierra Central', 'Sur Andino', 'Oriente', 'Lima Metropolitana'];
    const desempenoPorCorredor = corredores.map((corr) => {
      const rutasCorr = store.rutas.filter((r) => r.corredor === corr);
      const avgCumpl =
        rutasCorr.length > 0
          ? Number(
              (
                rutasCorr.reduce((acc, r) => acc + r.cumplimientoPct, 0) / rutasCorr.length
              ).toFixed(1),
            )
          : 100;
      const viajes = rutasCorr.reduce((acc, r) => acc + r.totalViajes, 0);
      return {
        corredor: corr,
        cumplimientoPct: avgCumpl,
        totalViajes: viajes,
      };
    });

    return {
      entregasPorDia,
      entregasATiempoVsRetrasadas: entregasPorDia,
      rendimientoPorConductor,
      cumplimientoPorRuta,
      desempenoPorCorredor,
    };
  }

  getRecomendaciones(): RecomendacionLogistica[] {
    const store = this.getStore();
    const recomendaciones: RecomendacionLogistica[] = [];

    // Regla 1: Rutas con retrasos frecuentes (< 80% cumplimiento)
    const rutasCriticas = store.rutas.filter((r) => r.cumplimientoPct < 80);
    if (rutasCriticas.length > 0) {
      const nombres = rutasCriticas
        .slice(0, 3)
        .map((r) => `${r.origen}-${r.destino} (${r.cumplimientoPct}%)`)
        .join(', ');
      recomendaciones.push({
        id: 'REC-LOG-01',
        nivel: 'Crítico',
        categoria: 'Rutas',
        titulo: `${rutasCriticas.length} rutas presentan retrasos recurrentes (< 80% puntualidad)`,
        descripcion: `Se identificaron cuellos de botella severos en los tramos: ${nombres}. El tiempo real supera hasta en 3.8 horas el SLA estimado.`,
        accionSugerida:
          'Reprogramar ventanas de despacho a horario nocturno (22:00 - 04:00) y habilitar rutas alternas en Carretera Central y Corredor Sur.',
        indicadorRelacionado: `Ruta más crítica: ${Math.min(...rutasCriticas.map((r) => r.cumplimientoPct))}% cumplimiento`,
      });
    }

    // Regla 2: Conductores con bajo cumplimiento (< 82%)
    const condBajos = store.conductores.filter((c) => c.cumplimientoPct < 82);
    if (condBajos.length > 0) {
      const lista = condBajos
        .slice(0, 3)
        .map((c) => `${c.nombre} (${c.cumplimientoPct}%)`)
        .join(', ');
      recomendaciones.push({
        id: 'REC-LOG-02',
        nivel: 'Alerta',
        categoria: 'Conductores',
        titulo: `${condBajos.length} conductores por debajo del estándar operativo de puntualidad (< 82%)`,
        descripcion: `Los conductores ${lista} acumulan el mayor índice de demoras en entregas de última milla y larga distancia.`,
        accionSugerida:
          'Realizar acompañamiento mediante telemetría GPS en tiempo real, rotación hacia rutas de menor complejidad y capacitación en gestión de tiempos de descarga.',
        indicadorRelacionado: `${condBajos.length} operadores requieren intervención`,
      });
    }

    // Regla 3: Vehículos en mantenimiento o fuera de servicio
    const vehInactivos = store.vehiculos.filter(
      (v) => v.estado === 'En Mantenimiento' || v.estado === 'Fuera de Servicio',
    );
    if (vehInactivos.length > 0) {
      const capPerdida = vehInactivos.reduce((acc, v) => acc + v.capacidadToneladas, 0);
      recomendaciones.push({
        id: 'REC-LOG-03',
        nivel: 'Alerta',
        categoria: 'Flota',
        titulo: `${vehInactivos.length} unidades pesadas fuera de circulación (${capPerdida} TN de capacidad retenida)`,
        descripcion: `Las unidades ${vehInactivos.map((v) => v.placa).join(', ')} se encuentran en taller o inoperativas, reduciendo la capacidad de despacho para pedidos Express.`,
        accionSugerida:
          'Acelerar liberación de taller mecánico propio y activar flota tercerizada homologada para cubrir picos de demanda en Lima y Norte.',
        indicadorRelacionado: `Capacidad indisponible: ${capPerdida} Toneladas`,
      });
    }

    // Regla 4: Pedidos con prioridad Crítica/Express pendientes o en retraso
    const pedidosUrgentes = store.pedidos.filter(
      (p) =>
        (p.prioridad === 'Crítica' || p.prioridad === 'Express') &&
        (p.estado === 'Retrasado' || p.estado === 'Pendiente'),
    );
    if (pedidosUrgentes.length > 0) {
      recomendaciones.push({
        id: 'REC-LOG-04',
        nivel: 'Optimización',
        categoria: 'Entregas',
        titulo: `${pedidosUrgentes.length} guías Express/Críticas requieren priorización de muelle`,
        descripcion: `Existen envíos de alta prioridad en estado Pendiente o Retrasado para clientes corporativos clave.`,
        accionSugerida:
          'Asignar cross-docking directo en hub Callao y notificar proactivamente ETA actualizado al cliente receptor.',
        indicadorRelacionado: `${pedidosUrgentes.length} pedidos prioritarios activos`,
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

  // ==================== CRUD PEDIDOS ====================
  findAllPedidos(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.pedidos,
      query,
      [
        'id',
        'codigoGuia',
        'cliente',
        'origen',
        'destino',
        'rutaNombre',
        'vehiculoPlaca',
        'conductorNombre',
        'estado',
      ],
      { estado: query.estado, prioridad: query.prioridad },
    );
  }

  findOnePedido(id: string): PedidoLogistica {
    const store = this.getStore();
    const item = store.pedidos.find((p) => p.id === id);
    if (!item) throw new NotFoundException(`Pedido ${id} no encontrado`);
    return item;
  }

  createPedido(dto: CreatePedidoDto): PedidoLogistica {
    const store = this.getStore();
    const nextNum = store.pedidos.length + 1;
    const id = `PED-${String(nextNum).padStart(4, '0')}`;
    const ruta = store.rutas.find((r) => r.id === dto.rutaId) || store.rutas[0];
    const veh = store.vehiculos.find((v) => v.id === dto.vehiculoId) || store.vehiculos[0];
    const cond = store.conductores.find((c) => c.id === dto.conductorId) || store.conductores[0];

    const tiempoEstimadoHoras = ruta ? ruta.tiempoEstimadoHoras : 8;
    const tiempoRealHoras =
      dto.tiempoRealHoras !== undefined ? Number(dto.tiempoRealHoras) : tiempoEstimadoHoras;
    const horasRetraso = Math.max(0, Number((tiempoRealHoras - tiempoEstimadoHoras).toFixed(1)));
    const entregadoATiempo = dto.estado !== 'Retrasado' && horasRetraso <= 0.5;
    const peso = Number(dto.pesoToneladas);
    const costoEnvioPEN = Math.round((ruta ? ruta.costoBasePEN : 1200) + peso * 85);

    const nuevo: PedidoLogistica = {
      id,
      codigoGuia: `GR-001-${String(80000 + nextNum)}`,
      cliente: dto.cliente,
      origen: ruta ? ruta.origen : 'Lima',
      destino: ruta ? ruta.destino : 'Arequipa',
      rutaId: dto.rutaId,
      rutaNombre: ruta ? ruta.nombre : dto.rutaId,
      vehiculoId: dto.vehiculoId,
      vehiculoPlaca: veh ? veh.placa : dto.vehiculoId,
      conductorId: dto.conductorId,
      conductorNombre: cond ? cond.nombre : dto.conductorId,
      fechaPedido: dto.fechaPedido,
      fechaEntregaEstimada: dto.fechaEntregaEstimada,
      fechaEntregaReal:
        dto.estado === 'Entregado' || dto.estado === 'Retrasado'
          ? dto.fechaEntregaEstimada
          : null,
      tiempoEstimadoHoras,
      tiempoRealHoras,
      pesoToneladas: peso,
      costoEnvioPEN,
      prioridad: dto.prioridad,
      estado: dto.estado,
      entregadoATiempo,
      horasRetraso,
      observaciones: dto.observaciones || 'Pedido registrado en sistema de despacho.',
    };

    store.pedidos.unshift(nuevo);
    this.saveStore(store);
    return nuevo;
  }

  updatePedido(id: string, dto: UpdatePedidoDto): PedidoLogistica {
    const store = this.getStore();
    const idx = store.pedidos.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException(`Pedido ${id} no encontrado`);

    const actual = store.pedidos[idx];
    const rutaId = dto.rutaId || actual.rutaId;
    const vehId = dto.vehiculoId || actual.vehiculoId;
    const condId = dto.conductorId || actual.conductorId;

    const ruta = store.rutas.find((r) => r.id === rutaId);
    const veh = store.vehiculos.find((v) => v.id === vehId);
    const cond = store.conductores.find((c) => c.id === condId);

    const estado = dto.estado || actual.estado;
    const tiempoRealHoras =
      dto.tiempoRealHoras !== undefined
        ? Number(dto.tiempoRealHoras)
        : actual.tiempoRealHoras;
    const horasRetraso =
      dto.horasRetraso !== undefined
        ? Number(dto.horasRetraso)
        : Math.max(0, Number((tiempoRealHoras - actual.tiempoEstimadoHoras).toFixed(1)));
    const entregadoATiempo =
      dto.entregadoATiempo !== undefined
        ? dto.entregadoATiempo
        : estado !== 'Retrasado' && horasRetraso <= 0.5;

    const actualizado: PedidoLogistica = {
      ...actual,
      ...dto,
      rutaId,
      rutaNombre: ruta ? ruta.nombre : actual.rutaNombre,
      origen: ruta ? ruta.origen : actual.origen,
      destino: ruta ? ruta.destino : actual.destino,
      vehiculoId: vehId,
      vehiculoPlaca: veh ? veh.placa : actual.vehiculoPlaca,
      conductorId: condId,
      conductorNombre: cond ? cond.nombre : actual.conductorNombre,
      estado,
      tiempoRealHoras,
      horasRetraso,
      entregadoATiempo,
      fechaEntregaReal:
        estado === 'Entregado' || estado === 'Retrasado'
          ? actual.fechaEntregaReal || actual.fechaEntregaEstimada
          : null,
    };

    store.pedidos[idx] = actualizado;
    this.saveStore(store);
    return actualizado;
  }

  // ==================== CRUD VEHÍCULOS ====================
  findAllVehiculos(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.vehiculos,
      query,
      ['id', 'placa', 'tipo', 'marca', 'modelo', 'ubicacionActual', 'estado'],
      { estado: query.estado, tipo: query.tipo },
    );
  }

  createVehiculo(dto: CreateVehiculoDto): VehiculoLogistica {
    const store = this.getStore();
    const nextNum = store.vehiculos.length + 1;
    const id = `VEH-${String(nextNum).padStart(3, '0')}`;

    const nuevo: VehiculoLogistica = {
      id,
      placa: dto.placa.toUpperCase(),
      tipo: dto.tipo,
      marca: dto.marca,
      modelo: dto.modelo,
      anio: Number(dto.anio),
      capacidadToneladas: Number(dto.capacidadToneladas),
      kilometraje: Number(dto.kilometraje),
      consumoKmGalon: 9.5,
      estado: dto.estado,
      ubicacionActual: dto.ubicacionActual,
      ultimoMantenimiento: new Date().toISOString().slice(0, 10),
    };

    store.vehiculos.unshift(nuevo);
    this.saveStore(store);
    return nuevo;
  }

  updateVehiculo(id: string, dto: UpdateVehiculoDto): VehiculoLogistica {
    const store = this.getStore();
    const idx = store.vehiculos.findIndex((v) => v.id === id);
    if (idx === -1) throw new NotFoundException(`Vehículo ${id} no encontrado`);

    const actual = store.vehiculos[idx];
    const actualizado: VehiculoLogistica = {
      ...actual,
      ...dto,
      kilometraje:
        dto.kilometraje !== undefined ? Number(dto.kilometraje) : actual.kilometraje,
    };

    store.vehiculos[idx] = actualizado;
    this.saveStore(store);
    return actualizado;
  }

  // ==================== CRUD CONDUCTORES ====================
  findAllConductores(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.conductores,
      query,
      ['id', 'nombre', 'dni', 'licencia', 'telefono', 'vehiculoAsignadoId', 'estado'],
      { estado: query.estado },
    );
  }

  createConductor(dto: CreateConductorDto): ConductorLogistica {
    const store = this.getStore();
    const nextNum = store.conductores.length + 1;
    const id = `CON-${String(nextNum).padStart(3, '0')}`;

    const nuevo: ConductorLogistica = {
      id,
      nombre: dto.nombre,
      dni: dto.dni,
      licencia: dto.licencia,
      categoriaLicencia: dto.categoriaLicencia,
      telefono: dto.telefono,
      vehiculoAsignadoId: dto.vehiculoAsignadoId,
      entregasCompletadas: 0,
      entregasRetrasadas: 0,
      cumplimientoPct: 100,
      tiempoPromedioHoras: 0,
      calificacion: 4.8,
      estado: dto.estado,
    };

    store.conductores.unshift(nuevo);
    this.saveStore(store);
    return nuevo;
  }

  updateConductor(id: string, dto: UpdateConductorDto): ConductorLogistica {
    const store = this.getStore();
    const idx = store.conductores.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`Conductor ${id} no encontrado`);

    const actual = store.conductores[idx];
    const actualizado: ConductorLogistica = {
      ...actual,
      ...dto,
      calificacion:
        dto.calificacion !== undefined ? Number(dto.calificacion) : actual.calificacion,
    };

    store.conductores[idx] = actualizado;
    this.saveStore(store);
    return actualizado;
  }

  // ==================== CRUD RUTAS ====================
  findAllRutas(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.rutas,
      query,
      ['id', 'codigo', 'nombre', 'origen', 'destino', 'corredor', 'estado'],
      { estado: query.estado, corredor: query.corredor },
    );
  }

  createRuta(dto: CreateRutaDto): RutaLogistica {
    const store = this.getStore();
    const nextNum = store.rutas.length + 1;
    const id = `RUT-${String(nextNum).padStart(3, '0')}`;
    const km = Number(dto.distanciaKm);
    const hrs = Number(dto.tiempoEstimadoHoras);

    const nueva: RutaLogistica = {
      id,
      codigo: dto.codigo,
      nombre: dto.nombre,
      origen: dto.origen,
      destino: dto.destino,
      corredor: dto.corredor,
      distanciaKm: km,
      tiempoEstimadoHoras: hrs,
      tiempoPromedioRealHoras: hrs,
      peajesPEN: Math.round(km * 0.45),
      costoBasePEN: Math.round(km * 4.2 + 350),
      totalViajes: 0,
      viajesRetrasados: 0,
      cumplimientoPct: 100,
      nivelRiesgoRuta: dto.estado === 'Congestionada' ? 'Alto' : 'Bajo',
      estado: dto.estado,
    };

    store.rutas.unshift(nueva);
    this.saveStore(store);
    return nueva;
  }

  updateRuta(id: string, dto: UpdateRutaDto): RutaLogistica {
    const store = this.getStore();
    const idx = store.rutas.findIndex((r) => r.id === id);
    if (idx === -1) throw new NotFoundException(`Ruta ${id} no encontrada`);

    const actual = store.rutas[idx];
    const actualizada: RutaLogistica = {
      ...actual,
      ...dto,
      tiempoEstimadoHoras:
        dto.tiempoEstimadoHoras !== undefined
          ? Number(dto.tiempoEstimadoHoras)
          : actual.tiempoEstimadoHoras,
    };

    store.rutas[idx] = actualizada;
    this.saveStore(store);
    return actualizada;
  }
}
