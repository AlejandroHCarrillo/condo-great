using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class AmenityService : IAmenityService
{
    private readonly ApplicationDbContext _context;

    public AmenityService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static AmenityDto MapToDto(Amenity a) => new AmenityDto
    {
        Id = a.Id,
        Nombre = a.Nombre,
        Descripcion = a.Descripcion,
        Reglas = a.Reglas,
        Costo = a.Costo,
        FechaAlta = a.FechaAlta,
        Imagen = a.Imagen,
        CommunityId = a.Community?.Id,
        CommunityName = a.Community?.Nombre,
        CapacidadMaxima = a.CapacidadMaxima,
        NumeroReservacionesSimultaneas = a.NumeroReservacionesSimultaneas,
        CreatedAt = a.CreatedAt.ToString("O")
    };

    public async Task<IEnumerable<AmenityDto>> GetAllAmenitiesAsync(bool includeInactive = false)
    {
        var query = _context.Amenities.AsQueryable();
        if (!includeInactive)
            query = query.Where(a => a.IsActive);

        var list = await query
            .Include(a => a.Community)
            .OrderByDescending(a => a.FechaAlta)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<AmenityDto>> GetAmenitiesByCommunityIdAsync(Guid? communityId, bool includeInactive = false)
    {
        var query = _context.Amenities
            .Include(a => a.Community)
            .AsQueryable();
        if (!includeInactive)
            query = query.Where(a => a.IsActive);
        if (communityId.HasValue)
            query = query.Where(a => a.Community != null && a.Community.Id == communityId);

        var list = await query.OrderByDescending(a => a.FechaAlta).ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<AmenityDto?> GetAmenityByIdAsync(Guid id, bool includeInactive = false)
    {
        var query = _context.Amenities.Include(a => a.Community).AsQueryable();
        if (!includeInactive)
            query = query.Where(a => a.IsActive);

        var amenity = await query.FirstOrDefaultAsync(a => a.Id == id);
        return amenity == null ? null : MapToDto(amenity);
    }

    public async Task<AmenityDto> CreateAmenityAsync(CreateAmenityDto dto)
    {
        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        var amenity = new Amenity
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Reglas = dto.Reglas,
            Costo = dto.Costo,
            FechaAlta = dto.FechaAlta,
            Imagen = dto.Imagen,
            Community = community,
            CapacidadMaxima = dto.CapacidadMaxima,
            NumeroReservacionesSimultaneas = dto.NumeroReservacionesSimultaneas,
            CreatedAt = DateTime.UtcNow
        };

        _context.Amenities.Add(amenity);
        await _context.SaveChangesAsync();
        await _context.Entry(amenity).Reference(a => a.Community).LoadAsync();
        return MapToDto(amenity);
    }

    public async Task<AmenityDto?> UpdateAmenityAsync(Guid id, UpdateAmenityDto dto)
    {
        var amenity = await _context.Amenities
            .Include(a => a.Community)
            .FirstOrDefaultAsync(a => a.Id == id);
        if (amenity == null)
            return null;

        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        amenity.Nombre = dto.Nombre;
        amenity.Descripcion = dto.Descripcion;
        amenity.Reglas = dto.Reglas;
        amenity.Costo = dto.Costo;
        amenity.FechaAlta = dto.FechaAlta;
        amenity.Imagen = dto.Imagen;
        amenity.Community = community;
        amenity.CapacidadMaxima = dto.CapacidadMaxima;
        amenity.NumeroReservacionesSimultaneas = dto.NumeroReservacionesSimultaneas;

        await _context.SaveChangesAsync();
        await _context.Entry(amenity).Reference(a => a.Community).LoadAsync();
        return MapToDto(amenity);
    }

    public async Task<bool> DeleteAmenityAsync(Guid id)
    {
        var amenity = await _context.Amenities.FindAsync(id);
        if (amenity == null)
            return false;
        amenity.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }
}
