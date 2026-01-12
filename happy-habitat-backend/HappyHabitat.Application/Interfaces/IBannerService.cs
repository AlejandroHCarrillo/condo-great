using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IBannerService
{
    Task<IEnumerable<BannerDto>> GetAllBannersAsync(bool includeInactive = false);
    Task<IEnumerable<BannerDto>> GetActiveBannersAsync();
    Task<IEnumerable<BannerDto>> GetActiveBannersByDateAsync(DateTime? date = null);
    Task<IEnumerable<BannerDto>> GetBannersByCommunityIdAsync(Guid? communityId, bool includeInactive = false);
    Task<BannerDto?> GetBannerByIdAsync(Guid id, bool includeInactive = false);
    Task<BannerDto> CreateBannerAsync(CreateBannerDto createBannerDto);
    Task<BannerDto?> UpdateBannerAsync(Guid id, UpdateBannerDto updateBannerDto);
    Task<bool> DeleteBannerAsync(Guid id);
}

