using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface ICategoriaTicketService
{
    Task<IEnumerable<CategoriaTicketDto>> GetAllAsync();
    Task<CategoriaTicketDto?> GetByIdAsync(int id);
}
