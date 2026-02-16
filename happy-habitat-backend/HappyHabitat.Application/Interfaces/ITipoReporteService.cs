using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface ITipoReporteService
{
    Task<IEnumerable<TipoReporteDto>> GetAllAsync();
    Task<TipoReporteDto?> GetByIdAsync(int id);
}
