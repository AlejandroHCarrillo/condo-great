using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IAmenityService
{
    Task<IEnumerable<AmenityDto>> GetAllAmenitiesAsync(bool includeInactive = false);
    Task<IEnumerable<AmenityDto>> GetAmenitiesByCommunityIdAsync(Guid? communityId, bool includeInactive = false);
    Task<AmenityDto?> GetAmenityByIdAsync(Guid id, bool includeInactive = false);
    Task<AmenityDto> CreateAmenityAsync(CreateAmenityDto createAmenityDto);
    Task<AmenityDto?> UpdateAmenityAsync(Guid id, UpdateAmenityDto updateAmenityDto);
    Task<bool> DeleteAmenityAsync(Guid id);
}
