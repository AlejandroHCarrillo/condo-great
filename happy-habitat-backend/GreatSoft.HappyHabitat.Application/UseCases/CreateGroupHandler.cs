using GreatSoft.HappyHabitat.Domain.Entities;
using GreatSoft.HappyHabitat.Domain.Interfaces;
using MediatR;


namespace GreatSoft.HappyHabitat.Application.UseCases.Groups
{
    public class CreateGroupHandler : IRequestHandler<CreateGroupCommand, Guid>
    {
        private readonly IGroupRepository _repo;
        private readonly IUnitOfWork _unitOfWork;

        public CreateGroupHandler(IGroupRepository repo, IUnitOfWork unitOfWork)
        {
            _repo = repo;
            _unitOfWork = unitOfWork;
        }

        public async Task<Guid> Handle(CreateGroupCommand request, CancellationToken cancellationToken)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Group name cannot be empty", nameof(request.Name));
            }

            var group = new Group(request.Name, request.Description ?? string.Empty);
            await _repo.AddAsync(group);
            await _unitOfWork.SaveChangesAsync();
            
            return group.Id;
        }
    }

}
