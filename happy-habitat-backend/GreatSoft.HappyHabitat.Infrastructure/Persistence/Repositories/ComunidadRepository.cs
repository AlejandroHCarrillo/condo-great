using GreatSoft.HappyHabitat.Domain.Entities;
using GreatSoft.HappyHabitat.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GreatSoft.HappyHabitat.Infrastructure.Persistence.Repositories
{
    public class ComunidadRepository : RepositoryBase<Comunidad>, IComunidadRepository
    {
        private readonly AppDbContext _context;

        public ComunidadRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Comunidad>> GetComunidadesByTipoAsync(string tipoComunidadId)
        {
            return await _context.Comunidades
                .Where(c => c.TipoComunidadId == tipoComunidadId)
                .ToListAsync();
        }

        public async Task<Comunidad?> GetComunidadWithTipoAsync(string id)
        {
            return await _context.Comunidades
                .Include(c => c.TipoComunidad)
                .FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}


