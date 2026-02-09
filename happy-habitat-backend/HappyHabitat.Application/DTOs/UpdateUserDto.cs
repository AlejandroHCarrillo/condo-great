using System.ComponentModel.DataAnnotations;

namespace HappyHabitat.Application.DTOs;

public class UpdateUserDto
{
    // Backward compatibility - if provided, will be added to RoleIds
    public Guid? RoleId { get; set; }
    
    // Multiple roles support - at least one role is required
    [Required(ErrorMessage = "At least one role is required")]
    public List<Guid> RoleIds { get; set; } = new List<Guid>();

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

    public bool IsActive { get; set; }
    
    // Resident information
    public ResidentUpdateDto? ResidentInfo { get; set; }
    
    // Community IDs (for roles that need communities - RESIDENT, COMITEE_MEMBER, VIGILANCE)
    public List<Guid> CommunityIds { get; set; } = new List<Guid>();
    
    // User Community IDs (for any user role)
    public List<Guid> UserCommunityIds { get; set; } = new List<Guid>();
}

public class ResidentUpdateDto
{
    public string FullName { get; set; } = string.Empty;
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? Phone { get; set; }
    
    public string? Number { get; set; }
    
    public string Address { get; set; } = string.Empty;
}

