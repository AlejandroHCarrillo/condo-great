namespace HappyHabitat.Application.DTOs;

public class UserDto
{
    public Guid Id { get; set; }
    // Backward compatibility - will be the first role or null
    public Guid? RoleId { get; set; }
    public string? RoleCode { get; set; }
    // Multiple roles support
    public List<RoleDto> Roles { get; set; } = new List<RoleDto>();
    public List<Guid> RoleIds { get; set; } = new List<Guid>();
    public List<string> RoleCodes { get; set; } = new List<string>();
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    
    // Resident information
    public ResidentInfoDto? ResidentInfo { get; set; }
    
    // User Communities (for any user role)
    public List<Guid> UserCommunityIds { get; set; } = new List<Guid>();
}

public class RoleDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class ResidentInfoDto
{
    public Guid? Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Number { get; set; }
    public string Address { get; set; } = string.Empty;
    public Guid? CommunityId { get; set; }
    public List<Guid> CommunityIds { get; set; } = new List<Guid>(); // For compatibility with frontend
}

