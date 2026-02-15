using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class ResidentService : IResidentService
{
    private readonly ApplicationDbContext _context;

    public ResidentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ResidentDto>> GetAllAsync()
    {
        var residents = await _context.Residents
            .Include(r => r.User)
            .Include(r => r.Community)
            .Where(r => r.User != null && r.User.IsActive)
            .OrderBy(r => r.FullName)
            .ToListAsync();
        return residents.Select(MapToDto);
    }

    public async Task<PagedResultDto<ResidentDto>> GetAllPagedAsync(int page, int pageSize)
    {
        var query = _context.Residents
            .Include(r => r.User)
            .Include(r => r.Community)
            .Where(r => r.User != null && r.User.IsActive)
            .OrderBy(r => r.FullName);

        var totalCount = await query.CountAsync();
        var residents = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<ResidentDto>
        {
            Items = residents.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ResidentDto?> GetByIdAsync(Guid id)
    {
        var resident = await _context.Residents
            .Include(r => r.User)
            .Include(r => r.Community)
            .FirstOrDefaultAsync(r => r.Id == id);
        return resident == null ? null : MapToDto(resident);
    }

    public async Task<IEnumerable<ResidentDto>> GetByCommunityIdAsync(Guid communityId)
    {
        var residents = await _context.Residents
            .Include(r => r.User)
            .Include(r => r.Community)
            .Where(r => r.CommunityId == communityId && r.User != null && r.User.IsActive)
            .OrderBy(r => r.Number)
            .ThenBy(r => r.FullName)
            .ToListAsync();
        return residents.Select(MapToDto);
    }

    public async Task<PagedResultDto<ResidentDto>> GetByCommunityIdPagedAsync(Guid communityId, int page, int pageSize)
    {
        var query = _context.Residents
            .Include(r => r.User)
            .Include(r => r.Community)
            .Where(r => r.CommunityId == communityId && r.User != null && r.User.IsActive)
            .OrderBy(r => r.Number)
            .ThenBy(r => r.FullName);

        var totalCount = await query.CountAsync();
        var residents = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<ResidentDto>
        {
            Items = residents.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<IEnumerable<ResidentDto>> GetByCommunityIdsAsync(IEnumerable<Guid> communityIds)
    {
        var ids = communityIds.ToList();
        if (ids.Count == 0)
            return Array.Empty<ResidentDto>();

        var residents = await _context.Residents
            .Include(r => r.User)
            .Include(r => r.Community)
            .Where(r => r.CommunityId != null && ids.Contains(r.CommunityId.Value) && r.User != null && r.User.IsActive)
            .ToListAsync();

        var byUserId = new Dictionary<Guid, ResidentDto>();
        foreach (var r in residents)
        {
            if (r.UserId != Guid.Empty && !byUserId.ContainsKey(r.UserId))
                byUserId[r.UserId] = MapToDto(r);
        }
        return byUserId.Values;
    }

    public async Task<PagedResultDto<ResidentDto>> GetByCommunityIdsPagedAsync(IEnumerable<Guid> communityIds, int page, int pageSize)
    {
        var ids = communityIds.ToList();
        if (ids.Count == 0)
            return new PagedResultDto<ResidentDto> { Page = page, PageSize = pageSize };

        var baseQuery = _context.Residents
            .Include(r => r.User)
            .Include(r => r.Community)
            .Where(r => r.CommunityId != null && ids.Contains(r.CommunityId!.Value) && r.User != null && r.User.IsActive);

        var distinctUserIds = await baseQuery
            .Select(r => r.UserId)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();

        var totalCount = distinctUserIds.Count;
        var pagedUserIds = distinctUserIds
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        if (pagedUserIds.Count == 0)
            return new PagedResultDto<ResidentDto> { TotalCount = totalCount, Page = page, PageSize = pageSize };

        var residents = await _context.Residents
            .Include(r => r.User)
            .Include(r => r.Community)
            .Where(r => r.CommunityId != null && ids.Contains(r.CommunityId!.Value) && pagedUserIds.Contains(r.UserId))
            .ToListAsync();

        var byUserId = new Dictionary<Guid, ResidentDto>();
        foreach (var r in residents)
        {
            if (r.UserId != Guid.Empty && !byUserId.ContainsKey(r.UserId))
                byUserId[r.UserId] = MapToDto(r);
        }
        var orderedItems = pagedUserIds.Where(byUserId.ContainsKey).Select(uid => byUserId[uid]).ToList();

        return new PagedResultDto<ResidentDto>
        {
            Items = orderedItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ResidentDto?> CreateAsync(CreateResidentDto dto)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
        if (!userExists)
            return null;

        var alreadyResident = await _context.Residents.AnyAsync(r => r.UserId == dto.UserId);
        if (alreadyResident)
            return null;

        if (dto.CommunityId.HasValue)
        {
            var communityExists = await _context.Communities.AnyAsync(c => c.Id == dto.CommunityId.Value);
            if (!communityExists)
                return null;
        }

        var resident = new Resident
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            CommunityId = dto.CommunityId,
            FullName = dto.FullName.Trim(),
            Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim(),
            Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim(),
            Number = string.IsNullOrWhiteSpace(dto.Number) ? null : dto.Number.Trim(),
            Address = dto.Address.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        _context.Residents.Add(resident);
        await _context.SaveChangesAsync();

        await _context.Entry(resident)
            .Reference(r => r.User)
            .LoadAsync();
        await _context.Entry(resident)
            .Reference(r => r.Community)
            .LoadAsync();

        return MapToDto(resident);
    }

    public async Task<ResidentDto?> UpdateAsync(Guid id, UpdateResidentDto dto)
    {
        var resident = await _context.Residents
            .Include(r => r.User)
            .Include(r => r.Community)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (resident == null)
            return null;

        if (dto.CommunityId.HasValue)
        {
            var communityExists = await _context.Communities.AnyAsync(c => c.Id == dto.CommunityId.Value);
            if (!communityExists)
                return null;
        }

        if (dto.FullName != null)
            resident.FullName = dto.FullName.Trim();
        if (dto.Email != null)
            resident.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
        if (dto.Phone != null)
            resident.Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
        if (dto.Number != null)
            resident.Number = string.IsNullOrWhiteSpace(dto.Number) ? null : dto.Number.Trim();
        if (dto.Address != null)
            resident.Address = dto.Address.Trim();
        if (dto.CommunityId.HasValue)
            resident.CommunityId = dto.CommunityId;

        await _context.SaveChangesAsync();
        return MapToDto(resident);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var resident = await _context.Residents.FindAsync(id);
        if (resident == null)
            return false;
        _context.Residents.Remove(resident);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ResidentDto MapToDto(Resident r)
    {
        return new ResidentDto
        {
            Id = r.Id,
            UserId = r.UserId,
            CommunityId = r.CommunityId,
            FullName = r.FullName,
            Email = r.Email,
            Phone = r.Phone,
            Number = r.Number,
            Address = r.Address,
            CommunityIds = r.CommunityId.HasValue ? new List<Guid> { r.CommunityId.Value } : new List<Guid>(),
            CreatedAt = r.CreatedAt.ToString("O")
        };
    }
}
