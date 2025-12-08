using MediatR;

namespace GreatSoft.HappyHabitat.Application.UseCases.Groups
{
    //public class CreateGroupCommand
    public record CreateGroupCommand(string Name, string Description) : IRequest<Guid>;

}
