namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Ticket o reporte creado por un residente en la comunidad.
/// </summary>
public class Ticket : AuditBase
{
    public int Id { get; set; }
    public Guid CommunityId { get; set; }
    public Guid ResidentId { get; set; }
    public int TipoReporteId { get; set; }
    public int StatusId { get; set; }
    public DateTime FechaReporte { get; set; }

    public Community? Community { get; set; }
    public Resident? Resident { get; set; }
    public TipoReporte? TipoReporte { get; set; }
    public StatusTicket? StatusTicket { get; set; }
}
