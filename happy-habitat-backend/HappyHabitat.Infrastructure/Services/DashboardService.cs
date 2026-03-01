using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private const string ConfigCodigoMontoMantenimiento = "MONTO_MANT";
    private const decimal MontoMantenimientoDefault = 800m;

    private readonly ApplicationDbContext _context;
    private readonly ICargoResidenteService _cargoResidenteService;
    private readonly IPagosResidenteService _pagosResidenteService;
    private readonly IResidentService _residentService;
    private readonly ICommunityConfigurationService _configService;
    private readonly ITicketService _ticketService;

    public DashboardService(
        ApplicationDbContext context,
        ICargoResidenteService cargoResidenteService,
        IPagosResidenteService pagosResidenteService,
        IResidentService residentService,
        ICommunityConfigurationService configService,
        ITicketService ticketService)
    {
        _context = context;
        _cargoResidenteService = cargoResidenteService;
        _pagosResidenteService = pagosResidenteService;
        _residentService = residentService;
        _configService = configService;
        _ticketService = ticketService;
    }

    public async Task<DashboardDto> GetDashboardAsync(Guid communityId, int ultimosMeses = 6)
    {
        var today = DateTime.UtcNow.Date;
        var (yearActual, monthActual) = (today.Year, today.Month);

        // Ejecutar en secuencia: todos los servicios comparten el mismo DbContext (scoped) y no admite operaciones concurrentes.
        var cargos = (await _cargoResidenteService.GetByCommunityIdAsync(communityId)).ToList();
        var pagos = (await _pagosResidenteService.GetByCommunityIdAsync(communityId)).ToList();
        var residents = (await _residentService.GetByCommunityIdAsync(communityId)).ToList();
        var configs = (await _configService.GetByCommunityIdAsync(communityId)).ToList();
        var tickets = (await _ticketService.GetByCommunityIdAsync(communityId)).ToList();

        var umbralMoroso = ObtenerUmbralMoroso(configs);

        // Morosos: balance (cargos vencidos - pagos aplicados) >= umbral
        var (cantidadMorosos, montoEnMora) = CalcularMorosos(residents, cargos, pagos, umbralMoroso, today);

        // Ingresos del mes = suma de pagos Aplicado en el mes actual
        var ingresosDelMes = pagos
            .Where(p => p.Status == "Aplicado" && p.FechaPago.Year == yearActual && p.FechaPago.Month == monthActual)
            .Sum(p => p.Monto);

        // Recaudación mensual últimos X meses
        var recaudacionMensual = AgruparPagosPorMes(pagos, yearActual, monthActual, ultimosMeses);

        // Egresos del mes y gastos mensuales (desde PagoCargoComunidad + CargosComunidad de esta comunidad)
        var (egresosDelMes, gastosMensuales, egresosConFecha) = await ObtenerEgresosAsync(communityId, yearActual, monthActual, ultimosMeses);

        // Saldo en banco: recaudación acumulada menos gastos acumulados
        var aplicados = pagos.Where(p => p.Status == "Aplicado").ToList();
        var saldoActualEnBanco = aplicados.Where(p => p.FechaPago.Date <= today).Sum(p => p.Monto)
            - egresosConFecha.Where(e => e.Fecha.Date <= today).Sum(e => e.Monto);
        var saldosMensualesEnBanco = CalcularSaldosMensualesEnBanco(aplicados, egresosConFecha, yearActual, monthActual, ultimosMeses);

        // Tickets
        var ticketsLevantados = tickets.Count;
        var ticketsResueltos = tickets.Count(t => string.Equals(t.StatusCode, "Resuelto", StringComparison.OrdinalIgnoreCase));

        return new DashboardDto
        {
            CommunityId = communityId,
            IngresosDelMes = ingresosDelMes,
            EgresosDelMes = egresosDelMes,
            CantidadMorosos = cantidadMorosos,
            MontoEnMora = montoEnMora,
            RecaudacionMensual = recaudacionMensual,
            GastosMensuales = gastosMensuales,
            TicketsLevantados = ticketsLevantados,
            TicketsResueltos = ticketsResueltos,
            SaldoActualEnBanco = saldoActualEnBanco,
            SaldosMensualesEnBanco = saldosMensualesEnBanco
        };
    }

    private static decimal ObtenerUmbralMoroso(IList<CommunityConfigurationDto> configs)
    {
        var config = configs.FirstOrDefault(c => string.Equals(c.Codigo?.Trim(), ConfigCodigoMontoMantenimiento, StringComparison.OrdinalIgnoreCase));
        var valor = config?.Valor?.Trim();
        if (string.IsNullOrEmpty(valor))
            return 2 * MontoMantenimientoDefault;
        if (!decimal.TryParse(valor.Replace(",", "."), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var num) || num < 0)
            return 2 * MontoMantenimientoDefault;
        return 2 * num;
    }

    private static (int cantidadMorosos, decimal montoEnMora) CalcularMorosos(
        IList<ResidentDto> residents,
        IList<CargoResidenteDto> cargos,
        IList<PagosResidenteDto> pagos,
        decimal umbralMoroso,
        DateTime today)
    {
        int count = 0;
        decimal totalMora = 0;

        foreach (var r in residents)
        {
            var residentId = r.Id;
            var totalCargos = cargos
                .Where(c => c.ResidentId == residentId)
                .Where(c => c.Fecha.Date < today)
                .Sum(c => c.Monto);
            var totalPagos = pagos
                .Where(p => p.ResidenteId == residentId && p.Status == "Aplicado")
                .Sum(p => p.Monto);
            var balance = totalCargos - totalPagos;
            if (balance >= umbralMoroso)
            {
                count++;
                totalMora += balance;
            }
        }

        return (count, totalMora);
    }

    private static List<MontoPorMesDto> AgruparPagosPorMes(
        IList<PagosResidenteDto> pagos,
        int yearActual,
        int monthActual,
        int ultimosMeses)
    {
        var aplicados = pagos.Where(p => p.Status == "Aplicado").ToList();
        var porMes = aplicados
            .GroupBy(p => (p.FechaPago.Year, p.FechaPago.Month))
            .ToDictionary(g => g.Key, g => g.Sum(x => x.Monto));

        List<MontoPorMesDto> resultado = [];
        var (y, m) = (yearActual, monthActual);
        for (var i = 0; i < ultimosMeses; i++)
        {
            if (porMes.TryGetValue((y, m), out var total))
                resultado.Add(new MontoPorMesDto { Anio = y, Mes = m, Total = total });
            else
                resultado.Add(new MontoPorMesDto { Anio = y, Mes = m, Total = 0 });
            m--;
            if (m < 1) { m = 12; y--; }
        }
        resultado.Reverse();
        return resultado;
    }

    private async Task<(decimal egresosDelMes, List<MontoPorMesDto> gastosMensuales, List<(DateTime Fecha, decimal Monto)> egresosConFecha)> ObtenerEgresosAsync(
        Guid communityId,
        int yearActual,
        int monthActual,
        int ultimosMeses)
    {
        var query = await _context.PagoCargoComunidad
            .Include(pc => pc.PagoComunidad)
            .Include(pc => pc.CargosComunidad)
            .Where(pc => pc.CargosComunidad.ComunidadId == communityId)
            .ToListAsync();

        var egresosDelMes = 0m;
        Dictionary<(int Anio, int Mes), decimal> porMes = [];
        List<(DateTime Fecha, decimal Monto)> egresosConFecha = [];

        foreach (var pc in query)
        {
            if (string.IsNullOrEmpty(pc.PagoComunidad?.FechaDePago))
                continue;
            if (!DateTime.TryParse(pc.PagoComunidad.FechaDePago, out var fecha))
                continue;
            var key = (fecha.Year, fecha.Month);
            if (!porMes.ContainsKey(key))
                porMes[key] = 0;
            porMes[key] += pc.MontoAplicado;
            egresosConFecha.Add((fecha, pc.MontoAplicado));
            if (fecha.Year == yearActual && fecha.Month == monthActual)
                egresosDelMes += pc.MontoAplicado;
        }

        List<MontoPorMesDto> gastosMensuales = [];
        var (y, m) = (yearActual, monthActual);
        for (var i = 0; i < ultimosMeses; i++)
        {
            var total = porMes.TryGetValue((y, m), out var t) ? t : 0;
            gastosMensuales.Add(new MontoPorMesDto { Anio = y, Mes = m, Total = total });
            m--;
            if (m < 1) { m = 12; y--; }
        }
        gastosMensuales.Reverse();
        return (egresosDelMes, gastosMensuales, egresosConFecha);
    }

    private static List<MontoPorMesDto> CalcularSaldosMensualesEnBanco(
        IList<PagosResidenteDto> aplicados,
        IList<(DateTime Fecha, decimal Monto)> egresosConFecha,
        int yearActual,
        int monthActual,
        int ultimosMeses)
    {
        List<MontoPorMesDto> resultado = [];
        var (y, m) = (yearActual, monthActual);
        for (var i = 0; i < ultimosMeses; i++)
        {
            var ultimoDia = new DateTime(y, m, DateTime.DaysInMonth(y, m));
            var recaudacionAcum = aplicados.Where(p => p.FechaPago.Date <= ultimoDia).Sum(p => p.Monto);
            var egresosAcum = egresosConFecha.Where(e => e.Fecha.Date <= ultimoDia).Sum(e => e.Monto);
            resultado.Add(new MontoPorMesDto { Anio = y, Mes = m, Total = recaudacionAcum - egresosAcum });
            m--;
            if (m < 1) { m = 12; y--; }
        }
        resultado.Reverse();
        return resultado;
    }
}
