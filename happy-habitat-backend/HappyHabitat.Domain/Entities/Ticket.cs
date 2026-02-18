namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Ticket o reporte creado por un residente en la comunidad.
/// </summary>
public class Ticket : AuditBase
{
    public int Id { get; set; }
    public Guid CommunityId { get; set; }
    public Guid ResidentId { get; set; }
    public int CategoriaTicketId { get; set; }
    public int StatusId { get; set; }
    public DateTime FechaReporte { get; set; }
    /// <summary>Descripción o contenido del ticket.</summary>
    public string? Contenido { get; set; }
    /// <summary>JSON array de rutas relativas de imágenes (ej. ["uploads/tickets/1/photo.jpg"]).</summary>
    public string? ImageUrlsJson { get; set; }

    public Community? Community { get; set; }
    public Resident? Resident { get; set; }
    public CategoriaTicket? CategoriaTicket { get; set; }
    public StatusTicket? StatusTicket { get; set; }
}
