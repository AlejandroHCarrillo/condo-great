using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.API.Extensions;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[RequestSizeLimit(1_048_576)] // 1 MB for JSON payloads
public class ComentariosController : ControllerBase
{
    private readonly IComentarioService _service;
    private readonly IResidentService _residentService;

    public ComentariosController(IComentarioService service, IResidentService residentService)
    {
        _service = service;
        _residentService = residentService;
    }

    [HttpGet("origen/{origen}/{idOrigen}")]
    public async Task<ActionResult<IEnumerable<ComentarioDto>>> GetByOrigen(string origen, string idOrigen)
    {
        var list = await _service.GetByOrigenAsync(origen, idOrigen);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ComentarioDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ComentarioDto>> Create([FromBody] CreateComentarioDto dto)
    {
        var resident = await GetResidentFromToken();
        if (resident == null)
            return this.BadRequestApiError("BAD_REQUEST", "Usuario no está registrado como residente.");
        try
        {
            var item = await _service.CreateAsync(resident.Id, dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return this.BadRequestApiError("INVALID_OPERATION", ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ComentarioDto>> Update(int id, [FromBody] UpdateComentarioDto dto)
    {
        var item = await _service.UpdateAsync(id, dto);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }

    private async Task<ResidentDto?> GetResidentFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return null;
        return await _residentService.GetByUserIdAsync(userId);
    }
}
