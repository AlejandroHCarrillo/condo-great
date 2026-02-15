namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Proveedor asociado a una comunidad (servicios, productos, etc.).
/// </summary>
public class CommunityProvider : AuditBase
{
    public Guid Id { get; set; }

    // Datos generales del proveedor
    public string BusinessName { get; set; } = string.Empty; // Nombre o razón social
    public string? TaxId { get; set; } // RFC / identificación fiscal
    public string? FullAddress { get; set; } // Dirección completa
    public string? ContactPhones { get; set; } // Teléfonos de contacto (puede ser varios separados)
    public string? PrimaryEmail { get; set; } // Correo electrónico principal
    public string? WebsiteOrSocialMedia { get; set; } // Página web / redes sociales

    // Contacto principal
    public string? PrimaryContactName { get; set; } // Nombre contacto principal
    public string? DirectPhone { get; set; } // Teléfono directo
    public string? MobilePhone { get; set; } // Teléfono móvil
    public string? ContactEmail { get; set; } // Correo electrónico del contacto

    // Productos/servicios y categoría
    public string? ProductsOrServices { get; set; } // Productos o servicios que ofrece
    public string? CategoryOrIndustry { get; set; } // Categoría o giro (ej. alimentos, transporte, tecnología)
    public string? PaymentMethods { get; set; } // Formas de pago (crédito, contado, plazos)

    // Calificación e historial
    public decimal? Rating { get; set; } // Calificación
    public string? OrderHistory { get; set; } // Historial de pedidos realizados (texto o referencia)
    public string? PastIncidentsOrClaims { get; set; } // Incidencias o reclamaciones pasadas
    public string? InternalNotes { get; set; } // Notas internas

    public bool IsActive { get; set; } = true;

    // Navigation properties (CommunityId como propiedad sombra en DbContext)
    public Community? Community { get; set; }
    public User? CreatedByUser { get; set; }
    public User? UpdatedByUser { get; set; }
}
