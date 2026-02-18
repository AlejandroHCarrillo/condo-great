using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _service;
    private readonly IResidentService _residentService;

    public TicketsController(ITicketService service, IResidentService residentService)
    {
        _service = service;
        _residentService = residentService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("community/{communityId:guid}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetByCommunityId(Guid communityId)
    {
        var list = await _service.GetByCommunityIdAsync(communityId);
        return Ok(list);
    }

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetMy()
    {
        var resident = await GetResidentFromToken();
        if (resident == null)
            return BadRequest("Usuario no está registrado como residente.");
        var list = await _service.GetByResidentIdAsync(resident.Id);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TicketDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<TicketDto>> Create([FromBody] CreateTicketDto dto)
    {
        Guid residentId;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var isAdmin = role == "ADMIN_COMPANY" || role == "SYSTEM_ADMIN";
        if (isAdmin && dto.ResidentId.HasValue)
        {
            var resident = await _residentService.GetByIdAsync(dto.ResidentId.Value);
            if (resident == null)
                return BadRequest("Residente no encontrado.");
            residentId = resident.Id;
        }
        else
        {
            var resident = await GetResidentFromToken();
            if (resident == null)
                return BadRequest("Usuario no está registrado como residente.");
            residentId = resident.Id;
        }
        try
        {
            var item = await _service.CreateAsync(residentId, dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TicketDto>> Update(int id, [FromBody] UpdateTicketDto dto)
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
