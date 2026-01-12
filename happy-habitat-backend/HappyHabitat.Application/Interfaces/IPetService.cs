using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IPetService
{
    Task<IEnumerable<PetDto>> GetAllPetsAsync(bool includeInactive = false);
    Task<PetDto?> GetPetByIdAsync(Guid id, bool includeInactive = false);
    Task<IEnumerable<PetDto>> GetPetsByResidentIdAsync(Guid residentId, bool includeInactive = false);
    Task<PetDto> CreatePetAsync(CreatePetDto createPetDto);
    Task<PetDto?> UpdatePetAsync(Guid id, UpdatePetDto updatePetDto);
    Task<bool> DeletePetAsync(Guid id);
}

