using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommunityProvidersController : ControllerBase
{
    private readonly ICommunityProviderService _service;

    public CommunityProvidersController(ICommunityProviderService service)
    {
        _service = service;
    }

    /// <summary>
    /// Obtener todos los proveedores de comunidad
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommunityProviderDto>>> GetAll([FromQuery] bool includeInactive = false)
    {
        var list = await _service.GetAllAsync(includeInactive);
        return Ok(list);
    }

    /// <summary>
    /// Obtener proveedores por ID de comunidad
    /// </summary>
    [HttpGet("community/{communityId:guid?}")]
    public async Task<ActionResult<IEnumerable<CommunityProviderDto>>> GetByCommunityId(Guid? communityId, [FromQuery] bool includeInactive = false)
    {
        var list = await _service.GetByCommunityIdAsync(communityId, includeInactive);
        return Ok(list);
    }

    /// <summary>
    /// Obtener un proveedor por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CommunityProviderDto>> GetById(Guid id, [FromQuery] bool includeInactive = false)
    {
        var item = await _service.GetByIdAsync(id, includeInactive);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    /// <summary>
    /// Crear un nuevo proveedor de comunidad
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CommunityProviderDto>> Create(CreateCommunityProviderDto dto)
    {
        try
        {
            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Actualizar un proveedor existente
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CommunityProviderDto>> Update(Guid id, UpdateCommunityProviderDto dto)
    {
        try
        {
            var item = await _service.UpdateAsync(id, dto);
            if (item == null)
                return NotFound();
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Eliminar (soft delete) un proveedor
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
