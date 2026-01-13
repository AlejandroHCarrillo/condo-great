namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Entidad de relación entre PagoComunidad y CargosComunidad
/// Permite que un pago se asocie a múltiples cargos y guarda el monto aplicado a cada cargo
/// </summary>
public class PagoCargoComunidad
{
    public Guid Id { get; set; }
    public Guid PagoComunidadId { get; set; }
    public Guid CargosComunidadId { get; set; }
    public decimal MontoAplicado { get; set; } // Monto del pago aplicado a este cargo específico
    public string CreatedAt { get; set; } = string.Empty; // ISO date string
    
    // Navigation properties
    public PagoComunidad PagoComunidad { get; set; } = null!;
    public CargosComunidad CargosComunidad { get; set; } = null!;
}
