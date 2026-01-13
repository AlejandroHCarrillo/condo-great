using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IChargesService
{
    Task<StatementDto> GetStatementByContratoIdAsync(Guid contratoId);
    Task<StatementDto> GetStatementByComunidadIdAsync(Guid comunidadId);
    Task<IEnumerable<CargoComunidadDto>> GetCargosByComunidadIdAsync(Guid comunidadId);
    Task<IEnumerable<CargoComunidadDto>> GetCargosByContratoIdAsync(Guid contratoId);
}
