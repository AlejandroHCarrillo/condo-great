using HappyHabitat.Domain.Enums;

namespace HappyHabitat.Domain.Entities;

public class CargoResidente : AuditBase
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public DateTime Fecha { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public EstatusCargoResidente Estatus { get; set; }

    public Resident? Resident { get; set; }
}
