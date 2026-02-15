using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class CommunityProviderService : ICommunityProviderService
{
    private readonly ApplicationDbContext _context;

    public CommunityProviderService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static CommunityProviderDto MapToDto(CommunityProvider p) => new CommunityProviderDto
    {
        Id = p.Id,
        CommunityId = p.Community?.Id,
        CommunityName = p.Community?.Nombre,
        BusinessName = p.BusinessName,
        TaxId = p.TaxId,
        FullAddress = p.FullAddress,
        ContactPhones = p.ContactPhones,
        PrimaryEmail = p.PrimaryEmail,
        WebsiteOrSocialMedia = p.WebsiteOrSocialMedia,
        PrimaryContactName = p.PrimaryContactName,
        DirectPhone = p.DirectPhone,
        MobilePhone = p.MobilePhone,
        ContactEmail = p.ContactEmail,
        ProductsOrServices = p.ProductsOrServices,
        CategoryOrIndustry = p.CategoryOrIndustry,
        PaymentMethods = p.PaymentMethods,
        Rating = p.Rating,
        OrderHistory = p.OrderHistory,
        PastIncidentsOrClaims = p.PastIncidentsOrClaims,
        InternalNotes = p.InternalNotes,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt.ToString("O"),
        CreatedByUserId = p.CreatedByUserId,
        UpdatedAt = p.UpdatedAt?.ToString("O"),
        UpdatedByUserId = p.UpdatedByUserId
    };

    public async Task<IEnumerable<CommunityProviderDto>> GetAllAsync(bool includeInactive = false)
    {
        var query = _context.CommunityProviders
            .Include(p => p.Community)
            .AsQueryable();
        if (!includeInactive)
            query = query.Where(p => p.IsActive);

        var list = await query.OrderBy(p => p.BusinessName).ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<CommunityProviderDto>> GetByCommunityIdAsync(Guid? communityId, bool includeInactive = false)
    {
        var query = _context.CommunityProviders
            .Include(p => p.Community)
            .AsQueryable();
        if (!includeInactive)
            query = query.Where(p => p.IsActive);
        if (communityId.HasValue)
            query = query.Where(p => p.Community != null && p.Community.Id == communityId);

        var list = await query.OrderBy(p => p.BusinessName).ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<CommunityProviderDto?> GetByIdAsync(Guid id, bool includeInactive = false)
    {
        var query = _context.CommunityProviders
            .Include(p => p.Community)
            .AsQueryable();
        if (!includeInactive)
            query = query.Where(p => p.IsActive);

        var provider = await query.FirstOrDefaultAsync(p => p.Id == id);
        return provider == null ? null : MapToDto(provider);
    }

    public async Task<CommunityProviderDto> CreateAsync(CreateCommunityProviderDto dto)
    {
        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        var provider = new CommunityProvider
        {
            Id = Guid.NewGuid(),
            Community = community,
            BusinessName = dto.BusinessName,
            TaxId = dto.TaxId,
            FullAddress = dto.FullAddress,
            ContactPhones = dto.ContactPhones,
            PrimaryEmail = dto.PrimaryEmail,
            WebsiteOrSocialMedia = dto.WebsiteOrSocialMedia,
            PrimaryContactName = dto.PrimaryContactName,
            DirectPhone = dto.DirectPhone,
            MobilePhone = dto.MobilePhone,
            ContactEmail = dto.ContactEmail,
            ProductsOrServices = dto.ProductsOrServices,
            CategoryOrIndustry = dto.CategoryOrIndustry,
            PaymentMethods = dto.PaymentMethods,
            Rating = dto.Rating,
            OrderHistory = dto.OrderHistory,
            PastIncidentsOrClaims = dto.PastIncidentsOrClaims,
            InternalNotes = dto.InternalNotes,
            CreatedByUserId = dto.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.CommunityProviders.Add(provider);
        await _context.SaveChangesAsync();
        await _context.Entry(provider).Reference(p => p.Community).LoadAsync();
        return MapToDto(provider);
    }

    public async Task<CommunityProviderDto?> UpdateAsync(Guid id, UpdateCommunityProviderDto dto)
    {
        var provider = await _context.CommunityProviders
            .Include(p => p.Community)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (provider == null)
            return null;

        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        provider.Community = community;
        provider.BusinessName = dto.BusinessName;
        provider.TaxId = dto.TaxId;
        provider.FullAddress = dto.FullAddress;
        provider.ContactPhones = dto.ContactPhones;
        provider.PrimaryEmail = dto.PrimaryEmail;
        provider.WebsiteOrSocialMedia = dto.WebsiteOrSocialMedia;
        provider.PrimaryContactName = dto.PrimaryContactName;
        provider.DirectPhone = dto.DirectPhone;
        provider.MobilePhone = dto.MobilePhone;
        provider.ContactEmail = dto.ContactEmail;
        provider.ProductsOrServices = dto.ProductsOrServices;
        provider.CategoryOrIndustry = dto.CategoryOrIndustry;
        provider.PaymentMethods = dto.PaymentMethods;
        provider.Rating = dto.Rating;
        provider.OrderHistory = dto.OrderHistory;
        provider.PastIncidentsOrClaims = dto.PastIncidentsOrClaims;
        provider.InternalNotes = dto.InternalNotes;
        provider.UpdatedByUserId = dto.UpdatedByUserId;
        provider.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _context.Entry(provider).Reference(p => p.Community).LoadAsync();
        return MapToDto(provider);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var provider = await _context.CommunityProviders.FindAsync(id);
        if (provider == null)
            return false;
        provider.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }
}
