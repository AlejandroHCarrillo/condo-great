namespace HappyHabitat.Application.DTOs;

public class TicketDto
{
    public int Id { get; set; }
    public Guid CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public Guid ResidentId { get; set; }
    public string? ResidentName { get; set; }
    /// <summary>Número de casa del residente.</summary>
    public string? ResidentNumber { get; set; }
    public int CategoriaTicketId { get; set; }
    public string? CategoriaTicketNombre { get; set; }
    public int StatusId { get; set; }
    public string? StatusCode { get; set; }
    public string? StatusDescripcion { get; set; }
    public DateTime FechaReporte { get; set; }
    public string? Contenido { get; set; }
    /// <summary>Rutas relativas de imágenes del ticket (ej. uploads/tickets/1/photo.jpg).</summary>
    public List<string>? ImageUrls { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
}

public class CreateTicketDto
{
    public int CategoriaTicketId { get; set; }
    public string? Contenido { get; set; }
    /// <summary>Opcional. Si el usuario es admin, usa este residente; si no, usa el residente del token.</summary>
    public Guid? ResidentId { get; set; }
}

public class UpdateTicketDto
{
    public int? StatusId { get; set; }
    public string? Contenido { get; set; }
}
