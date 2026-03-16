namespace HappyHabitat.Application.DTOs;

/// <summary>
/// DTO para que un residente cree una reservación. ResidentId se asigna en backend desde el token.
/// </summary>
public class CreateAmenityReservationDto
{
    public Guid AmenityId { get; set; }
    public DateTime Horario { get; set; }
    public int NumPersonas { get; set; } = 1;
    /// <summary>Número de horas a reservar.</summary>
    public int HorasReservadas { get; set; } = 1;
}
