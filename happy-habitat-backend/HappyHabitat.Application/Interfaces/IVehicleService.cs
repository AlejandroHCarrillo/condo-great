using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IVehicleService
{
    Task<IEnumerable<VehicleDto>> GetAllVehiclesAsync();
    Task<VehicleDto?> GetVehicleByIdAsync(Guid id);
    Task<IEnumerable<VehicleDto>> GetVehiclesByResidentIdAsync(Guid residentId);
    Task<VehicleDto> CreateVehicleAsync(CreateVehicleDto createVehicleDto);
    Task<VehicleDto?> UpdateVehicleAsync(Guid id, UpdateVehicleDto updateVehicleDto);
    Task<bool> DeleteVehicleAsync(Guid id);
}

