using System.ComponentModel.DataAnnotations;

namespace HappyHabitat.Application.DTOs;

public class RefreshTokenDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

