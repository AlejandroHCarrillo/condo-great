namespace HappyHabitat.Application.DTOs;

public class EncuestaDto
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public bool IsActive { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
}

public class CreateEncuestaDto
{
    public Guid CommunityId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateEncuestaDto
{
    public Guid CommunityId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public bool IsActive { get; set; }
}
