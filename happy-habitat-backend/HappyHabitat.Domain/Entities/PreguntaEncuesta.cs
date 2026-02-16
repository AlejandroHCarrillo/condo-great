namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Pregunta de una encuesta. El tipo define si tiene opciones (OpcionUnica/OpcionMultiple) o no (Texto/SiNo).
/// </summary>
public class PreguntaEncuesta : AuditBase
{
    public Guid Id { get; set; }
    public Guid EncuestaId { get; set; }
    public TipoPreguntaEncuesta TipoPregunta { get; set; }
    public string Pregunta { get; set; } = string.Empty;

    public Encuesta? Encuesta { get; set; }
    public ICollection<OpcionRespuesta> OpcionesRespuesta { get; set; } = new List<OpcionRespuesta>();
    public ICollection<RespuestaResidente> RespuestasResidentes { get; set; } = new List<RespuestaResidente>();
}
