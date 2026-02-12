using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IResidentService
{
    Task<IEnumerable<ResidentDto>> GetAllAsync();
    Task<ResidentDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<ResidentDto>> GetByCommunityIdAsync(Guid communityId);
    Task<IEnumerable<ResidentDto>> GetByCommunityIdsAsync(IEnumerable<Guid> communityIds);
}
