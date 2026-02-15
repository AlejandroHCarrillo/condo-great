using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class ChargesService : IChargesService
{
    private readonly ApplicationDbContext _context;

    public ChargesService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<StatementDto> GetStatementByContratoIdAsync(Guid contratoId)
    {
        // Obtener todos los contratos relacionados (puede haber múltiples contratos)
        var contratos = await _context.Contratos
            .Where(c => c.Id == contratoId && c.IsActive)
            .Select(c => c.Id)
            .ToListAsync();

        if (!contratos.Any())
        {
            return new StatementDto { Cargos = new List<CargoComunidadDto>(), Pagos = new List<PagoComunidadDto>() };
        }

        // Obtener cargos de todos los contratos relacionados
        var cargos = await _context.CargosComunidad
            .Where(c => contratos.Contains(c.ContratoId) && c.IsActive)
            .OrderBy(c => c.FechaDePago)
            .ToListAsync();

        // Obtener IDs de cargos
        var cargoIds = cargos.Select(c => c.Id).ToList();

        // Obtener pagos relacionados a estos cargos
        var pagoCargos = await _context.PagoCargoComunidad
            .Where(pc => cargoIds.Contains(pc.CargosComunidadId))
            .Include(pc => pc.PagoComunidad)
            .ToListAsync();

        var pagoIds = pagoCargos.Select(pc => pc.PagoComunidadId).Distinct().ToList();

        var pagos = await _context.PagoComunidad
            .Where(p => pagoIds.Contains(p.Id) && p.IsActive)
            .Include(p => p.PagoCargos)
            .OrderBy(p => p.FechaDePago)
            .ToListAsync();

        return new StatementDto
        {
            Cargos = cargos.Select(MapToCargoComunidadDto).ToList(),
            Pagos = pagos.Select(p => MapToPagoComunidadDto(p, pagoCargos.Where(pc => pc.PagoComunidadId == p.Id).ToList())).ToList()
        };
    }

    public async Task<StatementDto> GetStatementByComunidadIdAsync(Guid comunidadId)
    {
        // Obtener cargos de la comunidad
        var cargos = await _context.CargosComunidad
            .Where(c => c.ComunidadId == comunidadId && c.IsActive)
            .OrderBy(c => c.FechaDePago)
            .ToListAsync();

        // Obtener IDs de cargos
        var cargoIds = cargos.Select(c => c.Id).ToList();

        // Obtener pagos relacionados a estos cargos
        var pagoCargos = await _context.PagoCargoComunidad
            .Where(pc => cargoIds.Contains(pc.CargosComunidadId))
            .Include(pc => pc.PagoComunidad)
            .ToListAsync();

        var pagoIds = pagoCargos.Select(pc => pc.PagoComunidadId).Distinct().ToList();

        var pagos = await _context.PagoComunidad
            .Where(p => pagoIds.Contains(p.Id) && p.IsActive)
            .Include(p => p.PagoCargos)
            .OrderBy(p => p.FechaDePago)
            .ToListAsync();

        return new StatementDto
        {
            Cargos = cargos.Select(MapToCargoComunidadDto).ToList(),
            Pagos = pagos.Select(p => MapToPagoComunidadDto(p, pagoCargos.Where(pc => pc.PagoComunidadId == p.Id).ToList())).ToList()
        };
    }

    public async Task<IEnumerable<CargoComunidadDto>> GetCargosByComunidadIdAsync(Guid comunidadId)
    {
        var cargos = await _context.CargosComunidad
            .Where(c => c.ComunidadId == comunidadId && c.IsActive)
            .OrderBy(c => c.FechaDePago)
            .ToListAsync();

        return cargos.Select(MapToCargoComunidadDto);
    }

    public async Task<IEnumerable<CargoComunidadDto>> GetCargosByContratoIdAsync(Guid contratoId)
    {
        var cargos = await _context.CargosComunidad
            .Where(c => c.ContratoId == contratoId && c.IsActive)
            .OrderBy(c => c.FechaDePago)
            .ToListAsync();

        return cargos.Select(MapToCargoComunidadDto);
    }

    private static CargoComunidadDto MapToCargoComunidadDto(CargosComunidad cargo)
    {
        return new CargoComunidadDto
        {
            Id = cargo.Id.ToString(),
            ContratoId = cargo.ContratoId.ToString(),
            ComunidadId = cargo.ComunidadId.ToString(),
            MontoCargo = cargo.MontoCargo,
            FechaDePago = cargo.FechaDePago,
            MontoRecargos = cargo.MontoRecargos,
            Estatus = cargo.Estatus,
            Notas = cargo.Notas,
            IsActive = cargo.IsActive,
            CreatedAt = cargo.CreatedAt.ToString("O"),
            UpdatedAt = cargo.UpdatedAt?.ToString("O")
        };
    }

    private static PagoComunidadDto MapToPagoComunidadDto(PagoComunidad pago, List<PagoCargoComunidad> pagoCargos)
    {
        return new PagoComunidadDto
        {
            Id = pago.Id.ToString(),
            MontoPago = pago.MontoPago,
            FormaDePago = pago.FormaDePago,
            FechaDePago = pago.FechaDePago,
            IsActive = pago.IsActive,
            CreatedAt = pago.CreatedAt.ToString("O"),
            UpdatedAt = pago.UpdatedAt?.ToString("O"),
            UpdatedByUserId = pago.UpdatedByUserId?.ToString(),
            PagoCargos = pagoCargos.Select(pc => new PagoCargoComunidadDto
            {
                Id = pc.Id.ToString(),
                PagoComunidadId = pc.PagoComunidadId.ToString(),
                CargosComunidadId = pc.CargosComunidadId.ToString(),
                MontoAplicado = pc.MontoAplicado,
                CreatedAt = pc.CreatedAt.ToString("O")
            }).ToList()
        };
    }
}
