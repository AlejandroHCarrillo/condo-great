using GreatSoft.HappyHabitat.Domain.Entities;
using GreatSoft.HappyHabitat.Domain.Interfaces;
using MediatR;


namespace GreatSoft.HappyHabitat.Application.UseCases.Groups
{
    public class CreateGroupHandler : IRequestHandler<CreateGroupCommand, Guid>
    {
        private readonly IGroupRepository _repo;

        public CreateGroupHandler(IGroupRepository repo)
        {
            _repo = repo;
        }

        public async Task<Guid> Handle(CreateGroupCommand request, CancellationToken cancellationToken)
        {
            var group = new Group(request.Name, request.Description);
            await _repo.AddAsync(group);
            return group.Id;
        }
    }

}
