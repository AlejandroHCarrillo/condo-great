namespace HappyHabitat.Domain.Entities;

public class Document
{
    public Guid Id { get; set; }
    public Guid? CommunityId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string UserCreated { get; set; } = string.Empty; // Nombre o ID del usuario que lo subió
    public string NombreDocumento { get; set; } = string.Empty; // Nombre original del archivo
    public string UrlDoc { get; set; } = string.Empty; // URL pública o protegida del documento
    public string CreatedAt { get; set; } = string.Empty; // ISO date string
    /// <summary>Usuario que subió el documento (para autorizar descarga).</summary>
    public Guid? UserId { get; set; }

    // Navigation properties
    public Community? Community { get; set; }
    public User? User { get; set; }
}
