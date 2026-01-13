namespace HappyHabitat.Application.DTOs;

public class PaymentHistoryDto
{
    public string Id { get; set; } = string.Empty;
    public string ContratoId { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public string FechaPago { get; set; } = string.Empty; // ISO date string
    public string MetodoPago { get; set; } = string.Empty; // transferencia, tarjeta, efectivo, etc.
    public string? ReferenciaPago { get; set; } // número de referencia, comprobante, etc.
    public string EstadoPago { get; set; } = string.Empty; // pendiente, pagado, cancelado, reembolsado
    public string? Notas { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
    public string? UpdatedByUserId { get; set; }
}

public class CreatePaymentHistoryDto
{
    public string ContratoId { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public string FechaPago { get; set; } = string.Empty; // ISO date string
    public string MetodoPago { get; set; } = string.Empty; // transferencia, tarjeta, efectivo, etc.
    public string? ReferenciaPago { get; set; } // número de referencia, comprobante, etc.
    public string EstadoPago { get; set; } = string.Empty; // pendiente, pagado, cancelado, reembolsado
    public string? Notas { get; set; }
}

public class UpdatePaymentHistoryDto
{
    public decimal Monto { get; set; }
    public string FechaPago { get; set; } = string.Empty; // ISO date string
    public string MetodoPago { get; set; } = string.Empty; // transferencia, tarjeta, efectivo, etc.
    public string? ReferenciaPago { get; set; } // número de referencia, comprobante, etc.
    public string EstadoPago { get; set; } = string.Empty; // pendiente, pagado, cancelado, reembolsado
    public string? Notas { get; set; }
}


