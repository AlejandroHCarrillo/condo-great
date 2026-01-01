using GreatSoft.HappyHabitat.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace GreatSoft.HappyHabitat.Infrastructure.Persistence.Repositories { 
    public class RepositoryBase<T> : IRepository<T> where T : class
    {
        protected readonly DbContext _context;
        protected readonly DbSet<T> _dbSet;

        public RepositoryBase(DbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<T?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);

        public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            // Don't save here - let UnitOfWork handle it
        }

        public async Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            // Don't save here - let UnitOfWork handle it
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity is not null)
            {
                _dbSet.Remove(entity);
                // Don't save here - let UnitOfWork handle it
            }
        }
    }

}
