using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResidentVisitsController : ControllerBase
{
    private readonly IResidentVisitService _visitService;

    public ResidentVisitsController(IResidentVisitService visitService)
    {
        _visitService = visitService;
    }

    /// <summary>
    /// Get all visits
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResidentVisitDto>>> GetAllVisits()
    {
        var visits = await _visitService.GetAllVisitsAsync();
        return Ok(visits);
    }

    /// <summary>
    /// Get visit by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ResidentVisitDto>> GetVisitById(Guid id)
    {
        var visit = await _visitService.GetVisitByIdAsync(id);
        if (visit == null)
            return NotFound();

        return Ok(visit);
    }

    /// <summary>
    /// Get visits by resident ID
    /// </summary>
    [HttpGet("resident/{residentId}")]
    public async Task<ActionResult<IEnumerable<ResidentVisitDto>>> GetVisitsByResidentId(Guid residentId)
    {
        var visits = await _visitService.GetVisitsByResidentIdAsync(residentId);
        return Ok(visits);
    }

    /// <summary>
    /// Create a new visit
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ResidentVisitDto>> CreateVisit(CreateResidentVisitDto createVisitDto)
    {
        try
        {
            var visit = await _visitService.CreateVisitAsync(createVisitDto);
            return CreatedAtAction(nameof(GetVisitById), new { id = visit.Id }, visit);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing visit
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ResidentVisitDto>> UpdateVisit(Guid id, UpdateResidentVisitDto updateVisitDto)
    {
        try
        {
            var visit = await _visitService.UpdateVisitAsync(id, updateVisitDto);
            if (visit == null)
                return NotFound();

            return Ok(visit);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete a visit
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVisit(Guid id)
    {
        var result = await _visitService.DeleteVisitAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}

