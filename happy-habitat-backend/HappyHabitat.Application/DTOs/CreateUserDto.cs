using System.ComponentModel.DataAnnotations;

namespace HappyHabitat.Application.DTOs;

public class CreateUserDto
{
    [Required]
    public Guid RoleId { get; set; }

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [StringLength(15, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(20, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    
    // Resident information
    public ResidentCreateDto? ResidentInfo { get; set; }
    
    // Community IDs (for roles that need communities - RESIDENT, COMITEE_MEMBER, VIGILANCE)
    public List<Guid> CommunityIds { get; set; } = new List<Guid>();
    
    // User Community IDs (for any user role)
    public List<Guid> UserCommunityIds { get; set; } = new List<Guid>();
}

public class ResidentCreateDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? Phone { get; set; }
    
    public string? Number { get; set; }
    
    [Required]
    public string Address { get; set; } = string.Empty;
}

