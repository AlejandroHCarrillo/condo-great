namespace HappyHabitat.Application.DTOs;

/// <summary>Pregunta de encuesta en respuestas API (incluye opciones si aplica).</summary>
public class PreguntaEncuestaDto
{
    public Guid Id { get; set; }
    public int TipoPregunta { get; set; }
    public string Pregunta { get; set; } = string.Empty;
    public List<string> Opciones { get; set; } = new();
}

/// <summary>Pregunta a crear/actualizar (sin Id).</summary>
public class CreatePreguntaEncuestaDto
{
    public int TipoPregunta { get; set; }
    public string Pregunta { get; set; } = string.Empty;
    public List<string>? Opciones { get; set; }
}

public class EncuestaDto
{
    public Guid Id { get; set; }
    public Guid CommunityId { get; set; }
    public string? CommunityName { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public bool IsActive { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
    public List<PreguntaEncuestaDto> Preguntas { get; set; } = new();
}

public class CreateEncuestaDto
{
    public Guid CommunityId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CreatePreguntaEncuestaDto>? Preguntas { get; set; }
}

public class UpdateEncuestaDto
{
    public Guid CommunityId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public bool IsActive { get; set; }
    public List<CreatePreguntaEncuestaDto>? Preguntas { get; set; }
}

/// <summary>Una respuesta a una pregunta (para enviar desde el residente).</summary>
public class SubmitRespuestaItemDto
{
    public Guid PreguntaId { get; set; }
    public string Respuesta { get; set; } = string.Empty;
}

/// <summary>Payload para enviar las respuestas de un residente a una encuesta.</summary>
public class SubmitEncuestaRespuestasDto
{
    public List<SubmitRespuestaItemDto> Respuestas { get; set; } = new();
}
