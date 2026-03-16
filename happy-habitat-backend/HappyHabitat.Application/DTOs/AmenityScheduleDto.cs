namespace HappyHabitat.Application.DTOs;

public class AmenityScheduleDto
{
    public Guid Id { get; set; }
    public Guid AmenityId { get; set; }
    /// <summary>1 = Lunes, 2 = Martes, ..., 7 = Domingo</summary>
    public int DayOfWeek { get; set; }
    public string HoraInicio { get; set; } = string.Empty;
    public string HoraFin { get; set; } = string.Empty;
    public bool IsOpen { get; set; }
    public string Nota { get; set; } = string.Empty;
}

public class CreateAmenityScheduleDto
{
    public Guid AmenityId { get; set; }
    public int DayOfWeek { get; set; }
    public string HoraInicio { get; set; } = string.Empty;
    public string HoraFin { get; set; } = string.Empty;
    public bool IsOpen { get; set; }
    public string Nota { get; set; } = string.Empty;
}

public class UpdateAmenityScheduleDto
{
    public int DayOfWeek { get; set; }
    public string HoraInicio { get; set; } = string.Empty;
    public string HoraFin { get; set; } = string.Empty;
    public bool IsOpen { get; set; }
    public string Nota { get; set; } = string.Empty;
}
