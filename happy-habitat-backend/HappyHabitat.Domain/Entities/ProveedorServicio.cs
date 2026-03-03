namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Proveedor de servicios del directorio (por comunidad). Hereda de AuditBase.
/// Incluye giro, nombre, teléfono, descripción, página web y calificación 0-5.
/// </summary>
public class ProveedorServicio : AuditBase
{
    public Guid Id { get; set; }

    public string Giro { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Descripcion { get; set; }
    public string? PaginaWeb { get; set; }
    /// <summary>Calificación promedio 0-5 (calculada desde calificaciones de residentes o valor por defecto).</summary>
    public decimal? Rating { get; set; }
    public bool IsActive { get; set; } = true;

    public Community? Community { get; set; }
    public User? CreatedByUser { get; set; }
    public User? UpdatedByUser { get; set; }
    public ICollection<ProveedorServicioCalificacion> Calificaciones { get; set; } = [];
}
