namespace HappyHabitat.Domain.Entities;

public class CommunityConfiguration : AuditBase
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
    public string TipoDato { get; set; } = string.Empty;

    public Community? Community { get; set; }
}
