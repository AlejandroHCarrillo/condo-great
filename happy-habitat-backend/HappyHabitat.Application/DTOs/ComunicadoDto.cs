using System.ComponentModel.DataAnnotations;

namespace HappyHabitat.Application.DTOs;

public class ComunicadoDto
{
    public Guid Id { get; set; }
    public Guid? CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Subtitulo { get; set; } = string.Empty;
    public string Contenido { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } // Fecha del comunicado
    public string? Imagen { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateComunicadoDto
{
    public Guid? CommunityId { get; set; }

    [Required(ErrorMessage = "El título es obligatorio.")]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [MaxLength(300)]
    public string Subtitulo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El contenido es obligatorio.")]
    [MaxLength(4000)]
    public string Contenido { get; set; } = string.Empty;

    public DateTime Fecha { get; set; } // Fecha del comunicado

    [MaxLength(500)]
    public string? Imagen { get; set; }
}

public class UpdateComunicadoDto
{
    public Guid? CommunityId { get; set; }

    [Required(ErrorMessage = "El título es obligatorio.")]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [MaxLength(300)]
    public string Subtitulo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El contenido es obligatorio.")]
    [MaxLength(4000)]
    public string Contenido { get; set; } = string.Empty;

    public DateTime Fecha { get; set; } // Fecha del comunicado

    [MaxLength(500)]
    public string? Imagen { get; set; }
}

