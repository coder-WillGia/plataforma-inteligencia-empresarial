import {
  ClienteFinanciero,
  ConductorLogistica,
  CreditoFinanciero,
  CuotaCredito,
  FinanzasDashboardData,
  IncidenteSeguridad,
  LogisticaDashboardData,
  Mantenimiento,
  Maquinaria,
  MineriaDashboardData,
  PaginatedResponse,
  PagoCredito,
  PedidoLogistica,
  PortalResumen,
  RegistroProduccion,
  RutaLogistica,
  VehiculoLogistica,
} from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errMessage = `Error HTTP ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody?.message) {
        errMessage = Array.isArray(errBody.message)
          ? errBody.message.join(', ')
          : errBody.message;
      }
    } catch {}
    throw new Error(errMessage);
  }

  return response.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== 'TODOS') {
      searchParams.set(k, String(v));
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

export const api = {
  portal: {
    getResumen: () => request<PortalResumen>('/portal/resumen'),
  },

  mineria: {
    getDashboard: () => request<MineriaDashboardData>('/mineria/dashboard'),
    getProduccion: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<RegistroProduccion>>(`/mineria/produccion${buildQuery(params)}`),
    createProduccion: (body: Partial<RegistroProduccion>) =>
      request<RegistroProduccion>('/mineria/produccion', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateProduccion: (id: string, body: Partial<RegistroProduccion>) =>
      request<RegistroProduccion>(`/mineria/produccion/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    getMaquinarias: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<Maquinaria>>(`/mineria/maquinarias${buildQuery(params)}`),
    createMaquinaria: (body: Partial<Maquinaria>) =>
      request<Maquinaria>('/mineria/maquinarias', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateMaquinaria: (id: string, body: Partial<Maquinaria>) =>
      request<Maquinaria>(`/mineria/maquinarias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    getMantenimientos: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<Mantenimiento>>(`/mineria/mantenimientos${buildQuery(params)}`),
    createMantenimiento: (body: Partial<Mantenimiento>) =>
      request<Mantenimiento>('/mineria/mantenimientos', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateMantenimiento: (id: string, body: Partial<Mantenimiento>) =>
      request<Mantenimiento>(`/mineria/mantenimientos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    getIncidentes: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<IncidenteSeguridad>>(`/mineria/incidentes${buildQuery(params)}`),
    createIncidente: (body: Partial<IncidenteSeguridad>) =>
      request<IncidenteSeguridad>('/mineria/incidentes', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateIncidente: (id: string, body: Partial<IncidenteSeguridad>) =>
      request<IncidenteSeguridad>(`/mineria/incidentes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  },

  finanzas: {
    getDashboard: () => request<FinanzasDashboardData>('/finanzas/dashboard'),
    getClientes: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<ClienteFinanciero>>(`/finanzas/clientes${buildQuery(params)}`),
    createCliente: (body: Partial<ClienteFinanciero>) =>
      request<ClienteFinanciero>('/finanzas/clientes', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateCliente: (id: string, body: Partial<ClienteFinanciero>) =>
      request<ClienteFinanciero>(`/finanzas/clientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    getCreditos: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<CreditoFinanciero>>(`/finanzas/creditos${buildQuery(params)}`),
    getCreditoDetalle: (id: string) =>
      request<CreditoFinanciero & { cuotas: CuotaCredito[]; pagos: PagoCredito[] }>(
        `/finanzas/creditos/${id}`,
      ),
    createCredito: (body: Record<string, any>) =>
      request<CreditoFinanciero>('/finanzas/creditos', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateCredito: (id: string, body: Partial<CreditoFinanciero>) =>
      request<CreditoFinanciero>(`/finanzas/creditos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    getCuotas: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<CuotaCredito>>(`/finanzas/cuotas${buildQuery(params)}`),
    updateCuota: (id: string, body: Partial<CuotaCredito>) =>
      request<CuotaCredito>(`/finanzas/cuotas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    getPagos: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<PagoCredito>>(`/finanzas/pagos${buildQuery(params)}`),
    createPago: (body: Record<string, any>) =>
      request<PagoCredito>('/finanzas/pagos', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  logistica: {
    getDashboard: () => request<LogisticaDashboardData>('/logistica/dashboard'),
    getPedidos: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<PedidoLogistica>>(`/logistica/pedidos${buildQuery(params)}`),
    createPedido: (body: Record<string, any>) =>
      request<PedidoLogistica>('/logistica/pedidos', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updatePedido: (id: string, body: Partial<PedidoLogistica>) =>
      request<PedidoLogistica>(`/logistica/pedidos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    getVehiculos: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<VehiculoLogistica>>(`/logistica/vehiculos${buildQuery(params)}`),
    createVehiculo: (body: Partial<VehiculoLogistica>) =>
      request<VehiculoLogistica>('/logistica/vehiculos', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateVehiculo: (id: string, body: Partial<VehiculoLogistica>) =>
      request<VehiculoLogistica>(`/logistica/vehiculos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    getConductores: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<ConductorLogistica>>(`/logistica/conductores${buildQuery(params)}`),
    createConductor: (body: Partial<ConductorLogistica>) =>
      request<ConductorLogistica>('/logistica/conductores', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateConductor: (id: string, body: Partial<ConductorLogistica>) =>
      request<ConductorLogistica>(`/logistica/conductores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    getRutas: (params: Record<string, string | number | undefined> = {}) =>
      request<PaginatedResponse<RutaLogistica>>(`/logistica/rutas${buildQuery(params)}`),
    createRuta: (body: Partial<RutaLogistica>) =>
      request<RutaLogistica>('/logistica/rutas', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateRuta: (id: string, body: Partial<RutaLogistica>) =>
      request<RutaLogistica>(`/logistica/rutas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  },
};
