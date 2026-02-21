using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
public class BannersController : ControllerBase
{
    private readonly IBannerService _bannerService;

    public BannersController(IBannerService bannerService)
    {
        _bannerService = bannerService;
    }

    /// <summary>
    /// Get all banners
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BannerDto>>> GetAllBanners()
    {
        var banners = await _bannerService.GetAllBannersAsync();
        return Ok(banners);
    }

    /// <summary>
    /// Get active banners only
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<BannerDto>>> GetActiveBanners([FromQuery] DateTime? date = null)
    {
        var banners = date.HasValue 
            ? await _bannerService.GetActiveBannersByDateAsync(date.Value)
            : await _bannerService.GetActiveBannersAsync();
        return Ok(banners);
    }

    /// <summary>
    /// Get banners by community ID
    /// </summary>
    [HttpGet("community/{communityId?}")]
    public async Task<ActionResult<IEnumerable<BannerDto>>> GetBannersByCommunityId(Guid? communityId)
    {
        var banners = await _bannerService.GetBannersByCommunityIdAsync(communityId);
        return Ok(banners);
    }

    /// <summary>
    /// Get banner by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BannerDto>> GetBannerById(Guid id)
    {
        var banner = await _bannerService.GetBannerByIdAsync(id);
        if (banner == null)
            return NotFound();

        return Ok(banner);
    }

    /// <summary>
    /// Create a new banner
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BannerDto>> CreateBanner(CreateBannerDto createBannerDto)
    {
        try
        {
            var banner = await _bannerService.CreateBannerAsync(createBannerDto);
            return CreatedAtAction(nameof(GetBannerById), new { id = banner.Id }, banner);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing banner
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<BannerDto>> UpdateBanner(Guid id, UpdateBannerDto updateBannerDto)
    {
        try
        {
            var banner = await _bannerService.UpdateBannerAsync(id, updateBannerDto);
            if (banner == null)
                return NotFound();

            return Ok(banner);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete a banner
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBanner(Guid id)
    {
        var result = await _bannerService.DeleteBannerAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}

