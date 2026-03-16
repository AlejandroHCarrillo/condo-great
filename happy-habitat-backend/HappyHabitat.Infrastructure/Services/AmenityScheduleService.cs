using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class AmenityScheduleService : IAmenityScheduleService
{
    private readonly ApplicationDbContext _context;

    public AmenityScheduleService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static AmenityScheduleDto MapToDto(AmenitySchedule s) => new AmenityScheduleDto
    {
        Id = s.Id,
        AmenityId = s.AmenityId,
        DayOfWeek = s.DayOfWeek,
        HoraInicio = s.HoraInicio,
        HoraFin = s.HoraFin,
        IsOpen = s.IsOpen,
        Nota = s.Nota ?? string.Empty
    };

    public async Task<IEnumerable<AmenityScheduleDto>> GetByAmenityIdAsync(Guid amenityId)
    {
        var list = await _context.AmenitySchedules
            .Where(s => s.AmenityId == amenityId)
            .OrderBy(s => s.DayOfWeek)
            .ThenBy(s => s.HoraInicio)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<AmenityScheduleDto?> GetByIdAsync(Guid id)
    {
        var entity = await _context.AmenitySchedules.FindAsync(id);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<AmenityScheduleDto> CreateAsync(CreateAmenityScheduleDto dto, Guid? createdByUserId = null)
    {
        var amenityExists = await _context.Amenities.AnyAsync(a => a.Id == dto.AmenityId);
        if (!amenityExists)
            throw new InvalidOperationException("Amenity not found");

        var entity = new AmenitySchedule
        {
            Id = Guid.NewGuid(),
            AmenityId = dto.AmenityId,
            DayOfWeek = dto.DayOfWeek,
            HoraInicio = dto.HoraInicio.Trim(),
            HoraFin = dto.HoraFin.Trim(),
            IsOpen = dto.IsOpen,
            Nota = dto.Nota?.Trim() ?? string.Empty,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.AmenitySchedules.Add(entity);
        await _context.SaveChangesAsync();
        return MapToDto(entity);
    }

    public async Task<AmenityScheduleDto?> UpdateAsync(Guid id, UpdateAmenityScheduleDto dto, Guid? updatedByUserId = null)
    {
        var entity = await _context.AmenitySchedules.FindAsync(id);
        if (entity == null)
            return null;

        entity.DayOfWeek = dto.DayOfWeek;
        entity.HoraInicio = dto.HoraInicio.Trim();
        entity.HoraFin = dto.HoraFin.Trim();
        entity.IsOpen = dto.IsOpen;
        entity.Nota = dto.Nota?.Trim() ?? string.Empty;
        entity.UpdatedByUserId = updatedByUserId;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _context.AmenitySchedules.FindAsync(id);
        if (entity == null)
            return false;
        _context.AmenitySchedules.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}
