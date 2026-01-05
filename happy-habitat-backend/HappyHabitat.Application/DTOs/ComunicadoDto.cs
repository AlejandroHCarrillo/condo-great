namespace HappyHabitat.Application.DTOs;

public class ComunicadoDto
{
    public Guid Id { get; set; }
    public Guid? CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Subtitulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } // Fecha del comunicado
    public string? Imagen { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateComunicadoDto
{
    public Guid? CommunityId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Subtitulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } // Fecha del comunicado
    public string? Imagen { get; set; }
}

public class UpdateComunicadoDto
{
    public Guid? CommunityId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Subtitulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } // Fecha del comunicado
    public string? Imagen { get; set; }
}

