import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Clock,
  Cog,
  Edit3,
  Gauge,
  HardHat,
  Pickaxe,
  Plus,
  ShieldAlert,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SectorLayout } from '../../layouts/SectorLayout';
import { api } from '../../services/api';
import {
  IncidenteSeguridad,
  Mantenimiento,
  Maquinaria,
  MineriaDashboardData,
  PaginatedResponse,
  RegistroProduccion,
} from '../../types';
import { formatNumber, formatPEN, formatPct } from '../../hooks/useFormatters';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  FormField,
  InputClass,
  KpiCard,
  LoadingState,
  Modal,
  PaginationControls,
  RecomendacionesList,
  SearchFilterBar,
  StatusBadge,
} from '../../components/ui';

const PIE_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#6366f1'];

export const MineriaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Dashboard state
  const [dashboard, setDashboard] = useState<MineriaDashboardData | null>(null);
  const [loadingDash, setLoadingDash] = useState<boolean>(true);
  const [errorDash, setErrorDash] = useState<string | null>(null);

  // Produccion state
  const [produccionRes, setProduccionRes] = useState<PaginatedResponse<RegistroProduccion> | null>(
    null,
  );
  const [prodPage, setProdPage] = useState(1);
  const [prodSearch, setProdSearch] = useState('');
  const [prodEstado, setProdEstado] = useState('TODOS');
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<RegistroProduccion | null>(null);
  const [prodForm, setProdForm] = useState({
    mes: '2026-11',
    fecha: '2026-11-15',
    unidadMinera: 'Tajo Abierto Antamina Norte',
    mineral: 'Cobre',
    turno: 'Día' as 'Día' | 'Noche',
    toneladasExtraidas: 54000,
    toneladasObjetivo: 52000,
    leyMineralPct: 1.45,
    horasOperacion: 690,
    observaciones: '',
  });

  // Maquinaria state
  const [maqRes, setMaqRes] = useState<PaginatedResponse<Maquinaria> | null>(null);
  const [allMaquinarias, setAllMaquinarias] = useState<Maquinaria[]>([]);
  const [maqPage, setMaqPage] = useState(1);
  const [maqSearch, setMaqSearch] = useState('');
  const [maqEstado, setMaqEstado] = useState('TODOS');
  const [maqModalOpen, setMaqModalOpen] = useState(false);
  const [editingMaq, setEditingMaq] = useState<Maquinaria | null>(null);
  const [maqForm, setMaqForm] = useState({
    codigo: 'EQ-CAT-125',
    nombre: 'Camión Minero #23 (797F)',
    tipo: 'Camión Minero',
    marca: 'Caterpillar',
    modelo: '797F',
    ubicacion: 'Tajo Abierto Antamina Norte',
    estado: 'Operativa' as Maquinaria['estado'],
    horasOperadasMes: 660,
    horasInactividadMes: 60,
    consumoCombustibleGalHora: 58,
  });

  // Mantenimiento state
  const [mantRes, setMantRes] = useState<PaginatedResponse<Mantenimiento> | null>(null);
  const [mantPage, setMantPage] = useState(1);
  const [mantSearch, setMantSearch] = useState('');
  const [mantEstado, setMantEstado] = useState('TODOS');
  const [mantTipo, setMantTipo] = useState('TODOS');
  const [mantModalOpen, setMantModalOpen] = useState(false);
  const [editingMant, setEditingMant] = useState<Mantenimiento | null>(null);
  const [mantForm, setMantForm] = useState({
    maquinariaId: 'MAQ-001',
    tipo: 'Preventivo' as Mantenimiento['tipo'],
    prioridad: 'Media' as Mantenimiento['prioridad'],
    fechaProgramada: '2026-11-20',
    duracionHoras: 12,
    costoPEN: 24500,
    tecnicoResponsable: 'Ing. Carlos Huamán',
    estado: 'Programado' as Mantenimiento['estado'],
    descripcion: 'Mantenimiento preventivo de sistema hidráulico y cambio de filtros.',
  });

  // Incidentes state
  const [incRes, setIncRes] = useState<PaginatedResponse<IncidenteSeguridad> | null>(null);
  const [incPage, setIncPage] = useState(1);
  const [incSearch, setIncSearch] = useState('');
  const [incSeveridad, setIncSeveridad] = useState('TODOS');
  const [incEstado, setIncEstado] = useState('TODOS');
  const [incModalOpen, setIncModalOpen] = useState(false);
  const [editingInc, setEditingInc] = useState<IncidenteSeguridad | null>(null);
  const [incForm, setIncForm] = useState({
    fecha: '2026-11-15',
    titulo: 'Sobrecalentamiento en rampa principal',
    tipo: 'Mecánico' as IncidenteSeguridad['tipo'],
    severidad: 'Moderado' as IncidenteSeguridad['severidad'],
    area: 'Tajo Abierto Antamina Norte',
    maquinariaId: 'MAQ-001',
    diasPerdidos: 1,
    trabajadoresAfectados: 0,
    estado: 'En Investigación' as IncidenteSeguridad['estado'],
    responsable: 'Ing. Rosa Quispe',
    medidaCorrectiva: 'Inspección térmica de frenos y ajuste de velocidad máxima en rampa.',
  });

  const fetchDashboard = useCallback(async () => {
    try {
      setLoadingDash(true);
      setErrorDash(null);
      const [dashData, maqList] = await Promise.all([
        api.mineria.getDashboard(),
        api.mineria.getMaquinarias({ all: 'true' }),
      ]);
      setDashboard(dashData);
      setAllMaquinarias(maqList.data);
    } catch (err: any) {
      setErrorDash(err.message || 'Error al cargar dashboard minero');
    } finally {
      setLoadingDash(false);
    }
  }, []);

  const fetchProduccion = useCallback(async () => {
    const data = await api.mineria.getProduccion({
      page: prodPage,
      limit: 8,
      search: prodSearch,
      estado: prodEstado,
    });
    setProduccionRes(data);
  }, [prodPage, prodSearch, prodEstado]);

  const fetchMaquinarias = useCallback(async () => {
    const data = await api.mineria.getMaquinarias({
      page: maqPage,
      limit: 8,
      search: maqSearch,
      estado: maqEstado,
    });
    setMaqRes(data);
  }, [maqPage, maqSearch, maqEstado]);

  const fetchMantenimientos = useCallback(async () => {
    const data = await api.mineria.getMantenimientos({
      page: mantPage,
      limit: 8,
      search: mantSearch,
      estado: mantEstado,
      tipo: mantTipo,
    });
    setMantRes(data);
  }, [mantPage, mantSearch, mantEstado, mantTipo]);

  const fetchIncidentes = useCallback(async () => {
    const data = await api.mineria.getIncidentes({
      page: incPage,
      limit: 8,
      search: incSearch,
      severidad: incSeveridad,
      estado: incEstado,
    });
    setIncRes(data);
  }, [incPage, incSearch, incSeveridad, incEstado]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    fetchProduccion();
  }, [fetchProduccion]);

  useEffect(() => {
    fetchMaquinarias();
  }, [fetchMaquinarias]);

  useEffect(() => {
    fetchMantenimientos();
  }, [fetchMantenimientos]);

  useEffect(() => {
    fetchIncidentes();
  }, [fetchIncidentes]);

  // Handlers CRUD Producción
  const openNewProd = () => {
    setEditingProd(null);
    setProdForm({
      mes: '2026-11',
      fecha: '2026-11-15',
      unidadMinera: 'Tajo Abierto Antamina Norte',
      mineral: 'Cobre',
      turno: 'Día',
      toneladasExtraidas: 54000,
      toneladasObjetivo: 52000,
      leyMineralPct: 1.45,
      horasOperacion: 690,
      observaciones: 'Operación regular controlada.',
    });
    setProdModalOpen(true);
  };

  const openEditProd = (item: RegistroProduccion) => {
    setEditingProd(item);
    setProdForm({
      mes: item.mes,
      fecha: item.fecha,
      unidadMinera: item.unidadMinera,
      mineral: item.mineral,
      turno: item.turno,
      toneladasExtraidas: item.toneladasExtraidas,
      toneladasObjetivo: item.toneladasObjetivo,
      leyMineralPct: item.leyMineralPct,
      horasOperacion: item.horasOperacion,
      observaciones: item.observaciones,
    });
    setProdModalOpen(true);
  };

  const handleSaveProd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProd) {
      await api.mineria.updateProduccion(editingProd.id, prodForm);
      showToast(`Registro de producción ${editingProd.id} actualizado correctamente.`);
    } else {
      const created = await api.mineria.createProduccion(prodForm);
      showToast(`Nuevo registro de producción ${created.id} guardado en mineria.json.`);
    }
    setProdModalOpen(false);
    await Promise.all([fetchProduccion(), fetchDashboard()]);
  };

  // Handlers CRUD Maquinaria
  const openNewMaq = () => {
    setEditingMaq(null);
    setMaqForm({
      codigo: `EQ-CAT-${120 + (allMaquinarias.length + 1)}`,
      nombre: `Camión Minero #${allMaquinarias.length + 1} (797F)`,
      tipo: 'Camión Minero',
      marca: 'Caterpillar',
      modelo: '797F',
      ubicacion: 'Tajo Abierto Antamina Norte',
      estado: 'Operativa',
      horasOperadasMes: 660,
      horasInactividadMes: 60,
      consumoCombustibleGalHora: 58,
    });
    setMaqModalOpen(true);
  };

  const openEditMaq = (item: Maquinaria) => {
    setEditingMaq(item);
    setMaqForm({
      codigo: item.codigo,
      nombre: item.nombre,
      tipo: item.tipo,
      marca: item.marca,
      modelo: item.modelo,
      ubicacion: item.ubicacion,
      estado: item.estado,
      horasOperadasMes: item.horasOperadasMes,
      horasInactividadMes: item.horasInactividadMes,
      consumoCombustibleGalHora: item.consumoCombustibleGalHora,
    });
    setMaqModalOpen(true);
  };

  const handleSaveMaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaq) {
      await api.mineria.updateMaquinaria(editingMaq.id, maqForm);
      showToast(`Maquinaria ${editingMaq.id} actualizada y KPIs recalculados.`);
    } else {
      const created = await api.mineria.createMaquinaria(maqForm);
      showToast(`Maquinaria ${created.id} registrada exitosamente.`);
    }
    setMaqModalOpen(false);
    await Promise.all([fetchMaquinarias(), fetchDashboard()]);
  };

  // Handlers CRUD Mantenimiento
  const openNewMant = () => {
    setEditingMant(null);
    setMantForm({
      maquinariaId: allMaquinarias[0]?.id || 'MAQ-001',
      tipo: 'Preventivo',
      prioridad: 'Alta',
      fechaProgramada: '2026-11-22',
      duracionHoras: 16,
      costoPEN: 28500,
      tecnicoResponsable: 'Ing. Carlos Huamán',
      estado: 'Programado',
      descripcion: 'Inspección general de transmisión y sistema hidráulico de levante.',
    });
    setMantModalOpen(true);
  };

  const openEditMant = (item: Mantenimiento) => {
    setEditingMant(item);
    setMantForm({
      maquinariaId: item.maquinariaId,
      tipo: item.tipo,
      prioridad: item.prioridad,
      fechaProgramada: item.fechaProgramada,
      duracionHoras: item.duracionHoras,
      costoPEN: item.costoPEN,
      tecnicoResponsable: item.tecnicoResponsable,
      estado: item.estado,
      descripcion: item.descripcion,
    });
    setMantModalOpen(true);
  };

  const handleSaveMant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMant) {
      await api.mineria.updateMantenimiento(editingMant.id, mantForm);
      showToast(`Orden de mantenimiento ${editingMant.id} actualizada.`);
    } else {
      const created = await api.mineria.createMantenimiento(mantForm);
      showToast(`Orden de mantenimiento ${created.id} creada exitosamente.`);
    }
    setMantModalOpen(false);
    await Promise.all([fetchMantenimientos(), fetchDashboard()]);
  };

  // Handlers CRUD Incidentes
  const openNewInc = () => {
    setEditingInc(null);
    setIncForm({
      fecha: '2026-11-15',
      titulo: 'Alerta de vibración en perforadora rotativa',
      tipo: 'Mecánico',
      severidad: 'Moderado',
      area: 'Tajo Abierto Antamina Norte',
      maquinariaId: allMaquinarias[0]?.id || 'MAQ-001',
      diasPerdidos: 1,
      trabajadoresAfectados: 0,
      estado: 'En Investigación',
      responsable: 'Ing. Rosa Quispe',
      medidaCorrectiva: 'Parada preventiva, ajuste de cabezal de rotación y revisión IPERC.',
    });
    setIncModalOpen(true);
  };

  const openEditInc = (item: IncidenteSeguridad) => {
    setEditingInc(item);
    setIncForm({
      fecha: item.fecha,
      titulo: item.titulo,
      tipo: item.tipo,
      severidad: item.severidad,
      area: item.area,
      maquinariaId: item.maquinariaId,
      diasPerdidos: item.diasPerdidos,
      trabajadoresAfectados: item.trabajadoresAfectados,
      estado: item.estado,
      responsable: item.responsable,
      medidaCorrectiva: item.medidaCorrectiva,
    });
    setIncModalOpen(true);
  };

  const handleSaveInc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInc) {
      await api.mineria.updateIncidente(editingInc.id, incForm);
      showToast(`Incidente de seguridad ${editingInc.id} actualizado.`);
    } else {
      const created = await api.mineria.createIncidente(incForm);
      showToast(`Incidente de seguridad ${created.id} registrado.`);
    }
    setIncModalOpen(false);
    await Promise.all([fetchIncidentes(), fetchDashboard()]);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Ejecutivo',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'produccion',
      label: 'Gestión de Producción',
      icon: <TrendingUp className="w-4 h-4" />,
      badge: produccionRes?.meta.total,
    },
    {
      id: 'maquinaria',
      label: 'Registro de Maquinaria',
      icon: <Cog className="w-4 h-4" />,
      badge: maqRes?.meta.total,
    },
    {
      id: 'mantenimiento',
      label: 'Seguimiento Mantenimiento',
      icon: <Wrench className="w-4 h-4" />,
      badge: mantRes?.meta.total,
    },
    {
      id: 'incidentes',
      label: 'Incidentes de Seguridad',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: incRes?.meta.total,
    },
    {
      id: 'rendimiento',
      label: 'Análisis de Rendimiento',
      icon: <Gauge className="w-4 h-4" />,
      badge: dashboard?.recomendaciones.length,
    },
  ];

  return (
    <SectorLayout
      appName="MineControl Analytics"
      sectorSubtitle="Industria Minera · Operaciones y Seguridad"
      accentColor="amber"
      icon={<Pickaxe className="w-5 h-5" />}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRefresh={() => {
        fetchDashboard();
        fetchProduccion();
        fetchMaquinarias();
        fetchMantenimientos();
        fetchIncidentes();
        showToast('Indicadores mineros sincronizados con el servidor.');
      }}
      toastMessage={toast}
    >
      {loadingDash && !dashboard ? (
        <LoadingState message="Calculando KPIs mineros y disponibilidad de flota..." />
      ) : errorDash ? (
        <ErrorState message={errorDash} onRetry={fetchDashboard} />
      ) : (
        dashboard && (
          <>
            {/* 6 KPIs Principales Siempre Visibles o en Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <KpiCard
                title="Producción Total"
                value={`${formatNumber(dashboard.kpis.produccionTotalToneladas)} TM`}
                subtitle={`Meta: ${formatNumber(dashboard.kpis.objetivoTotalToneladas)} TM`}
                icon={<Pickaxe className="w-5 h-5" />}
                accent="amber"
              />
              <KpiCard
                title="Cumplimiento Plan"
                value={formatPct(dashboard.kpis.cumplimientoProduccionPct)}
                subtitle="Producción Real vs. Objetivo"
                icon={<TrendingUp className="w-5 h-5" />}
                accent="emerald"
              />
              <KpiCard
                title="Disp. Maquinaria"
                value={formatPct(dashboard.kpis.disponibilidadMaquinariaPct)}
                subtitle={`${dashboard.kpis.maquinariasOperativas}/${dashboard.kpis.totalMaquinarias} operativas`}
                icon={<Cog className="w-5 h-5" />}
                accent="sky"
              />
              <KpiCard
                title="Horas Inactividad"
                value={`${formatNumber(dashboard.kpis.horasInactividadTotal)} hrs`}
                subtitle="Acumulado mensual flota"
                icon={<Clock className="w-5 h-5" />}
                accent="rose"
              />
              <KpiCard
                title="Incidentes Seg."
                value={String(dashboard.kpis.incidentesRegistrados)}
                subtitle={`${dashboard.kpis.incidentesCriticosGraves} graves / críticos`}
                icon={<AlertOctagon className="w-5 h-5" />}
                accent="rose"
              />
              <KpiCard
                title="Eficiencia Oper."
                value={formatPct(dashboard.kpis.eficienciaOperacionalPct)}
                subtitle={`Mant.: ${formatPEN(dashboard.kpis.costoMantenimientoTotalPEN)}`}
                icon={<Activity className="w-5 h-5" />}
                accent="indigo"
              />
            </div>

            {/* VISTA 1: DASHBOARD EJECUTIVO */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico 1: Producción Mensual */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Producción Mensual Extraída (Toneladas)</CardTitle>
                        <p className="text-xs text-slate-400">
                          Evolución de extracción mineral durante los 12 meses del año
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboard.graficos.produccionMensual}>
                          <defs>
                            <linearGradient id="colorRealMin" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="mesNombre" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#334155',
                              color: '#f8fafc',
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="real"
                            name="Toneladas Extraídas (TM)"
                            stroke="#f59e0b"
                            strokeWidth={2.5}
                            fill="url(#colorRealMin)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico 2: Producción Real vs Objetivo */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Producción Real vs. Objetivo Planificado (TM)</CardTitle>
                        <p className="text-xs text-slate-400">
                          Comparativa de cumplimiento mensual frente a metas de planeamiento minero
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboard.graficos.produccionRealVsObjetivo}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="mesNombre" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#334155',
                              color: '#f8fafc',
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="real"
                            name="Producción Real (TM)"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="objetivo"
                            name="Objetivo Plan (TM)"
                            fill="#6366f1"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico 3: Disponibilidad por Maquinaria */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Disponibilidad Mecánica por Maquinaria (%)</CardTitle>
                        <p className="text-xs text-slate-400">
                          Equipos monitoreados ordenados por menor disponibilidad operativa
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dashboard.graficos.disponibilidadPorMaquinaria}
                          layout="vertical"
                          margin={{ left: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                          <YAxis
                            type="category"
                            dataKey="codigo"
                            stroke="#94a3b8"
                            fontSize={11}
                            width={85}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#334155',
                              color: '#f8fafc',
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="disponibilidadPct"
                            name="Disponibilidad (%)"
                            fill="#38bdf8"
                            radius={[0, 4, 4, 0]}
                          />
                          <Bar
                            dataKey="eficienciaPct"
                            name="Eficiencia (%)"
                            fill="#f59e0b"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico 4: Distribución de Incidentes */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Distribución de Incidentes de Seguridad por Severidad</CardTitle>
                        <p className="text-xs text-slate-400">
                          Clasificación según normativa de seguridad y salud ocupacional minera
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboard.graficos.distribucionIncidentes}
                            dataKey="cantidad"
                            nameKey="severidad"
                            cx="50%"
                            cy="50%"
                            outerRadius={95}
                            innerRadius={52}
                            label={({ severidad, cantidad }) => `${severidad}: ${cantidad}`}
                          >
                            {dashboard.graficos.distribucionIncidentes.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#334155',
                              color: '#f8fafc',
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Recomendaciones Automáticas */}
                <RecomendacionesList
                  items={dashboard.recomendaciones}
                  title="Recomendaciones Automáticas — MineControl Analytics"
                />
              </div>
            )}

            {/* VISTA 2: GESTIÓN DE PRODUCCIÓN */}
            {activeTab === 'produccion' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Gestión y Seguimiento de Producción Minera</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Control de tonelaje extraído vs. objetivo por unidad minera, mineral y turno
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={prodSearch}
                    onSearchChange={(v) => {
                      setProdSearch(v);
                      setProdPage(1);
                    }}
                    placeholder="Buscar por unidad minera, mineral, mes o ID..."
                    filters={[
                      {
                        label: 'Estado',
                        value: prodEstado,
                        onChange: (v) => {
                          setProdEstado(v);
                          setProdPage(1);
                        },
                        options: [
                          { label: 'Cumplido', value: 'Cumplido' },
                          { label: 'En Riesgo', value: 'En Riesgo' },
                          { label: 'Bajo Objetivo', value: 'Bajo Objetivo' },
                        ],
                      },
                    ]}
                    actionButton={
                      <Button variant="amber" onClick={openNewProd}>
                        <Plus className="w-4 h-4" /> Nuevo Registro de Producción
                      </Button>
                    }
                  />

                  {!produccionRes || produccionRes.data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                              <th className="py-3 px-3">ID / Mes</th>
                              <th className="py-3 px-3">Unidad Minera</th>
                              <th className="py-3 px-3">Mineral / Turno</th>
                              <th className="py-3 px-3 text-right">Real (TM)</th>
                              <th className="py-3 px-3 text-right">Objetivo (TM)</th>
                              <th className="py-3 px-3 text-right">Ley (%)</th>
                              <th className="py-3 px-3 text-right">Eficiencia</th>
                              <th className="py-3 px-3">Estado</th>
                              <th className="py-3 px-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {produccionRes.data.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-white">{item.id}</div>
                                  <div className="text-xs text-slate-400">{item.mesNombre}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-medium text-slate-200">
                                    {item.unidadMinera}
                                  </div>
                                  <div className="text-xs text-slate-400 truncate max-w-xs">
                                    {item.observaciones}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="font-medium text-amber-300">{item.mineral}</span>
                                  <span className="text-xs text-slate-400 block">
                                    Turno {item.turno}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-white">
                                  {formatNumber(item.toneladasExtraidas)}
                                </td>
                                <td className="py-3 px-3 text-right text-slate-300">
                                  {formatNumber(item.toneladasObjetivo)}
                                </td>
                                <td className="py-3 px-3 text-right text-slate-300">
                                  {item.leyMineralPct}%
                                </td>
                                <td className="py-3 px-3 text-right font-medium text-emerald-300">
                                  {item.eficienciaPct}%
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={item.estado} />
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditProd(item)}
                                  >
                                    <Edit3 className="w-4 h-4" /> Editar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={produccionRes.meta.page}
                        totalPages={produccionRes.meta.totalPages}
                        total={produccionRes.meta.total}
                        onPageChange={setProdPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 3: REGISTRO DE MAQUINARIA */}
            {activeTab === 'maquinaria' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Registro y Control de Flota de Maquinaria Pesada</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Monitoreo de disponibilidad mecánica, horas operadas e inactividad por equipo
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={maqSearch}
                    onSearchChange={(v) => {
                      setMaqSearch(v);
                      setMaqPage(1);
                    }}
                    placeholder="Buscar por código, nombre, marca, modelo o ubicación..."
                    filters={[
                      {
                        label: 'Estado',
                        value: maqEstado,
                        onChange: (v) => {
                          setMaqEstado(v);
                          setMaqPage(1);
                        },
                        options: [
                          { label: 'Operativa', value: 'Operativa' },
                          { label: 'En Mantenimiento', value: 'En Mantenimiento' },
                          { label: 'En Revisión', value: 'En Revisión' },
                          { label: 'Inoperativa', value: 'Inoperativa' },
                        ],
                      },
                    ]}
                    actionButton={
                      <Button variant="amber" onClick={openNewMaq}>
                        <Plus className="w-4 h-4" /> Registrar Maquinaria
                      </Button>
                    }
                  />

                  {!maqRes || maqRes.data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                              <th className="py-3 px-3">Código / ID</th>
                              <th className="py-3 px-3">Equipo / Marca</th>
                              <th className="py-3 px-3">Ubicación</th>
                              <th className="py-3 px-3 text-right">Hrs Operadas</th>
                              <th className="py-3 px-3 text-right">Hrs Inactiva</th>
                              <th className="py-3 px-3">Disponibilidad</th>
                              <th className="py-3 px-3">Estado</th>
                              <th className="py-3 px-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {maqRes.data.map((m) => (
                              <tr key={m.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-amber-300">{m.codigo}</div>
                                  <div className="text-xs text-slate-500">{m.id}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-medium text-white">{m.nombre}</div>
                                  <div className="text-xs text-slate-400">
                                    {m.marca} · {m.modelo}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-slate-300">{m.ubicacion}</td>
                                <td className="py-3 px-3 text-right text-slate-200">
                                  {m.horasOperadasMes} h
                                </td>
                                <td className="py-3 px-3 text-right text-rose-300 font-medium">
                                  {m.horasInactividadMes} h
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 rounded-full bg-slate-800 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          m.disponibilidadPct >= 85
                                            ? 'bg-emerald-500'
                                            : m.disponibilidadPct >= 75
                                            ? 'bg-amber-500'
                                            : 'bg-rose-500'
                                        }`}
                                        style={{ width: `${Math.min(100, m.disponibilidadPct)}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-semibold text-white">
                                      {m.disponibilidadPct}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={m.estado} />
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => openEditMaq(m)}>
                                    <Edit3 className="w-4 h-4" /> Editar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={maqRes.meta.page}
                        totalPages={maqRes.meta.totalPages}
                        total={maqRes.meta.total}
                        onPageChange={setMaqPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 4: SEGUIMIENTO DE MANTENIMIENTO */}
            {activeTab === 'mantenimiento' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Seguimiento de Mantenimiento Preventivo, Correctivo y Predictivo</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Órdenes de trabajo, costos en soles (PEN), tiempos de parada y técnicos responsables
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={mantSearch}
                    onSearchChange={(v) => {
                      setMantSearch(v);
                      setMantPage(1);
                    }}
                    placeholder="Buscar por maquinaria, técnico, descripción o ID..."
                    filters={[
                      {
                        label: 'Estado',
                        value: mantEstado,
                        onChange: (v) => {
                          setMantEstado(v);
                          setMantPage(1);
                        },
                        options: [
                          { label: 'Completado', value: 'Completado' },
                          { label: 'En Proceso', value: 'En Proceso' },
                          { label: 'Programado', value: 'Programado' },
                          { label: 'Vencido', value: 'Vencido' },
                        ],
                      },
                      {
                        label: 'Tipo',
                        value: mantTipo,
                        onChange: (v) => {
                          setMantTipo(v);
                          setMantPage(1);
                        },
                        options: [
                          { label: 'Preventivo', value: 'Preventivo' },
                          { label: 'Correctivo', value: 'Correctivo' },
                          { label: 'Predictivo', value: 'Predictivo' },
                        ],
                      },
                    ]}
                    actionButton={
                      <Button variant="amber" onClick={openNewMant}>
                        <Plus className="w-4 h-4" /> Programar Mantenimiento
                      </Button>
                    }
                  />

                  {!mantRes || mantRes.data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                              <th className="py-3 px-3">Orden / Fecha</th>
                              <th className="py-3 px-3">Maquinaria</th>
                              <th className="py-3 px-3">Tipo / Prioridad</th>
                              <th className="py-3 px-3">Descripción / Técnico</th>
                              <th className="py-3 px-3 text-right">Duración</th>
                              <th className="py-3 px-3 text-right">Costo (PEN)</th>
                              <th className="py-3 px-3">Estado</th>
                              <th className="py-3 px-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {mantRes.data.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-white">{item.id}</div>
                                  <div className="text-xs text-slate-400">
                                    {item.fechaProgramada}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-medium text-amber-300">
                                    {item.maquinariaNombre}
                                  </div>
                                  <div className="text-xs text-slate-500">{item.maquinariaId}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-medium text-slate-200">{item.tipo}</div>
                                  <StatusBadge status={item.prioridad} />
                                </td>
                                <td className="py-3 px-3">
                                  <div className="text-slate-200 max-w-xs truncate">
                                    {item.descripcion}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    Resp: {item.tecnicoResponsable}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right text-slate-300">
                                  {item.duracionHoras} hrs
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-white">
                                  {formatPEN(item.costoPEN)}
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={item.estado} />
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditMant(item)}
                                  >
                                    <Edit3 className="w-4 h-4" /> Editar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={mantRes.meta.page}
                        totalPages={mantRes.meta.totalPages}
                        total={mantRes.meta.total}
                        onPageChange={setMantPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 5: INCIDENTES DE SEGURIDAD */}
            {activeTab === 'incidentes' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Registro e Investigación de Incidentes de Seguridad</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Control de eventos operacionales, severidad, días perdidos y planes de acción correctiva
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={incSearch}
                    onSearchChange={(v) => {
                      setIncSearch(v);
                      setIncPage(1);
                    }}
                    placeholder="Buscar por título, área, maquinaria o responsable..."
                    filters={[
                      {
                        label: 'Severidad',
                        value: incSeveridad,
                        onChange: (v) => {
                          setIncSeveridad(v);
                          setIncPage(1);
                        },
                        options: [
                          { label: 'Leve', value: 'Leve' },
                          { label: 'Moderado', value: 'Moderado' },
                          { label: 'Grave', value: 'Grave' },
                          { label: 'Crítico', value: 'Crítico' },
                        ],
                      },
                      {
                        label: 'Estado',
                        value: incEstado,
                        onChange: (v) => {
                          setIncEstado(v);
                          setIncPage(1);
                        },
                        options: [
                          { label: 'Cerrado', value: 'Cerrado' },
                          { label: 'En Investigación', value: 'En Investigación' },
                          { label: 'Acción Correctiva', value: 'Acción Correctiva' },
                        ],
                      },
                    ]}
                    actionButton={
                      <Button variant="amber" onClick={openNewInc}>
                        <Plus className="w-4 h-4" /> Reportar Incidente
                      </Button>
                    }
                  />

                  {!incRes || incRes.data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                              <th className="py-3 px-3">ID / Fecha</th>
                              <th className="py-3 px-3">Incidente / Medida Correctiva</th>
                              <th className="py-3 px-3">Área / Equipo</th>
                              <th className="py-3 px-3">Tipo</th>
                              <th className="py-3 px-3">Severidad</th>
                              <th className="py-3 px-3 text-right">Días Perdidos</th>
                              <th className="py-3 px-3">Estado</th>
                              <th className="py-3 px-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {incRes.data.map((inc) => (
                              <tr key={inc.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-white">{inc.id}</div>
                                  <div className="text-xs text-slate-400">{inc.fecha}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-medium text-white">{inc.titulo}</div>
                                  <div className="text-xs text-slate-400 max-w-xs truncate">
                                    {inc.medidaCorrectiva}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="text-slate-200">{inc.area}</div>
                                  <div className="text-xs text-amber-300">
                                    {inc.maquinariaNombre}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-slate-300">{inc.tipo}</td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={inc.severidad} />
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-rose-300">
                                  {inc.diasPerdidos} d
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={inc.estado} />
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => openEditInc(inc)}>
                                    <Edit3 className="w-4 h-4" /> Editar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={incRes.meta.page}
                        totalPages={incRes.meta.totalPages}
                        total={incRes.meta.total}
                        onPageChange={setIncPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 6: ANÁLISIS DE RENDIMIENTO Y RECOMENDACIONES */}
            {activeTab === 'rendimiento' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Rendimiento por Tipo de Mineral Extraído (TM)</CardTitle>
                        <p className="text-xs text-slate-400">
                          Comparativa acumulada de tonelaje real extraído frente al objetivo por mineral
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboard.graficos.produccionPorMineral}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="mineral" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#334155',
                              color: '#f8fafc',
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="real"
                            name="Tonelaje Real (TM)"
                            fill="#f59e0b"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="objetivo"
                            name="Tonelaje Objetivo (TM)"
                            fill="#38bdf8"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Incidentes Operacionales por Categoría Técnica</CardTitle>
                        <p className="text-xs text-slate-400">
                          Frecuencia de eventos según origen mecánico, eléctrico, operacional o personal
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboard.graficos.incidentesPorTipo}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="tipo" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#334155',
                              color: '#f8fafc',
                            }}
                          />
                          <Bar
                            dataKey="cantidad"
                            name="Incidentes Registrados"
                            fill="#f43f5e"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <RecomendacionesList
                  items={dashboard.recomendaciones}
                  title="Motor de Reglas y Recomendaciones Operacionales — Minería"
                />
              </div>
            )}
          </>
        )
      )}

      {/* MODAL CREAR / EDITAR PRODUCCIÓN */}
      <Modal
        open={prodModalOpen}
        onClose={() => setProdModalOpen(false)}
        title={
          editingProd
            ? `Editar Registro de Producción (${editingProd.id})`
            : 'Nuevo Registro de Producción Minera'
        }
      >
        <form onSubmit={handleSaveProd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Mes (YYYY-MM)">
              <input
                type="month"
                required
                value={prodForm.mes}
                onChange={(e) => setProdForm({ ...prodForm, mes: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Fecha de Corte">
              <input
                type="date"
                required
                value={prodForm.fecha}
                onChange={(e) => setProdForm({ ...prodForm, fecha: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Unidad Minera">
              <select
                value={prodForm.unidadMinera}
                onChange={(e) => setProdForm({ ...prodForm, unidadMinera: e.target.value })}
                className={InputClass}
              >
                <option value="Tajo Abierto Antamina Norte">Tajo Abierto Antamina Norte</option>
                <option value="Unidad Cerro Verde Sur">Unidad Cerro Verde Sur</option>
                <option value="Frente Las Bambas Este">Frente Las Bambas Este</option>
                <option value="Mina Subterránea Yauli">Mina Subterránea Yauli</option>
                <option value="Tajo Toromocho Central">Tajo Toromocho Central</option>
              </select>
            </FormField>
            <FormField label="Mineral Principal">
              <select
                value={prodForm.mineral}
                onChange={(e) => setProdForm({ ...prodForm, mineral: e.target.value })}
                className={InputClass}
              >
                <option value="Cobre">Cobre</option>
                <option value="Zinc">Zinc</option>
                <option value="Plata">Plata</option>
                <option value="Oro">Oro</option>
                <option value="Molibdeno">Molibdeno</option>
              </select>
            </FormField>
            <FormField label="Turno Operativo">
              <select
                value={prodForm.turno}
                onChange={(e) =>
                  setProdForm({ ...prodForm, turno: e.target.value as 'Día' | 'Noche' })
                }
                className={InputClass}
              >
                <option value="Día">Día</option>
                <option value="Noche">Noche</option>
              </select>
            </FormField>
            <FormField label="Ley de Mineral (%)">
              <input
                type="number"
                step="0.01"
                required
                value={prodForm.leyMineralPct}
                onChange={(e) =>
                  setProdForm({ ...prodForm, leyMineralPct: Number(e.target.value) })
                }
                className={InputClass}
              />
            </FormField>
            <FormField label="Toneladas Extraídas Reales (TM)">
              <input
                type="number"
                required
                value={prodForm.toneladasExtraidas}
                onChange={(e) =>
                  setProdForm({ ...prodForm, toneladasExtraidas: Number(e.target.value) })
                }
                className={InputClass}
              />
            </FormField>
            <FormField label="Toneladas Objetivo Plan (TM)">
              <input
                type="number"
                required
                value={prodForm.toneladasObjetivo}
                onChange={(e) =>
                  setProdForm({ ...prodForm, toneladasObjetivo: Number(e.target.value) })
                }
                className={InputClass}
              />
            </FormField>
          </div>
          <FormField label="Observaciones de Guardia">
            <textarea
              rows={2}
              value={prodForm.observaciones}
              onChange={(e) => setProdForm({ ...prodForm, observaciones: e.target.value })}
              className={InputClass}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setProdModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="amber">
              Guardar Producción
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL CREAR / EDITAR MAQUINARIA */}
      <Modal
        open={maqModalOpen}
        onClose={() => setMaqModalOpen(false)}
        title={
          editingMaq ? `Editar Maquinaria (${editingMaq.id})` : 'Registrar Nueva Maquinaria Pesada'
        }
      >
        <form onSubmit={handleSaveMaq} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código de Activo">
              <input
                type="text"
                required
                value={maqForm.codigo}
                onChange={(e) => setMaqForm({ ...maqForm, codigo: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Nombre del Equipo">
              <input
                type="text"
                required
                value={maqForm.nombre}
                onChange={(e) => setMaqForm({ ...maqForm, nombre: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Tipo de Maquinaria">
              <select
                value={maqForm.tipo}
                onChange={(e) => setMaqForm({ ...maqForm, tipo: e.target.value })}
                className={InputClass}
              >
                <option value="Camión Minero">Camión Minero</option>
                <option value="Pala Eléctrica">Pala Eléctrica</option>
                <option value="Perforadora Rotativa">Perforadora Rotativa</option>
                <option value="Cargador Frontal">Cargador Frontal</option>
                <option value="Tractor de Orugas">Tractor de Orugas</option>
                <option value="Motoniveladora">Motoniveladora</option>
              </select>
            </FormField>
            <FormField label="Estado Operativo">
              <select
                value={maqForm.estado}
                onChange={(e) =>
                  setMaqForm({ ...maqForm, estado: e.target.value as Maquinaria['estado'] })
                }
                className={InputClass}
              >
                <option value="Operativa">Operativa</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Inoperativa">Inoperativa</option>
              </select>
            </FormField>
            <FormField label="Marca">
              <input
                type="text"
                required
                value={maqForm.marca}
                onChange={(e) => setMaqForm({ ...maqForm, marca: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Modelo">
              <input
                type="text"
                required
                value={maqForm.modelo}
                onChange={(e) => setMaqForm({ ...maqForm, modelo: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Horas Operadas en el Mes">
              <input
                type="number"
                required
                value={maqForm.horasOperadasMes}
                onChange={(e) =>
                  setMaqForm({ ...maqForm, horasOperadasMes: Number(e.target.value) })
                }
                className={InputClass}
              />
            </FormField>
            <FormField label="Horas de Inactividad en el Mes">
              <input
                type="number"
                required
                value={maqForm.horasInactividadMes}
                onChange={(e) =>
                  setMaqForm({ ...maqForm, horasInactividadMes: Number(e.target.value) })
                }
                className={InputClass}
              />
            </FormField>
          </div>
          <FormField label="Ubicación / Frente Minero">
            <input
              type="text"
              required
              value={maqForm.ubicacion}
              onChange={(e) => setMaqForm({ ...maqForm, ubicacion: e.target.value })}
              className={InputClass}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setMaqModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="amber">
              Guardar Maquinaria
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL CREAR / EDITAR MANTENIMIENTO */}
      <Modal
        open={mantModalOpen}
        onClose={() => setMantModalOpen(false)}
        title={
          editingMant
            ? `Editar Orden de Mantenimiento (${editingMant.id})`
            : 'Programar Nuevo Mantenimiento'
        }
      >
        <form onSubmit={handleSaveMant} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Maquinaria Asociada">
              <select
                value={mantForm.maquinariaId}
                onChange={(e) => setMantForm({ ...mantForm, maquinariaId: e.target.value })}
                className={InputClass}
              >
                {allMaquinarias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Tipo de Mantenimiento">
              <select
                value={mantForm.tipo}
                onChange={(e) =>
                  setMantForm({ ...mantForm, tipo: e.target.value as Mantenimiento['tipo'] })
                }
                className={InputClass}
              >
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
                <option value="Predictivo">Predictivo</option>
              </select>
            </FormField>
            <FormField label="Prioridad">
              <select
                value={mantForm.prioridad}
                onChange={(e) =>
                  setMantForm({
                    ...mantForm,
                    prioridad: e.target.value as Mantenimiento['prioridad'],
                  })
                }
                className={InputClass}
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </FormField>
            <FormField label="Estado de la Orden">
              <select
                value={mantForm.estado}
                onChange={(e) =>
                  setMantForm({ ...mantForm, estado: e.target.value as Mantenimiento['estado'] })
                }
                className={InputClass}
              >
                <option value="Programado">Programado</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completado">Completado</option>
                <option value="Vencido">Vencido</option>
              </select>
            </FormField>
            <FormField label="Fecha Programada">
              <input
                type="date"
                required
                value={mantForm.fechaProgramada}
                onChange={(e) => setMantForm({ ...mantForm, fechaProgramada: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Duración Estimada (Horas)">
              <input
                type="number"
                required
                value={mantForm.duracionHoras}
                onChange={(e) =>
                  setMantForm({ ...mantForm, duracionHoras: Number(e.target.value) })
                }
                className={InputClass}
              />
            </FormField>
            <FormField label="Costo Estimado (Soles PEN)">
              <input
                type="number"
                required
                value={mantForm.costoPEN}
                onChange={(e) => setMantForm({ ...mantForm, costoPEN: Number(e.target.value) })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Técnico Responsable">
              <input
                type="text"
                required
                value={mantForm.tecnicoResponsable}
                onChange={(e) => setMantForm({ ...mantForm, tecnicoResponsable: e.target.value })}
                className={InputClass}
              />
            </FormField>
          </div>
          <FormField label="Descripción Técnica del Trabajo">
            <textarea
              rows={2}
              required
              value={mantForm.descripcion}
              onChange={(e) => setMantForm({ ...mantForm, descripcion: e.target.value })}
              className={InputClass}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setMantModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="amber">
              Guardar Mantenimiento
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL CREAR / EDITAR INCIDENTE */}
      <Modal
        open={incModalOpen}
        onClose={() => setIncModalOpen(false)}
        title={
          editingInc
            ? `Actualizar Incidente de Seguridad (${editingInc.id})`
            : 'Reportar Incidente de Seguridad'
        }
      >
        <form onSubmit={handleSaveInc} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Fecha del Incidente">
              <input
                type="date"
                required
                value={incForm.fecha}
                onChange={(e) => setIncForm({ ...incForm, fecha: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Tipo de Incidente">
              <select
                value={incForm.tipo}
                onChange={(e) =>
                  setIncForm({ ...incForm, tipo: e.target.value as IncidenteSeguridad['tipo'] })
                }
                className={InputClass}
              >
                <option value="Mecánico">Mecánico</option>
                <option value="Operacional">Operacional</option>
                <option value="Seguridad Personal">Seguridad Personal</option>
                <option value="Ambiental">Ambiental</option>
                <option value="Eléctrico">Eléctrico</option>
              </select>
            </FormField>
            <FormField label="Severidad">
              <select
                value={incForm.severidad}
                onChange={(e) =>
                  setIncForm({
                    ...incForm,
                    severidad: e.target.value as IncidenteSeguridad['severidad'],
                  })
                }
                className={InputClass}
              >
                <option value="Leve">Leve</option>
                <option value="Moderado">Moderado</option>
                <option value="Grave">Grave</option>
                <option value="Crítico">Crítico</option>
              </select>
            </FormField>
            <FormField label="Estado de Investigación">
              <select
                value={incForm.estado}
                onChange={(e) =>
                  setIncForm({ ...incForm, estado: e.target.value as IncidenteSeguridad['estado'] })
                }
                className={InputClass}
              >
                <option value="En Investigación">En Investigación</option>
                <option value="Acción Correctiva">Acción Correctiva</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </FormField>
            <FormField label="Maquinaria Involucrada">
              <select
                value={incForm.maquinariaId}
                onChange={(e) => setIncForm({ ...incForm, maquinariaId: e.target.value })}
                className={InputClass}
              >
                {allMaquinarias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Área / Sector">
              <input
                type="text"
                required
                value={incForm.area}
                onChange={(e) => setIncForm({ ...incForm, area: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Días Perdidos">
              <input
                type="number"
                min={0}
                required
                value={incForm.diasPerdidos}
                onChange={(e) => setIncForm({ ...incForm, diasPerdidos: Number(e.target.value) })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Supervisor Responsable">
              <input
                type="text"
                required
                value={incForm.responsable}
                onChange={(e) => setIncForm({ ...incForm, responsable: e.target.value })}
                className={InputClass}
              />
            </FormField>
          </div>
          <FormField label="Título del Evento">
            <input
              type="text"
              required
              value={incForm.titulo}
              onChange={(e) => setIncForm({ ...incForm, titulo: e.target.value })}
              className={InputClass}
            />
          </FormField>
          <FormField label="Medida Correctiva Implementada">
            <textarea
              rows={2}
              required
              value={incForm.medidaCorrectiva}
              onChange={(e) => setIncForm({ ...incForm, medidaCorrectiva: e.target.value })}
              className={InputClass}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIncModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="amber">
              Guardar Incidente
            </Button>
          </div>
        </form>
      </Modal>
    </SectorLayout>
  );
};
