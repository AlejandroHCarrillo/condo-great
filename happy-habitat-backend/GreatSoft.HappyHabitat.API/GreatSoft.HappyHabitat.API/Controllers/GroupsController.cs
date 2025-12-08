using GreatSoft.HappyHabitat.Application.UseCases.Groups;
using MediatR;
using Microsoft.AspNetCore.Mvc;


namespace GreatSoft.HappyHabitat.API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GroupsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGroupCommand command)
        {
            var id = await _mediator.Send(command);
            return CreatedAtAction(nameof(Create), new { id }, null);
        }
    }

}
