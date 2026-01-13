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

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync(Guid? currentUserId = null, bool includeInactive = false)
    {
        var query = _context.Users
            .AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(u => u.IsActive);
        }
        
        query = query
            .Include(u => u.Role)
            .Include(u => u.Resident)
                .ThenInclude(r => r!.Community)
            .Include(u => u.UserCommunities)
                .ThenInclude(uc => uc.Community)
            .AsQueryable();

        // Filter by permissions if currentUserId is provided
        if (currentUserId.HasValue)
        {
            var currentUser = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            if (currentUser != null)
            {
                var allowedRoleCodes = GetAllowedRoleCodesForViewing(currentUser.Role.Code);
                if (allowedRoleCodes.Any())
                {
                    query = query.Where(u => allowedRoleCodes.Contains(u.Role.Code));
                }
                else
                {
                    // User has no permission to view any users
                    return new List<UserDto>();
                }
            }
        }

        var users = await query.ToListAsync();

        return users.Select(u => MapToUserDto(u));
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id, bool includeInactive = false)
    {
        var query = _context.Users
            .AsQueryable();
        
        // Filtrar por IsActive solo si includeInactive es false
        if (!includeInactive)
        {
            query = query.Where(u => u.IsActive);
        }
        
        var user = await query
            .Include(u => u.Role)
            .Include(u => u.Resident)
                .ThenInclude(r => r!.Community)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return null;

        return MapToUserDto(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto, Guid? currentUserId = null)
    {
        // Validate permissions if currentUserId is provided
        if (currentUserId.HasValue)
        {
            var currentUser = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Resident)
                    .ThenInclude(r => r!.Community)
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            if (currentUser != null)
            {
                var targetRole = await _context.Roles.FindAsync(createUserDto.RoleId);
                if (targetRole == null)
                    throw new InvalidOperationException("Role not found");

                ValidateUserCreationPermission(currentUser.Role.Code, targetRole.Code, currentUser.Resident?.CommunityId);
            }
        }

        // Check if username or email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == createUserDto.Username || u.Email == createUserDto.Email);

        if (existingUser != null)
            throw new InvalidOperationException("Username or email already exists");

        // Verify role exists
        var role = await _context.Roles.FindAsync(createUserDto.RoleId);
        if (role == null)
            throw new InvalidOperationException("Role not found");

        // Determine community ID
        Guid? communityId = null;
        if (currentUserId.HasValue && createUserDto.CommunityIds.Any())
        {
            var currentUser = await _context.Users
                .Include(u => u.Resident)
                    .ThenInclude(r => r!.Community)
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            // If current user is ADMIN_COMPANY, use their community
            if (currentUser?.Role.Code == "ADMIN_COMPANY" && currentUser.Resident?.CommunityId != null)
            {
                communityId = currentUser.Resident.CommunityId;
            }
            else if (createUserDto.CommunityIds.Any())
            {
                // Use the first community ID from the request
                communityId = createUserDto.CommunityIds.First();
            }
        }
        else if (createUserDto.CommunityIds.Any())
        {
            communityId = createUserDto.CommunityIds.First();
        }

        // Verify community exists if provided
        if (communityId.HasValue)
        {
            var community = await _context.Communities.FindAsync(communityId.Value);
            if (community == null)
                throw new InvalidOperationException("Community not found");
        }

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

        // Create UserCommunities if UserCommunityIds are provided
        if (createUserDto.UserCommunityIds.Any())
        {
            foreach (var ucCommunityId in createUserDto.UserCommunityIds)
            {
                // Verify community exists
                var ucCommunity = await _context.Communities.FindAsync(ucCommunityId);
                if (ucCommunity == null)
                    throw new InvalidOperationException($"Community {ucCommunityId} not found");

                var userCommunity = new UserCommunity
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    CommunityId = ucCommunityId,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                };

                _context.UserCommunities.Add(userCommunity);
            }
            await _context.SaveChangesAsync();
        }

        // Create Resident if ResidentInfo is provided
        if (createUserDto.ResidentInfo != null)
        {
            var resident = new Resident
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CommunityId = communityId,
                FullName = createUserDto.ResidentInfo.FullName,
                Email = createUserDto.ResidentInfo.Email,
                Phone = createUserDto.ResidentInfo.Phone,
                Number = createUserDto.ResidentInfo.Number,
                Address = createUserDto.ResidentInfo.Address,
                CreatedAt = DateTime.UtcNow.ToString("O")
            };

            _context.Residents.Add(resident);
            await _context.SaveChangesAsync();
        }

        // Reload user with Resident and UserCommunities
        var createdUser = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Resident)
                .ThenInclude(r => r!.Community)
            .Include(u => u.UserCommunities)
                .ThenInclude(uc => uc.Community)
            .FirstOrDefaultAsync(u => u.Id == user.Id);

        return MapToUserDto(createdUser!);
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto, Guid? currentUserId = null)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Resident)
                .ThenInclude(r => r!.Community)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return null;

        // Validate permissions if currentUserId is provided
        if (currentUserId.HasValue)
        {
            var currentUser = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Resident)
                    .ThenInclude(r => r!.Community)
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            if (currentUser != null)
            {
                var targetRole = await _context.Roles.FindAsync(updateUserDto.RoleId);
                if (targetRole == null)
                    throw new InvalidOperationException("Role not found");

                ValidateUserCreationPermission(currentUser.Role.Code, targetRole.Code, currentUser.Resident?.CommunityId);
            }
        }

        // Check if username or email already exists (excluding current user)
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => (u.Username == updateUserDto.Username || u.Email == updateUserDto.Email) && u.Id != id);

        if (existingUser != null)
            throw new InvalidOperationException("Username or email already exists");

        // Verify role exists
        var role = await _context.Roles.FindAsync(updateUserDto.RoleId);
        if (role == null)
            throw new InvalidOperationException("Role not found");

        // Update UserCommunities
        if (updateUserDto.UserCommunityIds.Any())
        {
            // Remove existing UserCommunities
            var existingUserCommunities = await _context.UserCommunities
                .Where(uc => uc.UserId == user.Id)
                .ToListAsync();
            _context.UserCommunities.RemoveRange(existingUserCommunities);

            // Add new UserCommunities
            foreach (var ucCommunityId in updateUserDto.UserCommunityIds)
            {
                // Verify community exists
                var ucCommunity = await _context.Communities.FindAsync(ucCommunityId);
                if (ucCommunity == null)
                    throw new InvalidOperationException($"Community {ucCommunityId} not found");

                var userCommunity = new UserCommunity
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    CommunityId = ucCommunityId,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                };

                _context.UserCommunities.Add(userCommunity);
            }
        }
        else
        {
            // Remove UserCommunities if none are provided
            var existingUserCommunities = await _context.UserCommunities
                .Where(uc => uc.UserId == user.Id)
                .ToListAsync();
            if (existingUserCommunities.Any())
            {
                _context.UserCommunities.RemoveRange(existingUserCommunities);
            }
        }

        // Determine community ID
        Guid? communityId = null;
        if (currentUserId.HasValue && updateUserDto.CommunityIds.Any())
        {
            var currentUser = await _context.Users
                .Include(u => u.Resident)
                    .ThenInclude(r => r!.Community)
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            // If current user is ADMIN_COMPANY, use their community
            if (currentUser?.Role.Code == "ADMIN_COMPANY" && currentUser.Resident?.CommunityId != null)
            {
                communityId = currentUser.Resident.CommunityId;
            }
            else if (updateUserDto.CommunityIds.Any())
            {
                // Use the first community ID from the request
                communityId = updateUserDto.CommunityIds.First();
            }
        }
        else if (updateUserDto.CommunityIds.Any())
        {
            communityId = updateUserDto.CommunityIds.First();
        }

        // Verify community exists if provided
        if (communityId.HasValue)
        {
            var community = await _context.Communities.FindAsync(communityId.Value);
            if (community == null)
                throw new InvalidOperationException("Community not found");
        }

        user.RoleId = updateUserDto.RoleId;
        user.FirstName = updateUserDto.FirstName;
        user.LastName = updateUserDto.LastName;
        user.Username = updateUserDto.Username;
        user.Email = updateUserDto.Email;
        user.IsActive = updateUserDto.IsActive;

        // Update or create Resident
        if (updateUserDto.ResidentInfo != null)
        {
            var resident = await _context.Residents.FirstOrDefaultAsync(r => r.UserId == user.Id);
            
            if (resident == null)
            {
                // Create new resident
                resident = new Resident
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    CommunityId = communityId,
                    FullName = updateUserDto.ResidentInfo.FullName,
                    Email = updateUserDto.ResidentInfo.Email,
                    Phone = updateUserDto.ResidentInfo.Phone,
                    Number = updateUserDto.ResidentInfo.Number,
                    Address = updateUserDto.ResidentInfo.Address,
                    CreatedAt = DateTime.UtcNow.ToString("O")
                };
                _context.Residents.Add(resident);
            }
            else
            {
                // Update existing resident
                resident.CommunityId = communityId;
                resident.FullName = updateUserDto.ResidentInfo.FullName;
                resident.Email = updateUserDto.ResidentInfo.Email;
                resident.Phone = updateUserDto.ResidentInfo.Phone;
                resident.Number = updateUserDto.ResidentInfo.Number;
                resident.Address = updateUserDto.ResidentInfo.Address;
            }
        }
        else if (communityId.HasValue)
        {
            // Update community even if ResidentInfo is not provided
            var resident = await _context.Residents.FirstOrDefaultAsync(r => r.UserId == user.Id);
            if (resident != null)
            {
                resident.CommunityId = communityId;
            }
        }

        await _context.SaveChangesAsync();

        // Reload user with Resident and UserCommunities
        var updatedUser = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Resident)
                .ThenInclude(r => r!.Community)
            .Include(u => u.UserCommunities)
                .ThenInclude(uc => uc.Community)
            .FirstOrDefaultAsync(u => u.Id == user.Id);

        return MapToUserDto(updatedUser!);
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return false;

        // Eliminación lógica: cambiar IsActive a false
        user.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Guid?> GetCurrentUserResidentIdAsync(Guid userId)
    {
        var resident = await _context.Residents
            .FirstOrDefaultAsync(r => r.UserId == userId);

        return resident?.Id;
    }

    private UserDto MapToUserDto(User user)
    {
        var dto = new UserDto
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

        if (user.Resident != null)
        {
            dto.ResidentInfo = new ResidentInfoDto
            {
                Id = user.Resident.Id,
                FullName = user.Resident.FullName,
                Email = user.Resident.Email,
                Phone = user.Resident.Phone,
                Number = user.Resident.Number,
                Address = user.Resident.Address,
                CommunityId = user.Resident.CommunityId,
                CommunityIds = user.Resident.CommunityId.HasValue 
                    ? new List<Guid> { user.Resident.CommunityId.Value } 
                    : new List<Guid>()
            };
        }

        // Map UserCommunities for all users
        if (user.UserCommunities.Any())
        {
            dto.UserCommunityIds = user.UserCommunities
                .Select(uc => uc.CommunityId)
                .ToList();
        }

        return dto;
    }

    private List<string> GetAllowedRoleCodesForViewing(string currentUserRoleCode)
    {
        return currentUserRoleCode switch
        {
            "SYSTEM_ADMIN" => new List<string> { "ADMIN_COMPANY" },
            "ADMIN_COMPANY" => new List<string> { "RESIDENT", "COMITEE_MEMBER", "VIGILANCE" },
            _ => new List<string>()
        };
    }

    private void ValidateUserCreationPermission(string currentUserRoleCode, string targetRoleCode, Guid? currentUserCommunityId)
    {
        var allowedRoleCodes = currentUserRoleCode switch
        {
            "SYSTEM_ADMIN" => new List<string> { "ADMIN_COMPANY" },
            "ADMIN_COMPANY" => new List<string> { "RESIDENT", "COMITEE_MEMBER", "VIGILANCE" },
            _ => new List<string>()
        };

        if (!allowedRoleCodes.Contains(targetRoleCode))
        {
            throw new UnauthorizedAccessException($"You do not have permission to create users with role {targetRoleCode}");
        }

        // ADMIN_COMPANY must have a community
        if (currentUserRoleCode == "ADMIN_COMPANY" && !currentUserCommunityId.HasValue)
        {
            throw new InvalidOperationException("Administrator must be associated with a community");
        }
    }
}
