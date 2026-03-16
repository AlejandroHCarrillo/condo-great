namespace HappyHabitat.Domain.Entities;

public class Amenity : AuditBase
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Reglas { get; set; } = string.Empty;
    public decimal? Costo { get; set; }
    public DateTime FechaAlta { get; set; }
    public string? Imagen { get; set; }
    public int? CapacidadMaxima { get; set; }
    public int? NumeroReservacionesSimultaneas { get; set; }
    public bool IsActive { get; set; } = true;
    /// <summary>Si true, las reservaciones de esta amenidad requieren aprobación antes de confirmarse.</summary>
    public bool RequiereAprobacion { get; set; }

    // Navigation properties
    public Community? Community { get; set; }
    public ICollection<AmenitySchedule> Schedules { get; set; } = new List<AmenitySchedule>();
}
