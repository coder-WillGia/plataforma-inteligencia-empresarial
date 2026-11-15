import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Home,
  Landmark,
  Menu,
  Pickaxe,
  RefreshCw,
  Truck,
  X,
} from 'lucide-react';
import { Button, cn } from '../components/ui';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface SectorLayoutProps {
  appName: string;
  sectorSubtitle: string;
  accentColor: 'amber' | 'emerald' | 'sky';
  icon: React.ReactNode;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onRefresh?: () => void;
  toastMessage?: string | null;
  children: React.ReactNode;
}

export const SectorLayout: React.FC<SectorLayoutProps> = ({
  appName,
  sectorSubtitle,
  accentColor,
  icon,
  navItems,
  activeTab,
  onTabChange,
  onRefresh,
  toastMessage,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const accentClasses: Record<
    string,
    { active: string; badge: string; headerBadge: string; border: string }
  > = {
    amber: {
      active: 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-semibold',
      badge: 'bg-amber-500/20 text-amber-300',
      headerBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      border: 'border-amber-500/20',
    },
    emerald: {
      active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-semibold',
      badge: 'bg-emerald-500/20 text-emerald-300',
      headerBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      border: 'border-emerald-500/20',
    },
    sky: {
      active: 'bg-sky-500/15 text-sky-300 border-sky-500/40 font-semibold',
      badge: 'bg-sky-500/20 text-sky-300',
      headerBadge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      border: 'border-sky-500/20',
    },
  };

  const styles = accentClasses[accentColor];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Desktop & Mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/95 border-r border-slate-800/90 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-xl border', styles.headerBadge)}>{icon}</div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">{appName}</h1>
              <p className="text-xs text-slate-400">{sectorSubtitle}</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-slate-800/60">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Volver al Portal Principal</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Módulos del Sector
          </p>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm border transition-all',
                  isActive
                    ? styles.active
                    : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
                )}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      isActive ? styles.badge : 'bg-slate-800 text-slate-400',
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick cross-sector switcher */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Cambio Rápido de Plataforma
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => navigate('/mineria')}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border text-[11px] transition-colors',
                accentColor === 'amber'
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 font-semibold'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-400',
              )}
            >
              <Pickaxe className="w-3.5 h-3.5" />
              <span>Minería</span>
            </button>
            <button
              onClick={() => navigate('/finanzas')}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border text-[11px] transition-colors',
                accentColor === 'emerald'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-400',
              )}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Finanzas</span>
            </button>
            <button
              onClick={() => navigate('/logistica')}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border text-[11px] transition-colors',
                accentColor === 'sky'
                  ? 'border-sky-500/40 bg-sky-500/10 text-sky-300 font-semibold'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-400',
              )}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Logística</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 px-4 lg:px-8 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 hidden sm:inline" />
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Plataforma de Inteligencia Empresarial /
                </span>
                <span className="text-sm font-semibold text-white">{appName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Conectada (JSON Persistente)
            </span>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} title="Actualizar indicadores">
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portal</span>
            </Button>
          </div>
        </header>

        {toastMessage && (
          <div className="mx-4 lg:mx-8 mt-4 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-sm flex items-center justify-between shadow-lg">
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
