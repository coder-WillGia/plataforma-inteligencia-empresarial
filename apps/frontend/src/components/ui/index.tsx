import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { RecomendacionItem } from '../../types';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'rounded-xl border border-slate-800/80 bg-slate-900/75 backdrop-blur-sm shadow-lg',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-5 pb-3 flex items-center justify-between gap-2', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-base font-semibold text-slate-100 tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-5 pt-2', className)} {...props}>
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const variants: Record<string, string> = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-950/50',
    amber: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-sm',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
    outline: 'border border-slate-700 bg-transparent hover:bg-slate-800/70 text-slate-200',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white',
  };
  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-5 py-2.5 text-base rounded-xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = (status || '').toLowerCase();
  let color = 'bg-slate-800 text-slate-300 border-slate-700';

  if (
    [
      'operativa',
      'cumplido',
      'completado',
      'cerrado',
      'activo',
      'vigente',
      'pagada',
      'confirmado',
      'entregado',
      'disponible',
      'activa',
      'bajo',
      'leve',
    ].includes(s)
  ) {
    color = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  } else if (
    [
      'en riesgo',
      'en mantenimiento',
      'en revisión',
      'en proceso',
      'programado',
      'acción correctiva',
      'observado',
      'moderado',
      'pendiente',
      'parcial',
      'en ruta',
      'en tránsito',
      'descanso',
      'medio',
      'media',
      'express',
    ].includes(s)
  ) {
    color = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  } else if (
    [
      'bajo objetivo',
      'inoperativa',
      'vencido',
      'vencida',
      'en investigación',
      'grave',
      'crítico',
      'crítica',
      'alta',
      'alto',
      'bloqueado',
      'en cobranza judicial',
      'retrasado',
      'fuera de servicio',
      'suspendido',
      'congestionada',
      'restringida',
    ].includes(s)
  ) {
    color = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  } else if (['cancelado', 'normal', 'baja'].includes(s)) {
    color = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        color,
      )}
    >
      {status}
    </span>
  );
};

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: 'amber' | 'emerald' | 'indigo' | 'rose' | 'sky' | 'violet';
  trend?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accent = 'indigo',
  trend,
}) => {
  const accents: Record<string, string> = {
    amber: 'from-amber-500/20 to-transparent border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
    indigo: 'from-indigo-500/20 to-transparent border-indigo-500/30 text-indigo-400',
    rose: 'from-rose-500/20 to-transparent border-rose-500/30 text-rose-400',
    sky: 'from-sky-500/20 to-transparent border-sky-500/30 text-sky-400',
    violet: 'from-violet-500/20 to-transparent border-violet-500/30 text-violet-400',
  };

  return (
    <Card className="relative overflow-hidden transition-transform hover:-translate-y-0.5">
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
          accents[accent],
        )}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
            <p className="mt-2 text-2xl font-bold text-white tracking-tight">{value}</p>
          </div>
          <div
            className={cn(
              'p-2.5 rounded-xl border bg-gradient-to-br',
              accents[accent],
            )}
          >
            {icon}
          </div>
        </div>
        {(subtitle || trend) && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>{subtitle}</span>
            {trend && <span className="font-medium text-slate-300">{trend}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

export const RecomendacionesList: React.FC<{
  items: RecomendacionItem[];
  title?: string;
}> = ({ items, title = 'Recomendaciones Automáticas Basadas en Reglas' }) => {
  if (!items || items.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-400">
        No hay alertas ni recomendaciones activas en este momento.
      </Card>
    );
  }

  return (
    <Card className="border-slate-800">
      <CardHeader className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Motor de reglas evaluado en tiempo real a partir de los indicadores del sector
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
          {items.length} hallazgos activos
        </span>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((rec) => {
          const isCritical = rec.nivel === 'Crítico';
          const isAlert = rec.nivel === 'Alerta';
          return (
            <div
              key={rec.id}
              className={cn(
                'p-4 rounded-xl border flex flex-col justify-between gap-3',
                isCritical
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : isAlert
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-sky-950/20 border-sky-500/30',
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                    {isCritical ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    ) : isAlert ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Info className="w-4 h-4 text-sky-400" />
                    )}
                    <span
                      className={
                        isCritical
                          ? 'text-rose-400'
                          : isAlert
                          ? 'text-amber-400'
                          : 'text-sky-400'
                      }
                    >
                      {rec.nivel} · {rec.categoria}
                    </span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-700/80">
                    {rec.indicadorRelacionado}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{rec.titulo}</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{rec.descripcion}</p>
              </div>
              <div className="pt-2.5 border-t border-slate-800/80 flex items-start gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  <strong className="text-emerald-200">Acción recomendada:</strong>{' '}
                  {rec.accionSugerida}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const PaginationControls: React.FC<{
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (newPage: number) => void;
}> = ({ page, totalPages, total, onPageChange }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-800/80 text-xs text-slate-400">
    <span>
      Total de registros: <strong className="text-slate-200">{total}</strong> · Página{' '}
      <strong className="text-slate-200">{page}</strong> de{' '}
      <strong className="text-slate-200">{totalPages}</strong>
    </span>
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="w-4 h-4" /> Anterior
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

export const SearchFilterBar: React.FC<{
  search: string;
  onSearchChange: (val: string) => void;
  placeholder?: string;
  filters?: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
  }[];
  actionButton?: React.ReactNode;
}> = ({
  search,
  onSearchChange,
  placeholder = 'Buscar registros...',
  filters = [],
  actionButton,
}) => (
  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4">
    <div className="flex flex-1 flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-950/90 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>
      {filters.map((f, idx) => (
        <select
          key={idx}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-slate-950/90 border border-slate-700/80 text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="TODOS">{f.label}: Todos</option>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
    {actionButton && <div className="flex items-center justify-end">{actionButton}</div>}
  </div>
);

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Cargando datos en tiempo real desde el servidor...',
}) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
    <p className="text-sm">{message}</p>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-6 text-center my-4">
    <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
    <h4 className="text-base font-semibold text-white">Error al comunicar con el servidor</h4>
    <p className="text-xs text-rose-200 mt-1 mb-4">{message}</p>
    {onRetry && (
      <Button variant="danger" size="sm" onClick={onRetry}>
        <RefreshCw className="w-4 h-4" /> Reintentar conexión
      </Button>
    )}
  </div>
);

export const EmptyState: React.FC<{ message?: string }> = ({
  message = 'No se encontraron registros que coincidan con los filtros aplicados.',
}) => (
  <div className="py-12 text-center text-sm text-slate-400">{message}</div>
);

export const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-slate-300">{label}</label>
    {children}
  </div>
);

export const InputClass =
  'w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500';
