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
            Status = reservation.Status ?? ""
        };
    }
}
