using System.ComponentModel.DataAnnotations;

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
    /// <summary>Color del estado (hex) para el badge en la lista.</summary>
    public string? StatusColor { get; set; }
    public DateTime FechaReporte { get; set; }
    public string? Contenido { get; set; }
    /// <summary>Rutas relativas de imágenes del ticket (ej. uploads/tickets/1/photo.jpg).</summary>
    public List<string>? ImageUrls { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
}

public class CreateTicketDto
{
    [Range(1, int.MaxValue, ErrorMessage = "La categoría del ticket es obligatoria.")]
    public int CategoriaTicketId { get; set; }

    [MaxLength(4000)]
    public string? Contenido { get; set; }

    /// <summary>Opcional. Si el usuario es ADMIN_COMPANY/SYSTEM_ADMIN, indica el residente a nombre del cual se crea el ticket.</summary>
    public Guid? ResidentId { get; set; }

    /// <summary>Opcional. Si el usuario es ADMIN_COMPANY/SYSTEM_ADMIN, indica la comunidad del ticket; se usará un residente de esa comunidad si no se envía ResidentId.</summary>
    public Guid? CommunityId { get; set; }
}

public class UpdateTicketDto
{
    public int? StatusId { get; set; }

    [MaxLength(4000)]
    public string? Contenido { get; set; }

    /// <summary>Rutas relativas de imágenes (ej. uploads/tickets/1/photo.jpg).</summary>
    public List<string>? ImageUrls { get; set; }
}
