using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using HappyHabitat.Infrastructure.Data;
using HappyHabitat.Infrastructure.Services;
using HappyHabitat.Application.Interfaces;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace HappyHabitat.Infrastructure.Tests.Services;

public class AuthServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly Mock<IPasswordHasherService> _passwordHasherMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _jwtServiceMock = new Mock<IJwtService>();
        _passwordHasherMock = new Mock<IPasswordHasherService>();

        _authService = new AuthService(_context, _jwtServiceMock.Object, _passwordHasherMock.Object);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsLoginResponse()
    {
        // Arrange
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Code = "RESIDENT",
            Description = "Resident"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = "testuser",
            Password = "hashedpassword",
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            RoleId = role.Id,
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Roles.Add(role);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = "password123"
        };

        _passwordHasherMock.Setup(x => x.VerifyPassword("hashedpassword", "password123"))
            .Returns(true);
        _jwtServiceMock.Setup(x => x.GenerateToken(It.IsAny<User>(), It.IsAny<Role>()))
            .Returns("test-token");

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("test-token", result.Token);
        Assert.Equal("testuser", result.Username);
        Assert.Equal("RESIDENT", result.Role);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidUsername_ReturnsNull()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Username = "nonexistent",
            Password = "password123"
        };

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ReturnsNull()
    {
        // Arrange
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Code = "RESIDENT",
            Description = "Resident"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = "testuser",
            Password = "hashedpassword",
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            RoleId = role.Id,
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Roles.Add(role);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = "wrongpassword"
        };

        _passwordHasherMock.Setup(x => x.VerifyPassword("hashedpassword", "wrongpassword"))
            .Returns(false);

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_WithInactiveUser_ThrowsException()
    {
        // Arrange
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Code = "RESIDENT",
            Description = "Resident"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = "inactiveuser",
            Password = "hashedpassword",
            Email = "inactive@example.com",
            FirstName = "Inactive",
            LastName = "User",
            RoleId = role.Id,
            Role = role,
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Roles.Add(role);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var loginDto = new LoginDto
        {
            Username = "inactiveuser",
            Password = "password123"
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _authService.LoginAsync(loginDto)
        );
    }
}
