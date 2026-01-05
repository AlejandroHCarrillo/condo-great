using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IComunicadoService
{
    Task<IEnumerable<ComunicadoDto>> GetAllComunicadosAsync();
    Task<IEnumerable<ComunicadoDto>> GetComunicadosPaginatedAsync(int page = 1, int pageSize = 20);
    Task<IEnumerable<ComunicadoDto>> GetComunicadosByCommunityIdAsync(Guid? communityId);
    Task<ComunicadoDto?> GetComunicadoByIdAsync(Guid id);
    Task<ComunicadoDto> CreateComunicadoAsync(CreateComunicadoDto createComunicadoDto);
    Task<ComunicadoDto?> UpdateComunicadoAsync(Guid id, UpdateComunicadoDto updateComunicadoDto);
    Task<bool> DeleteComunicadoAsync(Guid id);
}

