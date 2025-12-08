using GreatSoft.HappyHabitat.Domain.Interfaces;
using GreatSoft.HappyHabitat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GreatSoft.HappyHabitat.Infrastructure.Persistence.Repositories
{
    public class UserRepository : RepositoryBase<User>, IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
    }

}
