namespace HappyHabitat.Application.DTOs;

public class CommunityProviderDto
{
    public Guid Id { get; set; }
    public Guid? CommunityId { get; set; }
    public string? CommunityName { get; set; }

    public string BusinessName { get; set; } = string.Empty;
    public string? TaxId { get; set; }
    public string? FullAddress { get; set; }
    public string? ContactPhones { get; set; }
    public string? PrimaryEmail { get; set; }
    public string? WebsiteOrSocialMedia { get; set; }

    public string? PrimaryContactName { get; set; }
    public string? DirectPhone { get; set; }
    public string? MobilePhone { get; set; }
    public string? ContactEmail { get; set; }

    public string? ProductsOrServices { get; set; }
    public string? CategoryOrIndustry { get; set; }
    public string? PaymentMethods { get; set; }

    public decimal? Rating { get; set; }
    public string? OrderHistory { get; set; }
    public string? PastIncidentsOrClaims { get; set; }
    public string? InternalNotes { get; set; }

    public bool IsActive { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public Guid? CreatedByUserId { get; set; }
    public string? UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class CreateCommunityProviderDto
{
    public Guid CommunityId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string? TaxId { get; set; }
    public string? FullAddress { get; set; }
    public string? ContactPhones { get; set; }
    public string? PrimaryEmail { get; set; }
    public string? WebsiteOrSocialMedia { get; set; }
    public string? PrimaryContactName { get; set; }
    public string? DirectPhone { get; set; }
    public string? MobilePhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? ProductsOrServices { get; set; }
    public string? CategoryOrIndustry { get; set; }
    public string? PaymentMethods { get; set; }
    public decimal? Rating { get; set; }
    public string? OrderHistory { get; set; }
    public string? PastIncidentsOrClaims { get; set; }
    public string? InternalNotes { get; set; }
    public Guid? CreatedByUserId { get; set; }
}

public class UpdateCommunityProviderDto
{
    public Guid CommunityId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string? TaxId { get; set; }
    public string? FullAddress { get; set; }
    public string? ContactPhones { get; set; }
    public string? PrimaryEmail { get; set; }
    public string? WebsiteOrSocialMedia { get; set; }
    public string? PrimaryContactName { get; set; }
    public string? DirectPhone { get; set; }
    public string? MobilePhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? ProductsOrServices { get; set; }
    public string? CategoryOrIndustry { get; set; }
    public string? PaymentMethods { get; set; }
    public decimal? Rating { get; set; }
    public string? OrderHistory { get; set; }
    public string? PastIncidentsOrClaims { get; set; }
    public string? InternalNotes { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}
