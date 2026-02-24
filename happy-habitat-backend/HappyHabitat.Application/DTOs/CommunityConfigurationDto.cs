namespace HappyHabitat.Application.DTOs;

public class CommunityConfigurationDto
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
    public string TipoDato { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class CreateCommunityConfigurationDto
{
    public Guid CommunityId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
    public string TipoDato { get; set; } = string.Empty;
    public Guid? CreatedByUserId { get; set; }
}

public class UpdateCommunityConfigurationDto
{
    public Guid CommunityId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
    public string TipoDato { get; set; } = string.Empty;
    public Guid? UpdatedByUserId { get; set; }
}
