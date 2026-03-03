namespace HappyHabitat.Domain.Entities;

public class User : AuditBase
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

    // Navigation properties
    public Role? Role { get; set; } // Kept for backward compatibility
    public ICollection<UserRole> UserRoles { get; set; } = [];
    public Resident? Resident { get; set; }
    public ICollection<UserCommunity> UserCommunities { get; set; } = [];
    public ICollection<Contrato> UpdatedContratos { get; set; } = [];
    public ICollection<PaymentHistory> UpdatedPaymentHistories { get; set; } = [];
    public ICollection<CommunityProvider> CreatedByCommunityProviders { get; set; } = [];
    public ICollection<CommunityProvider> UpdatedByCommunityProviders { get; set; } = [];
    public ICollection<ProveedorServicio> CreatedByProveedorServicios { get; set; } = [];
    public ICollection<ProveedorServicio> UpdatedByProveedorServicios { get; set; } = [];
}

