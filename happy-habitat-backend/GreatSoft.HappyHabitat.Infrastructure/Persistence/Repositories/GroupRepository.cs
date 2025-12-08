using GreatSoft.HappyHabitat.Domain.Entities;
using GreatSoft.HappyHabitat.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GreatSoft.HappyHabitat.Infrastructure.Persistence.Repositories
{
    public class GroupRepository : RepositoryBase<Group>, IGroupRepository
    {
        private readonly AppDbContext _context;

        public GroupRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Group>> GetGroupsByUserIdAsync(Guid userId)
        {
            return await _context.Groups
                .Where(g => g.Members.Any(m => m.Id == userId))
                .ToListAsync();
        }
    }



}
