using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IAmenityReservationService
{
    Task<IEnumerable<AmenityReservationDto>> GetByCommunityIdAsync(Guid communityId);
    Task<IEnumerable<AmenityReservationDto>> GetByResidentIdAsync(Guid residentId);
    Task<AmenityReservationDto?> CreateAsync(Guid residentId, CreateAmenityReservationDto dto);
    Task<AmenityReservationDto?> ApproveAsync(Guid id);
    Task<AmenityReservationDto?> UpdateStatusAsync(Guid id, string status);
    /// <summary>Cancelar una reservación. Solo tiene efecto si el residentId es el dueño.</summary>
    Task<AmenityReservationDto?> CancelByResidentAsync(Guid id, Guid residentId);
}
