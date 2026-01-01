using GreatSoft.HappyHabitat.Domain.Entities;

namespace GreatSoft.HappyHabitat.Domain.Interfaces
{
    public interface IComunidadRepository : IRepository<Comunidad>
    {
        Task<IEnumerable<Comunidad>> GetComunidadesByTipoAsync(string tipoComunidadId);
        Task<Comunidad?> GetComunidadWithTipoAsync(string id);
    }
}


