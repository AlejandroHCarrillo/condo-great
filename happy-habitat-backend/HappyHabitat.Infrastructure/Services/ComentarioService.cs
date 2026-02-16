using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class ComentarioService : IComentarioService
{
    private readonly ApplicationDbContext _context;

    public ComentarioService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static ComentarioDto MapToDto(Comentario c)
    {
        return new ComentarioDto
        {
            Id = c.Id,
            ResidentId = c.ResidentId,
            ResidentName = c.Resident?.FullName,
            Origen = c.Origen,
            IdOrigen = c.IdOrigen,
            IdComment = c.IdComment,
            ComentarioTexto = c.ComentarioTexto,
            CreatedAt = c.CreatedAt.ToString("O"),
            UpdatedAt = c.UpdatedAt?.ToString("O")
        };
    }

    public async Task<IEnumerable<ComentarioDto>> GetByOrigenAsync(string origen, string idOrigen)
    {
        var list = await _context.Comentarios
            .Include(c => c.Resident)
            .Where(c => c.Origen == origen && c.IdOrigen == idOrigen)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<ComentarioDto?> GetByIdAsync(int id)
    {
        var item = await _context.Comentarios
            .Include(c => c.Resident)
            .FirstOrDefaultAsync(c => c.Id == id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<ComentarioDto> CreateAsync(Guid residentId, CreateComentarioDto dto)
    {
        var resident = await _context.Residents.FindAsync(residentId);
        if (resident == null)
            throw new InvalidOperationException("Residente no encontrado.");

        var comentario = new Comentario
        {
            ResidentId = residentId,
            Origen = dto.Origen?.Trim() ?? string.Empty,
            IdOrigen = dto.IdOrigen?.Trim() ?? string.Empty,
            IdComment = dto.IdComment,
            ComentarioTexto = dto.ComentarioTexto?.Trim() ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };
        _context.Comentarios.Add(comentario);
        await _context.SaveChangesAsync();

        await _context.Entry(comentario).Reference(c => c.Resident).LoadAsync();
        return MapToDto(comentario);
    }

    public async Task<ComentarioDto?> UpdateAsync(int id, UpdateComentarioDto dto)
    {
        var comentario = await _context.Comentarios
            .Include(c => c.Resident)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (comentario == null)
            return null;

        comentario.ComentarioTexto = dto.ComentarioTexto?.Trim() ?? string.Empty;
        comentario.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapToDto(comentario);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var comentario = await _context.Comentarios.FindAsync(id);
        if (comentario == null)
            return false;
        _context.Comentarios.Remove(comentario);
        await _context.SaveChangesAsync();
        return true;
    }
}
