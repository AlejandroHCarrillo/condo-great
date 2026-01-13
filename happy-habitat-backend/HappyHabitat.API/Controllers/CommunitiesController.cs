using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommunitiesController : ControllerBase
{
    private readonly ICommunityService _communityService;

    public CommunitiesController(ICommunityService communityService)
    {
        _communityService = communityService;
    }

    /// <summary>
    /// Get all communities
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommunityDto>>> GetAllCommunities()
    {
        var communities = await _communityService.GetAllCommunitiesAsync();
        return Ok(communities);
    }

    /// <summary>
    /// Get community by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<CommunityDto>> GetCommunityById(Guid id)
    {
        var community = await _communityService.GetCommunityByIdAsync(id);
        if (community == null)
            return NotFound();

        return Ok(community);
    }

    /// <summary>
    /// Create a new community
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CommunityDto>> CreateCommunity(CreateCommunityDto createCommunityDto)
    {
        try
        {
            var community = await _communityService.CreateCommunityAsync(createCommunityDto);
            return CreatedAtAction(nameof(GetCommunityById), new { id = community.Id }, community);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing community
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<CommunityDto>> UpdateCommunity(Guid id, UpdateCommunityDto updateCommunityDto)
    {
        try
        {
            var community = await _communityService.UpdateCommunityAsync(id, updateCommunityDto);
            if (community == null)
                return NotFound();

            return Ok(community);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete a community
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCommunity(Guid id)
    {
        var result = await _communityService.DeleteCommunityAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}


