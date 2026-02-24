namespace HappyHabitat.Application.DTOs;

public class PagosResidenteDto
{
    public Guid Id { get; set; }
    public Guid ResidenteId { get; set; }
    public string? ResidentName { get; set; }
    public string? ResidentNumber { get; set; }
    public DateTime FechaPago { get; set; }
    public decimal Monto { get; set; }
    public string Status { get; set; } = string.Empty; // PorConfirmar, Aplicado, Cancelado
    public string? Concepto { get; set; }
    public string? UrlComprobante { get; set; }
    public string? Nota { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class CreatePagosResidenteDto
{
    public Guid ResidenteId { get; set; }
    public DateTime FechaPago { get; set; }
    public decimal Monto { get; set; }
    public string Status { get; set; } = "PorConfirmar";
    public string? Concepto { get; set; }
    public string? UrlComprobante { get; set; }
    public string? Nota { get; set; }
    public Guid? CreatedByUserId { get; set; }
}

public class UpdatePagosResidenteDto
{
    public Guid ResidenteId { get; set; }
    public DateTime FechaPago { get; set; }
    public decimal Monto { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Concepto { get; set; }
    public string? UrlComprobante { get; set; }
    public string? Nota { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}
