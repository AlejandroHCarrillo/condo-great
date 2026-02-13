namespace HappyHabitat.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    // RoleId is kept for backward compatibility but will be deprecated
    // Use UserRoles collection instead
    public Guid? RoleId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string CreatedAt { get; set; } = string.Empty;
    
    // Navigation properties
    public Role? Role { get; set; } // Kept for backward compatibility
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public Resident? Resident { get; set; }
    public ICollection<UserCommunity> UserCommunities { get; set; } = new List<UserCommunity>();
    public ICollection<Contrato> UpdatedContratos { get; set; } = new List<Contrato>();
    public ICollection<PaymentHistory> UpdatedPaymentHistories { get; set; } = new List<PaymentHistory>();
    public ICollection<CommunityProvider> CreatedByCommunityProviders { get; set; } = new List<CommunityProvider>();
    public ICollection<CommunityProvider> UpdatedByCommunityProviders { get; set; } = new List<CommunityProvider>();
}

