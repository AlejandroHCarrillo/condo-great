namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Parámetro de configuración asociado a un residente.
/// </summary>
public class ResidentConfiguration : AuditBase
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
    public string TipoDato { get; set; } = string.Empty;

    public Resident Resident { get; set; } = null!;
}
