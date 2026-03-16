using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IAmenityScheduleService
{
    Task<IEnumerable<AmenityScheduleDto>> GetByAmenityIdAsync(Guid amenityId);
    Task<AmenityScheduleDto?> GetByIdAsync(Guid id);
    Task<AmenityScheduleDto> CreateAsync(CreateAmenityScheduleDto dto, Guid? createdByUserId = null);
    Task<AmenityScheduleDto?> UpdateAsync(Guid id, UpdateAmenityScheduleDto dto, Guid? updatedByUserId = null);
    Task<bool> DeleteAsync(Guid id);
}
