namespace HappyHabitat.Domain.Entities;

public class Community
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Contacto { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string TipoComunidad { get; set; } = string.Empty;
    public double? Latitud { get; set; }
    public double? Longitud { get; set; }
    public int CantidadViviendas { get; set; }
    public bool IsActive { get; set; } = true;
    public string CreatedAt { get; set; } = string.Empty; // ISO date string
    
    // Navigation properties
    public ICollection<Resident> Residents { get; set; } = [];
    public ICollection<Banner> Banners { get; set; } = [];
    public ICollection<Comunicado> Comunicados { get; set; } = [];
    public ICollection<Amenity> Amenities { get; set; } = [];
    public ICollection<UserCommunity> UserCommunities { get; set; } = [];
    public ICollection<Contrato> Contratos { get; set; } = [];
    public ICollection<CommunityProvider> CommunityProviders { get; set; } = [];
    public ICollection<Document> Documents { get; set; } = [];
    public ICollection<CommunityConfiguration> CommunityConfigurations { get; set; } = [];
    public ICollection<Encuesta> Encuestas { get; set; } = [];
    public ICollection<Ticket> Tickets { get; set; } = [];
    public ICollection<CommunityPrice> CommunityPrices { get; set; } = [];
    public ICollection<SaldoCuentaBancaria> SaldosCuentaBancaria { get; set; } = [];
}

