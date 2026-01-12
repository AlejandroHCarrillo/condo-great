using HappyHabitat.Application.DTOs;

namespace HappyHabitat.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync(Guid? currentUserId = null, bool includeInactive = false);
    Task<UserDto?> GetUserByIdAsync(Guid id, bool includeInactive = false);
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto, Guid? currentUserId = null);
    Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto, Guid? currentUserId = null);
    Task<bool> DeleteUserAsync(Guid id);
    Task<Guid?> GetCurrentUserResidentIdAsync(Guid userId);
}

