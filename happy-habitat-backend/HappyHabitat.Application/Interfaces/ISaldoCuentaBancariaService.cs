using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface ISaldoCuentaBancariaService
{
    Task<IEnumerable<SaldoCuentaBancariaDto>> GetAllAsync();
    Task<IEnumerable<SaldoCuentaBancariaDto>> GetByCommunityIdAsync(Guid communityId);
    Task<SaldoCuentaBancariaDto?> GetByIdAsync(int id);
    Task<SaldoCuentaBancariaDto> CreateAsync(CreateSaldoCuentaBancariaDto dto);
    Task<SaldoCuentaBancariaDto?> UpdateAsync(int id, UpdateSaldoCuentaBancariaDto dto);
    Task<bool> DeleteAsync(int id);
}
