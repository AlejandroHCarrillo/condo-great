using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class CategoriaTicketService : ICategoriaTicketService
{
    private readonly ApplicationDbContext _context;

    public CategoriaTicketService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoriaTicketDto>> GetAllAsync()
    {
        var list = await _context.CategoriasTicket.OrderBy(c => c.Categoria).ToListAsync();
        return list.Select(c => new CategoriaTicketDto { Id = c.Id, Categoria = c.Categoria });
    }

    public async Task<CategoriaTicketDto?> GetByIdAsync(int id)
    {
        var item = await _context.CategoriasTicket.FindAsync(id);
        return item == null ? null : new CategoriaTicketDto { Id = item.Id, Categoria = item.Categoria };
    }
}
