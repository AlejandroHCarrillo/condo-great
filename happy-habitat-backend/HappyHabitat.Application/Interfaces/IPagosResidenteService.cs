using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IPagosResidenteService
{
    Task<IEnumerable<PagosResidenteDto>> GetAllAsync();
    Task<IEnumerable<PagosResidenteDto>> GetByResidentIdAsync(Guid residentId);
    Task<IEnumerable<PagosResidenteDto>> GetByCommunityIdAsync(Guid communityId);
    Task<PagosResidenteDto?> GetByIdAsync(Guid id);
    Task<PagosResidenteDto> CreateAsync(CreatePagosResidenteDto dto);
    Task<PagosResidenteDto?> UpdateAsync(Guid id, UpdatePagosResidenteDto dto);
    Task<bool> DeleteAsync(Guid id);
}
