using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IProveedorServicioService
{
    Task<IEnumerable<ProveedorServicioDto>> GetAllAsync(bool includeInactive = false);
    Task<IEnumerable<ProveedorServicioDto>> GetByCommunityIdAsync(Guid? communityId, bool includeInactive = false);
    Task<ProveedorServicioDto?> GetByIdAsync(Guid id, bool includeInactive = false);
    Task<ProveedorServicioDto> CreateAsync(CreateProveedorServicioDto dto);
    Task<ProveedorServicioDto?> UpdateAsync(Guid id, UpdateProveedorServicioDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<ProveedorServicioDto?> CalificarAsync(Guid id, Guid userId, decimal puntuacion);
}
