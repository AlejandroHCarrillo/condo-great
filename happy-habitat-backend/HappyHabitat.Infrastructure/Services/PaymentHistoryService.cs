using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class PaymentHistoryService : IPaymentHistoryService
{
    private readonly ApplicationDbContext _context;

    public PaymentHistoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PaymentHistoryDto>> GetAllPaymentHistoriesAsync(bool includeInactive = false)
    {
        var query = _context.PaymentHistories.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(ph => ph.IsActive);
        }
        
        var paymentHistories = await query
            .OrderByDescending(ph => ph.FechaPago)
            .ToListAsync();

        return paymentHistories.Select(ph => MapToPaymentHistoryDto(ph));
    }

    public async Task<IEnumerable<PaymentHistoryDto>> GetPaymentHistoriesByContratoIdAsync(Guid contratoId, bool includeInactive = false)
    {
        var query = _context.PaymentHistories
            .Where(ph => ph.ContratoId == contratoId)
            .AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(ph => ph.IsActive);
        }
        
        var paymentHistories = await query
            .OrderByDescending(ph => ph.FechaPago)
            .ToListAsync();

        return paymentHistories.Select(ph => MapToPaymentHistoryDto(ph));
    }

    public async Task<PaymentHistoryDto?> GetPaymentHistoryByIdAsync(Guid id, bool includeInactive = false)
    {
        var query = _context.PaymentHistories.AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(ph => ph.IsActive);
        }
        
        var paymentHistory = await query
            .FirstOrDefaultAsync(ph => ph.Id == id);

        if (paymentHistory == null)
            return null;

        return MapToPaymentHistoryDto(paymentHistory);
    }

    public async Task<PaymentHistoryDto> CreatePaymentHistoryAsync(CreatePaymentHistoryDto createPaymentHistoryDto, Guid? updatedByUserId = null)
    {
        var paymentHistory = new PaymentHistory
        {
            Id = Guid.NewGuid(),
            ContratoId = Guid.Parse(createPaymentHistoryDto.ContratoId),
            Monto = createPaymentHistoryDto.Monto,
            FechaPago = createPaymentHistoryDto.FechaPago,
            MetodoPago = createPaymentHistoryDto.MetodoPago,
            ReferenciaPago = createPaymentHistoryDto.ReferenciaPago,
            EstadoPago = createPaymentHistoryDto.EstadoPago,
            Notas = createPaymentHistoryDto.Notas,
            UpdatedByUserId = updatedByUserId,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        _context.PaymentHistories.Add(paymentHistory);
        await _context.SaveChangesAsync();

        return MapToPaymentHistoryDto(paymentHistory);
    }

    public async Task<PaymentHistoryDto?> UpdatePaymentHistoryAsync(Guid id, UpdatePaymentHistoryDto updatePaymentHistoryDto, Guid? updatedByUserId = null)
    {
        var paymentHistory = await _context.PaymentHistories.FindAsync(id);

        if (paymentHistory == null)
            return null;

        // Actualizar todas las propiedades
        paymentHistory.Monto = updatePaymentHistoryDto.Monto;
        paymentHistory.FechaPago = updatePaymentHistoryDto.FechaPago;
        paymentHistory.MetodoPago = updatePaymentHistoryDto.MetodoPago;
        paymentHistory.ReferenciaPago = updatePaymentHistoryDto.ReferenciaPago;
        paymentHistory.EstadoPago = updatePaymentHistoryDto.EstadoPago;
        paymentHistory.Notas = updatePaymentHistoryDto.Notas;
        paymentHistory.UpdatedByUserId = updatedByUserId;
        paymentHistory.UpdatedAt = DateTime.UtcNow.ToString("O");

        // Marcar la entidad como modificada explícitamente
        _context.Entry(paymentHistory).State = EntityState.Modified;

        // Guardar los cambios
        var saved = await _context.SaveChangesAsync();
        
        if (saved == 0)
        {
            throw new InvalidOperationException("No se pudieron guardar los cambios en el historial de pago");
        }

        return MapToPaymentHistoryDto(paymentHistory);
    }

    public async Task<bool> DeletePaymentHistoryAsync(Guid id)
    {
        var paymentHistory = await _context.PaymentHistories.FindAsync(id);
        if (paymentHistory == null)
            return false;

        // Eliminación lógica: cambiar IsActive a false
        paymentHistory.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    private PaymentHistoryDto MapToPaymentHistoryDto(PaymentHistory paymentHistory)
    {
        return new PaymentHistoryDto
        {
            Id = paymentHistory.Id.ToString(),
            ContratoId = paymentHistory.ContratoId.ToString(),
            Monto = paymentHistory.Monto,
            FechaPago = paymentHistory.FechaPago,
            MetodoPago = paymentHistory.MetodoPago,
            ReferenciaPago = paymentHistory.ReferenciaPago,
            EstadoPago = paymentHistory.EstadoPago,
            Notas = paymentHistory.Notas,
            CreatedAt = paymentHistory.CreatedAt,
            UpdatedAt = paymentHistory.UpdatedAt,
            UpdatedByUserId = paymentHistory.UpdatedByUserId?.ToString()
        };
    }
}


