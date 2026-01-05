namespace HappyHabitat.Domain.Entities;

public class Comunicado
{
    public Guid Id { get; set; }
    public Guid? CommunityId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Subtitulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } // Fecha del comunicado
    public string? Imagen { get; set; }
    public string CreatedAt { get; set; } = string.Empty; // ISO date string
    
    // Navigation property
    public Community? Community { get; set; }
}

