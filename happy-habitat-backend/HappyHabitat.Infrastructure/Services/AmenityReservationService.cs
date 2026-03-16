using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class AmenityReservationService : IAmenityReservationService
{
    private readonly ApplicationDbContext _context;

    public AmenityReservationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AmenityReservationDto>> GetByResidentIdAsync(Guid residentId)
    {
        var list = await _context.AmenityReservations
            .Include(r => r.Amenity)
            .Include(r => r.Resident)
            .Where(r => r.ResidentId == residentId)
            .OrderByDescending(r => r.Horario)
            .ToListAsync();

        return list.Select(r => new AmenityReservationDto
        {
            Id = r.Id,
            AmenityId = r.AmenityId,
            AmenityName = r.Amenity?.Nombre ?? "",
            ResidentId = r.ResidentId,
            ResidentName = r.Resident?.FullName ?? "",
            Horario = r.Horario,
            NumPersonas = r.NumPersonas,
            HorasReservadas = r.HorasReservadas,
            Status = r.Status ?? ""
        });
    }

    public async Task<AmenityReservationDto?> CreateAsync(Guid residentId, CreateAmenityReservationDto dto)
    {
        var amenity = await _context.Amenities.FindAsync(dto.AmenityId);
        if (amenity == null)
            return null;

        var resident = await _context.Residents.FindAsync(residentId);
        if (resident == null)
            return null;

        var numPersonas = dto.NumPersonas < 1 ? 1 : dto.NumPersonas;
        if (amenity.PersonasPorReservacion.HasValue && numPersonas > amenity.PersonasPorReservacion.Value)
            numPersonas = amenity.PersonasPorReservacion.Value;

        var horasReservadas = dto.HorasReservadas < 1 ? 1 : dto.HorasReservadas;
        if (amenity.HorasPorReservacion.HasValue && horasReservadas > amenity.HorasPorReservacion.Value)
            horasReservadas = amenity.HorasPorReservacion.Value;

        var entity = new Domain.Entities.AmenityReservation
        {
            Id = Guid.NewGuid(),
            AmenityId = dto.AmenityId,
            ResidentId = residentId,
            Horario = dto.Horario,
            NumPersonas = numPersonas,
            HorasReservadas = horasReservadas,
            Status = "En proceso"
        };
        _context.AmenityReservations.Add(entity);
        await _context.SaveChangesAsync();

        await _context.Entry(entity)
            .Reference(r => r.Amenity)
            .LoadAsync();
        await _context.Entry(entity)
            .Reference(r => r.Resident)
            .LoadAsync();

        return new AmenityReservationDto
        {
            Id = entity.Id,
            AmenityId = entity.AmenityId,
            AmenityName = entity.Amenity?.Nombre ?? "",
            ResidentId = entity.ResidentId,
            ResidentName = entity.Resident?.FullName ?? "",
            Horario = entity.Horario,
            NumPersonas = entity.NumPersonas,
            HorasReservadas = entity.HorasReservadas,
            Status = entity.Status ?? ""
        };
    }

    public async Task<AmenityReservationDto?> CancelByResidentAsync(Guid id, Guid residentId)
    {
        var reservation = await _context.AmenityReservations
            .Include(r => r.Amenity)
            .Include(r => r.Resident)
            .FirstOrDefaultAsync(r => r.Id == id && r.ResidentId == residentId);
        if (reservation == null)
            return null;

        reservation.Status = "Cancelada";
        await _context.SaveChangesAsync();

        return new AmenityReservationDto
        {
            Id = reservation.Id,
            AmenityId = reservation.AmenityId,
            AmenityName = reservation.Amenity?.Nombre ?? "",
            ResidentId = reservation.ResidentId,
            ResidentName = reservation.Resident?.FullName ?? "",
            Horario = reservation.Horario,
            NumPersonas = reservation.NumPersonas,
            HorasReservadas = reservation.HorasReservadas,
            Status = reservation.Status ?? ""
        };
    }

    public async Task<IEnumerable<AmenityReservationDto>> GetByCommunityIdAsync(Guid communityId)
    {
        // Obtener IDs de amenidades de esta comunidad (CommunityId es propiedad sombra en Amenity)
        var amenityIds = await _context.Amenities
            .Where(a => EF.Property<Guid>(a, "CommunityId") == communityId)
            .Select(a => a.Id)
            .ToListAsync();

        var list = await _context.AmenityReservations
            .Include(r => r.Amenity)
            .Include(r => r.Resident)
            .Where(r => amenityIds.Contains(r.AmenityId))
            .OrderByDescending(r => r.Horario)
            .ToListAsync();

        return list.Select(r => new AmenityReservationDto
        {
            Id = r.Id,
            AmenityId = r.AmenityId,
            AmenityName = r.Amenity?.Nombre ?? "",
            ResidentId = r.ResidentId,
            ResidentName = r.Resident?.FullName ?? "",
            Horario = r.Horario,
            NumPersonas = r.NumPersonas,
            HorasReservadas = r.HorasReservadas,
            Status = r.Status ?? ""
        });
    }

    public async Task<AmenityReservationDto?> ApproveAsync(Guid id)
    {
        var reservation = await _context.AmenityReservations
            .Include(r => r.Amenity)
            .Include(r => r.Resident)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (reservation == null) return null;

        reservation.Status = "Reservada";
        await _context.SaveChangesAsync();

        return new AmenityReservationDto
        {
            Id = reservation.Id,
            AmenityId = reservation.AmenityId,
            AmenityName = reservation.Amenity?.Nombre ?? "",
            ResidentId = reservation.ResidentId,
            ResidentName = reservation.Resident?.FullName ?? "",
            Horario = reservation.Horario,
            NumPersonas = reservation.NumPersonas,
            HorasReservadas = reservation.HorasReservadas,
            Status = reservation.Status ?? ""
        };
    }

    private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
        { "Reservada", "Rechazada", "Cancelada" };

    public async Task<AmenityReservationDto?> UpdateStatusAsync(Guid id, string status)
    {
        if (string.IsNullOrWhiteSpace(status) || !AllowedStatuses.Contains(status))
            return null;

        var reservation = await _context.AmenityReservations
            .Include(r => r.Amenity)
            .Include(r => r.Resident)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (reservation == null) return null;

        reservation.Status = status.Trim();
        await _context.SaveChangesAsync();

        return new AmenityReservationDto
        {
            Id = reservation.Id,
            AmenityId = reservation.AmenityId,
            AmenityName = reservation.Amenity?.Nombre ?? "",
            ResidentId = reservation.ResidentId,
            ResidentName = reservation.Resident?.FullName ?? "",
            Horario = reservation.Horario,
            NumPersonas = reservation.NumPersonas,
            HorasReservadas = reservation.HorasReservadas,
            Status = reservation.Status ?? ""
        };
    }
}
