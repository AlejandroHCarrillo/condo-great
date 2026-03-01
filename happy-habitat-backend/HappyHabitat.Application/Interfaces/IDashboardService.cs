using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IDashboardService
{
    /// <summary>
    /// Obtiene los datos agregados del dashboard para una comunidad.
    /// </summary>
    /// <param name="communityId">Id de la comunidad.</param>
    /// <param name="ultimosMeses">Cantidad de meses para las series de recaudación y gastos mensuales (por defecto 6).</param>
    Task<DashboardDto> GetDashboardAsync(Guid communityId, int ultimosMeses = 6);
}
