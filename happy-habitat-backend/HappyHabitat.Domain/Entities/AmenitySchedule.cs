namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Horario de una amenidad para un día de la semana (puede haber varios periodos por día).
/// DayOfWeek: 1 = Lunes, 2 = Martes, ..., 7 = Domingo.
/// HoraInicio/HoraFin en formato "HH:mm" (24h).
/// </summary>
public class AmenitySchedule : AuditBase
{
    public Guid Id { get; set; }
    public Guid AmenityId { get; set; }
    /// <summary>1 = Lunes, 2 = Martes, ..., 7 = Domingo</summary>
    public int DayOfWeek { get; set; }
    /// <summary>Hora inicio en formato "HH:mm" (24h)</summary>
    public string HoraInicio { get; set; } = string.Empty;
    /// <summary>Hora fin en formato "HH:mm" (24h)</summary>
    public string HoraFin { get; set; } = string.Empty;
    public bool IsOpen { get; set; }
    public string Nota { get; set; } = string.Empty;

    public Amenity? Amenity { get; set; }
}
