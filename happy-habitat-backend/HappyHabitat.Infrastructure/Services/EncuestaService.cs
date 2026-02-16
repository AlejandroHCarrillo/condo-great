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

    private static EncuestaDto MapToDto(Encuesta e)
    {
        var dto = new EncuestaDto
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
        if (e.Preguntas?.Count > 0)
        {
            dto.Preguntas = e.Preguntas
                .OrderBy(p => p.CreatedAt)
                .Select(p => new PreguntaEncuestaDto
                {
                    Id = p.Id,
                    TipoPregunta = (int)p.TipoPregunta,
                    Pregunta = p.Pregunta,
                    Opciones = p.OpcionesRespuesta?.OrderBy(o => o.CreatedAt).Select(o => o.Respuesta).ToList() ?? new List<string>()
                })
                .ToList();
        }
        return dto;
    }

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
            .Include(e => e.Preguntas)
                .ThenInclude(p => p.OpcionesRespuesta)
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

        if (dto.Preguntas?.Count > 0)
        {
            foreach (var pr in dto.Preguntas)
            {
                var tipo = pr.TipoPregunta >= 0 && pr.TipoPregunta <= 3
                    ? (TipoPreguntaEncuesta)pr.TipoPregunta
                    : TipoPreguntaEncuesta.Texto;
                var pregunta = new PreguntaEncuesta
                {
                    Id = Guid.NewGuid(),
                    EncuestaId = encuesta.Id,
                    TipoPregunta = tipo,
                    Pregunta = pr.Pregunta?.Trim() ?? string.Empty,
                    CreatedAt = DateTime.UtcNow
                };
                _context.PreguntasEncuesta.Add(pregunta);
                await _context.SaveChangesAsync();

                if (pr.Opciones != null && pr.Opciones.Count > 0)
                {
                    foreach (var texto in pr.Opciones.Where(o => !string.IsNullOrWhiteSpace(o)))
                    {
                        _context.OpcionesRespuesta.Add(new OpcionRespuesta
                        {
                            Id = Guid.NewGuid(),
                            PreguntaEncuestaId = pregunta.Id,
                            Respuesta = texto.Trim(),
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    await _context.SaveChangesAsync();
                }
            }
        }

        await _context.Entry(encuesta).Reference(e => e.Community).LoadAsync();
        await _context.Entry(encuesta).Collection(e => e.Preguntas).Query().Include(p => p.OpcionesRespuesta).LoadAsync();
        return MapToDto(encuesta);
    }

    public async Task<EncuestaDto?> UpdateAsync(Guid id, UpdateEncuestaDto dto)
    {
        var encuesta = await _context.Encuestas
            .Include(e => e.Community)
            .Include(e => e.Preguntas)
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

        if (dto.Preguntas != null)
        {
            if (encuesta.Preguntas.Count > 0)
            {
                _context.PreguntasEncuesta.RemoveRange(encuesta.Preguntas);
                await _context.SaveChangesAsync();
            }

            foreach (var pr in dto.Preguntas)
            {
                var tipo = pr.TipoPregunta >= 0 && pr.TipoPregunta <= 3
                    ? (TipoPreguntaEncuesta)pr.TipoPregunta
                    : TipoPreguntaEncuesta.Texto;
                var pregunta = new PreguntaEncuesta
                {
                    Id = Guid.NewGuid(),
                    EncuestaId = encuesta.Id,
                    TipoPregunta = tipo,
                    Pregunta = pr.Pregunta?.Trim() ?? string.Empty,
                    CreatedAt = DateTime.UtcNow
                };
                _context.PreguntasEncuesta.Add(pregunta);
                await _context.SaveChangesAsync();

                if (pr.Opciones != null && pr.Opciones.Count > 0)
                {
                    foreach (var texto in pr.Opciones.Where(o => !string.IsNullOrWhiteSpace(o)))
                    {
                        _context.OpcionesRespuesta.Add(new OpcionRespuesta
                        {
                            Id = Guid.NewGuid(),
                            PreguntaEncuestaId = pregunta.Id,
                            Respuesta = texto.Trim(),
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    await _context.SaveChangesAsync();
                }
            }
        }

        await _context.SaveChangesAsync();
        await _context.Entry(encuesta).Reference(e => e.Community).LoadAsync();
        await _context.Entry(encuesta).Collection(e => e.Preguntas).Query().Include(p => p.OpcionesRespuesta).LoadAsync();
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

    public async Task SubmitRespuestasAsync(Guid encuestaId, Guid residentId, SubmitEncuestaRespuestasDto dto)
    {
        var encuesta = await _context.Encuestas
            .Include(e => e.Preguntas)
            .FirstOrDefaultAsync(e => e.Id == encuestaId);
        if (encuesta == null)
            throw new InvalidOperationException("Encuesta no encontrada.");
        if (!encuesta.IsActive)
            throw new InvalidOperationException("La encuesta no está activa.");
        var now = DateTime.UtcNow;
        if (now < encuesta.FechaInicio)
            throw new InvalidOperationException("La encuesta aún no está disponible.");
        if (now > encuesta.FechaFin)
            throw new InvalidOperationException("La encuesta ya ha finalizado.");

        var resident = await _context.Residents.FindAsync(residentId);
        if (resident == null)
            throw new InvalidOperationException("Residente no encontrado.");
        if (resident.CommunityId != encuesta.CommunityId)
            throw new InvalidOperationException("El residente no pertenece a la comunidad de esta encuesta.");

        var preguntaIds = encuesta.Preguntas.Select(p => p.Id).ToHashSet();
        foreach (var item in dto.Respuestas ?? new List<SubmitRespuestaItemDto>())
        {
            if (!preguntaIds.Contains(item.PreguntaId))
                continue;
            _context.RespuestasResidente.Add(new RespuestaResidente
            {
                EncuestaId = encuestaId,
                PreguntaId = item.PreguntaId,
                ResidenteId = residentId,
                Respuesta = item.Respuesta?.Trim() ?? string.Empty,
                FechaRespuesta = now,
                CreatedAt = now
            });
        }
        await _context.SaveChangesAsync();
    }
}
