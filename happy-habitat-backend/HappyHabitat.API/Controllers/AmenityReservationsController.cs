using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
public class AmenityReservationsController : ControllerBase
{
    private readonly IAmenityReservationService _service;

    public AmenityReservationsController(IAmenityReservationService service)
    {
        _service = service;
    }

    /// <summary>
    /// Get amenity reservations by community ID.
    /// </summary>
    [HttpGet("community/{communityId}")]
    public async Task<ActionResult<IEnumerable<AmenityReservationDto>>> GetByCommunityId(Guid communityId)
    {
        var list = await _service.GetByCommunityIdAsync(communityId);
        return Ok(list);
    }

    /// <summary>
    /// Approve a reservation (sets status to "Reservada").
    /// </summary>
    [HttpPatch("{id}/approve")]
    public async Task<ActionResult<AmenityReservationDto>> Approve(Guid id)
    {
        var dto = await _service.ApproveAsync(id);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    /// <summary>
    /// Update reservation status (Reservada, Rechazada, Cancelada).
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<AmenityReservationDto>> UpdateStatus(Guid id, [FromBody] UpdateAmenityReservationStatusDto body)
    {
        if (string.IsNullOrWhiteSpace(body?.Status)) return BadRequest("Status is required.");
        var dto = await _service.UpdateStatusAsync(id, body.Status);
        if (dto == null) return NotFound();
        return Ok(dto);
    }
}
