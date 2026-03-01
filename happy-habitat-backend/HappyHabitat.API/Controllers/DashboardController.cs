using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Obtiene los datos del dashboard para una comunidad: ingresos/egresos del mes,
    /// morosos, recaudación y gastos de los últimos X meses, tickets levantados y resueltos.
    /// </summary>
    /// <param name="communityId">Id de la comunidad.</param>
    /// <param name="ultimosMeses">Cantidad de meses para las series de recaudación y gastos (por defecto 6).</param>
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get(
        [FromQuery] Guid communityId,
        [FromQuery] int ultimosMeses = 6)
    {
        if (communityId == Guid.Empty)
            return BadRequest("communityId es requerido.");
        if (ultimosMeses < 1 || ultimosMeses > 24)
            ultimosMeses = 6;

        var result = await _dashboardService.GetDashboardAsync(communityId, ultimosMeses);
        return Ok(result);
    }
}
