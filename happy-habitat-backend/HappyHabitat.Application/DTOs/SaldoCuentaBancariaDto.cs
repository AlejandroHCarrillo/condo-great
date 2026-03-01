namespace HappyHabitat.Application.DTOs;

public class SaldoCuentaBancariaDto
{
    public int Id { get; set; }
    public Guid CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public string Banco { get; set; } = string.Empty;
    public string Cuenta { get; set; } = string.Empty;
    public DateTime FechaSaldo { get; set; }
    public decimal Monto { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class CreateSaldoCuentaBancariaDto
{
    public Guid CommunityId { get; set; }
    public string Banco { get; set; } = string.Empty;
    public string Cuenta { get; set; } = string.Empty;
    public DateTime FechaSaldo { get; set; }
    public decimal Monto { get; set; }
    public Guid? CreatedByUserId { get; set; }
}

public class UpdateSaldoCuentaBancariaDto
{
    public Guid CommunityId { get; set; }
    public string Banco { get; set; } = string.Empty;
    public string Cuenta { get; set; } = string.Empty;
    public DateTime FechaSaldo { get; set; }
    public decimal Monto { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}
