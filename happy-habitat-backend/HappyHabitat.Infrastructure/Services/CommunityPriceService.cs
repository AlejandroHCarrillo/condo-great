using System.Reflection;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class CommunityPriceService : ICommunityPriceService
{
    private readonly ApplicationDbContext _context;

    public CommunityPriceService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static CommunityPriceDto MapToDto(CommunityPrice p) => new CommunityPriceDto
    {
        Id = p.Id,
        CommunityId = p.CommunityId,
        CommunityName = p.Community?.Nombre,
        Concepto = p.Concepto,
        Monto = p.Monto,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt.ToString("O"),
        UpdatedAt = p.UpdatedAt?.ToString("O"),
        CreatedByUserId = p.CreatedByUserId,
        UpdatedByUserId = p.UpdatedByUserId
    };

    public async Task<IEnumerable<CommunityPriceDto>> GetAllAsync()
    {
        var list = await _context.CommunityPrices
            .Include(p => p.Community)
            .OrderBy(p => p.Community!.Nombre)
            .ThenBy(p => p.Concepto)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<CommunityPriceDto>> GetByCommunityIdAsync(Guid communityId)
    {
        var list = await _context.CommunityPrices
            .Include(p => p.Community)
            .Where(p => p.CommunityId == communityId)
            .OrderBy(p => p.Concepto)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<CommunityPriceDto?> GetByIdAsync(Guid id)
    {
        var item = await _context.CommunityPrices
            .Include(p => p.Community)
            .FirstOrDefaultAsync(p => p.Id == id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<CommunityPriceDto> CreateAsync(CreateCommunityPriceDto dto)
    {
        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        var price = new CommunityPrice
        {
            Id = Guid.NewGuid(),
            CommunityId = dto.CommunityId,
            Community = community,
            Concepto = dto.Concepto,
            Monto = dto.Monto,
            IsActive = dto.IsActive,
            CreatedByUserId = dto.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.CommunityPrices.Add(price);
        await _context.SaveChangesAsync();
        await _context.Entry(price).Reference(p => p.Community).LoadAsync();
        return MapToDto(price);
    }

    public async Task<CommunityPriceDto?> UpdateAsync(Guid id, UpdateCommunityPriceDto dto)
    {
        var price = await _context.CommunityPrices
            .Include(p => p.Community)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (price == null)
            return null;

        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        price.CommunityId = dto.CommunityId;
        price.Community = community;
        price.Concepto = dto.Concepto;
        price.Monto = dto.Monto;
        price.IsActive = dto.IsActive;
        price.UpdatedByUserId = dto.UpdatedByUserId;
        price.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _context.Entry(price).Reference(p => p.Community).LoadAsync();
        return MapToDto(price);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var price = await _context.CommunityPrices.FindAsync(id);
        if (price == null)
            return false;
        _context.CommunityPrices.Remove(price);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task SeedDefaultPricesForCommunityAsync(Guid communityId)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = assembly.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("CommunityPrices.json", StringComparison.OrdinalIgnoreCase));
        if (string.IsNullOrEmpty(resourceName))
            return;

        await using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
            return;

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var templates = await JsonSerializer.DeserializeAsync<List<CommunityPriceBaseItem>>(stream, options);
        if (templates == null || templates.Count == 0)
            return;

        var prices = templates.Select(t => new CommunityPrice
        {
            Id = Guid.NewGuid(),
            CommunityId = communityId,
            Concepto = t.Concepto ?? string.Empty,
            Monto = t.Monto,
            IsActive = t.IsActive,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        await _context.CommunityPrices.AddRangeAsync(prices);
        await _context.SaveChangesAsync();
    }

    private sealed class CommunityPriceBaseItem
    {
        public string? Concepto { get; set; }
        public decimal Monto { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
