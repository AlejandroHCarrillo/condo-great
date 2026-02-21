using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
public class CommunityPricesController : ControllerBase
{
    private readonly ICommunityPriceService _service;

    public CommunityPricesController(ICommunityPriceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommunityPriceDto>>> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("community/{communityId:guid}")]
    public async Task<ActionResult<IEnumerable<CommunityPriceDto>>> GetByCommunityId(Guid communityId)
    {
        var list = await _service.GetByCommunityIdAsync(communityId);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CommunityPriceDto>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<CommunityPriceDto>> Create(CreateCommunityPriceDto dto)
    {
        try
        {
            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CommunityPriceDto>> Update(Guid id, UpdateCommunityPriceDto dto)
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
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
