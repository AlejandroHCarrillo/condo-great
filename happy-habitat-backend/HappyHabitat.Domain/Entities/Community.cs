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
    public ICollection<Resident> Residents { get; set; } = new List<Resident>();
    public ICollection<Banner> Banners { get; set; } = new List<Banner>();
    public ICollection<Comunicado> Comunicados { get; set; } = new List<Comunicado>();
    public ICollection<UserCommunity> UserCommunities { get; set; } = new List<UserCommunity>();
    public ICollection<Contrato> Contratos { get; set; } = new List<Contrato>();
}

