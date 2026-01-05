namespace HappyHabitat.Domain.Entities;

public class Banner
{
    public Guid Id { get; set; }
    public Guid? CommunityId { get; set; }
    public string PathImagen { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? StartDate { get; set; } // ISO date string - fecha de inicio para mostrar el banner
    public string? EndDate { get; set; } // ISO date string - fecha de fin para mostrar el banner
    public string CreatedAt { get; set; } = string.Empty; // ISO date string
    
    // Navigation property
    public Community? Community { get; set; }
}

