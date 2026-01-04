using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IPetService
{
    Task<IEnumerable<PetDto>> GetAllPetsAsync();
    Task<PetDto?> GetPetByIdAsync(Guid id);
    Task<IEnumerable<PetDto>> GetPetsByResidentIdAsync(Guid residentId);
    Task<PetDto> CreatePetAsync(CreatePetDto createPetDto);
    Task<PetDto?> UpdatePetAsync(Guid id, UpdatePetDto updatePetDto);
    Task<bool> DeletePetAsync(Guid id);
}

