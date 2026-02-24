namespace HappyHabitat.Application.DTOs;

public class CommunityPriceDto
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public bool IsActive { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class CreateCommunityPriceDto
{
    public Guid CommunityId { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public bool IsActive { get; set; } = true;
    public Guid? CreatedByUserId { get; set; }
}

public class UpdateCommunityPriceDto
{
    public Guid CommunityId { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public bool IsActive { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}
