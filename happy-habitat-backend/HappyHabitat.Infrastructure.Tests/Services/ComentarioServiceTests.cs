using Xunit;
using Microsoft.EntityFrameworkCore;
using HappyHabitat.Infrastructure.Data;
using HappyHabitat.Infrastructure.Services;
using HappyHabitat.Application.DTOs;
using HappyHabitat.Domain.Entities;

namespace HappyHabitat.Infrastructure.Tests.Services;

public class ComentarioServiceTests
{
    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetByOrigenAsync_ReturnsMatchingComentarios()
    {
        await using var context = CreateContext();
        var resident = new Resident { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), FullName = "Resident", Address = "", CreatedAt = DateTime.UtcNow };
        context.Residents.Add(resident);
        var comentario = new Comentario
        {
            ResidentId = resident.Id,
            Origen = "Ticket",
            IdOrigen = "1",
            ComentarioTexto = "A comment",
            CreatedAt = DateTime.UtcNow
        };
        context.Comentarios.Add(comentario);
        await context.SaveChangesAsync();

        var service = new ComentarioService(context);
        var result = (await service.GetByOrigenAsync("Ticket", "1")).ToList();

        Assert.Single(result);
        Assert.Equal("A comment", result[0].ComentarioTexto);
    }

    [Fact]
    public async Task GetByIdAsync_WhenExists_ReturnsDto()
    {
        await using var context = CreateContext();
        var resident = new Resident { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), FullName = "Resident", Address = "", CreatedAt = DateTime.UtcNow };
        context.Residents.Add(resident);
        var comentario = new Comentario
        {
            ResidentId = resident.Id,
            Origen = "Ticket",
            IdOrigen = "1",
            ComentarioTexto = "Text",
            CreatedAt = DateTime.UtcNow
        };
        context.Comentarios.Add(comentario);
        await context.SaveChangesAsync();

        var service = new ComentarioService(context);
        var result = await service.GetByIdAsync(comentario.Id);

        Assert.NotNull(result);
        Assert.Equal("Text", result.ComentarioTexto);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ReturnsCreatedComentario()
    {
        await using var context = CreateContext();
        var resident = new Resident { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), FullName = "Resident", Address = "", CreatedAt = DateTime.UtcNow };
        context.Residents.Add(resident);
        await context.SaveChangesAsync();

        var service = new ComentarioService(context);
        var dto = new CreateComentarioDto { Origen = "Ticket", IdOrigen = "1", ComentarioTexto = "New comment" };
        var result = await service.CreateAsync(resident.Id, dto);

        Assert.NotNull(result);
        Assert.True(result.Id > 0);
        Assert.Equal("New comment", result.ComentarioTexto);
    }

    [Fact]
    public async Task CreateAsync_WhenResidentNotFound_ThrowsInvalidOperationException()
    {
        await using var context = CreateContext();
        var service = new ComentarioService(context);
        var dto = new CreateComentarioDto { Origen = "Ticket", IdOrigen = "1", ComentarioTexto = "New" };
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateAsync(Guid.NewGuid(), dto));
    }

    [Fact]
    public async Task UpdateAsync_WhenExists_ReturnsUpdatedDto()
    {
        await using var context = CreateContext();
        var resident = new Resident { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), FullName = "Resident", Address = "", CreatedAt = DateTime.UtcNow };
        context.Residents.Add(resident);
        var comentario = new Comentario
        {
            ResidentId = resident.Id,
            Origen = "Ticket",
            IdOrigen = "1",
            ComentarioTexto = "Original",
            CreatedAt = DateTime.UtcNow
        };
        context.Comentarios.Add(comentario);
        await context.SaveChangesAsync();

        var service = new ComentarioService(context);
        var result = await service.UpdateAsync(comentario.Id, new UpdateComentarioDto { ComentarioTexto = "Updated" });

        Assert.NotNull(result);
        Assert.Equal("Updated", result.ComentarioTexto);
    }

    [Fact]
    public async Task UpdateAsync_WhenNotExists_ReturnsNull()
    {
        await using var context = CreateContext();
        var service = new ComentarioService(context);
        var result = await service.UpdateAsync(99999, new UpdateComentarioDto { ComentarioTexto = "Updated" });
        Assert.Null(result);
    }
}
