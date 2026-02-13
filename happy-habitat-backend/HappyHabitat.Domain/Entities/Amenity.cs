namespace HappyHabitat.Domain.Entities;

public class Amenity
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
    public string CreatedAt { get; set; } = string.Empty;

    // Navigation property
    public Community? Community { get; set; }
}
