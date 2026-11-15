import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const backendDir = path.join(rootDir, 'apps', 'backend');
const requireBackend = createRequire(path.join(backendDir, 'package.json'));

console.log('================================================================');
console.log('  SUITE DE PRUEBAS INTEGRALES Y VALIDACIÓN DEL MONOLITO MODULAR');
console.log('================================================================');

const mineriaBackup = fs.readFileSync(path.join(dataDir, 'mineria.json'), 'utf8');
const finanzasBackup = fs.readFileSync(path.join(dataDir, 'finanzas.json'), 'utf8');
const logisticaBackup = fs.readFileSync(path.join(dataDir, 'logistica.json'), 'utf8');

function restoreData() {
  fs.writeFileSync(path.join(dataDir, 'mineria.json'), mineriaBackup, 'utf8');
  fs.writeFileSync(path.join(dataDir, 'finanzas.json'), finanzasBackup, 'utf8');
  fs.writeFileSync(path.join(dataDir, 'logistica.json'), logisticaBackup, 'utf8');
}

// 1. Validar integridad y volúmenes mínimos de los datos simulados
console.log('\n[1/5] Verificando integridad referencial y volúmenes mínimos de datos JSON...');
const mineria = JSON.parse(mineriaBackup);
const finanzas = JSON.parse(finanzasBackup);
const logistica = JSON.parse(logisticaBackup);

const mesesUnicosMineria = new Set(mineria.produccion.map((p) => p.mes));
assert(mesesUnicosMineria.size >= 12, `Minería debe tener >= 12 meses (actual: ${mesesUnicosMineria.size})`);
assert(mineria.maquinarias.length >= 20, `Minería debe tener >= 20 maquinarias (actual: ${mineria.maquinarias.length})`);
assert(mineria.mantenimientos.length >= 30, `Minería debe tener >= 30 mantenimientos (actual: ${mineria.mantenimientos.length})`);
assert(mineria.incidentes.length >= 20, `Minería debe tener >= 20 incidentes (actual: ${mineria.incidentes.length})`);

const maqIds = new Set(mineria.maquinarias.map((m) => m.id));
for (const mnt of mineria.mantenimientos) {
  assert(maqIds.has(mnt.maquinariaId), `Mantenimiento ${mnt.id} referencia maquinaria inexistente ${mnt.maquinariaId}`);
}

assert(finanzas.clientes.length >= 100, `Finanzas debe tener >= 100 clientes (actual: ${finanzas.clientes.length})`);
assert(finanzas.creditos.length >= 150, `Finanzas debe tener >= 150 créditos (actual: ${finanzas.creditos.length})`);
assert(finanzas.cuotas.length >= 150, `Finanzas debe tener cronograma de cuotas (actual: ${finanzas.cuotas.length})`);
assert(finanzas.pagos.length >= 100, `Finanzas debe tener pagos registrados (actual: ${finanzas.pagos.length})`);

const cliIds = new Set(finanzas.clientes.map((c) => c.id));
const credIds = new Set(finanzas.creditos.map((c) => c.id));
for (const cred of finanzas.creditos) {
  assert(cliIds.has(cred.clienteId), `Crédito ${cred.id} referencia cliente inexistente ${cred.clienteId}`);
}
for (const cuo of finanzas.cuotas) {
  assert(credIds.has(cuo.creditoId), `Cuota ${cuo.id} referencia crédito inexistente ${cuo.creditoId}`);
}

assert(logistica.pedidos.length >= 200, `Logística debe tener >= 200 pedidos (actual: ${logistica.pedidos.length})`);
assert(logistica.vehiculos.length >= 15, `Logística debe tener >= 15 vehículos (actual: ${logistica.vehiculos.length})`);
assert(logistica.conductores.length >= 20, `Logística debe tener >= 20 conductores (actual: ${logistica.conductores.length})`);
assert(logistica.rutas.length >= 25, `Logística debe tener >= 25 rutas (actual: ${logistica.rutas.length})`);

const vehIds = new Set(logistica.vehiculos.map((v) => v.id));
const condIds = new Set(logistica.conductores.map((c) => c.id));
const rutIds = new Set(logistica.rutas.map((r) => r.id));
for (const ped of logistica.pedidos) {
  assert(vehIds.has(ped.vehiculoId), `Pedido ${ped.id} referencia vehículo inexistente`);
  assert(condIds.has(ped.conductorId), `Pedido ${ped.id} referencia conductor inexistente`);
  assert(rutIds.has(ped.rutaId), `Pedido ${ped.id} referencia ruta inexistente`);
}
console.log('  OK -> Integridad referencial y volúmenes mínimos verificados al 100%.');

// 2. Inicializar NestJS AppModule y probar Controladores y Servicios reales
console.log('\n[2/5] Inicializando contenedor de aplicación NestJS y mapeo de rutas REST...');
const { NestFactory } = requireBackend('@nestjs/core');
const { AppModule } = requireBackend('./dist/app.module.js');
const { PortalController } = requireBackend('./dist/portal.controller.js');
const { MineriaController } = requireBackend('./dist/modules/mineria/mineria.controller.js');
const { FinanzasController } = requireBackend('./dist/modules/finanzas/finanzas.controller.js');
const { LogisticaController } = requireBackend('./dist/modules/logistica/logistica.controller.js');

const app = await NestFactory.create(AppModule, { logger: false });
app.setGlobalPrefix('api');
await app.init();

try {
  const portalCtrl = app.get(PortalController);
  const mineriaCtrl = app.get(MineriaController);
  const finanzasCtrl = app.get(FinanzasController);
  const logisticaCtrl = app.get(LogisticaController);
  console.log('  OK -> Módulos NestJS (Minería, Finanzas, Logística y Portal) inicializados.');

  console.log('\n[3/5] Verificando cálculo de KPIs, Gráficos, Recomendaciones y Paginación...');
  const portalRes = portalCtrl.getResumenEjecutivo();
  assert.equal(portalRes.estadoSistema, 'Operativo');
  assert(portalRes.mineria.kpis.produccionTotalToneladas > 0);
  assert(portalRes.finanzas.kpis.carteraTotalPEN > 0);
  assert(portalRes.logistica.kpis.totalPedidos >= 200);

  const minDash = mineriaCtrl.getDashboard();
  assert(minDash.graficos.produccionMensual.length >= 12);
  assert(minDash.recomendaciones.length > 0);

  const finDash = finanzasCtrl.getDashboard();
  assert(finDash.graficos.evolucionColocaciones.length >= 12);
  assert(finDash.recomendaciones.length > 0);

  const logDash = logisticaCtrl.getDashboard();
  assert(logDash.graficos.cumplimientoPorRuta.length > 0);
  assert(logDash.recomendaciones.length > 0);

  const pagClientes = finanzasCtrl.findAllClientes({ page: '1', limit: '10', search: '' });
  assert.equal(pagClientes.data.length, 10);
  assert(pagClientes.meta.total >= 100);
  console.log('  OK -> Todos los endpoints de Dashboard, KPIs, Gráficos, Recomendaciones y Paginación funcionan.');

  console.log('\n[4/5] Verificando operaciones CRUD y actualización dinámica de Dashboards...');
  // Minería CRUD
  const prevProdTotal = minDash.kpis.produccionTotalToneladas;
  const createdProd = mineriaCtrl.createProduccion({
    mes: '2026-12',
    fecha: '2026-12-20',
    unidadMinera: 'Tajo Abierto Antamina Norte',
    mineral: 'Cobre',
    turno: 'Día',
    toneladasExtraidas: 50000,
    toneladasObjetivo: 48000,
    leyMineralPct: 1.5,
    horasOperacion: 700,
    observaciones: 'Prueba automatizada CRUD',
  });
  assert(createdProd.id.startsWith('PRD-'));
  const minDashAfter = mineriaCtrl.getDashboard();
  assert.equal(
    minDashAfter.kpis.produccionTotalToneladas,
    prevProdTotal + 50000,
    'El KPI de producción total debe incrementarse exactamente en 50,000 TM tras crear registro',
  );

  // Finanzas CRUD
  const prevRecuperado = finDash.kpis.montoRecuperadoPEN;
  const createdPago = finanzasCtrl.createPago({
    creditoId: 'CRD-001',
    fechaPago: '2026-11-15',
    montoPEN: 5000,
    metodoPago: 'Transferencia Bancaria',
    referencia: 'TEST-CRUD-01',
  });
  assert(createdPago.id.startsWith('PAG-'));
  const finDashAfter = finanzasCtrl.getDashboard();
  assert(
    finDashAfter.kpis.montoRecuperadoPEN > prevRecuperado,
    'El monto recuperado de cartera debe incrementarse tras registrar un pago',
  );

  // Logística CRUD
  const prevPedidos = logDash.kpis.totalPedidos;
  const createdPed = logisticaCtrl.createPedido({
    cliente: 'Alicorp SAA',
    rutaId: 'RUT-001',
    vehiculoId: 'VEH-001',
    conductorId: 'CON-001',
    fechaPedido: '2026-11-15',
    fechaEntregaEstimada: '2026-11-16',
    pesoToneladas: 15,
    tiempoRealHoras: 17.5,
    prioridad: 'Express',
    estado: 'Entregado',
  });
  assert(createdPed.id.startsWith('PED-'));
  const logDashAfter = logisticaCtrl.getDashboard();
  assert.equal(
    logDashAfter.kpis.totalPedidos,
    prevPedidos + 1,
    'El total de pedidos debe incrementarse en 1 tras registrar nuevo pedido',
  );
  console.log('  OK -> Operaciones CRUD y actualización en vivo de KPIs verificadas.');

  console.log('\n[5/5] Verificando artefactos de compilación de producción...');
  assert(fs.existsSync(path.join(rootDir, 'apps', 'backend', 'dist', 'main.js')), 'Falta build de backend');
  assert(fs.existsSync(path.join(rootDir, 'apps', 'frontend', 'dist', 'index.html')), 'Falta build de frontend');
  console.log('  OK -> Artefactos de producción de Backend y Frontend presentes y verificados.');
  console.log('\n================================================================');
  console.log('  TODAS LAS PRUEBAS PASARON EXITOSAMENTE (100% OK)');
  console.log('================================================================');
} finally {
  await app.close();
  restoreData();
}
