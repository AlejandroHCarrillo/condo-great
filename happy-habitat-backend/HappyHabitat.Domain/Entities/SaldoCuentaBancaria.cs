namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Registro de saldo de cuenta bancaria por comunidad y fecha.
/// </summary>
public class SaldoCuentaBancaria : AuditBase
{
    public int Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Banco { get; set; } = string.Empty;
    public string Cuenta { get; set; } = string.Empty;
    public DateTime FechaSaldo { get; set; }
    public decimal Monto { get; set; }

    public Community? Community { get; set; }
}
