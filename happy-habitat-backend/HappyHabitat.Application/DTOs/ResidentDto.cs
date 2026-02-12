namespace HappyHabitat.Application.DTOs;

public class ResidentDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? CommunityId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Number { get; set; }
    public string Address { get; set; } = string.Empty;
    /// <summary>Ids de comunidades (compatibilidad con frontend; típicamente un elemento si CommunityId está definido).</summary>
    public List<Guid> CommunityIds { get; set; } = new List<Guid>();
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateResidentDto
{
    public Guid UserId { get; set; }
    public Guid? CommunityId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Number { get; set; }
    public string Address { get; set; } = string.Empty;
}

public class UpdateResidentDto
{
    public Guid? CommunityId { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Number { get; set; }
    public string? Address { get; set; }
}
