namespace HappyHabitat.Application.DTOs;

public class ContratoDto
{
    public string Id { get; set; } = string.Empty;
    public string CommunityId { get; set; } = string.Empty;
    public string TipoContrato { get; set; } = string.Empty; // estandar, prueba, promocion, cliente
    public string FolioContrato { get; set; } = string.Empty;
    public string RepresentanteComunidad { get; set; } = string.Empty;
    public decimal CostoTotal { get; set; }
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
    public List<PaymentHistoryDto>? PaymentHistories { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
    public string? UpdatedByUserId { get; set; }
}

public class CreateContratoDto
{
    public string CommunityId { get; set; } = string.Empty;
    public string TipoContrato { get; set; } = string.Empty; // estandar, prueba, promocion, cliente
    public string FolioContrato { get; set; } = string.Empty;
    public string RepresentanteComunidad { get; set; } = string.Empty;
    public decimal CostoTotal { get; set; }
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
}

public class UpdateContratoDto
{
    public string TipoContrato { get; set; } = string.Empty; // estandar, prueba, promocion, cliente
    public string FolioContrato { get; set; } = string.Empty;
    public string RepresentanteComunidad { get; set; } = string.Empty;
    public decimal CostoTotal { get; set; }
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
}


