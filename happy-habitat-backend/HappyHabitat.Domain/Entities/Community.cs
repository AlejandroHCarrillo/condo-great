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
    public string CreatedAt { get; set; } = string.Empty; // ISO date string
    
    // Navigation property
    public ICollection<Resident> Residents { get; set; } = new List<Resident>();
}

