namespace HappyHabitat.Domain.Entities;

public class CommunityPrice : AuditBase
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public bool IsActive { get; set; } = true;

    public Community? Community { get; set; }
}
