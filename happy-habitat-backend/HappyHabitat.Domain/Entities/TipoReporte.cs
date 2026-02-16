namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Tipo de reporte para tickets (Mascotas, Amenidades, Ruido, Otro, etc.).
/// </summary>
public class TipoReporte
{
    public int Id { get; set; }
    public string Tipo { get; set; } = string.Empty;

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
