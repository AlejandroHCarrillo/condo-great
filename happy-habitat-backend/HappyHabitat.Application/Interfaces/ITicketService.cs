using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface ITicketService
{
    Task<IEnumerable<TicketDto>> GetAllAsync();
    Task<IEnumerable<TicketDto>> GetByCommunityIdAsync(Guid communityId);
    Task<IEnumerable<TicketDto>> GetByResidentIdAsync(Guid residentId);
    Task<TicketDto?> GetByIdAsync(int id);
    Task<TicketDto> CreateAsync(Guid residentId, CreateTicketDto dto);
    Task<TicketDto?> UpdateAsync(int id, UpdateTicketDto dto);
    Task<bool> DeleteAsync(int id);
}
