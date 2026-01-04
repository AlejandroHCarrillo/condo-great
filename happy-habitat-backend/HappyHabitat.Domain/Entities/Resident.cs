namespace HappyHabitat.Domain.Entities;

public class Resident
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? CommunityId { get; set; } // Foreign key to Community
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Number { get; set; }
    public string Address { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Community? Community { get; set; } // Navigation property to Community
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    public ICollection<ResidentVisit> Visits { get; set; } = new List<ResidentVisit>();
}

