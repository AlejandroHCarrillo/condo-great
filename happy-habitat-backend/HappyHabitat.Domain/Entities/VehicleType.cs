namespace HappyHabitat.Domain.Entities;

public class VehicleType
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    // Navigation property
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}

