import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Edit3,
  Landmark,
  Percent,
  PieChart as PieIcon,
  Plus,
  ShieldAlert,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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
  ClienteFinanciero,
  CreditoFinanciero,
  CuotaCredito,
  FinanzasDashboardData,
  PaginatedResponse,
  PagoCredito,
} from '../../types';
import { formatPEN, formatPct } from '../../hooks/useFormatters';
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

const RISK_COLORS = ['#10b981', '#38bdf8', '#f59e0b', '#ef4444'];

export const FinanzasPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Dashboard state
  const [dashboard, setDashboard] = useState<FinanzasDashboardData | null>(null);
  const [loadingDash, setLoadingDash] = useState<boolean>(true);
  const [errorDash, setErrorDash] = useState<string | null>(null);

  // Clientes state
  const [clientesRes, setClientesRes] = useState<PaginatedResponse<ClienteFinanciero> | null>(null);
  const [allClientes, setAllClientes] = useState<ClienteFinanciero[]>([]);
  const [cliPage, setCliPage] = useState(1);
  const [cliSearch, setCliSearch] = useState('');
  const [cliRiesgo, setCliRiesgo] = useState('TODOS');
  const [cliSegmento, setCliSegmento] = useState('TODOS');
  const [cliModalOpen, setCliModalOpen] = useState(false);
  const [editingCli, setEditingCli] = useState<ClienteFinanciero | null>(null);
  const [cliForm, setCliForm] = useState({
    documento: '20609911223',
    tipoDocumento: 'RUC' as 'DNI' | 'RUC',
    nombre: 'Inversiones Comerciales del Sur SAC',
    segmento: 'PYME' as ClienteFinanciero['segmento'],
    sectorEconomico: 'Comercio',
    ciudad: 'Arequipa',
    ingresosMensualesPEN: 85000,
    scoreCrediticio: 735,
    telefono: '954881234',
    email: 'finanzas@comercialsur.pe',
    estado: 'Activo' as ClienteFinanciero['estado'],
  });

  // Créditos state
  const [creditosRes, setCreditosRes] = useState<PaginatedResponse<CreditoFinanciero> | null>(null);
  const [allCreditos, setAllCreditos] = useState<CreditoFinanciero[]>([]);
  const [credPage, setCredPage] = useState(1);
  const [credSearch, setCredSearch] = useState('');
  const [credEstado, setCredEstado] = useState('TODOS');
  const [credRiesgo, setCredRiesgo] = useState('TODOS');
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState<CreditoFinanciero | null>(null);
  const [credForm, setCredForm] = useState({
    clienteId: 'CLI-001',
    producto: 'Capital de Trabajo',
    montoDesembolsadoPEN: 95000,
    saldoCapitalPEN: 95000,
    tasaAnualPct: 16.5,
    plazoMeses: 24,
    diasMora: 0,
    fechaDesembolso: '2026-11-15',
    estado: 'Vigente' as CreditoFinanciero['estado'],
  });

  // Pagos state
  const [pagosRes, setPagosRes] = useState<PaginatedResponse<PagoCredito> | null>(null);
  const [pagPage, setPagPage] = useState(1);
  const [pagSearch, setPagSearch] = useState('');
  const [pagModalOpen, setPagModalOpen] = useState(false);
  const [pagForm, setPagForm] = useState({
    creditoId: 'CRD-001',
    fechaPago: '2026-11-15',
    montoPEN: 15000,
    metodoPago: 'Transferencia Bancaria',
    referencia: 'OP-20269901',
  });

  // Cuotas state
  const [cuotasRes, setCuotasRes] = useState<PaginatedResponse<CuotaCredito> | null>(null);
  const [cuoPage, setCuoPage] = useState(1);
  const [cuoSearch, setCuoSearch] = useState('');
  const [cuoEstado, setCuoEstado] = useState('TODOS');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoadingDash(true);
      setErrorDash(null);
      const [dashData, cliAll, credAll] = await Promise.all([
        api.finanzas.getDashboard(),
        api.finanzas.getClientes({ limit: 150 }),
        api.finanzas.getCreditos({ limit: 200 }),
      ]);
      setDashboard(dashData);
      setAllClientes(cliAll.data);
      setAllCreditos(credAll.data);
    } catch (err: any) {
      setErrorDash(err.message || 'Error al cargar dashboard financiero');
    } finally {
      setLoadingDash(false);
    }
  }, []);

  const fetchClientes = useCallback(async () => {
    const data = await api.finanzas.getClientes({
      page: cliPage,
      limit: 10,
      search: cliSearch,
      nivelRiesgo: cliRiesgo,
      segmento: cliSegmento,
    });
    setClientesRes(data);
  }, [cliPage, cliSearch, cliRiesgo, cliSegmento]);

  const fetchCreditos = useCallback(async () => {
    const data = await api.finanzas.getCreditos({
      page: credPage,
      limit: 10,
      search: credSearch,
      estado: credEstado,
      nivelRiesgo: credRiesgo,
    });
    setCreditosRes(data);
  }, [credPage, credSearch, credEstado, credRiesgo]);

  const fetchPagos = useCallback(async () => {
    const data = await api.finanzas.getPagos({
      page: pagPage,
      limit: 10,
      search: pagSearch,
    });
    setPagosRes(data);
  }, [pagPage, pagSearch]);

  const fetchCuotas = useCallback(async () => {
    const data = await api.finanzas.getCuotas({
      page: cuoPage,
      limit: 10,
      search: cuoSearch,
      estado: cuoEstado,
    });
    setCuotasRes(data);
  }, [cuoPage, cuoSearch, cuoEstado]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  useEffect(() => {
    fetchCreditos();
  }, [fetchCreditos]);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  useEffect(() => {
    fetchCuotas();
  }, [fetchCuotas]);

  // Handlers CRUD Clientes
  const openNewCli = () => {
    setEditingCli(null);
    setCliForm({
      documento: '20609911223',
      tipoDocumento: 'RUC',
      nombre: 'Inversiones Comerciales del Sur SAC',
      segmento: 'PYME',
      sectorEconomico: 'Comercio',
      ciudad: 'Arequipa',
      ingresosMensualesPEN: 85000,
      scoreCrediticio: 735,
      telefono: '954881234',
      email: 'finanzas@comercialsur.pe',
      estado: 'Activo',
    });
    setCliModalOpen(true);
  };

  const openEditCli = (c: ClienteFinanciero) => {
    setEditingCli(c);
    setCliForm({
      documento: c.documento,
      tipoDocumento: c.tipoDocumento,
      nombre: c.nombre,
      segmento: c.segmento,
      sectorEconomico: c.sectorEconomico,
      ciudad: c.ciudad,
      ingresosMensualesPEN: c.ingresosMensualesPEN,
      scoreCrediticio: c.scoreCrediticio,
      telefono: c.telefono,
      email: c.email,
      estado: c.estado,
    });
    setCliModalOpen(true);
  };

  const handleSaveCli = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCli) {
      await api.finanzas.updateCliente(editingCli.id, cliForm);
      showToast(`Cliente ${editingCli.id} actualizado en finanzas.json.`);
    } else {
      const created = await api.finanzas.createCliente(cliForm);
      showToast(`Cliente ${created.id} creado exitosamente.`);
    }
    setCliModalOpen(false);
    await Promise.all([fetchClientes(), fetchDashboard()]);
  };

  // Handlers CRUD Créditos
  const openNewCred = () => {
    setEditingCred(null);
    setCredForm({
      clienteId: allClientes[0]?.id || 'CLI-001',
      producto: 'Capital de Trabajo',
      montoDesembolsadoPEN: 95000,
      saldoCapitalPEN: 95000,
      tasaAnualPct: 16.5,
      plazoMeses: 24,
      diasMora: 0,
      fechaDesembolso: '2026-11-15',
      estado: 'Vigente',
    });
    setCredModalOpen(true);
  };

  const openEditCred = (cr: CreditoFinanciero) => {
    setEditingCred(cr);
    setCredForm({
      clienteId: cr.clienteId,
      producto: cr.producto,
      montoDesembolsadoPEN: cr.montoDesembolsadoPEN,
      saldoCapitalPEN: cr.saldoCapitalPEN,
      tasaAnualPct: cr.tasaAnualPct,
      plazoMeses: cr.plazoMeses,
      diasMora: cr.diasMora,
      fechaDesembolso: cr.fechaDesembolso,
      estado: cr.estado,
    });
    setCredModalOpen(true);
  };

  const handleSaveCred = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCred) {
      await api.finanzas.updateCredito(editingCred.id, credForm);
      showToast(`Crédito ${editingCred.id} actualizado y cartera recalculada.`);
    } else {
      const created = await api.finanzas.createCredito(credForm);
      showToast(`Nuevo crédito ${created.id} desembolsado con cronograma de cuotas generado.`);
    }
    setCredModalOpen(false);
    await Promise.all([fetchCreditos(), fetchCuotas(), fetchDashboard()]);
  };

  // Handlers Registro de Pagos
  const handleSavePago = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await api.finanzas.createPago(pagForm);
    setPagModalOpen(false);
    showToast(
      `Pago ${created.id} por ${formatPEN(created.montoPEN)} registrado. Saldo de crédito y cuotas actualizados.`,
    );
    await Promise.all([fetchPagos(), fetchCreditos(), fetchCuotas(), fetchDashboard()]);
  };

  // Handler Marcar Cuota Pagada Rápido
  const handleMarkCuotaPagada = async (cuota: CuotaCredito) => {
    await api.finanzas.createPago({
      creditoId: cuota.creditoId,
      cuotaId: cuota.id,
      fechaPago: new Date().toISOString().slice(0, 10),
      montoPEN: cuota.montoTotalPEN,
      metodoPago: 'Transferencia Bancaria',
    });
    showToast(`Cuota ${cuota.id} (${cuota.clienteNombre}) liquidada exitosamente.`);
    await Promise.all([fetchCuotas(), fetchPagos(), fetchCreditos(), fetchDashboard()]);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Financiero',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'clientes',
      label: 'Gestión de Clientes',
      icon: <Users className="w-4 h-4" />,
      badge: clientesRes?.meta.total,
    },
    {
      id: 'creditos',
      label: 'Gestión de Créditos',
      icon: <CreditCard className="w-4 h-4" />,
      badge: creditosRes?.meta.total,
    },
    {
      id: 'pagos',
      label: 'Registro de Pagos',
      icon: <Banknote className="w-4 h-4" />,
      badge: pagosRes?.meta.total,
    },
    {
      id: 'cuotas',
      label: 'Seguimiento de Cuotas',
      icon: <CalendarClock className="w-4 h-4" />,
      badge: cuotasRes?.meta.total,
    },
    {
      id: 'riesgo',
      label: 'Morosidad y Riesgo',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: dashboard?.recomendaciones.length,
    },
  ];

  return (
    <SectorLayout
      appName="FinanceRisk Analytics"
      sectorSubtitle="Sector Financiero · Créditos, Cartera y Riesgo (PEN)"
      accentColor="emerald"
      icon={<Landmark className="w-5 h-5" />}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRefresh={() => {
        fetchDashboard();
        fetchClientes();
        fetchCreditos();
        fetchPagos();
        fetchCuotas();
        showToast('Indicadores financieros y saldos en PEN actualizados.');
      }}
      toastMessage={toast}
    >
      {loadingDash && !dashboard ? (
        <LoadingState message="Calculando cartera activa, morosidad y exposición en soles (PEN)..." />
      ) : errorDash ? (
        <ErrorState message={errorDash} onRetry={fetchDashboard} />
      ) : (
        dashboard && (
          <>
            {/* 6 KPIs Principales en Soles Peruanos (PEN) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <KpiCard
                title="Cartera Total Activa"
                value={formatPEN(dashboard.kpis.carteraTotalPEN)}
                subtitle={`Vigente: ${formatPEN(dashboard.kpis.carteraVigentePEN)}`}
                icon={<Wallet className="w-5 h-5" />}
                accent="emerald"
              />
              <KpiCard
                title="Créditos Activos"
                value={String(dashboard.kpis.creditosActivos)}
                subtitle={`De ${dashboard.kpis.totalCreditos} créditos totales`}
                icon={<CreditCard className="w-5 h-5" />}
                accent="sky"
              />
              <KpiCard
                title="Monto Desembolsado"
                value={formatPEN(dashboard.kpis.montoDesembolsadoPEN)}
                subtitle={`${dashboard.kpis.totalClientes} clientes registrados`}
                icon={<Banknote className="w-5 h-5" />}
                accent="indigo"
              />
              <KpiCard
                title="Índice de Morosidad"
                value={formatPct(dashboard.kpis.indiceMorosidadPct, 2)}
                subtitle={`Vencida: ${formatPEN(dashboard.kpis.carteraVencidaPEN)}`}
                icon={<Percent className="w-5 h-5" />}
                accent="rose"
              />
              <KpiCard
                title="Créditos Vencidos"
                value={String(dashboard.kpis.creditosVencidos)}
                subtitle="En mora o cobranza judicial"
                icon={<AlertTriangle className="w-5 h-5" />}
                accent="amber"
              />
              <KpiCard
                title="Recuperación Cartera"
                value={formatPct(dashboard.kpis.recuperacionCarteraPct)}
                subtitle={`Recaudado: ${formatPEN(dashboard.kpis.montoRecuperadoPEN)}`}
                icon={<TrendingUp className="w-5 h-5" />}
                accent="emerald"
              />
            </div>

            {/* VISTA 1: DASHBOARD FINANCIERO */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico 1: Evolución de Colocaciones */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Evolución Mensual de Colocaciones (Soles PEN)</CardTitle>
                        <p className="text-xs text-slate-400">
                          Desembolsos acumulados por mes de otorgamiento crediticio
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboard.graficos.evolucionColocaciones}>
                          <defs>
                            <linearGradient id="colorColoc" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="mesNombre" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip
                            formatter={(val: any) => formatPEN(Number(val))}
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#334155',
                              color: '#f8fafc',
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="colocacionesPEN"
                            name="Colocaciones (S/)"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fill="url(#colorColoc)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico 2: Cartera Vigente vs Vencida */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Cartera Vigente vs. Vencida por Segmento (PEN)</CardTitle>
                        <p className="text-xs text-slate-400">
                          Distribución del saldo de capital según segmento comercial
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboard.graficos.carteraVigenteVsVencida}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="segmento" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip
                            formatter={(val: any) => formatPEN(Number(val))}
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#334155',
                              color: '#f8fafc',
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="vigentePEN"
                            name="Cartera Vigente (S/)"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="vencidaPEN"
                            name="Cartera Vencida (S/)"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico 3: Morosidad Mensual */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Evolución del Índice de Morosidad Mensual (%)</CardTitle>
                        <p className="text-xs text-slate-400">
                          Porcentaje de cartera atrasada respecto al saldo activo mensual
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboard.graficos.morosidadMensual}>
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
                          <Line
                            type="monotone"
                            dataKey="morosidadPct"
                            name="Índice Morosidad (%)"
                            stroke="#f43f5e"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico 4: Distribución por Nivel de Riesgo */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Distribución de Créditos por Nivel de Riesgo</CardTitle>
                        <p className="text-xs text-slate-400">
                          Clasificación crediticia según comportamiento de pago y score SBS
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboard.graficos.distribucionRiesgo}
                            dataKey="cantidadCreditos"
                            nameKey="nivel"
                            cx="50%"
                            cy="50%"
                            outerRadius={95}
                            innerRadius={52}
                            label={({ nivel, cantidadCreditos }) =>
                              `${nivel}: ${cantidadCreditos}`
                            }
                          >
                            {dashboard.graficos.distribucionRiesgo.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={RISK_COLORS[index % RISK_COLORS.length]}
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

                <RecomendacionesList
                  items={dashboard.recomendaciones}
                  title="Recomendaciones Automáticas — FinanceRisk Analytics"
                />
              </div>
            )}

            {/* VISTA 2: GESTIÓN DE CLIENTES */}
            {activeTab === 'clientes' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Directorio y Calificación de Clientes Financieros</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                       Evaluación de ingresos mensuales en PEN, score crediticio y clasificación de riesgo
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={cliSearch}
                    onSearchChange={(v) => {
                      setCliSearch(v);
                      setCliPage(1);
                    }}
                    placeholder="Buscar por DNI/RUC, razón social, nombre, ciudad o ID..."
                    filters={[
                      {
                        label: 'Riesgo',
                        value: cliRiesgo,
                        onChange: (v) => {
                          setCliRiesgo(v);
                          setCliPage(1);
                        },
                        options: [
                          { label: 'Bajo', value: 'Bajo' },
                          { label: 'Moderado', value: 'Moderado' },
                          { label: 'Alto', value: 'Alto' },
                          { label: 'Crítico', value: 'Crítico' },
                        ],
                      },
                      {
                        label: 'Segmento',
                        value: cliSegmento,
                        onChange: (v) => {
                          setCliSegmento(v);
                          setCliPage(1);
                        },
                        options: [
                          { label: 'Corporativo', value: 'Corporativo' },
                          { label: 'PYME', value: 'PYME' },
                          { label: 'Microempresa', value: 'Microempresa' },
                          { label: 'Consumo Preferente', value: 'Consumo Preferente' },
                          { label: 'Consumo Masivo', value: 'Consumo Masivo' },
                        ],
                      },
                    ]}
                    actionButton={
                      <Button variant="emerald" onClick={openNewCli}>
                        <Plus className="w-4 h-4" /> Nuevo Cliente
                      </Button>
                    }
                  />

                  {!clientesRes || clientesRes.data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                              <th className="py-3 px-3">ID / Doc.</th>
                              <th className="py-3 px-3">Cliente / Ciudad</th>
                              <th className="py-3 px-3">Segmento / Sector</th>
                              <th className="py-3 px-3 text-right">Ingresos Mes (PEN)</th>
                              <th className="py-3 px-3 text-right">Score</th>
                              <th className="py-3 px-3">Nivel Riesgo</th>
                              <th className="py-3 px-3">Estado</th>
                              <th className="py-3 px-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {clientesRes.data.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-white">{c.id}</div>
                                  <div className="text-xs text-slate-400">
                                    {c.tipoDocumento}: {c.documento}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-medium text-slate-100">{c.nombre}</div>
                                  <div className="text-xs text-slate-400">
                                    {c.ciudad} · {c.email}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="text-emerald-300 font-medium">{c.segmento}</div>
                                  <div className="text-xs text-slate-400">{c.sectorEconomico}</div>
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-white">
                                  {formatPEN(c.ingresosMensualesPEN)}
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-slate-200">
                                  {c.scoreCrediticio} pts
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={c.nivelRiesgo} />
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={c.estado} />
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => openEditCli(c)}>
                                    <Edit3 className="w-4 h-4" /> Editar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={clientesRes.meta.page}
                        totalPages={clientesRes.meta.totalPages}
                        total={clientesRes.meta.total}
                        onPageChange={setCliPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 3: GESTIÓN DE CRÉDITOS */}
            {activeTab === 'creditos' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Gestión de Cartera de Créditos (PEN)</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Control de desembolsos, saldo capital vigente, tasas TEA, días de mora y estado legal
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={credSearch}
                    onSearchChange={(v) => {
                      setCredSearch(v);
                      setCredPage(1);
                    }}
                    placeholder="Buscar por código de crédito, cliente, RUC/DNI o producto..."
                    filters={[
                      {
                        label: 'Estado',
                        value: credEstado,
                        onChange: (v) => {
                          setCredEstado(v);
                          setCredPage(1);
                        },
                        options: [
                          { label: 'Vigente', value: 'Vigente' },
                          { label: 'Vencido', value: 'Vencido' },
                          { label: 'En Cobranza Judicial', value: 'En Cobranza Judicial' },
                          { label: 'Cancelado', value: 'Cancelado' },
                        ],
                      },
                      {
                        label: 'Riesgo',
                        value: credRiesgo,
                        onChange: (v) => {
                          setCredRiesgo(v);
                          setCredPage(1);
                        },
                        options: [
                          { label: 'Bajo', value: 'Bajo' },
                          { label: 'Moderado', value: 'Moderado' },
                          { label: 'Alto', value: 'Alto' },
                          { label: 'Crítico', value: 'Crítico' },
                        ],
                      },
                    ]}
                    actionButton={
                      <Button variant="emerald" onClick={openNewCred}>
                        <Plus className="w-4 h-4" /> Otorgar Nuevo Crédito
                      </Button>
                    }
                  />

                  {!creditosRes || creditosRes.data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                              <th className="py-3 px-3">Crédito / Fecha</th>
                              <th className="py-3 px-3">Cliente / Documento</th>
                              <th className="py-3 px-3">Producto / TEA</th>
                              <th className="py-3 px-3 text-right">Desembolso</th>
                              <th className="py-3 px-3 text-right">Saldo Capital</th>
                              <th className="py-3 px-3 text-right">Días Mora</th>
                              <th className="py-3 px-3">Riesgo</th>
                              <th className="py-3 px-3">Estado</th>
                              <th className="py-3 px-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {creditosRes.data.map((cr) => (
                              <tr key={cr.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-white">{cr.id}</div>
                                  <div className="text-xs text-slate-400">{cr.fechaDesembolso}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-medium text-slate-100">
                                    {cr.clienteNombre}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {cr.clienteDocumento} · {cr.segmento}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="text-emerald-300 font-medium">{cr.producto}</div>
                                  <div className="text-xs text-slate-400">
                                    TEA {cr.tasaAnualPct}% · {cr.plazoMeses} m
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right text-slate-300">
                                  {formatPEN(cr.montoDesembolsadoPEN)}
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-white">
                                  {formatPEN(cr.saldoCapitalPEN)}
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-rose-300">
                                  {cr.diasMora} d
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={cr.nivelRiesgo} />
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={cr.estado} />
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditCred(cr)}
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
                        page={creditosRes.meta.page}
                        totalPages={creditosRes.meta.totalPages}
                        total={creditosRes.meta.total}
                        onPageChange={setCredPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 4: REGISTRO DE PAGOS */}
            {activeTab === 'pagos' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Registro Histórico de Pagos y Amortizaciones (PEN)</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cada pago amortiza automáticamente el saldo capital del crédito y actualiza el cronograma
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={pagSearch}
                    onSearchChange={(v) => {
                      setPagSearch(v);
                      setPagPage(1);
                    }}
                    placeholder="Buscar por operación, cliente, crédito o método de pago..."
                    actionButton={
                      <Button variant="emerald" onClick={() => setPagModalOpen(true)}>
                        <Plus className="w-4 h-4" /> Registrar Nuevo Pago
                      </Button>
                    }
                  />

                  {!pagosRes || pagosRes.data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                              <th className="py-3 px-3">ID Pago / Ref.</th>
                              <th className="py-3 px-3">Crédito / Cuota</th>
                              <th className="py-3 px-3">Cliente</th>
                              <th className="py-3 px-3">Fecha de Pago</th>
                              <th className="py-3 px-3">Canal / Método</th>
                              <th className="py-3 px-3 text-right">Monto Pagado (PEN)</th>
                              <th className="py-3 px-3">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {pagosRes.data.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-white">{p.id}</div>
                                  <div className="text-xs text-slate-400">{p.referencia}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-medium text-emerald-300">{p.creditoId}</div>
                                  <div className="text-xs text-slate-400">{p.cuotaId}</div>
                                </td>
                                <td className="py-3 px-3 font-medium text-slate-200">
                                  {p.clienteNombre}
                                </td>
                                <td className="py-3 px-3 text-slate-300">{p.fechaPago}</td>
                                <td className="py-3 px-3 text-slate-300">{p.metodoPago}</td>
                                <td className="py-3 px-3 text-right font-bold text-emerald-300">
                                  {formatPEN(p.montoPEN)}
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={p.estado} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={pagosRes.meta.page}
                        totalPages={pagosRes.meta.totalPages}
                        total={pagosRes.meta.total}
                        onPageChange={setPagPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 5: SEGUIMIENTO DE CUOTAS */}
            {activeTab === 'cuotas' && (
              <Card>
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <div>
                    <CardTitle>Seguimiento de Cronogramas de Cuotas</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Control detallado de vencimientos, intereses, cargos moratorios y liquidación inmediata
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SearchFilterBar
                    search={cuoSearch}
                    onSearchChange={(v) => {
                      setCuoSearch(v);
                      setCuoPage(1);
                    }}
                    placeholder="Buscar por cuota, crédito o nombre de cliente..."
                    filters={[
                      {
                        label: 'Estado Cuota',
                        value: cuoEstado,
                        onChange: (v) => {
                          setCuoEstado(v);
                          setCuoPage(1);
                        },
                        options: [
                          { label: 'Pagada', value: 'Pagada' },
                          { label: 'Pendiente', value: 'Pendiente' },
                          { label: 'Vencida', value: 'Vencida' },
                          { label: 'Parcial', value: 'Parcial' },
                        ],
                      },
                    ]}
                  />

                  {!cuotasRes || cuotasRes.data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                              <th className="py-3 px-3">Cuota / Crédito</th>
                              <th className="py-3 px-3">Cliente</th>
                              <th className="py-3 px-3">Vencimiento</th>
                              <th className="py-3 px-3 text-right">Capital</th>
                              <th className="py-3 px-3 text-right">Interés + Mora</th>
                              <th className="py-3 px-3 text-right">Total Cuota</th>
                              <th className="py-3 px-3 text-right">Días Mora</th>
                              <th className="py-3 px-3">Estado</th>
                              <th className="py-3 px-3 text-right">Liquidación</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {cuotasRes.data.map((cu) => (
                              <tr key={cu.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-white">
                                    {cu.id} (#{cu.numeroCuota})
                                  </div>
                                  <div className="text-xs text-emerald-300">{cu.creditoId}</div>
                                </td>
                                <td className="py-3 px-3 font-medium text-slate-200">
                                  {cu.clienteNombre}
                                </td>
                                <td className="py-3 px-3 text-slate-300">{cu.fechaVencimiento}</td>
                                <td className="py-3 px-3 text-right text-slate-300">
                                  {formatPEN(cu.montoCapitalPEN)}
                                </td>
                                <td className="py-3 px-3 text-right text-slate-300">
                                  {formatPEN(cu.montoInteresPEN + cu.montoMoraPEN)}
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-white">
                                  {formatPEN(cu.montoTotalPEN)}
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-rose-300">
                                  {cu.diasMora} d
                                </td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={cu.estado} />
                                </td>
                                <td className="py-3 px-3 text-right">
                                  {cu.estado !== 'Pagada' ? (
                                    <Button
                                      variant="emerald"
                                      size="sm"
                                      onClick={() => handleMarkCuotaPagada(cu)}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Cobrar Cuota
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-slate-500">
                                      Pagada ({cu.fechaPago})
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={cuotasRes.meta.page}
                        totalPages={cuotasRes.meta.totalPages}
                        total={cuotasRes.meta.total}
                        onPageChange={setCuoPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* VISTA 6: ANÁLISIS DE MOROSIDAD Y RIESGO */}
            {activeTab === 'riesgo' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Envejecimiento de Cartera por Tramos de Mora (PEN)</CardTitle>
                        <p className="text-xs text-slate-400">
                          Exposición de capital según antigüedad del incumplimiento crediticio
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboard.graficos.tramosMora}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="tramo" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip
                            formatter={(val: any) => formatPEN(Number(val))}
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#334155',
                              color: '#f8fafc',
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="saldoPEN"
                            name="Saldo Expuesto (S/)"
                            fill="#f59e0b"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Matriz de Exposición Financiera por Nivel de Riesgo</CardTitle>
                        <p className="text-xs text-slate-400">
                          Concentración de clientes, operaciones y saldo activo en soles (PEN)
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {dashboard.graficos.distribucionRiesgo.map((item) => (
                          <div
                            key={item.nivel}
                            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <StatusBadge status={item.nivel} />
                              <div>
                                <div className="text-sm font-semibold text-white">
                                  Riesgo {item.nivel}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {item.cantidadClientes} clientes · {item.cantidadCreditos}{' '}
                                  créditos
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-emerald-300">
                                {formatPEN(item.saldoCarteraPEN)}
                              </div>
                              <div className="text-xs text-slate-500">Saldo Capital</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <RecomendacionesList
                  items={dashboard.recomendaciones}
                  title="Motor de Reglas de Riesgo Crediticio y Cobranza"
                />
              </div>
            )}
          </>
        )
      )}

      {/* MODAL CREAR / EDITAR CLIENTE */}
      <Modal
        open={cliModalOpen}
        onClose={() => setCliModalOpen(false)}
        title={
          editingCli ? `Editar Cliente (${editingCli.id})` : 'Registrar Nuevo Cliente Financiero'
        }
      >
        <form onSubmit={handleSaveCli} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Tipo de Documento">
              <select
                value={cliForm.tipoDocumento}
                onChange={(e) =>
                  setCliForm({ ...cliForm, tipoDocumento: e.target.value as 'DNI' | 'RUC' })
                }
                className={InputClass}
              >
                <option value="RUC">RUC (Empresa)</option>
                <option value="DNI">DNI (Persona Natural)</option>
              </select>
            </FormField>
            <FormField label="Número de Documento">
              <input
                type="text"
                required
                value={cliForm.documento}
                onChange={(e) => setCliForm({ ...cliForm, documento: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Segmento Comercial">
              <select
                value={cliForm.segmento}
                onChange={(e) =>
                  setCliForm({
                    ...cliForm,
                    segmento: e.target.value as ClienteFinanciero['segmento'],
                  })
                }
                className={InputClass}
              >
                <option value="Corporativo">Corporativo</option>
                <option value="PYME">PYME</option>
                <option value="Microempresa">Microempresa</option>
                <option value="Consumo Preferente">Consumo Preferente</option>
                <option value="Consumo Masivo">Consumo Masivo</option>
              </select>
            </FormField>
            <FormField label="Sector Económico">
              <input
                type="text"
                required
                value={cliForm.sectorEconomico}
                onChange={(e) => setCliForm({ ...cliForm, sectorEconomico: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Ingresos Mensuales (Soles PEN)">
              <input
                type="number"
                required
                value={cliForm.ingresosMensualesPEN}
                onChange={(e) =>
                  setCliForm({ ...cliForm, ingresosMensualesPEN: Number(e.target.value) })
                }
                className={InputClass}
              />
            </FormField>
            <FormField label="Score Crediticio (300 - 850)">
              <input
                type="number"
                min={300}
                max={850}
                required
                value={cliForm.scoreCrediticio}
                onChange={(e) =>
                  setCliForm({ ...cliForm, scoreCrediticio: Number(e.target.value) })
                }
                className={InputClass}
              />
            </FormField>
            <FormField label="Ciudad">
              <input
                type="text"
                required
                value={cliForm.ciudad}
                onChange={(e) => setCliForm({ ...cliForm, ciudad: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Teléfono">
              <input
                type="text"
                required
                value={cliForm.telefono}
                onChange={(e) => setCliForm({ ...cliForm, telefono: e.target.value })}
                className={InputClass}
              />
            </FormField>
          </div>
          <FormField label="Nombre Completo o Razón Social">
            <input
              type="text"
              required
              value={cliForm.nombre}
              onChange={(e) => setCliForm({ ...cliForm, nombre: e.target.value })}
              className={InputClass}
            />
          </FormField>
          <FormField label="Correo Electrónico">
            <input
              type="email"
              required
              value={cliForm.email}
              onChange={(e) => setCliForm({ ...cliForm, email: e.target.value })}
              className={InputClass}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setCliModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="emerald">
              Guardar Cliente
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL CREAR / EDITAR CRÉDITO */}
      <Modal
        open={credModalOpen}
        onClose={() => setCredModalOpen(false)}
        title={editingCred ? `Editar Crédito (${editingCred.id})` : 'Otorgar Nuevo Crédito en PEN'}
      >
        <form onSubmit={handleSaveCred} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Cliente Titular">
              <select
                value={credForm.clienteId}
                disabled={!!editingCred}
                onChange={(e) => setCredForm({ ...credForm, clienteId: e.target.value })}
                className={InputClass}
              >
                {allClientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Producto Crediticio">
              <select
                value={credForm.producto}
                onChange={(e) => setCredForm({ ...credForm, producto: e.target.value })}
                className={InputClass}
              >
                <option value="Capital de Trabajo">Capital de Trabajo</option>
                <option value="Activo Fijo">Activo Fijo</option>
                <option value="Leasing Empresarial">Leasing Empresarial</option>
                <option value="Hipotecario Comercial">Hipotecario Comercial</option>
                <option value="Consumo Personal">Consumo Personal</option>
              </select>
            </FormField>
            <FormField label="Monto Desembolsado (PEN)">
              <input
                type="number"
                required
                value={credForm.montoDesembolsadoPEN}
                onChange={(e) =>
                  setCredForm({
                    ...credForm,
                    montoDesembolsadoPEN: Number(e.target.value),
                    saldoCapitalPEN: editingCred
                      ? credForm.saldoCapitalPEN
                      : Number(e.target.value),
                  })
                }
                className={InputClass}
              />
            </FormField>
            {editingCred && (
              <FormField label="Saldo Capital Actual (PEN)">
                <input
                  type="number"
                  required
                  value={credForm.saldoCapitalPEN}
                  onChange={(e) =>
                    setCredForm({ ...credForm, saldoCapitalPEN: Number(e.target.value) })
                  }
                  className={InputClass}
                />
              </FormField>
            )}
            <FormField label="Tasa Efectiva Anual TEA (%)">
              <input
                type="number"
                step="0.1"
                required
                value={credForm.tasaAnualPct}
                onChange={(e) => setCredForm({ ...credForm, tasaAnualPct: Number(e.target.value) })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Plazo (Meses)">
              <input
                type="number"
                required
                value={credForm.plazoMeses}
                onChange={(e) => setCredForm({ ...credForm, plazoMeses: Number(e.target.value) })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Fecha de Desembolso">
              <input
                type="date"
                required
                value={credForm.fechaDesembolso}
                onChange={(e) => setCredForm({ ...credForm, fechaDesembolso: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Estado del Crédito">
              <select
                value={credForm.estado}
                onChange={(e) =>
                  setCredForm({
                    ...credForm,
                    estado: e.target.value as CreditoFinanciero['estado'],
                  })
                }
                className={InputClass}
              >
                <option value="Vigente">Vigente</option>
                <option value="Vencido">Vencido</option>
                <option value="En Cobranza Judicial">En Cobranza Judicial</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </FormField>
            {editingCred && (
              <FormField label="Días de Mora">
                <input
                  type="number"
                  min={0}
                  value={credForm.diasMora}
                  onChange={(e) => setCredForm({ ...credForm, diasMora: Number(e.target.value) })}
                  className={InputClass}
                />
              </FormField>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setCredModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="emerald">
              Guardar Crédito
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL REGISTRAR NUEVO PAGO */}
      <Modal
        open={pagModalOpen}
        onClose={() => setPagModalOpen(false)}
        title="Registrar Abono / Pago de Crédito (PEN)"
      >
        <form onSubmit={handleSavePago} className="space-y-4">
          <FormField label="Seleccionar Crédito a Amortizar">
            <select
              value={pagForm.creditoId}
              onChange={(e) => setPagForm({ ...pagForm, creditoId: e.target.value })}
              className={InputClass}
            >
              {allCreditos
                .filter((c) => c.estado !== 'Cancelado')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.clienteNombre} (Saldo: {formatPEN(c.saldoCapitalPEN)})
                  </option>
                ))}
            </select>
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Monto Pagado (Soles PEN)">
              <input
                type="number"
                min={1}
                required
                value={pagForm.montoPEN}
                onChange={(e) => setPagForm({ ...pagForm, montoPEN: Number(e.target.value) })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Fecha de Pago">
              <input
                type="date"
                required
                value={pagForm.fechaPago}
                onChange={(e) => setPagForm({ ...pagForm, fechaPago: e.target.value })}
                className={InputClass}
              />
            </FormField>
            <FormField label="Método de Pago">
              <select
                value={pagForm.metodoPago}
                onChange={(e) => setPagForm({ ...pagForm, metodoPago: e.target.value })}
                className={InputClass}
              >
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                <option value="Débito Automático">Débito Automático</option>
                <option value="Ventanilla">Ventanilla</option>
                <option value="Billetera Digital">Billetera Digital</option>
              </select>
            </FormField>
            <FormField label="Referencia de Operación">
              <input
                type="text"
                required
                value={pagForm.referencia}
                onChange={(e) => setPagForm({ ...pagForm, referencia: e.target.value })}
                className={InputClass}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setPagModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="emerald">
              Confirmar Pago
            </Button>
          </div>
        </form>
      </Modal>
    </SectorLayout>
  );
};
