# Dashboard para administración de condominio: video Edifito y aplicación en Happy Habitat

**Fuente:** [Cómo crear un dashboard en Excel para la administración del condominio](https://www.youtube.com/watch?v=2jg1qdrCWgg) — Canal Edifito, 1h 14min (nov 2020).

---

## 1. Principales elementos del video

### 1.1 Concepto de indicadores de gestión (KPIs)

- **No son transaccionales:** no es el detalle del día a día, sino mediciones por periodo (p. ej. mensual) para ver evolución y tomar decisiones.
- **Frase clave:** "Lo que no se mide no se gestiona."
- **Uso típico:** reuniones del administrador con el comité; mostrar cómo va la operación y el presupuesto.

### 1.2 Áreas de indicadores sugeridas

| Área | Ejemplos de indicadores |
|------|-------------------------|
| **Financiero** | Total ingresos, total egresos, % gastos sobre ingresos, cumplimiento presupuestario, fondos de reserva, tasa de ahorro (meses de gasto común cubiertos con ahorro), **morosidad** (cantidad de morosos, monto en mora, evolución). |
| **Personal** | Personal de planta, reemplazos, licencias, rotación, costos previsionales. |
| **Operacional** | Mantenciones, costos por incidente, visitas, paquetería, uso de instalaciones. |
| **Comunicación** | Nivel de comunicación con la comunidad (cartas, avisos, transparencia). |

### 1.3 Preparación de datos

- **Problema:** los reportes suelen venir en "tabla general" (periodos en columnas, muchos campos en una fila).
- **Solución:** pasar a **tabla normalizada**: una fila por registro, con columnas como periodo, concepto, ámbito, tipo (ingreso/egreso), monto.
- Con datos normalizados se pueden hacer tablas dinámicas y análisis por periodo y por categoría.

### 1.4 Construcción del dashboard en Excel

- **Indicadores principales** en tarjetas: total ingresos, total egresos, tasa gastos/ingresos (%).
- **Gráficos:** líneas para evolución mensual ingresos vs egresos; torta para distribución de gastos por ámbito.
- **Segmentación (slicers):** filtro por mes conectado a todas las tablas dinámicas para que el dashboard se actualice al seleccionar periodo.
- **Presentación:** títulos, formas, colores (verde ingresos, rojo egresos), diseño consistente para reuniones.

---

## 2. Aplicación en Happy Habitat

### 2.1 Qué ya existe en el sistema

- **Cargos y pagos** por residente → base para ingresos y egresos.
- **Reporte de morosos** (listado y umbral configurable con `MONTO_MANT`).
- **Historial de pagos por residente** → detalle y evolución.
- **Configuración de comunidad** (DIA_PAGO, DIAS_TOL, MONTO_MANT, etc.).
- **Precios** y **proveedores** → posibles categorías de gastos/ingresos.

Con esto se puede empezar a definir indicadores financieros y de morosidad sin depender de Excel.

### 2.2 Cómo aplicar los elementos del video

| Elemento del video | Aplicación en Happy Habitat |
|-------------------|-----------------------------|
| **Indicadores de gestión (KPIs)** | Definir un módulo o pantalla "Dashboard" o "Indicadores" en el área admin: total ingresos, total egresos, % gastos/ingresos, cumplimiento presupuestario (si hay presupuesto), fondos de reserva (si se registran). |
| **Morosidad** | Reutilizar lógica de morosos: cantidad de morosos, monto total en mora, y si es posible evolución mensual (gráfico o tabla). Enlazar desde el dashboard al reporte de morosos ya existente. |
| **Datos normalizados** | En backend, los cargos/pagos ya son por periodo y concepto. Asegurar que las consultas para el dashboard devuelvan datos agregables por mes y por tipo (ingreso/egreso) y por categoría (mantenimiento, extraordinarios, proveedores, etc.). |
| **Tarjetas de indicadores** | En el frontend, mostrar tarjetas (cards) con total ingresos, total egresos, tasa gastos/ingresos, número de morosos y/o monto en mora. Valores obtenidos por API a partir de cargos y pagos. |
| **Gráficos** | Añadir gráficos (p. ej. con librería tipo Chart.js o similar): evolución mensual ingresos vs egresos; distribución de gastos por categoría/concepto. Filtro por comunidad y por rango de fechas. |
| **Filtro por periodo** | Incluir selector de mes o rango de meses (equivalente al "slicer" del video) que actualice todas las tarjetas y gráficos del dashboard. |
| **Indicadores operacionales/comunicación** | A medio plazo: si se implementan módulos de visitas, tickets, comunicados, se pueden añadir KPIs (p. ej. tickets abiertos/cerrados, comunicados enviados). No son prioritarios para la primera versión del dashboard. |

### 2.3 Prioridad sugerida

1. **Fase 1:** Dashboard con indicadores financieros básicos (ingresos, egresos, tasa gastos/ingresos) y morosidad (cantidad y monto), con filtro por comunidad y por mes.
2. **Fase 2:** Gráficos de evolución mensual y de distribución de gastos; opcionalmente indicador de "meses de gasto en reserva" si se modela fondos de reserva.
3. **Fase 3:** Ampliar con indicadores operacionales o de comunicación cuando existan los módulos correspondientes.

---

## 3. Resumen

El video enfatiza **medir por periodos**, **normalizar datos** y **presentar indicadores y gráficos en un panel único con filtros**. En Happy Habitat, eso se traduce en un **dashboard en la app** que consuma los datos ya existentes (cargos, pagos, morosos, configuración) y muestre tarjetas y gráficos con filtro por periodo, sin depender de Excel y alineado con el reglamento y la operación del condominio.
