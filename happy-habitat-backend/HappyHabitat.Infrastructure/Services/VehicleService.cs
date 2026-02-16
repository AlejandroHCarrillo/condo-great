using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class VehicleService : IVehicleService
{
    private readonly ApplicationDbContext _context;

    public VehicleService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<VehicleDto>> GetAllVehiclesAsync(bool includeInactive = false)
    {
        var query = _context.Vehicles.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(v => v.IsActive);
        }
        
        var vehicles = await query
            .Include(v => v.Resident)
            .Include(v => v.VehicleType)
            .ToListAsync();

        return vehicles.Select(v => new VehicleDto
        {
            Id = v.Id,
            ResidentId = v.ResidentId,
            ResidentName = v.Resident.FullName,
            Brand = v.Brand,
            VehicleTypeId = v.VehicleTypeId,
            VehicleTypeName = v.VehicleType.Name,
            Model = v.Model,
            Year = v.Year,
            Color = v.Color,
            LicensePlate = v.LicensePlate,
            CreatedAt = v.CreatedAt.ToString("O")
        });
    }

    public async Task<VehicleDto?> GetVehicleByIdAsync(Guid id, bool includeInactive = false)
    {
        var query = _context.Vehicles.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(v => v.IsActive);
        }
        
        var vehicle = await query
            .Include(v => v.Resident)
            .Include(v => v.VehicleType)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vehicle == null)
            return null;

        return new VehicleDto
        {
            Id = vehicle.Id,
            ResidentId = vehicle.ResidentId,
            ResidentName = vehicle.Resident.FullName,
            Brand = vehicle.Brand,
            VehicleTypeId = vehicle.VehicleTypeId,
            VehicleTypeName = vehicle.VehicleType.Name,
            Model = vehicle.Model,
            Year = vehicle.Year,
            Color = vehicle.Color,
            LicensePlate = vehicle.LicensePlate,
            CreatedAt = vehicle.CreatedAt.ToString("O")
        };
    }

    public async Task<IEnumerable<VehicleDto>> GetVehiclesByResidentIdAsync(Guid residentId, bool includeInactive = false)
    {
        var query = _context.Vehicles
            .Where(v => v.ResidentId == residentId)
            .AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(v => v.IsActive);
        }
        
        var vehicles = await query
            .Include(v => v.Resident)
            .Include(v => v.VehicleType)
            .ToListAsync();

        return vehicles.Select(v => new VehicleDto
        {
            Id = v.Id,
            ResidentId = v.ResidentId,
            ResidentName = v.Resident.FullName,
            Brand = v.Brand,
            VehicleTypeId = v.VehicleTypeId,
            VehicleTypeName = v.VehicleType.Name,
            Model = v.Model,
            Year = v.Year,
            Color = v.Color,
            LicensePlate = v.LicensePlate,
            CreatedAt = v.CreatedAt.ToString("O")
        });
    }

    public async Task<VehicleDto> CreateVehicleAsync(CreateVehicleDto createVehicleDto)
    {
        // Verify resident exists
        var resident = await _context.Residents.FindAsync(createVehicleDto.ResidentId);
        if (resident == null)
            throw new InvalidOperationException("Resident not found");

        // Verify vehicle type exists
        var vehicleType = await _context.VehicleTypes.FindAsync(createVehicleDto.VehicleTypeId);
        if (vehicleType == null)
            throw new InvalidOperationException("Vehicle type not found");

        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            ResidentId = createVehicleDto.ResidentId,
            VehicleTypeId = createVehicleDto.VehicleTypeId,
            Brand = createVehicleDto.Brand,
            Model = createVehicleDto.Model,
            Year = createVehicleDto.Year,
            Color = createVehicleDto.Color,
            LicensePlate = createVehicleDto.LicensePlate,
            CreatedAt = DateTime.UtcNow
        };

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        return new VehicleDto
        {
            Id = vehicle.Id,
            ResidentId = vehicle.ResidentId,
            ResidentName = resident.FullName,
            Brand = vehicle.Brand,
            VehicleTypeId = vehicle.VehicleTypeId,
            VehicleTypeName = vehicleType.Name,
            Model = vehicle.Model,
            Year = vehicle.Year,
            Color = vehicle.Color,
            LicensePlate = vehicle.LicensePlate,
            CreatedAt = vehicle.CreatedAt.ToString("O")
        };
    }

    public async Task<VehicleDto?> UpdateVehicleAsync(Guid id, UpdateVehicleDto updateVehicleDto)
    {
        var vehicle = await _context.Vehicles
            .Include(v => v.Resident)
            .Include(v => v.VehicleType)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vehicle == null)
            return null;

        // Verify resident exists
        var resident = await _context.Residents.FindAsync(updateVehicleDto.ResidentId);
        if (resident == null)
            throw new InvalidOperationException("Resident not found");

        // Verify vehicle type exists
        var vehicleType = await _context.VehicleTypes.FindAsync(updateVehicleDto.VehicleTypeId);
        if (vehicleType == null)
            throw new InvalidOperationException("Vehicle type not found");

        vehicle.ResidentId = updateVehicleDto.ResidentId;
        vehicle.VehicleTypeId = updateVehicleDto.VehicleTypeId;
        vehicle.Brand = updateVehicleDto.Brand;
        vehicle.Model = updateVehicleDto.Model;
        vehicle.Year = updateVehicleDto.Year;
        vehicle.Color = updateVehicleDto.Color;
        vehicle.LicensePlate = updateVehicleDto.LicensePlate;

        await _context.SaveChangesAsync();

        return new VehicleDto
        {
            Id = vehicle.Id,
            ResidentId = vehicle.ResidentId,
            ResidentName = resident.FullName,
            Brand = vehicle.Brand,
            VehicleTypeId = vehicle.VehicleTypeId,
            VehicleTypeName = vehicleType.Name,
            Model = vehicle.Model,
            Year = vehicle.Year,
            Color = vehicle.Color,
            LicensePlate = vehicle.LicensePlate,
            CreatedAt = vehicle.CreatedAt.ToString("O")
        };
    }

    public async Task<bool> DeleteVehicleAsync(Guid id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null)
            return false;

        // Eliminación lógica: cambiar IsActive a false
        vehicle.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }
}

