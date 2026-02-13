using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface ICommunityProviderService
{
    Task<IEnumerable<CommunityProviderDto>> GetAllAsync(bool includeInactive = false);
    Task<IEnumerable<CommunityProviderDto>> GetByCommunityIdAsync(Guid? communityId, bool includeInactive = false);
    Task<CommunityProviderDto?> GetByIdAsync(Guid id, bool includeInactive = false);
    Task<CommunityProviderDto> CreateAsync(CreateCommunityProviderDto dto);
    Task<CommunityProviderDto?> UpdateAsync(Guid id, UpdateCommunityProviderDto dto);
    Task<bool> DeleteAsync(Guid id);
}
