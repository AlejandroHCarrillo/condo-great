namespace HappyHabitat.Application.DTOs;

/// <summary>
/// Respuesta del endpoint de dashboard por comunidad.
/// </summary>
public class DashboardDto
{
    public Guid CommunityId { get; set; }
    /// <summary>Total de pagos aplicados (recaudación) en el mes actual.</summary>
    public decimal IngresosDelMes { get; set; }
    /// <summary>Total de gastos/egresos de la comunidad en el mes actual (pagos a cargos de comunidad).</summary>
    public decimal EgresosDelMes { get; set; }
    /// <summary>Cantidad de residentes con balance >= umbral moroso (2 × mantenimiento).</summary>
    public int CantidadMorosos { get; set; }
    /// <summary>Suma de los adeudos de los morosos.</summary>
    public decimal MontoEnMora { get; set; }
    /// <summary>Recaudación por mes para los últimos X meses (ordenado por año/mes ascendente).</summary>
    public List<MontoPorMesDto> RecaudacionMensual { get; set; } = [];
    /// <summary>Gastos por mes para los últimos X meses (ordenado por año/mes ascendente).</summary>
    public List<MontoPorMesDto> GastosMensuales { get; set; } = [];
    /// <summary>Número total de tickets de la comunidad (en el periodo consultado o todos).</summary>
    public int TicketsLevantados { get; set; }
    /// <summary>Número de tickets con estado Resuelto.</summary>
    public int TicketsResueltos { get; set; }
    /// <summary>Saldo actual en banco (recaudación acumulada menos gastos acumulados hasta la fecha).</summary>
    public decimal SaldoActualEnBanco { get; set; }
    /// <summary>Saldo al cierre de cada uno de los últimos X meses (recaudación acumulada menos gastos acumulados hasta fin de ese mes).</summary>
    public List<MontoPorMesDto> SaldosMensualesEnBanco { get; set; } = [];
}

public class MontoPorMesDto
{
    public int Anio { get; set; }
    public int Mes { get; set; }
    public decimal Total { get; set; }
}
