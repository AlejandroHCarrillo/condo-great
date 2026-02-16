namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Encuesta asociada a una comunidad.
/// </summary>
public class Encuesta : AuditBase
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public bool IsActive { get; set; } = true;

    public Community? Community { get; set; }
    public ICollection<PreguntaEncuesta> Preguntas { get; set; } = new List<PreguntaEncuesta>();
    public ICollection<RespuestaResidente> RespuestasResidentes { get; set; } = new List<RespuestaResidente>();
}
