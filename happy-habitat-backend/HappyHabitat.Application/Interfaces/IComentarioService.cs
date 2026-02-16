using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IComentarioService
{
    Task<IEnumerable<ComentarioDto>> GetByOrigenAsync(string origen, string idOrigen);
    Task<ComentarioDto?> GetByIdAsync(int id);
    Task<ComentarioDto> CreateAsync(Guid residentId, CreateComentarioDto dto);
    Task<ComentarioDto?> UpdateAsync(int id, UpdateComentarioDto dto);
    Task<bool> DeleteAsync(int id);
}
