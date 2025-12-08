using GreatSoft.HappyHabitat.Domain.Entities;
using Microsoft.EntityFrameworkCore;


namespace GreatSoft.HappyHabitat.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Group> Groups => Set<Group>();

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    }
}
