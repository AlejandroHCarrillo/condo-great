using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IComunicadoService
{
    Task<IEnumerable<ComunicadoDto>> GetAllComunicadosAsync(bool includeInactive = false);
    Task<IEnumerable<ComunicadoDto>> GetComunicadosPaginatedAsync(int page = 1, int pageSize = 20, bool includeInactive = false);
    Task<IEnumerable<ComunicadoDto>> GetComunicadosByCommunityIdAsync(Guid? communityId, bool includeInactive = false);
    Task<ComunicadoDto?> GetComunicadoByIdAsync(Guid id, bool includeInactive = false);
    Task<ComunicadoDto> CreateComunicadoAsync(CreateComunicadoDto createComunicadoDto);
    Task<ComunicadoDto?> UpdateComunicadoAsync(Guid id, UpdateComunicadoDto updateComunicadoDto);
    Task<bool> DeleteComunicadoAsync(Guid id);
}

