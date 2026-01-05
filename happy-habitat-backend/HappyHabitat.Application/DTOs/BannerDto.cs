namespace HappyHabitat.Application.DTOs;

public class BannerDto
{
    public Guid Id { get; set; }
    public Guid? CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public string PathImagen { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateBannerDto
{
    public Guid? CommunityId { get; set; }
    public string PathImagen { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
}

public class UpdateBannerDto
{
    public Guid? CommunityId { get; set; }
    public string PathImagen { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
}

