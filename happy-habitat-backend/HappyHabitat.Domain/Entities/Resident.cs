namespace HappyHabitat.Domain.Entities;

public class Resident : AuditBase
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? CommunityId { get; set; } // Foreign key to Community
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Number { get; set; }
    public string Address { get; set; } = string.Empty;

    // Navigation properties
    public User User { get; set; } = null!;
    public Community? Community { get; set; } // Navigation property to Community
    public ICollection<Vehicle> Vehicles { get; set; } = [];
    public ICollection<Pet> Pets { get; set; } = [];
    public ICollection<ResidentVisit> Visits { get; set; } = [];
    public ICollection<ResidentConfiguration> ResidentConfigurations { get; set; } = [];
    public ICollection<RespuestaResidente> RespuestasEncuestas { get; set; } = [];
    public ICollection<Ticket> Tickets { get; set; } = [];
    public ICollection<Comentario> Comentarios { get; set; } = [];
    public ICollection<CargoResidente> CargosResidente { get; set; } = [];
    public ICollection<PagoResidente> PagosResidente { get; set; } = [];
}

