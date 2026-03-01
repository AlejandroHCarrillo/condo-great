# Recomendaciones para construir el dashboard de Happy Habitat

Documento de referencia a partir del [análisis del video Edifito](Dashboard-Condominio-Video-Edifito-vs-Happy-Habitat.md) y del estado actual del sistema (cargos, pagos, morosos, configuración).

---

## 1. Objetivo y alcance

- **Objetivo:** Una pantalla única (dashboard) donde el administrador de la empresa vea, por comunidad y periodo, los indicadores clave de gestión: recaudación, morosidad y, en una segunda fase, evolución y distribución.
- **Uso:** Reuniones con el comité, revisión rápida del estado financiero y de cobranza sin depender de Excel.
- **Alcance inicial:** Solo indicadores que se puedan calcular con los datos actuales (cargos, pagos, residentes, configuración). Egresos “reales” (gastos del condominio) se pueden incorporar cuando exista un módulo de gastos/pagos a proveedores.

---

## 2. Ubicación en la aplicación

- **Ruta sugerida:** `dashboard` o `reportes/dashboard` dentro del área admin company (mismo layout que Reportes).
- **Menú:** Añadir **Dashboard** como primera opción del submenú de Reportes (o como ítem principal si se quiere máxima visibilidad). Referencia: `top-menu.component.ts` (`reportesSubmenuItems`) y `admincompany-routes.ts` en el frontend.
- **Filtros obligatorios:** Comunidad (selector ya usado en Morosos y otros) y **periodo** (mes o rango de meses). Sin comunidad seleccionada se puede mostrar mensaje “Seleccione una comunidad” o dashboard vacío.

---

## 3. Fuentes de datos actuales (sin cambios en backend)

Todo se puede obtener con las APIs existentes, igual que en el reporte de morosos:

| Dato | API / servicio | Uso en el dashboard |
|------|----------------|----------------------|
| Cargos de la comunidad | `CargosResidenteService.getByCommunityId(communityId)` | Agregar por mes (campo `fecha`), total cargado; opcional por `descripcion` para distribución por concepto. |
| Pagos de la comunidad | `PagosResidenteService.getByCommunityId(communityId)` | Solo pagos con `status === 'Aplicado'`; agregar por `fechaPago` por mes = **recaudación (ingresos)**. |
| Residentes | `ResidentsService.getResidentsByCommunityId(communityId)` | Calcular morosos (misma lógica que `morosos-list.component.ts`: balance ≥ 2× MONTO_MANT). |
| Configuración | `CommunityConfigurationsService.getByCommunityId(communityId)` | Leer `MONTO_MANT` para umbral de morosidad y etiquetas; opcional DIA_PAGO, DIAS_TOL. |

No es estrictamente necesario un nuevo endpoint en el backend para la Fase 1: se traen cargos y pagos por comunidad y se agrega por periodo en el frontend (filtrar por `fecha` / `fechaPago` según el mes o rango elegido).

---

## 4. Indicadores a mostrar

### 4.1 Fase 1 – Tarjetas (KPIs)

| Indicador | Definición | Fuente |
|-----------|------------|--------|
| **Recaudado (ingresos)** | Suma de pagos con status `Aplicado` en el periodo seleccionado. | Pagos por comunidad, filtrar por `fechaPago` y `status`. |
| **Cargado** | Suma de cargos con `fecha` en el periodo (opcional; referencia de lo que se debía cobrar). | Cargos por comunidad, filtrar por `fecha`. |
| **Tasa recaudación** | (Recaudado / Cargado) × 100 si Cargado > 0; si no hay cargos en periodo, se puede mostrar solo Recaudado. | Calculado. |
| **Cantidad de morosos** | Número de residentes con balance ≥ 2× MONTO_MANT (misma lógica que reporte Morosos). | Residentes + Cargos + Pagos + Config (MONTO_MANT). |
| **Monto en mora** | Suma de balances (total cargos − total pagos Aplicado) de los residentes considerados morosos. | Idem. |

Enlace desde el dashboard al reporte **Morosos** (ruta `reportes/morosos`) para el detalle.

Nota: “Egresos” (gastos del condominio) no se pueden calcular con el modelo actual. Cuando exista un módulo de gastos, se añadirá una tarjeta “Egresos” y un indicador tipo “% gastos sobre ingresos”.

### 4.2 Fase 2 – Gráficos

| Gráfico | Descripción | Datos |
|---------|-------------|--------|
| **Evolución mensual** | Líneas o barras: Recaudado (y opcional Cargado) por mes, para los últimos 6–12 meses. | Misma fuente; agregar cargos y pagos por mes. |
| **Distribución por concepto** | Torta o barras: participación de cada concepto (descripción del cargo o del pago) en el total del periodo. | Agrupar cargos o pagos por `descripcion` / `concepto` en el periodo seleccionado. |

Ambos deben respetar el filtro de comunidad y el selector de periodo (o rango de meses).

---

## 5. Filtros

- **Comunidad:** Reutilizar el componente `CommunityFilterComponent` y el patrón de `selectedComunidadId` + query param `comunidad` como en Morosos.
- **Periodo:** Selector de mes (año-mes) o de rango (desde-hasta). Por defecto: mes actual o último mes cerrado. Al cambiar el periodo se recalculan todas las tarjetas y gráficos (no hace falta recargar toda la lista de cargos/pagos si ya se tiene en memoria; se puede filtrar en cliente por fecha).

Si el backend en el futuro expone parámetros `from`/`to` en cargos y pagos, se podrá filtrar en servidor para comunidades con muchos movimientos.

---

## 6. Stack técnico sugerido

- **Frontend:** Angular (standalone), mismo estilo que el resto del módulo admin (señales, `OnInit`, servicios existentes). Componente standalone, por ejemplo `DashboardComponent`.
- **Gráficos:** Librería ligera y mantenida, por ejemplo:
  - **ng2-charts** (wrapper de Chart.js) o **Chart.js** directo, o
  - **ngx-charts** (basado en D3) si se prefiere más personalización.
- **Estilos:** Mantener el mismo diseño que el resto de la app (p. ej. DaisyUI/ Tailwind si ya se usa); tarjetas con bordes o sombra, números destacados, colores coherentes (verde para ingresos/recaudado, ámbar/rojo para mora).
- **Responsive:** Tarjetas en grid (1 col móvil, 2–3 en tablet/desktop); gráficos que se redimensionen con el contenedor.

---

## 7. Enfoque de implementación

- **Opción A (recomendada para Fase 1):** Todo en frontend. Un solo componente Dashboard que:
  1. Obtiene comunidad del selector y periodo del nuevo control.
  2. Llama `getByCommunityId` para cargos y pagos (y residentes + config si va a calcular morosidad).
  3. Filtra por fechas según el periodo elegido y agrega (totales por mes, por concepto).
  4. Calcula morosos con la misma lógica que `MorososListComponent` (reutilizar o extraer a un servicio/util compartido).
  5. Muestra tarjetas y, en Fase 2, gráficos.

Ventaja: no tocar backend; despliegue rápido. Desventaja: en comunidades con muchos movimientos, cargar todos los cargos/pagos puede ser pesado; si ocurre, se puede añadir después un endpoint de resumen.

- **Opción B (futuro):** Endpoint en backend, por ejemplo `GET /api/dashboard/summary?communityId=&from=&to=` que devuelva `{ totalRecaudado, totalCargado, cantidadMorosos, montoEnMora, porMes: [...], porConcepto: [...] }`. El frontend solo consume ese DTO y pinta tarjetas y gráficos. Mejor para muchas comunidades o muchos datos.

Recomendación: empezar con Opción A; si el rendimiento lo exige o se quiere centralizar reglas de negocio (p. ej. definición de “periodo”), introducir Opción B.

---

## 8. Resumen de pasos concretos

1. **Ruta y menú:** Añadir ruta `dashboard` (o `reportes/dashboard`) y entrada “Dashboard” en el submenú de Reportes; crear `DashboardComponent` vacío y verificar navegación.
2. **Filtros:** Integrar selector de comunidad (CommunityFilter) y selector de periodo (mes o rango).
3. **Carga de datos:** En `DashboardComponent`, con comunidad seleccionada, hacer `forkJoin` de cargos, pagos, residentes y config (igual que Morosos); guardar en señales.
4. **Cálculos:** Función (o servicio) que, dado periodo y datos, devuelva: totalRecaudado, totalCargado, tasaRecaudacion, cantidadMorosos, montoEnMora; y para gráficos: series por mes y por concepto.
5. **Vista Fase 1:** Cuatro o cinco tarjetas con los KPIs; enlace “Ver morosos” a `reportes/morosos?comunidad=...`.
6. **Fase 2:** Añadir librería de gráficos; gráfico de evolución mensual y gráfico de distribución por concepto; conectar a los mismos datos y al filtro de periodo.
7. **Opcional:** Extraer la lógica de “cálculo de morosos” a un servicio compartido entre `MorososListComponent` y `DashboardComponent` para no duplicar código.

Con esto se tiene un dashboard alineado con el video de Edifito, reutilizando datos y patrones ya existentes en Happy Habitat, y un camino claro para añadir egresos y más indicadores cuando el sistema lo permita.
