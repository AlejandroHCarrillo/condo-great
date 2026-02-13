namespace HappyHabitat.Application.DTOs;

public class AmenityDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Reglas { get; set; } = string.Empty;
    public decimal? Costo { get; set; }
    public DateTime FechaAlta { get; set; }
    public string? Imagen { get; set; }
    public Guid? CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public int? CapacidadMaxima { get; set; }
    public int? NumeroReservacionesSimultaneas { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateAmenityDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Reglas { get; set; } = string.Empty;
    public decimal? Costo { get; set; }
    public DateTime FechaAlta { get; set; }
    public string? Imagen { get; set; }
    public Guid CommunityId { get; set; }
    public int? CapacidadMaxima { get; set; }
    public int? NumeroReservacionesSimultaneas { get; set; }
}

public class UpdateAmenityDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Reglas { get; set; } = string.Empty;
    public decimal? Costo { get; set; }
    public DateTime FechaAlta { get; set; }
    public string? Imagen { get; set; }
    public Guid CommunityId { get; set; }
    public int? CapacidadMaxima { get; set; }
    public int? NumeroReservacionesSimultaneas { get; set; }
}
