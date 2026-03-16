using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using System.Security.Claims;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
public class AmenitySchedulesController : ControllerBase
{
    private readonly IAmenityScheduleService _scheduleService;

    public AmenitySchedulesController(IAmenityScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    /// <summary>
    /// Get all schedules for an amenity
    /// </summary>
    [HttpGet("amenity/{amenityId}")]
    public async Task<ActionResult<IEnumerable<AmenityScheduleDto>>> GetByAmenityId(Guid amenityId)
    {
        var list = await _scheduleService.GetByAmenityIdAsync(amenityId);
        return Ok(list);
    }

    /// <summary>
    /// Get schedule by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<AmenityScheduleDto>> GetById(Guid id)
    {
        var item = await _scheduleService.GetByIdAsync(id);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    /// <summary>
    /// Create a schedule slot
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AmenityScheduleDto>> Create(CreateAmenityScheduleDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var guidUserId = Guid.TryParse(userId, out var g) ? g : (Guid?)null;
            var item = await _scheduleService.CreateAsync(dto, guidUserId);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update a schedule slot
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<AmenityScheduleDto>> Update(Guid id, UpdateAmenityScheduleDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var guidUserId = Guid.TryParse(userId, out var g) ? g : (Guid?)null;
            var item = await _scheduleService.UpdateAsync(id, dto, guidUserId);
            if (item == null)
                return NotFound();
            return Ok(item);
        }
        catch (InvalidOperationException)
        {
            return BadRequest();
        }
    }

    /// <summary>
    /// Delete a schedule slot
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _scheduleService.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
