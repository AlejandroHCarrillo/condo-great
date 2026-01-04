using System.ComponentModel.DataAnnotations;

namespace HappyHabitat.Application.DTOs;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

