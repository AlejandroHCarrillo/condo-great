using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IBannerService
{
    Task<IEnumerable<BannerDto>> GetAllBannersAsync();
    Task<IEnumerable<BannerDto>> GetActiveBannersAsync();
    Task<IEnumerable<BannerDto>> GetActiveBannersByDateAsync(DateTime? date = null);
    Task<IEnumerable<BannerDto>> GetBannersByCommunityIdAsync(Guid? communityId);
    Task<BannerDto?> GetBannerByIdAsync(Guid id);
    Task<BannerDto> CreateBannerAsync(CreateBannerDto createBannerDto);
    Task<BannerDto?> UpdateBannerAsync(Guid id, UpdateBannerDto updateBannerDto);
    Task<bool> DeleteBannerAsync(Guid id);
}

