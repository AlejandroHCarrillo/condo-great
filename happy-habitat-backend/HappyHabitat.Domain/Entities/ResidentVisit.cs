namespace HappyHabitat.Domain.Entities;

public class ResidentVisit : AuditBase
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public string VisitorName { get; set; } = string.Empty;
    public int TotalPeople { get; set; }
    public string? VehicleColor { get; set; }
    public string? LicensePlate { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string ArrivalDate { get; set; } = string.Empty; // ISO date string
    public string? DepartureDate { get; set; } // ISO date string
    public bool IsActive { get; set; } = true;

    // Navigation property
    public Resident Resident { get; set; } = null!;
}

