using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProveedorServiciosController : ControllerBase
{
    private readonly IProveedorServicioService _service;

    public ProveedorServiciosController(IProveedorServicioService service)
    {
        _service = service;
    }

    /// <summary>Obtener todos los proveedores de servicios (admin).</summary>
    [HttpGet]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<ActionResult<IEnumerable<ProveedorServicioDto>>> GetAll([FromQuery] bool includeInactive = false)
    {
        var list = await _service.GetAllAsync(includeInactive);
        return Ok(list);
    }

    /// <summary>Obtener proveedores por comunidad (admin o por comunidad para residentes).</summary>
    [HttpGet("community/{communityId:guid?}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ProveedorServicioDto>>> GetByCommunityId(Guid? communityId, [FromQuery] bool includeInactive = false)
    {
        var list = await _service.GetByCommunityIdAsync(communityId, includeInactive);
        return Ok(list);
    }

    /// <summary>Obtener un proveedor por ID.</summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProveedorServicioDto>> GetById(Guid id, [FromQuery] bool includeInactive = false)
    {
        var item = await _service.GetByIdAsync(id, includeInactive);
        if (item == null) return NotFound();
        return Ok(item);
    }

    /// <summary>Crear proveedor de servicios (admin).</summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<ActionResult<ProveedorServicioDto>> Create(CreateProveedorServicioDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userId, out var uid))
                dto.CreatedByUserId = uid;

            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>Actualizar proveedor de servicios (admin).</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<ActionResult<ProveedorServicioDto>> Update(Guid id, UpdateProveedorServicioDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userId, out var uid))
                dto.UpdatedByUserId = uid;

            var item = await _service.UpdateAsync(id, dto);
            if (item == null) return NotFound();
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>Eliminar (soft) proveedor de servicios (admin).</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    /// <summary>Calificar un proveedor (0-5). Usuario autenticado.</summary>
    [HttpPost("{id:guid}/calificar")]
    [Authorize]
    public async Task<ActionResult<ProveedorServicioDto>> Calificar(Guid id, [FromBody] CalificarProveedorRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var uid))
            return Unauthorized();

        try
        {
            var item = await _service.CalificarAsync(id, uid, request.Puntuacion);
            if (item == null) return NotFound();
            return Ok(item);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public class CalificarProveedorRequest
{
    public decimal Puntuacion { get; set; }
}
