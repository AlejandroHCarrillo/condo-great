using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class EncuestaService : IEncuestaService
{
    private readonly ApplicationDbContext _context;

    public EncuestaService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static EncuestaDto MapToDto(Encuesta e) => new EncuestaDto
    {
        Id = e.Id,
        CommunityId = e.CommunityId,
        CommunityName = e.Community?.Nombre,
        Titulo = e.Titulo,
        Descripcion = e.Descripcion,
        FechaInicio = e.FechaInicio,
        FechaFin = e.FechaFin,
        IsActive = e.IsActive,
        CreatedAt = e.CreatedAt.ToString("O"),
        UpdatedAt = e.UpdatedAt?.ToString("O")
    };

    public async Task<IEnumerable<EncuestaDto>> GetAllAsync()
    {
        var list = await _context.Encuestas
            .Include(e => e.Community)
            .OrderBy(e => e.Community!.Nombre)
            .ThenBy(e => e.Titulo)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<EncuestaDto>> GetByCommunityIdAsync(Guid communityId)
    {
        var list = await _context.Encuestas
            .Include(e => e.Community)
            .Where(e => e.CommunityId == communityId)
            .OrderBy(e => e.FechaInicio)
            .ThenBy(e => e.Titulo)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<EncuestaDto?> GetByIdAsync(Guid id)
    {
        var item = await _context.Encuestas
            .Include(e => e.Community)
            .FirstOrDefaultAsync(e => e.Id == id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<EncuestaDto> CreateAsync(CreateEncuestaDto dto)
    {
        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Comunidad no encontrada.");

        var encuesta = new Encuesta
        {
            Id = Guid.NewGuid(),
            CommunityId = dto.CommunityId,
            Community = community,
            Titulo = dto.Titulo,
            Descripcion = dto.Descripcion,
            FechaInicio = dto.FechaInicio,
            FechaFin = dto.FechaFin,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Encuestas.Add(encuesta);
        await _context.SaveChangesAsync();
        await _context.Entry(encuesta).Reference(e => e.Community).LoadAsync();
        return MapToDto(encuesta);
    }

    public async Task<EncuestaDto?> UpdateAsync(Guid id, UpdateEncuestaDto dto)
    {
        var encuesta = await _context.Encuestas
            .Include(e => e.Community)
            .FirstOrDefaultAsync(e => e.Id == id);
        if (encuesta == null)
            return null;

        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Comunidad no encontrada.");

        encuesta.CommunityId = dto.CommunityId;
        encuesta.Community = community;
        encuesta.Titulo = dto.Titulo;
        encuesta.Descripcion = dto.Descripcion;
        encuesta.FechaInicio = dto.FechaInicio;
        encuesta.FechaFin = dto.FechaFin;
        encuesta.IsActive = dto.IsActive;
        encuesta.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _context.Entry(encuesta).Reference(e => e.Community).LoadAsync();
        return MapToDto(encuesta);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var encuesta = await _context.Encuestas.FindAsync(id);
        if (encuesta == null)
            return false;
        _context.Encuestas.Remove(encuesta);
        await _context.SaveChangesAsync();
        return true;
    }
}
