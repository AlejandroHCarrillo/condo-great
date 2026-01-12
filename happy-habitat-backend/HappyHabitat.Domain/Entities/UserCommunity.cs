namespace HappyHabitat.Domain.Entities;

public class UserCommunity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CommunityId { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Community Community { get; set; } = null!;
}

