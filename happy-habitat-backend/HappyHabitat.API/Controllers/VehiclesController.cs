using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    /// <summary>
    /// Get all vehicles
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VehicleDto>>> GetAllVehicles()
    {
        var vehicles = await _vehicleService.GetAllVehiclesAsync();
        return Ok(vehicles);
    }

    /// <summary>
    /// Get vehicle by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<VehicleDto>> GetVehicleById(Guid id)
    {
        var vehicle = await _vehicleService.GetVehicleByIdAsync(id);
        if (vehicle == null)
            return NotFound();

        return Ok(vehicle);
    }

    /// <summary>
    /// Get vehicles by resident ID
    /// </summary>
    [HttpGet("resident/{residentId}")]
    public async Task<ActionResult<IEnumerable<VehicleDto>>> GetVehiclesByResidentId(Guid residentId)
    {
        var vehicles = await _vehicleService.GetVehiclesByResidentIdAsync(residentId);
        return Ok(vehicles);
    }

    /// <summary>
    /// Create a new vehicle
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<VehicleDto>> CreateVehicle(CreateVehicleDto createVehicleDto)
    {
        try
        {
            var vehicle = await _vehicleService.CreateVehicleAsync(createVehicleDto);
            return CreatedAtAction(nameof(GetVehicleById), new { id = vehicle.Id }, vehicle);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing vehicle
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<VehicleDto>> UpdateVehicle(Guid id, UpdateVehicleDto updateVehicleDto)
    {
        try
        {
            var vehicle = await _vehicleService.UpdateVehicleAsync(id, updateVehicleDto);
            if (vehicle == null)
                return NotFound();

            return Ok(vehicle);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete a vehicle
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVehicle(Guid id)
    {
        var result = await _vehicleService.DeleteVehicleAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}

