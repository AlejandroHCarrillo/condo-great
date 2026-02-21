using System.ComponentModel.DataAnnotations;

namespace HappyHabitat.Application.DTOs;

public class DocumentDto
{
    public Guid Id { get; set; }
    public Guid? CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public Guid? UserId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string UserCreated { get; set; } = string.Empty;
    public string NombreDocumento { get; set; } = string.Empty;
    public string UrlDoc { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateDocumentDto
{
    public Guid? CommunityId { get; set; }
    /// <summary>Lo establece el servidor desde el usuario autenticado (no enviar desde cliente).</summary>
    public Guid? UserId { get; set; }

    [Required(ErrorMessage = "El título es obligatorio.")]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Descripcion { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    [MaxLength(200)]
    public string UserCreated { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre del documento es obligatorio.")]
    [MaxLength(500)]
    public string NombreDocumento { get; set; } = string.Empty;

    [Required(ErrorMessage = "La URL del documento es obligatoria.")]
    [MaxLength(1000)]
    public string UrlDoc { get; set; } = string.Empty;
}

public class UpdateDocumentDto
{
    public Guid? CommunityId { get; set; }

    [Required(ErrorMessage = "El título es obligatorio.")]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Descripcion { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    [MaxLength(200)]
    public string UserCreated { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre del documento es obligatorio.")]
    [MaxLength(500)]
    public string NombreDocumento { get; set; } = string.Empty;

    [Required(ErrorMessage = "La URL del documento es obligatoria.")]
    [MaxLength(1000)]
    public string UrlDoc { get; set; } = string.Empty;
}
