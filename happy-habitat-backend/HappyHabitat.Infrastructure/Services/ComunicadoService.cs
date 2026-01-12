using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class ComunicadoService : IComunicadoService
{
    private readonly ApplicationDbContext _context;

    public ComunicadoService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ComunicadoDto>> GetAllComunicadosAsync(bool includeInactive = false)
    {
        var query = _context.Comunicados.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }
        
        var comunicados = await query
            .Include(c => c.Community)
            .OrderByDescending(c => c.Fecha)
            .ToListAsync();

        return comunicados.Select(c => new ComunicadoDto
        {
            Id = c.Id,
            CommunityId = c.CommunityId,
            CommunityName = c.Community?.Nombre,
            Titulo = c.Titulo,
            Subtitulo = c.Subtitulo,
            Descripcion = c.Descripcion,
            Fecha = c.Fecha,
            Imagen = c.Imagen,
            CreatedAt = c.CreatedAt
        });
    }

    public async Task<IEnumerable<ComunicadoDto>> GetComunicadosPaginatedAsync(int page = 1, int pageSize = 20, bool includeInactive = false)
    {
        var query = _context.Comunicados.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }
        
        var comunicados = await query
            .Include(c => c.Community)
            .OrderByDescending(c => c.Fecha)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return comunicados.Select(c => new ComunicadoDto
        {
            Id = c.Id,
            CommunityId = c.CommunityId,
            CommunityName = c.Community?.Nombre,
            Titulo = c.Titulo,
            Subtitulo = c.Subtitulo,
            Descripcion = c.Descripcion,
            Fecha = c.Fecha,
            Imagen = c.Imagen,
            CreatedAt = c.CreatedAt
        });
    }

    public async Task<IEnumerable<ComunicadoDto>> GetComunicadosByCommunityIdAsync(Guid? communityId, bool includeInactive = false)
    {
        var query = _context.Comunicados.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }
        
        query = query
            .Include(c => c.Community)
            .AsQueryable();

        if (communityId.HasValue)
        {
            query = query.Where(c => c.CommunityId == communityId);
        }
        else
        {
            query = query.Where(c => c.CommunityId == null);
        }

        var comunicados = await query
            .OrderByDescending(c => c.Fecha)
            .ToListAsync();

        return comunicados.Select(c => new ComunicadoDto
        {
            Id = c.Id,
            CommunityId = c.CommunityId,
            CommunityName = c.Community?.Nombre,
            Titulo = c.Titulo,
            Subtitulo = c.Subtitulo,
            Descripcion = c.Descripcion,
            Fecha = c.Fecha,
            Imagen = c.Imagen,
            CreatedAt = c.CreatedAt
        });
    }

    public async Task<ComunicadoDto?> GetComunicadoByIdAsync(Guid id, bool includeInactive = false)
    {
        var query = _context.Comunicados.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }
        
        var comunicado = await query
            .Include(c => c.Community)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (comunicado == null)
            return null;

        return new ComunicadoDto
        {
            Id = comunicado.Id,
            CommunityId = comunicado.CommunityId,
            CommunityName = comunicado.Community?.Nombre,
            Titulo = comunicado.Titulo,
            Subtitulo = comunicado.Subtitulo,
            Descripcion = comunicado.Descripcion,
            Fecha = comunicado.Fecha,
            Imagen = comunicado.Imagen,
            CreatedAt = comunicado.CreatedAt
        };
    }

    public async Task<ComunicadoDto> CreateComunicadoAsync(CreateComunicadoDto createComunicadoDto)
    {
        // Verify community exists if provided
        if (createComunicadoDto.CommunityId.HasValue)
        {
            var community = await _context.Communities.FindAsync(createComunicadoDto.CommunityId.Value);
            if (community == null)
                throw new InvalidOperationException("Community not found");
        }

        var comunicado = new Comunicado
        {
            Id = Guid.NewGuid(),
            CommunityId = createComunicadoDto.CommunityId,
            Titulo = createComunicadoDto.Titulo,
            Subtitulo = createComunicadoDto.Subtitulo,
            Descripcion = createComunicadoDto.Descripcion,
            Fecha = createComunicadoDto.Fecha,
            Imagen = createComunicadoDto.Imagen,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        _context.Comunicados.Add(comunicado);
        await _context.SaveChangesAsync();

        // Reload with community
        await _context.Entry(comunicado).Reference(c => c.Community).LoadAsync();

        return new ComunicadoDto
        {
            Id = comunicado.Id,
            CommunityId = comunicado.CommunityId,
            CommunityName = comunicado.Community?.Nombre,
            Titulo = comunicado.Titulo,
            Subtitulo = comunicado.Subtitulo,
            Descripcion = comunicado.Descripcion,
            Fecha = comunicado.Fecha,
            Imagen = comunicado.Imagen,
            CreatedAt = comunicado.CreatedAt
        };
    }

    public async Task<ComunicadoDto?> UpdateComunicadoAsync(Guid id, UpdateComunicadoDto updateComunicadoDto)
    {
        var comunicado = await _context.Comunicados
            .Include(c => c.Community)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (comunicado == null)
            return null;

        // Verify community exists if provided
        if (updateComunicadoDto.CommunityId.HasValue)
        {
            var community = await _context.Communities.FindAsync(updateComunicadoDto.CommunityId.Value);
            if (community == null)
                throw new InvalidOperationException("Community not found");
        }

        comunicado.CommunityId = updateComunicadoDto.CommunityId;
        comunicado.Titulo = updateComunicadoDto.Titulo;
        comunicado.Subtitulo = updateComunicadoDto.Subtitulo;
        comunicado.Descripcion = updateComunicadoDto.Descripcion;
        comunicado.Fecha = updateComunicadoDto.Fecha;
        comunicado.Imagen = updateComunicadoDto.Imagen;

        await _context.SaveChangesAsync();

        // Reload with community
        await _context.Entry(comunicado).Reference(c => c.Community).LoadAsync();

        return new ComunicadoDto
        {
            Id = comunicado.Id,
            CommunityId = comunicado.CommunityId,
            CommunityName = comunicado.Community?.Nombre,
            Titulo = comunicado.Titulo,
            Subtitulo = comunicado.Subtitulo,
            Descripcion = comunicado.Descripcion,
            Fecha = comunicado.Fecha,
            Imagen = comunicado.Imagen,
            CreatedAt = comunicado.CreatedAt
        };
    }

    public async Task<bool> DeleteComunicadoAsync(Guid id)
    {
        var comunicado = await _context.Comunicados.FindAsync(id);
        if (comunicado == null)
            return false;

        // Eliminación lógica: cambiar IsActive a false
        comunicado.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }
}

