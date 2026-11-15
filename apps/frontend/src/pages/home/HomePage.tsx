import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  Landmark,
  Layers,
  Pickaxe,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { api } from '../../services/api';
import { PortalResumen } from '../../types';
import { formatNumber, formatPEN, formatPct } from '../../hooks/useFormatters';
import { Button, Card, ErrorState, LoadingState } from '../../components/ui';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState<PortalResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarResumen = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.portal.getResumen();
      setResumen(data);
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar el resumen ejecutivo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">
                SUITE EMPRESARIAL 360°
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Monolito Modular · React + NestJS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Backend NestJS Activo
            </span>
            <Button variant="outline" size="sm" onClick={cargarResumen}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sincronizar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Arquitectura Empresarial Multi-Sectorial en Tiempo Real</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Plataforma de Inteligencia Empresarial
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Centro unificado de control operativo, analítica predictiva y gestión transaccional para
            los sectores de <strong className="text-amber-300">Industria Minera</strong>,{' '}
            <strong className="text-emerald-300">Sector Financiero</strong> y{' '}
            <strong className="text-sky-300">Sector Logístico</strong>.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Conectando con los módulos de Minería, Finanzas y Logística..." />
        ) : error ? (
          <ErrorState message={error} onRetry={cargarResumen} />
        ) : (
          <>
            {/* Three Interactive Sector Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Industria Minera */}
              <div
                onClick={() => navigate('/mineria')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/mineria')}
                className="group cursor-pointer rounded-2xl border border-slate-800 hover:border-amber-500/60 bg-gradient-to-b from-slate-900/95 to-slate-900/60 p-6 shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
                      <Pickaxe className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      MineControl Analytics
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    Industria Minera
                  </h2>
                  <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                    Monitoreo de producción, seguridad y mantenimiento. Control de flota pesada,
                    disponibilidad mecánica y alertas operacionales.
                  </p>

                  {resumen && (
                    <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Producción Total</p>
                        <p className="text-base font-bold text-white mt-0.5">
                          {formatNumber(resumen.mineria.kpis.produccionTotalToneladas)} TM
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Cumplimiento</p>
                        <p className="text-base font-bold text-amber-300 mt-0.5">
                          {formatPct(resumen.mineria.kpis.cumplimientoProduccionPct)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Disp. Maquinaria</p>
                        <p className="text-base font-bold text-white mt-0.5">
                          {formatPct(resumen.mineria.kpis.disponibilidadMaquinariaPct)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Incidentes Seg.</p>
                        <p className="text-base font-bold text-rose-300 mt-0.5">
                          {resumen.mineria.kpis.incidentesRegistrados} reg.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {resumen?.mineria.alertasActivas || 0} recomendaciones activas
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                    Ingresar al módulo <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Card 2: Sector Financiero */}
              <div
                onClick={() => navigate('/finanzas')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/finanzas')}
                className="group cursor-pointer rounded-2xl border border-slate-800 hover:border-emerald-500/60 bg-gradient-to-b from-slate-900/95 to-slate-900/60 p-6 shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                      <Landmark className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      FinanceRisk Analytics
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Sector Financiero
                  </h2>
                  <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                    Análisis de cartera, créditos y morosidad. Gestión de clientes, cronograma de
                    cuotas, recaudación en soles (PEN) y matriz de riesgo.
                  </p>

                  {resumen && (
                    <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Cartera Total</p>
                        <p className="text-base font-bold text-white mt-0.5">
                          {formatPEN(resumen.finanzas.kpis.carteraTotalPEN)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Índice Morosidad</p>
                        <p className="text-base font-bold text-rose-300 mt-0.5">
                          {formatPct(resumen.finanzas.kpis.indiceMorosidadPct, 2)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Créditos Activos</p>
                        <p className="text-base font-bold text-emerald-300 mt-0.5">
                          {resumen.finanzas.kpis.creditosActivos} créditos
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Recuperación</p>
                        <p className="text-base font-bold text-white mt-0.5">
                          {formatPct(resumen.finanzas.kpis.recuperacionCarteraPct)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {resumen?.finanzas.alertasActivas || 0} recomendaciones activas
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                    Ingresar al módulo <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Card 3: Sector Logístico */}
              <div
                onClick={() => navigate('/logistica')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/logistica')}
                className="group cursor-pointer rounded-2xl border border-slate-800 hover:border-sky-500/60 bg-gradient-to-b from-slate-900/95 to-slate-900/60 p-6 shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="p-3.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 group-hover:scale-105 transition-transform">
                      <Truck className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      LogisticsTrack Analytics
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                    Sector Logístico
                  </h2>
                  <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                    Seguimiento de entregas, rutas y cumplimiento. Control de flota vehicular,
                    desempeño de conductores y análisis de tiempos de despacho.
                  </p>

                  {resumen && (
                    <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Total Pedidos</p>
                        <p className="text-base font-bold text-white mt-0.5">
                          {resumen.logistica.kpis.totalPedidos} envíos
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Cumplimiento SLA</p>
                        <p className="text-base font-bold text-sky-300 mt-0.5">
                          {formatPct(resumen.logistica.kpis.cumplimientoEntregasPct)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Entregas a Tiempo</p>
                        <p className="text-base font-bold text-white mt-0.5">
                          {resumen.logistica.kpis.entregasCompletadas} compl.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <p className="text-[11px] text-slate-400 uppercase">Tiempo Promedio</p>
                        <p className="text-base font-bold text-amber-300 mt-0.5">
                          {resumen.logistica.kpis.tiempoPromedioEntregaHoras} hrs
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-sky-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {resumen?.logistica.alertasActivas || 0} recomendaciones activas
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
                    Ingresar al módulo <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* Architecture & Capabilities Highlight Bar */}
            <Card className="p-6 border-slate-800/90 bg-slate-900/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Persistencia JSON Real</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Almacenamiento transaccional gestionado por NestJS sobre archivos JSON con
                      escritura atómica.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">KPIs Dinámicos Calculados</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Todos los indicadores y gráficos se recalculan automáticamente tras cada
                      operación CRUD.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Motor de Recomendaciones</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Reglas de negocio automatizadas para detectar cuellos de botella, morosidad y
                      baja disponibilidad.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Monolito Modular pnpm</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Integración transparente mediante proxy de Vite y validación de DTOs en
                      backend.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};
