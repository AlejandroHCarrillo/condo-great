using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IResidentVisitService
{
    Task<IEnumerable<ResidentVisitDto>> GetAllVisitsAsync();
    Task<ResidentVisitDto?> GetVisitByIdAsync(Guid id);
    Task<IEnumerable<ResidentVisitDto>> GetVisitsByResidentIdAsync(Guid residentId);
    Task<ResidentVisitDto> CreateVisitAsync(CreateResidentVisitDto createVisitDto);
    Task<ResidentVisitDto?> UpdateVisitAsync(Guid id, UpdateResidentVisitDto updateVisitDto);
    Task<bool> DeleteVisitAsync(Guid id);
}

