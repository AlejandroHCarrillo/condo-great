using System.ComponentModel.DataAnnotations;

namespace HappyHabitat.Application.DTOs;

public class BannerDto
{
    public Guid Id { get; set; }
    public Guid? CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public string PathImagen { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateBannerDto
{
    public Guid? CommunityId { get; set; }

    [Required(ErrorMessage = "La ruta de la imagen es obligatoria.")]
    [MaxLength(500)]
    public string PathImagen { get; set; } = string.Empty;

    [Required(ErrorMessage = "El título es obligatorio.")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Text { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    [MaxLength(50)]
    public string? StartDate { get; set; }

    [MaxLength(50)]
    public string? EndDate { get; set; }
}

public class UpdateBannerDto
{
    public Guid? CommunityId { get; set; }

    [Required(ErrorMessage = "La ruta de la imagen es obligatoria.")]
    [MaxLength(500)]
    public string PathImagen { get; set; } = string.Empty;

    [Required(ErrorMessage = "El título es obligatorio.")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Text { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    [MaxLength(50)]
    public string? StartDate { get; set; }

    [MaxLength(50)]
    public string? EndDate { get; set; }
}

