using HappyHabitat.Domain.Enums;

namespace HappyHabitat.Domain.Entities;

public class PagoResidente : AuditBase
{
    public Guid Id { get; set; }
    public Guid ResidenteId { get; set; }
    public DateTime FechaPago { get; set; }
    public decimal Monto { get; set; }
    public StatusPagoResidente Status { get; set; }
    public string? Concepto { get; set; }
    public string? UrlComprobante { get; set; }
    public string? Nota { get; set; }

    public Resident? Resident { get; set; }
}
