namespace HappyHabitat.Domain.Entities;

public class UserCommunity : AuditBase
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CommunityId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Community Community { get; set; } = null!;
}

