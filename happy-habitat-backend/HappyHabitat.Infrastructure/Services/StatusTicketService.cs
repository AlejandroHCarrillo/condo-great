using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class StatusTicketService : IStatusTicketService
{
    private readonly ApplicationDbContext _context;

    public StatusTicketService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StatusTicketDto>> GetAllAsync()
    {
        var list = await _context.StatusTickets.OrderBy(s => s.Id).ToListAsync();
        return list.Select(s => new StatusTicketDto { Id = s.Id, Code = s.Code, Descripcion = s.Descripcion, Color = s.Color });
    }

    public async Task<StatusTicketDto?> GetByIdAsync(int id)
    {
        var item = await _context.StatusTickets.FindAsync(id);
        return item == null ? null : new StatusTicketDto { Id = item.Id, Code = item.Code, Descripcion = item.Descripcion, Color = item.Color };
    }
}
