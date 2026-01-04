namespace HappyHabitat.Application.DTOs;

public class VehicleDto
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public string ResidentName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public Guid VehicleTypeId { get; set; }
    public string VehicleTypeName { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Color { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateVehicleDto
{
    public Guid ResidentId { get; set; }
    public string Brand { get; set; } = string.Empty;
    public Guid VehicleTypeId { get; set; }
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Color { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
}

public class UpdateVehicleDto
{
    public Guid ResidentId { get; set; }
    public string Brand { get; set; } = string.Empty;
    public Guid VehicleTypeId { get; set; }
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Color { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
}

