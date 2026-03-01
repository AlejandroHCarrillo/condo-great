using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class SaldoCuentaBancariaService : ISaldoCuentaBancariaService
{
    private readonly ApplicationDbContext _context;

    public SaldoCuentaBancariaService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static SaldoCuentaBancariaDto MapToDto(SaldoCuentaBancaria s)
    {
        return new SaldoCuentaBancariaDto
        {
            Id = s.Id,
            CommunityId = s.CommunityId,
            CommunityName = s.Community?.Nombre,
            Banco = s.Banco,
            Cuenta = s.Cuenta,
            FechaSaldo = s.FechaSaldo,
            Monto = s.Monto,
            CreatedAt = s.CreatedAt.ToString("O"),
            UpdatedAt = s.UpdatedAt?.ToString("O"),
            CreatedByUserId = s.CreatedByUserId,
            UpdatedByUserId = s.UpdatedByUserId
        };
    }

    public async Task<IEnumerable<SaldoCuentaBancariaDto>> GetAllAsync()
    {
        var list = await _context.SaldosCuentaBancaria
            .Include(s => s.Community)
            .OrderBy(s => s.Community!.Nombre)
            .ThenByDescending(s => s.FechaSaldo)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<SaldoCuentaBancariaDto>> GetByCommunityIdAsync(Guid communityId)
    {
        var list = await _context.SaldosCuentaBancaria
            .Include(s => s.Community)
            .Where(s => s.CommunityId == communityId)
            .OrderByDescending(s => s.FechaSaldo)
            .ThenBy(s => s.Banco)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<SaldoCuentaBancariaDto?> GetByIdAsync(int id)
    {
        var item = await _context.SaldosCuentaBancaria
            .Include(s => s.Community)
            .FirstOrDefaultAsync(s => s.Id == id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<SaldoCuentaBancariaDto> CreateAsync(CreateSaldoCuentaBancariaDto dto)
    {
        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        var entity = new SaldoCuentaBancaria
        {
            CommunityId = dto.CommunityId,
            Community = community,
            Banco = dto.Banco.Trim(),
            Cuenta = dto.Cuenta.Trim(),
            FechaSaldo = dto.FechaSaldo,
            Monto = dto.Monto,
            CreatedByUserId = dto.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.SaldosCuentaBancaria.Add(entity);
        await _context.SaveChangesAsync();
        await _context.Entry(entity).Reference(s => s.Community).LoadAsync();
        return MapToDto(entity);
    }

    public async Task<SaldoCuentaBancariaDto?> UpdateAsync(int id, UpdateSaldoCuentaBancariaDto dto)
    {
        var entity = await _context.SaldosCuentaBancaria
            .Include(s => s.Community)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (entity == null)
            return null;

        var community = await _context.Communities.FindAsync(dto.CommunityId);
        if (community == null)
            throw new InvalidOperationException("Community not found");

        entity.CommunityId = dto.CommunityId;
        entity.Community = community;
        entity.Banco = dto.Banco.Trim();
        entity.Cuenta = dto.Cuenta.Trim();
        entity.FechaSaldo = dto.FechaSaldo;
        entity.Monto = dto.Monto;
        entity.UpdatedByUserId = dto.UpdatedByUserId;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _context.Entry(entity).Reference(s => s.Community).LoadAsync();
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.SaldosCuentaBancaria.FindAsync(id);
        if (entity == null)
            return false;
        _context.SaldosCuentaBancaria.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}
