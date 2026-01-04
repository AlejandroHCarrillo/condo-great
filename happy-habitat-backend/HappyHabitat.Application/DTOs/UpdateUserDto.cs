using System.ComponentModel.DataAnnotations;

namespace HappyHabitat.Application.DTOs;

public class UpdateUserDto
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

    public bool IsActive { get; set; }
}

