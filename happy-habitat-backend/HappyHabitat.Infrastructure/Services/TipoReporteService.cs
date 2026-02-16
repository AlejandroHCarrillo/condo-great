using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class TipoReporteService : ITipoReporteService
{
    private readonly ApplicationDbContext _context;

    public TipoReporteService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TipoReporteDto>> GetAllAsync()
    {
        var list = await _context.TiposReporte.OrderBy(t => t.Tipo).ToListAsync();
        return list.Select(t => new TipoReporteDto { Id = t.Id, Tipo = t.Tipo });
    }

    public async Task<TipoReporteDto?> GetByIdAsync(int id)
    {
        var item = await _context.TiposReporte.FindAsync(id);
        return item == null ? null : new TipoReporteDto { Id = item.Id, Tipo = item.Tipo };
    }
}
