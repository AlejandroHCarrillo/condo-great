using GreatSoft.HappyHabitat.Domain.Entities;

namespace GreatSoft.HappyHabitat.Domain.Interfaces
{
    public interface IGroupRepository : IRepository<Group>
    {
        Task<IEnumerable<Group>> GetGroupsByUserIdAsync(Guid userId);
    }

}
