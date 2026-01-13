namespace HappyHabitat.Domain.Entities;

public class Contrato
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string TipoContrato { get; set; } = string.Empty; // estandar, prueba, promocion, cliente
    public string FolioContrato { get; set; } = string.Empty;
    public string RepresentanteComunidad { get; set; } = string.Empty;
    public decimal CostoTotal { get; set; }
    public decimal MontoPagoParcial { get; set; } // Monto que se debe pagar cada periodo
    public int NumeroPagosParciales { get; set; } // Número de pagos parciales
    public int DiaPago { get; set; } // Día del mes (1-28) en que se debe cubrir el pago
    public string PeriodicidadPago { get; set; } = string.Empty; // mensual, trimestral, anual
    public string MetodoPago { get; set; } = string.Empty; // transferencia, tarjeta, efectivo, etc.
    public string FechaFirma { get; set; } = string.Empty; // ISO date string
    public string FechaInicio { get; set; } = string.Empty; // ISO date string
    public string? FechaFin { get; set; } // ISO date string (nullable)
    public int NumeroCasas { get; set; }
    public string EstadoContrato { get; set; } = string.Empty; // activo, vencido, cancelado, en renovación
    public string? AsesorVentas { get; set; }
    public string? Notas { get; set; }
    public string? DocumentosAdjuntos { get; set; } // ruta o referencia al archivo
    public bool IsActive { get; set; } = true;
    public string CreatedAt { get; set; } = string.Empty; // ISO date string
    public string? UpdatedAt { get; set; } // ISO date string (nullable)
    public Guid? UpdatedByUserId { get; set; } // Usuario que modificó
    
    // Navigation properties
    public Community Community { get; set; } = null!;
    public User? UpdatedByUser { get; set; }
    public ICollection<PaymentHistory> PaymentHistories { get; set; } = new List<PaymentHistory>();
}


