using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class ContratoService : IContratoService
{
    private readonly ApplicationDbContext _context;

    public ContratoService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ContratoDto>> GetAllContratosAsync(bool includeInactive = false)
    {
        var query = _context.Contratos
            .Include(c => c.PaymentHistories)
            .AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }
        
        var contratos = await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return contratos.Select(c => MapToContratoDto(c));
    }

    public async Task<IEnumerable<ContratoDto>> GetContratosByCommunityIdAsync(Guid communityId, bool includeInactive = false)
    {
        var query = _context.Contratos
            .Include(c => c.PaymentHistories)
            .Where(c => c.CommunityId == communityId)
            .AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }
        
        var contratos = await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return contratos.Select(c => MapToContratoDto(c));
    }

    public async Task<ContratoDto?> GetContratoByIdAsync(Guid id, bool includeInactive = false)
    {
        var query = _context.Contratos
            .Include(c => c.PaymentHistories)
            .AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }
        
        var contrato = await query
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contrato == null)
            return null;

        return MapToContratoDto(contrato);
    }

    public async Task<ContratoDto> CreateContratoAsync(CreateContratoDto createContratoDto, Guid? updatedByUserId = null)
    {
        var contrato = new Contrato
        {
            Id = Guid.NewGuid(),
            CommunityId = Guid.Parse(createContratoDto.CommunityId),
            TipoContrato = createContratoDto.TipoContrato,
            FolioContrato = createContratoDto.FolioContrato,
            RepresentanteComunidad = createContratoDto.RepresentanteComunidad,
            CostoTotal = createContratoDto.CostoTotal,
            MontoPagoParcial = createContratoDto.MontoPagoParcial,
            NumeroPagosParciales = createContratoDto.NumeroPagosParciales,
            DiaPago = createContratoDto.DiaPago,
            PeriodicidadPago = createContratoDto.PeriodicidadPago,
            MetodoPago = createContratoDto.MetodoPago,
            FechaFirma = createContratoDto.FechaFirma,
            FechaInicio = createContratoDto.FechaInicio,
            FechaFin = createContratoDto.FechaFin,
            NumeroCasas = createContratoDto.NumeroCasas,
            EstadoContrato = createContratoDto.EstadoContrato,
            AsesorVentas = createContratoDto.AsesorVentas,
            Notas = createContratoDto.Notas,
            DocumentosAdjuntos = createContratoDto.DocumentosAdjuntos,
            UpdatedByUserId = updatedByUserId,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        _context.Contratos.Add(contrato);
        await _context.SaveChangesAsync();

        return MapToContratoDto(contrato);
    }

    public async Task<ContratoDto?> UpdateContratoAsync(Guid id, UpdateContratoDto updateContratoDto, Guid? updatedByUserId = null)
    {
        var contrato = await _context.Contratos.FindAsync(id);

        if (contrato == null)
            return null;

        // Actualizar todas las propiedades
        contrato.TipoContrato = updateContratoDto.TipoContrato;
        contrato.FolioContrato = updateContratoDto.FolioContrato;
        contrato.RepresentanteComunidad = updateContratoDto.RepresentanteComunidad;
        contrato.CostoTotal = updateContratoDto.CostoTotal;
        contrato.MontoPagoParcial = updateContratoDto.MontoPagoParcial;
        contrato.NumeroPagosParciales = updateContratoDto.NumeroPagosParciales;
        contrato.DiaPago = updateContratoDto.DiaPago;
        contrato.PeriodicidadPago = updateContratoDto.PeriodicidadPago;
        contrato.MetodoPago = updateContratoDto.MetodoPago;
        contrato.FechaFirma = updateContratoDto.FechaFirma;
        contrato.FechaInicio = updateContratoDto.FechaInicio;
        contrato.FechaFin = updateContratoDto.FechaFin;
        contrato.NumeroCasas = updateContratoDto.NumeroCasas;
        contrato.EstadoContrato = updateContratoDto.EstadoContrato;
        contrato.AsesorVentas = updateContratoDto.AsesorVentas;
        contrato.Notas = updateContratoDto.Notas;
        contrato.DocumentosAdjuntos = updateContratoDto.DocumentosAdjuntos;
        contrato.UpdatedByUserId = updatedByUserId;
        contrato.UpdatedAt = DateTime.UtcNow.ToString("O");

        // Marcar la entidad como modificada explícitamente
        _context.Entry(contrato).State = EntityState.Modified;

        // Guardar los cambios
        var saved = await _context.SaveChangesAsync();
        
        if (saved == 0)
        {
            throw new InvalidOperationException("No se pudieron guardar los cambios en el contrato");
        }

        // Recargar con relaciones
        await _context.Entry(contrato)
            .Collection(c => c.PaymentHistories)
            .LoadAsync();

        return MapToContratoDto(contrato);
    }

    public async Task<bool> DeleteContratoAsync(Guid id)
    {
        var contrato = await _context.Contratos.FindAsync(id);
        if (contrato == null)
            return false;

        // Eliminación lógica: cambiar IsActive a false
        contrato.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    private ContratoDto MapToContratoDto(Contrato contrato)
    {
        return new ContratoDto
        {
            Id = contrato.Id.ToString(),
            CommunityId = contrato.CommunityId.ToString(),
            TipoContrato = contrato.TipoContrato,
            FolioContrato = contrato.FolioContrato,
            RepresentanteComunidad = contrato.RepresentanteComunidad,
            CostoTotal = contrato.CostoTotal,
            MontoPagoParcial = contrato.MontoPagoParcial,
            NumeroPagosParciales = contrato.NumeroPagosParciales,
            DiaPago = contrato.DiaPago,
            PeriodicidadPago = contrato.PeriodicidadPago,
            MetodoPago = contrato.MetodoPago,
            FechaFirma = contrato.FechaFirma,
            FechaInicio = contrato.FechaInicio,
            FechaFin = contrato.FechaFin,
            NumeroCasas = contrato.NumeroCasas,
            EstadoContrato = contrato.EstadoContrato,
            AsesorVentas = contrato.AsesorVentas,
            Notas = contrato.Notas,
            DocumentosAdjuntos = contrato.DocumentosAdjuntos,
            PaymentHistories = contrato.PaymentHistories?
                .Where(ph => ph.IsActive)
                .Select(ph => new PaymentHistoryDto
                {
                    Id = ph.Id.ToString(),
                    ContratoId = ph.ContratoId.ToString(),
                    Monto = ph.Monto,
                    FechaPago = ph.FechaPago,
                    MetodoPago = ph.MetodoPago,
                    ReferenciaPago = ph.ReferenciaPago,
                    EstadoPago = ph.EstadoPago,
                    Notas = ph.Notas,
                    CreatedAt = ph.CreatedAt,
                    UpdatedAt = ph.UpdatedAt,
                    UpdatedByUserId = ph.UpdatedByUserId?.ToString()
                })
                .ToList(),
            CreatedAt = contrato.CreatedAt,
            UpdatedAt = contrato.UpdatedAt,
            UpdatedByUserId = contrato.UpdatedByUserId?.ToString()
        };
    }
}


