using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface ICommunityConfigurationService
{
    Task<IEnumerable<CommunityConfigurationDto>> GetAllAsync();
    Task<IEnumerable<CommunityConfigurationDto>> GetByCommunityIdAsync(Guid communityId);
    Task<CommunityConfigurationDto?> GetByIdAsync(Guid id);
    Task<CommunityConfigurationDto> CreateAsync(CreateCommunityConfigurationDto dto);
    Task<CommunityConfigurationDto?> UpdateAsync(Guid id, UpdateCommunityConfigurationDto dto);
    Task<bool> DeleteAsync(Guid id);
    /// <summary>
    /// Crea las configuraciones base para una comunidad a partir de CommunityConfigurationBase.json (recurso incrustado).
    /// </summary>
    Task SeedDefaultConfigurationsForCommunityAsync(Guid communityId);
}
