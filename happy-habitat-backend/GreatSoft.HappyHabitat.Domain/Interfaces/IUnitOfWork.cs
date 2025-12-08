namespace GreatSoft.HappyHabitat.Domain.Interfaces { 
    public interface IUnitOfWork
    {
        Task<int> SaveChangesAsync();
    }

}
