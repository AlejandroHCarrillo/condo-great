using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class CommunityService : ICommunityService
{
    private readonly ApplicationDbContext _context;

    public CommunityService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CommunityDto>> GetAllCommunitiesAsync(bool includeInactive = false)
    {
        var query = _context.Communities.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }
        
        var communities = await query
            .OrderBy(c => c.Nombre)
            .ToListAsync();

        return communities.Select(c => new CommunityDto
        {
            Id = c.Id.ToString(),
            Nombre = c.Nombre,
            Descripcion = c.Descripcion,
            Direccion = c.Direccion,
            Contacto = c.Contacto,
            Email = c.Email,
            Phone = c.Phone,
            TipoComunidad = c.TipoComunidad,
            Latitud = c.Latitud,
            Longitud = c.Longitud,
            CantidadViviendas = c.CantidadViviendas
        });
    }

    public async Task<CommunityDto?> GetCommunityByIdAsync(Guid id, bool includeInactive = false)
    {
        var query = _context.Communities.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }
        
        var community = await query
            .FirstOrDefaultAsync(c => c.Id == id);

        if (community == null)
            return null;

        return new CommunityDto
        {
            Id = community.Id.ToString(),
            Nombre = community.Nombre,
            Descripcion = community.Descripcion,
            Direccion = community.Direccion,
            Contacto = community.Contacto,
            Email = community.Email,
            Phone = community.Phone,
            TipoComunidad = community.TipoComunidad,
            Latitud = community.Latitud,
            Longitud = community.Longitud,
            CantidadViviendas = community.CantidadViviendas
        };
    }

    public async Task<CommunityDto> CreateCommunityAsync(CreateCommunityDto createCommunityDto)
    {
        var community = new Community
        {
            Id = Guid.NewGuid(),
            Nombre = createCommunityDto.Nombre,
            Descripcion = createCommunityDto.Descripcion,
            Direccion = createCommunityDto.Direccion,
            Contacto = createCommunityDto.Contacto,
            Email = createCommunityDto.Email,
            Phone = createCommunityDto.Phone,
            TipoComunidad = createCommunityDto.TipoComunidad,
            Latitud = createCommunityDto.Latitud,
            Longitud = createCommunityDto.Longitud,
            CantidadViviendas = createCommunityDto.CantidadViviendas,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        _context.Communities.Add(community);
        await _context.SaveChangesAsync();

        return new CommunityDto
        {
            Id = community.Id.ToString(),
            Nombre = community.Nombre,
            Descripcion = community.Descripcion,
            Direccion = community.Direccion,
            Contacto = community.Contacto,
            Email = community.Email,
            Phone = community.Phone,
            TipoComunidad = community.TipoComunidad,
            Latitud = community.Latitud,
            Longitud = community.Longitud,
            CantidadViviendas = community.CantidadViviendas
        };
    }

    public async Task<CommunityDto?> UpdateCommunityAsync(Guid id, UpdateCommunityDto updateCommunityDto)
    {
        var community = await _context.Communities.FindAsync(id);

        if (community == null)
            return null;

        // Actualizar todas las propiedades
        community.Nombre = updateCommunityDto.Nombre;
        community.Descripcion = updateCommunityDto.Descripcion;
        community.Direccion = updateCommunityDto.Direccion;
        community.Contacto = updateCommunityDto.Contacto;
        community.Email = updateCommunityDto.Email;
        community.Phone = updateCommunityDto.Phone;
        community.TipoComunidad = updateCommunityDto.TipoComunidad;
        community.Latitud = updateCommunityDto.Latitud;
        community.Longitud = updateCommunityDto.Longitud;
        community.CantidadViviendas = updateCommunityDto.CantidadViviendas;

        // Marcar la entidad como modificada explícitamente
        _context.Entry(community).State = Microsoft.EntityFrameworkCore.EntityState.Modified;

        // Guardar los cambios
        var saved = await _context.SaveChangesAsync();
        
        if (saved == 0)
        {
            // Si no se guardaron cambios, podría haber un problema
            throw new InvalidOperationException("No se pudieron guardar los cambios en la comunidad");
        }

        return new CommunityDto
        {
            Id = community.Id.ToString(),
            Nombre = community.Nombre,
            Descripcion = community.Descripcion,
            Direccion = community.Direccion,
            Contacto = community.Contacto,
            Email = community.Email,
            Phone = community.Phone,
            TipoComunidad = community.TipoComunidad,
            Latitud = community.Latitud,
            Longitud = community.Longitud,
            CantidadViviendas = community.CantidadViviendas
        };
    }

    public async Task<bool> DeleteCommunityAsync(Guid id)
    {
        var community = await _context.Communities.FindAsync(id);
        if (community == null)
            return false;

        // Eliminación lógica: cambiar IsActive a false
        community.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }
}

