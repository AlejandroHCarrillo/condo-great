using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IResidentVisitService
{
    Task<IEnumerable<ResidentVisitDto>> GetAllVisitsAsync(bool includeInactive = false);
    Task<ResidentVisitDto?> GetVisitByIdAsync(Guid id, bool includeInactive = false);
    Task<IEnumerable<ResidentVisitDto>> GetVisitsByResidentIdAsync(Guid residentId, bool includeInactive = false);
    Task<ResidentVisitDto> CreateVisitAsync(CreateResidentVisitDto createVisitDto);
    Task<ResidentVisitDto?> UpdateVisitAsync(Guid id, UpdateResidentVisitDto updateVisitDto);
    Task<bool> DeleteVisitAsync(Guid id);
}

