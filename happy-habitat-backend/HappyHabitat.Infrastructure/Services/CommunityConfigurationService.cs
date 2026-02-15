using System.Reflection;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class CommunityConfigurationService : ICommunityConfigurationService
{
    private readonly ApplicationDbContext _context;

    public CommunityConfigurationService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static CommunityConfigurationDto MapToDto(CommunityConfiguration c) => new CommunityConfigurationDto
    {
        Id = c.Id,
        CommunityId = c.CommunityId,
        CommunityName = c.Community?.Nombre,
        Titulo = c.Titulo,
        Descripcion = c.Descripcion,
        Valor = c.Valor,
        TipoDato = c.TipoDato,
        CreatedAt = c.CreatedAt.ToString("O"),
        UpdatedAt = c.UpdatedAt?.ToString("O"),
        CreatedByUserId = c.CreatedByUserId,
        UpdatedByUserId = c.UpdatedByUserId
    };

    public async Task<IEnumerable<CommunityConfigurationDto>> GetAllAsync()
    {
        var list = await _context.CommunityConfigurations
            .Include(c => c.Community)
            .OrderBy(c => c.Community!.Nombre)
            .ThenBy(c => c.Titulo)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<CommunityConfigurationDto>> GetByCommunityIdAsync(Guid communityId)
    {
        var list = await _context.CommunityConfigurations
            .Include(c => c.Community)
            .Where(c => c.CommunityId == communityId)
            .OrderBy(c => c.Titulo)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<CommunityConfigurationDto?> GetByIdAsync(Guid id)
    {
        var item = await _context.CommunityConfigurations
            .Include(c => c.Community)
            .FirstOrDefaultAsync(c => c.Id == id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<CommunityConfigurationDto> CreateAsync(CreateCommunityConfigurationDto dto)
    {
        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        var config = new CommunityConfiguration
        {
            Id = Guid.NewGuid(),
            CommunityId = dto.CommunityId,
            Community = community,
            Titulo = dto.Titulo,
            Descripcion = dto.Descripcion,
            Valor = dto.Valor,
            TipoDato = dto.TipoDato,
            CreatedByUserId = dto.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.CommunityConfigurations.Add(config);
        await _context.SaveChangesAsync();
        await _context.Entry(config).Reference(c => c.Community).LoadAsync();
        return MapToDto(config);
    }

    public async Task<CommunityConfigurationDto?> UpdateAsync(Guid id, UpdateCommunityConfigurationDto dto)
    {
        var config = await _context.CommunityConfigurations
            .Include(c => c.Community)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (config == null)
            return null;

        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        config.CommunityId = dto.CommunityId;
        config.Community = community;
        config.Titulo = dto.Titulo;
        config.Descripcion = dto.Descripcion;
        config.Valor = dto.Valor;
        config.TipoDato = dto.TipoDato;
        config.UpdatedByUserId = dto.UpdatedByUserId;
        config.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _context.Entry(config).Reference(c => c.Community).LoadAsync();
        return MapToDto(config);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var config = await _context.CommunityConfigurations.FindAsync(id);
        if (config == null)
            return false;
        _context.CommunityConfigurations.Remove(config);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task SeedDefaultConfigurationsForCommunityAsync(Guid communityId)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = assembly.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("CommunityConfigurationBase.json", StringComparison.OrdinalIgnoreCase));
        if (string.IsNullOrEmpty(resourceName))
            return;

        await using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
            return;

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var templates = await JsonSerializer.DeserializeAsync<List<CommunityConfigurationBaseItem>>(stream, options);
        if (templates == null || templates.Count == 0)
            return;

        var configs = templates.Select(t => new CommunityConfiguration
        {
            Id = Guid.NewGuid(),
            CommunityId = communityId,
            Titulo = t.Titulo ?? string.Empty,
            Descripcion = t.Descripcion ?? string.Empty,
            Valor = t.Valor ?? string.Empty,
            TipoDato = t.TipoDato ?? "string",
            CreatedAt = DateTime.UtcNow
        }).ToList();

        await _context.CommunityConfigurations.AddRangeAsync(configs);
        await _context.SaveChangesAsync();
    }

    private sealed class CommunityConfigurationBaseItem
    {
        public string? Titulo { get; set; }
        public string? Descripcion { get; set; }
        public string? Valor { get; set; }
        public string? TipoDato { get; set; }
    }
}
