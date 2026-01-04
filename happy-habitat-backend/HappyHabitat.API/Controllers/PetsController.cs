using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PetsController : ControllerBase
{
    private readonly IPetService _petService;

    public PetsController(IPetService petService)
    {
        _petService = petService;
    }

    /// <summary>
    /// Get all pets
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PetDto>>> GetAllPets()
    {
        var pets = await _petService.GetAllPetsAsync();
        return Ok(pets);
    }

    /// <summary>
    /// Get pet by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PetDto>> GetPetById(Guid id)
    {
        var pet = await _petService.GetPetByIdAsync(id);
        if (pet == null)
            return NotFound();

        return Ok(pet);
    }

    /// <summary>
    /// Get pets by resident ID
    /// </summary>
    [HttpGet("resident/{residentId}")]
    public async Task<ActionResult<IEnumerable<PetDto>>> GetPetsByResidentId(Guid residentId)
    {
        var pets = await _petService.GetPetsByResidentIdAsync(residentId);
        return Ok(pets);
    }

    /// <summary>
    /// Create a new pet
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PetDto>> CreatePet(CreatePetDto createPetDto)
    {
        try
        {
            var pet = await _petService.CreatePetAsync(createPetDto);
            return CreatedAtAction(nameof(GetPetById), new { id = pet.Id }, pet);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing pet
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<PetDto>> UpdatePet(Guid id, UpdatePetDto updatePetDto)
    {
        try
        {
            var pet = await _petService.UpdatePetAsync(id, updatePetDto);
            if (pet == null)
                return NotFound();

            return Ok(pet);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete a pet
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePet(Guid id)
    {
        var result = await _petService.DeletePetAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}

