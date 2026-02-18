using System.Text.Json;
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
            ResidentNumber = t.Resident?.Number,
            CategoriaTicketId = t.CategoriaTicketId,
            CategoriaTicketNombre = t.CategoriaTicket?.Categoria,
            StatusId = t.StatusId,
            StatusCode = t.StatusTicket?.Code,
            StatusDescripcion = t.StatusTicket?.Descripcion,
            StatusColor = t.StatusTicket?.Color,
            FechaReporte = t.FechaReporte,
            Contenido = t.Contenido,
            ImageUrls = TryParseImageUrlsJson(t.ImageUrlsJson),
            CreatedAt = t.CreatedAt.ToString("O"),
            UpdatedAt = t.UpdatedAt?.ToString("O")
        };
    }

    private static List<string>? TryParseImageUrlsJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            var list = JsonSerializer.Deserialize<List<string>>(json);
            return list?.Count > 0 ? list : null;
        }
        catch { return null; }
    }

    public async Task<IEnumerable<TicketDto>> GetAllAsync()
    {
        var list = await _context.Tickets
            .Include(t => t.Community)
            .Include(t => t.Resident)
            .Include(t => t.CategoriaTicket)
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
            .Include(t => t.CategoriaTicket)
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
            .Include(t => t.CategoriaTicket)
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
            .Include(t => t.CategoriaTicket)
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

        var categoriaTicket = await _context.CategoriasTicket.FindAsync(dto.CategoriaTicketId);
        if (categoriaTicket == null)
            throw new InvalidOperationException("Categoría de ticket no válida.");

        var statusNuevo = await _context.StatusTickets.FirstOrDefaultAsync(s => s.Code == "Nuevo");
        var statusId = statusNuevo?.Id ?? 1;

        var ticket = new Ticket
        {
            CommunityId = resident.CommunityId.Value,
            ResidentId = residentId,
            CategoriaTicketId = dto.CategoriaTicketId,
            StatusId = statusId,
            FechaReporte = DateTime.UtcNow,
            Contenido = dto.Contenido,
            CreatedAt = DateTime.UtcNow
        };
        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        await _context.Entry(ticket).Reference(t => t.Community).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.Resident).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.CategoriaTicket).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.StatusTicket).LoadAsync();
        return MapToDto(ticket);
    }

    public async Task<TicketDto?> UpdateAsync(int id, UpdateTicketDto dto)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Community)
            .Include(t => t.Resident)
            .Include(t => t.CategoriaTicket)
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
        if (dto.Contenido != null)
            ticket.Contenido = dto.Contenido;
        if (dto.ImageUrls != null)
            ticket.ImageUrlsJson = dto.ImageUrls.Count > 0 ? JsonSerializer.Serialize(dto.ImageUrls) : null;
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
