namespace HappyHabitat.Domain.Entities;

public class Role
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    // Navigation property
    public ICollection<User> Users { get; set; } = new List<User>();
}

