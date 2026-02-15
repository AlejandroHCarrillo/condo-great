namespace HappyHabitat.Domain.Entities;

public class PagoComunidad : AuditBase
{
    public Guid Id { get; set; }
    public decimal MontoPago { get; set; }
    public string FormaDePago { get; set; } = string.Empty; // transferencia, tarjeta, efectivo, etc.
    public string FechaDePago { get; set; } = string.Empty; // ISO date string
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public User? UpdatedByUser { get; set; }
    public ICollection<PagoCargoComunidad> PagoCargos { get; set; } = new List<PagoCargoComunidad>();
}
