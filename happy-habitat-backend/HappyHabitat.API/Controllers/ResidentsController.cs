using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResidentsController : ControllerBase
{
    private readonly IResidentService _residentService;

    public ResidentsController(IResidentService residentService)
    {
        _residentService = residentService;
    }

    /// <summary>
    /// Obtiene todos los residentes (usuarios activos con datos de residente).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResidentDto>>> GetAll()
    {
        var residents = await _residentService.GetAllAsync();
        return Ok(residents);
    }

    /// <summary>
    /// Obtiene un residente por su ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ResidentDto>> GetById(Guid id)
    {
        var resident = await _residentService.GetByIdAsync(id);
        if (resident == null)
            return NotFound();
        return Ok(resident);
    }

    /// <summary>
    /// Obtiene los residentes de una comunidad.
    /// </summary>
    [HttpGet("community/{communityId:guid}")]
    public async Task<ActionResult<IEnumerable<ResidentDto>>> GetByCommunityId(Guid communityId)
    {
        var residents = await _residentService.GetByCommunityIdAsync(communityId);
        return Ok(residents);
    }

    /// <summary>
    /// Obtiene los residentes de varias comunidades (ids en query). Ej: ?communityIds=guid1&amp;communityIds=guid2
    /// Devuelve residentes únicos por usuario (sin duplicados).
    /// </summary>
    [HttpGet("by-communities")]
    public async Task<ActionResult<IEnumerable<ResidentDto>>> GetByCommunityIds([FromQuery] Guid[] communityIds)
    {
        if (communityIds == null || communityIds.Length == 0)
            return Ok(Array.Empty<ResidentDto>());
        var residents = await _residentService.GetByCommunityIdsAsync(communityIds);
        return Ok(residents);
    }
}
