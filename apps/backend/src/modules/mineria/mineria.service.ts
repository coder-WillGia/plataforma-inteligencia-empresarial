import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonStorageService } from '../../common/services/json-storage.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
  IncidenteSeguridad,
  Mantenimiento,
  Maquinaria,
  MineriaDataStore,
  MineriaKpis,
  RecomendacionMineria,
  RegistroProduccion,
} from './interfaces/mineria.interface';
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
export class MineriaService {
  private readonly fileName = 'mineria.json';

  constructor(private readonly storage: JsonStorageService) {}

  private getStore(): MineriaDataStore {
    return this.storage.readData<MineriaDataStore>(this.fileName);
  }

  private saveStore(store: MineriaDataStore): void {
    this.storage.writeData<MineriaDataStore>(this.fileName, store);
  }

  private formatMesNombre(mesCode: string): string {
    const parts = mesCode.split('-');
    if (parts.length === 2) {
      const m = MESES_NOMBRES[parts[1]] || parts[1];
      return `${m} ${parts[0]}`;
    }
    return mesCode;
  }

  getKpis(): MineriaKpis {
    const store = this.getStore();
    const produccionTotalToneladas = store.produccion.reduce(
      (acc, r) => acc + Number(r.toneladasExtraidas || 0),
      0,
    );
    const objetivoTotalToneladas = store.produccion.reduce(
      (acc, r) => acc + Number(r.toneladasObjetivo || 0),
      0,
    );
    const cumplimientoProduccionPct =
      objetivoTotalToneladas > 0
        ? Number(((produccionTotalToneladas / objetivoTotalToneladas) * 100).toFixed(1))
        : 0;

    const totalMaquinarias = store.maquinarias.length;
    const disponibilidadMaquinariaPct =
      totalMaquinarias > 0
        ? Number(
            (
              store.maquinarias.reduce((acc, m) => acc + Number(m.disponibilidadPct || 0), 0) /
              totalMaquinarias
            ).toFixed(1),
          )
        : 0;

    const horasInactividadTotal = store.maquinarias.reduce(
      (acc, m) => acc + Number(m.horasInactividadMes || 0),
      0,
    );

    const incidentesRegistrados = store.incidentes.length;
    const incidentesCriticosGraves = store.incidentes.filter(
      (i) => i.severidad === 'Crítico' || i.severidad === 'Grave',
    ).length;

    const eficienciaProd =
      store.produccion.length > 0
        ? store.produccion.reduce((acc, p) => acc + Number(p.eficienciaPct || 0), 0) /
          store.produccion.length
        : 0;
    const eficienciaMaq =
      totalMaquinarias > 0
        ? store.maquinarias.reduce((acc, m) => acc + Number(m.eficienciaOperacionalPct || 0), 0) /
          totalMaquinarias
        : 0;
    const eficienciaOperacionalPct = Number(((eficienciaProd + eficienciaMaq) / 2).toFixed(1));

    const costoMantenimientoTotalPEN = store.mantenimientos.reduce(
      (acc, m) => acc + Number(m.costoPEN || 0),
      0,
    );

    const maquinariasOperativas = store.maquinarias.filter(
      (m) => m.estado === 'Operativa',
    ).length;

    return {
      produccionTotalToneladas,
      objetivoTotalToneladas,
      cumplimientoProduccionPct,
      disponibilidadMaquinariaPct,
      horasInactividadTotal,
      incidentesRegistrados,
      incidentesCriticosGraves,
      eficienciaOperacionalPct,
      costoMantenimientoTotalPEN,
      maquinariasOperativas,
      totalMaquinarias,
    };
  }

  getGraficos() {
    const store = this.getStore();

    // 1. Producción mensual y Real vs Objetivo (agrupado por mes)
    const mapaMensual = new Map<
      string,
      { mes: string; mesNombre: string; real: number; objetivo: number; cumplimientoPct: number }
    >();

    for (const p of store.produccion) {
      const actual = mapaMensual.get(p.mes) || {
        mes: p.mes,
        mesNombre: p.mesNombre || this.formatMesNombre(p.mes),
        real: 0,
        objetivo: 0,
        cumplimientoPct: 0,
      };
      actual.real += Number(p.toneladasExtraidas || 0);
      actual.objetivo += Number(p.toneladasObjetivo || 0);
      actual.cumplimientoPct =
        actual.objetivo > 0 ? Number(((actual.real / actual.objetivo) * 100).toFixed(1)) : 0;
      mapaMensual.set(p.mes, actual);
    }

    const produccionMensual = Array.from(mapaMensual.values()).sort((a, b) =>
      a.mes.localeCompare(b.mes),
    );

    // 2. Disponibilidad por maquinaria
    const disponibilidadPorMaquinaria = [...store.maquinarias]
      .sort((a, b) => a.disponibilidadPct - b.disponibilidadPct)
      .slice(0, 12)
      .map((m) => ({
        id: m.id,
        codigo: m.codigo,
        nombre: m.nombre.replace(/\s*\([^)]*\)/g, ''),
        disponibilidadPct: m.disponibilidadPct,
        eficienciaPct: m.eficienciaOperacionalPct,
        horasInactividad: m.horasInactividadMes,
        estado: m.estado,
      }));

    // 3. Distribución de incidentes por severidad y por tipo
    const severidades = ['Leve', 'Moderado', 'Grave', 'Crítico'];
    const distribucionIncidentes = severidades.map((sev) => ({
      severidad: sev,
      cantidad: store.incidentes.filter((i) => i.severidad === sev).length,
      diasPerdidos: store.incidentes
        .filter((i) => i.severidad === sev)
        .reduce((acc, i) => acc + Number(i.diasPerdidos || 0), 0),
    }));

    const tiposMap = new Map<string, number>();
    for (const inc of store.incidentes) {
      tiposMap.set(inc.tipo, (tiposMap.get(inc.tipo) || 0) + 1);
    }
    const incidentesPorTipo = Array.from(tiposMap.entries()).map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
    }));

    // 4. Producción por mineral y unidad
    const mineralMap = new Map<string, { mineral: string; real: number; objetivo: number }>();
    for (const p of store.produccion) {
      const item = mineralMap.get(p.mineral) || { mineral: p.mineral, real: 0, objetivo: 0 };
      item.real += p.toneladasExtraidas;
      item.objetivo += p.toneladasObjetivo;
      mineralMap.set(p.mineral, item);
    }
    const produccionPorMineral = Array.from(mineralMap.values());

    return {
      produccionMensual,
      produccionRealVsObjetivo: produccionMensual,
      disponibilidadPorMaquinaria,
      distribucionIncidentes,
      incidentesPorTipo,
      produccionPorMineral,
    };
  }

  getRecomendaciones(): RecomendacionMineria[] {
    const store = this.getStore();
    const recomendaciones: RecomendacionMineria[] = [];

    // Regla 1: Maquinarias con baja disponibilidad (< 82%)
    const maqBajaDisp = store.maquinarias.filter((m) => m.disponibilidadPct < 82);
    if (maqBajaDisp.length > 0) {
      const lista = maqBajaDisp.map((m) => `${m.codigo} (${m.disponibilidadPct}%)`).join(', ');
      recomendaciones.push({
        id: 'REC-MIN-01',
        nivel: 'Crítico',
        categoria: 'Maquinaria',
        titulo: `${maqBajaDisp.length} equipos presentan disponibilidad crítica (< 82%)`,
        descripcion: `Se detectaron unidades con alta inactividad acumulada en el período actual: ${lista}. Esto impacta directamente en el acarreo y perforación de mineral.`,
        accionSugerida:
          'Priorizar intervención mecánica mayor, reasignar flota de respaldo y auditar causas raíz de paradas no programadas.',
        indicadorRelacionado: `Disponibilidad mínima registrada: ${Math.min(...maqBajaDisp.map((m) => m.disponibilidadPct))}%`,
      });
    }

    // Regla 2: Meses o frentes con producción por debajo del objetivo (< 93%)
    const prodBaja = store.produccion.filter(
      (p) => (p.toneladasExtraidas / p.toneladasObjetivo) * 100 < 93,
    );
    if (prodBaja.length > 0) {
      const déficitTotal = prodBaja.reduce(
        (acc, p) => acc + (p.toneladasObjetivo - p.toneladasExtraidas),
        0,
      );
      recomendaciones.push({
        id: 'REC-MIN-02',
        nivel: 'Alerta',
        categoria: 'Producción',
        titulo: `${prodBaja.length} registros operativos por debajo de la meta de extracción`,
        descripcion: `Existen desviaciones negativas en frentes como ${prodBaja[0].unidadMinera} (${prodBaja[0].mesNombre}), acumulando una brecha de ${déficitTotal.toLocaleString('es-PE')} toneladas frente al plan.`,
        accionSugerida:
          'Optimizar ciclo de carguío/acarreo en cambio de guardia y balancear ley de cabeza con mineral de stock de alta ley.',
        indicadorRelacionado: `Brecha acumulada: -${déficitTotal.toLocaleString('es-PE')} TM`,
      });
    }

    // Regla 3: Mantenimientos correctivos o vencidos elevados
    const mantVencidos = store.mantenimientos.filter((m) => m.estado === 'Vencido');
    const mantCorrectivos = store.mantenimientos.filter((m) => m.tipo === 'Correctivo');
    const costoCorrectivo = mantCorrectivos.reduce((acc, m) => acc + m.costoPEN, 0);
    if (mantVencidos.length > 0 || mantCorrectivos.length >= 8) {
      recomendaciones.push({
        id: 'REC-MIN-03',
        nivel: mantVencidos.length > 0 ? 'Crítico' : 'Alerta',
        categoria: 'Mantenimiento',
        titulo: `Alerta de Confiabilidad: ${mantVencidos.length} órdenes vencidas y ${mantCorrectivos.length} correctivos`,
        descripcion: `El gasto en mantenimiento correctivo asciende a S/ ${costoCorrectivo.toLocaleString('es-PE')}. Las órdenes vencidas incrementan el riesgo de falla catastrófica de componentes mayores.`,
        accionSugerida:
          'Ejecutar ventana de mantenimiento preventivo obligatorio en las próximas 48 horas y migrar monitoreo de flota crítica a mantenimiento predictivo.',
        indicadorRelacionado: `Costo Correctivo: S/ ${costoCorrectivo.toLocaleString('es-PE')}`,
      });
    }

    // Regla 4: Incidentes de seguridad abiertos o severidad Grave/Crítica
    const incAbiertos = store.incidentes.filter(
      (i) =>
        (i.severidad === 'Crítico' || i.severidad === 'Grave') && i.estado !== 'Cerrado',
    );
    if (incAbiertos.length > 0) {
      recomendaciones.push({
        id: 'REC-MIN-04',
        nivel: 'Crítico',
        categoria: 'Seguridad',
        titulo: `${incAbiertos.length} incidentes de alta severidad pendientes de cierre`,
        descripcion: `Se mantienen investigaciones abiertas en zonas operativas (${incAbiertos.map((i) => i.area).slice(0, 2).join(', ')}). El cierre oportuno de acciones correctivas es obligatorio por normativa DS-024-EM.`,
        accionSugerida:
          'Verificar cumplimiento de bloqueo LOTOTO, actualizar matriz IPERC continua y validar eficacia de barreras de ingeniería en campo.',
        indicadorRelacionado: `${incAbiertos.length} casos críticos/graves activos`,
      });
    }

    // Regla 5: Optimización energética/combustible
    const altoConsumo = store.maquinarias.filter((m) => m.consumoCombustibleGalHora > 65);
    if (altoConsumo.length > 0) {
      recomendaciones.push({
        id: 'REC-MIN-05',
        nivel: 'Optimización',
        categoria: 'Maquinaria',
        titulo: `Oportunidad de ahorro en consumo diésel en ${altoConsumo.length} equipos pesados`,
        descripcion: `Equipos de acarreo superan los 65 gal/h en pendientes pronunciadas. Ajustar ralentí en colas de pala permite reducir hasta 6.5% el consumo mensual.`,
        accionSugerida:
          'Activar control automático de despacho y nivelado continuo de rampas principales con motoniveladora.',
        indicadorRelacionado: `${altoConsumo.length} camiones > 65 gal/h`,
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

  // ==================== CRUD PRODUCCIÓN ====================
  findAllProduccion(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.produccion,
      query,
      ['id', 'unidadMinera', 'mineral', 'mesNombre', 'estado', 'observaciones'],
      { estado: query.estado, mineral: query.tipo, mes: query.mes },
    );
  }

  findOneProduccion(id: string): RegistroProduccion {
    const store = this.getStore();
    const item = store.produccion.find((p) => p.id === id);
    if (!item) throw new NotFoundException(`Registro de producción ${id} no encontrado`);
    return item;
  }

  createProduccion(dto: CreateProduccionDto): RegistroProduccion {
    const store = this.getStore();
    const nextNum = store.produccion.length + 1;
    const id = `PRD-${String(nextNum).padStart(3, '0')}`;
    const cumplimiento = (dto.toneladasExtraidas / dto.toneladasObjetivo) * 100;
    const eficienciaPct = Number(Math.min(99.9, Math.max(60, cumplimiento * 0.98)).toFixed(1));
    const estado: RegistroProduccion['estado'] =
      cumplimiento >= 98 ? 'Cumplido' : cumplimiento >= 90 ? 'En Riesgo' : 'Bajo Objetivo';

    const nuevo: RegistroProduccion = {
      id,
      mes: dto.mes,
      mesNombre: dto.mesNombre || this.formatMesNombre(dto.mes),
      fecha: dto.fecha,
      unidadMinera: dto.unidadMinera,
      mineral: dto.mineral,
      turno: dto.turno,
      toneladasExtraidas: Number(dto.toneladasExtraidas),
      toneladasObjetivo: Number(dto.toneladasObjetivo),
      leyMineralPct: Number(dto.leyMineralPct),
      horasOperacion: Number(dto.horasOperacion),
      eficienciaPct,
      estado,
      observaciones: dto.observaciones || 'Registro ingresado desde plataforma.',
    };

    store.produccion.unshift(nuevo);
    this.saveStore(store);
    return nuevo;
  }

  updateProduccion(id: string, dto: UpdateProduccionDto): RegistroProduccion {
    const store = this.getStore();
    const idx = store.produccion.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException(`Registro de producción ${id} no encontrado`);

    const actual = store.produccion[idx];
    const extraidas =
      dto.toneladasExtraidas !== undefined
        ? Number(dto.toneladasExtraidas)
        : actual.toneladasExtraidas;
    const objetivo =
      dto.toneladasObjetivo !== undefined
        ? Number(dto.toneladasObjetivo)
        : actual.toneladasObjetivo;
    const cumplimiento = objetivo > 0 ? (extraidas / objetivo) * 100 : 0;
    const eficienciaPct = Number(Math.min(99.9, Math.max(60, cumplimiento * 0.98)).toFixed(1));
    const estado: RegistroProduccion['estado'] =
      cumplimiento >= 98 ? 'Cumplido' : cumplimiento >= 90 ? 'En Riesgo' : 'Bajo Objetivo';
    const mes = dto.mes || actual.mes;

    const actualizado: RegistroProduccion = {
      ...actual,
      ...dto,
      mes,
      mesNombre: this.formatMesNombre(mes),
      toneladasExtraidas: extraidas,
      toneladasObjetivo: objetivo,
      leyMineralPct:
        dto.leyMineralPct !== undefined ? Number(dto.leyMineralPct) : actual.leyMineralPct,
      horasOperacion:
        dto.horasOperacion !== undefined ? Number(dto.horasOperacion) : actual.horasOperacion,
      eficienciaPct,
      estado,
    };

    store.produccion[idx] = actualizado;
    this.saveStore(store);
    return actualizado;
  }

  // ==================== CRUD MAQUINARIAS ====================
  findAllMaquinarias(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.maquinarias,
      query,
      ['id', 'codigo', 'nombre', 'tipo', 'marca', 'modelo', 'ubicacion', 'estado'],
      { estado: query.estado, tipo: query.tipo },
    );
  }

  findOneMaquinaria(id: string): Maquinaria {
    const store = this.getStore();
    const item = store.maquinarias.find((m) => m.id === id);
    if (!item) throw new NotFoundException(`Maquinaria ${id} no encontrada`);
    return item;
  }

  createMaquinaria(dto: CreateMaquinariaDto): Maquinaria {
    const store = this.getStore();
    const nextNum = store.maquinarias.length + 1;
    const id = `MAQ-${String(nextNum).padStart(3, '0')}`;
    const operadas = Number(dto.horasOperadasMes);
    const inactivas = Number(dto.horasInactividadMes);
    const totalHoras = Math.max(1, operadas + inactivas);
    const disponibilidadPct = Number(((operadas / totalHoras) * 100).toFixed(1));
    const eficienciaOperacionalPct = Number(
      Math.min(99, Math.max(60, disponibilidadPct * 0.96)).toFixed(1),
    );

    const nueva: Maquinaria = {
      id,
      codigo: dto.codigo,
      nombre: dto.nombre,
      tipo: dto.tipo,
      marca: dto.marca,
      modelo: dto.modelo,
      ubicacion: dto.ubicacion,
      estado: dto.estado,
      horasOperadasMes: operadas,
      horasInactividadMes: inactivas,
      disponibilidadPct,
      eficienciaOperacionalPct,
      ultimoMantenimiento: dto.ultimoMantenimiento || '2026-10-15',
      proximoMantenimiento: dto.proximoMantenimiento || '2026-12-15',
      consumoCombustibleGalHora: Number(dto.consumoCombustibleGalHora || 35),
    };

    store.maquinarias.unshift(nueva);
    this.saveStore(store);
    return nueva;
  }

  updateMaquinaria(id: string, dto: UpdateMaquinariaDto): Maquinaria {
    const store = this.getStore();
    const idx = store.maquinarias.findIndex((m) => m.id === id);
    if (idx === -1) throw new NotFoundException(`Maquinaria ${id} no encontrada`);

    const actual = store.maquinarias[idx];
    const operadas =
      dto.horasOperadasMes !== undefined
        ? Number(dto.horasOperadasMes)
        : actual.horasOperadasMes;
    const inactivas =
      dto.horasInactividadMes !== undefined
        ? Number(dto.horasInactividadMes)
        : actual.horasInactividadMes;
    const totalHoras = Math.max(1, operadas + inactivas);
    const disponibilidadPct = Number(((operadas / totalHoras) * 100).toFixed(1));
    const eficienciaOperacionalPct = Number(
      Math.min(99, Math.max(60, disponibilidadPct * 0.96)).toFixed(1),
    );

    const actualizada: Maquinaria = {
      ...actual,
      ...dto,
      horasOperadasMes: operadas,
      horasInactividadMes: inactivas,
      disponibilidadPct,
      eficienciaOperacionalPct,
    };

    store.maquinarias[idx] = actualizada;
    this.saveStore(store);
    return actualizada;
  }

  // ==================== CRUD MANTENIMIENTOS ====================
  findAllMantenimientos(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.mantenimientos,
      query,
      ['id', 'maquinariaId', 'maquinariaNombre', 'tipo', 'tecnicoResponsable', 'descripcion', 'estado'],
      { estado: query.estado, tipo: query.tipo, prioridad: query.prioridad },
    );
  }

  findOneMantenimiento(id: string): Mantenimiento {
    const store = this.getStore();
    const item = store.mantenimientos.find((m) => m.id === id);
    if (!item) throw new NotFoundException(`Mantenimiento ${id} no encontrado`);
    return item;
  }

  createMantenimiento(dto: CreateMantenimientoDto): Mantenimiento {
    const store = this.getStore();
    const nextNum = store.mantenimientos.length + 1;
    const id = `MNT-${String(nextNum).padStart(3, '0')}`;
    const maq = store.maquinarias.find((m) => m.id === dto.maquinariaId);

    const nuevo: Mantenimiento = {
      id,
      maquinariaId: dto.maquinariaId,
      maquinariaNombre: maq ? maq.nombre : dto.maquinariaId,
      tipo: dto.tipo,
      prioridad: dto.prioridad,
      fechaProgramada: dto.fechaProgramada,
      fechaEjecucion: dto.fechaEjecucion || (dto.estado === 'Completado' ? dto.fechaProgramada : null),
      duracionHoras: Number(dto.duracionHoras),
      costoPEN: Number(dto.costoPEN),
      tecnicoResponsable: dto.tecnicoResponsable,
      estado: dto.estado,
      descripcion: dto.descripcion,
    };

    store.mantenimientos.unshift(nuevo);
    this.saveStore(store);
    return nuevo;
  }

  updateMantenimiento(id: string, dto: UpdateMantenimientoDto): Mantenimiento {
    const store = this.getStore();
    const idx = store.mantenimientos.findIndex((m) => m.id === id);
    if (idx === -1) throw new NotFoundException(`Mantenimiento ${id} no encontrado`);

    const actual = store.mantenimientos[idx];
    const maqId = dto.maquinariaId || actual.maquinariaId;
    const maq = store.maquinarias.find((m) => m.id === maqId);

    const actualizado: Mantenimiento = {
      ...actual,
      ...dto,
      maquinariaId: maqId,
      maquinariaNombre: maq ? maq.nombre : actual.maquinariaNombre,
      duracionHoras:
        dto.duracionHoras !== undefined ? Number(dto.duracionHoras) : actual.duracionHoras,
      costoPEN: dto.costoPEN !== undefined ? Number(dto.costoPEN) : actual.costoPEN,
    };

    store.mantenimientos[idx] = actualizado;
    this.saveStore(store);
    return actualizado;
  }

  // ==================== CRUD INCIDENTES ====================
  findAllIncidentes(query: PaginationQueryDto) {
    const store = this.getStore();
    return this.storage.paginateAndFilter(
      store.incidentes,
      query,
      ['id', 'titulo', 'tipo', 'severidad', 'area', 'maquinariaNombre', 'responsable', 'estado'],
      { estado: query.estado, tipo: query.tipo, severidad: query.severidad },
    );
  }

  findOneIncidente(id: string): IncidenteSeguridad {
    const store = this.getStore();
    const item = store.incidentes.find((i) => i.id === id);
    if (!item) throw new NotFoundException(`Incidente ${id} no encontrado`);
    return item;
  }

  createIncidente(dto: CreateIncidenteDto): IncidenteSeguridad {
    const store = this.getStore();
    const nextNum = store.incidentes.length + 1;
    const id = `INC-${String(nextNum).padStart(3, '0')}`;
    const maq = store.maquinarias.find((m) => m.id === dto.maquinariaId);

    const nuevo: IncidenteSeguridad = {
      id,
      fecha: dto.fecha,
      mes: dto.fecha.slice(0, 7),
      titulo: dto.titulo,
      tipo: dto.tipo,
      severidad: dto.severidad,
      area: dto.area,
      maquinariaId: dto.maquinariaId,
      maquinariaNombre: maq ? maq.nombre : dto.maquinariaId,
      diasPerdidos: Number(dto.diasPerdidos),
      trabajadoresAfectados: Number(dto.trabajadoresAfectados),
      estado: dto.estado,
      responsable: dto.responsable,
      medidaCorrectiva: dto.medidaCorrectiva,
    };

    store.incidentes.unshift(nuevo);
    this.saveStore(store);
    return nuevo;
  }

  updateIncidente(id: string, dto: UpdateIncidenteDto): IncidenteSeguridad {
    const store = this.getStore();
    const idx = store.incidentes.findIndex((i) => i.id === id);
    if (idx === -1) throw new NotFoundException(`Incidente ${id} no encontrado`);

    const actual = store.incidentes[idx];
    const maqId = dto.maquinariaId || actual.maquinariaId;
    const maq = store.maquinarias.find((m) => m.id === maqId);
    const fecha = dto.fecha || actual.fecha;

    const actualizado: IncidenteSeguridad = {
      ...actual,
      ...dto,
      fecha,
      mes: fecha.slice(0, 7),
      maquinariaId: maqId,
      maquinariaNombre: maq ? maq.nombre : actual.maquinariaNombre,
      diasPerdidos:
        dto.diasPerdidos !== undefined ? Number(dto.diasPerdidos) : actual.diasPerdidos,
      trabajadoresAfectados:
        dto.trabajadoresAfectados !== undefined
          ? Number(dto.trabajadoresAfectados)
          : actual.trabajadoresAfectados,
    };

    store.incidentes[idx] = actualizado;
    this.saveStore(store);
    return actualizado;
  }
}
