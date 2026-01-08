using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface ICommunityService
{
    Task<IEnumerable<CommunityDto>> GetAllCommunitiesAsync();
    Task<CommunityDto?> GetCommunityByIdAsync(Guid id);
    Task<CommunityDto> CreateCommunityAsync(CreateCommunityDto createCommunityDto);
    Task<CommunityDto?> UpdateCommunityAsync(Guid id, UpdateCommunityDto updateCommunityDto);
    Task<bool> DeleteCommunityAsync(Guid id);
}


