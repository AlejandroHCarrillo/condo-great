namespace HappyHabitat.Application.DTOs;

public class AmenityReservationDto
{
    public Guid Id { get; set; }
    public Guid AmenityId { get; set; }
    public string AmenityName { get; set; } = string.Empty;
    public Guid ResidentId { get; set; }
    public string ResidentName { get; set; } = string.Empty;
    public DateTime Horario { get; set; }
    public int? NumPersonas { get; set; }
    public string Status { get; set; } = string.Empty;
}
