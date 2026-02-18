namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Comentario asociado a un origen (Ticket, Post, Proveedores, etc.). Puede ser respuesta a otro comentario.
/// </summary>
public class Comentario : AuditBase
{
    public int Id { get; set; }
    public Guid ResidentId { get; set; }
    public string Origen { get; set; } = string.Empty; // Ticket, Post, Proveedores, etc.
    public string IdOrigen { get; set; } = string.Empty; // ID del origen (Ticket int, otros Guid, etc.)
    public int? IdComment { get; set; } // Relación a otro comentario (respuesta)
    public string ComentarioTexto { get; set; } = string.Empty;
    /// <summary>JSON array de rutas relativas de imágenes (ej. ["uploads/comentarios/123/photo.jpg"]).</summary>
    public string? ImageUrlsJson { get; set; }

    public Resident? Resident { get; set; }
    public Comentario? ParentComment { get; set; }
    public ICollection<Comentario> Replies { get; set; } = new List<Comentario>();
}
