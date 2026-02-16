using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IResidentService
{
    Task<IEnumerable<ResidentDto>> GetAllAsync();
    Task<PagedResultDto<ResidentDto>> GetAllPagedAsync(int page, int pageSize);
    Task<ResidentDto?> GetByIdAsync(Guid id);
    Task<ResidentDto?> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<ResidentDto>> GetByCommunityIdAsync(Guid communityId);
    Task<PagedResultDto<ResidentDto>> GetByCommunityIdPagedAsync(Guid communityId, int page, int pageSize);
    Task<IEnumerable<ResidentDto>> GetByCommunityIdsAsync(IEnumerable<Guid> communityIds);
    Task<PagedResultDto<ResidentDto>> GetByCommunityIdsPagedAsync(IEnumerable<Guid> communityIds, int page, int pageSize);
    Task<ResidentDto?> CreateAsync(CreateResidentDto dto);
    Task<ResidentDto?> UpdateAsync(Guid id, UpdateResidentDto dto);
    Task<bool> DeleteAsync(Guid id);
}
