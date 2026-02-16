using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IStatusTicketService
{
    Task<IEnumerable<StatusTicketDto>> GetAllAsync();
    Task<StatusTicketDto?> GetByIdAsync(int id);
}
