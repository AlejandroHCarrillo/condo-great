namespace HappyHabitat.Application.DTOs;

public class CargoComunidadDto
{
    public string Id { get; set; } = string.Empty;
    public string ContratoId { get; set; } = string.Empty;
    public string ComunidadId { get; set; } = string.Empty;
    public decimal MontoCargo { get; set; }
    public string FechaDePago { get; set; } = string.Empty; // ISO date string
    public decimal MontoRecargos { get; set; }
    public string Estatus { get; set; } = string.Empty; // No vencido, vencido, pagado, pago parcial
    public string? Notas { get; set; }
    public bool IsActive { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
}

public class PagoCargoComunidadDto
{
    public string Id { get; set; } = string.Empty;
    public string PagoComunidadId { get; set; } = string.Empty;
    public string CargosComunidadId { get; set; } = string.Empty;
    public decimal MontoAplicado { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}

public class PagoComunidadDto
{
    public string Id { get; set; } = string.Empty;
    public decimal MontoPago { get; set; }
    public string FormaDePago { get; set; } = string.Empty; // transferencia, tarjeta, efectivo, etc.
    public string FechaDePago { get; set; } = string.Empty; // ISO date string
    public bool IsActive { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
    public string? UpdatedByUserId { get; set; }
    public List<PagoCargoComunidadDto>? PagoCargos { get; set; }
}

public class StatementDto
{
    public List<CargoComunidadDto> Cargos { get; set; } = new List<CargoComunidadDto>();
    public List<PagoComunidadDto> Pagos { get; set; } = new List<PagoComunidadDto>();
}
