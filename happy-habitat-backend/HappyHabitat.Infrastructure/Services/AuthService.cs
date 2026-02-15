using Microsoft.EntityFrameworkCore;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;

namespace HappyHabitat.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasherService _passwordHasher;

    public AuthService(ApplicationDbContext context, IJwtService jwtService, IPasswordHasherService passwordHasher)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Resident)
                .ThenInclude(r => r.Community)
            .Include(u => u.UserCommunities)
                .ThenInclude(uc => uc.Community)
            .FirstOrDefaultAsync(u => u.Username == loginDto.Username && u.IsActive);

        // Debug logging (remove in production)
        if (user == null)
        {
            // Check if user exists but is inactive
            var inactiveUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username);
            if (inactiveUser != null)
            {
                throw new InvalidOperationException("User account is inactive");
            }
            return null;
        }

        // Verify password using hash
        if (!_passwordHasher.VerifyPassword(user.Password, loginDto.Password))
            return null;

        // Get roles from UserRoles, fallback to Role for backward compatibility
        var roles = user.UserRoles.Any() 
            ? user.UserRoles.Select(ur => ur.Role).ToList()
            : (user.Role != null ? new List<Role> { user.Role } : new List<Role>());

        if (!roles.Any())
            throw new InvalidOperationException("User has no roles assigned");

        // Use first role for JWT token (backward compatibility)
        var primaryRole = roles.First();
        var token = _jwtService.GenerateToken(user, primaryRole);
        var expiresAt = DateTime.UtcNow.AddMinutes(60);

        var response = new LoginResponseDto
        {
            Token = token,
            UserId = user.Id.ToString(),
            Username = user.Username,
            Email = user.Email,
            Role = primaryRole.Code, // Backward compatibility
            Roles = roles.Select(r => r.Code).ToList(),
            RoleDetails = roles.Select(r => new RoleDto
            {
                Id = r.Id,
                Code = r.Code,
                Description = r.Description
            }).ToList(),
            ExpiresAt = expiresAt.ToString("O")
        };

        // Add resident info if exists
        if (user.Resident != null)
        {
            // Load communities from UserCommunities
            var comunidadesList = new List<string>();
            CommunityDto? communityDto = null;
            
            // Get communities from UserCommunities
            var comunidadesCompletasList = new List<CommunityDto>();
            if (user.UserCommunities.Any())
            {
                foreach (var uc in user.UserCommunities)
                {
                    comunidadesList.Add(uc.CommunityId.ToString());
                    // Add full community information
                    if (uc.Community != null)
                    {
                        comunidadesCompletasList.Add(new CommunityDto
                        {
                            Id = uc.Community.Id.ToString(),
                            Nombre = uc.Community.Nombre,
                            Descripcion = uc.Community.Descripcion,
                            Direccion = uc.Community.Direccion,
                            Contacto = uc.Community.Contacto,
                            Email = uc.Community.Email,
                            Phone = uc.Community.Phone
                        });
                    }
                }
                // Use first community for backward compatibility
                var firstCommunity = user.UserCommunities.First().Community;
                if (firstCommunity != null)
                {
                    communityDto = new CommunityDto
                    {
                        Id = firstCommunity.Id.ToString(),
                        Nombre = firstCommunity.Nombre,
                        Descripcion = firstCommunity.Descripcion,
                        Direccion = firstCommunity.Direccion,
                        Contacto = firstCommunity.Contacto,
                        Email = firstCommunity.Email,
                        Phone = firstCommunity.Phone
                    };
                }
            }
            // Fallback to Resident.CommunityId for backward compatibility
            else if (user.Resident.CommunityId.HasValue)
            {
                var community = await _context.Communities.FindAsync(user.Resident.CommunityId.Value);
                if (community != null)
                {
                    communityDto = new CommunityDto
                    {
                        Id = community.Id.ToString(),
                        Nombre = community.Nombre,
                        Descripcion = community.Descripcion,
                        Direccion = community.Direccion,
                        Contacto = community.Contacto,
                        Email = community.Email,
                        Phone = community.Phone
                    };
                    comunidadesList.Add(community.Id.ToString());
                    comunidadesCompletasList.Add(communityDto);
                }
            }
            
            string[]? comunidades = comunidadesList.Any() ? comunidadesList.ToArray() : null;
            List<CommunityDto>? comunidadesCompletas = comunidadesCompletasList.Any() ? comunidadesCompletasList : null;

            response.ResidentInfo = new LoginResidentInfoDto
            {
                Id = user.Resident.Id.ToString(),
                Fullname = user.Resident.FullName,
                Email = user.Resident.Email,
                Phone = user.Resident.Phone,
                Number = user.Resident.Number,
                Address = user.Resident.Address,
                Comunidades = comunidades, // Backward compatibility
                Comunidad = communityDto, // Backward compatibility
                ComunidadesCompletas = comunidadesCompletas // All communities with full information
            };
        }
        // Handle users with communities but no resident info (e.g., ADMIN_COMPANY)
        else if (user.UserCommunities.Any())
        {
            var comunidadesList = new List<string>();
            var comunidadesCompletasList = new List<CommunityDto>();
            CommunityDto? communityDto = null;

            foreach (var uc in user.UserCommunities)
            {
                comunidadesList.Add(uc.CommunityId.ToString());
                // Add full community information
                if (uc.Community != null)
                {
                    var communityInfo = new CommunityDto
                    {
                        Id = uc.Community.Id.ToString(),
                        Nombre = uc.Community.Nombre,
                        Descripcion = uc.Community.Descripcion,
                        Direccion = uc.Community.Direccion,
                        Contacto = uc.Community.Contacto,
                        Email = uc.Community.Email,
                        Phone = uc.Community.Phone
                    };
                    comunidadesCompletasList.Add(communityInfo);
                    
                    // Use first community for backward compatibility
                    if (communityDto == null)
                    {
                        communityDto = communityInfo;
                    }
                }
            }

            string[]? comunidades = comunidadesList.Any() ? comunidadesList.ToArray() : null;
            List<CommunityDto>? comunidadesCompletas = comunidadesCompletasList.Any() ? comunidadesCompletasList : null;

            response.ResidentInfo = new LoginResidentInfoDto
            {
                Fullname = $"{user.FirstName} {user.LastName}".Trim(),
                Email = user.Email,
                Address = string.Empty,
                Comunidades = comunidades, // Backward compatibility
                Comunidad = communityDto, // Backward compatibility
                ComunidadesCompletas = comunidadesCompletas // All communities with full information
            };
        }

        return response;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        // Check if username already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == registerDto.Username || u.Email == registerDto.Email);

        if (existingUser != null)
            throw new InvalidOperationException("Username or email already exists");

        // Verify role exists
        var role = await _context.Roles.FindAsync(registerDto.RoleId);
        if (role == null)
            throw new InvalidOperationException("Role not found");

        var user = new User
        {
            Id = Guid.NewGuid(),
            RoleId = registerDto.RoleId,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Username = registerDto.Username,
            Email = registerDto.Email,
            Password = _passwordHasher.HashPassword(registerDto.Password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Reload user with role
        await _context.Entry(user).Reference(u => u.Role).LoadAsync();

        var token = _jwtService.GenerateToken(user, role);

        return new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                RoleId = user.RoleId,
                RoleCode = role.Code,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Username = user.Username,
                Email = user.Email,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt.ToString("O")
            },
            ExpiresAt = DateTime.UtcNow.AddMinutes(60)
        };
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        // Verify current password using hash
        if (!_passwordHasher.VerifyPassword(user.Password, changePasswordDto.CurrentPassword))
            return false;

        user.Password = _passwordHasher.HashPassword(changePasswordDto.NewPassword);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == forgotPasswordDto.Email && u.IsActive);

        if (user == null)
            return false;

        // In a real application, you would:
        // 1. Generate a password reset token
        // 2. Store it in the database with an expiration time
        // 3. Send an email with a link to reset the password
        // For now, we'll just return true to indicate the user was found
        // In production, implement proper password reset flow

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        // In a real application, you would:
        // 1. Validate the reset token
        // 2. Check if it's expired
        // 3. Update the password
        // For now, we'll just find the user by email and update the password
        // In production, implement proper token validation

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == resetPasswordDto.Email && u.IsActive);

        if (user == null)
            return false;

        // TODO: Validate token in production
        user.Password = _passwordHasher.HashPassword(resetPasswordDto.NewPassword);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenDto refreshTokenDto)
    {
        // In a real application, you would:
        // 1. Validate the refresh token
        // 2. Check if it's expired
        // 3. Generate a new access token
        // For now, we'll return null (not implemented)
        // In production, implement proper refresh token validation

        // TODO: Implement refresh token validation
        await Task.CompletedTask;
        return null;
    }
}
