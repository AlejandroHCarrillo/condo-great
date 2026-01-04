namespace HappyHabitat.Domain.Entities;

public class Pet
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Species { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Color { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    
    // Navigation property
    public Resident Resident { get; set; } = null!;
}

