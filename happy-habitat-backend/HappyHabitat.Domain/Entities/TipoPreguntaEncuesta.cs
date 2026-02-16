namespace HappyHabitat.Domain.Entities;

/// <summary>
/// Tipo de pregunta de una encuesta: texto libre, sí/no, opción única o opción múltiple.
/// </summary>
public enum TipoPreguntaEncuesta
{
    Texto = 0,
    SiNo = 1,
    OpcionUnica = 2,
    OpcionMultiple = 3
}
