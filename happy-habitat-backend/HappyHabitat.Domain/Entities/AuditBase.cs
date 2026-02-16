namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Campos de auditoría compartidos (CreatedByUserId, CreatedAt, UpdatedByUserId, UpdatedAt).
/// No se mapea como entidad; las clases derivadas tienen su propia tabla con estas columnas.
/// CreatedByUserId/UpdatedByUserId pueden tener FK opcional según la entidad.
/// </summary>
public abstract class AuditBase
{
    public Guid? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
