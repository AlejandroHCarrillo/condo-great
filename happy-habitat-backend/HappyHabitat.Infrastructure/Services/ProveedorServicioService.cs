using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class ProveedorServicioService : IProveedorServicioService
{
    private readonly ApplicationDbContext _context;

    public ProveedorServicioService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static ProveedorServicioDto MapToDto(ProveedorServicio p, int? totalCalificaciones = null) => new ProveedorServicioDto
    {
        Id = p.Id,
        CommunityId = p.Community?.Id,
        CommunityName = p.Community?.Nombre,
        Giro = p.Giro,
        Nombre = p.Nombre,
        Telefono = p.Telefono,
        Email = p.Email,
        Descripcion = p.Descripcion,
        PaginaWeb = p.PaginaWeb,
        Rating = p.Rating,
        TotalCalificaciones = totalCalificaciones,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt.ToString("O"),
        CreatedByUserId = p.CreatedByUserId,
        UpdatedAt = p.UpdatedAt?.ToString("O"),
        UpdatedByUserId = p.UpdatedByUserId
    };

    public async Task<IEnumerable<ProveedorServicioDto>> GetAllAsync(bool includeInactive = false)
    {
        var query = _context.ProveedorServicios
            .Include(p => p.Community)
            .Include(p => p.Calificaciones)
            .AsQueryable();
        if (!includeInactive)
            query = query.Where(p => p.IsActive);

        var list = await query.OrderBy(p => p.Giro).ThenBy(p => p.Nombre).ToListAsync();
        return list.Select(p =>
        {
            var total = p.Calificaciones.Count;
            var rating = total > 0 ? (decimal?)p.Calificaciones.Average(c => c.Puntuacion) : p.Rating;
            var dto = MapToDto(p, total);
            dto.Rating = rating;
            return dto;
        });
    }

    public async Task<IEnumerable<ProveedorServicioDto>> GetByCommunityIdAsync(Guid? communityId, bool includeInactive = false)
    {
        var query = _context.ProveedorServicios
            .Include(p => p.Community)
            .Include(p => p.Calificaciones)
            .AsQueryable();
        if (!includeInactive)
            query = query.Where(p => p.IsActive);
        if (communityId.HasValue)
            query = query.Where(p => p.Community != null && p.Community.Id == communityId);

        var list = await query.OrderBy(p => p.Giro).ThenBy(p => p.Nombre).ToListAsync();
        return list.Select(p =>
        {
            var total = p.Calificaciones.Count;
            var rating = total > 0 ? (decimal?)p.Calificaciones.Average(c => c.Puntuacion) : p.Rating;
            var dto = MapToDto(p, total);
            dto.Rating = rating;
            return dto;
        });
    }

    public async Task<ProveedorServicioDto?> GetByIdAsync(Guid id, bool includeInactive = false)
    {
        var query = _context.ProveedorServicios
            .Include(p => p.Community)
            .Include(p => p.Calificaciones)
            .AsQueryable();
        if (!includeInactive)
            query = query.Where(p => p.IsActive);

        var item = await query.FirstOrDefaultAsync(p => p.Id == id);
        if (item == null) return null;

        var total = item.Calificaciones.Count;
        var rating = total > 0 ? (decimal?)item.Calificaciones.Average(c => c.Puntuacion) : item.Rating;
        var dto = MapToDto(item, total);
        dto.Rating = rating;
        return dto;
    }

    public async Task<ProveedorServicioDto> CreateAsync(CreateProveedorServicioDto dto)
    {
        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        var item = new ProveedorServicio
        {
            Id = Guid.NewGuid(),
            Community = community,
            Giro = dto.Giro,
            Nombre = dto.Nombre,
            Telefono = dto.Telefono,
            Email = dto.Email,
            Descripcion = dto.Descripcion,
            PaginaWeb = dto.PaginaWeb,
            Rating = dto.Rating,
            CreatedByUserId = dto.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.ProveedorServicios.Add(item);
        await _context.SaveChangesAsync();
        await _context.Entry(item).Reference(p => p.Community).LoadAsync();
        return MapToDto(item);
    }

    public async Task<ProveedorServicioDto?> UpdateAsync(Guid id, UpdateProveedorServicioDto dto)
    {
        var item = await _context.ProveedorServicios
            .Include(p => p.Community)
            .Include(p => p.Calificaciones)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (item == null) return null;

        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        item.Community = community;
        item.Giro = dto.Giro;
        item.Nombre = dto.Nombre;
        item.Telefono = dto.Telefono;
        item.Email = dto.Email;
        item.Descripcion = dto.Descripcion;
        item.PaginaWeb = dto.PaginaWeb;
        item.Rating = dto.Rating;
        item.UpdatedByUserId = dto.UpdatedByUserId;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _context.Entry(item).Reference(p => p.Community).LoadAsync();
        var total = item.Calificaciones.Count;
        var rating = total > 0 ? (decimal?)item.Calificaciones.Average(c => c.Puntuacion) : item.Rating;
        var result = MapToDto(item, total);
        result.Rating = rating;
        return result;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var item = await _context.ProveedorServicios.FindAsync(id);
        if (item == null) return false;
        item.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ProveedorServicioDto?> CalificarAsync(Guid id, Guid userId, decimal puntuacion)
    {
        if (puntuacion < 0 || puntuacion > 5)
            throw new ArgumentOutOfRangeException(nameof(puntuacion), "La puntuación debe estar entre 0 y 5.");

        var item = await _context.ProveedorServicios
            .Include(p => p.Community)
            .Include(p => p.Calificaciones)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
        if (item == null) return null;

        var existente = await _context.ProveedorServicioCalificaciones
            .FirstOrDefaultAsync(c => c.ProveedorServicioId == id && c.UserId == userId);
        if (existente != null)
        {
            existente.Puntuacion = puntuacion;
        }
        else
        {
            _context.ProveedorServicioCalificaciones.Add(new ProveedorServicioCalificacion
            {
                Id = Guid.NewGuid(),
                ProveedorServicioId = id,
                UserId = userId,
                Puntuacion = puntuacion,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        await _context.Entry(item).Collection(p => p.Calificaciones).LoadAsync();
        var total = item.Calificaciones.Count;
        var rating = (decimal)item.Calificaciones.Average(c => c.Puntuacion);
        item.Rating = rating;
        await _context.SaveChangesAsync();

        return MapToDto(item, total);
    }
}
