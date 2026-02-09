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
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
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
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            if (currentUser != null)
            {
                // Get all role codes from UserRoles, fallback to Role if no UserRoles
                var currentUserRoleCodes = currentUser.UserRoles.Any() 
                    ? currentUser.UserRoles.Select(ur => ur.Role.Code).ToList()
                    : (currentUser.Role != null ? new List<string> { currentUser.Role.Code } : new List<string>());
                
                var allowedRoleCodes = GetAllowedRoleCodesForViewing(currentUserRoleCodes);
                if (allowedRoleCodes.Any())
                {
                    // Filter users that have at least one allowed role
                    query = query.Where(u => 
                        u.UserRoles.Any(ur => allowedRoleCodes.Contains(ur.Role.Code)) ||
                        (u.Role != null && allowedRoleCodes.Contains(u.Role.Code))
                    );
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
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Resident)
                .ThenInclude(r => r!.Community)
            .Include(u => u.UserCommunities)
                .ThenInclude(uc => uc.Community)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return null;

        return MapToUserDto(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto, Guid? currentUserId = null)
    {
        // Prepare role IDs list (support backward compatibility with RoleId)
        var roleIds = new List<Guid>();
        if (createUserDto.RoleId.HasValue)
        {
            roleIds.Add(createUserDto.RoleId.Value);
        }
        if (createUserDto.RoleIds.Any())
        {
            roleIds.AddRange(createUserDto.RoleIds);
        }
        roleIds = roleIds.Distinct().ToList();

        if (!roleIds.Any())
            throw new InvalidOperationException("At least one role is required");

        // Validate permissions if currentUserId is provided
        if (currentUserId.HasValue)
        {
            var currentUser = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Resident)
                    .ThenInclude(r => r!.Community)
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            if (currentUser != null)
            {
                // Get all role codes from UserRoles, fallback to Role if no UserRoles
                var currentUserRoleCodes = currentUser.UserRoles.Any() 
                    ? currentUser.UserRoles.Select(ur => ur.Role.Code).ToList()
                    : (currentUser.Role != null ? new List<string> { currentUser.Role.Code } : new List<string>());

                // Validate each target role
                foreach (var roleId in roleIds)
                {
                    var targetRole = await _context.Roles.FindAsync(roleId);
                    if (targetRole == null)
                        throw new InvalidOperationException($"Role {roleId} not found");

                    ValidateUserCreationPermission(currentUserRoleCodes, targetRole.Code, currentUser.Resident?.CommunityId);
                }
            }
        }

        // Check if username or email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == createUserDto.Username || u.Email == createUserDto.Email);

        if (existingUser != null)
            throw new InvalidOperationException("Username or email already exists");

        // Verify all roles exist
        foreach (var roleId in roleIds)
        {
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
                throw new InvalidOperationException($"Role {roleId} not found");
        }

        // Determine community ID
        Guid? communityId = null;
        if (currentUserId.HasValue && createUserDto.CommunityIds.Any())
        {
            var currentUser = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Resident)
                    .ThenInclude(r => r!.Community)
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            // If current user is ADMIN_COMPANY, use their community
            var currentUserRoleCodesForCommunity = currentUser?.UserRoles.Any() == true
                ? currentUser.UserRoles.Select(ur => ur.Role.Code).ToList()
                : (currentUser?.Role != null ? new List<string> { currentUser.Role.Code } : new List<string>());
            
            if (currentUserRoleCodesForCommunity.Contains("ADMIN_COMPANY") && currentUser?.Resident?.CommunityId != null)
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
            RoleId = roleIds.FirstOrDefault(), // Backward compatibility - set first role
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

        // Create UserRoles for all roles
        foreach (var roleId in roleIds)
        {
            var userRole = new UserRole
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                RoleId = roleId,
                CreatedAt = DateTime.UtcNow.ToString("O")
            };
            _context.UserRoles.Add(userRole);
        }
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

        // Reload user with Resident, UserCommunities, and UserRoles
        var createdUser = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
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
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Resident)
                .ThenInclude(r => r!.Community)
            .Include(u => u.UserCommunities)
                .ThenInclude(uc => uc.Community)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return null;

        // Prepare role IDs list (support backward compatibility with RoleId)
        var roleIds = new List<Guid>();
        if (updateUserDto.RoleId.HasValue)
        {
            roleIds.Add(updateUserDto.RoleId.Value);
        }
        if (updateUserDto.RoleIds.Any())
        {
            roleIds.AddRange(updateUserDto.RoleIds);
        }
        roleIds = roleIds.Distinct().ToList();

        if (!roleIds.Any())
            throw new InvalidOperationException("At least one role is required");

        // Validate permissions if currentUserId is provided
        if (currentUserId.HasValue)
        {
            var currentUser = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Resident)
                    .ThenInclude(r => r!.Community)
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            if (currentUser != null)
            {
                // Get all role codes from UserRoles, fallback to Role if no UserRoles
                var currentUserRoleCodes = currentUser.UserRoles.Any() 
                    ? currentUser.UserRoles.Select(ur => ur.Role.Code).ToList()
                    : (currentUser.Role != null ? new List<string> { currentUser.Role.Code } : new List<string>());

                // Validate each target role
                foreach (var roleId in roleIds)
                {
                    var targetRole = await _context.Roles.FindAsync(roleId);
                    if (targetRole == null)
                        throw new InvalidOperationException($"Role {roleId} not found");

                    ValidateUserCreationPermission(currentUserRoleCodes, targetRole.Code, currentUser.Resident?.CommunityId);
                }
            }
        }

        // Check if username or email already exists (excluding current user)
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => (u.Username == updateUserDto.Username || u.Email == updateUserDto.Email) && u.Id != id);

        if (existingUser != null)
            throw new InvalidOperationException("Username or email already exists");

        // Verify all roles exist
        foreach (var roleId in roleIds)
        {
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
                throw new InvalidOperationException($"Role {roleId} not found");
        }

        // Update UserRoles
        // Remove existing UserRoles
        var existingUserRoles = await _context.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .ToListAsync();
        _context.UserRoles.RemoveRange(existingUserRoles);

        // Add new UserRoles
        foreach (var roleId in roleIds)
        {
            var userRole = new UserRole
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                RoleId = roleId,
                CreatedAt = DateTime.UtcNow.ToString("O")
            };
            _context.UserRoles.Add(userRole);
        }

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
                .Include(u => u.Role)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Resident)
                    .ThenInclude(r => r!.Community)
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            // If current user is ADMIN_COMPANY, use their community
            var currentUserRoleCodesForCommunity = currentUser?.UserRoles.Any() == true
                ? currentUser.UserRoles.Select(ur => ur.Role.Code).ToList()
                : (currentUser?.Role != null ? new List<string> { currentUser.Role.Code } : new List<string>());
            
            if (currentUserRoleCodesForCommunity.Contains("ADMIN_COMPANY") && currentUser?.Resident?.CommunityId != null)
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

        user.RoleId = roleIds.FirstOrDefault(); // Backward compatibility - set first role
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

        // Reload user with Resident, UserCommunities, and UserRoles
        var updatedUser = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
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
        // Get roles from UserRoles, fallback to Role for backward compatibility
        var roles = user.UserRoles.Any() 
            ? user.UserRoles.Select(ur => ur.Role).ToList()
            : (user.Role != null ? new List<Role> { user.Role } : new List<Role>());

        var dto = new UserDto
        {
            Id = user.Id,
            RoleId = roles.FirstOrDefault()?.Id, // Backward compatibility
            RoleCode = roles.FirstOrDefault()?.Code, // Backward compatibility
            Roles = roles.Select(r => new RoleDto
            {
                Id = r.Id,
                Code = r.Code,
                Description = r.Description
            }).ToList(),
            RoleIds = roles.Select(r => r.Id).ToList(),
            RoleCodes = roles.Select(r => r.Code).ToList(),
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

    private List<string> GetAllowedRoleCodesForViewing(List<string> currentUserRoleCodes)
    {
        // If user has SYSTEM_ADMIN role, they can view ADMIN_COMPANY
        if (currentUserRoleCodes.Contains("SYSTEM_ADMIN"))
        {
            return new List<string> { "ADMIN_COMPANY" };
        }
        
        // If user has ADMIN_COMPANY role, they can view RESIDENT, COMITEE_MEMBER, VIGILANCE
        if (currentUserRoleCodes.Contains("ADMIN_COMPANY"))
        {
            return new List<string> { "RESIDENT", "COMITEE_MEMBER", "VIGILANCE" };
        }
        
        return new List<string>();
    }

    private void ValidateUserCreationPermission(List<string> currentUserRoleCodes, string targetRoleCode, Guid? currentUserCommunityId)
    {
        List<string> allowedRoleCodes = new List<string>();
        
        // If user has SYSTEM_ADMIN role, they can create ADMIN_COMPANY
        if (currentUserRoleCodes.Contains("SYSTEM_ADMIN"))
        {
            allowedRoleCodes.Add("ADMIN_COMPANY");
        }
        
        // If user has ADMIN_COMPANY role, they can create RESIDENT, COMITEE_MEMBER, VIGILANCE
        if (currentUserRoleCodes.Contains("ADMIN_COMPANY"))
        {
            allowedRoleCodes.AddRange(new List<string> { "RESIDENT", "COMITEE_MEMBER", "VIGILANCE" });
        }

        if (!allowedRoleCodes.Contains(targetRoleCode))
        {
            throw new UnauthorizedAccessException($"You do not have permission to create users with role {targetRoleCode}");
        }

        // ADMIN_COMPANY must have a community
        if (currentUserRoleCodes.Contains("ADMIN_COMPANY") && !currentUserCommunityId.HasValue)
        {
            throw new InvalidOperationException("Administrator must be associated with a community");
        }
    }
}
