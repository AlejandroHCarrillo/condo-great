using Microsoft.EntityFrameworkCore;
using HappyHabitat.Domain.Entities;
using HappyHabitat.Infrastructure.Data;
using HappyHabitat.Infrastructure.Services;

namespace HappyHabitat.Infrastructure.Seeders;

public class InitialSeeder : IDataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;

    public InitialSeeder(ApplicationDbContext context, IPasswordHasherService passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task SeedAsync()
    {
        // Seed Roles if they don't exist
        if (!await _context.Roles.AnyAsync())
        {
            var roles = new[]
            {
                new Role { Id = new Guid("11111111-1111-1111-1111-111111111111"), Code = "SYSTEM_ADMIN", Description = "System Administrator" },
                new Role { Id = new Guid("22222222-2222-2222-2222-222222222222"), Code = "ADMIN_COMPANY", Description = "Company Administrator" },
                new Role { Id = new Guid("33333333-3333-3333-3333-333333333333"), Code = "COMITEE_MEMBER", Description = "Committee Member" },
                new Role { Id = new Guid("44444444-4444-4444-4444-444444444444"), Code = "RESIDENT", Description = "Resident" },
                new Role { Id = new Guid("55555555-5555-5555-5555-555555555555"), Code = "RENTER", Description = "Tenant" },
                new Role { Id = new Guid("66666666-6666-6666-6666-666666666666"), Code = "VIGILANCE", Description = "Vigilance" }
            };

            await _context.Roles.AddRangeAsync(roles);
            await _context.SaveChangesAsync();
        }

        // Seed Vehicle Types if they don't exist
        if (!await _context.VehicleTypes.AnyAsync())
        {
            var vehicleTypes = new[]
            {
                new VehicleType { Id = new Guid("77777777-7777-7777-7777-777777777777"), Name = "Car", Description = "Automobile" },
                new VehicleType { Id = new Guid("88888888-8888-8888-8888-888888888888"), Name = "Motorcycle", Description = "Motorcycle" },
                new VehicleType { Id = new Guid("99999999-9999-9999-9999-999999999999"), Name = "Truck", Description = "Truck" },
                new VehicleType { Id = new Guid("AAAAAAAA-BBBB-BBBB-BBBB-BBBBBBBBBBBB"), Name = "SUV", Description = "Sport Utility Vehicle" },
                new VehicleType { Id = new Guid("BBBBBBBB-CCCC-CCCC-CCCC-CCCCCCCCCCCC"), Name = "Van", Description = "Van" }
            };

            await _context.VehicleTypes.AddRangeAsync(vehicleTypes);
            await _context.SaveChangesAsync();
        }

        // Seed initial admin user if it doesn't exist
        var systemAdminRoleId = new Guid("11111111-1111-1111-1111-111111111111");
        var initialUserId = new Guid("AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA");

        // Check if user exists by username or ID
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == initialUserId || u.Username == "elgrandeahc");

        if (existingUser == null)
        {
            var initialUser = new User
            {
                Id = initialUserId,
                RoleId = systemAdminRoleId,
                FirstName = "Alejandro",
                LastName = "Hernandez",
                Username = "elgrandeahc",
                Email = "elgrandeahc@happyhabitat.com",
                Password = _passwordHasher.HashPassword("abc123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("O")
            };

            await _context.Users.AddAsync(initialUser);
            await _context.SaveChangesAsync();
        }
        else
        {
            // Update existing user to ensure correct username, role, password and required fields
            existingUser.FirstName = string.IsNullOrEmpty(existingUser.FirstName) ? "Alejandro" : existingUser.FirstName;
            existingUser.LastName = string.IsNullOrEmpty(existingUser.LastName) ? "Hernandez Carrillo" : existingUser.LastName;
            existingUser.Email = string.IsNullOrEmpty(existingUser.Email) ? "elgrandeahc@happyhabitat.com" : existingUser.Email;
            existingUser.Username = "elgrandeahc";
            // Only update password if it's not already hashed (check if it starts with $2a$ or $2b$ which are BCrypt prefixes)
            if (!existingUser.Password.StartsWith("$2a$") && !existingUser.Password.StartsWith("$2b$"))
            {
                existingUser.Password = _passwordHasher.HashPassword("abc123");
            }
            existingUser.RoleId = systemAdminRoleId;
            existingUser.IsActive = true;
            await _context.SaveChangesAsync();
        }
    }
}

