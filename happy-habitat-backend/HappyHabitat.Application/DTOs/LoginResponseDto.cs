namespace HappyHabitat.Application.DTOs;

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string ExpiresAt { get; set; } = string.Empty; // ISO date string
    public LoginResidentInfoDto? ResidentInfo { get; set; }
}

public class LoginResidentInfoDto
{
    public string? Id { get; set; }
    public string Fullname { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Number { get; set; }
    public string Address { get; set; } = string.Empty;
    public string[]? Comunidades { get; set; }
    public CommunityDto? Comunidad { get; set; } // Full community information
}

