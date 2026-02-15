namespace HappyHabitat.Domain.Entities;

public class Comunicado : AuditBase
{
    public Guid Id { get; set; }
    public Guid? CommunityId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Subtitulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } // Fecha del comunicado
    public string? Imagen { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation property
    public Community? Community { get; set; }
}

