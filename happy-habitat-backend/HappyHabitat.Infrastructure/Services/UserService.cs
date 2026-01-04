using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;

    public UserService(ApplicationDbContext context, IPasswordHasherService passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .ToListAsync();

        return users.Select(u => new UserDto
        {
            Id = u.Id,
            RoleId = u.RoleId,
            RoleCode = u.Role.Code,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Username = u.Username,
            Email = u.Email,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        });
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return null;

        return new UserDto
        {
            Id = user.Id,
            RoleId = user.RoleId,
            RoleCode = user.Role.Code,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Username = user.Username,
            Email = user.Email,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        // Check if username or email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == createUserDto.Username || u.Email == createUserDto.Email);

        if (existingUser != null)
            throw new InvalidOperationException("Username or email already exists");

        // Verify role exists
        var role = await _context.Roles.FindAsync(createUserDto.RoleId);
        if (role == null)
            throw new InvalidOperationException("Role not found");

        var user = new User
        {
            Id = Guid.NewGuid(),
            RoleId = createUserDto.RoleId,
            FirstName = createUserDto.FirstName,
            LastName = createUserDto.LastName,
            Username = createUserDto.Username,
            Email = createUserDto.Email,
            Password = _passwordHasher.HashPassword(createUserDto.Password),
            IsActive = createUserDto.IsActive,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            RoleId = user.RoleId,
            RoleCode = role.Code,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Username = user.Username,
            Email = user.Email,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return null;

        // Check if username or email already exists (excluding current user)
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => (u.Username == updateUserDto.Username || u.Email == updateUserDto.Email) && u.Id != id);

        if (existingUser != null)
            throw new InvalidOperationException("Username or email already exists");

        // Verify role exists
        var role = await _context.Roles.FindAsync(updateUserDto.RoleId);
        if (role == null)
            throw new InvalidOperationException("Role not found");

        user.RoleId = updateUserDto.RoleId;
        user.FirstName = updateUserDto.FirstName;
        user.LastName = updateUserDto.LastName;
        user.Username = updateUserDto.Username;
        user.Email = updateUserDto.Email;
        user.IsActive = updateUserDto.IsActive;

        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            RoleId = user.RoleId,
            RoleCode = role.Code,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Username = user.Username,
            Email = user.Email,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Guid?> GetCurrentUserResidentIdAsync(Guid userId)
    {
        var resident = await _context.Residents
            .FirstOrDefaultAsync(r => r.UserId == userId);

        return resident?.Id;
    }
}
