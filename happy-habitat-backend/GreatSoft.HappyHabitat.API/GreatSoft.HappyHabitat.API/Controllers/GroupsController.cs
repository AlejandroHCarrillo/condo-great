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
        private readonly ILogger<GroupsController> _logger;

        public GroupsController(IMediator mediator, ILogger<GroupsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGroupCommand command)
        {
            try
            {
                if (command == null)
                {
                    return BadRequest(new { error = "Command cannot be null" });
                }

                var id = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetById), new { id }, new { id });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error creating group");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating group");
                return StatusCode(500, new { error = "An error occurred while creating the group" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            // TODO: Implement GetById handler
            return NotFound();
        }
    }

}
