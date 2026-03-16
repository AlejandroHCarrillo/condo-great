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
public class AmenityReservationsController : ControllerBase
{
    private readonly IAmenityReservationService _service;
    private readonly IResidentService _residentService;

    public AmenityReservationsController(IAmenityReservationService service, IResidentService residentService)
    {
        _service = service;
        _residentService = residentService;
    }

    private async Task<ResidentDto?> GetResidentFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return null;
        return await _residentService.GetByUserIdAsync(userId);
    }

    /// <summary>
    /// Get current user's reservations (resident).
    /// </summary>
    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<AmenityReservationDto>>> GetMy()
    {
        var resident = await GetResidentFromToken();
        if (resident == null)
            return this.BadRequestApiError("BAD_REQUEST", "Usuario no está registrado como residente.");
        var list = await _service.GetByResidentIdAsync(resident.Id);
        return Ok(list);
    }

    /// <summary>
    /// Create a reservation (resident). ResidentId is set from token.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AmenityReservationDto>> Create([FromBody] CreateAmenityReservationDto dto)
    {
        var resident = await GetResidentFromToken();
        if (resident == null)
            return this.BadRequestApiError("BAD_REQUEST", "Usuario no está registrado como residente.");
        var created = await _service.CreateAsync(resident.Id, dto);
        if (created == null)
            return this.BadRequestApiError("BAD_REQUEST", "Amenidad no encontrada o datos inválidos.");
        return CreatedAtAction(nameof(GetMy), created);
    }

    /// <summary>
    /// Cancel own reservation (resident).
    /// </summary>
    [HttpPatch("{id:guid}/cancel")]
    public async Task<ActionResult<AmenityReservationDto>> Cancel(Guid id)
    {
        var resident = await GetResidentFromToken();
        if (resident == null)
            return this.BadRequestApiError("BAD_REQUEST", "Usuario no está registrado como residente.");
        var dto = await _service.CancelByResidentAsync(id, resident.Id);
        if (dto == null)
            return NotFound();
        return Ok(dto);
    }

    /// <summary>
    /// Get amenity reservations by community ID (admin).
    /// </summary>
    [HttpGet("community/{communityId:guid}")]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<ActionResult<IEnumerable<AmenityReservationDto>>> GetByCommunityId(Guid communityId)
    {
        var list = await _service.GetByCommunityIdAsync(communityId);
        return Ok(list);
    }

    /// <summary>
    /// Approve a reservation (sets status to "Reservada") (admin).
    /// </summary>
    [HttpPatch("{id:guid}/approve")]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<ActionResult<AmenityReservationDto>> Approve(Guid id)
    {
        var dto = await _service.ApproveAsync(id);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    /// <summary>
    /// Update reservation status (Reservada, Rechazada, Cancelada) (admin).
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
    public async Task<ActionResult<AmenityReservationDto>> UpdateStatus(Guid id, [FromBody] UpdateAmenityReservationStatusDto body)
    {
        if (string.IsNullOrWhiteSpace(body?.Status)) return BadRequest("Status is required.");
        var dto = await _service.UpdateStatusAsync(id, body.Status);
        if (dto == null) return NotFound();
        return Ok(dto);
    }
}
