namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Estatus del ticket (Nuevo, En revisión, En investigación, En proceso, Cancelado, Resuelto).
/// </summary>
public class StatusTicket
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
