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
public class PagosResidenteController : ControllerBase
{
    private readonly IPagosResidenteService _service;
    private readonly IResidentService _residentService;

    public PagosResidenteController(IPagosResidenteService service, IResidentService residentService)
    {
        _service = service;
        _residentService = residentService;
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<ActionResult<IEnumerable<PagosResidenteDto>>> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("resident/{residentId:guid}")]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<ActionResult<IEnumerable<PagosResidenteDto>>> GetByResidentId(Guid residentId)
    {
        var list = await _service.GetByResidentIdAsync(residentId);
        return Ok(list);
    }

    [HttpGet("community/{communityId:guid}")]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<ActionResult<IEnumerable<PagosResidenteDto>>> GetByCommunityId(Guid communityId)
    {
        var list = await _service.GetByCommunityIdAsync(communityId);
        return Ok(list);
    }

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<PagosResidenteDto>>> GetMy()
    {
        var resident = await GetResidentFromToken();
        if (resident == null)
            return this.BadRequestApiError("BAD_REQUEST", "Usuario no está registrado como residente.");
        var list = await _service.GetByResidentIdAsync(resident.Id);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PagosResidenteDto>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound();

        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var isAdmin = role == "ADMIN_COMPANY" || role == "SYSTEM_ADMIN";
        if (!isAdmin)
        {
            var resident = await GetResidentFromToken();
            if (resident == null || item.ResidenteId != resident.Id)
                return Forbid();
        }

        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<ActionResult<PagosResidenteDto>> Create(CreatePagosResidenteDto dto)
    {
        try
        {
            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return this.BadRequestApiError("INVALID_OPERATION", ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<ActionResult<PagosResidenteDto>> Update(Guid id, UpdatePagosResidenteDto dto)
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
            return this.BadRequestApiError("INVALID_OPERATION", ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<IActionResult> Delete(Guid id)
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
