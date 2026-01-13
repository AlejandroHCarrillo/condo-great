using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IPaymentHistoryService
{
    Task<IEnumerable<PaymentHistoryDto>> GetAllPaymentHistoriesAsync(bool includeInactive = false);
    Task<IEnumerable<PaymentHistoryDto>> GetPaymentHistoriesByContratoIdAsync(Guid contratoId, bool includeInactive = false);
    Task<PaymentHistoryDto?> GetPaymentHistoryByIdAsync(Guid id, bool includeInactive = false);
    Task<PaymentHistoryDto> CreatePaymentHistoryAsync(CreatePaymentHistoryDto createPaymentHistoryDto, Guid? updatedByUserId = null);
    Task<PaymentHistoryDto?> UpdatePaymentHistoryAsync(Guid id, UpdatePaymentHistoryDto updatePaymentHistoryDto, Guid? updatedByUserId = null);
    Task<bool> DeletePaymentHistoryAsync(Guid id);
}


