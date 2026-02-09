namespace HappyHabitat.Domain.Entities;

public class Role
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    // Navigation properties
    public ICollection<User> Users { get; set; } = new List<User>(); // Kept for backward compatibility
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

