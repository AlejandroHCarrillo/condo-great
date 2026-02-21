namespace HappyHabitat.API.Models;

/// <summary>
/// Formato estándar de respuesta de error de la API.
/// </summary>
public class ApiErrorResponse
{
    /// <summary>Código de error (ej. "VALIDATION_ERROR", "NOT_FOUND").</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Mensaje legible para el cliente.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Errores de validación por campo (opcional).</summary>
    public IDictionary<string, string[]>? Errors { get; set; }

    /// <summary>TraceId para correlación en logs (solo en desarrollo si se desea).</summary>
    public string? TraceId { get; set; }
}
