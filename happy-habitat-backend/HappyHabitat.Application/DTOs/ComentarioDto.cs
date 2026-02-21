using System.ComponentModel.DataAnnotations;

namespace HappyHabitat.Application.DTOs;

public class ComentarioDto
{
    public int Id { get; set; }
    public Guid ResidentId { get; set; }
    public string? ResidentName { get; set; }
    public string Origen { get; set; } = string.Empty;
    public string IdOrigen { get; set; } = string.Empty;
    public int? IdComment { get; set; }
    public string ComentarioTexto { get; set; } = string.Empty;
    /// <summary>Rutas relativas de imágenes del comentario.</summary>
    public List<string>? ImageUrls { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
}

public class CreateComentarioDto
{
    [Required(ErrorMessage = "El origen del comentario es obligatorio.")]
    [MaxLength(50)]
    public string Origen { get; set; } = string.Empty;

    [Required(ErrorMessage = "El IdOrigen es obligatorio.")]
    [MaxLength(50)]
    public string IdOrigen { get; set; } = string.Empty;

    public int? IdComment { get; set; }

    [Required(ErrorMessage = "El texto del comentario es obligatorio.")]
    [MaxLength(4000)]
    public string ComentarioTexto { get; set; } = string.Empty;

    /// <summary>Rutas relativas de imágenes (tras subirlas al servidor).</summary>
    public List<string>? ImageUrls { get; set; }
}

public class UpdateComentarioDto
{
    [Required(ErrorMessage = "El texto del comentario es obligatorio.")]
    [MaxLength(4000)]
    public string ComentarioTexto { get; set; } = string.Empty;
}
