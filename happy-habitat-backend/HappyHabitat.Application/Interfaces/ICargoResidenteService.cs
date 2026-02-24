using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface ICargoResidenteService
{
    Task<IEnumerable<CargoResidenteDto>> GetAllAsync();
    Task<IEnumerable<CargoResidenteDto>> GetByResidentIdAsync(Guid residentId);
    Task<IEnumerable<CargoResidenteDto>> GetByCommunityIdAsync(Guid communityId);
    Task<CargoResidenteDto?> GetByIdAsync(Guid id);
    Task<CargoResidenteDto> CreateAsync(CreateCargoResidenteDto dto);
    Task<CargoResidenteDto?> UpdateAsync(Guid id, UpdateCargoResidenteDto dto);
    Task<bool> DeleteAsync(Guid id);
}
