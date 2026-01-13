namespace HappyHabitat.Domain.Entities;

public class PaymentHistory
{
    public Guid Id { get; set; }
    public Guid ContratoId { get; set; }
    public decimal Monto { get; set; }
    public string FechaPago { get; set; } = string.Empty; // ISO date string
    public string MetodoPago { get; set; } = string.Empty; // transferencia, tarjeta, efectivo, etc.
    public string? ReferenciaPago { get; set; } // número de referencia, comprobante, etc.
    public string EstadoPago { get; set; } = string.Empty; // pendiente, pagado, cancelado, reembolsado
    public string? Notas { get; set; }
    public bool IsActive { get; set; } = true;
    public string CreatedAt { get; set; } = string.Empty; // ISO date string
    public string? UpdatedAt { get; set; } // ISO date string (nullable)
    public Guid? UpdatedByUserId { get; set; } // Usuario que modificó
    
    // Navigation properties
    public Contrato Contrato { get; set; } = null!;
    public User? UpdatedByUser { get; set; }
}


