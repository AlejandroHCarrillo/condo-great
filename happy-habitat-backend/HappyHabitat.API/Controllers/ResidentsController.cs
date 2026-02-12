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
    /// Obtiene todos los residentes. Si se envían page y pageSize, devuelve resultado paginado.
    /// </summary>
    /// <param name="page">Página (1-based). Opcional.</param>
    /// <param name="pageSize">Tamaño de página. Opcional (ej. 10, 20).</param>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? page, [FromQuery] int? pageSize)
    {
        if (page.HasValue && pageSize.HasValue && page.Value > 0 && pageSize.Value > 0)
        {
            var paged = await _residentService.GetAllPagedAsync(page.Value, pageSize.Value);
            return Ok(paged);
        }
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
    /// Obtiene los residentes de una comunidad. Si se envían page y pageSize, devuelve resultado paginado.
    /// </summary>
    [HttpGet("community/{communityId:guid}")]
    public async Task<IActionResult> GetByCommunityId(Guid communityId, [FromQuery] int? page, [FromQuery] int? pageSize)
    {
        if (page.HasValue && pageSize.HasValue && page.Value > 0 && pageSize.Value > 0)
        {
            var paged = await _residentService.GetByCommunityIdPagedAsync(communityId, page.Value, pageSize.Value);
            return Ok(paged);
        }
        var residents = await _residentService.GetByCommunityIdAsync(communityId);
        return Ok(residents);
    }

    /// <summary>
    /// Obtiene los residentes de varias comunidades (ids en query). Ej: ?communityIds=guid1&amp;communityIds=guid2
    /// Devuelve residentes únicos por usuario (sin duplicados). Si se envían page y pageSize, devuelve resultado paginado.
    /// </summary>
    [HttpGet("by-communities")]
    public async Task<IActionResult> GetByCommunityIds([FromQuery] Guid[] communityIds, [FromQuery] int? page, [FromQuery] int? pageSize)
    {
        if (communityIds == null || communityIds.Length == 0)
            return Ok(page.HasValue && pageSize.HasValue ? (object)new PagedResultDto<ResidentDto> { Page = page ?? 1, PageSize = pageSize ?? 10 } : Array.Empty<ResidentDto>());
        if (page.HasValue && pageSize.HasValue && page.Value > 0 && pageSize.Value > 0)
        {
            var paged = await _residentService.GetByCommunityIdsPagedAsync(communityIds, page.Value, pageSize.Value);
            return Ok(paged);
        }
        var residents = await _residentService.GetByCommunityIdsAsync(communityIds);
        return Ok(residents);
    }

    /// <summary>
    /// Crea un residente. El UserId debe existir y no tener ya un residente asociado.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ResidentDto>> Create([FromBody] CreateResidentDto dto)
    {
        if (dto == null)
            return BadRequest();
        var resident = await _residentService.CreateAsync(dto);
        if (resident == null)
            return BadRequest("Usuario no existe, ya tiene residente asociado o comunidad no válida.");
        return CreatedAtAction(nameof(GetById), new { id = resident.Id }, resident);
    }

    /// <summary>
    /// Actualiza un residente por su ID.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ResidentDto>> Update(Guid id, [FromBody] UpdateResidentDto dto)
    {
        if (dto == null)
            return BadRequest();
        var resident = await _residentService.UpdateAsync(id, dto);
        if (resident == null)
            return NotFound();
        return Ok(resident);
    }

    /// <summary>
    /// Elimina un residente por su ID.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _residentService.DeleteAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }
}
