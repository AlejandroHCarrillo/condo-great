namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Opción de respuesta para una pregunta de tipo opción única u opción múltiple.
/// </summary>
public class OpcionRespuesta : AuditBase
{
    public Guid Id { get; set; }
    public Guid PreguntaEncuestaId { get; set; }
    public string Respuesta { get; set; } = string.Empty;

    public PreguntaEncuesta? PreguntaEncuesta { get; set; }
}
