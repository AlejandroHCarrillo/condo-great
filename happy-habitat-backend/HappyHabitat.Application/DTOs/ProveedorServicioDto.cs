namespace HappyHabitat.Application.DTOs;

public class ProveedorServicioDto
{
    public Guid Id { get; set; }
    public Guid? CommunityId { get; set; }
    public string? CommunityName { get; set; }

    public string Giro { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Descripcion { get; set; }
    public string? PaginaWeb { get; set; }
    public decimal? Rating { get; set; }
    public int? TotalCalificaciones { get; set; }
    public bool IsActive { get; set; }

    public string CreatedAt { get; set; } = string.Empty;
    public Guid? CreatedByUserId { get; set; }
    public string? UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class CreateProveedorServicioDto
{
    public Guid CommunityId { get; set; }
    public string Giro { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Descripcion { get; set; }
    public string? PaginaWeb { get; set; }
    public decimal? Rating { get; set; }
    public Guid? CreatedByUserId { get; set; }
}

public class UpdateProveedorServicioDto
{
    public Guid CommunityId { get; set; }
    public string Giro { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Descripcion { get; set; }
    public string? PaginaWeb { get; set; }
    public decimal? Rating { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}
