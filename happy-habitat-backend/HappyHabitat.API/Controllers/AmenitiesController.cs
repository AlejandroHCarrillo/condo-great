using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
public class AmenitiesController : ControllerBase
{
    private readonly IAmenityService _amenityService;

    public AmenitiesController(IAmenityService amenityService)
    {
        _amenityService = amenityService;
    }

    /// <summary>
    /// Get all amenities
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AmenityDto>>> GetAllAmenities()
    {
        var amenities = await _amenityService.GetAllAmenitiesAsync();
        return Ok(amenities);
    }

    /// <summary>
    /// Get amenities by community ID
    /// </summary>
    [HttpGet("community/{communityId?}")]
    public async Task<ActionResult<IEnumerable<AmenityDto>>> GetAmenitiesByCommunityId(Guid? communityId)
    {
        var amenities = await _amenityService.GetAmenitiesByCommunityIdAsync(communityId);
        return Ok(amenities);
    }

    /// <summary>
    /// Get amenity by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<AmenityDto>> GetAmenityById(Guid id)
    {
        var amenity = await _amenityService.GetAmenityByIdAsync(id);
        if (amenity == null)
            return NotFound();
        return Ok(amenity);
    }

    /// <summary>
    /// Create a new amenity
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AmenityDto>> CreateAmenity(CreateAmenityDto createAmenityDto)
    {
        try
        {
            var amenity = await _amenityService.CreateAmenityAsync(createAmenityDto);
            return CreatedAtAction(nameof(GetAmenityById), new { id = amenity.Id }, amenity);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing amenity
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<AmenityDto>> UpdateAmenity(Guid id, UpdateAmenityDto updateAmenityDto)
    {
        try
        {
            var amenity = await _amenityService.UpdateAmenityAsync(id, updateAmenityDto);
            if (amenity == null)
                return NotFound();
            return Ok(amenity);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete an amenity (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAmenity(Guid id)
    {
        var result = await _amenityService.DeleteAmenityAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
