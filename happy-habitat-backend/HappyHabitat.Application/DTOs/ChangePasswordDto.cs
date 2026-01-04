using System.ComponentModel.DataAnnotations;

namespace HappyHabitat.Application.DTOs;

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [StringLength(20, MinimumLength = 6)]
    public string NewPassword { get; set; } = string.Empty;
}

