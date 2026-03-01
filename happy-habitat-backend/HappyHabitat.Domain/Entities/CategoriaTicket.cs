namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Categoría de ticket (Areas comunes, Amenidades, Mantenimiento, etc.).
/// </summary>
public class CategoriaTicket
{
    public int Id { get; set; }
    public string Categoria { get; set; } = string.Empty;

    public ICollection<Ticket> Tickets { get; set; } = [];
}
