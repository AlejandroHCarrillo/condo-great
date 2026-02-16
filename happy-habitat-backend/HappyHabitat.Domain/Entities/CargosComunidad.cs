namespace HappyHabitat.Domain.Entities;

public class CargosComunidad : AuditBase
{
    public Guid Id { get; set; }
    public Guid ContratoId { get; set; }
    public Guid ComunidadId { get; set; }
    public decimal MontoCargo { get; set; }
    public string FechaDePago { get; set; } = string.Empty; // ISO date string - calculada según PeriodicidadPago
    public decimal MontoRecargos { get; set; }
    public string Estatus { get; set; } = string.Empty; // No vencido, vencido, pagado, pago parcial
    public string? Notas { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Contrato Contrato { get; set; } = null!;
    public Community Comunidad { get; set; } = null!;
    public ICollection<PagoCargoComunidad> PagoCargos { get; set; } = new List<PagoCargoComunidad>();
}
