namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Calificación de un residente/usuario sobre un ProveedorServicio (0-5).
/// Una sola calificación por usuario por proveedor.
/// </summary>
public class ProveedorServicioCalificacion
{
    public Guid Id { get; set; }
    public Guid ProveedorServicioId { get; set; }
    public Guid UserId { get; set; }
    public decimal Puntuacion { get; set; }
    public DateTime CreatedAt { get; set; }

    public ProveedorServicio? ProveedorServicio { get; set; }
    public User? User { get; set; }
}
