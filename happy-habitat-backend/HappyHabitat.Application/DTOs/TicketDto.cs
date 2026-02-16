namespace HappyHabitat.Application.DTOs;

public class TicketDto
{
    public int Id { get; set; }
    public Guid CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public Guid ResidentId { get; set; }
    public string? ResidentName { get; set; }
    public int TipoReporteId { get; set; }
    public string? TipoReporteNombre { get; set; }
    public int StatusId { get; set; }
    public string? StatusCode { get; set; }
    public string? StatusDescripcion { get; set; }
    public DateTime FechaReporte { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
}

public class CreateTicketDto
{
    public int TipoReporteId { get; set; }
}

public class UpdateTicketDto
{
    public int? StatusId { get; set; }
}
