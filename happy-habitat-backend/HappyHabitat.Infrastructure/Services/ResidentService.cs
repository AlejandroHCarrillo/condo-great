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
            .ToListAsync();
        return residents.Select(MapToDto);
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
            .ToListAsync();
        return residents.Select(MapToDto);
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
            CreatedAt = r.CreatedAt
        };
    }
}
