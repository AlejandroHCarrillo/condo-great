using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class BannerService : IBannerService
{
    private readonly ApplicationDbContext _context;

    public BannerService(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Convierte un string de fecha (formato yyyy-MM-dd) a DateTime?
    /// Retorna null si el string está vacío o no se puede parsear
    /// </summary>
    private DateTime? ParseDate(string? dateString)
    {
        if (string.IsNullOrEmpty(dateString))
            return null;

        if (DateTime.TryParseExact(dateString, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out var date))
            return date;

        return null;
    }

    public async Task<IEnumerable<BannerDto>> GetAllBannersAsync(bool includeInactive = false)
    {
        var query = _context.Banners.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(b => b.IsActive);
        }
        
        var banners = await query
            .Include(b => b.Community)
            .ToListAsync();

        // Ordenar por StartDate ascendente usando fechas reales (los que no tienen StartDate van al final)
        var sortedBanners = banners.OrderBy(b => 
            ParseDate(b.StartDate) ?? DateTime.MaxValue
        );

        return sortedBanners.Select(b => new BannerDto
        {
            Id = b.Id,
            CommunityId = b.CommunityId,
            CommunityName = b.Community?.Nombre,
            PathImagen = b.PathImagen,
            Title = b.Title,
            Text = b.Text,
            IsActive = b.IsActive,
            StartDate = b.StartDate,
            EndDate = b.EndDate,
            CreatedAt = b.CreatedAt
        });
    }

    public async Task<IEnumerable<BannerDto>> GetActiveBannersAsync()
    {
        var now = DateTime.UtcNow;
        return await GetActiveBannersByDateAsync(now);
    }

    public async Task<IEnumerable<BannerDto>> GetActiveBannersByDateAsync(DateTime? date = null)
    {
        var checkDate = date ?? DateTime.UtcNow;
        var checkDateString = checkDate.ToString("yyyy-MM-dd"); // Formato ISO para comparación de strings

        // Cargar todos los banners activos primero
        var allBanners = await _context.Banners
            .Include(b => b.Community)
            .Where(b => b.IsActive)
            .ToListAsync();

        // Filtrar por fecha en memoria (comparando strings en formato ISO)
        var banners = allBanners.Where(b =>
            (string.IsNullOrEmpty(b.StartDate) || b.StartDate.CompareTo(checkDateString) <= 0) &&
            (string.IsNullOrEmpty(b.EndDate) || b.EndDate.CompareTo(checkDateString) >= 0)
        ).ToList();

        // Ordenar por StartDate ascendente usando fechas reales (los que no tienen StartDate van al final)
        var sortedBanners = banners.OrderBy(b => 
            ParseDate(b.StartDate) ?? DateTime.MaxValue
        );

        return sortedBanners.Select(b => new BannerDto
        {
            Id = b.Id,
            CommunityId = b.CommunityId,
            CommunityName = b.Community?.Nombre,
            PathImagen = b.PathImagen,
            Title = b.Title,
            Text = b.Text,
            IsActive = b.IsActive,
            StartDate = b.StartDate,
            EndDate = b.EndDate,
            CreatedAt = b.CreatedAt
        });
    }

    public async Task<IEnumerable<BannerDto>> GetBannersByCommunityIdAsync(Guid? communityId, bool includeInactive = false)
    {
        var query = _context.Banners.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(b => b.IsActive);
        }
        
        query = query
            .Include(b => b.Community)
            .AsQueryable();

        if (communityId.HasValue)
        {
            query = query.Where(b => b.CommunityId == communityId);
        }
        else
        {
            query = query.Where(b => b.CommunityId == null);
        }

        var banners = await query.ToListAsync();

        // Ordenar por StartDate ascendente usando fechas reales (los que no tienen StartDate van al final)
        var sortedBanners = banners.OrderBy(b => 
            ParseDate(b.StartDate) ?? DateTime.MaxValue
        );

        return sortedBanners.Select(b => new BannerDto
        {
            Id = b.Id,
            CommunityId = b.CommunityId,
            CommunityName = b.Community?.Nombre,
            PathImagen = b.PathImagen,
            Title = b.Title,
            Text = b.Text,
            IsActive = b.IsActive,
            StartDate = b.StartDate,
            EndDate = b.EndDate,
            CreatedAt = b.CreatedAt
        });
    }

    public async Task<BannerDto?> GetBannerByIdAsync(Guid id, bool includeInactive = false)
    {
        var query = _context.Banners.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(b => b.IsActive);
        }
        
        var banner = await query
            .Include(b => b.Community)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (banner == null)
            return null;

        return new BannerDto
        {
            Id = banner.Id,
            CommunityId = banner.CommunityId,
            CommunityName = banner.Community?.Nombre,
            PathImagen = banner.PathImagen,
            Title = banner.Title,
            Text = banner.Text,
            IsActive = banner.IsActive,
            StartDate = banner.StartDate,
            EndDate = banner.EndDate,
            CreatedAt = banner.CreatedAt
        };
    }

    public async Task<BannerDto> CreateBannerAsync(CreateBannerDto createBannerDto)
    {
        // Verify community exists if provided
        if (createBannerDto.CommunityId.HasValue)
        {
            var community = await _context.Communities.FindAsync(createBannerDto.CommunityId.Value);
            if (community == null)
                throw new InvalidOperationException("Community not found");
        }

        var banner = new Banner
        {
            Id = Guid.NewGuid(),
            CommunityId = createBannerDto.CommunityId,
            PathImagen = createBannerDto.PathImagen,
            Title = createBannerDto.Title,
            Text = createBannerDto.Text,
            IsActive = createBannerDto.IsActive,
            StartDate = createBannerDto.StartDate,
            EndDate = createBannerDto.EndDate,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        _context.Banners.Add(banner);
        await _context.SaveChangesAsync();

        // Reload with community
        await _context.Entry(banner).Reference(b => b.Community).LoadAsync();

        return new BannerDto
        {
            Id = banner.Id,
            CommunityId = banner.CommunityId,
            CommunityName = banner.Community?.Nombre,
            PathImagen = banner.PathImagen,
            Title = banner.Title,
            Text = banner.Text,
            IsActive = banner.IsActive,
            StartDate = banner.StartDate,
            EndDate = banner.EndDate,
            CreatedAt = banner.CreatedAt
        };
    }

    public async Task<BannerDto?> UpdateBannerAsync(Guid id, UpdateBannerDto updateBannerDto)
    {
        var banner = await _context.Banners
            .Include(b => b.Community)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (banner == null)
            return null;

        // Verify community exists if provided
        if (updateBannerDto.CommunityId.HasValue)
        {
            var community = await _context.Communities.FindAsync(updateBannerDto.CommunityId.Value);
            if (community == null)
                throw new InvalidOperationException("Community not found");
        }

        banner.CommunityId = updateBannerDto.CommunityId;
        banner.PathImagen = updateBannerDto.PathImagen;
        banner.Title = updateBannerDto.Title;
        banner.Text = updateBannerDto.Text;
        banner.IsActive = updateBannerDto.IsActive;
        banner.StartDate = updateBannerDto.StartDate;
        banner.EndDate = updateBannerDto.EndDate;

        await _context.SaveChangesAsync();

        // Reload with community
        await _context.Entry(banner).Reference(b => b.Community).LoadAsync();

        return new BannerDto
        {
            Id = banner.Id,
            CommunityId = banner.CommunityId,
            CommunityName = banner.Community?.Nombre,
            PathImagen = banner.PathImagen,
            Title = banner.Title,
            Text = banner.Text,
            IsActive = banner.IsActive,
            StartDate = banner.StartDate,
            EndDate = banner.EndDate,
            CreatedAt = banner.CreatedAt
        };
    }

    public async Task<bool> DeleteBannerAsync(Guid id)
    {
        var banner = await _context.Banners.FindAsync(id);
        if (banner == null)
            return false;

        // Eliminación lógica: cambiar IsActive a false
        banner.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }
}

