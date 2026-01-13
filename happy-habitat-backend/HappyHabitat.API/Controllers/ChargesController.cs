using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/charges")]
[Authorize]
public class ChargesController : ControllerBase
{
    private readonly IChargesService _chargesService;

    public ChargesController(IChargesService chargesService)
    {
        _chargesService = chargesService;
    }

    /// <summary>
    /// Get statement (cargos and pagos) by contrato ID
    /// </summary>
    [HttpGet("contrato/{contratoId}")]
    public async Task<ActionResult<StatementDto>> GetStatementByContratoId(Guid contratoId)
    {
        var statement = await _chargesService.GetStatementByContratoIdAsync(contratoId);
        return Ok(statement);
    }

    /// <summary>
    /// Get statement (cargos and pagos) by comunidad ID
    /// </summary>
    [HttpGet("comunidad/{comunidadId}")]
    public async Task<ActionResult<StatementDto>> GetStatementByComunidadId(Guid comunidadId)
    {
        var statement = await _chargesService.GetStatementByComunidadIdAsync(comunidadId);
        return Ok(statement);
    }

    /// <summary>
    /// Get all cargos by comunidad ID
    /// </summary>
    [HttpGet("comunidad/{comunidadId}/cargos")]
    public async Task<ActionResult<IEnumerable<CargoComunidadDto>>> GetCargosByComunidadId(Guid comunidadId)
    {
        var cargos = await _chargesService.GetCargosByComunidadIdAsync(comunidadId);
        return Ok(cargos);
    }

    /// <summary>
    /// Get all cargos by contrato ID
    /// </summary>
    [HttpGet("contrato/{contratoId}/cargos")]
    public async Task<ActionResult<IEnumerable<CargoComunidadDto>>> GetCargosByContratoId(Guid contratoId)
    {
        var cargos = await _chargesService.GetCargosByContratoIdAsync(contratoId);
        return Ok(cargos);
    }
}
