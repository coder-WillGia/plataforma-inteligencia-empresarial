import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  MapPin,
  Package,
  PackageCheck,
  Plus,
  Route,
  Timer,
  Truck,
  UserCheck,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SectorLayout } from '../../layouts/SectorLayout';
import { api } from '../../services/api';
import {
  ConductorLogistica,
  LogisticaDashboardData,
  PaginatedResponse,
  PedidoLogistica,
  RutaLogistica,
  VehiculoLogistica,
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

export const LogisticaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Dashboard state
  const [dashboard, setDashboard] = useState<LogisticaDashboardData | null>(null);
  const [loadingDash, setLoadingDash] = useState<boolean>(true);
  const [errorDash, setErrorDash] = useState<string | null>(null);

  // Catalog lists for selects
  const [allVehiculos, setAllVehiculos] = useState<VehiculoLogistica[]>([]);
  const [allConductores, setAllConductores] = useState<ConductorLogistica[]>([]);
  const [allRutas, setAllRutas] = useState<RutaLogistica[]>([]);

  // Pedidos state
  const [pedidosRes, setPedidosRes] = useState<PaginatedResponse<PedidoLogistica> | null>(null);
  const [pedPage, setPedPage] = useState(1);
  const [pedSearch, setPedSearch] = useState('');
  const [pedEstado, setPedEstado] = useState('TODOS');
  const [pedPrioridad, setPedPrioridad] = useState('TODOS');
  const [pedModalOpen, setPedModalOpen] = useState(false);
  const [editingPed, setEditingPed] = useState<PedidoLogistica | null>(null);
  const [pedForm, setPedForm] = useState({
    cliente: 'Alicorp SAA',
    rutaId: 'RUT-001',
    vehiculoId: 'VEH-001',
    conductorId: 'CON-001',
    fechaPedido: '2026-11-15',
    fechaEntregaEstimada: '2026-11-16',
    pesoToneladas: 18.5,
    tiempoRealHoras: 17.5,
    prioridad: 'Express' as PedidoLogistica['prioridad'],
    estado: 'En Tránsito' as PedidoLogistica['estado'],
    observaciones: 'Despacho prioritario con monitoreo GPS activo.',
  });

  // Vehículos state
  const [vehRes, setVehRes] = useState<PaginatedResponse<VehiculoLogistica> | null>(null);
  const [vehPage, setVehPage] = useState(1);
  const [vehSearch, setVehSearch] = useState('');
  const [vehEstado, setVehEstado] = useState('TODOS');
  const [vehModalOpen, setVehModalOpen] = useState(false);
  const [editingVeh, setEditingVeh] = useState<VehiculoLogistica | null>(null);
  const [vehForm, setVehForm] = useState({
    placa: 'F9X-842',
    tipo: 'Tracto Camión 30T',
    marca: 'Volvo',
    modelo: 'FH16 600',
    anio: 2025,
    capacidadToneladas: 30,
    kilometraje: 34500,
    estado: 'Disponible' as VehiculoLogistica['estado'],
    ubicacionActual: 'Lima - Callao',
  });

  // Conductores state
  const [condRes, setCondRes] = useState<PaginatedResponse<ConductorLogistica> | null>(null);
  const [condPage, setCondPage] = useState(1);
  const [condSearch, setCondSearch] = useState('');
  const [condEstado, setCondEstado] = useState('TODOS');
  const [condModalOpen, setCondModalOpen] = useState(false);
  const [editingCond, setEditingCond] = useState<ConductorLogistica | null>(null);
  const [condForm, setCondForm] = useState({
    nombre: 'Carlos Alberto Vargas',
    dni: '43891024',
    licencia: 'Q43891024',
    categoriaLicencia: 'A-IIIc Profesional',
    telefono: '987112233',
    vehiculoAsignadoId: 'VEH-001',
    estado: 'Activo' as ConductorLogistica['estado'],
  });

  // Rutas state
  const [rutasRes, setRutasRes] = useState<PaginatedResponse<RutaLogistica> | null>(null);
  const [rutPage, setRutPage] = useState(1);
  const [rutSearch, setRutSearch] = useState('');
  const [rutEstado, setRutEstado] = useState('TODOS');
  const [rutModalOpen, setRutModalOpen] = useState(false);
  const [editingRuta, setEditingRuta] = useState<RutaLogistica | null>(null);
  const [rutaForm, setRutaForm] = useState({
    codigo: 'RT-NOR-27',
    nombre: 'Trujillo - Chiclayo (Vía Evitamiento)',
    origen: 'Trujillo',
    destino: 'Chiclayo',
    corredor: 'Costa Norte',
    distanciaKm: 210,
    tiempoEstimadoHoras: 3.5,
    estado: 'Activa' as RutaLogistica['estado'],
  });

  const fetchDashboard = useCallback(async () => {
    try {
      setLoadingDash(true);
      setErrorDash(null);
      const [dashData, vList, cList, rList] = await Promise.all([
        api.logistica.getDashboard(),
        api.logistica.getVehiculos({ all: 'true' }),
        api.logistica.getConductores({ all: 'true' }),
        api.logistica.getRutas({ all: 'true' }),
      ]);
      setDashboard(dashData);
      setAllVehiculos(vList.data);
      setAllConductores(cList.data);
      setAllRutas(rList.data);
    } catch (err: any) {
      setErrorDash(err.message || 'Error al cargar dashboard logístico');
    } finally {
      setLoadingDash(false);
    }
  }, []);

  const fetchPedidos = useCallback(async () => {
    const data = await api.logistica.getPedidos({
      page: pedPage,
      limit: 10,
      search: pedSearch,
      estado: pedEstado,
      prioridad: pedPrioridad,
    });
    setPedidosRes(data);
  }, [pedPage, pedSearch, pedEstado, pedPrioridad]);

  const fetchVehiculos = useCallback(async () => {
    const data = await api.logistica.getVehiculos({
      page: vehPage,
      limit: 10,
      search: vehSearch,
      estado: vehEstado,
    });
    setVehRes(data);
  }, [vehPage, vehSearch, vehEstado]);

  const fetchConductores = useCallback(async () => {
    const data = await api.logistica.getConductores({
      page: condPage,
      limit: 10,
      search: condSearch,
      estado: condEstado,
    });
    setCondRes(data);
  }, [condPage, condSearch, condEstado]);

  const fetchRutas = useCallback(async () => {
    const data = await api.logistica.getRutas({
      page: rutPage,
      limit: 10,
      search: rutSearch,
      estado: rutEstado,
    });
    setRutasRes(data);
  }, [rutPage, rutSearch, rutEstado]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

  useEffect(() => {
    fetchConductores();
  }, [fetchConductores]);

  useEffect(() => {
    fetchRutas();
  }, [fetchRutas]);

  // Handlers CRUD Pedidos
  const openNewPed = () => {
    setEditingPed(null);
    setPedForm({
      cliente: 'Alicorp SAA',
      rutaId: allRutas[0]?.id || 'RUT-001',
      vehiculoId: allVehiculos[0]?.id || 'VEH-001',
      conductorId: allConductores[0]?.id || 'CON-001',
      fechaPedido: '2026-11-15',
      fechaEntregaEstimada: '2026-11-16',
      pesoToneladas: 18.5,
      tiempoRealHoras: 17.5,
      prioridad: 'Express',
      estado: 'En Tránsito',
      observaciones: 'Despacho prioritario con monitoreo GPS activo.',
    });
    setPedModalOpen(true);
  };

  const openEditPed = (p: PedidoLogistica) => {
    setEditingPed(p);
    setPedForm({
      cliente: p.cliente,
      rutaId: p.rutaId,
      vehiculoId: p.vehiculoId,
      conductorId: p.conductorId,
      fechaPedido: p.fechaPedido,
      fechaEntregaEstimada: p.fechaEntregaEstimada,
      pesoToneladas: p.pesoToneladas,
      tiempoRealHoras: p.tiempoRealHoras,
      prioridad: p.prioridad,
      estado: p.estado,
      observaciones: p.observaciones,
    });
    setPedModalOpen(true);
  };

  const handleSavePed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPed) {
      await api.logistica.updatePedido(editingPed.id, pedForm);
      showToast(`Pedido ${editingPed.id} actualizado y KPIs logísticos recalculados.`);
    } else {
      const created = await api.logistica.createPedido(pedForm);
      showToast(`Nuevo pedido ${created.id} (${created.codigoGuia}) creado en logistica.json.`);
    }
    setPedModalOpen(false);
    await Promise.all([fetchPedidos(), fetchConductores(), fetchRutas(), fetchDashboard()]);
  };

  const handleQuickCompletePedido = async (p: PedidoLogistica) => {
    await api.logistica.updatePedido(p.id, {
      estado: 'Entregado',
      entregadoATiempo: true,
      horasRetraso: 0,
      tiempoRealHoras: p.tiempoEstimadoHoras,
      observaciones: 'Entrega confirmada en almacén de destino dentro de SLA.',
    });
    showToast(`Pedido ${p.id} marcado como Entregado a Tiempo.`);
    await Promise.all([fetchPedidos(), fetchConductores(), fetchRutas(), fetchDashboard()]);
  };

  // Handlers CRUD Vehículos
  const openNewVeh = () => {
    setEditingVeh(null);
    setVehForm({
      placa: 'F9X-842',
      tipo: 'Tracto Camión 30T',
      marca: 'Volvo',
      modelo: 'FH16 600',
      anio: 2025,
      capacidadToneladas: 30,
      kilometraje: 34500,
      estado: 'Disponible',
      ubicacionActual: 'Lima - Callao',
    });
    setVehModalOpen(true);
  };

  const openEditVeh = (v: VehiculoLogistica) => {
    setEditingVeh(v);
    setVehForm({
      placa: v.placa,
      tipo: v.tipo,
      marca: v.marca,
      modelo: v.modelo,
      anio: v.anio,
      capacidadToneladas: v.capacidadToneladas,
      kilometraje: v.kilometraje,
      estado: v.estado,
      ubicacionActual: v.ubicacionActual,
    });
    setVehModalOpen(true);
  };

  const handleSaveVeh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVeh) {
      await api.logistica.updateVehiculo(editingVeh.id, vehForm);
      showToast(`Vehículo ${editingVeh.id} actualizado.`);
    } else {
      const created = await api.logistica.createVehiculo(vehForm);
      showToast(`Vehículo ${created.id} (${created.placa}) incorporado a la flota.`);
    }
    setVehModalOpen(false);
    await Promise.all([fetchVehiculos(), fetchDashboard()]);
  };

  // Handlers CRUD Conductores
  const openNewCond = () => {
    setEditingCond(null);
    setCondForm({
      nombre: 'Carlos Alberto Vargas',
      dni: '43891024',
      licencia: 'Q43891024',
      categoriaLicencia: 'A-IIIc Profesional',
      telefono: '987112233',
      vehiculoAsignadoId: allVehiculos[0]?.id || 'VEH-001',
      estado: 'Activo',
    });
    setCondModalOpen(true);
  };

  const openEditCond = (c: ConductorLogistica) => {
    setEditingCond(c);
    setCondForm({
      nombre: c.nombre,
      dni: c.dni,
      licencia: c.licencia,
      categoriaLicencia: c.categoriaLicencia,
      telefono: c.telefono,
      vehiculoAsignadoId: c.vehiculoAsignadoId,
      estado: c.estado,
    });
    setCondModalOpen(true);
  };

  const handleSaveCond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCond) {
      await api.logistica.updateConductor(editingCond.id, condForm);
      showToast(`Conductor ${editingCond.id} actualizado.`);
    } else {
      const created = await api.logistica.createConductor(condForm);
      showToast(`Conductor ${created.id} registrado exitosamente.`);
    }
    setCondModalOpen(false);
    await Promise.all([fetchConductores(), fetchDashboard()]);
  };

  // Handlers CRUD Rutas
  const openNewRuta = () => {
    setEditingRuta(null);
    setRutaForm({
      codigo: `RT-NOR-${allRutas.length + 1}`,
      nombre: 'Trujillo - Chiclayo (Vía Evitamiento)',
      origen: 'Trujillo',
      destino: 'Chiclayo',
      corredor: 'Costa Norte',
      distanciaKm: 210,
      tiempoEstimadoHoras: 3.5,
      estado: 'Activa',
    });
    setRutModalOpen(true);
  };

  const openEditRuta = (r: RutaLogistica) => {
    setEditingRuta(r);
    setRutaForm({
      codigo: r.codigo,
      nombre: r.nombre,
      origen: r.origen,
      destino: r.destino,
      corredor: r.corredor,
      distanciaKm: r.distanciaKm,
      tiempoEstimadoHoras: r.tiempoEstimadoHoras,
      estado: r.estado,
    });
    setRutModalOpen(true);
  };

  const handleSaveRuta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRuta) {
      await api.logistica.updateRuta(editingRuta.id, rutaForm);
      showToast(`Ruta ${editingRuta.id} actualizada.`);
    } else {
      const created = await api.logistica.createRuta(rutaForm);
      showToast(`Nueva ruta ${created.id} habilitada.`);
    }
    setRutModalOpen(false);
    await Promise.all([fetchRutas(), fetchDashboard()]);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Logístico',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'pedidos',
      label: 'Gestión de Pedidos',
      icon: <Package className="w-4 h-4" />,
      badge: pedidosRes?.meta.total,
    },
    {
      id: 'vehiculos',
      label: 'Gestión de Vehículos',
      icon: <Truck className="w-4 h-4" />,
      badge: vehRes?.meta.total,
    },
    {
      id: 'conductores',
      label: 'Gestión de Conductores',
      icon: <UserCheck className="w-4 h-4" />,
      badge: condRes?.meta.total,
    },
    {
      id: 'entregas',
      label: 'Seguimiento de Entregas',
      icon: <Compass className="w-4 h-4" />,
      badge: dashboard?.kpis.entregasPendientes,
    },
    {
      id: 'rutas',
      label: 'Rutas y Tiempos SLA',
      icon: <Route className="w-4 h-4" />,
      badge: rutasRes?.meta.total,
    },
  ];

  return (
    <SectorLayout
      appName="LogisticsTrack Analytics"
      sectorSubtitle="Sector Logístico · Entregas, Flota y Cumplimiento de Rutas"
      accentColor="sky"
      icon={<Truck className="w-5 h-5" />}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRefresh={() => {
        fetchDashboard();
        fetchPedidos();
        fetchVehiculos();
        fetchConductores();
        fetchRutas();
        showToast('Indicadores logísticos y estado de despachos actualizados.');
      }}
      toastMessage={toast}
    >
      {loadingDash && !dashboard ? (
        <LoadingState message="Calculando cumplimiento de rutas, tiempos de entrega y disponibilidad de flota..." />
      ) : errorDash ? (
        <ErrorState message={errorDash} onRetry={fetchDashboard} />
      ) : (
        dashboard && (
          <>
            {/* 6 KPIs Principales Logísticos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <KpiCard
                title="Total de Pedidos"
                value={String(dashboard.kpis.totalPedidos)}
                subtitle={`Facturación: ${formatPEN(dashboard.kpis.costoTotalOperacionPEN)}`}
                icon={<Package className="w-5 h-5" />}
                accent="sky"
              />
              <KpiCard
                title="Entregas Completadas"
                value={String(dashboard.kpis.entregasCompletadas)}
                subtitle="Confirmadas en destino"
                icon={<PackageCheck className="w-5 h-5" />}
                accent="emerald"
              />
              <KpiCard
                title="Entregas Pendientes"
                value={String(dashboard.kpis.entregasPendientes)}
                subtitle={`${dashboard.kpis.entregasEnTransito} en tránsito activo`}
                icon={<Clock className="w-5 h-5" />}
                accent="amber"
              />
              <KpiCard
                title="Entregas Retrasadas"
                value={String(dashboard.kpis.entregasRetrasadas)}
                subtitle="Fuera de ventana SLA"
                icon={<AlertTriangle className="w-5 h-5" />}
                accent="rose"
              />
              <KpiCard
                title="Cumplimiento SLA"
                value={formatPct(dashboard.kpis.cumplimientoEntregasPct)}
                subtitle={`${dashboard.kpis.vehiculosOperativos}/${dashboard.kpis.totalVehiculos} vehículos activos`}
                icon={<CheckCircle2 className="w-5 h-5" />}
                accent="emerald"
              />
              <KpiCard
                title="Tiempo Promedio"
                value={`${dashboard.kpis.tiempoPromedioEntregaHoras} hrs`}
                subtitle={`${dashboard.kpis.conductoresActivos} conductores en operación`}
                icon={<Timer className="w-5 h-5" />}
                accent="indigo"
              />
            </div>

            {/* VISTA 1: DASHBOARD LOGÍSTICO */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico 1: Entregas por Día */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Volumen de Entregas Despachadas por Día</CardTitle>
                        <p className="text-xs text-slate-400">
                          Flujo diario de órdenes procesadas en la red nacional de distribución
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboard.graficos.entregasPorDia}>
                          <defs>
                            <linearGradient id="colorEntregas" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={11} />
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
                            dataKey="total"
                            name="Total Pedidos del Día"
                            stroke="#38bdf8"
                            strokeWidth={2.5}
                            fill="url(#colorEntregas)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico 2: Entregas a Tiempo vs Retrasadas */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Entregas a Tiempo vs. Retrasadas por Fecha</CardTitle>
                        <p className="text-xs text-slate-400">
                          Control de puntualidad diaria frente a compromisos de nivel de servicio (SLA)
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboard.graficos.entregasATiempoVsRetrasadas}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={11} />
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
                            dataKey="aTiempo"
                            name="A Tiempo"
                            stackId="a"
                            fill="#10b981"
                            radius={[0, 0, 0, 0]}
                          />
                          <Bar
                            dataKey="retrasadas"
                            name="Retrasadas"
                            stackId="a"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico 3: Rendimiento por Conductor */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Rendimiento y Puntualidad por Conductor (%)</CardTitle>
                        <p className="text-xs text-slate-400">
                          Operadores ordenados por índice de cumplimiento en entregas asignadas
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dashboard.graficos.rendimientoPorConductor}
                          layout="vertical"
                          margin={{ left: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                          <YAxis
                            type="category"
                            dataKey="nombre"
                            stroke="#94a3b8"
                            fontSize={11}
                            width={105}
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
                            dataKey="cumplimientoPct"
                            name="Cumplimiento (%)"
                            fill="#6366f1"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico 4: Cumplimiento por Ruta */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Cumplimiento Operativo por Ruta Logística (%)</CardTitle>
                        <p className="text-xs text-slate-400">
                          Identificación de rutas con mayor desviación de tiempos y congestión vial
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dashboard.graficos.cumplimientoPorRuta}
                          layout="vertical"
                          margin={{ left: 35 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                          <YAxis
                            type="category"
                            dataKey="nombre"
                            stroke="#94a3b8"
                            fontSize={11}
                            width={115}
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
                            dataKey="cumplimientoPct"
                            name="Cumplimiento Ruta (%)"
                            fill="#f59e0b"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <RecomendacionesList
                  items={dashboard.recomendaciones}
                  title="Recomendaciones Automáticas — LogisticsTrack Analytics"
                />
              </div>
            )}

            {/* VISTA 2: GESTIÓN DE PEDIDOS */}
            {activeTab === 'pedidos' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Gestión Centralizada de Pedidos y Guías de Remisión</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Administración integral de envíos, asignación de ruta, vehículo, conductor y costos en PEN
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={pedSearch}
                    onSearchChange={(v) => {
                      setPedSearch(v);
                      setPedPage(1);
                    }}
                    placeholder="Buscar por guía, cliente, origen, destino, placa o conductor..."
                    filters={[
                      {
                        label: 'Estado',
                        value: pedEstado,
                        onChange: (v) => {
                          setPedEstado(v);
                          setPedPage(1);
                        },
                        options: [
                          { label: 'Entregado', value: 'Entregado' },
                          { label: 'En Tránsito', value: 'En Tránsito' },
                          { label: 'Pendiente', value: 'Pendiente' },
                          { label: 'Retrasado', value: 'Retrasado' },
                        ],
                      },
                      {
                        label: 'Prioridad',
                        value: pedPrioridad,
                        onChange: (v) => {
                          setPedPrioridad(v);
                          setPedPage(1);
                        },
                        options: [
                          { label: 'Normal', value: 'Normal' },
                          { label: 'Express', value: 'Express' },
                          { label: 'Crítica', value: 'Crítica' },
                        ],
                      },
                    ]}
                    actionButton={
                      <Button variant="primary" onClick={openNewPed}>
                        <Plus className="w-4 h-4" /> Registrar Nuevo Pedido
                      </Button>
                    }
                  />

                  {!pedidosRes || pedidosRes.data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                              <th className="py-3 px-3">Pedido / Guía</th>
                              <th className="py-3 px-3">Cliente / Fecha</th>
                              <th className="py-3 px-3">Ruta (Origen → Destino)</th>
                              <th className="py-3 px-3">Vehículo / Conductor</th>
                              <th className="py-3 px-3 text-right">Est. / Real</th>
                              <th className="py-3 px-3 text-right">Costo (PEN)</th>
                              <th className="py-3 px-3">Prioridad</th>
                              <th className="py-3 px-3">Estado</th>
                              <th className="py-3 px-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {pedidosRes.data.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-white">{p.id}</div>
                                  <div className="text-xs text-sky-300">{p.codigoGuia}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-medium text-slate-100">{p.cliente}</div>
                                  <div className="text-xs text-slate-400">{p.fechaPedido}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-medium text-slate-200">
                                    {p.origen} → {p.destino}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {p.pesoToneladas} TN
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="text-slate-200 font-medium">
                                    {p.vehiculoPlaca}
                                  </div>
                                  <div className="text-xs text-slate-400">{p.conductorNombre}</div>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <span className="text-slate-400">{p.tiempoEstimadoHoras}h / </span>
                                  <span
                                    className={`font-semibold ${
                                      p.horasRetraso > 0 ? 'text-rose-300' : 'text-emerald-300'
                                    }`}
                                  >
                                    {p.tiempoRealHoras}h
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-white">
                                  {formatPEN(p.costoEnvioPEN)}
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={p.prioridad} />
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={p.estado} />
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => openEditPed(p)}>
                                    <Edit3 className="w-4 h-4" /> Editar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={pedidosRes.meta.page}
                        totalPages={pedidosRes.meta.totalPages}
                        total={pedidosRes.meta.total}
                        onPageChange={setPedPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 3: GESTIÓN DE VEHÍCULOS */}
            {activeTab === 'vehiculos' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Gestión de Flota de Vehículos de Carga</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Control de unidades de transporte, capacidad en toneladas, kilometraje y ubicación actual
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={vehSearch}
                    onSearchChange={(v) => {
                      setVehSearch(v);
                      setVehPage(1);
                    }}
                    placeholder="Buscar por placa, marca, modelo o ubicación..."
                    filters={[
                      {
                        label: 'Estado',
                        value: vehEstado,
                        onChange: (v) => {
                          setVehEstado(v);
                          setVehPage(1);
                        },
                        options: [
                          { label: 'En Ruta', value: 'En Ruta' },
                          { label: 'Disponible', value: 'Disponible' },
                          { label: 'En Mantenimiento', value: 'En Mantenimiento' },
                          { label: 'Fuera de Servicio', value: 'Fuera de Servicio' },
                        ],
                      },
                    ]}
                    actionButton={
                      <Button variant="primary" onClick={openNewVeh}>
                        <Plus className="w-4 h-4" /> Registrar Vehículo
                      </Button>
                    }
                  />

                  {!vehRes || vehRes.data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                              <th className="py-3 px-3">ID / Placa</th>
                              <th className="py-3 px-3">Tipo de Unidad</th>
                              <th className="py-3 px-3">Marca / Modelo / Año</th>
                              <th className="py-3 px-3 text-right">Capacidad</th>
                              <th className="py-3 px-3 text-right">Kilometraje</th>
                              <th className="py-3 px-3">Ubicación Actual</th>
                              <th className="py-3 px-3">Estado</th>
                              <th className="py-3 px-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {vehRes.data.map((v) => (
                              <tr key={v.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-3">
                                  <div className="font-bold text-sky-300">{v.placa}</div>
                                  <div className="text-xs text-slate-400">{v.id}</div>
                                </td>
                                <td className="py-3 px-3 font-medium text-white">{v.tipo}</td>
                                <td className="py-3 px-3 text-slate-300">
                                  {v.marca} {v.modelo} ({v.anio})
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-white">
                                  {v.capacidadToneladas} TN
                                </td>
                                <td className="py-3 px-3 text-right text-slate-300">
                                  {formatNumber(v.kilometraje)} km
                                </td>
                                <td className="py-3 px-3 text-slate-200">{v.ubicacionActual}</td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={v.estado} />
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => openEditVeh(v)}>
                                    <Edit3 className="w-4 h-4" /> Editar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={vehRes.meta.page}
                        totalPages={vehRes.meta.totalPages}
                        total={vehRes.meta.total}
                        onPageChange={setVehPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 4: GESTIÓN DE CONDUCTORES */}
            {activeTab === 'conductores' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Padron y Desempeño de Conductores Profesionales</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Control de licencias MTC, unidad asignada, entregas completadas y puntualidad histórica
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={condSearch}
                    onSearchChange={(v) => {
                      setCondSearch(v);
                      setCondPage(1);
                    }}
                    placeholder="Buscar por nombre, DNI, licencia o teléfono..."
                    filters={[
                      {
                        label: 'Estado',
                        value: condEstado,
                        onChange: (v) => {
                          setCondEstado(v);
                          setCondPage(1);
                        },
                        options: [
                          { label: 'Activo', value: 'Activo' },
                          { label: 'En Ruta', value: 'En Ruta' },
                          { label: 'Descanso', value: 'Descanso' },
                          { label: 'Suspendido', value: 'Suspendido' },
                        ],
                      },
                    ]}
                    actionButton={
                      <Button variant="primary" onClick={openNewCond}>
                        <Plus className="w-4 h-4" /> Registrar Conductor
                      </Button>
                    }
                  />

                  {!condRes || condRes.data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                              <th className="py-3 px-3">ID / Conductor</th>
                              <th className="py-3 px-3">DNI / Licencia MTC</th>
                              <th className="py-3 px-3">Unidad Asignada</th>
                              <th className="py-3 px-3 text-right">Entregas</th>
                              <th className="py-3 px-3 text-right">Con Retraso</th>
                              <th className="py-3 px-3">Cumplimiento SLA</th>
                              <th className="py-3 px-3">Estado</th>
                              <th className="py-3 px-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {condRes.data.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-white">{c.nombre}</div>
                                  <div className="text-xs text-slate-400">
                                    {c.id} · Tel: {c.telefono}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="text-slate-200">Lic: {c.licencia}</div>
                                  <div className="text-xs text-slate-400">
                                    DNI {c.dni} · {c.categoriaLicencia}
                                  </div>
                                </td>
                                <td className="py-3 px-3 font-medium text-sky-300">
                                  {c.vehiculoAsignadoId}
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-white">
                                  {c.entregasCompletadas}
                                </td>
                                <td className="py-3 px-3 text-right text-rose-300 font-medium">
                                  {c.entregasRetrasadas}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 rounded-full bg-slate-800 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          c.cumplimientoPct >= 85
                                            ? 'bg-emerald-500'
                                            : c.cumplimientoPct >= 75
                                            ? 'bg-amber-500'
                                            : 'bg-rose-500'
                                        }`}
                                        style={{ width: `${Math.min(100, c.cumplimientoPct)}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-bold text-white">
                                      {c.cumplimientoPct}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={c.estado} />
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => openEditCond(c)}>
                                    <Edit3 className="w-4 h-4" /> Editar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={condRes.meta.page}
                        totalPages={condRes.meta.totalPages}
                        total={condRes.meta.total}
                        onPageChange={setCondPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 5: SEGUIMIENTO DE ENTREGAS EN TIEMPO REAL */}
            {activeTab === 'entregas' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Torre de Control y Seguimiento de Entregas</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Monitoreo operativo de despachos en tránsito, confirmación rápida de recepción y control de demoras
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={pedSearch}
                    onSearchChange={(v) => {
                      setPedSearch(v);
                      setPedPage(1);
                    }}
                    placeholder="Filtrar entregas por guía, cliente o ruta..."
                    filters={[
                      {
                        label: 'Estado Operativo',
                        value: pedEstado,
                        onChange: (v) => {
                          setPedEstado(v);
                          setPedPage(1);
                        },
                        options: [
                          { label: 'En Tránsito', value: 'En Tránsito' },
                          { label: 'Pendiente', value: 'Pendiente' },
                          { label: 'Retrasado', value: 'Retrasado' },
                          { label: 'Entregado', value: 'Entregado' },
                        ],
                      },
                    ]}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pedidosRes?.data.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{p.id}</span>
                              <span className="text-xs text-sky-400 font-medium">
                                {p.codigoGuia}
                              </span>
                              <StatusBadge status={p.prioridad} />
                            </div>
                            <p className="text-sm font-semibold text-slate-200 mt-1">{p.cliente}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-sky-400" />
                              {p.rutaNombre} ({p.vehiculoPlaca} · {p.conductorNombre})
                            </p>
                          </div>
                          <StatusBadge status={p.estado} />
                        </div>

                        <div className="text-xs text-slate-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                          <span>
                            Tiempo Est.: <strong className="text-white">{p.tiempoEstimadoHoras}h</strong> ·
                            Real: <strong className="text-white">{p.tiempoRealHoras}h</strong>
                          </span>
                          <span
                            className={
                              p.horasRetraso > 0
                                ? 'text-rose-300 font-semibold'
                                : 'text-emerald-300 font-semibold'
                            }
                          >
                            {p.horasRetraso > 0 ? `+${p.horasRetraso}h demora` : 'Dentro de SLA'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-slate-400 truncate max-w-[60%]">
                            {p.observaciones}
                          </span>
                          <div className="flex items-center gap-2">
                            {p.estado !== 'Entregado' && (
                              <Button
                                variant="emerald"
                                size="sm"
                                onClick={() => handleQuickCompletePedido(p)}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar Entrega
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => openEditPed(p)}>
                              <Edit3 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pedidosRes && (
                    <div className="mt-4">
                      <PaginationControls
                        page={pedidosRes.meta.page}
                        totalPages={pedidosRes.meta.totalPages}
                        total={pedidosRes.meta.total}
                        onPageChange={setPedPage}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 6: CONTROL DE RUTAS Y ANÁLISIS DE TIEMPOS DE ENTREGA */}
            {activeTab === 'rutas' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="border-b border-slate-800/80 pb-4">
                    <div>
                      <CardTitle>Control de Rutas Nacionales y Análisis de Tiempos de Entrega</CardTitle>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Comparativa entre tiempo estimado SLA vs. tiempo promedio real por corredor logístico
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <SearchFilterBar
                      search={rutSearch}
                      onSearchChange={(v) => {
                        setRutSearch(v);
                        setRutPage(1);
                      }}
                      placeholder="Buscar por código de ruta, origen, destino o corredor..."
                      filters={[
                        {
                          label: 'Estado Ruta',
                          value: rutEstado,
                          onChange: (v) => {
                            setRutEstado(v);
                            setRutPage(1);
                          },
                          options: [
                            { label: 'Activa', value: 'Activa' },
                            { label: 'Congestionada', value: 'Congestionada' },
                            { label: 'Restringida', value: 'Restringida' },
                          ],
                        },
                      ]}
                      actionButton={
                        <Button variant="primary" onClick={openNewRuta}>
                          <Plus className="w-4 h-4" /> Nueva Ruta Logística
                        </Button>
                      }
                    />

                    {!rutasRes || rutasRes.data.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                                <th className="py-3 px-3">Código / Ruta</th>
                                <th className="py-3 px-3">Corredor / Distancia</th>
                                <th className="py-3 px-3 text-right">SLA Estimado</th>
                                <th className="py-3 px-3 text-right">Promedio Real</th>
                                <th className="py-3 px-3 text-right">Viajes / Demoras</th>
                                <th className="py-3 px-3">Cumplimiento</th>
                                <th className="py-3 px-3">Estado</th>
                                <th className="py-3 px-3 text-right">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {rutasRes.data.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-800/40">
                                  <td className="py-3 px-3">
                                    <div className="font-semibold text-white">{r.nombre}</div>
                                    <div className="text-xs text-sky-300">
                                      {r.id} · {r.codigo}
                                    </div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="text-slate-200">{r.corredor}</div>
                                    <div className="text-xs text-slate-400">
                                      {r.distanciaKm} km · Base {formatPEN(r.costoBasePEN)}
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 text-right text-slate-300">
                                    {r.tiempoEstimadoHoras} hrs
                                  </td>
                                  <td className="py-3 px-3 text-right font-bold text-amber-300">
                                    {r.tiempoPromedioRealHoras} hrs
                                  </td>
                                  <td className="py-3 px-3 text-right text-slate-300">
                                    {r.totalViajes} ({r.viajesRetrasados} retr.)
                                  </td>
                                  <td className="py-3 px-3">
                                    <span
                                      className={`font-bold ${
                                        r.cumplimientoPct >= 85
                                          ? 'text-emerald-300'
                                          : r.cumplimientoPct >= 75
                                          ? 'text-amber-300'
                                          : 'text-rose-300'
                                      }`}
                                    >
                                      {r.cumplimientoPct}%
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <StatusBadge status={r.estado} />
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditRuta(r)}
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
                          page={rutasRes.meta.page}
                          totalPages={rutasRes.meta.totalPages}
                          total={rutasRes.meta.total}
                          onPageChange={setRutPage}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>

                <RecomendacionesList
                  items={dashboard.recomendaciones}
                  title="Recomendaciones Automáticas de Optimización de Rutas y Flota"
                />
              </div>
            )}
          </>
        )
      )}

      {/* MODAL CREAR / EDITAR PEDIDO */}
      <Modal
        open={pedModalOpen}
        onClose={() => setPedModalOpen(false)}
        title={
          editingPed ? `Editar Pedido Logístico (${editingPed.id})` : 'Registrar Nuevo Pedido'
        }
      >
        <form onSubmit={handleSavePed} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Cliente Destinatario">
              <input
                type="text"
                required
                value={pedForm.cliente}
                onChange={(e) => setPedForm({ ...pedForm, cliente: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Ruta Asignada">
              <select
                value={pedForm.rutaId}
                onChange={(e) => setPedForm({ ...pedForm, rutaId: e.target.value })}
                className={InputClass}
              >
                {allRutas.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.nombre} ({r.tiempoEstimadoHoras}h)
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Vehículo Asignado">
              <select
                value={pedForm.vehiculoId}
                onChange={(e) => setPedForm({ ...pedForm, vehiculoId: e.target.value })}
                className={InputClass}
              >
                {allVehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.tipo}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Conductor Responsable">
              <select
                value={pedForm.conductorId}
                onChange={(e) => setPedForm({ ...pedForm, conductorId: e.target.value })}
                className={InputClass}
              >
                {allConductores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.cumplimientoPct}%)
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Fecha de Pedido">
              <input
                type="date"
                required
                value={pedForm.fechaPedido}
                onChange={(e) => setPedForm({ ...pedForm, fechaPedido: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Fecha Estimada Entrega">
              <input
                type="date"
                required
                value={pedForm.fechaEntregaEstimada}
                onChange={(e) => setPedForm({ ...pedForm, fechaEntregaEstimada: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Peso de Carga (Toneladas)">
              <input
                type="number"
                step="0.1"
                required
                value={pedForm.pesoToneladas}
                onChange={(e) => setPedForm({ ...pedForm, pesoToneladas: Number(e.target.value) })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Tiempo Real de Viaje (Horas)">
              <input
                type="number"
                step="0.1"
                required
                value={pedForm.tiempoRealHoras}
                onChange={(e) =>
                  setPedForm({ ...pedForm, tiempoRealHoras: Number(e.target.value) })
                }
                className={InputClass}
              />
            </FormField>
            <FormField label="Prioridad de Despacho">
              <select
                value={pedForm.prioridad}
                onChange={(e) =>
                  setPedForm({
                    ...pedForm,
                    prioridad: e.target.value as PedidoLogistica['prioridad'],
                  })
                }
                className={InputClass}
              >
                <option value="Normal">Normal</option>
                <option value="Express">Express</option>
                <option value="Crítica">Crítica</option>
              </select>
            </FormField>
            <FormField label="Estado del Pedido">
              <select
                value={pedForm.estado}
                onChange={(e) =>
                  setPedForm({ ...pedForm, estado: e.target.value as PedidoLogistica['estado'] })
                }
                className={InputClass}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Tránsito">En Tránsito</option>
                <option value="Entregado">Entregado</option>
                <option value="Retrasado">Retrasado</option>
              </select>
            </FormField>
          </div>
          <FormField label="Observaciones de Transporte">
            <textarea
              rows={2}
              value={pedForm.observaciones}
              onChange={(e) => setPedForm({ ...pedForm, observaciones: e.target.value })}
              className={InputClass}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setPedModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Pedido
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL CREAR / EDITAR VEHÍCULO */}
      <Modal
        open={vehModalOpen}
        onClose={() => setVehModalOpen(false)}
        title={
          editingVeh ? `Editar Vehículo (${editingVeh.placa})` : 'Registrar Nueva Unidad Vehicular'
        }
      >
        <form onSubmit={handleSaveVeh} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Placa de Rodaje">
              <input
                type="text"
                required
                value={vehForm.placa}
                onChange={(e) => setVehForm({ ...vehForm, placa: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Tipo de Unidad">
              <select
                value={vehForm.tipo}
                onChange={(e) => setVehForm({ ...vehForm, tipo: e.target.value })}
                className={InputClass}
              >
                <option value="Tracto Camión 30T">Tracto Camión 30T</option>
                <option value="Plataforma Pesada 25T">Plataforma Pesada 25T</option>
                <option value="Camión Furgón 15T">Camión Furgón 15T</option>
                <option value="Camión Refrigerado 10T">Camión Refrigerado 10T</option>
                <option value="Furgoneta Reparto 3.5T">Furgoneta Reparto 3.5T</option>
              </select>
            </FormField>
            <FormField label="Marca">
              <input
                type="text"
                required
                value={vehForm.marca}
                onChange={(e) => setVehForm({ ...vehForm, marca: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Modelo">
              <input
                type="text"
                required
                value={vehForm.modelo}
                onChange={(e) => setVehForm({ ...vehForm, modelo: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Capacidad (Toneladas)">
              <input
                type="number"
                step="0.5"
                required
                value={vehForm.capacidadToneladas}
                onChange={(e) =>
                  setVehForm({ ...vehForm, capacidadToneladas: Number(e.target.value) })
                }
                className={InputClass}
              />
            </FormField>
            <FormField label="Kilometraje Acumulado">
              <input
                type="number"
                required
                value={vehForm.kilometraje}
                onChange={(e) => setVehForm({ ...vehForm, kilometraje: Number(e.target.value) })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Ubicación Actual">
              <input
                type="text"
                required
                value={vehForm.ubicacionActual}
                onChange={(e) => setVehForm({ ...vehForm, ubicacionActual: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Estado Operativo">
              <select
                value={vehForm.estado}
                onChange={(e) =>
                  setVehForm({
                    ...vehForm,
                    estado: e.target.value as VehiculoLogistica['estado'],
                  })
                }
                className={InputClass}
              >
                <option value="Disponible">Disponible</option>
                <option value="En Ruta">En Ruta</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setVehModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Vehículo
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL CREAR / EDITAR CONDUCTOR */}
      <Modal
        open={condModalOpen}
        onClose={() => setCondModalOpen(false)}
        title={editingCond ? `Editar Conductor (${editingCond.id})` : 'Registrar Nuevo Conductor'}
      >
        <form onSubmit={handleSaveCond} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nombre Completo">
              <input
                type="text"
                required
                value={condForm.nombre}
                onChange={(e) => setCondForm({ ...condForm, nombre: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="DNI">
              <input
                type="text"
                required
                value={condForm.dni}
                onChange={(e) => setCondForm({ ...condForm, dni: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Licencia MTC">
              <input
                type="text"
                required
                value={condForm.licencia}
                onChange={(e) => setCondForm({ ...condForm, licencia: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Teléfono Móvil">
              <input
                type="text"
                required
                value={condForm.telefono}
                onChange={(e) => setCondForm({ ...condForm, telefono: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Vehículo Asignado">
              <select
                value={condForm.vehiculoAsignadoId}
                onChange={(e) => setCondForm({ ...condForm, vehiculoAsignadoId: e.target.value })}
                className={InputClass}
              >
                {allVehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.id} — {v.placa}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Estado">
              <select
                value={condForm.estado}
                onChange={(e) =>
                  setCondForm({
                    ...condForm,
                    estado: e.target.value as ConductorLogistica['estado'],
                  })
                }
                className={InputClass}
              >
                <option value="Activo">Activo</option>
                <option value="En Ruta">En Ruta</option>
                <option value="Descanso">Descanso</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setCondModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Conductor
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL CREAR / EDITAR RUTA */}
      <Modal
        open={rutModalOpen}
        onClose={() => setRutModalOpen(false)}
        title={editingRuta ? `Editar Ruta (${editingRuta.id})` : 'Registrar Nueva Ruta Logística'}
      >
        <form onSubmit={handleSaveRuta} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código de Ruta">
              <input
                type="text"
                required
                value={rutaForm.codigo}
                onChange={(e) => setRutaForm({ ...rutaForm, codigo: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Corredor Logístico">
              <select
                value={rutaForm.corredor}
                onChange={(e) => setRutaForm({ ...rutaForm, corredor: e.target.value })}
                className={InputClass}
              >
                <option value="Costa Norte">Costa Norte</option>
                <option value="Costa Sur">Costa Sur</option>
                <option value="Sierra Central">Sierra Central</option>
                <option value="Sur Andino">Sur Andino</option>
                <option value="Oriente">Oriente</option>
                <option value="Lima Metropolitana">Lima Metropolitana</option>
              </select>
            </FormField>
            <FormField label="Ciudad Origen">
              <input
                type="text"
                required
                value={rutaForm.origen}
                onChange={(e) => setRutaForm({ ...rutaForm, origen: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Ciudad Destino">
              <input
                type="text"
                required
                value={rutaForm.destino}
                onChange={(e) => setRutaForm({ ...rutaForm, destino: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Distancia (Km)">
              <input
                type="number"
                required
                value={rutaForm.distanciaKm}
                onChange={(e) => setRutaForm({ ...rutaForm, distanciaKm: Number(e.target.value) })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Tiempo Estimado SLA (Horas)">
              <input
                type="number"
                step="0.5"
                required
                value={rutaForm.tiempoEstimadoHoras}
                onChange={(e) =>
                  setRutaForm({ ...rutaForm, tiempoEstimadoHoras: Number(e.target.value) })
                }
                className={InputClass}
              />
            </FormField>
          </div>
          <FormField label="Nombre Descriptivo de la Ruta">
            <input
              type="text"
              required
              value={rutaForm.nombre}
              onChange={(e) => setRutaForm({ ...rutaForm, nombre: e.target.value })}
              className={InputClass}
            />
          </FormField>
          <FormField label="Estado Operativo de Vía">
            <select
              value={rutaForm.estado}
              onChange={(e) =>
                setRutaForm({ ...rutaForm, estado: e.target.value as RutaLogistica['estado'] })
              }
              className={InputClass}
            >
              <option value="Activa">Activa</option>
              <option value="Congestionada">Congestionada</option>
              <option value="Restringida">Restringida</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setRutModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Ruta
            </Button>
          </div>
        </form>
      </Modal>
    </SectorLayout>
  );
};
