using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IContratoService
{
    Task<IEnumerable<ContratoDto>> GetAllContratosAsync(bool includeInactive = false);
    Task<IEnumerable<ContratoDto>> GetContratosByCommunityIdAsync(Guid communityId, bool includeInactive = false);
    Task<ContratoDto?> GetContratoByIdAsync(Guid id, bool includeInactive = false);
    Task<ContratoDto> CreateContratoAsync(CreateContratoDto createContratoDto, Guid? updatedByUserId = null);
    Task<ContratoDto?> UpdateContratoAsync(Guid id, UpdateContratoDto updateContratoDto, Guid? updatedByUserId = null);
    Task<bool> DeleteContratoAsync(Guid id);
}


