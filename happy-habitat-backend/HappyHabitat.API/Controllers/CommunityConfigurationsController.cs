using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
public class CommunityConfigurationsController : ControllerBase
{
    private readonly ICommunityConfigurationService _service;

    public CommunityConfigurationsController(ICommunityConfigurationService service)
    {
        _service = service;
    }

    /// <summary>
    /// Obtener todas las configuraciones de comunidad
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommunityConfigurationDto>>> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    /// <summary>
    /// Obtener configuraciones por ID de comunidad
    /// </summary>
    [HttpGet("community/{communityId:guid}")]
    public async Task<ActionResult<IEnumerable<CommunityConfigurationDto>>> GetByCommunityId(Guid communityId)
    {
        var list = await _service.GetByCommunityIdAsync(communityId);
        return Ok(list);
    }

    /// <summary>
    /// Obtener una configuración por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CommunityConfigurationDto>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    /// <summary>
    /// Crear una nueva configuración de comunidad
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CommunityConfigurationDto>> Create(CreateCommunityConfigurationDto dto)
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
    /// Actualizar una configuración existente
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CommunityConfigurationDto>> Update(Guid id, UpdateCommunityConfigurationDto dto)
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
    /// Eliminar una configuración
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
