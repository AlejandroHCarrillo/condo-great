using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;

namespace HappyHabitat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Get all users
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers([FromQuery] bool includeInactive = false)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        Guid? currentUserId = null;
        if (userIdClaim != null && Guid.TryParse(userIdClaim, out var userId))
        {
            currentUserId = userId;
        }

        var users = await _userService.GetAllUsersAsync(currentUserId, includeInactive);
        return Ok(users);
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUserById(Guid id, [FromQuery] bool includeInactive = false)
    {
        var user = await _userService.GetUserByIdAsync(id, includeInactive);
        if (user == null)
            return NotFound();

        return Ok(user);
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto createUserDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            Guid? currentUserId = null;
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out var userId))
            {
                currentUserId = userId;
            }

            var user = await _userService.CreateUserAsync(createUserDto, currentUserId);
            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing user
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, UpdateUserDto updateUserDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            Guid? currentUserId = null;
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out var userId))
            {
                currentUserId = userId;
            }

            var user = await _userService.UpdateUserAsync(id, updateUserDto, currentUserId);
            if (user == null)
                return NotFound();

            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    /// <summary>
    /// Delete a user
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var result = await _userService.DeleteUserAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Get current user's resident ID
    /// </summary>
    [HttpGet("me/resident")]
    public async Task<ActionResult<object>> GetCurrentUserResidentId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var residentId = await _userService.GetCurrentUserResidentIdAsync(userId);
        
        // Return null if no resident is associated with the user (e.g., system admins)
        // This is a valid scenario, not an error
        if (residentId == null)
            return Ok(new { residentId = (string?)null });

        return Ok(new { residentId = residentId.ToString() });
    }
}

