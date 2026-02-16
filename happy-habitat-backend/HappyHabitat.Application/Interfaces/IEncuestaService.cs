using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IEncuestaService
{
    Task<IEnumerable<EncuestaDto>> GetAllAsync();
    Task<IEnumerable<EncuestaDto>> GetByCommunityIdAsync(Guid communityId);
    Task<EncuestaDto?> GetByIdAsync(Guid id);
    Task<EncuestaDto> CreateAsync(CreateEncuestaDto dto);
    Task<EncuestaDto?> UpdateAsync(Guid id, UpdateEncuestaDto dto);
    Task<bool> DeleteAsync(Guid id);
    /// <summary>Envía las respuestas de un residente a una encuesta. Valida que la encuesta esté activa y en fechas.</summary>
    Task SubmitRespuestasAsync(Guid encuestaId, Guid residentId, SubmitEncuestaRespuestasDto dto);
}
