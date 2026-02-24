using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Domain.Enums;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class CargoResidenteService : ICargoResidenteService
{
    private readonly ApplicationDbContext _context;

    public CargoResidenteService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static string EstatusToDisplay(EstatusCargoResidente e)
    {
        return e switch
        {
            EstatusCargoResidente.Activo => "Activo",
            EstatusCargoResidente.Cancelado => "Cancelado",
            EstatusCargoResidente.Pagado => "Pagado",
            EstatusCargoResidente.PagoParcial => "Pago Parcial",
            _ => e.ToString()
        };
    }

    private static EstatusCargoResidente DisplayToEstatus(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return EstatusCargoResidente.Activo;
        return s.Trim() switch
        {
            "Activo" => EstatusCargoResidente.Activo,
            "Cancelado" => EstatusCargoResidente.Cancelado,
            "Pagado" => EstatusCargoResidente.Pagado,
            "Pago Parcial" => EstatusCargoResidente.PagoParcial,
            _ => EstatusCargoResidente.Activo
        };
    }

    private static CargoResidenteDto MapToDto(CargoResidente c)
    {
        var resident = c.Resident;
        return new CargoResidenteDto
        {
            Id = c.Id,
            ResidentId = c.ResidentId,
            ResidentName = resident?.FullName,
            ResidentNumber = resident?.Number,
            Fecha = c.Fecha,
            Descripcion = c.Descripcion,
            Monto = c.Monto,
            Estatus = EstatusToDisplay(c.Estatus),
            CreatedAt = c.CreatedAt.ToString("O"),
            UpdatedAt = c.UpdatedAt?.ToString("O"),
            CreatedByUserId = c.CreatedByUserId,
            UpdatedByUserId = c.UpdatedByUserId
        };
    }

    public async Task<IEnumerable<CargoResidenteDto>> GetAllAsync()
    {
        var list = await _context.CargosResidente
            .Include(c => c.Resident)
            .OrderByDescending(c => c.Fecha)
            .ThenBy(c => c.Resident!.FullName)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<CargoResidenteDto>> GetByResidentIdAsync(Guid residentId)
    {
        var list = await _context.CargosResidente
            .Include(c => c.Resident)
            .Where(c => c.ResidentId == residentId)
            .OrderByDescending(c => c.Fecha)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<CargoResidenteDto>> GetByCommunityIdAsync(Guid communityId)
    {
        var list = await _context.CargosResidente
            .Include(c => c.Resident)
            .Where(c => c.Resident != null && c.Resident.CommunityId == communityId)
            .OrderByDescending(c => c.Fecha)
            .ThenBy(c => c.Resident!.FullName)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<CargoResidenteDto?> GetByIdAsync(Guid id)
    {
        var item = await _context.CargosResidente
            .Include(c => c.Resident)
            .FirstOrDefaultAsync(c => c.Id == id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<CargoResidenteDto> CreateAsync(CreateCargoResidenteDto dto)
    {
        var resident = await _context.Residents.FindAsync(dto.ResidentId);
        if (resident == null)
            throw new InvalidOperationException("Resident not found");

        var cargo = new CargoResidente
        {
            Id = Guid.NewGuid(),
            ResidentId = dto.ResidentId,
            Resident = resident,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion,
            Monto = dto.Monto,
            Estatus = DisplayToEstatus(dto.Estatus),
            CreatedByUserId = dto.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.CargosResidente.Add(cargo);
        await _context.SaveChangesAsync();
        await _context.Entry(cargo).Reference(c => c.Resident).LoadAsync();
        return MapToDto(cargo);
    }

    public async Task<CargoResidenteDto?> UpdateAsync(Guid id, UpdateCargoResidenteDto dto)
    {
        var cargo = await _context.CargosResidente
            .Include(c => c.Resident)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (cargo == null)
            return null;

        var resident = await _context.Residents.FindAsync(dto.ResidentId);
        if (resident == null)
            throw new InvalidOperationException("Resident not found");

        cargo.ResidentId = dto.ResidentId;
        cargo.Resident = resident;
        cargo.Fecha = dto.Fecha;
        cargo.Descripcion = dto.Descripcion;
        cargo.Monto = dto.Monto;
        cargo.Estatus = DisplayToEstatus(dto.Estatus);
        cargo.UpdatedByUserId = dto.UpdatedByUserId;
        cargo.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _context.Entry(cargo).Reference(c => c.Resident).LoadAsync();
        return MapToDto(cargo);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var cargo = await _context.CargosResidente.FindAsync(id);
        if (cargo == null)
            return false;
        _context.CargosResidente.Remove(cargo);
        await _context.SaveChangesAsync();
        return true;
    }
}
