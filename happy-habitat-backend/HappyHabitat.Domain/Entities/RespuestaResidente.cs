namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Respuesta de un residente a una pregunta de una encuesta.
/// </summary>
public class RespuestaResidente : AuditBase
{
    public int Id { get; set; }
    public Guid EncuestaId { get; set; }
    public Guid PreguntaId { get; set; }
    public Guid ResidenteId { get; set; }
    public string Respuesta { get; set; } = string.Empty;
    public DateTime FechaRespuesta { get; set; }

    public Encuesta? Encuesta { get; set; }
    public PreguntaEncuesta? PreguntaEncuesta { get; set; }
    public Resident? Resident { get; set; }
}
