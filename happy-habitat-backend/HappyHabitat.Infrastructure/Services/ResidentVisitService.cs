using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class ResidentVisitService : IResidentVisitService
{
    private readonly ApplicationDbContext _context;

    public ResidentVisitService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ResidentVisitDto>> GetAllVisitsAsync()
    {
        var visits = await _context.ResidentVisits
            .Include(v => v.Resident)
            .ToListAsync();

        return visits.Select(v => new ResidentVisitDto
        {
            Id = v.Id,
            ResidentId = v.ResidentId,
            ResidentName = v.Resident.FullName,
            VisitorName = v.VisitorName,
            TotalPeople = v.TotalPeople,
            VehicleColor = v.VehicleColor,
            LicensePlate = v.LicensePlate,
            Subject = v.Subject,
            ArrivalDate = v.ArrivalDate,
            DepartureDate = v.DepartureDate,
            CreatedAt = v.CreatedAt
        });
    }

    public async Task<ResidentVisitDto?> GetVisitByIdAsync(Guid id)
    {
        var visit = await _context.ResidentVisits
            .Include(v => v.Resident)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (visit == null)
            return null;

        return new ResidentVisitDto
        {
            Id = visit.Id,
            ResidentId = visit.ResidentId,
            ResidentName = visit.Resident.FullName,
            VisitorName = visit.VisitorName,
            TotalPeople = visit.TotalPeople,
            VehicleColor = visit.VehicleColor,
            LicensePlate = visit.LicensePlate,
            Subject = visit.Subject,
            ArrivalDate = visit.ArrivalDate,
            DepartureDate = visit.DepartureDate,
            CreatedAt = visit.CreatedAt
        };
    }

    public async Task<IEnumerable<ResidentVisitDto>> GetVisitsByResidentIdAsync(Guid residentId)
    {
        var visits = await _context.ResidentVisits
            .Include(v => v.Resident)
            .Where(v => v.ResidentId == residentId)
            .ToListAsync();

        return visits.Select(v => new ResidentVisitDto
        {
            Id = v.Id,
            ResidentId = v.ResidentId,
            ResidentName = v.Resident.FullName,
            VisitorName = v.VisitorName,
            TotalPeople = v.TotalPeople,
            VehicleColor = v.VehicleColor,
            LicensePlate = v.LicensePlate,
            Subject = v.Subject,
            ArrivalDate = v.ArrivalDate,
            DepartureDate = v.DepartureDate,
            CreatedAt = v.CreatedAt
        });
    }

    public async Task<ResidentVisitDto> CreateVisitAsync(CreateResidentVisitDto createVisitDto)
    {
        // Verify resident exists
        var resident = await _context.Residents.FindAsync(createVisitDto.ResidentId);
        if (resident == null)
            throw new InvalidOperationException("Resident not found");

        var visit = new ResidentVisit
        {
            Id = Guid.NewGuid(),
            ResidentId = createVisitDto.ResidentId,
            VisitorName = createVisitDto.VisitorName,
            TotalPeople = createVisitDto.TotalPeople,
            VehicleColor = createVisitDto.VehicleColor,
            LicensePlate = createVisitDto.LicensePlate,
            Subject = createVisitDto.Subject,
            ArrivalDate = createVisitDto.ArrivalDate,
            DepartureDate = createVisitDto.DepartureDate,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        _context.ResidentVisits.Add(visit);
        await _context.SaveChangesAsync();

        return new ResidentVisitDto
        {
            Id = visit.Id,
            ResidentId = visit.ResidentId,
            ResidentName = resident.FullName,
            VisitorName = visit.VisitorName,
            TotalPeople = visit.TotalPeople,
            VehicleColor = visit.VehicleColor,
            LicensePlate = visit.LicensePlate,
            Subject = visit.Subject,
            ArrivalDate = visit.ArrivalDate,
            DepartureDate = visit.DepartureDate,
            CreatedAt = visit.CreatedAt
        };
    }

    public async Task<ResidentVisitDto?> UpdateVisitAsync(Guid id, UpdateResidentVisitDto updateVisitDto)
    {
        var visit = await _context.ResidentVisits
            .Include(v => v.Resident)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (visit == null)
            return null;

        // Verify resident exists
        var resident = await _context.Residents.FindAsync(updateVisitDto.ResidentId);
        if (resident == null)
            throw new InvalidOperationException("Resident not found");

        visit.ResidentId = updateVisitDto.ResidentId;
        visit.VisitorName = updateVisitDto.VisitorName;
        visit.TotalPeople = updateVisitDto.TotalPeople;
        visit.VehicleColor = updateVisitDto.VehicleColor;
        visit.LicensePlate = updateVisitDto.LicensePlate;
        visit.Subject = updateVisitDto.Subject;
        visit.ArrivalDate = updateVisitDto.ArrivalDate;
        visit.DepartureDate = updateVisitDto.DepartureDate;

        await _context.SaveChangesAsync();

        return new ResidentVisitDto
        {
            Id = visit.Id,
            ResidentId = visit.ResidentId,
            ResidentName = resident.FullName,
            VisitorName = visit.VisitorName,
            TotalPeople = visit.TotalPeople,
            VehicleColor = visit.VehicleColor,
            LicensePlate = visit.LicensePlate,
            Subject = visit.Subject,
            ArrivalDate = visit.ArrivalDate,
            DepartureDate = visit.DepartureDate,
            CreatedAt = visit.CreatedAt
        };
    }

    public async Task<bool> DeleteVisitAsync(Guid id)
    {
        var visit = await _context.ResidentVisits.FindAsync(id);
        if (visit == null)
            return false;

        _context.ResidentVisits.Remove(visit);
        await _context.SaveChangesAsync();
        return true;
    }
}

