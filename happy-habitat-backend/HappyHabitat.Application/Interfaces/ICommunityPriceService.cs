using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface ICommunityPriceService
{
    Task<IEnumerable<CommunityPriceDto>> GetAllAsync();
    Task<IEnumerable<CommunityPriceDto>> GetByCommunityIdAsync(Guid communityId);
    Task<CommunityPriceDto?> GetByIdAsync(Guid id);
    Task<CommunityPriceDto> CreateAsync(CreateCommunityPriceDto dto);
    Task<CommunityPriceDto?> UpdateAsync(Guid id, UpdateCommunityPriceDto dto);
    Task<bool> DeleteAsync(Guid id);
    /// <summary>
    /// Crea los precios base para una comunidad a partir de CommunityPrices.json (recurso incrustado).
    /// </summary>
    Task SeedDefaultPricesForCommunityAsync(Guid communityId);
}
