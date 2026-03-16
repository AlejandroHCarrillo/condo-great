using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IAmenityReservationService
{
    Task<IEnumerable<AmenityReservationDto>> GetByCommunityIdAsync(Guid communityId);
    Task<AmenityReservationDto?> ApproveAsync(Guid id);
    Task<AmenityReservationDto?> UpdateStatusAsync(Guid id, string status);
}
