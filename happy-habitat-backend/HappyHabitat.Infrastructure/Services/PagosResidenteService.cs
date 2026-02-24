using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Domain.Enums;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class PagosResidenteService : IPagosResidenteService
{
    private readonly ApplicationDbContext _context;

    public PagosResidenteService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static string StatusToDisplay(StatusPagoResidente s)
    {
        return s switch
        {
            StatusPagoResidente.PorConfirmar => "PorConfirmar",
            StatusPagoResidente.Aplicado => "Aplicado",
            StatusPagoResidente.Cancelado => "Cancelado",
            _ => s.ToString()
        };
    }

    private static StatusPagoResidente DisplayToStatus(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return StatusPagoResidente.PorConfirmar;
        return s.Trim() switch
        {
            "PorConfirmar" => StatusPagoResidente.PorConfirmar,
            "Aplicado" => StatusPagoResidente.Aplicado,
            "Cancelado" => StatusPagoResidente.Cancelado,
            _ => StatusPagoResidente.PorConfirmar
        };
    }

    private static PagosResidenteDto MapToDto(PagoResidente p)
    {
        var resident = p.Resident;
        return new PagosResidenteDto
        {
            Id = p.Id,
            ResidenteId = p.ResidenteId,
            ResidentName = resident?.FullName,
            ResidentNumber = resident?.Number,
            FechaPago = p.FechaPago,
            Monto = p.Monto,
            Status = StatusToDisplay(p.Status),
            Concepto = p.Concepto,
            UrlComprobante = p.UrlComprobante,
            Nota = p.Nota,
            CreatedAt = p.CreatedAt.ToString("O"),
            UpdatedAt = p.UpdatedAt?.ToString("O"),
            CreatedByUserId = p.CreatedByUserId,
            UpdatedByUserId = p.UpdatedByUserId
        };
    }

    public async Task<IEnumerable<PagosResidenteDto>> GetAllAsync()
    {
        var list = await _context.PagosResidente
            .Include(p => p.Resident)
            .OrderByDescending(p => p.FechaPago)
            .ThenBy(p => p.Resident!.FullName)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<PagosResidenteDto>> GetByResidentIdAsync(Guid residentId)
    {
        var list = await _context.PagosResidente
            .Include(p => p.Resident)
            .Where(p => p.ResidenteId == residentId)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<PagosResidenteDto>> GetByCommunityIdAsync(Guid communityId)
    {
        var list = await _context.PagosResidente
            .Include(p => p.Resident)
            .Where(p => p.Resident != null && p.Resident.CommunityId == communityId)
            .OrderByDescending(p => p.FechaPago)
            .ThenBy(p => p.Resident!.FullName)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<PagosResidenteDto?> GetByIdAsync(Guid id)
    {
        var item = await _context.PagosResidente
            .Include(p => p.Resident)
            .FirstOrDefaultAsync(p => p.Id == id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<PagosResidenteDto> CreateAsync(CreatePagosResidenteDto dto)
    {
        var resident = await _context.Residents.FindAsync(dto.ResidenteId);
        if (resident == null)
            throw new InvalidOperationException("Resident not found");

        var pago = new PagoResidente
        {
            Id = Guid.NewGuid(),
            ResidenteId = dto.ResidenteId,
            Resident = resident,
            FechaPago = dto.FechaPago,
            Monto = dto.Monto,
            Status = DisplayToStatus(dto.Status),
            Concepto = dto.Concepto,
            UrlComprobante = dto.UrlComprobante,
            Nota = dto.Nota,
            CreatedByUserId = dto.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.PagosResidente.Add(pago);
        await _context.SaveChangesAsync();
        await _context.Entry(pago).Reference(p => p.Resident).LoadAsync();
        return MapToDto(pago);
    }

    public async Task<PagosResidenteDto?> UpdateAsync(Guid id, UpdatePagosResidenteDto dto)
    {
        var pago = await _context.PagosResidente
            .Include(p => p.Resident)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (pago == null)
            return null;

        var resident = await _context.Residents.FindAsync(dto.ResidenteId);
        if (resident == null)
            throw new InvalidOperationException("Resident not found");

        pago.ResidenteId = dto.ResidenteId;
        pago.Resident = resident;
        pago.FechaPago = dto.FechaPago;
        pago.Monto = dto.Monto;
        pago.Status = DisplayToStatus(dto.Status);
        pago.Concepto = dto.Concepto;
        pago.UrlComprobante = dto.UrlComprobante;
        pago.Nota = dto.Nota;
        pago.UpdatedByUserId = dto.UpdatedByUserId;
        pago.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _context.Entry(pago).Reference(p => p.Resident).LoadAsync();
        return MapToDto(pago);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var pago = await _context.PagosResidente.FindAsync(id);
        if (pago == null)
            return false;
        _context.PagosResidente.Remove(pago);
        await _context.SaveChangesAsync();
        return true;
    }
}
