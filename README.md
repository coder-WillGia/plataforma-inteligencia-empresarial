# Plataforma de Inteligencia Empresarial — Solución Full Stack Multi-Sectorial

Repositorio oficial que contiene el desarrollo completo de **tres aplicaciones web empresariales Full Stack** orientadas a la toma de decisiones, visualización de indicadores clave (KPIs), analítica operativa y generación automática de recomendaciones para los sectores de **Industria Minera**, **Sector Financiero** y **Sector Logístico**.

---

## 🚀 Guía Rápida para el Evaluador (Inicio con un Único Comando)

El proyecto está configurado para que al descargarse o clonarse desde GitHub **no sea necesario ejecutar pasos manuales complejos**: el comando de inicio detecta automáticamente si las dependencias (`node_modules`) están instaladas; **si no existen, ejecuta `pnpm install` automáticamente** y enseguida levanta tanto el **Backend (NestJS)** como el **Frontend (React + Vite)** en una sola terminal.

### 1. Clonar el repositorio

```powershell
git clone https://github.com/coder-WillGia/plataforma-inteligencia-empresarial.git
cd plataforma-inteligencia-empresarial
```

### 2. Iniciar todo el sistema con un único comando en PowerShell

Copia y pega cualquiera de las siguientes opciones en tu terminal **PowerShell**:

#### Opción A — Comando inteligente de una línea en PowerShell (Recomendado)
Verifica si existen las carpetas `node_modules` de la raíz, del backend y del frontend. Si faltan, instala todas las dependencias con `pnpm install` y levanta el proyecto; si ya existen, inicia directamente:

```powershell
if (!(Test-Path "node_modules") -or !(Test-Path "apps/backend/node_modules") -or !(Test-Path "apps/frontend/node_modules")) { pnpm install }; pnpm run dev
```

#### Opción B — Ejecutar el script automático incluido (`iniciar.ps1`)
En la raíz del repositorio se incluye el script `iniciar.ps1`, el cual realiza la misma comprobación automática de dependencias e inicia ambos servidores:

```powershell
.\iniciar.ps1
```

#### Opción C — Ejecutar directamente `pnpm run dev`
El orquestador interno (`scripts/dev.mjs`) también valida automáticamente la existencia de `node_modules` antes de iniciar los servicios. Si ya tienes `pnpm` instalado, basta con ejecutar:

```powershell
pnpm install
pnpm run dev
```

### 3. Accesos inmediatos una vez iniciado

Al ejecutarse el comando se levantan simultáneamente:
- **Portal Principal y Aplicaciones Web (Frontend)**: [http://localhost:5173](http://localhost:5173)
  - Portal Ejecutivo Unificado: `http://localhost:5173/`
  - Aplicación 1 (Industria Minera — *MineControl Analytics*): `http://localhost:5173/mineria`
  - Aplicación 2 (Sector Financiero — *FinanceRisk Analytics*): `http://localhost:5173/finanzas`
  - Aplicación 3 (Sector Logístico — *LogisticsTrack Analytics*): `http://localhost:5173/logistica`
- **API RESTful (Backend NestJS)**: [http://localhost:3000/api](http://localhost:3000/api)
  - Resumen ejecutivo consolidado: `http://localhost:3000/api/portal/resumen`

---

## 🎯 Problemáticas Empresariales Resueltas (Las 3 Aplicaciones Web)

Cada aplicación cuenta con su propio **Sidebar independiente**, **Dashboard ejecutivo con 6 KPIs calculados en tiempo real**, **4 gráficos interactivos**, **tablas con búsqueda, filtros y paginación**, **formularios modales de creación/edición con persistencia real en JSON** y un **motor de recomendaciones automáticas basadas en reglas**:

### 1. Industria Minera — *MineControl Analytics* (`/mineria`)
- **Problemática que resuelve**: Dificultad para identificar pérdidas de productividad en frentes de extracción, baja disponibilidad mecánica de flota pesada, sobrecostos de mantenimiento correctivo y riesgos operacionales de seguridad.
- **KPIs calculados**: Producción total en toneladas (TM), Cumplimiento de producción (%), Disponibilidad de maquinaria (%), Horas de inactividad, Incidentes registrados y Eficiencia operacional (%).
- **Gráficos interactivos**: Producción mensual, Producción real vs. objetivo, Disponibilidad mecánica por maquinaria y Distribución de incidentes por severidad.
- **Módulos de gestión y análisis**:
  - Gestión y seguimiento de producción por unidad minera, mineral y turno.
  - Registro y control de maquinaria pesada (`Caterpillar`, `Komatsu`, `Epiroc`, `P&H`, `Sandvik`).
  - Seguimiento de mantenimiento preventivo, correctivo y predictivo valorizado en Soles (`PEN`).
  - Registro e investigación de incidentes de seguridad minera.
  - Análisis de rendimiento y alertas automáticas cuando un equipo cae por debajo del 82% de disponibilidad o la extracción no alcanza la meta.

### 2. Sector Financiero — *FinanceRisk Analytics* (`/finanzas`)
- **Problemática que resuelve**: Falta de visibilidad oportuna sobre el deterioro de la cartera crediticia, incremento de la morosidad por tramos, exposición al riesgo de incumplimiento y seguimiento de recaudación de cuotas.
- **KPIs calculados (en Soles Peruanos `PEN — S/`)**: Cartera total activa, Créditos activos, Monto total desembolsado, Índice de morosidad (%), Créditos vencidos y Recuperación de cartera (%).
- **Gráficos interactivos**: Evolución mensual de colocaciones, Cartera vigente vs. vencida por segmento, Morosidad mensual (%) y Distribución por nivel de riesgo.
- **Módulos de gestión y análisis**:
  - Directorio y calificación crediticia de clientes (`DNI` y `RUC`, ingresos mensuales en `PEN`, score crediticio `300-850` y clasificación de riesgo automática).
  - Gestión y otorgamiento de créditos (genera automáticamente su cronograma de cuotas al desembolsar).
  - Registro de pagos y amortizaciones (al registrar un pago se descuenta automáticamente el saldo capital del crédito y se liquida la cuota correspondiente).
  - Seguimiento de cronogramas de cuotas con liquidación en un clic.
  - Análisis de envejecimiento de cartera por tramos de mora y recomendaciones automáticas para cobranza preventiva y judicial.

### 3. Sector Logístico — *LogisticsTrack Analytics* (`/logistica`)
- **Problemática que resuelve**: Retrasos recurrentes en entregas nacionales y de última milla, falta de trazabilidad sobre el cumplimiento de rutas (SLA), cuellos de botella por congestión vial y baja visibilidad del rendimiento de conductores y flota.
- **KPIs calculados**: Total de pedidos, Entregas completadas, Entregas pendientes, Entregas retrasadas, Cumplimiento de entregas SLA (%) y Tiempo promedio de entrega (horas).
- **Gráficos interactivos**: Volumen de entregas por día, Entregas a tiempo vs. retrasadas, Rendimiento por conductor y Cumplimiento por ruta logística.
- **Módulos de gestión y análisis**:
  - Gestión de pedidos y guías de remisión vinculadas a clientes, rutas, vehículos y conductores.
  - Gestión de flota de vehículos de carga pesada y reparto (capacidad en toneladas, kilometraje y disponibilidad).
  - Padrón y desempeño de conductores profesionales (recálculo automático de puntualidad tras cada entrega).
  - Torre de control y seguimiento de entregas con confirmación inmediata en un clic.
  - Control de rutas nacionales y análisis comparativo de tiempos estimados vs. tiempos reales con recomendaciones automáticas.

---

## 🛠️ Tecnologías y Arquitectura

Desarrollado bajo una arquitectura de **Monolito Modular** en un monorepositorio administrado con **`pnpm` Workspaces**:

| Capa | Tecnologías |
| :--- | :--- |
| **Monorepositorio** | `pnpm` Workspaces (`pnpm-workspace.yaml`) |
| **Frontend** | React 18, Vite 5, TypeScript 5, React Router v6 |
| **Estilos y Componentes** | Tailwind CSS, componentes estilo `shadcn/ui`, Lucide React |
| **Gráficos** | Recharts (gráficos interactivos y responsivos) |
| **Backend** | NestJS 10, TypeScript, `class-validator`, `class-transformer` |
| **Persistencia de Datos** | Archivos JSON estructurados (`data/*.json`) gestionados por NestJS con escritura atómica |

> **Nota arquitectónica**: El frontend jamás importa directamente los archivos JSON. Toda lectura, filtrado, paginación, creación, edición, cálculo de KPIs y generación de recomendaciones se procesa en el backend NestJS y se expone mediante endpoints HTTP REST (`/api/*`).

---

## 📂 Estructura Completa del Proyecto

```text
plataforma-inteligencia-empresarial/
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── ui/                 # Componentes UI reutilizables (Cards, Modals, Badges, KPIs)
│   │   │   ├── layouts/
│   │   │   │   └── SectorLayout.tsx    # Layout ejecutivo con Sidebar independiente por sector
│   │   │   ├── pages/
│   │   │   │   ├── home/               # Portal Principal: Plataforma de Inteligencia Empresarial
│   │   │   │   ├── mineria/            # Aplicación 1: MineControl Analytics
│   │   │   │   ├── finanzas/           # Aplicación 2: FinanceRisk Analytics
│   │   │   │   └── logistica/          # Aplicación 3: LogisticsTrack Analytics
│   │   │   ├── services/
│   │   │   │   └── api.ts              # Cliente HTTP REST hacia el backend NestJS
│   │   │   ├── hooks/
│   │   │   │   └── useFormatters.ts    # Formateadores de moneda (PEN) y porcentajes
│   │   │   ├── types/
│   │   │   │   └── index.ts            # Interfaces TypeScript de los 3 dominios
│   │   │   ├── App.tsx                 # Configuración de rutas React Router
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   └── vite.config.ts              # Proxy /api -> http://localhost:3000
│   │
│   └── backend/
│       ├── src/
│       │   ├── modules/
│       │   │   ├── mineria/            # Controllers, Services, DTOs e Interfaces de Minería
│       │   │   ├── finanzas/           # Controllers, Services, DTOs e Interfaces de Finanzas
│       │   │   └── logistica/          # Controllers, Services, DTOs e Interfaces de Logística
│       │   ├── common/
│       │   │   ├── dto/                # DTOs de paginación y filtrado multicriterio
│       │   │   ├── filters/            # Filtro global de excepciones HTTP
│       │   │   └── services/           # JsonStorageService (persistencia JSON segura)
│       │   ├── portal.controller.ts    # Endpoint consolidado del portal principal
│       │   ├── app.module.ts
│       │   └── main.ts
│       └── package.json
│
├── data/
│   ├── mineria.json                    # Base de datos simulada del sector minero
│   ├── finanzas.json                   # Base de datos simulada del sector financiero
│   └── logistica.json                  # Base de datos simulada del sector logístico
│
├── scripts/
│   ├── dev.mjs                         # Orquestador que verifica dependencias e inicia Front + Back
│   ├── generate-data.mjs               # Generador determinista de datos simulados
│   └── verify-all.mjs                  # Suite de pruebas integrales y verificación CRUD
│
├── iniciar.ps1                         # Script PowerShell de inicio rápido con autoinstalación
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .gitignore
└── README.md
```

---

## 📊 Origen y Volumen de los Datos Simulados (`data/*.json`)

Los datos simulados mantienen integridad referencial mediante identificadores únicos y superan todos los volúmenes requeridos:

1. **`data/mineria.json`**:
   - **24 registros de producción** cubriendo los **12 meses del año** en 5 unidades mineras.
   - **22 maquinarias pesadas** (`MAQ-001` a `MAQ-022`).
   - **34 órdenes de mantenimiento** (`MNT-001` a `MNT-034`) vinculadas a `maquinariaId`.
   - **24 incidentes de seguridad** (`INC-001` a `INC-024`).
2. **`data/finanzas.json`**:
   - **105 clientes** (`CLI-001` a `CLI-105`) entre empresas (`RUC`) y personas naturales (`DNI`).
   - **155 créditos** (`CRD-001` a `CRD-155`) vinculados a `clienteId`.
   - **620 cuotas programadas** (`CUO-0001` a `CUO-0620`) vinculadas a `creditoId` y `clienteId`.
   - **285 pagos registrados** (`PAG-0001` a `PAG-0285`) en soles peruanos (`PEN`).
3. **`data/logistica.json`**:
   - **210 pedidos** (`PED-0001` a `PED-0210`) vinculados a `rutaId`, `vehiculoId` y `conductorId`.
   - **18 vehículos** (`VEH-001` a `VEH-018`).
   - **22 conductores** (`CON-001` a `CON-022`).
   - **26 rutas nacionales y metropolitanas** (`RUT-001` a `RUT-026`).

---

## 🧪 Comandos Adicionales de Verificación y Compilación

- **Ejecutar pruebas integrales automatizadas** (verifica integridad de datos, levantamiento de NestJS, endpoints de KPIs/gráficos/recomendaciones y operaciones CRUD en los 3 módulos):
  ```powershell
  pnpm test
  ```
- **Compilar para producción** (Backend NestJS + Frontend React/Vite):
  ```powershell
  pnpm run build
  ```
- **Regenerar los datos simulados a su estado original**:
  ```powershell
  pnpm run seed
  ```
