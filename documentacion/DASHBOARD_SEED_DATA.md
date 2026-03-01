# Datos del dashboard y seeder (DummySeeder)

## Qué alimenta el dashboard

| Métrica | Fuente en backend | Seeder |
|--------|-------------------|--------|
| **IngresosDelMes / RecaudacionMensual** | CargoResidente + PagosResidente (status Aplicado) por comunidad | ✅ Cargos y pagos de mantenimiento para **todas** las comunidades con residentes (Pueblito ya tenía; el resto se agregan en `AddCargosYPagosMantenimientoParaOtrasComunidadesAsync`) |
| **Morosos** | Residentes con balance ≥ umbral (MONTO_MANT) | ✅ Misma fuente; al haber cargos y pagos por comunidad, el cálculo de morosos tiene datos |
| **SaldoActualEnBanco / SaldosMensualesEnBanco** | SaldoCuentaBancaria + movimientos implícitos por pagos | ✅ Config BANCO/CTA_BANCO y saldos últimos 12 meses por comunidad (existente) |
| **EgresosDelMes / GastosMensuales** | CargosComunidad + PagoComunidad + PagoCargoComunidad por ComunidadId | ✅ Solo **Bruselas** y **Coto Berlin** (Contratos → GenerarCargosParaContrato → GenerarPagosParaCargos) |
| **TicketsLevantados / TicketsResueltos** | Ticket por comunidad, StatusCode "Resuelto" para resueltos | ✅ Tickets para **todas** las comunidades, con mix Nuevo/Resuelto (`SeedTicketsParaTodasLasComunidadesAsync`) |

## Entidades ya implementadas

Todas las entidades que usa el dashboard existen en el dominio y en el seeder:

- CargoResidente, PagosResidente, Residents, CommunityConfiguration (MONTO_MANT)
- CargosComunidad, PagoComunidad, PagoCargoComunidad, Contrato
- Ticket, StatusTicket (Nuevo, Resuelto)
- SaldoCuentaBancaria, CommunityConfiguration (BANCO, CTA_BANCO)

No hay entidades pendientes de implementar para estas métricas.

## Trabajo pendiente (opcional)

1. **Egresos en más comunidades**  
   Hoy solo **Bruselas** y **Coto Berlin** tienen Contratos y por tanto CargosComunidad/PagoComunidad. Para que **Residencial El Pueblito**, **Fuentes de valle**, **Jardines de Morelos**, etc. muestren Egresos en el dashboard, hay que:
   - Crear Contratos por comunidad en el DummySeeder (similar al bloque de Bruselas/Coto Berlin), y
   - Llamar `GenerarCargosParaContrato` y `GenerarPagosParaCargos` para cada una.

2. **Documentación de egresos**  
   Opcional: en el código del seeder, un comentario indicando que los egresos del dashboard dependen de que la comunidad tenga Contratos (y por tanto CargosComunidad/PagoComunidad).

---

*Actualizado tras agregar cargos/pagos de mantenimiento y tickets para todas las comunidades de prueba en el DummySeeder.*
