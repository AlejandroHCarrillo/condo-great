namespace HappyHabitat.Domain.Entities;

public class AmenityReservation : AuditBase
{
    public Guid Id { get; set; }
    public Guid AmenityId { get; set; }
    public Guid ResidentId { get; set; }
    public DateTime Horario { get; set; }
    public int? NumPersonas { get; set; }
    /// <summary>Ej: "En proceso", "Reservada", "Rechazada".</summary>
    public string Status { get; set; } = "En proceso";

    public Amenity? Amenity { get; set; }
    public Resident? Resident { get; set; }
}
