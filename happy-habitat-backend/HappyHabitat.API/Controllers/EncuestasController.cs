using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
public class EncuestasController : ControllerBase
{
    private readonly IEncuestaService _service;
    private readonly IResidentService _residentService;

    public EncuestasController(IEncuestaService service, IResidentService residentService)
    {
        _service = service;
        _residentService = residentService;
    }

    /// <summary>Obtener todas las encuestas.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EncuestaDto>>> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    /// <summary>Obtener encuestas por ID de comunidad.</summary>
    [HttpGet("community/{communityId:guid}")]
    public async Task<ActionResult<IEnumerable<EncuestaDto>>> GetByCommunityId(Guid communityId)
    {
        var list = await _service.GetByCommunityIdAsync(communityId);
        return Ok(list);
    }

    /// <summary>Obtener una encuesta por ID.</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EncuestaDto>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    /// <summary>Crear una nueva encuesta.</summary>
    [HttpPost]
    public async Task<ActionResult<EncuestaDto>> Create(CreateEncuestaDto dto)
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

    /// <summary>Actualizar una encuesta existente.</summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EncuestaDto>> Update(Guid id, UpdateEncuestaDto dto)
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

    /// <summary>Eliminar una encuesta.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }

    /// <summary>El residente envía sus respuestas a la encuesta. El residentId se obtiene del usuario autenticado.</summary>
    [HttpPost("{id:guid}/responder")]
    public async Task<IActionResult> Responder(Guid id, [FromBody] SubmitEncuestaRespuestasDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var resident = await _residentService.GetByUserIdAsync(userId);
        if (resident == null)
            return BadRequest("Usuario no está registrado como residente.");

        try
        {
            await _service.SubmitRespuestasAsync(id, resident.Id, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
