using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ComunicadosController : ControllerBase
{
    private readonly IComunicadoService _comunicadoService;

    public ComunicadosController(IComunicadoService comunicadoService)
    {
        _comunicadoService = comunicadoService;
    }

    /// <summary>
    /// Get all comunicados
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ComunicadoDto>>> GetAllComunicados()
    {
        var comunicados = await _comunicadoService.GetAllComunicadosAsync();
        return Ok(comunicados);
    }

    /// <summary>
    /// Get paginated comunicados (default: first 20, most recent first)
    /// </summary>
    [HttpGet("paginated")]
    public async Task<ActionResult<IEnumerable<ComunicadoDto>>> GetComunicadosPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var comunicados = await _comunicadoService.GetComunicadosPaginatedAsync(page, pageSize);
        return Ok(comunicados);
    }

    /// <summary>
    /// Get comunicados by community ID
    /// </summary>
    [HttpGet("community/{communityId?}")]
    public async Task<ActionResult<IEnumerable<ComunicadoDto>>> GetComunicadosByCommunityId(Guid? communityId)
    {
        var comunicados = await _comunicadoService.GetComunicadosByCommunityIdAsync(communityId);
        return Ok(comunicados);
    }

    /// <summary>
    /// Get comunicado by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ComunicadoDto>> GetComunicadoById(Guid id)
    {
        var comunicado = await _comunicadoService.GetComunicadoByIdAsync(id);
        if (comunicado == null)
            return NotFound();

        return Ok(comunicado);
    }

    /// <summary>
    /// Create a new comunicado
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ComunicadoDto>> CreateComunicado(CreateComunicadoDto createComunicadoDto)
    {
        try
        {
            var comunicado = await _comunicadoService.CreateComunicadoAsync(createComunicadoDto);
            return CreatedAtAction(nameof(GetComunicadoById), new { id = comunicado.Id }, comunicado);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing comunicado
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ComunicadoDto>> UpdateComunicado(Guid id, UpdateComunicadoDto updateComunicadoDto)
    {
        try
        {
            var comunicado = await _comunicadoService.UpdateComunicadoAsync(id, updateComunicadoDto);
            if (comunicado == null)
                return NotFound();

            return Ok(comunicado);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete a comunicado
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComunicado(Guid id)
    {
        var result = await _comunicadoService.DeleteComunicadoAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}

