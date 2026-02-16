using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class TicketService : ITicketService
{
    private readonly ApplicationDbContext _context;

    public TicketService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static TicketDto MapToDto(Ticket t)
    {
        return new TicketDto
        {
            Id = t.Id,
            CommunityId = t.CommunityId,
            CommunityName = t.Community?.Nombre,
            ResidentId = t.ResidentId,
            ResidentName = t.Resident?.FullName,
            TipoReporteId = t.TipoReporteId,
            TipoReporteNombre = t.TipoReporte?.Tipo,
            StatusId = t.StatusId,
            StatusCode = t.StatusTicket?.Code,
            StatusDescripcion = t.StatusTicket?.Descripcion,
            FechaReporte = t.FechaReporte,
            CreatedAt = t.CreatedAt.ToString("O"),
            UpdatedAt = t.UpdatedAt?.ToString("O")
        };
    }

    public async Task<IEnumerable<TicketDto>> GetAllAsync()
    {
        var list = await _context.Tickets
            .Include(t => t.Community)
            .Include(t => t.Resident)
            .Include(t => t.TipoReporte)
            .Include(t => t.StatusTicket)
            .OrderByDescending(t => t.FechaReporte)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<TicketDto>> GetByCommunityIdAsync(Guid communityId)
    {
        var list = await _context.Tickets
            .Include(t => t.Community)
            .Include(t => t.Resident)
            .Include(t => t.TipoReporte)
            .Include(t => t.StatusTicket)
            .Where(t => t.CommunityId == communityId)
            .OrderByDescending(t => t.FechaReporte)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<TicketDto>> GetByResidentIdAsync(Guid residentId)
    {
        var list = await _context.Tickets
            .Include(t => t.Community)
            .Include(t => t.Resident)
            .Include(t => t.TipoReporte)
            .Include(t => t.StatusTicket)
            .Where(t => t.ResidentId == residentId)
            .OrderByDescending(t => t.FechaReporte)
            .ToListAsync();
        return list.Select(MapToDto);
    }

    public async Task<TicketDto?> GetByIdAsync(int id)
    {
        var item = await _context.Tickets
            .Include(t => t.Community)
            .Include(t => t.Resident)
            .Include(t => t.TipoReporte)
            .Include(t => t.StatusTicket)
            .FirstOrDefaultAsync(t => t.Id == id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<TicketDto> CreateAsync(Guid residentId, CreateTicketDto dto)
    {
        var resident = await _context.Residents
            .Include(r => r.Community)
            .FirstOrDefaultAsync(r => r.Id == residentId);
        if (resident == null)
            throw new InvalidOperationException("Residente no encontrado.");
        if (resident.CommunityId == null)
            throw new InvalidOperationException("El residente no tiene una comunidad asignada.");

        var tipoReporte = await _context.TiposReporte.FindAsync(dto.TipoReporteId);
        if (tipoReporte == null)
            throw new InvalidOperationException("Tipo de reporte no válido.");

        var statusNuevo = await _context.StatusTickets.FirstOrDefaultAsync(s => s.Code == "Nuevo");
        var statusId = statusNuevo?.Id ?? 1;

        var ticket = new Ticket
        {
            CommunityId = resident.CommunityId.Value,
            ResidentId = residentId,
            TipoReporteId = dto.TipoReporteId,
            StatusId = statusId,
            FechaReporte = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        await _context.Entry(ticket).Reference(t => t.Community).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.Resident).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.TipoReporte).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.StatusTicket).LoadAsync();
        return MapToDto(ticket);
    }

    public async Task<TicketDto?> UpdateAsync(int id, UpdateTicketDto dto)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Community)
            .Include(t => t.Resident)
            .Include(t => t.TipoReporte)
            .Include(t => t.StatusTicket)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (ticket == null)
            return null;

        if (dto.StatusId.HasValue)
        {
            var status = await _context.StatusTickets.FindAsync(dto.StatusId.Value);
            if (status != null)
                ticket.StatusId = dto.StatusId.Value;
        }
        ticket.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapToDto(ticket);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            return false;
        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
        return true;
    }
}
