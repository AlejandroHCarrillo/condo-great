using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN_COMPANY,SYSTEM_ADMIN")]
public class SaldoCuentaBancariaController : ControllerBase
{
    private readonly ISaldoCuentaBancariaService _service;

    public SaldoCuentaBancariaController(ISaldoCuentaBancariaService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SaldoCuentaBancariaDto>>> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("community/{communityId:guid}")]
    public async Task<ActionResult<IEnumerable<SaldoCuentaBancariaDto>>> GetByCommunityId(Guid communityId)
    {
        var list = await _service.GetByCommunityIdAsync(communityId);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SaldoCuentaBancariaDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<SaldoCuentaBancariaDto>> Create(CreateSaldoCuentaBancariaDto dto)
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

    [HttpPut("{id:int}")]
    public async Task<ActionResult<SaldoCuentaBancariaDto>> Update(int id, UpdateSaldoCuentaBancariaDto dto)
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

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
