using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IVehicleService
{
    Task<IEnumerable<VehicleDto>> GetAllVehiclesAsync(bool includeInactive = false);
    Task<VehicleDto?> GetVehicleByIdAsync(Guid id, bool includeInactive = false);
    Task<IEnumerable<VehicleDto>> GetVehiclesByResidentIdAsync(Guid residentId, bool includeInactive = false);
    Task<VehicleDto> CreateVehicleAsync(CreateVehicleDto createVehicleDto);
    Task<VehicleDto?> UpdateVehicleAsync(Guid id, UpdateVehicleDto updateVehicleDto);
    Task<bool> DeleteVehicleAsync(Guid id);
}

