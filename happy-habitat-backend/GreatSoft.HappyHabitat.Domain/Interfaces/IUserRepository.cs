using GreatSoft.HappyHabitat.Domain.Entities;


namespace GreatSoft.HappyHabitat.Domain.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
    }

}
