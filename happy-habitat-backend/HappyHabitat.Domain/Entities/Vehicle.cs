namespace HappyHabitat.Domain.Entities;

public class Vehicle : AuditBase
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public Guid VehicleTypeId { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Color { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Resident Resident { get; set; } = null!;
    public VehicleType VehicleType { get; set; } = null!;
}

