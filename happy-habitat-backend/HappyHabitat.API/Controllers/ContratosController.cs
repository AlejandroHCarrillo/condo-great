using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
public class ContratosController : ControllerBase
{
    private readonly IContratoService _contratoService;

    public ContratosController(IContratoService contratoService)
    {
        _contratoService = contratoService;
    }

    /// <summary>
    /// Get all contratos
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContratoDto>>> GetAllContratos([FromQuery] bool includeInactive = false)
    {
        var contratos = await _contratoService.GetAllContratosAsync(includeInactive);
        return Ok(contratos);
    }

    /// <summary>
    /// Get contratos by community ID
    /// </summary>
    [HttpGet("community/{communityId}")]
    public async Task<ActionResult<IEnumerable<ContratoDto>>> GetContratosByCommunityId(Guid communityId, [FromQuery] bool includeInactive = false)
    {
        var contratos = await _contratoService.GetContratosByCommunityIdAsync(communityId, includeInactive);
        return Ok(contratos);
    }

    /// <summary>
    /// Get contrato by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ContratoDto>> GetContratoById(Guid id, [FromQuery] bool includeInactive = false)
    {
        var contrato = await _contratoService.GetContratoByIdAsync(id, includeInactive);
        if (contrato == null)
            return NotFound();

        return Ok(contrato);
    }

    /// <summary>
    /// Create a new contrato
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ContratoDto>> CreateContrato(CreateContratoDto createContratoDto)
    {
        try
        {
            // Obtener el ID del usuario actual desde los claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? updatedByUserId = null;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                updatedByUserId = userId;
            }

            var contrato = await _contratoService.CreateContratoAsync(createContratoDto, updatedByUserId);
            return CreatedAtAction(nameof(GetContratoById), new { id = contrato.Id }, contrato);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing contrato
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ContratoDto>> UpdateContrato(Guid id, UpdateContratoDto updateContratoDto)
    {
        try
        {
            // Obtener el ID del usuario actual desde los claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? updatedByUserId = null;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                updatedByUserId = userId;
            }

            var contrato = await _contratoService.UpdateContratoAsync(id, updateContratoDto, updatedByUserId);
            if (contrato == null)
                return NotFound();

            return Ok(contrato);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete a contrato
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteContrato(Guid id)
    {
        var result = await _contratoService.DeleteContratoAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}


